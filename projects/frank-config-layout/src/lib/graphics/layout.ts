/* eslint-disable unicorn/filename-case */

/*
   Copyright 2025 WeAreFrank!

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

	   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { Line, LineRelation, Point, relateLines } from './graphics';
import { Interval } from '../util/interval';
import {
  NodeForLayers,
  OriginalEdgeWithIntermediateEdges,
  OriginalGraphReferencingIntermediates,
  PASS_DIRECTION_DOWN,
  PASS_DIRECTION_UP,
} from '../model/horizontal-grouping';
import {
  LayoutConnection,
  LayoutConnector,
  LayoutModel,
  LayoutPosition,
  layoutPositionKey,
} from '../model/layout-model';
import { HorizontalConflictResolver } from './horizontal-conflict';
import { getRange } from '../util/util';
import { getConnectedIdsOfKey, getKey } from '../model/graph';
import { Box, DerivedEdgeLabelDimensions, EdgeLabelLayouter } from './edge-label-layouter';

export interface NodeAndEdgeDimensions {
  nodeWidth: number;
  intermediateWidth: number;
  layerHeight: number;
  layerDistance: number;
  nodeBoxWidth: number;
  nodeBoxHeight: number;
  boxConnectorAreaPerc: number;
  intermediateLayerPassedByVerticalLine: boolean;
}

interface LineSegmentBase {
  readonly key: string;
  readonly line: Line;
  readonly minLayerNumber: number;
  readonly maxLayerNumber: number;
}

export interface LayoutLineSegment extends LineSegmentBase {
  readonly key: string;
  readonly line: Line;
  readonly errorStatus: number;
  readonly isLastLineSegment: boolean;
}

export interface PlacedNode extends NodeForLayers {
  readonly horizontalBox: Interval;
  readonly verticalBox: Interval;
  readonly id: string;
  readonly text: string;
  readonly errorStatus: number;
  readonly layer: number;
}

export interface EdgeLabel {
  horizontalBox: Interval;
  verticalBox: Interval;
  text: string;
}

export interface Layout {
  readonly width: number;
  readonly height: number;
  readonly nodes: PlacedNode[];
  readonly layoutLineSegments: LayoutLineSegment[];
  readonly edgeLabels: EdgeLabel[];
}

export class LayoutBuilder {
  private nodeXById = new Map<string, number>();
  private layerY: number[] = [];
  private connectorX = new Map<string, number>();
  private connectorY = new Map<string, number>();
  private layoutLineSegmentsByOriginalEdge = new Map<string, LayoutLineSegment[]>();
  private originalEdgesByConnector = new Map<string, string>();

  constructor(
    private model: LayoutModel,
    private og: OriginalGraphReferencingIntermediates,
    private d: NodeAndEdgeDimensions,
    private derivedEdgeLabelDimensions: DerivedEdgeLabelDimensions,
  ) {}

  run(): Layout {
    const width: number = this.calculateNodeX();
    const height = this.model.numLayers * this.d.layerDistance;
    this.calculateLayerY();
    this.calculateConnectorX();
    this.calculateConnectorY();
    this.calculateLayoutLineSegments();
    const edgeLabels: EdgeLabel[] = this.calculateEdgeLabels();
    return {
      width,
      height,
      nodes: this.getPlacedNodes(),
      layoutLineSegments: this.flattenLayoutLineSegments(),
      edgeLabels,
    };
  }

  private calculateNodeX(): number {
    const widestLayerNumber = this.calculateInitialNodeX();
    for (let layer = widestLayerNumber - 1; layer >= 0; --layer) {
      this.initializeXFrom(layer, layer + 1);
    }
    for (let layer = widestLayerNumber + 1; layer < this.model.numLayers; ++layer) {
      this.initializeXFrom(layer, layer - 1);
    }
    const allXIntervals: Interval[] = this.model.allPositions.map((po) =>
      Interval.createFromCenterSize(this.nodeXById.get(po.id)!, this.widthOfNode(po.id)),
    );
    const minX: number = Math.min(...allXIntervals.map((intv) => intv.minValue));
    const maxX: number = Math.max(...allXIntervals.map((intv) => intv.maxValue));
    for (const key of this.nodeXById.keys()) {
      this.nodeXById.set(key, this.nodeXById.get(key)! - minX);
    }
    return maxX - minX + 1;
  }

  private calculateInitialNodeX(): number {
    const layerWidths: number[] = [];
    for (let layerNumber = 0; layerNumber < this.model.numLayers; ++layerNumber) {
      let cursor = 0;
      for (const positionObject of this.model.getPositionsOfLayer(layerNumber)) {
        const width = this.widthOfNode(positionObject.id);
        this.nodeXById.set(positionObject.id, Interval.createFromMinSize(cursor, width).center);
        cursor += width;
      }
      layerWidths.push(cursor);
    }
    const maxWidth = Math.max(...layerWidths);
    return layerWidths.indexOf(maxWidth);
  }

  private widthOfNode(id: string): number {
    return this.og.hasNode(id) ? this.d.nodeWidth : this.d.intermediateWidth;
  }

  private initializeXFrom(subjectLayer: number, sourceLayer: number): void {
    const xCoords = new HorizontalConflictResolver(
      this.model.getPositionsOfLayer(subjectLayer).length,
      (subjectPosition) => this.positionWidth(subjectLayer, subjectPosition),
      (subjectPosition) => this.predecessorX(subjectLayer, subjectPosition, sourceLayer),
    ).run();
    for (const [i, x] of xCoords.entries()) {
      const idAtPosition = this.model.getPosition(layoutPositionKey(subjectLayer, i)).id;
      this.nodeXById.set(idAtPosition, x);
    }
  }

  private positionWidth(subjectLayer: number, subjectPosition: number): number {
    const id = this.model.getPositionsOfLayer(subjectLayer)[subjectPosition].id;
    return this.widthOfNode(id);
  }

  private predecessorX(subjectLayer: number, subjectPosition: number, sourceLayer: number): number[] {
    const key = layoutPositionKey(subjectLayer, subjectPosition);
    const predecessorIds = this.model.getRelatedPositions(this.model.getPosition(key), sourceLayer).map((po) => po.id);
    return predecessorIds.map((predId) => this.nodeXById.get(predId)!);
  }

  private calculateLayerY(): void {
    this.layerY = getRange(0, this.model.numLayers)
      .map((layer) => this.d.layerDistance * layer)
      .map((top) => Interval.createFromMinSize(top, this.d.layerHeight).center);
  }

  private calculateConnectorX(): void {
    this.forEachPositionAndAdjacentLayerCombi((po, adjacentLayer) => {
      const connectors: LayoutConnector[] = this.model.getConnectorsOfPosition(po, adjacentLayer);
      const toDivide = Interval.createFromCenterSize(this.nodeXById.get(po.id)!, this.widthOfNodeBox(po.id));
      const xCoords: number[] = this.getXCoords(toDivide, connectors.length, this.d.boxConnectorAreaPerc);
      for (const [seq, x] of xCoords.entries()) {
        this.connectorX.set(connectors[seq].key, x);
      }
    });
  }

  private getXCoords(toDivide: Interval, count: number, boxConnectorAreaPerc: number): number[] {
    const availableSize = Math.max(Math.round((toDivide.size * boxConnectorAreaPerc) / 100), 1);
    const available = Interval.createFromCenterSize(toDivide.center, availableSize);
    if (count === 1) {
      return [available.center];
    }
    return getRange(0, count).map((i) => Math.round(available.minValue + (i * (availableSize - 1)) / (count - 1)));
  }

  private forEachPositionAndAdjacentLayerCombi(action: (po: LayoutPosition, aj: number) => void): void {
    for (const po of this.model.allPositions) {
      for (const aj of this.model.adjacentLayers(po.layer)) {
        action(po, aj);
      }
    }
  }

  private widthOfNodeBox(id: string): number {
    return this.og.hasNode(id) ? this.d.nodeBoxWidth : 1;
  }

  private calculateConnectorY(): void {
    this.forEachPositionAndAdjacentLayerCombi((po, adjacentLayer) => {
      const y = this.layerY[po.layer];
      const verticalBox = Interval.createFromCenterSize(y, this.heightOfNodeBox(po.id));
      const connectors: LayoutConnector[] = this.model.getConnectorsOfPosition(po, adjacentLayer);
      if (adjacentLayer > po.layer) {
        for (const connector of connectors) {
          this.connectorY.set(connector.key, verticalBox.maxValue);
        }
      } else {
        for (const connector of connectors) {
          this.connectorY.set(connector.key, verticalBox.minValue);
        }
      }
    });
  }

  private heightOfNodeBox(id: string): number {
    if (this.og.hasNode(id)) {
      return this.d.nodeBoxHeight;
    }
    if (this.d.intermediateLayerPassedByVerticalLine) {
      return this.d.nodeBoxHeight;
    }
    return 1;
  }

  private getPlacedNodes(): PlacedNode[] {
    return this.model.allPositions
      .filter((po) => this.og.hasNode(po.id))
      .map((po) => {
        const originalNode = this.og.getNodeById(po.id);
        return {
          horizontalBox: Interval.createFromCenterSize(this.nodeXById.get(po.id)!, this.widthOfNodeBox(po.id)),
          verticalBox: Interval.createFromCenterSize(this.layerY[po.layer], this.heightOfNodeBox(po.id)),
          id: po.id,
          text: originalNode.text,
          errorStatus: originalNode.errorStatus,
          layer: po.layer,
          isIntermediate: false,
        };
      });
  }

  private calculateLayoutLineSegments(): void {
    for (const originalEdge of this.og.edges) {
      const startConnector = this.model.getConnection(originalEdge.intermediateEdgeKeys[0]).from;
      this.originalEdgesByConnector.set(startConnector.key, getKey(originalEdge));
      const lineSegments: LayoutLineSegment[] = this.getLayoutLineSegmentsFor(originalEdge);
      this.layoutLineSegmentsByOriginalEdge.set(getKey(originalEdge), lineSegments);
    }
  }

  private getLayoutLineSegmentsFor(originalEdge: OriginalEdgeWithIntermediateEdges): LayoutLineSegment[] {
    const result: LineSegmentBase[] = [];
    const direction: number = this.getDirectionOfOriginalEdge(originalEdge);
    const shownIntermediateEdgeKeys = originalEdge.intermediateEdgeKeys.filter((iek) => {
      return getConnectedIdsOfKey(iek).every((nodeId) => this.model.hasId(nodeId));
    });
    for (const intermediateEdgeKey of shownIntermediateEdgeKeys) {
      const fromIsIntermediate = getConnectedIdsOfKey(intermediateEdgeKey)[0] !== originalEdge.from.id;
      if (this.d.intermediateLayerPassedByVerticalLine && fromIsIntermediate) {
        const intermediateNodeId = getConnectedIdsOfKey(intermediateEdgeKey)[0];
        const intermediateNode = this.model.getPositionOfId(intermediateNodeId)!;
        result.push({
          key: `pass-${intermediateNodeId}`,
          line: this.getLineSegmentIntermediateNode(intermediateNode, direction),
          minLayerNumber: intermediateNode.layer,
          maxLayerNumber: intermediateNode.layer,
        });
      }
      const connection: LayoutConnection = this.model.getConnection(intermediateEdgeKey);
      const layerNumbers = [connection.from.referencePosition.layer, connection.to.referencePosition.layer];
      result.push({
        key: intermediateEdgeKey,
        line: this.getLineForConnection(connection),
        minLayerNumber: Math.min(...layerNumbers),
        maxLayerNumber: Math.max(...layerNumbers),
      });
    }
    return result.map((lsb) => {
      return {
        ...lsb,
        errorStatus: originalEdge.errorStatus,
        isLastLineSegment: lsb.key === originalEdge.intermediateEdgeKeys.at(-1),
      };
    });
  }

  private getDirectionOfOriginalEdge(originalEdge: OriginalEdgeWithIntermediateEdges): number {
    const layerFrom = this.model.getPositionOfId(originalEdge.from.id)!.layer;
    const layerTo = this.model.getPositionOfId(originalEdge.to.id)!.layer;
    return layerFrom < layerTo ? PASS_DIRECTION_DOWN : PASS_DIRECTION_UP;
  }

  private getLineSegmentIntermediateNode(intermediateNode: LayoutPosition, direction: number): Line {
    const x = this.nodeXById.get(intermediateNode.id)!;
    const verticalBox = Interval.createFromCenterSize(
      this.layerY[intermediateNode.layer],
      this.heightOfNodeBox(intermediateNode.id),
    );
    return direction === PASS_DIRECTION_DOWN
      ? new Line(new Point(x, verticalBox.minValue), new Point(x, verticalBox.maxValue))
      : new Line(new Point(x, verticalBox.maxValue), new Point(x, verticalBox.minValue));
  }

  private getLineForConnection(connection: LayoutConnection): Line {
    const fromX: number = this.connectorX.get(connection.from.key)!;
    const fromY: number = this.connectorY.get(connection.from.key)!;
    const toX: number = this.connectorX.get(connection.to.key)!;
    const toY: number = this.connectorY.get(connection.to.key)!;
    return new Line(new Point(fromX, fromY), new Point(toX, toY));
  }

  private flattenLayoutLineSegments(): LayoutLineSegment[] {
    return this.og.edges.flatMap((edge) => this.layoutLineSegmentsByOriginalEdge.get(getKey(edge))!);
  }

  private calculateEdgeLabels(): EdgeLabel[] {
    const result: EdgeLabel[] = [];
    this.forEachPositionAndAdjacentLayerCombi((po, aj) => {
      const connectors = this.model
        .getConnectorsOfPosition(po, aj)
        .filter((conn) => this.originalEdgesByConnector.has(conn.key));
      const layouter = new EdgeLabelLayouter(this.derivedEdgeLabelDimensions);
      for (const connector of connectors) {
        const optionalEdgeLabel: EdgeLabel | undefined = this.getOptionalEdgeLabel(connector, layouter);
        if (optionalEdgeLabel !== undefined) {
          result.push(optionalEdgeLabel);
        }
      }
    });
    return result;
  }

  private getOptionalEdgeLabel(connector: LayoutConnector, layouter: EdgeLabelLayouter): EdgeLabel | undefined {
    const originalEdgeKey = this.originalEdgesByConnector.get(connector.key)!;
    const originalEdge: OriginalEdgeWithIntermediateEdges = this.og.getEdgeByKey(originalEdgeKey);
    if (originalEdge.text.numLines > 0) {
      const line = this.layoutLineSegmentsByOriginalEdge.get(originalEdgeKey)![0];
      const box: Box = layouter.add(line.line, originalEdge.text.maxLineLength, originalEdge.text.lines.length);
      return {
        horizontalBox: box.horizontalBox,
        verticalBox: box.verticalBox,
        text: originalEdge.text.html,
      };
    } else {
      return undefined;
    }
  }
}

export function getNumCrossingLines(lineSegments: LayoutLineSegment[]): number {
  let result = 0;
  for (const indexFirst in lineSegments) {
    for (const indexSecond in lineSegments) {
      if (indexSecond > indexFirst) {
        const layerSpanFirst = Interval.createFromMinMax(
          lineSegments[indexFirst].minLayerNumber,
          lineSegments[indexFirst].maxLayerNumber,
        );
        const layerSpanSecond = Interval.createFromMinMax(
          lineSegments[indexSecond].minLayerNumber,
          lineSegments[indexSecond].maxLayerNumber,
        );
        const intersection: Interval | null = layerSpanFirst.toIntersected(layerSpanSecond);
        const layersCoincide = intersection !== null && intersection.size >= 2;
        if (layersCoincide && edgesCross(lineSegments[indexFirst], lineSegments[indexSecond])) {
          ++result;
        }
      }
    }
  }
  return result;
}

function edgesCross(first: LayoutLineSegment, second: LayoutLineSegment): boolean {
  let linesTouch = false;
  const firstPoints: Point[] = [first.line.startPoint, first.line.endPoint];
  const secondPoints: Point[] = [second.line.startPoint, second.line.endPoint];
  for (const p1 of firstPoints) {
    for (const p2 of secondPoints) {
      if (p1.equals(p2)) {
        linesTouch = true;
      }
    }
  }
  return !linesTouch && relateLines(first.line, second.line) === LineRelation.CROSS;
}

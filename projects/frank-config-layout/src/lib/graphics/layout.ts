import { Line, Point } from './graphics';
import { Interval } from '../util/interval';
import {
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
import { getXCoords } from './edge-connection-points';
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
}

export interface LayoutLineSegment extends LineSegmentBase {
  readonly key: string;
  readonly line: Line;
  readonly errorStatus: number;
  readonly isLastLineSegment: boolean;
}

export interface PlacedNode {
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
  private nodeX = new Map<string, number>();
  private layerY: number[] = [];
  private connectorX = new Map<string, number>();
  private connectorY = new Map<string, number>();
  private layoutLineSegmentsByOriginalEdge = new Map<string, LayoutLineSegment[]>();

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
    const originalEdgesByConnector: Map<string, string> = this.calculateLayoutLineSegments();
    const edgeLabels: EdgeLabel[] = this.calculateEdgeLabels(originalEdgesByConnector);
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
      Interval.createFromCenterSize(this.nodeX.get(po.key)!, this.widthOf(po.id)),
    );
    const minX: number = Math.min(...allXIntervals.map((intv) => intv.minValue));
    const maxX: number = Math.max(...allXIntervals.map((intv) => intv.maxValue));
    for (const key of this.nodeX.keys()) {
      this.nodeX.set(key, this.nodeX.get(key)! - minX);
    }
    return maxX - minX + 1;
  }

  private calculateInitialNodeX(): number {
    const layerWidths: number[] = [];
    for (let layerNumber = 0; layerNumber < this.model.numLayers; ++layerNumber) {
      let cursor = 0;
      for (const positionObject of this.model.getPositionsOfLayer(layerNumber)) {
        const width = this.widthOf(positionObject.id);
        this.nodeX.set(positionObject.id, Interval.createFromMinSize(cursor, width).center);
        cursor += width;
      }
      layerWidths.push(cursor);
    }
    const maxWidth = Math.max(...layerWidths);
    return layerWidths.indexOf(maxWidth);
  }

  private widthOf(id: string): number {
    return this.og.hasNode(id) ? this.d.nodeWidth : this.d.intermediateWidth;
  }

  private initializeXFrom(subjectLayer: number, sourceLayer: number): void {
    const xCoords = new HorizontalConflictResolver(
      this.model.getPositionsOfLayer(subjectLayer).length,
      (subjectPosition) => this.positionWidth(subjectLayer, subjectPosition),
      (subjectPosition) => this.predecessorX(subjectLayer, subjectPosition, sourceLayer),
    ).run();
    for (const [i, x] of xCoords.entries()) {
      this.nodeX.set(layoutPositionKey(subjectLayer, i), x);
    }
  }

  private positionWidth(subjectLayer: number, subjectPosition: number): number {
    const id = this.model.getPositionsOfLayer(subjectLayer)[subjectPosition].id;
    return this.widthOf(id);
  }

  private predecessorX(subjectLayer: number, subjectPosition: number, sourceLayer: number): number[] {
    const key = layoutPositionKey(subjectLayer, subjectPosition);
    const predecessorKeys = this.model
      .getRelatedPositions(this.model.getPosition(key), sourceLayer)
      .map((po) => po.key);
    return predecessorKeys.map((predKey) => this.nodeX.get(predKey)!);
  }

  private calculateLayerY(): void {
    this.layerY = getRange(0, this.model.numLayers)
      .map((layer) => this.d.layerDistance * layer)
      .map((top) => Interval.createFromMinSize(top, this.d.layerHeight).center);
  }

  private calculateConnectorX(): void {
    for (const po of this.model.allPositions) {
      for (const adjacentLayer of this.model.adjacentLayers(po.layer)) {
        const connectors: LayoutConnector[] = this.model.getConnectorsOfPosition(po, adjacentLayer);
        const toDivide = Interval.createFromCenterSize(this.nodeX.get(po.key)!, this.widthOf(po.id));
        const xCoords: number[] = getXCoords(toDivide, connectors.length, this.d.boxConnectorAreaPerc);
        for (const [seq, x] of xCoords.entries()) {
          this.connectorX.set(connectors[seq].key, x);
        }
      }
    }
  }

  private calculateConnectorY(): void {
    for (const po of this.model.allPositions) {
      const y = this.layerY[po.layer];
      const verticalBox = Interval.createFromCenterSize(y, this.heightOf(po.id));
      for (const adjacentLayer of this.model.adjacentLayers(po.layer)) {
        const connectors: LayoutConnector[] = this.model.getConnectorsOfPosition(po, adjacentLayer);
        if (adjacentLayer > po.layer) {
          for (const connector of connectors) {
            this.connectorY.set(connector.key, verticalBox.minValue);
          }
        } else {
          for (const connector of connectors) {
            this.connectorY.set(connector.key, verticalBox.maxValue);
          }
        }
      }
    }
  }

  private getPlacedNodes(): PlacedNode[] {
    return this.model.allPositions
      .filter((po) => this.og.hasNode(po.id))
      .map((po) => {
        const originalNode = this.og.getNodeById(po.id);
        return {
          horizontalBox: Interval.createFromCenterSize(this.nodeX.get(po.key)!, this.widthOf(po.id)),
          verticalBox: Interval.createFromCenterSize(this.layerY[po.layer], this.heightOf(po.id)),
          id: po.id,
          text: originalNode.text,
          errorStatus: originalNode.errorStatus,
          layer: po.layer,
        };
      });
  }

  private calculateLayoutLineSegments(): Map<string, string> {
    const originalEdgesByConnector = new Map<string, string>();
    for (const originalEdge of this.og.edges) {
      const startConnector = this.model.getConnection(originalEdge.intermediateEdgeKeys[0]).from;
      originalEdgesByConnector.set(startConnector.key, getKey(originalEdge));
      const lineSegments: LayoutLineSegment[] = this.getLayoutLineSegmentsFor(originalEdge);
      this.layoutLineSegmentsByOriginalEdge.set(getKey(originalEdge), lineSegments);
    }
    return originalEdgesByConnector;
  }

  private getLayoutLineSegmentsFor(originalEdge: OriginalEdgeWithIntermediateEdges): LayoutLineSegment[] {
    const result: LineSegmentBase[] = [];
    const direction: number = this.getDirectionOfOriginalEdge(originalEdge);
    let isFirst = true;
    for (const intermediateEdgeKey of originalEdge.intermediateEdgeKeys) {
      if (this.d.intermediateLayerPassedByVerticalLine && !isFirst) {
        const intermediateNodeId = getConnectedIdsOfKey(intermediateEdgeKey)[0];
        const intermediateNode = this.model.getPositionOfId(intermediateNodeId)!;
        result.push({
          key: `pass-${intermediateNodeId}`,
          line: this.getLineSegmentIntermediateNode(intermediateNode, direction),
        });
      }
      isFirst = false;
      const connection: LayoutConnection = this.model.getConnection(intermediateEdgeKey);
      const fromX: number = this.nodeX.get(connection.from.referencePosition.id)!;
      const fromY: number = this.layerY[connection.from.referencePosition.layer];
      const toX: number = this.nodeX.get(connection.to.referencePosition.id)!;
      const toY: number = this.layerY[connection.to.referencePosition.layer];
      result.push({ key: intermediateEdgeKey, line: new Line(new Point(fromX, fromY), new Point(toX, toY)) });
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
    const x = this.nodeX.get(intermediateNode.id)!;
    const verticalBox = Interval.createFromCenterSize(
      this.layerY[intermediateNode.layer],
      this.heightOf(intermediateNode.id),
    );
    return direction === PASS_DIRECTION_DOWN
      ? new Line(new Point(x, verticalBox.minValue), new Point(x, verticalBox.maxValue))
      : new Line(new Point(x, verticalBox.maxValue), new Point(x, verticalBox.minValue));
  }

  private heightOf(id: string): number {
    if (this.og.hasNode(id)) {
      return this.d.nodeBoxHeight;
    }
    if (this.d.intermediateLayerPassedByVerticalLine) {
      return this.d.layerHeight;
    }
    return 1;
  }

  private flattenLayoutLineSegments(): LayoutLineSegment[] {
    return this.og.edges.flatMap((edge) => this.layoutLineSegmentsByOriginalEdge.get(getKey(edge))!);
  }

  private calculateEdgeLabels(originalEdgesByConnector: Map<string, string>): EdgeLabel[] {
    const result: EdgeLabel[] = [];
    for (const po of this.model.allPositions) {
      for (const aj of this.model.adjacentLayers(po.layer)) {
        const connectors = this.model
          .getConnectorsOfPosition(po, aj)
          .filter((conn) => originalEdgesByConnector.has(conn.key));
        const layouter = new EdgeLabelLayouter(this.derivedEdgeLabelDimensions);
        for (const connector of connectors) {
          const originalEdgeKey = originalEdgesByConnector.get(connector.key)!;
          const originalEdge: OriginalEdgeWithIntermediateEdges = this.og.getEdgeByKey(originalEdgeKey);
          const line = this.layoutLineSegmentsByOriginalEdge.get(originalEdgeKey)![0];
          const box: Box = layouter.add(line.line, originalEdge.text.maxLineLength, originalEdge.text.lines.length);
          result.push({
            horizontalBox: box.horizontalBox,
            verticalBox: box.verticalBox,
            text: originalEdge.text.html,
          });
        }
      }
    }
    return result;
  }
}

/*
   Copyright 2024-2025 WeAreFrank!

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

import { getKey } from '../model/generic-graph'
import { NodeImpl, EdgeImpl, GraphForLayers, PASS_DIRECTION_DOWN } from '../model/horizontalGrouping'
import { Interval } from "../util/interval";
import { Edge2LineCalculation } from "./edge-connection-points";
import { Line, LineRelation, Point, relateLines } from "./graphics";
import { NodeLayout, NodeSpacingDimensions, Position } from "./node-layout";
import { DerivedEdgeLabelDimensions, EdgeLabelLayouter, Box } from "./edge-label-layouter";
import { createText } from '../model/text'
import { Text } from '../public.api'

export interface NodeAndEdgeDimensions extends NodeSpacingDimensions {
  nodeBoxWidth: number
  nodeBoxHeight: number
  boxConnectorAreaPerc: number
  intermediateLayerPassedByVerticalLine: boolean
}

// TODO: Bring to public api.
export class PlacedNode implements NodeImpl {
  readonly horizontalBox: Interval
  readonly verticalBox: Interval
  readonly passDirection?: number
  readonly id: string
  readonly text: string
  readonly isError: boolean
  readonly layer: number
  readonly isIntermediate: boolean

  constructor(p: Position, d: NodeAndEdgeDimensions) {
    const bd: BoxDimensions = getBoxDimensions(p, d)
    this.horizontalBox = bd.horizontalBox
    this.verticalBox = bd.verticalBox
    this.passDirection = p.node.passDirection
    this.id = p.node.id
    this.text = p.node.text
    this.isError = p.node.isError
    this.layer = p.node.layer
    this.isIntermediate = p.node.isIntermediate
  }

  get centerTop(): Point {
    return new Point(this.horizontalBox.center, this.verticalBox.minValue)
  }

  get centerBottom(): Point {
    return new Point(this.horizontalBox.center, this.verticalBox.maxValue)
  }

  get left(): number {
    return this.horizontalBox.minValue
  }

  get top(): number {
    return this.verticalBox.minValue
  }

  get width(): number {
    return this.horizontalBox.size
  }

  get height(): number {
    return this.verticalBox.size
  }

  get centerX(): number {
    return this.horizontalBox.center
  }

  get centerY(): number {
    return this.verticalBox.center
  }
}

function getBoxDimensions(p: Position, d: NodeAndEdgeDimensions): BoxDimensions {
  let horizontalBox: Interval
  let verticalBox: Interval
  if (p.node.isIntermediate) {
    horizontalBox = Interval.createFromCenterSize(p.x!, 1)
    if (d.intermediateLayerPassedByVerticalLine) {
      verticalBox = Interval.createFromCenterSize(p.y!, d.nodeBoxHeight)
    } else {
      verticalBox = Interval.createFromCenterSize(p.y!, 1)
    }
  } else {
    horizontalBox = Interval.createFromCenterSize(p.x!, d.nodeBoxWidth)
    verticalBox = Interval.createFromCenterSize(p.y!, d.nodeBoxHeight)  
  }
  return { horizontalBox, verticalBox }
}

interface BoxDimensions {
  readonly horizontalBox: Interval,
  readonly verticalBox: Interval
}

export function createLayoutLineSegmentFromEdge(fromNode: PlacedNode, toNode: PlacedNode, edge: EdgeImpl, line: Line): LayoutLineSegment {
  let minLayer = 0
  let maxLayer = 0
  if (fromNode.layer < toNode.layer) {
    minLayer = fromNode.layer
    maxLayer = toNode.layer
  } else {
    minLayer = toNode.layer
    maxLayer = fromNode.layer
  }
  return {
    key: getKey(edge),
    originId: fromNode.id,
    line,
    text: edge.text,
    isError: edge.isError,
    isFirstLineSegment: edge.isFirstSegment,
    isLastLineSegment: edge.isLastSegment,
    minLayerNumber: minLayer,
    maxLayerNumber: maxLayer,
    passDirection: edge.passDirection
  }
}

export interface LayoutLineSegment {
  readonly key: string,
  readonly originId: string,
  readonly line: Line,
  readonly text: Text,
  readonly isError: boolean,
  readonly isFirstLineSegment: boolean,
  readonly isLastLineSegment: boolean,
  readonly minLayerNumber: number,
  readonly maxLayerNumber: number,
  readonly passDirection: number
}

export interface EdgeLabel {
  horizontalBox: Interval,
  verticalBox: Interval,
  text: string
}

export class Layout {
  readonly width: number
  readonly height: number
  private _nodes: PlacedNode[] = []
  private idToNode: Map<string, PlacedNode> = new Map<string, PlacedNode>()
  private layoutLineSegments: LayoutLineSegment[] = []
  readonly edgeLabels: EdgeLabel[]

  constructor(layout: NodeLayout, d: NodeAndEdgeDimensions, readonly derivedEdgeLabelDimensions: DerivedEdgeLabelDimensions) {
    this.width = layout.width
    this.height = layout.height
    const calc = new Edge2LineCalculation(layout, d)
    this._nodes = [ ... calc.getPlacedNodes() ]
    for (const n of this.nodes) {
      this.idToNode.set(n.id, n)
    }
    this.layoutLineSegments = calc.getOriginalEdges().map(e => createLayoutLineSegmentFromEdge(
      this.idToNode.get(e.from.id)!,
      this.idToNode.get(e.to.id)!,
      e,
      calc.edge2line(e))
    )
    if (d.intermediateLayerPassedByVerticalLine) {
      this.addVerticalLineSegmentsForIntermediateNodes(calc.getPlacedNodes())
    }
    this.edgeLabels = this.addEdgeLabels()
  }

  private addVerticalLineSegmentsForIntermediateNodes(nodes: PlacedNode[]) {
    for (const n of nodes) {
      if (! n.isIntermediate) {
        continue
      }
      let line: Line
      if (n.passDirection === PASS_DIRECTION_DOWN) {
        line = new Line(n.centerTop, n.centerBottom)
      } else {
        line = new Line(n.centerBottom, n.centerTop)
      }
      const verticalLineSegmentKey = "pass-" + n.id
      this.layoutLineSegments.push({
        key: verticalLineSegmentKey,
        originId: n.id,
        line,
        text: createText(undefined),
        isError: n.isError,
        isFirstLineSegment: false,
        isLastLineSegment: false,
        minLayerNumber: n.layer,
        maxLayerNumber: n.layer,
        passDirection: n.passDirection!
      })  
    }
  }

  get nodes(): readonly PlacedNode[] {
    return [ ... this._nodes ]
  }

  getNodeById(id: string): PlacedNode | undefined {
    return this.idToNode.get(id)
  }

  getLayoutLineSegments(): LayoutLineSegment[] {
    return [ ... this.layoutLineSegments ]
  }

  getNumCrossingLines(): number {
    const lineSegments: LayoutLineSegment[] = this.getLayoutLineSegments()
    let result = 0
    lineSegments.forEach((_, indexFirst) => {
      lineSegments.forEach((_, indexSecond) => {
        if (indexSecond > indexFirst) {
          const layerSpanFirst = Interval.createFromMinMax(lineSegments[indexFirst].minLayerNumber, lineSegments[indexFirst].maxLayerNumber)
          const layerSpanSecond = Interval.createFromMinMax(lineSegments[indexSecond].minLayerNumber, lineSegments[indexSecond].maxLayerNumber)
          const intersection: Interval | null = layerSpanFirst.toIntersected(layerSpanSecond)
          if ( (intersection !== null) && (intersection.size >= 2) ) {
            if (this.edgesCross(lineSegments[indexFirst], lineSegments[indexSecond])) {
              ++result
            }  
          }
        }
      })
    })
    return result
  }

  private edgesCross(first: LayoutLineSegment, second: LayoutLineSegment): boolean {
    let linesTouch = false
    const firstPoints: Point[] = [first.line.startPoint, first.line.endPoint]
    const secondPoints: Point[] = [second.line.startPoint, second.line.endPoint]
    firstPoints.forEach(p1 => {
      secondPoints.forEach(p2 => {
        if (p1.equals(p2)) {
          linesTouch = true
        }
      })
    })
    return (! linesTouch) && (relateLines(first.line, second.line) === LineRelation.CROSS)
  }

  private addEdgeLabels(): EdgeLabel[] {
    const firstLineSegments = this.layoutLineSegments
      .filter(s => s.isFirstLineSegment)
      .filter(s => s.text.numLines >= 1)
    const groups: LayoutLineSegment[][] = groupForEdgeLabelLayout(firstLineSegments)
    const result: EdgeLabel[] = []
    for (const group of groups) {
      const layouter = new EdgeLabelLayouter(this.derivedEdgeLabelDimensions)
      for (const ls of group) {
        const box: Box = layouter!.add(ls.line, ls.text.maxLineLength, ls.text.lines.length)
        result.push({
          horizontalBox: box.horizontalBox,
          verticalBox: box.verticalBox,
          // This ensures that the lines are trimmed
          text: ls.text.html
        })
      }
    }
    return result
  }
}

export function groupForEdgeLabelLayout(segments: LayoutLineSegment[]): LayoutLineSegment[][] {
  const segmentsByOriginAndDirection = new Map<string, Map<number, LayoutLineSegment[]>>()
  for (const segment of segments) {
    if (! segmentsByOriginAndDirection.has(segment.originId)) {
      segmentsByOriginAndDirection.set(segment.originId, new Map<number, LayoutLineSegment[]>())
    }
    if (! segmentsByOriginAndDirection.get(segment.originId)!.has(segment.passDirection)) {
      segmentsByOriginAndDirection.get(segment.originId)!.set(segment.passDirection, [])
    }
    segmentsByOriginAndDirection.get(segment.originId)!.get(segment.passDirection)!.push(segment)
  }
  const result: LayoutLineSegment[][] = []
  const sortedOriginIds = [ ... segmentsByOriginAndDirection.keys() ]
  sortedOriginIds.sort()
  for (const originId of sortedOriginIds) {
    const originGroup: Map<number, LayoutLineSegment[]> = segmentsByOriginAndDirection.get(originId)!
    const sortedDirections: number[] = [ ... originGroup.keys() ]
    sortedDirections.sort()
    for (const direction of sortedDirections) {
      const segmentGroup: LayoutLineSegment[] = [ ... originGroup.get(direction)! ]
      segmentGroup.sort(compareByX)
      result.push(segmentGroup)
    }
  }
  return result
}

function compareByX(first: LayoutLineSegment, second: LayoutLineSegment) {
  let result = first.line.startPoint.x - second.line.startPoint.x
  if (result !== 0) {
    return result
  }
  return first.line.endPoint.x - second.line.endPoint.x
}
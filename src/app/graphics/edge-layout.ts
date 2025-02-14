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

import { Edge, Node, OptionalNode, getEdgeKey } from "../model/graph";
import { CategorizedNode, CategorizedEdge } from '../model/error-flow'
import { CreationReason, EdgeForEditor, NodeForEditor, OriginalNode } from "../model/horizontalGrouping";
import { Interval } from "../util/interval";
import { Edge2LineCalculation } from "./edge-connection-points";
import { Line, LineRelation, Point, relateLines } from "./graphics";
import { NodeLayout, NodeSpacingDimensions, Position } from "./node-layout";
import { EdgeLabelDimensions, EdgeLabelLayouter } from "./edge-label-layouter";
import { templateTriggerHandling } from "@rx-angular/cdk/notifications";

export interface Dimensions extends NodeSpacingDimensions, EdgeLabelDimensions {
  nodeBoxWidth: number
  nodeBoxHeight: number
  boxConnectorAreaPerc: number
  intermediateLayerPassedByVerticalLine: boolean
}
  
export class PlacedNode implements Node {
  private id: string
  readonly creationReason: CreationReason
  readonly text: string
  readonly isError: boolean
  readonly layerNumber: number
  readonly horizontalBox: Interval
  readonly verticalBox: Interval

  constructor(p: Position, d: Dimensions) {
    this.id = p.node.getId()
    this.text = p.node.getText()
    this.creationReason = (p.node as NodeForEditor).getCreationReason()
    const optionalOriginalNode = PlacedNode.optionalOriginalNode(p.node)
    this.isError = optionalOriginalNode === null ? false : optionalOriginalNode.isError
    this.layerNumber = p.layerNumber
    if (this.creationReason === CreationReason.ORIGINAL) {
      this.horizontalBox = Interval.createFromCenterSize(p.x!, d.nodeBoxWidth)
      this.verticalBox = Interval.createFromCenterSize(p.y!, d.nodeBoxHeight)  
    } else {
      this.horizontalBox = Interval.createFromCenterSize(p.x!, 1)
      if (d.intermediateLayerPassedByVerticalLine) {
        this.verticalBox = Interval.createFromCenterSize(p.y!, d.nodeBoxHeight)
      } else {
        this.verticalBox = Interval.createFromCenterSize(p.y!, 1)
      }
    }
  }

  getId() {
    return this.id
  }

  getText() {
    return this.text
  }

  private static optionalOriginalNode(rawNode: OptionalNode): CategorizedNode | null {
    const node = rawNode as NodeForEditor
    if (node.getCreationReason() === CreationReason.INTERMEDIATE) {
      return null
    }
    const originalNode: Node = (node as OriginalNode).original
    return originalNode as CategorizedNode
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

export function createLayoutLineSegmentFromEdge(fromNode: PlacedNode, toNode: PlacedNode, rawEdge: Edge, line: Line): LayoutLineSegment {
  const key: string = getEdgeKey(fromNode, toNode)
  const edge = rawEdge as EdgeForEditor
  const isFirstSegment = isFirstLineSegment(edge, fromNode)
  const isLastSegment = isLastLineSegment(edge, toNode)
  const originalEdge = edge.original as CategorizedEdge
  const isError = originalEdge.isError
  const optionalOriginalText = originalEdge.text === undefined ? null : originalEdge.text
  let minLayer = 0
  let maxLayer = 0
  if (fromNode.layerNumber < toNode.layerNumber) {
    minLayer = fromNode.layerNumber
    maxLayer = toNode.layerNumber
  } else {
    minLayer = toNode.layerNumber
    maxLayer = fromNode.layerNumber
  }
  return {
    key,
    originId: fromNode.getId(),
    line,
    optionalOriginalText,
    isError,
    isFirstLineSegment: isFirstSegment,
    isLastLineSegment: isLastSegment,
    minLayerNumber: minLayer,
    maxLayerNumber: maxLayer
  }
}

function isLastLineSegment(edge: EdgeForEditor, toNode: PlacedNode): boolean {
  return edge.original.getTo().getId() === toNode.getId();
}

function isFirstLineSegment(edge: EdgeForEditor, fromNode: PlacedNode): boolean {
  return edge.original.getFrom().getId() === fromNode.getId()
}

export interface LayoutLineSegment {
  readonly key: string,
  readonly originId: string,
  readonly line: Line,
  readonly optionalOriginalText: string | null,
  readonly isError: boolean,
  readonly isFirstLineSegment: boolean,
  readonly isLastLineSegment: boolean,
  readonly minLayerNumber: number,
  readonly maxLayerNumber: number
}

// TODO: Unit test
export function compareOriginThenX(first: LayoutLineSegment, second: LayoutLineSegment) {
  if (first.originId < second.originId) {
    return -1
  } else if (first.originId > second.originId) {
    return 1
  } else {
    return first.line.startPoint.x - second.line.startPoint.x
  }
}

export interface EdgeLabel {
  centerX: number,
  centerY: number,
  text: string
}

export class Layout {
  readonly width: number
  readonly height: number
  private nodes: PlacedNode[] = []
  private idToNode: Map<string, PlacedNode> = new Map<string, PlacedNode>()
  private layoutLineSegments: LayoutLineSegment[] = []
  readonly edgeLabels: EdgeLabel[]

  constructor(layout: NodeLayout, d: Dimensions) {
    this.width = layout.width
    this.height = layout.height
    const calc = new Edge2LineCalculation(layout, d)
    this.nodes = [ ... calc.getPlacedNodes() ]
    for (const n of this.nodes) {
      this.idToNode.set(n.getId(), n)
    }
    this.layoutLineSegments = calc.getOriginalEdges().map(e => createLayoutLineSegmentFromEdge(
      this.idToNode.get(e.getFrom().getId())!,
      this.idToNode.get(e.getTo().getId())!,
      e,
      calc.edge2line(e))
    )
    if (d.intermediateLayerPassedByVerticalLine) {
      this.addVerticalLineSegmentsForIntermediateNodes(calc.getOriginalEdges())
    }
    this.edgeLabels = this.addEdgeLabels(d)
  }

  private addVerticalLineSegmentsForIntermediateNodes(originalEdges: Edge[]) {
    const doneIntermediates: Set<string> = new Set<string>()
    for (const rawOriginalEdge of originalEdges) {
      const edge = rawOriginalEdge as EdgeForEditor
      const from = edge.getFrom() as NodeForEditor
      const fromIsIntermediate = from.getCreationReason() === CreationReason.INTERMEDIATE
      const placedFrom: PlacedNode = this.idToNode.get(from.getId())!
      const to = edge.getTo() as NodeForEditor
      const toIsIntermediate = to.getCreationReason() === CreationReason.INTERMEDIATE
      const placedTo: PlacedNode = this.idToNode.get(to.getId())!
      const edgeGoesDown = placedFrom.centerY < placedTo.centerY
      if (fromIsIntermediate && ! doneIntermediates.has(from.getId())) {
        this.addVerticalLineSegment(placedFrom, edgeGoesDown, edge)
        doneIntermediates.add(from.getId())
      }
      if (toIsIntermediate && ! doneIntermediates.has(to.getId())) {
        this.addVerticalLineSegment(placedTo, edgeGoesDown, edge)
        doneIntermediates.add(to.getId())
      }
    }
  }

  private addVerticalLineSegment(n: PlacedNode, goesDown: boolean, edge: EdgeForEditor) {
    const originalEdge = edge.original as CategorizedEdge
    const isError = originalEdge.isError
    const optionalOriginalText = originalEdge.text === undefined ? null : originalEdge.text
    let line: Line
    if (goesDown) {
      line = new Line(n.centerTop, n.centerBottom)
    } else {
      line = new Line(n.centerBottom, n.centerTop)
    }
    const verticalLineSegmentKey = "pass-" + n.getId()
    this.layoutLineSegments.push({
      key: verticalLineSegmentKey,
      originId: n.getId(),
      line,
      optionalOriginalText,
      isError,
      isFirstLineSegment: false,
      isLastLineSegment: false,
      minLayerNumber: n.layerNumber,
      maxLayerNumber: n.layerNumber
    })
  }

  getNodes(): readonly Node[] {
    return [ ... this.nodes ]
  }

  getNodeById(id: string): Node | undefined {
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

  private addEdgeLabels(dimensions: EdgeLabelDimensions): EdgeLabel[] {
    console.log(`Layout.addEdgeLabels uses dimensions (${dimensions.preferredVertDistanceFromOrigin}, ${dimensions.estLabelWidth}, ${dimensions.estLabelHeight})`)
    const firstLineSegments = this.layoutLineSegments
      .filter(s => s.isFirstLineSegment)
      .filter(s => (s.optionalOriginalText !== null) && (s.optionalOriginalText.length >= 1))
    const upward = firstLineSegments.filter(s => s.line.startPoint.y > s.line.endPoint.y)
    const downward = firstLineSegments.filter(s => s.line.startPoint.y < s.line.endPoint.y)
    upward.sort(compareOriginThenX)
    downward.sort(compareOriginThenX)
    const result: EdgeLabel[] = []
    result.push(... this.addEdgeLabelsFor(dimensions, upward))
    result.push(... this.addEdgeLabelsFor(dimensions, downward))
    return result
  }

  private addEdgeLabelsFor(dimensions: EdgeLabelDimensions, lineSegments: LayoutLineSegment[]): EdgeLabel[] {
    console.log(`Calculating edge labels for: ${lineSegments.map(ls => ls.key)}`)
    const result: EdgeLabel[] = []
    let isFirst: boolean = true
    let currentOriginId: string | null = null
    let layouter: EdgeLabelLayouter | null = null
    for(const ls of lineSegments) {
      console.log(`Have currentOriginId=${currentOriginId}, isFirst=${isFirst}`)
      console.log(`Next line segment: ${ls.key}, ${ls.originId}, ${ls.line.startPoint.x}, ${ls.line.startPoint.y}, ${ls.line.endPoint.x}, ${ls.line.endPoint.y}`)
      if ( (isFirst === true) || (currentOriginId !== ls.originId)) {
        console.log('New layouter')
        layouter = new EdgeLabelLayouter(dimensions)
        isFirst = false
        currentOriginId = ls.originId
      }
      console.log(`Adding line segment to layouter: ${ls.optionalOriginalText}, ${ls.line.startPoint.x}, ${ls.line.startPoint.y}, ${ls.line.endPoint.x}, ${ls.line.endPoint.y}`)
      const point: Point = layouter!.add(ls.line)
      console.log(`Gives point (${point.x}, ${point.y})`)
      result.push({
        centerX: point.x,
        centerY: point.y,
        text: ls.optionalOriginalText!
      })
    }
    return result
  }
}
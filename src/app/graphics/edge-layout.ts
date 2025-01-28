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

import { ConcreteGraphBase, Edge, GraphBase, Node, NodeOrEdge, OptionalNode, getEdgeKey } from "../model/graph";
import { CategorizedNode, CategorizedEdge } from '../model/error-flow'

import { CreationReason, EdgeForEditor, NodeForEditor, OriginalNode } from "../model/horizontalGrouping";
import { Interval } from "../util/interval";
import { Edge2LineCalculation } from "./edge-connection-points";
import { Line, LineRelation, Point, relateLines } from "./graphics";
import { NodeLayout, NodeSpacingDimensions, Position } from "./node-layout";

export interface Dimensions extends NodeSpacingDimensions {
  nodeBoxWidth: number
  nodeBoxHeight: number
  boxConnectorAreaPerc: number
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
      this.verticalBox = Interval.createFromCenterSize(p.y!, 1)  
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

export class PlacedEdge implements Edge {
  readonly key: string
  readonly creationReason: CreationReason
  readonly optionalOriginalText: string | null
  readonly isError: boolean
  readonly line: Line
  readonly minLayerNumber: number
  readonly maxLayerNumber: number
  readonly isLastSegment: boolean;

  constructor (private fromNode: PlacedNode, private toNode: PlacedNode, rawEdge: Edge, line: Line) {
    this.key = getEdgeKey(fromNode, toNode)
    const edge = rawEdge as EdgeForEditor
    this.isLastSegment = edge.original.getTo().getId() === toNode.getId();
    this.creationReason = edge.creationReason
    const originalEdge = edge.original as CategorizedEdge
    this.isError = originalEdge.isError
    this.optionalOriginalText = originalEdge.text === undefined ? null : originalEdge.text
    this.line = line
    if (fromNode.layerNumber < toNode.layerNumber) {
      this.minLayerNumber = fromNode.layerNumber
      this.maxLayerNumber = toNode.layerNumber
    } else {
      this.minLayerNumber = toNode.layerNumber
      this.maxLayerNumber = fromNode.layerNumber
    }
  }

  getFrom(): PlacedNode {
    return this.fromNode
  }

  getTo(): PlacedNode {
    return this.toNode
  }

  getKey(): string {
    return this.key
  }
}

export class Layout implements GraphBase {
  readonly width: number
  readonly height: number
  private delegate: ConcreteGraphBase

  constructor(layout: NodeLayout, d: Dimensions) {
    this.width = layout.width
    this.height = layout.height
    const calc = new Edge2LineCalculation(layout, d)
    this.delegate = new ConcreteGraphBase()
    calc.getPlacedNodes().forEach(n => this.delegate.addExistingNode(n))
    calc.getOriginalEdges().forEach(edge => {
      this.delegate.addEdge(new PlacedEdge(
        this.delegate.getNodeById(edge.getFrom().getId())! as PlacedNode,
        this.delegate.getNodeById(edge.getTo().getId())! as PlacedNode,
        edge,
        calc.edge2line(edge)))
    })
  }

  getNodes(): readonly Node[] {
    return this.delegate.getNodes()
  }

  getNodeById(id: string): Node | undefined {
    return this.delegate.getNodeById(id)
  }

  getEdges(): readonly Edge[] {
    return this.delegate.getEdges()
  }

  getEdgeByKey(key: string): Edge | undefined {
    return this.delegate.getEdgeByKey(key)
  }

  parseNodeOrEdgeId(id: string): NodeOrEdge {
    return this.delegate.parseNodeOrEdgeId(id)
  }

  getNumCrossingLines(): number {
    const edges: PlacedEdge[] = this.getEdges().map(edge => edge as PlacedEdge)
    let result = 0
    edges.forEach((_, indexFirst) => {
      edges.forEach((_, indexSecond) => {
        if (indexSecond > indexFirst) {
          const layerSpanFirst = Interval.createFromMinMax(edges[indexFirst].minLayerNumber, edges[indexFirst].maxLayerNumber)
          const layerSpanSecond = Interval.createFromMinMax(edges[indexSecond].minLayerNumber, edges[indexSecond].maxLayerNumber)
          const intersection: Interval | null = layerSpanFirst.toIntersected(layerSpanSecond)
          if ( (intersection !== null) && (intersection.size >= 2) ) {
            if (this.edgesCross(edges[indexFirst], edges[indexSecond])) {
              ++result
            }  
          }
        }
      })
    })
    return result
  }

  private edgesCross(first: PlacedEdge, second: PlacedEdge): boolean {
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
}
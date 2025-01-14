/*
   Copyright 2024 WeAreFrank!

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

import { Edge } from "../model/graph";
import { NodeSequenceEditor } from "../model/nodeSequenceEditor";
import { Interval } from "../util/interval";
import { getRange } from "../util/util";
import { Dimensions, PlacedNode } from "./edge-layout";
import { Line, Point } from "./graphics";
import { NodeLayout } from "./node-layout";

export class Edge2LineCalculation {
  private placedNodes: PlacedNode[] = []
  private nodeMap: Map<string, ConnectedPlacedNode> = new Map()
  private edges: Edge[] = []
  private edge2lineMap: Map<string, Line> = new Map()

  constructor(
    nodeLayout: NodeLayout,
    model: NodeSequenceEditor,
    d: Dimensions
  ) {
    this.createNodes(nodeLayout, model, d)
    model.getEdges()
      .filter(edge => nodeLayout.positionMap.has(edge.getFrom().getId()))
      .filter(edge => nodeLayout.positionMap.has(edge.getTo().getId()))
      .forEach(edge => {
        this.edges.push(edge)
        this.connectEdge(edge)
      });
    [... this.nodeMap.values()].forEach(n => this.initNode(n, d))
    this.edges.forEach(edge => this.edge2lineMap.set(edge.getKey(), new Line(
      this.nodeMap.get(edge.getFrom().getId())!.getPointFor(edge),
      this.nodeMap.get(edge.getTo().getId())!.getPointFor(edge)
    )))
  }

  private createNodes(nodeLayout: NodeLayout, model: NodeSequenceEditor, d: Dimensions) {
    nodeLayout.positions.forEach(p => {
      const placedNode = new PlacedNode(p, d)
      this.placedNodes.push(placedNode)
      this.nodeMap.set(p.node.getId(), new ConnectedPlacedNode(placedNode))
    })
  }

  private connectEdge(edge: Edge) {
    const nodeFrom = this.nodeMap.get(edge.getFrom().getId())!
    const nodeTo = this.nodeMap.get(edge.getTo().getId())!
    const layerFrom: number = nodeFrom.node.layerNumber
    const layerTo: number = nodeTo.node.layerNumber
    if (layerFrom < layerTo) {
      // nodeFrom is higher
      nodeFrom.connectEdgeToBottom(edge, nodeTo.node.centerTop.x)
      nodeTo.connectEdgeToTop(edge, nodeFrom.node.centerBottom.x)
    } else if (layerTo < layerFrom) {
      // nodeTo is higher
      nodeFrom.connectEdgeToTop(edge, nodeTo.node.centerBottom.x)
      nodeTo.connectEdgeToBottom(edge, nodeFrom.node.centerTop.x)
    } else {
      throw new Error(`Horizontal line not allowed for edge ${edge.getKey()}`)
    }
  }

  private initNode(n: ConnectedPlacedNode, d: Dimensions) {
    n.sortConnectedEdges(d)
  }

  getOriginalEdges() {
    return this.edges
  }

  edge2line(edge: Edge): Line {
    return this.edge2lineMap.get(edge.getKey())!
  }

  getPlacedNodes(): PlacedNode[] {
    return [ ... this.placedNodes]
  }
}

class ConnectedPlacedNode {
  private edge2connectorTop: Map<string, Connector> = new Map()
  private connectorsTop: Connector[] = []
  private edge2connectorBottom: Map<string, Connector> = new Map()
  private connectorsBottom: Connector[] = []

  constructor(
    readonly node: PlacedNode
  ) {}

  connectEdgeToTop(edge: Edge, xOtherSide: number) {
    const connector: Connector = new Connector(this.getDirection(edge), xOtherSide)
    this.edge2connectorTop.set(edge.getKey(), connector)
    this.connectorsTop.push(connector)
  }

  private getDirection(edge: Edge) {
    let direction: RelativeDirection
    if (edge.getFrom().getId() === this.node.getId()) {
      direction = RelativeDirection.OUT
    } else if(edge.getTo().getId() === this.node.getId()) {
      direction = RelativeDirection.IN
    } else {
      throw new Error(`Cannot connect edge ${edge.getKey()} to node ${this.node.getId()} because it is not the from or to`)
    }
    return direction
  }

  connectEdgeToBottom(edge: Edge, xOtherSide: number) {
    const connector: Connector = new Connector(this.getDirection(edge), xOtherSide)
    this.edge2connectorBottom.set(edge.getKey(), connector)
    this.connectorsBottom.push(connector)
  }

  sortConnectedEdges(d: Dimensions) {
    // Comparators differ by the sort order when x is equal.
    // In that case the directions are different for the two
    // endpoints, but the sort order should be compatible.
    this.connectorsTop.sort(topComparator)
    this.connectorsBottom.sort(bottomComparator)
    const xtop: number[] = getXCoords(this.node.horizontalBox, this.connectorsTop.length, d.boxConnectorAreaPerc)
    xtop.forEach((coord, index) => this.connectorsTop[index].x = coord)
    const xbottom: number[] = getXCoords(this.node.horizontalBox, this.connectorsBottom.length, d.boxConnectorAreaPerc)
    xbottom.forEach((coord, index) => this.connectorsBottom[index].x = coord)
  }

  getPointFor(edge: Edge): Point {
    if (this.edge2connectorTop.has(edge.getKey())) {
      const connector = this.edge2connectorTop.get(edge.getKey())!
      const y = this.node.centerTop.y
      return new Point(connector.x, y)
    } else if(this.edge2connectorBottom.has(edge.getKey())) {
      const connector = this.edge2connectorBottom.get(edge.getKey())!
      const y = this.node.centerBottom.y
      return new Point(connector.x, y)
    } else {
      throw new Error(`Cannot get point for edge ${edge.getKey()} because it was not registered`)
    }
  }
}

export class Connector {
  x: number = 0

  constructor(
    readonly direction: RelativeDirection,
    readonly otherSideX: number
  ) {}
}

export enum RelativeDirection {
  IN = 0,
  OUT = 1
}

export function bottomComparator(first: Connector, second: Connector): number {
  let result = first.otherSideX - second.otherSideX
  if (result === 0) {
    return (first.direction as number) - (second.direction as number)
  }
  return result
}

export function topComparator(first: Connector, second: Connector): number {
  let result = first.otherSideX - second.otherSideX
  if (result === 0) {
    return (second.direction as number) - (first.direction as number)
  }
  return result
}

export function getXCoords(toDivide: Interval, count: number, boxConnectorAreaPerc: number): number[] {
  let result: number[] = []
  const availableSize = Math.max(Math.round(toDivide.size * boxConnectorAreaPerc / 100), 1)
  const available = Interval.createFromCenterSize(toDivide.center, availableSize)
  if (count === 1) {
    return [available.center]
  }
  return getRange(0, count).map(i => Math.round(available.minValue + (i * (availableSize - 1) / (count - 1))))
}

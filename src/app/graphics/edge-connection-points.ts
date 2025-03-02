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

import { getKey } from '../model/graph'
import { Interval } from "../util/interval";
import { getRange } from "../util/util";
import { EdgeForLayers } from '../model/horizontalGrouping'
import { NodeAndEdgeDimensions, PlacedNode } from "./edge-layout";
import { Line, Point } from "./graphics";
import { NodeLayout } from "./node-layout";

export class Edge2LineCalculation {
  private placedNodes: PlacedNode[] = []
  private nodeMap: Map<string, ConnectedPlacedNode> = new Map()
  private edges: EdgeForLayers[] = []
  private edge2lineMap: Map<string, Line> = new Map()

  constructor(
    nodeLayout: NodeLayout,
    d: NodeAndEdgeDimensions
  ) {
    this.createNodes(nodeLayout, d)
    nodeLayout.edges
      .forEach(edge => {
        this.edges.push(edge)
        this.connectEdge(edge)
      });
    [... this.nodeMap.values()].forEach(n => this.initNode(n, d))
    this.edges.forEach(edge => this.edge2lineMap.set(getKey(edge), new Line(
      this.nodeMap.get(edge.from.id)!.getPointFor(edge),
      this.nodeMap.get(edge.to.id)!.getPointFor(edge)
    )))
  }

  private createNodes(nodeLayout: NodeLayout, d: NodeAndEdgeDimensions) {
    nodeLayout.positions.forEach(p => {
      const placedNode = new PlacedNode(p, d)
      this.placedNodes.push(placedNode)
      this.nodeMap.set(p.node.id, new ConnectedPlacedNode(placedNode))
    })
  }

  private connectEdge(edge: EdgeForLayers) {
    const nodeFrom = this.nodeMap.get(edge.from.id)!
    const nodeTo = this.nodeMap.get(edge.to.id)!
    const layerFrom: number = nodeFrom.node.layer
    const layerTo: number = nodeTo.node.layer
    if (layerFrom < layerTo) {
      // nodeFrom is higher
      nodeFrom.connectEdgeToBottom(edge, nodeTo.node.centerTop.x)
      nodeTo.connectEdgeToTop(edge, nodeFrom.node.centerBottom.x)
    } else if (layerTo < layerFrom) {
      // nodeTo is higher
      nodeFrom.connectEdgeToTop(edge, nodeTo.node.centerBottom.x)
      nodeTo.connectEdgeToBottom(edge, nodeFrom.node.centerTop.x)
    } else {
      throw new Error(`Horizontal line not allowed for edge ${getKey(edge)}`)
    }
  }

  private initNode(n: ConnectedPlacedNode, d: NodeAndEdgeDimensions) {
    n.sortConnectedEdges(d)
  }

  getOriginalEdges() {
    return this.edges
  }

  edge2line(edge: EdgeForLayers): Line {
    return this.edge2lineMap.get(getKey(edge))!
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

  connectEdgeToTop(edge: EdgeForLayers, xOtherSide: number) {
    const connector: Connector = new Connector(this.getDirection(edge), xOtherSide)
    this.edge2connectorTop.set(getKey(edge), connector)
    this.connectorsTop.push(connector)
  }

  private getDirection(edge: EdgeForLayers) {
    let direction: RelativeDirection
    if (edge.from.id === this.node.id) {
      direction = RelativeDirection.OUT
    } else if(edge.to.id === this.node.id) {
      direction = RelativeDirection.IN
    } else {
      throw new Error(`Cannot connect edge ${getKey(edge)} to node ${this.node.id} because it is not the from or to`)
    }
    return direction
  }

  connectEdgeToBottom(edge: EdgeForLayers, xOtherSide: number) {
    const connector: Connector = new Connector(this.getDirection(edge), xOtherSide)
    this.edge2connectorBottom.set(getKey(edge), connector)
    this.connectorsBottom.push(connector)
  }

  sortConnectedEdges(d: NodeAndEdgeDimensions) {
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

  getPointFor(edge: EdgeForLayers): Point {
    if (this.edge2connectorTop.has(getKey(edge))) {
      const connector = this.edge2connectorTop.get(getKey(edge))!
      const y = this.node.centerTop.y
      return new Point(connector.x, y)
    } else if(this.edge2connectorBottom.has(getKey(edge))) {
      const connector = this.edge2connectorBottom.get(getKey(edge))!
      const y = this.node.centerBottom.y
      return new Point(connector.x, y)
    } else {
      throw new Error(`Cannot get point for edge ${getKey(edge)} because it was not registered`)
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

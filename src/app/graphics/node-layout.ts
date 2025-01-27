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

import { Graph, OptionalNode } from "../model/graph";
import { CreationReason, NodeForEditor } from "../model/horizontalGrouping";
import { LayoutBase } from "../model/layoutBase";
import { Interval } from "../util/interval";
import { Node } from "../model/graph";
import { getRange, sortedUniqNumbers } from "../util/util";
import { HorizontalConflictResolver } from "./horizontal-conflict";

export interface NodeSpacingDimensions {
  nodeWidth: number
  intermediateWidth: number
  omittedPlaceholderWidth: number
  layerHeight: number
  layerDistance: number
}

export interface NodeLayout {
  readonly width: number
  readonly height: number
  readonly positions: Position[]
  readonly positionMap: Map<string, Position>
}

export interface Position {
  readonly node: Node
  readonly layerNumber: number
  x: number | null
  y: number | null
  preds: number[]
}

interface Layer {
  layerNumber: number
  positions: Position[]
  idToPosition: Map<string, Position>
  initialWidth: number
}

export class NodeLayoutBuilder {
  private layers: Layer[] = []

  constructor(
    private model: LayoutBase,
    private graph: Graph,
    private dimensions: NodeSpacingDimensions
  ) {}

  run(): NodeLayout {
    this.layers = getRange(0, this.model.numLayers)
      .map(layerNumber => this.createLayer(layerNumber))
    this.setYCoordinates()
    const width = this.setXCoordinates()
    const positions: Position[] = this.layers.flatMap(layer => layer.positions)
    const positionMap: Map<string, Position> = new Map()
    positions.forEach(p => positionMap.set(p.node.getId(), p))
    return {width, height: this.dimensions.layerDistance * this.model.numLayers, positions, positionMap}
  }

  private createLayer(layerNumber: number): Layer {
    const positions: Position[] = []
    const idToPosition: Map<string, Position> = new Map()
    let cursor = 0
    const nodes: Node[] = this.model.getIdsOfLayer(layerNumber).map(id => this.graph.getNodeById(id)!)
    for (let node of nodes) {
      const position = this.createPosition(node, cursor, layerNumber)
      positions.push(position)
      idToPosition.set(position.node.getId(), position)
      cursor += this.widthOf(node)
    }
    const initialWidth = cursor
    return {positions, idToPosition, initialWidth, layerNumber}
  }

  private createPosition(node: Node, startX: number, layerNumber: number): Position {
    const defaultX = Interval.createFromMinSize(startX, this.widthOf(node)).center
    return {
      node,
      layerNumber,
      x: null,
      y: null,
      preds: [defaultX]
    }
  }

  private setYCoordinates() {
    let cursor = 0
    this.layers.forEach(layer => {
      const y = Interval.createFromMinSize(cursor, this.dimensions.layerHeight).center
      layer.positions.forEach(p => p.y = y)
      cursor += this.dimensions.layerDistance
    })
  }

  private setXCoordinates(): number {
    this.setInitialX()
    const allHorizontalIntervals: Interval[] = this.layers.flatMap(layer => layer.positions)
      .map(p => {
        const size = this.widthOf(p.node)
        return Interval.createFromCenterSize(p.x!, size)
      })
    const minX = Math.min( ... allHorizontalIntervals.map(interval => interval.minValue))
    const maxX = Math.max( ... allHorizontalIntervals.map(interval => interval.maxValue))
    this.layers.flatMap(layer => layer.positions).forEach(p => {
      p.x = p.x! - minX
    })
    return maxX - minX + 1
  }
  
  private setInitialX() {
    const initialWidths = this.layers.map(layer => layer.initialWidth)
    const maxInitialWidth = Math.max(... initialWidths)
    const initialLayerIndex = initialWidths.indexOf(maxInitialWidth)
    this.initializeXFrom(this.layers[initialLayerIndex], null)
    for (let i = initialLayerIndex - 1; i >= 0; --i) {
      this.initializeXFrom(this.layers[i], this.layers[i+1])
    }
    for (let i = initialLayerIndex + 1; i < this.layers.length; ++i) {
      this.initializeXFrom(this.layers[i], this.layers[i-1])
    }
  }

  initializeXFrom(subjectLayer: Layer, sourceLayer: Layer | null) {
    if (sourceLayer !== null) {
      subjectLayer.positions.forEach(p => {
        const newPreds: number[] = this.getPredsFromLayer(p, sourceLayer)
        if (newPreds.length > 0) {
          p.preds = newPreds
        }
      })
    }
    const xCoords = new HorizontalConflictResolver(
      subjectLayer.positions.length,
      i => this.widthOf(subjectLayer.positions[i].node),
      i => subjectLayer.positions[i].preds
    ).run()
    subjectLayer.positions.forEach((p, i) => p.x = xCoords[i])
  }

  getPredsFromLayer(position: Position, sourceLayer: Layer): number[] {
    const predPositionIndexes: number[] =  this.model.getConnections(position.node.getId(), sourceLayer.layerNumber)
    return predPositionIndexes.map(i => sourceLayer.positions[i]!.x!)
 }

  widthOf(n: Node) {
    const cast = n! as NodeForEditor
    if (cast.getCreationReason() === CreationReason.INTERMEDIATE) {
      return this.dimensions.intermediateWidth
    } else {
      return this.dimensions.nodeWidth
    }
  }  
}

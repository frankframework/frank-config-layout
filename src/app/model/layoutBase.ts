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

import { Graph } from './graph'

// On ordering of nodes in nodes and edges in vertically-stacked layers.
// These are numbered from top to bottom. Within each layer, the nodes are
// ordered from left to right.
//
// This class is meant to hold only shown nodes and shown edges, not
// nodes and edges omitted from a NodeSequenceEditor.
//
// The direction of connections between nodes is not so relevant for this
// class. That direction determines where to draw the arrow head, but
// has no impact on the placement of the nodes and the edges.
//

export class LayoutBase {
  private nodesByLayer: string[][]
  private connectedIds: Map<string, Set<string>>

  constructor(
    sequence: string[],
    readonly g: Graph,
    readonly nodeIdToLayer: Map<string, number>,
    readonly numLayers: number)
  {
    this.nodesByLayer = orderNodesByLabelButPreserveOrderWithinEachLayer(sequence, g, nodeIdToLayer, numLayers)
    this.connectedIds = new Map()
    for (const id of sequence) {
      this.connectedIds.set(id, new Set())
    }
    for (const edge of g.getEdges()) {
      if (this.connectedIds.has(edge.getFrom().getId()) &&
          this.connectedIds.has(edge.getTo().getId())) {
        this.connectedIds.get(edge.getFrom().getId())!.add(edge.getTo().getId())
        this.connectedIds.get(edge.getTo().getId())!.add(edge.getFrom().getId())
      }
    }
  }

  getSequence(): string[] {
    return this.nodesByLayer.flat()
  }

  getIdsOfLayer(layerNumber: number): string[] {
    return [ ... this.nodesByLayer[layerNumber] ]
  }

  positionsToIds(layerNumber: number, positions: number[]): string[] {
    return positions.map(p => this.nodesByLayer[layerNumber][p])
  }

  getConnections(id: string, toLayer: number): number[] {
    let result: number[] = []
    for (let i = 0; i < this.nodesByLayer[toLayer].length; ++i) {
      const otherId = this.nodesByLayer[toLayer][i]
      if (this.connectedIds.get(id)!.has(otherId)) {
        result.push(i)
      }
    }
    return result
  }
}

function orderNodesByLabelButPreserveOrderWithinEachLayer(
  sequence: string[], g: Graph, nodeIdToLayer: Map<string, number>, numLayers: number)
  : string[][]
{
  let nodesByLayer: string[][] = []
  // Do not work wity Array().fill().
  // That fills every element with the *same* list
  // If you then update one row, the other
  // row get secretly updated too.
  for(let layerNumber = 0; layerNumber < numLayers; ++layerNumber) {
    nodesByLayer.push([])
  }
  console.log(sequence)
  for (const id of sequence) {
    const layer: number = nodeIdToLayer.get(id)!
    console.log(`Layer: ${layer}`)
    nodesByLayer[layer].push(id)
  }
  return nodesByLayer
}

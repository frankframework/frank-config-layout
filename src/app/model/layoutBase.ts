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
import { LayerCalculationNode, LayerCalculation } from '../util/layerCalculation'

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

  clone(): LayoutBase {
    return new LayoutBase([ ... this.getSequence()], this.g, this.nodeIdToLayer, this.numLayers)
  }

  getSequence(): string[] {
    return this.nodesByLayer.flat()
  }

  getIdsOfLayer(layerNumber: number): string[] {
    return [ ... this.nodesByLayer[layerNumber] ]
  }

  putNewSequenceInLayer(layerNumber: number, newSequence: string[]) {
    const invalidIds = newSequence.filter(newId => ! this.nodeIdToLayer.has(newId))
    if (invalidIds.length >= 1) {
      throw new Error(`Putting new ids in layer ${layerNumber}: ${invalidIds}`)
    }
    const oldNumNodes: number = this.getIdsOfLayer(layerNumber).length
    const newNumNodes: number = newSequence.length
    if (oldNumNodes !== newNumNodes) {
      throw new Error(`Changing the number of nodes in layer ${layerNumber}: from ${oldNumNodes} to ${newNumNodes}`)
    }
    this.nodesByLayer[layerNumber] = [ ... newSequence]
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
  for (const id of sequence) {
    const layer: number = nodeIdToLayer.get(id)!
    nodesByLayer[layer].push(id)
  }
  return nodesByLayer
}

export function getNumCrossings(lb: LayoutBase): number {
  if (lb.numLayers <= 1) {
    return 0
  }
  let numCrossings = 0
  for (let layerNumber = 0; layerNumber < lb.numLayers - 1; ++layerNumber) {
    numCrossings += getLayerCalculation(lb, layerNumber, layerNumber + 1).count()
  }
  return numCrossings
}

function getLayerCalculation(lb: LayoutBase, target: number, ref: number): LayerCalculation {
  const calculationNodes: LayerCalculationNode[] = lb.getIdsOfLayer(target)
    .map(id => { 
      return {id: id, connections: lb.getConnections(id, ref)}
    })
  return new LayerCalculation(calculationNodes)
}

export function alignFromLayer(lb: LayoutBase, fixedLayerNumber: number) {
  if (fixedLayerNumber >= 1) {
    for (let target = fixedLayerNumber - 1; target >= 0; --target) {
      alignFromLayerTo(lb, target, target + 1)
    }
  }
  if (fixedLayerNumber <= lb.numLayers - 2) {
    for (let target = fixedLayerNumber + 1; target <= lb.numLayers - 1; ++target) {
      alignFromLayerTo(lb, target, target - 1)
    }
  }
}

function alignFromLayerTo(lb: LayoutBase, target: number, ref: number) {
  let c: LayerCalculation = getLayerCalculation(lb, target, ref)
  c.alignToConnections()
  lb.putNewSequenceInLayer(target, c.getSequence())
  ref = target
}

// TODO: I do not know how to test this automatically
export function calculateNumCrossingsChangesFromAligning(original: LayoutBase): number[] {
  const originalNumCrossings = getNumCrossings(original)
  const result: number[] = []
  for (let layerNumber = 0; layerNumber < original.numLayers; ++layerNumber) {
    const lbNew: LayoutBase = original.clone()
    alignFromLayer(lbNew, layerNumber)
    const newNumCrossings = getNumCrossings(lbNew)
    const changeOfNumCrossings = newNumCrossings - originalNumCrossings
    result.push(changeOfNumCrossings)
  }
  return result;
}

// Only exported for testing
export class NumCrossingsJudgement {
  constructor(
    readonly layerNumber: number,
    readonly numNodes: number,
    readonly numCrossingsReduction: number
  ) {}

  compareTo(other: NumCrossingsJudgement): number {
    const crossingsReductionDiff = this.numCrossingsReduction - other.numCrossingsReduction
    if (crossingsReductionDiff !== 0) {
      return crossingsReductionDiff
    }
    const numNodesDiff: number = this.numNodes - other.numNodes
    if (numNodesDiff !== 0) {
      return numNodesDiff
    }
    return this.layerNumber - other.layerNumber
  }
}

export function minimizeNumCrossings(lb: LayoutBase): LayoutBase {
  let current = lb.clone()
  while (true) {
    const crossingsChanges = calculateNumCrossingsChangesFromAligning(current)
    const judgements: NumCrossingsJudgement[] = []
    for (let layerNumber = 0; layerNumber < lb.numLayers; ++layerNumber) {
      judgements.push(new NumCrossingsJudgement(layerNumber, lb.getIdsOfLayer(layerNumber).length, - crossingsChanges[layerNumber]))
    }
    judgements.sort((a, b) => a.compareTo(b))
    const best: NumCrossingsJudgement = judgements[judgements.length - 1]
    if (best.numCrossingsReduction <= 0) {
      return current
    } else {
      alignFromLayer(current, best.layerNumber)
    }
  }
}
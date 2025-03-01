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

// Holds a grouping of nodes and edges in layers.
// A layer is group of nodes that should appear on the same horizontal line.
// No attempt here to assign concrete coordinates here. Just
// deciding how many layers there should be, how much nodes in each layer.
// Managing how to choose the sequence of nodes within a layer is also
// supported here.

import { getRange, rotateToSwapItems, permutationFrom } from '../util/util'
import { LayoutBase } from '../model/layoutBase'
import { Node, Edge, OptionalNode, OptionalEdge } from '../public.api'
// This is not OK
import { Graph } from '../model/generic-graph'

export enum UpdateResponse {
  ACCEPTED = "accepted",
  REJECTED = "rejected"
}

type OptionalString = string | null

export interface NodeSequenceEditor {
  getGraph(): Graph<Node, Edge<Node>>
  getUnorderedEdgesStartingFrom(startId: string): readonly Edge<Node>[]
  getUnorderedEdgesLeadingTo(endId: string): readonly Edge<Node>[]
  getSuccessors(nodeId: string): readonly Node[]
  getPredecessors(nodeId: string): readonly Node[]
  getNumLayers(): number
  getLayerOfPosition(position: number): number
  getPositionsInLayer(layerNumber: number): number[]
  getSequence(): readonly OptionalNode[]
  getSequenceInLayer(layerNumber: number): readonly OptionalNode[]
  // Returns array with old index as key, new index as value
  rotateToSwap(posFrom: number, posTo: number): number[]
  omitNodeFrom(position: number): UpdateResponse
  reintroduceNode(position: number, node: Node): UpdateResponse
  getShownNodesLayoutBase(): LayoutBase
  updatePositionsOfShownNodes(lb: LayoutBase): number[]
  getOrderedOmittedNodes(): readonly Node[]
  getOrderedOmittedNodesInLayer(layerNumber: number): readonly Node[]
  getCell(positionFrom: number, positionTo: number): NodeSequenceEditorCell
  optionalPositionOfNode(nodeId: string): number | null
}

export interface NodeSequenceEditorCell {
  getFromPosition(): number
  getToPosition(): number
  getLayerFrom(): number
  getLayerTo(): number
  getEdgeIfConnected(): OptionalEdge
}

export class ConcreteNodeSequenceEditor implements NodeSequenceEditor {
  private sequence: OptionalString[]
  private layerStartPositions: number[]
  private omittedByLayer: Set<string>[] = []

  constructor(
    // Not modified, no need to copy
    readonly graph: Graph<Node, Edge<Node>>
  ) {
    const initialSequence: string[] = graph.nodes.map(n => n.id)
    const numLayers = Math.max( ... graph.nodes.map(n => n.layer)) + 1
    this.sequence = LayoutBase.create(
      initialSequence,
      graph,
      numLayers
    ).getSequence()
    this.layerStartPositions = calculateLayerStartPositions(this.sequence.map(os => os!), graph)
    for(let i = 0; i < this.getNumLayers(); ++i) {
      this.omittedByLayer.push(new Set<string>())
    }
  }

  getGraph() {
    return this.graph
  }

  getNumLayers(): number {
    return this.layerStartPositions.length
  }

  // Unordered, because the sequence in the mode is not respected.
  getUnorderedEdgesStartingFrom(startId: string): readonly Edge<Node>[] {
    this.checkNodeId(startId)
    return this.graph.getOrderedEdgesStartingFrom(this.graph.getNodeById(startId)!)
  }

  // Unordered, because the sequence in the mode is not respected.
  getUnorderedEdgesLeadingTo(endId: string): readonly Edge<Node>[] {
    this.checkNodeId(endId)
    return this.graph.getOrderedEdgesLeadingTo(this.graph.getNodeById(endId)!)
  }

  getSuccessors(nodeId: string): readonly Node[] {
    this.checkNodeId(nodeId)
    return this.graph.getSuccessors(this.graph.getNodeById(nodeId)!)
  }

  getPredecessors(nodeId: string): readonly Node[] {
    this.checkNodeId(nodeId)
    return this.graph.getPredecessors(this.graph.getNodeById(nodeId)!)
  }

  getLayerOfPosition(position: number): number {
    this.checkPosition(position)
    // Do not use array method findLastIndex() because that exists
    // only from TypeScript language version ES2023 onwards.
    for (let layerNumber = this.getNumLayers() - 1; layerNumber >= 0; --layerNumber) {
      if (this.layerStartPositions[layerNumber] <= position) {
        return layerNumber
      }
    }
    throw new Error('Cannot happen because layer 0 starts at position 0')
  }

  getPositionsInLayer(layerNumber: number): number[] {
    this.checkLayerNumber(layerNumber)
    if (layerNumber === (this.getNumLayers() - 1)) {
      return getRange(this.layerStartPositions![layerNumber], this.graph.nodes.length)
    } else {
      return getRange(this.layerStartPositions![layerNumber], this.layerStartPositions![layerNumber + 1])
    }
  }

  getSequence(): readonly OptionalNode[] {
    return this.sequence.map(id => this.optionalNodeOf(id))
  }

  private optionalNodeOf(optionalId: OptionalString): OptionalNode {
    return optionalId === null ? null : this.graph.getNodeById(optionalId)!
  }

  getSequenceInLayer(layerNumber: number): readonly OptionalNode[] {
    this.checkLayerNumber(layerNumber)
    return this.getPositionsInLayer(layerNumber).map(index => this.getSequence()[index])
  }

  rotateToSwap(posFrom: number, posTo: number): number[] {
    this.checkPosition(posFrom)
    this.checkPosition(posTo)
    const layerFrom = this.getLayerOfPosition(posFrom)
    const layerTo = this.getLayerOfPosition(posTo)
    if (layerFrom !== layerTo) {
      // The permutation that does nothing
      return getRange(0, this.sequence.length)
    }
    let newSequence: OptionalString[] = [ ... this.sequence]
    const permutation = rotateToSwapItems(newSequence, posFrom, posTo)
    this.sequence = newSequence
    return permutation
  }

  omitNodeFrom(position: number): UpdateResponse {
    this.checkPosition(position)
    const optionalNode: OptionalString = this.sequence[position]
    if (optionalNode === null) {
      // Nothing to do
      return UpdateResponse.ACCEPTED
    }
    const nodeId: string = optionalNode!
    const layerNumber = this.graph.getNodeById(nodeId).layer
    if (this.omittedByLayer[layerNumber].has(nodeId)) {
      throw Error(`Programming error: node ${nodeId} exists at position ${position} and is also omitted from layer ${layerNumber}`)
    }
    this.sequence[position] = null
    this.omittedByLayer[layerNumber].add(nodeId)
    return UpdateResponse.ACCEPTED
  }

  reintroduceNode(position: number, node: Node): UpdateResponse {
    this.checkPosition(position)
    const layerNumber = this.getLayerOfPosition(position)
    if (this.sequence[position] !== null) {
      // Destination spot is not empty
      return UpdateResponse.REJECTED
    }
    if (node.layer !== layerNumber) {
      // Trying to reintroduce a node that lives in another layer
      return UpdateResponse.REJECTED
    }
    if (! this.omittedByLayer[layerNumber].has(node.id)) {
      // Node to reintroduce is in already.
      return UpdateResponse.REJECTED
    }
    this.sequence[position] = node.id
    this.omittedByLayer[layerNumber].delete(node.id)
    return UpdateResponse.ACCEPTED
  }

  getShownNodesLayoutBase(): LayoutBase {
    const shownSequence: string[] = this.getSequence()
      .filter(n => n !== null)
      .map(n => n as Node)
      .map(n => n.id!)
    return LayoutBase.create(shownSequence, this.graph, this.getNumLayers())
  }

  updatePositionsOfShownNodes(lb: LayoutBase): number[] {
    const newSequence = lb.getSequence()
    const permutation = permutationFrom(this.sequence, newSequence)
    let cursorInNewSequence = 0
    for (let position = 0; position < this.sequence.length; ++position) {
      if (this.sequence[position] !== null) {
        this.sequence[position] = newSequence[cursorInNewSequence++]
      }
    }
    return permutation
  }

  getOrderedOmittedNodes(): readonly Node[] {
    return this.getOmittedNodesSatisfying(n => true)
  }

  private getOmittedNodesSatisfying(pred: (n: Node) => boolean) {
    const originalOrder = this.graph.nodes
    const result: Node[] = []
    originalOrder.forEach(n => {
      if (this.omittedByLayer[n.layer].has(n.id)) {
        if (pred(n)) {
          result.push(n)
        }
      }
    })
    return result
  }

  getOrderedOmittedNodesInLayer(layerNumber: number): Node[] {
    this.checkLayerNumber(layerNumber)
    return this.getOmittedNodesSatisfying(n => n.layer === layerNumber)
  }

  getCell(positionFrom: number, positionTo: number): NodeSequenceEditorCell {
    this.checkPosition(positionFrom)
    this.checkPosition(positionTo)
    const layerFrom = this.getLayerOfPosition(positionFrom)
    const layerTo = this.getLayerOfPosition(positionTo)
    let optionalEdge: OptionalEdge = null
    const optionalNodeFrom: OptionalNode = this.optionalNodeOf(this.sequence[positionFrom])
    const optionalNodeTo: OptionalNode = this.optionalNodeOf(this.sequence[positionTo])
    if ((optionalNodeFrom !== null) && (optionalNodeTo !== null)) {
      const searchedEdge: Edge<Node> | undefined = this.graph.searchEdge(optionalNodeFrom.id, optionalNodeTo.id)
      if (searchedEdge !== undefined) {
        optionalEdge = searchedEdge!
      }
    }
    return new ConcreteNodeSequenceCell(positionFrom, positionTo, layerFrom, layerTo, optionalEdge)
  }

  optionalPositionOfNode(nodeId: string): number | null {
    const indexOfResult: number = this.getSequence()
      .map(n => n === null ? null : n.id)
      .indexOf(nodeId)
    if (indexOfResult >= 0) {
      return indexOfResult
    } else {
      return null
    }
  }

  private checkPosition(position: number) {
    if ((position < 0) || (position >= this.sequence.length)) {
      throw new Error(`Position out of bounds: ${position}, because there are ${this.sequence.length} nodes`)
    }
  }

  private checkLayerNumber(layerNumber: number) {
    if ((layerNumber < 0) || (layerNumber >= this.getNumLayers())) {
      throw new Error(`Layer number out of bound: ${layerNumber}, because there are ${this.getNumLayers()}`)
    }
  }

  private checkNode(node: Node) {
    if (this.graph.getNodeById(node.id) === undefined) {
      throw Error(`Invalid node provided, id is ${node.id}`)
    }
  }

  private checkNodeId(id: string) {
    if (this.graph.getNodeById(id) === undefined) {
      throw Error(`Invalid node id provided, id is ${id}`)
    }
  }
}

class ConcreteNodeSequenceCell implements NodeSequenceEditorCell {
  constructor(
    private fromPosition: number,
    private toPosition: number,
    private fromLayer: number,
    private toLayer: number,
    private optionalEdge: OptionalEdge
  ) {}

  getFromPosition(): number {
    return this.fromPosition
  }

  getToPosition(): number {
    return this.toPosition
  }

  getLayerFrom(): number {
    return this.fromLayer
  }

  getLayerTo(): number {
    return this.toLayer
  }

  getEdgeIfConnected(): OptionalEdge {
    return this.optionalEdge
  }
}

function calculateLayerStartPositions(sequence: readonly string[], g: Graph<Node, Edge<Node>>): number[] {
  let layerStartPositions: number[] = []
  if (sequence.length > 0) {
    let previousLayer = -1
    for (let currentPosition = 0; currentPosition < sequence.length; ++currentPosition) {
      let currentLayer: number = g.getNodeById(sequence[currentPosition]).layer
      if (currentLayer > previousLayer) {
        layerStartPositions.push(currentPosition)
        previousLayer = currentLayer
      }
    }
  }
  return layerStartPositions
}

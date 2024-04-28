// Holds a grouping of nodes and edges in layers.
// A layer is group of nodes that should appear on the same horizontal line.
// No attempt here to assign concrete coordinates here. Just
// deciding how many layers there should be, how much nodes in each layer.
// Managing how to choose the sequence of nodes within a layer is also
// supported here.

import { Node, Edge, getEdgeKey, OptionalNode, OptionalEdge, Graph, NodeOrEdge } from './graph'
import { getRange, rotateToSwapItems } from '../util/util'

export enum UpdateResponse {
  ACCEPTED = "accepted",
  REJECTED = "rejected"
}

type OptionalString = string | null

export interface NodeSequenceEditor {
  getNodeById(id: string): Node | undefined
  getEdges(): readonly Edge[]
  getEdgeByKey(key: string): Edge | undefined
  parseNodeOrEdgeId(id: string): NodeOrEdge
  getOrderedEdgesStartingFrom(startId: string): readonly Edge[]
  getOrderedEdgesLeadingTo(endId: string): readonly Edge[]
  getSuccessors(nodeId: string): readonly Node[]
  getPredecessors(nodeId: string): readonly Node[]
  getNumLayers(): number
  getLayerOfPosition(position: number): number
  getLayerOfNode(node: Node): number
  getPositionsInLayer(layerNumber: number): number[]
  getSequence(): readonly OptionalNode[]
  getSequenceInLayer(layerNumber: number): readonly OptionalNode[]
  // Returns array with old index as key, new index as value
  rotateToSwap(posFrom: number, posTo: number): number[]
  omitNodeFrom(position: number): UpdateResponse
  reintroduceNode(position: number, node: Node): UpdateResponse
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
  private nodeIdToLayer: Map<string, number>
  private sequence: OptionalString[]
  private layerStartPositions: number[]
  private omittedByLayer: Set<string>[] = []

  constructor(
    // Not modified, no need to copy
    readonly graph: Graph,
    nodeIdToLayer: Map<string, number>
  ) {
    // Copy the map
    this.nodeIdToLayer = new Map(nodeIdToLayer)
    this.checkNodeToLayerMap()
    this.sequence = orderNodesByLabelButPreserveOrderWithinEachLayer(
      graph.getNodes(), this.nodeIdToLayer, Math.max( ... nodeIdToLayer.values()) + 1)
    this.layerStartPositions = calculateLayerStartPositions(
      this.sequence.map(os => os!), this.nodeIdToLayer)
    for(let i = 0; i < this.getNumLayers(); ++i) {
      this.omittedByLayer.push(new Set<string>())
    }
  }

  private checkNodeToLayerMap() {
    const coveredLayersSet: Set<number> = new Set()
    const nonLayeredIds: Set<string> = new Set(this.graph.getNodes().map(n => n.getId()))
    this.nodeIdToLayer.forEach((v, k) => {
      if (this.graph.getNodeById(k) === undefined) {
        throw new Error(`Node to layer map refers to nonexisting node ${k}`)
      }
      coveredLayersSet.add(v)
      nonLayeredIds.delete(k)
    })
    if (nonLayeredIds.size !== 0) {
      throw new Error(`The following nodes in the graph do not have a layer, ${[... nonLayeredIds].join(', ')}`)
    }
    const coveredLayers: number[] = Array.from(coveredLayersSet).sort((a, b) => a - b)
    if (coveredLayers.length === 0) {
      throw new Error('No node has a layer number assigned')
    }
    coveredLayers.forEach((v, i) => {
      if (v !== i) {
        throw new Error('There are empty layers, not supported')
      }
    })
  }

  getNodeById(id: string): Node | undefined {
    return this.graph.getNodeById(id)
  }

  getEdges(): readonly Edge[] {
    return this.graph.getEdges()
  }

  getEdgeByKey(key: string): Edge | undefined {
    return this.graph.getEdgeByKey(key)
  }

  parseNodeOrEdgeId(id: string): NodeOrEdge {
    return this.graph.parseNodeOrEdgeId(id)
  }

  getNumLayers(): number {
    return this.layerStartPositions.length
  }

  getOrderedEdgesStartingFrom(startId: string): readonly Edge[] {
    this.checkNodeId(startId)
    return this.graph.getOrderedEdgesStartingFrom(this.getNodeById(startId)!)
  }

  getOrderedEdgesLeadingTo(endId: string): readonly Edge[] {
    this.checkNodeId(endId)
    return this.graph.getOrderedEdgesLeadingTo(this.getNodeById(endId)!)
  }

  getSuccessors(nodeId: string): readonly Node[] {
    this.checkNodeId(nodeId)
    return this.graph.getSuccessors(this.getNodeById(nodeId)!)
  }

  getPredecessors(nodeId: string): readonly Node[] {
    this.checkNodeId(nodeId)
    return this.graph.getPredecessors(this.getNodeById(nodeId)!)
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

  getLayerOfNode(node: Node): number {
    this.checkNode(node)
    return this.nodeIdToLayer.get(node.getId())!
  }

  getPositionsInLayer(layerNumber: number): number[] {
    this.checkLayerNumber(layerNumber)
    if (layerNumber === (this.getNumLayers() - 1)) {
      return getRange(this.layerStartPositions![layerNumber], this.graph.getNodes().length)
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
    const layerNumber = this.nodeIdToLayer.get(nodeId)!
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
    if (this.getLayerOfNode(node) !== layerNumber) {
      // Trying to reintroduce a node that lives in another layer
      return UpdateResponse.REJECTED
    }
    if (! this.omittedByLayer[layerNumber].has(node.getId())) {
      // Node to reintroduce is in already.
      return UpdateResponse.REJECTED
    }
    this.sequence[position] = node.getId()
    this.omittedByLayer[layerNumber].delete(node.getId())
    return UpdateResponse.ACCEPTED
  }

  getOrderedOmittedNodes(): readonly Node[] {
    return this.getOmittedNodesSatisfying(n => true)
  }

  private getOmittedNodesSatisfying(pred: (n: Node) => boolean) {
    const originalOrder = this.graph.getNodes()
    const result: Node[] = []
    originalOrder.forEach(n => {
      const layerNumber: number = this.nodeIdToLayer.get(n.getId())!
      if (this.omittedByLayer[layerNumber].has(n.getId())) {
        if (pred(n)) {
          result.push(n)
        }
      }
    })
    return result
  }

  getOrderedOmittedNodesInLayer(layerNumber: number): Node[] {
    this.checkLayerNumber(layerNumber)
    return this.getOmittedNodesSatisfying(n => (this.nodeIdToLayer.get(n.getId()) === layerNumber))
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
      const searchedEdge: Edge | undefined = this.graph.getEdgeByKey(getEdgeKey(optionalNodeFrom!, optionalNodeTo!))
      if (searchedEdge !== undefined) {
        optionalEdge = searchedEdge!
      }
    }
    return new ConcreteNodeSequenceCell(positionFrom, positionTo, layerFrom, layerTo, optionalEdge)
  }

  optionalPositionOfNode(nodeId: string): number | null {
    const indexOfResult: number = this.getSequence()
      .map(n => n === null ? null : n.getId())
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
    if (this.graph.getNodeById(node.getId()) === undefined) {
      throw Error(`Invalid node provided, id is ${node.getId()}`)
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

function orderNodesByLabelButPreserveOrderWithinEachLayer(nodes: readonly Node[], nodeIdToLayer: Map<string, number>, numLayers: number): string[] {
  let nodesByLayer: string[][] = []
  // Do not work wity Array().fill().
  // That fills every element with the *same* list
  // If you then update one row, the other
  // row get secretly updated too.
  for(let layerNumber = 0; layerNumber < numLayers; ++layerNumber) {
    nodesByLayer.push([])
  }
  nodes.forEach(n => {
    const id: string = n.getId()
    const layer: number = nodeIdToLayer.get(id)!
    nodesByLayer[layer].push(id)
  })
  return nodesByLayer.flat()
}

function calculateLayerStartPositions(sequence: readonly string[], nodeIdToLayer: Map<string, number>): number[] {
  let layerStartPositions: number[] = []
  if (sequence.length > 0) {
    let previousLayer = -1
    for (let currentPosition = 0; currentPosition < sequence.length; ++currentPosition) {
      let currentLayer: number = nodeIdToLayer.get(sequence[currentPosition])!
      if (currentLayer > previousLayer) {
        layerStartPositions.push(currentPosition)
        previousLayer = currentLayer
      }
    }
  }
  return layerStartPositions
}


// If a node has been selected, all its incoming and outgoing
// edges should also be highlighted.
//
// If an edge has been selected, the nodes it connects
// should also be highlighted.

interface NodeOrEdgeSelectionState {
  followPermutation(permutation: number[], model: NodeSequenceEditor): void
  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean
  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean
  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean
  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean
  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean
  isSelectPositionUndoes(index: number): boolean
  isSelectCellUndoes(indexFrom: number, indexTo: number): boolean
}

export class NodeOrEdgeSelection {
  private state: NodeOrEdgeSelectionState = new NodeOrEdgeSelectionStateDefault()

  clear() {
    this.state = new NodeOrEdgeSelectionStateDefault()
  }

  selectPosition(index: number, model: NodeSequenceEditor) {
    if (this.state.isSelectPositionUndoes(index)) {
      this.state = new NodeOrEdgeSelectionStateDefault()
    } else {
      this.state = new NodeOrEdgeSelectionStatePosition(index)
    }
  }

  selectCell(indexFrom: number, indexTo: number, model: NodeSequenceEditor) {
    if (this.state.isSelectCellUndoes(indexFrom, indexTo)) {
      this.state = new NodeOrEdgeSelectionStateDefault()
    } else {
      this.state = new NodeOrEdgeSelectionStateCell(indexFrom, indexTo)
    }
  }

  selectNodeId(nodeId: string, model: NodeSequenceEditor) {
    const position: number | null = model.optionalPositionOfNode(nodeId)
    if (position !== null) {
      this.selectPosition(position, model)
    }
  }

  selectEdgeKey(key: string, model: NodeSequenceEditor) {
    const edge: Edge | undefined = model.getEdgeByKey(key)
    if (edge === undefined) {
      return
    }
    const indexFrom = model.optionalPositionOfNode(edge.getFrom().getId())
    const indexTo = model.optionalPositionOfNode(edge.getTo().getId())
    if ( (indexFrom !== null) && (indexTo !== null)) {
      this.selectCell(indexFrom, indexTo, model)
    }
  }

  followPermutation(permutation: number[], model: NodeSequenceEditor) {
    if (permutation.length != model.getSequence().length) {
      throw new Error(`Invalid permutation ${permutation} because model has ${model.getSequence().length} positions`)
    }
    this.state.followPermutation(permutation, model)
  }

  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return this.state.isFromPositionHighlightedInEditor(index, model)
  }

  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return this.state.isToPositionHighlightedInEditor(index, model)
  }

  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean {
    return this.state.isCellHighlightedInEditor(indexFrom, indexTo, model)
  }

  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean {
    return this.state.isNodeHighlightedInDrawing(id, model)
  }

  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean {
    return this.state.isEdgeHighlightedInDrawing(key, model)
  }
}

class NodeOrEdgeSelectionStateDefault implements NodeOrEdgeSelectionState {
  followPermutation(permutation: number[], model: NodeSequenceEditor) {
  }

  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return false
  }

  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return false
  }

  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean {
    return false
  }

  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean {
    return false
  }

  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean {
    return false
  }

  isSelectPositionUndoes(index: number): boolean {
    return false
  }

  isSelectCellUndoes(indexFrom: number, indexTo: number): boolean {
    return false
  }
}

class NodeOrEdgeSelectionStatePosition implements NodeOrEdgeSelectionState {
  constructor(
    private position: number,
  ) {}

  followPermutation(permutation: number[], model: NodeSequenceEditor) {
    this.position = permutation[this.position]
  }

  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return index === this.position
  }

  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return index === this.position
  }

  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean {
    return (indexFrom === this.position) || (indexTo === this.position)
  }

  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean {
    const optionalSelectedNode = model.getSequence()[this.position]
    return (optionalSelectedNode !== null) && (id === optionalSelectedNode.getId())
  }

  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean {
    const optionalSelectedNode = model.getSequence()[this.position]
    if (optionalSelectedNode === null) {
      return false
    }
    const id = optionalSelectedNode.getId()
    const edgeKeysOnSelectedNode: string[] =
      [model.getOrderedEdgesStartingFrom(id), model.getOrderedEdgesLeadingTo(id)]
      .flat()
      .map(edge => edge.getKey())
    if (edgeKeysOnSelectedNode.indexOf(key) >= 0) {
      return true
    }
    return false
  }

  isSelectPositionUndoes(index: number): boolean {
    return index === this.position
  }

  isSelectCellUndoes(indexFrom: number, indexTo: number): boolean {
    return false
  }
}

class NodeOrEdgeSelectionStateCell implements NodeOrEdgeSelectionState {
  constructor(
    private indexFrom: number,
    private indexTo: number
  ) {}

  private getModelData(model: NodeSequenceEditor):
      {optionalFromNode: OptionalNode, optionalToNode: OptionalNode, optionalSelectedEdge: OptionalEdge}
  {
    const optionalFromNode = model.getSequence()[this.indexFrom]
    const optionalToNode = model.getSequence()[this.indexTo]
    let optionalSelectedEdge: OptionalEdge
    if ( (optionalFromNode !== null) && (optionalToNode !== null)) {
      const key: string = getEdgeKey(optionalFromNode, optionalToNode)
      const raw: Edge | undefined = model.getEdgeByKey(key)
      optionalSelectedEdge = raw === undefined ? null : raw
    } else {
      optionalSelectedEdge = null
    }
    return {optionalFromNode, optionalToNode, optionalSelectedEdge}
  }

  followPermutation(permutation: number[], model: NodeSequenceEditor) {
    this.indexFrom = permutation[this.indexFrom]
    this.indexTo = permutation[this.indexTo]
  }

  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return index === this.indexFrom
  }

  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return index === this.indexTo
  }

  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean {
    return (indexFrom === this.indexFrom) && (indexTo === this.indexTo)
  }

  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean {
    const modelData = this.getModelData(model)
    return this.isIdMatchesOptionalNode(id, modelData.optionalFromNode) || this.isIdMatchesOptionalNode(id, modelData.optionalToNode)
  }

  private isIdMatchesOptionalNode(id: string, n: OptionalNode): boolean {
    return (n !== null) && (id === n.getId())
  }

  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean {
    const modelData = this.getModelData(model)
    return (modelData.optionalSelectedEdge !== null)
      && (key === modelData.optionalSelectedEdge.getKey())
  }

  isSelectPositionUndoes(index: number): boolean {
    return false
  }

  isSelectCellUndoes(indexFrom: number, indexTo: number): boolean {
    return (indexFrom === this.indexFrom) && (indexTo === this.indexTo)
  }
}

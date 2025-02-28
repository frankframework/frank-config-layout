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

import { Node, Graph, GraphBase, Edge, ConcreteGraphBase, GraphConnectionsDecorator, getEdgeKey } from './graph'
import { NodeSequenceEditor, ConcreteNodeSequenceEditor } from '../notLibrary/nodeSequenceEditor'
import { getRange } from '../util/util'

export enum CreationReason {
  ORIGINAL = 'original',
  INTERMEDIATE = 'intermediate'
}

export interface NodeForEditor extends Node {
  getCreationReason(): CreationReason
}

export class OriginalNode implements NodeForEditor {
  constructor(
    readonly original: Node
  ) {}

  getId() {
    return this.original.getId()
  }

  getText() {
    return this.original.getText()
  }

  getCreationReason(): CreationReason {
    return CreationReason.ORIGINAL
  }
}

export const PASS_DIRECTION_DOWN = 0
export const PASS_DIRECTION_UP = 1

export class IntermediateNode implements NodeForEditor {
  constructor(
    private id: string, private passDirection: number, readonly originalEdge: Edge
  ) {}

  getId() {
    return this.id
  }

  getText() {
    return this.id
  }

  getCreationReason() {
    return CreationReason.INTERMEDIATE
  }

  getPassDirection() {
    return this.passDirection
  }
}

// Holds an original edge in which the from and to nodes
// are replaced by NodeForEditor instances, to include
// CreationReason ORIGINAL. Or holds a connection
// with intermediate nodes, CreationReason INTERMEDIATE.
//
// For an intermediate edge,
// use original.getFrom().getId() and original.getTo().getId()
// to look up the original nodes for which this intermediate
// edge was created. Do not use the nodes original.getFrom() and
// original.getTo() directly because that would mix up
// original nodes and nodes with creation information included.
//
// In any case, use the original
// field to find styling information about the edge.
// Styling information for the connected nodes is still
// available without using the original field, because
// the connected nodes are instances of NodeForEditor
//
export class EdgeForEditor implements Edge {
  constructor(
    readonly creationReason: CreationReason,
    readonly original: Edge,
    readonly from: NodeForEditor,
    readonly to: NodeForEditor,
    readonly isFirstSegment: boolean,
    readonly isLastSegment: boolean,
    readonly passDirection: number
  ) {}

  getFrom(): Node {
    return this.from
  }

  getTo(): Node {
    return this.to
  }

  getKey(): string {
    return getEdgeKey(this.from, this.to)
  }
}

export class NodeSequenceEditorBuilder {
  readonly graph: GraphBase
  readonly orderedOmittedNodes: Node[]
  private nextSeqIntermediateNode: number = 1

  constructor(
    readonly nodeIdToLayer: Map<string, number>,
    originalGraph: GraphBase)
  {
    this.orderedOmittedNodes = originalGraph.getNodes()
      .filter(n => ! nodeIdToLayer.has(n.getId()))
    this.graph = new ConcreteGraphBase()
    originalGraph.getNodes()
      .filter(n => nodeIdToLayer.has(n.getId()))
      .map(n => new OriginalNode(n))
      .forEach(n => (this.graph as ConcreteGraphBase).addExistingNode(n))
    originalGraph.getEdges()
      .filter(edge => nodeIdToLayer.has(edge.getFrom().getId()))
      .filter(edge => nodeIdToLayer.has(edge.getTo().getId()))
      .forEach(edge => this.handleEdge(edge))
  }

  handleEdge(edge: Edge): void {
    const layerFrom: number = this.nodeIdToLayer.get(edge.getFrom().getId())!
    const layerTo: number = this.nodeIdToLayer.get(edge.getTo().getId())!
    const passDirection = layerFrom <= layerTo ? PASS_DIRECTION_DOWN : PASS_DIRECTION_UP
    if (Math.abs(layerTo - layerFrom) <= 1) {
      // We do not throw an error for edges within the same layer.
      // Maybe a future layering algorithm will allow this.
      // It is not the duty of this function to test the layer
      // assignment algorithm.
      (this.graph as ConcreteGraphBase).addEdge(new EdgeForEditor(
        CreationReason.ORIGINAL,
        edge,
        this.graph.getNodeById(edge.getFrom().getId()) as NodeForEditor,
        this.graph.getNodeById(edge.getTo().getId()) as NodeForEditor,
        true, true, passDirection
      ))
    } else {
      const intermediateLayers: number[] = getIntermediateLayers(layerFrom, layerTo)
      const intermediateNodes: NodeForEditor[] = intermediateLayers.map(layer => new IntermediateNode(
        `intermediate${this.nextSeqIntermediateNode++}`, passDirection, edge
      ));
      intermediateNodes.forEach( (n, i) => (this.graph as ConcreteGraphBase).addExistingNode(n));
      (this.graph as ConcreteGraphBase).addEdge(new EdgeForEditor(
        CreationReason.INTERMEDIATE,
        edge,
        this.graph.getNodeById(edge.getFrom().getId())! as NodeForEditor,
        intermediateNodes[0],
        true,
        false,
        passDirection
      ))
      for(let i = 1; i < intermediateNodes.length; ++i) {
        (this.graph as ConcreteGraphBase).addEdge(new EdgeForEditor(
          CreationReason.INTERMEDIATE,
          edge,
          intermediateNodes[i-1],
          intermediateNodes[i],
          false,
          false,
          passDirection
        ))
      }
      (this.graph as ConcreteGraphBase).addEdge(new EdgeForEditor(
        CreationReason.INTERMEDIATE,
        edge,
        intermediateNodes[intermediateNodes.length - 1],
        this.graph.getNodeById(edge.getTo().getId()) as NodeForEditor,
        false,
        true,
        passDirection
      ))
      intermediateNodes.forEach((n, index) => this.nodeIdToLayer.set(n.getId(), intermediateLayers[index]))
    }
  }

  build(): NodeSequenceEditor {
    return new ConcreteNodeSequenceEditor(new GraphConnectionsDecorator(this.graph), this.nodeIdToLayer)
  }
}

function getIntermediateLayers(layerFrom: number, layerTo: number): number[] {
  let result: number[]
  if(layerFrom < layerTo) {
    result = getRange(layerFrom, layerTo)
    result.shift()
  } else {
    result = getRange(layerTo, layerFrom)
    result.shift()
    result.reverse()
  }
  return result
}

export enum LayerNumberAlgorithm {
  FIRST_OCCURING_PATH = '0',
  LONGEST_PATH = '1'
}

export function calculateLayerNumbers(graph: GraphConnectionsDecorator, algorithm: LayerNumberAlgorithm): Map<string, number> {
  switch(algorithm) {
    case LayerNumberAlgorithm.FIRST_OCCURING_PATH:
      return calculateLayerNumbersFirstOccuringPath(graph);
    case LayerNumberAlgorithm.LONGEST_PATH:
      return calculateLayerNumbersLongestPath(graph, () => {});
  }
}

export function calculateLayerNumbersFirstOccuringPath(graph: Graph): Map<string, number> {
  let layerMap: Map<string, number> = new Map()
  let queue: Node[] = graph.getNodes().filter(n => graph.getOrderedEdgesLeadingTo(n).length === 0)
  while (queue.length > 0) {
    // No node on the queue has a layer number
    const current: Node = queue.shift()!
    const incomingEdges = graph.getOrderedEdgesLeadingTo(current)
    if (incomingEdges.length === 0) {
      layerMap.set(current.getId(), 0)
    } else {
      // Cannot be empty. A non-root node can only have
      // been added if there once was a current with an
      // edge leading to it.
      const precedingLayers: number[] = incomingEdges
        .map(edge => edge.getFrom())
        .filter(predecessor => layerMap.has(predecessor.getId()))
        .map(predecessor => layerMap.get(predecessor.getId())!)
      let layerNumberCandidate = Math.max( ... precedingLayers) + 1
      const layersOfPlacedSuccessors: number[] = graph.getOrderedEdgesStartingFrom(current)
        .map(edge => edge.getTo())
        .filter(successor => layerMap.has(successor.getId()))
        .map(successor => layerMap.get(successor.getId())!)
      const forbiddenByPlacedSuccessors: Set<number> = new Set(layersOfPlacedSuccessors)
      while (forbiddenByPlacedSuccessors.has(layerNumberCandidate)) {
        ++layerNumberCandidate
      }
      layerMap.set(current.getId(), layerNumberCandidate)
    }
    // current has a layer number but it is off the queue.
    // Still no node on the queue has a layer number
    graph.getOrderedEdgesStartingFrom(current)
      .map(edge => edge.getTo())
      .filter(node => ! layerMap.has(node.getId()))
      .forEach(node => queue.push(node));
  }
  return layerMap
}

export function calculateLayerNumbersLongestPath(graph: Graph, onNodeVisited: () => void): Map<string, number> {
  let layerMap: Map<string, number> = new Map()
  const startNodes: Node[] = graph.getNodes().filter(n => graph.getOrderedEdgesLeadingTo(n).length === 0);
  const recursiveWalkThrough = (currentNode: Node, layerIndex: number, visitedNodes: string[]) => {
    onNodeVisited()
    const currentNodeId: string = currentNode.getId();
    const registeredLayer = layerMap.get(currentNodeId);
    if (registeredLayer === undefined || registeredLayer < layerIndex) {
      layerMap.set(currentNodeId, layerIndex);
      const edgesFrom: readonly Edge[] = graph.getOrderedEdgesStartingFrom(currentNode);
      const successors = edgesFrom.map(edge => edge.getTo());
      const newVisitedNodes = [...visitedNodes, currentNodeId];
      // Filter out nodes that have previously been visited in this path to prevent loops;
      successors.filter(successor => !newVisitedNodes.includes(successor.getId())).forEach(successor => recursiveWalkThrough(successor, layerIndex + 1, newVisitedNodes))
    }
  }
  startNodes.forEach(startNode => recursiveWalkThrough(startNode, 0, []));

  return layerMap;
}
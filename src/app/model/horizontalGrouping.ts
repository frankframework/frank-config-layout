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

import { getRange } from '../util/util'
import { Text } from './text'
import { OriginalGraph, OriginalNode, OriginalEdge } from './error-flow'
import { Graph, NodeOrEdge, Connection, WithId } from './graph'

export interface NodeForLayers extends WithId {
  readonly id: string
  readonly text: string
  readonly isError: boolean
  readonly layer: number
  readonly isIntermediate: boolean
  readonly passDirection?: number
}

export type OptionalNodeForLayers = NodeForLayers | null

export interface EdgeForLayers extends Connection<NodeForLayers> {
  readonly from: NodeForLayers
  readonly to: NodeForLayers
  readonly text: Text
  readonly isError: boolean
  readonly isIntermediate: boolean
  readonly isFirstSegment: boolean,
  readonly isLastSegment: boolean,
  readonly passDirection: number
}

export type OptionalEdgeForLayers = EdgeForLayers | null
export type NodeOrEdgeForLayers = NodeOrEdge<NodeForLayers, EdgeForLayers>
export type GraphForLayers = Graph<NodeForLayers, EdgeForLayers>

export const LAYERS_FIRST_OCCURING_PATH = 0
export const LAYERS_LONGEST_PATH = 1

export const PASS_DIRECTION_DOWN = 0
export const PASS_DIRECTION_UP = 1

// For unit tests
export function createGraphForLayers(): GraphForLayers {
  return new Graph<NodeForLayers, EdgeForLayers>()
}

export function introduceIntermediateNodesAndEdges(original: OriginalGraph, nodeIdToLayer: Map<string, number>): GraphForLayers {
  let intermediateNodeSeq: number = 1
  let orderedOmittedNodes = original.nodes
    .filter(n => ! nodeIdToLayer.has(n.id))
  if (orderedOmittedNodes.length >= 1) {
    const idsOmittedNodes = orderedOmittedNodes.map(n => n.id).join(', ')
    throw new Error(`Not all nodes could be grouped into horizontal layers: ${idsOmittedNodes}`)
  }
  let result = createGraphForLayers()
  for (const n of original.nodes.filter(n => nodeIdToLayer.has(n.id))) {
    result.addNode({
      id: n.id,
      text: n.text,
      isError: n.isError,
      layer: nodeIdToLayer.get(n.id)!,
      isIntermediate: false,
      passDirection: undefined
    })
  }
  for (const edge of original.edges
    .filter(e => nodeIdToLayer.has(e.from.id))
    .filter(e => nodeIdToLayer.has(e.to.id))) {
    intermediateNodeSeq = handleEdge(edge, nodeIdToLayer, result, intermediateNodeSeq)
  }
  return result
}

function handleEdge(edge: OriginalEdge, nodeIdToLayer: Map<string, number>, result: GraphForLayers, intermediateNodeSeq: number): number {
  const layerFrom: number = nodeIdToLayer.get(edge.from.id)!
  const layerTo: number = nodeIdToLayer.get(edge.to.id)!
  const passDirection = layerFrom <= layerTo ? PASS_DIRECTION_DOWN : PASS_DIRECTION_UP
  if (Math.abs(layerTo - layerFrom) <= 1) {
    // We do not throw an error for edges within the same layer.
    // Maybe a future layering algorithm will allow this.
    // It is not the duty of this function to test the layer
    // assignment algorithm.
    result.addEdge({
      from: result.getNodeById(edge.from.id),
      to: result.getNodeById(edge.to.id),
      text: edge.text,
      // TODO: Test this.
      isError: edge.isError,
      isFirstSegment: true,
      isLastSegment: true,
      isIntermediate: false,
      passDirection
    })
  } else {
    const intermediateNodes: NodeForLayers[] = getIntermediateLayers(layerFrom, layerTo).map(layer => {
      return {
        id: `intermediate${intermediateNodeSeq++}`,
        text: '',
        // TODO: Test this.
        isError: edge.isError,
        layer,
        isIntermediate: true,
        passDirection
      }
    })
    for (const intermediateNode of intermediateNodes) {
      result.addNode(intermediateNode)
    }
    result.addEdge({
      from: result.getNodeById(edge.from.id),
      to: intermediateNodes[0],
      text: edge.text,
      isError: edge.isError,
      isFirstSegment: true,
      isLastSegment: false,
      isIntermediate: true,
      passDirection
    })
    for(let i = 1; i < intermediateNodes.length; ++i) {
      result.addEdge({
        from: intermediateNodes[i-1],
        to: intermediateNodes[i],
        text: edge.text,
        isError: edge.isError,
        isFirstSegment: false,
        isLastSegment: false,
        isIntermediate: true,
        passDirection
      })
    }
    result.addEdge({
      from: intermediateNodes[intermediateNodes.length - 1],
      to: result.getNodeById(edge.to.id),
      text: edge.text,
      isError: edge.isError,
      isFirstSegment: false,
      isLastSegment: true,
      isIntermediate: true,
      passDirection
    })
  }
  return intermediateNodeSeq
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

export function calculateLayerNumbers(graph: OriginalGraph, algorithm: number): Map<string, number> {
  if (algorithm === LAYERS_FIRST_OCCURING_PATH) {
    return calculateLayerNumbersFirstOccuringPath(graph);
  } else if (algorithm === LAYERS_LONGEST_PATH) {
    return calculateLayerNumbersLongestPath(graph, () => {});
  }
  throw new Error(`Invalid layer algorithm ${algorithm}`)
}

export function calculateLayerNumbersFirstOccuringPath(graph: OriginalGraph): Map<string, number> {
  let layerMap: Map<string, number> = new Map()
  let queue: OriginalNode[] = graph.nodes.filter(n => graph.getOrderedEdgesLeadingTo(n).length === 0)
  while (queue.length > 0) {
    // No node on the queue has a layer number
    const current: OriginalNode = queue.shift()!
    const incomingEdges = graph.getOrderedEdgesLeadingTo(current)
    if (incomingEdges.length === 0) {
      layerMap.set(current.id, 0)
    } else {
      // Cannot be empty. A non-root node can only have
      // been added if there once was a current with an
      // edge leading to it.
      const precedingLayers: number[] = incomingEdges
        .map(edge => edge.from)
        .filter(predecessor => layerMap.has(predecessor.id))
        .map(predecessor => layerMap.get(predecessor.id)!)
      let layerNumberCandidate = Math.max( ... precedingLayers) + 1
      const layersOfPlacedSuccessors: number[] = graph.getOrderedEdgesStartingFrom(current)
        .map(edge => edge.to)
        .filter(successor => layerMap.has(successor.id))
        .map(successor => layerMap.get(successor.id)!)
      const forbiddenByPlacedSuccessors: Set<number> = new Set(layersOfPlacedSuccessors)
      while (forbiddenByPlacedSuccessors.has(layerNumberCandidate)) {
        ++layerNumberCandidate
      }
      layerMap.set(current.id, layerNumberCandidate)
    }
    // current has a layer number but it is off the queue.
    // Still no node on the queue has a layer number
    graph.getOrderedEdgesStartingFrom(current)
      .map(edge => edge.to)
      .filter(node => ! layerMap.has(node.id))
      .forEach(node => queue.push(node));
  }
  return layerMap
}

export function calculateLayerNumbersLongestPath(graph: OriginalGraph, onNodeVisited: () => void): Map<string, number> {
  let layerMap: Map<string, number> = new Map()
  const startNodes: OriginalNode[] = graph.nodes.filter(n => graph.getOrderedEdgesLeadingTo(n).length === 0);
  const recursiveWalkThrough = (currentNode: OriginalNode, layerIndex: number, visitedNodes: string[]) => {
    onNodeVisited()
    const currentNodeId: string = currentNode.id;
    const registeredLayer = layerMap.get(currentNodeId);
    if (registeredLayer === undefined || registeredLayer < layerIndex) {
      layerMap.set(currentNodeId, layerIndex);
      const edgesFrom: readonly OriginalEdge[] = graph.getOrderedEdgesStartingFrom(currentNode);
      const successors = edgesFrom.map(edge => edge.to);
      const newVisitedNodes = [...visitedNodes, currentNodeId];
      // Filter out nodes that have previously been visited in this path to prevent loops;
      successors.filter(successor => !newVisitedNodes.includes(successor.id)).forEach(successor => recursiveWalkThrough(successor, layerIndex + 1, newVisitedNodes))
    }
  }
  startNodes.forEach(startNode => recursiveWalkThrough(startNode, 0, []));

  return layerMap;
}
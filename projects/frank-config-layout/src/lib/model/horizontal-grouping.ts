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

import { getRange } from '../util/util';
import { Text } from './text';
import { OriginalGraph, OriginalNode, OriginalEdge } from './error-flow';
import { Graph, NodeOrEdge, Connection, WithId, getKey, keyFor } from './graph';

export interface WithLayerNumber extends WithId {
  layer: number;
}

export interface NodeForLayers extends WithId, WithLayerNumber {
  readonly id: string;
  readonly text: string;
  readonly errorStatus: number;
  readonly layer: number;
}

export type OptionalNodeForLayers = NodeForLayers | null;

export interface EdgeForLayers extends Connection<NodeForLayers> {
  readonly from: NodeForLayers;
  readonly to: NodeForLayers;
  readonly text: Text;
}

export type OptionalEdgeForLayers = EdgeForLayers | null;
export type NodeOrEdgeForLayers = NodeOrEdge<NodeForLayers, EdgeForLayers>;
export type GraphForLayers = Graph<NodeForLayers, EdgeForLayers>;

export const LAYERS_FIRST_OCCURING_PATH = 0;
export const LAYERS_LONGEST_PATH = 1;

export const PASS_DIRECTION_DOWN = 0;
export const PASS_DIRECTION_UP = 1;

// For unit tests
export function createGraphForLayers(): GraphForLayers {
  return new Graph<NodeForLayers, EdgeForLayers>();
}

export interface OriginalEdgeWithIntermediateEdges extends OriginalEdge {
  readonly intermediateEdgeKeys: string[];
}

export type OriginalGraphReferencingIntermediates = Graph<OriginalNode, OriginalEdgeWithIntermediateEdges>;

export interface IntermediatesCreationResult {
  intermediate: GraphForLayers;
  original: OriginalGraphReferencingIntermediates;
}

export function introduceIntermediateNodesAndEdges(
  original: OriginalGraph,
  nodeIdToLayer: Map<string, number>,
): IntermediatesCreationResult {
  const extendedOriginal: OriginalGraphReferencingIntermediates = new Graph<
    OriginalNode,
    OriginalEdgeWithIntermediateEdges
  >();
  const intermediate = createGraphForLayers();
  let intermediateNodeSeq: number = 1;
  const orderedOmittedNodes = original.nodes.filter((n) => !nodeIdToLayer.has(n.id));
  if (orderedOmittedNodes.length > 0) {
    const idsOmittedNodes = orderedOmittedNodes.map((n) => n.id).join(', ');
    throw new Error(`Not all nodes could be grouped into horizontal layers: ${idsOmittedNodes}`);
  }
  for (const n of original.nodes.filter((n) => nodeIdToLayer.has(n.id))) {
    extendedOriginal.addNode(n);
    intermediate.addNode({
      id: n.id,
      text: n.text,
      errorStatus: n.errorStatus,
      layer: nodeIdToLayer.get(n.id)!,
    });
  }
  for (const edge of original.edges
    .filter((e) => nodeIdToLayer.has(e.from.id))
    .filter((e) => nodeIdToLayer.has(e.to.id))) {
    intermediateNodeSeq = handleEdge(edge, nodeIdToLayer, extendedOriginal, intermediate, intermediateNodeSeq);
  }
  return {
    original: extendedOriginal,
    intermediate,
  };
}

function handleEdge(
  edge: OriginalEdge,
  nodeIdToLayer: Map<string, number>,
  extendedOriginal: OriginalGraphReferencingIntermediates,
  intermediate: GraphForLayers,
  intermediateNodeSeq: number,
): number {
  const layerFrom: number = nodeIdToLayer.get(edge.from.id)!;
  const layerTo: number = nodeIdToLayer.get(edge.to.id)!;
  const intermediateEdgeKeys: string[] = [];
  if (Math.abs(layerTo - layerFrom) <= 1) {
    // We do not throw an error for edges within the same layer.
    // Maybe a future layering algorithm will allow this.
    // It is not the duty of this function to test the layer
    // assignment algorithm.
    intermediateEdgeKeys.push(getKey(edge));
    intermediate.addEdge({
      from: intermediate.getNodeById(edge.from.id),
      to: intermediate.getNodeById(edge.to.id),
      text: edge.text,
    });
  } else {
    const intermediateNodes: NodeForLayers[] = getIntermediateLayers(layerFrom, layerTo).map((layer) => {
      return {
        id: `intermediate${intermediateNodeSeq++}`,
        text: '',
        errorStatus: edge.errorStatus,
        layer,
      };
    });
    for (const intermediateNode of intermediateNodes) {
      intermediate.addNode(intermediateNode);
    }
    intermediateEdgeKeys.push(keyFor(edge.from.id, intermediateNodes[0].id));
    intermediate.addEdge({
      from: intermediate.getNodeById(edge.from.id),
      to: intermediateNodes[0],
      text: edge.text,
    });
    for (let i = 1; i < intermediateNodes.length; ++i) {
      intermediateEdgeKeys.push(keyFor(intermediateNodes[i - 1].id, intermediateNodes[i].id));
      intermediate.addEdge({
        from: intermediateNodes[i - 1],
        to: intermediateNodes[i],
        text: edge.text,
      });
    }
    intermediateEdgeKeys.push(keyFor(intermediateNodes.at(-1)!.id, edge.to.id));
    intermediate.addEdge({
      from: intermediateNodes.at(-1)!,
      to: intermediate.getNodeById(edge.to.id),
      text: edge.text,
    });
  }
  const extendedOriginalEdge: OriginalEdgeWithIntermediateEdges = {
    ...edge,
    intermediateEdgeKeys,
  };
  extendedOriginal.addEdge(extendedOriginalEdge);
  return intermediateNodeSeq;
}

function getIntermediateLayers(layerFrom: number, layerTo: number): number[] {
  let result: number[];
  if (layerFrom < layerTo) {
    result = getRange(layerFrom, layerTo);
    result.shift();
  } else {
    result = getRange(layerTo, layerFrom);
    result.shift();
    result.reverse();
  }
  return result;
}

export function calculateLayerNumbers(graph: OriginalGraph, algorithm: number): Map<string, number> {
  if (algorithm === LAYERS_FIRST_OCCURING_PATH) {
    return calculateLayerNumbersFirstOccuringPath(graph);
  } else if (algorithm === LAYERS_LONGEST_PATH) {
    return calculateLayerNumbersLongestPath(graph, () => {});
  }
  throw new Error(`Invalid layer algorithm ${algorithm}`);
}

export function calculateLayerNumbersFirstOccuringPath(graph: OriginalGraph): Map<string, number> {
  const layerMap: Map<string, number> = new Map();
  const queue: OriginalNode[] = graph.nodes.filter((n) => graph.getOrderedEdgesLeadingTo(n).length === 0);
  while (queue.length > 0) {
    // No node on the queue has a layer number
    const current: OriginalNode = queue.shift()!;
    const incomingEdges = graph.getOrderedEdgesLeadingTo(current);
    if (incomingEdges.length === 0) {
      layerMap.set(current.id, 0);
    } else {
      // Cannot be empty. A non-root node can only have
      // been added if there once was a current with an
      // edge leading to it.
      const precedingLayers: number[] = incomingEdges
        .map((edge) => edge.from)
        .filter((predecessor) => layerMap.has(predecessor.id))
        .map((predecessor) => layerMap.get(predecessor.id)!);
      let layerNumberCandidate = Math.max(...precedingLayers) + 1;
      const layersOfPlacedSuccessors: number[] = graph
        .getOrderedEdgesStartingFrom(current)
        .map((edge) => edge.to)
        .filter((successor) => layerMap.has(successor.id))
        .map((successor) => layerMap.get(successor.id)!);
      const forbiddenByPlacedSuccessors: Set<number> = new Set(layersOfPlacedSuccessors);
      while (forbiddenByPlacedSuccessors.has(layerNumberCandidate)) {
        ++layerNumberCandidate;
      }
      layerMap.set(current.id, layerNumberCandidate);
    }
    // current has a layer number but it is off the queue.
    // Still no node on the queue has a layer number
    queue.push(
      ...graph
        .getOrderedEdgesStartingFrom(current)
        .map((edge) => edge.to)
        .filter((node) => !layerMap.has(node.id)),
    );
  }
  return layerMap;
}

export function calculateLayerNumbersLongestPath(graph: OriginalGraph, onNodeVisited: () => void): Map<string, number> {
  const layerMap: Map<string, number> = new Map();
  const startNodes: OriginalNode[] = graph.nodes.filter((n) => graph.getOrderedEdgesLeadingTo(n).length === 0);
  const recursiveWalkThrough = (currentNode: OriginalNode, layerIndex: number, visitedNodes: string[]): void => {
    onNodeVisited();
    const currentNodeId: string = currentNode.id;
    const registeredLayer = layerMap.get(currentNodeId);
    if (registeredLayer === undefined || registeredLayer < layerIndex) {
      layerMap.set(currentNodeId, layerIndex);
      const edgesFrom: readonly OriginalEdge[] = graph.getOrderedEdgesStartingFrom(currentNode);
      const successors = edgesFrom.map((edge) => edge.to);
      const newVisitedNodes = [...visitedNodes, currentNodeId];
      // Filter out nodes that have previously been visited in this path to prevent loops;
      const successorsNotYetVisited = successors.filter((successor) => !newVisitedNodes.includes(successor.id));
      for (const successor of successorsNotYetVisited) {
        recursiveWalkThrough(successor, layerIndex + 1, newVisitedNodes);
      }
    }
  };
  for (const startNode of startNodes) {
    recursiveWalkThrough(startNode, 0, []);
  }
  return layerMap;
}

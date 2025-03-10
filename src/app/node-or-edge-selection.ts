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

import { NodeSequenceEditor } from './node-sequence-editor';
import { getKey, EdgeForLayers, OptionalNodeForLayers, OptionalEdgeForLayers } from 'frank-config-layout';

// If a node has been selected, all its incoming and outgoing
// edges should also be highlighted.
//
// If an edge has been selected, the nodes it connects
// should also be highlighted.

/* eslint-disable @typescript-eslint/no-unused-vars */

interface NodeOrEdgeSelectionState {
  followPermutation(permutation: number[], model: NodeSequenceEditor): void;
  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean;
  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean;
  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean;
  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean;
  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean;
  isSelectPositionUndoes(index: number): boolean;
  isSelectCellUndoes(indexFrom: number, indexTo: number): boolean;
}

export class NodeOrEdgeSelection {
  private state: NodeOrEdgeSelectionState = new NodeOrEdgeSelectionStateDefault();

  clear(): void {
    this.state = new NodeOrEdgeSelectionStateDefault();
  }

  selectPosition(index: number, model: NodeSequenceEditor): void {
    if (this.state.isSelectPositionUndoes(index)) {
      this.state = new NodeOrEdgeSelectionStateDefault();
    } else {
      this.state = new NodeOrEdgeSelectionStatePosition(index);
    }
  }

  selectCell(indexFrom: number, indexTo: number, model: NodeSequenceEditor): void {
    if (this.state.isSelectCellUndoes(indexFrom, indexTo)) {
      this.state = new NodeOrEdgeSelectionStateDefault();
    } else {
      this.state = new NodeOrEdgeSelectionStateCell(indexFrom, indexTo);
    }
  }

  selectNodeId(nodeId: string, model: NodeSequenceEditor): void {
    const position: number | null = model.optionalPositionOfNode(nodeId);
    if (position !== null) {
      this.selectPosition(position, model);
    }
  }

  selectEdgeKey(key: string, model: NodeSequenceEditor): void {
    const edge: EdgeForLayers | undefined = model.getGraph().getEdgeByKey(key);
    if (edge === undefined) {
      return;
    }
    const indexFrom = model.optionalPositionOfNode(edge.from.id);
    const indexTo = model.optionalPositionOfNode(edge.to.id);
    if (indexFrom !== null && indexTo !== null) {
      this.selectCell(indexFrom, indexTo, model);
    }
  }

  followPermutation(permutation: number[], model: NodeSequenceEditor): void {
    if (permutation.length != model.getSequence().length) {
      throw new Error(`Invalid permutation ${permutation} because model has ${model.getSequence().length} positions`);
    }
    this.state.followPermutation(permutation, model);
  }

  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return this.state.isFromPositionHighlightedInEditor(index, model);
  }

  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return this.state.isToPositionHighlightedInEditor(index, model);
  }

  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean {
    return this.state.isCellHighlightedInEditor(indexFrom, indexTo, model);
  }

  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean {
    return this.state.isNodeHighlightedInDrawing(id, model);
  }

  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean {
    return this.state.isEdgeHighlightedInDrawing(key, model);
  }
}

class NodeOrEdgeSelectionStateDefault implements NodeOrEdgeSelectionState {
  followPermutation(permutation: number[], model: NodeSequenceEditor): void {}

  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return false;
  }

  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return false;
  }

  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean {
    return false;
  }

  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean {
    return false;
  }

  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean {
    return false;
  }

  isSelectPositionUndoes(index: number): boolean {
    return false;
  }

  isSelectCellUndoes(indexFrom: number, indexTo: number): boolean {
    return false;
  }
}

class NodeOrEdgeSelectionStatePosition implements NodeOrEdgeSelectionState {
  constructor(private position: number) {}

  followPermutation(permutation: number[], model: NodeSequenceEditor): void {
    this.position = permutation[this.position];
  }

  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return index === this.position;
  }

  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return index === this.position;
  }

  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean {
    return indexFrom === this.position || indexTo === this.position;
  }

  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean {
    const optionalSelectedNode = model.getSequence()[this.position];
    return optionalSelectedNode !== null && id === optionalSelectedNode.id;
  }

  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean {
    const optionalSelectedNode = model.getSequence()[this.position];
    if (optionalSelectedNode === null) {
      return false;
    }
    const id = optionalSelectedNode.id;
    const edgeKeysOnSelectedNode: string[] = [
      model.getUnorderedEdgesStartingFrom(id),
      model.getUnorderedEdgesLeadingTo(id),
    ]
      .flat()
      .map((edge) => getKey(edge));
    if (edgeKeysOnSelectedNode.includes(key)) {
      return true;
    }
    return false;
  }

  isSelectPositionUndoes(index: number): boolean {
    return index === this.position;
  }

  isSelectCellUndoes(indexFrom: number, indexTo: number): boolean {
    return false;
  }
}

class NodeOrEdgeSelectionStateCell implements NodeOrEdgeSelectionState {
  constructor(
    private indexFrom: number,
    private indexTo: number,
  ) {}

  private getModelData(model: NodeSequenceEditor): ModelData {
    const optionalFromNode = model.getSequence()[this.indexFrom];
    const optionalToNode = model.getSequence()[this.indexTo];
    if (optionalFromNode !== null && optionalToNode !== null) {
      const raw = model.getGraph().searchEdge(optionalFromNode.id, optionalToNode.id);
      const optionalSelectedEdge: OptionalEdgeForLayers = raw === undefined ? null : raw;
      return { optionalFromNode, optionalToNode, optionalSelectedEdge };
    } else {
      return { optionalFromNode, optionalToNode, optionalSelectedEdge: null };
    }
  }

  followPermutation(permutation: number[], model: NodeSequenceEditor): void {
    this.indexFrom = permutation[this.indexFrom];
    this.indexTo = permutation[this.indexTo];
  }

  isFromPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return index === this.indexFrom;
  }

  isToPositionHighlightedInEditor(index: number, model: NodeSequenceEditor): boolean {
    return index === this.indexTo;
  }

  isCellHighlightedInEditor(indexFrom: number, indexTo: number, model: NodeSequenceEditor): boolean {
    return indexFrom === this.indexFrom && indexTo === this.indexTo;
  }

  isNodeHighlightedInDrawing(id: string, model: NodeSequenceEditor): boolean {
    const modelData = this.getModelData(model);
    return (
      this.isIdMatchesOptionalNode(id, modelData.optionalFromNode) ||
      this.isIdMatchesOptionalNode(id, modelData.optionalToNode)
    );
  }

  private isIdMatchesOptionalNode(id: string, n: OptionalNodeForLayers): boolean {
    return n !== null && id === n.id;
  }

  isEdgeHighlightedInDrawing(key: string, model: NodeSequenceEditor): boolean {
    const modelData = this.getModelData(model);
    return modelData.optionalSelectedEdge !== null && key === getKey(modelData.optionalSelectedEdge);
  }

  isSelectPositionUndoes(index: number): boolean {
    return false;
  }

  isSelectCellUndoes(indexFrom: number, indexTo: number): boolean {
    return indexFrom === this.indexFrom && indexTo === this.indexTo;
  }
}

interface ModelData {
  optionalFromNode: OptionalNodeForLayers;
  optionalToNode: OptionalNodeForLayers;
  optionalSelectedEdge: OptionalEdgeForLayers;
}

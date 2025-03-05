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

// See ../../../doc/counting-line-crosses.md. We denote one layer
// to be the target layer. We store the node id-s for this layer
// and for each node the indexes pointed to in the other layer,
// the reference layer. The outer loop is then over the target
// layer, while the inner loop is over the indexes pointed to.

export interface LayerCalculationNode {
  readonly id: string;
  readonly connections: number[];
}

// Exported only for unit testing
export class Rank {
  constructor(
    readonly newRank: number,
    readonly originalRank: number,
  ) {}

  compareTo(other: Rank): number {
    let result: number = this.newRank - other.newRank;
    if (result === 0) {
      result = this.originalRank - other.originalRank;
    }
    return result;
  }
}

// Only exported for unit testing.
//
// We calculate the median multiplied by two. This
// avoids floating point numbers.
export function rankFromMedian(sortedValues: number[]): number {
  if (sortedValues.length % 2 === 0) {
    const highestMedianIndex = sortedValues.length / 2;
    const lowestMedianIndex = highestMedianIndex - 1;
    return sortedValues[lowestMedianIndex] + sortedValues[highestMedianIndex];
  } else {
    const medianIndex = (sortedValues.length - 1) / 2;
    return 2 * sortedValues[medianIndex];
  }
}

class NodeWithRank {
  constructor(
    readonly node: LayerCalculationNode,
    readonly rank: Rank,
  ) {}
}

export class LayerCalculation {
  private n: number[] = [];
  private nodes: LayerCalculationNode[];
  numReferenceNodes: number = 0;

  constructor(nodes: LayerCalculationNode[]) {
    this.nodes = [...nodes];
    this.checkReferenceNodesAndGetTheirNumber();
    this.refreshReferenceNodes();
  }

  getSequence(): string[] {
    return this.nodes.map((n) => n.id);
  }

  private checkReferenceNodesAndGetTheirNumber(): void {
    this.numReferenceNodes = 0;
    for (const node of this.nodes) {
      let prevRefIndex: number | undefined;
      for (const refIndex of node.connections) {
        if (prevRefIndex !== undefined && prevRefIndex > refIndex) {
          throw new Error(`Ref indexes are not sorted, have ${node.connections}`);
        }
        prevRefIndex = refIndex;
      }
      if (prevRefIndex !== undefined) {
        const numRefNodesCandidate = prevRefIndex + 1;
        if (numRefNodesCandidate > this.numReferenceNodes) {
          this.numReferenceNodes = numRefNodesCandidate;
        }
      }
    }
  }

  private refreshReferenceNodes(): void {
    this.n = [];
    for (let i = 0; i < this.numReferenceNodes; ++i) {
      this.n.push(0);
    }
  }

  count(): number {
    return this.countFor(this.nodes);
  }

  private countFor(targetNodes: LayerCalculationNode[]): number {
    this.refreshReferenceNodes();
    let total: number = 0;
    for (const node of targetNodes) {
      for (const refIndex of node.connections) {
        total += this.n[refIndex];
        for (let j = 0; j < refIndex; ++j) {
          this.n[j]++;
        }
      }
    }
    return total;
  }

  swapAndGetCountChange(indexLeftmost: number): number {
    const indexRightmost = indexLeftmost + 1;
    if (indexRightmost >= this.nodes.length) {
      throw new Error(`Swapped nodes out of bounds: ${indexLeftmost} and ${indexRightmost}`);
    }
    let swappedNodes = this.extractTwoNodes(indexLeftmost, indexRightmost);
    const countBefore = this.countFor(swappedNodes);
    const temp = this.nodes[indexLeftmost];
    this.nodes[indexLeftmost] = this.nodes[indexRightmost];
    this.nodes[indexRightmost] = temp;
    swappedNodes = this.extractTwoNodes(indexLeftmost, indexRightmost);
    const countAfter = this.countFor(swappedNodes);
    return countAfter - countBefore;
  }

  private extractTwoNodes(indexLeftmost: number, indexRightmost: number): LayerCalculationNode[] {
    return [indexLeftmost, indexRightmost].map((i) => this.nodes[i]);
  }

  alignToConnections(): void {
    const nodesWithRanks = this.nodes.map(
      (node, index) => new NodeWithRank(node, new Rank(rankFromMedian(node.connections), index)),
    );
    nodesWithRanks.sort((first, second) => first.rank.compareTo(second.rank));
    this.nodes = nodesWithRanks.map((nr) => nr.node);
  }
}

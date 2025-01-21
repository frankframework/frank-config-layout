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

interface TargetNode {
  readonly id: string
  readonly connections: number[]
}

abstract class CrossingsCounter {
  abstract getSequence(): string[]
  abstract count(): number
  abstract swapAndGetCountChange(indexLeftmost: number): number
}

export class CrossingsCounterOneReferenceLayer extends CrossingsCounter {
  private n: number[] = []
  private nodes: TargetNode[]
  numReferenceNodes: number = 0

  constructor(nodes: TargetNode[]) {
    super()
    this.nodes = [ ... nodes]
    this.checkReferenceNodesAndGetTheirNumber()
    this.refreshReferenceNodes()
  }

  getSequence(): string[] {
    return this.nodes.map(n => n.id)
  }

  private checkReferenceNodesAndGetTheirNumber() {
    this.numReferenceNodes = 0
    for(const node of this.nodes) {
      console.log('Target node id: ' + node.id)
      let prevRefIndex: number|undefined
      for (const refIndex of node.connections) {
        console.log('refIndex: ' + refIndex)
        if (prevRefIndex !== undefined) {
          if (prevRefIndex > refIndex) {
            throw Error(`Ref indexes are not sorted, have ${node.connections}`)
          }
        }
        prevRefIndex = refIndex
        console.log('prevRefIndex inside loop: ' + prevRefIndex)
      }
      console.log('prevRefIndex: ' + prevRefIndex)
      if (prevRefIndex !== undefined) {
        const numRefNodesCandidate = prevRefIndex + 1
        if (numRefNodesCandidate > this.numReferenceNodes) {
          this.numReferenceNodes = numRefNodesCandidate
        }
      }
    }
  }

  private refreshReferenceNodes() {
    this.n = []
    for (let i = 0; i < this.numReferenceNodes; ++i) {
      this.n.push(0)
    }
  }

  count(): number {
    return this.countFor(this.nodes)
  }

  private countFor(targetNodes: TargetNode[]) {
    this.refreshReferenceNodes()
    let total:number = 0
    for(const node of this.nodes) {
      for(const refIndex of node.connections) {
        total += this.n[refIndex]
        for (let j = 0; j < refIndex; ++j) {
          this.n[j]++
        }
      }
    }
    return total
  }

  swapAndGetCountChange(indexLeftmost: number): number {
    const indexRightmost = indexLeftmost + 1
    if (indexRightmost >= this.nodes.length) {
      throw Error(`Swapped nodes out of bounds: ${indexLeftmost} and ${indexRightmost}`)
    }
    let swappedNodes = this.extractTwoNodes(indexLeftmost, indexRightmost)
    const countBefore = this.countFor(swappedNodes)
    const temp = this.nodes[indexLeftmost]
    this.nodes[indexLeftmost] = this.nodes[indexRightmost]
    this.nodes[indexRightmost] = temp
    swappedNodes = this.extractTwoNodes(indexLeftmost, indexRightmost)
    const countAfter = this.countFor(swappedNodes)
    return countAfter - countBefore
  }

  private extractTwoNodes(indexLeftmost: number, indexRightmost: number): TargetNode[] {
    return [indexLeftmost, indexRightmost].map(i => this.nodes[i])
  }
}
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

export interface WithId {
  id: string;
}

export interface Connection<T extends WithId> {
  readonly from: T;
  readonly to: T;
}

export interface NodeOrEdge<T extends WithId, U extends Connection<T>> {
  optionalNode: T | undefined;
  optionalEdge: U | undefined;
}

export function getKey<T extends WithId>(c: Connection<T>): string {
  return keyFor(c.from.id, c.to.id);
}

function keyFor(idFrom: string, idTo: string): string {
  return `${idFrom}-${idTo}`;
}

/*
 * A set of nodes of type T and a set of connections of type U
 *
 * Usage:
 *
 * Use addNode() and addEdge() to set the nodes and the edges.
 * Use the existing node objects for the 'from' and 'to' properties
 * of each edge connecting them. When two edges connect to or from
 * the same node, the referred node object should be the same.
 *
 * Add all the nodes or edges before using the other methods of
 * this class. For example, do not add a new node after asking the
 * successors of some node.
 */
export class Graph<T extends WithId, U extends Connection<T>> {
  readonly _nodes: T[] = [];
  private _edges: U[] = [];
  private _nodesById: Map<string, T> = new Map();
  private _edgesByKey: Map<string, U> = new Map();
  private _startingFrom: Map<string, U[]> | undefined;
  private _leadingTo: Map<string, U[]> | undefined;

  constructor() {}

  addNode(node: T): void {
    if (this._nodesById.has(node.id)) {
      throw new Error(`Cannot put node with id ${node.id} because this id is already present`);
    }
    this._nodes.push(node);
    this._nodesById.set(node.id, node);
  }

  addEdge(edge: U): void {
    this.checkEdgeRefersToExistingNodes(edge);
    const key: string = getKey(edge);
    if (this._edgesByKey.has(key)) {
      throw new Error(`Cannot add existing edge with key ${key} because that connection is present already`);
    }
    this._edges.push(edge);
    this._edgesByKey.set(key, edge);
  }

  private checkEdgeRefersToExistingNodes(edge: U): void {
    const key = getKey(edge);
    if (!this._nodesById.has(edge.from.id)) {
      throw new Error(`Illegal edge with key ${key} because referred from node is not in this graph`);
    }
    if (!this._nodesById.has(edge.to.id)) {
      throw new Error(`Illegal edge with key ${key} because referred to node is not in this graph`);
    }
  }

  get nodes(): readonly T[] {
    return this._nodes;
  }

  getNodeById(id: string): T {
    if (!this._nodesById.has(id)) {
      throw new Error(`Graph does not have a node with id: ${id}`);
    }
    return this._nodesById.get(id)!;
  }

  get edges(): readonly U[] {
    return this._edges;
  }

  getEdgeByKey(key: string): U {
    if (!this._edgesByKey.has(key)) {
      throw new Error(`Graph does not have an edge with key: ${key}`);
    }
    return this._edgesByKey.get(key)!;
  }

  // TODO: Unit test this.
  searchEdge(idFrom: string, idTo: string): U | undefined {
    const key = keyFor(idFrom, idTo);
    return this._edgesByKey.get(key);
  }

  parseNodeOrEdgeId(id: string): NodeOrEdge<T, U> {
    if (id.includes('-')) {
      if (this._edgesByKey.has(id)) {
        return {
          optionalNode: undefined,
          optionalEdge: this.getEdgeByKey(id),
        };
      } else {
        return {
          optionalNode: undefined,
          optionalEdge: undefined,
        };
      }
    } else {
      if (this._nodesById.has(id)) {
        return {
          optionalNode: this.getNodeById(id),
          optionalEdge: undefined,
        };
      } else {
        return {
          optionalNode: undefined,
          optionalEdge: undefined,
        };
      }
    }
  }

  private initIfNeeded(): void {
    if (this._startingFrom !== undefined) {
      return;
    }
    this._startingFrom = new Map<string, U[]>();
    this._leadingTo = new Map<string, U[]>();
    for (const node of this._nodes) {
      this._startingFrom.set(node.id, []);
      this._leadingTo.set(node.id, []);
    }
    for (const edge of this._edges) {
      const fromId = edge.from.id;
      const toId = edge.to.id;
      this._startingFrom.get(fromId)!.push(edge);
      this._leadingTo.get(toId)!.push(edge);
    }
  }

  getOrderedEdgesStartingFrom(startNode: T): readonly U[] {
    this.initIfNeeded();
    return this._startingFrom!.get(startNode.id)!;
  }

  getOrderedEdgesLeadingTo(endNode: T): readonly U[] {
    this.initIfNeeded();
    return this._leadingTo!.get(endNode.id)!;
  }

  getSuccessors(node: T): readonly T[] {
    this.initIfNeeded();
    return this.getOrderedEdgesStartingFrom(node).map((edge) => edge.to);
  }

  getPredecessors(node: T): readonly T[] {
    this.initIfNeeded();
    return this.getOrderedEdgesLeadingTo(node).map((edge) => edge.from);
  }
}

/*
   Copyright 2024 WeAreFrank!

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

// Holds a graph, a set of nodes and edges. No data here on how to layout nodes and edges

export interface GraphBase {
  getNodes(): readonly Node[]
  getNodeById(id: string): Node | undefined
  getEdges(): readonly Edge[]
  getEdgeByKey(id: string): Edge | undefined
  parseNodeOrEdgeId(id: string): NodeOrEdge
}

export interface Graph extends GraphBase {
  getOrderedEdgesStartingFrom(startNode: Node): readonly Edge[]
  getOrderedEdgesLeadingTo(endNode: Node): readonly Edge[]
  getSuccessors(node: Node): readonly Node[]
  getPredecessors(node: Node): readonly Node[]
}

export class ConcreteGraphBase implements GraphBase {
  private nodes: Node[] = []
  private nodesById: Map<string, Node> = new Map()
  private edges: Edge[] = []
  private edgesByKey: Map<string, Edge> = new Map()

  getNodes(): readonly Node[] {
    return this.nodes
  }

  getNodeById(id: string): Node | undefined {
    return this.nodesById.get(id)
  }

  getEdges(): readonly Edge[] {
    return this.edges
  }

  getEdgeByKey(key: string): Edge | undefined {
    return this.edgesByKey.get(key)
  }

  parseNodeOrEdgeId(id: string): NodeOrEdge {
    if (id.indexOf('-') >= 0) {
      const rawEdge: Edge | undefined = this.getEdgeByKey(id)
      return {
        optionalNode: null,
        optionalEdge: rawEdge === undefined ? null : rawEdge
      }
    } else {
      const rawNode: Node | undefined = this.getNodeById(id)
      return {
        optionalNode: rawNode === undefined ? null : rawNode,
        optionalEdge: null
      }
    }
  }

  addNode(id: string, text: string, style: string) {
    if (id.includes('-')) {
      throw new Error(`Node id [${id}] is illegal because it contains '-'`)
    }
    const seq = this.nodes.length
    const node = new ConcreteNode(seq, id, text, style)
    this.addExistingNode(node)
  }

  addExistingNode(node: Node) {
    let id = node.getId()
    if(this.nodesById.has(id)) {
      throw new Error(`Cannot put node with id ${id} because this id is already present`)
    }
    this.nodes.push(node)
    this.nodesById.set(id, node)
  }
  connect(from: Node, to: Node, text?: string) {
    const seq = this.edges.length
    const edge = new ConcreteEdge(seq, from, to, text)
    this.addEdge(edge)
  }

  addEdge(existingEdge: Edge) {
    this.checkEdgeRefersToExistingNodes(existingEdge)
    const key: string = existingEdge.getKey()
    if (this.edgesByKey.has(key)) {
      throw new Error(`Cannot add existing edge with key ${key} because that connection is present already`)
    }
    this.edges.push(existingEdge)
    this.edgesByKey.set(key, existingEdge)
  }

  private checkEdgeRefersToExistingNodes(edge: Edge) {
    const key = edge.getKey()
    if (! this.nodesById.has(edge.getFrom().getId())) {
      throw new Error(`Illegal edge with key ${key} because referred from node is not in this graph`)
    }
    if( ! this.nodesById.has(edge.getTo().getId())) {
      throw new Error(`Illegal edge with key ${key} because referred to node is not in this graph`)
    }
  }
}

export class GraphConnectionsDecorator implements Graph {
  private startingFrom: Map<string, Edge[]>;
  private leadingTo: Map<string, Edge[]>;

  constructor(
    private delegate: GraphBase
  ) {
    this.startingFrom = new Map<string, Edge[]>
    this.leadingTo = new Map<string, Edge[]>
    this.getNodes().forEach(node => {
      this.startingFrom.set(node.getId(), [])
      this.leadingTo.set(node.getId(), [])
    })
    this.getEdges().forEach(edge => {
      const fromId = edge.getFrom().getId()
      const toId = edge.getTo().getId()
      this.startingFrom.get(fromId)!.push(edge)
      this.leadingTo.get(toId)!.push(edge)
    });
  }

  getNodes(): readonly Node[] {
    return this.delegate.getNodes()
  }

  getNodeById(id: string): Node | undefined {
    return this.delegate.getNodeById(id)
  }

  getEdges(): readonly Edge[] {
    return this.delegate.getEdges()
  }

  getEdgeByKey(key: string): Edge | undefined {
    return this.delegate.getEdgeByKey(key)
  }

  parseNodeOrEdgeId(id: string): NodeOrEdge {
    return this.delegate.parseNodeOrEdgeId(id)
  }

  getOrderedEdgesStartingFrom(startNode: Node): readonly Edge[] {
    return this.startingFrom!.get(startNode.getId())!
  }

  getOrderedEdgesLeadingTo(endNode: Node): readonly Edge[] {
    return this.leadingTo!.get(endNode.getId())!
  }

  getSuccessors(node: Node): readonly Node[] {
    return this.getOrderedEdgesStartingFrom(node).map(edge => edge.getTo())
  }

  getPredecessors(node: Node): readonly Node[] {
    return this.getOrderedEdgesLeadingTo(node).map(edge => edge.getFrom())
  }
}

export interface Node {
  getId(): string
  // GUI components should be able to show the text of a node if available
  getText(): string
}

export class ConcreteNode implements Node {
  constructor(
    readonly sequence: number,
    readonly id: string,
    readonly text: string,
    readonly style: string
  ) {}

  getId(): string {
    return this.id
  }

  getText() {
    return this.text
  }
}

export function getEdgeKey(from: Node, to: Node): string {
  return from.getId() + '-' + to.getId();
}

export interface Edge {
  getFrom(): Node
  getTo(): Node
  getKey(): string
}

export class ConcreteEdge implements Edge {
  constructor(
    readonly seq: number,
    readonly from: Node,
    readonly to: Node,
    readonly text?: string
  ) {}

  getFrom(): Node {
    return this.from
  }

  getTo(): Node {
    return this.to
  }

  getKey(): string {
    return getEdgeKey(this.getFrom(), this.getTo())
  }
}

export interface NodeOrEdge {
  optionalNode: OptionalNode
  optionalEdge: OptionalEdge
}

export enum NodeCaptionChoice {
  ID = "id",
  TEXT = "text"
}

export function getCaption(n: Node, choice: NodeCaptionChoice): string {
  switch (choice) {
    case NodeCaptionChoice.ID: return n.getId()
    case NodeCaptionChoice.TEXT: return n.getText()
  }
}

export type OptionalNode = Node | null
export type OptionalEdge = Edge | null

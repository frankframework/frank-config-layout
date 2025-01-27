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

import { Node, Edge, getEdgeKey, GraphBase, ConcreteGraphBase, ConcreteNode, ConcreteEdge } from './graph'

const NODE_ERROR_CLASS = 'errorOutline'

const ERROR_FORWARD_NAMES = [
  'exception',
  'failure',
  'fail',
  'timeout',
  'illegalResult',
  'presumedTimeout',
  'interrupt',
  'parserError',
  'outputParserError',
  'outputFailure'];

export class CategorizedNode implements Node {
  constructor(private delegate: Node, readonly isError: boolean) {}

  getId(): string {
    return this.delegate.getId()
  }

  getText(): string {
    return this.delegate.getText()
  }
}

export class CategorizedEdge implements Edge {
  constructor(private from: CategorizedNode, private to: CategorizedNode, readonly text: string | undefined, readonly isError: boolean) {}

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

export function categorize(b: GraphBase): GraphBase {
  const result = new ConcreteGraphBase()
  b.getNodes().forEach(n => {
    const c = categorizeNode(n as ConcreteNode)
    result.addExistingNode(c)
  })
  b.getEdges().forEach(e => {
    const from: CategorizedNode = result.getNodeById(e.getFrom().getId())! as CategorizedNode
    const to: CategorizedNode = result.getNodeById(e.getTo().getId())! as CategorizedNode
    const text = (e as ConcreteEdge).text
    result.addEdge(categorizeEdge(from, to, text))
  })
  return result
}

function categorizeNode(n: ConcreteNode): CategorizedNode {
  if (n.style === NODE_ERROR_CLASS) {
    return new CategorizedNode(n, true)
  } else {
    return new CategorizedNode(n, false)
  }
}

function categorizeEdge(from: CategorizedNode, to: CategorizedNode, edgeText?: string): CategorizedEdge {
  if (from.isError) {
    return new CategorizedEdge(from, to, edgeText, true)
  }
  if (! edgeText) {
    return new CategorizedEdge(from, to, edgeText, false)
  } else {
    return new CategorizedEdge(from, to, edgeText, ERROR_FORWARD_NAMES.includes(edgeText))
  }
}

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

import { Text } from '../public.api'
import { Graph } from './generic-graph'
import { MermaidGraph, MermaidNode } from '../parsing/mermaid-parser'

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

export interface OriginalNode {
  id: string
  text: string
  isError: boolean
}

export interface OriginalEdge {
  from: OriginalNode
  to: OriginalNode
  text: Text
  isError: boolean
}

export type OriginalGraph = Graph<OriginalNode, OriginalEdge>

export function findErrorFlow(b: MermaidGraph): OriginalGraph {
  const result = new Graph<OriginalNode, OriginalEdge>()
  for (const n of b.nodes) {
    result.addNode(transformNode(n))
  }
  for (const e of b.edges) {
    const from: OriginalNode = result.getNodeById(e.from.id)
    const to: OriginalNode = result.getNodeById(e.to.id)
    result.addEdge(transformEdge(from, to, e.text))
  }
  return result
}

function transformNode(n: MermaidNode): OriginalNode {
  if (n.style === NODE_ERROR_CLASS) {
    return { id: n.id, text: n.text, isError: true }
  } else {
    return { id: n.id, text: n.text, isError: false }
  }
}

function transformEdge(from: OriginalNode, to: OriginalNode, text: Text): OriginalEdge {
  if (from.isError) {
    return { from, to, text, isError: true}
  }
  if (text.numLines === 0) {
    return { from, to, text, isError: false}
  } else {
    const isError: boolean = text.lines
      .map(line => ERROR_FORWARD_NAMES.includes(line))
      .every(lineIsError => lineIsError === true)
    return {from, to, text, isError}
  }
}

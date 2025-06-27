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

import { EdgeText, NodeText } from './text';
import { Graph } from './graph';
import { MermaidGraph, MermaidNode } from '../parsing/mermaid-parser';

const NODE_ERROR_CLASS = 'errorOutline';

const ERROR_FORWARD_NAMES = new Set([
  'exception',
  'failure',
  'fail',
  'timeout',
  'illegalResult',
  'presumedTimeout',
  'interrupt',
  'parserError',
  'outputParserError',
  'outputFailure',
]);

export const ERROR_STATUS_SUCCESS = 0;
export const ERROR_STATUS_MIXED = 1;
export const ERROR_STATUS_ERROR = 2;

export interface OriginalNode {
  id: string;
  text: NodeText;
  errorStatus: number;
}

export interface OriginalEdge {
  from: OriginalNode;
  to: OriginalNode;
  text: EdgeText;
  errorStatus: number;
}

export type OriginalGraph = Graph<OriginalNode, OriginalEdge>;

// For testing
export function createOriginalGraph(): OriginalGraph {
  return new Graph<OriginalNode, OriginalEdge>();
}

export function findErrorFlow(b: MermaidGraph): OriginalGraph {
  const result = createOriginalGraph();
  for (const n of b.nodes) {
    result.addNode(transformNode(n));
  }
  for (const e of b.edges) {
    const from: OriginalNode = result.getNodeById(e.from.id);
    const to: OriginalNode = result.getNodeById(e.to.id);
    result.addEdge(transformEdge(from, to, e.text));
  }
  return result;
}

function transformNode(n: MermaidNode): OriginalNode {
  if (n.style === NODE_ERROR_CLASS) {
    return { id: n.id, text: n.text, errorStatus: ERROR_STATUS_ERROR };
  } else {
    return { id: n.id, text: n.text, errorStatus: ERROR_STATUS_SUCCESS };
  }
}

function transformEdge(from: OriginalNode, to: OriginalNode, edgeText: EdgeText): OriginalEdge {
  if (from.errorStatus === ERROR_STATUS_ERROR) {
    return { from, to, text: edgeText, errorStatus: ERROR_STATUS_ERROR };
  }
  if (edgeText.numLines === 0) {
    return { from, to, text: edgeText, errorStatus: ERROR_STATUS_SUCCESS };
  } else {
    const isError: boolean = edgeText.lines
      .map((line) => ERROR_FORWARD_NAMES.has(line))
      .every((lineIsError) => lineIsError === true);
    const isSuccess: boolean = edgeText.lines
      .map((line) => !ERROR_FORWARD_NAMES.has(line))
      .every((lineIsSuccess) => lineIsSuccess === true);
    if (isError) {
      return { from, to, text: edgeText, errorStatus: ERROR_STATUS_ERROR };
    }
    if (isSuccess) {
      return { from, to, text: edgeText, errorStatus: ERROR_STATUS_SUCCESS };
    }
    return { from, to, text: edgeText, errorStatus: ERROR_STATUS_MIXED };
  }
}

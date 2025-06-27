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

import { createEdgeText, EdgeText } from '../model/text';
import { Graph } from '../model/graph';

export interface MermaidNode {
  id: string;
  text: string;
  style: string;
}

export interface MermaidEdge {
  from: MermaidNode;
  to: MermaidNode;
  text: EdgeText;
}

export type MermaidGraph = Graph<MermaidNode, MermaidEdge>;

export function getGraphFromMermaid(str: string): MermaidGraph {
  const result = new Graph<MermaidNode, MermaidEdge>();
  const lines: string[] = str.split(/\r?\n/).map((line) => line.trim());
  const nodeLines: string[] = lines.filter((line) => line.search(/^[\dA-Za-z-]+\(/) === 0);
  const forwardLines: string[] = lines.filter(
    (line) => !(line.startsWith('classDef') || line.startsWith('linkStyle')) && line.search(/^[\dA-Za-z-]+ /) !== -1,
  );
  for (const nodeLine of nodeLines) {
    const id = nodeLine.slice(0, nodeLine.indexOf('('));
    const text = nodeLine.slice(nodeLine.indexOf('(') + 2, nodeLine.lastIndexOf(')') - 1);
    const style = nodeLine.slice(nodeLine.lastIndexOf(':::') + 3);
    result.addNode({ id, text, style });
  }
  for (const forwardLine of forwardLines) {
    const fromId = forwardLine.slice(0, forwardLine.indexOf(' '));
    const toId = forwardLine.slice(forwardLine.lastIndexOf(' ') + 1);
    const firstPipeIndex = forwardLine.indexOf('|');
    const rawText =
      firstPipeIndex < 0 ? undefined : forwardLine.slice(firstPipeIndex + 1, forwardLine.lastIndexOf('|'));
    const text: EdgeText = createEdgeText(rawText);
    if (result.getNodeById(fromId) === undefined) {
      throw new Error(`Intended edge references unknown from node [${fromId}]`);
    }
    const from = result.getNodeById(fromId)!;
    if (result.getNodeById(toId) === undefined) {
      throw new Error(`Intended edge references unknown to node [${toId}]`);
    }
    const to = result.getNodeById(toId)!;

    result.addEdge({ from, to, text });
  }
  return result;
}

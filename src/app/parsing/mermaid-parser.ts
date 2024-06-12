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

import { ConcreteGraphBase, GraphBase } from '../model/graph'

export function getGraphFromMermaid(str: string): GraphBase {
  const result = new ConcreteGraphBase()
  const lines: string[] = str.split(/\r?\n/).map(line => line.trim());
  const nodeLines: string[] = lines.filter(line => line.search(/^[a-zA-Z0-9-]+\(/) === 0);
  const forwardLines: string[] = lines.filter(line => !(line.startsWith('classDef') || line.startsWith('linkStyle')) && line.search(/^[a-zA-Z0-9-]+ /) !== -1);
  nodeLines.forEach((line) => {
    const id = line.substring(0, line.indexOf('('))
    const text = line.substring(line.indexOf('(') + 2, line.lastIndexOf(')') - 1)
    const style = line.substring(line.lastIndexOf(':::') + 3)
    result.addNode(id, text, style)
  })
  forwardLines.forEach((line) => {
    const fromId = line.substring(0, line.indexOf(' '))
    const toId = line.substring(line.lastIndexOf(' ') + 1);
    const firstPipeIndex = line.indexOf('|');
    const text = firstPipeIndex < 0 ? undefined : line.substring(firstPipeIndex + 1, line.lastIndexOf('|'))
    if (result.getNodeById(fromId) === undefined) {
      throw new Error(`Intended edge references unknown from node [${fromId}]`)
    }
    const from = result.getNodeById(fromId)!
    if (result.getNodeById(toId) === undefined) {
      throw new Error(`Intended edge references unknown to node [${toId}]`)
    }
    const to = result.getNodeById(toId)!
    result.connect(from, to, text)
  })
  return result
}

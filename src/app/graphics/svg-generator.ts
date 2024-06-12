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

import { CreationReason } from "../model/horizontalGrouping"
import { Layout, PlacedEdge, PlacedNode } from "./edge-layout"

export function generateSvg(layout: Layout) {
  return openSvg(layout.width, layout.height)
    + renderDefs()
    + renderNodes(layout.getNodes().map(n => n as PlacedNode))
    + renderEdges(layout.getEdges().map(e => e as PlacedEdge))
    + closeSvg()
}

function openSvg(width: number, height: number) {
  return `<svg class="svg" xmlns="http://www.w3.org/2000/svg"
  width="${width}" height="${height}" >
`
}

function renderDefs() {
  return `  <defs>
    <style>
      .rectangle {
        fill: transparent;
        stroke: black;
        stroke-width: 3;
      }
    
      .line {
        stroke: black;
        stroke-width: 3;
      }

      .line.error {
        stroke: red
      }
    </style>
    <!-- A marker to be used as an arrowhead -->
    <marker
      id="arrow"
      viewBox="0 0 4 4"
      refX="4"
      refY="2"
      markerWidth="4"
      markerHeight="4"
      orient="auto-start-reverse">
      <path d="M 0 0 L 4 2 L 0 4 z" />
    </marker>
  </defs>
`
}

function renderNodes(nodes: readonly PlacedNode[]): string {
  return nodes.filter(n => n.creationReason === CreationReason.ORIGINAL).map(n => renderOriginalNode(n)).join('')
}

function renderOriginalNode(n: PlacedNode): string {
  return `  <g class="${getNodeGroupClass(n.getId())}">
    <rect class="rectangle"
      x="${n.horizontalBox.minValue}"
      y="${n.verticalBox.minValue}"
      width="${n.horizontalBox.size}"
      height="${n.verticalBox.size}"
      rx="5">
    </rect>
    <text
      x="${n.horizontalBox.center}"
      y="${n.verticalBox.center}"
      text-anchor="middle" dominant-baseline="middle" class="nodeText">
        ${n.text}
    </text>
  </g>
`
}

function getNodeGroupClass(id: string) {
  return "frank-flowchart-node-" + id
}

function renderEdges(edges: PlacedEdge[]): string {
  return edges.map(edge => renderEdge(edge)).join('')
}

function renderEdge(edge: PlacedEdge): string {
  return `  <g class="${getEdgeGroupClass(edge.getKey())}">
    <polyline ${classOfLine(edge)} points="${edge.line.startPoint.x},${edge.line.startPoint.y} ${edge.line.endPoint.x},${edge.line.endPoint.y}" ${getMarkerEnd(edge)}/>
  </g>
`
}

function getEdgeGroupClass(key: string) {
  return "frank-flowchart-edge-" + key
}

function getMarkerEnd(edge: PlacedEdge): string {
  if (edge.isLastSegment) {
    return 'marker-end="url(#arrow)"'
  } else {
    return ''
  }
}

function classOfLine(edge: PlacedEdge): string {
  if (edge.optionalOriginalText === 'error') {
    return 'class="line error"'
  } else {
    return 'class="line"'
  }
}

function closeSvg(): string {
  return '</svg>'
}
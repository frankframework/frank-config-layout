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

import { CreationReason } from "../model/horizontalGrouping"
import { Layout, LayoutLineSegment, PlacedNode, EdgeLabel } from "./edge-layout"

export function generateSvg(layout: Layout, edgeLabelFontSize: number) {
  return openSvg(layout.width, layout.height)
    + renderDefs(edgeLabelFontSize)
    + renderNodes(layout.getNodes().map(n => n as PlacedNode))
    + renderEdges(layout.getLayoutLineSegments().map(e => e as LayoutLineSegment))
    + renderLabels(layout.edgeLabels)
    + closeSvg()
}

function openSvg(width: number, height: number) {
  return `<svg class="svg" xmlns="http://www.w3.org/2000/svg"
  width="${width}" height="${height}" >
`
}

function renderDefs(fontSize: number) {
  return `  <defs>
    <style>
      .rectangle {
        fill: transparent;
        stroke: #8bc34a;
        stroke-width: 4;
      }

      .rectangle.errorOutline {
        stroke: #ec4758;
      }
    
      .line {
        stroke: #8bc34a;
        stroke-width: 3;
      }

      .line.error {
        stroke: #ec4758;
      }

      .rect-text-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .rect-text-box {
        margin: 5px;
        overflow: hidden;
        text-align: center;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family: "trebuchet ms";
      }

      .label-text-wrapper {
        overflow: hidden;
        text-align: center;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family: "trebuchet ms";
        font-size: ${fontSize}px;
      }

      .label-text-box {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        height: 100%;
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
  return `  <g class="${getNodeGroupClass(n.getId())}" transform="translate(${n.horizontalBox.minValue}, ${n.verticalBox.minValue})">
    <rect class="${getRectangleClass(n)}"
      width="${n.horizontalBox.size}"
      height="${n.verticalBox.size}"
      rx="5">
    </rect>
    <foreignObject style="width:${n.horizontalBox.size}px; height:${n.verticalBox.size}px">
      <div xmlns="http://www.w3.org/1999/xhtml" class="rect-text-wrapper">
        <div class="rect-text-box">
          ${n.text}
        </div>
      </div>
    </foreignObject>
  </g>
`
}

function getNodeGroupClass(id: string) {
  return "frank-flowchart-node-" + id
}

function getRectangleClass(n: PlacedNode): string {
  if (n.isError) {
    return "rectangle errorOutline"
  } else {
    return "rectangle"
  }
}

function renderEdges(edges: LayoutLineSegment[]): string {
  return edges.map(edge => renderEdge(edge)).join('')
}

function renderEdge(edge: LayoutLineSegment): string {
  return `  <g class="${getEdgeGroupClass(edge.key)}">
    <polyline ${classOfLine(edge)} points="${edge.line.startPoint.x},${edge.line.startPoint.y} ${edge.line.endPoint.x},${edge.line.endPoint.y}" ${getMarkerEnd(edge)}/>
  </g>
`
}

function getEdgeGroupClass(key: string) {
  return "frank-flowchart-edge-" + key
}

function getMarkerEnd(lineSegment: LayoutLineSegment): string {
  if (lineSegment.isLastLineSegment) {
    return 'marker-end="url(#arrow)"'
  } else {
    return ''
  }
}

function classOfLine(edge: LayoutLineSegment): string {
  if (edge.isError) {
    return 'class="line error"'
  } else {
    return 'class="line"'
  }
}

function renderLabels(labels: EdgeLabel[]): string {
  return '  <g text-anchor="middle" dominant-baseline="middle">\n'
    + labels.map(label => renderLabel(label)).join('')
    + '  </g>\n'
}

function renderLabel(label: EdgeLabel): string {
  return `    <g transform="translate(${label.horizontalBox.minValue}, ${label.verticalBox.minValue})">
      <foreignObject style="width:${label.horizontalBox.size}px; height:${label.verticalBox.size}px">
        <div xmlns="http://www.w3.org/1999/xhtml" class="label-text-wrapper">
          <div class="label-text-box" >
            ${label.text}
          </div>
        </div>
      </foreignObject>
    </g>
`
}

function closeSvg(): string {
  return '</svg>'
}
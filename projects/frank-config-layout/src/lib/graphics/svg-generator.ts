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

import { ERROR_STATUS_ERROR, ERROR_STATUS_SUCCESS } from '../model/error-flow';
import { NodeText, NodeTextPart } from '../model/text';
import { EdgeLabel, Layout, LayoutLineSegment, PlacedNode } from './layout';

export function generateSvg(layout: Layout, edgeLabelFontSize: number, border: number): string {
  return (
    openSvg(layout.width, layout.height) +
    renderDefs() +
    renderNodes(
      layout.nodes.map((n) => n as PlacedNode),
      border,
    ) +
    renderEdges(layout.layoutLineSegments) +
    renderLabels(layout.edgeLabels, edgeLabelFontSize) +
    closeSvg()
  );
}

function openSvg(width: number, height: number): string {
  return `<svg class="svg" xmlns="http://www.w3.org/2000/svg"
  width="${width}" height="${height}" >
`;
}

function renderDefs(): string {
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

      .line.mixed {
        stroke: #FFDE59;
      }

      .rect-text {
        font-family: "Inter", "trebuchet ms", serif;
      }

      .rect-text > text[data-html-node="a"] {
        font-size: 28px;
      }

      .rect-text > text[data-html-node="b"] {
        font-weight: bold;
      }

      .label-text {
        font-family: "Inter", "trebuchet ms", serif;
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
`;
}

function renderNodes(nodes: readonly PlacedNode[], border: number): string {
  return nodes.map((n) => renderOriginalNode(n, border)).join('');
}

function renderOriginalNode(node: PlacedNode, border: number): string {
  const svgText = getSvgTextElements(node, border);
  return `  <g class="${getNodeGroupClass(node.id)}" transform="translate(${node.horizontalBox.minValue}, ${node.verticalBox.minValue})">
    <rect class="${getRectangleClass(node)}"
      width="${node.horizontalBox.size}"
      height="${node.verticalBox.size}"
      rx="5">
    </rect>
    <g class="rect-text">${svgText}</g>
  </g>
`;
}

function getNodeGroupClass(id: string): string {
  return `frank-flowchart-node-${id}`;
}

function getRectangleClass(n: PlacedNode): string {
  if (n.errorStatus === ERROR_STATUS_ERROR) {
    return 'rectangle errorOutline';
  } else {
    return 'rectangle';
  }
}

function renderEdges(edges: LayoutLineSegment[]): string {
  return edges.map((edge) => renderEdge(edge)).join('');
}

function renderEdge(edge: LayoutLineSegment): string {
  return `  <g class="${getEdgeGroupClass(edge.key)}">
    <polyline ${classOfLine(edge)} points="${edge.line.startPoint.x},${edge.line.startPoint.y} ${edge.line.endPoint.x},${edge.line.endPoint.y}" ${getMarkerEnd(edge)}/>
  </g>
`;
}

function getEdgeGroupClass(key: string): string {
  return `frank-flowchart-edge-${key}`;
}

function getMarkerEnd(lineSegment: LayoutLineSegment): string {
  if (lineSegment.isLastLineSegment) {
    return 'marker-end="url(#arrow)"';
  } else {
    return '';
  }
}

function classOfLine(edge: LayoutLineSegment): string {
  if (edge.errorStatus === ERROR_STATUS_ERROR) {
    return 'class="line error"';
  } else if (edge.errorStatus === ERROR_STATUS_SUCCESS) {
    return 'class="line"';
  } else {
    return 'class="line mixed"';
  }
}

function renderLabels(labels: EdgeLabel[], edgeLabelFontSize: number): string {
  return [
    '  <g text-anchor="middle" dominant-baseline="middle">\n',
    labels.map((label) => renderLabel(label, edgeLabelFontSize)).join(''),
    '  </g>\n',
  ].join('');
}

function renderLabel(label: EdgeLabel, edgeLabelFontSize: number): string {
  const fontSize = label.verticalBox.size;
  const textLength = label.horizontalBox.size;
  const x = Math.round(textLength / 2);
  const y = Math.round(fontSize / 2);
  return `    <g transform="translate(${label.horizontalBox.minValue}, ${label.verticalBox.minValue})">
      <text class="label-text" x="${x}" y="${y}" font-size="${edgeLabelFontSize}">${label.text}</text>
    </g>
`;
}

function closeSvg(): string {
  return '</svg>';
}

function getSvgTextElements(node: PlacedNode, border: number): string {
  const nodeText: NodeText = node.text;
  if (nodeText.parts.length === 1) {
    const textPart = nodeText.parts[0];
    const x = border;
    const y = Math.round(node.verticalBox.size / 2 + textPart.fontSize / 2);
    return getSvgTextElement(textPart, x, y);
  }
  let totalSvgText = '';
  const innerHeight: number = node.verticalBox.size - 2 * border;
  const innerWidth: number = node.horizontalBox.size - 2 * border;
  const yStep = innerHeight / nodeText.parts.length;
  for (let index = 0; index < nodeText.parts.length; ++index) {
    const textPart = nodeText.parts[index];
    const x = Math.round(border + (innerWidth - textPart.innerWidth) / 2);
    const y = Math.round(border + yStep * (index + 1));
    totalSvgText += getSvgTextElement(textPart, x, y);
  }
  return totalSvgText;
}

function getSvgTextElement(textPart: NodeTextPart, x: number, y: number): string {
  return `<text data-html-node=${textPart.name} x="${x}" y="${y}" textLength="${textPart.innerWidth}" lengthAdjust="spacingAndGlyphs">${textPart.text}</text>`;
}

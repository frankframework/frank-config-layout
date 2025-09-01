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
import { EdgeLabel, Layout, LayoutLineSegment, PlacedNode } from './layout';

export function generateSvg(layout: Layout, edgeLabelFontSize: number): string {
  return (
    openSvg(layout.width, layout.height) +
    renderDefs() +
    renderNodes(layout.nodes.map((n) => n as PlacedNode)) +
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

      .rect-text > tspan[data-html-node="a"] {
        font-size: 28px;
      }

      .rect-text > tspan[data-html-node="b"] {
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

function renderNodes(nodes: readonly PlacedNode[]): string {
  return nodes.map((n) => renderOriginalNode(n)).join('');
}

function renderOriginalNode(node: PlacedNode): string {
  const borderWidth = 4;
  const innerHeight = node.verticalBox.size - borderWidth * 2;
  const innerWidth = node.horizontalBox.size - borderWidth * 2;
  const { svgText, totalTextLength } = tempConvertNodeTextToSVGElementText(node.text, innerWidth, innerHeight, borderWidth);
  return `  <g class="${getNodeGroupClass(node.id)}" transform="translate(${node.horizontalBox.minValue}, ${node.verticalBox.minValue})">
    <rect class="${getRectangleClass(node)}"
      width="${node.horizontalBox.size}"
      height="${node.verticalBox.size}"
      rx="5">
    </rect>
    <text class="rect-text" textLength="${totalTextLength}" lengthAdjust="spacingAndGlyphs">${svgText}</text>
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
  const x = fixedPointFloat(textLength / 2);
  const y = fixedPointFloat(fontSize / 2);
  return `    <g transform="translate(${label.horizontalBox.minValue}, ${label.verticalBox.minValue})">
      <text class="label-text" x="${x}" y="${y}" font-size="${edgeLabelFontSize}">${label.text}</text>
    </g>
`;
}

function closeSvg(): string {
  return '</svg>';
}

function tempConvertNodeTextToSVGElementText(
  nodeText: string,
  innerWidth: number,
  innerHeight: number,
  baseX: number,
): { svgText: string, totalTextLength: number } {
  const nodeDOM = new DOMParser().parseFromString(nodeText, 'text/html');
  const nodes = nodeDOM.body.childNodes;
  const textParts: { name: string; text: string }[] = [];

  // has to be done this way because childNodes doesn't have an iterator
  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const name = node.nodeName.toLowerCase();
    if (name === 'br') continue;
    const text = node.textContent ?? '';
    textParts.push({ name, text });
  }

  if (textParts.length === 1) {
    const { svgText, textLength } = createSVGTextElement(0, textParts, baseX, innerWidth, innerHeight, true);
    return { svgText, totalTextLength: textLength };
  }

  const yPositions = innerHeight / textParts.length;
  let totalSvgText = '';
  let totalTextLength = 0;
  for (const index in textParts) {
    const { svgText, textLength } = createSVGTextElement(+index, textParts, baseX, innerWidth, yPositions);
    totalSvgText += svgText;
    totalTextLength += textLength;
  }
  return { svgText: totalSvgText, totalTextLength };
}

function createSVGTextElement(index: number, textParts: { name: string, text: string }[], baseX: number, innerWidth: number, yPositions: number, singlePart?: boolean): { svgText: string, textLength: number } {
  const { name, text } = textParts[index];
  const { x, y, length: textLength } = calculateTextPostion(text, name, baseX, innerWidth, yPositions, index, singlePart);
  const svgText = `<tspan data-html-node=${name} x="${x}" y="${y}" textLength="${textLength}" lengthAdjust="spacingAndGlyphs">${text}</tspan>`;
  return { svgText, textLength };
}

function calculateTextPostion(nodeText: string, nodeName: string, baseX: number, innerWidth: number, yPositions: number, nodeIndex: number, singlePart?: boolean): { x: number; y: number; length: number } {
  const fontSize = nodeName === 'a' ? 28 : 16;
  const fontWidth = calculateAverageFontCharacterWidth(fontSize);
  const length = Math.min(fixedPointFloat(nodeText.length * fontWidth), innerWidth);
  const x = fixedPointFloat(baseX + (innerWidth - length) / 2);
  const y = fixedPointFloat(singlePart ? (yPositions + fontSize) / 2 : yPositions * (nodeIndex + 1));
  return { x, y, length };
}

function calculateAverageFontCharacterWidth(fontSize: number, bold?: boolean): number {
  // assuming Inter font https://chrishewett.com/blog/calculating-text-width-programmatically/
  const baseWidthAt100pxSize = 55.4;
  const baseWidthAt100pxSizeBold = 58.6;
  const base = bold ? baseWidthAt100pxSizeBold : baseWidthAt100pxSize;
  return base / 100 * fontSize;
}

export function fixedPointFloat(value: number, digits?: number): number {
  return +value.toFixed(digits ?? 2);
}

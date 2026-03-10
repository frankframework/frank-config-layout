/*
   Copyright 2025-2026 WeAreFrank!

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

export interface NodeTextDimensions {
  nodeTextFontSize: number; // 16
  nodeTextBorder: number;
}

export interface TextPart {
  readonly svg: string;
  readonly text: string;
}

export interface EdgeText {
  readonly svg: string;
  readonly lines: TextPart[];
  readonly numLines: number;
  readonly maxLineLength: number;
}

export interface NodeTextPart extends TextPart {
  readonly innerWidth: number;
  readonly outerWidth: number;
}

export interface NodeText {
  readonly svg: string;
  readonly parts: NodeTextPart[];
  readonly innerWidth: number;
  readonly outerWidth: number;
}

export function createEmptyEdgeText(): EdgeText {
  return {
    svg: '',
    lines: [],
    numLines: 0,
    maxLineLength: 0,
  };
}

export function createEdgeText(originalSvg: string): EdgeText {
  if (originalSvg.length === 0) {
    return createEmptyEdgeText();
  }
  const parts = originalSvg.split('</text>');
  parts.pop(); // remove the last element, which is always empty
  const lines = parts.map((line) => {
    const text = line.slice(line.indexOf('>') + 1);
    const svg = `${line.trim()}</text>`;
    return { text, svg };
  });

  const maxLineLength = Math.max(...lines.map((line) => line.text.length));
  return {
    svg: originalSvg,
    lines,
    maxLineLength,
    numLines: lines.length,
  };
}

export function createNodeText(svg: string, d: NodeTextDimensions): NodeText {
  const nodeDOM = new DOMParser().parseFromString(svg, 'text/html');
  const nodes = nodeDOM.body.childNodes;
  const textParts: NodeTextPart[] = [];

  // has to be done this way because childNodes doesn't have an iterator
  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const name = node.nodeName.toLowerCase();
    if (name !== 'text') continue;
    const textNode = node as SVGTextElement;
    const textContent = textNode.textContent ?? '';
    const isBold: boolean = textNode.dataset['htmlNode'] === 'b';
    textParts.push(createNodeTextPart(textNode.outerHTML, textContent, isBold, d));
  }
  const innerWidth = Math.max(0, ...textParts.map((p) => p.innerWidth));
  return {
    svg: svg,
    parts: textParts,
    innerWidth,
    outerWidth: innerWidth + 2 * d.nodeTextBorder,
  };
}

function createNodeTextPart(
  textElement: string,
  textContent: string,
  isBold: boolean,
  d: NodeTextDimensions,
): NodeTextPart {
  const fontWidth: number = calculateAverageFontCharacterWidth(d.nodeTextFontSize, isBold);
  const innerWidth: number = Math.round(textContent.length * fontWidth);
  const outerWidth: number = innerWidth + 2 * d.nodeTextBorder;
  return {
    svg: textElement,
    text: textContent,
    innerWidth,
    outerWidth,
  };
}

export function createIntermediateNodeText(): NodeText {
  return {
    svg: '',
    parts: [],
    innerWidth: 0,
    outerWidth: 1,
  };
}

export function calculateAverageFontCharacterWidth(fontSize: number, bold?: boolean): number {
  // assuming Inter font https://chrishewett.com/blog/calculating-text-width-programmatically/
  const baseWidthAt100pxSize = 55.4;
  const baseWidthAt100pxSizeBold = 58.6;
  const base = bold ? baseWidthAt100pxSizeBold : baseWidthAt100pxSize;
  return (base / 100) * fontSize;
}

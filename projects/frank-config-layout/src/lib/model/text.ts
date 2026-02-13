/*
   Copyright 2025 WeAreFrank!

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

export interface EdgeText {
  readonly html: string;
  readonly lines: string[];
  readonly numLines: number;
  readonly maxLineLength: number;
}

export interface NodeTextPart {
  readonly name: string;
  readonly text: string;
  readonly innerWidth: number;
  readonly outerWidth: number;
}

export interface NodeText {
  readonly html: string;
  readonly parts: NodeTextPart[];
  readonly innerWidth: number;
  readonly outerWidth: number;
}

export interface ParsedNodeTextDimensions {
  nodeTextBorder: number;
  nodeTextFontSize: number;
}

export function createEmptyEdgeText(): EdgeText {
  return {
    html: '',
    lines: [],
    numLines: 0,
    maxLineLength: 0,
  };
}

export function createEdgeText(originalHtml: string): EdgeText {
  let lines: string[] = [];
  if (originalHtml.length > 0) {
    lines = originalHtml.split('<br/>').map((s) => s.trim());
  }
  let maxLineLength = 0;
  if (lines.length > 0) {
    maxLineLength = Math.max(...lines.map((s) => s.length));
  }
  return {
    html: lines.join('<br/>'),
    lines,
    maxLineLength,
    numLines: lines.length,
  };
}

export function createNodeText(html: string, d: ParsedNodeTextDimensions): NodeText {
  const nodeDOM = new DOMParser().parseFromString(html, 'text/html');
  const nodes = nodeDOM.body.childNodes;
  const textParts: NodeTextPart[] = [];

  // has to be done this way because childNodes doesn't have an iterator
  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const name = node.nodeName.toLowerCase();
    if (name === 'br') continue;
    const isBold: boolean = name === 'b';
    const text = node.textContent ?? '';
    textParts.push(createNodeTextPart(name, text, isBold, d));
  }
  const innerWidth = Math.max(...textParts.map((p) => p.innerWidth));
  return {
    html,
    parts: textParts,
    innerWidth,
    outerWidth: innerWidth + 2 * d.nodeTextBorder,
  };
}

function createNodeTextPart(
  nodeName: string,
  text: string,
  isBold: boolean,
  d: ParsedNodeTextDimensions,
): NodeTextPart {
  const fontWidth: number = calculateAverageFontCharacterWidth(d.nodeTextFontSize, isBold);
  const innerWidth: number = Math.round(text.length * fontWidth);
  const outerWidth: number = innerWidth + 2 * d.nodeTextBorder;
  return {
    name: nodeName,
    text,
    innerWidth,
    outerWidth,
  };
}

export function createIntermediateNodeText(): NodeText {
  return {
    html: '',
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

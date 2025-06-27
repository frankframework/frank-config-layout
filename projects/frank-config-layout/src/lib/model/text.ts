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

export interface EdgeText {
  readonly html: string;
  readonly lines: string[];
  readonly numLines: number;
  readonly maxLineLength: number;
}

export function createEdgeText(originalHtml?: string): EdgeText {
  let lines: string[] = [];
  if (originalHtml !== undefined && originalHtml.length > 0) {
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

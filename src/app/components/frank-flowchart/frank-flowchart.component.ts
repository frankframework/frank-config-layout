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

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  EdgeLabel,
  ERROR_STATUS_ERROR as ERROR_STATUS_ERROR_IMPORTED,
  ERROR_STATUS_MIXED as ERROR_STATUS_MIXED_IMPORTED,
} from 'frank-config-layout';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'app-frank-flowchart',
  templateUrl: './frank-flowchart.component.html',
  styleUrl: './frank-flowchart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrankFlowchartComponent {
  readonly ERROR_STATUS_ERROR = ERROR_STATUS_ERROR_IMPORTED;
  readonly ERROR_STATUS_MIXED = ERROR_STATUS_MIXED_IMPORTED;

  @Input() drawing: Drawing | null = null;
  @Output() shapeClicked: EventEmitter<string> = new EventEmitter();

  scale: string = '100';

  handleShapeClicked(id: string): void {
    this.shapeClicked.emit(id);
  }

  newScale(scale: number): void {
    this.scale = `${Math.round(scale * 100)}`;
  }
}

export interface Drawing {
  width: number;
  height: number;
  rectangles: Rectangle[];
  lines: Line[];
  edgeLabels: EdgeLabel[];
  edgeLabelFontSize: number;
}

export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  text: string;
  selected: boolean;
  errorStatus: number;
}

export interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  selected: boolean;
  arrow: boolean;
  errorStatus: number;
}

export function getEmptyDrawing(): Drawing {
  return {
    width: 0,
    height: 0,
    rectangles: [],
    lines: [],
    edgeLabels: [],
    edgeLabelFontSize: 0,
  };
}

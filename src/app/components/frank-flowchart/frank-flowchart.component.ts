
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-frank-flowchart',
  templateUrl: './frank-flowchart.component.html',
  styleUrl: './frank-flowchart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FrankFlowchartComponent {
  @Input() drawing: Drawing|null = null
  @Output() onShapeClicked: EventEmitter<string> = new EventEmitter()

  scale: string = '100';

  handleShapeClicked(id: string) {
    this.onShapeClicked.emit(id)
  }

  newScale(scale: number) {
    this.scale = '' + Math.round(scale * 100);
  }
}

export interface Drawing {
  width: number
  height: number
  rectangles: Rectangle[]
  lines: Line[]
}

export interface Rectangle {
  id: string
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
  text: string
  selected: boolean
}

export interface Line {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  selected: boolean
  arrow: boolean
  isError: boolean
}

export function getEmptyDrawing(): Drawing {
  return  {
    width: 0,
    height: 0,
    rectangles: [],
    lines: []
  }
}
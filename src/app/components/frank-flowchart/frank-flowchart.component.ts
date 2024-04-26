import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Drawing, SvgGenerator } from '../../graphics/svg-generator';
import $ from 'jquery'

@Component({
  selector: 'app-frank-flowchart',
  templateUrl: './frank-flowchart.component.html',
  styleUrl: './frank-flowchart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FrankFlowchartComponent implements AfterViewInit {
  private svgGenerator = new SvgGenerator()

  private _drawing: Drawing|null = null
  @Input() set drawing(drawing: Drawing|null) {
    this._drawing = drawing
    this.updateSvg()
  }

  ngAfterViewInit(): void {
    this.updateSvg()
  }

  updateSvg() {
    if (this._drawing === null) {
      console.log('updateSvg without drawing, no action')
      return
    }
    console.log('updateSvg with drawing, going to set SVG')
    $(document).ready(() => {
      if ($('#container').length === 0) {
        console.log('#container not found')
      }
      $('#container').html(this.svgGenerator.generateSvg(this._drawing!))
      this._drawing!.rectangles.forEach(rectangle => {
        const rectClass = this.svgGenerator.getNodeGroupClass(rectangle.id)
        $(`.${rectClass}`).trigger('click', () => this.handleShapeClicked(rectangle.id))
      })
      this._drawing!.lines.forEach(line => {
        const lineClass = this.svgGenerator.getEdgeGroupClass(line.id)
        $(`.${lineClass}`).trigger('click', () => this.handleShapeClicked(line.id))
      })
    })
  }

  @Output() onShapeClicked: EventEmitter<string> = new EventEmitter()

  scale: string = '100';

  handleShapeClicked(id: string) {
    this.onShapeClicked.emit(id)
  }

  newScale(scale: number) {
    this.scale = '' + Math.round(scale * 100);
  }
}

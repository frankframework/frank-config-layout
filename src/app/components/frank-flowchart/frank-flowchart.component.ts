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
export class FrankFlowchartComponent {
  private svgGenerator = new SvgGenerator()

  private _drawing: Drawing|null = null
  @Input() set drawing(drawing: Drawing|null) {
    this._drawing = drawing
    this.updateSvg()
  }

  updateSvg() {
    if (this._drawing === null) {
      return
    }
    $(document).ready(() => {
      $('#container').html(this.svgGenerator.generateSvg(this._drawing!))
      this._drawing!.rectangles.forEach(rectangle => {
        const rectClass = this.svgGenerator.getNodeGroupClass(rectangle.id)
        $(`.${rectClass}`).on('click', () => FrankFlowchartComponent.handleShapeClicked(rectangle.id, this))
      })
      this._drawing!.lines.forEach(line => {
        const lineClass = this.svgGenerator.getEdgeGroupClass(line.id)
        $(`.${lineClass}`).on('click', () => FrankFlowchartComponent.handleShapeClicked(line.id, this))
      })
    })
  }

  @Output() onShapeClicked: EventEmitter<string> = new EventEmitter()

  scale: string = '100';

  static handleShapeClicked(id: string, context: FrankFlowchartComponent) {
    console.log(`handleShapeClicked executed with id ${id}`)
    context.onShapeClicked.emit(id)
  }

  newScale(scale: number) {
    this.scale = '' + Math.round(scale * 100);
  }
}

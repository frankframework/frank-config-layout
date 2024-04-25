import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Rectangle, Line, Drawing, SvgGenerator } from '../../graphics/svg-generator';

@Component({
  selector: 'app-frank-flowchart',
  templateUrl: './frank-flowchart.component.html',
  styleUrl: './frank-flowchart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FrankFlowchartComponent implements AfterViewInit {
  constructor(
    private renderer: Renderer2
  ) {}

  private svgGenerator = SvgGenerator.createDynamic(
    (rectangle: Rectangle) => `(click)="handleShapeClicked('${rectangle.id}')"`,
    (line: Line) => `(click)="handleShapeClicked('${line.id}')"`
  )

  @ViewChild('container') private svgContainerElement: ElementRef|null = null

  private _drawing: Drawing|null = null
  @Input() set drawing(drawing: Drawing|null) {
    this._drawing = drawing
    this.updateSvg()
  }

  ngAfterViewInit(): void {
    this.updateSvg()
  }

  updateSvg() {
    if ( (this._drawing !== null) && (this.svgContainerElement !== null) && (this.renderer !== null) ) {
      this.renderer.setProperty(this.svgContainerElement.nativeElement, 'innerHTML', this.svgGenerator.generateSvg(this._drawing))
    }
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

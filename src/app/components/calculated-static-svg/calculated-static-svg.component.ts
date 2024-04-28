import { Component, ElementRef, Input } from '@angular/core';
import { Mermaid2svgService } from '../../services/mermaid2svg.service';

@Component({
  selector: 'app-calculated-static-svg',
  templateUrl: './calculated-static-svg.component.html',
  styleUrl: './calculated-static-svg.component.scss',
})
export class CalculatedStaticSvgComponent {
  constructor(
    private mermaid2svg: Mermaid2svgService,
    private rootElement: ElementRef) {}

  @Input() set mermaid(mermaid: string) {
    if (mermaid.length === 0) {
      this.rootElement.nativeElement.innerHTML = 'No SVG provided'
      return
    }
    let svg: string|null = null
    try {
      svg = this.mermaid2svg.mermaid2svg(mermaid)
    } catch(e) {
      this.rootElement.nativeElement.innerHTML = 'ERROR: ' + (e as Error).message
    }
    if (svg !== null) {
      this.rootElement.nativeElement.innerHTML = svg
    }
  }
}

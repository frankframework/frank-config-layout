import { Component, ElementRef, Input } from '@angular/core';
import { Mermaid2svgService } from '../../services/mermaid2svg.service';

@Component({
  selector: 'app-calculated-static-svg-text',
  templateUrl: './calculated-static-svg-text.component.html',
  styleUrl: './calculated-static-svg-text.component.scss'
})
export class CalculatedStaticSvgTextComponent {
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
      this.rootElement.nativeElement.innerHTML = '<pre><code>' + htmlEscape(svg) + '</code></pre>'
    }
  }
}

function htmlEscape(s: string): string {
  return s.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
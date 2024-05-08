import { Component, ElementRef, Input } from '@angular/core';
import { Mermaid2svgService } from '../../services/mermaid2svg.service';
import { escapeHtml } from '../../util/util';

@Component({
  selector: 'app-calculated-static-svg',
  templateUrl: './calculated-static-svg.component.html',
  styleUrl: './calculated-static-svg.component.scss',
})
export class CalculatedStaticSvgComponent {
  static readonly SHOW_IMAGE = "IMAGE"
  static readonly SHOW_TEXT = "TEXT"

  constructor(
    private mermaid2svg: Mermaid2svgService,
    private rootElement: ElementRef) {}

  private _show: string|null = null
  @Input() set show(show: string) {
    this._show = show
    this.update()
  }

  private _mermaid: string|null = null
  @Input() set mermaid(mermaid: string) {
    this._mermaid = mermaid
    this.update()
  }

  private update() {
    if ((this._show !== null) && (this._mermaid != null)) {
      // This block is not in a separate function, because then we would
      // have to put ! signs for this._show and this._mermaid
      if ([CalculatedStaticSvgComponent.SHOW_TEXT, CalculatedStaticSvgComponent.SHOW_IMAGE].indexOf(this._show) < 0) {
        this.showError(`Invalid input show: ${this._show}`)
        return
      }
      if (this._mermaid.length === 0) {
        this.showNoSvg()
        return
      }
      let svg: string|null = null
      try {
        svg = this.mermaid2svg.mermaid2svg(this._mermaid)
      } catch(e) {
        this.showError((e as Error).message)
      }
      if (svg !== null) {
        this.showSvg(svg)
      }
    }
  }

  showError(msg: string) {
    this.rootElement.nativeElement.innerHTML = 'ERROR: ' + msg
  }

  showNoSvg() {
    this.rootElement.nativeElement.innerHTML = 'No SVG provided'
  }

  showSvg(svg: string) {
    if (this._show === CalculatedStaticSvgComponent.SHOW_TEXT) {
      this.rootElement.nativeElement.innerHTML = '<pre><code>' + escapeHtml(svg) + '</code></pre>'
    } else {
      this.rootElement.nativeElement.innerHTML = svg
    }
  }
}

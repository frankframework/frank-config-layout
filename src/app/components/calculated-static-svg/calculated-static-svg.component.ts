/*
   Copyright 2024, 2025 WeAreFrank!

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

import { Component, ElementRef, Input } from '@angular/core'
import { mermaid2svg } from '../../public.api'

@Component({
  selector: 'app-calculated-static-svg',
  templateUrl: './calculated-static-svg.component.html',
  styleUrl: './calculated-static-svg.component.scss',
})
export class CalculatedStaticSvgComponent {
  static readonly SHOW_IMAGE = "IMAGE"
  static readonly SHOW_TEXT = "TEXT"

  constructor(private rootElement: ElementRef) {
  }

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
      mermaid2svg(this._mermaid)
      .then((svg) => {
        this.showSvg(svg)
      })
      .catch((e) => {
        this.showError((e as Error).message)
      })
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
      this.rootElement.nativeElement.innerHTML = '<pre><code>' + htmlEscape(svg) + '</code></pre>'
    } else {
      this.rootElement.nativeElement.innerHTML = svg
    }
  }
}

function htmlEscape(s: string): string {
  return s.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
} 

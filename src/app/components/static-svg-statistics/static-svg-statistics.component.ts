/*
   Copyright 2024 WeAreFrank!

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

import { ChangeDetectionStrategy, Component, Input, NgZone } from '@angular/core';
import { Mermaid2svgService, Statistics } from '../../services/mermaid2svg.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-static-svg-statistics',
  templateUrl: './static-svg-statistics.component.html',
  styleUrl: './static-svg-statistics.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class StaticSvgStatisticsComponent implements OnInit {
  numNodes: string|null = null
  numEdges: string|null = null
  numVisitsDuringLayerCalculation: string|null = null

  constructor(
    private mermaid2svg: Mermaid2svgService,
    private ngZone: NgZone
  ) {
    this.reset()
  }

  private _mermaid: string|null = null

  private reset() {
    this.numNodes = 'n/a'
    this.numEdges = 'n/a'
    this.numVisitsDuringLayerCalculation = 'n/a'  
  }

  @Input()
  set mermaid(mermaid: string) {
    this._mermaid = mermaid
    this.update()
  }

  ngOnInit(): void {
    this.update()
  }

  private update() {
    if ( (this._mermaid === null) || (this._mermaid.length === 0) ) {
      return
    }
    this.mermaid2svg.mermaid2svgStatistics(this._mermaid!).then((statistics) => {
      this.updateStatistics(statistics)
    }).catch(() => {
      this.reset()
    })
  }

  private updateStatistics(statistics: Statistics) {
    this.ngZone.run(() => {
      this.numNodes = `${statistics.numNodes}`
      this.numEdges = `${statistics.numEdges}`
      this.numVisitsDuringLayerCalculation = `${statistics.numNodeVisitsDuringLayerCalculation}`
    })
  }
}

import { ChangeDetectionStrategy, Component, Input, NgZone } from '@angular/core';
import { Mermaid2svgService, Statistics } from '../../services/mermaid2svg.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-static-svg-statistics',
  standalone: false,
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

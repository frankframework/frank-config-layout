import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FlowChartEditorComponent } from "./components/flow-chart-editor/flow-chart-editor.component";
import { DimensionsEditorComponent } from "./components/dimensions-editor/dimensions-editor.component";
import { FrankFlowchartComponent } from "./components/frank-flowchart/frank-flowchart.component";
import { SequenceEditorComponent } from "./components/sequence-editor/sequence-editor.component";
import { Injectable, NgModule } from "@angular/core";
import { RxPush } from "@rx-angular/template/push";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { RouterModule } from "@angular/router";
import { routes } from "./app.routes";
import { SvgZoomPanDirective } from './directives/svg-zoom-pan.directive'
import { CalculatedStaticSvgComponent } from "./components/calculated-static-svg/calculated-static-svg.component";
import { Mermaid2SvgDimensions, Mermaid2svgService } from "./services/mermaid2svg.service";
import { Dimensions } from "./graphics/edge-layout";
import { StaticSvgStatisticsComponent } from "./components/static-svg-statistics/static-svg-statistics.component";

@Injectable()
export class OurMermaid2SvgDimensions implements Dimensions {
  layerHeight = 50
  layerDistance = 120
  nodeBoxHeight = 40
  intermediateWidth = 60
  nodeWidth = 120
  omittedPlaceholderWidth = 90
  nodeBoxWidth = 110
  boxConnectorAreaPerc = 30
}

@NgModule({
  declarations: [
    AppComponent,
    DimensionsEditorComponent,
    FlowChartEditorComponent,
    FrankFlowchartComponent,
    SequenceEditorComponent,
    SvgZoomPanDirective,
    CalculatedStaticSvgComponent,
    StaticSvgStatisticsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    RxPush,
    DragDropModule
  ],
  // The dimensions for the Mermaid2SvgService are injectable. We could also inject different instances with
  // different dimensions for each component.
  providers: [{provide: Mermaid2SvgDimensions, useClass: OurMermaid2SvgDimensions}, Mermaid2svgService],
  bootstrap: [AppComponent]
})
export class AppModule { }

/*
   Copyright 2024-2025 WeAreFrank!

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
  nodeBoxHeight = 50
  intermediateWidth = 60
  nodeWidth = 175
  omittedPlaceholderWidth = 90
  nodeBoxWidth = 160
  boxConnectorAreaPerc = 50
  intermediateLayerPassedByVerticalLine = false
  edgeLabelFontSize = 10
  preferredVertDistanceFromOrigin = 30
  strictlyKeepLabelOutOfBox = false
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

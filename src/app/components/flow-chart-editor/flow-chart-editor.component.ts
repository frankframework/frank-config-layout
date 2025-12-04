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

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Drawing, Line, Rectangle } from '../frank-flowchart/frank-flowchart.component';
import { CalculatedStaticSvgComponent } from '../calculated-static-svg/calculated-static-svg.component';
import { NodeSequenceEditor } from '../../node-sequence-editor';
import { NodeOrEdgeSelection } from '../../node-or-edge-selection';
import { getCaption, NodeCaptionChoice } from '../../misc';
import {
  getGraphFromMermaid,
  findErrorFlow,
  OriginalGraph,
  LAYERS_FIRST_OCCURING_PATH,
  LAYERS_LONGEST_PATH,
  introduceIntermediateNodesAndEdges,
  calculateLayerNumbers,
  GraphForLayers,
  Dimensions,
  getFactoryDimensions,
  getDerivedEdgeLabelDimensions,
  Layout,
  PlacedNode,
  OriginalGraphReferencingIntermediates,
  LayoutModel,
  LayoutModelBuilder,
  LayoutBuilder,
  getNumCrossingLines,
} from 'frank-config-layout';
import { IntermediatesCreationResult } from 'frank-config-layout';

export interface NodeSequenceEditorOrError {
  model: NodeSequenceEditor | null;
  error: string | null;
}

export interface OriginalGraphOrError {
  graph: OriginalGraph | null;
  error: string | null;
}

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'app-flow-chart-editor',
  templateUrl: './flow-chart-editor.component.html',
  styleUrl: './flow-chart-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FlowChartEditorComponent implements OnInit {
  readonly SHOW_IMAGE = CalculatedStaticSvgComponent.SHOW_IMAGE;
  readonly SHOW_TEXT = CalculatedStaticSvgComponent.SHOW_TEXT;

  readonly layerNumberAlgorithms: { key: number; value: string }[] = [
    { key: LAYERS_FIRST_OCCURING_PATH, value: 'first occuring path' },
    { key: LAYERS_LONGEST_PATH, value: 'longest path' },
  ];

  mermaidText: string = '';
  committedMermaidText = '';
  originalGraph: OriginalGraphReferencingIntermediates | null = null;
  layoutModel: NodeSequenceEditor | null = null;
  selectionInModel: NodeOrEdgeSelection = new NodeOrEdgeSelection();
  showNodeTextInDrawing: boolean = true;
  choiceShowNodeTextInDrawing: NodeCaptionChoice = this.updateShowNodeTextInDrawing();

  ngOnInit(): void {
    this.mermaidText = globalThis.sessionStorage.getItem('mermaidText') ?? '';
    if (this.mermaidText !== '') {
      this.loadMermaid(this.layerNumberAlgorithms[0].key);
    }
  }

  updateShowNodeTextInDrawing(): NodeCaptionChoice {
    if (this.showNodeTextInDrawing) {
      return NodeCaptionChoice.TEXT;
    }
    return NodeCaptionChoice.ID;
  }

  newChoiceShowNodeText(): void {
    if (this.layoutModel === null) {
      return;
    }
    this.showNodeTextInDrawing = !this.showNodeTextInDrawing;
    this.choiceShowNodeTextInDrawing = this.updateShowNodeTextInDrawing();
    if (this.layoutModel !== null) {
      this.updateDrawing();
    }
  }

  dimensions = getFactoryDimensions();
  drawing: Drawing | null = null;
  numCrossingLines: number = 0;

  // In the drawing
  itemClickedSubject: Subject<string> = new Subject<string>();

  onItemClicked(itemClicked: string): void {
    this.itemClickedSubject?.next(itemClicked);
  }

  loadMermaid(algorithm: number): void {
    const graphOrError: OriginalGraphOrError = this.mermaid2graph(this.mermaidText);
    if (graphOrError.error !== null) {
      alert(graphOrError.error);
      return;
    }
    this.loadGraph(graphOrError.graph!, algorithm);
    globalThis.sessionStorage.setItem('mermaidText', this.mermaidText);
  }

  loadGraph(graph: OriginalGraph, algorithm: number): void {
    const modelOrError: NodeSequenceEditorOrError = this.graph2Model(graph, algorithm);
    if (modelOrError.error !== null) {
      alert(modelOrError.error);
      return;
    }
    this.layoutModel = modelOrError.model;
    this.committedMermaidText = this.mermaidText;
    this.updateDrawing();
  }

  mermaid2graph(text: string): OriginalGraphOrError {
    let graph: OriginalGraph;
    try {
      const b = getGraphFromMermaid(text, this.dimensions, this.dimensions);
      graph = findErrorFlow(b);
    } catch (error) {
      return { graph: null, error: `Invalid mermaid text: ${(error as Error).message}` };
    }
    return { graph, error: null };
  }

  graph2Model(graph: OriginalGraph, algorithm: number): NodeSequenceEditorOrError {
    const layerMap: Map<string, number> = calculateLayerNumbers(graph, algorithm);
    let graphWithLayers: GraphForLayers;
    try {
      const intermediates: IntermediatesCreationResult = introduceIntermediateNodesAndEdges(graph, layerMap);
      graphWithLayers = intermediates.intermediate;
      this.originalGraph = intermediates.original;
    } catch (error) {
      alert(`Could not assign layers to nodes: ${error}`);
      return { model: null, error: (error as Error).message };
    }
    return { model: new NodeSequenceEditor(graphWithLayers), error: null };
  }

  onSequenceEditorChanged(): void {
    if (this.layoutModel === null) {
      return;
    }
    this.updateDrawing();
  }

  updateDrawing(): void {
    if (this.layoutModel!.getNumLayers() === 0 || this.layoutModel!.getSequence().length === 0) {
      this.drawing = null;
      return;
    }

    const layout = FlowChartEditorComponent.model2layout(this.layoutModel!, this.dimensions, this.originalGraph!);
    this.numCrossingLines = getNumCrossingLines(layout.layoutLineSegments);
    const rectangles: Rectangle[] = layout.nodes
      .map((n) => n as PlacedNode)
      .map((n) => {
        return {
          id: n.id,
          x: n.horizontalBox.minValue,
          y: n.verticalBox.minValue,
          width: n.horizontalBox.size,
          height: n.verticalBox.size,
          centerX: n.horizontalBox.center,
          centerY: n.verticalBox.center,
          text: getCaption(n, this.choiceShowNodeTextInDrawing),
          selected: this.selectionInModel.isNodeHighlightedInDrawing(n.id, this.layoutModel!),
          errorStatus: n.errorStatus,
        };
      });
    const lines: Line[] = layout.layoutLineSegments.map((lls) => {
      return {
        id: lls.key,
        x1: lls.line.startPoint.x,
        y1: lls.line.startPoint.y,
        x2: lls.line.endPoint.x,
        y2: lls.line.endPoint.y,
        selected: this.selectionInModel.isEdgeHighlightedInDrawing(lls.key, this.layoutModel!),
        arrow: lls.isLastLineSegment,
        errorStatus: lls.errorStatus,
      };
    });
    this.drawing = {
      width: layout.width,
      height: layout.height,
      rectangles,
      lines,
      edgeLabels: layout.edgeLabels,
      edgeLabelFontSize: this.dimensions.edgeLabelFontSize,
    };
  }

  resetMermaid(): void {
    this.mermaidText = '';
    this.loadMermaid(this.layerNumberAlgorithms[0].key);
  }

  static model2layout(
    model: NodeSequenceEditor,
    inDimensions: Dimensions,
    originalGraph: OriginalGraphReferencingIntermediates,
  ): Layout {
    const layoutModel: LayoutModel = new LayoutModelBuilder(model.getShownNodesLayoutBase(), model.graph).run();
    return new LayoutBuilder(
      layoutModel,
      originalGraph,
      inDimensions,
      getDerivedEdgeLabelDimensions(inDimensions),
    ).run();
  }

  onNewDimensions(d: Dimensions): void {
    this.dimensions = d;
    this.updateDrawing();
  }
}

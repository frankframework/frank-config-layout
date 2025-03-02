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

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Drawing, Line, Rectangle } from '../frank-flowchart/frank-flowchart.component'
import { NodeSequenceEditor } from '../../notLibrary/nodeSequenceEditor';
import { NodeOrEdgeSelection } from '../../notLibrary/nodeOrEdgeSelection';
import { Subject } from 'rxjs';
import { CalculatedStaticSvgComponent } from '../calculated-static-svg/calculated-static-svg.component';
import { getCaption, NodeCaptionChoice } from '../../notLibrary/misc';
import { getGraphFromMermaid,
  findErrorFlow, OriginalGraph,
  Edge, LAYERS_FIRST_OCCURING_PATH, LAYERS_LONGEST_PATH,
  assignHorizontalLayerNumbers, calculateLayerNumbers, GraphForLayers,
  Dimensions, getFactoryDimensions,
  NodeLayoutBuilder,
  getDerivedEdgeLabelDimensions,
  Layout, PlacedNode
} from '../../public.api';

export interface NodeSequenceEditorOrError {
  model: NodeSequenceEditor | null
  error: string | null
}

export interface OriginalGraphOrError {
  graph: OriginalGraph | null
  error: string | null
}

@Component({
  selector: 'app-flow-chart-editor',
  templateUrl: './flow-chart-editor.component.html',
  styleUrl: './flow-chart-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class FlowChartEditorComponent {
  readonly SHOW_IMAGE = CalculatedStaticSvgComponent.SHOW_IMAGE
  readonly SHOW_TEXT = CalculatedStaticSvgComponent.SHOW_TEXT

  readonly layerNumberAlgorithms: {key: number, value: string}[] = [
    {key: LAYERS_FIRST_OCCURING_PATH, value: 'first occuring path'},
    {key: LAYERS_LONGEST_PATH, value: 'longest path'}
  ];

  mermaidText: string = ''
  committedMermaidText = ''
  layoutModel: NodeSequenceEditor | null = null
  selectionInModel: NodeOrEdgeSelection = new NodeOrEdgeSelection
  showNodeTextInDrawing: boolean = true
  choiceShowNodeTextInDrawing: NodeCaptionChoice = this.updateShowNodeTextInDrawing()

  updateShowNodeTextInDrawing(): NodeCaptionChoice {
    if (this.showNodeTextInDrawing) {
      return NodeCaptionChoice.TEXT
    }
    return NodeCaptionChoice.ID
  }

  newChoiceShowNodeText() {
    if (this.layoutModel === null) {
      return
    }
    this.showNodeTextInDrawing = ! this.showNodeTextInDrawing
    this.choiceShowNodeTextInDrawing = this.updateShowNodeTextInDrawing()
    if (this.layoutModel !== null) {
      this.updateDrawing()
    }
  }

  dimensions = getFactoryDimensions()
  drawing: Drawing|null = null
  numCrossingLines: number = 0

  // In the drawing
  itemClickedSubject: Subject<string> = new Subject<string>

  onItemClicked(itemClicked: string) {
    this.itemClickedSubject?.next(itemClicked)
  }

  loadMermaid(algorithm: number) {
    const graphOrError: OriginalGraphOrError = this.mermaid2graph(this.mermaidText)
    if (graphOrError.error !== null) {
      alert(graphOrError.error)
      return
    }
    this.loadGraph(graphOrError.graph!, algorithm);
  }

  loadGraph(graph: OriginalGraph, algorithm: number) {
    const modelOrError: NodeSequenceEditorOrError = this.graph2Model(graph, algorithm);
    if (modelOrError.error !== null) {
      alert(modelOrError.error)
      return
    }
    this.layoutModel = modelOrError.model
    this.committedMermaidText = this.mermaidText
    this.updateDrawing()
  }

  mermaid2graph(text: string): OriginalGraphOrError {
    let graph: OriginalGraph
    try {
      const b = getGraphFromMermaid(text)
      graph = findErrorFlow(b)
    } catch(e) {
      return {graph: null, error: 'Invalid mermaid text:' + (e as Error).message}
    }
    return {graph, error: null}
  }

  graph2Model(graph: OriginalGraph, algorithm: number): NodeSequenceEditorOrError {
    const layerMap: Map<string, number> = calculateLayerNumbers(graph, algorithm)
    let graphWithLayers: GraphForLayers
    try {
      graphWithLayers = assignHorizontalLayerNumbers(graph, layerMap)
    } catch(e) {
      alert('Could not assign layers to nodes: ' + e)
      return {model: null, error: (e as Error).message}
    }
    return {model: new NodeSequenceEditor(graphWithLayers), error: null}
  }

  onSequenceEditorChanged() {
    if (this.layoutModel === null) {
      return
    }
    this.updateDrawing()
  }

  updateDrawing() {
    const layout = FlowChartEditorComponent.model2layout(this.layoutModel!, this.dimensions)
    this.numCrossingLines = layout.getNumCrossingLines()
    // TODO: Properly fill selected property
    const rectangles: Rectangle[] = layout.nodes
      .map(n => n as PlacedNode)
      // No box around intermediate node
      .filter(n => ! n.isIntermediate)
      .map(n => { return {
        id: n.id,
        x: n.left, y: n.top, width: n.width, height: n.height, centerX: n.centerX, centerY: n.centerY,
        text: getCaption(n, this.choiceShowNodeTextInDrawing),
        selected: this.selectionInModel.isNodeHighlightedInDrawing(n.id, this.layoutModel!),
        isError: n.isError
      }})
    const lines: Line[] = layout.getLayoutLineSegments()
      .map(lls => { return {
        id: lls.key, x1: lls.line.startPoint.x, y1: lls.line.startPoint.y,
        x2: lls.line.endPoint.x, y2: lls.line.endPoint.y,
        selected: this.selectionInModel.isEdgeHighlightedInDrawing(lls.key, this.layoutModel!),
        arrow: lls.isLastLineSegment,
        isError: lls.isError
      }})
    this.drawing = {
      width: layout.width,
      height: layout.height,
      rectangles,
      lines,
      edgeLabels: layout.edgeLabels,
      edgeLabelFontSize: this.dimensions.edgeLabelFontSize
    }
  }

  static model2layout(model: NodeSequenceEditor, inDimensions: Dimensions): Layout {
    const builder = new NodeLayoutBuilder(
      model.getShownNodesLayoutBase(), model.getGraph() as GraphForLayers, inDimensions)
    const nodeLayout = builder.run()
    return new Layout(nodeLayout, inDimensions, getDerivedEdgeLabelDimensions(inDimensions))
  }

  onNewDimensions(d: Dimensions) {
    this.dimensions = d
    this.updateDrawing()
  }
}

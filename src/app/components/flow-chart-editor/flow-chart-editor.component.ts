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
import { getGraphFromMermaid } from '../../parsing/mermaid-parser';
import { GraphBase, GraphConnectionsDecorator, NodeCaptionChoice, getCaption } from '../../model/graph';
import { categorize } from '../../model/error-flow'
import { calculateLayerNumbers, CreationReason, LayerNumberAlgorithm, NodeSequenceEditorBuilder } from '../../model/horizontalGrouping';
import { NodeSequenceEditor } from '../../model/nodeSequenceEditor';
import { NodeOrEdgeSelection } from '../../model/nodeOrEdgeSelection';
import { NodeLayoutBuilder } from '../../graphics/node-layout';
import { Layout, PlacedNode, Dimensions, EdgeLabel } from '../../graphics/edge-layout';
import { getFactoryDimensions } from '../dimensions-editor/dimensions-editor.component';
import { Subject } from 'rxjs';
import { CalculatedStaticSvgComponent } from '../calculated-static-svg/calculated-static-svg.component';

export interface NodeSequenceEditorOrError {
  model: NodeSequenceEditor | null
  error: string | null
}

export interface GraphConnectionsDecoratorOrError {
  graph: GraphConnectionsDecorator | null
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

  readonly layerNumberAlgorithms: {key: LayerNumberAlgorithm, value: string}[] = [
    {key: LayerNumberAlgorithm.FIRST_OCCURING_PATH, value: 'first occuring path'},
    {key: LayerNumberAlgorithm.LONGEST_PATH, value: 'longest path'}
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

  loadMermaid(algorithm: LayerNumberAlgorithm) {
    const graphOrError: GraphConnectionsDecoratorOrError = this.mermaid2graph(this.mermaidText)
    if (graphOrError.error !== null) {
      alert(graphOrError.error)
      return
    }
    this.loadGraph(graphOrError.graph, algorithm);
  }

  loadGraph(graph: GraphConnectionsDecorator|null, algorithm: LayerNumberAlgorithm) {
    const modelOrError: NodeSequenceEditorOrError = this.graph2Model(graph, algorithm);
    if (modelOrError.error !== null) {
      alert(modelOrError.error)
      return
    }
    this.layoutModel = modelOrError.model
    this.committedMermaidText = this.mermaidText
    this.updateDrawing()
  }

  mermaid2graph(text: string): GraphConnectionsDecoratorOrError {
    let c: GraphBase
    try {
      const b = getGraphFromMermaid(text)
      c = categorize(b)
    } catch(e) {
      return {graph: null, error: 'Invalid mermaid text:' + (e as Error).message}
    }
    return {graph: new GraphConnectionsDecorator(c), error: null}
  }

  graph2Model(graph: GraphConnectionsDecorator|null, algorithm: LayerNumberAlgorithm): NodeSequenceEditorOrError {
    if (!graph) {
      return {model: null, error: 'mermaid was not yet converted to graph when trying to load graph'}
    }
    const layerMap: Map<string, number> = calculateLayerNumbers(graph, algorithm)
    const builder: NodeSequenceEditorBuilder = new NodeSequenceEditorBuilder(layerMap, graph)
    if (builder.orderedOmittedNodes.length > 0) {
      return {model: null, error: 'Could not assign a layer to the following nodes: ' + builder.orderedOmittedNodes.map(n => n.getId()).join(', ')}
    }
    try {
      return {model: builder.build(), error: null}
    } catch(e) {
      console.log(e)
      return {model: null, error: (e as Error).message}
    }
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
    const rectangles: Rectangle[] = layout.getNodes()
      .map(n => n as PlacedNode)
      // No box around intermediate node
      .filter(n => n.creationReason === CreationReason.ORIGINAL)
      .map(n => { return {
        id: n.getId(),
        x: n.left, y: n.top, width: n.width, height: n.height, centerX: n.centerX, centerY: n.centerY,
        text: getCaption(n, this.choiceShowNodeTextInDrawing),
        selected: this.selectionInModel.isNodeHighlightedInDrawing(n.getId(), this.layoutModel!),
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
      edgeLabels: layout.edgeLabels
    }
  }

  static model2layout(model: NodeSequenceEditor, inDimensions: Dimensions): Layout {
    const builder = new NodeLayoutBuilder(
      model.getShownNodesLayoutBase(), model.getGraph(), inDimensions)
    const nodeLayout = builder.run()
    return new Layout(nodeLayout, inDimensions)
  }

  onNewDimensions(d: Dimensions) {
    this.dimensions = d
    this.updateDrawing()
  }
}

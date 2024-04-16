import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Drawing, Line, Rectangle, getEmptyDrawing } from '../frank-flowchart/frank-flowchart.component';
import { getGraphFromMermaid } from '../../parsing/mermaid-parser';
import { GraphBase, GraphConnectionsDecorator, NodeCaptionChoice, getCaption } from '../../model/graph';
import { calculateLayerNumbers, CreationReason, LayerNumberAlgorithm, NodeSequenceEditorBuilder } from '../../model/horizontalGrouping';
import { NodeOrEdgeSelection, NodeSequenceEditor } from '../../model/nodeSequenceEditor';
import { NodeLayoutBuilder } from '../../graphics/node-layout';
import { Layout, PlacedEdge, PlacedNode, Dimensions } from '../../graphics/edge-layout';
import { getFactoryDimensions } from '../dimensions-editor/dimensions-editor.component';
import { Subject } from 'rxjs';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowChartEditorComponent {
  mermaidText: string = ''
  zoomInput: number = 100
  graph: GraphConnectionsDecorator | null = null;
  layoutModel: NodeSequenceEditor | null = null
  selectionInModel: NodeOrEdgeSelection = new NodeOrEdgeSelection
  showNodeTextInDrawing: boolean = true
  choiceShowNodeTextInDrawing: NodeCaptionChoice = this.updateShowNodeTextInDrawing()
  layerNumberAlgorithm: LayerNumberAlgorithm = LayerNumberAlgorithm.LONGEST_PATH;
  layerNumberAlgorithms: {key: LayerNumberAlgorithm, value: string}[] = [
    {key: LayerNumberAlgorithm.LONGEST_PATH, value: 'longest path'},
    {key: LayerNumberAlgorithm.FIRST_OCCURING_PATH, value: 'first occuring path'}
  ];

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
  drawing: Drawing = getEmptyDrawing()
  numCrossingLines: number = 0

  // In the drawing
  itemClickedSubject: Subject<string> = new Subject<string>

  onItemClicked(itemClicked: string) {
    this.itemClickedSubject?.next(itemClicked)
  }

  loadMermaid() {
    const graphOrError: GraphConnectionsDecoratorOrError = FlowChartEditorComponent.mermaid2graph(this.mermaidText)
    if (graphOrError.error !== null) {
      alert(graphOrError.error)
      return
    }
    this.graph = graphOrError.graph
    this.loadGraph();
  }

  loadGraph() {
    const modelOrError: NodeSequenceEditorOrError = this.graph2Model();
    if (modelOrError.error !== null) {
      alert(modelOrError.error)
      return
    }
    this.layoutModel = modelOrError.model
    this.updateDrawing()
  }

  static mermaid2graph(text: string): GraphConnectionsDecoratorOrError {
    let b: GraphBase
    try {
      b = getGraphFromMermaid(text)
    } catch(e) {
      return {graph: null, error: 'Invalid mermaid text:' + (e as Error).message}
    }
    return {graph: new GraphConnectionsDecorator(b), error: null}
  }

  graph2Model(): NodeSequenceEditorOrError {
    if (!this.graph) {
      return {model: null, error: 'mermaid was not yet converted to graph when trying to load graph'}
    }
    const layerMap: Map<string, number> = calculateLayerNumbers(this.graph, this.layerNumberAlgorithm)
    const builder: NodeSequenceEditorBuilder = new NodeSequenceEditorBuilder(layerMap, this.graph)
    if (builder.orderedOmittedNodes.length > 0) {
      return {model: null, error: 'Could not assign a layer to the following nodes: ' + builder.orderedOmittedNodes.map(n => n.getId()).join(', ')}
    }
    return {model: builder.build(), error: null}
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
        id: n.getId(), x: n.left, y: n.top, width: n.width, height: n.height, centerX: n.centerX, centerY: n.centerY,
        text: getCaption(n, this.choiceShowNodeTextInDrawing),
        selected: this.selectionInModel.isNodeHighlightedInDrawing(n.getId(), this.layoutModel!)
      }})
    const lines: Line[] = layout.getEdges()
      .map(edge => edge as PlacedEdge)
      .map(edge => { return {
        id: edge.key, x1: edge.line.startPoint.x, y1: edge.line.startPoint.y,
        x2: edge.line.endPoint.x, y2: edge.line.endPoint.y,
        selected: this.selectionInModel.isEdgeHighlightedInDrawing(edge.getKey(), this.layoutModel!)
      }})
    this.drawing = {width: layout.width, height: layout.height, rectangles, lines}
  }

  static model2layout(model: NodeSequenceEditor, inDimensions: Dimensions): Layout {
    const builder = new NodeLayoutBuilder(model, inDimensions)
    const nodeLayout = builder.run()
    return new Layout(nodeLayout, model, inDimensions)
  }

  onNewDimensions(d: Dimensions) {
    this.dimensions = d
    this.updateDrawing()
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Drawing, Line, Rectangle } from '../frank-flowchart/frank-flowchart.component'
import { getGraphFromMermaid } from '../../parsing/mermaid-parser';
import { GraphBase, GraphConnectionsDecorator, NodeCaptionChoice, getCaption } from '../../model/graph';
import { calculateLayerNumbers, CreationReason, LayerNumberAlgorithm, NodeSequenceEditorBuilder } from '../../model/horizontalGrouping';
import { NodeOrEdgeSelection, NodeSequenceEditor } from '../../model/nodeSequenceEditor';
import { NodeLayoutBuilder } from '../../graphics/node-layout';
import { Layout, PlacedEdge, PlacedNode, Dimensions } from '../../graphics/edge-layout';
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

type node = {id: string, position: number, connectionsDown: string[], connectionsUp: string[]};

@Component({
  selector: 'app-flow-chart-editor',
  templateUrl: './flow-chart-editor.component.html',
  styleUrl: './flow-chart-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  static errorForwardNames = ['exception','failure','fail','timeout','illegalResult','presumedTimeout','interrupt','parserError','outputParserError','outputFailure'];
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
    this.modelCrossingLineReduction()
    this.updateDrawing()
  }

  mermaid2graph(text: string): GraphConnectionsDecoratorOrError {
    let b: GraphBase
    try {
      b = getGraphFromMermaid(text)
    } catch(e) {
      return {graph: null, error: 'Invalid mermaid text:' + (e as Error).message}
    }
    return {graph: new GraphConnectionsDecorator(b), error: null}
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

  modelCrossingLineReduction() {
    if (this.layoutModel === null) return
    const layerCount = this.layoutModel.getNumLayers()
    const layers: node[][] = []
    const nodesById: Record<string, {node: node, layer: number}> = {}
    //populate layers without position for now
    for (let i = 0; i < layerCount; i++) layers[i] = this.layoutModel.getIdsInLayer(i).filter((id): id is string => id !== null).map(id => ({ id, position: 0, connectionsDown: [], connectionsUp: [] }))
    let biggestLayer: number = 0
    layers.forEach((layer, index) => {
      if (layer.length >= biggestLayer) biggestLayer = index
      layer.forEach(node => nodesById[node.id] = {node, layer: index})
    })
    this.layoutModel.getEdges().forEach(edge => {
      const fromId = edge.getFrom().getId()
      const toId = edge.getTo().getId()
      const fromNode = nodesById[fromId]
      const toNode = nodesById[toId]
      const down = fromNode.layer < toNode.layer;
      (down ? fromNode : toNode).node.connectionsDown.push(down ? toId : fromId);
      (down ? toNode : fromNode).node.connectionsUp.push(down ? fromId : toId)
    });

    //set ideal median positions, starting with biggest layer, then going up and down from there
    this.positionByParentsMedian(layers[biggestLayer], null, nodesById)
    this.getRange(biggestLayer, -1).forEach(layerIndex => this.positionByParentsMedian(layers[layerIndex], false, nodesById))
    this.getRange(biggestLayer, layers.length).forEach(layerIndex => this.positionByParentsMedian(layers[layerIndex], true, nodesById))

    let currentCrossingCount = this.countLineCrossings(layers)
    let improved: boolean = true
    let iterationCount = 0
    const mapToLayerOrder = (layers: node[][]) => layers.map(layer => layer.flatMap(node => node.id))
    let lastImprovedOrder: string[][] = mapToLayerOrder(layers)
    const rangeDown = this.getRange(1, layers.length)
    const rangeUp = this.getRange(layers.length - 2, -1)
    while (improved && iterationCount < 100) {
      rangeDown.forEach(layerIndex => this.positionByParentsMedian(layers[layerIndex], true, nodesById))
      rangeUp.forEach(layerIndex => this.positionByParentsMedian(layers[layerIndex], false, nodesById))

      const newCrossingCount = this.countLineCrossings(layers)
      improved = currentCrossingCount > newCrossingCount
      if (improved) {
        lastImprovedOrder = mapToLayerOrder(layers)
        console.log(`iteration ${iterationCount} of median heuristic brought crossing count from ${currentCrossingCount} to ${newCrossingCount}`)
      }
      currentCrossingCount = newCrossingCount
      iterationCount++
    }

    this.smartSwitchHeuristic(layers)
    lastImprovedOrder = mapToLayerOrder(layers)

    lastImprovedOrder.forEach((layerOrder, layerIndex) => this.layoutModel?.setSequenceInLayer(layerIndex, layerOrder))
  }

  positionByParentsMedian(layer: node[], down: boolean|null, nodesById: Record<string, {node: node, layer: number}>) {
    if (down === null) {
      layer.forEach((node, index) => node.position = index)
      return
    }

    layer.forEach(node => {
      const previousPositions: number[] = (down ? node.connectionsUp : node.connectionsDown).map(id => nodesById[id].node.position)
      node.position = this.calcMedian(previousPositions)
    })
    // let lastIdealPosition: number
    //space elements evenly while preserving the new order
    layer.sort((a, b) => a.position - b.position).forEach((node, index) => {
      // const currentIdealPosition = node.position
      node.position = index
      // if (lastIdealPosition === currentIdealPosition) {
      //   //if 2 elements have the same ideal position, check if switching them will reduce crossing lines
      // }
      // lastIdealPosition = currentIdealPosition
    })
  }

  //TODO: if switching 2 nodes doesn't improve crossing line count, then check if switching them would reduce the angle/length of the edges,
  //although this is difficult because the actual coordinates of elements is not at known at this part of the process
  smartSwitchHeuristic(layers: node[][]) {
    layers.forEach((layer, layerIndex) => {
      const previousLayer = layerIndex > 0 ? layers[layerIndex - 1] : undefined
      const nextLayer = layerIndex < layers.length - 1 ? layers[layerIndex + 1] : undefined
      const switchAlgorithm = (left: node, right: node, leftIndex: number, improvementFunction: ((currentCrossings: number, maxCrossings: number) => boolean)) => {
        let totalCrossings = 0
        if (left.id === 'intermediate10') {
          console.log('intermediate10 found')
        }
        if (previousLayer) totalCrossings += this.countCrossing2Nodes(left, right, node => node.connectionsUp, previousLayer)
        if (nextLayer) totalCrossings += this.countCrossing2Nodes(left, right, node => node.connectionsDown, nextLayer)
        const getConnectionCountPerNodeFromSide: (from: node) => Record<string, number> = (from: node) => {
          const result: Record<string, number> = {};
          [...from.connectionsDown, ...from.connectionsUp].forEach(id => result[id] = result[id]||1)
          return result
        }
        const connectionCountPerNodeFromLeft = getConnectionCountPerNodeFromSide(left);
        const connectionCountPerNodeFromRight = getConnectionCountPerNodeFromSide(right);
        const maxCrossingsReduction = Object.entries(connectionCountPerNodeFromLeft).map(([key, value]) => value * connectionCountPerNodeFromRight[key]||0).reduce((prev, curr) => prev + curr)
        const maxCrossings = left.connectionsUp.length * right.connectionsUp.length
            + left.connectionsDown.length * right.connectionsDown.length
            - maxCrossingsReduction
        const improvement = improvementFunction(totalCrossings, maxCrossings)
        if (improvement) {
          layer[leftIndex] = right
          layer[leftIndex + 1] = left
        }
      }
      layer.forEach((left, leftIndex) => {
        if (leftIndex === layer.length - 1) return
        switchAlgorithm(left, layer[leftIndex + 1], leftIndex, (a, b) => a >= b/2)
      })
      this.getRange(layer.length - 1, 0).forEach((rightIndex) => {
        switchAlgorithm(layer[rightIndex - 1], layer[rightIndex], rightIndex - 1, (a, b) => a > b/2)
      })
    })
  }

  calcMedian(positions: number[]) {
    const sorted = positions.sort()
    const amount = positions.length
    const mid = Math.floor(amount/2)
    if (mid*2 !== amount) return sorted[mid]
    return (sorted[mid] + sorted[mid-1]) / 2
  }

  countLineCrossings(layers: node[][]): number {
    let crossings: number = 0
    layers.forEach((layer, layerIndex) => {
      if (layerIndex === layers.length - 1) return
      const nextLayer = layers[layerIndex + 1]
      const crossCountPerNode: Record<string, number> = {}
      nextLayer.forEach(({id}) => crossCountPerNode[id] = 0)
      layer.forEach(node => {
        node.connectionsDown.forEach(targetId => {
          crossings += crossCountPerNode[targetId]
          this.getRange(0, nextLayer.findIndex(({id}) => id === targetId)).forEach(targetNodeIndex => crossCountPerNode[nextLayer[targetNodeIndex].id]++)
        })
      })
    });
    return crossings
  }

  countCrossing2Nodes(left: node, right: node, getConnections: ((node: node) => string[]), adjecentLayer: node[]): number {
    let crossings: number = 0
    const crossCountPerNode: Record<string, number> = {}
    const connectionsLeft = getConnections(left)
    const connectionsRight = getConnections(right)
    const connections = [...connectionsLeft, ...connectionsRight]
    const adjecentLayerFiltered = adjecentLayer.filter(({id}) => connections.includes(id))
    adjecentLayerFiltered.forEach(({id}) => crossCountPerNode[id] = 0)
    connectionsLeft.forEach(targetId => {
      this.getRange(0, adjecentLayerFiltered?.findIndex(({id}) => id === targetId)).forEach(targetNodeIndex => crossCountPerNode[adjecentLayerFiltered[targetNodeIndex].id]++)
    })
    connectionsRight.forEach(targetId => crossings += crossCountPerNode[targetId])
    return crossings
  }

  getRange(startIncl: number, endExcl: number) {
    const offset = Math.min(startIncl, endExcl + 1)
    const arr = Array.from(Array(Math.abs(endExcl - startIncl)).keys()).map(num => num + offset)
    if (endExcl + 1 < startIncl) arr.reverse()
    return arr
  }

  onSequenceEditorChanged() {
    if (this.layoutModel === null) return
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
        styles: [n.originalStyle||'']
      }})
    const lines: Line[] = layout.getEdges()
      .map(edge => edge as PlacedEdge)
      .map(edge => { return {
        id: edge.key, x1: edge.line.startPoint.x, y1: edge.line.startPoint.y,
        x2: edge.line.endPoint.x, y2: edge.line.endPoint.y,
        selected: this.selectionInModel.isEdgeHighlightedInDrawing(edge.getKey(), this.layoutModel!),
        arrow: edge.isLastSegment,
        styles: [FlowChartEditorComponent.errorForwardNames.includes(edge.optionalOriginalText||'success') || edge.getFrom().originalStyle === 'errorOutline' ? 'error' : '']
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

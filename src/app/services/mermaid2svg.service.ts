import { Inject, Injectable, InjectionToken, input } from '@angular/core';
import { Dimensions, Layout } from '../graphics/edge-layout';
import { Graph, GraphBase, GraphConnectionsDecorator } from '../model/graph';
import { getGraphFromMermaid } from '../parsing/mermaid-parser';
import { NodeSequenceEditorBuilder, NodeForEditor, CreationReason, calculateLayerNumbersLongestPath } from '../model/horizontalGrouping';
import { NodeSequenceEditor } from '../model/nodeSequenceEditor';
import { NodeLayoutBuilder } from '../graphics/node-layout';
import { generateSvg } from '../graphics/svg-generator';

export const Mermaid2SvgDimensions = new InjectionToken("Mermaid2SvgDimensions")

@Injectable()
export class Mermaid2svgService {
  constructor(@Inject(Mermaid2SvgDimensions) private dimensions: Dimensions) {}

  // TODO: Cache results
  mermaid2svg(mermaid: string) {
    const b: GraphBase = getGraphFromMermaid(mermaid)
    const g: Graph = new GraphConnectionsDecorator(b)
    const nodeIdToLayer: Map<string, number> = calculateLayerNumbersLongestPath(g)
    const editorBuilder: NodeSequenceEditorBuilder = new NodeSequenceEditorBuilder(nodeIdToLayer, g)
    if (editorBuilder.orderedOmittedNodes.length >= 1) {
      throw new Error(`Probably the start node was part of a cycle; could not assign layer numers to [${editorBuilder.orderedOmittedNodes.map(n => n.getId())}]`)
    }
    let model: NodeSequenceEditor
    try {
      model = editorBuilder.build()
    } catch(e) {
      throw e
    }
    // TODO: Apply some algorithm to have the right sequence in the model
    const nodeLayoutBuiler = new NodeLayoutBuilder(model, this.dimensions)
    const nodeLayout = nodeLayoutBuiler.run()
    const layout = new Layout(nodeLayout, model, this.dimensions)
    return generateSvg(layout)
  }
}

import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Dimensions, Layout } from '../graphics/edge-layout';
import { Graph, GraphBase, GraphConnectionsDecorator } from '../model/graph';
import { getGraphFromMermaid } from '../parsing/mermaid-parser';
import { NodeSequenceEditorBuilder, calculateLayerNumbersLongestPath } from '../model/horizontalGrouping';
import { NodeSequenceEditor } from '../model/nodeSequenceEditor';
import { NodeLayoutBuilder } from '../graphics/node-layout';
import { generateSvg } from '../graphics/svg-generator';
import { AsynchronousCache } from '../util/asynchronousCache';
import { sha256 } from '../util/hash';

export const Mermaid2SvgDimensions = new InjectionToken("Mermaid2SvgDimensions")

export interface Statistics {
  svg: string,
  numNodes: number,
  numEdges: number,
  numNodeVisitsDuringLayerCalculation: number
}

@Injectable()
export class Mermaid2svgService {
  private cache = new AsynchronousCache<Statistics>()

  private _numSvgCalculations = 0
  get numSvgCalculations() {
    return this._numSvgCalculations
  }

  getHashes() {
    return [ ... this.cache.getSortedKeys() ]
  }

  constructor(@Inject(Mermaid2SvgDimensions) private dimensions: Dimensions) {}

  async mermaid2svg(mermaid: string): Promise<string> {
    return (await this.mermaid2svgStatistics(mermaid)).svg
  }

  async mermaid2svgStatistics(mermaid: string): Promise<Statistics> {
    let hash: string
    try {
      hash = await sha256(mermaid)
    } catch(e) {
      console.log(e)
      throw new Error('Could not calculate hash')
    }
    return await this.cache.get(hash, () => this.mermaid2svgStatisticsImpl(mermaid))
  }

  // TODO: Cache results
  private async mermaid2svgStatisticsImpl(mermaid: string): Promise<Statistics> {
    ++this._numSvgCalculations
    const b: GraphBase = getGraphFromMermaid(mermaid)
    const g: Graph = new GraphConnectionsDecorator(b)
    let numNodeVisits = 0
    const nodeIdToLayer: Map<string, number> = calculateLayerNumbersLongestPath(g, () => ++numNodeVisits)
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
    return {
      svg: generateSvg(layout),
      numNodes: g.getNodes().length,
      numEdges: g.getEdges().length,
      numNodeVisitsDuringLayerCalculation: numNodeVisits
    }
  }
}

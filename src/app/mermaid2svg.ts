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

import { Layout } from './graphics/edge-layout';
import { Graph, GraphBase, GraphConnectionsDecorator } from './model/graph';
import { categorize } from './model/error-flow'
import { getGraphFromMermaid } from './parsing/mermaid-parser';
import { NodeSequenceEditorBuilder, calculateLayerNumbersLongestPath } from './model/horizontalGrouping';
import { LayoutBase, minimizeNumCrossings } from './model/layoutBase'
import { NodeLayoutBuilder } from './graphics/node-layout';
import { generateSvg } from './graphics/svg-generator';
import { AsynchronousCache } from './util/asynchronousCache';
import { sha256 } from './util/hash';
import { getDerivedEdgeLabelDimensions } from './graphics/edge-label-layouter';
import { SvgResult, Dimensions } from './public.api'

export class Mermaid2svgService {
  private cache = new AsynchronousCache<SvgResult>()

  private _numSvgCalculations = 0
  get numSvgCalculations() {
    return this._numSvgCalculations
  }

  getHashes() {
    return [ ... this.cache.getSortedKeys() ]
  }

  constructor(private dimensions: Dimensions) {}

  async mermaid2svg(mermaid: string): Promise<string> {
    return (await this.mermaid2svgStatistics(mermaid)).svg
  }

  async mermaid2svgStatistics(mermaid: string): Promise<SvgResult> {
    let hash: string
    try {
      hash = await sha256(mermaid)
    } catch(e) {
      console.log(e)
      throw new Error('Could not calculate hash')
    }
    return await this.cache.get(hash, () => this.mermaid2svgStatisticsImpl(mermaid))
  }

  private async mermaid2svgStatisticsImpl(mermaid: string): Promise<SvgResult> {
    ++this._numSvgCalculations
    const b: GraphBase = getGraphFromMermaid(mermaid)
    const c = categorize(b)
    const g: Graph = new GraphConnectionsDecorator(c)
    let numNodeVisits = 0
    const nodeIdToLayer: Map<string, number> = calculateLayerNumbersLongestPath(g, () => ++numNodeVisits)
    const editorBuilder: NodeSequenceEditorBuilder = new NodeSequenceEditorBuilder(nodeIdToLayer, g)
    if (editorBuilder.orderedOmittedNodes.length >= 1) {
      throw new Error(`Probably the start node was part of a cycle; could not assign layer numers to [${editorBuilder.orderedOmittedNodes.map(n => n.getId())}]`)
    }
    let lb: LayoutBase
    const numLayers = Math.max( ... editorBuilder.nodeIdToLayer.values()) + 1
    const graphWithIntermediateNodes = new GraphConnectionsDecorator(editorBuilder.graph)
    try {
      lb = LayoutBase.create(editorBuilder.graph.getNodes().map(n => n.getId()!),
        graphWithIntermediateNodes,
        editorBuilder.nodeIdToLayer,
        numLayers)
    } catch(e) {
      throw e
    }
    lb = minimizeNumCrossings(lb)
    const nodeLayoutBuiler = new NodeLayoutBuilder(lb, graphWithIntermediateNodes, this.dimensions)
    const nodeLayout = nodeLayoutBuiler.run()
    const layout = new Layout(nodeLayout, this.dimensions, getDerivedEdgeLabelDimensions(this.dimensions))
    return {
      svg: generateSvg(layout, this.dimensions.edgeLabelFontSize),
      numNodes: g.getNodes().length,
      numEdges: g.getEdges().length,
      numNodeVisitsDuringLayerCalculation: numNodeVisits
    }
  }
}

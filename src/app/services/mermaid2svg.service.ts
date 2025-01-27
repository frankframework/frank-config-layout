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

import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Dimensions, Layout } from '../graphics/edge-layout';
import { Graph, GraphBase, GraphConnectionsDecorator } from '../model/graph';
import { categorize } from '../model/error-flow'
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
      throw new Error('Could not calculate hash')
    }
    return await this.cache.get(hash, () => this.mermaid2svgStatisticsImpl(mermaid))
  }

  private async mermaid2svgStatisticsImpl(mermaid: string): Promise<Statistics> {
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
    let model: NodeSequenceEditor
    try {
      model = editorBuilder.build()
    } catch(e) {
      throw e
    }
    // TODO: Skip creating NodeSequenceEditor and apply some algorith
    // to the LayoutBase before continuing.
    const nodeLayoutBuiler = new NodeLayoutBuilder(model.getShownNodesLayoutBase(), model.getGraph(), this.dimensions)
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

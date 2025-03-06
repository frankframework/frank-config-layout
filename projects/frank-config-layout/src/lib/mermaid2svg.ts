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
import { getGraphFromMermaid, MermaidGraph } from './parsing/mermaid-parser';
import { LayoutBase, minimizeNumCrossings } from './model/layoutBase';
import { NodeLayoutBuilder } from './graphics/node-layout';
import { generateSvg } from './graphics/svg-generator';
import { AsynchronousCache } from './util/asynchronous-cache';
import { sha256 } from './util/hash';
import { getDerivedEdgeLabelDimensions } from './graphics/edge-label-layouter';
import { findErrorFlow, OriginalGraph } from './model/error-flow';
import {
  introduceIntermediateNodesAndEdges,
  calculateLayerNumbersLongestPath,
  GraphForLayers,
} from './model/horizontal-grouping';
import { SvgResult, Dimensions } from '../public_api';

export class Mermaid2svgService {
  private cache = new AsynchronousCache<SvgResult>();

  private _numSvgCalculations = 0;
  get numSvgCalculations(): number {
    return this._numSvgCalculations;
  }

  getHashes(): string[] {
    return [...this.cache.getSortedKeys()];
  }

  constructor(private dimensions: Dimensions) {}

  async mermaid2svg(mermaid: string): Promise<string> {
    const statistics = await this.mermaid2svgStatistics(mermaid);
    return statistics.svg;
  }

  async mermaid2svgStatistics(mermaid: string): Promise<SvgResult> {
    let hash: string;
    try {
      hash = await sha256(mermaid);
    } catch (error) {
      console.log(error);
      throw new Error('Could not calculate hash');
    }
    return await this.cache.get(hash, () => this.mermaid2svgStatisticsImpl(mermaid));
  }

  private async mermaid2svgStatisticsImpl(mermaid: string): Promise<SvgResult> {
    ++this._numSvgCalculations;
    const b: MermaidGraph = getGraphFromMermaid(mermaid);
    const g: OriginalGraph = findErrorFlow(b);
    let numNodeVisits = 0;
    const nodeIdToLayer: Map<string, number> = calculateLayerNumbersLongestPath(g, () => ++numNodeVisits);
    const gl: GraphForLayers = introduceIntermediateNodesAndEdges(g, nodeIdToLayer);
    let lb: LayoutBase;
    const numLayers = Math.max(...gl.nodes.map((n) => n.layer)) + 1;
    try {
      lb = LayoutBase.create(
        gl.nodes.map((n) => n.id),
        gl,
        numLayers,
      );
    } catch (error) {
      throw error;
    }
    lb = minimizeNumCrossings(lb);
    const nodeLayoutBuiler = new NodeLayoutBuilder(lb, gl, this.dimensions);
    const nodeLayout = nodeLayoutBuiler.run();
    const layout = new Layout(nodeLayout, this.dimensions, getDerivedEdgeLabelDimensions(this.dimensions));
    return {
      svg: generateSvg(layout, this.dimensions.edgeLabelFontSize),
      numNodes: g.nodes.length,
      numEdges: g.edges.length,
      numNodeVisitsDuringLayerCalculation: numNodeVisits,
    };
  }
}

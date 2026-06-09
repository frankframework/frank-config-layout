/*
   Copyright 2024-2026 WeAreFrank!

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

import { LayoutBuilder, Layout } from './graphics/layout';
import { getGraphFromFlow, FlowGraph } from './parsing/flowcode-parser';
import { LayoutBase, minimizeNumCrossings } from './model/layout-base';
import { generateSvg } from './graphics/svg-generator';
import { AsynchronousCache } from './util/asynchronous-cache';
import { sha256 } from './util/hash';
import { findErrorFlow, OriginalGraph } from './model/error-flow';
import {
  introduceIntermediateNodesAndEdges,
  calculateLayerNumbersLongestPath,
  IntermediatesCreationResult,
} from './model/horizontal-grouping';
import { LayoutModel, LayoutModelBuilder } from './model/layout-model';
import { DerivedDimensions, Dimensions, getDerivedDimensions } from './dimensions';

export interface LayoutStatisticsResult {
  layout: Layout;
  numNodes: number;
  numEdges: number;
  numNodeVisitsDuringLayerCalculation: number;
}

export class FlowLayoutService {
  private cache = new AsynchronousCache<LayoutStatisticsResult>();

  private _numSvgCalculations = 0;
  get numSvgCalculations(): number {
    return this._numSvgCalculations;
  }

  getHashes(): string[] {
    return this.cache.getSortedKeys();
  }

  private readonly dimensions: DerivedDimensions;

  constructor(dimensions: Dimensions) {
    this.dimensions = getDerivedDimensions(dimensions);
  }

  async flow2svg(flow: string): Promise<string> {
    const statistics = await this.flow2LayoutStatistics(flow);
    return generateSvg(statistics.layout, this.dimensions);
  }

  async flow2Layout(flow: string): Promise<Layout> {
    const statistics = await this.flow2LayoutStatistics(flow);
    return statistics.layout;
  }

  async flow2LayoutStatistics(flow: string): Promise<LayoutStatisticsResult> {
    try {
      const hash = await sha256(flow);
      return this.cache.get(hash, () => this.flow2LayoutStatisticsImpl(flow));
    } catch (error) {
      throw new Error('Could not calculate hash', error as Error);
    }
  }

  private async flow2LayoutStatisticsImpl(flow: string): Promise<LayoutStatisticsResult> {
    ++this._numSvgCalculations;
    const flowGraph: FlowGraph = getGraphFromFlow(flow, this.dimensions);
    const graph: OriginalGraph = findErrorFlow(flowGraph);
    let numNodeVisits = 0;
    const nodeIdToLayer: Map<string, number> = calculateLayerNumbersLongestPath(graph, () => ++numNodeVisits);
    const intermediates: IntermediatesCreationResult = introduceIntermediateNodesAndEdges(graph, nodeIdToLayer);
    const layoutBase = LayoutBase.create(
      intermediates.intermediate.nodes.map((n) => n.id),
      intermediates.intermediate,
    );
    const layoutModel: LayoutModel = new LayoutModelBuilder(
      minimizeNumCrossings(layoutBase),
      intermediates.intermediate,
    ).run();
    const layout: Layout = new LayoutBuilder(
      layoutModel,
      intermediates.original,
      this.dimensions,
      this.dimensions,
    ).run();
    return {
      layout,
      numNodes: graph.nodes.length,
      numEdges: graph.edges.length,
      numNodeVisitsDuringLayerCalculation: numNodeVisits,
    };
  }
}

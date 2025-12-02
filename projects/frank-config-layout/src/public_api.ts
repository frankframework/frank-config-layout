/* eslint-disable unicorn/filename-case */

/*
   Copyright 2025 WeAreFrank!

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

import { EdgeLabelDimensions } from './lib/graphics/edge-label-layouter';
import { NodeAndEdgeDimensions } from './lib/graphics/layout';
import { Mermaid2svgService } from './lib/mermaid2svg';
import { NodeTextDimensions } from './lib/model/text';

export interface Dimensions extends NodeTextDimensions, NodeAndEdgeDimensions, EdgeLabelDimensions {}

/*
 * These are the real outputs of this library
 */

export interface SvgResult {
  svg: string;
  numNodes: number;
  numEdges: number;
  numNodeVisitsDuringLayerCalculation: number;
}

let service: Mermaid2svgService | null = null;

export function initMermaid2Svg(d: Dimensions): void {
  // In production, do not initialize more than once.
  // The playground has to call this function any time
  // there are new dimensions.
  service = new Mermaid2svgService(d);
}

export function getFactoryDimensions(): Dimensions {
  return {
    nodeTextFontSize: 16,
    nodeTextBorder: 4,
    layerHeight: 50,
    layerDistance: 120,
    nodeBoxHeight: 50,
    intermediateWidth: 60,
    horizontalNodeBorder: 15,
    boxConnectorAreaPerc: 50,
    intermediateLayerPassedByVerticalLine: true,
    lineTransgressionPerc: 200,
    boxCrossProtectionMargin: 5,
    edgeLabelFontSize: 10,
    preferredVertDistanceFromOrigin: 30,
    strictlyKeepLabelOutOfBox: true,
  };
}

export function isMermaid2SvgInitialized(): boolean {
  return service !== null;
}

export async function mermaid2svg(mermaid: string): Promise<string> {
  if (service === null) {
    throw new Error('Mermaid2Svg was not initialized');
  }
  const statistics = await service.mermaid2svgStatistics(mermaid);
  return statistics.svg;
}

export async function mermaid2svgStatistics(mermaid: string): Promise<SvgResult> {
  if (service === null) {
    throw new Error('Mermaid2Svg was not initialized');
  }
  return await service.mermaid2svgStatistics(mermaid);
}

/*
 * These are needed for the playground, but they are not
 * the intended outputs of the library.
 */

export { getRange, rotateToSwapItems, permutationFrom } from './lib/util/util';
export { getKey } from './lib/model/graph';
export {
  EdgeText as Text,
  createEdgeText as createText,
  createIntermediateNodeText as createDummyNodeText,
} from './lib/model/text';
export { getGraphFromMermaid } from './lib/parsing/mermaid-parser';
export {
  findErrorFlow,
  OriginalGraph,
  ERROR_STATUS_SUCCESS,
  ERROR_STATUS_MIXED,
  ERROR_STATUS_ERROR,
} from './lib/model/error-flow';
export {
  LAYERS_FIRST_OCCURING_PATH,
  LAYERS_LONGEST_PATH,
  PASS_DIRECTION_DOWN,
  introduceIntermediateNodesAndEdges,
  calculateLayerNumbers,
  createGraphForLayers,
  OriginalGraphReferencingIntermediates,
  IntermediatesCreationResult,
  NodeForLayers,
  EdgeForLayers,
  GraphForLayers,
  NodeOrEdgeForLayers,
  OptionalNodeForLayers,
  OptionalEdgeForLayers,
} from './lib/model/horizontal-grouping';
export {
  LayoutBase,
  getNumCrossings,
  alignFromLayer,
  calculateNumCrossingsChangesFromAligning,
  minimizeNumCrossings,
} from './lib/model/layout-base';
export { getDerivedEdgeLabelDimensions } from './lib/graphics/edge-label-layouter';
export { LayoutModel, LayoutModelBuilder } from './lib/model/layout-model';
export { LayoutBuilder, Layout, PlacedNode, EdgeLabel, getNumCrossingLines } from './lib/graphics/layout';

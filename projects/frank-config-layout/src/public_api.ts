/* eslint-disable unicorn/filename-case */

/*
   Copyright 2025, 2026 WeAreFrank!

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

import { FlowLayoutService } from './lib/flow-layout';
import { Dimensions } from './lib/dimensions';

/*
 * These are the real outputs of this library
 */

let service: FlowLayoutService | null = null;

export function initFlow2Svg(dimensions: Dimensions): FlowLayoutService {
  // In production, do not initialize more than once.
  // The playground has to call this function any time
  // there are new dimensions.
  if (!service) service = new FlowLayoutService(dimensions);
  return service;
}

export function getFactoryDimensions(): Dimensions {
  return {
    nodeTextFontSize: 16,
    nodeTextBorder: 12,
    layerHeight: 60,
    layerDistance: 120,
    nodeBoxHeight: 54,
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

/*
 * These are needed for the playground, but they are not
 * the intended outputs of the library.
 */

export { getRange, rotateToSwapItems, permutationFrom } from './lib/util/util';
export { getKey, keyFor } from './lib/model/graph';
export {
  EdgeText as Text,
  createEmptyEdgeText as createText,
  createIntermediateNodeText as createDummyNodeText,
} from './lib/model/text';
export { getGraphFromFlow } from './lib/parsing/flowcode-parser';
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
export { getDerivedDimensions, DerivedDimensions, Dimensions } from './lib/dimensions';
export { LayoutModel, LayoutModelBuilder } from './lib/model/layout-model';
export { LayoutBuilder, Layout, PlacedNode, EdgeLabel, getNumCrossingLines } from './lib/graphics/layout';
export type { FlowLayoutService, LayoutStatisticsResult } from './lib/flow-layout';

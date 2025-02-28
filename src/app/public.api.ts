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

import { EdgeLabelDimensions } from './graphics/edge-label-layouter'
import { NodeAndEdgeDimensions } from './graphics/edge-layout'
import { Mermaid2svgService } from './mermaid2svg'

export interface Dimensions extends NodeAndEdgeDimensions, EdgeLabelDimensions {
}

/*
 * These are the real outputs of this library
 */

export interface SvgResult {
  svg: string,
  numNodes: number,
  numEdges: number,
  numNodeVisitsDuringLayerCalculation: number
}

let service: Mermaid2svgService | null = null

export function initMermaid2Svg(d: Dimensions) {
  if (service !== null) {
    throw new Error('Cannot initialize Mermaid2Svg more than once')
  }
  service = new Mermaid2svgService(d)
}

export function getFactoryDimensions(): Dimensions {
  return {
    layerHeight: 50,
    layerDistance: 120,
    nodeBoxHeight: 50,
    intermediateWidth: 60,
    nodeWidth: 175,
    omittedPlaceholderWidth: 90,
    nodeBoxWidth: 160,
    boxConnectorAreaPerc: 50,
    intermediateLayerPassedByVerticalLine: false,
    edgeLabelFontSize: 10,
    preferredVertDistanceFromOrigin: 30,
    strictlyKeepLabelOutOfBox: false
  }
}

export function isMermaid2SvgInitialized(): boolean {
  return service !== null
}

export async function mermaid2svg(mermaid: string): Promise<string> {
  if (service === null) {
    throw new Error('Mermaid2Svg was not initialized')
  }
  return (await service.mermaid2svgStatistics(mermaid)).svg
}

export async function mermaid2svgStatistics(mermaid: string): Promise<SvgResult> {
  if (service === null) {
    throw new Error('Mermaid2Svg was not initialized')
  }
  return (await service.mermaid2svgStatistics(mermaid))
}

/*
 * These are needed for the playground, but they are not
 * the intended outputs of the library.
 */

export interface Text {
  readonly html: string
  readonly lines: string[]
  readonly numLines: number
  readonly maxLineLength: number
}

interface Node {
  readonly id: string
  readonly text: string
  readonly layer: number
  readonly isIntermediate: boolean
}

interface Edge {
  readonly from: Node
  readonly to: Node
  readonly key: string
  readonly text?: Text
}
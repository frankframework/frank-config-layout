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
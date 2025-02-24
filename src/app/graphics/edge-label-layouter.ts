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

import { NumbersAroundZero } from '../util/util'
import { Interval } from "../util/interval"
import { Line, Point } from "./graphics"

export interface EdgeLabelDimensions {
  edgeLabelFontSize: number
  preferredVertDistanceFromOrigin: number
  strictlyKeepLabelOutOfBox: boolean
}

export interface DerivedEdgeLabelDimensions {
  estCharacterWidth: number
  estLabelLineHeight: number
  preferredVertDistanceFromOrigin: number
  strictlyKeepLabelOutOfBox: boolean
}

export function getDerivedEdgeLabelDimensions(d: EdgeLabelDimensions) {
  return {
    estCharacterWidth: d.edgeLabelFontSize - 3,
    estLabelLineHeight: d.edgeLabelFontSize + 3,
    preferredVertDistanceFromOrigin: d.preferredVertDistanceFromOrigin,
    strictlyKeepLabelOutOfBox: d.strictlyKeepLabelOutOfBox
  }
}

export interface Box {
  readonly horizontalBox: Interval
  readonly verticalBox: Interval
}

export class EdgeLabelLayouter {
  private boxes: Box[] = []

  constructor(readonly derivedDimensions: DerivedEdgeLabelDimensions) {
  }

  add(line: Line, textWidth: number, numTextLines: number): Box {
    const vdistSources = new NumbersAroundZero()
    while (true) {
      const vdistSource: number = vdistSources.next()
      const vdist: number = this.derivedDimensions.preferredVertDistanceFromOrigin
        + vdistSource * (this.derivedDimensions.estLabelLineHeight)
      // Do not put the label in box from which the edge originates
      if (vdist <= 0) {
        continue
      }
      const candidateCenter: Point = this.pointAt(vdist, line)
      const candidateBox: Box = {
        horizontalBox: Interval.createFromCenterSize(candidateCenter.x, textWidth),
        verticalBox: Interval.createFromCenterSize(candidateCenter.y, numTextLines * this.derivedDimensions.estLabelLineHeight)}
      if (this.derivedDimensions.strictlyKeepLabelOutOfBox) {
        // If line goes down, the node box is above the line
        if (line.startPoint.y <= line.endPoint.y) {
          if (candidateBox.verticalBox.minValue < line.startPoint.y) {
            continue
          }
        // If line goes up, the node box is below the line
        } else {
          if (candidateBox.verticalBox.maxValue > line.startPoint.y) {
            continue
          }
        }
      }
      let isSpaceOccupied: boolean = false
      for (const existingBox of this.boxes) {
        if (this.boxesIntersect(candidateBox, existingBox)) {
          isSpaceOccupied = true
          break
        }
      }
      if (isSpaceOccupied) {
        continue
      }
      this.boxes.push(candidateBox)
      return candidateBox
    }
  }

  private pointAt(vdist: number, line: Line): Point {
    if (line.endPoint.y > line.startPoint.y) {
      const yspan = line.endPoint.y - line.startPoint.y
      const y = line.startPoint.y + vdist
      const ratio = vdist / yspan
      const x = Math.round(line.startPoint.x + ratio * (line.endPoint.x - line.startPoint.x))
      return new Point(x, y)
    } else if (line.endPoint.y < line.startPoint.y) {
      const yspan = line.startPoint.y - line.endPoint.y
      const y = line.startPoint.y - vdist
      const ratio = vdist / yspan
      const x = Math.round(line.startPoint.x + ratio * (line.endPoint.x - line.startPoint.x))
      return new Point(x, y)
    } else {
      throw new Error('Cannot map edge labels on horizontal line')
    }
  }

  private boxesIntersect(first: Box, second: Box) {
    const x_intersection: Interval | null = first.horizontalBox.toIntersected(second.horizontalBox)
    const y_intersection: Interval | null = first.verticalBox.toIntersected(second.verticalBox)
    return (x_intersection !== null) && (y_intersection !== null)
  }
}

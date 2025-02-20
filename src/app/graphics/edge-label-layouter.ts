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
  estCharacterWidth: number
  estLabelHeight: number
  preferredVertDistanceFromOrigin: number
}

interface Box {
  xspan: Interval
  yspan: Interval
}

const MARGIN = 2

export class EdgeLabelLayouter {
  private boxes: Box[] = []

  constructor(readonly dimensions: EdgeLabelDimensions) {
  }

  add(line: Line, textWidth: number): Point {
    const vdistSources = new NumbersAroundZero()
    while (true) {
      const vdistSource: number = vdistSources.next()
      const vdist: number = this.dimensions.preferredVertDistanceFromOrigin + vdistSource * (this.dimensions.estLabelHeight + MARGIN)
      // Do not put the label in box from which the edge originates
      if (vdist <= 0) {
        continue
      }
      const candidate: Point = this.pointAt(vdist, line)
      const candidateBox: Box = {
        xspan: Interval.createFromCenterSize(candidate.x, textWidth),
        yspan: Interval.createFromCenterSize(candidate.y, this.dimensions.estLabelHeight)}
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
      return candidate
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
    const x_intersection: Interval | null = first.xspan.toIntersected(second.xspan)
    const y_intersection: Interval | null = first.yspan.toIntersected(second.yspan)
    return (x_intersection !== null) && (y_intersection !== null)
  }
}

import { NumbersAroundZero } from '../util/util'
import { Interval } from "../util/interval"
import { Line, Point } from "./graphics"

export interface EdgeLabelDimensions {
  estLabelWidth: number
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

  add(line: Line): Point {
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
        xspan: Interval.createFromCenterSize(candidate.x, this.dimensions.estLabelWidth),
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
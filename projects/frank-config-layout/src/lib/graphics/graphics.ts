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

export enum LineRelation {
  UNRELATED = 'Unrelated',
  CROSS = 'Cross',
}

export function relateLines(line1: Line, line2: Line): LineRelation {
  let shortest: Line;
  let longest: Line;
  if (line1.getSquaredLength() < line2.getSquaredLength()) {
    shortest = line1;
    longest = line2;
  } else {
    shortest = line2;
    longest = line1;
  }
  // We transform both lines the same way such that the
  // longest line is mapped an interval on the x-axis
  // that starts in the origin.
  const rotateVector = longest.endPoint.subtract(longest.startPoint);
  const translatedShortest = shortest.subtract(longest.startPoint);
  const rotatedStart = rotateVector.rotateOtherBackAndMultiplyByMyLength(translatedShortest.startPoint);
  const rotatedEnd = rotateVector.rotateOtherBackAndMultiplyByMyLength(translatedShortest.endPoint);
  const rotated = new Line(rotatedStart, rotatedEnd);
  return rotated.relateToHorizontalLine(rotateVector.getSquaredVectorLength());
}

export class Point {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  equals(other: Point): boolean {
    return this.x == other.x && this.y == other.y;
  }

  rotateOtherBackAndMultiplyByMyLength(other: Point): Point {
    const newX = this.x * other.x + this.y * other.y;
    const newY = -this.y * other.x + this.x * other.y;
    return new Point(newX, newY);
  }

  subtract(other: Point): Point {
    const newX = this.x - other.x;
    const newY = this.y - other.y;
    return new Point(newX, newY);
  }

  getSquaredVectorLength(): number {
    return this.x * this.x + this.y * this.y;
  }
}

export class Line {
  constructor(
    readonly startPoint: Point,
    readonly endPoint: Point,
  ) {}

  subtract(other: Point): Line {
    const newStart = this.startPoint.subtract(other);
    const newEnd = this.endPoint.subtract(other);
    return new Line(newStart, newEnd);
  }

  getSquaredLength(): number {
    return this.endPoint.subtract(this.startPoint).getSquaredVectorLength();
  }

  // Undefined behavior when touches or coincides
  relateToHorizontalLine(refLength: number): LineRelation {
    if (this.getSquaredLength() < LINE_LENGTH_DEGENERATE_THRESHOLD) {
      throw new Error(`Degenerate line segment ${JSON.stringify(this)}, squared length is ${this.getSquaredLength()}`);
    }
    let first: Point;
    let second: Point;
    if (this.startPoint.x > this.endPoint.x) {
      first = this.endPoint;
      second = this.startPoint;
    } else {
      first = this.startPoint;
      second = this.endPoint;
    }
    if (second.x < 0 || first.x > refLength) {
      return LineRelation.UNRELATED;
    }
    if (Math.abs(second.x - first.x) < EPS) {
      // The calculation would be numerically more precise if we do
      // this test also if first.x and second.x are not close.
      // But that way it is harder to make up test cases.
      if (first.x >= 0 && second.x <= refLength) {
        return this.compareYValues(first.y, second.y);
      } else {
        // Corner case. The x-coordinates are close to each other and close
        // to the reference interval boundaries, but they are not within
        // the interval. We say unrelated
        return LineRelation.UNRELATED;
      }
    }
    const startXWindow = Math.max(0, first.x); // Between 0 and refLength
    const endXWindow = Math.min(refLength, second.x); // Between refLenth and 0
    const relDistanceStart = (startXWindow - first.x) / (second.x - first.x);
    const relDistanceEnd = (endXWindow - first.x) / (second.x - first.x);
    const startY = first.y + relDistanceStart * (second.y - first.y);
    const endY = first.y + relDistanceEnd * (second.y - first.y);
    return this.compareYValues(startY, endY);
  }

  private compareYValues(startY: number, endY: number): LineRelation {
    if (startY < 0 && endY < 0) {
      return LineRelation.UNRELATED;
    }
    if (startY > 0 && endY > 0) {
      return LineRelation.UNRELATED;
    }
    return LineRelation.CROSS;
  }
}

const LINE_LENGTH_DEGENERATE_THRESHOLD = 0.01;
const EPS = 1e-3;

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

export class Interval {
  private constructor(
    readonly minValue: number,
    readonly maxValue: number,
  ) {
    if (minValue > maxValue) {
      throw new Error(`Invalid interval: ${minValue} > ${maxValue}`);
    }
  }

  static createFromMinMax(minValue: number, maxValue: number): Interval {
    return new Interval(minValue, maxValue);
  }

  static createFrom(values: number[]): Interval {
    if (values.length === 0) {
      throw new Error('Cannot create Interval from empty value list');
    }
    return new Interval(Math.min(...values), Math.max(...values));
  }

  static createFromMinSize(minValue: number, theSize: number): Interval {
    const maxValue = minValue + theSize - 1;
    return new Interval(minValue, maxValue);
  }

  static createFromCenterSize(center: number, theSize: number): Interval {
    const minValue = center - Interval.getCenterOffset(theSize);
    return Interval.createFromMinSize(minValue, theSize);
  }

  get center(): number {
    return this.minValue + Interval.getCenterOffset(this.size);
  }

  get size(): number {
    return this.maxValue + 1 - this.minValue;
  }

  private static getCenterOffset(theSize: number): number {
    return Math.floor(theSize / 2);
  }

  // Tests whether all values of this interval are before all values of the other
  before(other: Interval): boolean {
    return this.maxValue < other.minValue;
  }

  // Create the smallest interval that contains this interval and the other interval
  toJoined(other: Interval): Interval {
    return new Interval(Math.min(this.minValue, other.minValue), Math.max(this.maxValue, other.maxValue));
  }

  toIntersected(other: Interval): Interval | null {
    const minValue = Math.max(this.minValue, other.minValue);
    const maxValue = Math.min(this.maxValue, other.maxValue);
    if (minValue > maxValue) {
      return null;
    } else {
      return new Interval(minValue, maxValue);
    }
  }

  contains(n: number): boolean {
    if (n < this.minValue) {
      return false;
    }
    if (n > this.maxValue) {
      return false;
    }
    return true;
  }
}

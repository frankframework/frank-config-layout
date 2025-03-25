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

import { Interval } from '../util/interval';
import { getRange, roundedMedian, sortedUniqNumbers } from '../util/util';

export type SizeFunction = (index: number) => number;
export type PredecessorXFunction = (index: number) => number[];

export class HorizontalConflictResolver {
  // I wanted to use readonly, but then I could not set this in the run() method
  private _finalAreaGroups: AreaGroup[] | null = null;

  constructor(
    private numPositions: number,
    private sizeFunction: SizeFunction,
    private predecessorXFunction: PredecessorXFunction,
  ) {}

  // Return null if run() was not executed
  get finalAreaGroups(): AreaGroup[] | null {
    return this._finalAreaGroups;
  }

  run(): number[] {
    let areaGroups: AreaGroup[] = getRange(0, this.numPositions).map((p) => this.getAreaGroup([p]));
    let conflictCandidates;
    let previousNumConflicts: number;
    do {
      conflictCandidates = areaGroups.map((g) => Conflict.createFromAreaGroup(g));
      previousNumConflicts = conflictCandidates.length;
      conflictCandidates.sort((a, b) => a.area.minValue - b.area.minValue);
      conflictCandidates = this.joinSortedConflicts(conflictCandidates);
      // At this point, we have Conflict objects that are spatially disjoint
      conflictCandidates.sort((a, b) => a.positionInterval.minValue - b.positionInterval.minValue);
      conflictCandidates = this.joinSortedConflicts(conflictCandidates);
      // The Conflict objects are disjoint by planned sequence indexes
      areaGroups = conflictCandidates.map((c) => this.getAreaGroup(c.positions));
    } while (conflictCandidates.length < previousNumConflicts);
    areaGroups.sort((a, b) => a.area.minValue - b.area.minValue);
    this._finalAreaGroups = areaGroups;
    this.checkIndexesAreOrderedAsIntended();
    return areaGroups.flatMap((g) => this.getXPositionsOfAreaGroup(g));
  }

  getAreaGroup(positions: number[]): AreaGroup {
    const center: number = roundedMedian(
      sortedUniqNumbers(
        positions.flatMap((p) => {
          return defaultPredecessorDecorator(p, this.numPositions, this.predecessorXFunction, this.sizeFunction);
        }),
      ),
    );
    const theSize: number = positions.map((p) => this.sizeFunction(p)).reduce((acc, curSize) => acc + curSize, 0);
    return new AreaGroup(Interval.createFromCenterSize(center, theSize), [...positions].sort());
  }

  private joinSortedConflicts(inputConflicts: Conflict[]): Conflict[] {
    const result: Conflict[] = [];
    for (const ic of inputConflicts) {
      let icCopy: Conflict = Conflict.copyFrom(ic);
      // When we have enlarged the last conflict, it may become
      // in conflict with the previous conflict in array result.
      while (result.length > 0 && positionAreasConflict(result.at(-1)!, icCopy)) {
        icCopy = result.pop()!.toMerged(icCopy);
      }
      result.push(Conflict.copyFrom(icCopy));
    }
    return result;
  }

  getXPositionsOfAreaGroup(areaGroup: AreaGroup): number[] {
    const result: number[] = [];
    let offsetX: number = areaGroup.area.minValue;
    for (const p of areaGroup.positions) {
      const theSize: number = this.sizeFunction(p);
      result.push(Interval.createFromMinSize(offsetX, theSize).center);
      offsetX += theSize;
    }
    return result;
  }

  private checkIndexesAreOrderedAsIntended(): void {
    const groupsPositions = this.finalAreaGroups!.map((g) => g.positions);
    if (groupsPositions.flat().length != this.numPositions) {
      throw new Error('Final area groups yield different positions then are in the layer');
    }
    HorizontalConflictResolver.checkGroupsPositionsAreAsIntended(groupsPositions);
  }

  static checkGroupsPositionsAreAsIntended(groupsPositions: number[][]): void {
    for (let index = 0; index < groupsPositions.length; ++index) {
      HorizontalConflictResolver.checkPositionsAreConsecutive(groupsPositions[index], index);
      if (index > 0) {
        const positionsOfPrev = groupsPositions[index - 1];
        const positionsOfCur = groupsPositions[index];
        if (positionsOfCur[0] - positionsOfPrev.at(-1)! !== 1) {
          throw new Error(
            `Adjacent final area groups have incompatible positions ${positionsOfPrev} and ${positionsOfCur}`,
          );
        }
      }
    }
  }

  static checkPositionsAreConsecutive(positions: number[], areaGroupIndex: number): void {
    if (positions.length > 1) {
      for (let i = 1; i < positions.length; ++i) {
        if (positions[i] - positions[i - 1] !== 1) {
          throw new Error(`Positions in final area group ${areaGroupIndex} are not consecutive: ${positions}`);
        }
      }
    }
  }
}

interface AbstractPositionsArea {
  readonly area: Interval;
  readonly positionInterval: Interval;
  readonly positions: number[];
}

function positionAreasConflict(first: AbstractPositionsArea, second: AbstractPositionsArea): boolean {
  const goesBefore = first.area.before(second.area) && first.positionInterval.before(second.positionInterval);
  const goesAfter = second.area.before(first.area) && second.positionInterval.before(first.positionInterval);
  return !(goesBefore || goesAfter);
}

function positionAreasDuplicatePositions(first: AbstractPositionsArea, second: AbstractPositionsArea): boolean {
  const firstPositions: Set<number> = new Set(first.positions);
  const duplicates: number[] = second.positions.filter((p) => firstPositions.has(p));
  return duplicates.length > 0;
}

export class AreaGroup implements AbstractPositionsArea {
  constructor(
    readonly area: Interval,
    readonly positions: number[],
  ) {}

  get positionInterval(): Interval {
    return Interval.createFrom(this.positions);
  }
}

class Conflict implements AbstractPositionsArea {
  constructor(
    private areaGroups: AreaGroup[],
    readonly area: Interval,
    readonly positionInterval: Interval,
  ) {}

  get positions(): number[] {
    return this.areaGroups.flatMap((g) => g.positions);
  }

  static createFromAreaGroup(areaGroup: AreaGroup): Conflict {
    return new Conflict([areaGroup], areaGroup.area, areaGroup.positionInterval);
  }

  static copyFrom(conflict: Conflict): Conflict {
    return new Conflict([...conflict.areaGroups], conflict.area, conflict.positionInterval);
  }

  toMerged(conflict: Conflict): Conflict {
    if (!positionAreasConflict(this, conflict)) {
      throw new Error('Programming error - trying to join conflicts that are not related');
    }
    if (positionAreasDuplicatePositions(this, conflict)) {
      throw new Error('Programming error - cannot duplicate positions in Conflict object from other Conflict');
    }
    const newAreaGroups = [...this.areaGroups];
    newAreaGroups.push(...conflict.areaGroups);
    return new Conflict(
      newAreaGroups,
      this.area.toJoined(conflict.area),
      this.positionInterval.toJoined(conflict.positionInterval),
    );
  }
}

export function defaultPredecessorDecorator(
  position: number,
  numPositions: number,
  delegate: PredecessorXFunction,
  sizeFunction: SizeFunction,
): number[] {
  const originalPredecessors = delegate(position);
  if (originalPredecessors.length > 0) {
    return originalPredecessors;
  }
  let leftPredecessors: number[] = [];
  for (let leftPosition = position - 1; leftPosition >= 0; --leftPosition) {
    leftPredecessors = delegate(leftPosition);
    if (leftPredecessors.length > 0) {
      break;
    }
  }
  let rightPredecessors: number[] = [];
  for (let rightPosition = position + 1; rightPosition < numPositions; ++rightPosition) {
    rightPredecessors = delegate(rightPosition);
    if (rightPredecessors.length > 0) {
      break;
    }
  }
  const leftBound: number | undefined = leftPredecessors.length === 0 ? undefined : Math.max(...leftPredecessors);
  const rightBound: number | undefined = rightPredecessors.length === 0 ? undefined : Math.min(...rightPredecessors);
  if (leftBound === undefined) {
    if (rightBound === undefined) {
      throw new Error('Cannot make up predecessors if no node is connected');
    } else {
      return [rightBound - sizeFunction(position)];
    }
  } else {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (rightBound === undefined) {
      return [leftBound + sizeFunction(position)];
    } else {
      return [roundedMedian([leftBound, rightBound])];
    }
  }
}

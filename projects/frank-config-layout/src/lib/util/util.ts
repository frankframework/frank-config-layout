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

// This can be done in a more concise way, see StackOverflow:
// https://stackoverflow.com/questions/36947847/how-to-generate-range-of-numbers-from-0-to-n-in-es2015-only
// However, the syntax applied there does not look so clear.
export function getRange(start: number, endNotIncluded: number): number[] {
  if (endNotIncluded < start) {
    throw new Error(`Cannot generate range if end = ${endNotIncluded} < start = ${start}`);
  }
  const result: number[] = [];
  for (let i = start; i < endNotIncluded; ++i) {
    result.push(i);
  }
  return result;
}

export function roundedMedian(arg: number[]): number {
  if (arg.length === 0) {
    throw new Error('Cannot calculate median of empty list');
  }
  // If no sort function is provided, numbers are sorted by their string representation
  const argSorted = [...arg].sort((a, b) => a - b);
  if (argSorted.length % 2 === 0) {
    const lengthOfFirstHalf = argSorted.length / 2;
    const firstIndexForMedian = lengthOfFirstHalf - 1;
    return Math.floor((argSorted[firstIndexForMedian] + argSorted[firstIndexForMedian + 1]) / 2);
  } else {
    const numItemsBeforeMid = (argSorted.length - 1) / 2;
    const mid = numItemsBeforeMid;
    return argSorted[mid];
  }
}

export function sortedUniqNumbers(arg: number[]): number[] {
  const argSorted = [...arg].sort((a, b) => a - b);
  const result: number[] = [];
  for (const n of argSorted) {
    // The internet documents that you can index arrays with negative
    // indexes to count from the end of the array.
    // The unit tests failed when I tried to apply that here.
    if (result.length === 0 || n !== result.at(-1)) {
      result.push(n);
    }
  }
  return result;
}

export function rotateToSwapItems<T>(target: T[], posFrom: number, posTo: number): number[] {
  const result = getRotateToSwapPermutation(target.length, posFrom, posTo);
  const newlyOrdered: T[] = Array.from({ length: target.length });
  for (const [originalIndex, movedToIndex] of result.entries()) {
    newlyOrdered[movedToIndex] = target[originalIndex];
  }
  for (const [index, value] of newlyOrdered.entries()) {
    target[index] = value;
  }
  return result;
}

function getRotateToSwapPermutation(numItems: number, indexFrom: number, indexTo: number): number[] {
  if (indexFrom >= numItems || indexTo >= numItems) {
    throw new Error(
      `getRotateToSwapPermutation() cannot rotate ${indexFrom} to ${indexTo} because there are only ${numItems} items`,
    );
  }
  const indexes: number[] = getRange(0, numItems);
  // To get the permutation, we have to permute the indexes
  // the reversed way. Check the tests to understand this.
  doRotateToSwapItems(indexes, indexTo, indexFrom);
  return indexes;
}

export function doRotateToSwapItems<T>(target: T[], posFrom: number, posTo: number): void {
  const carry: T = target[posFrom];
  if (posFrom < posTo) {
    for (let index = posFrom + 1; index <= posTo; ++index) {
      target[index - 1] = target[index];
    }
  } else if (posFrom > posTo) {
    for (let index = posFrom - 1; index >= posTo; --index) {
      target[index + 1] = target[index];
    }
  }
  target[posTo] = carry;
}

export function permutationFrom(oldSequence: (string | null)[], newSequence: string[]): number[] {
  const newPositionMap = new Map<string, number>();
  let cursorNew = 0;
  for (const [position, element] of oldSequence.entries()) {
    if (element !== null) {
      newPositionMap.set(newSequence[cursorNew++], position);
    }
  }
  const result: number[] = [];
  for (const [position, itemConsidered] of oldSequence.entries()) {
    if (itemConsidered === null) {
      result.push(position);
    } else {
      if (!newPositionMap.has(itemConsidered)) {
        throw new Error(`Expected that item of old sequence is in new sequence: ${itemConsidered}`);
      }
      const newPosition: number = newPositionMap.get(itemConsidered)!;
      result.push(newPosition);
    }
  }
  return result;
}

// Copied from https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
export async function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gives number 0, -1, +1, -2, +2, ...
export class NumbersAroundZero {
  private current = 0;

  constructor() {}

  next(): number {
    const previous = this.current;
    if (previous === 0) {
      this.current = -1;
    } else if (previous < 0) {
      this.current = -previous;
    } else {
      this.current = -(previous + 1);
    }
    return previous;
  }
}

// Taken from chat, looks good.
export function sumOf(numbers: number[]): number {
  return numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}
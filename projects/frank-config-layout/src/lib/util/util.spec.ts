import { Box } from '../graphics/box';
import { Point } from '../graphics/graphics';
import { Interval } from './interval';
import {
  doRotateToSwapItems,
  getRange,
  permutationFrom,
  rotateToSwapItems,
  roundedMedian,
  sortedUniqNumbers,
  NumbersAroundZero,
  arrangeInBox,
} from './util';

describe('Util test', () => {
  it('Get range', () => {
    expect(getRange(3, 5)).toEqual([3, 4]);
  });

  it('Get singleton range', () => {
    expect(getRange(2, 3)).toEqual([2]);
  });

  it('Get empty range', () => {
    expect(getRange(1, 1)).toEqual([]);
  });

  it('Reverse range not supported', () => {
    let caught = false;
    try {
      getRange(3, 2);
    } catch {
      caught = true;
    }
    expect(caught).toBe(true);
  });

  it('Median of list of odd length', () => {
    const input = [4, 3, 10];
    expect(roundedMedian(input)).toBe(4);
    // Check original items were not sorted
    expect(input).toEqual([4, 3, 10]);
  });

  it('Median of list of even length - no rounding needed', () => {
    const input = [4, 3, 6, 10];
    expect(roundedMedian(input)).toBe(5);
  });

  it('Median of list of even length - rounding needed', () => {
    const input = [10, 100, 201, 500];
    expect(roundedMedian(input)).toBe(150);
  });

  it('Median of singleton', () => {
    expect(roundedMedian([3])).toBe(3);
  });

  it('Median of two elements', () => {
    expect(roundedMedian([3, 5])).toBe(4);
  });

  it('sortedUniqNumbers', () => {
    expect(sortedUniqNumbers([])).toEqual([]);
    expect(sortedUniqNumbers([3])).toEqual([3]);
    const input = [3, 4, 3];
    expect(sortedUniqNumbers(input)).toEqual([3, 4]);
    // Test that original input is not sorted
    expect(input).toEqual([3, 4, 3]);
    expect(sortedUniqNumbers([4, 3, 3])).toEqual([3, 4]);
    expect(sortedUniqNumbers([3, 3, 4])).toEqual([3, 4]);
  });

  it('rotateToSwap', () => {
    const target = ['A', 'B', 'C'];
    const simplySwapped = [...target];
    doRotateToSwapItems(simplySwapped, 0, 2);
    expect(simplySwapped).toEqual(['B', 'C', 'A']);
    const swappedByPermutation: string[] = [...target];
    const permutation: number[] = rotateToSwapItems(swappedByPermutation, 0, 2);
    expect(swappedByPermutation).toEqual(['B', 'C', 'A']);
    expect(permutation[0]).toEqual(2);
    expect(permutation[1]).toEqual(0);
    expect(permutation[2]).toEqual(1);
  });

  it('rotateToSwap the other direction', () => {
    const target = ['A', 'B', 'C'];
    const simplySwapped = [...target];
    doRotateToSwapItems(simplySwapped, 2, 0);
    expect(simplySwapped).toEqual(['C', 'A', 'B']);
    const swappedByPermutation: string[] = [...target];
    const permutation: number[] = rotateToSwapItems(swappedByPermutation, 2, 0);
    expect(swappedByPermutation).toEqual(['C', 'A', 'B']);
    expect(permutation[0]).toEqual(1);
    expect(permutation[1]).toEqual(2);
    expect(permutation[2]).toEqual(0);
  });

  it('rotateToSwap with non-moved items', () => {
    const target = ['X', 'A', 'B', 'C', 'Y'];
    const simplySwapped = [...target];
    doRotateToSwapItems(simplySwapped, 1, 3);
    expect(simplySwapped).toEqual(['X', 'B', 'C', 'A', 'Y']);
    const swappedByPermutation: string[] = [...target];
    const permutation: number[] = rotateToSwapItems(swappedByPermutation, 1, 3);
    expect(swappedByPermutation).toEqual(['X', 'B', 'C', 'A', 'Y']);
    expect(permutation[0]).toEqual(0);
    expect(permutation[1]).toEqual(3);
    expect(permutation[2]).toEqual(1);
    expect(permutation[3]).toEqual(2);
    expect(permutation[4]).toEqual(4);
  });

  it('rotateToSwap the other direction with unmoved items', () => {
    const target = ['X', 'A', 'B', 'C', 'Y'];
    const simplySwapped = [...target];
    doRotateToSwapItems(simplySwapped, 3, 1);
    expect(simplySwapped).toEqual(['X', 'C', 'A', 'B', 'Y']);
    const swappedByPermutation: string[] = [...target];
    const permutation: number[] = rotateToSwapItems(swappedByPermutation, 3, 1);
    expect(swappedByPermutation).toEqual(['X', 'C', 'A', 'B', 'Y']);
    expect(permutation[0]).toEqual(0);
    expect(permutation[1]).toEqual(2);
    expect(permutation[2]).toEqual(3);
    expect(permutation[3]).toEqual(1);
    expect(permutation[4]).toEqual(4);
  });

  it('When sequence is changed, permutationFrom gives at old position index of new position', () => {
    const oldSequence = ['A', 'B', 'C'];
    const newSequence = ['C', 'A', 'B'];
    expect(permutationFrom(oldSequence, newSequence)).toEqual([1, 2, 0]);
  });

  it('When sequence is not changed, permutationFrom gives identity permutation', () => {
    const oldSequence = ['A', 'B', 'C'];
    const newSequence = ['A', 'B', 'C'];
    expect(permutationFrom(oldSequence, newSequence)).toEqual([0, 1, 2]);
  });

  it('When first of old sequence is null, permutationFrom considers the new items pasted in the non-null spots', () => {
    const oldSequence = [null, 'A', 'B', 'C'];
    // Taken to be null, 'C', 'A', 'B'
    const newSequence = ['C', 'A', 'B'];
    expect(permutationFrom(oldSequence, newSequence)).toEqual([0, 2, 3, 1]);
  });

  it('When second of old sequence is null, permutationFrom considers the new items pasted in the non-null spots', () => {
    const oldSequence = ['A', null, 'B', 'C'];
    // Taken to be 'C', null, 'A', 'B'
    const newSequence = ['C', 'A', 'B'];
    expect(permutationFrom(oldSequence, newSequence)).toEqual([2, 1, 3, 0]);
  });

  it('NumbersAroundZero', () => {
    const instance = new NumbersAroundZero();
    expect(instance.next()).toEqual(0);
    expect(instance.next()).toEqual(-1);
    expect(instance.next()).toEqual(1);
    expect(instance.next()).toEqual(-2);
    expect(instance.next()).toEqual(2);
  });

  it('When arrangeInBox arranges one item then it appears in the center of the container', () => {
    const actual: Point[] = arrangeInBox({
      container: new Box(Interval.createFromMinMax(10, 110), Interval.createFromMinMax(20, 70)),
      border: 10,
      commonItemHeight: 10,
      itemWidths: [20],
    });
    expect(actual.length).toEqual(1);
    expect(actual[0].x).toEqual(Interval.createFromCenterSize(Interval.createFromMinMax(10, 110).center, 20).minValue);
    expect(actual[0].y).toEqual(50);
  });

  it('When arrangeInBox arranges two items then they are equally spaced over the inner height vertically and centered horizontally', () => {
    const actual: Point[] = arrangeInBox({
      container: new Box(Interval.createFromMinMax(10, 110), Interval.createFromMinMax(20, 85)),
      border: 20,
      commonItemHeight: 10,
      itemWidths: [20, 30],
    });
    expect(actual.length).toEqual(2);
    expect(actual[0].x).toEqual(50);
    expect(actual[1].x).toEqual(45);
    expect(actual[0].y).toEqual(50);
    expect(actual[1].y).toEqual(66);
  });
});

import { defaultPredecessorDecorator, HorizontalConflictResolver } from './horizontal-conflict';
import { Interval } from '../util/interval';

describe('HorizontalConflictResolver AreaGroup', () => {
  it('Single predecessor aligns vertically', () => {
    const xCalc = xCoordCalculation([50], new Map([[0, [150]]]));
    const instance = xCalc.getAreaGroup([0]);
    expect(instance.area).toEqual(Interval.createFromCenterSize(150, 50));
    expect(instance.positions).toEqual([0]);
    expect(instance.positionInterval).toEqual(Interval.createFromMinMax(0, 0));
  });

  it('Non-unique predecessors center position around median of uniq', () => {
    const xCalc = xCoordCalculation([50], new Map([[0, [400, 100, 200, 100]]]));
    const instance = xCalc.getAreaGroup([0]);
    // Median of [100, 200, 400]
    expect(instance.area).toEqual(Interval.createFromCenterSize(200, 50));
    expect(instance.positions).toEqual([0]);
    expect(instance.positionInterval).toEqual(Interval.createFromMinMax(0, 0));
  });

  it('AreaGroups from multiple positions', () => {
    const xCalc = xCoordCalculation(
      [50, 50, 50, 50],
      new Map([
        [0, [600]],
        [1, [450]],
        [2, [200]],
        [3, [100]],
      ]),
    );
    const instance12 = xCalc.getAreaGroup([2, 1]);
    expect(instance12.area).toEqual(Interval.createFromCenterSize(325, 100));
    expect(instance12.positions).toEqual([1, 2]);
    expect(instance12.positionInterval).toEqual(Interval.createFromMinMax(1, 2));
  });

  it('AreaGroups with intermediate position omitted, unequal sizes', () => {
    const positionSizes = [50, 50, 50, 75];
    const xCalc = xCoordCalculation(
      positionSizes,
      new Map([
        [0, [600]],
        [1, [450]],
        [2, [200]],
        [3, [100]],
      ]),
    );
    const instance13 = xCalc.getAreaGroup([3, 1]);
    // Center is rounded median of 100 and 450.
    // Size is just enough to contain intervals of size 50 and 75
    expect(instance13.area).toEqual(Interval.createFromCenterSize(275, 125));
    expect(instance13.positions).toEqual([1, 3]);
    const xPositions: number[] = xCalc.getXPositionsOfAreaGroup(instance13);
    // The areas assigned to position 1 and position 3
    const subAreas = xPositions.map((p, index) => Interval.createFromCenterSize(p, positionSizes[[1, 3][index]]));
    expect(subAreas[0].minValue).toBe(instance13.area.minValue);
    expect(subAreas[0].size).toBe(50);
    expect(subAreas[1].minValue).toBe(subAreas[0].maxValue + 1);
    expect(subAreas[1].size).toBe(75);
    expect(subAreas[1].maxValue).toBe(instance13.area.maxValue);
    // This instance will produce a conflict when position 2 is eventually processed
    expect(instance13.positionInterval).toEqual(Interval.createFromMinMax(1, 3));
  });
});

function xCoordCalculation(sizes: number[], predecessorXCoords: Map<number, number[]>): HorizontalConflictResolver {
  return new HorizontalConflictResolver(
    sizes.length,
    (p) => sizes[p],
    (p) => predecessorXCoords.get(p)!,
  );
}

describe('defaultPredecessorDecorator - make up predecessors if none are provided by caller', () => {
  it('If the caller provides predecessors then these taken', () => {
    expect(
      defaultPredecessorDecorator(
        0,
        1,
        () => [5, 10],
        () => 1000,
      ),
    ).toEqual([5, 10]);
  });

  it('If the caller provides a predecessor for the left, then a predecessor is made up from that', () => {
    const predecessorsOfLeft = [100, 50];
    expect(
      defaultPredecessorDecorator(
        1,
        2,
        (p) => (p === 1 ? [] : predecessorsOfLeft),
        () => 3,
      ),
      // The coordinate of the rightmost predecessor to the left plus the size
    ).toEqual([103]);
  });

  it('If the caller provides a predecessor for the right, then a predecessor is made up from that', () => {
    const predecessorsOfRight = [50, 100];
    expect(
      defaultPredecessorDecorator(
        0,
        2,
        (p) => (p === 0 ? [] : predecessorsOfRight),
        () => 3,
      ),
      // The coordinate of the leftmost predecessor to the right minus the size
    ).toEqual([47]);
  });
});

describe('HorizontalConflictResolver integration', () => {
  it('If positions of area groups are consecutive, then no error', () => {
    let caught = false;
    // Wrapping this inside try-catch has no other aim then showing in Karma that
    // this test has expectations
    try {
      HorizontalConflictResolver.checkGroupsPositionsAreAsIntended([
        [0, 1, 2],
        [3, 4],
      ]);
    } catch {
      caught = true;
    }
    expect(caught).toBe(false);
  });

  it('If positions in first area group are not consecutive, then error', () => {
    let caught = false;
    try {
      HorizontalConflictResolver.checkGroupsPositionsAreAsIntended([
        [2, 0, 1],
        [3, 4],
      ]);
    } catch {
      caught = true;
    }
    expect(caught).toBe(true);
  });

  it('If positions in second area group are not consecutive, then error', () => {
    let caught = false;
    try {
      HorizontalConflictResolver.checkGroupsPositionsAreAsIntended([
        [0, 1, 2],
        [4, 3],
      ]);
    } catch {
      caught = true;
    }
    expect(caught).toBe(true);
  });

  it('If positions in adjacent area groups do not align, then error', () => {
    let caught = false;
    try {
      HorizontalConflictResolver.checkGroupsPositionsAreAsIntended([
        [0, 1, 2],
        [4, 5],
      ]);
    } catch {
      caught = true;
    }
    expect(caught).toBe(true);
  });

  it('If no conflict, then positions calculated from predecessors taken', () => {
    const xCalc = xCoordCalculation(
      [25, 25, 25, 25],
      new Map([
        [0, [100]],
        [1, [200]],
        [2, [300]],
        [3, [400]],
      ]),
    );
    const positions = xCalc.run();
    expect(positions).toEqual([100, 200, 300, 400]);
  });

  it('If only part of layer conflicts, other positions are not affected', () => {
    const xCalc = xCoordCalculation(
      [25, 25, 25],
      new Map([
        [0, [200]],
        [1, [100]],
        [2, [300]],
      ]),
    );
    const positions = xCalc.run();
    // First two center around median of 150, size 25 takes effect
    expect(positions).toEqual([137, 162, 300]);
  });

  it('Two disjoint conflicts do not interfere', () => {
    const xCalc = xCoordCalculation(
      [25, 25, 25, 25],
      new Map([
        [0, [200]],
        [1, [100]],
        [2, [400]],
        [3, [300]],
      ]),
    );
    const positions = xCalc.run();
    expect(positions).toEqual([137, 162, 337, 362]);
  });

  it('Sorting by area does not reveal this conflict, but it should be seen by sorting on index', () => {
    const xCalc = xCoordCalculation(
      [25, 25, 25, 25],
      new Map([
        [0, [200]],
        [1, [300]],
        [2, [400]],
        [3, [100]],
      ]),
    );
    const positions = xCalc.run();
    expect(positions).toEqual([212, 237, 262, 287]);
  });

  it('Big conflict does not necessarily jack up other parts of the layer', () => {
    const xCalc = xCoordCalculation(
      [25, 25, 25, 25, 25],
      new Map([
        [0, [100]],
        [1, [300]],
        [2, [400]],
        [3, [500]],
        [4, [200]],
      ]),
    );
    const positions = xCalc.run();
    expect(positions).toEqual([100, 312, 337, 362, 387]);
  });
});

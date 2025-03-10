import { LayerCalculation, Rank, rankFromMedian } from './layer-calculation';

function getSwapInstanceTest(): LayerCalculation {
  return new LayerCalculation([
    { id: 'zero', connections: [1] },
    { id: 'one', connections: [1] },
    { id: 'two', connections: [2] },
    { id: 'three', connections: [2] },
    { id: 'four', connections: [5] },
    { id: 'five', connections: [4] },
  ]);
}

describe('Test counting line crosses', () => {
  it('When max refs from first target node then counted correctly', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [0, 5] },
      { id: 'Noot', connections: [0, 1] },
    ]);
    expect(instance.numReferenceNodes).toEqual(6);
  });

  it('When max refs from second target node then counted correctly', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [0, 1] },
      { id: 'Noot', connections: [0, 5] },
    ]);
    expect(instance.numReferenceNodes).toEqual(6);
  });

  it('When two lines cross then one crossing counted', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [1] },
      { id: 'Noot', connections: [0] },
    ]);
    expect(instance.count()).toEqual(1);
  });

  it('When two lines do not cross then zero crossing counted', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [0] },
      { id: 'Noot', connections: [1] },
    ]);
    expect(instance.count()).toEqual(0);
  });

  it('When one of the lines cross then one crossing counted', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [3] },
      { id: 'Noot', connections: [1, 5] },
    ]);
    expect(instance.count()).toEqual(1);
  });

  it('When extra line points to new node to the right then no extra crossings', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [3] },
      { id: 'Noot', connections: [1, 5] },
      { id: 'Mies', connections: [6] },
    ]);
    expect(instance.count()).toEqual(1);
  });

  it('When extra line points to last touched right node then no extra crossings', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [3] },
      { id: 'Noot', connections: [1, 5] },
      { id: 'Mies', connections: [5] },
    ]);
    expect(instance.count()).toEqual(1);
  });

  it('When extra line points before one touched node then one extra crossing', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [3] },
      { id: 'Noot', connections: [1, 5] },
      { id: 'Mies', connections: [4] },
    ]);
    expect(instance.count()).toEqual(2);
  });

  it('When extra line points before two touched nodes then two extra crossing', () => {
    const instance = new LayerCalculation([
      { id: 'Aap', connections: [3] },
      { id: 'Noot', connections: [1, 5] },
      { id: 'Mies', connections: [2] },
    ]);
    expect(instance.count()).toEqual(3);
  });

  it('When a swap causes no extra crossings then change zero', () => {
    const instance = getSwapInstanceTest();
    expect(instance.getSequence()).toEqual(['zero', 'one', 'two', 'three', 'four', 'five']);
    expect(instance.count()).toEqual(1);
    expect(instance.swapAndGetCountChange(0)).toEqual(0);
    expect(instance.getSequence()).toEqual(['one', 'zero', 'two', 'three', 'four', 'five']);
    expect(instance.count()).toEqual(1);
  });

  it('When a swap causes one extra crossings then change one', () => {
    const instance = getSwapInstanceTest();
    expect(instance.getSequence()).toEqual(['zero', 'one', 'two', 'three', 'four', 'five']);
    expect(instance.count()).toEqual(1);
    expect(instance.swapAndGetCountChange(1)).toEqual(1);
    expect(instance.getSequence()).toEqual(['zero', 'two', 'one', 'three', 'four', 'five']);
    expect(instance.count()).toEqual(2);
    expect(instance.swapAndGetCountChange(1)).toEqual(-1);
    expect(instance.getSequence()).toEqual(['zero', 'one', 'two', 'three', 'four', 'five']);
  });
});

describe('Rearranging nodes to put them above the median of the connections', () => {
  it('Helper class Rank gives the new rank the highest priority', () => {
    expect(new Rank(5, 4).compareTo(new Rank(2, 3))).toEqual(3);
    expect(new Rank(2, 3).compareTo(new Rank(5, 4))).toEqual(-3);
    expect(new Rank(5, 4).compareTo(new Rank(5, 10))).toEqual(-6);
    expect(new Rank(5, 10).compareTo(new Rank(5, 4))).toEqual(6);
  });

  it('When number of values is odd then the rank is calculated correctly', () => {
    expect(rankFromMedian([1])).toEqual(2);
    expect(rankFromMedian([1, 2, 3])).toEqual(4);
    expect(rankFromMedian([1, 2, 3, 4, 5])).toEqual(6);
    expect(rankFromMedian([0, 1, 10])).toEqual(2);
  });

  it('When number of values is even then the rank is calculated correctly', () => {
    expect(rankFromMedian([1, 2])).toEqual(3);
    expect(rankFromMedian([1, 2, 3, 4])).toEqual(5);
    expect(rankFromMedian([1, 2, 3, 4, 5, 6])).toEqual(7);
    expect(rankFromMedian([0, 1, 3, 10])).toEqual(4);
  });

  it('When ranks from even and odd nodes are compared, there is no mismatch', () => {
    const first = rankFromMedian([3, 5]); // Median is 4, double median is 8
    const second = rankFromMedian([1, 5, 6]); // Median is 5, double median is 10
    const third = rankFromMedian([1, 5, 7, 8]); // Median is 6, double median is 12
    expect(first).toBeLessThan(second);
    expect(second).toBeLessThan(third);
  });

  it('When nodes are arranged in conflict with connections, then they are rearranged', () => {
    const instance = new LayerCalculation([
      { id: 'aap', connections: [5, 6] },
      // The median is 3, so second.
      { id: 'noot', connections: [1, 3, 100] },
      { id: 'mies', connections: [1, 2] },
    ]);
    instance.alignToConnections();
    expect(instance.getSequence()).toEqual(['mies', 'noot', 'aap']);
  });

  it('When new ranks cause a tie then original order is kept', () => {
    const instance = new LayerCalculation([
      { id: 'one', connections: [5, 6] },
      { id: 'two', connections: [5, 6] },
      { id: 'three', connections: [5, 6] },
      { id: 'four', connections: [5, 6] },
      { id: 'five', connections: [5, 6] },
      { id: 'six', connections: [5, 6] },
      { id: 'seven', connections: [5, 6] },
      { id: 'eight', connections: [5, 6] },
    ]);
    instance.alignToConnections();
    expect(instance.getSequence()).toEqual(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']);
  });
});

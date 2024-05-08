import { doRotateToSwapItems, getRange, escapeHtml, rotateToSwapItems, roundedMedian, sortedUniqNumbers } from './util'

describe('Util test', () => {
  it('Get range', () => {
    expect(getRange(3, 5)).toEqual([3, 4])
  })

  it('Get singleton range', () => {
    expect(getRange(2, 3)).toEqual([2])
  })

  it('Get empty range', () => {
    expect(getRange(1, 1)).toEqual([])
  })

  it('Reverse range not supported', () => {
    let caught = false
    try {
      getRange(3, 2)
    } catch(e) {
      caught = true
    }
    expect(caught).toBe(true)
  })

  it('Median of list of odd length', () => {
    const input = [4, 3, 10]
    expect(roundedMedian(input)).toBe(4)
    // Check original items were not sorted
    expect(input).toEqual([4, 3, 10])
  })

  it('Median of list of even length - no rounding needed', () => {
    const input = [4, 3, 6, 10]
    expect(roundedMedian(input)).toBe(5)
  })

  it('Median of list of even length - rounding needed', () => {
    const input = [10, 100, 201, 500]
    expect(roundedMedian(input)).toBe(150)
  })

  it('Median of singleton', () => {
    expect(roundedMedian([3])).toBe(3)
  })

  it('Median of two elements', () => {
    expect(roundedMedian([3, 5])).toBe(4)
  })

  it('sortedUniqNumbers', () => {
    expect(sortedUniqNumbers([])).toEqual([])
    expect(sortedUniqNumbers([3])).toEqual([3])
    const input = [3, 4, 3]
    expect(sortedUniqNumbers(input)).toEqual([3, 4])
    // Test that original input is not sorted
    expect(input).toEqual([3, 4, 3])
    expect(sortedUniqNumbers([4, 3, 3])).toEqual([3, 4])
    expect(sortedUniqNumbers([3, 3, 4])).toEqual([3, 4])
  })

  it('rotateToSwap', () => {
    const target = ['A', 'B', 'C']
    let simplySwapped = [... target]
    doRotateToSwapItems(simplySwapped, 0, 2)
    expect(simplySwapped).toEqual(['B', 'C', 'A'])
    let swappedByPermutation: string[] = [ ... target]
    const permutation: number[] = rotateToSwapItems(swappedByPermutation, 0, 2)
    expect(swappedByPermutation).toEqual(['B', 'C', 'A'])
    expect(permutation[0]).toEqual(2)
    expect(permutation[1]).toEqual(0)
    expect(permutation[2]).toEqual(1)
  })

  it('rotateToSwap the other direction', () => {
    const target = ['A', 'B', 'C']
    let simplySwapped = [... target]
    doRotateToSwapItems(simplySwapped, 2, 0)
    expect(simplySwapped).toEqual(['C', 'A', 'B'])
    let swappedByPermutation: string[] = [ ... target]
    const permutation: number[] = rotateToSwapItems(swappedByPermutation, 2, 0)
    expect(swappedByPermutation).toEqual(['C', 'A', 'B'])
    expect(permutation[0]).toEqual(1)
    expect(permutation[1]).toEqual(2)
    expect(permutation[2]).toEqual(0)
  })

  it('rotateToSwap with non-moved items', () => {
    const target = ['X', 'A', 'B', 'C', 'Y']
    let simplySwapped = [... target]
    doRotateToSwapItems(simplySwapped, 1, 3)
    expect(simplySwapped).toEqual(['X', 'B', 'C', 'A', 'Y'])
    let swappedByPermutation: string[] = [ ... target]
    const permutation: number[] = rotateToSwapItems(swappedByPermutation, 1, 3)
    expect(swappedByPermutation).toEqual(['X', 'B', 'C', 'A', 'Y'])
    expect(permutation[0]).toEqual(0)
    expect(permutation[1]).toEqual(3)
    expect(permutation[2]).toEqual(1)
    expect(permutation[3]).toEqual(2)
    expect(permutation[4]).toEqual(4)
  })

  it('rotateToSwap the other direction with unmoved items', () => {
    const target = ['X', 'A', 'B', 'C', 'Y']
    let simplySwapped = [... target]
    doRotateToSwapItems(simplySwapped, 3, 1)
    expect(simplySwapped).toEqual(['X', 'C', 'A', 'B', 'Y'])
    let swappedByPermutation: string[] = [ ... target]
    const permutation: number[] = rotateToSwapItems(swappedByPermutation, 3, 1)
    expect(swappedByPermutation).toEqual(['X', 'C', 'A', 'B', 'Y'])
    expect(permutation[0]).toEqual(0)
    expect(permutation[1]).toEqual(2)
    expect(permutation[2]).toEqual(3)
    expect(permutation[3]).toEqual(1)
    expect(permutation[4]).toEqual(4)
  })

  it('escapeHtml', () => {
    expect(escapeHtml('<h1>Title</h1>')).toEqual('&lt;h1&gt;Title&lt;/h1&gt;')
  })
})
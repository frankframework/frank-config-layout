import { Interval } from './interval'

describe('Interval', () => {
  it('Creating invalid interval fails', () => {
    let caught = false
    try {
      Interval.createFromMinMax(4, 3)
    } catch(e) {
      caught = true
    }
    expect(caught).toBe(true)
  })

  it('Can create interval with minValue == maxValue', () => {
    const interval = Interval.createFromMinMax(2, 2)
    expect(interval.minValue).toBe(2)
    expect(interval.maxValue).toBe(2)
  })

  it('Can create normal interval', () => {
    const interval = Interval.createFromMinMax(2, 3)
    expect(interval.minValue).toBe(2)
    expect(interval.maxValue).toBe(3)
  })

  it('Creating interval from empty array fails', () => {
    let caught = false
    try {
      Interval.createFrom([])
    } catch(e) {
      caught = true
    }
    expect(caught).toBe(true)
  })

  it('Can create interval from singleton array', () => {
    const interval = Interval.createFrom([3])
    expect(interval.minValue).toBe(3)
    expect(interval.maxValue).toBe(3)
  })

  it('Unordered list of values produces the right interval', () => {
    const interval = Interval.createFrom([3, 4, 1, 2, 5])
    expect(interval.minValue).toBe(1)
    expect(interval.maxValue).toBe(5)
  })

  it('Interval.before works as expected', () => {
    expect(Interval.createFromMinMax(1, 2).before(Interval.createFromMinMax(3, 4))).toBe(true)
    expect(Interval.createFromMinMax(3, 4).before(Interval.createFromMinMax(1, 2))).toBe(false)
    expect(Interval.createFromMinMax(2, 3).before(Interval.createFromMinMax(3, 4))).toBe(false)
    expect(Interval.createFromMinMax(3, 4).before(Interval.createFromMinMax(2, 3))).toBe(false)
    expect(Interval.createFromMinMax(1, 5).before(Interval.createFromMinMax(2, 3))).toBe(false)
    expect(Interval.createFromMinMax(2, 3).before(Interval.createFromMinMax(1, 5))).toBe(false)
  })

  it('Interval.toJoined works as expected', () => {
    expect(Interval.createFromMinMax(1, 2).toJoined(Interval.createFromMinMax(3, 4))).toEqual(Interval.createFromMinMax(1, 4))
    expect(Interval.createFromMinMax(3, 4).toJoined(Interval.createFromMinMax(1, 2))).toEqual(Interval.createFromMinMax(1, 4))
    expect(Interval.createFromMinMax(2, 3).toJoined(Interval.createFromMinMax(3, 4))).toEqual(Interval.createFromMinMax(2, 4))
    expect(Interval.createFromMinMax(3, 4).toJoined(Interval.createFromMinMax(2, 3))).toEqual(Interval.createFromMinMax(2, 4))
    expect(Interval.createFromMinMax(1, 5).toJoined(Interval.createFromMinMax(2, 3))).toEqual(Interval.createFromMinMax(1, 5))
    expect(Interval.createFromMinMax(2, 3).toJoined(Interval.createFromMinMax(1, 5))).toEqual(Interval.createFromMinMax(1, 5))
  })

  it('Interval.toIntersected works as expected', () => {
    expect(Interval.createFromMinMax(1, 2).toIntersected(Interval.createFromMinMax(3, 4))).toEqual(null)
    expect(Interval.createFromMinMax(3, 4).toIntersected(Interval.createFromMinMax(1, 2))).toEqual(null)
    expect(Interval.createFromMinMax(2, 3).toIntersected(Interval.createFromMinMax(3, 4))).toEqual(Interval.createFromMinMax(3, 3))
    expect(Interval.createFromMinMax(3, 4).toIntersected(Interval.createFromMinMax(2, 3))).toEqual(Interval.createFromMinMax(3, 3))
    expect(Interval.createFromMinMax(1, 5).toIntersected(Interval.createFromMinMax(2, 3))).toEqual(Interval.createFromMinMax(2, 3))
    expect(Interval.createFromMinMax(2, 3).toIntersected(Interval.createFromMinMax(1, 5))).toEqual(Interval.createFromMinMax(2, 3))
  })

  it('Relating minValue, maxValue and size', () => {
    // Interval has two elements
    expect(Interval.createFromMinMax(3, 4).size).toBe(2)
    expect(Interval.createFromMinSize(3, 2).maxValue).toBe(4)
    expect(Interval.createFromMinMax(6, 8).size).toBe(3)
    expect(Interval.createFromMinSize(6, 3).maxValue).toBe(8)
  })

  it('Relating center, size, minValue and maxValue', () => {
    // Check for odd interval size
    expect(Interval.createFromMinMax(150, 250).size).toBe(101)
    expect(Interval.createFromMinMax(150, 250).center).toBe(200)
    expect(Interval.createFromCenterSize(200, 101)).toEqual(Interval.createFromMinMax(150, 250))
    // Check for even interval size
    expect(Interval.createFromMinMax(150, 249).size).toBe(100)
    expect(Interval.createFromMinMax(150, 249).center).toBe(200)
    expect(Interval.createFromCenterSize(200, 100)).toEqual(Interval.createFromMinMax(150, 249))
  })

  it('Interval.contains works as expected', () => {
    const instance: Interval = Interval.createFromMinMax(3, 5)
    expect(instance.contains(2)).toEqual(false)
    expect(instance.contains(3)).toEqual(true)
    expect(instance.contains(4)).toEqual(true)
    expect(instance.contains(5)).toEqual(true)
    expect(instance.contains(6)).toEqual(false)
  })
})
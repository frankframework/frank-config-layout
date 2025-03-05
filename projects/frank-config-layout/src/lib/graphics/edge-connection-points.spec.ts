import { Interval } from "../util/interval"
import { Connector, RelativeDirection, bottomComparator, getXCoords, topComparator } from "./edge-connection-points"

describe('Edge connection points', () => {
  it('connection points', () => {
    expect(getXCoords(Interval.createFromMinSize(25, 50), 1, 100)).toEqual([50])
    // Last of interval is 25 + 50 - 1 = 74.
    expect(getXCoords(Interval.createFromMinSize(25, 50), 2, 100)).toEqual([25, 74])
    expect(getXCoords(Interval.createFromMinSize(25, 50), 3, 100)).toEqual([25, 50, 74])
    expect(getXCoords(Interval.createFromMinSize(25, 50), 1, 50)).toEqual([50])
    expect(getXCoords(Interval.createFromMinSize(25, 50), 2, 50)).toEqual([38, 62])
    expect(getXCoords(Interval.createFromMinSize(25, 50), 3, 50)).toEqual([38, 50, 62])
    expect(getXCoords(Interval.createFromMinSize(25, 50), 1, 0)).toEqual([50])
    expect(getXCoords(Interval.createFromMinSize(25, 50), 2, 0)).toEqual([50, 50])
    expect(getXCoords(Interval.createFromMinSize(25, 50), 3, 0)).toEqual([50, 50, 50])
  })

  it('Compare connectors', () => {
    const one = new Connector(RelativeDirection.IN, 10)
    const two = new Connector(RelativeDirection.OUT, 10)
    const three = new Connector(RelativeDirection.IN, 20)
    expect(bottomComparator(one, two)).toBeLessThan(0)
    expect(topComparator(one, two)).toBeGreaterThan(0)
    expect(bottomComparator(one, three)).toBeLessThan(0)
    expect(topComparator(one, three)).toBeLessThan(0)
    expect(bottomComparator(three, one)).toBeGreaterThan(0)
    expect(topComparator(three, one)).toBeGreaterThan(0)
    expect(bottomComparator(one, one)).toEqual(0)
    expect(topComparator(one, one)).toEqual(0)
  })
})
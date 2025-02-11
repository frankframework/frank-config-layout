import { Line, Point } from "../graphics/graphics"
import { EdgeLabelDimensions, EdgeLabelLayouter } from "./edge-label-layouter"

describe('EdgeLabelLayouter', () => {
  it('When two labels fit next to each other they appear next to each other, downwards', () => {
    const dimensions: EdgeLabelDimensions = {
      estLabelWidth: 20,
      estLabelHeight: 10,
      preferredVertDistanceFromOrigin: 30
    }
    const instance = new EdgeLabelLayouter(dimensions)
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, 100), new Point(150, 300))
    const firstLocation: Point = instance.add(firstLine)
    // The origin of the line is at y=100. It fits at the preferred y
    expect(firstLocation.y).toEqual(100 + 30)
    // The origin x plus half the y-offset
    expect(firstLocation.x).toEqual(50 + 15)
    // We can copy this 21 further to the right, box width is 20
    const secondLine = new Line(new Point(71, 100), new Point(171, 300))
    const secondLocation: Point = instance.add(secondLine)
    expect(secondLocation.y).toEqual(100 + 30)
    expect(secondLocation.x).toEqual(21 + 50 + 15)
  })

  it('When two labels do not fit next to each other they appear on different heights, downwards', () => {
    const dimensions: EdgeLabelDimensions = {
      estLabelWidth: 20,
      estLabelHeight: 10,
      preferredVertDistanceFromOrigin: 30
    }
    const instance = new EdgeLabelLayouter(dimensions)
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, 100), new Point(150, 300))
    const firstLocation: Point = instance.add(firstLine)
    // The origin of the line is at y=100. It fits at the preferred y
    expect(firstLocation.y).toEqual(100 + 30)
    // The origin x plus half the y-offset
    expect(firstLocation.x).toEqual(50 + 15)
    const secondLine = new Line(new Point(71, 100), new Point(71 - 100, 300))
    const secondLocation: Point = instance.add(secondLine)
    expect(secondLocation.y).toEqual(100 + 30 - 12)
    // y-offset has become -18, x-offset should be -9.
    expect(secondLocation.x).toEqual(21 + 50 -9)
  })

  // Calculations are as the preceeding tests, y-coordinates are taken negative
  // to test with upward lines.

  it('When two labels fit next to each other they appear next to each other, upwards', () => {
    const dimensions: EdgeLabelDimensions = {
      estLabelWidth: 20,
      estLabelHeight: 10,
      preferredVertDistanceFromOrigin: 30
    }
    const instance = new EdgeLabelLayouter(dimensions)
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, -100), new Point(150, -300))
    const firstLocation: Point = instance.add(firstLine)
    // The origin of the line is at y=-100. It fits at the preferred y
    expect(firstLocation.y).toEqual(-100 - 30)
    // The origin x plus half the y-offset
    expect(firstLocation.x).toEqual(50 + 15)
    // We can copy this 21 further to the right, box width is 20
    const secondLine = new Line(new Point(71, -100), new Point(171, -300))
    const secondLocation: Point = instance.add(secondLine)
    expect(secondLocation.y).toEqual(-100 - 30)
    expect(secondLocation.x).toEqual(21 + 50 + 15)
  })

  it('When two labels do not fit next to each other they appear on different heights, upwards', () => {
    const dimensions: EdgeLabelDimensions = {
      estLabelWidth: 20,
      estLabelHeight: 10,
      preferredVertDistanceFromOrigin: 30
    }
    const instance = new EdgeLabelLayouter(dimensions)
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, -100), new Point(150, -300))
    const firstLocation: Point = instance.add(firstLine)
    // The origin of the line is at y=-100. It fits at the preferred y
    expect(firstLocation.y).toEqual(-100 - 30)
    // The origin x plus half the y-offset
    expect(firstLocation.x).toEqual(50 + 15)
    const secondLine = new Line(new Point(71, -100), new Point(71 - 100, -300))
    const secondLocation: Point = instance.add(secondLine)
    expect(secondLocation.y).toEqual(-100 - 30 + 12)
    // y-offset has become -18, x-offset should be -9.
    expect(secondLocation.x).toEqual(21 + 50 -9)
  })
})
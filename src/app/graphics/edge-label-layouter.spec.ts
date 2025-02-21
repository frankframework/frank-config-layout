import { Line, Point } from "../graphics/graphics"
import { EdgeLabelDimensions, EdgeLabelLayouter, Box } from "./edge-label-layouter"

describe('EdgeLabelLayouter', () => {
  it('When two labels fit next to each other they appear next to each other, downwards', () => {
    const dimensions: EdgeLabelDimensions = {
      // estCharacterWidth is dummy value
      estCharacterWidth: 0,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 30,
      strictlyKeepLabelOutOfBox: false
    }
    const instance = new EdgeLabelLayouter(dimensions)
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, 100), new Point(150, 300))
    const firstLocation: Box = instance.add(firstLine, 20, 1)
    // The origin of the line is at y=100. It fits at the preferred y
    expect(firstLocation.verticalBox.center).toEqual(100 + 30)
    // The origin x plus half the y-offset
    expect(firstLocation.horizontalBox.center).toEqual(50 + 15)
    // We can copy this 21 further to the right, box width is 20
    const secondLine = new Line(new Point(71, 100), new Point(171, 300))
    const secondLocation: Box = instance.add(secondLine, 20, 1)
    expect(secondLocation.verticalBox.center).toEqual(100 + 30)
    expect(secondLocation.horizontalBox.center).toEqual(21 + 50 + 15)
  })

  it('When two labels do not fit next to each other they appear on different heights, downwards', () => {
    const dimensions: EdgeLabelDimensions = {
      // estCharacterWidth is dummy value
      estCharacterWidth: 0,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 30,
      strictlyKeepLabelOutOfBox: false
    }
    const instance = new EdgeLabelLayouter(dimensions)
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, 100), new Point(150, 300))
    const firstLocation: Box = instance.add(firstLine, 20, 1)
    // The origin of the line is at y=100. It fits at the preferred y
    expect(firstLocation.verticalBox.center).toEqual(100 + 30)
    // The origin x plus half the y-offset
    expect(firstLocation.horizontalBox.center).toEqual(50 + 15)
    const secondLine = new Line(new Point(71, 100), new Point(71 - 100, 300))
    const secondLocation: Box = instance.add(secondLine, 20, 1)
    expect(secondLocation.verticalBox.center).toEqual(100 + 30 - 10)
    // y-offset has become -18, x-offset should be -9.
    expect(secondLocation.horizontalBox.center).toEqual(21 + 50 -10)
  })

  // Calculations are as the preceeding tests, y-coordinates are taken negative
  // to test with upward lines.

  it('When two labels fit next to each other they appear next to each other, upwards', () => {
    const dimensions: EdgeLabelDimensions = {
      // estCharacterWidth is dummy value
      estCharacterWidth: 0,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 30,
      strictlyKeepLabelOutOfBox: false
    }
    const instance = new EdgeLabelLayouter(dimensions)
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, -100), new Point(150, -300))
    const firstLocation: Box = instance.add(firstLine, 20, 1)
    // The origin of the line is at y=-100. It fits at the preferred y
    expect(firstLocation.verticalBox.center).toEqual(-100 - 30)
    // The origin x plus half the y-offset
    expect(firstLocation.horizontalBox.center).toEqual(50 + 15)
    // We can copy this 21 further to the right, box width is 20
    const secondLine = new Line(new Point(71, -100), new Point(171, -300))
    const secondLocation: Box = instance.add(secondLine, 20, 1)
    expect(secondLocation.verticalBox.center).toEqual(-100 - 30)
    expect(secondLocation.horizontalBox.center).toEqual(21 + 50 + 15)
  })

  it('When two labels do not fit next to each other they appear on different heights, upwards', () => {
    const dimensions: EdgeLabelDimensions = {
      // estCharacterWidth is dummy value
      estCharacterWidth: 0,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 30,
      strictlyKeepLabelOutOfBox: false
    }
    const instance = new EdgeLabelLayouter(dimensions)
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, -100), new Point(150, -300))
    const firstLocation: Box = instance.add(firstLine, 20, 1)
    // The origin of the line is at y=-100. It fits at the preferred y
    expect(firstLocation.verticalBox.center).toEqual(-100 - 30)
    // The origin x plus half the y-offset
    expect(firstLocation.horizontalBox.center).toEqual(50 + 15)
    const secondLine = new Line(new Point(71, -100), new Point(71 - 100, -300))
    const secondLocation: Box = instance.add(secondLine, 20, 1)
    expect(secondLocation.verticalBox.center).toEqual(-100 - 30 + 10)
    // y-offset has become -18, x-offset should be -9.
    expect(secondLocation.horizontalBox.center).toEqual(21 + 50 -10)
  })
})
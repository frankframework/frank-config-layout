import { Line, Point } from '../graphics/graphics';
import { Box } from './box';
import { DerivedEdgeLabelDimensions, EdgeLabelLayouter } from './edge-label-layouter';

describe('EdgeLabelLayouter', () => {
  it('When two labels fit next to each other they appear next to each other, downwards', () => {
    const dimensions: DerivedEdgeLabelDimensions = {
      estCharacterWidth: 5,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 30,
      strictlyKeepLabelOutOfBox: false,
    };
    const instance = new EdgeLabelLayouter(dimensions);
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, 100), new Point(150, 300));
    const firstLocation: Box = instance.add(firstLine, 4, 1);
    // The origin of the line is at y=100. It fits at the preferred y
    expect(firstLocation.verticalBox.center).toEqual(100 + 30);
    // The origin x plus half the y-offset
    expect(firstLocation.horizontalBox.center).toEqual(50 + 15);
    // We can copy this 21 further to the right, box width is 20
    const secondLine = new Line(new Point(71, 100), new Point(171, 300));
    const secondLocation: Box = instance.add(secondLine, 4, 1);
    expect(secondLocation.verticalBox.center).toEqual(100 + 30);
    expect(secondLocation.horizontalBox.center).toEqual(21 + 50 + 15);
  });

  it('When two labels do not fit next to each other they appear on different heights, downwards', () => {
    const dimensions: DerivedEdgeLabelDimensions = {
      estCharacterWidth: 5,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 30,
      strictlyKeepLabelOutOfBox: false,
    };
    const instance = new EdgeLabelLayouter(dimensions);
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, 100), new Point(150, 300));
    const firstLocation: Box = instance.add(firstLine, 4, 1);
    // The origin of the line is at y=100. It fits at the preferred y
    expect(firstLocation.verticalBox.center).toEqual(100 + 30);
    // The origin x plus half the y-offset
    expect(firstLocation.horizontalBox.center).toEqual(50 + 15);
    const secondLine = new Line(new Point(71, 100), new Point(71 - 100, 300));
    const secondLocation: Box = instance.add(secondLine, 4, 1);
    expect(secondLocation.verticalBox.center).toEqual(100 + 30 - 10);
    // y-offset has become -18, x-offset should be -9.
    expect(secondLocation.horizontalBox.center).toEqual(21 + 50 - 10);
  });

  // Calculations are as the preceeding tests, y-coordinates are taken negative
  // to test with upward lines.

  it('When two labels fit next to each other they appear next to each other, upwards', () => {
    const dimensions: DerivedEdgeLabelDimensions = {
      estCharacterWidth: 5,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 30,
      strictlyKeepLabelOutOfBox: false,
    };
    const instance = new EdgeLabelLayouter(dimensions);
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, -100), new Point(150, -300));
    const firstLocation: Box = instance.add(firstLine, 4, 1);
    // The origin of the line is at y=-100. It fits at the preferred y
    expect(firstLocation.verticalBox.center).toEqual(-100 - 30);
    // The origin x plus half the y-offset
    expect(firstLocation.horizontalBox.center).toEqual(50 + 15);
    // We can copy this 21 further to the right, box width is 20
    const secondLine = new Line(new Point(71, -100), new Point(171, -300));
    const secondLocation: Box = instance.add(secondLine, 4, 1);
    expect(secondLocation.verticalBox.center).toEqual(-100 - 30);
    expect(secondLocation.horizontalBox.center).toEqual(21 + 50 + 15);
  });

  it('When two labels do not fit next to each other they appear on different heights, upwards', () => {
    const dimensions: DerivedEdgeLabelDimensions = {
      estCharacterWidth: 5,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 30,
      strictlyKeepLabelOutOfBox: false,
    };
    const instance = new EdgeLabelLayouter(dimensions);
    // Movers two vertical steps for one horizontal step
    const firstLine = new Line(new Point(50, -100), new Point(150, -300));
    const firstLocation: Box = instance.add(firstLine, 4, 1);
    // The origin of the line is at y=-100. It fits at the preferred y
    expect(firstLocation.verticalBox.center).toEqual(-100 - 30);
    // The origin x plus half the y-offset
    expect(firstLocation.horizontalBox.center).toEqual(50 + 15);
    const secondLine = new Line(new Point(71, -100), new Point(71 - 100, -300));
    const secondLocation: Box = instance.add(secondLine, 4, 1);
    expect(secondLocation.verticalBox.center).toEqual(-100 - 30 + 10);
    // y-offset has become -18, x-offset should be -9.
    expect(secondLocation.horizontalBox.center).toEqual(21 + 50 - 10);
  });

  it('When not strictlyKeepLabelOutOfBox, label can intersect box', () => {
    const dimensions = {
      estCharacterWidth: 5,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 12,
      strictlyKeepLabelOutOfBox: false,
    };
    const instance = new EdgeLabelLayouter(dimensions);
    const firstLine = new Line(new Point(0, 0), new Point(0, 50));
    const secondLine = new Line(new Point(1, 0), new Point(1, 50));
    const firstBox: Box = instance.add(firstLine, 1, 1);
    expect(firstBox.verticalBox.center).toEqual(12);
    expect(firstBox.verticalBox.minValue).toEqual(7);
    const secondBox: Box = instance.add(secondLine, 1, 1);
    expect(secondBox.verticalBox.center).toEqual(2);
    expect(secondBox.verticalBox.minValue).toEqual(-3);
  });

  it('When strictlyKeepLabelOutOfBox, label can not intersect box', () => {
    const dimensions = {
      estCharacterWidth: 5,
      estLabelLineHeight: 10,
      preferredVertDistanceFromOrigin: 12,
      strictlyKeepLabelOutOfBox: true,
    };
    const instance = new EdgeLabelLayouter(dimensions);
    const firstLine = new Line(new Point(0, 0), new Point(0, 50));
    const secondLine = new Line(new Point(1, 0), new Point(1, 50));
    const firstBox: Box = instance.add(firstLine, 1, 1);
    expect(firstBox.verticalBox.center).toEqual(12);
    expect(firstBox.verticalBox.minValue).toEqual(7);
    const secondBox: Box = instance.add(secondLine, 1, 1);
    expect(secondBox.verticalBox.center).toEqual(22);
    expect(secondBox.verticalBox.minValue).toEqual(17);
  });
});

import { LayoutModelBuilder } from '../model/layout-model';
import { createOriginalGraph, ERROR_STATUS_SUCCESS, OriginalGraph, OriginalNode } from '../model/error-flow';
import {
  calculateLayerNumbersLongestPath,
  IntermediatesCreationResult,
  introduceIntermediateNodesAndEdges,
} from '../model/horizontal-grouping';
import { LayoutBase } from '../model/layout-base';
import { LayoutModel } from '../model/layout-model';
import { Interval } from '../util/interval';
import { Box, LineChecker } from './box';
import { Line, Point } from './graphics';

describe('Box', () => {
  const horizontalBox = Interval.createFromMinMax(12, 18);
  const verticalBox = Interval.createFromMinMax(10, 20);
  const instance = new Box(horizontalBox, verticalBox);

  it('Left bound calculated correctly', () => {
    const result: Line = instance.leftBound;
    expect(result.startPoint.x).toEqual(12);
    expect(result.startPoint.y).toEqual(10);
    expect(result.endPoint.x).toEqual(12);
    expect(result.endPoint.y).toEqual(20);
  });

  it('Right bound calculated correctly', () => {
    const result: Line = instance.rightBound;
    expect(result.startPoint.x).toEqual(18);
    expect(result.startPoint.y).toEqual(10);
    expect(result.endPoint.x).toEqual(18);
    expect(result.endPoint.y).toEqual(20);
  });
});

describe('LineChecker', () => {
  const model: LayoutModel = ((): LayoutModel => {
    const og = createOriginalGraph();
    addNode('N1', og);
    addNode('N2', og);
    addNode('N3', og);
    addNode('N4', og);
    addNode('N5', og);
    const m: Map<string, number> = calculateLayerNumbersLongestPath(og, () => {});
    const intermediates: IntermediatesCreationResult = introduceIntermediateNodesAndEdges(og, m);
    const lb = LayoutBase.create(['N1', 'N2', 'N3', 'N4', 'N5'], intermediates.intermediate);
    return new LayoutModelBuilder(lb, intermediates.intermediate).run();
  })();

  const simpleLineChecker = new LineChecker({
    xFunction: (id): number => ['N1', 'N2', 'N3', 'N4', 'N5'].indexOf(id) * 10,
    yFunction: (): number => 100,
    widthFunction: (): number => 5,
    heightFunction: (): number => 7,
    notIntermediateFunction: (): boolean => true,
  });

  const intermediateTester = new LineChecker({
    xFunction: (id): number => ['N1', 'N2', 'N3', 'N4', 'N5'].indexOf(id) * 10,
    yFunction: (): number => 100,
    widthFunction: (): number => 5,
    heightFunction: (): number => 7,
    notIntermediateFunction: (id: string): boolean => (id === 'N3' ? true : false),
  });

  it('When a node has non-intermediate nodes to its left and its right, two obstacles are returned', () => {
    const obstacles: Line[] = simpleLineChecker.obstaclesOfPassingId('N3', model);
    expect(obstacles.length).toEqual(2);
    const leftObstacle = obstacles[0];
    expect(simpleLineChecker.createBox('N3').horizontalBox.center).toEqual(20);
    expect(simpleLineChecker.createBox('N3').verticalBox.center).toEqual(100);
    expect(leftObstacle.startPoint.x).toEqual(12);
    expect(leftObstacle.startPoint.y).toEqual(97);
    expect(leftObstacle.endPoint.x).toEqual(12);
    expect(leftObstacle.endPoint.y).toEqual(103);
  });

  it('When a node is the left-most, only an obstacle to its right is returned', () => {
    const obstacles: Line[] = simpleLineChecker.obstaclesOfPassingId('N1', model);
    expect(obstacles.length).toEqual(1);
    expect(obstacles[0].startPoint.x).toEqual(8);
    expect(obstacles[0].startPoint.y).toEqual(97);
    expect(obstacles[0].endPoint.x).toEqual(8);
    expect(obstacles[0].endPoint.y).toEqual(103);
  });

  it('When a node is the right-most, only an obstacle to its left is returned', () => {
    const obstacles: Line[] = simpleLineChecker.obstaclesOfPassingId('N5', model);
    expect(obstacles.length).toEqual(1);
    expect(obstacles[0].startPoint.x).toEqual(32);
    expect(obstacles[0].startPoint.y).toEqual(97);
    expect(obstacles[0].endPoint.x).toEqual(32);
    expect(obstacles[0].endPoint.y).toEqual(103);
  });

  it('When all nodes to the left are intermediate, then only a right boundary is returned', () => {
    const obstacles: Line[] = intermediateTester.obstaclesOfPassingId('N2', model);
    expect(obstacles.length).toEqual(1);
    expect(obstacles[0].startPoint.x).toEqual(18);
  });

  it('When all nodes to the right are intermediate, then only a left boundary is returned', () => {
    const obstacles: Line[] = intermediateTester.obstaclesOfPassingId('N4', model);
    expect(obstacles.length).toEqual(1);
    expect(obstacles[0].startPoint.x).toEqual(22);
  });

  it('When a line passes through the horizontal interval of a node then lineIsInBoundsForId returns true', () => {
    const line = new Line(new Point(18, 90), new Point(22, 105));
    expect(simpleLineChecker.lineIsInBoundsForId('N3', line)).toEqual(true);
  });

  it('When a line does not pass through the horizontal interval of a node, then lineIsInBoundsForId returns false', () => {
    const line = new Line(new Point(18, 90), new Point(22, 105));
    expect(simpleLineChecker.lineIsInBoundsForId('N2', line)).toEqual(false);
  });
});

function addNode(id: string, gl: OriginalGraph): void {
  const n: OriginalNode = {
    id,
    // These are dummy
    text: '',
    errorStatus: ERROR_STATUS_SUCCESS,
  };
  gl.addNode(n);
}

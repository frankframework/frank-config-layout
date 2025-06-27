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
import { createNodeText } from '../model/text';

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

  it('Top bound calculated correctly', () => {
    const result = instance.topBound;
    expect(result.startPoint.x).toEqual(12);
    expect(result.startPoint.y).toEqual(10);
    expect(result.endPoint.x).toEqual(18);
    expect(result.endPoint.y).toEqual(10);
  });

  it('Bottom calculated correctly', () => {
    const result = instance.bottomBound;
    expect(result.startPoint.x).toEqual(12);
    expect(result.startPoint.y).toEqual(20);
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

  const nodeIdToCenter = new Map<string, number>([
    ['N1', 0],
    ['N2', 10],
    ['N3', 20],
    ['N4', 30],
    ['N5', 40],
  ]);
  const simpleLineChecker = new LineChecker({
    nodeBoxFunction: (id): Box => {
      const centerX: number = nodeIdToCenter.get(id)!;
      return new Box(Interval.createFromCenterSize(centerX, 5), Interval.createFromCenterSize(100, 7));
    },
    nodeWidthFunction: (id): Interval => Interval.createFromCenterSize(nodeIdToCenter.get(id)!, 5),
    notIntermediateFunction: (): boolean => true,
  });

  const intermediateTester = new LineChecker({
    nodeBoxFunction: (id): Box => {
      const centerX: number = nodeIdToCenter.get(id)!;
      return new Box(Interval.createFromCenterSize(centerX, 5), Interval.createFromCenterSize(100, 7));
    },
    nodeWidthFunction: (id): Interval => Interval.createFromCenterSize(nodeIdToCenter.get(id)!, 5),
    notIntermediateFunction: (id: string): boolean => (id === 'N3' ? true : false),
  });

  it('When a node has non-intermediate nodes to its left and its right, the bounds from two obstacles are returned', () => {
    const obstacles: Line[] = simpleLineChecker.obstaclesOfPassingId('N3', model);
    expect(obstacles.length).toEqual(8);
    checkLines({ minIdx: 0, maxIdx: 3, minX: 8, maxX: 12, minY: 97, maxY: 103, lines: obstacles });
    checkLines({ minIdx: 4, maxIdx: 7, minX: 28, maxX: 32, minY: 97, maxY: 103, lines: obstacles });
  });

  it('When a node is the left-most, only obstacles to its right are returned', () => {
    const obstacles: Line[] = simpleLineChecker.obstaclesOfPassingId('N1', model);
    expect(obstacles.length).toEqual(4);
    checkLines({ minIdx: 0, maxIdx: 3, minX: 8, maxX: 12, minY: 97, maxY: 103, lines: obstacles });
  });

  it('When a node is the right-most, only obstacles to its left are returned', () => {
    const obstacles: Line[] = simpleLineChecker.obstaclesOfPassingId('N5', model);
    expect(obstacles.length).toEqual(4);
    checkLines({ minIdx: 0, maxIdx: 3, minX: 28, maxX: 32, minY: 97, maxY: 103, lines: obstacles });
  });

  it('When all nodes to the left are intermediate, then only right boundaries are returned', () => {
    const obstacles: Line[] = intermediateTester.obstaclesOfPassingId('N2', model);
    expect(obstacles.length).toEqual(4);
    checkLines({ minIdx: 0, maxIdx: 3, minX: 18, maxX: 22, minY: 97, maxY: 103, lines: obstacles });
  });

  it('When all nodes to the right are intermediate, then only left boundaries are returned', () => {
    const obstacles: Line[] = intermediateTester.obstaclesOfPassingId('N4', model);
    expect(obstacles.length).toEqual(4);
    checkLines({ minIdx: 0, maxIdx: 3, minX: 18, maxX: 22, minY: 97, maxY: 103, lines: obstacles });
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
    text: createNodeText(''),
    errorStatus: ERROR_STATUS_SUCCESS,
  };
  gl.addNode(n);
}

function checkLines({
  minIdx,
  maxIdx,
  minX,
  maxX,
  minY,
  maxY,
  lines,
}: {
  minIdx: number;
  maxIdx: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  lines: Line[];
}): void {
  const selected: Line[] = [];
  for (let idx = minIdx; idx <= maxIdx; ++idx) {
    selected.push(lines[idx]);
  }
  const allX = selected.flatMap((line) => [line.startPoint.x, line.endPoint.x]);
  const allY = selected.flatMap((line) => [line.startPoint.y, line.endPoint.y]);
  expect(Math.min(...allX)).toEqual(minX);
  expect(Math.max(...allX)).toEqual(maxX);
  expect(Math.min(...allY)).toEqual(minY);
  expect(Math.max(...allY)).toEqual(maxY);
}

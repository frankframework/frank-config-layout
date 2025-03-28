import { PASS_DIRECTION_DOWN, PASS_DIRECTION_UP } from '../model/horizontal-grouping';
import { Line, Point } from './graphics';
import { straighten, StraightenedLine, StraightenedLineSegmentsBuilder } from './straightened-line';

describe('StraightenedLine', () => {
  it('Join', () => {
    const first = StraightenedLine.create('Start', 'Intermediate', new Line(new Point(0, 0), new Point(0, 1)));
    const second = StraightenedLine.create('Intermediate', 'End', new Line(new Point(0, 1), new Point(0, 2)));
    const joined = first.toJoinedWith(second);
    expect(joined.idStart).toEqual('Start');
    expect(joined.idEnd).toEqual('End');
    expect(joined.line.startPoint.y).toEqual(0);
    expect(joined.line.endPoint.y).toEqual(2);
  });

  it('Replace layer passage', () => {
    const predecessor = StraightenedLine.create('Start', 'Intermediate', new Line(new Point(0, 0), new Point(1, 1)));
    const passage = StraightenedLine.create('Intermediate', 'Intermediate', new Line(new Point(1, 1), new Point(1, 3)));
    const successor = StraightenedLine.create('Intermediate', 'End', new Line(new Point(1, 3), new Point(0, 4)));
    const replacements: StraightenedLine[] = passage.toReplaceMeAsLayerPassage(predecessor, successor);
    expect(replacements.length).toEqual(2);
    expect(replacements[0].idStart).toEqual('Start');
    expect(replacements[0].idEnd).toEqual('Intermediate');
    expect(replacements[0].line.startPoint.x).toEqual(0);
    expect(replacements[0].line.startPoint.y).toEqual(0);
    expect(replacements[0].line.endPoint.x).toEqual(1);
    expect(replacements[0].line.endPoint.y).toEqual(2);
    expect(replacements[1].idStart).toEqual('Intermediate');
    expect(replacements[1].idEnd).toEqual('End');
    expect(replacements[1].line.startPoint.x).toEqual(1);
    expect(replacements[1].line.startPoint.y).toEqual(2);
    expect(replacements[1].line.endPoint.x).toEqual(0);
    expect(replacements[1].line.endPoint.y).toEqual(4);
  });
});

describe('StraightenedLineSegmentsBuilder', () => {
  const linesWithoutIntermediates = new Map<string, Line>([
    ['Start-i1', new Line(new Point(0, 0), new Point(1, 10))],
    ['i1-i2', new Line(new Point(1, 10), new Point(1, 20))],
    ['i2-i3', new Line(new Point(1, 20), new Point(1, 30))],
    ['i3-End', new Line(new Point(1, 30), new Point(0, 40))],
  ]);

  it('When edges are connected then one group of line segments is created', () => {
    const instance = new StraightenedLineSegmentsBuilder({
      lineFactory: (edgeKey): Line => linesWithoutIntermediates.get(edgeKey)!,
      notIntermediateFunction: (id): boolean => !id.startsWith('i'),
      layerPassageFactory: undefined,
      directionCalculator: (): number => PASS_DIRECTION_DOWN,
    });
    const result: StraightenedLine[][] = instance.run(['Start-i1', 'i1-i2', 'i2-i3', 'i3-End']);
    expect(result.length).toEqual(1);
    const theGroup = result[0];
    expect(theGroup.length).toEqual(4);
    expect(theGroup.map((segment) => segment.idStart)).toEqual(['Start', 'i1', 'i2', 'i3']);
    expect(theGroup.map((segment) => segment.idEnd)).toEqual(['i1', 'i2', 'i3', 'End']);
    expect(
      theGroup.map((segment) => [
        segment.line.startPoint.x,
        segment.line.startPoint.y,
        segment.line.endPoint.x,
        segment.line.endPoint.y,
      ]),
    ).toEqual([
      [0, 0, 1, 10],
      [1, 10, 1, 20],
      [1, 20, 1, 30],
      [1, 30, 0, 40],
    ]);
  });

  it('When edges are not connected then multiple connected groups are created', () => {
    const instance = new StraightenedLineSegmentsBuilder({
      lineFactory: (edgeKey): Line => linesWithoutIntermediates.get(edgeKey)!,
      notIntermediateFunction: (id): boolean => !id.startsWith('i'),
      layerPassageFactory: undefined,
      directionCalculator: (): number => PASS_DIRECTION_DOWN,
    });
    const result: StraightenedLine[][] = instance.run(['Start-i1', 'i2-i3', 'i3-End']);
    expect(result.length).toEqual(2);
    const firstGroup = result[0];
    expect(firstGroup.length).toEqual(1);
    expect(firstGroup.map((segment) => segment.idStart)).toEqual(['Start']);
    expect(firstGroup.map((segment) => segment.idEnd)).toEqual(['i1']);
    expect(
      firstGroup.map((segment) => [
        segment.line.startPoint.x,
        segment.line.startPoint.y,
        segment.line.endPoint.x,
        segment.line.endPoint.y,
      ]),
    ).toEqual([[0, 0, 1, 10]]);
    const secondGroup = result[1];
    expect(secondGroup.length).toEqual(2);
    expect(secondGroup.map((segment) => segment.idStart)).toEqual(['i2', 'i3']);
    expect(secondGroup.map((segment) => segment.idEnd)).toEqual(['i3', 'End']);
    expect(
      secondGroup.map((segment) => [
        segment.line.startPoint.x,
        segment.line.startPoint.y,
        segment.line.endPoint.x,
        segment.line.endPoint.y,
      ]),
    ).toEqual([
      [1, 20, 1, 30],
      [1, 30, 0, 40],
    ]);
  });

  const linesWithIntermediates = new Map<string, Line>([
    ['Start-i1', new Line(new Point(0, 0), new Point(1, 9))],
    ['i1-i2', new Line(new Point(1, 11), new Point(1, 19))],
    ['i2-i3', new Line(new Point(1, 21), new Point(1, 29))],
    ['i3-End', new Line(new Point(1, 31), new Point(0, 40))],
  ]);

  const layerPasses = new Map<string, Line>([
    ['i1', new Line(new Point(1, 9), new Point(1, 11))],
    ['i2', new Line(new Point(1, 19), new Point(1, 21))],
    ['i3', new Line(new Point(1, 29), new Point(1, 31))],
  ]);

  it('When layerPassageFactory is provided then layer passage segments are created', () => {
    const instance = new StraightenedLineSegmentsBuilder({
      lineFactory: (edgeKey): Line => linesWithIntermediates.get(edgeKey)!,
      notIntermediateFunction: (id): boolean => !id.startsWith('i'),
      layerPassageFactory: (id, direction): Line => {
        expect(direction).toEqual(PASS_DIRECTION_DOWN);
        return layerPasses.get(id)!;
      },
      directionCalculator: (): number => PASS_DIRECTION_DOWN,
    });
    const result: StraightenedLine[][] = instance.run(['Start-i1', 'i1-i2', 'i2-i3', 'i3-End']);
    expect(result.length).toEqual(1);
    const theGroup = result[0];
    expect(theGroup.length).toEqual(7);
    expect(theGroup.map((segment) => segment.idStart)).toEqual(['Start', 'i1', 'i1', 'i2', 'i2', 'i3', 'i3']);
    expect(theGroup.map((segment) => segment.idEnd)).toEqual(['i1', 'i1', 'i2', 'i2', 'i3', 'i3', 'End']);
    expect(
      theGroup.map((segment) => [
        segment.line.startPoint.x,
        segment.line.startPoint.y,
        segment.line.endPoint.x,
        segment.line.endPoint.y,
      ]),
    ).toEqual([
      [0, 0, 1, 9],
      [1, 9, 1, 11],
      [1, 11, 1, 19],
      [1, 19, 1, 21],
      [1, 21, 1, 29],
      [1, 29, 1, 31],
      [1, 31, 0, 40],
    ]);
  });

  const linesWithIntermediatesUp = new Map<string, Line>([
    ['Start-i1', new Line(new Point(0, 0), new Point(1, -9))],
    ['i1-i2', new Line(new Point(1, -11), new Point(1, -19))],
    ['i2-i3', new Line(new Point(1, -21), new Point(1, -29))],
    ['i3-End', new Line(new Point(1, -31), new Point(0, -40))],
  ]);

  const layerPassesUp = new Map<string, Line>([
    ['i1', new Line(new Point(1, -9), new Point(1, -11))],
    ['i2', new Line(new Point(1, -19), new Point(1, -21))],
    ['i3', new Line(new Point(1, -29), new Point(1, -31))],
  ]);

  it('When edge goes up then layer passage segments are upwards', () => {
    const instance = new StraightenedLineSegmentsBuilder({
      lineFactory: (edgeKey): Line => linesWithIntermediatesUp.get(edgeKey)!,
      notIntermediateFunction: (id): boolean => !id.startsWith('i'),
      layerPassageFactory: (id, direction): Line => {
        expect(direction).toEqual(PASS_DIRECTION_UP);
        return layerPassesUp.get(id)!;
      },
      directionCalculator: (): number => PASS_DIRECTION_UP,
    });
    const result: StraightenedLine[][] = instance.run(['Start-i1', 'i1-i2', 'i2-i3', 'i3-End']);
    expect(result.length).toEqual(1);
    const theGroup = result[0];
    expect(theGroup.length).toEqual(7);
    expect(theGroup.map((segment) => segment.idStart)).toEqual(['Start', 'i1', 'i1', 'i2', 'i2', 'i3', 'i3']);
    expect(theGroup.map((segment) => segment.idEnd)).toEqual(['i1', 'i1', 'i2', 'i2', 'i3', 'i3', 'End']);
    expect(
      theGroup.map((segment) => [
        segment.line.startPoint.x,
        segment.line.startPoint.y,
        segment.line.endPoint.x,
        segment.line.endPoint.y,
      ]),
    ).toEqual([
      [0, 0, 1, -9],
      [1, -9, 1, -11],
      [1, -11, 1, -19],
      [1, -19, 1, -21],
      [1, -21, 1, -29],
      [1, -29, 1, -31],
      [1, -31, 0, -40],
    ]);
  });
});

describe('Straighten', () => {
  it('When no obstacles are hit and when we stay within boundaries, then the segments are reduced to a single segment', () => {
    const segments: StraightenedLine[] = [
      StraightenedLine.create('Start', 'i1', new Line(new Point(0, 0), new Point(1, 9))),
      StraightenedLine.create('i1', 'i1', new Line(new Point(1, 9), new Point(1, 11))),
      StraightenedLine.create('i1', 'End', new Line(new Point(1, 11), new Point(0, 20))),
    ];
    const result: StraightenedLine[] = straighten(
      segments,
      () => true,
      () => true,
    );
    expect(result.length).toEqual(1);
    expect(result[0].idStart).toEqual('Start');
    expect(result[0].idEnd).toEqual('End');
    expect(result[0].line.startPoint.x).toEqual(0);
    expect(result[0].line.startPoint.y).toEqual(0);
    expect(result[0].line.endPoint.x).toEqual(0);
    expect(result[0].line.endPoint.y).toEqual(20);
  });
});

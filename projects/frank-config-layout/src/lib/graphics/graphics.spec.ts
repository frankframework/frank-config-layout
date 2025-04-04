import { Point, Line, LineRelation, relateLines } from './graphics';

describe('Point tests', () => {
  it('subtract', () => {
    const toChange = new Point(4, 5);
    const actual = toChange.subtract(new Point(3, 2));
    expect(actual.x).toBe(1);
    expect(actual.y).toBe(3);
  });

  it('length', () => {
    expect(new Point(3, 4).getSquaredVectorLength()).toBe(5 * 5);
  });

  it('rotate vector perpendicular to reference', () => {
    // We use easy values because 3^2 + 4^2 = 5^2
    const reference = new Point(3, 4);
    // toRotate is rotated 90 degrees counter-clockwise related to reference
    const toRotate = new Point(-2 * 4, 2 * 3);
    const actual = reference.rotateOtherBackAndMultiplyByMyLength(toRotate);
    expect(actual.x).toBe(0);
    expect(actual.y).toBe(2 * 5 * 5);
  });

  it('rotate vector parallel to reference', () => {
    // We use easy values because 3^2 + 4^2 = 5^2
    const reference = new Point(3, 4);
    // toRotate is rotated 90 degrees counter-clockwise related to reference
    const toRotate = new Point(2 * 3, 2 * 4);
    const actual = reference.rotateOtherBackAndMultiplyByMyLength(toRotate);
    expect(actual.x).toBe(2 * 5 * 5);
    expect(actual.y).toBe(0);
  });

  it('equals', () => {
    expect(new Point(2, 3).equals(new Point(2, 3))).toBe(true);
    expect(new Point(2, 3).equals(new Point(3, 2))).toBe(false);
    expect(new Point(2, 3).equals(new Point(3, 3))).toBe(false);
  });
});

describe('Line tests', () => {
  it('translate to start in origin', () => {
    const instance = new Line(new Point(1, 2), new Point(5, 4));
    const makeRelativeTo = new Point(-1, -2);
    const actual = instance.subtract(makeRelativeTo);
    expect(actual.startPoint.x).toBe(2);
    expect(actual.startPoint.y).toBe(4);
    expect(actual.endPoint.x).toBe(6);
    expect(actual.endPoint.y).toBe(6);
  });

  it('squared length', () => {
    const instance = new Line(new Point(1, 2), new Point(4, 6));
    expect(instance.getSquaredLength()).toBe(25);
  });

  const relateToHorizontalLineCases = [
    ['left no cross', new Line(new Point(-1, -1), new Point(-1, 1)), 1, LineRelation.UNRELATED],
    ['right no cross', new Line(new Point(2, -1), new Point(2, 1)), 1, LineRelation.UNRELATED],
    ['perpendicular cross', new Line(new Point(2, -1), new Point(2, 1)), 3, LineRelation.CROSS],
    ['perpendicular cross top-down', new Line(new Point(2, 1), new Point(2, -1)), 3, LineRelation.CROSS],
  ];
  for (const testCase of relateToHorizontalLineCases) {
    const testTitle = `relate to horizontal line - ${testCase[0]}`;
    const refLength = testCase[2] as number;
    const expectedResult = testCase[3] as LineRelation;

    it(testTitle, () => {
      const instance = testCase[1] as Line;
      expect(instance.relateToHorizontalLine(refLength)).toBe(expectedResult);
    });

    const testTitleNotPerpendicular = `relate to horizontal line, not perpendicular - ${testCase[0]}`;

    it(testTitleNotPerpendicular, () => {
      const originalLine = testCase[1] as Line;
      const originalLineStart = originalLine.startPoint;
      const newStart = originalLineStart.subtract(new Point(0.1, 0.1));
      const newLine = new Line(newStart, originalLine.endPoint);
      expect(newLine.relateToHorizontalLine(refLength)).toBe(expectedResult);
    });
  }

  const horizontalLines = [
    new Line(new Point(-1, -1), new Point(2, -1)),
    new Line(new Point(0, 0), new Point(1, 0)),
    new Line(new Point(-3, 1), new Point(1, 1)),
  ];

  const verticalLines = [
    new Line(new Point(-2, 1.5), new Point(-2, -1)),
    new Line(new Point(0.5, -1.5), new Point(0.5, 1.5)),
  ];

  const data = [
    [0, 0, LineRelation.UNRELATED],
    [0, 1, LineRelation.CROSS],
    [1, 0, LineRelation.UNRELATED],
    [1, 1, LineRelation.CROSS],
    [2, 0, LineRelation.CROSS],
    [2, 1, LineRelation.CROSS],
  ];
  for (const testCase of data) {
    const horizontalLineIdx = testCase[0] as number;
    const verticalLineIdx = testCase[1] as number;
    const expectedResult = testCase[2] as LineRelation;

    it(`relate lines ${horizontalLineIdx}-${verticalLineIdx}`, () => {
      const horizontal = horizontalLines[horizontalLineIdx];
      const vertical = verticalLines[verticalLineIdx];
      expect(relateLines(horizontal, vertical)).toBe(expectedResult);
      expect(relateLines(vertical, horizontal)).toBe(expectedResult);
    });

    it(`relate lines ${horizontalLineIdx}-${verticalLineIdx}, no corner case equal x-coords`, () => {
      const original = horizontalLines[horizontalLineIdx];
      const newStart = original.startPoint.subtract(new Point(0, 0.1));
      const horizontal = new Line(newStart, original.endPoint);
      const vertical = verticalLines[verticalLineIdx];
      expect(relateLines(horizontal, vertical)).toBe(expectedResult);
      expect(relateLines(vertical, horizontal)).toBe(expectedResult);
    });
  }

  it('When line goes down, integerPointAtY finds the right point', () => {
    // x changes by 10, y changes by 100
    const instance = new Line(new Point(10, 20), new Point(20, 120));
    // 20 further than start y, so x should be 2 further
    const result: Point = instance.integerPointAtY(40);
    expect(result.x).toEqual(12);
    expect(result.y).toEqual(40);
  });

  it('When line goes up, integerPointAtY finds the right point', () => {
    // x changes by 10, y changes by -100
    const instance = new Line(new Point(10, 20), new Point(20, -80));
    // -20 further than start y, so x should be 2 further
    const result: Point = instance.integerPointAtY(0);
    expect(result.x).toEqual(12);
    expect(result.y).toEqual(0);
  });

  it('When line goes down, integerPointAtY rounds the returned point', () => {
    // x changes by 10, y changes by 30
    const instance = new Line(new Point(10, 20), new Point(20, 50));
    // 10 further than start y, so x should be round(10 / 3) = 3
    const result: Point = instance.integerPointAtY(30);
    expect(result.x).toEqual(13);
    expect(result.y).toEqual(30);
  });
});

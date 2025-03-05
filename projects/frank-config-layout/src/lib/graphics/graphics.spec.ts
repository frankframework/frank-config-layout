import {Point, Line, LineRelation, relateLines} from './graphics'

describe('Point tests', () => {
  it('subtract', () => {
    const toChange = new Point(4, 5)
    const actual = toChange.subtract(new Point(3, 2))
    expect(actual.x).toBe(1);
    expect(actual.y).toBe((3));
  })

  it('length', () => {
    expect(new Point(3, 4).getSquaredVectorLength()).toBe(5*5)
  })

  it('rotate vector perpendicular to reference', () => {
    // We use easy values because 3^2 + 4^2 = 5^2
    const reference = new Point(3, 4);
    // toRotate is rotated 90 degrees counter-clockwise related to reference
    const toRotate = new Point(-2*4, 2*3);
    const actual = reference.rotateOtherBackAndMultiplyByMyLength(toRotate)
    expect(actual.x).toBe(0)
    expect(actual.y).toBe(2*5*5)
  })

  it('rotate vector parallel to reference', () => {
    // We use easy values because 3^2 + 4^2 = 5^2
    const reference = new Point(3, 4);
    // toRotate is rotated 90 degrees counter-clockwise related to reference
    const toRotate = new Point(2*3, 2*4);
    const actual = reference.rotateOtherBackAndMultiplyByMyLength(toRotate)
    expect(actual.x).toBe(2*5*5)
    expect(actual.y).toBe(0)
  })

  it('equals', () => {
    expect(new Point(2, 3).equals(new Point(2, 3))).toBe(true)
    expect(new Point(2, 3).equals(new Point(3, 2))).toBe(false)
    expect(new Point(2, 3).equals(new Point(3, 3))).toBe(false)
  })
})

describe('Line tests', () => {
  it('translate to start in origin', () => {
    let instance = new Line(new Point(1, 2), new Point(5, 4))
    let makeRelativeTo = new Point(-1, -2)
    let actual = instance.subtract(makeRelativeTo)
    expect(actual.startPoint.x).toBe(2)
    expect(actual.startPoint.y).toBe(4)
    expect(actual.endPoint.x).toBe(6)
    expect(actual.endPoint.y).toBe(6)
  })

  it('squared length', () => {
    let instance = new Line(new Point(1, 2), new Point(4, 6))
    expect(instance.getSquaredLength()).toBe(25)
  })

  const relateToHorizontalLineCases = [
    ['left no cross', new Line(new Point(-1, -1), new Point(-1, 1)), 1, LineRelation.UNRELATED],
    ['right no cross', new Line(new Point(2, -1), new Point(2, 1)), 1, LineRelation.UNRELATED],
    ['perpendicular cross', new Line(new Point(2, -1), new Point(2, 1)), 3, LineRelation.CROSS],
    ['perpendicular cross top-down', new Line(new Point(2, 1), new Point(2, -1)), 3, LineRelation.CROSS]
  ].forEach(testCase => {
    let testTitle = `relate to horizontal line - ${testCase[0]}`
    const refLength = testCase[2] as number
    const expectedResult = testCase[3] as LineRelation
    it(testTitle, () => {
      const instance = testCase[1] as Line
      expect(instance.relateToHorizontalLine(refLength)).toBe(expectedResult)
    })
    let testTitleNotPerpendicular = `relate to horizontal line, not perpendicular - ${testCase[0]}`
    it(testTitleNotPerpendicular, () => {
      let originalLine = testCase[1] as Line
      let originalLineStart = originalLine.startPoint
      let newStart = originalLineStart.subtract(new Point(0.1, 0.1))
      let newLine = new Line(newStart, originalLine.endPoint)
      expect(newLine.relateToHorizontalLine(refLength)).toBe(expectedResult)
    })
  })

  let horizontalLines = [
    new Line(new Point(-1, -1), new Point(2, -1)),
    new Line(new Point(0, 0), new Point(1, 0)),
    new Line(new Point(-3, 1), new Point(1, 1))
  ]

  let verticalLines = [
    new Line(new Point(-2, 1.5), new Point(-2, -1)),
    new Line(new Point(0.5, -1.5), new Point(0.5, 1.5))
  ]

  let data = [
    [0, 0, LineRelation.UNRELATED],
    [0, 1, LineRelation.CROSS],
    [1, 0, LineRelation.UNRELATED],
    [1, 1, LineRelation.CROSS],
    [2, 0, LineRelation.CROSS],
    [2, 1, LineRelation.CROSS]
  ].forEach(testCase => {
    let horizontalLineIdx = testCase[0] as number
    let verticalLineIdx = testCase[1] as number
    let expectedResult = testCase[2] as LineRelation
    it(`relate lines ${horizontalLineIdx}-${verticalLineIdx}`, () => {
      let horizontal = horizontalLines[horizontalLineIdx]
      let vertical = verticalLines[verticalLineIdx]
      expect(relateLines(horizontal, vertical)).toBe(expectedResult)
      expect(relateLines(vertical, horizontal)).toBe(expectedResult)
    })
    it(`relate lines ${horizontalLineIdx}-${verticalLineIdx}, no corner case equal x-coords`, () => {
      let original = horizontalLines[horizontalLineIdx]
      let newStart = original.startPoint.subtract(new Point(0, 0.1))
      let horizontal = new Line(newStart, original.endPoint)
      let vertical = verticalLines[verticalLineIdx]
      expect(relateLines(horizontal, vertical)).toBe(expectedResult)
      expect(relateLines(vertical, horizontal)).toBe(expectedResult)
    })
  })
})
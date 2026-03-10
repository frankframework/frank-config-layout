import { createEdgeText, EdgeText } from './text';

describe('Text', () => {
  it('When Text is created from empty string then zero lines', () => {
    const instance: EdgeText = createEdgeText('');
    expect(instance.svg).toEqual('');
    expect(instance.lines).toEqual([]);
    expect(instance.numLines).toEqual(0);
    expect(instance.maxLineLength).toEqual(0);
  });

  it('When text has one line then have one line trimmed', () => {
    const instance: EdgeText = createEdgeText('  <text>exception</text>   ');
    expect(instance.svg).toEqual('  <text>exception</text>   ');
    expect(instance.lines.map((line) => line.svg)).toEqual(['<text>exception</text>']);
    expect(instance.numLines).toEqual(1);
    expect(instance.maxLineLength).toEqual(9);
  });

  it('When text has two lines', () => {
    const instance = createEdgeText('  <text>success</text><text>exception</text>  ');
    expect(instance.numLines).toEqual(2);
    expect(instance.lines.map((line) => line.svg)).toEqual(['<text>success</text>', '<text>exception</text>']);
    // The second line is trimmed, length of word "exception"
    expect(instance.maxLineLength).toEqual(9);
    expect(instance.svg).toEqual('  <text>success</text><text>exception</text>  ');
  });
});

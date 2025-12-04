import { createEdgeText, EdgeText } from './text';

const FONT_SIZE = 10;

describe('Text', () => {
  it('When Text is created from empty string then zero lines', () => {
    const instance: EdgeText = createEdgeText('', FONT_SIZE);
    expect(instance.html).toEqual('');
    expect(instance.lines).toEqual([]);
    expect(instance.numLines).toEqual(0);
    expect(instance.maxLineLength).toEqual(0);
  });

  it('When text has one line then have one line trimmed', () => {
    const instance: EdgeText = createEdgeText('  exception   ', FONT_SIZE);
    expect(instance.html).toEqual('exception');
    expect(instance.lines.map((l) => l.text)).toEqual(['exception']);
    expect(instance.numLines).toEqual(1);
    expect(instance.maxLineLength).toEqual(9);
  });

  it('When text has two lines then over-all HTML joined by <br/>', () => {
    const instance = createEdgeText('success<br/>  exception  ', FONT_SIZE);
    expect(instance.numLines).toEqual(2);
    expect(instance.lines.map((l) => l.text)).toEqual(['success', 'exception']);
    // The second line is trimmed, length of word "exception"
    expect(instance.maxLineLength).toEqual(9);
    expect(instance.html).toEqual('success<br/>exception');
  });
});

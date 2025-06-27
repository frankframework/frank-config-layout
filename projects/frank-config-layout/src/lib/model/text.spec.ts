import { createEdgeText, createNodeText, EdgeText, NodeText } from './text';

describe('EdgeText', () => {
  it('When EdgeText is created from empty string then zero lines', () => {
    const instance: EdgeText = createEdgeText('');
    expect(instance.html).toEqual('');
    expect(instance.lines).toEqual([]);
    expect(instance.numLines).toEqual(0);
    expect(instance.maxLineLength).toEqual(0);
  });

  it('When text has one line then have one line trimmed', () => {
    const instance: EdgeText = createEdgeText('  exception   ');
    expect(instance.html).toEqual('exception');
    expect(instance.lines).toEqual(['exception']);
    expect(instance.numLines).toEqual(1);
    expect(instance.maxLineLength).toEqual(9);
  });

  it('When text has two lines then over-all HTML joined by <br/>', () => {
    const instance = createEdgeText('success<br/>  exception  ');
    expect(instance.numLines).toEqual(2);
    expect(instance.lines).toEqual(['success', 'exception']);
    // The second line is trimmed, length of word "exception"
    expect(instance.maxLineLength).toEqual(9);
    expect(instance.html).toEqual('success<br/>exception');
  });
});

describe('NodeText', () => {
  it('When HTML has one non-bold line then line is put in lines as-is', () => {
    const nodeText: NodeText = createNodeText('my simple line');
    expect(nodeText.html).toEqual('my simple line');
    expect(nodeText.lines).toEqual([{ text: 'my simple line', isBold: false }]);
  });

  it('When HTML has one line with bold elements then plain text of line is put in lines as bold', () => {
    const nodeText: NodeText = createNodeText('<b>TestCompareString</b>');
    expect(nodeText.html).toEqual('<b>TestCompareString</b>');
    expect(nodeText.lines).toEqual([{ text: 'TestCompareString', isBold: true }]);
  });

  it('When HTML has two lines then each line is in a separate element of lines', () => {
    const nodeText: NodeText = createNodeText('<b>TestCompareString</b><br/>my line');
    expect(nodeText.html).toEqual('<b>TestCompareString</b><br/>my line');
    expect(nodeText.lines.length).toEqual(2);
    expect(nodeText.lines[0]).toEqual({ text: 'TestCompareString', isBold: true });
    expect(nodeText.lines[1]).toEqual({ text: 'my line', isBold: false });
  });
});

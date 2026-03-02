import { NodeText, NodeTextDimensions } from '../model/text';
import { getGraphFromMermaid } from './mermaid-parser';

describe('Parse Mermaid', () => {
  it('Simple node definition', () => {
    const input = `
  d2e2('<text data-html-node="b">Test1</text><text>JavaListener</text>'):::normal
  `;
    const result = getGraphFromMermaid(input, dimensions());
    expect(result.nodes.length).toEqual(1);
    expect(result.nodes[0].id).toEqual('d2e2');
    expect(result.nodes[0].text.html).toEqual('<text data-html-node="b">Test1</text><text>JavaListener</text>');
    expect(result.nodes[0].style).toEqual('normal');
  });

  it('Nodes connected by edge and HTML elements', () => {
    const input = `
  d2e2('<text data-html-node="b">Test1</text><text>JavaListener</text>'):::normal
  d2e12('<text data-html-node="b">InputValidator</text>'):::normal
  d2e2 --> |<text>success</text>| d2e12
    `;
    const result = getGraphFromMermaid(input, dimensions());
    expect(result.nodes.length).toEqual(2);
    expect(result.nodes[0].id).toEqual('d2e2');
    expect(result.nodes[1].id).toEqual('d2e12');
    const text0: NodeText = result.nodes[0].text;
    expect(text0.html).toContain('Test');
    expect(text0.parts.length).toEqual(2);
    expect(text0.parts[0].textElement).toEqual('<text data-html-node="b">Test1</text>');
    // Text outside an HTML element.
    expect(text0.parts[1].textElement).toEqual('<text>JavaListener</text>');
    expect(result.nodes[1].text.html).toContain('<text data-html-node="b">InputValidator</text>');
    expect(result.nodes[0].style).toEqual('normal');
    expect(result.edges.length).toEqual(1);
    expect(result.edges[0].from.id).toEqual('d2e2');
    expect(result.edges[0].to.id).toEqual('d2e12');
    expect(result.edges[0].text.html).toEqual('<text>success</text>');
    expect(result.getEdgeByKey('d2e2-d2e12')!.from.id).toEqual('d2e2');
    expect(result.getEdgeByKey('d2e2-d2e12')!.to.id).toEqual('d2e12');
  });
});

// Dummy dimensions
function dimensions(): NodeTextDimensions {
  return {
    nodeTextFontSize: 16,
    nodeTextBorder: 4,
  };
}

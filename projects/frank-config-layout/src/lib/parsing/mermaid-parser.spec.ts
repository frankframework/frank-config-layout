import { EdgeLabelDimensions } from '../graphics/edge-label-layouter';
import { NodeText, NodeTextDimensions } from '../model/text';
import { getGraphFromMermaid } from './mermaid-parser';

describe('Parse Mermaid', () => {
  it('Simple node definition', () => {
    const input = `
flowchart
    d2e2("<b>Test1</b><br/>JavaListener"):::normal
  `;
    const result = getGraphFromMermaid(input, dimensions(), dimensions());
    expect(result.nodes.length).toEqual(1);
    expect(result.nodes[0].id).toEqual('d2e2');
    expect(result.nodes[0].text.html).toEqual('<b>Test1</b><br/>JavaListener');
    expect(result.nodes[0].style).toEqual('normal');
  });

  it('Nodes connected by edge and HTML elements', () => {
    const input = `
flowchart
d2e2("<b>Test1</b><br/>JavaListener"):::normal
d2e12("<b>InputValidator</b>"):::normal
d2e2 --> |success| d2e12
    `;
    const result = getGraphFromMermaid(input, dimensions(), dimensions());
    expect(result.nodes.length).toEqual(2);
    expect(result.nodes[0].id).toEqual('d2e2');
    expect(result.nodes[1].id).toEqual('d2e12');
    const text0: NodeText = result.nodes[0].text;
    expect(text0.html).toContain('Test');
    expect(text0.parts.length).toEqual(2);
    expect(text0.parts[0].name).toEqual('b');
    expect(text0.parts[0].text).toEqual('Test1');
    // Text outside an HTML element.
    expect(text0.parts[1].name).toEqual('#text');
    expect(text0.parts[1].text).toEqual('JavaListener');
    expect(result.nodes[1].text.html).toContain('InputValidator');
    expect(result.nodes[0].style).toEqual('normal');
    expect(result.edges.length).toEqual(1);
    expect(result.edges[0].from.id).toEqual('d2e2');
    expect(result.edges[0].to.id).toEqual('d2e12');
    expect(result.edges[0].text.html).toEqual('success');
    expect(result.getEdgeByKey('d2e2-d2e12')!.from.id).toEqual('d2e2');
    expect(result.getEdgeByKey('d2e2-d2e12')!.to.id).toEqual('d2e12');
  });
});

// Dummy dimensions
function dimensions(): NodeTextDimensions & EdgeLabelDimensions {
  return {
    nodeTextFontSize: 16,
    nodeTextBorder: 4,
    edgeLabelFontSize: 10,
    preferredVertDistanceFromOrigin: 5,
    strictlyKeepLabelOutOfBox: true,
  };
}

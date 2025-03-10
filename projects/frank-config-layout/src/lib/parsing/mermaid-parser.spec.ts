import { getGraphFromMermaid } from './mermaid-parser';

describe('Parse Mermaid', () => {
  it('Simple node definition', () => {
    const input = `
flowchart
    d2e2("<b>Test1</b><br/>JavaListener"):::normal
  `;
    const result = getGraphFromMermaid(input);
    expect(result.nodes.length).toEqual(1);
    expect(result.nodes[0].id).toEqual('d2e2');
    expect(result.nodes[0].text).toEqual('<b>Test1</b><br/>JavaListener');
    expect(result.nodes[0].style).toEqual('normal');
  });

  it('Nodes connected by edge', () => {
    const input = `
flowchart
d2e2("<b>Test1</b><br/>JavaListener"):::normal
d2e12("<b>InputValidator</b>"):::normal
d2e2 --> |success| d2e12
    `;
    const result = getGraphFromMermaid(input);
    expect(result.nodes.length).toEqual(2);
    expect(result.nodes[0].id).toEqual('d2e2');
    expect(result.nodes[1].id).toEqual('d2e12');
    expect(result.nodes[0].text).toContain('Test');
    expect(result.nodes[1].text).toContain('InputValidator');
    expect(result.nodes[0].style).toEqual('normal');
    expect(result.edges.length).toEqual(1);
    expect(result.edges[0].from.id).toEqual('d2e2');
    expect(result.edges[0].to.id).toEqual('d2e12');
    expect(result.edges[0].text.html).toEqual('success');
    expect(result.getEdgeByKey('d2e2-d2e12')!.from.id).toEqual('d2e2');
    expect(result.getEdgeByKey('d2e2-d2e12')!.to.id).toEqual('d2e12');
  });
});

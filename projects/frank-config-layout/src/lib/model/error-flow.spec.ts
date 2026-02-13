import { getKey } from './graph';
import { getGraphFromMermaid } from '../parsing/mermaid-parser';
import {
  findErrorFlow,
  OriginalGraph,
  ERROR_STATUS_SUCCESS,
  ERROR_STATUS_MIXED,
  ERROR_STATUS_ERROR,
} from './error-flow';
import { NodeTextDimensions } from './text';
import { EdgeLabelDimensions } from '../graphics/edge-label-layouter';

describe('Distinguish error flow', () => {
  it('No error flow', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |success| N2
`;
    const b = getGraphFromMermaid(input, dimensions());
    const c: OriginalGraph = findErrorFlow(b);
    expect(c.nodes.length).toEqual(2);
    expect(c.nodes.map((n) => n.id)).toEqual(['N1', 'N2']);
    expect(c.edges.map((e) => getKey(e))).toEqual(['N1-N2']);
    checkErrorNode(c, 'N1', ERROR_STATUS_SUCCESS);
    checkErrorNode(c, 'N2', ERROR_STATUS_SUCCESS);
    checkErrorEdge(c, 'N1-N2', ERROR_STATUS_SUCCESS);
  });

  it('No error flow if edge has no text', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> N2
`;
    const b = getGraphFromMermaid(input, dimensions());
    const c: OriginalGraph = findErrorFlow(b);
    expect(c.nodes.length).toEqual(2);
    expect(c.nodes.map((n) => n.id)).toEqual(['N1', 'N2']);
    expect(c.edges.map((e) => getKey(e))).toEqual(['N1-N2']);
    checkErrorNode(c, 'N1', ERROR_STATUS_SUCCESS);
    checkErrorNode(c, 'N2', ERROR_STATUS_SUCCESS);
    checkErrorEdge(c, 'N1-N2', ERROR_STATUS_SUCCESS);
  });

  it('Node is error and edge is error because it originates from error node', () => {
    const input = `
N1(""):::errorOutline
N2(""):::normal
N1 --> |success| N2
`;
    const b = getGraphFromMermaid(input, dimensions());
    const c: OriginalGraph = findErrorFlow(b);
    expect(c.nodes.length).toEqual(2);
    expect(c.nodes.map((n) => n.id)).toEqual(['N1', 'N2']);
    expect(c.edges.map((e) => getKey(e))).toEqual(['N1-N2']);
    checkErrorNode(c, 'N1', ERROR_STATUS_ERROR);
    checkErrorNode(c, 'N2', ERROR_STATUS_SUCCESS);
    checkErrorEdge(c, 'N1-N2', ERROR_STATUS_ERROR);
  });

  it('Edge is error because of forward name', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |exception| N2
`;
    const b = getGraphFromMermaid(input, dimensions());
    const c: OriginalGraph = findErrorFlow(b);
    expect(c.nodes.length).toEqual(2);
    expect(c.nodes.map((n) => n.id)).toEqual(['N1', 'N2']);
    expect(c.edges.map((e) => getKey(e))).toEqual(['N1-N2']);
    checkErrorNode(c, 'N1', ERROR_STATUS_SUCCESS);
    checkErrorNode(c, 'N2', ERROR_STATUS_SUCCESS);
    checkErrorEdge(c, 'N1-N2', ERROR_STATUS_ERROR);
    expect(c.getEdgeByKey('N1-N2').text.numLines).toEqual(1);
  });

  it('When an edge has both success and error labels then it has error status mixed', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |exception<br/>success| N2
`;
    const b = getGraphFromMermaid(input, dimensions());
    const c: OriginalGraph = findErrorFlow(b);
    expect(c.nodes.length).toEqual(2);
    expect(c.nodes.map((n) => n.id)).toEqual(['N1', 'N2']);
    expect(c.edges.map((e) => getKey(e))).toEqual(['N1-N2']);
    checkErrorNode(c, 'N1', ERROR_STATUS_SUCCESS);
    checkErrorNode(c, 'N2', ERROR_STATUS_SUCCESS);
    checkErrorEdge(c, 'N1-N2', ERROR_STATUS_MIXED);
    expect(c.getEdgeByKey('N1-N2').text.numLines).toEqual(2);
  });

  it('When edge text has multiple lines, then the number of lines is calculated correctly', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |success<br/>  exception  | N2`;
    const b = getGraphFromMermaid(input, dimensions());
    const c: OriginalGraph = findErrorFlow(b);
    const instance = c.getEdgeByKey('N1-N2');
    expect(instance.text.numLines).toEqual(2);
    expect(instance.text.lines).toEqual(['success', 'exception']);
    // The second line is trimmed, length of word 'exception'
    expect(instance.text.maxLineLength).toEqual(9);
  });
});

function checkErrorNode(b: OriginalGraph, nodeId: string, expectedErrorStatus: number): void {
  expect(b.getNodeById(nodeId).errorStatus).toEqual(expectedErrorStatus);
}

function checkErrorEdge(b: OriginalGraph, edgeKey: string, expectedErrorStatus: number): void {
  expect(b.getEdgeByKey(edgeKey).errorStatus).toEqual(expectedErrorStatus);
}

// Dummy dimensions
function dimensions(): NodeTextDimensions & EdgeLabelDimensions {
  return {
    nodeTextFontSize: 16,
    nodeTextBorder: 4,
    estEdgeLabelLineHeight: 10,
    preferredVertDistanceFromOrigin: 5,
    strictlyKeepLabelOutOfBox: true,
    estEdgeLabelCharacterWidth: 0,
  };
}

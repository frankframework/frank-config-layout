import { getGraphFromMermaid } from '../parsing/mermaid-parser'
import { Node, Edge, GraphBase } from './graph'

import { categorize, CategorizedNode, CategorizedEdge } from './error-flow'

describe('Distinguish error flow', () => {
  it('No error flow', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |success| N2
`
    const b = getGraphFromMermaid(input)
    const c: GraphBase = categorize(b)
    expect(c.getNodes().length).toEqual(2)
    expect(c.getNodes().map(n => n.getId())).toEqual(['N1', 'N2'])
    expect(c.getEdges().map(e => e.getKey())).toEqual(['N1-N2'])
    checkErrorNode(c, 'N1', false)
    checkErrorNode(c, 'N2', false)
    checkErrorEdge(c, 'N1-N2', false)
  })

  it('No error flow if edge has no text', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> N2
`
    const b = getGraphFromMermaid(input)
    const c: GraphBase = categorize(b)
    expect(c.getNodes().length).toEqual(2)
    expect(c.getNodes().map(n => n.getId())).toEqual(['N1', 'N2'])
    expect(c.getEdges().map(e => e.getKey())).toEqual(['N1-N2'])
    checkErrorNode(c, 'N1', false)
    checkErrorNode(c, 'N2', false)
    checkErrorEdge(c, 'N1-N2', false)
  })

  it('Node is error and edge is error because it originates from error node', () => {
    const input = `
N1(""):::errorOutline
N2(""):::normal
N1 --> |success| N2
`
    const b = getGraphFromMermaid(input)
    const c: GraphBase = categorize(b)
    expect(c.getNodes().length).toEqual(2)
    expect(c.getNodes().map(n => n.getId())).toEqual(['N1', 'N2'])
    expect(c.getEdges().map(e => e.getKey())).toEqual(['N1-N2'])
    checkErrorNode(c, 'N1', true)
    checkErrorNode(c, 'N2', false)
    checkErrorEdge(c, 'N1-N2', true)
  })

  it('Edge is error because of forward name', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |exception| N2
`
    const b = getGraphFromMermaid(input)
    const c: GraphBase = categorize(b)
    expect(c.getNodes().length).toEqual(2)
    expect(c.getNodes().map(n => n.getId())).toEqual(['N1', 'N2'])
    expect(c.getEdges().map(e => e.getKey())).toEqual(['N1-N2'])
    checkErrorNode(c, 'N1', false)
    checkErrorNode(c, 'N2', false)
    checkErrorEdge(c, 'N1-N2', true)
    expect( (c.getEdgeByKey('N1-N2') as CategorizedEdge).getNumLines()).toEqual(1)
  })

  function checkErrorNode(b: GraphBase, nodeId: string, expectError: boolean) {
    expect( (b.getNodeById(nodeId) as CategorizedNode).isError).toEqual(expectError)
  }

  function checkErrorEdge(b: GraphBase, edgeKey: string, expectError: boolean) {
    expect( (b.getEdgeByKey(edgeKey) as CategorizedEdge).isError).toEqual(expectError)
  }

  it('When edge text has multiple lines, then the number of lines is calculated correctly', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |success<br/>exception| N2`
    const b = getGraphFromMermaid(input)
    const c: GraphBase = categorize(b)
    expect( (c.getEdgeByKey('N1-N2') as CategorizedEdge).getNumLines()).toEqual(2)
  })
})

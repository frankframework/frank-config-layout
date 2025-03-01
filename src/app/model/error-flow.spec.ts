import { getKey } from './generic-graph'
import { getGraphFromMermaid } from '../parsing/mermaid-parser'
import { findErrorFlow, OriginalGraph } from './error-flow'

describe('Distinguish error flow', () => {
  it('No error flow', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |success| N2
`
    const b = getGraphFromMermaid(input)
    const c: OriginalGraph = findErrorFlow(b)
    expect(c.nodes.length).toEqual(2)
    expect(c.nodes.map(n => n.id)).toEqual(['N1', 'N2'])
    expect(c.edges.map(e => getKey(e))).toEqual(['N1-N2'])
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
    const c: OriginalGraph = findErrorFlow(b)
    expect(c.nodes.length).toEqual(2)
    expect(c.nodes.map(n => n.id)).toEqual(['N1', 'N2'])
    expect(c.edges.map(e => getKey(e))).toEqual(['N1-N2'])
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
    const c: OriginalGraph = findErrorFlow(b)
    expect(c.nodes.length).toEqual(2)
    expect(c.nodes.map(n => n.id)).toEqual(['N1', 'N2'])
    expect(c.edges.map(e => getKey(e))).toEqual(['N1-N2'])
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
    const c: OriginalGraph = findErrorFlow(b)
    expect(c.nodes.length).toEqual(2)
    expect(c.nodes.map(n => n.id)).toEqual(['N1', 'N2'])
    expect(c.edges.map(e => getKey(e))).toEqual(['N1-N2'])
    checkErrorNode(c, 'N1', false)
    checkErrorNode(c, 'N2', false)
    checkErrorEdge(c, 'N1-N2', true)
    expect( (c.getEdgeByKey('N1-N2')).text.numLines).toEqual(1)
  })

  function checkErrorNode(b: OriginalGraph, nodeId: string, expectError: boolean) {
    expect( (b.getNodeById(nodeId)).isError).toEqual(expectError)
  }

  function checkErrorEdge(b: OriginalGraph, edgeKey: string, expectError: boolean) {
    expect( (b.getEdgeByKey(edgeKey)).isError).toEqual(expectError)
  }

  it('When edge text has multiple lines, then the number of lines is calculated correctly', () => {
    const input = `
N1(""):::normal
N2(""):::normal
N1 --> |success<br/>  exception  | N2`
    const b = getGraphFromMermaid(input)
    const c: OriginalGraph = findErrorFlow(b)
    const instance = c.getEdgeByKey('N1-N2')
    expect(instance.text.numLines).toEqual(2)
    expect(instance.text.lines).toEqual(["success", "exception"])
    // The second line is trimmed, length of word "exception"
    expect(instance.text.maxLineLength).toEqual(9)
  })
})

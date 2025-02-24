import { getGraphFromMermaid } from './mermaid-parser';
import { ConcreteNode, Node, ConcreteEdge, Edge, GraphConnectionsDecorator, Graph } from '../model/graph'

describe('Parse Mermaid', () => {
  it('Simple node definition', () => {
    const input = `
flowchart
    d2e2("<b>Test1</b><br/>JavaListener"):::normal
  `
    const result = getGraphFromMermaid(input)
    expect(result.getNodes().length).toEqual(1)
    expect((result.getNodes()[0] as ConcreteNode).sequence).toEqual(0)
    expect(result.getNodes()[0].getId()).toEqual('d2e2')
    expect((result.getNodes()[0] as ConcreteNode).style).toEqual('normal')
  })

  it('Nodes connected by edge', () => {
    const input = `
flowchart
d2e2("<b>Test1</b><br/>JavaListener"):::normal
d2e12("<b>InputValidator</b>"):::normal
d2e2 --> |success| d2e12
    `
    const result = getGraphFromMermaid(input)
    expect(result.getNodes().length).toEqual(2)
    expect((result.getNodes()[0] as ConcreteNode).sequence).toEqual(0)
    expect((result.getNodes()[1] as ConcreteNode).sequence).toEqual(1)
    expect(result.getNodes()[0].getId()).toBe('d2e2')
    expect(result.getNodes()[1].getId()).toBe('d2e12')
    expect((result.getNodes()[0] as ConcreteNode).text).toContain('Test')
    expect((result.getNodes()[1] as ConcreteNode).text).toContain('InputValidator')
    expect((result.getNodeById('d2e2')! as ConcreteNode).sequence).toBe(0)
    expect((result.getNodeById('d2e12')! as ConcreteNode).sequence).toBe(1)
    expect(result.getNodes()[0].getId()).toEqual('d2e2')
    expect((result.getNodes()[0] as ConcreteNode).style).toEqual('normal')
    expect(result.getEdges().length).toBe(1)
    expect(result.getEdges()[0].getFrom().getId()).toBe('d2e2')
    expect(result.getEdges()[0].getTo().getId()).toBe('d2e12')
    expect((result.getEdges()[0] as ConcreteEdge).seq).toBe(0)
    expect((result.getEdges()[0] as ConcreteEdge).text).toBe('success')
    expect(result.getEdgeByKey('d2e2-d2e12')!.getFrom().getId()).toBe('d2e2')
    expect(result.getEdgeByKey('d2e2-d2e12')!.getTo().getId()).toBe('d2e12')
  })

  it('Calculation of outgoing and incoming edges', () => {
    const input = `
    flowchart
    Start(""):::normal
    Unconnected(""):::normal
    N1(""):::normal
    N2(""):::normal
    N3(""):::normal
    End(""):::normal
    Start --> |success| N1
    Start --> |success| N2
    N1 --> |success| N3
    N2 --> |success| N3
    N3 --> |success| N2
    N3 --> |success| End
`
    let base = getGraphFromMermaid(input)
    let g = new GraphConnectionsDecorator(base)
    checkNodePointsTo("Start", ["N1", "N2"], g)
    checkNodeReachedFrom("Start", [], g)
    checkNodePointsTo("N1", ["N3"], g)
    checkNodeReachedFrom("N1", ["Start"], g)
    checkNodePointsTo("N2", ["N3"], g)
    checkNodeReachedFrom("N2", ["Start", "N3"], g)
    checkNodePointsTo("N3", ["N2", "End"], g)
    checkNodeReachedFrom("N3", ["N1", "N2"], g)
    checkNodePointsTo("End", [], g)
    checkNodeReachedFrom("End", ["N3"], g)
    checkNodePointsTo("Unconnected", [], g)
    checkNodeReachedFrom("Unconnected", [], g)
  })

  function checkNodePointsTo(fromId: string, toIds: string[], g: Graph) {
    let from: Node = g.getNodeById(fromId)!
    let toEdges: readonly Edge[] = g.getOrderedEdgesStartingFrom(from)
    expect(toEdges.map(edge => edge.getTo()).map(n => n.getId())).toEqual(toIds)
  }

  function checkNodeReachedFrom(toId: string, fromIds: string[], g: Graph) {
    let to: Node = g.getNodeById(toId)!
    let fromEdges: readonly Edge[] = g.getOrderedEdgesLeadingTo(to)
    expect(fromEdges.map(edge => edge.getFrom()).map(n => n.getId())).toEqual(fromIds)
  }
});

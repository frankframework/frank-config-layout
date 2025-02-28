import { WithId, Connection, Graph, getKey } from './generic-graph'

describe('Generic graph', () => {
  it('When a graph is created, the nodes and the edges are related correctly', () => {
    const g = getTestGraph()
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

  it('Parse node or edge id', () => {
    const g: Graph<WithId, TestEdge> = getTestGraph()
    expect(g.parseNodeOrEdgeId('Start').optionalEdge).toEqual(undefined)
    expect(g.parseNodeOrEdgeId('Start').optionalNode?.id).toEqual('Start')
    expect(g.parseNodeOrEdgeId('Start-N1').optionalNode).toEqual(undefined)
    expect(g.parseNodeOrEdgeId('Start-N1').optionalEdge?.from.id).toEqual('Start')
    expect(g.parseNodeOrEdgeId('Start-N1').optionalEdge?.to.id).toEqual('N1')
    expect(getKey(g.parseNodeOrEdgeId('Start-N1').optionalEdge!)).toEqual('Start-N1')
    expect(g.parseNodeOrEdgeId('Start-End').optionalNode).toEqual(undefined)
    expect(g.parseNodeOrEdgeId('Start-End').optionalEdge).toEqual(undefined)
    expect(g.parseNodeOrEdgeId('xyz').optionalNode).toEqual(undefined)
    expect(g.parseNodeOrEdgeId('xyz').optionalEdge).toEqual(undefined)
  })
})

interface TestEdge {
  from: WithId,
  to: WithId
}

function getTestGraph(): Graph<WithId, TestEdge> {
  const g = new Graph<WithId, Connection<WithId>>()
  newNode('Start', g)
  newNode('Unconnected', g)
  newNode('N1', g)
  newNode('N2', g)
  newNode('N3', g)
  newNode('End', g)
  newEdge('Start', 'N1', g)
  newEdge('Start', 'N2', g)
  newEdge('N1', 'N3', g)
  newEdge('N2', 'N3', g)
  newEdge('N3', 'N2', g)
  newEdge('N3', 'End', g)
  return g
}

function newNode(id: string, g: Graph<WithId, Connection<WithId>>) {
  g.addNode({id})
}

function newEdge(fromId: string, toId: string, g: Graph<WithId, Connection<WithId>>) {
  const from: WithId | undefined = g.getNodeById(fromId)
  const to: WithId | undefined = g.getNodeById(toId)
  if (from === undefined) {
    throw new Error(`Invalid test case, node with id ${fromId} does not exist`)
  }
  if (to === undefined) {
    throw new Error(`Invalid test case, node with id ${toId} does not exist`)
  }
  g.addEdge({from, to})
}

function checkNodePointsTo(fromId: string, toIds: string[], g: Graph<WithId, TestEdge>) {
  const from: WithId = g.getNodeById(fromId)
  const successors: readonly WithId[] = g.getSuccessors(from)
  expect(successors.map(n => n.id)).toEqual(toIds)
}

function checkNodeReachedFrom(toId: string, fromIds: string[], g: Graph<WithId, TestEdge>) {
  let to: WithId = g.getNodeById(toId)
  let predecessors: readonly WithId[] = g.getPredecessors(to)
  expect(predecessors.map(n => n.id)).toEqual(fromIds)
}

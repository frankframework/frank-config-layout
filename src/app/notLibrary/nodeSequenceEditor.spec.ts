import { NodeSequenceEditor, ConcreteNodeSequenceEditor, UpdateResponse } from "./nodeSequenceEditor";
import { createText } from "../model/text";
import { Graph } from '../model/generic-graph'
import { Node, Edge } from '../public.api'

function getInstanceToCheckOrdering(): ConcreteNodeSequenceEditor {
  const g = new Graph<Node, Edge<Node>>()
  g.addNode(newTestNode('1A', 0))
  g.addNode(newTestNode('5B', 0))
  g.addNode(newTestNode('4C', 1))
  g.addNode(newTestNode('3D', 1))
  g.addNode(newTestNode('2E', 0))
  connect('1A','4C', g)
  connect('5B','2E', g)
  return new ConcreteNodeSequenceEditor(g)
}

function newTestNode(id: string, layer: number): Node {
  return {id, layer, text: '', isError: false, isIntermediate: false}
}

function connect(idFrom: string, idTo: string, g: Graph<Node, Edge<Node>>) {
  g.addEdge({
    from: g.getNodeById(idFrom),
    to: g.getNodeById(idTo),
    isError: false,
    isIntermediate: false,
    text: createText(undefined)
  })
}

function getSimpleInstance(): ConcreteNodeSequenceEditor {
  const g = new Graph<Node, Edge<Node>>()
  addEdgesToSimple(g, simpleNodeToLayerMap())
  return new ConcreteNodeSequenceEditor(g)
}

function addEdgesToSimple(g: Graph<Node, Edge<Node>>, nodeIdToLayer: Map<string, number>) {
  g.addNode(newTestNode('A', nodeIdToLayer.get('A')!))
  g.addNode(newTestNode('B', nodeIdToLayer.get('B')!))
  g.addNode(newTestNode('C', nodeIdToLayer.get('C')!))
  g.addNode(newTestNode('D', nodeIdToLayer.get('D')!))
  g.addNode(newTestNode('E', nodeIdToLayer.get('E')!))
  connect('A','C', g)
  connect('B','E', g)
}

function simpleNodeToLayerMap(): Map<string, number> {
  return new Map<string, number>([
    ['A', 0],
    ['B', 0],
    ['C', 1],
    ['D', 1],
    ['E', 0]
  ])
}

describe('NodeSequenceEditor', () => {
  it('Nodes are ordered by layer, within layer order is preserved', () => {
    let instance = getInstanceToCheckOrdering()
    const newOrder = instance.getSequence()
    const theIds = newOrder.map(n => n!.id)
    expect(theIds).toEqual(['1A', '5B', '2E', '4C', '3D'])
  })

  it('Check positions of nodes', () => {
    let instance = getInstanceToCheckOrdering()
    expect(instance.getNumLayers()).toBe(2)
    expect(instance.getPositionsInLayer(0)).toEqual([0, 1, 2])
    expect(instance.getPositionsInLayer(1)).toEqual([3, 4])
    expect([0, 1, 2, 3, 4].map(i => instance.getLayerOfPosition(i)))
      .toEqual([0, 0, 0, 1, 1])
  })

  it('Check properly initialized', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    checkInitialState(instance)
  })

  function checkInitialState(instance: NodeSequenceEditor) {
    expect(instance.getSequence().map(n => n!.id)).toEqual(['A', 'B', 'E', 'C', 'D'])
    expect(instance.getSequenceInLayer(0).map(n => n!.id)).toEqual(['A', 'B', 'E'])
    expect(instance.getSequenceInLayer(1).map(n => n!.id)).toEqual(['C', 'D'])
    const cell03 = instance.getCell(0, 3)
    expect(cell03.getFromPosition()).toEqual(0)
    expect(cell03.getToPosition()).toEqual(3)
    expect(cell03.getLayerFrom()).toEqual(0)
    expect(cell03.getLayerTo()).toEqual(1)
    expect(cell03.getEdgeIfConnected()!.from.id).toBe('A')
    expect(cell03.getEdgeIfConnected()!.to.id).toBe('C')
    expect(instance.getOrderedOmittedNodes()).toEqual([])
    expect(instance.getOrderedOmittedNodesInLayer(0)).toEqual([])
    expect(instance.getOrderedOmittedNodesInLayer(1)).toEqual([])
  }

  it('Move node upward, rotating the nodes in between', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    // No need to test the permutation here so thoroughly because
    // the swapping is done based on the permutation. With a wrong
    // permutation, the swapping result would be wrong.
    instance.rotateToSwap(0, 2)
    expect(instance.getSequenceInLayer(0).map(n => n!.id)).toEqual(['B', 'E', 'A'])
    expect(instance.getSequenceInLayer(1).map(n => n!.id)).toEqual(['C', 'D'])
    expect(instance.getSequence().map(n => n!.id)).toEqual(['B', 'E', 'A', 'C', 'D'])
    expect(instance.getCell(2, 3).getEdgeIfConnected()!.from.id).toBe('A')
    expect(instance.getCell(2, 3).getEdgeIfConnected()!.to.id).toBe('C')
  })

  it('Move node downward, rotating the nodes in between', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    // No need to test the permutation here so thoroughly because
    // the swapping is done based on the permutation. With a wrong
    // permutation, the swapping result would be wrong.
    instance.rotateToSwap(2, 0)
    expect(instance.getSequenceInLayer(0).map(n => n!.id)).toEqual(['E', 'A', 'B'])
    expect(instance.getSequenceInLayer(1).map(n => n!.id)).toEqual(['C', 'D'])
    expect(instance.getSequence().map(n => n!.id)).toEqual(['E', 'A', 'B', 'C', 'D'])
    expect(instance.getCell(1, 3).getEdgeIfConnected()!.from.id).toBe('A')
    expect(instance.getCell(1, 3).getEdgeIfConnected()!.to.id).toBe('C')
  })

  it('Move node up to swap with adjacent', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    // No need to test the permutation here so thoroughly because
    // the swapping is done based on the permutation. With a wrong
    // permutation, the swapping result would be wrong.
    expect(instance.rotateToSwap(3, 4)).toEqual([0, 1, 2, 4, 3])
    expect(instance.getSequence().map(node => node?.id)).toEqual(['A', 'B', 'E', 'D', 'C'])
    checkAfterSwapping(instance)
  })

  function checkAfterSwapping(instance: NodeSequenceEditor) {
    expect(instance.getSequenceInLayer(0).map(n => n!.id)).toEqual(['A', 'B', 'E'])
    expect(instance.getSequenceInLayer(1).map(n => n!.id)).toEqual(['D', 'C'])
    expect(instance.getSequence().map(n => n!.id)).toEqual(['A', 'B', 'E', 'D', 'C'])
    expect(instance.getCell(0, 4).getEdgeIfConnected()!.from.id).toBe('A')
    expect(instance.getCell(0, 4).getEdgeIfConnected()!.to.id).toBe('C')
  }

  it('Move node down to swap with adjacent', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    instance.rotateToSwap(4, 3)
    checkAfterSwapping(instance)
  })

  it('Omit node that is from node of edge', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    instance.omitNodeFrom(0)
    checkStateAfterOmittingPositionZero(instance)
  })

  function checkStateAfterOmittingPositionZero(instance: NodeSequenceEditor) {
    expect(instance.getSequence()[0]).toBe(null)
    expect(instance.getSequence().slice(1, 5).map(n => n!.id)).toEqual(['B', 'E', 'C', 'D'])
    expect(instance.getSequenceInLayer(0)[0]).toBe(null)
    expect(instance.getSequenceInLayer(0).length).toBe(3)
    expect(instance.getSequenceInLayer(0).slice(1, 3).map(n => n!.id)).toEqual(['B', 'E'])
    expect(instance.getSequenceInLayer(1).map(n => n!.id)).toEqual(['C', 'D'])
    const cell03 = instance.getCell(0, 3)
    expect(cell03.getFromPosition()).toBe(0)
    expect(cell03.getToPosition()).toBe(3)
    expect(cell03.getLayerFrom()).toBe(0)
    expect(cell03.getLayerTo()).toBe(1)
    expect(cell03.getEdgeIfConnected()).toBe(null)
    expect(instance.getCell(1, 2).getEdgeIfConnected()).not.toBe(null)
    expect(instance.getOrderedOmittedNodes().map(n => n.id)).toEqual(['A'])
    expect(instance.getOrderedOmittedNodesInLayer(0).map(n => n.id)).toEqual(['A'])
    expect(instance.getOrderedOmittedNodesInLayer(1).length).toBe(0)
  }

  it('Omit node that is to node of edge', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    instance.omitNodeFrom(3)
    const cell03 = instance.getCell(0, 3)
    expect(cell03.getEdgeIfConnected()).toBe(null)
  })

  it('Check order of omitted nodes and reintroducing', () => {
    const instance: ConcreteNodeSequenceEditor = getInstanceToCheckOrdering()
    // NodeSequenceEditor orders nodes by id
    // Original order is 1A, 5B, 4C, 3D, 2E
    expect(instance.getSequence().map(n => n?.id)).toEqual(['1A', '5B', '2E', '4C', '3D'])
    instance.omitNodeFrom(0)
    instance.omitNodeFrom(1)
    instance.omitNodeFrom(2)
    instance.omitNodeFrom(3)
    // Omitted nodes are not in the editor, use their original order
    expect(instance.getOrderedOmittedNodes().map(n => n.id)).toEqual(['1A', '5B', '4C', '2E'])
    expect(instance.getOrderedOmittedNodesInLayer(0).map(n => n.id)).toEqual(['1A', '5B', '2E'])
    expect(instance.reintroduceNode(0, instance.graph.getNodeById('1A')!))
    expect(instance.getOrderedOmittedNodes().map(n => n.id)).toEqual(['5B', '4C', '2E'])
    expect(instance.getOrderedOmittedNodesInLayer(0).map(n => n.id)).toEqual(['5B', '2E'])
    expect(instance.getSequence()[0]!.id).toBe('1A')
    // Rejected because position already filled and wrong layer
    expect(instance.reintroduceNode(0, instance.graph.getNodeById('4C')!)).toBe(UpdateResponse.REJECTED)
    expect(instance.getCell(0, 3).getEdgeIfConnected()).toBe(null)
    expect(instance.reintroduceNode(3, instance.graph.getNodeById('4C')!)).toBe(UpdateResponse.ACCEPTED)
    expect(instance.getCell(0, 3).getEdgeIfConnected()).not.toBe(null)
  })

  it('Check rotateToSwap swapping same node does nothing', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    expect(instance.rotateToSwap(0, 0)).toEqual([0, 1, 2, 3, 4])
    checkInitialState(instance)
  })

  it('Check rotateToSwap swapping nodes from different layers is rejected', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    // Expect the permutation that does nothing
    expect(instance.rotateToSwap(0, 3)).toEqual([0, 1, 2, 3, 4])
    checkInitialState(instance)
  })

  it('Cannot reintroduce node at position that is filled', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    expect(instance.omitNodeFrom(0)).toBe(UpdateResponse.ACCEPTED)
    checkStateAfterOmittingPositionZero(instance)
    const node: Node = instance.graph.getNodeById('A')!
    expect(node.id).toBe('A')
    expect(instance.reintroduceNode(1, node)).toBe(UpdateResponse.REJECTED)
    checkStateAfterOmittingPositionZero(instance)
  })

  it('Cannot duplicate node by reintroducing it in an empty spot', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    expect(instance.omitNodeFrom(0)).toBe(UpdateResponse.ACCEPTED)
    checkStateAfterOmittingPositionZero(instance)
    expect(instance.reintroduceNode(0, instance.getSequence()[1]!)).toBe(UpdateResponse.REJECTED)
    checkStateAfterOmittingPositionZero(instance)
  })

  it('Cannot reintroduce node that belongs to different layer', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    expect(instance.omitNodeFrom(0)).toBe(UpdateResponse.ACCEPTED)
    expect(instance.omitNodeFrom(3)).toBe(UpdateResponse.ACCEPTED)
    checkStateAfterOmittingPositionsZeroAndThree(instance)
    const node: Node = instance.graph.getNodeById('A')!
    expect(node.id).toBe('A')
    expect(instance.reintroduceNode(3, node)).toBe(UpdateResponse.REJECTED)
    checkStateAfterOmittingPositionsZeroAndThree(instance)
  })

  function checkStateAfterOmittingPositionsZeroAndThree(instance: NodeSequenceEditor) {
    expect(instance.getSequence().length).toBe(5)
    expect(instance.getSequence()[0]).toBe(null)
    expect(instance.getSequence()[1]!.id).toBe('B')
    expect(instance.getSequence()[2]!.id).toBe('E')
    expect(instance.getSequence()[3]).toBe(null)
    expect(instance.getSequence()[4]!.id).toBe('D')
    expect(instance.getSequenceInLayer(0).length).toBe(3)
    expect(instance.getSequenceInLayer(0)[0]).toBe(null)
    expect(instance.getSequenceInLayer(0)[1]!.id).toBe('B')
    expect(instance.getSequenceInLayer(0)[2]!.id).toBe('E')
    expect(instance.getSequenceInLayer(1).length).toBe(2)
    expect(instance.getSequenceInLayer(1)[0]).toBe(null)
    expect(instance.getSequenceInLayer(1)[1]!.id).toBe('D')
    expect(instance.getOrderedOmittedNodes().map(n => n.id)).toEqual(['A', 'C'])
    expect(instance.getOrderedOmittedNodesInLayer(0).map(n => n.id)).toEqual(['A'])
    expect(instance.getOrderedOmittedNodesInLayer(1).map(n => n.id)).toEqual(['C'])
  }

  it('optionalPositionOfNode', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance();
    ['A', 'B', 'E', 'C', 'D'].forEach((nodeId, expectedPosition) => {
      expect(instance.optionalPositionOfNode(nodeId)).toEqual(expectedPosition)
    })
    expect(instance.optionalPositionOfNode('X')).toEqual(null)
    instance.omitNodeFrom(0)
    expect(instance.optionalPositionOfNode('A')).toEqual(null)
  })

  // See doc/ForUnitTests/layout-to-test-class-LayoutBase.jpg
  // for the graphical representation of this layout.
  function getOtherNodeSequenceEditor(): NodeSequenceEditor {
    const g = new Graph<Node, Edge<Node>>()
    g.addNode(newTestNode('S1', 0))
    g.addNode(newTestNode('S2', 0))
    g.addNode(newTestNode('N1', 1))
    g.addNode(newTestNode('N2', 1))
    g.addNode(newTestNode('N3', 1))
    g.addNode(newTestNode('E1', 2))
    g.addNode(newTestNode('E2', 2))
    g.addNode(newTestNode('E3', 2))
    connect('S1', 'N1', g)
    connect('S1', 'N3', g)
    connect('S2', 'N3', g)
    connect('N1', 'E3', g)
    connect('N2', 'E1', g)
    connect('N3', 'E2', g)
    return new ConcreteNodeSequenceEditor(g)
  }

  it('When node is omitted then correct LayoutBase can still be extracted', () => {
    let instance = getOtherNodeSequenceEditor()
    instance.omitNodeFrom(4) // Holds N3
    let lb = instance.getShownNodesLayoutBase()
    expect(lb.getSequence()).toEqual(['S1', 'S2', 'N1', 'N2', 'E1', 'E2', 'E3'])
    expect(lb.getIdsOfLayer(0)).toEqual(['S1', 'S2'])
    expect(lb.getIdsOfLayer(1)).toEqual(['N1', 'N2'])
    expect(lb.getIdsOfLayer(2)).toEqual(['E1', 'E2', 'E3'])
    expect(lb.getConnections('S1', 1)).toEqual([0])
    expect(lb.getConnections('S2', 1)).toEqual([])
    expect(lb.getConnections('N1', 0)).toEqual([0])
    expect(lb.getConnections('N2', 0)).toEqual([])
    expect(lb.getConnections('N1', 2)).toEqual([2])
    expect(lb.getConnections('N2', 2)).toEqual([0])
    expect(lb.getConnections('E1', 1)).toEqual([1])
    expect(lb.getConnections('E2', 1)).toEqual([])
    expect(lb.getConnections('E3', 1)).toEqual([0])
  })
})

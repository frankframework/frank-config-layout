import { NodeSequenceEditor, ConcreteNodeSequenceEditor, UpdateResponse } from "./nodeSequenceEditor";
import { ConcreteNode, Node, ConcreteEdge, Edge, ConcreteGraphBase, GraphBase, GraphConnectionsDecorator, Graph  } from "./graph"

function getInstanceToCheckOrdering(): ConcreteNodeSequenceEditor {
  const g = new ConcreteGraphBase()
  g.addExistingNode(newTestNode('1A'))
  g.addExistingNode(newTestNode('5B'))
  g.addExistingNode(newTestNode('4C'))
  g.addExistingNode(newTestNode('3D'))
  g.addExistingNode(newTestNode('2E'))
  g.addEdge(createNewEdge(g.getNodeById('1A')!, g.getNodeById('4C')!))
  g.addEdge(createNewEdge(g.getNodeById('5B')!, g.getNodeById('2E')!))
  const m = new Map<string, number>([
    ['1A', 0],
    ['5B', 0],
    ['4C', 1],
    ['3D', 1],
    ['2E', 0]
  ])
  return new ConcreteNodeSequenceEditor(new GraphConnectionsDecorator(g), m)
}

function newTestNode(id: string): Node {
  return new ConcreteNode(0, id, '', '')
}

function createNewEdge(nodeFrom: Node, nodeTo: Node): Edge {
  return new ConcreteEdge(0, nodeFrom, nodeTo, '')
}

function getSimpleInstance(): ConcreteNodeSequenceEditor {
  const g = new ConcreteGraphBase()
  addEdgesToSimple(g)
  return new ConcreteNodeSequenceEditor(new GraphConnectionsDecorator(g), simpleNodeToLayerMap())
}

function addEdgesToSimple(g: ConcreteGraphBase) {
  g.addExistingNode(newTestNode('A'))
  g.addExistingNode(newTestNode('B'))
  g.addExistingNode(newTestNode('C'))
  g.addExistingNode(newTestNode('D'))
  g.addExistingNode(newTestNode('E'))
  g.addEdge(createNewEdge(g.getNodeById('A')!, g.getNodeById('C')!))
  g.addEdge(createNewEdge(g.getNodeById('B')!, g.getNodeById('E')!))
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
    const theIds = newOrder.map(n => n!.getId())
    expect(theIds).toEqual(['1A', '5B', '2E', '4C', '3D'])
  })

  it('If map nodeIdToLayer omits id then error', () => {
    const g = new ConcreteGraphBase()
    addEdgesToSimple(g)
    const m: Map<string, number> = simpleNodeToLayerMap()
    m.delete('A')
    expectInstanceCreationFails(g, m)  
  })

  function expectInstanceCreationFails(g: GraphBase, m: Map<string, number>) {
    let caught = false
    try {
      new ConcreteNodeSequenceEditor(new GraphConnectionsDecorator(g), m)  
    } catch(e) {
      caught = true
    }
    expect(caught).toBe(true)
  }

  it('If map nodeIdToLayer refers nonexistent node then error', () => {
    const g = new ConcreteGraphBase()
    addEdgesToSimple(g)
    const m: Map<string, number> = simpleNodeToLayerMap()
    m.set('X', 0)
    expectInstanceCreationFails(g, m)
  })

  it('If layer 0 is empty then error', () => {
    const g = new ConcreteGraphBase()
    addEdgesToSimple(g)
    const m: Map<string, number> = simpleNodeToLayerMap()
    const keysLayerZero: string[] = [ ... m.keys()].filter(k => m.get(k) == 0)
    keysLayerZero.forEach(k => m.set(k, 1))
    expectInstanceCreationFails(g, m)
  })

  it('If layer 1 is empty and there is a layer 2, then error', () => {
    const g = new ConcreteGraphBase()
    addEdgesToSimple(g)
    const m: Map<string, number> = simpleNodeToLayerMap()
    const keysLayerOne: string[] = [ ... m.keys()].filter(k => m.get(k) == 1)
    keysLayerOne.forEach(k => m.set(k, 2))
    expectInstanceCreationFails(g, m)
  })

  it('Member functions on layers', () => {
    let instance = getInstanceToCheckOrdering()
    expect(instance.getNumLayers()).toBe(2)
    expect(instance.getPositionsInLayer(0)).toEqual([0, 1, 2])
    expect(instance.getPositionsInLayer(1)).toEqual([3, 4])
    expect([0, 1, 2, 3, 4].map(i => instance.getLayerOfPosition(i)))
      .toEqual([0, 0, 0, 1, 1])
    expect(instance.getLayerOfNode(instance.graph.getNodeById('1A')!)).toBe(0)
    expect(instance.getLayerOfNode(instance.graph.getNodeById('4C')!)).toBe(1)
  })

  it('Check properly initialized', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    checkInitialState(instance)
  })

  function checkInitialState(instance: NodeSequenceEditor) {
    expect(instance.getSequence().map(n => n!.getId())).toEqual(['A', 'B', 'E', 'C', 'D'])
    expect(instance.getSequenceInLayer(0).map(n => n!.getId())).toEqual(['A', 'B', 'E'])
    expect(instance.getSequenceInLayer(1).map(n => n!.getId())).toEqual(['C', 'D'])
    const cell03 = instance.getCell(0, 3)
    expect(cell03.getFromPosition()).toEqual(0)
    expect(cell03.getToPosition()).toEqual(3)
    expect(cell03.getLayerFrom()).toEqual(0)
    expect(cell03.getLayerTo()).toEqual(1)
    expect(cell03.getEdgeIfConnected()!.getFrom().getId()).toBe('A')
    expect(cell03.getEdgeIfConnected()!.getTo().getId()).toBe('C')
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
    expect(instance.getSequenceInLayer(0).map(n => n!.getId())).toEqual(['B', 'E', 'A'])
    expect(instance.getSequenceInLayer(1).map(n => n!.getId())).toEqual(['C', 'D'])
    expect(instance.getSequence().map(n => n!.getId())).toEqual(['B', 'E', 'A', 'C', 'D'])
    expect(instance.getCell(2, 3).getEdgeIfConnected()!.getFrom().getId()).toBe('A')
    expect(instance.getCell(2, 3).getEdgeIfConnected()!.getTo().getId()).toBe('C')
  })

  it('Move node downward, rotating the nodes in between', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    // No need to test the permutation here so thoroughly because
    // the swapping is done based on the permutation. With a wrong
    // permutation, the swapping result would be wrong.
    instance.rotateToSwap(2, 0)
    expect(instance.getSequenceInLayer(0).map(n => n!.getId())).toEqual(['E', 'A', 'B'])
    expect(instance.getSequenceInLayer(1).map(n => n!.getId())).toEqual(['C', 'D'])
    expect(instance.getSequence().map(n => n!.getId())).toEqual(['E', 'A', 'B', 'C', 'D'])
    expect(instance.getCell(1, 3).getEdgeIfConnected()!.getFrom().getId()).toBe('A')
    expect(instance.getCell(1, 3).getEdgeIfConnected()!.getTo().getId()).toBe('C')
  })

  it('Move node up to swap with adjacent', () => {
    const instance: ConcreteNodeSequenceEditor = getSimpleInstance()
    // No need to test the permutation here so thoroughly because
    // the swapping is done based on the permutation. With a wrong
    // permutation, the swapping result would be wrong.
    expect(instance.rotateToSwap(3, 4)).toEqual([0, 1, 2, 4, 3])
    expect(instance.getSequence().map(node => node?.getId())).toEqual(['A', 'B', 'E', 'D', 'C'])
    checkAfterSwapping(instance)
  })

  function checkAfterSwapping(instance: NodeSequenceEditor) {
    expect(instance.getSequenceInLayer(0).map(n => n!.getId())).toEqual(['A', 'B', 'E'])
    expect(instance.getSequenceInLayer(1).map(n => n!.getId())).toEqual(['D', 'C'])
    expect(instance.getSequence().map(n => n!.getId())).toEqual(['A', 'B', 'E', 'D', 'C'])
    expect(instance.getCell(0, 4).getEdgeIfConnected()!.getFrom().getId()).toBe('A')
    expect(instance.getCell(0, 4).getEdgeIfConnected()!.getTo().getId()).toBe('C')
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
    expect(instance.getSequence().slice(1, 5).map(n => n!.getId())).toEqual(['B', 'E', 'C', 'D'])
    expect(instance.getSequenceInLayer(0)[0]).toBe(null)
    expect(instance.getSequenceInLayer(0).length).toBe(3)
    expect(instance.getSequenceInLayer(0).slice(1, 3).map(n => n!.getId())).toEqual(['B', 'E'])
    expect(instance.getSequenceInLayer(1).map(n => n!.getId())).toEqual(['C', 'D'])
    const cell03 = instance.getCell(0, 3)
    expect(cell03.getFromPosition()).toBe(0)
    expect(cell03.getToPosition()).toBe(3)
    expect(cell03.getLayerFrom()).toBe(0)
    expect(cell03.getLayerTo()).toBe(1)
    expect(cell03.getEdgeIfConnected()).toBe(null)
    expect(instance.getCell(1, 2).getEdgeIfConnected()).not.toBe(null)
    expect(instance.getOrderedOmittedNodes().map(n => n.getId())).toEqual(['A'])
    expect(instance.getOrderedOmittedNodesInLayer(0).map(n => n.getId())).toEqual(['A'])
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
    instance.omitNodeFrom(0)
    instance.omitNodeFrom(1)
    instance.omitNodeFrom(2)
    instance.omitNodeFrom(3)
    // Omitted nodes are not in the editor, use their original order
    expect(instance.getOrderedOmittedNodes().map(n => n.getId())).toEqual(['1A', '5B', '4C', '2E'])
    expect(instance.getOrderedOmittedNodesInLayer(0).map(n => n.getId())).toEqual(['1A', '5B', '2E'])
    expect(instance.reintroduceNode(0, instance.graph.getNodeById('1A')!))
    expect(instance.getOrderedOmittedNodes().map(n => n.getId())).toEqual(['5B', '4C', '2E'])
    expect(instance.getOrderedOmittedNodesInLayer(0).map(n => n.getId())).toEqual(['5B', '2E'])
    expect(instance.getSequence()[0]!.getId()).toBe('1A')
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
    expect(node.getId()).toBe('A')
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
    expect(node.getId()).toBe('A')
    expect(instance.reintroduceNode(3, node)).toBe(UpdateResponse.REJECTED)
    checkStateAfterOmittingPositionsZeroAndThree(instance)
  })

  function checkStateAfterOmittingPositionsZeroAndThree(instance: NodeSequenceEditor) {
    expect(instance.getSequence().length).toBe(5)
    expect(instance.getSequence()[0]).toBe(null)
    expect(instance.getSequence()[1]!.getId()).toBe('B')
    expect(instance.getSequence()[2]!.getId()).toBe('E')
    expect(instance.getSequence()[3]).toBe(null)
    expect(instance.getSequence()[4]!.getId()).toBe('D')
    expect(instance.getSequenceInLayer(0).length).toBe(3)
    expect(instance.getSequenceInLayer(0)[0]).toBe(null)
    expect(instance.getSequenceInLayer(0)[1]!.getId()).toBe('B')
    expect(instance.getSequenceInLayer(0)[2]!.getId()).toBe('E')
    expect(instance.getSequenceInLayer(1).length).toBe(2)
    expect(instance.getSequenceInLayer(1)[0]).toBe(null)
    expect(instance.getSequenceInLayer(1)[1]!.getId()).toBe('D')
    expect(instance.getOrderedOmittedNodes().map(n => n.getId())).toEqual(['A', 'C'])
    expect(instance.getOrderedOmittedNodesInLayer(0).map(n => n.getId())).toEqual(['A'])
    expect(instance.getOrderedOmittedNodesInLayer(1).map(n => n.getId())).toEqual(['C'])
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
})

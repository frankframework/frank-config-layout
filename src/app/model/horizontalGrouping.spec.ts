import { ConcreteNode, Node, ConcreteGraphBase, GraphConnectionsDecorator } from '../model/graph'
import { calculateLayerNumbers, NodeSequenceEditorBuilder, NodeForEditor, OriginalNode, IntermediateNode, CreationReason, EdgeForEditor, LayerNumberAlgorithm, calculateLayerNumbersFirstOccuringPath, calculateLayerNumbersLongestPath, PASS_DIRECTION_DOWN, PASS_DIRECTION_UP} from './horizontalGrouping'
import { getRange } from '../util/util'

function newNode(id: string): Node {
  return new ConcreteNode(0, id, '', '')
}

function connect(idFrom: string, idTo: string, g: ConcreteGraphBase) {
  g.connect(g.getNodeById(idFrom)!, g.getNodeById(idTo)!)
}

describe('Calculating layer numbers', () => {
  it('Should call the correct method based on the algorithm enum', () => {
    const g = new GraphConnectionsDecorator(getComplexGraph())
    const result1 = calculateLayerNumbers(g, LayerNumberAlgorithm.FIRST_OCCURING_PATH)
    const result2 = calculateLayerNumbers(g, LayerNumberAlgorithm.LONGEST_PATH)
    const entries1: Record<string, number> = {}
    const entries2: Record<string, number> = {}
    result1.forEach((value, key) => entries1[key] = value)
    result2.forEach((value, key) => entries2[key] = value)

    expect(entries1).toEqual({'Start': 0, 'N1': 1, 'N2': 2, 'N3': 1, 'end': 2})
    expect(entries2).toEqual({'Start': 0, 'N1': 1, 'N2': 2, 'N3': 3, 'end': 4})
  })

  describe('Longest path algorithm', () => {
    it('Two disconnected nodes can appear on same layer', () => {
      const g = new GraphConnectionsDecorator(getSimpleGraph())
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.size).toBe(3)
      expect(result.get('Start')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
    });
  
    it('Node cannot appear on same layer as node that points to it', () => {
      const b = getSimpleGraph()
      b.addExistingNode(newNode('End'))
      connect('N1', 'End', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.size).toBe(4)
      expect(result.get('Start')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
      expect(result.get('End')).toBe(2)
    })
  
    it('If multiple nodes have no predecessors, all are on layer 0', () => {
      const b = getSimplePlusDisjointEdge()
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.size).toBe(5)
      expect(result.get('Start')).toBe(0)
      expect(result.get('X0')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
      expect(result.get('X1')).toBe(1)
    })
  
    it('A cycle is ignored because no root node is found on the cycle', () => {
      const b = getSimplePlusDisjointEdge()
      connect('X1', 'X0', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.size).toBe(3)
      expect([ ... result.keys()].sort()).toEqual(['N1', 'N2', 'Start'])
    })
  
    it('Edge order does not matter for order of layer assignment when there is no infinite loop (1)', () => {
      const b = getSimpleNodesForGraph()
      connect('Start', 'N1', b)
      connect('Start', 'N2', b)
      connect('N1', 'N2', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(2)
    })
  
    it('Edge order does not matter for order of layer assignment when there is no infinite loop (2)', () => {
      const b = getSimpleNodesForGraph()
      connect('Start', 'N2', b)
      connect('Start', 'N1', b)
      connect('N1', 'N2', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(2)
    })

    it('Edge order does matter for order of layer assignment when there is an infinite loop (1)', () => {
      const b = getSimpleNodesForGraph()
      connect('Start', 'N1', b)
      connect('Start', 'N2', b)
      connect('N1', 'N2', b)
      connect('N2', 'N1', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(2)
    })
    it('Edge order does matter for order of layer assignment when there is an infinite loop (2)', () => {
      const b = getSimpleNodesForGraph()
      connect('Start', 'N2', b)
      connect('Start', 'N1', b)
      connect('N1', 'N2', b)
      connect('N2', 'N1', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.get('N1')).toBe(2)
      expect(result.get('N2')).toBe(1)
    })
  })

  describe('First occuring path algorithm', () => {
    it('Two disconnected nodes can appear on same layer', () => {
      const g = new GraphConnectionsDecorator(getSimpleGraph())
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.size).toBe(3)
      expect(result.get('Start')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
    });
  
    it('Node cannot appear on same layer as node that points to it', () => {
      const b = getSimpleGraph()
      b.addExistingNode(newNode('End'))
      connect('N1', 'End', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.size).toBe(4)
      expect(result.get('Start')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
      expect(result.get('End')).toBe(2)
    })
  
    it('If multiple nodes have no predecessors, all are on layer 0', () => {
      const b = getSimplePlusDisjointEdge()
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.size).toBe(5)
      expect(result.get('Start')).toBe(0)
      expect(result.get('X0')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
      expect(result.get('X1')).toBe(1)
    })
  
    it('A cycle is ignored because no root node is found on the cycle', () => {
      const b = getSimplePlusDisjointEdge()
      connect('X1', 'X0', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.size).toBe(3)
      expect([ ... result.keys()].sort()).toEqual(['N1', 'N2', 'Start'])
    })
  
    it('Edge order controls order of layer assignment (1)', () => {
      const b = getSimpleNodesForGraph()
      connect('Start', 'N1', b)
      connect('Start', 'N2', b)
      connect('N1', 'N2', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(2)
    })
  
    it('Edge order controls order of layer assignment (2)', () => {
      const b = getSimpleNodesForGraph()
      connect('Start', 'N2', b)
      connect('Start', 'N1', b)
      connect('N1', 'N2', b)
      const g = new GraphConnectionsDecorator(b)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.get('N2')).toBe(1)
      expect(result.get('N1')).toBe(2)
    })
  })

  function getSimpleNodesForGraph() {
    const b = new ConcreteGraphBase()
    b.addExistingNode(newNode('Start'))
    b.addExistingNode(newNode('N1'))
    b.addExistingNode(newNode('N2'))
    return b
  }

  function getNodesForComplexGraph() {
    const b = new ConcreteGraphBase()
    b.addExistingNode(newNode('Start'))
    b.addExistingNode(newNode('N1'))
    b.addExistingNode(newNode('N2'))
    b.addExistingNode(newNode('N3'))
    b.addExistingNode(newNode('end'))
    return b
  }

  function getSimpleGraph(): ConcreteGraphBase {
    const b = getSimpleNodesForGraph()
    connect('Start', 'N1', b)
    connect('Start', 'N2', b)
    return b
  }

  function getComplexGraph(): ConcreteGraphBase {
    const b = getNodesForComplexGraph()
    connect('Start', 'N3', b)
    connect('Start', 'N1', b)
    connect('N1', 'N2', b)
    connect('N2', 'N3', b)
    connect('N3', 'end', b)
    return b
  }

  function getSimplePlusDisjointEdge(): ConcreteGraphBase {
    const b = getSimpleGraph()
    b.addExistingNode(newNode('X0'))
    b.addExistingNode(newNode('X1'))
    connect('X0', 'X1', b)
    return b
  }
})

describe('NodeSequenceEditorBuilder', () => {
  it('Downward lines', () => {
    const instance = getInstanceDownwardLinks()
    expect(instance.graph.getNodes().map(n => n.getId()))
      .toEqual(['N0', 'N1', 'N2', 'N3', 'intermediate1', 'intermediate2', 'intermediate3'])
    // Edges with intermediates are N0 --> N2 and N0 --> N3
    expect(instance.graph.getNodes().map(n => instance.nodeIdToLayer.get(n.getId())))
      .toEqual([0, 1, 2, 3, 1, 1, 2])
    expect(instance.graph.getNodes()
      .map(n => n as NodeForEditor)
      .map(n => n.getCreationReason()))
      .toEqual([CreationReason.ORIGINAL, CreationReason.ORIGINAL, CreationReason.ORIGINAL, CreationReason.ORIGINAL,
        CreationReason.INTERMEDIATE, CreationReason.INTERMEDIATE, CreationReason.INTERMEDIATE])
    // Check that we have access to the original node, relevant for styling or text
    expect(getRange(0, 4).map(i => instance.graph.getNodes()[i])
      .map(n => n as OriginalNode)
      .map(n => n.original.getId()))
      .toEqual(['N0', 'N1', 'N2', 'N3'])
    expect( (instance.graph.getNodeById('intermediate1') as IntermediateNode).getPassDirection()).toEqual(PASS_DIRECTION_DOWN)
    expect( (instance.graph.getNodeById('intermediate2') as IntermediateNode).getPassDirection()).toEqual(PASS_DIRECTION_DOWN)
    expect( (instance.graph.getNodeById('intermediate3') as IntermediateNode).getPassDirection()).toEqual(PASS_DIRECTION_DOWN)
    let edge: EdgeForEditor = instance.graph.getEdges()[0] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('N0')
    expect(edge.getTo().getId()).toBe('N1')
    expect(edge.creationReason).toBe(CreationReason.ORIGINAL)
    expect(edge.original.getFrom().getId()).toBe('N0')
    expect(edge.original.getTo().getId()).toBe('N1')
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.graph.getEdges()[1] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('N0')
    expect(edge.getTo().getId()).toBe('intermediate1')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N0')
    expect(edge.original.getTo().getId()).toBe('N2')
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.graph.getEdges()[2] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('intermediate1')
    expect(edge.getTo().getId()).toBe('N2')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N0')
    expect(edge.original.getTo().getId()).toBe('N2')
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.graph.getEdges()[3] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('N0')
    expect(edge.getTo().getId()).toBe('intermediate2')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N0')
    expect(edge.original.getTo().getId()).toBe('N3')
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.graph.getEdges()[4] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('intermediate2')
    expect(edge.getTo().getId()).toBe('intermediate3')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N0')
    expect(edge.original.getTo().getId()).toBe('N3')
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.graph.getEdges()[5] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('intermediate3')
    expect(edge.getTo().getId()).toBe('N3')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N0')
    expect(edge.original.getTo().getId()).toBe('N3')
    expect(instance.graph.getEdges().length).toBe(6)
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(true)
  })

  function getInstanceDownwardLinks(): NodeSequenceEditorBuilder {
    const b = new ConcreteGraphBase()
    b.addExistingNode(newNode('N0'))
    b.addExistingNode(newNode('N1'))
    b.addExistingNode(newNode('N2'))
    b.addExistingNode(newNode('N3'))
    connect('N0', 'N1', b)
    connect('N0', 'N2', b) // produces intermediate1
    connect('N0', 'N3', b) // produces intermediate2 and intermediate3
    const m: Map<string, number> = new Map([
      ['N0', 0],
      ['N1', 1],
      ['N2', 2],
      ['N3', 3]
    ])
    return new NodeSequenceEditorBuilder(m, b)
  }

  it('Upward lines', () => {
    const instance = getInstanceUpwardLinks()
    expect(instance.graph.getNodes().map(n => n.getId()))
      .toEqual(['N0A', 'N0B', 'N1', 'N2', 'N3', 'intermediate1', 'intermediate2', 'intermediate3'])
    expect(instance.graph.getNodes().map(n => instance.nodeIdToLayer.get(n.getId())))
      .toEqual([0, 0, 1, 2, 3, 1, 2, 1])
    expect( (instance.graph.getNodeById('intermediate1') as IntermediateNode).getPassDirection()).toEqual(PASS_DIRECTION_UP)
    expect( (instance.graph.getNodeById('intermediate2') as IntermediateNode).getPassDirection()).toEqual(PASS_DIRECTION_UP)
    expect( (instance.graph.getNodeById('intermediate3') as IntermediateNode).getPassDirection()).toEqual(PASS_DIRECTION_UP)
      let edge = instance.graph.getEdges()[0] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('N0A')
    expect(edge.getTo().getId()).toBe('N0B')
    expect(edge.creationReason).toBe(CreationReason.ORIGINAL)
    expect(edge.original.getFrom().getId()).toBe('N0A')
    expect(edge.original.getTo().getId()).toBe('N0B')
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.graph.getEdges()[1] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('N1')
    expect(edge.getTo().getId()).toBe('N0A')
    expect(edge.creationReason).toBe(CreationReason.ORIGINAL)
    expect(edge.original.getFrom().getId()).toBe('N1')
    expect(edge.original.getTo().getId()).toBe('N0A')
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.graph.getEdges()[2] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('N2')
    expect(edge.getTo().getId()).toBe('intermediate1')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N2')
    expect(edge.original.getTo().getId()).toBe('N0A')
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.graph.getEdges()[3] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('intermediate1')
    expect(edge.getTo().getId()).toBe('N0A')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N2')
    expect(edge.original.getTo().getId()).toBe('N0A')
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.graph.getEdges()[4] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('N3')
    expect(edge.getTo().getId()).toBe('intermediate2')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N3')
    expect(edge.original.getTo().getId()).toBe('N0A')
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.graph.getEdges()[5] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('intermediate2')
    expect(edge.getTo().getId()).toBe('intermediate3')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N3')
    expect(edge.original.getTo().getId()).toBe('N0A')
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.graph.getEdges()[6] as EdgeForEditor
    expect(edge.getFrom().getId()).toBe('intermediate3')
    expect(edge.getTo().getId()).toBe('N0A')
    expect(edge.creationReason).toBe(CreationReason.INTERMEDIATE)
    expect(edge.original.getFrom().getId()).toBe('N3')
    expect(edge.original.getTo().getId()).toBe('N0A')
    expect(instance.graph.getEdges().length).toBe(7)
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(true)
  })

  function getInstanceUpwardLinks(): NodeSequenceEditorBuilder {
    const b = new ConcreteGraphBase()
    b.addExistingNode(newNode('N0A'))
    b.addExistingNode(newNode('N0B'))
    b.addExistingNode(newNode('N1'))
    b.addExistingNode(newNode('N2'))
    b.addExistingNode(newNode('N3'))
    connect('N0A', 'N0B', b)
    connect('N1', 'N0A', b)
    connect('N2', 'N0A', b)
    connect('N3', 'N0A', b)
    const m: Map<string, number> = new Map([
      ['N0A', 0],
      ['N0B', 0],
      ['N1', 1],
      ['N2', 2],
      ['N3', 3]
    ])
    return new NodeSequenceEditorBuilder(m, b)
  }
})
  /*

    Test NodeSequenceEditorBuilder:
    - Original edge on same layer.
    - Intermediate edge up two layers.
    - Intermediate edge that passes three layers up.
  */

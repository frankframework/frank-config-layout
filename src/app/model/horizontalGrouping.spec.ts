import { createText } from './text'
import { OriginalNode, OriginalGraph, createOriginalGraph } from './error-flow'
import { getKey } from './graph'
import { calculateLayerNumbers, assignHorizontalLayerNumbers, PASS_DIRECTION_DOWN, PASS_DIRECTION_UP,
  calculateLayerNumbersLongestPath, calculateLayerNumbersFirstOccuringPath, GraphForLayers, EdgeForLayers,
  LAYERS_FIRST_OCCURING_PATH, LAYERS_LONGEST_PATH
} from './horizontalGrouping'

function newNode(id: string): OriginalNode {
  return { id, text: '', isError: false }
}

function connect(idFrom: string, idTo: string, g: OriginalGraph) {
  g.addEdge({
    from: g.getNodeById(idFrom),
    to: g.getNodeById(idTo),
    text: createText(undefined),
    isError: false
  })
}

describe('Calculating layer numbers', () => {
  it('Should call the correct method based on the algorithm enum', () => {
    const g = getComplexGraph()
    const result1 = calculateLayerNumbers(g, LAYERS_FIRST_OCCURING_PATH)
    const result2 = calculateLayerNumbers(g, LAYERS_LONGEST_PATH)
    const entries1: Record<string, number> = {}
    const entries2: Record<string, number> = {}
    result1.forEach((value, key) => entries1[key] = value)
    result2.forEach((value, key) => entries2[key] = value)

    expect(entries1).toEqual({'Start': 0, 'N1': 1, 'N2': 2, 'N3': 1, 'end': 2})
    expect(entries2).toEqual({'Start': 0, 'N1': 1, 'N2': 2, 'N3': 3, 'end': 4})
  })

  describe('Longest path algorithm', () => {
    it('Two disconnected nodes can appear on same layer', () => {
      const g = getSimpleGraph()
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.size).toBe(3)
      expect(result.get('Start')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
    });
  
    it('Node cannot appear on same layer as node that points to it', () => {
      const g = getSimpleGraph()
      g.addNode(newNode('End'))
      connect('N1', 'End', g)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.size).toBe(4)
      expect(result.get('Start')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
      expect(result.get('End')).toBe(2)
    })
  
    it('If multiple nodes have no predecessors, all are on layer 0', () => {
      const g = getSimplePlusDisjointEdge()
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.size).toBe(5)
      expect(result.get('Start')).toBe(0)
      expect(result.get('X0')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
      expect(result.get('X1')).toBe(1)
    })
  
    it('A cycle is ignored because no root node is found on the cycle', () => {
      const g = getSimplePlusDisjointEdge()
      connect('X1', 'X0', g)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.size).toBe(3)
      expect([ ... result.keys()].sort()).toEqual(['N1', 'N2', 'Start'])
    })
  
    it('Edge order does not matter for order of layer assignment when there is no infinite loop (1)', () => {
      const g = getSimpleNodesForGraph()
      connect('Start', 'N1', g)
      connect('Start', 'N2', g)
      connect('N1', 'N2', g)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(2)
    })
  
    it('Edge order does not matter for order of layer assignment when there is no infinite loop (2)', () => {
      const g = getSimpleNodesForGraph()
      connect('Start', 'N2', g)
      connect('Start', 'N1', g)
      connect('N1', 'N2', g)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(2)
    })

    it('Edge order does matter for order of layer assignment when there is an infinite loop (1)', () => {
      const g = getSimpleNodesForGraph()
      connect('Start', 'N1', g)
      connect('Start', 'N2', g)
      connect('N1', 'N2', g)
      connect('N2', 'N1', g)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(2)
    })
    it('Edge order does matter for order of layer assignment when there is an infinite loop (2)', () => {
      const g = getSimpleNodesForGraph()
      connect('Start', 'N2', g)
      connect('Start', 'N1', g)
      connect('N1', 'N2', g)
      connect('N2', 'N1', g)
      const result = calculateLayerNumbersLongestPath(g, () => {})
      expect(result.get('N1')).toBe(2)
      expect(result.get('N2')).toBe(1)
    })
  })

  describe('First occuring path algorithm', () => {
    it('Two disconnected nodes can appear on same layer', () => {
      const g = getSimpleGraph()
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.size).toBe(3)
      expect(result.get('Start')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
    });
  
    it('Node cannot appear on same layer as node that points to it', () => {
      const g = getSimpleGraph()
      g.addNode(newNode('End'))
      connect('N1', 'End', g)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.size).toBe(4)
      expect(result.get('Start')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
      expect(result.get('End')).toBe(2)
    })
  
    it('If multiple nodes have no predecessors, all are on layer 0', () => {
      const g = getSimplePlusDisjointEdge()
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.size).toBe(5)
      expect(result.get('Start')).toBe(0)
      expect(result.get('X0')).toBe(0)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(1)
      expect(result.get('X1')).toBe(1)
    })
  
    it('A cycle is ignored because no root node is found on the cycle', () => {
      const g = getSimplePlusDisjointEdge()
      connect('X1', 'X0', g)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.size).toBe(3)
      expect([ ... result.keys()].sort()).toEqual(['N1', 'N2', 'Start'])
    })
  
    it('Edge order controls order of layer assignment (1)', () => {
      const g = getSimpleNodesForGraph()
      connect('Start', 'N1', g)
      connect('Start', 'N2', g)
      connect('N1', 'N2', g)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.get('N1')).toBe(1)
      expect(result.get('N2')).toBe(2)
    })
  
    it('Edge order controls order of layer assignment (2)', () => {
      const g = getSimpleNodesForGraph()
      connect('Start', 'N2', g)
      connect('Start', 'N1', g)
      connect('N1', 'N2', g)
      const result = calculateLayerNumbersFirstOccuringPath(g)
      expect(result.get('N2')).toBe(1)
      expect(result.get('N1')).toBe(2)
    })
  })

  function getSimpleNodesForGraph(): OriginalGraph {
    const g = createOriginalGraph()
    g.addNode(newNode('Start'))
    g.addNode(newNode('N1'))
    g.addNode(newNode('N2'))
    return g
  }

  function getNodesForComplexGraph(): OriginalGraph {
    const g = createOriginalGraph()
    g.addNode(newNode('Start'))
    g.addNode(newNode('N1'))
    g.addNode(newNode('N2'))
    g.addNode(newNode('N3'))
    g.addNode(newNode('end'))
    return g
  }

  function getSimpleGraph(): OriginalGraph {
    const g = getSimpleNodesForGraph()
    connect('Start', 'N1', g)
    connect('Start', 'N2', g)
    return g
  }

  function getComplexGraph(): OriginalGraph {
    const g = getNodesForComplexGraph()
    connect('Start', 'N3', g)
    connect('Start', 'N1', g)
    connect('N1', 'N2', g)
    connect('N2', 'N3', g)
    connect('N3', 'end', g)
    return g
  }

  function getSimplePlusDisjointEdge(): OriginalGraph {
    const g = getSimpleGraph()
    g.addNode(newNode('X0'))
    g.addNode(newNode('X1'))
    connect('X0', 'X1', g)
    return g
  }
})

describe('NodeSequenceEditorBuilder', () => {
  it('Downward lines', () => {
    const instance: GraphForLayers = getInstanceDownwardLinks()
    expect(instance.nodes.map(n => n.id))
      .toEqual(['N0', 'N1', 'N2', 'N3', 'intermediate1', 'intermediate2', 'intermediate3'])
    // Edges with intermediates are N0 --> N2 and N0 --> N3
    expect(instance.nodes.map(n => n.layer))
      .toEqual([0, 1, 2, 3, 1, 1, 2])
    expect(instance.nodes
      .map(n => n.isIntermediate))
      .toEqual([false, false, false, false, true, true, true])
    expect( (instance.getNodeById('intermediate1')).passDirection).toEqual(PASS_DIRECTION_DOWN)
    expect( (instance.getNodeById('intermediate2')).passDirection).toEqual(PASS_DIRECTION_DOWN)
    expect( (instance.getNodeById('intermediate3')).passDirection).toEqual(PASS_DIRECTION_DOWN)
    let edge: EdgeForLayers = instance.edges[0]
    expect(edge.from.id).toBe('N0')
    expect(edge.to.id).toBe('N1')
    expect(edge.isIntermediate).toBe(false)
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.edges[1]
    expect(edge.from.id).toBe('N0')
    expect(edge.to.id).toBe('intermediate1')
    expect(edge.isIntermediate).toBe(true)
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.edges[2]
    expect(edge.from.id).toBe('intermediate1')
    expect(edge.to.id).toBe('N2')
    expect(edge.isIntermediate).toBe(true)
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.edges[3]
    expect(edge.from.id).toBe('N0')
    expect(edge.to.id).toBe('intermediate2')
    expect(edge.isIntermediate).toBe(true)
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.edges[4]
    expect(edge.from.id).toBe('intermediate2')
    expect(edge.to.id).toBe('intermediate3')
    expect(edge.isIntermediate).toBe(true)
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.edges[5]
    expect(edge.from.id).toBe('intermediate3')
    expect(edge.to.id).toBe('N3')
    expect(edge.isIntermediate).toBe(true)
    expect(instance.edges.length).toBe(6)
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(true)
    // All edges go down
    for (const edge of instance.edges) {
      expect(edge.passDirection).toEqual(PASS_DIRECTION_DOWN)
    }
  })

  function getInstanceDownwardLinks(): GraphForLayers {
    const g = createOriginalGraph()
    g.addNode(newNode('N0'))
    g.addNode(newNode('N1'))
    g.addNode(newNode('N2'))
    g.addNode(newNode('N3'))
    connect('N0', 'N1', g)
    connect('N0', 'N2', g) // produces intermediate1
    connect('N0', 'N3', g) // produces intermediate2 and intermediate3
    const m: Map<string, number> = new Map([
      ['N0', 0],
      ['N1', 1],
      ['N2', 2],
      ['N3', 3]
    ])
    return assignHorizontalLayerNumbers(g, m)
  }

  it('Upward lines', () => {
    const instance: GraphForLayers = getInstanceUpwardLinks()
    expect(instance.nodes.map(n => n.id))
      .toEqual(['N0A', 'N0B', 'N1', 'N2', 'N3', 'intermediate1', 'intermediate2', 'intermediate3'])
    expect(instance.nodes.map(n => n.layer))
      .toEqual([0, 0, 1, 2, 3, 1, 2, 1])
    expect( (instance.getNodeById('intermediate1')).passDirection).toEqual(PASS_DIRECTION_UP)
    expect( (instance.getNodeById('intermediate2')).passDirection).toEqual(PASS_DIRECTION_UP)
    expect( (instance.getNodeById('intermediate3')).passDirection).toEqual(PASS_DIRECTION_UP)
    let edge = instance.edges[0]
    expect(edge.from.id).toBe('N0A')
    expect(edge.to.id).toBe('N0B')
    expect(edge.isIntermediate).toBe(false)
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.edges[1]
    expect(edge.from.id).toBe('N1')
    expect(edge.to.id).toBe('N0A')
    expect(edge.isIntermediate).toBe(false)
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.edges[2]
    expect(edge.from.id).toBe('N2')
    expect(edge.to.id).toBe('intermediate1')
    expect(edge.isIntermediate).toBe(true)
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.edges[3]
    expect(edge.from.id).toBe('intermediate1')
    expect(edge.to.id).toBe('N0A')
    expect(edge.isIntermediate).toBe(true)
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(true)
    edge = instance.edges[4]
    expect(edge.from.id).toBe('N3')
    expect(edge.to.id).toBe('intermediate2')
    expect(edge.isIntermediate).toBe(true)
    expect(edge.isFirstSegment).toEqual(true)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.edges[5]
    expect(edge.from.id).toBe('intermediate2')
    expect(edge.to.id).toBe('intermediate3')
    expect(edge.isIntermediate).toBe(true)
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(false)
    edge = instance.edges[6]
    expect(edge.from.id).toBe('intermediate3')
    expect(edge.to.id).toBe('N0A')
    expect(edge.isIntermediate).toBe(true)
    expect(instance.edges.length).toBe(7)
    expect(edge.isFirstSegment).toEqual(false)
    expect(edge.isLastSegment).toEqual(true)
    // All edges go up
    for (const edge of instance.edges) {
      if (getKey(edge) !== "N0A-N0B") {
        expect(edge.passDirection).toEqual(PASS_DIRECTION_UP)
      }
    }
  })

  function getInstanceUpwardLinks(): GraphForLayers {
    const g = createOriginalGraph()
    g.addNode(newNode('N0A'))
    g.addNode(newNode('N0B'))
    g.addNode(newNode('N1'))
    g.addNode(newNode('N2'))
    g.addNode(newNode('N3'))
    connect('N0A', 'N0B', g)
    connect('N1', 'N0A', g)
    connect('N2', 'N0A', g)
    connect('N3', 'N0A', g)
    const m: Map<string, number> = new Map([
      ['N0A', 0],
      ['N0B', 0],
      ['N1', 1],
      ['N2', 2],
      ['N3', 3]
    ])
    return assignHorizontalLayerNumbers(g, m)
  }
})

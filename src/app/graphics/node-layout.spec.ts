import { Graph, getKey } from '../model/generic-graph'
import { NodeImpl, EdgeImpl, GraphForLayers, PASS_DIRECTION_DOWN, assignHorizontalLayerNumbers } from '../model/horizontalGrouping'
import { LayoutBase } from '../model/layoutBase'
import { NodeSpacingDimensions, NodeLayout, NodeLayoutBuilder } from "./node-layout"
import { createText } from '../model/text'
import { OriginalEdge, OriginalGraph, OriginalNode } from '../model/error-flow'

describe('NodeLayoutBuilder', () => {
  it('Simple model', () => {
    const g = getSimpleGraph()
    const lb = LayoutBase.create(['Start', 'N1', 'N2', 'End'], g, 3)
    const instance: NodeLayoutBuilder = new NodeLayoutBuilder(lb, g, getTestDimensions())
    const layout: NodeLayout = instance.run()
    // Check that the original graph is represented correctly in the positions
    expect(layout.positions.map(p => p.node.id)).toEqual(['Start', 'N1', 'N2', 'End'])
    expect(layout.positions.map(p => p.layerNumber)).toEqual([0, 1, 1, 2])
    expect(layout.positionMap.get('Start')!.node.id).toBe('Start')
    expect(layout.positionMap.get('N1')!.node.id).toBe('N1')
    expect(layout.positionMap.get('N2')!.node.id).toBe('N2')
    expect(layout.positionMap.get('End')!.node.id).toBe('End')
    //
    expect(layout.positions.map(p => p.y)).toEqual([20, 140, 140, 260])
    expect(layout.positions.map(p => p.x)).toEqual([120, 60, 180, 120])
    expect(layout.width).toBe(240)
    expect(layout.height).toBe(360)
    // Edges
    expect(layout.edges.map(edge => getKey(edge))).toEqual([
      'Start-N1', 'Start-N2', 'N1-End', 'N2-End'
    ])
  })

  it('With conflict and intermediate', () => {
    const g = getGraphWithConflictAndIntermediate(withConflictAndIntermediate())
    const lb = LayoutBase.create(['S1', 'S2', 'N1', 'intermediate1', 'End'], g, 3)
    const instance = new NodeLayoutBuilder(lb, g, getTestDimensions())
    const layout = instance.run()
    // Check that the graph is represented correctly
    expect(layout.positions.map(p => p.node.id)).toEqual(['S1', 'S2', 'N1', 'intermediate1', 'End'])
    expect(layout.positions.map(p => p.layerNumber)).toEqual([0, 0, 1, 1, 2])
    expect(layout.positionMap.get('S1')!.node.id).toBe('S1')
    expect(layout.positionMap.get('S2')!.node.id).toBe('S2')
    expect(layout.positionMap.get('N1')!.node.id).toBe('N1')
    expect(layout.positionMap.get('intermediate1')!.node.id).toBe('intermediate1')
    expect(layout.positionMap.get('End')!.node.id).toBe('End')
    // Widest layer is layer 0, with two original nodes.
    // Their positions are initially 60 and 180.
    // Node N1 is initially at 120. Node 2 is initially at 120 + 60 / 2 = 150.
    // This is a conflict. Layer 1 is grouped around median 120, area of size 120 + 60 = 180.
    // Node N1 appears at (120 - 180 / 2) + 120 / 2 = 90.
    // Node intermediate1 appears at 120 + 60 / 2 = 150.
    // Node End appears at median of N1 and intermediate1, is 120.
    expect(layout.positions.map(p => p.x)).toEqual([60, 180, 90, 180, 135])
    expect(layout.positions.map(p => p.y)).toEqual([20, 20, 140, 140, 260])
    expect(layout.width).toBe(240)
    expect(layout.height).toBe(360)
  })

  it('With conflict and intermediate upside down', () => {
    const g = getGraphWithConflictAndIntermediate(withConflictAndIntermediateOrderedUpsizeDown())
    const lb = LayoutBase.create(['End', 'N1', 'intermediate1', 'S1', 'S2'], g, 3)
    const instance = new NodeLayoutBuilder(lb, g, getTestDimensions())
    const layout = instance.run()
    // Check that the graph is represented correctly
    expect(layout.positions.map(p => p.node.id)).toEqual(['End', 'N1', 'intermediate1', 'S1', 'S2'])
    expect(layout.positionMap.get('S1')!.node.id).toBe('S1')
    expect(layout.positionMap.get('S2')!.node.id).toBe('S2')
    expect(layout.positionMap.get('N1')!.node.id).toBe('N1')
    expect(layout.positionMap.get('intermediate1')!.node.id).toBe('intermediate1')
    expect(layout.positionMap.get('End')!.node.id).toBe('End')
    // Analysis for x is same as in test 'With conflict and intermediate'
    expect(layout.positions.map(p => p.x)).toEqual([135, 90, 180, 60, 180])
    expect(layout.positions.map(p => p.y)).toEqual([20, 140, 140, 260, 260])
    expect(layout.width).toBe(240)
    expect(layout.height).toBe(360)
  })
})

function getTestDimensions(): NodeSpacingDimensions {
  return {
    nodeWidth: 120,
    intermediateWidth: 60,
    omittedPlaceholderWidth: 90,
    layerHeight: 40,
    layerDistance: 120
  }
}

function getSimpleGraph(): GraphForLayers {
  const g = new Graph<NodeImpl, EdgeImpl>()
  addNode('Start', g)
  addNode('N1', g)
  addNode('N2', g)
  addNode('End', g)
  connect('Start', 'N1', g)
  connect('Start', 'N2', g)
  connect('N1', 'End', g)
  connect('N2', 'End', g)
  const m: Map<string, number> = new Map<string, number>()
  m.set('Start', 0)
  m.set('N1', 1)
  m.set('N2', 1)
  m.set('End', 2)
  return assignHorizontalLayerNumbers(g, m)
}

function getGraphWithConflictAndIntermediate(nodeIdToLayer: Map<string, number>): GraphForLayers {
  const g = new Graph<OriginalNode, OriginalEdge>()
  addNode('S1', g)
  addNode('S2', g)
  addNode('N1', g)
  addNode('End', g)
  connect('S1', 'N1', g)
  connect('S2', 'N1', g)
  connect('N1', 'End', g)
  // Introduces intermediate node
  connect('End', 'S2', g)
  return assignHorizontalLayerNumbers(g, nodeIdToLayer)
}

function withConflictAndIntermediate(): Map<string, number> {
  return new Map([
    ['S1', 0],
    ['S2', 0],
    ['N1', 1],
    ['End', 2]
  ])
}

function withConflictAndIntermediateOrderedUpsizeDown(): Map<string, number> {
  return new Map([
    ['S1', 2],
    ['S2', 2],
    ['N1', 1],
    ['End', 0]
  ])
}

function addNode(id: string, g: OriginalGraph) {
  g.addNode({
    id,
    // These are dummy
    isError: false,
    text: ''
  })
}

function connect(idFrom: string, idTo: string, g: OriginalGraph) {
  g.addEdge({
    from: g.getNodeById(idFrom),
    to: g.getNodeById(idTo),
    // These are dummy
    isError: false,
    text: createText(undefined),
  })
}

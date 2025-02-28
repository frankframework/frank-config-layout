import { ConcreteGraphBase, Graph, GraphConnectionsDecorator } from "../model/graph"
import { NodeSequenceEditorBuilder } from "../model/horizontalGrouping"
import { NodeSequenceEditor } from "../notLibrary/nodeSequenceEditor"
import { NodeSpacingDimensions, NodeLayout, NodeLayoutBuilder } from "./node-layout"

describe('NodeLayoutBuilder', () => {
  it('Simple model', () => {
    const model: NodeSequenceEditor = getSimpleModel(getSimpleGraph())
    const instance: NodeLayoutBuilder = new NodeLayoutBuilder(
      model.getShownNodesLayoutBase(), model.getGraph(), getTestDimensions())
    const layout: NodeLayout = instance.run()
    // Check that the original graph is represented correctly in the positions
    expect(layout.positions.map(p => p.node.getId())).toEqual(['Start', 'N1', 'N2', 'End'])
    expect(layout.positions.map(p => p.layerNumber)).toEqual([0, 1, 1, 2])
    expect(layout.positionMap.get('Start')!.node.getId()).toBe('Start')
    expect(layout.positionMap.get('N1')!.node.getId()).toBe('N1')
    expect(layout.positionMap.get('N2')!.node.getId()).toBe('N2')
    expect(layout.positionMap.get('End')!.node.getId()).toBe('End')
    //
    expect(layout.positions.map(p => p.y)).toEqual([20, 140, 140, 260])
    expect(layout.positions.map(p => p.x)).toEqual([120, 60, 180, 120])
    expect(layout.width).toBe(240)
    expect(layout.height).toBe(360)
    // Edges
    expect(layout.edges.map(edge => edge.getKey())).toEqual([
      'Start-N1', 'Start-N2', 'N1-End', 'N2-End'
    ])
  })

  it('With omitted node', () => {
    const model: NodeSequenceEditor = getSimpleModel(getSimpleGraph())
    expect(model.getSequence()[1]!.getId()).toBe('N1')
    model.omitNodeFrom(1)
    const instance: NodeLayoutBuilder = new NodeLayoutBuilder(
      model.getShownNodesLayoutBase(), model.getGraph(), getTestDimensions())
    const layout: NodeLayout = instance.run()
    // Check that the original graph is represented correctly in the positions
    expect(layout.positions.map(p => p.node.getId())).toEqual(['Start', 'N2', 'End'])
    expect(layout.positions.map(p => p.layerNumber)).toEqual([0, 1, 2])
    expect(layout.positionMap.get('Start')!.node.getId()).toBe('Start')
    expect(layout.positionMap.has('N1')).toBe(false)
    expect(layout.positionMap.get('N2')!.node.getId()).toBe('N2')
    expect(layout.positionMap.get('End')!.node.getId()).toBe('End')
    // Placeholder of omitted node has width 90. N2 has interval of size 120.
    // So center of N2 is at 90 + 120 / 2 = 90 + 60 = 150.
    // All nodes are aligned there
    expect(layout.positions.map(p => p.y)).toEqual([20, 140, 260])
    // Initially, nodes appear with center x 150, but they are moved
    // to the left because that space is not needed for other nodes
    expect(layout.positions.map(p => p.x)).toEqual([60, 60, 60])
    expect(layout.width).toBe(120)
    expect(layout.height).toBe(360)
    // Edges, only edges connecting remaining nodes should be present
    expect(layout.edges.map(edge => edge.getKey())).toEqual([
      'Start-N2', 'N2-End'
    ])
  })

  it('With conflict and intermediate', () => {
    const model = getModelWithConflictAndIntermediate(getGraphWithConflictAndIntermediate())
    const instance = new NodeLayoutBuilder(
      model.getShownNodesLayoutBase(), model.getGraph(), getTestDimensions())
    const layout = instance.run()
    // Check that the graph is represented correctly
    expect(layout.positions.map(p => p.node.getId())).toEqual(['S1', 'S2', 'N1', 'intermediate1', 'End'])
    expect(layout.positions.map(p => p.layerNumber)).toEqual([0, 0, 1, 1, 2])
    expect(layout.positionMap.get('S1')!.node.getId()).toBe('S1')
    expect(layout.positionMap.get('S2')!.node.getId()).toBe('S2')
    expect(layout.positionMap.get('N1')!.node.getId()).toBe('N1')
    expect(layout.positionMap.get('intermediate1')!.node.getId()).toBe('intermediate1')
    expect(layout.positionMap.get('End')!.node.getId()).toBe('End')
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
    const model = getModelWithConflictAndIntermediateOrderedUpsizeDown(getGraphWithConflictAndIntermediate())
    const instance = new NodeLayoutBuilder(
      model.getShownNodesLayoutBase(), model.getGraph(), getTestDimensions())
    const layout = instance.run()
    // Check that the graph is represented correctly
    expect(layout.positions.map(p => p.node.getId())).toEqual(['End', 'N1', 'intermediate1', 'S1', 'S2'])
    expect(layout.positionMap.get('S1')!.node.getId()).toBe('S1')
    expect(layout.positionMap.get('S2')!.node.getId()).toBe('S2')
    expect(layout.positionMap.get('N1')!.node.getId()).toBe('N1')
    expect(layout.positionMap.get('intermediate1')!.node.getId()).toBe('intermediate1')
    expect(layout.positionMap.get('End')!.node.getId()).toBe('End')
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

function getSimpleGraph(): Graph {
  const b: ConcreteGraphBase = new ConcreteGraphBase()
  b.addNode('Start', '', '')
  b.addNode('N1', '', '')
  b.addNode('N2', '', '')
  b.addNode('End', '', '')
  b.connect(b.getNodeById('Start')!, b.getNodeById('N1')!)
  b.connect(b.getNodeById('Start')!, b.getNodeById('N2')!)
  b.connect(b.getNodeById('N1')!, b.getNodeById('End')!)
  b.connect(b.getNodeById('N2')!, b.getNodeById('End')!)
  return new GraphConnectionsDecorator(b)
}

function getSimpleModel(g: Graph): NodeSequenceEditor {
  const m: Map<string, number> = new Map([
    ['Start', 0],
    ['N1', 1],
    ['N2', 1],
    ['End', 2]
  ])
  const builder = new NodeSequenceEditorBuilder(m, g)
  return builder.build()
}

function getGraphWithConflictAndIntermediate(): Graph {
  const b: ConcreteGraphBase = new ConcreteGraphBase()
  b.addNode('S1', '', '')
  b.addNode('S2', '', '')
  b.addNode('N1', '', '')
  b.addNode('End', '', '')
  b.connect(b.getNodeById('S1')!, b.getNodeById('N1')!)
  b.connect(b.getNodeById('S2')!, b.getNodeById('N1')!)
  b.connect(b.getNodeById('N1')!, b.getNodeById('End')!)
  // Introduces intermediate node
  b.connect(b.getNodeById('End')!, b.getNodeById('S2')!)
  return new GraphConnectionsDecorator(b)
}

function getModelWithConflictAndIntermediate(g: Graph): NodeSequenceEditor {
  const m: Map<string, number> = new Map([
    ['S1', 0],
    ['S2', 0],
    ['N1', 1],
    ['End', 2]
  ])
  const builder = new NodeSequenceEditorBuilder(m, g)
  return builder.build()
}

function getModelWithConflictAndIntermediateOrderedUpsizeDown(g: Graph): NodeSequenceEditor {
  const m: Map<string, number> = new Map([
    ['S1', 2],
    ['S2', 2],
    ['N1', 1],
    ['End', 0]
  ])
  const builder = new NodeSequenceEditorBuilder(m, g)
  return builder.build()
}
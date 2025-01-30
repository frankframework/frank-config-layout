import { ConcreteGraphBase, GraphConnectionsDecorator, Graph } from './graph'
import {LayoutBase } from './layoutBase'

describe('LayoutBase', () => {
  function getSimpleLayoutBase() {
    const b: ConcreteGraphBase = new ConcreteGraphBase()
    b.addNode('Start', '', '')
    b.addNode('N1', '', '')
    b.addNode('N2', '', '')
    b.addNode('End', '', '')
    b.connect(b.getNodeById('Start')!, b.getNodeById('N1')!)
    b.connect(b.getNodeById('Start')!, b.getNodeById('N2')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('End')!)
    b.connect(b.getNodeById('N2')!, b.getNodeById('End')!)
    const g: Graph = new GraphConnectionsDecorator(b)
    const m: Map<string, number> = new Map([
      ['Start', 0],
      ['N1', 1],
      ['N2', 1],
      ['End', 2]
    ])
    return new LayoutBase(['Start', 'N1', 'N2', 'End'], g, m, 3)
  }

  function getSimpleLayoutBaseFromOtherSequence() {
    const b: ConcreteGraphBase = new ConcreteGraphBase()
    b.addNode('End', '', '')
    b.addNode('N1', '', '')
    b.addNode('Start', '', '')
    b.addNode('N2', '', '')
    b.connect(b.getNodeById('Start')!, b.getNodeById('N1')!)
    b.connect(b.getNodeById('Start')!, b.getNodeById('N2')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('End')!)
    b.connect(b.getNodeById('N2')!, b.getNodeById('End')!)
    const g: Graph = new GraphConnectionsDecorator(b)
    const m: Map<string, number> = new Map([
      ['Start', 0],
      ['N1', 1],
      ['N2', 1],
      ['End', 2]
    ])
    return new LayoutBase(['Start', 'N1', 'N2', 'End'], g, m, 3)
  }

  it('When LayoutBase is created then it holds the right connections and the right sequence', () => {
    let instance = getSimpleLayoutBase()
    checkSimpleModel(instance)
  })

  function checkSimpleModel(instance: LayoutBase) {
    expect(instance.getSequence()).toEqual(['Start', 'N1', 'N2', 'End'])
    expect(instance.getIdsOfLayer(0)).toEqual(['Start'])
    expect(instance.getIdsOfLayer(1)).toEqual(['N1', 'N2'])
    expect(instance.getIdsOfLayer(2)).toEqual(['End'])
    expect(instance.positionsToIds(0, [0])).toEqual(['Start'])
    expect(instance.positionsToIds(1, [0])).toEqual(['N1'])
    expect(instance.positionsToIds(1, [1])).toEqual(['N2'])
    expect(instance.positionsToIds(2, [0])).toEqual(['End'])
    expect(instance.getConnections('Start', 1)).toEqual([0, 1])
    expect(instance.getConnections('N1', 0)).toEqual([0])
    expect(instance.getConnections('N2', 0)).toEqual([0])
    expect(instance.getConnections('N1', 2)).toEqual([0])
    expect(instance.getConnections('N2', 2)).toEqual([0])
    expect(instance.getConnections('End', 1)).toEqual([0, 1])
  }

  it('When a graph does not sort its nodes by layer then the LayoutBase is still correct', () => {
    let instance = getSimpleLayoutBaseFromOtherSequence()
    checkSimpleModel(instance)
  })

  // See doc/ForUnitTests/layout-to-test-class-LayoutBase.jpg
  // for the graphical representation of this layout.
  function getOtherLayoutBase(): LayoutBase {
    const b: ConcreteGraphBase = new ConcreteGraphBase()
    b.addNode('S1', '', '')
    b.addNode('S2', '', '')
    b.addNode('N1', '', '')
    b.addNode('N2', '', '')
    b.addNode('N3', '', '')
    b.addNode('E1', '', '')
    b.addNode('E2', '', '')
    b.addNode('E3', '', '')
    b.connect(b.getNodeById('S1')!, b.getNodeById('N1')!)
    b.connect(b.getNodeById('S1')!, b.getNodeById('N3')!)
    b.connect(b.getNodeById('S2')!, b.getNodeById('N3')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('E3')!)
    b.connect(b.getNodeById('N2')!, b.getNodeById('E1')!)
    b.connect(b.getNodeById('N3')!, b.getNodeById('E2')!)
    const g: Graph = new GraphConnectionsDecorator(b)
    const m: Map<string, number> = new Map([
      ['S1', 0],
      ['S2', 0],
      ['N1', 1],
      ['N2', 1],
      ['N3', 1],
      ['E1', 2],
      ['E2', 2],
      ['E3', 2]
    ])
    return new LayoutBase(['S1', 'S2', 'N1', 'N2', 'N3', 'E1', 'E2', 'E3'], g, m, 3)
  }

  function getOtherLayoutBaseFromOtherSequence(): LayoutBase {
    const b: ConcreteGraphBase = new ConcreteGraphBase()
    b.addNode('S1', '', '')
    b.addNode('N1', '', '')
    b.addNode('S2', '', '')
    b.addNode('N2', '', '')
    b.addNode('E1', '', '')
    b.addNode('N3', '', '')
    b.addNode('E2', '', '')
    b.addNode('E3', '', '')
    b.connect(b.getNodeById('S1')!, b.getNodeById('N1')!)
    b.connect(b.getNodeById('S1')!, b.getNodeById('N3')!)
    b.connect(b.getNodeById('S2')!, b.getNodeById('N3')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('E3')!)
    b.connect(b.getNodeById('N2')!, b.getNodeById('E1')!)
    b.connect(b.getNodeById('N3')!, b.getNodeById('E2')!)
    const g: Graph = new GraphConnectionsDecorator(b)
    const m: Map<string, number> = new Map([
      ['S1', 0],
      ['S2', 0],
      ['N1', 1],
      ['N2', 1],
      ['N3', 1],
      ['E1', 2],
      ['E2', 2],
      ['E3', 2]
    ])
    return new LayoutBase(['S1', 'S2', 'N1', 'N2', 'N3', 'E1', 'E2', 'E3'], g, m, 3)
  }

  it('When another LayoutBase is created then it holds the right connections and the right sequence', () => {
    let instance = getOtherLayoutBase()
    checkOtherModel(instance)
  })

  function checkOtherModel(instance: LayoutBase) {
    expect(instance.getSequence()).toEqual(['S1', 'S2', 'N1', 'N2', 'N3', 'E1', 'E2', 'E3'])
    expect(instance.getIdsOfLayer(0)).toEqual(['S1', 'S2'])
    expect(instance.getIdsOfLayer(1)).toEqual(['N1', 'N2', 'N3'])
    expect(instance.getIdsOfLayer(2)).toEqual(['E1', 'E2', 'E3'])
    expect(instance.positionsToIds(0, [0])).toEqual(['S1'])
    expect(instance.positionsToIds(1, [0])).toEqual(['N1'])
    expect(instance.positionsToIds(1, [0, 2])).toEqual(['N1', 'N3'])
    expect(instance.positionsToIds(1, [1])).toEqual(['N2'])
    expect(instance.positionsToIds(2, [0])).toEqual(['E1'])
    expect(instance.getConnections('S1', 1)).toEqual([0, 2])
    expect(instance.getConnections('S2', 1)).toEqual([2])
    expect(instance.getConnections('N1', 0)).toEqual([0])
    expect(instance.getConnections('N2', 0)).toEqual([])
    expect(instance.getConnections('N3', 0)).toEqual([0, 1])
    expect(instance.getConnections('N1', 2)).toEqual([2])
    expect(instance.getConnections('N2', 2)).toEqual([0])
    expect(instance.getConnections('N3', 2)).toEqual([1])
    expect(instance.getConnections('E1', 1)).toEqual([1])
    expect(instance.getConnections('E2', 1)).toEqual([2])
    expect(instance.getConnections('E3', 1)).toEqual([0])
  }

  it('When graph of other model does not sort its nodes by layer, then LayoutBase is still correct', () => {
    let instance = getOtherLayoutBaseFromOtherSequence()
    checkOtherModel(instance)
  })
})
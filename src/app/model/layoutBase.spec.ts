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
})
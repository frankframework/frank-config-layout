import { ConcreteGraphBase, GraphConnectionsDecorator, Graph } from './graph'
import { LayoutBase, getNumCrossings, alignFromLayer} from './layoutBase'

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

describe('Operations on LayoutBase', () => {
  it('When no line crosses then none counted', () => {
    const b: ConcreteGraphBase = new ConcreteGraphBase()
    b.addNode('S1', '', '')
    b.addNode('S2', '', '')
    b.addNode('E1', '', '')
    b.addNode('E2', '', '')
    b.connect(b.getNodeById('S1')!, b.getNodeById('E1')!)
    b.connect(b.getNodeById('S2')!, b.getNodeById('E2')!)
    const g: Graph = new GraphConnectionsDecorator(b)
    const m: Map<string, number> = new Map([
      ['S1', 0],
      ['S2', 0],
      ['E1', 1],
      ['E2', 1]
    ])
    let lb = new LayoutBase(['S1', 'S2', 'E1', 'E2'], g, m, 2)
    expect(getNumCrossings(lb)).toEqual(0)
  })

  it('When there is one crossing then one counted', () => {
    const b: ConcreteGraphBase = new ConcreteGraphBase()
    b.addNode('S1', '', '')
    b.addNode('S2', '', '')
    b.addNode('E1', '', '')
    b.addNode('E2', '', '')
    b.connect(b.getNodeById('S1')!, b.getNodeById('E2')!)
    b.connect(b.getNodeById('S2')!, b.getNodeById('E1')!)
    const g: Graph = new GraphConnectionsDecorator(b)
    const m: Map<string, number> = new Map([
      ['S1', 0],
      ['S2', 0],
      ['E1', 1],
      ['E2', 1]
    ])
    let lb = new LayoutBase(['S1', 'S2', 'E1', 'E2'], g, m, 2)
    expect(getNumCrossings(lb)).toEqual(1)
  })

  it('When LayoutBase is nontrivial then num crossings counted correctly', () => {
    let lb: LayoutBase = getOtherLayoutBase()
    expect(getNumCrossings(lb)).toEqual(2)
  })

  it('When one crossing is swapped away then one less crossing counted', () => {
    let lb: LayoutBase = getOtherLayoutBase()
    lb.putNewSequenceInLayer(2, ["E1", "E3", "E2"])
    expect(lb.getSequence()).toEqual(["S1", "S2", "N1", "N2", "N3", "E1", "E3", "E2"])
    expect(lb.getIdsOfLayer(0)).toEqual(["S1", "S2"])
    expect(lb.getIdsOfLayer(1)).toEqual(["N1", "N2", "N3"])
    expect(lb.getIdsOfLayer(2)).toEqual(["E1", "E3", "E2"])
    expect(getNumCrossings(lb)).toEqual(1)
  })

  // Create the following LayoutBase:
  //
  //   0A  0B  0C
  //      
  //   1B  1C  1A
  //
  //   2C  2A  2B
  //
  // with nodes of same letters connected.
  // Then do three different tests, each fixing
  // one of the layers and aligning the other.
  //
  const alignmentCase = [
    ['A', 'B', 'C'],
    ['B', 'C', 'A'],
    ['C', 'A', 'B']
  ]

  for (let alignmentLayer = 0; alignmentLayer <= 2; ++alignmentLayer) {
    it(`When aligning with fixed layer ${alignmentLayer}, then others are aligned correctly`, () => {
      const b: ConcreteGraphBase = new ConcreteGraphBase()
      for (let layerNumber = 0; layerNumber <= 2; ++layerNumber) {
        for (let position = 0; position <= 2; ++position) {
          const id: string = '' + layerNumber + alignmentCase[layerNumber][position]
          b.addNode(id, '', '')
        }
      }
      for (let layerNumber = 0; layerNumber <= 1; ++layerNumber) {
        for (const letterOfId of ['A', 'B', 'C']) {
          const idFirst: string = '' + layerNumber + letterOfId
          const nextLayerNumber: number = layerNumber + 1
          const idSecond: string = '' + nextLayerNumber + letterOfId
          b.connect(b.getNodeById(idFirst)!, b.getNodeById(idSecond)!)
        }
      }
      const g: Graph = new GraphConnectionsDecorator(b)
      const m: Map<string, number> = new Map([
        ['0A', 0],
        ['0B', 0],
        ['0C', 0],
        ['1A', 1],
        ['1B', 1],
        ['1C', 1],
        ['2A', 2],
        ['2B', 2],
        ['2C', 2]
      ])
      const sequence: string[] = g.getNodes().map(n => n.getId())
      let lb = new LayoutBase(sequence, g, m, 3)
      alignFromLayer(lb, alignmentLayer)
      const expectedSequenceOfLetters = alignmentCase[alignmentLayer]
      for (let testLayer = 0; testLayer <= 2; ++testLayer) {
        expect(lb.getIdsOfLayer(testLayer)).toEqual(expectedSequenceOfLetters.map(letter => '' + testLayer + letter))
      }
    })
  }
})
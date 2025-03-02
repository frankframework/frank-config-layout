import { createText } from './text'
import { Graph } from './graph'
import { GraphForLayers, NodeImpl, EdgeImpl, PASS_DIRECTION_DOWN } from './horizontalGrouping'
import { LayoutBase, getNumCrossings, alignFromLayer, NumCrossingsJudgement} from './layoutBase'

function addNode(id: string, layer: number, g: GraphForLayers) {
  g.addNode({
    id,
    layer,
    // These are dummy
    isIntermediate: true,
    text: '',
    isError: false
  })
}

function connect(idFrom: string, idTo: string, g: GraphForLayers) {
  g.addEdge({
    from: g.getNodeById(idFrom),
    to: g.getNodeById(idTo),
    // These are dummy
    isError: false,
    isFirstSegment: true,
    isIntermediate: true,
    isLastSegment: true,
    text: createText(undefined),
    passDirection: PASS_DIRECTION_DOWN
  })
}

// See doc/ForUnitTests/layout-to-test-class-LayoutBase.jpg
// for the graphical representation of this layout.
function getOtherLayoutBase(): LayoutBase {
  const g = new Graph<NodeImpl, EdgeImpl>()
  addNode('S1', 0, g)
  addNode('S2', 0, g)
  addNode('N1', 1, g)
  addNode('N2', 1, g)
  addNode('N3', 1, g)
  addNode('E1', 2, g)
  addNode('E2', 2, g)
  addNode('E3', 2, g)
  connect('S1', 'N1', g)
  connect('S1', 'N3', g)
  connect('S2', 'N3', g)
  connect('N1', 'E3', g)
  connect('N2', 'E1', g)
  connect('N3', 'E2', g)
  return LayoutBase.create(['S1', 'S2', 'N1', 'N2', 'N3', 'E1', 'E2', 'E3'], g, 3)
}

describe('LayoutBase', () => {
  function getSimpleLayoutBase() {
    const g = new Graph<NodeImpl, EdgeImpl>()
    addNode('Start', 0, g)
    addNode('N1', 1, g)
    addNode('N2', 1, g)
    addNode('End', 2, g)
    connect('Start', 'N1', g)
    connect('Start', 'N2', g)
    connect('N1', 'End', g)
    connect('N2', 'End', g)
    return LayoutBase.create(['Start', 'N1', 'N2', 'End'], g, 3)
  }

  function getSimpleLayoutBaseFromOtherSequence() {
    const g = new Graph<NodeImpl, EdgeImpl>()
    addNode('End', 2, g)
    addNode('N1', 1, g)
    addNode('Start', 0, g)
    addNode('N2', 1, g)
    connect('Start', 'N1', g)
    connect('Start', 'N2', g)
    connect('N1', 'End', g)
    connect('N2', 'End', g)
    return LayoutBase.create(['Start', 'N1', 'N2', 'End'], g, 3)
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
    const g = new Graph<NodeImpl, EdgeImpl>()
    addNode('S1', 0, g)
    addNode('N1', 1, g)
    addNode('S2', 0, g)
    addNode('N2', 1, g)
    addNode('E1', 2, g)
    addNode('N3', 1, g)
    addNode('E2', 2, g)
    addNode('E3', 2, g)
    connect('S1', 'N1', g)
    connect('S1', 'N3', g)
    connect('S2', 'N3', g)
    connect('N1', 'E3', g)
    connect('N2', 'E1', g)
    connect('N3', 'E2', g)
    return LayoutBase.create(['S1', 'S2', 'N1', 'N2', 'N3', 'E1', 'E2', 'E3'], g, 3)
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
    const g = new Graph<NodeImpl, EdgeImpl>()
    addNode('S1', 0, g)
    addNode('S2', 0, g)
    addNode('E1', 1, g)
    addNode('E2', 1, g)
    connect('S1', 'E1', g)
    connect('S2', 'E2', g)
    let lb = LayoutBase.create(['S1', 'S2', 'E1', 'E2'], g, 2)
    expect(getNumCrossings(lb)).toEqual(0)
  })

  it('When there is one crossing then one counted', () => {
    const g = new Graph<NodeImpl, EdgeImpl>()
    addNode('S1', 0, g)
    addNode('S2', 0, g)
    addNode('E1', 1, g)
    addNode('E2', 1, g)
    connect('S1', 'E2', g)
    connect('S2', 'E1', g)
    let lb = LayoutBase.create(['S1', 'S2', 'E1', 'E2'], g, 2)
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
      const g = new Graph<NodeImpl, EdgeImpl>()
      for (let layerNumber = 0; layerNumber <= 2; ++layerNumber) {
        for (let position = 0; position <= 2; ++position) {
          const id: string = '' + layerNumber + alignmentCase[layerNumber][position]
          addNode(id, layerNumber, g)
        }
      }
      for (let layerNumber = 0; layerNumber <= 1; ++layerNumber) {
        for (const letterOfId of ['A', 'B', 'C']) {
          const idFirst: string = '' + layerNumber + letterOfId
          const nextLayerNumber: number = layerNumber + 1
          const idSecond: string = '' + nextLayerNumber + letterOfId
          connect(idFirst, idSecond, g)
        }
      }
      const sequence: string[] = g.nodes.map(n => n.id)
      let lb = LayoutBase.create(sequence, g, 3)
      alignFromLayer(lb, alignmentLayer)
      const expectedSequenceOfLetters = alignmentCase[alignmentLayer]
      for (let testLayer = 0; testLayer <= 2; ++testLayer) {
        expect(lb.getIdsOfLayer(testLayer)).toEqual(expectedSequenceOfLetters.map(letter => '' + testLayer + letter))
      }
    })
  }
})

describe('LayoutBase NumCrossingsJudgement', () => {
  it (`When NumCrossingsJudgements differ by crossings reduction and num nodes, then reduction takes precedence`, () => {
    const first = new NumCrossingsJudgement(0, 10, 40)
    const second = new NumCrossingsJudgement(1, 8, 45)
    expect(first.compareTo(second)).toEqual(-5)
    expect(second.compareTo(first)).toEqual(5)
  })

  it(`When NumCrossingsJudgements differ by num nodes, then that criterion is used`, () => {
    const first = new NumCrossingsJudgement(0, 10, 40)
    const second = new NumCrossingsJudgement(1, 8, 40)
    expect(first.compareTo(second)).toEqual(2)
    expect(second.compareTo(first)).toEqual(-2)
  })
})
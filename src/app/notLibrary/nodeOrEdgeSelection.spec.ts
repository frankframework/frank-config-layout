import { getRange } from "../util/util"
import { ConcreteGraphBase, GraphConnectionsDecorator } from "../model/graph"
import { Node } from "../model/graph"
import { LayoutBase } from "../model/layoutBase"
import { NodeSequenceEditorBuilder } from "../model/horizontalGrouping"
import { NodeSequenceEditor, UpdateResponse } from "../model/nodeSequenceEditor"
import { NodeOrEdgeSelection } from "./nodeOrEdgeSelection"

describe('NodeOrEdgeSelection', () => {
  it ('Select position and undo again', () => {
    const m = getSelectionTestModel()
    expect(m.getSequence().map(n => n!.getId())).toEqual(['Start', 'N1', 'N2', 'End'])
    let instance = new NodeOrEdgeSelection()
    checkNothingSelected(instance, m)
    instance.selectPosition(1, m)
    checkNodeN1SelectedCorrectly(instance, m)
    instance.selectPosition(2, m)
    expect(instance.isFromPositionHighlightedInEditor(2, m)).toBe(true)
    instance.selectPosition(2, m)
    checkNothingSelected(instance, m)
  })

  it('Select cell and undo again', () => {
    const m = getSelectionTestModel()
    expect(m.getSequence().map(n => n!.getId())).toEqual(['Start', 'N1', 'N2', 'End'])
    let instance = new NodeOrEdgeSelection()
    checkNothingSelected(instance, m)
    instance.selectCell(0, 1, m)
    checkEdgeStartN1SelectedCorrectly(instance, m)
    instance.selectPosition(1, m)
    checkNodeN1SelectedCorrectly(instance, m)
    instance.selectCell(0, 1, m)
    checkEdgeStartN1SelectedCorrectly(instance, m)
    instance.selectCell(0, 1, m)
    checkNothingSelected(instance, m)
  })

  it ('Select node id and undo again', () => {
    const m = getSelectionTestModel()
    expect(m.getSequence().map(n => n!.getId())).toEqual(['Start', 'N1', 'N2', 'End'])
    let instance = new NodeOrEdgeSelection()
    checkNothingSelected(instance, m)
    instance.selectNodeId('N1', m)
    checkNodeN1SelectedCorrectly(instance, m)
    instance.selectNodeId('N2', m)
    expect(instance.isFromPositionHighlightedInEditor(2, m)).toBe(true)
    instance.selectNodeId('N2', m)
    checkNothingSelected(instance, m)
  })

  it('Select edge key and undo again', () => {
    const m = getSelectionTestModel()
    expect(m.getSequence().map(n => n!.getId())).toEqual(['Start', 'N1', 'N2', 'End'])
    let instance = new NodeOrEdgeSelection()
    checkNothingSelected(instance, m)
    instance.selectEdgeKey('Start-N1', m)
    checkEdgeStartN1SelectedCorrectly(instance, m)
    instance.selectNodeId('N1', m)
    checkNodeN1SelectedCorrectly(instance, m)
    instance.selectEdgeKey('Start-N1', m)
    checkEdgeStartN1SelectedCorrectly(instance, m)
    instance.selectEdgeKey('Start-N1', m)
    checkNothingSelected(instance, m)
  })

  it('When changed sequence from layoutBase is put back in model with omitted nodes, permutation correctly updates index of some selected node', () => {
    const b = new ConcreteGraphBase()
    newNode('N1', b)
    newNode('N2', b)
    newNode('N3', b)
    newNode('N4', b)
    const m: Map<string, number> = new Map([
      ['N1', 0],
      ['N2', 0],
      ['N3', 0],
      ['N4', 0]
    ])
    const g = new GraphConnectionsDecorator(b)
    const builder = new NodeSequenceEditorBuilder(m, g)
    const model: NodeSequenceEditor = builder.build()
    // Omits N2
    expect(model.omitNodeFrom(1)).toEqual(UpdateResponse.ACCEPTED)
    const lb: LayoutBase = model.getShownNodesLayoutBase()
    expect(lb.getSequence()).toEqual(['N1', 'N3', 'N4'])
    lb.putNewSequenceInLayer(0, ['N3', 'N4', 'N1'])
    const permutation = model.updatePositionsOfShownNodes(lb)
    const updatedSequence: (string | null)[] = model.getSequence().map(n => n === null ? null : n.getId())
    expect(updatedSequence).toEqual(['N3', null, 'N4', 'N1'])
    // If N1 was selected, it was index 0 and becomes index 3
    expect(permutation[0]).toEqual(3)
    // N2 was omitted. No index change.
    expect(permutation[1]).toEqual(1)
    expect(permutation[2]).toEqual(0)
    expect(permutation[3]).toEqual(2)
  })
})

function getSelectionTestModel(): NodeSequenceEditor {
  const b = new ConcreteGraphBase()
  newNode('Start', b)
  newNode('N1', b)
  newNode('N2', b)
  newNode('End', b)
  insertNewEdge('Start', 'N1', b)
  insertNewEdge('Start', 'N2', b)
  insertNewEdge('N1', 'End', b)
  insertNewEdge('N2', 'End', b)
  const layerMap: Map<string, number> = new Map([
    ['Start', 0],
    ['N1', 1],
    ['N2', 1],
    ['End', 2]
  ])
  const builder = new NodeSequenceEditorBuilder(layerMap, b)
  return builder.build()
}

function checkNothingSelected(instance: NodeOrEdgeSelection, m: NodeSequenceEditor) {
  ['Start', 'N1', 'N2', 'End'].forEach(nodeId => {
    expect(instance.isNodeHighlightedInDrawing(nodeId, m)).toBe(false)
  });
  ['Start-N1', 'Start-N2', 'N1-End', 'N2-End'].forEach(edgeKey => {
    expect(instance.isEdgeHighlightedInDrawing(edgeKey, m)).toBe(false)
  })
  getRange(0, 4).forEach(index => {
    expect(instance.isFromPositionHighlightedInEditor(index, m)).toBe(false)
    expect(instance.isToPositionHighlightedInEditor(index, m)).toBe(false)
  })
  getRange(0, 4).forEach(indexFrom => {
    getRange(0, 4).forEach(indexTo => {
      expect(instance.isCellHighlightedInEditor(indexFrom, indexTo, m)).toBe(false)
    })
  })
}

function checkNodeN1SelectedCorrectly(instance: NodeOrEdgeSelection, m: NodeSequenceEditor) {
  ['Start', 'N2', 'End'].forEach(nodeId => {
    expect(instance.isNodeHighlightedInDrawing(nodeId, m)).toBe(false)
  });
  expect(instance.isNodeHighlightedInDrawing('N1', m)).toBe(true);
  ['Start-N1', 'N1-End'].forEach(edgeKey => {
    expect(instance.isEdgeHighlightedInDrawing(edgeKey, m)).toBe(true)
  });
  ['Start-N2', 'N2-End'].forEach(edgeKey => {
    expect(instance.isEdgeHighlightedInDrawing(edgeKey, m)).toBe(false)
  });
  [false, true, false, false].forEach((expectedToHighlighted, indexTo) => {
    expect(instance.isToPositionHighlightedInEditor(indexTo, m)).toBe(expectedToHighlighted)
  });
  [false,
  true,
  false,
  false].forEach((expectedFromHighlighted, indexFrom) => {
    expect(instance.isFromPositionHighlightedInEditor(indexFrom, m)).toBe(expectedFromHighlighted)
  });
  [
    [false, true, false, false],
    [true, true, true, true],
    [false, true, false, false],
    [false, true, false, false]
  ].forEach( (row, indexFrom) => {
    row.forEach((expectedCellHighlighted, indexTo) => {
      expect(instance.isCellHighlightedInEditor(indexFrom, indexTo, m)).toBe(expectedCellHighlighted)
    })
  })
}

function checkEdgeStartN1SelectedCorrectly(instance: NodeOrEdgeSelection, m: NodeSequenceEditor) {
  ['Start', 'N1'].forEach(nodeId => {
    expect(instance.isNodeHighlightedInDrawing(nodeId, m)).toBe(true)
  });
  ['N2', 'End'].forEach(nodeId => {
    expect(instance.isNodeHighlightedInDrawing(nodeId, m)).toBe(false)
  });
  expect(instance.isEdgeHighlightedInDrawing('Start-N1', m)).toBe(true);
  ['Start-N2', 'N1-End', 'N2-End'].forEach(edgeKey => {
    expect(instance.isEdgeHighlightedInDrawing(edgeKey, m)).toBe(false)
  });
  [false, true, false, false].forEach((expectedToHighlighted, indexTo) => {
    expect(instance.isToPositionHighlightedInEditor(indexTo, m)).toBe(expectedToHighlighted)
  });
  [true,
  false,
  false,
  false].forEach((expectedFromHighlighted, indexFrom) => {
    expect(instance.isFromPositionHighlightedInEditor(indexFrom, m)).toBe(expectedFromHighlighted)
  });
  [
    [false, true, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false]
  ].forEach((row, indexFrom) => {
    row.forEach((expectedCellHighlighted, indexTo) => {
      expect(instance.isCellHighlightedInEditor(indexFrom, indexTo, m)).toBe(expectedCellHighlighted)
    })
  })
}

function newNode(id: string, g: ConcreteGraphBase) {
  g.addNode(id, '', '')
}

function insertNewEdge(fromId: string, toId: string, b: ConcreteGraphBase) {
  const from: Node | undefined = b.getNodeById(fromId)
  const to: Node | undefined = b.getNodeById(toId)
  if (from === undefined) {
    throw new Error(`Invalid test case, node with id ${fromId} does not exist`)
  }
  if (to === undefined) {
    throw new Error(`Invalid test case, node with id ${toId} does not exist`)
  }
  b.connect(from!, to!, '')
}

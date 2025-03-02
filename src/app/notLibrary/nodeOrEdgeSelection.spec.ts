import { Graph } from '../model/graph'
import { getRange } from "../util/util"
import { LayoutBase } from "../model/layoutBase"
import { NodeSequenceEditor, UpdateResponse } from "./nodeSequenceEditor"
import { NodeOrEdgeSelection } from "./nodeOrEdgeSelection"
import { createText } from '../model/text'
import { Node, Edge } from '../public.api'

describe('NodeOrEdgeSelection', () => {
  it ('Select position and undo again', () => {
    const m = getSelectionTestModel()
    expect(m.getSequence().map(n => n!.id)).toEqual(['Start', 'N1', 'N2', 'End'])
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
    expect(m.getSequence().map(n => n!.id)).toEqual(['Start', 'N1', 'N2', 'End'])
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
    expect(m.getSequence().map(n => n!.id)).toEqual(['Start', 'N1', 'N2', 'End'])
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
    expect(m.getSequence().map(n => n!.id)).toEqual(['Start', 'N1', 'N2', 'End'])
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
    const g = new Graph<Node, Edge<Node>>()
    newNode('N1', 0, g)
    newNode('N2', 0, g)
    newNode('N3', 0, g)
    newNode('N4', 0, g)
    const model = new NodeSequenceEditor(g)
    // Omits N2
    expect(model.omitNodeFrom(1)).toEqual(UpdateResponse.ACCEPTED)
    const lb: LayoutBase = model.getShownNodesLayoutBase()
    expect(lb.getSequence()).toEqual(['N1', 'N3', 'N4'])
    lb.putNewSequenceInLayer(0, ['N3', 'N4', 'N1'])
    const permutation = model.updatePositionsOfShownNodes(lb)
    const updatedSequence: (string | null)[] = model.getSequence().map(n => n === null ? null : n.id)
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
  const g = new Graph<Node, Edge<Node>>()
  newNode('Start', 0, g)
  newNode('N1', 1, g)
  newNode('N2', 1, g)
  newNode('End', 2, g)
  connect('Start', 'N1', g)
  connect('Start', 'N2', g)
  connect('N1', 'End', g)
  connect('N2', 'End', g)
  return new NodeSequenceEditor(g)
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

function newNode(id: string, layer: number, g: Graph<Node, Edge<Node>>) {
  g.addNode({id, layer, text: '', isError: false, isIntermediate: false})
}

function connect(idFrom: string, idTo: string, g: Graph<Node, Edge<Node>>) {
  g.addEdge({
    from: g.getNodeById(idFrom),
    to: g.getNodeById(idTo),
    isError: false,
    isIntermediate: false,
    text: createText(undefined)
  })
}

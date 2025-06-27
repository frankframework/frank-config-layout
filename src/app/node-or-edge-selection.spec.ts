import { NodeSequenceEditor, UpdateResponse } from './node-sequence-editor';
import { NodeOrEdgeSelection } from './node-or-edge-selection';
import {
  getRange,
  createEdgeText,
  createNodeText,
  LayoutBase,
  createGraphForLayers,
  GraphForLayers,
  ERROR_STATUS_SUCCESS,
} from 'frank-config-layout';

describe('NodeOrEdgeSelection', () => {
  it('Select position and undo again', () => {
    const m = getSelectionTestModel();
    expect(m.getSequence().map((n) => n!.id)).toEqual(['Start', 'N1', 'N2', 'End']);
    const instance = new NodeOrEdgeSelection();
    checkNothingSelected(instance, m);
    instance.selectPosition(1, m);
    checkNodeN1SelectedCorrectly(instance, m);
    instance.selectPosition(2, m);
    expect(instance.isFromPositionHighlightedInEditor(2, m)).toBe(true);
    instance.selectPosition(2, m);
    checkNothingSelected(instance, m);
  });

  it('Select cell and undo again', () => {
    const m = getSelectionTestModel();
    expect(m.getSequence().map((n) => n!.id)).toEqual(['Start', 'N1', 'N2', 'End']);
    const instance = new NodeOrEdgeSelection();
    checkNothingSelected(instance, m);
    instance.selectCell(0, 1, m);
    checkEdgeStartN1SelectedCorrectly(instance, m);
    instance.selectPosition(1, m);
    checkNodeN1SelectedCorrectly(instance, m);
    instance.selectCell(0, 1, m);
    checkEdgeStartN1SelectedCorrectly(instance, m);
    instance.selectCell(0, 1, m);
    checkNothingSelected(instance, m);
  });

  it('Select node id and undo again', () => {
    const m = getSelectionTestModel();
    expect(m.getSequence().map((n) => n!.id)).toEqual(['Start', 'N1', 'N2', 'End']);
    const instance = new NodeOrEdgeSelection();
    checkNothingSelected(instance, m);
    instance.selectNodeId('N1', m);
    checkNodeN1SelectedCorrectly(instance, m);
    instance.selectNodeId('N2', m);
    expect(instance.isFromPositionHighlightedInEditor(2, m)).toBe(true);
    instance.selectNodeId('N2', m);
    checkNothingSelected(instance, m);
  });

  it('Select edge key and undo again', () => {
    const m = getSelectionTestModel();
    expect(m.getSequence().map((n) => n!.id)).toEqual(['Start', 'N1', 'N2', 'End']);
    const instance = new NodeOrEdgeSelection();
    checkNothingSelected(instance, m);
    instance.selectEdgeKey('Start-N1', m);
    checkEdgeStartN1SelectedCorrectly(instance, m);
    instance.selectNodeId('N1', m);
    checkNodeN1SelectedCorrectly(instance, m);
    instance.selectEdgeKey('Start-N1', m);
    checkEdgeStartN1SelectedCorrectly(instance, m);
    instance.selectEdgeKey('Start-N1', m);
    checkNothingSelected(instance, m);
  });

  it('When changed sequence from layoutBase is put back in model with omitted nodes, permutation correctly updates index of some selected node', () => {
    const g = createGraphForLayers();
    newNode('N1', 0, g);
    newNode('N2', 0, g);
    newNode('N3', 0, g);
    newNode('N4', 0, g);
    const model = new NodeSequenceEditor(g);
    // Omits N2
    expect(model.omitNodeFrom(1)).toEqual(UpdateResponse.ACCEPTED);
    const lb: LayoutBase = model.getShownNodesLayoutBase();
    expect(lb.getSequence()).toEqual(['N1', 'N3', 'N4']);
    lb.putNewSequenceInLayer(0, ['N3', 'N4', 'N1']);
    const permutation = model.updatePositionsOfShownNodes(lb);
    const updatedSequence: (string | null)[] = model.getSequence().map((n) => (n === null ? null : n.id));
    expect(updatedSequence).toEqual(['N3', null, 'N4', 'N1']);
    // If N1 was selected, it was index 0 and becomes index 3
    expect(permutation[0]).toEqual(3);
    // N2 was omitted. No index change.
    expect(permutation[1]).toEqual(1);
    expect(permutation[2]).toEqual(0);
    expect(permutation[3]).toEqual(2);
  });
});

function getSelectionTestModel(): NodeSequenceEditor {
  const g = createGraphForLayers();
  newNode('Start', 0, g);
  newNode('N1', 1, g);
  newNode('N2', 1, g);
  newNode('End', 2, g);
  connect('Start', 'N1', g);
  connect('Start', 'N2', g);
  connect('N1', 'End', g);
  connect('N2', 'End', g);
  return new NodeSequenceEditor(g);
}

function checkNothingSelected(instance: NodeOrEdgeSelection, m: NodeSequenceEditor): void {
  for (const nodeId of ['Start', 'N1', 'N2', 'End']) {
    expect(instance.isNodeHighlightedInDrawing(nodeId, m)).toBe(false);
  }
  for (const edgeKey of ['Start-N1', 'Start-N2', 'N1-End', 'N2-End']) {
    expect(instance.isEdgeHighlightedInDrawing(edgeKey, m)).toBe(false);
  }
  for (const index of getRange(0, 4)) {
    expect(instance.isFromPositionHighlightedInEditor(index, m)).toBe(false);
    expect(instance.isToPositionHighlightedInEditor(index, m)).toBe(false);
  }
  for (const indexFrom of getRange(0, 4)) {
    for (const indexTo of getRange(0, 4)) {
      expect(instance.isCellHighlightedInEditor(indexFrom, indexTo, m)).toBe(false);
    }
  }
}

function checkNodeN1SelectedCorrectly(instance: NodeOrEdgeSelection, m: NodeSequenceEditor): void {
  for (const nodeId of ['Start', 'N2', 'End']) {
    expect(instance.isNodeHighlightedInDrawing(nodeId, m)).toBe(false);
  }
  expect(instance.isNodeHighlightedInDrawing('N1', m)).toBe(true);
  for (const edgeKey of ['Start-N1', 'N1-End']) {
    expect(instance.isEdgeHighlightedInDrawing(edgeKey, m)).toBe(true);
  }
  for (const edgeKey of ['Start-N2', 'N2-End']) {
    expect(instance.isEdgeHighlightedInDrawing(edgeKey, m)).toBe(false);
  }
  for (const [indexTo, expectedToHighlighted] of [false, true, false, false].entries()) {
    expect(instance.isToPositionHighlightedInEditor(indexTo, m)).toBe(expectedToHighlighted);
  }
  for (const [indexFrom, expectedFromHighlighted] of [false, true, false, false].entries()) {
    expect(instance.isFromPositionHighlightedInEditor(indexFrom, m)).toBe(expectedFromHighlighted);
  }
  const rowExpectationsHighlighted = [
    [false, true, false, false],
    [true, true, true, true],
    [false, true, false, false],
    [false, true, false, false],
  ];
  for (const [indexFrom, singleRowExpectations] of rowExpectationsHighlighted.entries()) {
    for (const [indexTo, expectedCellHighlighted] of singleRowExpectations.entries()) {
      expect(instance.isCellHighlightedInEditor(indexFrom, indexTo, m)).toBe(expectedCellHighlighted);
    }
  }
}

function checkEdgeStartN1SelectedCorrectly(instance: NodeOrEdgeSelection, m: NodeSequenceEditor): void {
  for (const nodeId of ['Start', 'N1']) {
    expect(instance.isNodeHighlightedInDrawing(nodeId, m)).toBe(true);
  }
  for (const nodeId of ['N2', 'End']) {
    expect(instance.isNodeHighlightedInDrawing(nodeId, m)).toBe(false);
  }
  expect(instance.isEdgeHighlightedInDrawing('Start-N1', m)).toBe(true);
  for (const edgeKey of ['Start-N2', 'N1-End', 'N2-End']) {
    expect(instance.isEdgeHighlightedInDrawing(edgeKey, m)).toBe(false);
  }
  for (const [indexTo, expectedToHighlighted] of [false, true, false, false].entries()) {
    expect(instance.isToPositionHighlightedInEditor(indexTo, m)).toBe(expectedToHighlighted);
  }
  for (const [indexFrom, expectedFromHighlighted] of [true, false, false, false].entries()) {
    expect(instance.isFromPositionHighlightedInEditor(indexFrom, m)).toBe(expectedFromHighlighted);
  }
  const rowExpectationsHighlighted = [
    [false, true, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
  ];
  for (const [indexFrom, singleRowExpectations] of rowExpectationsHighlighted.entries()) {
    for (const [indexTo, expectedCellHighlighted] of singleRowExpectations.entries()) {
      expect(instance.isCellHighlightedInEditor(indexFrom, indexTo, m)).toBe(expectedCellHighlighted);
    }
  }
}

function newNode(id: string, layer: number, g: GraphForLayers): void {
  g.addNode({ id, layer, text: createNodeText(''), errorStatus: ERROR_STATUS_SUCCESS });
}

function connect(idFrom: string, idTo: string, g: GraphForLayers): void {
  g.addEdge({
    from: g.getNodeById(idFrom),
    to: g.getNodeById(idTo),
    text: createEdgeText(),
  });
}

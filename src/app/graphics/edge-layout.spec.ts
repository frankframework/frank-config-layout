import { createText } from '../model/text'
import { PASS_DIRECTION_DOWN, PASS_DIRECTION_UP, calculateLayerNumbersFirstOccuringPath, assignHorizontalLayerNumbers } from '../model/horizontalGrouping'
import { OriginalGraph, createOriginalGraph } from '../model/error-flow'
import { LayoutBase } from '../model/layoutBase'
import { Point, Line } from "./graphics"
import { NodeLayoutBuilder } from './node-layout'
import { Layout, NodeAndEdgeDimensions, PlacedNode, LayoutLineSegment, groupForEdgeLabelLayout } from "./edge-layout"
import { DerivedEdgeLabelDimensions } from "./edge-label-layouter"

interface LabelGroupTestSegmentBase {
  originId: string
  direction: number
  edgeKey: string
  startX: number
  endX: number
}

function lsForGroup(t: LabelGroupTestSegmentBase): LayoutLineSegment {
  const startPoint: Point = new Point(t.startX, 0)
  const endPoint: Point = new Point(t.endX, 0)
  const line = new Line(startPoint, endPoint)
  return {
    isError: false,
    isFirstLineSegment: false,
    isLastLineSegment: false,
    key: t.edgeKey,
    line,
    maxLayerNumber: 1,
    minLayerNumber: 0,
    text: createText('aap'),
    originId: t.originId,
    passDirection: t.direction
  }
}

describe('Grouping LayoutLineSegment-s for labels', () => {
  it('When line segments are in the same group, then they are sorted by x-coordinate', () => {
    const segments: LayoutLineSegment[] = [
      lsForGroup({originId: "origin", direction: PASS_DIRECTION_DOWN, edgeKey: "key-A", startX: 30, endX: 10}),
      lsForGroup({originId: "origin", direction: PASS_DIRECTION_DOWN, edgeKey: "key-B", startX: 20, endX: 0}),
      lsForGroup({originId: "origin", direction: PASS_DIRECTION_DOWN, edgeKey: "key-C", startX: 30, endX: 0}),
      lsForGroup({originId: "origin", direction: PASS_DIRECTION_DOWN, edgeKey: "key-D", startX: 30, endX: 20}),
      lsForGroup({originId: "origin", direction: PASS_DIRECTION_DOWN, edgeKey: "key-E", startX: 40, endX: 20})
    ]
    const groups: LayoutLineSegment[][] = groupForEdgeLabelLayout(segments)
    expect(groups.length).toEqual(1)
    const theGroup = groups[0]
    expect(theGroup.map(ls => ls.key)).toEqual(["key-B", "key-C", "key-A", "key-D", "key-E"])
  })

  it('When line segments belong to different groups, then they appear in different groups', () => {
    const segments: LayoutLineSegment[] = [
      lsForGroup({originId: "B", direction: PASS_DIRECTION_UP, edgeKey: "key-A", startX: 0, endX: 0}),
      lsForGroup({originId: "B", direction: PASS_DIRECTION_DOWN, edgeKey: "key-B", startX: 0, endX: 0}),
      lsForGroup({originId: "A", direction: PASS_DIRECTION_DOWN, edgeKey: "key-C", startX: 0, endX: 0}),
      lsForGroup({originId: "A", direction: PASS_DIRECTION_DOWN, edgeKey: "key-D", startX: 10, endX: 0}),
      lsForGroup({originId: "A", direction: PASS_DIRECTION_UP, edgeKey: "key-E", startX: 0, endX: 0})
    ]
    const groups = groupForEdgeLabelLayout(segments)
    expect(groups.length).toEqual(4)
    // A, DOWN
    expect(groups[0].map(s => s.key)).toEqual(["key-C", "key-D"])
    // A, UP
    expect(groups[1].map(s => s.key)).toEqual(["key-E"])
    // B, DOWN
    expect(groups[2].map(s => s.key)).toEqual(["key-B"])
    // B, UP
    expect(groups[3].map(s => s.key)).toEqual(["key-A"])
  })
})

function addNode(id: string, text: string, g: OriginalGraph) {
  g.addNode({
    id,
    text,
    // Dummy value
    isError: false
  })
}

function connect(idFrom: string, idTo: string, g: OriginalGraph) {
  g.addEdge({
    from: g.getNodeById(idFrom),
    to: g.getNodeById(idTo),
    // Dummy values
    text: createText(undefined),
    isError: false
  })
}

describe('Layout', () => {
  it('Test with intermediate nodes', () => {
    const g = createOriginalGraph()
    addNode('Start', 'Text of Start', g)
    addNode('N1', 'Text of N1', g)
    addNode('N2', 'Text of N2', g)
    addNode('End', 'Text of End', g)
    connect('Start', 'N1', g)
    connect('Start', 'N2', g)
    connect('N1', 'End', g)
    connect('N2', 'End', g)
    connect('N1', 'N2', g)
    const m = calculateLayerNumbersFirstOccuringPath(g)
    const gl = assignHorizontalLayerNumbers(g, m)
    const lb = LayoutBase.create(['Start', 'N1', 'intermediate1', 'N2', 'intermediate2', 'End'], gl, 4)
    const nodeLayout = new NodeLayoutBuilder(lb, gl, dimensions).run()
    const layout = new Layout(nodeLayout, dimensions, derivedEdgeLabelDimensions)
    expect(layout.nodes.map(n => n.id)).toEqual(['Start', 'N1', 'intermediate1', 'N2', 'intermediate2', 'End'])
    // Start --> N2 needs intermediate1, N1 --> End needs intermediate2
    expect(layout.nodes.map(n => (n as PlacedNode).layer)).toEqual([0, 1, 1, 2, 2, 3])
    // Layer 2 centered around median 105, size is 180.
    expect(layout.nodes.map(n => (n as PlacedNode).centerX)).toEqual([105, 60, 150, 75, 165, 120])
    expect(layout.nodes.map(n => (n as PlacedNode).centerY)).toEqual([25, 145, 145, 265, 265, 385])
    expect(layout.nodes.map(n => (n as PlacedNode).left)).toEqual([50, 5, 150, 20, 165, 65])
    expect(layout.nodes.map(n => (n as PlacedNode).top)).toEqual([5, 125, 145, 245, 265, 365])
    expect(layout.getLayoutLineSegments().map(lls => lls.key)).toEqual(
      ['Start-N1', 'Start-intermediate1', 'intermediate1-N2', 'N1-intermediate2', 'intermediate2-End', 'N2-End', 'N1-N2']
    )
    // The center x-coordinates of the start nodes
    expect(layout.getLayoutLineSegments().map(lls => lls.line.startPoint.x)).toEqual([
      105, 105, 150, 60, 165, 75, 60
    ])
    expect(layout.getLayoutLineSegments().map(lls => lls.line.startPoint.y)).toEqual([
      44, 44, 145, 164, 265, 284, 164
    ])
    expect(layout.getLayoutLineSegments().map(lls => lls.line.endPoint.x)).toEqual([
      60, 150, 75, 165, 120, 120, 75
    ])
    expect(layout.getLayoutLineSegments().map(lls => lls.line.endPoint.y)).toEqual([
      125, 145, 245, 265, 365, 365, 245
    ])
  })

  it('When layers passed through by vertical line segments, then have according line segments', () => {
    const g = createOriginalGraph()
    addNode('Start', 'Text of Start', g)
    addNode('N1', 'Text of N1', g)
    addNode('N2', 'Text of N2', g)
    addNode('End', 'Text of End', g)
    connect('Start', 'N1', g)
    connect('Start', 'N2', g)
    connect('N1', 'End', g)
    connect('N2', 'End', g)
    connect('N1', 'N2', g)
    const modifiedDimensions = modifyForVerticalLines(dimensions)
    const m = calculateLayerNumbersFirstOccuringPath(g)
    const gl = assignHorizontalLayerNumbers(g, m)
    const lb = LayoutBase.create(['Start', 'N1', 'intermediate1', 'N2', 'intermediate2', 'End'], gl, 4)
    const nodeLayout = new NodeLayoutBuilder(lb, gl, modifiedDimensions).run()
    const layout = new Layout(nodeLayout, modifiedDimensions, derivedEdgeLabelDimensions)
    expect(layout.nodes.map(n => n.id)).toEqual(['Start', 'N1', 'intermediate1', 'N2', 'intermediate2', 'End'])
    // Start --> N2 needs intermediate1, N1 --> End needs intermediate2
    expect(layout.nodes.map(n => (n as PlacedNode).layer)).toEqual([0, 1, 1, 2, 2, 3])
    // Layer 2 centered around median 105, size is 180.
    expect(layout.nodes.map(n => (n as PlacedNode).centerX)).toEqual([105, 60, 150, 75, 165, 120])
    expect(layout.nodes.map(n => (n as PlacedNode).centerY)).toEqual([25, 145, 145, 265, 265, 385])
    expect(layout.nodes.map(n => (n as PlacedNode).left)).toEqual([50, 5, 150, 20, 165, 65])
    expect(layout.nodes.map(n => (n as PlacedNode).top)).toEqual([5, 125, 125, 245, 245, 365])
    expect(layout.getLayoutLineSegments().map(lls => lls.key)).toEqual(
      ['Start-N1', 'Start-intermediate1', 'intermediate1-N2', 'N1-intermediate2', 'intermediate2-End', 'N2-End', 'N1-N2',
        'pass-intermediate1', 'pass-intermediate2'
      ]
    )
    // The center x-coordinates of the start nodes
    // Compare with 105, 105, 150, 60, 165, 75, 60
    expect(layout.getLayoutLineSegments().map(lls => lls.line.startPoint.x)).toEqual([
      105, 105, 150, 60, 165, 75, 60, 150, 165
    ])
    // Compare with 44, 44, 145, 164, 265, 284, 164
    expect(layout.getLayoutLineSegments().map(lls => lls.line.startPoint.y)).toEqual([
      44, 44, 164, 164, 284, 284, 164, 125, 245
    ])
    // Compare with 60, 150, 75, 165, 120, 120, 75
    expect(layout.getLayoutLineSegments().map(lls => lls.line.endPoint.x)).toEqual([
      60, 150, 75, 165, 120, 120, 75, 150, 165
    ])
    // Compare with 125, 145, 245, 265, 365, 365, 245
    expect(layout.getLayoutLineSegments().map(lls => lls.line.endPoint.y)).toEqual([
      125, 125, 245, 245, 365, 365, 245, 164, 284
    ])
  })
})

const dimensions: NodeAndEdgeDimensions = {
  layerHeight: 50,
  layerDistance: 120,
  nodeBoxHeight: 40,
  intermediateWidth: 60,
  nodeWidth: 120,
  nodeBoxWidth: 110,
  // Do not include spreading edge connection points here.
  // It is complicated enough to understand the
  // calculation without.
  boxConnectorAreaPerc: 0,
  intermediateLayerPassedByVerticalLine: false,
}

function modifyForVerticalLines(originalDimensions: NodeAndEdgeDimensions): NodeAndEdgeDimensions {
  const result: NodeAndEdgeDimensions = { ... originalDimensions}
  result.intermediateLayerPassedByVerticalLine = true
  return result
}

const derivedEdgeLabelDimensions: DerivedEdgeLabelDimensions = {
  estCharacterWidth: 9,
  estLabelLineHeight: 30,
  preferredVertDistanceFromOrigin: 50,
  strictlyKeepLabelOutOfBox: false
}


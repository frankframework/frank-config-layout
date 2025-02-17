import { ConcreteGraphBase, GraphConnectionsDecorator } from "../model/graph"
import { NodeSequenceEditorBuilder, calculateLayerNumbersFirstOccuringPath } from "../model/horizontalGrouping"
import { Layout, Dimensions, PlacedNode } from "./edge-layout"
import { NodeLayoutBuilder } from "./node-layout"

describe('Layout', () => {
  it('Test with intermediate nodes', () => {
    const b = new ConcreteGraphBase()
    b.addNode('Start', 'Text of Start', '')
    b.addNode('N1', 'Text of N1', '')
    b.addNode('N2', 'Text of N2', '')
    b.addNode('End', 'Text of End', '')
    b.connect(b.getNodeById('Start')!, b.getNodeById('N1')!)
    b.connect(b.getNodeById('Start')!, b.getNodeById('N2')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('End')!)
    b.connect(b.getNodeById('N2')!, b.getNodeById('End')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('N2')!)
    const g = new GraphConnectionsDecorator(b)
    const m = calculateLayerNumbersFirstOccuringPath(g)
    const builder = new NodeSequenceEditorBuilder(m, g)
    const model = builder.build()
    const nodeLayout = new NodeLayoutBuilder(model.getShownNodesLayoutBase(), model.getGraph(), dimensions).run()
    const layout = new Layout(nodeLayout, dimensions)
    expect(layout.getNodes().map(n => n.getId())).toEqual(['Start', 'N1', 'intermediate1', 'N2', 'intermediate2', 'End'])
    // Start --> N2 needs intermediate1, N1 --> End needs intermediate2
    expect(layout.getNodes().map(n => (n as PlacedNode).layerNumber)).toEqual([0, 1, 1, 2, 2, 3])
    // Layer 2 centered around median 105, size is 180.
    expect(layout.getNodes().map(n => (n as PlacedNode).centerX)).toEqual([105, 60, 150, 75, 165, 120])
    expect(layout.getNodes().map(n => (n as PlacedNode).centerY)).toEqual([25, 145, 145, 265, 265, 385])
    expect(layout.getNodes().map(n => (n as PlacedNode).left)).toEqual([50, 5, 150, 20, 165, 65])
    expect(layout.getNodes().map(n => (n as PlacedNode).top)).toEqual([5, 125, 145, 245, 265, 365])
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
    const b = new ConcreteGraphBase()
    b.addNode('Start', 'Text of Start', '')
    b.addNode('N1', 'Text of N1', '')
    b.addNode('N2', 'Text of N2', '')
    b.addNode('End', 'Text of End', '')
    b.connect(b.getNodeById('Start')!, b.getNodeById('N1')!)
    b.connect(b.getNodeById('Start')!, b.getNodeById('N2')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('End')!)
    b.connect(b.getNodeById('N2')!, b.getNodeById('End')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('N2')!)
    const g = new GraphConnectionsDecorator(b)
    const m = calculateLayerNumbersFirstOccuringPath(g)
    const builder = new NodeSequenceEditorBuilder(m, g)
    const model = builder.build()
    const nodeLayout = new NodeLayoutBuilder(model.getShownNodesLayoutBase(), model.getGraph(), dimensions).run()
    const layout = new Layout(nodeLayout, dimensionsIntermediateLayersVertical)
    expect(layout.getNodes().map(n => n.getId())).toEqual(['Start', 'N1', 'intermediate1', 'N2', 'intermediate2', 'End'])
    // Start --> N2 needs intermediate1, N1 --> End needs intermediate2
    expect(layout.getNodes().map(n => (n as PlacedNode).layerNumber)).toEqual([0, 1, 1, 2, 2, 3])
    // Layer 2 centered around median 105, size is 180.
    expect(layout.getNodes().map(n => (n as PlacedNode).centerX)).toEqual([105, 60, 150, 75, 165, 120])
    expect(layout.getNodes().map(n => (n as PlacedNode).centerY)).toEqual([25, 145, 145, 265, 265, 385])
    expect(layout.getNodes().map(n => (n as PlacedNode).left)).toEqual([50, 5, 150, 20, 165, 65])
    expect(layout.getNodes().map(n => (n as PlacedNode).top)).toEqual([5, 125, 125, 245, 245, 365])
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

const dimensions: Dimensions = {
  layerHeight: 50,
  layerDistance: 120,
  nodeBoxHeight: 40,
  intermediateWidth: 60,
  nodeWidth: 120,
  omittedPlaceholderWidth: 90,
  nodeBoxWidth: 110,
  // Do not include spreading edge connection points here.
  // It is complicated enough to understand the
  // calculation without.
  boxConnectorAreaPerc: 0,
  intermediateLayerPassedByVerticalLine: false,
  estCharacterWidth: 9,
  estLabelHeight: 30,
  preferredVertDistanceFromOrigin: 50
}

const dimensionsIntermediateLayersVertical: Dimensions = {
  layerHeight: 50,
  layerDistance: 120,
  nodeBoxHeight: 40,
  intermediateWidth: 60,
  nodeWidth: 120,
  omittedPlaceholderWidth: 90,
  nodeBoxWidth: 110,
  // Do not include spreading edge connection points here.
  // It is complicated enough to understand the
  // calculation without.
  boxConnectorAreaPerc: 0,
  intermediateLayerPassedByVerticalLine: true,
  estCharacterWidth: 9,
  estLabelHeight: 30,
  preferredVertDistanceFromOrigin: 50
}

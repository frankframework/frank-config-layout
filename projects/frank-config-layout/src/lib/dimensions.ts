import { Dimensions } from '../public_api';
import { EdgeLabelDimensions } from './graphics/edge-label-layouter';
import { NodeAndEdgeDimensions } from './graphics/layout';
import { SvgGenerationDimensions } from './graphics/svg-generator';
import { calculateAverageFontCharacterWidth, NodeTextDimensions } from './model/text';

export interface DerivedDimensions
  extends EdgeLabelDimensions, NodeAndEdgeDimensions, SvgGenerationDimensions, NodeTextDimensions {}

export function getDerivedDimensions(d: Dimensions): DerivedDimensions {
  return {
    nodeTextFontSize: d.nodeTextFontSize,
    nodeTextBorder: d.nodeTextBorder,
    horizontalNodeBorder: d.horizontalNodeBorder,
    intermediateWidth: d.intermediateWidth,
    layerHeight: d.layerHeight,
    layerDistance: d.layerDistance,
    nodeBoxHeight: d.nodeBoxHeight,
    boxConnectorAreaPerc: d.boxConnectorAreaPerc,
    intermediateLayerPassedByVerticalLine: d.intermediateLayerPassedByVerticalLine,
    boxCrossProtectionMargin: d.boxCrossProtectionMargin,
    lineTransgressionPerc: d.lineTransgressionPerc,
    estEdgeLabelCharacterWidth: calculateAverageFontCharacterWidth(d.edgeLabelFontSize),
    edgeLabelFontSize: d.edgeLabelFontSize,
    // In theory, we need a margin between multiple lines of an edge label.
    // In practice, we get an acceptable result by adjusting the line heigt
    // to produce it.
    estEdgeLabelLineHeight: d.edgeLabelFontSize + 3,
    preferredVertDistanceFromOrigin: d.preferredVertDistanceFromOrigin,
    strictlyKeepLabelOutOfBox: d.strictlyKeepLabelOutOfBox,
  };
}

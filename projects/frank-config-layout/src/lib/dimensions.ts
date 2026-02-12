import { Dimensions } from '../public_api';
import { calculateAverageFontCharacterWidth } from './model/text';

export interface DerivedDimensions {
  nodeTextFontSize: number; // 16
  nodeTextBorder: number;
  horizontalNodeBorder: number;
  intermediateWidth: number;
  layerHeight: number;
  layerDistance: number;
  nodeBoxHeight: number;
  boxConnectorAreaPerc: number;
  intermediateLayerPassedByVerticalLine: boolean;
  boxCrossProtectionMargin: number;
  lineTransgressionPerc: number;
  edgeLabelFontSize: number;
  // TODO: Applies to edge labels;
  estCharacterWidth: number;
  estLabelLineHeight: number;
  preferredVertDistanceFromOrigin: number;
  strictlyKeepLabelOutOfBox: boolean;
}

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
    estCharacterWidth: calculateAverageFontCharacterWidth(d.edgeLabelFontSize),
    edgeLabelFontSize: d.edgeLabelFontSize,
    // In theory, we need a margin between multiple lines of an edge label.
    // In practice, we get an acceptable result by adjusting the line heigt
    // to produce it.
    estLabelLineHeight: d.edgeLabelFontSize + 3,
    preferredVertDistanceFromOrigin: d.preferredVertDistanceFromOrigin,
    strictlyKeepLabelOutOfBox: d.strictlyKeepLabelOutOfBox,
  };
}

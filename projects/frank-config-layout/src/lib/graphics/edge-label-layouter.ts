/*
   Copyright 2025 WeAreFrank!

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { NumbersAroundZero } from '../util/util';
import { Box } from './box';
import { Interval } from '../util/interval';
import { Line, Point } from './graphics';
import { calculateAverageFontCharacterWidth } from '../model/text';

export interface EdgeLabelDimensions {
  edgeLabelFontSize: number;
  preferredVertDistanceFromOrigin: number;
  strictlyKeepLabelOutOfBox: boolean;
}

export interface DerivedEdgeLabelDimensions {
  estCharacterWidth: number;
  estLabelLineHeight: number;
  preferredVertDistanceFromOrigin: number;
  strictlyKeepLabelOutOfBox: boolean;
}

export function getDerivedEdgeLabelDimensions(d: EdgeLabelDimensions): DerivedEdgeLabelDimensions {
  return {
    estCharacterWidth: calculateAverageFontCharacterWidth(d.edgeLabelFontSize),
    // TODO issue https://github.com/frankframework/frank-config-layout/issues/51.
    // When a label has multiple lines then we need a marging between the lines,
    // not an increased line height. The text is rendered with a martin in svg-generator.ts.
    estLabelLineHeight: d.edgeLabelFontSize + 3,
    preferredVertDistanceFromOrigin: d.preferredVertDistanceFromOrigin,
    strictlyKeepLabelOutOfBox: d.strictlyKeepLabelOutOfBox,
  };
}

export class EdgeLabelLayouter {
  private boxes: Box[] = [];

  constructor(readonly derivedDimensions: DerivedEdgeLabelDimensions) {}

  add(line: Line, numCharactersOnLine: number, numTextLines: number): Box {
    const vdistSources = new NumbersAroundZero();
    while (true) {
      const vdistSource: number = vdistSources.next();
      const vdist: number =
        this.derivedDimensions.preferredVertDistanceFromOrigin +
        vdistSource * this.derivedDimensions.estLabelLineHeight;
      if (vdist <= 0) {
        // The vertical center of the label would be in the box from which the line originates.
        // Next vdistSource.
        continue;
      }
      const candidateCenter: Point = this.pointAt(vdist, line);
      const horizontalBox = Interval.createFromCenterSize(
        candidateCenter.x,
        numCharactersOnLine * this.derivedDimensions.estCharacterWidth,
      );
      const verticalBox = Interval.createFromCenterSize(
        candidateCenter.y,
        numTextLines * this.derivedDimensions.estLabelLineHeight,
      );
      const candidateBox = new Box(horizontalBox, verticalBox);
      if (this.derivedDimensions.strictlyKeepLabelOutOfBox && candidateBox.verticalBox.contains(line.startPoint.y)) {
        // The label would intersect with the box from which the line originates.
        // Next vdistSource.
        continue;
      }
      // The label is accepted as not to interfere with the box, now check it does not intersect other labels.
      let isSpaceOccupied: boolean = false;
      for (const existingBox of this.boxes) {
        if (this.boxesIntersect(candidateBox, existingBox)) {
          isSpaceOccupied = true;
          break;
        }
      }
      if (isSpaceOccupied) {
        // the label would intersect other labels.
        // Next vdistSource.
        continue;
      }
      this.boxes.push(candidateBox);
      return candidateBox;
    }
  }

  private pointAt(vdist: number, line: Line): Point {
    const y: number = line.endPoint.y > line.startPoint.y ? line.startPoint.y + vdist : line.startPoint.y - vdist;
    return line.integerPointAtY(y);
  }

  private boxesIntersect(first: Box, second: Box): boolean {
    const x_intersection: Interval | null = first.horizontalBox.toIntersected(second.horizontalBox);
    const y_intersection: Interval | null = first.verticalBox.toIntersected(second.verticalBox);
    return x_intersection !== null && y_intersection !== null;
  }
}

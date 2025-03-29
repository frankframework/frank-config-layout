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

import { LayoutModel, LayoutPosition } from '../model/layout-model';
import { Interval } from '../util/interval';
import { Line, Point } from './graphics';

export class Box {
  constructor(
    readonly horizontalBox: Interval,
    readonly verticalBox: Interval,
  ) {}

  get leftBound(): Line {
    const startPoint = new Point(this.horizontalBox.minValue, this.verticalBox.minValue);
    const endPoint = new Point(this.horizontalBox.minValue, this.verticalBox.maxValue);
    return new Line(startPoint, endPoint);
  }

  get rightBound(): Line {
    const startPoint = new Point(this.horizontalBox.maxValue, this.verticalBox.minValue);
    const endPoint = new Point(this.horizontalBox.maxValue, this.verticalBox.maxValue);
    return new Line(startPoint, endPoint);
  }
}

export class LineChecker {
  private nodeBoxFunction: (id: string) => Box;
  private nodeWidthFunction: (id: string) => Interval;
  private notIntermediateFunction: (id: string) => boolean;

  constructor({
    // Dimensions of the shown box
    nodeBoxFunction,
    // The horizontal space of the node
    nodeWidthFunction,
    notIntermediateFunction,
  }: {
    nodeBoxFunction: (id: string) => Box;
    nodeWidthFunction: (id: string) => Interval;
    notIntermediateFunction: (id: string) => boolean;
  }) {
    this.nodeBoxFunction = nodeBoxFunction;
    this.nodeWidthFunction = nodeWidthFunction;
    this.notIntermediateFunction = notIntermediateFunction;
  }

  private getY(id: string): number {
    return this.nodeBoxFunction(id).verticalBox.center;
  }

  lineIsInBoundsForId(id: string, line: Line): boolean {
    const lineMinY = Math.min(line.startPoint.y, line.endPoint.y);
    const lineMaxY = Math.max(line.startPoint.y, line.endPoint.y);
    const y = this.getY(id);
    // TODO: Is this check valid?
    if (!Interval.createFromMinMax(lineMinY, lineMaxY).contains(y)) {
      throw new Error('Layer mismatch when checking whether a line passes through the bounds of an intermediate node');
    }
    const x = line.integerPointAtY(y).x;
    return this.nodeWidthFunction(id).contains(x);
  }

  obstaclesOfPassingId(id: string, model: LayoutModel): Line[] {
    const po: LayoutPosition = model.getPositionOfId(id)!;
    const layerPositionObjects: LayoutPosition[] = model.getPositionsOfLayer(po.layer);
    let leftObstacle: Line | undefined = undefined;
    for (let leftPosition = po.position - 1; leftPosition >= 0; --leftPosition) {
      const leftId: string = layerPositionObjects[leftPosition].id;
      if (this.notIntermediateFunction(leftId)) {
        leftObstacle = this.nodeBoxFunction(leftId).rightBound;
        break;
      }
    }
    let rightObstacle: Line | undefined = undefined;
    for (let rightPosition = po.position + 1; rightPosition < layerPositionObjects.length; ++rightPosition) {
      const rightId: string = layerPositionObjects[rightPosition].id;
      if (this.notIntermediateFunction(rightId)) {
        rightObstacle = this.nodeBoxFunction(rightId).leftBound;
        break;
      }
    }
    return [leftObstacle, rightObstacle].filter((obs) => obs !== undefined);
  }
}

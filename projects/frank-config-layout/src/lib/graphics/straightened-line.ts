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

import { getConnectedIdsOfKey } from '../model/graph';
import { Interval, splitArray } from '../util/interval';
import { Line, Point } from './graphics';

export class StraightenedLine {
  static create(idStart: string, idEnd: string, line: Line): StraightenedLine {
    return new StraightenedLine(idStart, idEnd, line, []);
  }

  constructor(
    readonly idStart: string,
    readonly idEnd: string,
    readonly line: Line,
    readonly replacedNodes: string[],
  ) {}

  isLayerPassage(): boolean {
    return this.idStart === this.idEnd;
  }

  isJoinableWith(other: StraightenedLine): boolean {
    return this.idEnd === other.idStart;
  }

  toJoinedWith(other: StraightenedLine): StraightenedLine {
    if (!this.isJoinableWith(other)) {
      throw new Error(`Cannot join line segments because ${this.idEnd} !== ${other.idStart}`);
    }
    const replacedNodes: string[] = [...this.replacedNodes, this.idEnd, ...other.replacedNodes];
    const line = new Line(this.line.startPoint, other.line.endPoint);
    return new StraightenedLine(this.idStart, other.idEnd, line, replacedNodes);
  }

  toReplaceMeAsLayerPassage(pred: StraightenedLine, succ: StraightenedLine): StraightenedLine[] {
    if (!this.isLayerPassage) {
      throw new Error('Cannot apply toReplaceMeAsLayerPassage() because I am not a layer passage');
    }
    if (!pred.isJoinableWith(this) || !this.isJoinableWith(succ)) {
      throw new Error('Cannot apply toReplaceMeAsLayerPassage() because line segments are not joinable');
    }
    const minY = Math.min(this.line.startPoint.y, this.line.endPoint.y);
    const maxY = Math.max(this.line.startPoint.y, this.line.endPoint.y);
    const joinPoint = new Point(this.line.startPoint.x, Interval.createFromMinMax(minY, maxY).center);
    const first = new StraightenedLine(pred.idStart, this.idStart, new Line(pred.line.startPoint, joinPoint), [
      ...pred.replacedNodes,
    ]);
    const second = new StraightenedLine(this.idStart, succ.idEnd, new Line(joinPoint, succ.line.endPoint), [
      ...succ.replacedNodes,
    ]);
    return [first, second];
  }
}

export class StraightenedLineSegmentsBuilder {
  constructor(
    readonly notIntermediateFunction: (id: string) => boolean,
    readonly lineFactory: (edgeKey: string) => Line,
    readonly layerPassageFactory: ((id: string) => Line) | undefined,
  ) {}

  run(edgeKeys: string[]): StraightenedLine[][] {
    const connectedShownEdgeGroups = splitArray(
      edgeKeys,
      (curr, next) => getConnectedIdsOfKey(curr)[1] == getConnectedIdsOfKey(next)[0],
    );
    const result: StraightenedLine[][] = [];
    for (const edgeGroup of connectedShownEdgeGroups) {
      result.push(this.handleEdgeGroup(edgeGroup));
    }
    return result;
  }

  handleEdgeGroup(edgeKeys: string[]): StraightenedLine[] {
    const result: StraightenedLine[] = [];
    for (const edgeKey of edgeKeys) {
      const connectedIds: string[] = getConnectedIdsOfKey(edgeKey);
      let isFirst = true;
      if (this.layerPassageFactory !== undefined && !this.notIntermediateFunction(connectedIds[0]) && !isFirst) {
        const line: Line = this.layerPassageFactory(connectedIds[0]);
        result.push(StraightenedLine.create(connectedIds[0], connectedIds[0], line));
      }
      isFirst = false;
      result.push(StraightenedLine.create(connectedIds[0], connectedIds[1], this.lineFactory(edgeKey)));
    }
    return result;
  }
}

import { Line } from './graphics';
import { Interval } from '../util/interval';

export interface LayoutLineSegment {
  readonly key: string;
  readonly originId: string;
  readonly line: Line;
  readonly text: Text;
  readonly errorStatus: number;
  readonly isFirstLineSegment: boolean;
  readonly isLastLineSegment: boolean;
  readonly minLayerNumber: number;
  readonly maxLayerNumber: number;
  readonly passDirection: number;
}

export interface EdgeLabel {
  horizontalBox: Interval;
  verticalBox: Interval;
  text: string;
}

export interface Layout {
  readonly width: number;
  readonly height: number;
  readonly nodes: PlacedNode[];
  readonly layoutLineSegments: LayoutLineSegment[];
  readonly edgeLabels: EdgeLabel[];
}
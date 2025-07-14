import { Mermaid2svgService } from './mermaid2svg';
import { Dimensions, SvgResult } from '../public_api';

const dimeisions: Dimensions = {
  layerHeight: 50,
  layerDistance: 120,
  nodeBoxHeight: 50,
  intermediateWidth: 60,
  nodeWidth: 175,
  nodeBoxWidth: 160,
  boxConnectorAreaPerc: 50,
  intermediateLayerPassedByVerticalLine: false,
  edgeLabelFontSize: 10,
  preferredVertDistanceFromOrigin: 30,
  strictlyKeepLabelOutOfBox: false,
  lineTransgressionPerc: 100,
  boxCrossProtectionMargin: 0,
};

const input = `Start("My start"):::normal
N1("Node 1"):::normal
N2("Node 2"):::normal
N3("Node 3"):::errorOutline
End("End node"):::normal
Start --> |success| N1
Start --> |success| N2
Start --> |success| N3
N1 --> |failure| End
N2 --> |success| End
N1 --> |success| N2
N3 --> |success| End`;

// In the GUI, enter the above Mermaid text. Then look at the bottom
// under the heading "Static SVG". If that image looks good, copy
// the text next to the static SVG here.
//
// VS Code trick: VS Code may add too many or too few leading spaces
// to each line. Fix this by finding the right indent of the line
// "const expected = ``" before inserting the text inside the ``.
//
const expectedSvg = `<svg class="svg" xmlns="http://www.w3.org/2000/svg"
  width="439" height="480" >
  <defs>
    <style>
      .rectangle {
        fill: transparent;
        stroke: #8bc34a;
        stroke-width: 4;
      }

      .rectangle.errorOutline {
        stroke: #ec4758;
      }

      .line {
        stroke: #8bc34a;
        stroke-width: 3;
      }

      .line.error {
        stroke: #ec4758;
      }

      .line.mixed {
        stroke: #FFDE59;
      }

      .rect-text {
        font-family: "Inter", "trebuchet ms", serif;
      }

      .rect-text > tspan[data-html-node="a"] {
        font-size: 28px;
      }

      .rect-text > tspan[data-html-node="b"] {
        font-weight: bold;
      }

      .label-text {
        font-family: "Inter", "trebuchet ms", serif;
      }
    </style>
    <!-- A marker to be used as an arrowhead -->
    <marker
      id="arrow"
      viewBox="0 0 4 4"
      refX="4"
      refY="2"
      markerWidth="4"
      markerHeight="4"
      orient="auto-start-reverse">
      <path d="M 0 0 L 4 2 L 0 4 z" />
    </marker>
  </defs>
  <g class="frank-flowchart-node-Start" transform="translate(96, 0)">
    <rect class="rectangle"
      width="160"
      height="50"
      rx="5">
    </rect>
    <text class="rect-text"><tspan data-html-node=#text x="44.55" y="29" textLength="70.91" lengthAdjust="spacingAndGlyphs">My start</tspan></text>
  </g>
  <g class="frank-flowchart-node-N1" transform="translate(96, 120)">
    <rect class="rectangle"
      width="160"
      height="50"
      rx="5">
    </rect>
    <text class="rect-text"><tspan data-html-node=#text x="53.41" y="29" textLength="53.18" lengthAdjust="spacingAndGlyphs">Node 1</tspan></text>
  </g>
  <g class="frank-flowchart-node-N3" transform="translate(271, 120)">
    <rect class="rectangle errorOutline"
      width="160"
      height="50"
      rx="5">
    </rect>
    <text class="rect-text"><tspan data-html-node=#text x="53.41" y="29" textLength="53.18" lengthAdjust="spacingAndGlyphs">Node 3</tspan></text>
  </g>
  <g class="frank-flowchart-node-N2" transform="translate(7, 240)">
    <rect class="rectangle"
      width="160"
      height="50"
      rx="5">
    </rect>
    <text class="rect-text"><tspan data-html-node=#text x="53.41" y="29" textLength="53.18" lengthAdjust="spacingAndGlyphs">Node 2</tspan></text>
  </g>
  <g class="frank-flowchart-node-End" transform="translate(125, 360)">
    <rect class="rectangle"
      width="160"
      height="50"
      rx="5">
    </rect>
    <text class="rect-text"><tspan data-html-node=#text x="44.55" y="29" textLength="70.91" lengthAdjust="spacingAndGlyphs">End node</tspan></text>
  </g>
  <g class="frank-flowchart-edge-Start-N1">
    <polyline class="line" points="176,49 176,120" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-Start-intermediate1">
    <polyline class="line" points="136,49 59,145" />
  </g>
  <g class="frank-flowchart-edge-intermediate1-N2">
    <polyline class="line" points="59,145 47,240" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-Start-N3">
    <polyline class="line" points="215,49 351,120" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N1-intermediate2">
    <polyline class="line error" points="215,169 205,265" />
  </g>
  <g class="frank-flowchart-edge-intermediate2-End">
    <polyline class="line error" points="205,265 205,360" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N2-End">
    <polyline class="line" points="87,289 165,360" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N1-N2">
    <polyline class="line" points="136,169 126,240" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N3-intermediate3">
    <polyline class="line error" points="351,169 351,265" />
  </g>
  <g class="frank-flowchart-edge-intermediate3-End">
    <polyline class="line error" points="351,265 244,360" marker-end="url(#arrow)"/>
  </g>
  <g text-anchor="middle" dominant-baseline="middle">
    <g transform="translate(88, 73)">
      <text class="label-text" x="24.5" y="6.5" font-size="10">success</text>
    </g>
    <g transform="translate(152, 73)">
      <text class="label-text" x="24.5" y="6.5" font-size="10">success</text>
    </g>
    <g transform="translate(248, 73)">
      <text class="label-text" x="24.5" y="6.5" font-size="10">success</text>
    </g>
    <g transform="translate(108, 193)">
      <text class="label-text" x="24.5" y="6.5" font-size="10">success</text>
    </g>
    <g transform="translate(188, 193)">
      <text class="label-text" x="24.5" y="6.5" font-size="10">failure</text>
    </g>
    <g transform="translate(327, 193)">
      <text class="label-text" x="24.5" y="6.5" font-size="10">success</text>
    </g>
    <g transform="translate(96, 313)">
      <text class="label-text" x="24.5" y="6.5" font-size="10">success</text>
    </g>
  </g>
</svg>`;

describe('Mermaid2svg - please maintain this test using the GUI', () => {
  let service: Mermaid2svgService;

  beforeEach(() => {
    // No need to test injection - if injection does not work then the app does not show
    service = new Mermaid2svgService(dimeisions);
  });

  it('Test the plain SVG', (done) => {
    service.mermaid2svg(input).then((svg) => {
      expect(svg.split('\n')).toEqual(expectedSvg!.split('\n'));
      done();
    });
  });

  it('Test with statistics', (done) => {
    service.mermaid2svgStatistics(input).then((statistics) => {
      expect(statistics.svg).toEqual(expectedSvg);
      expect(statistics.numNodes).toEqual(5);
      expect(statistics.numEdges).toEqual(7);
      expect(statistics.numNodeVisitsDuringLayerCalculation).toEqual(8);
      done();
    });
  });

  it('Test that real calculation is done only once', (done) => {
    const first: Promise<SvgResult> = service.mermaid2svgStatistics(input);
    const second: Promise<string> = service.mermaid2svg(input);
    Promise.all([first, second]).then(() => {
      expect(service.numSvgCalculations).toEqual(1);
      expect(service.getHashes()).toHaveSize(1);
      expect(service.getHashes()[0]).toHaveSize(64);
      expect(service.getHashes()[0].length).toEqual(64);
      done();
    });
  });
});

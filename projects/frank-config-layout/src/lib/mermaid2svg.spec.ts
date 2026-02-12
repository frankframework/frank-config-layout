import { Mermaid2svgService } from './mermaid2svg';
import { getFactoryDimensions, SvgResult } from '../public_api';

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
  width="286" height="480" >
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

      .rect-text > text[data-html-node="b"] {
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
  <g class="frank-flowchart-node-Start" transform="translate(78, 3)">
    <rect class="rectangle"
      width="95"
      height="54"
      rx="5">
    </rect>
  </g>
  <g class="rect-text" text-anchor="middle" dominant-baseline="middle"><text data-html-node=#text x="125" y="30">My start</text></g>
  <g class="frank-flowchart-node-N1" transform="translate(87, 123)">
    <rect class="rectangle"
      width="77"
      height="54"
      rx="5">
    </rect>
  </g>
  <g class="rect-text" text-anchor="middle" dominant-baseline="middle"><text data-html-node=#text x="125" y="150">Node 1</text></g>
  <g class="frank-flowchart-node-N3" transform="translate(194, 123)">
    <rect class="rectangle errorOutline"
      width="77"
      height="54"
      rx="5">
    </rect>
  </g>
  <g class="rect-text" text-anchor="middle" dominant-baseline="middle"><text data-html-node=#text x="232" y="150">Node 3</text></g>
  <g class="frank-flowchart-node-N2" transform="translate(15, 243)">
    <rect class="rectangle"
      width="77"
      height="54"
      rx="5">
    </rect>
  </g>
  <g class="rect-text" text-anchor="middle" dominant-baseline="middle"><text data-html-node=#text x="53" y="270">Node 2</text></g>
  <g class="frank-flowchart-node-End" transform="translate(90, 363)">
    <rect class="rectangle"
      width="95"
      height="54"
      rx="5">
    </rect>
  </g>
  <g class="rect-text" text-anchor="middle" dominant-baseline="middle"><text data-html-node=#text x="137" y="390">End node</text></g>
  <g class="frank-flowchart-edge-Start-N1">
    <polyline class="line" points="125,56 125,123" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-Start-intermediate1">
    <polyline class="line" points="101,56 42,150" />
  </g>
  <g class="frank-flowchart-edge-intermediate1-N2">
    <polyline class="line" points="42,150 34,243" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-Start-N3">
    <polyline class="line" points="148,56 232,123" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N1-intermediate2">
    <polyline class="line error" points="144,176 140,270" />
  </g>
  <g class="frank-flowchart-edge-intermediate2-End">
    <polyline class="line error" points="140,270 137,363" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N2-End">
    <polyline class="line" points="53,296 113,363" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N1-N2">
    <polyline class="line" points="106,176 72,243" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N3-intermediate3">
    <polyline class="line error" points="232,176 196,270" />
  </g>
  <g class="frank-flowchart-edge-intermediate3-End">
    <polyline class="line error" points="196,270 160,363" marker-end="url(#arrow)"/>
  </g>
  <g text-anchor="middle" dominant-baseline="middle"><text class="label-text" x="82" y="86" font-size="10">success</text><text class="label-text" x="125" y="86" font-size="10">success</text><text class="label-text" x="186" y="86" font-size="10">success</text><text class="label-text" x="91" y="206" font-size="10">success</text><text class="label-text" x="143" y="206" font-size="10">failure</text><text class="label-text" x="221" y="206" font-size="10">success</text><text class="label-text" x="80" y="326" font-size="10">success</text></g></svg>`;

describe('Mermaid2svg - please maintain this test using the GUI', () => {
  let service: Mermaid2svgService;

  beforeEach(() => {
    // No need to test injection - if injection does not work then the app does not show
    service = new Mermaid2svgService(getFactoryDimensions());
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

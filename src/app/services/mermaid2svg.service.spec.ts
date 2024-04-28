import { Mermaid2svgService } from './mermaid2svg.service';
import { OurMermaid2SvgDimensions } from '../app.module'

describe('Mermaid2svgService', () => {
  let service: Mermaid2svgService;

  beforeEach(() => {
    // No need to test injection - if injection does not work then the app does not show
    service = new Mermaid2svgService(new OurMermaid2SvgDimensions())
  });

  it('Please maintain this test using the GUI', () => {
    const input = `Start("My start"):::normal
N1("Node 1"):::normal
N2("Node 2"):::normal
End("End node"):::normal
Start --> |success| N1
Start --> |success| N2
N1 --> |error| End
N2 --> |success| End
N1 --> |success| N2`

    // In the GUI, enter the above Mermaid text. Then look at the bottom
    // under the heading "Static SVG". If that image looks good, copy
    // the text next to the static SVG here.
    //
    // VS Code trick: VS Code may add too many or too few trailing spaces
    // to each line. Fix this by finding the right indent of the line
    // "const expected = ``" before inserting the text inside the ``.
    const expected = `<svg class="svg" xmlns="http://www.w3.org/2000/svg"
  width="195" height="480" >
  <defs>
    <style>
      .rectangle {
        fill: transparent;
        stroke: black;
        stroke-width: 3;
      }
    
      .line {
        stroke: black;
        stroke-width: 3;
      }

      .line.error {
        stroke: red
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
  <g class="frank-flowchart-node-Start">
    <rect class="rectangle"
      x="50"
      y="5"
      width="110"
      height="40"
      rx="5">
    </rect>
    <text
      x="105"
      y="25"
      text-anchor="middle" dominant-baseline="middle" class="nodeText">
        My start
    </text>
  </g>
  <g class="frank-flowchart-node-N1">
    <rect class="rectangle"
      x="5"
      y="125"
      width="110"
      height="40"
      rx="5">
    </rect>
    <text
      x="60"
      y="145"
      text-anchor="middle" dominant-baseline="middle" class="nodeText">
        Node 1
    </text>
  </g>
  <g class="frank-flowchart-node-N2">
    <rect class="rectangle"
      x="20"
      y="245"
      width="110"
      height="40"
      rx="5">
    </rect>
    <text
      x="75"
      y="265"
      text-anchor="middle" dominant-baseline="middle" class="nodeText">
        Node 2
    </text>
  </g>
  <g class="frank-flowchart-node-End">
    <rect class="rectangle"
      x="65"
      y="365"
      width="110"
      height="40"
      rx="5">
    </rect>
    <text
      x="120"
      y="385"
      text-anchor="middle" dominant-baseline="middle" class="nodeText">
        End node
    </text>
  </g>
  <g class="frank-flowchart-edge-Start-N1">
    <polyline class="line" points="89,44 60,125" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-Start-intermediate1">
    <polyline class="line" points="121,44 150,145" />
  </g>
  <g class="frank-flowchart-edge-intermediate1-N2">
    <polyline class="line" points="150,145 91,245" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N1-intermediate2">
    <polyline class="line error" points="76,164 165,265" />
  </g>
  <g class="frank-flowchart-edge-intermediate2-End">
    <polyline class="line error" points="165,265 136,365" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N2-End">
    <polyline class="line" points="75,284 104,365" marker-end="url(#arrow)"/>
  </g>
  <g class="frank-flowchart-edge-N1-N2">
    <polyline class="line" points="44,164 59,245" marker-end="url(#arrow)"/>
  </g>
</svg>`
    expect(service.mermaid2svg(input).split('\n')).toEqual(expected!.split('\n'))
  })
});

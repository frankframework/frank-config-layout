export interface Drawing {
  width: number
  height: number
  rectangles: Rectangle[]
  lines: Line[]
}

export interface Rectangle {
  id: string
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
  text: string
  selected: boolean
}

export interface Line {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  selected: boolean
  arrow: boolean
  isError: boolean
}

export function getEmptyDrawing(): Drawing {
  return  {
    width: 0,
    height: 0,
    rectangles: [],
    lines: []
  }
}

export class SvgGenerator {
  private constructor(
    private rectEventHandler: (r: Rectangle) => string,
    private lineEventHandler: (l: Line) => string
  ) {}

  static createStatic() {
    return new SvgGenerator(
      r => '',
      l => ''
    )
  }

  static createDynamic(rectEventHandler: (r: Rectangle) => string, lineEventHandler: (l: Line) => string) {
    return new SvgGenerator(rectEventHandler, lineEventHandler)
  }

  generateSvg(d: Drawing) {
    return this.openSvg(d.width, d.height)
      + this.renderDefs()
      + this.renderNodes(d.rectangles)
      + this.renderEdges(d.lines)
      + this.closeSvg()
  }

  private openSvg(width: number, height: number) {
    return `<svg class="svg" xmlns="http://www.w3.org/2000/svg"
  appSvgZoomPan (newScale)="newScale($event)" preserveAspectRatio="none"
  width="${width}" height="${height}" >`
  }

  private renderDefs() {
    return `  <defs>
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

      .line-hover-padding {
        stroke: #eee;
        stroke-opacity: 0;
        stroke-width: 13;
      
        &.selected {
          stroke: #bbf;
          stroke-opacity: 0.3;
        }
      }
      
      .rect-hover-padding {
        fill: #eee;
        opacity: 0;
        stroke: none;
      
        &.selected {
          fill: #bbf;
          opacity: 0.3;
        }
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
`
  }

  private renderNodes(rectangles: readonly Rectangle[]): string {
    return rectangles.map(r => this.renderNode(r)).join('')
  }

  private renderNode(rectangle: Rectangle): string {
    return `    <g ${this.rectEventHandler(rectangle)}>
    <rect class="rectangle"
      x="${rectangle.x}"
      y="${rectangle.y}"
      width="${rectangle.width}"
      height="${rectangle.height}"
      id="${rectangle.id}"
      rx="5">
    </rect>
    <text
      x="${rectangle.centerX}"
      y="${rectangle.centerY}"
      text-anchor="middle" dominant-baseline="middle" class="nodeText">
      ${rectangle.text}
    </text>
    <rect
      ${this.classOfHoverRectangle(rectangle)}
      x="${rectangle.x - 5}"
      y="${rectangle.y - 5}"
      width="${rectangle.width + 10}"
      height="${rectangle.height + 10}"
      rx="10">
    </rect>
  </g>
`
  }

  private classOfHoverRectangle(rectangle: Rectangle): string {
    if (rectangle.selected) {
      return 'class="rect-hover-padding selected"'
    } else {
      return 'class="rect-hover-padding"'
    }
  }

  private renderEdges(lines: Line[]): string {
    return lines.map(line => this.renderEdge(line)).join('')
  }

  private renderEdge(line: Line): string {
    return `    <g ${this.lineEventHandler(line)}>
    <polyline ${this.classOfLine(line)}
      points="${line.x1},${line.y1} ${line.x2},${line.y2}"
      ${this.getMarkerEnd(line)}
      id="${line.id}"/>
    <polyline ${this.classOfHoverLine(line)}
      points="${line.x1},${line.y1} ${line.x2},${line.y2}"/>
  </g>
`
  }

  private getMarkerEnd(line: Line): string {
    if (line.arrow) {
      return 'marker-end="url(#arrow)"'
    } else {
      return ''
    }
  }

  private classOfLine(line: Line): string {
    if (line.isError) {
      return 'class="line error"'
    } else {
      return 'class="line"'
    }
  }

  private classOfHoverLine(line: Line) {
    if (line.selected) {
      return 'class="line-hover-padding selected"'
    } else {
      return 'class="line-hover-padding"'
    }
  }

  private closeSvg(): string {
    return '</svg>'
  }
}
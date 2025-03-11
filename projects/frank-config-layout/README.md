# @frankframework/frank-config-layout

This project renders Frank configurations as flowchart diagrams, to be shown in the Frank!Console. See https://github.com/frankframework/frankframework for more information about the Frank!Framework Frank configurations and the Frank!Console. The input is a JavaScript string that holds the nodes and the edges in Mermaid syntax. The output is a Scalable Vector Graphics (SVG) string.

Here is an example input:

    Start("My start"):::normal
    N1("Node 1"):::normal
    N2("Node 2"):::normal
    End("End node"):::normal
    Start --> |success| N1
    Start --> |success| N2
    N1 --> |failure| End
    N2 --> |success| End

This example Mermaid text introduces nodes `Start`, `N1`, `N2` and `End`. Each of these nodes has an id (start of a line), a text (between `("` and `")`) and a style (after the `:::`). After the nodes, edges are introduced from `Start` to `N1`, from `Start` to `N2`, from `N1` to `End` and from `N2` to `End`. Each edge has an optional label; in this example labels `success` and `failure` appear.

Node texts and edge labels are allowed to include HTML formatting. If such a HTML text spans multiple line, it is assumed that the line breaks are defined as `<br/>`. For edge labels, it is assumed that the `<br/>` are the only HTML markup. If this requirement is not satisfied, the algorithm in this library cannot properly place the edge labels in the drawing.

The Mermaid text that is the input of this library is produced by the Frank!Framework. Therefore allowing HTML markup is not a security risk.

### Usage

In `package.json`, include `@frankframework/frank-config-layout` and specify the version you want to use. Before SVGs are rendered, execute the function `initMermaid2Svg()`. It takes as its argument an object that implements an interface `Dimentions`. In this object, you can specify some dimensions like the size of nodes in the drawing. You can use default dimensions by calling `initMermaid2Svg(getFactoryDimensions())`.

To calculate an SVG from a Mermaid, you have two options. If you only want the SVG, call `mermaid2svg()`. It returns a `Promise<string>`. It is safe to calculate the same SVG multiple times. The calculation will be done only once and the resulting SVG will be cached. The second option is calling `mermaid2svgStatistics()`. It produces a `Promise<SvgResult>`. `SvgResult` is an interface that is defined as follows:

    export interface SvgResult {
      svg: string;
      numNodes: number;
      numEdges: number;
      numNodeVisitsDuringLayerCalculation: number;
    }

Function `mermaid2svgStatistics()` thus also calculates the SVG but it adds a few statistics. It uses the same cache of SVGs as function `mermaid2svg()`.

Both functions can throw an error because the algorithm fails to produce the drawing. This happens when there are elements in Frank configurations that are unreachable. In other words, if there is dead code.

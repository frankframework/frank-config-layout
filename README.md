# Frank config layout playground

This GitHub project contains two angular projects. The first is [Frank config layout](./projects/frank-config-layout/README.md), which is in folder [projects/frank-config-layout](./projects/frank-config-layout). That is a library that generates pictures of Frank configurations. The second angular project is "Frank config layout playground". It provides a graphical user interface that supports the development of "Frank config layout". This REAdME file will explain the features of "Frank config layout playground".

This GitHub project has a single [angular.json](./angular.json) that manages both Angular projects. Building and testing "Frank config layout" is done using the scripts in the top-level [package.json](./package.json). This README explain how to test, build and publish "Frank config layout" (configuration management).

This GitHub project was set up using https://github.com/frankframework/angular-library-template.

# Features of Frank config layout playground

Please keep in mind that "Frank config layout" takes Mermaid text as input and that it generates SVG (Scalable Vector Graphics) text. Also remember that the generated picture depends on configurable dimensions. The figure below gives an overview of the playground:

![playground](./pictures/playground.jpg)

To the top-left (number 1), you see a text field to enter Mermaid input. To get started, you can use the examples from [simpleMermaid.txt](./src/assets/simpleMermaid.txt) or [mermaid.txt](./src/assets/mermaid.txt). To get a drawing for the entered Mermaid text, press "Load with longest path algorithm". The button "Load with first occuring path algorithm" exists for historical reasons and is not so important. To the top-right (number 2) you can experiment with the dimensions applied. You can edit dimensions after loading Mermaid.

When Mermaid is loaded, the nodes are assigned to horizontal layers that are stacked vertically. The nodes in the first layer are on top; the nodes on the second layer are below that, et cetera. It does not automatically optimize the sequence of the nodes within each layer. Press "Best sequence" to the top of the sequence editor to get the best sequence as is done for the static SVG.

The sequence editor (number 3) has been introduced to experiment with the sequence of the nodes within each layer. The resulting drawing is shown next to it (number 4).
The sequence editor supports two methods to experiment with the sequence of the nodes. In tab "Manual", you can drag and drop rows to move nodes to different (horizontal) positions within their layer. You can also remove nodes here to see how the picture would look without them. In tab "Algorithm steps", you can align the nodes while fixing the sequence within a chosen layer. Each button shows how the number of crossing lines will be changed. These are the same steps that are performed automatically to get the static SVG. The static SVG calculation aligns on the layer for which aligning results in the biggest reduction of the number of crossing lines. It does so repeatedly until no reduction is possible anymore.

The static SVG is shown to the bottom. Area number 5 to the bottom-left is the picture that would also be generated in the Frank!Framework. Next to this (number 6) you see the text of the SVG so you can copy-paste it. This is very useful for creating unit tests.

# Configuration management

Building, testing and publishing is done completely using the scripts of the top-level [package.json](./package.json). They speak for themselves if you have some experience with developing Angular applications. To get started, you can do the following:

* `npm ci` to install dependencies.
* `npm run build` to build "Frank config layout".
* `npm run test` to run the unit tests of "Frank config layout playground".
* `npm run testLib` to run the unit tests of "Frank config layout".

If you have build "Frank config layout", you can publish it on https://www.npmjs.com/ as follows. Go to folder `dist/frank-config-layout`. Do `npm publish -otp <code from your telephone>` there. The code from your telephone is needed because of two-factor authentication and comes from the Google authenticator.

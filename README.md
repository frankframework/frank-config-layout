# frank-config-layout

Layout algorithm for Frank configs / flows. WeAreFrank! wishes to use a custom layout algorithm that should look better than images produced by Mermaid. This project assumes that the Frank!Framework can convert Frank configurations or adapters (XML code) to Mermaid commands. See [Mermaid example](src/assets/mermaid.txt) for the syntax of Mermaid files. This project reads Mermaid text and displays it using a custom algorithm.

The algorithm has not been finished yet. In its current state, the produced drawing does not look like intended. There is a user interface that allows humans to improve the layout. This way, the developers can investigate how to improve the algorithm. A future release of this project should eliminate the need for human intervention.

# Development environment and usage

To use this project, please do the following:
* Clone this project with `git clone`.
* Install package manager yarn. Presently we use version 1.22.21.
* Execute `yarn install --immutable`.
* Run the Karma tests with `yarn ng test`.
* Run the project with `yarn ng serve`.
* Open a webbrowser and go to `http://localhost:4200/`.
* In the top-left corner enter some Mermaid text. Here is a [simple example](src/assets/simpleMermaid.txt).
* Press "Load with longest path algorithm". See figure below.
* Try the controls to change the drawing.

![Load Mermaid](./readme-pictures/loadMermaid.jpg)

# Publishing

This project is published on npmjs. We publish a service that can produce a static SVG from Mermaid commands. Do the following to publish the next version on npmjs:

* Ensure that the checkout directory does not contain folder `dist`.
* Ensure that all development work has been committed.
* Run `yarn install --immutable`.
* Ensure that your development work has been tested.
* If you fixed things, commit your work.
* Run `yarn packagr`. This should produce folder `dist` within the checkout directory.
* Change directory to `dist`. Then do `yarn pack`.
* Publish using `yarn publish`.
* Run `git tag vX.Y.Z` with X.Y.Z the version you just published
* Run `git push vX.Y.Z`.
* Update the version number in `package.json` for the next release cycle. Commit and push that.

# Checking licenses of dependencies

Do `yarn run license-checker`.


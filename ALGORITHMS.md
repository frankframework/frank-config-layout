ALGORITHMS
==========

This document explains the algorithms applied by Frank config layout.

# Counting line crosses

An important measure for the quality of a layout is the number of edge crosses. For two arbitrary lines, the x-coordinates and the y-coordinates of the four endpoints are needed to calculate whether they cross or not. This section explains how this is done. It also describes a simpler heuristic to calculate whether two lines cross and more generally, how many edges of a flowchart cross.

### Exact determination whether two lines cross

Consider a picture with two line segments. When this picture is rotated or stretched, the line segments cross in the transformed picture if and only if they do in the original picture. We use this by rotating in such a way that one of the line segments becomes horizontal. To find the matrix to use, assume that one segment points from $(x_{start}, y_{start})$ to $(x_{start} + a, y_{start} + b)$. The direction of the segment is represented by the following vector:

$\bigg(\begin{matrix}a\\b\end{matrix}\bigg)$

The rotation we need is the matrix shown below:

$\bigg(\begin{matrix}a & b\\-b & a\end{matrix}\bigg) \bigg(\begin{matrix}a\\b\end{matrix}\bigg) = \bigg(\begin{matrix}a^2 + b^2\\0\end{matrix}\bigg)$

The shown matrix multiplication demonstrates that the line segment defined above is transformed to a horizontal segment. See https://en.wikipedia.org/wiki/Rotation_matrix to understand that this matrix is indeed a combination of rotating and scaling.

The problem has been simplified to checking whether some line segment crosses a horizontal line segment, see figure below:

![does-not-cross-horizontal-line](./pictures/does-not-cross-horizontal-line.jpg)

Restrict the skew line to the part that projects on the horizontal line segment (shown bold). When for the restriction the y-coordinate of the startpoint is negative and the y-coordinate of the endpoint is positive, then the lines cross. Or vice versa, when the y-coordinate of the start point is positive and the y-coordinate of the endpoint is negative.

### Why x, y coordinates are not so important

The layout algorithm orders the nodes of the flowchart in horizontal layers. That algorithms also breaks up edges between nodes that are not in adjacent layers. For example, if an original edge connects a node in layer 0 to a node in layer 2, an intermediate node is introduced in layer 1 and the edge is replaced by two edges that connect the two original nodes via the intermediate node.

We assume here that the nodes of the flowchart all have the same height. Because of the algorithm, every edge runs betwee adjacent layers. Next, the direction of the edge is not important - the direction determines where the arrow head is drawn which is irrelevant for analyzing crossings. Based on our assumption about the uniform layer height and on this analysis, it follows that only the sequence of the nodes in each layer is relevant for counting crossings. The figure below illustrates this for two arbitrary edges that connect nodes in the same two layers:

![when-lines-cross-smaller](./pictures/when-lines-cross-smaller.jpg)

Consider two edges running from different nodes **top_1** and **top_2** in the top layer. These edges run to or from nodes **bottom_1** and **bottom_2** in the bottom layer. If **top_1** is to the left of **top_2**, then the edges cross if and only if **bottom_1** is to the right of **bottom_2**.

Another way to say this is: if **bottom_1** is to the left of **bottom_2**, then the lines cross if and only if **top_1** is to the right of **top_2**. When we count crossings of the edges between adjacent layers, it is not important which layer is the uppermost.

### Counting crossings with adjacent layers

We consider two adjacent layers, say A and B. In each of them, the nodes are sorted from left to right. The leftmost node of A has index 0, the node next to it has index 1, etc. The leftmost node of B also has index 0, the node next to it 1, etc.

Now we have two loops within each other. The outer loop visits the nodes of layer A from left to right. The inner loop visits the nodes of layer B from left to right, but only considers a node in B if it is connected to the current node in layer A. These two loops visit all the edges running between the nodes of A and the nodes of B.

For every node of B with some index **i**, we maintain a variable **n(i)**, the number of new line crossings that we will have in case there is any next edge to node **i** of layer B. When we visit an edge, we consider one more edge that can be crossed by future edges. We have to increment some of the **n(i)** by one, but which of them?

When the future edge connects the current node of layer A, then its other end in B is to the right of the current node in B. The future edge will not intersect the current edge so it is irrelevant for the increments of the **n(i)**. It follows that only future edges connecting future nodes of A are relevant.

A relevant future edge only crosses the current edge if its index **futureIndex** on layer B is smaller than **currentIndex**, the index of the current edge on layer B. We thus increment all **n(j)**, **j** < **currentIndex** when we visit an edge.

The **n(i)** we maintain while visiting the edges allows us to calculate the number of crossings **c**. When we visit an edge, the number of earlier edges it crosses equals **n(currentIndex)**. We increment **c** with **n(currentIndex)** and then update the **n(i)** as explained earlier. After visiting all edges, we have the total number of crossings in our variable **c**.

### Evaluating node swaps

When developing a layout, the layout may be improved by swapping two adjacent layers within an horizontal layer. Many of such swaps have to be considered, so a fast algorithm is useful.

We consider the change of the number of crossings when two adjacent nodes in layer A are swapped. We consider two arbitrary lines. If none of them visits one of the swapped nodes in A, then their crossing status is unchanged. If the first visits a swapped node in A and the second does not, then the second's node on layer A is either before or after all swapped nodes. The crossing status is not changed. So only lines starting from a swapped node have to be counted. The above algorithm should be applied only with the two swapped nodes in layer A. When this is done before and after swapping, the difference is the change of the total number of crossings.

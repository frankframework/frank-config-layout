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


describe('Layout', () => {
  it('When nodes are omitted in the LayoutBase, they are omitted from the SVG', () => {

  })
})
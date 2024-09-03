import { Node, Edge, getEdgeKey, GraphBase, ConcreteGraphBase, ConcreteNode, ConcreteEdge } from './graph'

const NODE_ERROR_CLASS = 'errorOutline'

const ERROR_FORWARD_NAMES = [
  'exception',
  'failure',
  'fail',
  'timeout',
  'illegalResult',
  'presumedTimeout',
  'interrupt',
  'parserError',
  'outputParserError',
  'outputFailure'];

export class CategorizedNode implements Node {
  constructor(private delegate: Node, readonly isError: boolean) {}

  getId(): string {
    return this.delegate.getId()
  }

  getText(): string {
    return this.delegate.getText()
  }
}

export class CategorizedEdge implements Edge {
  constructor(private from: CategorizedNode, private to: CategorizedNode, readonly isError: boolean) {}

  getFrom(): Node {
    return this.from
  }

  getTo(): Node {
    return this.to
  }

  getKey(): string {
    return getEdgeKey(this.getFrom(), this.getTo())
  }
}

export function categorize(b: GraphBase): GraphBase {
  const result = new ConcreteGraphBase()
  b.getNodes().forEach(n => {
    const c = categorizeNode(n as ConcreteNode)
    result.addExistingNode(c)
  })
  b.getEdges().forEach(e => {
    const from: CategorizedNode = result.getNodeById(e.getFrom().getId())! as CategorizedNode
    const to: CategorizedNode = result.getNodeById(e.getTo().getId())! as CategorizedNode
    const text = (e as ConcreteEdge).text
    result.addEdge(categorizeEdge(from, to, text))
  })
  return result
}

function categorizeNode(n: ConcreteNode): CategorizedNode {
  if (n.style === NODE_ERROR_CLASS) {
    return new CategorizedNode(n, true)
  } else {
    return new CategorizedNode(n, false)
  }
}

function categorizeEdge(from: CategorizedNode, to: CategorizedNode, edgeText: string | undefined): CategorizedEdge {
  if (from.isError) {
    return new CategorizedEdge(from, to, true)
  }
  if (! edgeText) {
    return new CategorizedEdge(from, to, false)
  } else {
    console.log(`Checking whether "${edgeText}" is error forward name`)
    return new CategorizedEdge(from, to, ERROR_FORWARD_NAMES.includes(edgeText))
  }
}

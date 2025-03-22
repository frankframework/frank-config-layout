import { Connection, Graph } from './graph';
import { WithLayerNumber } from './horizontal-grouping';
import { LayoutBase } from './layout-base';
import { LayoutModel, LayoutPosition, DIRECTION_IN, DIRECTION_OUT, LayoutConnector } from './layout-model';

type TestGraph = Graph<WithLayerNumber, Connection<WithLayerNumber>>;

describe('LayoutModel', () => {
  it('Positions are correctly established', () => {
    const instance: LayoutModel = getInstance();
    expect(instance.numLayers).toEqual(2);
    const positionsOfLayer0 = instance.getPositionsOfLayer(0);
    expect(positionsOfLayer0.map((o) => o.layer)).toEqual([0, 0, 0]);
    expect(positionsOfLayer0.map((o) => o.position)).toEqual([0, 1, 2]);
    expect(positionsOfLayer0.map((o) => o.id)).toEqual(['S1', 'S2', 'S3']);
    const positionsOfLayer1 = instance.getPositionsOfLayer(1);
    expect(positionsOfLayer1.map((o) => o.layer)).toEqual([1, 1]);
    expect(positionsOfLayer1.map((o) => o.position)).toEqual([0, 1]);
    expect(positionsOfLayer1.map((o) => o.id)).toEqual(['E1', 'E2']);
  });

  it('When edges exist in both directions and relate different position indices, LayoutModel establishes the right related nodes', () => {
    const instance = getInstanceRelateDifferentPositionIndexes();
    const from_0_to_1: LayoutPosition[][] = ['S1', 'S2', 'S3']
      .map((id) => instance.getPositionOfId(id))
      .filter((p) => p !== undefined)
      .map((p) => instance.getRelatedPositions(p, 1));
    // Related positions of S1
    expect(from_0_to_1[0].map((rp) => rp.position)).toEqual([0, 1]);
    expect(from_0_to_1[0].map((rp) => rp.id)).toEqual(['E1', 'E2']);
    const from_1_to_0: LayoutPosition[][] = ['E1', 'E2']
      .map((id) => instance.getPositionOfId(id))
      .filter((p) => p !== undefined)
      .map((p) => instance.getRelatedPositions(p, 0));
    // Related positions of E2
    expect(from_1_to_0[1].map((rp) => rp.position)).toEqual([0]);
    expect(from_1_to_0[1].map((rp) => rp.id)).toEqual(['S1']);
    // Related positions of E1
    expect(from_1_to_0[0].map((rp) => rp.position)).toEqual([0]);
    expect(from_1_to_0[0].map((rp) => rp.id)).toEqual(['S1']);
  });

  it('When a node has incoming and outgoing edges, connectors are created for them which are sorted by other side position', () => {
    const instance = getInstanceRelateDifferentPositionIndexes();
    const position: LayoutPosition = instance.getPositionOfId('S1')!;
    const connectors: LayoutConnector[] = instance.getConnectorsOfPosition(position, 1);
    expect(connectors.map((c) => c.referencePosition.id)).toEqual(['S1', 'S1']);
    expect(connectors.map((c) => c.referencePosition.layer)).toEqual([0, 0]);
    expect(connectors.map((c) => c.referencePosition.position)).toEqual([0, 0]);
    expect(connectors.map((c) => c.connectorSeq)).toEqual([0, 1]);
    expect(connectors.map((c) => c.relatedId)).toEqual(['E1', 'E2']);
    expect(connectors.map((c) => c.direction)).toEqual([DIRECTION_IN, DIRECTION_OUT]);
  });

  it('When two nodes are connected in two directions, the downard edge is left and the edges don-t cross', () => {
    const instance: LayoutModel = getInstance();
    const edgeKeyDown = 'S1-E1';
    const edgeKeyUp = 'E1-S1';
    const connectionDown = instance.getConnection(edgeKeyDown);
    const connectionUp = instance.getConnection(edgeKeyUp);
    expect(connectionDown.from.referencePosition.id).toEqual('S1');
    expect(connectionDown.from.referencePosition.position).toEqual(0);
    expect(connectionDown.from.referencePosition.layer).toEqual(0);
    expect(connectionDown.from.connectorSeq).toEqual(0);
    expect(connectionDown.from.direction).toEqual(DIRECTION_OUT);
    expect(connectionDown.to.referencePosition.id).toEqual('E1');
    expect(connectionDown.to.referencePosition.position).toEqual(0);
    expect(connectionDown.to.referencePosition.layer).toEqual(1);
    expect(connectionDown.to.connectorSeq).toEqual(0);
    expect(connectionDown.to.direction).toEqual(DIRECTION_IN);
    expect(connectionUp.from.referencePosition.id).toEqual('E1');
    expect(connectionUp.from.referencePosition.position).toEqual(0);
    expect(connectionUp.from.referencePosition.layer).toEqual(1);
    expect(connectionUp.from.connectorSeq).toEqual(1);
    expect(connectionUp.from.direction).toEqual(DIRECTION_OUT);
    expect(connectionUp.to.referencePosition.id).toEqual('S1');
    expect(connectionUp.to.referencePosition.position).toEqual(0);
    expect(connectionUp.to.referencePosition.layer).toEqual(0);
    expect(connectionUp.to.connectorSeq).toEqual(1);
    expect(connectionUp.to.direction).toEqual(DIRECTION_IN);
  });

  it('When a node is not connected, empty lists are created for related nodes and connectors', () => {
    const instance: LayoutModel = getInstance();
    const position: LayoutPosition = instance.getPositionOfId('S3')!;
    expect(instance.getRelatedPositions(position, 1)).toEqual([]);
    expect(instance.getConnectorsOfPosition(position, 1)).toEqual([]);
  });

  it('Can lookup positions and connectors by their key, allowing calling code to reference them with Map keys', () => {
    const instance: LayoutModel = getInstance();
    const nodeId = 'S1';
    const edgeKey = 'S1-E1';
    const position: LayoutPosition = instance.getPositionOfId(nodeId)!;
    const positionLookup = instance.getPosition(position.key);
    expect(positionLookup).toBe(position);
    const connection = instance.getConnection(edgeKey);
    const connector = connection.from;
    const connectorLookup = instance.getConnector(connector.key);
    expect(connectorLookup).toBe(connector);
  });
});

function getInstance(): LayoutModel {
  const g: TestGraph = new Graph<WithLayerNumber, Connection<WithLayerNumber>>();
  g.addNode(newNode('S1', 0));
  g.addNode(newNode('S2', 0));
  g.addNode(newNode('S3', 0));
  g.addNode(newNode('E1', 1));
  g.addNode(newNode('E2', 1));
  g.addEdge(newEdge(g.getNodeById('S1'), g.getNodeById('E1')));
  g.addEdge(newEdge(g.getNodeById('E1'), g.getNodeById('S1')));
  g.addEdge(newEdge(g.getNodeById('S2'), g.getNodeById('E2')));
  const lb = LayoutBase.create(['S1', 'S2', 'S3', 'E1', 'E2'], g, 2);
  return LayoutModel.create(lb, g);
}

function getInstanceRelateDifferentPositionIndexes(): LayoutModel {
  const g: TestGraph = new Graph<WithLayerNumber, Connection<WithLayerNumber>>();
  g.addNode(newNode('S1', 0));
  g.addNode(newNode('S2', 0));
  g.addNode(newNode('S3', 0));
  g.addNode(newNode('E1', 1));
  g.addNode(newNode('E2', 1));
  g.addEdge(newEdge(g.getNodeById('S1'), g.getNodeById('E2')));
  g.addEdge(newEdge(g.getNodeById('E1'), g.getNodeById('S1')));
  const lb = LayoutBase.create(['S1', 'S2', 'S3', 'E1', 'E2'], g, 2);
  return LayoutModel.create(lb, g);
}

function newNode(id: string, layer: number): WithLayerNumber {
  return { id, layer };
}

function newEdge(from: WithLayerNumber, to: WithLayerNumber): Connection<WithLayerNumber> {
  return { from, to };
}

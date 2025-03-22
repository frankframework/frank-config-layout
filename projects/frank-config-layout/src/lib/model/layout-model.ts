/*
   Copyright 2025 WeAreFrank!

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { Graph, Connection } from './graph';
import { WithLayerNumber } from './horizontal-grouping';
import { LayoutBase } from './layout-base';

export class LayoutPosition {
  constructor(
    readonly layer: number,
    readonly position: number,
    readonly id: string,
  ) {}

  get key(): string {
    return `${this.layer}-${this.position}`;
  }
}

export const DIRECTION_IN = 0;
export const DIRECTION_OUT = 1;

export class LayoutConnector {
  constructor(
    readonly referencePosition: LayoutPosition,
    readonly connectorSeq: number,
    readonly direction: number,
    readonly relatedId: string,
  ) {}

  get key(): string {
    // There can be at most two edges betweeen two nodes, one for each possible direction.
    return `${this.referencePosition.id}-${this.direction}-${this.relatedId}`;
  }
}

export interface LayoutConnection {
  from: LayoutConnector;
  to: LayoutConnector;
}

class LayoutModelBuilder<T extends WithLayerNumber, C extends Connection<T>> {
  private positionsByKey = new Map<string, LayoutPosition>();
  private connectorsByKey = new Map<string, LayoutConnector>();
  private positionsOfLayer: LayoutPosition[][] = [];
  private positionOfId = new Map<string, LayoutPosition>();
  private relatedPositions = new Map<string, Map<number, LayoutPosition[]>>();
  private connectorsOfPosition = new Map<string, Map<number, LayoutConnector[]>>();
  private connectionsByEdgeKey = new Map<string, LayoutConnection>();

  constructor(
    readonly lb: LayoutBase,
    readonly g: Graph<T, C>,
  ) {
    for (let layer = 0; layer < lb.numLayers; ++layer) {
      this.positionsOfLayer.push([]);
    }
  }

  run(): LayoutModel {
    this.establishPositions();
    this.relatePositions();
    this.buildConnectors();
    this.buildConnectionsFromEdges();
    return new LayoutModel(
      this.lb.numLayers,
      this.positionsByKey,
      this.connectorsByKey,
      this.positionsOfLayer,
      this.positionOfId,
      this.relatedPositions,
      this.connectorsOfPosition,
      this.connectionsByEdgeKey,
    );
  }

  private establishPositions(): void {
    for (let layerNumber = 0; layerNumber < this.lb.numLayers; ++layerNumber) {
      for (const [position, id] of this.lb.getIdsOfLayer(layerNumber).entries()) {
        const positionObject: LayoutPosition = new LayoutPosition(layerNumber, position, id);
        this.positionsByKey.set(positionObject.key, positionObject);
        this.positionsOfLayer[layerNumber].push(positionObject);
        this.positionOfId.set(id, positionObject);
      }
    }
  }

  private relatePositions(): void {
    this.forEachPositionAndAdjacentLayerCombi((referencePositionObject, otherLayerNumber) => {
      const positionsInOther: number[] = this.lb.getConnections(referencePositionObject.id, otherLayerNumber);
      for (const positionInOther of positionsInOther) {
        const relatedPositionObjectKey = `${otherLayerNumber}-${positionInOther}`;
        const relatedPositionObject: LayoutPosition | undefined = this.positionsByKey.get(relatedPositionObjectKey);
        if (relatedPositionObject === undefined) {
          throw new Error(
            `Expected that a position object exists for key=${relatedPositionObjectKey}, on behalf of rerence ${referencePositionObject.id}`,
          );
        }
        if (!this.relatedPositions.has(referencePositionObject.key)) {
          this.relatedPositions.set(referencePositionObject.key, new Map<number, LayoutPosition[]>());
        }
        const relatedPositionsOfReference: Map<number, LayoutPosition[]> = this.relatedPositions.get(
          referencePositionObject.key,
        )!;
        if (!relatedPositionsOfReference.has(otherLayerNumber)) {
          relatedPositionsOfReference.set(otherLayerNumber, []);
        }
        relatedPositionsOfReference.get(otherLayerNumber)!.push(relatedPositionObject);
      }
    });
  }

  private forEachPositionAndAdjacentLayerCombi(
    action: (referencePositionObject: LayoutPosition, otherLayerNumber: number) => void,
  ): void {
    for (let layerNumber = 0; layerNumber < this.lb.numLayers; ++layerNumber) {
      const otherLayerNumbers: number[] = [layerNumber - 1, layerNumber + 1].filter(
        (otherLayerNumber) => otherLayerNumber >= 0 && otherLayerNumber < this.lb.numLayers,
      );
      for (const positionObject of this.positionsOfLayer[layerNumber]) {
        for (const otherLayerNumber of otherLayerNumbers) {
          action(positionObject, otherLayerNumber);
        }
      }
    }
  }

  private buildConnectors(): void {
    this.forEachPositionAndAdjacentLayerCombi((referencePositionObject, otherLayerNumber) => {
      let seq = 0;
      for (const relatedPositionObject of this.getRelatedPositionObjects(referencePositionObject, otherLayerNumber)) {
        const idRef = referencePositionObject.id;
        const idRel = relatedPositionObject.id;
        const edgesInOut: C[] = [this.g.searchEdge(idRel, idRef), this.g.searchEdge(idRef, idRel)].filter(
          (edge) => edge !== undefined,
        );
        let edges: C[];
        if (referencePositionObject.layer > relatedPositionObject.layer) {
          // We are building connectors for the bottom node
          edges = [...edgesInOut];
        } else {
          // We are building connectors for the top node
          edges = [...edgesInOut];
          edges.reverse();
        }
        for (const edge of edges) {
          const direction = edge.to.id === referencePositionObject.id ? DIRECTION_IN : DIRECTION_OUT;
          const connector = new LayoutConnector(referencePositionObject, seq++, direction, relatedPositionObject.id);
          this.connectorsByKey.set(connector.key, connector);
          if (!this.connectorsOfPosition.has(referencePositionObject.key)) {
            this.connectorsOfPosition.set(referencePositionObject.key, new Map<number, LayoutConnector[]>());
          }
          const connectorsOfReference = this.connectorsOfPosition.get(referencePositionObject.key)!;
          if (!connectorsOfReference.has(otherLayerNumber)) {
            connectorsOfReference.set(otherLayerNumber, []);
          }
          connectorsOfReference.get(otherLayerNumber)!.push(connector);
        }
      }
    });
  }

  private getRelatedPositionObjects(referencePositionObject: LayoutPosition, otherLayer: number): LayoutPosition[] {
    const raw: LayoutPosition[] | undefined = this.relatedPositions.get(referencePositionObject.key)?.get(otherLayer);
    return raw === undefined ? [] : raw;
  }

  private buildConnectionsFromEdges(): void {
    this.forEachPositionAndAdjacentLayerCombi((referencePositionObject, otherLayerNumber: number): void => {
      for (const connector of this.getConnectors(referencePositionObject, otherLayerNumber)) {
        const reversedConnector: LayoutConnector = this.reversedConnector(connector);
        let edgeKey: string;
        // This will add the edge two times, one time for each connector.
        // But on both occasions the same will happen.
        if (connector.direction === DIRECTION_IN) {
          edgeKey = `${connector.relatedId}-${connector.referencePosition.id}`;
          this.connectionsByEdgeKey.set(edgeKey, { from: reversedConnector, to: connector });
        } else {
          edgeKey = `${connector.referencePosition.id}-${connector.relatedId}`;
          this.connectionsByEdgeKey.set(edgeKey, { from: connector, to: reversedConnector });
        }
      }
    });
  }

  private getConnectors(referencePositionObject: LayoutPosition, otherLayer: number): LayoutConnector[] {
    const raw: LayoutConnector[] | undefined = this.connectorsOfPosition
      .get(referencePositionObject.key)
      ?.get(otherLayer);
    return raw === undefined ? [] : raw;
  }

  private reversedConnector(connector: LayoutConnector): LayoutConnector {
    const reversedDirection = connector.direction === DIRECTION_IN ? DIRECTION_OUT : DIRECTION_IN;
    const reversedConnectorKey = `${connector.relatedId}-${reversedDirection}-${connector.referencePosition.id}`;
    const reverseConnector: LayoutConnector | undefined = this.connectorsByKey.get(reversedConnectorKey);
    if (reverseConnector === undefined) {
      throw new Error(
        `Expected that there exists a reverse connector for connector (layer=${connector.referencePosition.layer}, position=${connector.referencePosition.position}, id=${connector.referencePosition.id}, connectorSeq=${connector.connectorSeq}, direction=${connector.direction}, relatedId=${connector.relatedId})`,
      );
    }
    return reverseConnector;
  }
}

export class LayoutModel {
  static create<T extends WithLayerNumber, C extends Connection<T>>(lb: LayoutBase, g: Graph<T, C>): LayoutModel {
    return new LayoutModelBuilder(lb, g).run();
  }

  constructor(
    readonly numLayers: number,
    private positionsByKey: Map<string, LayoutPosition>,
    private connectorsByKey: Map<string, LayoutConnector>,
    private positionsOfLayers: LayoutPosition[][],
    private positionOfId: Map<string, LayoutPosition>,
    private relatedPositions: Map<string, Map<number, LayoutPosition[]>>,
    private connectorsOfPosition: Map<string, Map<number, LayoutConnector[]>>,
    private connectionsByEdgeKey: Map<string, LayoutConnection>,
  ) {}

  getPosition(positionKey: string): LayoutPosition {
    if (this.positionsByKey.has(positionKey)) {
      return this.positionsByKey.get(positionKey)!;
    } else {
      throw new Error(`No position available for key ${positionKey}`);
    }
  }

  getConnector(connectorKey: string): LayoutConnector {
    if (this.connectorsByKey.has(connectorKey)) {
      return this.connectorsByKey.get(connectorKey)!;
    } else {
      throw new Error(`No connector available for key ${connectorKey}`);
    }
  }

  getPositionsOfLayer(layer: number): LayoutPosition[] {
    if (layer < 0 || layer >= this.numLayers) {
      throw new Error(`Layer number out of bounds: ${layer}`);
    }
    return [...this.positionsOfLayers[layer]];
  }

  getPositionOfId(id: string): LayoutPosition | undefined {
    return this.positionOfId.get(id);
  }

  getRelatedPositions(referencePosition: LayoutPosition, toLayer: number): LayoutPosition[] {
    const raw: LayoutPosition[] | undefined = this.relatedPositions.get(referencePosition.key)?.get(toLayer);
    return raw === undefined ? [] : [...raw];
  }

  getConnectorsOfPosition(referencePosition: LayoutPosition, toLayer: number): LayoutConnector[] {
    const raw: LayoutConnector[] | undefined = this.connectorsOfPosition.get(referencePosition.key)?.get(toLayer);
    return raw === undefined ? [] : [...raw];
  }

  getConnection(edgeKey: string): LayoutConnection {
    const raw: LayoutConnection | undefined = this.connectionsByEdgeKey.get(edgeKey);
    if (raw === undefined) {
      throw new Error(`No connection known for edge key ${edgeKey}`);
    } else {
      return raw;
    }
  }
}

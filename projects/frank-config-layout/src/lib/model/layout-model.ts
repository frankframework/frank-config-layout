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

import { Graph, WithId, Connection } from './graph';
import { LayoutBase } from './layout-base';

interface WithLayerNumber extends WithId {
  layerNumber: number;
}

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

const DIRECTION_IN = 0;
const DIRECTION_OUT = 1;

export class LayoutConnector {
  constructor(
    readonly referencePosition: LayoutPosition,
    readonly connectorSeq: number,
    readonly direction: number,
    readonly relatedId: string,
  ) {}

  get key(): string {
    return `${this.referencePosition.layer}-${this.referencePosition.position}-${this.connectorSeq}`;
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
    this.apply((referencePositionObject, otherLayerNumber) => {
      const otherIds = this.lb.getConnections(referencePositionObject.id, otherLayerNumber).entries();
      for (const positionInOther in otherIds) {
        const relatedPositionObjectKey = `${otherLayerNumber}-${positionInOther}`;
        const relatedPositionObject = this.positionsByKey.get(relatedPositionObjectKey)!;
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

  private apply(action: (referencePositionObject: LayoutPosition, otherLayerNumber: number) => void): void {
    for (let layerNumber = 0; layerNumber < this.lb.numLayers; ++layerNumber) {
      const otherLayerNumbers: number[] = layerNumber === 0 ? [1] : [layerNumber - 1, layerNumber + 1];
      for (const positionObject of this.positionsOfLayer[layerNumber]) {
        for (const otherLayerNumber of otherLayerNumbers) {
          action(positionObject, otherLayerNumber);
        }
      }
    }
  }

  private buildConnectors(): void {
    this.apply((referencePositionObject, otherLayerNumber) => {
      let seq = 0;
      for (const relatedPositionObject of this.relatedPositions
        .get(referencePositionObject.key)!
        .get(otherLayerNumber)!) {
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

  private buildConnectionsFromEdges(): void {
    this.apply((referencePositionObject, otherLayerNumber: number): void => {
      for (const connector of this.connectorsOfPosition.get(referencePositionObject.key)!.get(otherLayerNumber)!) {
        const reversedConnector: LayoutConnector = this.reversedConnector(connector);
        let edgeKey: string;
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

  private reversedConnector(connector: LayoutConnector): LayoutConnector {
    const relatedPosition = this.positionOfId.get(connector.relatedId)!;
    const reversedDirection = connector.direction === DIRECTION_IN ? DIRECTION_OUT : DIRECTION_IN;
    for (const reverseConnector of this.connectorsOfPosition
      .get(relatedPosition.key)!
      .get(connector.referencePosition.layer)!) {
      if (
        reverseConnector.relatedId === connector.referencePosition.id &&
        reverseConnector.direction === reversedDirection
      ) {
        return reverseConnector;
      }
    }
    throw new Error(
      `Expected that there exists a reverse connector for connector (layer=${connector.referencePosition.layer}, position=${connector.referencePosition.position}, id=${connector.referencePosition.id}, connectorSeq=${connector.connectorSeq}, direction=${connector.direction}, relatedId=${connector.relatedId})`,
    );
  }
}

export class LayoutModel {
  static create<T extends WithLayerNumber, C extends Connection<T>>(lb: LayoutBase, g: Graph<T, C>): LayoutModel {
    return new LayoutModelBuilder(lb, g).run();
  }

  constructor(
    private positionsByKey: Map<string, LayoutPosition>,
    private connectorsByKey: Map<string, LayoutConnector>,
    private positionsOfLayers: LayoutPosition[][],
    private positionOfId: Map<string, LayoutPosition>,
    private relatedPositions: Map<string, Map<number, LayoutPosition[]>>,
    private connectorsOfPosition: Map<string, Map<number, LayoutConnector[]>>,
    private connectionsByEdgeKey: Map<string, LayoutConnection>,
  ) {}

  getPosition(positionKey: string): LayoutPosition {
    return this.positionsByKey.get(positionKey)!;
  }

  getConnector(connectorKey: string): LayoutConnector {
    return this.connectorsByKey.get(connectorKey)!;
  }

  getPositionsOfLayer(layer: number): LayoutPosition[] {
    return [...this.positionsOfLayers[layer]];
  }

  getPositionOfId(id: string): LayoutPosition {
    return this.positionOfId.get(id)!;
  }

  getRelatedPositions(referencePosition: LayoutPosition, toLayer: number): LayoutPosition[] {
    const relatedPositionsByLayer: Map<number, LayoutPosition[]> = this.relatedPositions.get(referencePosition.key)!;
    return relatedPositionsByLayer.has(toLayer) ? [...relatedPositionsByLayer.get(toLayer)!] : [];
  }

  getConnectorsOfPosition(referencePosition: LayoutPosition, toLayer: number): LayoutConnector[] {
    const connectorsByLayer: Map<number, LayoutConnector[]> = this.connectorsOfPosition.get(referencePosition.key)!;
    return connectorsByLayer.has(toLayer) ? [...connectorsByLayer.get(toLayer)!] : [];
  }

  getConnection(edgeKey: string): LayoutConnection {
    return this.connectionsByEdgeKey.get(edgeKey)!;
  }
}

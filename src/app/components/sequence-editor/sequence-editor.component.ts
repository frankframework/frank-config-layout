/*
   Copyright 2024-2025 WeAreFrank!

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

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { LayoutBase, getNumCrossings, alignFromLayer, calculateNumCrossingsChangesFromAligning } from '../../model/layoutBase'
import { NodeSequenceEditor, NodeSequenceEditorCell } from '../../notLibrary/nodeSequenceEditor';
import { NodeOrEdgeSelection } from '../../notLibrary/nodeOrEdgeSelection';
import { getRange } from '../../util/util';
import { NodeCaptionChoice, NodeOrEdge, getCaption } from '../../model/graph';
import { Observable, Subscription } from 'rxjs';

interface Tab {
  id: string,
  caption: string
}

const TAB_MANUAL = "MANUAL"
const TAB_ALGORITHM = "ALGORITHM"

@Component({
  selector: 'app-sequence-editor',
  templateUrl: './sequence-editor.component.html',
  styleUrl: './sequence-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SequenceEditorComponent implements OnInit, OnDestroy {
  TABS: Tab[] = [
    { id: TAB_MANUAL, caption: "Manual" },
    { id: TAB_ALGORITHM, caption: "Algorithm steps" }
  ]

  activeTab: string = TAB_MANUAL
  manualView: ManualView = this.getEmptyManualView()
  algorithmView: AlgorithmView = this.getEmptyAlgorithmView()
  showText: boolean = false
  captionChoice: NodeCaptionChoice = this.updateCaptionChoice()

  selectTab(id: string) {
    this.activeTab = id
  }

  updateCaptionChoice(): NodeCaptionChoice {
    if (this.showText) {
      return NodeCaptionChoice.TEXT
    }
    return NodeCaptionChoice.ID
  }

  onNewCaptionChoice() {
    this.showText = (! this.showText)
    this.captionChoice = this.updateCaptionChoice()
    this.updateViews()
  }

  private _model: NodeSequenceEditor | null = null

  get model(): NodeSequenceEditor | null {
    return this._model
  }

  @Input()
  set model(model: NodeSequenceEditor | null) {
    this._model = model
    // If the model has less positions, we would
    // have invalid positions if we did not clear.
    this.selection.clear()
    this.updateViews()
    this.onChanged.emit(true)
  }

  updateViews() {
    if (this.model === null) {
      this.manualView = this.getEmptyManualView()
      this.algorithmView = this.getEmptyAlgorithmView()
    } else {
      this.manualView = this.getManualView()
      this.algorithmView = this.getAlgorithmView()
    }
  }
  getEmptyManualView(): ManualView {
    return {
      header: [],
      body: []
    }
  }

  getEmptyAlgorithmView(): AlgorithmView {
    return {
      omittedNodes: "",
      numCrossings: 0,
      layers: []
    }
  }

  @Input()
  selection: NodeOrEdgeSelection = new NodeOrEdgeSelection()

  @Input() itemClickedObservable: Observable<string> | null = null
  private subscription: Subscription | null = null

  ngOnInit(): void {
    this.subscription = this.itemClickedObservable!.subscribe(value => SequenceEditorComponent.itemClicked(value, this))
  }
  
  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }

  // With a non-static method, this could not be used to observe the itemClickedObservable.
  private static itemClicked(itemClicked: string, context: SequenceEditorComponent) {
    if (context.model === null) {
      return
    }
    const item: NodeOrEdge = context.model!.parseNodeOrEdgeId(itemClicked)
    if (item.optionalEdge !== null) {
      context.selectEdgeKey(item.optionalEdge.getKey())
    }
    if (item.optionalNode !== null) {
      context.selectNodeId(item.optionalNode.getId())
    }
  }

  @Output()
  onChanged: EventEmitter<any> = new EventEmitter<any>()

  drop($event: CdkDragDrop<string>) {
    if (this.model !== null) {
      const indexFrom = $event.previousIndex
      const indexTo = $event.currentIndex
      const permutation: number[] = this.model.rotateToSwap(indexFrom, indexTo)
      this.selection.followPermutation(permutation, this.model)
      this.updateViews()
      this.onChanged.emit(true)
    }
  };

  omit(position: number) {
    if (this.model !== null) {
      this.model!.omitNodeFrom(position)
      this.updateViews()
      this.onChanged.emit(true)
    }
  }

  reintroducePulldownSelect($event: Event, position: number) {
    if (this.model !== null) {
      const target = $event.target as HTMLSelectElement
      const option: string = target.value
      this.model!.reintroduceNode(position, this.model.getNodeById(option)!)
      this.updateViews()
      this.onChanged.emit(true)
    }
  }

  selectNodeId(nodeId: string) {
    this.selection.selectNodeId(nodeId, this.model!)
    this.updateViews()
    this.onChanged.emit(true)
  }

  selectNode(index: number) {
    if (this.model === null) {
      return
    }
    this.selection.selectPosition(index, this.model)
    this.updateViews()
    this.onChanged.emit(true)
  }

  selectEdgeKey(key: string) {
    this.selection.selectEdgeKey(key, this.model!)
    this.updateViews()
    this.onChanged.emit(true)
  }

  selectCell(indexFrom: number, indexTo: number) {
    if (this.model === null) {
      return
    }
    this.selection.selectCell(indexFrom, indexTo, this.model)
    this.updateViews()
    this.onChanged.emit(true)
  }

  onAlignFromLayer(layerNumber: number) {
    if (this.model === null) {
      return
    }
    const lb: LayoutBase = this.model.getShownNodesLayoutBase()
    alignFromLayer(lb, layerNumber)
    this.model.updatePositionsOfShownNodes(lb)
    this.updateViews()
    this.onChanged.emit(true)
  }

  getManualClass(item: ManualPosition | ManualCell): string[] {
    const result = []
    if (item.selected === true) {
      result.push('selected')
    }
    result.push(this.getBackgroundClass(item))
    return result
  }

  getBackgroundClass(item: ManualPosition | ManualCell | AlgorithmLayer): string {
    if (item.backgroundClass === BackgroundClass.EVEN) {
      return 'even'
    } else if (item.backgroundClass === BackgroundClass.ODD) {
      return 'odd'
    } else {
      return 'doubleOdd'
    }
  }

  getCellClass(cell: ManualCell) {
    const result = []
    if (cell.fromPosition !== cell.toPosition) {
      result.push('edgeMark')
    }
    if (cell.hasEdge) {
      result.push('hasEdge')
    }
    return result
  }

  getManualView(): ManualView {
    return {
      header: getRange(0, this.model!.getSequence().length)
        .map(indexTo => this.getManualPosition(indexTo, this.isToPositionHighlightedInEditor(indexTo))),
      body: getRange(0, this.model!.getSequence().length)
        .map(indexFrom => {
          return {
            header: this.getManualPosition(indexFrom, this.isFromPositionHighlightedInEditor(indexFrom)),
            cells: getRange(0, this.model!.getSequence().length)
              .map(indexTo => this.getManualCell(indexFrom, indexTo))
          }
        })
    }
  }

  private isFromPositionHighlightedInEditor(index: number): boolean {
    return this.selection.isFromPositionHighlightedInEditor(index, this.model!)
  }

  private isToPositionHighlightedInEditor(index: number,): boolean {
    return this.selection.isToPositionHighlightedInEditor(index, this.model!)
  }

  private isCellHighlightedInEditor(indexFrom: number, indexTo: number) {
    return this.selection.isCellHighlightedInEditor(indexFrom, indexTo, this.model!)
  }

  private getManualPosition(index: number, selected: boolean): ManualPosition {
    const node = this.model!.getSequence()[index]
    return {
      position: index,
      nodeId: node === null ? null : getCaption(node, this.captionChoice),
      backgroundClass: this.model!.getLayerOfPosition(index) % 2 === 1 ? BackgroundClass.ODD : BackgroundClass.EVEN,
      fillOptions: node !== null ? [] : this.model!.getOrderedOmittedNodesInLayer(this.model!.getLayerOfPosition(index)).map(omitted => omitted.getId()),
      selected
    }
  }

  private getManualCell(indexFrom: number, indexTo: number): ManualCell {
    const modelCell: NodeSequenceEditorCell = this.model!.getCell(indexFrom, indexTo)
    let numOddLayers = 0
    if (modelCell.getLayerFrom() % 2 == 1) {
      ++numOddLayers
    }
    if (modelCell.getLayerTo() % 2 == 1) {
      ++numOddLayers
    }
    let bgClass: BackgroundClass = BackgroundClass.EVEN
    if (numOddLayers == 1) {
      bgClass = BackgroundClass.ODD
    } else if(numOddLayers == 2) {
      bgClass = BackgroundClass.DOUBLE_ODD
    }
    return {
      fromPosition: indexFrom,
      toPosition: indexTo,
      backgroundClass: bgClass,
      fromAndToHaveNode: (this.model!.getSequence()[indexFrom] !== null) && (this.model!.getSequence()[indexTo] !== null),
      hasEdge: modelCell.getEdgeIfConnected() !== null,
      selected: this.isCellHighlightedInEditor(indexFrom, indexTo)
    }
  }

  getAlgorithmView(): AlgorithmView {
    const lb: LayoutBase = this.model!.getShownNodesLayoutBase()
    let layers: AlgorithmLayer[] = []
    const numCrossingsChangesByAligningFrom = calculateNumCrossingsChangesFromAligning(lb)
    for (let layerIndex = 0; layerIndex < lb.numLayers; ++layerIndex) {
      layers.push({
        layerNumber: layerIndex,
        backgroundClass: layerIndex % 2 === 0 ? BackgroundClass.EVEN : BackgroundClass.ODD,
        numNodes: lb.getIdsOfLayer(layerIndex).length,
        numCrossingsChangeByAligningFrom: numCrossingsChangesByAligningFrom[layerIndex],
        numCrossingsChangeByAligningFromJudgement: this.judgementOfNumCrossingsChange(numCrossingsChangesByAligningFrom[layerIndex])
      })
    }
    const omittedNodes: string = this.model!.getOrderedOmittedNodes()
      .map(n => getCaption(n, this.captionChoice))
      .join(", ")
    return { omittedNodes, numCrossings: getNumCrossings(lb), layers }
  }

  private judgementOfNumCrossingsChange(change: number): string {
    if (change > 0) {
      return JUDGEMENT_BAD
    } else if (change < 0) {
      return JUDGEMENT_GOOD
    } else {
      return JUDGEMENT_NEUTRAL
    }
  }
}

export interface ManualView {
  header: ManualPosition[],
  body: BodyRow[]
}

interface BodyRow {
  header: ManualPosition
  cells: ManualCell[]
}

interface ManualPosition {
  position: number
  backgroundClass: BackgroundClass
  nodeId: string | null
  fillOptions: string[]
  selected: boolean
}

interface ManualCell {
  fromPosition: number,
  toPosition: number,
  backgroundClass: BackgroundClass
  fromAndToHaveNode: boolean,
  hasEdge: boolean
  selected: boolean
}

interface AlgorithmView {
  omittedNodes: string
  numCrossings: number
  layers: AlgorithmLayer[]
}

interface AlgorithmLayer {
  layerNumber: number,
  backgroundClass: string,
  numNodes: number
  numCrossingsChangeByAligningFrom: number
  numCrossingsChangeByAligningFromJudgement: string
}

export enum BackgroundClass {
  EVEN = "even",
  ODD = "odd",
  DOUBLE_ODD = "doubleOdd"
}

const JUDGEMENT_GOOD = "good"
const JUDGEMENT_BAD = "bad"
const JUDGEMENT_NEUTRAL = "neutral"
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceEditorComponent, ManualView, BackgroundClass } from './sequence-editor.component';
import { NodeSequenceEditor, ConcreteNodeSequenceEditor } from '../../model/nodeSequenceEditor';

import { ConcreteGraphBase, GraphConnectionsDecorator } from '../../model/graph';
import { Subject } from 'rxjs';

describe('SequenceEditorComponent', () => {
  let component: SequenceEditorComponent;
  let fixture: ComponentFixture<SequenceEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SequenceEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SequenceEditorComponent);
    component = fixture.componentInstance;
    component.itemClickedObservable = new Subject()
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should create correct View', () => {
    const b: ConcreteGraphBase = new ConcreteGraphBase()
    b.addNode('Start', '', '')
    b.addNode('N1', '', '')
    b.addNode('N2', '', '')
    b.addNode('End', '', '')
    b.connect(b.getNodeById('Start')!, b.getNodeById('N1')!)
    b.connect(b.getNodeById('Start')!, b.getNodeById('N2')!)
    b.connect(b.getNodeById('N1')!, b.getNodeById('End')!)
    b.connect(b.getNodeById('N2')!, b.getNodeById('End')!)
    const m: Map<string, number> = new Map([
      ['Start', 0],
      ['N1', 1],
      ['N2', 1],
      ['End', 2]
    ])
    const model: NodeSequenceEditor = new ConcreteNodeSequenceEditor(new GraphConnectionsDecorator(b), m)
    model.omitNodeFrom(1)
    component.model = model
    const actual: ManualView = component.getManualView()
    const expected = getTheManualView()
    expect(actual).toEqual(expected)
  })

  function getTheManualView(): ManualView {
    return {
      header: [
        {position: 0, backgroundClass: BackgroundClass.EVEN, nodeId: "Start", fillOptions: [], selected: false},
        {position: 1, backgroundClass: BackgroundClass.ODD, nodeId: null, fillOptions: ["N1"], selected: false},
        {position: 2, backgroundClass: BackgroundClass.ODD, nodeId: "N2", fillOptions: [], selected: false},
        {position: 3, backgroundClass: BackgroundClass.EVEN, nodeId: "End", fillOptions: [], selected: false}
      ],
      body: [
        {
          header: {position: 0, backgroundClass: BackgroundClass.EVEN, nodeId: "Start", fillOptions: [], selected: false},
          cells: [
            {
              fromPosition: 0,
              toPosition: 0,
              backgroundClass: BackgroundClass.EVEN,
              fromAndToHaveNode: true,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 0,
              toPosition: 1,
              backgroundClass: BackgroundClass.ODD,
              fromAndToHaveNode: false,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 0,
              toPosition: 2,
              backgroundClass: BackgroundClass.ODD,
              fromAndToHaveNode: true,
              hasEdge: true,
              selected: false
            },
            {
              fromPosition: 0,
              toPosition: 3,
              backgroundClass: BackgroundClass.EVEN,
              fromAndToHaveNode: true,
              hasEdge: false,
              selected: false
            }
          ]
        },
        {
          header: {position: 1, backgroundClass: BackgroundClass.ODD, nodeId: null, fillOptions: ["N1"], selected: false},
          cells: [
            {
              fromPosition: 1,
              toPosition: 0,
              backgroundClass: BackgroundClass.ODD,
              fromAndToHaveNode: false,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 1,
              toPosition: 1,
              backgroundClass: BackgroundClass.DOUBLE_ODD,
              fromAndToHaveNode: false,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 1,
              toPosition: 2,
              backgroundClass: BackgroundClass.DOUBLE_ODD,
              fromAndToHaveNode: false,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 1,
              toPosition: 3,
              backgroundClass: BackgroundClass.ODD,
              fromAndToHaveNode: false,
              hasEdge: false,
              selected: false
            }
          ]
        },
        {
          header: {position: 2, backgroundClass: BackgroundClass.ODD, nodeId: "N2", fillOptions: [], selected: false},
          cells: [
            {
              fromPosition: 2,
              toPosition: 0,
              backgroundClass: BackgroundClass.ODD,
              fromAndToHaveNode: true,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 2,
              toPosition: 1,
              backgroundClass: BackgroundClass.DOUBLE_ODD,
              fromAndToHaveNode: false,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 2,
              toPosition: 2,
              backgroundClass: BackgroundClass.DOUBLE_ODD,
              fromAndToHaveNode: true,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 2,
              toPosition: 3,
              backgroundClass: BackgroundClass.ODD,
              fromAndToHaveNode: true,
              hasEdge: true,
              selected: false
            }
          ]
        },
        {
          header: {position: 3, backgroundClass: BackgroundClass.EVEN, nodeId: "End", fillOptions: [], selected: false},
          cells: [
            {
              fromPosition: 3,
              toPosition: 0,
              backgroundClass: BackgroundClass.EVEN,
              fromAndToHaveNode: true,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 3,
              toPosition: 1,
              backgroundClass: BackgroundClass.ODD,
              fromAndToHaveNode: false,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 3,
              toPosition: 2,
              backgroundClass: BackgroundClass.ODD,
              fromAndToHaveNode: true,
              hasEdge: false,
              selected: false
            },
            {
              fromPosition: 3,
              toPosition: 3,
              backgroundClass: BackgroundClass.EVEN,
              fromAndToHaveNode: true,
              hasEdge: false,
              selected: false
            }
          ]
        }
      ]
    }  
  }
});

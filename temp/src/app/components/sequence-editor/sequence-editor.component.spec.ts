import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { SequenceEditorComponent, ManualView, BackgroundClass } from './sequence-editor.component';
import { NodeSequenceEditor } from '../../notLibrary/nodeSequenceEditor';
import { createText, GraphForLayers, createGraphForLayers, PASS_DIRECTION_DOWN } from '../../public.api'

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
    const g = createGraphForLayers()
    addNode('Start', 0, g)
    addNode('N1', 1, g)
    addNode('N2', 1, g)
    addNode('End', 2, g)
    connect('Start', 'N1', g)
    connect('Start', 'N2', g)
    connect('N1', 'End', g)
    connect('N2', 'End', g)
    const model: NodeSequenceEditor = new NodeSequenceEditor(g)
    model.omitNodeFrom(1)
    component.model = model
    const actual: ManualView = component.getManualView()
    const expected = getTheManualView()
    expect(actual).toEqual(expected)
  })

  function addNode(id: string, layer: number, g: GraphForLayers) {
    g.addNode({
      id, layer, isError: false, isIntermediate: false, text: ''
    })
  }

  function connect(idFrom: string, idTo: string, g: GraphForLayers) {
    g.addEdge({
      from: g.getNodeById(idFrom), to: g.getNodeById(idTo), isError: false, isIntermediate: false, text: createText(undefined),
      isFirstSegment: false, isLastSegment: false, passDirection: PASS_DIRECTION_DOWN
    })
  }

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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DimensionsEditorComponent } from './dimensions-editor.component';

describe('DimensionsEditorComponent', () => {
  let component: DimensionsEditorComponent;
  let fixture: ComponentFixture<DimensionsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [DimensionsEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DimensionsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

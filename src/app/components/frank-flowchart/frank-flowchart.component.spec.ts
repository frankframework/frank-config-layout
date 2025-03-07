import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrankFlowchartComponent } from './frank-flowchart.component';

describe('FrankFlowchartComponent', () => {
  let component: FrankFlowchartComponent;
  let fixture: ComponentFixture<FrankFlowchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrankFlowchartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrankFlowchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

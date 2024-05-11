import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticSvgStatisticsComponent } from './static-svg-statistics.component';

describe('StaticSvgStatisticsComponent', () => {
  let component: StaticSvgStatisticsComponent;
  let fixture: ComponentFixture<StaticSvgStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaticSvgStatisticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaticSvgStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

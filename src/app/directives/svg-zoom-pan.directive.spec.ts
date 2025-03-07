import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { SvgZoomPanDirective } from './svg-zoom-pan.directive';

@Component({
  standalone: true,
  template: `<svg [appSvgZoomPan]></svg>`
})
class TestComponent {}

describe('SvgZoomPanDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let des: DebugElement[];

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [SvgZoomPanDirective],
      imports: [TestComponent],
    }).createComponent(TestComponent);
  
    fixture.detectChanges(); // initial binding
  
    // all elements with an attached HighlightDirective
    des = fixture.debugElement.queryAll(By.directive(SvgZoomPanDirective));
  });

  it('should create an instance', () => {
    expect(des).toBeTruthy();
  });
});

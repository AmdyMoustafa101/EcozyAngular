import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularGaugeComponent } from './circular-gauge.component';

describe('CircularGaugeComponent', () => {
  let component: CircularGaugeComponent;
  let fixture: ComponentFixture<CircularGaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircularGaugeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircularGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

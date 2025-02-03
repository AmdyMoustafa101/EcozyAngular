import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrosageModalComponent } from './arrosage-modal.component';

describe('ArrosageModalComponent', () => {
  let component: ArrosageModalComponent;
  let fixture: ComponentFixture<ArrosageModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrosageModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrosageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

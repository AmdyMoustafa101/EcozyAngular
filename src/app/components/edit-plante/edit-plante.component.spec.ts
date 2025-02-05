import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlanteComponent } from './edit-plante.component';

describe('EditPlanteComponent', () => {
  let component: EditPlanteComponent;
  let fixture: ComponentFixture<EditPlanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPlanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPlanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

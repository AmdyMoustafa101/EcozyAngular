import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup,FormControl,FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProgrammeArrosageService } from '../../services/programme-arrosage.service';
import { CommonModule } from '@angular/common';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-modifier-programme-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './modifier-programme-modal.component.html',
  styleUrls: ['./modifier-programme-modal.component.css']
})
export class ModifierProgrammeModalComponent {
  @Input() programme: any;
  @Output() programmeModifie = new EventEmitter<any>();
  isOpen: boolean = false;
  programmeForm: FormGroup;
  userConnect: any;

  constructor(private programmeArrosageService: ProgrammeArrosageService, private fb: FormBuilder, private loggingService: LoggingService) {
    this.programmeForm = this.fb.group({
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required]
    }, { validator: this.dateValidator });
  }

  ngOnInit() {

    this.userConnect = JSON.parse(localStorage.getItem('user') || '{}');

    if (this.programme) {
      this.programmeForm.patchValue({
        dateDebut: this.programme.dateDebut || new Date().toISOString().split('T')[0],
        dateFin: this.programme.dateFin
      });
    }
  }

  openModal() {
    this.isOpen = true;
    console.log('Modal ouvert');
  }

  closeModal() {
    this.isOpen = false;
    this.programmeForm.reset();
  }

  modifierProgramme() {
    if (this.programmeForm.valid) {
      const programmeModifie = {
        ...this.programme,
        dateDebut: this.programmeForm.value.dateDebut,
        dateFin: this.programmeForm.value.dateFin
      };

      this.programmeArrosageService.updateProgramme(this.programme._id, programmeModifie)
        .subscribe((programme) => {
          
          if(this.userConnect != null ){
            this.loggingService.logAction(this.userConnect.id, 'update', 'programme', this.programme._id, `Modification du programme`);
          }
          this.programmeModifie.emit(programme);
          this.closeModal();
        });
    }
  }

  dateValidator(formGroup: FormGroup) {
    const dateDebut = new Date(formGroup.get('dateDebut')?.value);
    const dateFin = new Date(formGroup.get('dateFin')?.value);
    return dateFin < dateDebut ? { dateInvalid: true } : null;
  }
}

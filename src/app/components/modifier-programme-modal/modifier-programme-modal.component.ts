import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProgrammeArrosageService } from '../../services/programme-arrosage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modifier-programme-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifier-programme-modal.component.html',
  styleUrls: ['./modifier-programme-modal.component.css']
})
export class ModifierProgrammeModalComponent {
  @Input() programme: any;
  @Output() programmeModifie = new EventEmitter<any>();
  isOpen: boolean = false;

  constructor(private programmeArrosageService: ProgrammeArrosageService) {}

  openModal() {
    this.isOpen = true;
    console.log('Modal ouvert');
  }

  closeModal() {
    this.isOpen = false;
  }

  modifierProgramme() {
    const programmeModifie = {
      ...this.programme,
      dateDebut: new Date(this.programme.dateDebut).toISOString(),
      dateFin: new Date(this.programme.dateFin).toISOString()
    };

    this.programmeArrosageService.updateProgramme(this.programme._id, programmeModifie)
      .subscribe((programme) => {
        this.programmeModifie.emit(programme);
        this.closeModal();
      });
  }
}

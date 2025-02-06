import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgrammeArrosageService } from '../../services/programme-arrosage.service';
import { ModifierProgrammeModalComponent } from '../modifier-programme-modal/modifier-programme-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-programme-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ModifierProgrammeModalComponent],
  templateUrl: './programme-details.component.html',
  styleUrls: ['./programme-details.component.css']
})
export class ProgrammeDetailsComponent implements AfterViewInit {

  @Input() programme: any;
  @ViewChild('modifierProgrammeModal') modifierProgrammeModal!: ModifierProgrammeModalComponent;
  isOpen: boolean = false;

  constructor(private programmeArrosageService: ProgrammeArrosageService) {}

  ngAfterViewInit() {
    // Vérifiez si le composant modal est disponible après l'initialisation de la vue
    if (!this.modifierProgrammeModal) {
      console.error('Le composant modal n\'est pas disponible.');
    }
  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    // Fermer également le modal de modification si ouvert
    if (this.modifierProgrammeModal && this.modifierProgrammeModal.isOpen) {
      this.modifierProgrammeModal.closeModal();
    }
  }

  toggleEtat() {
    if (this.programme) {
      this.programmeArrosageService.updateEtatProgramme(this.programme._id, this.programme.etat)
        .subscribe(() => {
          console.log('État mis à jour');
        });
    }
  }

  openModifierModal() {
    console.log('Ouverture du modal de modification');
    if (this.modifierProgrammeModal) {
      this.modifierProgrammeModal.openModal();
    } else {
      console.error('Le composant modal n\'est pas disponible.');
    }
  }

  onProgrammeModifie(programmeModifie: any) {
    this.programme = programmeModifie;
  }

  supprimerProgramme() {
    if (this.programme) {
      this.programmeArrosageService.deleteProgramme(this.programme._id)
        .subscribe(() => {
          console.log('Programme supprimé');
          this.closeModal();
        });
    }
  }
}

import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgrammeArrosageService } from '../../services/programme-arrosage.service';
import { ModifierProgrammeModalComponent } from '../modifier-programme-modal/modifier-programme-modal.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // Importer SweetAlert2
import { LoggingService } from '../../services/logging.service';

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
  userConnect: {
    id: string,
    role: string,
    nom: string,
    prenom: string,
    photo: string,
  } | null = null;

  constructor(private programmeArrosageService: ProgrammeArrosageService, private loggingService: LoggingService) {}

  ngOnInit() {
    this.userConnect = JSON.parse(localStorage.getItem('user') || '{}');
  }
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
          if(this.userConnect != null ){
            this.loggingService.logAction(this.userConnect.id, 'update', 'programme', this.programme._id, `Changement d\'état ${this.programme.etat}`);
          }
          console.log('État mis à jour');
          Swal.fire('État mis à jour', '', 'success');
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
      Swal.fire({
        title: 'Êtes-vous sûr?',
        text: 'Voulez-vous vraiment supprimer ce programme?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer!',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonAriaLabel: 'Confirmer la suppression',
        cancelButtonAriaLabel: 'Annuler la suppression',
      }).then((result) => {
        if (result.isConfirmed) {
          this.programmeArrosageService.deleteProgramme(this.programme._id)
            .subscribe(() => {
              if(this.userConnect != null ){
                this.loggingService.logAction(this.userConnect.id, 'delete', 'programme', this.programme._id, 'Suppression du programme');
              }
              Swal.fire('Supprimé!', 'Le programme a été supprimé.', 'success');
              this.closeModal();
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
         
        }
      });
    }
  }
}

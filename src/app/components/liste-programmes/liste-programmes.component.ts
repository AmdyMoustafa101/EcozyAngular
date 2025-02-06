import { Component, OnInit } from '@angular/core';
import { ProgrammeArrosageService, Plante, ProgrammeArrosage } from '../../services/programme-arrosage.service';
import { FormBuilder, FormGroup,FormControl,FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-programmes',
  standalone:true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './liste-programmes.component.html',
  styleUrl: './liste-programmes.component.css'
})
export class ListeProgrammesComponent implements OnInit {
  programmes: ProgrammeArrosage[] = [];
  plantes: Plante[] = [];
  programmeForm: FormGroup;
  programmeSelectionne: ProgrammeArrosage | null = null;
  showModal = false;
  showCreateModal = false;
  createProgrammeForm: FormGroup;

  constructor(
    private programmeArrosageService: ProgrammeArrosageService,
    private fb: FormBuilder
  ) {
    this.programmeForm = this.fb.group({
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      idPlante: ['', [Validators.required]],
      etat: [true, [Validators.required]],
    });

    this.createProgrammeForm = this.fb.group({
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      idPlante: ['', [Validators.required]],
    }, { validators: this.dateValidation });
  }

  ngOnInit(): void {
    this.chargerProgrammes();
    this.chargerPlantesDisponibles();
  }

  dateValidation(form: FormGroup) {
    const dateDebut = form.get('dateDebut')?.value;
    const dateFin = form.get('dateFin')?.value;

    if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
      return { dateInvalide: true };
    }
    return null;
  }

  chargerProgrammes(): void {
    this.programmeArrosageService.getProgrammesArrosage().subscribe({
      next: (programmes) => (this.programmes = programmes),
      error: (error) => console.error('Erreur lors du chargement des programmes', error),
    });
  }

  chargerPlantesDisponibles(): void {
    this.programmeArrosageService.getPlantesDisponibles().subscribe({
      next: (plantes) => (this.plantes = plantes),
      error: (error) => console.error('Erreur lors du chargement des plantes', error),
    });
  }

  changerEtatProgramme(programme: ProgrammeArrosage): void {
    if (!programme._id) {
      console.error('ID du programme non défini');
      return;
    }

    const nouvelEtat = !programme.etat; // Inverse l'état actuel

    this.programmeArrosageService.changerEtatProgramme(programme._id, nouvelEtat).subscribe({
      next: (updatedProgramme) => {
        // Met à jour l'état localement
        programme.etat = updatedProgramme.etat;
      },
      error: (error) => {
        console.error('Erreur lors de la modification de l\'état du programme', error);
        // Revert the state change in case of error
        programme.etat = !nouvelEtat;
      },
    });
  }

  ouvrirModalEdition(programme: ProgrammeArrosage): void {
    this.programmeSelectionne = programme;
    this.programmeForm.patchValue({
      dateDebut: programme.dateDebut,
      dateFin: programme.dateFin,
      idPlante: programme.idPlante,
      etat: programme.etat,
    });
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
    this.programmeSelectionne = null;
    this.programmeForm.reset();
  }

  onSubmit(): void {
    if (this.programmeForm.valid && this.programmeSelectionne && this.programmeSelectionne._id) {
      const programme: Partial<ProgrammeArrosage> = {
        ...this.programmeForm.value,
      };

      this.programmeArrosageService
        .mettreAJourProgrammeArrosage(this.programmeSelectionne._id, programme)
        .subscribe({
          next: () => {
            this.chargerProgrammes();
            this.fermerModal();
          },
          error: (error) => console.error('Erreur lors de la mise à jour du programme', error),
        });
    }
  }

  supprimerProgramme(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
      this.programmeArrosageService.supprimerProgrammeArrosage(id).subscribe({
        next: () => this.chargerProgrammes(),
        error: (error) => console.error('Erreur lors de la suppression du programme', error),
      });
    }
  }

  getNomPlante(idPlante: string | Plante): string {
    if (typeof idPlante === 'string') {
      const plante = this.plantes.find((p) => p._id === idPlante);
      return plante ? plante.nom : 'Plante inconnue';
    } else {
      return idPlante.nom;
    }
  }

  ouvrirModalCreation(): void {
    this.showCreateModal = true;
  }

  fermerCreateModal(): void {
    this.showCreateModal = false;
    this.createProgrammeForm.reset();
  }

  onSubmitCreate(): void {
    if (this.createProgrammeForm.valid) {
      const nouveauProgramme: Omit<ProgrammeArrosage, '_id'> = {
        dateDebut: this.createProgrammeForm.value.dateDebut,
        dateFin: this.createProgrammeForm.value.dateFin,
        idPlante: this.createProgrammeForm.value.idPlante,
        etat: true, // Par défaut, le programme est actif
      };

      // Vérifier que idPlante est un ObjectId valide
      if (!this.isValidObjectId(nouveauProgramme.idPlante as string)) {
        console.error('idPlante doit être un ObjectId valide');
        return;
      }

      // Vérifier si un programme existe déjà pour cette plante
      this.programmeArrosageService
        .verifierProgrammeExistant(nouveauProgramme.idPlante as string)
        .subscribe({
          next: (existe) => {
            if (existe) {
              alert('Un programme existe déjà pour cette plante.');
            } else {
              // Créer le programme
              this.programmeArrosageService
                .creerProgrammeArrosage(nouveauProgramme)
                .subscribe({
                  next: () => {
                    this.chargerProgrammes();
                    this.fermerCreateModal();
                  },
                  error: (error) => {
                    console.error('Erreur lors de la création du programme', error);
                  },
                });
            }
          },
          error: (error) => {
            console.error('Erreur lors de la vérification du programme existant', error);
          },
        });
    }
  }

  // Méthode pour valider un ObjectId
  isValidObjectId(id: string): boolean {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(id);
  }
}

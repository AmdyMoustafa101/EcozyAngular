import { Component, OnInit } from '@angular/core';
import { PlanteService } from '../../services/plante.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,FormControl,FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-plante-list',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './plante-list.component.html',
  styleUrl: './plante-list.component.css'
})
export class PlanteListComponent implements OnInit {
  plantes: any[] = []; // Liste complète des plantes
  filteredPlantes: any[] = []; // Liste filtrée des plantes
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 5; // Nombre d'éléments par page
  searchQuery: string = ''; // Terme de recherche
  filterType: string = 'all'; // Filtre par type d'arrosage
  selectedPlantes: Set<string> = new Set(); // IDs des plantes sélectionnées
  heuresSelectionnees: string[] = []; // Pour stocker les heures sélectionnées

  // Variables pour le modal de modification
  showEditModal: boolean = false; // Afficher ou masquer le modal
  selectedPlante: any = null; // Plante sélectionnée pour modification
  editPlanteForm: FormGroup; // Formulaire de modification

  planteForm: FormGroup;
  typeArrosageOptions = ['humidité', 'période'];



  constructor(private planteService: PlanteService, private fb: FormBuilder) {
    // Initialiser le formulaire de modification
    this.editPlanteForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      besoinEau: ['', [Validators.required, Validators.min(0)]],
      typeArrosage: ['', Validators.required],
      humidite: [null],
      periode: [null],
      heuresArrosage: this.fb.array([]), // Utiliser un FormArray pour les heures
    });

    // Gérer les changements de période
    this.editPlanteForm.get('periode')?.valueChanges.subscribe((value) => {
      this.genererChampsHeures(value);
    });
    // Initialiser le formulaire de creation
    this.planteForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      besoinEau: ['', [Validators.required, Validators.min(0)]],
      typeArrosage: ['', Validators.required],
      humidite: [null],
      periode: [null],
      heuresArrosage: this.fb.array([]), // Initialiser avec un tableau vide
    });

    // Gérer les changements de typeArrosage
     this.planteForm.get('typeArrosage')?.valueChanges.subscribe((value) => {
       this.updateFormControls(value);
     });

    // Gérer les changements de période
    this.planteForm.get('periode')?.valueChanges.subscribe((value) => {
      this.genererChampsHeuresCreate(value);
    });
  }

  ngOnInit(): void {
    this.loadPlantes();
  }


   // Mettre à jour les contrôles du formulaire en fonction du type d'arrosage
   updateFormControls(typeArrosage: string): void {
    if (typeArrosage === 'humidité') {
      this.planteForm.get('humidite')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      this.planteForm.get('periode')?.clearValidators();
      this.planteForm.get('heuresArrosage')?.clearValidators();
    } else if (typeArrosage === 'période') {
      this.planteForm.get('periode')?.setValidators([Validators.required, Validators.min(1)]);
      this.planteForm.get('heuresArrosage')?.setValidators([Validators.required]);
      this.planteForm.get('humidite')?.clearValidators();
    }

    // Mettre à jour les contrôles
    this.planteForm.get('humidite')?.updateValueAndValidity();
    this.planteForm.get('periode')?.updateValueAndValidity();
    this.planteForm.get('heuresArrosage')?.updateValueAndValidity();
  }

  // Charger la liste des plantes
  loadPlantes(): void {
    this.planteService.getPlantes().subscribe({
      next: (data) => {
        this.plantes = data;
        this.applyFilters(); // Appliquer les filtres après le chargement
      },
      error: (err) => {
        Swal.fire('Erreur', 'Impossible de charger la liste des plantes.', 'error');
      },
    });
  }

  // Appliquer les filtres (recherche et filtre par type)
  applyFilters(): void {
    this.filteredPlantes = this.plantes.filter((plante) => {
      // Filtre de recherche par nom
      const matchesSearch = plante.nom.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filtre par type d'arrosage
      const matchesFilter =
        this.filterType === 'all' ||
        (this.filterType === 'humidité' && plante.typeArrosage === 'humidité') ||
        (this.filterType === 'période' && plante.typeArrosage === 'période');

      return matchesSearch && matchesFilter;
    });

    this.currentPage = 1; // Réinitialiser la pagination après l'application des filtres
  }

  // Pagination : obtenir les plantes pour la page actuelle
  get paginatedPlantes(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPlantes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Pagination : changer de page
  changePage(page: number): void {
    this.currentPage = page;
  }

  // Pagination : obtenir le nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.filteredPlantes.length / this.itemsPerPage);
  }

  // Pagination : générer un tableau de pages pour la navigation
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Ouvrir le modal de modification
  openEditModal(plante: any): void {
    this.selectedPlante = plante;
    this.editPlanteForm.patchValue({
      nom: plante.nom,
      besoinEau: plante.besoinEau,
      typeArrosage: plante.typeArrosage,
      humidite: plante.humidite,
      periode: plante.periode,
    });

    // Générer les champs d'heure si le type d'arrosage est 'période'
    if (plante.typeArrosage === 'période' && plante.heuresArrosage) {
      const heuresArrosageArray = this.editPlanteForm.get('heuresArrosage') as FormArray;
      heuresArrosageArray.clear();
      plante.heuresArrosage.forEach((heure: string) => {
        heuresArrosageArray.push(this.fb.control(heure, Validators.required));
      });
    }

    this.showEditModal = true;
  }

  // Fermer le modal de modification
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedPlante = null;
    this.editPlanteForm.reset();
  }

  // Générer des champs d'heure dynamiquement en fonction de la période
  genererChampsHeures(periode: number): void {
    const heuresArrosageArray = this.editPlanteForm.get('heuresArrosage') as FormArray;
    heuresArrosageArray.clear(); // Réinitialiser les champs existants

    for (let i = 0; i < periode; i++) {
      heuresArrosageArray.push(new FormControl('', Validators.required));
    }
  }
  genererChampsHeuresCreate(periode: number): void {
    const heuresArrosageArray = this.planteForm.get('heuresArrosage') as FormArray;
    heuresArrosageArray.clear();

    for (let i = 0; i < periode; i++) {
      heuresArrosageArray.push(new FormControl('', Validators.required));
    }
  }



  // Obtenir le FormArray des heures d'arrosage
  get heuresArrosageControls(): FormControl[] {
    return (this.editPlanteForm.get('heuresArrosage') as FormArray).controls as FormControl[];
  }
  get heuresArrosageControlsCreate(): FormControl[] {
    return (this.planteForm.get('heuresArrosage') as FormArray).controls as FormControl[];
  }

  // Méthode pour basculer la sélection d'une plante
togglePlanteSelection(planteId: string): void {
  if (this.selectedPlantes.has(planteId)) {
    this.selectedPlantes.delete(planteId);
  } else {
    this.selectedPlantes.add(planteId);
  }
}

// Méthode pour sélectionner/désélectionner toutes les plantes
toggleSelectAll(event: Event): void {
  const isChecked = (event.target as HTMLInputElement).checked;
  if (isChecked) {
    this.paginatedPlantes.forEach((plante) => this.selectedPlantes.add(plante._id));
  } else {
    this.selectedPlantes.clear();
  }
}

// Méthode pour vérifier si toutes les plantes sont sélectionnées
isAllSelected(): boolean {
  return this.paginatedPlantes.every((plante) => this.selectedPlantes.has(plante._id));
}

  // Soumettre le formulaire de modification
  onSubmitEditForm(): void {
    if (this.editPlanteForm.invalid) {
      Swal.fire('Erreur', 'Veuillez remplir le formulaire correctement.', 'error');
      return;
    }

    const updatedPlante = this.editPlanteForm.value;

    // Formater les heures d'arrosage
    if (updatedPlante.typeArrosage === 'période') {
      updatedPlante.heuresArrosage = updatedPlante.heuresArrosage;
    } else {
      delete updatedPlante.heuresArrosage;
    }

    // Appeler le service pour mettre à jour la plante
    this.planteService.updatePlante(this.selectedPlante._id, updatedPlante).subscribe({
      next: (res) => {
        Swal.fire('Succès', 'Plante mise à jour avec succès!', 'success');
        this.loadPlantes(); // Recharger la liste des plantes
        this.closeEditModal(); // Fermer le modal
      },
      error: (err) => {
        Swal.fire('Erreur', 'Une erreur s\'est produite lors de la mise à jour de la plante.', 'error');
      },
    });
  }
  // Supprimer une plante
  deletePlante(planteId: string): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Vous ne pourrez pas revenir en arrière !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.planteService.deletePlante(planteId).subscribe({
          next: () => {
            Swal.fire('Supprimé !', 'La plante a été supprimée avec succès.', 'success');
            this.loadPlantes(); // Recharger la liste des plantes
          },
          error: (err) => {
            Swal.fire('Erreur', 'Une erreur s\'est produite lors de la suppression de la plante.', 'error');
          },
        });
      }
    });
  }
  toggleEtatPlante(plante: any): void {
    const newEtat = !plante.etat; // Inverse l'état actuel
    const action = newEtat ? this.planteService.activePlante(plante._id) : this.planteService.unactivePlante(plante._id);

    action.subscribe({
      next: () => {
        plante.etat = newEtat; // Met à jour immédiatement l'état localement
        Swal.fire({
          title: 'Succès !',
          text: `La plante ${plante.nom} est maintenant ${newEtat ? 'activée' : 'désactivée'}.`,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      },
      error: (err) => {
        console.error("Erreur lors du changement d'état", err);
        Swal.fire({
          title: 'Erreur !',
          text: 'Une erreur est survenue lors de la mise à jour de l’état.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  togglePlanteState(plante: any): void {
    const newState = !plante.etat;
    this.planteService.togglePlanteEtat(plante._id, newState).subscribe(
      (updatedPlante) => {
        plante.etat = updatedPlante.etat;
      },
      (error) => {
        console.error("Erreur lors du changement d'état", error);
      }
    );
  }

  toggleSelectedPlantes(etat: boolean): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous allez ${etat ? 'activer' : 'désactiver'} ${this.selectedPlantes.size} plante(s)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
      confirmButtonColor: etat ? '#28a745' : '#dc3545',
    }).then((result) => {
      if (result.isConfirmed) {
        const requests = Array.from(this.selectedPlantes).map((planteId) =>
          this.planteService.togglePlanteEtat(planteId, etat).toPromise()
        );

        Promise.all(requests)
          .then(() => {
            this.plantes.forEach((plante) => {
              if (this.selectedPlantes.has(plante._id)) {
                plante.etat = etat;
              }
            });

            this.selectedPlantes.clear();

            Swal.fire({
              title: 'Succès !',
              text: `Les plantes ont été ${etat ? 'activées' : 'désactivées'} avec succès.`,
              icon: 'success',
            });
          })
          .catch(() => {
            Swal.fire({
              title: 'Erreur',
              text: 'Un problème est survenu.',
              icon: 'error',
            });
          });
      }
    });
  }



  // Soumettre le formulaire
    onSubmit(): void {
        if (this.planteForm.invalid) {
          Swal.fire('Erreur', 'Veuillez remplir le formulaire correctement.', 'error');
          return;
        }

        const planteData = this.planteForm.value;

        // Formater les heures d'arrosage
        if (planteData.typeArrosage === 'période') {
          // Vérifier si heuresArrosage est un tableau
          if (Array.isArray(planteData.heuresArrosage)) {
            planteData.heuresArrosage = planteData.heuresArrosage.join(', ');
          } else {
            // Si heuresArrosage n'est pas un tableau, initialiser un tableau vide
            planteData.heuresArrosage = '';
          }
        } else {
          // Si le type d'arrosage n'est pas 'période', supprimer le champ heuresArrosage
          delete planteData.heuresArrosage;
        }

        // Appeler le service pour créer la plante
        this.planteService.createPlante(planteData).subscribe({
          next: (res) => {
            Swal.fire('Succès', 'Plante créée avec succès!', 'success');
            this.planteForm.reset();
          },
          error: (err) => {
            Swal.fire('Erreur', 'Une erreur s\'est produite lors de la création de la plante.', 'error');
          },
        });
    }

    deleteSelectedPlantes(): void {
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        html: `Vous allez supprimer <strong>${this.selectedPlantes.size}</strong> plante(s)`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer !',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          const deleteRequests = Array.from(this.selectedPlantes).map(planteId =>
            this.planteService.deletePlante(planteId).toPromise()
          );

          Promise.all(deleteRequests)
            .then(() => {
              // Supprimer les plantes supprimées de la liste locale
              this.plantes = this.plantes.filter(plante => !this.selectedPlantes.has(plante._id));

              this.selectedPlantes.clear(); // Vider la sélection
              this.applyFilters(); // Re-appliquer les filtres pour rafraîchir l'affichage

              // Afficher une notification de succès
              Swal.fire({
                title: 'Succès !',
                text: `${deleteRequests.length} plante(s) supprimée(s) avec succès.`,
                icon: 'success',
                confirmButtonColor: '#3085d6'
              });
            })
            .catch((err) => {
              console.error('Erreur lors de la suppression des plantes', err);

              // Afficher une notification d'erreur
              Swal.fire({
                title: 'Erreur !',
                text: 'Une erreur s\'est produite lors de la suppression des plantes.',
                icon: 'error',
                confirmButtonColor: '#3085d6'
              });
            });
        }
      });
    }



}

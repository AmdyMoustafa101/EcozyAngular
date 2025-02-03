import { Component, OnInit } from '@angular/core';
import { PlanteService } from '../../services/plante.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,FormControl,FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';@Component({
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
  heuresSelectionnees: string[] = []; // Pour stocker les heures sélectionnées

  // Variables pour le modal de modification
  showEditModal: boolean = false; // Afficher ou masquer le modal
  selectedPlante: any = null; // Plante sélectionnée pour modification
  editPlanteForm: FormGroup; // Formulaire de modification

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
  }

  ngOnInit(): void {
    this.loadPlantes();
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

  // Obtenir le FormArray des heures d'arrosage
  get heuresArrosageControls(): FormControl[] {
    return (this.editPlanteForm.get('heuresArrosage') as FormArray).controls as FormControl[];
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
}

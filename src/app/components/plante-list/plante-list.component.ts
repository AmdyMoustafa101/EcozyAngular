import { Component, OnInit, viewChild } from '@angular/core';
import { PlanteService } from '../../services/plante.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CreatePlanteComponent } from '../create-plante/create-plante.component';
import { EditPlanteComponent } from '../edit-plante/edit-plante.component';

@Component({
  selector: 'app-plante-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CreatePlanteComponent,
    EditPlanteComponent,
  ],
  templateUrl: './plante-list.component.html',
  styleUrls: ['./plante-list.component.css'],
})
export class PlanteListComponent implements OnInit {
  plantes: any[] = [];
  filteredPlantes: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchQuery: string = '';
  filterType: string = 'all';
  selectedPlante: any = null;
  selectedPlantes: Set<string> = new Set(); // IDs des plantes sélectionnées
  showEditModal: boolean = false;
  showCreatePlanteModal: boolean = false;

  totalPlantes: number = 0;
  plantesHumidite: number = 0;
  plantesPeriode: number = 0;

  readonly createPlanteModal = viewChild.required<CreatePlanteComponent>('createPlanteModal');
  readonly editPlanteModal = viewChild.required<EditPlanteComponent>('editPlanteModal');

  constructor(private planteService: PlanteService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadPlantes();
  }

  openCreatePlanteModal() {
    this.showCreatePlanteModal = true;
  }

  closeCreatePlanteModal() {
    this.showCreatePlanteModal = false;
  }

  openEditModal(plante: any): void {
    this.selectedPlante = plante;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedPlante = null;
  }

  onPlanteCreated(newPlante: any): void {
    this.plantes.push(newPlante);
    this.applyFilters();
    this.closeCreatePlanteModal();
  }

  onPlanteUpdated(updatedPlante: any): void {
    this.plantes = this.plantes.map((plante) =>
      plante._id === updatedPlante._id ? updatedPlante : plante
    );
    this.applyFilters();
    this.closeEditModal();
  }

  loadPlantes(): void {
    this.planteService.getPlantes().subscribe({
      next: (data) => {
        this.plantes = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des plantes', err);
      },
    });
  }

  applyFilters(): void {
    this.filteredPlantes = this.plantes.filter((plante) => {
      const matchesSearch = plante.nom
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());
      const matchesFilterType =
        this.filterType === 'all' || plante.typeArrosage === this.filterType;
      return matchesSearch && matchesFilterType;
    });
    this.updateStatistics();
    this.currentPage = 1;
  }

  updateStatistics(): void {
    this.totalPlantes = this.filteredPlantes.length;
    this.plantesHumidite = this.filteredPlantes.filter(
      (plante) => plante.typeArrosage === 'humidité'
    ).length;
    this.plantesPeriode = this.filteredPlantes.filter(
      (plante) => plante.typeArrosage === 'période'
    ).length;
  }

  get paginatedPlantes(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPlantes.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPlantes.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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

  deletePlante(planteId: string): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer cette plante ?',
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
            this.plantes = this.plantes.filter(
              (plante) => plante._id !== planteId
            );
            this.applyFilters();
            Swal.fire(
              'Succès !',
              'La plante a été supprimée avec succès.',
              'success'
            );
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de la plante', err);
            Swal.fire(
              'Erreur !',
              "Une erreur s'est produite lors de la suppression de la plante.",
              'error'
            );
          },
        });
      }
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

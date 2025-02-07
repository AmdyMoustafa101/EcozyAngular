import { Component, OnInit, ViewChild } from '@angular/core';
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
import { LoggingService } from '../../services/logging.service';

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
  showEditModal: boolean = false;
  showCreatePlanteModal: boolean = false;

  totalPlantes: number = 0;
  plantesHumidite: number = 0;
  plantesPeriode: number = 0;

  user:  {  
    id: string,
    role: string,
    nom: string,
    prenom: string,
    photo: string,
  } | null = null;

  @ViewChild('createPlanteModal') createPlanteModal!: CreatePlanteComponent;
  @ViewChild('editPlanteModal') editPlanteModal!: EditPlanteComponent;

  constructor(private planteService: PlanteService, private fb: FormBuilder, private loggingService: LoggingService) {}

  ngOnInit(): void {

    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }

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

            if(this.user != null ){
              this.loggingService.logAction(this.user.id, 'delete', 'plante', planteId, 'Plante supprimée');
            }

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
}

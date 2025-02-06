import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProgrammeArrosageService, Plante } from '../../services/programme-arrosage.service';
import { FormBuilder, FormGroup,FormControl,FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-arrosage-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, NgFor,NgIf, MatButtonModule,MatSelectModule,MatFormFieldModule],
  templateUrl: './arrosage-modal.component.html',
  styleUrls: ['./arrosage-modal.component.css'],
})
export class ArrosageModalComponent implements OnInit{
  @Output() close = new EventEmitter<void>();

  isOpen = false;
  startDate: string | undefined;
  endDate: string | undefined;
  selectedPlantId: string | undefined;
  programmeForm!: FormGroup;
  plantes: any[] = [];

  constructor(private fb: FormBuilder,private http: HttpClient, private programmeArrosageService: ProgrammeArrosageService) {

  }


  ngOnInit(): void {
    this.chargerPlantesDisponibles();
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0]; // Date du jour au format YYYY-MM-DD

    this.programmeForm = this.fb.group({
      dateDebut: [today, [Validators.required, this.validateDateDebut.bind(this)]],
      dateFin: ['', [Validators.required, this.validateDateFin.bind(this)]],
      idPlante: ['', Validators.required],
    });
  }

  // Validateur personnalisé pour la date de début
  validateDateDebut(control: any): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorer l'heure pour la comparaison

    if (selectedDate < today) {
      return { invalidDateDebut: true }; // La date de début est antérieure à aujourd'hui
    }
    return null; // La date est valide
  }

  // Validateur personnalisé pour la date de fin
  validateDateFin(control: any): { [key: string]: boolean } | null {
    const dateDebut = this.programmeForm?.get('dateDebut')?.value;
    const dateFin = new Date(control.value);

    if (dateDebut && dateFin < new Date(dateDebut)) {
      return { invalidDateFin: true }; // La date de fin est antérieure ou égale à la date de début
    }
    return null; // La date est valide
  }


  // Charger les plantes disponibles dont l'état est true
  chargerPlantesDisponibles(): void {
    this.programmeArrosageService.getPlantesDisponibles().subscribe(
      (plantes) => {
        this.plantes = plantes;
      },
      (error) => {
        console.error('Erreur lors du chargement des plantes', error);
      }
    );
  }

  openModal() {
    this.isOpen = true;
  }



  onSubmit(): void {
    if (this.programmeForm.invalid) {
      Swal.fire({
        title: 'Erreur !',
        text: 'Veuillez remplir correctement tous les champs.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    const programmeArrosage = this.programmeForm.value;
    this.http.post('http://localhost:3500/api/programme-arrosage', programmeArrosage).subscribe(
      response => {
        // Afficher un message de succès
      Swal.fire({
        title: 'Succès !',
        text: 'Le programme d\'arrosage a été créé avec succès.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        window.location.reload();
        this.closeModal(); // Fermer la modal après confirmation
      });
        this.closeModal();
      },
      error => {
        // Afficher un message d'erreur
      Swal.fire({
        title: 'Erreur !',
        text: 'Un programme pour cette plante existe deja',
        icon: 'error',
        confirmButtonText: 'OK'
      });
        console.error('Erreur lors de la création du programme d\'arrosage', error);
      }
    );
  }
  closeModal(): void {
    this.isOpen = false;
  }
}

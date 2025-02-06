import { Component, OnInit } from '@angular/core';
import { ProgrammeArrosageService, Plante, ProgrammeArrosage } from '../../services/programme-arrosage.service';
import { FormBuilder, FormGroup,FormControl,FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-programme-arrosage',
  standalone:true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './programme-arrosage.component.html',
  styleUrl: './programme-arrosage.component.css'
})
export class ProgrammeArrosageComponent implements OnInit{
  programmeForm: FormGroup;
  plantes: Plante[] = [];

  constructor(
    private fb: FormBuilder,
    private programmeArrosageService: ProgrammeArrosageService
  ) {
    this.programmeForm = this.fb.group({
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      idPlante: ['', [Validators.required]],

    }, { validators: this.dateValidation });
  }

  ngOnInit(): void {
    this.chargerPlantesDisponibles();
  }

  // Validation personnalisée pour vérifier que la date de fin est supérieure à la date de début
  dateValidation(form: FormGroup) {
    const dateDebut = form.get('dateDebut')?.value;
    const dateFin = form.get('dateFin')?.value;

    if (dateDebut && dateFin && new Date(dateFin) <= new Date(dateDebut)) {
      return { dateInvalide: true };
    }
    return null;
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

  // Soumettre le formulaire
  // onSubmit(): void {
  //   if (this.programmeForm.valid) {
  //     const programme: ProgrammeArrosage = {
  //       dateDebut: this.programmeForm.value.dateDebut,
  //       dateFin: this.programmeForm.value.dateFin,
  //       idPlante: this.programmeForm.value.idPlante,
  //     };

  //     this.programmeArrosageService.creerProgrammeArrosage(programme).subscribe(
  //       (response) => {
  //         Swal.fire('Succès', 'Programme créée avec succès!', 'success');
  //         this.programmeForm.reset();
  //       },
  //       (error) => {
  //         console.error('Erreur lors de la création du programme', error);
  //       }
  //     );
  //   } else {
  //     Swal.fire('Erreur', 'Veuillez corriger les erreurs dans le formulaire.', 'error');

  //   }
  // }

}

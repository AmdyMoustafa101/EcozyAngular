import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,FormControl,FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlanteService } from '../../services/plante.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-plante',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-plante.component.html',
  styleUrl: './create-plante.component.css'
})
export class CreatePlanteComponent implements OnInit {
  planteForm: FormGroup;
  typeArrosageOptions = ['humidité', 'période'];
  heuresSelectionnees: string[] = []; // Pour stocker les heures sélectionnées

  constructor(private fb: FormBuilder, private planteService: PlanteService) {
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
      this.genererChampsHeures(value);
    });
  }

  ngOnInit(): void {}

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

  // Générer des champs d'heure dynamiquement en fonction de la période
  genererChampsHeures(periode: number): void {
    const heuresArrosageArray = this.planteForm.get('heuresArrosage') as FormArray;
    heuresArrosageArray.clear(); // Réinitialiser les champs existants

    for (let i = 0; i < periode; i++) {
      heuresArrosageArray.push(new FormControl('', Validators.required));
    }
  }

  // Obtenir le FormArray des heures d'arrosage
  get heuresArrosageControls(): FormControl[] {
    return (this.planteForm.get('heuresArrosage') as FormArray).controls as FormControl[];
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
}

import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from '@angular/forms';
import { PlanteService } from '../../services/plante.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-create-plante',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-plante.component.html',
  styleUrls: ['./create-plante.component.css'],
})
export class CreatePlanteComponent implements OnInit {
  planteForm: FormGroup;
  typeArrosageOptions = ['humidité', 'période'];
  isModalOpen = true;

  user:  {
    id: string,
    role: string,
    nom: string,
    prenom: string,
    photo: string,
  } | null = null;

  constructor(private fb: FormBuilder, private planteService: PlanteService, private loggingService: LoggingService) {
    this.planteForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      besoinEau: ['', [Validators.required, Validators.min(0)]],
      typeArrosage: ['', Validators.required],
      humidite: [null],
      periode: [null],
      heuresArrosage: this.fb.array([]),
    });

    this.planteForm.get('typeArrosage')?.valueChanges.subscribe((value) => {
      this.updateFormControls(value);
    });

    this.planteForm.get('periode')?.valueChanges.subscribe((value) => {
      this.genererChampsHeures(value);
    });
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  updateFormControls(typeArrosage: string): void {
    if (typeArrosage === 'humidité') {
      this.planteForm
        .get('humidite')
        ?.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ]);
      this.planteForm.get('periode')?.clearValidators();
      this.planteForm.get('heuresArrosage')?.clearValidators();
    } else if (typeArrosage === 'période') {
      this.planteForm
        .get('periode')
        ?.setValidators([Validators.required, Validators.min(1)]);
      this.planteForm
        .get('heuresArrosage')
        ?.setValidators([Validators.required]);
      this.planteForm.get('humidite')?.clearValidators();
    }

    this.planteForm.get('humidite')?.updateValueAndValidity();
    this.planteForm.get('periode')?.updateValueAndValidity();
    this.planteForm.get('heuresArrosage')?.updateValueAndValidity();
  }

  genererChampsHeures(periode: number): void {
    const heuresArrosageArray = this.planteForm.get(
      'heuresArrosage'
    ) as FormArray;
    heuresArrosageArray.clear();

    for (let i = 0; i < periode; i++) {
      heuresArrosageArray.push(new FormControl('', Validators.required));
    }
  }

  get heuresArrosageControls(): FormControl[] {
    return (this.planteForm.get('heuresArrosage') as FormArray)
      .controls as FormControl[];
  }

  onSubmit(): void {
    if (this.planteForm.invalid) {
      Swal.fire(
        'Erreur',
        'Veuillez remplir le formulaire correctement.',
        'error'
      );
      return;
    }

    const planteData = this.planteForm.value;

    if (planteData.typeArrosage === 'période') {
      if (Array.isArray(planteData.heuresArrosage)) {
        planteData.heuresArrosage = planteData.heuresArrosage.join(', ');
      } else {
        planteData.heuresArrosage = '';
      }
    } else {
      delete planteData.heuresArrosage;
    }

    this.planteService.createPlante(planteData).subscribe({
      next: (res) => {
        if (this.user != null && this.user != null) {
          this.loggingService.logAction(this.user.id, 'create', 'plante', res.plante._id, 'Création de la plante');
        } 
        Swal.fire('Succès', 'Plante créée avec succès!', 'success');
        console.log(res);
        this.planteForm.reset();
        window.location.reload();
        this.closeModal();
      },
      error: (err) => {
        Swal.fire(
          'Erreur',
          "Une erreur s'est produite lors de la création de la plante.",
          'error'
        );
      },
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.planteForm.reset();
  }

  getControl(controlName: string): FormControl {
    const control = this.planteForm.get(controlName);
    if (!control) {
      throw new Error(
        `Control with name '${controlName}' does not exist in the form group`
      );
    }
    return control as FormControl;
  }
}

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { PlanteService } from '../../services/plante.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-plante',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-plante.component.html',
  styleUrls: ['./edit-plante.component.css'],
})
export class EditPlanteComponent implements OnInit {
  @Input() plante: any;
  @Output() closeModal = new EventEmitter<void>();
  @Output() planteUpdated = new EventEmitter<any>();

  editPlanteForm: FormGroup;
  typeArrosageOptions = ['humidité', 'période'];
  heuresSelectionnees: string[] = []; // Pour stocker les heures sélectionnées

  constructor(private fb: FormBuilder, private planteService: PlanteService) {
    this.editPlanteForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      besoinEau: ['', [Validators.required, Validators.min(0)]],
      typeArrosage: ['', Validators.required],
      humidite: [null],
      periode: [null],
      heuresArrosage: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    if (this.plante) {
      this.editPlanteForm.patchValue({
        nom: this.plante.nom,
        besoinEau: this.plante.besoinEau,
        typeArrosage: this.plante.typeArrosage,
        humidite: this.plante.humidite,
        periode: this.plante.periode,
      });

      if (this.plante.heuresArrosage) {
        const heuresArrosageArray = this.editPlanteForm.get(
          'heuresArrosage'
        ) as FormArray;
        heuresArrosageArray.clear();
        this.plante.heuresArrosage.split(', ').forEach((heure: string) => {
          heuresArrosageArray.push(new FormControl(heure, Validators.required));
        });
      }
    }

    this.editPlanteForm.get('typeArrosage')?.valueChanges.subscribe((value) => {
      this.updateFormControls(value);
    });

    this.editPlanteForm.get('periode')?.valueChanges.subscribe((value) => {
      this.genererChampsHeures(value);
    });
  }

  updateFormControls(typeArrosage: string): void {
    if (typeArrosage === 'humidité') {
      this.editPlanteForm
        .get('humidite')
        ?.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ]);
      this.editPlanteForm.get('periode')?.clearValidators();
      this.editPlanteForm.get('heuresArrosage')?.clearValidators();
    } else if (typeArrosage === 'période') {
      this.editPlanteForm
        .get('periode')
        ?.setValidators([Validators.required, Validators.min(1)]);
      this.editPlanteForm
        .get('heuresArrosage')
        ?.setValidators([Validators.required]);
      this.editPlanteForm.get('humidite')?.clearValidators();
    }

    this.editPlanteForm.get('humidite')?.updateValueAndValidity();
    this.editPlanteForm.get('periode')?.updateValueAndValidity();
    this.editPlanteForm.get('heuresArrosage')?.updateValueAndValidity();
  }

  genererChampsHeures(periode: number): void {
    const heuresArrosageArray = this.editPlanteForm.get(
      'heuresArrosage'
    ) as FormArray;
    heuresArrosageArray.clear();

    for (let i = 0; i < periode; i++) {
      heuresArrosageArray.push(new FormControl('', Validators.required));
    }
  }

  get heuresArrosageControls(): FormControl[] {
    return (this.editPlanteForm.get('heuresArrosage') as FormArray)
      .controls as FormControl[];
  }

  onSubmitEditForm(): void {
    if (this.editPlanteForm.invalid) {
      Swal.fire(
        'Erreur',
        'Veuillez remplir le formulaire correctement.',
        'error'
      );
      return;
    }

    const planteData = this.editPlanteForm.value;

    if (planteData.typeArrosage === 'période') {
      if (Array.isArray(planteData.heuresArrosage)) {
        planteData.heuresArrosage = planteData.heuresArrosage.join(', ');
      } else {
        planteData.heuresArrosage = '';
      }
    } else {
      delete planteData.heuresArrosage;
    }

    this.planteService.updatePlante(this.plante._id, planteData).subscribe({
      next: (res) => {
        this.planteUpdated.emit(res.plante);
        this.closeModal.emit();
        Swal.fire(
          'Succès !',
          'La plante a été mise à jour avec succès.',
          'success'
        );
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la plante', err);
        Swal.fire(
          'Erreur !',
          "Une erreur s'est produite lors de la mise à jour de la plante.",
          'error'
        );
      },
    });
  }

  closeEditModal(): void {
    this.closeModal.emit();
  }

  getControl(controlName: string): FormControl {
    const control = this.editPlanteForm.get(controlName);
    if (!control) {
      throw new Error(
        `Control with name '${controlName}' does not exist in the form group`
      );
    }
    return control as FormControl;
  }
}

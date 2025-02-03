import { Component } from '@angular/core';
import { FormBuilder,FormControl, FormsModule, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {
  userForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      nom: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z][a-zA-Z ]*$/), // Commence par une majuscule
        ],
      ],
      prenom: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z][a-zA-Z ]*$/), // Commence par une majuscule
        ],
      ],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      photo: [null],
      role: ['user', Validators.required], // Rôle par défaut : 'user'
    });
  }

  // Gérer la sélection du fichier
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.userForm.patchValue({ photo: file });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = new FormData();
      formData.append('nom', this.userForm.get('nom')?.value);
      formData.append('prenom', this.userForm.get('prenom')?.value);
      formData.append('role', this.userForm.get('role')?.value);
      formData.append('telephone', this.userForm.get('telephone')?.value);
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }

      this.userService.createUser(formData).subscribe({
        next: (res) => {
          // Accéder au codeSecret à partir de l'objet user renvoyé
          const codeSecret = res.user.codeSecret;

          Swal.fire({
            title: 'Succès!',
            text: `Utilisateur créé avec succès. Code secret: ${codeSecret}`,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.userForm.reset();
          this.selectedFile = null; // Réinitialiser le fichier sélectionné
        },
        error: (err) => {
          Swal.fire({
            title: 'Erreur!',
            text: 'Erreur lors de la création de l’utilisateur',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }
  // Méthode pour accéder facilement aux contrôles du formulaire
  getControl(controlName: string): FormControl {
    const control = this.userForm.get(controlName);
    if (!control) {
      throw new Error(`Control with name '${controlName}' does not exist in the form group`);
    }
    return control as FormControl;
  }
}

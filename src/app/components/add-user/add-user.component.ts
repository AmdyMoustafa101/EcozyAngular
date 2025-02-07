import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css',
})
export class AddUserComponent {
  userForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  selectedFile: File | null = null;

  user:  {
    id: string,
    role: string,
    nom: string,
    prenom: string,
    photo: string,
  } | null = null;

  constructor(private fb: FormBuilder, private userService: UserService, private loggingService: LoggingService) {
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

  isModalOpen = false;
  photoPreview: string | ArrayBuffer | null = null;

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  // Ajoutez ces méthodes
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.userForm.reset();
    this.selectedFile = null;
    this.photoPreview = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.userForm.patchValue({ photo: file });

      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result;
      };
      reader.readAsDataURL(file);
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
          if (this.user != null) {
            this.loggingService.logAction(this.user.id, 'create', 'user', res.user._id, 'Création de l\'utilisateur');
          } 
          // Accéder au codeSecret à partir de l'objet user renvoyé
          const codeSecret = res.user.codeSecret;

          Swal.fire({
            title: 'Succès!',
            text: `Utilisateur créé avec succès. Code secret: ${codeSecret}`,
            icon: 'success',
            confirmButtonText: 'OK',
          });

          window.location.reload();
          this.userForm.reset();
          this.closeModal();
          this.selectedFile = null; // Réinitialiser le fichier sélectionné
        },
        error: (err) => {
          Swal.fire({
            title: 'Erreur!',
            text: 'Erreur lors de la création de l’utilisateur',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        },
      });
    }
  }
  // Méthode pour accéder facilement aux contrôles du formulaire
  getControl(controlName: string): FormControl {
    const control = this.userForm.get(controlName);
    if (!control) {
      throw new Error(
        `Control with name '${controlName}' does not exist in the form group`
      );
    }
    return control as FormControl;
  }
}

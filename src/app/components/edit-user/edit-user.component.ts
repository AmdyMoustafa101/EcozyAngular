import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
})
export class EditUserComponent {
  @Input() user: any;
  @Output() userUpdated = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  editUserForm: FormGroup;
  photoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  showModal = false;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.editUserForm = this.fb.group({
      nom: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]*$/)]],
      prenom: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]*$/)],
      ],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      role: ['user', Validators.required],
      photo: [null],
    });
  }

  // Méthode pour ouvrir le modal
  openModal(user: any): void {
    this.user = user;
    this.initializeForm();
    this.showModal = true;
  }

  // Méthode privée pour initialiser le formulaire
  private initializeForm(): void {
    this.editUserForm.patchValue({
      nom: this.user.nom,
      prenom: this.user.prenom,
      telephone: this.user.telephone,
      role: this.user.role,
    });

    this.photoPreview = this.user.photo
      ? `http://localhost:3500/${this.user.photo}`
      : null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.photoPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.editUserForm.valid && this.user) {
      const formData = new FormData();

      Object.keys(this.editUserForm.controls).forEach((key) => {
        if (key !== 'photo' && this.editUserForm.get(key)?.value) {
          formData.append(key, this.editUserForm.get(key)?.value);
        }
      });

      if (this.selectedFile) formData.append('photo', this.selectedFile);

      this.userService.updateUser(this.user._id, formData).subscribe({
        next: (updatedUser) => {
          this.userUpdated.emit(updatedUser);
          this.close();
        },
        error: (err) => console.error('Update error:', err),
      });
    }
  }

  // Modifier la méthode de fermeture
  close(): void {
    this.showModal = false;
    this.closed.emit();
    this.reset();
  }

  private reset(): void {
    this.editUserForm.reset();
    this.photoPreview = null;
    this.selectedFile = null;
  }
}

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
})
export class EditUserComponent implements OnInit {
  @Input() user: any;
  @Output() closeModal = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<any>();

  editUserForm: FormGroup;
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;
  isModalOpen = true;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.editUserForm = this.fb.group({
      nom: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z ]*$/)]],
      prenom: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z ]*$/)],
      ],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      role: ['user', Validators.required],
      photo: [null],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.editUserForm.patchValue({
        nom: this.user.nom,
        prenom: this.user.prenom,
        telephone: this.user.telephone,
        role: this.user.role,
      });

      if (this.user.photo) {
        this.photoPreview = `http://localhost:3500/${this.user.photo}`;
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.editUserForm.patchValue({ photo: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmitEditForm(): void {
    if (this.editUserForm.valid && this.user) {
      const formData = new FormData();
      formData.append('nom', this.editUserForm.get('nom')?.value);
      formData.append('prenom', this.editUserForm.get('prenom')?.value);
      formData.append('telephone', this.editUserForm.get('telephone')?.value);
      formData.append('role', this.editUserForm.get('role')?.value);
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }

      this.userService.updateUser(this.user._id, formData).subscribe({
        next: (res) => {
          this.userUpdated.emit(res.user);
          this.closeModal.emit();
          Swal.fire({
            title: 'Succès !',
            text: "L'utilisateur a été mis à jour avec succès.",
            icon: 'success',
            confirmButtonColor: '#3085d6',
          });
        },
        error: (err) => {
          console.error("Erreur lors de la mise à jour de l'utilisateur", err);
          Swal.fire({
            title: 'Erreur !',
            text: "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
            icon: 'error',
            confirmButtonColor: '#3085d6',
          });
        },
      });
    }
  }

  closeEditModal(): void {
    this.closeModal.emit();
  }

  getControl(controlName: string): FormControl {
    const control = this.editUserForm.get(controlName);
    if (!control) {
      throw new Error(
        `Control with name '${controlName}' does not exist in the form group`
      );
    }
    return control as FormControl;
  }
}

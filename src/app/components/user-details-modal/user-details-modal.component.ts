import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-details-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-details-modal.component.html',
  styleUrls: ['./user-details-modal.component.css']
})
export class UserDetailsModalComponent implements OnInit {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  isOpen: boolean = false;
  userForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      photo: [''],
      role: [''],
      codeSecret: [''],
      carteRFID: ['']
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.userForm.patchValue({
        nom: this.user.nom,
        prenom: this.user.prenom,
        telephone: this.user.telephone,
        photo: this.user.photo,
        role: this.user.role,
        codeSecret: this.user.codeSecret,
        carteRFID: this.user.carteRFID
      });
    }
  }

  openModal(): void {
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userForm.patchValue({
          photo: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  updateUser(): void {
    if (this.userForm.valid) {
      const formData = new FormData();
      formData.append('nom', this.userForm.get('nom')?.value);
      formData.append('prenom', this.userForm.get('prenom')?.value);
      formData.append('telephone', this.userForm.get('telephone')?.value);
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile);
      }

      this.userService.updateUser(this.user._id, formData).subscribe(
        (response) => {
          console.log('Utilisateur mis à jour avec succès', response);
          this.closeModal();
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de l’utilisateur', error);
        }
      );
    }
  }
}

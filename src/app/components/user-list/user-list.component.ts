import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: any[] = []; // Liste complète des utilisateurs

  filteredUsers: any[] = []; // Liste filtrée des utilisateurs
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 10; // Nombre d'utilisateurs par page
  searchQuery: string = ''; // Terme de recherche
  archiveFilter: string = 'all'; // Filtre pour les utilisateurs archivés/non archivés
  selectedUsers: Set<string> = new Set(); // IDs des utilisateurs sélectionnés
  roleFilter: string = 'all'; // Filtre pour les utilisateurs par rôle

  // Variables pour le modal de détails de l'utilisateur
  selectedUserDetails: any = null; // Utilisateur sélectionné pour afficher les détails

  // Statistiques
  totalUsers: number = 0; // Nombre total d'utilisateurs
  activeUsers: number = 0; // Nombre d'utilisateurs non archivés
  usersWithRFID: number = 0; // Nombre d'utilisateurs avec carteRFID non nulle

  // Variables pour le modal de modification
  showEditModal: boolean = false; // Afficher ou masquer le modal
  selectedUser: any = null; // Utilisateur sélectionné pour modification
  editUserForm: FormGroup; // Formulaire de modification
  selectedFile: File | null = null; // Nouvelle photo sélectionnée

  constructor(private userService: UserService, private fb: FormBuilder) {
    // Initialiser le formulaire de modification
    this.editUserForm = this.fb.group({
      nom: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z ]*$/)]],
      prenom: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z ]*$/)]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      role: ['user', Validators.required],
      photo: [null],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Ouvrir le modal des détails de l'utilisateur
  openUserDetailsModal(user: any): void {
    this.selectedUserDetails = user;
  }

  // Fermer le modal des détails de l'utilisateur
  closeUserDetailsModal(): void {
    this.selectedUserDetails = null;
  }

  // Charger tous les utilisateurs
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data; // Initialiser la liste filtrée

        // Calculer les statistiques
        this.totalUsers = this.users.length;
        this.activeUsers = this.users.filter(user => !user.archived).length;
        this.usersWithRFID = this.users.filter(user => user.carteRFID !== null && user.carteRFID !== '').length;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
      }
    });
  }

  // Ouvrir le modal de modification
  openEditModal(user: any): void {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      role: user.role,
    });
    this.showEditModal = true;
  }

  // Fermer le modal de modification
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.selectedFile = null;
    this.editUserForm.reset();
  }

  // Gérer la sélection d'une nouvelle photo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.editUserForm.patchValue({ photo: file });
    }
  }

  // Soumettre le formulaire de modification
  onSubmitEditForm(): void {
    if (this.editUserForm.valid && this.selectedUser) {
      const formData = new FormData();
      formData.append('nom', this.editUserForm.get('nom')?.value);
      formData.append('prenom', this.editUserForm.get('prenom')?.value);
      formData.append('telephone', this.editUserForm.get('telephone')?.value);
      formData.append('role', this.editUserForm.get('role')?.value);
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }

      this.userService.updateUser(this.selectedUser._id, formData).subscribe({
        next: (res) => {
          // Mettre à jour l'utilisateur dans la liste
          const updatedUser = res.user;
          this.users = this.users.map(user =>
            user._id === updatedUser._id ? updatedUser : user
          );
          this.applyFilters(); // Re-appliquer les filtres

          // Fermer le modal et afficher une notification de succès
          this.closeEditModal();
          Swal.fire({
            title: 'Succès !',
            text: 'L\'utilisateur a été mis à jour avec succès.',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur', err);

          // Afficher une notification d'erreur
          Swal.fire({
            title: 'Erreur !',
            text: 'Une erreur s\'est produite lors de la mise à jour de l\'utilisateur.',
            icon: 'error',
            confirmButtonColor: '#3085d6'
          });
        }
      });
    }
  }

  // Appliquer les filtres (recherche et filtre d'archivage)
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Filtre de recherche par nom ou prénom
      const matchesSearch = user.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            user.prenom.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filtre d'archivage
      const matchesArchiveFilter =
        this.archiveFilter === 'all' ||
        (this.archiveFilter === 'archived' && user.archived) ||
        (this.archiveFilter === 'nonArchived' && !user.archived);

      // Filtre de rôle
      const matchesRoleFilter =
        this.roleFilter === 'all' ||
        user.role === this.roleFilter;

      return matchesSearch && matchesArchiveFilter && matchesRoleFilter;
    });

    this.currentPage = 1; // Réinitialiser la pagination après l'application des filtres
  }

  // Filtrer les utilisateurs par nom ou prénom
  filterUsers(): void {
    this.filteredUsers = this.users.filter(user =>
      user.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.prenom.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.currentPage = 1; // Réinitialiser la pagination après la recherche
  }

  // Pagination : obtenir les utilisateurs pour la page actuelle
  get paginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Pagination : changer de page
  changePage(page: number): void {
    this.currentPage = page;
  }

  // Pagination : obtenir le nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  // Pagination : générer un tableau de pages pour la navigation
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Sélectionner ou désélectionner un utilisateur
  toggleUserSelection(userId: string): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  // Vérifier si un utilisateur est sélectionné
  isSelected(userId: string): boolean {
    return this.selectedUsers.has(userId);
  }

  // Sélectionner ou désélectionner tous les utilisateurs de la page actuelle
  toggleAllUsers(): void {
    if (this.areAllUsersSelected()) {
      this.selectedUsers.clear();
    } else {
      this.paginatedUsers.forEach(user => this.selectedUsers.add(user._id));
    }
  }

  // Vérifier si tous les utilisateurs de la page actuelle sont sélectionnés
  areAllUsersSelected(): boolean {
    return this.paginatedUsers.every(user => this.selectedUsers.has(user._id));
  }

  // Actions
  editUser(userId: string): void {
    console.log('Modifier l’utilisateur avec l’ID :', userId);
  }

  // Archiver ou désarchiver un utilisateur
archiveUser(userId: string): void {
  const user = this.users.find(u => u._id === userId);
  if (!user) return;

  const action = user.archived ? 'désarchiver' : 'archiver';
  const actionText = user.archived
    ? 'Voulez-vous vraiment désarchiver cet utilisateur ?'
    : 'Voulez-vous vraiment archiver cet utilisateur ?';

  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: actionText,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: `Oui, ${action} !`,
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      const archiveObservable = user.archived
        ? this.userService.unarchiveUser(userId)
        : this.userService.archiveUser(userId);

      archiveObservable.subscribe({
        next: () => {
          // Mettre à jour la valeur de `archived` dans la liste des utilisateurs
          user.archived = !user.archived;
          this.filterUsers(); // Re-filtrer la liste pour refléter les changements

          // Afficher une notification de succès
          Swal.fire({
            title: 'Succès !',
            text: `L'utilisateur a été ${action} avec succès.`,
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
        },
        error: (err) => {
          console.error(`Erreur lors de l'${action} de l'utilisateur`, err);

          // Afficher une notification d'erreur
          Swal.fire({
            title: 'Erreur !',
            text: `Une erreur s'est produite lors de l'${action} de l'utilisateur.`,
            icon: 'error',
            confirmButtonColor: '#3085d6'
          });
        }
      });
    }
  });
}
// Archiver les utilisateurs sélectionnés
archiveSelectedUsers(): void {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    html: `Vous allez archiver <strong>${this.selectedUsers.size}</strong> utilisateur(s)`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, archiver !',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      const archiveRequests = Array.from(this.selectedUsers).map(userId =>
        this.userService.archiveUser(userId).toPromise()
      );

      Promise.all(archiveRequests)
        .then(() => {
          // Mettre à jour les utilisateurs archivés
          this.users = this.users.map(user => {
            if (this.selectedUsers.has(user._id)) {
              return { ...user, archived: true };
            }
            return user;
          });

          this.selectedUsers.clear(); // Vider la sélection
          this.applyFilters(); // Re-appliquer les filtres

          // Afficher une notification de succès
          Swal.fire({
            title: 'Succès !',
            text: `${archiveRequests.length} utilisateur(s) archivé(s) avec succès.`,
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
        })
        .catch((err) => {
          console.error('Erreur lors de l\'archivage des utilisateurs', err);

          // Afficher une notification d'erreur
          Swal.fire({
            title: 'Erreur !',
            text: 'Une erreur s\'est produite lors de l\'archivage des utilisateurs.',
            icon: 'error',
            confirmButtonColor: '#3085d6'
          });
        });
    }
  });
}
}

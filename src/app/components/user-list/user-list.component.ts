import { Component, OnInit, viewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { AddUserComponent } from '../add-user/add-user.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { AssignationComponent } from '../assignation/assignation.component';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AddUserComponent,
    EditUserComponent,
    AssignationComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchQuery: string = '';
  archiveFilter: string = 'all';
  selectedUsers: Set<string> = new Set();
  roleFilter: string = 'all';
  selectedUserDetails: any = null;
  totalUsers: number = 0;
  activeUsers: number = 0;
  usersWithRFID: number = 0;
  showEditModal: boolean = false;
  selectedUser: any = null;
  showAssignationModal: boolean = false;
  selectedUserForAssignation: {
    _id: string;
    nom: string;
    prenom: string;
  } | null = null;

<<<<<<< HEAD
  userConnect:  {
    id: string;
    role: string;
    nom: string;
    prenom: string;
    photo: string;
  } | null = null;

  @ViewChild('addUserModal') addUserModal!: AddUserComponent;
  @ViewChild('editUserModal') editUserModal!: EditUserComponent;
  @ViewChild('assignationModal') assignationModal!: AssignationComponent;
=======
  readonly addUserModal = viewChild.required<AddUserComponent>('addUserModal');
  readonly editUserModal = viewChild.required<EditUserComponent>('editUserModal');
  readonly assignationModal = viewChild.required<AssignationComponent>('assignationModal');
>>>>>>> origin/testAmdy3

  constructor(private userService: UserService, private fb: FormBuilder, private loggingService: LoggingService) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.userConnect = JSON.parse(userData);
    }
    this.loadUsers();
  }

  openAssignationModal(user: { _id: string; nom: string; prenom: string }) {
    this.selectedUserForAssignation = user;
    this.showAssignationModal = true;
  }

  closeAssignationModal() {
    this.showAssignationModal = false;
    this.selectedUserForAssignation = null;
    this.loadUsers();
  }
  openAddUserModal() {
    this.addUserModal().openModal();
  }
  closeAddUserModal() {
<<<<<<< HEAD
    this.addUserModal.closeModal();
    this.loadUsers();
=======
    this.addUserModal().closeModal();
>>>>>>> origin/testAmdy3
  }

  openUserDetailsModal(user: any): void {
    this.selectedUserDetails = user;
  }

  closeUserDetailsModal(): void {
    this.selectedUserDetails = null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.totalUsers = this.users.length;
        this.activeUsers = this.users.filter((user) => !user.archived).length;
        this.usersWithRFID = this.users.filter(
          (user) => user.carteRFID !== null && user.carteRFID !== ''
        ).length;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
      },
    });
  }

  openEditModal(user: any): void {
    this.selectedUser = user;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.loadUsers();
  }

  onUserUpdated(updatedUser: any): void {
    this.users = this.users.map((user) =>
      user._id === updatedUser._id ? updatedUser : user
    );
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        user.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesArchiveFilter =
        this.archiveFilter === 'all' ||
        (this.archiveFilter === 'archived' && user.archived) ||
        (this.archiveFilter === 'nonArchived' && !user.archived);
      const matchesRoleFilter =
        this.roleFilter === 'all' || user.role === this.roleFilter;
      return matchesSearch && matchesArchiveFilter && matchesRoleFilter;
    });
    this.currentPage = 1;
  }

  get paginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  toggleUserSelection(userId: string): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedUsers.has(userId);
  }

  toggleAllUsers(): void {
    if (this.areAllUsersSelected()) {
      this.selectedUsers.clear();
    } else {
      this.paginatedUsers.forEach((user) => this.selectedUsers.add(user._id));
    }
  }

  areAllUsersSelected(): boolean {
    return this.paginatedUsers.every((user) =>
      this.selectedUsers.has(user._id)
    );
  }

  archiveUser(userId: string): void {
    const user = this.users.find((u) => u._id === userId);
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
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        const archiveObservable = user.archived
          ? this.userService.unarchiveUser(userId)
          : this.userService.archiveUser(userId);

        archiveObservable.subscribe({
          next: () => {

            if(this.userConnect != null ){
              this.loggingService.logAction(this.userConnect.id, 'archive', 'user', userId, `Utilisateur ${action}`);
            }

            user.archived = !user.archived;
            this.applyFilters();
            Swal.fire({
              title: 'Succès !',
              text: `L'utilisateur a été ${action} avec succès.`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
            });
          },
          error: (err) => {
            console.error(`Erreur lors de l'${action} de l'utilisateur`, err);
            Swal.fire({
              title: 'Erreur !',
              text: `Une erreur s'est produite lors de l'${action} de l'utilisateur.`,
              icon: 'error',
              confirmButtonColor: '#3085d6',
            });
          },
        });
      }
    });
  }

  archiveSelectedUsers(): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      html: `Vous allez archiver <strong>${this.selectedUsers.size}</strong> utilisateur(s)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, archiver !',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        const archiveRequests = Array.from(this.selectedUsers).map((userId) =>
          this.userService.archiveUser(userId).toPromise()
        );

        Promise.all(archiveRequests)
          .then(() => {
            this.users = this.users.map((user) => {
              if (this.selectedUsers.has(user._id)) {
                return { ...user, archived: true };
              }
              return user;
            });

            if(this.userConnect != null ){
              this.selectedUsers.forEach((userId) => {
                if (this.userConnect?.id) {
                  this.loggingService.logAction(this.userConnect.id, 'archive', 'user', userId, 'Utilisateur archivé');
                }
              });
            }

            this.selectedUsers.clear();
            this.applyFilters();

            Swal.fire({
              title: 'Succès !',
              text: `${archiveRequests.length} utilisateur(s) archivé(s) avec succès.`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
            });
          })
          .catch((err) => {
            console.error("Erreur lors de l'archivage des utilisateurs", err);
            Swal.fire({
              title: 'Erreur !',
              text: "Une erreur s'est produite lors de l'archivage des utilisateurs.",
              icon: 'error',
              confirmButtonColor: '#3085d6',
            });
          });
      }
    });
  }
  removeAssignation(user: any): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment désassigner la carte de cet utilisateur ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, désassigner !',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.removeCardFromUser(user._id).subscribe({
          next: () => {
            user.carteRFID = null;
            this.applyFilters();
            Swal.fire({
              title: 'Succès !',
              text: 'La carte a été désassignée avec succès.',
              icon: 'success',
              confirmButtonColor: '#3085d6',
            });
          },
          error: (err) => {
            console.error('Erreur lors de la désassignation de la carte', err);
            Swal.fire({
              title: 'Erreur !',
              text: "Une erreur s'est produite lors de la désassignation de la carte.",
              icon: 'error',
              confirmButtonColor: '#3085d6',
            });
          },
        });
      }
    });
  }
}

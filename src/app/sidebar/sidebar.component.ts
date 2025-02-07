import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoggingService } from '../services/logging.service';
import { UserDetailsModalComponent } from "../components/user-details-modal/user-details-modal.component";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, UserDetailsModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {

  user: { id: string, nom: string; prenom: string; photo: string, role: string } | null = null;

  constructor(
    private loggingService: LoggingService,
  ) {}

  @ViewChild('userDetailsModal') userDetailsModal!: UserDetailsModalComponent;
  


  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  logout(): void {
    if(this.user !== null) {
      this.loggingService.logLogout(this.user.id);

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Rediriger vers la page de connexion ou une autre page après la déconnexion
      window.location.href = '/login';
    }
    
  }
  

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
  openUserDetailsModal(): void {
    if (this.userDetailsModal) {
      this.userDetailsModal.openModal();
    }
  }

  closeUserDetailsModal(): void {
    if (this.userDetailsModal) {
      this.userDetailsModal.closeModal();
    }
  }
}

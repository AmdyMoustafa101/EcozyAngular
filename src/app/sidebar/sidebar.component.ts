import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  user: { nom: string; prenom: string; photo: string; role: string } | null =
    null;

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Rediriger vers la page de connexion ou une autre page après la déconnexion
    window.location.href = '/login';
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}

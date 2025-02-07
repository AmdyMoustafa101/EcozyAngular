import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Log, LoggingService } from '../../services/logging.service';
import { UserService } from '../../services/user.service';
import { PlanteService } from '../../services/plante.service';
import Swal from 'sweetalert2';

export interface EvenementArrosage {
  id: number;
  nomPlante: string;
  typeArrosage: 'Immediat' | 'Programme';
  horodatage: Date;
  user: string;
  statut: 'Termine' | 'EnCours' | 'EnAttente';
  details?: {
    volumeEau?: number;
    frequence?: string;
    humiditeSol?: number;
  };
}

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css'],
})
export class HistoriqueComponent implements OnInit {

  user:any ;
  historiqueAction: EvenementArrosage[] = [];
  evenementsFiltres: EvenementArrosage[] = [];
  connexion: number = 0;
  creation: number = 0;
  suppression: number = 0;
  logs: any;
  filteredLogs: any;
  selectedLog: Log | null = null;
  selectedUserId: string | null = null;
  users: any[] = [];
  plantes: any;
  expandedLogs: { [key: string]: boolean } = {};
  searchTerm: string = '';
  dateFilter: string = '';
  totalUsers: any;
  totalLogins: any;
  averageSessionTime: any;

  constructor(
    private logService: LoggingService,
    private userService: UserService,
    private planteService: PlanteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.majStatistiquesEvenements();
    this.loadLogs();
    this.loadUsers();
    this.loadPlantes();
  }

  loadLogs() {
    this.logService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.filteredLogs = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des logs', err);
      },
  })
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
      },
    });
  }

  loadPlantes(): void {
    this.planteService.getPlantes().subscribe({
      next: (data) => {
        this.plantes = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des plantes', err);
      },
    });
  }

  majStatistiquesEvenements() {
    this.evenementsFiltres = this.historiqueAction;
    console.log(this.evenementsFiltres);
    this.connexion = this.evenementsFiltres.length;
    this.creation = this.evenementsFiltres.filter(
      (e) => e.typeArrosage === 'Immediat'
    ).length;
    this.suppression = this.evenementsFiltres.filter(
      (e) => e.typeArrosage === 'Programme'
    ).length;
  }


  filtrerEvenements(event: Event) {
    const termRecherche = (
      event.target as HTMLInputElement
    ).value.toLowerCase();
    this.evenementsFiltres = this.historiqueAction.filter((e) =>
      e.nomPlante.toLowerCase().includes(termRecherche)
    );
    this.majStatistiquesEvenements();
  }
  filtrerParType(event: Event) {
    const type = (event.target as HTMLSelectElement).value;
    this.evenementsFiltres = type
      ? this.historiqueAction.filter((e) => e.typeArrosage === type)
      : this.historiqueAction;
    this.majStatistiquesEvenements();
  }

  afficherDetails(event: EvenementArrosage) {
    alert(
      `Détails pour l'événement ID ${event.id}:\n${JSON.stringify(
        event.details,
        null,
        2
      )}`
    );
  }

  filtrerLogs() {
    const term = this.searchTerm.toLowerCase();
    const date = this.dateFilter;
    this.filteredLogs = this.logs.filter((log: Log) => {
      const user: any = this.getUserDetails(log.userId);
      return (
      user &&
      (user.prenom.toLowerCase().includes(term) ||
        user.nom.toLowerCase().includes(term) ||
        user.telephone.toLowerCase().includes(term)) &&
      (date ? new Date(log.loginTime).toISOString().split('T')[0] === date || new Date(log.logoutTime).toISOString().split('T')[0] === date : true)
      );
    });
  }

  navigateToDetails(log: any) {
    
    if(log.actions != null && log.actions.length > 0) {
      const userId = log.userId;
      const entityId = log.actions[0].entityId;
      const date = log.loginTime;
      console.log(date);
      this.router.navigate(['/details', userId, entityId, date]);
    } else {
      Swal.fire("Cette Utilisateur n'a fait aucune action");
      return;
    }
  }
  getUserDetails(userId: string): any {
    this.user = this.users.find((user: { _id: string }) => user._id === userId);
    return this.user;
   
  }

}

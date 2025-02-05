import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EvenementArrosage {
  id: number;
  nomPlante: string;
  typeArrosage: 'Immediat' | 'Programme';
  horodatage: Date;
  user: string; // Ajout de la propriété user
  statut: 'Termine' | 'EnCours' | 'EnAttente';
  details?: {
    volumeEau?: number; // Volume d'eau pour les arrosages programmés
    frequence?: string; // Fréquence d'arrosage
    humiditeSol?: number; // Humidité du sol
  };
}

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css'],
})
export class HistoriqueComponent implements OnInit {
  private evenementsArrosage: EvenementArrosage[] = [
    {
      id: 1,
      nomPlante: 'Basilic',
      typeArrosage: 'Immediat',
      horodatage: new Date('2024-02-01T10:30:00'),
      user: 'Alice',
      statut: 'Termine',
    },
    {
      id: 2,
      nomPlante: 'Tomates',
      typeArrosage: 'Programme',
      horodatage: new Date('2024-02-02T14:45:00'),
      user: 'Bob',
      statut: 'EnCours',
      details: {
        volumeEau: 5,
        frequence: '2 fois par jour',
        humiditeSol: 30,
      },
    },
    {
      id: 3,
      nomPlante: 'Orchidée',
      typeArrosage: 'Programme',
      horodatage: new Date('2024-02-03T08:15:00'),
      user: 'Charlie',
      statut: 'EnAttente',
      details: {
        volumeEau: 2,
        frequence: '1 fois par jour',
        humiditeSol: 40,
      },
    },
  ];

  evenementsFiltres: EvenementArrosage[] = [];
  totalEvenements: number = 0;
  evenementsImmediat: number = 0;
  evenementsProgrammes: number = 0;

  ngOnInit() {
    this.majStatistiquesEvenements();
  }

  majStatistiquesEvenements() {
    this.evenementsFiltres = this.evenementsArrosage;
    this.totalEvenements = this.evenementsFiltres.length;
    this.evenementsImmediat = this.evenementsFiltres.filter(
      (e) => e.typeArrosage === 'Immediat'
    ).length;
    this.evenementsProgrammes = this.evenementsFiltres.filter(
      (e) => e.typeArrosage === 'Programme'
    ).length;
  }

  filtrerEvenements(event: Event) {
    const termRecherche = (
      event.target as HTMLInputElement
    ).value.toLowerCase();
    this.evenementsFiltres = this.evenementsArrosage.filter((e) =>
      e.nomPlante.toLowerCase().includes(termRecherche)
    );
    this.majStatistiquesEvenements();
  }

  filtrerParType(event: Event) {
    const type = (event.target as HTMLSelectElement).value;
    this.evenementsFiltres = type
      ? this.evenementsArrosage.filter((e) => e.typeArrosage === type)
      : this.evenementsArrosage;
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
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assignation',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './assignation.component.html',
  styleUrls: ['./assignation.component.css'],
})
export class AssignationComponent {
  @Input() user: { nom: string; prenom: string } | null = null; // Reçoit les données de l'utilisateur
  @Output() closeModal = new EventEmitter<void>(); // Émet un événement pour fermer le modal

  assignCard() {
    // Logique pour assigner la carte RFID
    console.log('Carte RFID assignée pour :', this.user);
    this.closeModal.emit(); // Ferme le modal après l'assignation
  }
}

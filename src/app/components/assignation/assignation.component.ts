import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assignation',
  imports: [CommonModule],
  templateUrl: './assignation.component.html',
  styleUrls: ['./assignation.component.css'],
})
export class AssignationComponent implements OnInit, OnDestroy {
  @Input() user: { _id: string; nom: string; prenom: string } | null = null;
  @Output() closeModal = new EventEmitter<void>();

  rfidValue: string = '';
  errorMessage: string = ''; // Ajout d'une propriété pour stocker le message d'erreur
  private socket!: WebSocket;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.socket = new WebSocket('ws://localhost:8000');

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'rfid') {
        this.rfidValue = data.value;
      }
    };

    this.socket.onopen = () => {
      console.log('Connexion WebSocket ouverte');
    };

    this.socket.onclose = () => {
      console.log('Connexion WebSocket fermée');
    };
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  assignCard(): void {
    if (this.user && this.rfidValue) {
      console.log('Assigning RFID:', {
        userId: this.user._id,
        carteRFID: this.rfidValue,
      });
      this.userService
        .assignRfidToUser(this.user._id, this.rfidValue)
        .subscribe(
          (response) => {
            console.log('Carte RFID assignée avec succès', response);
            this.closeModal.emit();
          },
          (error) => {
            console.error(
              "Erreur lors de l'assignation de la carte RFID",
              error
            );
            if (error.status === 400 && error.error && error.error.message) {
              // Vérifiez si le message d'erreur contient "déjà assignée"
              if (error.error.message.includes('déjà assignée')) {
                this.errorMessage = 'Carte déjà assignée';
              } else {
                this.errorMessage = error.error.message || 'Erreur inconnue';
              }
            } else {
              this.errorMessage = 'Erreur inconnue';
            }
          }
        );
    } else {
      this.errorMessage = 'Utilisateur ou valeur RFID non valide';
    }
  }
}

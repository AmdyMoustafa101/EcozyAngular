import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service'; // Assurez-vous que le chemin est correct
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-assignation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './assignation.component.html',
  styleUrls: ['./assignation.component.css'],
})
export class AssignationComponent implements OnInit, OnDestroy {
  @Input() user: { _id: string; nom: string; prenom: string } | null = null;
  @Output() closeModal = new EventEmitter<void>();

  rfidValue: string = '';
  private socket!: WebSocket;

  userConnect:  {
    id: string,
    role: string,
    nom: string,
    prenom: string,
    photo: string,
  } | null = null;

  constructor(private userService: UserService, private loggingService: LoggingService) {}

  ngOnInit(): void {

    const userData = localStorage.getItem('user');
    if (userData) {
      this.userConnect = JSON.parse(userData);
    }

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
      this.userService
        .assignRfidToUser(this.user._id, this.rfidValue)
        .subscribe(
          (response) => {
            console.log('Carte RFID assignée avec succès', response);
            if (this.userConnect != null && this.user != null) {
              this.loggingService.logAction(this.userConnect.id, 'assignation', 'user', this.user._id, `Assignation de la carte RFID ${this.rfidValue}`);
            } 
            
            // Fermeture du modal
            
            window.location.reload();
            this.closeModal.emit();
          },
          (error) => {
            console.error(
              "Erreur lors de l'assignation de la carte RFID",
              error
            );
          }
        );
    } else {
      console.error('Utilisateur ou valeur RFID non valide');
    }
  }
}

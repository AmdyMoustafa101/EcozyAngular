import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-authentification',
  imports: [CommonModule, FormsModule],
  templateUrl: './authentification.component.html',
  styleUrl: './authentification.component.css',
})
export class AuthentificationComponent {
  codeBoxes: string[] = ['', '', '', '']; // Tableau pour stocker les valeurs des inputs
  errorMessage: string | null = null; // Message d'erreur
  code: string[] = ['', '', '', '']; // Code réel
  maskedCode: string[] = ['', '', '', '']; // Masque des champs (points noirs)

  constructor() {}

  /*onInit(): void {
     // Écoute des données reçues
     this.socketSubscription = this.codeService.getMessages().subscribe((message) => {
      if (message.type === 'keypad') {
        const char = message.value;
        //console.log(message.value);
        this.showModal = true;
        this.addCharacterToCode(char);
      }
    });
  }*/

  // Fonction appelée à chaque saisie dans un champ
  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Limite la saisie à un seul chiffre
    if (value.length > 1) {
      input.value = value.slice(0, 1);
      this.codeBoxes[index] = value.slice(0, 1);
    }

    // Passe au champ suivant si un chiffre est saisi
    if (value.length === 1 && index < this.codeBoxes.length - 1) {
      const nextInput = document.querySelector(
        `.code-input input:nth-child(${index + 2})`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  // Fonction pour gérer la suppression avec la touche Backspace
  onBackspace(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && index > 0 && !this.codeBoxes[index]) {
      const prevInput = document.querySelector(
        `.code-input input:nth-child(${index})`
      ) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  // Fonction pour valider le code (optionnelle)
  validateCode(): void {
    const code = this.codeBoxes.join('');
    if (code.length === 4) {
      console.log('Code saisi :', code);
      // Ajoutez ici la logique de validation du code
    } else {
      this.errorMessage = 'Code incomplet';
    }
  }
}

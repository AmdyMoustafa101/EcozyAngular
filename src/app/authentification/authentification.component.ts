import { CommonModule } from '@angular/common';
import { Component, QueryList, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import Swal from 'sweetalert2';
import { WebsocketService } from '../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-authentification',
  imports: [CommonModule],
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.css'],
})
export class AuthentificationComponent implements AfterViewInit {
  code: string[] = ['', '', '', ''];
  maskedCode: string[] = ['', '', '', ''];
  errorMessage: string = '';
  errorMessageCode: string = '';
  private wsSubscription!: Subscription;
  currentIndex: number = 0; // index du prochain input à remplir

  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private authService: AuthServiceService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    // Écoute des messages WebSocket et traitement caractère par caractère.
    this.wsSubscription = this.websocketService.getMessages().subscribe({
      next: (msg: any) => {
        console.log('Message reçu du serveur:', msg);
        // Supposons que msg contient directement le caractère (ex: '5')
        this.processWsCharacter(msg.value);
      },
      error: (err) => console.error('Erreur WebSocket:', err),
      complete: () => console.log('Connexion WebSocket fermée')
    });
  }

  ngAfterViewInit(): void {
    this.focusFirstInput();
  }

  focusFirstInput() {
    setTimeout(() => {
      const firstInput = this.codeInputs.first;
      if (firstInput) {
        firstInput.nativeElement.focus();
      }
    }, 100);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
  
    // Vérifier si l'entrée est un nombre
    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.code[index] = '';
      this.maskedCode[index] = '';
      return;
    }
  
    if (value.length > 1) {
      value = value.slice(-1);
    }
  
    this.code[index] = value;
    this.maskedCode[index] = value;
  
    if (value) {
      setTimeout(() => {
        if (this.code[index] === value) { // Vérifie que le champ n'a pas été réinitialisé
          this.maskedCode[index] = '•';
          input.value = '•';
        }
      }, 100);
  
      if (index < this.code.length - 1) {
        setTimeout(() => {
          const nextInput = this.codeInputs.toArray()[index + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
          }
        });
      }
    }
  
    if (this.code.every((digit) => digit !== '')) {
      this.verifyCode();
    }
  }
  
  handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && index > 0 && !this.code[index]) {
      const prevInput = this.codeInputs.toArray()[index - 1];
      if (prevInput) {
        prevInput.nativeElement.value = '';
        this.code[index - 1] = '';
        this.maskedCode[index - 1] = '';
        // On remet à jour l'index courant pour la saisie manuelle ou WS
        this.currentIndex = index - 1;
        prevInput.nativeElement.focus();
      }
    }
  }

  verifyCode(): void {
    const enteredCode = this.code.join('');
    this.authService.login(enteredCode).subscribe({
      next: (response: any) => {
        if (response.message) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', response.user);
          this.router.navigate(['/users']);
        } else {
          this.handleInvalidCode();
          Swal.fire({
            title: 'Erreur!',
            text: 'Code Incorrecte',
            icon: 'error',
          });
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.errorMessageCode = 'Code Incorrecte';
        this.handleInvalidCode();
      }
    });
  }

  handleInvalidCode(): void {
    this.code = ['', '', '', ''];
    this.maskedCode = ['', '', '', ''];
    this.currentIndex = 0; // Réinitialiser l'index de saisie
  
    // Réinitialiser chaque input individuellement
    this.codeInputs.forEach((input: ElementRef) => {
      if (input && input.nativeElement) {
        input.nativeElement.value = '';
      }
    });
  
    // Attendre que le DOM soit mis à jour
    requestAnimationFrame(() => {
      this.focusFirstInput();
    });
  }
  
  /**
   * Traite un caractère reçu via le WebSocket.
   */
  processWsCharacter(char: string): void {
    // Vérifier que le caractère est un chiffre (ou le cas échéant, adaptez la regex)
    if (!/^\d$/.test(char)) {
      return;
    }

    // Vérifier que nous avons encore des inputs disponibles
    if (this.currentIndex < this.code.length) {
      // Mise à jour des tableaux
      this.code[this.currentIndex] = char;
      this.maskedCode[this.currentIndex] = char;
      
      // Récupération de l'input correspondant
      const inputElement = this.codeInputs.toArray()[this.currentIndex];
      if (inputElement) {
        // Afficher le caractère
        inputElement.nativeElement.value = char;
        // Après un délai, masquer le caractère
        setTimeout(() => {
          // S'assurer que la valeur n'a pas été modifiée entre temps
          if (this.code[this.currentIndex] === char) {
            this.maskedCode[this.currentIndex] = '•';
            inputElement.nativeElement.value = '•';
          }
        }, 100);
      }
      
      this.currentIndex++;

      // Focus sur le prochain input s'il existe
      if (this.currentIndex < this.code.length) {
        const nextInput = this.codeInputs.toArray()[this.currentIndex];
        if (nextInput) {
          nextInput.nativeElement.focus();
        }
      } else {
        // Si tous les inputs sont remplis, on peut lancer la vérification
        if (this.code.every(digit => digit !== '')) {
          this.verifyCode();
        }
      }
    }
  }
}

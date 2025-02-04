import { CommonModule } from '@angular/common';
import { Component, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-authentification',
  imports: [CommonModule],
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.css'],
})
export class AuthentificationComponent {
  code: string[] = ['', '', '', '']; // Tableau pour stocker les valeurs des inputs
  maskedCode: string[] = ['', '', '', '']; // Tableau pour masquer les valeurs saisies
  errorMessage: string = '';
  
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>; // Référence aux inputs HTML


  constructor(private router: Router, private authService: AuthServiceService) {}

  // Fonction trackBy pour différencier chaque input par son index
  trackByIndex(index: number, item: any): number {
    return index;
  }

  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Vérifier si l'entrée est un nombre
    if (!/^\d*$/.test(value)) {
      input.value = '';
      return;
    }

    if (value.length > 1) {
      value = value.slice(-1);
    }
  
    this.code[index] = value;
    this.maskedCode[index] = value;
  
    if (value) {
      setTimeout(() => {
        this.maskedCode[index] = '•';
        input.value = '•';
      }, 500);
  
      // Déplacer le focus de manière asynchrone
      if (index < this.code.length - 1) {
        setTimeout(() => {
          const nextInput = this.codeInputs.toArray()[index + 1];
          nextInput.nativeElement.focus();
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
      prevInput?.nativeElement.focus();
    }
  }

  verifyCode(): void {
    const enteredCode = this.code.join('');
    console.log('Code complet saisi :', enteredCode);

    // Ajoutez ici votre logique pour vérifier le code
    this.authService.login(enteredCode).subscribe(
      (response: any) => {
        if (response.message) {
          this.router.navigate(['/users']);
        } else {
          console.error('Code verification failed', response);
          this.errorMessage = 'Code Incorrect';
        }
      },
      (error) => {
        console.error('API error:', error);
      }
    );
  }
}

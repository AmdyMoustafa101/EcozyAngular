import { CommonModule } from '@angular/common';
import {
  Component,
  QueryList,
  ViewChildren,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
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
export class AuthentificationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  code: string[] = ['', '', '', ''];
  maskedCode: string[] = ['', '', '', ''];
  errorMessage: string = '';
  errorMessageCode: string = '';
  private wsSubscription!: Subscription;
  currentIndex: number = 0;
  rfidValue: string = ''; // Variable pour stocker la valeur RFID

  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private authService: AuthServiceService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.wsSubscription = this.websocketService.getMessages().subscribe({
      next: (msg: any) => {
        console.log('Message reçu du serveur:', msg);
        if (msg.type === 'rfid') {
          this.rfidValue = msg.value;
          this.verifyRfid();
        } else {
          this.processWsCharacter(msg.value);
        }
      },
      error: (err) => console.error('Erreur WebSocket:', err),
      complete: () => console.log('Connexion WebSocket fermée'),
    });
  }

  ngAfterViewInit(): void {
    this.focusFirstInput();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
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
        if (this.code[index] === value) {
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
          localStorage.setItem('user', JSON.stringify(response.user));
          this.router.navigate(['/dashboard']);
        } else {
          this.handleInvalidCode();
          Swal.fire({
            title: 'Erreur!',
            text: 'Code Incorrect',
            icon: 'error',
          });
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.errorMessageCode = 'Code Incorrect';
        this.handleInvalidCode();
      },
    });
  }

  verifyRfid(): void {
    this.authService.loginWithRfid(this.rfidValue).subscribe({
      next: (response: any) => {
        if (response.message) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.router.navigate(['/dashboard']);
        } else {
          Swal.fire({
            title: 'Erreur!',
            text: 'Carte RFID Incorrecte',
            icon: 'error',
          });
        }
      },
      error: (error) => {
        console.error('API error:', error);
        Swal.fire({
          title: 'Erreur!',
          text: 'Carte RFID Incorrecte',
          icon: 'error',
        });
      },
    });
  }

  handleInvalidCode(): void {
    this.code = ['', '', '', ''];
    this.maskedCode = ['', '', '', ''];
    this.currentIndex = 0;

    this.codeInputs.forEach((input: ElementRef) => {
      if (input && input.nativeElement) {
        input.nativeElement.value = '';
      }
    });

    requestAnimationFrame(() => {
      this.focusFirstInput();
    });
  }

  processWsCharacter(char: string): void {
    if (!/^\d$/.test(char)) {
      return;
    }

    if (this.currentIndex < this.code.length) {
      this.code[this.currentIndex] = char;
      this.maskedCode[this.currentIndex] = char;

      const inputElement = this.codeInputs.toArray()[this.currentIndex];
      if (inputElement) {
        inputElement.nativeElement.value = char;
        setTimeout(() => {
          if (this.code[this.currentIndex] === char) {
            this.maskedCode[this.currentIndex] = '•';
            inputElement.nativeElement.value = '•';
          }
        }, 100);
      }

      this.currentIndex++;

      if (this.currentIndex < this.code.length) {
        const nextInput = this.codeInputs.toArray()[this.currentIndex];
        if (nextInput) {
          nextInput.nativeElement.focus();
        }
      } else {
        if (this.code.every((digit) => digit !== '')) {
          this.verifyCode();
        }
      }
    }
  }
}

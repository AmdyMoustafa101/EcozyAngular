import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-arrosage-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './arrosage-modal.component.html',
  styleUrls: ['./arrosage-modal.component.css'],
})
export class ArrosageModalComponent {
  @Output() close = new EventEmitter<void>();

  isOpen = false;
  startDate: string = '';
  endDate: string = '';
  firstTime: string = '';
  secondTime: string = '';

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  onSubmit() {
    // Gérer la soumission du formulaire
    console.log('Formulaire soumis', {
      startDate: this.startDate,
      endDate: this.endDate,
      firstTime: this.firstTime,
      secondTime: this.secondTime,
    });
    this.closeModal();
  }
}

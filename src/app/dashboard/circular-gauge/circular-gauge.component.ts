import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faTint, faSun, faTintSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-circular-gauge',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './circular-gauge.component.html',
  styleUrls: ['./circular-gauge.component.css'],
})
export class CircularGaugeComponent {
  @Input() value: number = 0;
  @Input() title: string = '';
  @Input() color: string = '#000';

  // Icônes FontAwesome
  faTint = faTint;
  faSun = faSun;
  faTintSlash = faTintSlash;

  getIcon() {
    switch (this.title) {
      case 'Humidité':
        return this.faTint;
      case 'Luminosité':
        return this.faSun;
      case "Niveau d'eau":
        return this.faTintSlash;
      default:
        return this.faTint;
    }
  }
}

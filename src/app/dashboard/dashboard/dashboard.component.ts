import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { addWeeks, startOfWeek, format, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CommonModule } from '@angular/common';
import { CircularGaugeComponent } from '../circular-gauge/circular-gauge.component';
import { ArrosageModalComponent } from '../arrosage-modal/arrosage-modal.component';
import { ProgrammeDetailsComponent } from '../../components/programme-details/programme-details.component';
import { ProgrammeArrosageService } from '../../services/programme-arrosage.service';
import { SensorService } from '../../services/sensor.service';

Chart.register(...registerables);

@Component({
  standalone: true,
  imports: [CommonModule, CircularGaugeComponent, ArrosageModalComponent, ProgrammeDetailsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit, OnInit {
  chart: any;
  currentDate: Date = new Date();
  weekDates: { date: Date; dayName: string }[] = [];
  isArrosageModalOpen = false;

  programmeEnCours: any = null;
  showProgrammeDetails: boolean = false;

  humidity = 0;
  brightness = 0;

  constructor(private programmeArrosageService: ProgrammeArrosageService, private sensorService: SensorService) {
    this.updateWeekDates();
  }

  @ViewChild('arrosageModal') arrosageModal!: ArrosageModalComponent;
  @ViewChild('programmeDetailsModal') programmeDetailsModal!: ProgrammeDetailsComponent;

  ngOnInit() {
    this.checkProgrammeEnCours();
    this.fetchSensorData();
  }

  checkProgrammeEnCours() {
    this.programmeArrosageService.getProgrammeEnCours().subscribe(
      (programme) => {
        this.programmeEnCours = programme;
      },
      (error) => {
        console.error('Erreur lors de la récupération du programme en cours', error);
      }
    );
  }

  openArrosageModal() {
    this.arrosageModal.openModal();
  }

  onModalClose() {
    console.log('Modal fermé');
    this.checkProgrammeEnCours(); // Vérifiez à nouveau après la fermeture du modal
  }

  openProgrammeDetails() {
    this.programmeDetailsModal.openModal();
  }

  ngAfterViewInit() {
    this.createChart();
  }

 

  updateWeekDates() {
    const start = startOfWeek(this.currentDate, { locale: fr });
    this.weekDates = eachDayOfInterval({
      start,
      end: addWeeks(start, 1),
    })
      .slice(0, 7)
      .map((date) => ({
        date,
        dayName: format(date, 'EEE', { locale: fr }),
      }));
  }

  changeWeek(weeks: number) {
    this.currentDate = addWeeks(this.currentDate, weeks);
    this.updateWeekDates();
    this.updateChart();
  }

  createChart() {
    this.chart = new Chart('chart', {
      type: 'line',
      data: this.getChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100 } },
      },
    });
  }

  updateChart() {
    if (this.chart) {
      this.chart.data = this.getChartData();
      this.chart.update();
    }
  }

  getChartData() {
    return {
      labels: this.weekDates.map((d) => d.dayName),
      datasets: [
        {
          label: 'Humidité',
          data: Array.from({ length: 7 }, () => this.humidity),
          borderColor: '#4CAF50',
          tension: 0.4,
        },
        {
          label: 'Luminosité',
          data: Array.from({ length: 7 }, () => this.brightness),
          borderColor: '#FFC107',
          tension: 0.4,
        },
      ],
    };
  }

  fetchSensorData() {
    this.sensorService.getSensorData().subscribe((data) => {
      this.humidity = data.humidity;
      this.brightness = data.brightness;
      this.updateChart();
    });
  }
}

import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { addWeeks, startOfWeek, format, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CommonModule } from '@angular/common';
import { CircularGaugeComponent } from '../circular-gauge/circular-gauge.component';
import { ArrosageModalComponent } from '../arrosage-modal/arrosage-modal.component';
import { ProgrammeDetailsComponent } from '../../components/programme-details/programme-details.component';
import { ProgrammeArrosageService } from '../../services/programme-arrosage.service';
import { SensorService } from '../../services/sensor.service';
import { AverageStoreService } from '../../services/average-store.service';
import { Subscription } from 'rxjs';
import { LoggingService } from '../../services/logging.service';

Chart.register(...registerables);

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CircularGaugeComponent,
    ArrosageModalComponent,
    ProgrammeDetailsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit, OnInit, OnDestroy {
  currentState: 'ON' | 'OFF' = 'OFF';
  chart: any;
  currentDate: Date = new Date();
  weekDates: { date: Date; dayName: string }[] = [];
  isArrosageModalOpen = false;
  overallAverages: number[] = [];
  programmeEnCours: any = null;
  showProgrammeDetails: boolean = false;

  userConnect: {
    id: string;
    role: string;
    nom: string;
    prenom: string;
    photo: string;
  } | null = null;

  humidity = 0;
  brightness = 0;
  waterlevel = 0;

  humidityAverages: number[] = [];
  brightnessAverages: number[] = [];

  private sensorDataSubscription: Subscription | null = null;
  private averagesSubscription: Subscription | null = null;

  constructor(
    private programmeArrosageService: ProgrammeArrosageService,
    private sensorService: SensorService,
    private averageStoreService: AverageStoreService,
    private LoggingService: LoggingService
  ) {
    this.updateWeekDates();
  }

  @ViewChild('arrosageModal') arrosageModal!: ArrosageModalComponent;
  @ViewChild('programmeDetailsModal')
  programmeDetailsModal!: ProgrammeDetailsComponent;

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.userConnect = JSON.parse(userData);
    }

    this.checkProgrammeEnCours();
    this.fetchSensorData();

    this.averagesSubscription =
      this.averageStoreService.overallAverages$.subscribe((averages) => {
        this.overallAverages = averages;
        this.updateChartData();
      });

    this.sensorDataSubscription = this.sensorService
      .onSensorData()
      .subscribe((data) => {
        this.humidity = data.humidity;
        this.brightness = data.brightness;
        this.waterlevel = data.waterlevel;
        this.updateChartData();
      });

    this.fetchAverages();
  }

  ngOnDestroy() {
    if (this.sensorDataSubscription) {
      this.sensorDataSubscription.unsubscribe();
    }
    if (this.averagesSubscription) {
      this.averagesSubscription.unsubscribe();
    }
  }

  checkProgrammeEnCours() {
    this.programmeArrosageService.getProgrammeEnCours().subscribe(
      (programme) => {
        this.programmeEnCours = programme;
      },
      (error) => {
        console.error(
          'Erreur lors de la récupération du programme en cours',
          error
        );
      }
    );
  }

  openArrosageModal() {
    this.arrosageModal.openModal();
  }

  onModalClose() {
    this.checkProgrammeEnCours();
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
    this.fetchAverages();
    this.updateChartData();
  }

  createChart() {
    const ctx = (
      document.getElementById('chart') as HTMLCanvasElement
    ).getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: this.getChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { min: 0, max: 100 } },
        },
      });
    } else {
      console.error('Failed to get 2D context');
    }
  }

  updateChartData() {
    if (this.chart) {
      this.chart.data.datasets[0].data = this.humidityAverages;
      this.chart.data.datasets[1].data = this.brightnessAverages;

      this.chart.update();
    }
  }

  getChartData() {
    return {
      labels: this.weekDates.map((d) => d.dayName),
      datasets: [
        {
          label: 'Humidité',
          data: this.humidityAverages,
          borderColor: '#4CAF50',
          tension: 0.4,
        },
        {
          label: 'Luminosité',
          data: this.brightnessAverages,
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
      this.waterlevel = data.waterlevel;
      this.updateChartData();
    });
  }

  fetchAverages() {
    const averagesPromises = this.weekDates.map((day) => {
      const date = format(day.date, 'yyyy-MM-dd');
      return this.sensorService
        .getAverages(date)
        .toPromise()
        .catch(() => null); // Retourne null en cas d'erreur
    });

    Promise.all(averagesPromises)
      .then((results) => {
        const humidityAverages: number[] = [];
        const brightnessAverages: number[] = [];

        results.forEach((data) => {
          if (
            data &&
            data.overallAverage &&
            typeof data.overallAverage === 'object'
          ) {
            humidityAverages.push(data.overallAverage.humidity);
            brightnessAverages.push(data.overallAverage.brightness);
          } else {
            humidityAverages.push(0);
            brightnessAverages.push(0);
          }
        });

        this.humidityAverages = humidityAverages;
        this.brightnessAverages = brightnessAverages;
        this.updateChartData();
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des moyennes :', error);
      });
  }

  toggleState(): void {
    this.currentState = this.currentState === 'OFF' ? 'ON' : 'OFF';
    this.sensorService.arroser({ command: this.currentState }).subscribe({
      next: (response) => {
        if (this.userConnect !== null) {
          this.LoggingService.logAction(
            this.userConnect.id,
            'arroser',
            'pompe',
            'null',
            this.currentState
          );
        }
        console.log('Réponse de l’API :', response);
      },
      error: (error) => {
        console.error('Erreur lors de l’envoi à l’API :', error);
      },
    });
  }
}

import {
  Component,
  AfterViewInit,
  OnInit,
  ViewChild,
  OnDestroy,
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
  chart: any;
  currentDate: Date = new Date();
  weekDates: { date: Date; dayName: string }[] = [];
  isArrosageModalOpen = false;

  programmeEnCours: any = null;
  showProgrammeDetails: boolean = false;

  humidity = 0;
  brightness = 0;

  humidityAverages: number[] = [];
  brightnessAverages: number[] = [];

  private sensorDataSubscription: Subscription | null = null;
  private averagesSubscription: Subscription | null = null;

  constructor(
    private programmeArrosageService: ProgrammeArrosageService,
    private sensorService: SensorService,
    private averageStoreService: AverageStoreService
  ) {
    this.updateWeekDates();
  }

  @ViewChild('arrosageModal') arrosageModal!: ArrosageModalComponent;
  @ViewChild('programmeDetailsModal')
  programmeDetailsModal!: ProgrammeDetailsComponent;

  ngOnInit() {
    this.checkProgrammeEnCours();
    this.fetchSensorData();

    this.averagesSubscription =
      this.averageStoreService.humidityAverages$.subscribe((averages) => {
        this.humidityAverages = averages;
        this.updateChart();
      });

    this.averageStoreService.brightnessAverages$.subscribe((averages) => {
      this.brightnessAverages = averages;
      this.updateChart();
    });

    this.sensorDataSubscription = this.sensorService
      .onSensorData()
      .subscribe((data) => {
        this.humidity = data.humidity;
        this.brightness = data.brightness;
        this.updateChart();
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
      this.updateChart();
    });
  }

  fetchAverages() {
    const startDate = format(this.weekDates[0].date, 'yyyy-MM-dd');
    const endDate = format(this.weekDates[6].date, 'yyyy-MM-dd');

    const averagesPromises = this.weekDates.map((day) => {
      const date = format(day.date, 'yyyy-MM-dd');
      return this.sensorService.getAverages(date).toPromise();
    });

    Promise.all(averagesPromises)
      .then((results) => {
        const humidityAverages: number[] = [];
        const brightnessAverages: number[] = [];

        results.forEach((data) => {
          if (data && data.overallAverage) {
            humidityAverages.push(data.overallAverage.humidity);
            brightnessAverages.push(data.overallAverage.brightness);
          } else {
            humidityAverages.push(0);
            brightnessAverages.push(0);
          }
        });

        this.averageStoreService.setAverages(
          humidityAverages,
          brightnessAverages
        );
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des moyennes :', error);
      });
  }
}

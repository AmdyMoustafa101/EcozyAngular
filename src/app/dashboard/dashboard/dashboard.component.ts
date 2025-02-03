import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { addWeeks, startOfWeek, format, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CommonModule } from '@angular/common';
import { CircularGaugeComponent } from '../circular-gauge/circular-gauge.component';
import { ArrosageModalComponent } from '../arrosage-modal/arrosage-modal.component';

Chart.register(...registerables);

@Component({
  standalone: true,
  imports: [CommonModule, CircularGaugeComponent, ArrosageModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit {
  chart: any;
  currentDate: Date = new Date();
  weekDates: { date: Date; dayName: string }[] = [];

  constructor() {
    this.updateWeekDates();
  }

  @ViewChild('arrosageModal') arrosageModal!: ArrosageModalComponent;

  openArrosageModal() {
    this.arrosageModal.openModal();
  }

  onModalClose() {
    console.log('Modal fermé');
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
          data: Array.from({ length: 7 }, () =>
            Math.floor(Math.random() * 100)
          ),
          borderColor: '#4CAF50',
          tension: 0.4,
        },
        {
          label: 'Luminosité',
          data: Array.from({ length: 7 }, () =>
            Math.floor(Math.random() * 100)
          ),
          borderColor: '#FFC107',
          tension: 0.4,
        },
      ],
    };
  }
}

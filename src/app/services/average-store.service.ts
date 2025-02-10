import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AverageStoreService {
  private humidityAverages = new BehaviorSubject<number[]>([]);
  private brightnessAverages = new BehaviorSubject<number[]>([]);

  humidityAverages$ = this.humidityAverages.asObservable();
  brightnessAverages$ = this.brightnessAverages.asObservable();

  setAverages(humidityAverages: number[], brightnessAverages: number[]) {
    this.humidityAverages.next(humidityAverages);
    this.brightnessAverages.next(brightnessAverages);
  }
}

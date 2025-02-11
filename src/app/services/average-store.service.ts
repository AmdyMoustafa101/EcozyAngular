import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AverageStoreService {
  private overallAveragesSubject = new BehaviorSubject<number[]>([]);
  overallAverages$ = this.overallAveragesSubject.asObservable();

  setOverallAverages(averages: number[]) {
    this.overallAveragesSubject.next(averages);
  }
}

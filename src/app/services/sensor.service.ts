import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private apiUrl = 'http://localhost:3002/api';

  constructor(private http: HttpClient) {}

  getSensorData(): Observable<{ humidity: number; brightness: number }> {
    return this.http.get<{ humidity: number; brightness: number }>(`${this.apiUrl}/sensor-data`);
  }

  arroser(command: any): Observable<any> {
    console.log('command: ', command);
    return this.http.post<any>(`${this.apiUrl}/control-pump`, { command });
  }
}
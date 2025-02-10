import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private apiUrl = 'http://localhost:3002/api/sensor-data';
  private averagesUrl = 'http://localhost:3002/api/averages';
  private socket: Socket;
  private sensorDataSubject = new Subject<{
    humidity: number;
    brightness: number;
  }>();

  constructor(private http: HttpClient) {
    this.socket = io('http://192.168.1.25:3002');

    this.socket.on(
      'sensor-data',
      (data: { humidity: number; brightness: number }) => {
        this.sensorDataSubject.next(data);
      }
    );
  }

  getSensorData(): Observable<{ humidity: number; brightness: number }> {
    return this.http.get<{ humidity: number; brightness: number }>(
      `${this.apiUrl}/sensor-data`
    );
  }

  arroser(command: any): Observable<any> {
    console.log('command: ', command);
    return this.http.post<any>(`${this.apiUrl}/control-pump`, { command });
  }

  onSensorData(): Observable<{ humidity: number; brightness: number }> {
    return this.sensorDataSubject.asObservable();
  }

  getAverages(date: string): Observable<{
    date: string;
    overallAverage: { humidity: number; brightness: number };
  }> {
    const params = { date };
    return this.http.get<{
      date: string;
      overallAverage: { humidity: number; brightness: number };
    }>(this.averagesUrl, { params });
  }
}

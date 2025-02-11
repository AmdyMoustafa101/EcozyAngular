import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private apiUrl = 'http://localhost:3002/api';
  private averagesUrl = 'http://localhost:3002/api/averages';
  private socket: Socket;
  private sensorDataSubject = new Subject<{
    humidity: number;
    brightness: number;
    waterlevel: number;
  }>();

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3002');

    /*this.socket.on(
      'sensor-data',
      (data: { humidity: number; brightness: number }) => {
        this.sensorDataSubject.next(data);
        console.log('data: ', data);
      }
    );*/
    this.socket.on('sensor-data', (data) => {
      try {
        if (data && data.humidity !== undefined) {
          // Traitement des données
          this.sensorDataSubject.next(data);
        }
      } catch (error) {
        console.error('Erreur de réception:', error);
      }
    });
  }
  // Avec gestion d'erreurs

  getSensorData(): Observable<{
    humidity: number;
    brightness: number;
    waterlevel: number;
  }> {
    return this.http.get<{
      humidity: number;
      brightness: number;
      waterlevel: number;
    }>(`${this.apiUrl}/sensor-data`);
  }

  arroser(command: any): Observable<any> {
    console.log('command: ', command);
    return this.http.post<any>(`${this.apiUrl}/control-pump`, { command });
  }

  onSensorData(): Observable<{
    humidity: number;
    brightness: number;
    waterlevel: number;
  }> {
    return this.sensorDataSubject.asObservable();
  }

  // Méthode pour récupérer les moyennes
  getAverages(
    date: string
  ): Observable<{ overallAverage: { humidity: number; brightness: number } }> {
    const params = new HttpParams().set('date', date);
    return this.http.get<{
      overallAverage: { humidity: number; brightness: number };
    }>(this.averagesUrl, {
      params,
    });
  }
}

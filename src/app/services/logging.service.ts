import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Log {
  userId: string;
  userName: string;
  loginTime: Date;
  logoutTime: Date;
  actions: Array<{
    type: string;
    entity: string;
    entityId: string;
    details: string;
    timestamp: Date;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  private logUrl = 'http://localhost:3500';

  constructor(private http: HttpClient) {}

  logLogin(userId: string) {
    this.http.post(`${this.logUrl}/login`, { userId }).subscribe(
      () => console.log('Connexion enregistrée'),
      (error) => console.log('Erreur lors de l\'enregistrement de la connexion', error)
    );
  }

  logAction(userId: string, type: string, entity: string, entityId: string, details: string) {
    this.http.post(`${this.logUrl}/log-action`, { userId, type, entity, entityId, details }).subscribe(
      () => console.log('Action enregistrée'),
      (error) => console.log('Erreur lors de l\'enregistrement de l\'action', error)
    );
  }

  getLogs(): Observable<Log> {
    return this.http.get<Log>(`${this.logUrl}/logs`);
  }

  getLogsByDate(date: string): Observable<Log> {
    return this.http.get<Log>(`${this.logUrl}/logs/${date}`);
  }

  logLogout(userId: string) {
    this.http.post(`${this.logUrl}/logout`, { userId }).subscribe(
      () => console.log('Déconnexion enregistrée'),
      (error) =>console.log('Erreur lors de l\'enregistrement de la déconnexion', error)
    );
  }



}

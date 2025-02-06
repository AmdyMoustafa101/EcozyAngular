import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanteService {
  private apiUrl = 'http://localhost:3500/api/plantes';

  constructor(private http: HttpClient) { }

  // Créer une nouvelle plante
  createPlante(plante: any): Observable<any> {
    return this.http.post(this.apiUrl, plante);
  }

  // Récupérer toutes les plantes
  getPlantes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Récupérer une plante par son ID
  getPlanteById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  activePlante(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/activer`, { etat: true });
  }

  unactivePlante(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/desactiver`, { etat: false });
  }

  togglePlanteEtat(id: string, etat: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/${etat ? 'activer' : 'desactiver'}`, {});
  }

  // Mettre à jour une plante
  updatePlante(id: string, plante: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, plante);
  }

  // Supprimer une plante
  deletePlante(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

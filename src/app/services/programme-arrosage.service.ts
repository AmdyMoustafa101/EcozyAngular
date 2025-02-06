import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plante {
  _id: string;
  nom: string;
  etat: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProgrammeArrosageService {
  private apiUrl = 'http://localhost:3500/api';

  constructor(private http: HttpClient) { }

  getPlantesDisponibles(): Observable<Plante[]> {
    return this.http.get<Plante[]>(`${this.apiUrl}/plantes/programme`);
  }
  getProgrammeEnCours(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/encours`);
  }

  updateEtatProgramme(id: string, etat: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/etat`, { etat });
  }

  updateProgramme(id: string, programme: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, programme);
  }

  deleteProgramme(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

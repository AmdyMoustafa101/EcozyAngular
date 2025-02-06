import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plante {
  _id: string;
  nom: string;
  etat: boolean;
}

export interface ProgrammeArrosage {
  _id?: string;
  dateDebut: Date;
  dateFin: Date;
  idPlante: string | Plante;
  etat: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProgrammeArrosageService {
  private apiUrl = 'http://localhost:3500/api';

  constructor(private http: HttpClient) {}

  getPlantesDisponibles(): Observable<Plante[]> {
    return this.http.get<Plante[]>(`${this.apiUrl}/plantes/programme`);
  }

  creerProgrammeArrosage(programme: Omit<ProgrammeArrosage, '_id'>): Observable<ProgrammeArrosage> {
    return this.http.post<ProgrammeArrosage>(`${this.apiUrl}/programmeArrosage`, programme);
  }

  getProgrammesArrosage(): Observable<ProgrammeArrosage[]> {
    return this.http.get<ProgrammeArrosage[]>(`${this.apiUrl}/programmeArrosage`);
  }

  mettreAJourProgrammeArrosage(id: string, programme: Partial<ProgrammeArrosage>): Observable<ProgrammeArrosage> {
    return this.http.put<ProgrammeArrosage>(`${this.apiUrl}/programmeArrosage/${id}`, programme);
  }

  supprimerProgrammeArrosage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/programmeArrosage/${id}`);
  }

  changerEtatProgramme(id: string, etat: boolean): Observable<ProgrammeArrosage> {
    return this.http.patch<ProgrammeArrosage>(`${this.apiUrl}/programmeArrosage/${id}`, { etat });
  }

  verifierProgrammeExistant(idPlante: string): Observable<boolean> {
    console.log("Envoi de la requête pour vérifier idPlante:", idPlante);
    return this.http.get<boolean>(`${this.apiUrl}/programmeArrosage/existe`, {
      params: { idPlante },
    });
  }


}

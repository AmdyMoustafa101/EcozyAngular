import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
  _id: string;
  nom: string;
  prenom: string;
  photo: string;
  codeSecret: string;
  carteRFID: string | null;
  telephone: string;
  archived: boolean;
  createDate: Date;
  updateDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3500/api/users';
  private assignRfidUrl = 'http://localhost:3500/api/assign-rfid';

  constructor(private http: HttpClient) {}

  // Créer un utilisateur
  createUser(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Récupérer tous les utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Archiver un utilisateur
  archiveUser(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${userId}/archive`, {
      archived: true,
    });
  }

  // Désarchiver un utilisateur
  unarchiveUser(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${userId}/archive`, {
      archived: false,
    });
  }

  // Mettre à jour un utilisateur
  updateUser(userId: string, formData: FormData): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${userId}`, formData);
  }

  // Associer une carte RFID à un utilisateur
  assignRfidToUser(userId: string, carteRFID: string): Observable<any> {
    return this.http.post(this.assignRfidUrl, { userId, carteRFID });
  }

  // Désassigner une carte RFID d'un utilisateur
  removeCardFromUser(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/remove-card`, {});
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  base_url = 'http://localhost:3500/api';

  constructor(private http: HttpClient) {}

  login(codeSecret: string): Observable<any> {
    console.log(codeSecret);
    return this.http.post(`${this.base_url}/login`, { codeSecret });
  }

  loginWithRfid(carteRFID: string): Observable<any> {
    console.log(carteRFID);
    return this.http.post(`${this.base_url}/login`, { carteRFID });
  }
}

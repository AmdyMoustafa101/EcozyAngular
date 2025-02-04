import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  base_url = 'http://localhost:3500/api';
  constructor(private http: HttpClient) { }
  

  login(code: string):Observable<any> {
    return this.http.post(`${this.base_url}/login`, { code });
  }

}

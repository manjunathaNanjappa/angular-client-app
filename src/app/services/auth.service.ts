import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://localhost:8080/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: any, password: any): Observable<any> {
    return this.http.post(
      AUTH_API + 'auth/sign_in',
      {
        email,
        password,
      },
      httpOptions
    );
  }

  register(email: any, password: any, name: any): Observable<any> {
    return this.http.post(
      AUTH_API + 'auth/register',
      {
        email,
        password,
        name,
      },
      httpOptions
    );
  }

  logout() {
    localStorage.removeItem('token');
    return true;
  }
}

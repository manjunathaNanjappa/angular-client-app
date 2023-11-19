import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const AUTH_API = 'http://localhost:8080/';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('token'),
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private http: HttpClient) {}

  createNewApplication(applicationData: any): Observable<any> {
    return this.http.post(
      AUTH_API + 'createNewApplication',
      {
        ...applicationData,
      },
      httpOptions
    );
  }
  getAllApplicationList(): Observable<any> {
    return this.http.post(AUTH_API + 'fetchApplicationList', {}, httpOptions);
  }
  deleteApplication(applicationId: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'deleteApplication',
      { id: applicationId },
      httpOptions
    );
  }
}

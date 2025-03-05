import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  registerUser(user: User): Observable<any> {
    // Sende nur name und passwort an das Backend
    const { name, passwort } = user;
    return this.http.post(this.baseUrl + '/user/register', { name, passwort });
  }

  loginUser(user: { name: string; passwort: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/user/login', user);
  }
}

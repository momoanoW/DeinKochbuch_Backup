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
    return this.http.post(this.baseUrl + '/user/register', user);
  }

  loginUser(user: { username: string; password: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/user/login', user);
  }
}

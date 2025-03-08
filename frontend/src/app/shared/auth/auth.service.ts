import { HttpClient } from '@angular/common/http';
import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  user: WritableSignal<User> = signal({id: 0, name: '', passwort: ''});
  token: WritableSignal<string> = signal('');
  loggedIn: Signal<boolean> = computed(() => this.user().id && this.user().id! > 0 || false);

  constructor(private http: HttpClient) {}

  setUser(token: string, user: User): void {
    this.user.set(user);
    this.token.set(token);
  }

  unsetUser(): void {
    this.user.set({id: 0, name: '', passwort: ''});
    this.token.set('');
  }

  registerUser(user: User): Observable<any> {
    const { name, passwort } = user;
    return this.http.post(this.baseUrl + '/users/neu', { name, passwort }).pipe(
      tap(response => console.log('Registrierung erfolgreich')),
      catchError(error => {
        console.error('Registrierungsfehler:', error.status, error.statusText);
        return throwError(() => new Error('Registrierung fehlgeschlagen'));
      })
    );
  }

  loginUser(user: { name: string; passwort: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/users/login', user);
  }
}

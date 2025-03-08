import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  user: WritableSignal<User | null> = signal(null);
  token: WritableSignal<string> = signal('');
  loggedIn: Signal<boolean> = computed(() => {
    const currentUser = this.user();
    return currentUser !== null && currentUser.id !== undefined && currentUser.id > 0;
  });

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token.set(storedToken);
      this.fetchUserDetails().subscribe();
    }
  }

  setUser(token: string, user: User): void {
    console.log('Benutzer wird gesetzt:', user);
    this.user.set(user);
    this.token.set(token);
    localStorage.setItem('token', token);
    console.log('Benutzerdaten erfolgreich gespeichert');
  }

  unsetUser(): void {
    console.log('Benutzer wird entfernt');
    this.user.set(null);
    this.token.set('');
    localStorage.removeItem('token');
    console.log('Benutzerdaten erfolgreich entfernt');
  }

  registerUser(user: User): Observable<any> {
    const { name, passwort } = user;
    return this.http.post(this.baseUrl + '/users/neu', { name, passwort }).pipe(
      tap(() => console.log('Registrierung erfolgreich')),
      catchError(error => {
        console.error('Registrierungsfehler:', error.status, error.statusText);
        return throwError(() => new Error('Registrierung fehlgeschlagen'));
      })
    );
  }

  loginUser(user: { name: string; passwort: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/users/login', user).pipe(
      tap((response: any) => {
        console.log('Login-Antwort:', response);
        if (response && response.userId && response.name) {
          const loggedInUser: User = {
            id: response.userId,
            name: response.name,
            passwort: '' // Passwort wird nicht gespeichert
          };
          this.setUser('dummy-token', loggedInUser); // Dummy-Token verwenden
          console.log('Login erfolgreich');
        } else {
          throw new Error('Ungültige Login-Antwort');
        }
      }),
      catchError(error => {
        console.error('Login-Fehler:', error);

        // Fehler vom Server extrahieren und weitergeben
        let errorMessage = 'Anmeldung fehlgeschlagen';
        if (error.error?.message) {
          errorMessage += `: ${error.error.message}`;
        } else if (error.status === 0) {
          errorMessage += ': Keine Verbindung zum Server';
        } else if (error.status) {
          errorMessage += `: Fehlercode ${error.status}`;
        } else {
          errorMessage += ': Unbekannter Fehler';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    this.unsetUser();
    console.log('Logout erfolgreich');
  }

  fetchUserDetails(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/me`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.token()}`)
    }).pipe(
      tap(user => this.user.set(user)),
      catchError(error => {
        console.error('Fehler beim Abrufen der Benutzerdetails:', error);
        return throwError(() => new Error('Abrufen der Benutzerdetails fehlgeschlagen'));
      })
    );
  }
}

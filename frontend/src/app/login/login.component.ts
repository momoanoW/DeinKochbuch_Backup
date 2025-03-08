import {Component, inject} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../shared/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  loginForm = new FormGroup({
    name: new FormControl('', Validators.required),
    passwort: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
  hide = true;
  loginMessage: string = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  togglePasswordVisibility(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.hide = !this.hide;
  }

  onSubmit(): void {
    const values = this.loginForm.value;
    const name = values.name!;
    const passwort = values.passwort!;

    const user = { name, passwort };
    console.log('user', user);

    if (this.loginForm.valid) {
      this.auth.loginUser(user).subscribe({
        next: () => {
          console.log('user logged in');
          this.loginMessage = 'Login erfolgreich';
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.log('login error', err);
          this.loginMessage = err.message; // Fehlermeldung anzeigen
        },
        complete: () => console.log('login completed')
      });
    } else {
      this.loginMessage = 'Bitte füllen Sie alle Felder korrekt aus.';
    }
  }

  valid(): boolean {
    const check =
      !this.loginForm.controls['name'].hasError('required') &&
      !this.loginForm.controls['passwort'].hasError('required') &&
      !this.loginForm.controls['passwort'].hasError('minlength')
    console.log('valid : ', check)
    return check;
  }
}

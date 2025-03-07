import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { User } from '../shared/user';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../shared/auth/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmComponent } from './confirm/confirm.component';
import { CommonModule } from '@angular/common';
import { passwortMatchValidator } from '../shared/validators/passwort-match/passwort-match.validator'; // Import des Validators

export interface DialogData {
  headline: string;
  info: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true,
  providers: [AuthService],
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule
  ]
})
export class RegisterComponent {
  registerForm = new FormGroup(
    {
      name: new FormControl('', Validators.required),
      passwort: new FormControl('', [Validators.required, Validators.minLength(8)]),
      passwort2: new FormControl('', [Validators.required, Validators.minLength(8)])
    },
    { validators: passwortMatchValidator } // Benutzerdefinierter Validator wird hier hinzugefügt
  );
  hide = true;
  hide2 = true;
  user!: User;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  onSubmit(): void {
    const values = this.registerForm.value;
    this.user = {
      name: values.name!,
      passwort: values.passwort!,
    };
    console.log(this.user);
    if (this.registerForm.valid) {
      console.log('Eingaben gueltig! Registrierung wird vorgenommen');
      this.authService.registerUser(this.user).subscribe({
        next: (response) => {
          console.log('response', response);
          this.openDialog({ headline: "Erfolg", info: "User " + response.name + " registriert!" });
        },
        error: (err) => {
          console.log('HttpErrorResponse : ', err);
          this.openDialog({ headline: "Fehler", info: "Nutzername existiert bereits" });
        },
        complete: () => console.log('Registrierung abgeschlossen')
      });
    } else {
      console.log('Eingaben ungueltig! Registrierung wird abgelehnt');
    }
  }

  openDialog(data: DialogData): void {
    this.dialog.open(ConfirmComponent, { data });
  }
}

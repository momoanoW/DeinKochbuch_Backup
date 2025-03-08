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
import { ConfirmComponent } from '../shared/components/confirm/confirm.component';
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

  registerMessage: string = '';

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  onSubmit(): void {
    const values = this.registerForm.value;
    const name = values.name!;
    const passwort = values.passwort!;
    const passwort2 = values.passwort2!;

    // Überprüfe, ob die Passwörter übereinstimmen
    if (passwort !== passwort2) {
      this.registerMessage = 'Die Passwörter stimmen nicht überein.';
      console.warn('Validierungsfehler: Die Passwörter stimmen nicht überein.');
      return;
    }

    // Überprüfe, ob der Benutzername mindestens 3 Zeichen lang ist
    if (name.length < 3) {
      this.registerMessage = 'Der Benutzername muss mindestens 3 Zeichen lang sein.';
      console.warn('Validierungsfehler: Der Benutzername ist zu kurz.');
      return;
    }

    // Überprüfe, ob alle Pflichtfelder ausgefüllt sind
    if (!name || !passwort) {
      this.registerMessage = 'Bitte füllen Sie alle Pflichtfelder aus.';
      console.warn('Validierungsfehler: Pflichtfelder sind nicht ausgefüllt.');
      return;
    }

    // Überprüfe, ob das Passwort den Anforderungen entspricht
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwort)) {
      this.registerMessage = 'Das Passwort entspricht nicht den Anforderungen. Es muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Ziffer und ein Sonderzeichen enthalten.';
      console.warn('Validierungsfehler: Das Passwort entspricht nicht den Anforderungen.');
      return;
    }

    // Wenn das Formular gültig ist, sende die Registrierungsanfrage
    if (this.registerForm.valid) {
      this.authService.registerUser({ name, passwort }).subscribe({
        next: (response) => {
          console.log('Registrierung erfolgreich:', response);
          this.registerMessage = 'Registrierung erfolgreich!';
        },
        error: (error) => {
          console.error('Registrierungsfehler:', error);
          if (error.status === 0) {
            this.registerMessage = 'Es konnte keine Verbindung zum Server hergestellt werden. Bitte überprüfen Sie Ihre Internetverbindung.';
          } else if (error.status === 400) {
            if (error.error?.message === 'Benutzername bereits vergeben') {
              this.registerMessage = 'Dieser Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen.';
            } else {
              this.registerMessage = error.error?.message || 'Ein Fehler ist bei der Registrierung aufgetreten.';
            }
          } else {
            this.registerMessage = 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
          }
        }
      });
    } else {
      console.warn('Formular ungültig:', this.registerForm.errors);
      this.registerMessage = 'Bitte füllen Sie alle Felder korrekt aus.';
    }
  }


  openDialog(data: DialogData): void {
    this.dialog.open(ConfirmComponent, { data });
  }
}

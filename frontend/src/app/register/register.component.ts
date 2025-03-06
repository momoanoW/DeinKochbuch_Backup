import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
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
  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    passwort: new FormControl('', [Validators.required, Validators.minLength(8)]),
    passwort2: new FormControl('', [Validators.required, Validators.minLength(8)])
  });
  hide = true;
  hide2 = true;
  user!: User;


  constructor(private authService: AuthService, private dialog: MatDialog) {} // AuthService injiziert

  valid(): boolean {
    const check =
      !this.registerForm.controls['name'].hasError('required') &&
      !this.registerForm.controls['passwort'].hasError('required') &&
      !this.registerForm.controls['passwort'].hasError('minlength') &&
      !this.registerForm.controls['passwort2'].hasError('required') &&
      !this.registerForm.controls['passwort2'].hasError('minlength')
      this.registerForm.value.passwort == this.registerForm.value.passwort2;
    console.log('valid : ', check)
    return check;
  }

  differentPasswort(): boolean {
    const check = this.registerForm.dirty && this.registerForm.value.passwort != this.registerForm.value.passwort2;
    if(check) {
      this.registerForm.controls.passwort2.setErrors({'incorrect': true});
    } else {
      this.registerForm.controls.passwort2.setErrors({'incorrect': false});
    }
    console.log('check : ', check)
    return check;
  }

  onSubmit(): void {
    const values = this.registerForm.value;
    this.user = {
      name: values.name!,
      passwort: values.passwort!,
    };
    console.log(this.user)
    if(this.valid()) {
      console.log('eingaben gueltig! Registrierung wird vorgenommen')
      this.authService.registerUser(this.user).subscribe({
        next: (response) => {
          console.log('response', response);
          this.openDialog({ headline: "Erfolg", info: "User " + response.name + " registriert!" });
        },
        error: (err) => {
          console.log('HttpErrorResponse : ', err);
          this.openDialog({ headline: "Fehler", info: "Nutzername und/oder E-Mail existiert bereits" });
        },
        complete: () => console.log('register completed')
      });

    } else {
      console.log('eingaben ungueltig! Registrierung wird abgelehnt')
    }
  }
  openDialog(data: DialogData) {
    this.dialog.open(ConfirmComponent, {data: data});
  }
}

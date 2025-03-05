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
    ReactiveFormsModule
  ]
})
export class RegisterComponent {
  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    password2: new FormControl('', [Validators.required, Validators.minLength(8)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', Validators.required)
  });
  roles = [ "admin", "user"];
  hide = true;
  hide2 = true;
  user!: User;

  constructor(private authService: AuthService) {} // AuthService injiziert

  valid(): boolean {
    const check =
      !this.registerForm.controls['username'].hasError('required') &&
      !this.registerForm.controls['password'].hasError('required') &&
      !this.registerForm.controls['password'].hasError('minlength') &&
      !this.registerForm.controls['password2'].hasError('required') &&
      !this.registerForm.controls['password2'].hasError('minlength') &&
      !this.registerForm.controls['email'].hasError('required') &&
      !this.registerForm.controls['email'].hasError('email') &&
      this.registerForm.value.password == this.registerForm.value.password2;
    console.log('valid : ', check)
    return check;
  }

  differentPassword(): boolean {
    const check = this.registerForm.dirty && this.registerForm.value.password != this.registerForm.value.password2;
    if(check) {
      this.registerForm.controls.password2.setErrors({'incorrect': true});
    } else {
      this.registerForm.controls.password2.setErrors({'incorrect': false});
    }
    console.log('check : ', check)
    return check;
  }

  onSubmit(): void {
    const values = this.registerForm.value;
    this.user = {
      username: values.username!,
      password: values.password!,
      email: values.email!,
      role: values.role!
    };
    console.log(this.user)
    if(this.valid()) {
      console.log('eingaben gueltig! Registrierung wird vorgenommen')
    this.authService.registerUser(this.user).subscribe({
      next: (response) => console.log('response', response),
      error: (err) => console.log('HttpErrorResponse : ', err),
      complete: () => console.log('register completed')
    });
    } else {
      console.log('eingaben ungueltig! Registrierung wird abgelehnt')
    }

  }
}

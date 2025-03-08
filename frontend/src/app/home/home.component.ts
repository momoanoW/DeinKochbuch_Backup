import { Component, inject } from '@angular/core';
import { AuthService } from '../shared/auth/auth.service';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [LoginComponent, CommonModule]
})
export class HomeComponent {
  private authService = inject(AuthService);

  loggedIn = this.authService.loggedIn;
}

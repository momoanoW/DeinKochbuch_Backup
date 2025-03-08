import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../shared/auth/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    RouterOutlet,
  ],
})
export class NavComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;

  isHomePage(): boolean {
    return this.router.url === '/';
  }

  showNewRecipeButton(): boolean {
    return this.router.url === '/';
  }

  async logout() {
    this.authService.logout();
    try {
      const success = await this.router.navigate(['/login']);
      if (!success) {
        console.error('Navigation to /login failed');
      }
    } catch (error) {
      console.error('Error during navigation:', error);
    }
  }
}

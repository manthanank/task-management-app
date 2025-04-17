import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, NgClass],
    templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);

  // Signal for mobile menu visibility
  showMobileMenu = signal(false);

  constructor() {}

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin() && this.authService.isAuthenticated();
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuper() && this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showMobileMenu.set(false);
  }

  toggleMobileMenu() {
    this.showMobileMenu.update(value => !value);
  }
}

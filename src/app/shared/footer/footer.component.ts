import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
  authService = inject(AuthService);
  
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin() && this.authService.isAuthenticated();
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { User, Users } from '../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private tokenExpirationTimer: any;

  http = inject(HttpClient);
  router = inject(Router);

  constructor() {}

  redirectToTasks() {
    this.router.navigate(['/tasks']);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user.role, response.organization);
      })
    );
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user.role, response.organization);
      })
    );
  }

  getUsers(): Observable<Users> {
    return this.http.get<Users>(`${this.apiUrl}/users`);
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  isAdmin(): boolean {
    const role = sessionStorage.getItem('role');
    return role === 'admin';
  }

  isSuper(): boolean {
    const role = sessionStorage.getItem('role');
    return role === 'super';
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getCurrentUserRole(): string | null {
    return sessionStorage.getItem('role');
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpirationDate');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('organization');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    // this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, {
      password,
    });
  }

  private handleAuthentication(token: string, expiresIn: number, role: string, organization?: string) {
    const user = { token, expiresIn, role, organization };
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('organization', organization || '');
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('tokenExpirationDate', expirationDate.toISOString());
    sessionStorage.setItem('role', role);
    this.autoLogout(expiresIn * 1000);
  }

  autoLogin() {
    const token = this.getToken();
    const expirationDate = new Date(
      sessionStorage.getItem('tokenExpirationDate') || ''
    );
    if (!token || expirationDate <= new Date()) {
      this.logout();
      return;
    }
    const expiresIn = expirationDate.getTime() - new Date().getTime();
    this.autoLogout(expiresIn);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  getCurrentUserId(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;

      // JWT tokens are in format: header.payload.signature
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded._id;
    } catch (e) {
      return null;
    }
  }

  getCurrentUser(): any {
    // Get user data from sessionStorage instead of localStorage
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  saveUserData(user: any): void {
    // Save to sessionStorage instead of localStorage to match retrieval
    sessionStorage.setItem('user', JSON.stringify(user));
  }
}

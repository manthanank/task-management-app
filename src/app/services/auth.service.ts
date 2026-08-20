import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private tokenExpirationTimer: ReturnType<typeof setTimeout> | null = null;

  http = inject(HttpClient);
  router = inject(Router);

  constructor() {}

  redirectToTasks() {
    this.router.navigate(['/tasks']);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user.role, response.user.organization);
      })
    );
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user.role, response.user.organization);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;
    const expirationDate = sessionStorage.getItem('tokenExpirationDate');
    if (!expirationDate) return false;
    return new Date(expirationDate) > new Date();
  }

  isAdmin(): boolean {
    const role = sessionStorage.getItem('role');
    return role === 'admin' || role === 'super';
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
      this.tokenExpirationTimer = null;
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, {
      password,
    });
  }

  private handleAuthentication(token: string, expiresIn: number, role: string, organization?: any) {
    const orgString = typeof organization === 'object' && organization ? JSON.stringify(organization) : (organization || '');
    const user = { token, expiresIn, role, organization };
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('organization', orgString);
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
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded._id;
    } catch (e) {
      return null;
    }
  }

  getCurrentUser(): any {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  saveUserData(user: any): void {
    sessionStorage.setItem('user', JSON.stringify(user));
  }
}

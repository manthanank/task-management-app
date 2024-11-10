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
        this.handleAuthentication(response.token, response.expiresIn, response.user.role);
      })
    );
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user.role);
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

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpirationDate');
    sessionStorage.removeItem('role');
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

  private handleAuthentication(token: string, expiresIn: number, role: string) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    sessionStorage.setItem('token', token);
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
}

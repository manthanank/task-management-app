import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Users } from '../core/models/users.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;
  private http = inject(HttpClient);

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/organization`)
  }

  getUsersByOrganization(page: number = 1, limit: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/organization?page=${page}&limit=${limit}`);
  }

  getAllUsers(page: number = 1, limit: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }
}

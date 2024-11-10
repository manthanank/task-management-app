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

  getUsers(page: number, limit: number): Observable<Users> {
    const url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    return this.http.get<Users>(url);
  }
}

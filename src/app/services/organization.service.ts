import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Organizations, SingleOrganization } from '../core/models/organization.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/organizations`;
  private http = inject(HttpClient);

  getMyOrganizations(page: number, limit: number): Observable<Organizations> {
    return this.http.get<Organizations>(`${this.apiUrl}/my?page=${page}&limit=${limit}`);
  }

  getAllOrganizations(page: number, limit: number): Observable<Organizations> {
    return this.http.get<Organizations>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getOrganizationById(id: string): Observable<SingleOrganization> {
    return this.http.get<SingleOrganization>(`${this.apiUrl}/${id}`);
  }

  createOrganization(organization: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, organization);
  }

  updateOrganization(id: string, organization: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, organization);
  }

  addMember(organizationId: string, userId: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${organizationId}/members`, { userId, role });
  }

  removeMember(organizationId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${organizationId}/members`, {
      body: { userId }
    });
  }

  deleteOrganization(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getOrganizationDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addUserToOrganization(orgId: string, userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orgId}/users`, userData);
  }

  removeUserFromOrganization(orgId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orgId}/users/${userId}`);
  }

  updateUserRole(orgId: string, userId: string, role: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orgId}/users/${userId}`, { role });
  }
}

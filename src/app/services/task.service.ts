import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tasks } from '../core/models/tasks.model';
import { Task as SingleTask } from '../core/models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;
  private http = inject(HttpClient);

  createTask(task: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, task);
  }

  getAllTasks(): Observable<Tasks> {
    return this.http.get<Tasks>(this.apiUrl);
  }

  getCompletedTasks(page: number, limit: number, search: string = '', priority: string = ''): Observable<Tasks> {
    return this.http.get<Tasks>(`${this.apiUrl}/completed?page=${page}&limit=${limit}&search=${search}&priority=${priority}`);
  }

  getPendingTasks(page: number, limit: number, search: string = '', priority: string = '', sortBy: string = 'deadline', order: string = 'asc'): Observable<Tasks> {
    return this.http.get<Tasks>(`${this.apiUrl}/ongoing?page=${page}&limit=${limit}&search=${search}&priority=${priority}&sortBy=${sortBy}&order=${order}`);
  }

  getUserTasks(page: number, limit: number): Observable<Tasks> {
    return this.http.get<Tasks>(`${this.apiUrl}/user?page=${page}&limit=${limit}`);
  }

  getTaskById(id: string): Observable<SingleTask> {
    return this.http.get<SingleTask>(`${this.apiUrl}/${id}`);
  }

  updateTask(id: string, task: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    // Make sure we're sending the correct headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }

  getTaskStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary/stats`);
  }

  getTaskActivities(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/activities`);
  }
}
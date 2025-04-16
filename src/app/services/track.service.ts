import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Visit } from '../core/models/visit.model';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  apiURL = environment.trackingApiUrl;

  http = inject(HttpClient);

  constructor() {}

  trackProjectVisit(projectName: string): Observable<Visit> {
    return this.http.post<Visit>(this.apiURL, { projectName });
  }
}
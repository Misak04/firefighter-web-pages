import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Technics, TechnicsCategory, TechnicsListResponse, TechnicsStatus } from './technics.model';

@Injectable({ providedIn: 'root' })
export class TechnicsService {
  constructor(private readonly http: HttpClient) {}

  list(category?: TechnicsCategory, page = 1, limit = 50): Observable<TechnicsListResponse> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (category) {
      params['category'] = category;
    }
    return this.http.get<TechnicsListResponse>('/api/technics', { params });
  }

  get(id: string): Observable<Technics> {
    return this.http.get<Technics>(`/api/technics/${id}`);
  }

  create(data: {
    name: string;
    category: TechnicsCategory;
    manufacturer?: string;
    yearAcquired?: number;
    description?: string;
    status?: TechnicsStatus;
  }): Observable<Technics> {
    return this.http.post<Technics>('/api/technics', data);
  }

  update(id: string, data: Partial<Technics>): Observable<Technics> {
    return this.http.patch<Technics>(`/api/technics/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/technics/${id}`);
  }

  uploadPhoto(id: string, file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`/api/technics/${id}/photos/upload`, formData);
  }

  deletePhoto(photoId: string): Observable<void> {
    return this.http.delete<void>(`/api/technics/photos/${photoId}`);
  }
}

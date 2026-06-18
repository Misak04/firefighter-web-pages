import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GalleryEvent, PhotoListResponse } from './gallery.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  constructor(private readonly http: HttpClient) {}

  listYears(): Observable<number[]> {
    return this.http.get<number[]>('/api/gallery/years');
  }

  listEventsForYear(year: number): Observable<GalleryEvent[]> {
    return this.http.get<GalleryEvent[]>(`/api/gallery/years/${year}/events`);
  }

  listPhotosForEvent(eventId: string, page = 1, limit = 50): Observable<PhotoListResponse> {
    return this.http.get<PhotoListResponse>(`/api/gallery/events/${eventId}/photos`, {
      params: { page: String(page), limit: String(limit) },
    });
  }

  createEvent(data: { name: string; year: number; description?: string }): Observable<GalleryEvent> {
    return this.http.post<GalleryEvent>('/api/gallery/events', data);
  }

  uploadPhoto(eventId: string, year: number, file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    formData.append('year', String(year));
    return this.http.post('/api/media/upload', formData);
  }

  attachPhoto(eventId: string, mediaId: string, title?: string): Observable<unknown> {
    return this.http.post(`/api/gallery/events/${eventId}/photos`, { mediaId, title });
  }

  deletePhoto(photoId: string): Observable<void> {
    return this.http.delete<void>(`/api/gallery/photos/${photoId}`);
  }

  reorderPhotos(eventId: string, photos: { id: string; sortOrder: number }[]): Observable<unknown> {
    return this.http.patch(`/api/gallery/events/${eventId}/photos/reorder`, { photos });
  }
}

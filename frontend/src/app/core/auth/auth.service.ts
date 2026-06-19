import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  accessToken: string;
  csrfToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessToken = signal<string | null>(null);
  private readonly csrfToken = signal<string | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  constructor(private readonly http: HttpClient) {}

  getAccessToken(): string | null {
    return this.accessToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/api/auth/login', { email, password }, { withCredentials: true })
      .pipe(tap((res) => this.setSession(res.accessToken, res.csrfToken)));
  }

  refresh(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/api/auth/refresh', {}, { withCredentials: true, headers: this.csrfHeaders() })
      .pipe(tap((res) => this.setSession(res.accessToken, res.csrfToken)));
  }

  logout(): Observable<{ success: boolean }> {
    return this.http
      .post<{ success: boolean }>(
        '/api/auth/logout',
        {},
        { withCredentials: true, headers: this.csrfHeaders() },
      )
      .pipe(tap(() => this.clearSession()));
  }

  setSession(accessToken: string, csrfToken: string): void {
    this.accessToken.set(accessToken);
    this.csrfToken.set(csrfToken);
    this.isAuthenticated.set(true);
  }

  clearSession(): void {
    this.accessToken.set(null);
    this.csrfToken.set(null);
    this.isAuthenticated.set(false);
  }

  private csrfHeaders(): Record<string, string> {
    const token = this.csrfToken();
    return token ? { 'X-CSRF-Token': token } : {};
  }
}

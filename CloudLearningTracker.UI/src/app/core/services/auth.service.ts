import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';
import { environment } from '../environments/environment';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly sessionStorageKey = 'authSession';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload);
  }

  register(payload: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, payload);
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    window.localStorage.removeItem(this.sessionStorageKey);
  }

  persistSession(accessToken: string, refreshToken: string, username?: string): void {
    if (!this.isBrowser()) {
      return;
    }

    const expiresAt = this.getTokenExpiration(accessToken) ?? Date.now() + 60 * 60 * 1000;
    const session = { accessToken, refreshToken, expiresAt, username: username?.trim() || '' };

    window.localStorage.setItem('accessToken', accessToken);
    window.localStorage.setItem('refreshToken', refreshToken);
    window.localStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getStoredSession(): { accessToken: string; refreshToken: string; expiresAt: number; username?: string } | null {
    if (!this.isBrowser()) {
      return null;
    }

    const stored = window.localStorage.getItem(this.sessionStorageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private getStoredAccessToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    const directToken = window.localStorage.getItem('accessToken');
    if (directToken) {
      return directToken;
    }

    return this.getStoredSession()?.accessToken ?? null;
  }

  private decodeTokenPayload(token: string): any {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  }

  private getTokenExpiration(token: string | null): number | null {
    if (!token) {
      return null;
    }

    try {
      const decoded = this.decodeTokenPayload(token);
      return decoded?.exp ? decoded.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private getStoredSessionExpiration(): number | null {
    return this.getStoredSession()?.expiresAt ?? null;
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) {
      return true;
    }

    const token = this.getStoredAccessToken();

    if (!token) {
      return false;
    }

    const expiration = this.getTokenExpiration(token) ?? this.getStoredSessionExpiration();
    console.log('Current Time:', Date.now());
    console.log('Parsed Expiration:', expiration);
    
    if (expiration && Date.now() >= expiration) {
      console.warn('AuthGuard flagged token as expired! Triggering logout.');
      this.logout();
      return false;
    }

    return true;
  }

  getCurrentUsername(): string {
    if (!this.isBrowser()) {
      return 'Learner';
    }

    const session = this.getStoredSession();
    const fallbackName = session?.username?.trim();
    if (fallbackName) {
      return fallbackName;
    }

    const token = this.getStoredAccessToken();
    if (!token || !this.isAuthenticated()) {
      return 'Learner';
    }

    try {
      const decoded = this.decodeTokenPayload(token);
      const claims = decoded ?? {};
      const candidateName =
        claims.name ||
        claims.preferred_username ||
        claims.username ||
        claims.email ||
        claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      if (!candidateName) {
        return 'Learner';
      }

      return typeof candidateName === 'string' ? candidateName : 'Learner';
    } catch {
      return 'Learner';
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
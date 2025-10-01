import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Token, UserCreate, UserOut } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly TOKEN_KEY = 'qna_token';
  private currentUserSubject = new BehaviorSubject<UserOut | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private get hasBrowserStorage(): boolean {
    return isPlatformBrowser(this.platformId) && typeof globalThis !== 'undefined' && !!(globalThis as any).localStorage;
  }

  private get storage(): any | null {
    if (!this.hasBrowserStorage) return null;
    try {
      return (globalThis as any).localStorage as any;
    } catch {
      return null;
    }
  }

  // PUBLIC_INTERFACE
  getToken(): string | null {
    /** Returns the stored JWT token (if any). Safe for SSR. */
    const s = this.storage;
    return s ? s.getItem(this.TOKEN_KEY) : null;
  }

  // PUBLIC_INTERFACE
  isAuthenticated(): boolean {
    /** Checks whether a user is currently authenticated (has a token). */
    return !!this.getToken();
  }

  // PUBLIC_INTERFACE
  signup(payload: UserCreate): Observable<UserOut> {
    /** Calls backend to create a user account. */
    const url = `${environment.apiBaseUrl}/auth/signup`;
    return this.http.post<UserOut>(url, payload).pipe(
      tap((user) => {
        // after signup, keep user in state (no token yet until login)
        this.currentUserSubject.next(user);
      })
    );
  }

  // PUBLIC_INTERFACE
  login(username: string, password: string): Observable<Token> {
    /** Calls backend OAuth2 password flow to authenticate. */
    const url = `${environment.apiBaseUrl}/auth/login`;
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<Token>(url, body.toString(), { headers }).pipe(
      tap((token) => {
        const s = this.storage;
        try {
          s?.setItem(this.TOKEN_KEY, token.access_token);
        } catch {
          // ignore storage errors
        }
      })
    );
  }

  // PUBLIC_INTERFACE
  loadMe(): Observable<UserOut> {
    /** Retrieves current user profile and stores it in state. */
    const url = `${environment.apiBaseUrl}/auth/me`;
    return this.http.get<UserOut>(url).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  // PUBLIC_INTERFACE
  logout(): void {
    /** Clears auth token and user state. */
    const s = this.storage;
    try { s?.removeItem(this.TOKEN_KEY); } catch { /* noop */ }
    this.currentUserSubject.next(null);
  }
}

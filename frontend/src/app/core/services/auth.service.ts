import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/admin';
  private TOKEN_KEY = 'rc_admin_token';

  constructor(private http: HttpClient) {}

login(username: string, password: string): Observable<{ success: boolean; token: string }> {
  return this.http.post<{ success: boolean; token: string }>(
    `${this.apiUrl}/login`,
    { username, password }
  ).pipe(
    tap(res => {
      if (res.token && typeof window !== 'undefined') {
        window.localStorage.setItem(this.TOKEN_KEY, res.token);
      }
    })
  );
}

  getToken(): string | null {

  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(this.TOKEN_KEY);
}

logout(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(this.TOKEN_KEY);
  }
}

isLoggedIn(): boolean {

  if (typeof window === 'undefined') {
    return false;
  }

  return !!this.getToken();
}
}
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private apiUrl = 'https://roshni-creation.onrender.com/api/admin';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ── Inquiries ──────────────────────────────────────────────────
  getInquiries(): Observable<any[]> {
    if (!this.isBrowser()) return of([]);
    return this.http.get<any[]>(`${this.apiUrl}/inquiries`, { headers: this.authHeaders() });
  }

  markRead(id: string): Observable<any> {
    if (!this.isBrowser()) return of(null);
    return this.http.patch(`${this.apiUrl}/inquiries/${id}/read`, {}, { headers: this.authHeaders() });
  }

  deleteInquiry(id: string): Observable<any> {
    if (!this.isBrowser()) return of(null);
    return this.http.delete(`${this.apiUrl}/inquiries/${id}`, { headers: this.authHeaders() });
  }

  // ── Images ─────────────────────────────────────────────────────
  getImages(): Observable<any[]> {
    if (!this.isBrowser()) return of([]);
    return this.http.get<any[]>(`${this.apiUrl}/images`, { headers: this.authHeaders() });
  }

  uploadImages(files: FileList): Observable<any> {
    if (!this.isBrowser()) return of(null);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    return this.http.post(`${this.apiUrl}/upload`, formData, { headers: this.authHeaders() });
  }

  deleteImage(filename: string): Observable<any> {
    if (!this.isBrowser()) return of(null);
    return this.http.delete(`${this.apiUrl}/images/${filename}`, { headers: this.authHeaders() });
  }
}
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  tag: string;
  image: string;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {

  private apiUrl = 'https://roshni-creation.onrender.com/api/products';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ✦ FIX: removed bogus 'Content-Type-Skip' debug header that was here before
  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Public — no auth
  getProducts(): Observable<Product[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Admin — only runs in browser where token exists
  getAllProducts(): Observable<Product[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    return this.http.get<Product[]>(`${this.apiUrl}/admin`, { headers: this.authHeaders() });
  }

  addProduct(formData: FormData): Observable<Product> {
    if (!isPlatformBrowser(this.platformId)) return of({} as Product);
    return this.http.post<Product>(this.apiUrl, formData, { headers: this.authHeaders() });
  }

  updateProduct(id: string, formData: FormData): Observable<Product> {
    if (!isPlatformBrowser(this.platformId)) return of({} as Product);
    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData, { headers: this.authHeaders() });
  }

  deleteProduct(id: string): Observable<{ success: boolean }> {
    if (!isPlatformBrowser(this.platformId)) return of({ success: false });
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }
}

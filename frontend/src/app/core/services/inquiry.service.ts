import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InquiryForm {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private apiUrl = 'https://roshni-creation.onrender.com/api';

  constructor(private http: HttpClient) {}

  submitInquiry(data: InquiryForm): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/inquiries`, // ✦ FIX: was '/api/inquiry' — backend is mounted at '/api/inquiries' (plural)
      data
    );
  }
}

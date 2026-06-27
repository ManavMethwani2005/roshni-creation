import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  inquiries: any[] = [];
  loading = true;
  searchTerm = '';
  private refreshInterval: any;

  constructor(
    private admin: AdminService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

  if (!isPlatformBrowser(this.platformId)) {
    this.loading = false;
    return;
  }

  setTimeout(() => {
    this.loadInquiries();
  }, 200);

  this.refreshInterval = setInterval(() => {
    this.loadInquiries();
  }, 10000);
}

  ngOnDestroy(): void {

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
  get unreadCount(): number {
  return this.inquiries.filter(i => !i.isRead).length;
}

get readCount(): number {
  return this.inquiries.filter(i => i.isRead).length;
}

get filteredInquiries() {

  if (!this.searchTerm.trim()) {
    return this.inquiries;
  }

  const term = this.searchTerm.toLowerCase();

  return this.inquiries.filter(i =>
    i.name?.toLowerCase().includes(term) ||
    i.email?.toLowerCase().includes(term)
  );
}

  loadInquiries(): void {


  this.loading = true;

  this.admin.getInquiries().subscribe({

    next: (data) => {

      this.inquiries = data.sort(
  (a: any, b: any) =>
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
);

      this.loading = false;

      this.cdr.detectChanges();

    },

    error: (err) => {

      console.error('ERROR', err);

      this.loading = false;
      this.inquiries = [];

      this.cdr.detectChanges();
    }
  });
}

  markRead(id: string): void {

    this.admin.markRead(id).subscribe({

      next: () => {
        this.loadInquiries();
      },

      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteInquiry(id: string): void {

    if (!confirm('Delete this inquiry?')) {
      return;
    }

    this.admin.deleteInquiry(id).subscribe({

      next: () => {
        this.loadInquiries();
      },

      error: (err) => {
        console.error(err);
      }
    });
  }

  logout(): void {

    this.auth.logout();

    this.router.navigate(['/admin/login']);
  }
}
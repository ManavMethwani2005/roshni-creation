import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent),
  },

  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin-login/admin-login').then(
        m => m.AdminLoginComponent
      ),
  },
  {
  path: 'admin/products',
  loadComponent: () =>
    import('./pages/admin-products/admin-products')
      .then(m => m.AdminProductsComponent),
  canActivate: [authGuard]
  },
  {
  path: 'admin/dashboard',
  loadComponent: () =>
    import('./pages/admin-dashboard/admin-dashboard')
      .then(m => m.AdminDashboardComponent),
  canActivate: [authGuard]
},

  {
    path: 'admin',
    redirectTo: 'admin/login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: '',
  },
];
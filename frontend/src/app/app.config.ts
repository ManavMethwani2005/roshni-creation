import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; // ✦ FIX: added withFetch import
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()) // ✦ FIX: was provideHttpClient() — withFetch() is required for SSR/Angular Universal to avoid hydration errors
  ]
};

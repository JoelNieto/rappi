import { Route } from '@angular/router';
import { authGuardFn } from './auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./auth/sign-in.component').then((m) => m.SignInComponent),
  },
  {
    path: '',
    canActivate: [authGuardFn],
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./clients.component').then((m) => m.ClientsComponent),
      },
      {
        path: 'clients/new',
        loadComponent: () =>
          import('./client-form.component').then((m) => m.ClientFormComponent),
      },
      {
        path: 'clients/:clientId',
        loadComponent: () =>
          import('./client-form.component').then((m) => m.ClientFormComponent),
      },
      {
        path: 'loans',
        loadComponent: () =>
          import('./loans.component').then((m) => m.LoansComponent),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./requests.component').then((m) => m.RequestsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile.component').then((m) => m.ProfileComponent),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];

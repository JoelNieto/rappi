import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./auth/sign-in.component').then((m) => m.SignInComponent),
  },
  {
    path: '',
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
        path: 'requests',
        loadComponent: () =>
          import('./requests.component').then((m) => m.RequestsComponent),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];

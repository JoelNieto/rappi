import { Route } from '@angular/router';
import { adminGuardFn, authGuardFn } from './auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadComponent: () => import('./auth/sign-in.component'),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'change-password',
    canActivate: [authGuardFn],
    loadComponent: () =>
      import('./auth/change-password.component').then(
        (m) => m.ChangePasswordComponent,
      ),
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
        path: 'loans/new',
        loadComponent: () =>
          import('./loan-form.component').then((m) => m.LoanFormComponent),
      },
      {
        path: 'loans/:loanId',
        loadComponent: () =>
          import('./loan-details.component').then(
            (x) => x.LoanDetailsComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile.component').then((m) => m.ProfileComponent),
      },

      {
        path: 'users',
        canActivate: [adminGuardFn],
        loadComponent: () =>
          import('./users.component').then((m) => m.UsersComponent),
      },
      { path: '**', redirectTo: 'home', pathMatch: 'full' },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];

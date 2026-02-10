import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { MockOAuthComponent } from './components/mock-oauth/mock-oauth.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login-container.component').then(
        (m) => m.LoginContainerComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register-container.component').then(
        (m) => m.RegisterContainerComponent,
      ),
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },
  {
    path: 'auth/mock-oauth',
    component: MockOAuthComponent,
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard-container.component').then(
        (m) => m.DashboardContainerComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

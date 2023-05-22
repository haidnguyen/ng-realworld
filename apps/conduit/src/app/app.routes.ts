import { Route } from '@angular/router';
import { authenticatedGuard, unauthenticatedGuard } from '@ng-realworld/data-access/service';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () => import('@ng-realworld/features/home').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('@ng-realworld/features/login').then(m => m.LoginComponent),
    canActivate: [unauthenticatedGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('@ng-realworld/features/register').then(m => m.RegisterComponent),
    canActivate: [unauthenticatedGuard],
  },
  {
    path: 'setting',
    loadComponent: () => import('@ng-realworld/features/setting').then(m => m.SettingComponent),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'editor',
    loadComponent: () => import('@ng-realworld/features/editor').then(m => m.EditorComponent),
    canActivate: [authenticatedGuard],
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('@ng-realworld/features/profile').then(m => m.ProfileComponent),
  },
];

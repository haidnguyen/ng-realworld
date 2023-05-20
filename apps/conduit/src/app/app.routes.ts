import { Route } from '@angular/router';

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
  },
  {
    path: 'register',
    loadComponent: () => import('@ng-realworld/features/register').then(m => m.RegisterComponent),
  },
  {
    path: 'setting',
    loadComponent: () => import('@ng-realworld/features/setting').then(m => m.SettingComponent),
  },
];

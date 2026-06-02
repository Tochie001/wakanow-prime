import { Routes } from '@angular/router';
import { authGuard } from './services/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'WakaPrime — Member-only travel savings',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage),
    title: 'Log in — WakaPrime',
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfilePage),
    title: 'Your account — WakaPrime',
  },
  {
    path: 'join/:tier',
    loadComponent: () => import('./pages/join/join').then(m => m.JoinPage),
    title: 'Join WakaPrime',
  },
  { path: '**', redirectTo: '' },
];

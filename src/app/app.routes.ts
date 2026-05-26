import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'Wakanow Prime — Member-only travel savings',
  },
  {
    path: 'join/:tier',
    loadComponent: () => import('./pages/join/join').then(m => m.JoinPage),
    title: 'Join Wakanow Prime',
  },
  { path: '**', redirectTo: '' },
];

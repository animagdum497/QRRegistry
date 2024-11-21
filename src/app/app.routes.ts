import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'open-camera',
    loadComponent: () => import('./components/open-camera/open-camera.page').then( m => m.OpenCameraPage)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./components/not-found/not-found.page').then( m => m.NotFoundPage)
  },
  {
    path: 'user',
    loadComponent: () => import('./components/user/user.page').then( m => m.UserPage)
  },
  {
    path: 'form',
    loadComponent: () => import('./components/form/form.page').then( m => m.FormPage)
  },
];

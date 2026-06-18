import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'admin/articles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/articles/article-list/article-list.component').then((m) => m.ArticleListComponent),
  },
  {
    path: 'admin/articles/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/articles/article-editor/article-editor.component').then(
        (m) => m.ArticleEditorComponent,
      ),
  },
  {
    path: 'admin/gallery',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/gallery/gallery-events/gallery-events.component').then(
        (m) => m.GalleryEventsComponent,
      ),
  },
  {
    path: 'admin/gallery/:eventId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/gallery/event-manager/event-manager.component').then((m) => m.EventManagerComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'articles',
    loadComponent: () => import('./pages/articles/articles.component').then((m) => m.ArticlesComponent),
  },
  {
    path: 'articles/:slug',
    loadComponent: () =>
      import('./pages/article-detail/article-detail.component').then((m) => m.ArticleDetailComponent),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'gallery/:year',
    loadComponent: () => import('./pages/gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'gallery/:year/:event',
    loadComponent: () => import('./pages/gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'technics',
    loadComponent: () => import('./pages/technics/technics.component').then((m) => m.TechnicsComponent),
  },
];

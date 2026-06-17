import { Routes } from '@angular/router';

export const routes: Routes = [
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

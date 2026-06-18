import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'articles', renderMode: RenderMode.Server },
  { path: 'articles/:slug', renderMode: RenderMode.Server },
  { path: 'gallery', renderMode: RenderMode.Server },
  { path: 'gallery/:year', renderMode: RenderMode.Server },
  { path: 'gallery/:year/:event', renderMode: RenderMode.Server },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];

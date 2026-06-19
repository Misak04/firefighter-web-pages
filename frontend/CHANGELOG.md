# Changelog

All notable changes to the frontend are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Initial Angular 19 project bootstrap with SSR.
- PrimeNG (Aura theme) + PrimeIcons integration.
- Public routing skeleton: `/`, `/articles`, `/articles/:slug`, `/gallery`,
  `/gallery/:year`, `/gallery/:year/:event`, `/technics` with lazy-loaded placeholder components.
- `Dockerfile` for production SSR builds.
- `AuthService` (signals-based, access token kept in memory — never localStorage).
- `authInterceptor` — attaches `Authorization: Bearer` header, clears session and redirects to
  `/admin/login` on 401 from admin API calls.
- `authGuard` — protects `/admin` routes, redirects unauthenticated users to `/admin/login`.
- `/admin/login` page (reactive form, PrimeNG inputs) and `/admin` dashboard placeholder.
- `proxy.conf.json` for `ng serve` — forwards `/api/*` to the local backend on port 3000.
- `app.routes.server.ts` — per-route SSR render mode config: `/articles*` SSR per-request,
  `/admin/**` client-only (no SEO value, avoids server-rendering the TipTap editor's DOM), rest
  statically prerendered.
- Public `/articles` list (paginated) and `/articles/:slug` detail page with SSR-rendered SEO
  `<title>` and Open Graph meta tags, wired to the backend `ArticlesService`.
- Admin `/admin/articles` list (with draft/published `p-tag`, delete) and
  `/admin/articles/:id` editor (TipTap rich-text body, draft/publish actions); `:id` of `new`
  creates a new article.
- Public gallery: `/gallery` (year grid), `/gallery/:year` (event grid), `/gallery/:year/:event`
  (PrimeNG `p-galleria` lightbox with thumbnail strip), all SSR per-request and wired to the
  backend `GalleryService`.
- Admin `/admin/gallery` (event list + create form) and `/admin/gallery/:eventId` (multi-file
  upload, photo grid with delete and up/down reorder), client-rendered like the rest of `/admin`.
- Public `/technics` — category tabs (PrimeNG `p-tabs`), equipment cards, detail dialog with a
  `p-galleria` photo gallery, SSR per-request and wired to the backend `TechnicsService`.
- Admin `/admin/technics` list (status `p-tag`, delete) and `/admin/technics/:id` editor
  (name/category/manufacturer/year/description form, single-file photo upload, photo delete);
  `:id` of `new` creates a new item.
- Helmet (CSP, HSTS, frame-ancestors `'none'`, etc.) added to the Express SSR server (`server.ts`)
  — this is the server that actually delivers HTML to browsers, so headers matter most here.
- `AuthService` now stores the `csrfToken` returned alongside the access token on login/refresh,
  and sends it via `X-CSRF-Token` on `/auth/refresh` and `/auth/logout` calls (backend CSRF
  double-submit protection — see `backend/CHANGELOG.md`).

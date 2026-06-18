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

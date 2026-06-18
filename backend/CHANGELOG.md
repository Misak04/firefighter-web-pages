# Changelog

All notable changes to the backend are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Initial NestJS 10 project bootstrap.
- Prisma + PostgreSQL connection setup.
- Environment validation schema (`joi`) covering DB, Redis, JWT, and MinIO config.
- `GET /api/health` endpoint.
- Global `/api` route prefix.
- `Dockerfile` for production builds.
- `User`, `Role` (ADMIN/EDITOR/VIEWER), and `AuditLog` Prisma models + initial migration.
- `POST /api/auth/login`, `/refresh`, `/logout` — JWT access token (15 min) + httpOnly refresh
  cookie (7 days) with rotation on every refresh and revocation on logout.
- `bcrypt` password hashing (cost factor 12), Redis-backed refresh token store and per-email
  failed-login counter (account lockout after 10 failures within 15 minutes).
- Audit log entry written for every login, refresh, and logout attempt (success/fail, IP, user).
- `JwtAuthGuard` (global, secure-by-default with `@Public()` opt-out) and `RolesGuard` +
  `@Roles()` decorator enforcing the Role Matrix.
- Rate limiting via `@nestjs/throttler`: 5 req/min on `/auth/login`, 30 req/min default.
- Global `ValidationPipe` (DTO whitelisting) and `cookie-parser` middleware.
- `prisma/seed.ts` — seeds an initial ADMIN user (admin-invite only, no public signup).
- `Article` Prisma model (title, slug, body, status, author, publishedAt, featuredImageId) with
  a generated `tsvector` column (title weighted 'A', body weighted 'B') + GIN index for
  PostgreSQL full-text search.
- `GET /api/articles` — paginated, published-only public list, supports `?q=` full-text search.
- `GET /api/articles/:slug` — public single published article (404 for drafts/unknown slugs).
- `GET /api/articles/admin`, `GET /api/articles/admin/:id` — EDITOR+ listing/lookup including drafts.
- `POST /api/articles` (EDITOR+), `PATCH /api/articles/:id` (EDITOR+), `DELETE /api/articles/:id`
  (ADMIN only) — slug auto-generated and de-duplicated from title; `publishedAt` set on first
  transition to `PUBLISHED`.
- Server-side HTML sanitization (`sanitize-html`) on article body before persist.

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
- `Media`, `Event`, `Photo` Prisma models + migration (gallery: Year → Event → Photo hierarchy).
- `MinioService` — bucket auto-created on startup, structured object keys
  (`gallery/{year}/{eventId}/{variant}/{id}`), 1-hour presigned GET URLs generated at read time
  (no direct public bucket access).
- `POST /api/media/upload` (EDITOR+, multipart): MIME whitelist (JPEG/PNG/WebP), 20 MB limit,
  Sharp-generated small (300px)/medium (800px) WebP thumbnails + re-encoded original, all with
  EXIF metadata stripped. `DELETE /api/media/:id` (ADMIN) removes MinIO objects + DB row.
- `GET /api/gallery/years`, `GET /api/gallery/years/:year/events`, `GET /api/gallery/events/:id`,
  `GET /api/gallery/events/:id/photos` — public, paginated, photos include presigned media URLs.
- `POST /api/gallery/events` (EDITOR+), `PATCH /api/gallery/events/:id` (EDITOR+),
  `POST /api/gallery/events/:id/photos` (EDITOR+, attaches existing media to an event),
  `PATCH /api/gallery/events/:id/photos/reorder` (EDITOR+), `DELETE /api/gallery/photos/:id`
  (ADMIN, cascades to the underlying `Media` row + MinIO objects — orphan cleanup).
- Shared `PaginationDto` extracted to `common/dto`; `QueryArticlesDto` now extends it.
- `Technics` + `TechnicsPhoto` Prisma models + migration (equipment catalog with category enum
  `VEHICLE`/`PUMP`/`PERSONAL_GEAR`/`RESCUE_TOOL`/`COMMUNICATION`/`OTHER`, status `ACTIVE`/`RETIRED`,
  JSON `specs`, and a generic photo attachment table separate from the gallery's `Photo` model).
- `GET /api/technics` (public, paginated, filterable by `?category=`/`?status=`),
  `GET /api/technics/:id` (public, includes presigned photo URLs).
- `POST /api/technics` (EDITOR+), `PATCH /api/technics/:id` (EDITOR+), `DELETE /api/technics/:id`
  (ADMIN, cascades to attached photos/media/MinIO objects before deleting).
- `POST /api/technics/:id/photos/upload` (EDITOR+, multipart upload+attach in one call),
  `PATCH /api/technics/:id/photos/reorder` (EDITOR+), `DELETE /api/technics/photos/:photoId` (EDITOR+).
- `MediaService.upload()` generalized to take a storage-path `prefix` instead of gallery-specific
  `{year, eventId}`, so both the gallery and technics uploads share the same Sharp/MinIO pipeline.
- Helmet (CSP, HSTS, frame-ancestors `'none'`, etc.) on the backend; CORS locked to `FRONTEND_URL`
  with `credentials: true` instead of the previous allow-all default.
- CSRF double-submit cookie protection (`csrf-csrf`) on `/auth/refresh` and `/auth/logout` — the
  only cookie-authenticated mutating endpoints. `GET`-free; the token is issued alongside the
  access token on login/refresh (`{ accessToken, csrfToken }`) and must be echoed via
  `X-CSRF-Token` on those two routes.
- Stricter rate limits on file uploads (10 req/min on `/media/upload` and
  `/technics/:id/photos/upload`) on top of the existing global/login throttling.
- Upload content validation hardened: actual file-content sniffing (`file-type`) cross-checked
  against the MIME allowlist (rejects a malicious file renamed with an image extension), and Sharp
  processing errors are now caught and returned as a clean 400 instead of a 500.
- `UploadMediaDto` replaces unvalidated raw `@Body('eventId')`/`@Body('year')` fields on
  `POST /api/media/upload`.
- Optional ClamAV scan on uploads (`ClamAvService`, `CLAMAV_ENABLED` env flag, off by default) —
  fail-closed (rejects the upload) if enabled but clamd is unreachable. Compose service gated
  behind the `clamav` profile so it doesn't slow down default `docker compose up`.
- `SECURITY.md` — OWASP Top 10 walkthrough mapping each category to its mitigation in this codebase,
  plus a documented list of known gaps/accepted risk.

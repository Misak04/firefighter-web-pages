# Security

This document walks through the OWASP Top 10 (2021) and how each category is addressed in this
codebase. It's a living checklist — update it whenever a mitigation changes or a new one is added.

## A01: Broken Access Control

- `JwtAuthGuard` is global and **secure-by-default**: every route requires a valid access token
  unless explicitly marked `@Public()` (`backend/src/auth/guards/jwt-auth.guard.ts`).
- `RolesGuard` + `@Roles()` enforces the Role Matrix (`agents.md`) on every mutating endpoint —
  verified end-to-end per phase (EDITOR can create/update, only ADMIN can delete).
- Admin frontend routes are gated by `authGuard`; the access token lives in memory only, never
  `localStorage`, so it isn't exposed to XSS-driven `localStorage` scraping.

## A02: Cryptographic Failures

- Passwords hashed with `bcrypt` (cost factor 12).
- JWT access tokens (15 min) and refresh tokens (7 days, `httpOnly`/`Secure`/`SameSite=Strict`
  cookie) use distinct secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`), both required to be
  ≥32 chars via the `joi` env schema.
- All secrets (`JWT_*`, `CSRF_SECRET`, `MINIO_*`, DB/Redis credentials) come from environment
  variables — `.env` is gitignored, `.env.example` ships only placeholder values.
- HSTS enabled (`Strict-Transport-Security`, 2-year max-age, includeSubDomains, preload) via
  Helmet on both the backend and the frontend's Express SSR server.

## A03: Injection

- All database access goes through Prisma's parameterized query builder; the one raw SQL path
  (full-text search in `articles.service.ts`) uses `$queryRaw` tagged templates, which
  parameterize interpolated values — never string-concatenated SQL.
- `class-validator` DTOs + a global `ValidationPipe({ whitelist: true, transform: true })` reject
  unexpected fields and coerce/validate types on every request body.
- Article body HTML is sanitized server-side (`sanitize-html`) before persisting, stripping
  `<script>` and other dangerous markup (XSS-via-stored-content).
- Uploaded file content is verified against its actual magic bytes (`file-type`), not just the
  client-supplied `Content-Type` header, before being processed or stored.

## A04: Insecure Design

- Admin user creation is invite-only — there is no public signup endpoint.
- Refresh tokens are rotated on every use and revoked in Redis on logout/rotation, limiting the
  blast radius of a leaked refresh token.
- Account lockout after 10 failed login attempts within 15 minutes (Redis-backed counter).
- File uploads: MIME allowlist (JPEG/PNG/WebP), 20 MB size limit, EXIF stripped on all variants,
  optional ClamAV scan (fail-closed if enabled but unreachable).

## A05: Security Misconfiguration

- Helmet sets CSP, `X-Frame-Options`, HSTS, and related headers on both servers.
- CORS restricted to `FRONTEND_URL` (not a wildcard), with `credentials: true` only for that origin.
- Nginx blocks dotfile paths (`/.env`, `/.git`, `/.htaccess`, ...) and common scanner paths
  (`/wp-admin`, `/phpmyadmin`, `/xmlrpc.php`, ...) with a 404 rather than revealing they don't exist
  via a different error.
- No stack traces or internal error details are returned to clients in production (Nest's default
  exception filter; DTO validation errors are the only structured error detail exposed).

## A06: Vulnerable and Outdated Components

- Dependencies are pinned in `package-lock.json` for both projects.
- `npm audit` could not be run against a real registry in this sandboxed dev environment (it
  proxies through an internal mirror that doesn't support the audit endpoint) — **run
  `npm audit` in CI**, where it has real registry access, before each release.
- `sharp` is pinned to 0.33.x (0.34+ has a dual ESM/CJS typing hazard with this project's
  `tsconfig`, unrelated to security but worth knowing when bumping).

## A07: Identification and Authentication Failures

- bcrypt password hashing, JWT short-lived access tokens, rotating refresh tokens, lockout after
  repeated failures — see A02/A04.
- Rate limiting: 5 req/min on `/auth/login`, 10 req/min on file uploads, 30 req/min default
  (`@nestjs/throttler`).
- CSRF double-submit cookie protection on the cookie-authenticated endpoints (`/auth/refresh`,
  `/auth/logout`) — see `backend/src/auth/csrf.provider.ts`. Bearer-token-authenticated endpoints
  (everything else) are inherently CSRF-resistant since no ambient browser credential authorizes
  them.

## A08: Software and Data Integrity Failures

- `package-lock.json` committed for both projects — reproducible installs.
- Docker images build from a pinned base (`node:20-alpine`) in a multi-stage build; the final
  image contains only production dependencies (`npm ci --omit=dev`).
- Audit log (`AuditLog` table) records every login/refresh/logout attempt with success/failure,
  IP, and user — supports detecting tampering or abuse after the fact.

## A09: Security Logging and Monitoring Failures

- `AuditLog` covers authentication events today. Content mutation events (article/gallery/technics
  CRUD) are **not yet audit-logged** — tracked as a gap for a future phase if compliance requires it.
- Nest's default logger emits structured request/route logs; no external log aggregation is wired
  up yet (left to `infra-agent` / deployment phase).

## A10: Server-Side Request Forgery (SSRF)

- The backend makes no outbound requests based on user-supplied URLs — MinIO/Postgres/Redis
  endpoints are all from trusted environment configuration, never from request input.
- Presigned MinIO URLs are generated server-side from internally-stored object keys, never from
  client-supplied paths.

---

## Known gaps / accepted risk

- Content mutation (articles/gallery/technics) isn't audit-logged — only auth events are (A09).
- `npm audit` isn't runnable in this sandboxed dev environment — must be run in CI with real
  registry access before release (A06).
- Path parameters (`:id`) across most controllers aren't format-validated (e.g. `ParseUUIDPipe`);
  low risk since Prisma parameterizes all queries regardless of input shape — a malformed ID just
  produces a clean 404 rather than any injection — but worth tightening if this audit is revisited.

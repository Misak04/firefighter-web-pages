# FireFighter Web — Agent & Module Descriptions

## Project Overview

A modern firefighter unit website built with **Angular 18** (frontend) and **NestJS 10** (backend),
featuring a public-facing photo gallery, news/articles, equipment catalog, and a secure
administration panel. Security is a first-class concern throughout the stack.

---

## Core Agents / Modules

Each agent below represents a bounded domain in the application. In Claude Code multi-agent
workflows, each can be developed, tested, and deployed independently.

---

### 1. `auth-agent`
**Domain:** Authentication & Authorization

**Responsibilities:**
- JWT issuance (access token 15 min, refresh token 7 days via `httpOnly` cookie)
- User registration (admin-invite only — no public signup)
- Password hashing with `bcrypt` (cost factor ≥ 12)
- Role management: `ADMIN`, `EDITOR`, `VIEWER`
- Refresh token rotation and revocation (stored in Redis)
- Audit log: every login attempt (success/fail), IP, timestamp

**Stack:** NestJS + Passport.js + `@nestjs/jwt` + Redis

**Security surface:** Rate limiting on `/auth/login` (5 req/min), account lockout after 10 failures.

---

### 2. `articles-agent`
**Domain:** News, Event Reports, Articles

**Responsibilities:**
- CRUD for articles (title, body [rich text], author, tags, publish date, status: draft/published)
- Slug generation for SEO-friendly URLs
- Full-text search via PostgreSQL `tsvector`
- Featured image linking to media-agent
- Public read access, write restricted to EDITOR+

**Stack:** NestJS + Prisma + PostgreSQL

**Security surface:** DOMPurify sanitization on all rich-text body content before persist.

---

### 3. `gallery-agent`
**Domain:** Photo Gallery

**Responsibilities:**
- Hierarchical structure: Year → Event → Photos
- Photo metadata: title, description, event, date, uploader
- Thumbnail generation on upload (Sharp.js)
- Lazy-load pagination for public gallery
- Bulk upload support in admin
- EXIF data strip before public serving (privacy)

**Stack:** NestJS + Prisma + PostgreSQL (metadata) + MinIO (binaries)

**Security surface:** File type whitelist (JPEG, PNG, WebP only), max 20 MB per file,
MIME type verification (not just extension), optional ClamAV scan.

---

### 4. `media-agent`
**Domain:** File Storage & Serving

**Responsibilities:**
- Handles all binary uploads (photos, documents)
- Uploads to MinIO with structured bucket layout: `gallery/{year}/{event}/`
- Generates pre-signed URLs for secure serving (time-limited)
- Manages thumbnail variants (small 300px, medium 800px, original)
- Orphan cleanup: removes MinIO objects when DB records are deleted

**Stack:** NestJS + MinIO SDK + Sharp.js

**Security surface:** Pre-signed URLs expire in 1 hour; no direct public bucket access.

---

### 5. `technics-agent`
**Domain:** Equipment Catalog

**Responsibilities:**
- Catalog of firefighting equipment sorted by category:
  `VEHICLE`, `PUMP`, `PERSONAL_GEAR`, `RESCUE_TOOL`, `COMMUNICATION`, `OTHER`
- Each item: name, manufacturer, year acquired, description, specs (JSON), photos (linked to media-agent), status (active/retired)
- Public read, admin write
- Filter/search by category, status, year

**Stack:** NestJS + Prisma + PostgreSQL

---

### 6. `admin-agent` (Frontend)
**Domain:** Administration Panel (Angular)

**Responsibilities:**
- Protected route group `/admin/*` — JWT Guard
- Article editor (Quill or TipTap rich-text editor)
- Gallery manager: bulk upload, event/year tagging, delete
- Technics manager: CRUD for equipment catalog
- User management (ADMIN only): create users, assign roles, revoke access
- Audit log viewer

**Stack:** Angular 18 + PrimeNG + Angular Signals (state)

**Security surface:** Token stored in memory (not localStorage); all API calls via interceptor
that attaches bearer token; auto-logout on 401.

---

### 7. `public-agent` (Frontend)
**Domain:** Public-Facing Website (Angular)

**Responsibilities:**
- Home page: latest articles, featured events
- Gallery: year picker → event picker → photo lightbox
- Technics page: category tabs, equipment cards with photos
- Search bar (articles + technics)
- SEO: Angular SSR (Universal), Open Graph meta tags per article

**Stack:** Angular 18 (SSR) + PrimeNG + Angular Signals

---

### 8. `versioning-agent`
**Domain:** Content Revision History & Git Strategy

**Responsibilities:**
- Tracks every content change (articles, gallery events, technics items) in the database
- Stores full revision snapshots with editor identity and timestamp
- Exposes revision list and diff endpoints for the admin UI
- Handles restore-to-revision (creates new revision — history is never deleted)
- Prunes old revisions when count exceeds retention limit (50 per article)
- Git branch strategy: enforces section-scoped branches (`feature/articles-*`, `feature/gallery-*`, etc.)

**Revision models:**
- `ArticleRevision` — full title + body snapshot per edit
- `EventRevision` — gallery event name + description per edit
- `TechnicsRevision` — full JSON snapshot of item state per edit

**API surface:**
- `GET /admin/:section/:id/revisions` — list (EDITOR+)
- `GET /admin/:section/:id/revisions/:revId` — single revision (EDITOR+)
- `POST /admin/:section/:id/revisions/:revId/restore` — revert (ADMIN)

**Stack:** NestJS + Prisma + PostgreSQL

**Security surface:** Restore action is ADMIN-only and writes an audit log entry.
Revision data is read-only — no endpoint allows editing or deleting past revisions.

---

### 9. `infra-agent`
**Domain:** Infrastructure & Deployment

**Responsibilities:**
- Docker Compose: frontend, backend, PostgreSQL, Redis, MinIO, Nginx
- Nginx: reverse proxy, TLS termination, HSTS, rate limiting, static asset caching
- Automated PostgreSQL backups (daily dump to separate MinIO bucket)
- Health check endpoints: `/api/health`
- Environment secrets via `.env` (never committed) or Docker secrets
- Git repository configuration: branch protection rules, `.gitignore`, `.claude/settings.json` hooks

**Stack:** Docker + Nginx + Let's Encrypt (Certbot)

---

### 10. `testing-agent`
**Domain:** Test Strategy & Quality Gates

**Responsibilities:**
- Backend unit/integration tests for each NestJS agent (services, guards, controllers)
- Frontend unit tests for Angular components, services, and signals-based state
- End-to-end tests covering critical public and admin flows (login, article publish,
  photo upload, equipment CRUD, revision restore)
- Security-focused test cases: auth bypass attempts, role escalation, upload validation
  (MIME spoofing, oversized files), rate-limit enforcement
- Coverage thresholds enforced in CI (fails build below target, e.g. 80% on core agents)
- Test data/fixtures kept isolated from production data (seed scripts, not prod dumps)

**Stack:** Jest (NestJS backend), Angular Testing Library + Jasmine/Karma or Vitest (frontend),
Playwright or Cypress (e2e)

**Security surface:** E2E and integration suites must include negative-path tests (unauthorized
access, invalid input) for every endpoint listed in the Role Matrix — not just happy-path coverage.

---

## Agent Communication Map

```
Browser
  │
  ├─── public-agent (Angular SSR)  ──────► backend API (/api/*)
  │
  └─── admin-agent (Angular SPA)   ──────► backend API (/api/admin/*)
                                               │
                                    ┌──────────┼──────────────┐
                                    ▼          ▼              ▼
                             articles-agent  gallery-agent  technics-agent
                                    │          │
                                    ▼          ▼
                               PostgreSQL   MinIO
                                    │
                                  Redis (auth tokens, cache)
```

---

## Role Matrix

| Action | VIEWER | EDITOR | ADMIN |
|---|---|---|---|
| Read articles | ✅ | ✅ | ✅ |
| Create/edit articles | ❌ | ✅ | ✅ |
| Upload photos | ❌ | ✅ | ✅ |
| Delete photos/articles | ❌ | ❌ | ✅ |
| Manage equipment | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View audit log | ❌ | ❌ | ✅ |

---

## Git Branching Best Practices

1. **Never commit directly to `main`** — all work happens on a branch, merged via PR.
2. **Branch naming follows agent/domain scope:** `feature/<agent>-<short-desc>`,
   `fix/<agent>-<short-desc>`, e.g. `feature/articles-search`, `fix/gallery-upload-validation`.
3. **One branch per logical change** — keep branches small and focused on a single agent/domain
   where possible to simplify review and rollback.
4. **Rebase or merge `main` into your branch before opening a PR** to catch conflicts early.
5. **Delete branches after merge** — keep the branch list reflecting active work only.
6. **Protect `main`** — require PR review (or at minimum a passing build) before merge once
   CI is in place; never force-push to `main`.

---

## Security Principles

1. **Zero trust on uploads** — validate MIME, extension, size; strip EXIF
2. **Least privilege** — roles limit what each user can do; service accounts for MinIO
3. **Secrets out of code** — all credentials in environment variables
4. **Short-lived tokens** — access JWTs expire in 15 minutes
5. **Immutable audit trail** — admin actions cannot be deleted, only read
6. **Defense in depth** — Nginx blocks, NestJS Guards, Prisma parameterized queries all layer together

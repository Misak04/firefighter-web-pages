# FireFighter Web — Goals & Roadmap

## Vision

A fast, secure, and easy-to-maintain website for a local firefighter unit that lets members
showcase their work (gallery, articles, equipment) and lets administrators manage all content
without technical knowledge. Security and data privacy are non-negotiable requirements.

---

## Goals

### G1 — Public Presence
Present the unit professionally online with news, photo gallery, and equipment catalog.
Visitors should be able to browse without any account.

### G2 — Photo Gallery
A browsable gallery organized by year and event. Fast, mobile-friendly, with full-size viewing.
Photo upload, grouping, and deletion managed through the admin panel.

### G3 — Content Management
Editors can write, publish, and update articles without touching code or a database.
Rich-text editing, image embedding, draft/publish workflow.

### G4 — Equipment Catalog (Technics)
A structured catalog of all firefighting equipment (vehicles, pumps, gear) with photos,
specs, and status. Useful for internal reference and public transparency.

### G5 — Secure Administration
A role-based admin panel that only authorized users can access. Full audit trail of all
changes. No public self-registration.

### G6 — Security First
Every layer hardened: encrypted transport, input validation, rate limiting, XSS/CSRF protection,
secure file handling, and minimal attack surface.

### G7 — Low Maintenance
Self-hosted with Docker. Automated backups. Clear deployment docs. No vendor lock-in.

---

## Milestones & Roadmap

### Phase 0 — Foundation (Week 1–2)
> Goal: Repository structure, tooling, CI/CD skeleton, Docker environment running

- [x] Monorepo setup (Nx or separate `frontend/` + `backend/` dirs)
- [x] Docker Compose: PostgreSQL, Redis, MinIO, Nginx stubs
- [x] NestJS project bootstrap with Prisma + PostgreSQL connection
- [x] Angular 19 project bootstrap with PrimeNG + routing skeleton
- [x] Environment config pattern (`.env.example`, validation with `joi`)
- [x] Git repository + branch strategy (main/dev/feature)
- [x] Nginx config: reverse proxy + TLS placeholder

**Deliverable:** `docker compose up` starts all services; Angular and NestJS hello-world reachable.

---

### Phase 1 — Authentication & RBAC (Week 3–4)
> Goal: Secure login, roles, refresh tokens

- [x] User model in Prisma (id, email, passwordHash, role, createdAt, lastLogin)
- [x] `POST /auth/login` — bcrypt verify, issue JWT + refresh token
- [x] `POST /auth/refresh` — rotate refresh token
- [x] `POST /auth/logout` — invalidate refresh token in Redis
- [x] NestJS Guards: `JwtAuthGuard`, `RolesGuard`
- [x] Admin Angular module: login page, token interceptor, auto-logout on 401
- [x] Rate limiting on auth endpoints (5 req/min)
- [x] Audit log model + service (log every login/logout/failure)

**Deliverable:** Admin can log in, receives JWT, is rejected if token expired or role insufficient.

---

### Phase 2 — Articles Module (Week 5–6)
> Goal: Full CRUD for news/event reports with rich text

- [x] Article model: id, title, slug, body (text), status, authorId, publishedAt, featuredImageId
- [x] `GET /articles` — paginated public list (published only)
- [x] `GET /articles/:slug` — single article
- [x] `POST /articles` — create (EDITOR+)
- [x] `PATCH /articles/:id` — update (EDITOR+)
- [x] `DELETE /articles/:id` — delete (ADMIN only)
- [x] Full-text search: `GET /articles?q=`
- [x] Angular: public article list, article detail page, SEO meta tags
- [x] Admin: Quill/TipTap rich-text editor, draft/publish toggle
- [x] Server-side HTML sanitization (`sanitize-html`) on body before save

**Deliverable:** Editors can write, preview, and publish articles visible on homepage.

---

### Phase 3 — Media & Gallery Module (Week 7–9)
> Goal: Photo upload, thumbnail generation, year/event gallery

- [x] Media model: id, filename, originalUrl, thumbUrl (S, M), size, mimeType, uploadedById
- [x] Event model: id, name, year, description, coverPhotoId
- [x] Photo model: id, mediaId, eventId, title, sortOrder
- [x] `POST /media/upload` — multipart, validate MIME+size, Sharp thumbnails, MinIO store
- [x] `DELETE /media/:id` — delete from MinIO + DB (ADMIN)
- [x] `GET /gallery/years` — list distinct years
- [x] `GET /gallery/years/:year/events` — events for a year
- [x] `GET /gallery/events/:id/photos` — paginated photos
- [x] EXIF strip on all uploads (Sharp strips metadata by default unless `.withMetadata()` is called)
- [x] Angular: year selector → event grid → photo lightbox (PrimeNG Galleria)
- [x] Admin: bulk upload, event creation/assignment, photo reorder, delete

**Deliverable:** Full gallery browsable publicly; admin can upload and organize photos.

---

### Phase 4 — Technics Module (Week 10–11)
> Goal: Equipment catalog with categories and photos

- [x] Technics model: id, name, category (enum), manufacturer, yearAcquired, description, specs (JSON), status, photos[]
- [x] `GET /technics` — public list, filterable by category/status
- [x] `GET /technics/:id` — detail
- [x] `POST /technics` — create (EDITOR+)
- [x] `PATCH /technics/:id` — update (EDITOR+)
- [x] `DELETE /technics/:id` — delete (ADMIN)
- [x] Angular: category tabs, equipment cards, detail modal with photo gallery
- [x] Admin: CRUD form, photo attachment (direct upload+attach rather than a separate media-library
      browser, since no such browser exists elsewhere in the app yet)

**Deliverable:** Equipment catalog visible publicly, manageable in admin.

---

### Phase 5 — Security Hardening (Week 12)
> Goal: Production-grade security across all layers

- [ ] Helmet.js: CSP, X-Frame-Options, HSTS headers
- [ ] CORS: whitelist only own domain
- [ ] CSRF: double-submit cookie on all mutation endpoints
- [ ] `@nestjs/throttler` global + per-route limits
- [ ] Input validation audit: every DTO reviewed for missing validators
- [ ] File upload: ClamAV integration (optional, configurable)
- [ ] Secrets audit: no hardcoded values anywhere
- [ ] Nginx: block `/.env`, `/.git`, `/.htaccess`, common scanner paths
- [ ] Dependency audit: `npm audit`, update outdated packages
- [ ] Penetration test checklist walkthrough (OWASP Top 10)

**Deliverable:** Security checklist complete; no critical/high vulnerabilities.

---

### Phase 6 — Polish & Performance (Week 13–14)
> Goal: Fast, SEO-ready, mobile-friendly

- [ ] Angular SSR (Universal): pre-render article and gallery pages
- [ ] Lazy loading: image gallery uses IntersectionObserver
- [ ] Nginx static asset caching (immutable for fingerprinted assets)
- [ ] PostgreSQL: add indexes on slug, publishedAt, year, category
- [ ] Redis: cache `GET /articles` (TTL 60s), invalidate on write
- [ ] Lighthouse audit: target score ≥ 90 on Performance, Accessibility, SEO
- [ ] Mobile-first responsive design review
- [ ] Open Graph + Twitter Card meta on articles and gallery events

**Deliverable:** PageSpeed Insights score ≥ 90; SSR working for public pages.

---

### Phase 7 — Operations & Launch (Week 15–16)
> Goal: Production deployment, monitoring, backup

- [ ] Automated PostgreSQL backup: daily `pg_dump` to MinIO backup bucket (30-day retention)
- [ ] Nginx access + error log rotation
- [ ] Health check endpoint: `GET /api/health` (DB ping, MinIO ping, Redis ping)
- [ ] Uptime monitoring (UptimeRobot or self-hosted Uptime Kuma)
- [ ] Let's Encrypt TLS via Certbot + auto-renew
- [ ] Deployment runbook documented
- [ ] Admin user creation guide (no public signup — invite-only)
- [ ] Final smoke test on production

**Deliverable:** Site live, HTTPS, monitoring in place, backups verified.

---

### Phase 8 — Content Versioning & Git Strategy (v2, Week 1–3)
> Goal: Every content change is tracked, reversible, and auditable — both in the database and in git

#### Git Repository Strategy

```
main          ← production-ready, protected branch
  └── dev     ← integration branch
        ├── feature/articles-module
        ├── feature/gallery-module
        ├── feature/technics-module
        └── fix/...
```

- `main` requires PR + review before merge (no direct push)
- `dev` is the working branch; auto-deployed to staging via CI/CD
- Every logical code section (articles, gallery, technics, auth, infra) lives in its own feature branch
- Branch naming: `feature/<section>-<short-description>`, `fix/<section>-<issue>`

#### Automatic Commit Strategy (Development)

Claude Code is configured (`.claude/settings.json`) to auto-commit after every file edit or write
during development. The commit message includes the changed filenames:

```
auto: frontend/src/app/gallery/gallery.component.ts
auto: backend/src/articles/articles.service.ts articles.controller.ts
```

This creates a fine-grained history during development. Before opening a PR, squash
auto-commits into a single meaningful commit:

```bash
git rebase -i origin/dev   # squash auto: commits into one logical commit
```

#### Database Content Versioning (Application-Level)

Each major content section tracks revision history in the database. Editors can see the
full edit history and admins can revert to any previous version.

**Article Revisions:**
```
ArticleRevision
  id            UUID
  articleId     FK → Article
  title         String
  body          Text
  editedById    FK → User
  editedAt      DateTime
  revisionNote  String?       ← optional note from editor ("fixed typo", "updated photos")
```

- `GET /admin/articles/:id/revisions` — list all revisions (EDITOR+)
- `GET /admin/articles/:id/revisions/:revId` — view specific revision
- `POST /admin/articles/:id/revisions/:revId/restore` — restore to this version (ADMIN)
- Max revisions retained: 50 per article (older purged automatically)

**Gallery Event Revisions:**
```
EventRevision
  id            UUID
  eventId       FK → Event
  name          String
  description   String?
  editedById    FK → User
  editedAt      DateTime
```

Photo adds/deletes are already captured in the existing audit log — no separate revision
table needed for photos.

**Technics Item Revisions:**
```
TechnicsRevision
  id            UUID
  technicsId    FK → Technics
  snapshot      JSON          ← full item state at time of edit
  editedById    FK → User
  editedAt      DateTime
```

Using a JSON snapshot for technics avoids column-by-column diffing of the flexible `specs` field.

#### Admin UI for Versioning

- **Article editor**: "Version history" sidebar showing last N revisions with editor name, date, note
- **Diff view**: side-by-side comparison of any two revisions (highlight changed paragraphs)
- **Restore button**: one-click revert; creates a new revision (does not delete history)
- **Technics detail**: "Edit history" tab showing timestamp, editor, changed fields

#### Branch-per-Section in Practice

| Section | Branch prefix | Auto-commit trigger |
|---|---|---|
| Articles | `feature/articles-*` | Edit in `backend/src/articles/` or `frontend/src/app/articles/` |
| Gallery | `feature/gallery-*` | Edit in `backend/src/gallery/` or `frontend/src/app/gallery/` |
| Technics | `feature/technics-*` | Edit in `backend/src/technics/` or `frontend/src/app/technics/` |
| Auth | `feature/auth-*` | Edit in `backend/src/auth/` |
| Infra | `feature/infra-*` | Edit in `infra/`, `docker-compose.yml`, `nginx/` |

**Deliverable:** Full revision history in DB for articles, events, and technics. Git history
is clean and section-scoped. Admins can revert any content change without touching the database directly.

---

## Technology Stack Summary

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | Angular 19 (standalone) | Typed, scalable, SSR support |
| UI components | PrimeNG | Rich gallery, table, upload components |
| Frontend state | Angular Signals | Lightweight, built-in, modern |
| Backend framework | NestJS 10 | TypeScript, modular, decorator-based |
| ORM | Prisma | Type-safe, clean migrations, excellent DX |
| Database | PostgreSQL 16 | ACID, relational, full-text search |
| Cache / sessions | Redis 7 | Fast, refresh token store |
| File storage | MinIO | S3-compatible, self-hosted, free |
| Image processing | Sharp.js | Fast thumbnail generation, EXIF strip |
| Auth | Passport.js + `@nestjs/jwt` | Battle-tested JWT + refresh pattern |
| Rich text editor | TipTap (Angular) | Open-source, extensible |
| Reverse proxy | Nginx | TLS, caching, security headers |
| Containers | Docker + Docker Compose | Reproducible, portable deployment |
| TLS | Let's Encrypt + Certbot | Free, auto-renewing |

---

## Pros & Cons of This Architecture

### Pros
- **Full TypeScript** end-to-end: fewer runtime surprises, better refactoring
- **Self-hosted**: no monthly cloud bills for storage/DB; GDPR-friendly
- **Modular**: each domain (gallery, articles, technics) is independently testable
- **Security layered**: multiple independent security controls — compromise one, others hold
- **SSR ready**: Angular Universal makes articles and gallery indexable by search engines
- **Prisma migrations**: schema changes are versioned and auditable

### Cons
- **Infrastructure responsibility**: You own MinIO, PostgreSQL, Redis uptime and backups
- **Higher initial setup**: Docker + Nginx + Let's Encrypt takes more configuration than a hosted CMS
- **Angular learning curve**: Admin panel takes more effort than a Wordpress equivalent
- **Sharp/MinIO ops**: Thumbnail regeneration or bucket migration needs manual tooling
- **No built-in CDN**: Photos served through Nginx — under heavy traffic, a CDN would be needed

### Mitigations
- **Backup automation** covers the infrastructure risk (Phase 7)
- **Docker Compose** keeps the "ops overhead" manageable for a single unit
- **PrimeNG** handles most UI complexity out of the box
- **Cloudflare free tier** can be added as CDN/DDoS protection in front of Nginx at no cost

---

## Suggested Features (v2 and beyond)

Features worth building after the core v1 is stable, grouped by area. Each has a brief
rationale for why it adds value to a firefighter unit website specifically.

---

### Public Information & Engagement

| Feature | Value | Complexity |
|---|---|---|
| **Intervention statistics** | Annual count of incidents by type (fire, flood, rescue, accident) shown as charts. Builds public trust and demonstrates unit activity. | Medium |
| **Interactive station map** | Leaflet.js map showing station location, coverage area, and nearby hydrant points. Useful for residents. | Low |
| **Recruitment / Join Us page** | Static page describing how to volunteer, requirements, training process. Critical for attracting new members. | Low |
| **Contact form** | Simple form with CAPTCHA → email delivery (Nodemailer). Public can reach the unit without exposing an email address. | Low |
| **Sponsors & Partners section** | Logo wall with links for municipal sponsors, equipment donors. Often required to show gratitude publicly. | Low |
| **Achievements & Competitions** | Records from firefighter sport competitions (CTIF, national), training results, awards. Unit pride and history. | Medium |
| **Unit history / About page** | Founding year, milestones, notable events. Humanizes the unit for visitors. | Low |
| **Emergency contacts block** | Sticky sidebar or footer with 112, local dispatch, station phone. Safety-critical for visitors. | Low |
| **Download center** | Public documents: annual reports, regulations, recruitment forms as PDFs. Admins upload; public download. | Medium |
| **RSS feed for articles** | Auto-generated feed from published articles. Lets citizens subscribe to unit news. | Low |
| **Video gallery** | YouTube/Vimeo embed or self-hosted videos organized by event, alongside photo gallery. | Medium |

---

### Member & Internal Features

| Feature | Value | Complexity |
|---|---|---|
| **Member portal (private)** | Login-required area for active members: duty schedule, internal docs, contact directory. | High |
| **Duty roster / shift schedule** | Who is on call this week. Can be public (name only) or private (full contact). | Medium |
| **Training records** | Track each member's certifications, expiry dates, training courses completed. Admin-only view. | High |
| **Internal document library** | Private section for SOPs, maps, internal reports — only visible after member login. | Medium |
| **Member directory** | Private contact list: name, phone, rank, specialization. Access control: member+ only. | Medium |
| **Incident log (internal)** | Detailed after-action reports per intervention, visible only to members. Separate from public news articles. | High |

---

### UX & Accessibility

| Feature | Value | Complexity |
|---|---|---|
| **Dark mode** | CSS custom properties toggle. Increasingly expected; reduces eye strain at night. | Low |
| **WCAG 2.1 AA accessibility** | Screen reader support, keyboard navigation, sufficient color contrast. Required for public sector in many countries. | Medium |
| **Cookie consent banner** | GDPR compliance for EU visitors. Only needed if analytics/tracking is added. | Low |
| **Print-friendly article view** | `@media print` CSS — allows members to print event reports cleanly. | Low |
| **PWA (Progressive Web App)** | Installable on mobile home screen, offline caching for key pages. Useful for members checking the site in the field. | Medium |

---

### Notifications & Communication

| Feature | Value | Complexity |
|---|---|---|
| **Email notification system** | Notify subscribers (or members) when a new article is published. Nodemailer + subscription list. | Medium |
| **Push notifications (PWA)** | Browser push for breaking news or emergency announcements. Requires service worker + push server. | High |
| **Newsletter subscription** | Public can subscribe to a monthly digest of articles. Requires double opt-in (GDPR). | Medium |
| **Social media feed embed** | Show latest Facebook or Instagram posts on homepage. Easy engagement without leaving the site. | Low |

---

### Administration & Analytics

| Feature | Value | Complexity |
|---|---|---|
| **Site analytics dashboard** | Self-hosted Umami or Matomo (privacy-first, no cookies, GDPR-safe). Track page views, popular articles. | Medium |
| **Content scheduling** | Schedule articles to auto-publish at a future date/time. Useful for prepared anniversary posts. | Low |
| **Article categories & tags** | Organize articles by topic (fire, flood, training, competition) for filtering. | Low |
| **Event calendar** | Public calendar of planned events, training sessions, public demonstrations. Integrated with articles. | Medium |
| **SEO metadata editor** | Per-article custom Open Graph title, description, and image override in admin. | Low |
| **Multi-language support (i18n)** | Czech + Slovak (or English) for units near borders or with international guests. Angular i18n. | High |
| **2FA for admin accounts** | TOTP (Google Authenticator / Aegis) for admin login. Significant security upgrade. | Medium |
| **Admin activity reports** | Weekly summary email to ADMIN: articles published, photos uploaded, logins. | Medium |

---

## Out of Scope (v1)

The following features are explicitly deferred from the initial release. They are documented
here so they are not accidentally designed around, but also not forgotten.

### Deferred to v2 (recommended next after launch)
- **Contact form** — Low complexity, high value; build early in v2
- **Intervention statistics** — Builds public trust; needs data model design first
- **Recruitment page** — Static content, easy win for volunteer acquisition
- **Article categories & tags** — Improves navigation once article count grows
- **Content scheduling** — Useful once editors are actively publishing
- **2FA for admin accounts** — Should be prioritized in v2 given security focus
- **Dark mode** — Low effort, high user satisfaction

### Deferred to v3 (member features)
- **Member portal** — Requires separate auth flow, role extension, and significant UI work
- **Duty roster / shift schedule** — Depends on member portal being in place first
- **Training records** — Requires member portal + complex data model
- **Internal document library** — Requires member portal + private storage buckets in MinIO
- **Incident log (internal)** — Separate from public articles; needs own data model and access controls

### Lower priority (evaluate after v2)
- **Email notification / newsletter** — Needs SMTP server, double opt-in flow, unsubscribe management
- **Push notifications** — Complex service worker setup; PWA baseline first
- **Video gallery** — Storage and bandwidth costs; YouTube embed is simpler alternative
- **Event calendar** — Nice to have; evaluate if unit runs regular public events
- **Multi-language support (i18n)** — High effort; only worth it if the unit has international visitors
- **Mobile app** — Angular PWA covers 90% of mobile use cases without a native app
- **Comments on articles** — Moderation burden outweighs benefit for a small unit; link to Facebook instead
- **Matomo / Umami analytics** — Useful but not day-one critical; add once content is published
- **Interactive map** — Leaflet is easy but needs accurate geodata for the coverage area

### Explicitly out of scope (not planned)
- Native iOS / Android app (PWA is sufficient)
- Payment processing / donations (legal/financial complexity for a volunteer unit)
- Live emergency dispatch feed (real-time systems require separate licensed infrastructure)
- External API integrations (weather, municipal open data) — unless a clear use case emerges

# FireFighter Web

Web pages of the local volunteer firefighter station — a public-facing site (news, photo
gallery, equipment catalog) with a secure administration panel.

See [agents.md](agents.md) for the full module/architecture breakdown and [ROADMAP.md](ROADMAP.md)
for the phased build plan.

## Stack

- **Frontend:** Angular 19 (SSR) + PrimeNG + Angular Signals
- **Backend:** NestJS 10 + Prisma + PostgreSQL
- **Storage:** MinIO (binaries), Redis (auth tokens, cache)
- **Infra:** Docker Compose + Nginx

## Project layout

```
backend/    NestJS API (Prisma + PostgreSQL)
frontend/   Angular 19 SSR app
infra/      Nginx config, certs
```

## Getting started

1. Copy the environment template and fill in real secrets:
   ```
   cp .env.example .env
   ```
2. Start the full stack:
   ```
   docker compose up
   ```
3. Backend health check: `http://localhost:3000/api/health`
4. Frontend: `http://localhost:4000`
5. Seed an initial admin user: `cd backend && npx prisma migrate dev && npx ts-node prisma/seed.ts`
   (admin-invite only — there is no public signup)

For local development without Docker, see `backend/README.md` and `frontend/README.md`.

## Git workflow

Branch naming and merge rules are documented in [agents.md](agents.md#git-branching-best-practices) —
never commit directly to `main`.

## Changelogs

- [backend/CHANGELOG.md](backend/CHANGELOG.md)
- [frontend/CHANGELOG.md](frontend/CHANGELOG.md)

## Security

See [SECURITY.md](SECURITY.md) for the OWASP Top 10 walkthrough and known gaps.

# Deploying SplitEase (100% free)

SplitEase runs as three free services — no credit card required anywhere:

| Piece | Service | Why |
|-------|---------|-----|
| Frontend (React) | **Vercel** — `splitease` project | Static build, global CDN, SPA rewrites |
| API (Express) | **Vercel** — `splitease-api` project | Serverless function, no cold-start bills, zero config |
| Database | **Neon** — free tier | Free forever Postgres with pooling |

```
Browser ──> Vercel (frontend: splitease-red.vercel.app)
              │  VITE_API_URL
              └──> Vercel (API: splitease-api-gamma.vercel.app) ──> Neon (PostgreSQL)
```

> **Realtime note:** Socket.IO needs a long-lived process, which serverless
> functions don't have. The frontend detects a failed socket connection and
> automatically falls back to polling the API every 15 s while the tab is
> visible (`frontend/src/hooks/useSocket.js`), so groups still update live.
>
> **Rate limiting** is per-function-instance on serverless, so limits are
> approximate — fine for a demo, and `trust proxy = 1` keeps the IP keying
> correct behind Vercel's edge.

## 1. Database (Neon) — already provisioned

- Project: `rough-water-70006351` (`SplitEase`, region `aws-ap-southeast-1`)
- Connection string is stored as the `DATABASE_URL` secret on the
  `splitease-api` Vercel project.
- Migrations run automatically on every cold start
  (`backend/api/index.js` → `backend/src/migrate.js`), so there is no manual
  schema step. Seed data (demo users) is loaded via `npm run db:seed`.

## 2. API (Vercel project `splitease-api`)

- Entry: `backend/api/index.js` (serverless handler that rewrites the path via
  the `__orig` query parameter and exports the Express app).
- Routing: `backend/vercel.json` rewrites `/api/*` into the function.
- Env vars (Production): `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
  (comma-separated frontend origins for CORS).
- Deploy:

  ```bash
  cd backend
  npx vercel link --project splitease-api   # already linked
  npx vercel deploy --prod
  ```

- Live URL: <https://splitease-api-gamma.vercel.app> —
  health check: `/api/health`

## 3. Frontend (Vercel project `splitease`)

- Env var: `VITE_API_URL=https://splitease-api-gamma.vercel.app`
  (baked in at build time — update it **before** building if the API URL ever
  changes).
- Deploy:

  ```bash
  cd frontend
  npx vercel deploy --prod
  ```

- Live URL: <https://splitease-red.vercel.app>

## Environment variables

| Var | Set on | Needed for |
|-----|--------|------------|
| `DATABASE_URL` | splitease-api | Neon Postgres connection (must include `?sslmode=require`) |
| `JWT_SECRET` | splitease-api | Signing auth tokens |
| `JWT_EXPIRES_IN` | splitease-api (optional) | Token lifetime, defaults to `7d` |
| `FRONTEND_URL` | splitease-api | CORS allow-list — frontend origin(s) |
| `VITE_API_URL` | splitease | Base URL of the API (baked in at build time) |

## Costs

All three services are on free tiers with no credit card: Vercel Hobby
(frontend + functions), Neon Free (0.5 GB Postgres). Expected monthly cost:
**$0**.

## Fallback: single-service deploy

`render.yaml` still describes a Render-only setup where one web service serves
both the API and the built React app from the same origin (leave
`FRONTEND_URL` blank in that case). See the git history of this file for the
old Render walkthrough.

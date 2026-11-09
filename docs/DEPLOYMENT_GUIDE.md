# GAWAZ INN 2.0 — Deployment & Operations Guide

## 1. Runtime & System Requirements
- **Node.js:** `v24.19.0+` (leverages built-in `node:sqlite` for zero-C++-build local persistence and tests)
- **Package Manager:** `npm` (`11.x`)
- **Frontend Build:** Vite 8 + TypeScript 7 (`tsc -b && vite build`)
- **Browser Testing:** Local Chromium/Chrome binary (`C:\Program Files\Google\Chrome\Application\chrome.exe` or `CHROME_PATH` env var)

---

## 2. Environment Variables (`.env.example`)
To be initialized in Stage 1 without committing secrets:
- `NODE_ENV=development|production|test`
- `PORT=3001` (Backend API port; Vite proxies `/api` -> `http://localhost:3001` in dev)
- `DB_DRIVER=sqlite|postgres` (defaults to `sqlite` -> `.data/gawazinn.db`)
- `DATABASE_URL=` (Optional PostgreSQL connection string for production cloud / Supabase)
- `SESSION_SECRET=` (Cryptographic secret for signing CSRF/session tokens; dev defaults safely with console notice, required in production)
- `APP_ORIGIN=http://localhost:5173` (Production: `https://gawazinn.vercel.app`)
- `VITE_API_BASE_URL=/api/v1` (Set to `demo` or omit backend when running purely static preview fallback)
- `VITE_SUPPORT_WHATSAPP=` (Official Egyptian hotline/WhatsApp E.164 without `+`, placeholder clearly marked if not finalized)
- `AI_PROVIDER_API_KEY=` *(Optional)* Enables generative natural-language synthesis over grounded DB tool results; otherwise deterministic grounded engine responds.

---

## 3. Local Development & Verification Commands (Planned Stage 1 Scripts)
- `npm run dev` — Starts both Vite frontend (`:5173`) and Node API server (`:3001`) or split `dev:web` / `dev:api`.
- `npm run db:migrate` — Applies SQLite SQL migrations sequentially and verifies schema foreign keys.
- `npm run db:seed` — Populates idempotent realistic Egyptian demo baseline (users across roles with `scrypt` demo credentials clearly labeled, products, categories, locations, packages, articles, vendors).
- `npm run lint` — Runs `oxlint` across `src/`, `shared/`, `server/`.
- `npm run typecheck` — Runs `tsc -b`.
- `npm run test` — Executes `vitest run` (unit + SQLite/API integration tests).
- `npm run test:e2e` — Builds/starts stack and executes headless Chrome verification across Desktop (`1440x900`) & Mobile (`375x812`).
- `npm run build` — Compiles production bundle (`dist/`).

---

## 4. Production Deployment Paths
### Option A — Vercel Full-Stack (`dist/` + Serverless `/api` + Managed PostgreSQL)
1. Provision managed PostgreSQL (Supabase / Neon / Vercel Postgres) and execute `db/migrations/postgres/*.sql` + seed script.
2. Configure Vercel environment variables: `DB_DRIVER=postgres`, `DATABASE_URL`, `SESSION_SECRET`, `APP_ORIGIN=https://gawazinn.vercel.app`.
3. `vercel.json` routes `/api/*` to serverless entry `api/index.ts` and rewrites SPA client routes to `index.html` while serving `/robots.txt` and `/sitemap.xml`.

### Option B — Node Container / VPS (SQLite WAL or PostgreSQL)
1. Run `npm run build` and launch `node server/index.ts` serving both `/api/v1/*` and static `dist/` with persistent disk mounted to `.data/gawazinn.db` + scheduled SQLite `.backup()` snapshots.

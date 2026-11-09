# GAWAZ INN 2.0 — Engineering Decision Log

Every major technical, architectural, and product decision is recorded here with its rationale and consequences.

---

### ADR-001: Embedded `node:sqlite` + PostgreSQL Parity Migrations for Backend Engine
- **Date:** 2026-11-09 (Stage 0)
- **Context:** The existing repository has zero backend, zero database, and runs on Windows with Node `v24.19.0` (which ships native built-in `node:sqlite` without requiring Python/MSVC native addon compilation). Simultaneously, Vercel serverless production cannot persist local files across cold starts.
- **Decision:** Build the primary backend API (`server/`) using `node:sqlite` (`DatabaseSync`, `PRAGMA foreign_keys = ON`, WAL mode) for zero-dependency real relational execution in dev, tests, and VPS deployments, alongside synchronized PostgreSQL migrations (`db/migrations/postgres/`) and a repository abstraction for Vercel/Supabase cloud deployment.
- **Consequences:** Real SQL constraints, transactions, ownership checks, and migrations run immediately and deterministically inside CI/local tests while staying production-portable to PostgreSQL. Static-only previews without an attached API host remain explicitly labeled as local/demo fallback.

### ADR-002: Strict Preservation of Red & White (`#D91B3E` / `#FFFFFF`) Visual Identity
- **Date:** 2026-11-09 (Stage 0)
- **Context:** `SplashHome` and active feature views establish a cohesive Red & White romantic/Egyptian design identity (`Cairo`/`Tajawal`/`Outfit` fonts), whereas five unreferenced files (`Hero.tsx`, `FourSectionsGrid.tsx`, etc.) contain an obsolete Navy/Gold (`#17243A` / `#C6A66B`) design.
- **Decision:** Remove/quarantine the orphaned Navy/Gold legacy files and Vite template leftovers in Stage 1, standardize all design tokens in `DESIGN_SYSTEM_REFERENCE.md`, and strictly build all 21 modules and Admin OS inside the approved Red & White aesthetic using Tailwind logical properties (`start-*`, `end-*`, `ps-*`, `pe-*`) with physical centering fixes where RTL Tailwind transforms conflict.

### ADR-003: Shared Core (`shared/`) for Zod Schemas, RBAC & All 20 Smart Calculators
- **Date:** 2026-11-09 (Stage 0)
- **Context:** Calculating savings projections, finishing per-sqm tiers, kitchen meters, and budget allocations separately in React UI vs. backend API causes drift and validation bypasses.
- **Decision:** House TypeScript interfaces, Zod request/response schemas, RBAC policy definitions, and all 20 deterministic calculator engines in `shared/` so frontend instant previews, Vitest unit tests, server validation, and grounded AI assistant tool calls invoke identical verified math.

### ADR-004: URL-Driven Navigation via `react-router-dom` + Route-Level `React.lazy()` Code Splitting
- **Date:** 2026-11-09 (Stage 0)
- **Context:** Current bundle (`524.79 kB`) already exceeds Vite's 500 kB chunk warning while covering only 4 pillars with non-linkable `useState` navigation.
- **Decision:** Adopt `react-router-dom` with semantic Arabic/English-ready URL slugs (`/encyclopedia/*`, `/calculators/*`, `/products/*`, `/vendors/*`, `/locations/:gov/*`, `/early-start/*`, `/my/*`, `/admin/*`), dynamic `<SeoHead />` JSON-LD management, and lazy-loaded route chunks from Stage 1 onward.

### ADR-005: `scrypt` Passwords + `SHA-256` Database Sessions + Strict Customer Financial Privacy
- **Date:** 2026-11-09 (Stage 0)
- **Context:** Baseline 1.0 auto-logged visitors in, leaked unowned records in `CustomerPortalView`, and stored plaintext National IDs.
- **Decision:** Implement native `crypto.scrypt` password hashing, `SHA-256`-hashed `HttpOnly` cookie/Bearer sessions stored in `sessions`, explicit `user_id` ownership enforcement on every query, masked `nationalId` display (`298********678`), and explicit couple workspace partner consent before sharing budget or journey access. Even platform admins cannot browse private customer `savings_goals` amounts unless aggregated anonymously.

### ADR-006: Grounded AI Assistant via Tool-Calling Over Real DB & Calculators
- **Date:** 2026-11-09 (Stage 0)
- **Context:** Unconstrained LLM prompts risk hallucinating non-existent prices, vendor reviews, or financial guarantees.
- **Decision:** Design the AI Assistant (Stage 10) around mandatory tool execution over real platform SQL queries and `shared/calculators/`. Every recommendation links directly to real DB entities, cites price timestamps/estimate labels, never accesses another user's private savings, and defaults gracefully to a deterministic grounded planner when external LLM API keys are unconfigured.

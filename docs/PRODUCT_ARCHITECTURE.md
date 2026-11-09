# GAWAZ INN 2.0 — Target Product & System Architecture

## 1. Architectural Strategy (Least-Disruptive Full-Stack Evolution)
1. **Preserve & Extend Frontend Stack:** Keep React 19 + TypeScript + Vite 8 + Tailwind CSS v4 and the approved Red & White design system (`#D91B3E`, `#FFFFFF`, `#FAF7F2`, `#1C1819`).
2. **Add Real Backend API (`server/`) & Relational Database:**
   - Node.js `v24.19.0` includes native `node:sqlite` (`DatabaseSync`), eliminating native C++ build tool failures on Windows while providing real ACID transactions, foreign keys (`PRAGMA foreign_keys = ON`), indexes, unique constraints, and SQL migrations.
   - Maintain **100% SQL schema parity** with PostgreSQL migrations (`db/migrations/postgres/`) so production deployments on Vercel + Supabase/Neon/Postgres require only setting `DATABASE_URL` and swapping the repository driver.
   - Expose REST API endpoints under `/api/v1/*` proxied cleanly through `vite.config.ts` in local dev/test, with an explicit Vercel Serverless entry adapter (`api/index.ts`).
3. **Shared Pure Domain & Calculation Engine (`shared/`):**
   - Pure TypeScript domain types, Zod validation schemas, and **all 20 financial/finishing/trousseau calculator formulas** live in `shared/`. Both frontend UI and backend API import the exact same validation and calculation logic—zero formula duplication or client/server mismatch.
4. **URL Routing & Code Splitting (`src/router/`):**
   - Introduce `react-router-dom` with semantic crawlable paths (`/`, `/early-start`, `/encyclopedia/...`, `/calculators/...`, `/marketplace/...`, `/locations/...`, `/my/...`, `/vendor/...`, `/admin/...`) and route-level `React.lazy()` code splitting to keep initial bundle size lean (`< 300 kB`).
5. **Modular Frontend State:**
   - Replace the monolithic `AppContext` God-object with focused domain hooks/contexts (`AuthContext`, `LocaleContext`, `CartContext`, `JourneyContext`, `NotificationContext`) backed by a centralized `ApiClient` (`src/lib/apiClient.ts`) with transparent connection-status awareness.

## 2. Layered System Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     React 19 + Vite 8 Client (RTL AR / LTR EN)          │
│  Router + SEO Head Manager + Lazy Views + Design System Components      │
│  Domain Contexts (Auth, Locale, Journey, Cart) -> ApiClient (/api/v1)   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ HTTPS / JSON + HttpOnly Cookie / Bearer
┌──────────────────────────────────▼──────────────────────────────────────┐
│              Shared Pure Core (`shared/`)                               │
│  Zod Schemas │ 20 Calculator Formulas │ RBAC Roles │ Domain Types       │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│              Node/TypeScript API Server (`server/` & `api/`)            │
│  Auth (scrypt + HMAC Session) │ RBAC Guard │ Rate Limiter │ Audit Log  │
│  Route Modules: auth, journey, finance, encyclopedia, calculators,      │
│    products, vendors, rfq, bookings, community, content, homecare,      │
│    ai, admin, seo                                                       │
├──────────────────────────────────┬──────────────────────────────────────┤
│  Repository Layer (`server/db/`) │ Integration Adapters (`integrations/`)│
│  - SQLite (`node:sqlite`, local) │ - Email (SMTP/Resend stub+interface) │
│  - Postgres parity SQL (`db/`)   │ - WhatsApp / Payments / Maps / LLM   │
└──────────────────────────────────┴──────────────────────────────────────┘
```

## 3. Navigation & Information Architecture (Target IA)
Preserving the single-row crisp Red/White header (`Header.tsx`) with clean dropdown menus (`hover`/`click` accessible) + mobile drawer:
- **الرئيسية (Home):** Red/White 4-pillar Splash Hero + quick stage switcher / Early Start entry + featured tools strip (preserving the immediate visual purity of the approved homepage).
- **الموسوعة (Encyclopedia):** Apartment Finishing (22 categories + materials + packages + Before/After) · Groom's Prep · Bride's Prep · Wedding Guide · Married Life · Glossary.
- **خطط واحسب (Plan & Calculate):** Early Start (My Future Fund) · Smart Calculators (20 tools) · Marriage Budget · Engagement Planner · Wedding Journey Planner.
- **السوق والموردين (Marketplace):** Products & Comparisons · Vendors Directory · Wedding Services (`فرحي`) · Installments · Request a Quote (RFQ).
- **اكتشف والمحلي (Discover & Local):** Articles & Guides · My Wedding Story · Community Q&A · Experts · Local Governorate Guides · Home Care.
- **جواز إن الخاص بي (My Gawaz Inn):** Personal 17-tab workspace + Shared Couple Workspace + Vendor Portal (for vendor accounts) + Admin OS (for admin/moderator/editor accounts).


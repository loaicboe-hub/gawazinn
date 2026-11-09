# GAWAZ INN 2.0 — API Reference Specification

Base URL: `/api/v1`  
Format: JSON (`application/json`), UTF-8, standardized envelope:
- Success: `{ ok: true, data: ..., meta?: { page, limit, total } }`
- Error: `{ ok: false, error: { code: string, message: string, details?: unknown } }`

## Authentication & Security Endpoints
- `POST /api/v1/auth/register` — Validate email/phone/password (Zod), hash via `scrypt`, create session cookie + token.
- `POST /api/v1/auth/login` — Authenticate credentials, verify account status, issue session, write `audit_logs`.
- `POST /api/v1/auth/logout` — Invalidate session token in DB.
- `GET /api/v1/auth/me` — Return authenticated user profile & preferences (no `password_hash`).
- `PATCH /api/v1/auth/me` — Update profile, language, or onboarding journey stage.

## Core Content, Encyclopedias & Local SEO
- `GET /api/v1/bootstrap` — Initial app hydration (`user` nullable, products, packages, services, categories, locations, published articles, settings).
- `GET /api/v1/categories` — Filter by `domain` (`finishing|groom|bride|wedding|married_life|early_start|editorial`).
- `GET /api/v1/articles` & `GET /api/v1/articles/:slug` — Published CMS articles, guides, and reviews (`domain`, `contentType`, `q` search, atomic `view_count` increment).
- `GET /api/v1/locations` & `GET /api/v1/locations/:govSlug` — Egyptian location hierarchy + local providers.
- `GET /api/v1/encyclopedia/bundle` *(Stage 2)* — Combined hydration payload returning finishing categories, materials, before/after projects, contractors, groom subcategories & configurable packages, bride categories & checklist templates, glossary terms, and FAQs.
- `GET /api/v1/finishing/categories`, `GET /api/v1/finishing/materials`, `GET /api/v1/finishing/projects`, `GET /api/v1/contractors` *(Stage 2)* — Granular finishing encyclopedia endpoints (`?phase=`, `?group=`, `?governorate=`, `?tier=`, `?specialty=` filters).
- `GET /api/v1/groom/encyclopedia`, `GET /api/v1/bride/encyclopedia` *(Stage 2)* — Groom (`?group=`) & Bride (`?group=`) subcategories, templates & checklists.
- `GET /api/v1/glossary`, `GET /api/v1/faqs` *(Stage 2)* — Bilingual glossary & FAQ directory (`?domain=`, `?q=` search).
- `GET/PUT /api/v1/my/groom-plan`, `GET/PUT /api/v1/my/bride-plan` *(Stage 2, Auth-Required)* — Strict owner-scoped SQLite persistence with Zod validation & audit logs.

## Calculators & Financial Planning
- `GET /api/v1/calculators` *(Stage 3 Public)* — Returns catalog summaries & field metadata for all 20 Smart Calculators (`?group=finishing_home|trousseau_celebration|finance_planning`).
- `POST /api/v1/calculators/:slug/calculate` *(Stage 3 Public + Optional Save)* — Server-validated execution of `shared/calculators/` calculation engine; if `saveRun: true`, saves snapshot to `calculator_runs` for authenticated users (`401` if guest).
- `GET /api/v1/my/calculator-runs` & `DELETE /api/v1/my/calculator-runs/:id` *(Stage 3 Auth-Required)* — Strict owner-scoped history of saved calculator snapshots.
- `GET /api/v1/budget/overview`, `PATCH /api/v1/budget/plan` *(Stage 3 Auth-Required)* — Hydrates owner's Wedding Budget Manager (KPIs, overrun/80% warnings, category breakdowns, all expenses) and updates budget limits, expected wedding date, groom/bride ratio, & emergency reserve.
- `POST/PATCH /api/v1/budget/categories` & `/:id` *(Stage 3 Auth-Required)* — Custom budget buckets and planned/limit cap management.
- `POST/PATCH/DELETE /api/v1/budget/expenses` & `/:id` *(Stage 3 Auth-Required)* — Full planned/upcoming/paid expense tracking, payment confirmation (`mark paid`), and side attribution (`groom|bride|shared|family`).
- `POST /api/v1/budget/import-from-calculator` *(Stage 3 Auth-Required)* — Atomic run of `shared/calculators/` linked straight into `budget_categories`/`budget_expenses` (`add_planned_expense`, `set_planned`, or `add_deposit` modes).
- `POST /api/v1/budget/sync-transactions` *(Stage 3 Auth-Required)* — Idempotent sync importing paid/pending orders and wedding hall bookings into `budget_expenses` without duplicating (`idx_budget_expense_source_dedup`).
- `GET /api/v1/early-start/academy` *(Stage 4 Public + Optional Auth)* — Returns the 10-module Early Start Academy curriculum plus `completedSlugs` when signed in (`[]` for guests).
- `GET /api/v1/early-start/overview`, `PUT /api/v1/early-start/profile` *(Stage 4 Auth-Required)* — Private owner-scoped Early Start dashboard metrics, 6m–10y horizon selector, streak length, cumulative trajectory, private badges, milestones, and goal progress.
- `POST/PATCH/DELETE /api/v1/early-start/goals` & `/:id`, `POST /api/v1/early-start/goals/:id/contributions` *(Stage 4 Auth-Required)* — CRUD over the 7 Future Fund savings buckets, atomic deposit logging, balance recalculation, and private milestone badge awards.
- `POST/PATCH/DELETE /api/v1/early-start/milestones` & `/:id`, `POST /api/v1/early-start/academy/:slug/complete` *(Stage 4 Auth-Required)* — Preparation milestone management and Academy lesson completion toggle (`audit_logs` recorded, zero public savings exposure).

## Personal Journey & Shared Workspace
- `GET/POST/PATCH/DELETE /api/v1/journey/tasks` — Tasks, dependencies, checklists, timeline phases.
- `POST /api/v1/workspace/invite`, `POST /api/v1/workspace/accept/:token`, `DELETE /api/v1/workspace/members/:id` — Explicit partner collaboration & revocation.

## Products, Shopping Lists & Price Intelligence
- `GET /api/v1/products`, `GET /api/v1/products/:idOrSlug`, `POST /api/v1/products/compare` — Catalog search, filtering, price history, alternatives.
- `GET/POST/PATCH/DELETE /api/v1/shopping-lists` & `/items` — Multi-list baskets + price alerts.
- `GET/POST /api/v1/orders` — Validated order creation (recomputing totals server-side from DB prices).

## Vendors, RFQ Engine & Appointments
- `GET /api/v1/vendors`, `GET /api/v1/vendors/:slug`, `POST /api/v1/vendors/register`
- `GET/PATCH/POST /api/v1/vendor-portal/*` — Owner-guarded vendor profile, services, promotions, CRM leads, subscription info.
- `POST /api/v1/rfq` (Customer), `GET /api/v1/rfq` (Owner or authorized matched vendor only), `POST /api/v1/rfq/:id/quotes` (Vendor), `POST /api/v1/rfq/:id/quotes/:quoteId/decide` (Customer accepts/rejects, linking to budget).
- `GET/POST/PATCH /api/v1/appointments` — Slot booking & explicit vendor confirmation/reschedule/cancel.

## Community, Stories, AI, Wedding Day & Home Care
- `GET/POST /api/v1/community/questions`, `POST /:id/answers`, `POST /:id/vote`, `POST /api/v1/community/reports`
- `GET/POST /api/v1/stories` — Customer wedding stories (public shows `approved` only).
- `GET /api/v1/experts` — Verified expert directory.
- `POST /api/v1/ai/assist` — Grounded assistant querying live DB catalogs + calculators + user's own authorized journey context.
- `GET/POST/PATCH/DELETE /api/v1/wedding-day/*` (invitations, public `/rsvp/:code`, guests, tables, schedule, registry).
- `GET/POST/PATCH/DELETE /api/v1/home-care/*` (inventory, warranties, maintenance reminders, home documents).

## Administration (`Admin OS`, RBAC-guarded)
- `GET /api/v1/admin/analytics` — Real DB aggregates (users by stage, RFQs, response rates, conversions, content reads).
- `GET/PATCH /api/v1/admin/vendors/:id/verify` — Verification review separated from billing.
- `GET/POST/PATCH/DELETE /api/v1/admin/cms/*` — Articles, categories, materials, local pages.
- `GET/PATCH /api/v1/admin/moderation/*` — Stories, community questions/answers/reports, expert credential verification.
- `GET/PATCH /api/v1/admin/commercial/*` — Subscription plans & commission settings.
- `GET /api/v1/admin/audit-logs` — Immutable security & moderation log.


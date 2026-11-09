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
- `POST /api/v1/calculators/:slug/calculate` — Server-validated execution of shared calculation engine (`shared/calculators/`) + optional saved run for authenticated users.
- `GET /api/v1/early-start/goals` / `POST` / `PATCH /:id` / `DELETE /:id` — Owner-only future goals & My Future Fund.
- `POST /api/v1/early-start/goals/:id/contributions` — Atomic transaction incrementing goal savings, recording contribution history, updating streak & awarding badges.
- `GET/POST/PATCH/DELETE /api/v1/budget/plans`, `/categories`, `/expenses` — Personal/workspace budget manager with idempotent `(source_type, source_id)` linking.

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


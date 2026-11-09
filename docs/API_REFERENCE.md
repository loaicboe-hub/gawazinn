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

## Lifecycle Onboarding, Engagement, Journey & Shared Workspace *(Stage 5 Auth-Required)*
- `POST /api/v1/onboarding/stage` — Non-destructive transition across all 11 lifecycle stages (`thinking..maintaining_home`), writing `user_lifecycle_history` and preserving all prior plans & budgets.
- `GET /api/v1/my/hub` — Aggregated 17-module My Gawaz Inn Command Center hydration (profile, lifecycle history, engagement overview, journey overview, couple workspace + incoming invitations, documents, warranties, appointments, notifications, orders, finishing/wedding/financing records, wishlist count).
- `GET /api/v1/engagement/overview`, `PUT /api/v1/engagement/plan`, `POST /api/v1/engagement/items`, `PATCH/DELETE /api/v1/engagement/items/:id` — Owner-isolated Engagement Readiness Planner & typed checklist/ring/guest/budget items.
- `GET /api/v1/journey/tasks`, `POST /api/v1/journey/tasks`, `PATCH/DELETE /api/v1/journey/tasks/:id`, `POST /api/v1/journey/tasks/:id/comments` — 10-phase Journey Planner with permission enforcement, prerequisite `dependencyWarning` checks, and threaded comments.
- `GET/PATCH /api/v1/workspace`, `POST /api/v1/workspace/invite`, `POST /api/v1/workspace/invitations/:token/accept|decline`, `PATCH/DELETE /api/v1/workspace/members/:id`, `POST /api/v1/workspace/approvals`, `PATCH /api/v1/workspace/approvals/:id` — Explicit partner invitation tokens (matching recipient email/phone enforced), 9-flag permissions control, one-click revocation, and purchase approvals.
- `GET/POST /api/v1/my/documents`, `DELETE /api/v1/my/documents/:id` — Documents locker enforcing owner visibility for `isSharedWithPartner = false` and workspace visibility only when explicitly marked shared.
- `GET/POST /api/v1/my/warranties`, `DELETE /api/v1/my/warranties/:id` — Appliance/home warranty expiration tracker.
- `GET/POST /api/v1/my/appointments`, `PATCH /api/v1/my/appointments/:id` — Showroom, contractor site-visit, and hall tour scheduling.
- `POST /api/v1/my/notifications/read-all`, `POST /api/v1/my/notifications/:id/read` — Read-status management for user alerts and workspace invitations.

## Products, Shopping Lists & Price Intelligence *(Stage 6 Implemented)*
- `GET /api/v1/products` — Catalog search & filtering (`?type=` / `?trousseauType=`, `?category=`, `?brand=`, `?energyRating=`, `?maxPrice=`, `?q=`, `?sort=` / `?sortBy=price_asc|price_desc|warranty_desc`).
- `GET /api/v1/products/compare` & `POST /api/v1/products/compare` — Side-by-side up-to-4 product matrix computation (`highlights`, `unifiedSpecKeys`, `offersByProductId`).
- `GET /api/v1/products/:idOrSlug` — Complete product encyclopedia payload (`product`, timestamped `priceHistory`, official/gray-market `merchantOffers`, curated `alternatives`).
- `GET/POST /api/v1/shopping-lists`, `PATCH/DELETE /api/v1/shopping-lists/:id`, `POST /api/v1/shopping-lists/:id/items`, `PATCH/DELETE /api/v1/shopping-list-items/:itemId` *(Auth-Required)* — Multi-list private vs. partner-shared baskets honoring `isSharedWithPartner` and workspace `shoppingRead`/`shoppingWrite` RBAC permissions.
- `GET/POST /api/v1/price-alerts`, `DELETE /api/v1/price-alerts/:id` *(Auth-Required)* — User price-drop watchlist triggered automatically when `PATCH /api/v1/admin/products/:id` lowers catalog pricing, creating an unread `budget_alert` notification.
- `GET/POST /api/v1/orders` — Validated order creation (recomputing totals server-side from DB prices).

## Vendors Marketplace, Verification Governance & Local SEO *(Stage 7 Implemented)*
- `GET /api/v1/vendor-categories` — Lists all 17 structured wedding & home sectors (`finishing|groom|bride|wedding|post_marriage`) with bilingual buyer checklists.
- `GET /api/v1/subscription-plans` — Lists commercial plans (`free|basic|professional|premium`) detailing service, promo & portfolio limits (strictly commercial; never alters verification).
- `GET /api/v1/vendors` — Search & filter marketplace businesses (`?domain=`, `?category=`, `?governorate=`, `?verification=registered|verified|trusted`, `?priceTier=`, `?planCode=`, `?q=`, `?sort=` / `?sortBy=verification_desc|price_asc|price_desc|rating_desc|featured_commercial`). Excludes `rejected` listings from public view.
- `GET /api/v1/vendors/:slug` — Public business detail payload (services, promotions, authentic reviews, verification docs/audit notes) with honest zero-rating representation (`reviewsCount: 0`, `ratingAvg: 0`) and automatic view increment.
- `POST /api/v1/vendors/register` *(Auth-Required)* — Self-registers a new vendor profile locked initially to `verificationStatus = 'registered'` and `plan_free`.
- `POST /api/v1/vendors/:slug/reviews` *(Auth-Required)* — Customer review submission blocking owner self-reviews (`403 SELF_REVIEW_FORBIDDEN`) and duplicate user reviews (`409 DUPLICATE_REVIEW`), dynamically recomputing `rating_avg` & `reviews_count`.
- `GET /api/v1/locations/:govSlug/:catSlug` — Dynamic Governorate × Category SEO guide (120m² regional cost range benchmark, category buyer checklist, vetted matching vendors, local district children).
- `GET /api/v1/vendor-portal/overview`, `PATCH /api/v1/vendor-portal/profile`, `POST/DELETE /api/v1/vendor-portal/services`, `POST/DELETE /api/v1/vendor-portal/promotions`, `POST /api/v1/vendor-portal/subscription` *(Owner-Guarded RBAC)* — Enforces strict owner/admin checks when `?vendorId=` targets a business (`403 FORBIDDEN`), enforces commercial plan service/promo/portfolio quotas (`403 PLAN_QUOTA_EXCEEDED`), creates billing ledger records (`vendor_billing_records`), and preserves existing `verificationStatus`.
- `GET /api/v1/admin/vendors`, `PATCH /api/v1/admin/vendors/:id/verify`, `GET /api/v1/admin/subscription-plans`, `PATCH /api/v1/admin/subscription-plans/:id`, `GET /api/v1/admin/audit-logs` *(Full Admin RBAC)* — Audit-only verification governance decoupled from commercial plans + plan quota/price configurator + immutable `audit_logs` feed.

## Multi-Vendor RFQ Engine, Slot Appointments & Vendor CRM *(Stage 8 Implemented)*
- `GET /api/v1/rfq` & `GET /api/v1/rfq/:id` *(Auth-Required)* — Customer views their RFQs with side-by-side quote comparison and vendor-threaded Q&A; authorized vendors receive strictly scoped RFQ access containing zero competitor quotes or competitor threads (`403` for non-invited users).
- `POST /api/v1/rfq` *(Auth-Required)* — Creates structured RFQ, auto-matches up to 6 verified/eligible vendors (`selectMatchedVendorsForRfq`) by category & governorate (+ optional `targetVendorId`), generates `rfq_invitations` & `vendor_leads`, and notifies matched vendor owners.
- `POST /api/v1/rfq/:id/quotes` *(Invited Vendor Owner / Admin)* — Submits or updates sealed quotation (`amountEgp`, `depositAmountEgp`, `estimatedDuration`, `warrantyMonths`, `scopeSummary`, `validUntil`), advances vendor lead to `quotation_sent`, and notifies customer.
- `POST /api/v1/rfq/:id/quotes/:quoteId/decide` *(RFQ Customer Owner)* — Rejects or atomically accepts winning quote (guarding `409 RFQ_ALREADY_ACCEPTED`), marks winning CRM lead `accepted` and losing open leads `lost`, notifies winning vendor, and idempotently upserts `source_type = 'rfq_quote'` expense into `budget_expenses`.
- `POST /api/v1/rfq/:id/messages` *(Participant Scoped)* — Posts confidential message on explicit `(rfq_id, vendor_id)` thread.
- `GET /api/v1/appointments`, `POST /api/v1/appointments`, `PATCH /api/v1/appointments/:id` *(Auth-Required)* — Slot booking scheduling (`requested`), customer reschedule/cancel (blocks customer self-confirm with `403 CUSTOMER_CANNOT_CONFIRM`), and vendor confirmation/completion syncing CRM activities and notifications.
- `GET /api/v1/vendor-portal/crm`, `GET /api/v1/vendor-portal/rfqs`, `GET /api/v1/vendor-portal/appointments`, `POST /api/v1/vendor-portal/crm/leads`, `PATCH /api/v1/vendor-portal/crm/leads/:leadId`, `POST /api/v1/vendor-portal/crm/leads/:leadId/activities` *(Owner-Guarded RBAC)* — Full 8-stage CRM pipeline, KPI totals, stage transitions, and activity timeline feed.

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


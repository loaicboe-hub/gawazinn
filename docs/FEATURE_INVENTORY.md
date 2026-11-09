# GAWAZ INN — Feature Inventory & Implementation Tracker (Updated After Stage 4)

Status legend:
- **Working Full-Stack (SQLite + API + UI)**: Persisted in SQLite via authenticated/validated `/api/v1/*` routes, tested in Vitest & Chrome E2E.
- **Working (UI + Local Persistence)**: Interactive in browser and saved to `localStorage`.
- **Partial / Ephemeral**: Renders UI, lacks persistence, server validation, or full flows.
- **Missing**: Scheduled in upcoming roadmap stages.

## 1. Core & Stage 1–4 Implemented Features

| Module / Component | Location | Status | Notes |
|---|---|---|---|
| Intro & Red/White Splash Home | `IntroSplashScreen.tsx`, `SplashHome.tsx` | **Working** | Original 2x2 visual entry preserved; quick access discovery pills to **Early Start**, encyclopedias, **20 Calculators**, **Budget Manager**, and portal. |
| Header, Footer & Navigation | `Header.tsx`, `Footer.tsx` | **Working** | Compact desktop LTR/RTL navbar (`<= 1440px` safe), Early Start announcement strip pill + account shortcut, encyclopedia dropdowns, **Calculators**, & `/my/budget` / `/my/future-fund` shortcuts. |
| Early Start & My Future Fund (Module A) | `shared/earlyStartData.ts`, `server/earlyStartService.ts`, `EarlyStartDashboardView.tsx` | **Working Full-Stack** | Up to 10-year timelines (`10y..6m` + custom), 7 My Future Fund buckets, deposit streak tracking, SVG trajectory, What-If simulator, private non-public badges, 10-module Academy & preparation milestones with `noindex` privacy protection. |
| Unified 20 Smart Calculators (Module G) | `shared/calculators/*`, `CalculatorsHubView.tsx`, `CalculatorDetailView.tsx` | **Working Full-Stack** | All 20 deterministic live calculators (`finishing-cost` to `emergency-buffer`) with transparent formulas, saved snapshots (`calculator_runs`), & 1-click export to Budget Manager. |
| Wedding Budget Manager (Module H) | `BudgetManagerView.tsx`, `server/budgetService.ts` | **Working Full-Stack** | Real KPIs, overrun alerts (80%/100%), category cap editors, paid/upcoming/planned tracking, idempotent order/booking sync, CSV BOM export & print view. |
| Finishing Hub & Encyclopedia (Module C) | `FinishingView.tsx`, `FinishingEncyclopediaView.tsx`, `FinishingQuoteModal.tsx` | **Working Full-Stack** | 22 sequential stages, 10 materials (`priceUpdatedAt`), 4 packages synced to quote modal, governorate Before/After gallery, sample contractors directory (`reviewsCount: 0`), deep links to Finishing Calculators. |
| Groom's Trousseau & Encyclopedia (Module D) | `GroomView.tsx`, `GroomEncyclopediaView.tsx` | **Working Full-Stack** | 26 subcategories, interactive `100k–500k` slot configurator + optional exclusion + custom items saved to `user_groom_plans` (`GET/PUT /api/v1/my/groom-plan`), fixed RTL compare bar. |
| Bride's Trousseau & Planner (Module E) | `BrideView.tsx`, `BrideEncyclopediaView.tsx` | **Working Full-Stack** | 19 categories, 24 checklists, compact/balanced/extended presets, quantity steppers, missing-essentials detection, saved to `user_bride_plans` (`GET/PUT /api/v1/my/bride-plan`). |
| Content Hub, Glossary & FAQs (Module O) | `EncyclopediaHubView.tsx`, `ArticleDetailView.tsx`, `GlossaryFaqView.tsx` | **Working Full-Stack** | 13 categories, 12 bilingual CMS articles (`view_count` tracked + direct calculator pills), 28 glossary terms, 12 FAQs, specialized guides hub. |
| Wedding Planner (`فرحي`), Installments, Social Support | `WeddingPlannerView.tsx`, `FinancingView.tsx`, `SocialSupportView.tsx` | **Working Full-Stack** | Bookings, installments with masked/hashed 14-digit NID (`national_id_masked`), calculator cross-links, and confidential support cases scoped to user/admin. |
| Auth, RBAC, Orders & SEO | `server/app.ts`, `server/security.ts`, `SeoHead.tsx` | **Working Full-Stack** | `scrypt` + HMAC sessions, RBAC, server-recomputed order totals + stock decrement, dynamic `/sitemap.xml` (including Early Start & all 20 calculators), `robots.txt`, JSON-LD. |

## 2. Upcoming GAWAZ INN 2.0 Modules (Stages 5–12)
- **Module B, I, J (Stage 5 — Next):** 11-Stage Lifecycle Onboarding, Engagement Planner, Full Wedding Journey Planner (`journey_tasks` dependencies/owners/phases/comments), Full 17-module My Gawaz Inn + Shared Couple Workspace
- **Module K (Stage 6):** Product Encyclopedia, Price Intelligence, Multi-list Shopping Baskets & Price Alerts
- **Module L, M, N, U (Stages 7–8):** Verified Vendor Directory, Location SEO, RFQ Engine, Appointments & Vendor CRM
- **Module O/P + Admin OS (Stage 9):** My Wedding Story, Community Q&A, Expert Directory, Full Admin Analytics/CMS/Moderation
- **Module Q, R, S (Stage 10):** Grounded AI Assistant, Smart Room Designer & Moodboards, Wedding Day Ops (RSVP/Guests/Seating/Registry)
- **Module T (Stage 11):** Married Life & Home Care Directory, Newlyweds Guide, Digital Home File, Warranty Tracker, Maintenance Reminders


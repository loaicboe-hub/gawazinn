# GAWAZ INN — Feature Inventory & Implementation Tracker (Updated After Stage 2)

Status legend:
- **Working Full-Stack (SQLite + API + UI)**: Persisted in SQLite via authenticated/validated `/api/v1/*` routes, tested in Vitest & Chrome E2E.
- **Working (UI + Local Persistence)**: Interactive in browser and saved to `localStorage`.
- **Partial / Ephemeral**: Renders UI, lacks persistence, server validation, or full flows.
- **Missing**: Scheduled in upcoming roadmap stages.

## 1. Core & Stage 1–2 Implemented Features

| Module / Component | Location | Status | Notes |
|---|---|---|---|
| Intro & Red/White Splash Home | `IntroSplashScreen.tsx`, `SplashHome.tsx` | **Working** | Original 2x2 visual entry preserved; quick access to sections, encyclopedias, portal, and calculators. |
| Header, Footer & Navigation | `Header.tsx`, `Footer.tsx` | **Working** | Expanded Red/White dropdown navigation (`/finishing/encyclopedia`, `/groom/encyclopedia`, `/bride/encyclopedia`, `/glossary`, `/faqs`, `/discover`, etc.), outside-click menu close, RTL/LTR toggle. |
| Finishing Hub & Encyclopedia (Module C) | `FinishingView.tsx`, `FinishingEncyclopediaView.tsx`, `FinishingQuoteModal.tsx` | **Working Full-Stack** | 22 sequential stages, 10 materials (`priceUpdatedAt`), 4 packages synced to quote modal, governorate Before/After gallery, sample contractors directory (`reviewsCount: 0`). |
| Groom's Trousseau & Encyclopedia (Module D) | `GroomView.tsx`, `GroomEncyclopediaView.tsx` | **Working Full-Stack** | 26 subcategories, interactive `100k–500k` slot configurator + optional exclusion + custom items saved to `user_groom_plans` (`GET/PUT /api/v1/my/groom-plan`), fixed RTL compare bar. |
| Bride's Trousseau & Planner (Module E) | `BrideView.tsx`, `BrideEncyclopediaView.tsx` | **Working Full-Stack** | 19 categories, 24 checklists, compact/balanced/extended presets, quantity steppers, missing-essentials detection, saved to `user_bride_plans` (`GET/PUT /api/v1/my/bride-plan`). |
| Content Hub, Glossary & FAQs (Module O) | `EncyclopediaHubView.tsx`, `ArticleDetailView.tsx`, `GlossaryFaqView.tsx` | **Working Full-Stack** | 13 categories, 12 bilingual CMS articles (`view_count` tracked), 28 glossary terms, 12 FAQs, specialized guides hub. |
| Wedding Planner (`فرحي`), Installments, Social Support | `WeddingPlannerView.tsx`, `FinancingView.tsx`, `SocialSupportView.tsx` | **Working Full-Stack** | Bookings, installments with masked/hashed 14-digit NID (`national_id_masked`), and confidential support cases scoped to user/admin. |
| Auth, RBAC, Orders & SEO | `server/app.ts`, `server/security.ts`, `SeoHead.tsx` | **Working Full-Stack** | `scrypt` + HMAC sessions, RBAC, server-recomputed order totals + stock decrement, dynamic `/sitemap.xml`, `robots.txt`, JSON-LD. |

## 2. Upcoming GAWAZ INN 2.0 Modules (Stages 3–12)
- **Module A (Stage 4):** Early Start (10-year timelines, My Future Fund, Savings/What-If calculators, Streaks/Badges, Academy)
- **Module B, I, J (Stage 5):** Engagement Planner, Wedding Journey Planner, Full 17-module My Gawaz Inn + Shared Couple Workspace
- **Module G, H (Stage 3 — Next):** Unified 20 Smart Calculators + Wedding Budget Manager (`/calculators`, `/my/budget`)
- **Module K (Stage 6):** Product Encyclopedia, Price Intelligence, Multi-list Shopping Baskets
- **Module L, M, N, U (Stages 7–8):** Verified Vendor Directory, Location SEO, RFQ Engine, Appointments & Vendor CRM
- **Module O/P + Admin OS (Stage 9):** My Wedding Story, Community Q&A, Expert Directory, Full Admin Analytics/CMS/Moderation
- **Module Q, R, S (Stage 10):** Grounded AI Assistant, Smart Room Designer & Moodboards, Wedding Day Ops (RSVP/Guests/Seating/Registry)
- **Module T (Stage 11):** Married Life & Home Care Directory, Newlyweds Guide, Digital Home File, Warranty Tracker, Maintenance Reminders


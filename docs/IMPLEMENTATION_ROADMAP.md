# GAWAZ INN 2.0 — 12-Stage Dependency-Aware Implementation Roadmap

Execution Policy: Every stage completes **Implement → Lint/Typecheck → Unit Tests → Integration Tests → Browser E2E & Visual Verification → Fix → Regression → Docs Update → Git Checkpoint** before advancing.

---

## Stage 0 — Investigation & Baseline *(Current)*
- Repository, git, dependency, and live website (`https://gawazinn.vercel.app/`) audit.
- Baseline build (`tsc -b && vite build`) & lint (`oxlint`) verification.
- Headless Chrome verification of live site (desktop 1440px & mobile 375px).
- Deliver Phase Zero & Architecture docs (`PROJECT_AUDIT.md`, `CURRENT_ARCHITECTURE.md`, `DESIGN_SYSTEM_REFERENCE.md`, `FEATURE_INVENTORY.md`, `TECHNICAL_RISKS.md`, `IMPLEMENTATION_ROADMAP.md`, plus full Section 18 architecture baselines).

## Stage 1 — Core Architecture, Database, Auth, Routing & Content Foundation
- Install core tooling cleanly (`react-router-dom`, `zod`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `playwright-core` dev/test harness).
- Clean up baseline defects: fix 404 image (`bride-p1`), fix RTL compare bar (`GroomView`), quarantine/remove unused Vite starter assets (`App.css`, `react.svg`, `vite.svg`) & orphaned Navy/Gold files, fix modal state syncing & English translations.
- Build real Backend API (`server/`) with SQLite (`node:sqlite`), migration runner, PostgreSQL parity migrations (`db/migrations/`), `scrypt` auth + HMAC signed sessions + RBAC middleware + rate limiting + audit logs.
- Build URL Router (`src/router/`) with `React.lazy` code splitting, SEO head/JSON-LD/breadcrumb infrastructure, `robots.txt` + `sitemap.xml`, expanded Red/White Header & Footer navigation, and CMS/Content & Localization foundations.

## Stage 2 — Complete Encyclopedia & Knowledge Hub (Modules C, D, E, O, U Foundations)
- Apartment Finishing Encyclopedia: all 22 categories, Material Encyclopedia (specs, pros/cons, alternatives, price ranges with `lastUpdatedAt`), 4 Finishing Packages (Economic, Medium, Luxury, Ultra Luxury), Before & After Gallery, Contractors/Engineers Directory.
- Groom's Preparation Encyclopedia (all appliance, furniture, household categories + configurable 100k/200k/300k/500k/custom packages).
- Bride's Trousseau Encyclopedia (all 19 categories, complete checklist, quantities, missing-item detection).
- Wedding Encyclopedia, Glossary, FAQs, Editorial Articles & Related Links (Article ↔ Calculator ↔ Product ↔ Vendor).

## Stage 3 — Unified Smart Calculators & Financial Engine (Modules G, H)
- Build centralized, pure, unit-tested calculation engine (`shared/calculators/`) covering all **20 required calculators** (Total Marriage Budget, Finishing, Groom Appliances, Bride Trousseau, Gold/Jewelry, Wedding Cost, Furniture, Kitchen Setup, Bathroom Setup, Room-by-Room, Flooring Quantities, Paint Quantities, Kitchen Cost/Meter, Electricity Consumption, Moving, Honeymoon, Installments, Monthly Savings, Long-Term Projections, Emergency Reserve).
- Build unified Calculator Center UI (`/calculators` and `/calculators/:slug`) with transparent formulas, assumptions, validation, and "Generate Checklist / Save to Budget" integration.
- Build Wedding Budget Manager (`/my/budget`) with planned vs. actual, deposits, upcoming payments, category limits, overruns, CSV/print-PDF export, and transaction de-duplication.

## Stage 4 — Early Start & Long-Term Pre-Marriage Preparation (Module A)
- **GAWAZ INN EARLY START** experience supporting 10, 7, 5, 3, 2, 1 years, 6 months, or custom timeframes.
- **My Future Fund**: multi-goal tracking (Marriage Prep, Apartment Purchase, Finishing, Furniture, Appliances, Wedding, Emergency Reserve), contribution logging, progress charts, monthly reports.
- Interactive **Savings Calculator** & **Side-by-Side What-If Simulator** (`1,000` vs `3,000 EGP/mo`, annual increases, marriage delay, cost inflation).
- **Motivation System** (private streaks, milestones, achievement badges, reminders — zero public comparison).
- **Early Start Academy** (10 educational modules) & strict server-side privacy ownership enforcement.

## Stage 5 — Personal Journey Planner & My Gawaz Inn Workspace (Modules B, I, J, Section 6)
- Lifecycle Stage Onboarding (11 stages) with stage transitions preserving all historical data.
- **Engagement Planner** (budget, checklist, timeline, ring/gifts, venue, guest list, family coordination, expenses).
- **Wedding Journey Planner** (12m, 9m, 6m, 3m, 1m, final week, wedding day, post-wedding; dependencies, assignee Bride/Groom/Shared, calendar view, reminders).
- **My Gawaz Inn** 17-module personal workspace + **Shared Couple Workspace** with explicit partner email/token invitations, permission controls, comments, purchase approvals, and access revocation.

## Stage 6 — Product Encyclopedia & Shopping Intelligence (Module K)
- Expanded structured product database with specifications, energy consumption, warranty, pros/cons, alternatives, merchant listings, and source/timestamped price history.
- Multi-product side-by-side comparison table across technical specs, dimensions, capacity, and best-use recommendations.
- Multi-list Shopping Baskets (notes, supplier comparison, convert to RFQ or Order), Price Alerts, and Saved Lists.

## Stage 7 — Vendor Marketplace & Local Discovery SEO (Modules L, U)
- Complete Vendor Directory across all 17 categories + Egyptian Location hierarchy (`Egypt -> Governorate -> City -> District -> Area`: Cairo, Giza, Alexandria, Mansoura, Tanta, etc.).
- Meaningful local SEO pages (`/locations/:governorate/:category`) with genuine content, breadcrumbs, and `LocalBusiness` JSON-LD.
- Vendor Profiles, Galleries, Services, Products, Promotions, Reviews, Honest Verification Tiers (`Registered`, `Verified`, `Trusted`, `Featured` decoupled from paid plans), and WhatsApp contact.
- Dedicated **Vendor Portal** & **Admin Verification / Plan Config** (Free, Basic, Professional, Premium).

## Stage 8 — RFQ Engine, Appointments, Bookings & Vendor CRM (Modules L, M, N)
- Full **Request for Quotation (RFQ)** lifecycle: user submits request with category/location/budget/specs → matched authorized vendors view & quote → user compares quotes side-by-side → asks questions → accepts/rejects → accepted quote links to Budget & Journey without duplicating transactions.
- **Appointments & Bookings** foundation: available vendor time slots, booking requests, explicit vendor confirmation workflow (`pending -> confirmed -> rescheduled -> cancelled -> completed`), vendor calendar.
- **Vendor CRM Lead Pipeline** (`New Lead -> Contacted -> Quotation Sent -> Negotiation -> Accepted -> In Progress -> Completed -> Lost`) with notes, follow-up dates, and activity history.

## Stage 9 — Community, Editorial Expansion & Admin OS Completion (Modules O, P, Section 7)
- **My Wedding Story** (user cost breakdowns + photos + lessons learned with moderation workflow).
- **GAWAZ INN Community** (Q&A, categories, comments, likes, helpful answers, user reports, moderation queue).
- **Expert Directory** with credential verification workflow.
- Full **GAWAZ INN Admin OS**: CMS Admin, Marketplace/Verification Admin, User/Privacy Admin (restricting unnecessary private financial exposure), Commercial/Subscriptions/Commissions Admin, and Analytics Center powered by real DB queries.

## Stage 10 — AI Assistant, Smart Home Tools & Wedding-Day Ops (Modules Q, R, S)
- **GAWAZ INN AI Assistant**: grounded RAG/tool-calling architecture querying real platform products, vendors, calculators, and user journey context (with safe deterministic local planner engine + optional LLM provider adapter via env key, enforcing all 10 AI rules).
- **Smart Room Designer** (2D floor plan/room dimensions & furniture placement canvas), **Material Explorer**, **Moodboards** (palettes, themes, saved ideas), and **Price Intelligence** alerts/history.
- **Wedding Day Management**: Digital Invitations + personalized RSVP links, Guest Management, Seating Planner (tables & capacity), Wedding Day Schedule, and Gift Registry (reservations + payment adapter boundary).

## Stage 11 — Beyond Wedding: Married Life & Home Care (Module T)
- **Home Care Directory** (Cleaning, Plumbing, Electricity, AC Maintenance, Appliance Repair, Pest Control, Moving, Carpentry, Kitchen Maintenance, Interior Upgrades).
- **Newlyweds Guide** (household budgeting, organization, energy saving, appliance care).
- **Digital Home File** (invoices, model numbers, supplier contacts, paint codes, finishing materials, furniture dimensions).
- **Warranty Tracker** (start/expiration dates, alerts), **Maintenance Reminders**, **Home Inventory**, and **Moving Planner**.

## Stage 12 — Full-System Stabilization, Security Audit & Release Readiness
- End-to-end regression suite across all user, vendor, expert, moderator, and admin journeys.
- Database integrity, authorization boundary penetration checks, privacy checks, XSS/SQLi/CSRF review.
- Desktop + Mobile responsive verification across all routes, SEO audit (`sitemap.xml`, `robots.txt`, JSON-LD, meta tags), performance/bundle audit, build verification, and final technical readiness report.


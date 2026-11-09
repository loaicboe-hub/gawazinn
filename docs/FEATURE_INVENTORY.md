# GAWAZ INN — Existing Feature Inventory (Baseline `9c2fd04`)

Status legend:
- **Working (UI + Local Persistence)**: Interactive in browser and saved to `localStorage`.
- **Partial / Ephemeral**: Renders UI, but lacks persistence, server validation, full flows, or has defects.
- **Unreachable**: Implemented in codebase, not accessible via UI links.
- **Orphaned**: Unused component from prior design iteration.
- **Missing**: Required in GAWAZ INN 2.0 specification, not yet built.

## 1. Existing Implemented Features

| Module / Component | Location | Status | Notes / Gaps |
|---|---|---|---|
| Intro Cinematic Splash | `IntroSplashScreen.tsx` | Working | 8s Ken Burns visual (`intro-proposal.jpg`), skip button, sessionStorage once-per-session + footer replay. Minor AR hardcode on bottom seconds label in EN mode. |
| Red/White Splash Home | `SplashHome.tsx` | Working | 2x2 grid on mobile & desktop for 4 core sections. No direct entry to Early Start, Calculators, Encyclopedias, Marketplace, or Installments. |
| Header & Language Toggle | `Header.tsx` | Working (Limited) | 4 core links, Cart, Requests shortcut, User dropdown, AR/EN toggle. Missing dropdown menus for expanded IA; user menu lacks outside-click close. |
| Footer | `Footer.tsx` | Working | Links to 4 sections, Hotline, WhatsApp link, Social Support Initiative link, Replay Intro. Missing SEO/local/encyclopedia links. |
| Finishing Calculator & View | `FinishingView.tsx` | Partial | 3 packages, instant area×rate estimator, 3 Before/After live projects, 4 trades. Calculator not synced to `FinishingQuoteModal`; no encyclopedia, materials, or contractor directory. |
| Finishing Quote Modal | `FinishingQuoteModal.tsx` | Partial | Saves inquiry to `localStorage`. Uses hardcoded `4500/5500` estimate formula instead of selected tier; ignores calculator values. |
| Groom's Trousseau | `GroomView.tsx` | Partial | 2 bundles, budget builder (`useState` ephemeral), 6 products, search/category filter, compare bar (**RTL clipping defect**). Missing empty state & appliances/furniture depth. |
| Bride's Trousseau | `BrideView.tsx` | Partial | 1 bundle, 8-item checklist (**ephemeral, false local-save claim**), 5 products (**`bride-p1` image 404**), wishlist toggle. Missing empty state & custom trousseau planner. |
| Product Detail & Compare Modals | `ProductDetailModal.tsx`, `ProductCompareModal.tsx` | Partial | Renders specs and adds to cart. `quantity` state doesn't reset between products; no price history or supplier comparison. |
| Wedding Planner (`فرحي`) | `WeddingPlannerView.tsx`, `WeddingBookingModal.tsx` | Partial | 9 services across 9 categories, search/gov/budget filter, preliminary inquiry modal (`governorate` input missing in modal). No real vendor profiles, calendar slots, or seating/guests. |
| Installments & Calculator | `FinancingView.tsx`, `InstallmentModal.tsx` | **Unreachable / Partial** | No link navigates to `'installments'`; `InstallmentModal` ignores updated `installmentPrefillAmount` after mount. |
| Social Support Initiative | `SocialSupportView.tsx`, `SupportModal.tsx`, `SponsorModal.tsx` | Working (Local) | Confidential support application & corporate sponsor pledge persisted in `localStorage`. Plaintext `nationalId` stored client-side. |
| Cart Drawer & Checkout | `CartDrawer.tsx` | Working (Local) | Add/remove/quantity, order creation (`orders`), clears cart. No real payment provider integration or server order validation. |
| Auth Modal & Session | `AuthModal.tsx`, `AppContext.tsx` | Partial / Insecure | Auto-logs into demo user; login accepts any phone without password/OTP/token; no vendor/expert/moderator roles. |
| Customer Portal | `CustomerPortalView.tsx` | Partial | Shows Orders, Finishing Inquiries, Wedding Bookings, Financing Apps. Does **not** filter records by `currentUser.id`; no Profile edit tab content, Documents, Budget, or Tasks. |
| Admin Dashboard | `AdminDashboardView.tsx` | Partial | 9 tabs, status dropdowns for inquiries/bookings/financing/support, add/delete product, platform settings. Hardcoded `1,480` customers; unused `updateProduct`/`addWeddingService`; no CMS, Vendor CRM, or Analytics. |
| Legacy Navy/Gold Home Sections | `Hero.tsx`, `FourSectionsGrid.tsx`, `HowItWorks.tsx`, `InstallmentBanner.tsx`, `SocialSupportBanner.tsx` | **Orphaned** | Never imported; broken undefined CSS classes (`bg-gold-gradient`, `text-gold-gradient`); wrong color palette. |

## 2. Target GAWAZ INN 2.0 Modules Not Yet Implemented (0% Baseline)
- **Module A:** Early Start (10-year timelines, My Future Fund, Savings/What-If calculators, Streaks/Badges, Academy)
- **Module B:** Engagement Planner
- **Module C:** Full 22-category Apartment Finishing Encyclopedia, Material Encyclopedia, Contractors Directory
- **Module D/E:** Expanded Groom & Bride Encyclopedias, EGP 100k–500k packages, missing-item detection
- **Module G:** 20 Unified Smart Calculators backed by shared tested calculation engine
- **Module H:** Wedding Budget Manager (expenses, deposits, overruns, exports, linked transactions)
- **Module I:** Wedding Journey Planner (12m to post-wedding timeline, dependencies, reminders)
- **Module J:** Full My Gawaz Inn (17 sub-modules + Shared Couple Workspace with invitations & permissions)
- **Module K:** Product Encyclopedia, Price Intelligence, Multi-list Shopping Baskets
- **Module L/M/N:** Vendor Directory, Verification, Vendor Portal/CRM, Monetization Plans, full RFQ Engine, Appointments & Bookings
- **Module O/P:** Content & Knowledge Hub (CMS, My Wedding Story), Community Q&A & Expert Network
- **Module Q:** Grounded GAWAZ INN AI Assistant
- **Module R:** Smart Room Designer, Material Explorer, Moodboards
- **Module S:** Wedding Day Management (Digital Invitations, RSVPs, Guests, Seating, Schedule, Gift Registry)
- **Module T:** Beyond Wedding / Married Life (Home Care Directory, Newlyweds Guide, Digital Home File, Warranty Tracker, Home Inventory)
- **Module U:** Local Discovery & SEO (Governorates/Cities/Districts pages, sitemap, robots, JSON-LD)
- **Admin OS:** Full CMS, Marketplace/Vendor verification & plans, User/Privacy controls, Commercial/Billing, Analytics Center


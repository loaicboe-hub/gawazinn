# GAWAZ INN — Comprehensive Technical & Product Audit (Phase Zero)

**Audit Date:** 2026-11-09  
**Repository:** `d:\PROJECTS\gawazinn` (`origin`: `https://github.com/loaicboe-hub/gawazinn.git`, branch: `main`, HEAD: `9c2fd04`)  
**Live Website Inspected:** `https://gawazinn.vercel.app/`  
**Working Tree Baseline:** Clean (`nothing to commit, working tree clean`)

---

## 1. Executive Summary

GAWAZ INN 1.0 is a client-side React + TypeScript + Vite single-page application (SPA) styled with Tailwind CSS v4. It presents a joyful **Red & White (`#D91B3E` / `#FFFFFF`)** brand experience anchored by four primary consumer pillars: Apartment Finishing (`تشطيب الشقة`), Groom's Trousseau (`جهاز العريس`), Bride's Trousseau (`جهاز العروسة`), and Wedding Planner (`فرحي`), plus secondary views for Installments (`FinancingView`), Social Support (`SocialSupportView`), a Customer Portal (`CustomerPortalView`), and an Admin Dashboard (`AdminDashboardView`).

The live deployment at `https://gawazinn.vercel.app/` serves a static bundle **byte-identical (`500,931` bytes)** to a fresh local `npm run build` at commit `9c2fd04`.

However, the current implementation is **frontend-only with `localStorage` persistence**. There is **no backend server, no database, no server-side authentication/authorization, no URL routing, no automated test suite, no SEO crawlable routes, and no coverage of the broader lifecycle modules** (Early Start / My Future Fund, Engagement Planner, Full Encyclopedias, 20 Smart Calculators, Personal Budget Manager, Wedding Journey Timeline, Shared Partner Workspace, Vendor Directory/Portal/CRM, RFQ Engine, Appointments, Content/Community/Experts, AI Assistant, Smart Home Tools, Wedding-Day Operations, and Post-Wedding Home Care).

---

## 2. Live Website vs. Local Repository Comparison

| Aspect | Live (`https://gawazinn.vercel.app/`) | Local (`main` @ `9c2fd04`) | Match? |
|---|---|---|---|
| HTML Entry (`index.html`) | 1,641 bytes, `lang="ar" dir="rtl"`, Cairo/Tajawal/Outfit Google Fonts | 1,737 bytes (source pre-build) | Yes (Vite-compiled output) |
| JS Bundle | `/assets/index-W53Y-56A.js` (`500,931` bytes) | `dist/assets/index-MjQ7A47P.js` (`500,931` bytes) | **Byte-for-byte identical** |
| Intro Splash Screen | 8-second Ken Burns splash with `/intro-proposal.jpg` (`1,038,807` bytes, HTTP 200) & Skip | `IntroSplashScreen.tsx` (`8000` ms) | Yes |
| `/robots.txt` & `/sitemap.xml` | HTTP 404 (`79` bytes) | Not present in `public/` | Identical (Missing) |
| `/favicon.svg` & `/icons.svg` | HTTP 200 (leftover Vite purple icon SVGs in `public/`, though `index.html` uses inline SVG data URI) | Present in `public/` | Identical |

---

## 3. Baseline Build, Lint, and Test Report

Executed on clean baseline `9c2fd04`:

| Check | Command | Exit Code | Result |
|---|---|---|---|
| Linter | `npm run lint` (`oxlint`) | `0` | **0 errors, 100 warnings** across 34 files (all `eslint(no-unused-vars)` unused imports/variables). |
| Type Check & Build | `npm run build` (`tsc -b && vite build`) | `0` | Built in `1.81s` (`dist/assets/index-MjQ7A47P.js`: `524.79 kB` / `139.04 kB` gzip; Vite warns chunk > 500 kB). |
| Automated Tests | None configured | N/A | **No test runner** (`vitest`, `jest`, `playwright`, etc.) exists in `package.json`. |

---

## 4. Verified Functional, UI, Security & Data Integrity Defects

### 4.1 Critical / High Severity Defects
1. **No Backend, Database, or Server-Side Authorization (`AppContext.tsx`, `AuthModal.tsx`)**:
   - All state is stored in browser `localStorage` (`gawaz_inn_*`) initialized with hardcoded demo records.
   - `AppContext.tsx:189` auto-logs every visitor in as demo user `كريم عبد العزيز شريف` (`usr-1`).
   - `CustomerPortalView.tsx:69-72` displays all orders, inquiries, bookings, and financing applications without filtering by `userId` (data leakage risk if multi-user data exists).
   - `AuthModal.tsx` grants access with only a phone number and optional name — no password, OTP, session token, or role verification.
   - `SupportCase` and `FinancingApplication` store sensitive `nationalId` values in unencrypted `localStorage` and expose them in `AdminDashboardView.tsx:666`.
2. **Broken Image Asset on Live Bride Catalog (`src/data/initialData.ts:429`)**:
   - Product `bride-p1` (`طقم حلل جرانيت تركي كوركماز...`) references `https://images.unsplash.com/photo-1584990347449-35c91b8a53e8?auto=format&fit=crop&w=800&q=80`, which returns **HTTP 404** (`naturalWidth === 0` verified in headless Chrome on both desktop `1440px` and mobile `375px`).
3. **Unreachable Route in Navigation (`FinancingView`)**:
   - `App.tsx:54` renders `<FinancingView />` when `activeSection === 'installments'`, but **no visible link or button** in `Header.tsx`, `Footer.tsx`, or `SplashHome.tsx` navigates to `'installments'` (the only caller was orphaned `InstallmentBanner.tsx`).
4. **RTL Off-Screen Clipping Bug in Groom Comparison Bar (`src/components/groom/GroomView.tsx:543`)**:
   - Uses `fixed bottom-6 start-1/2 -translate-x-1/2`. In RTL (`dir="rtl"`), `start-1/2` resolves to `right: 50%` while `-translate-x-1/2` shifts left by 50% of width, pushing the bar off the left edge of the screen.
   - Verified in headless Chrome:
     - Desktop `1440px`: `left: -144px, right: 432px` (clipped off-screen left).
     - Mobile `375px`: `left: -319px, right: 19px` (only `19px` visible!).
5. **No URL Routing or Deep Linking (`App.tsx:28`)**:
   - Navigation relies solely on `useState<SectionKey>('home')`. Browser reload resets to home; browser Back/Forward buttons do not navigate views; individual products, services, guides, and locations have no crawlable URLs.

### 4.2 Medium Severity Defects
6. **False Persistence Claim in Bride Checklist (`src/components/bride/BrideView.tsx:55, 321`)**:
   - `completedChecklist` uses ephemeral `useState` (resets on reload or tab change), contradicting line 321 (`يتم حفظ اختياراتك تلقائياً على جهازك`). Same for `GroomView.tsx` custom budget builder (`budgetTarget`, `selectedBudgetItems`).
7. **Stale Modal State Across Re-opens (`InstallmentModal`, `ProductDetailModal`, `FinishingQuoteModal`, `AdminDashboardView`)**:
   - Modals remain mounted when closed and initialize form `useState` only on initial mount. Consequently, clicking "Apply for Installment" on a product or package with a new `installmentPrefillAmount` does **not** update `requestedAmount` inside `InstallmentModal.tsx:27`. Similarly, `ProductDetailModal.tsx:19` retains previous `quantity` across different products, and `FinishingQuoteModal.tsx:46-47` hardcodes `areaSqm * 4500` / `* 5500` instead of using the selected `finishingTier` package rates (`3400` / `5200` / `7800`).
8. **Hardcoded / Untranslated Arabic Strings in English Mode**:
   - Switching to English updates `dir="ltr"` and `lang="en"`, but dozens of labels in `AdminDashboardView`, `CustomerPortalView`, `CartDrawer`, `FinishingView`, `ProductDetailModal`, and `IntroSplashScreen` (`ثوانٍ` / `جواز إن`) remain Arabic.
9. **Missing Empty States & Incomplete Admin CRUD**:
   - Filtering `GroomView`, `BrideView`, or `WeddingPlannerView` to 0 results renders blank space with no empty-state guidance.
   - `AdminDashboardView` imports `updateProduct` and `addWeddingService` but never exposes edit product, add wedding service, or edit wedding service UI; KPI `1,480` total customers is hardcoded (`line 333`).
10. **Orphaned Legacy Code & Unused Template Files**:
    - `src/components/home/Hero.tsx`, `FourSectionsGrid.tsx`, `HowItWorks.tsx`, `InstallmentBanner.tsx`, and `SocialSupportBanner.tsx` use an obsolete Navy/Gold (`#17243A` / `#C6A66B`) palette with undefined utility classes (`bg-gold-gradient`, `text-gold-gradient`) and are never imported.
    - `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/favicon.svg` (purple Vite bolt), and `public/icons.svg` are unused Vite starter artifacts.
    - `WeddingBookingModal.tsx:24` defines `governorate` state with no input control (`setGovernorate` unused).

### 4.3 Accessibility & SEO Findings
- Interactive cards (`SplashHome`, `FinishingView` tiers, `GroomView` budget items, `BrideView` checklist items) use clickable `<div>` tags without `role="button"`, `tabIndex={0}`, or keyboard activation handlers.
- Modals lack `role="dialog"`, `aria-modal="true"`, Escape-to-close, and backdrop click handling.
- Missing `robots.txt`, `sitemap.xml`, per-route `<title>`/`<meta description>`/canonical tags, and JSON-LD structured data (`Organization`, `Product`, `LocalBusiness`, `Article`, `BreadcrumbList`).


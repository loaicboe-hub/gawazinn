# GAWAZ INN — Current Architecture Assessment

**Baseline Commit:** `9c2fd04` (`main`)

## 1. Tech Stack & Runtime
- **Frontend Framework:** React `19.3.1` + TypeScript `~7.0.2`
- **Build Tool:** Vite `8.3.5` (`@vitejs/plugin-react` `6.1.2`, Rolldown bundler)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` `4.3.3`) + custom CSS utilities in `src/index.css`
- **Icons:** `lucide-react` `1.66.0`
- **Linting:** `oxlint` `1.89.0` (`.oxlintrc.json`)
- **Node Runtime Verified:** Node.js `v24.19.0`, npm `11.17.0`
- **Hosting / Deployment:** Vercel static SPA (`https://gawazinn.vercel.app/`)

## 2. Current Directory & Module Structure

```text
gawazinn/
├── index.html                  # RTL Arabic shell, Google Fonts (Cairo, Tajawal, Outfit)
├── package.json                # dev, build, lint, preview scripts (no test script)
├── vite.config.ts              # Vite + React + Tailwind plugin, port 3000
├── public/
│   ├── intro-proposal.jpg      # 1.04 MB splash screen backdrop
│   ├── favicon.svg             # Unused Vite starter SVG
│   └── icons.svg               # Unused Vite starter sprite
└── src/
    ├── main.tsx                # React StrictMode mount
    ├── App.tsx                 # Single-state section switcher + global modals/drawers
    ├── index.css               # Red/White CSS custom properties + Ken Burns animations
    ├── App.css                 # Unused Vite starter CSS
    ├── types/index.ts          # Domain TypeScript interfaces (247 lines)
    ├── i18n/translations.ts    # Bilingual AR/EN dictionary (516 lines)
    ├── data/initialData.ts     # Static seed packages, 11 products, 9 wedding services, samples
    ├── context/AppContext.tsx  # Monolithic React Context + localStorage persistence
    └── components/
        ├── intro/              # IntroSplashScreen.tsx (8s overlay)
        ├── layout/             # Header.tsx, Footer.tsx, Toast.tsx
        ├── home/               # SplashHome.tsx (active) + 5 orphaned Navy/Gold components
        ├── finishing/          # FinishingView.tsx (calculator, packages, before/after, trades)
        ├── groom/              # GroomView.tsx (packages, budget builder, catalog, compare bar)
        ├── bride/              # BrideView.tsx (package, checklist, catalog)
        ├── wedding/            # WeddingPlannerView.tsx (category/gov/budget filters + service cards)
        ├── financing/          # FinancingView.tsx (installment calculator + partners; unlinked)
        ├── social/             # SocialSupportView.tsx (charity initiative overview + CTAs)
        ├── customer/           # CustomerPortalView.tsx (4 tabs: orders, finishing, wedding, financing)
        ├── admin/              # AdminDashboardView.tsx (9 sidebar tabs, KPIs, status updates, settings)
        ├── cart/               # CartDrawer.tsx (cart items + checkout form)
        └── modals/             # AuthModal, FinishingQuoteModal, WeddingBookingModal,
                                # ProductDetailModal, ProductCompareModal, InstallmentModal,
                                # SupportModal, SponsorModal
```

## 3. Data & State Management
- **State Store:** Single `AppProvider` in `src/context/AppContext.tsx` (635 lines) holding:
  - Localization (`language`, `dir`, `t`)
  - View routing (`activeSection`)
  - Auth (`currentUser` defaulted to demo user `usr-1`)
  - Shopping (`cart`, `wishlist`)
  - Catalog (`products`, `weddingServices`, `finishingPackages`, `finishingServices`)
  - Submissions (`finishingInquiries`, `weddingBookings`, `orders`, `financingApplications`, `supportCases`, `sponsorshipInquiries`)
  - Settings (`PlatformSettings`) and 7 modal open/selection states.
- **Persistence:** `localStorage` keys prefixed with `gawaz_inn_*` (`lang`, `user`, `cart`, `wishlist`, `products`, `wedding_services`, `finishing_inquiries`, `wedding_bookings`, `orders`, `financing_apps`, `support_cases`, `sponsorships`, `settings`). `IntroSplashScreen` uses `sessionStorage` key `gawazinn_intro_splash_seen`.
- **Backend / API / Database:** **None.** Zero HTTP requests to any backend API.

## 4. Current Architectural Strengths to Preserve
1. Clean TypeScript models (`src/types/index.ts`) with clear bilingual `*Ar` / `*En` fields.
2. Fast Vite 8 + Tailwind CSS v4 build pipeline.
3. Cohesive, high-craft Red/White (`#D91B3E` / `#FFFFFF` / `#FAF7F2`) visual aesthetic on active components (`SplashHome`, `Header`, `Footer`, and the 4 core pillar pages).
4. Built-in RTL (`dir="rtl"`) and LTR (`dir="ltr"`) direction switching at `document.documentElement`.

## 5. Architectural Gaps for GAWAZ INN 2.0
1. **Monolithic State & Lack of Backend/DB:** Needs a real relational database (`node:sqlite` locally + PostgreSQL/Supabase migration compatibility), validated REST API (`/api/v1/*`), real authentication/RBAC, and modular domain stores/hooks.
2. **No Router:** Needs URL-based routing (`/`, `/early-start`, `/encyclopedia/...`, `/calculators/...`, `/marketplace/...`, `/my/...`, `/vendor/...`, `/admin/...`, `/locations/...`) with deep links, SEO metadata, and fallback compatibility.
3. **Scattered Calculation Logic:** Finishing, groom budget, and installment formulas live inside UI components rather than a pure, tested, shared calculation engine.
4. **Bundle Size:** Current single JS chunk already exceeds `500 kB` (`524.79 kB`). Needs route-level `React.lazy` code splitting as the ecosystem expands.

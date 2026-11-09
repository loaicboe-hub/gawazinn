# GAWAZ INN 2.0 — SEO & Organic Growth Strategy

> **Baseline Finding (Stage 0):** Live site (`https://gawazinn.vercel.app/`) uses internal `useState` navigation with no crawlable URLs, no route-level meta tags, no JSON-LD structured data, and returns **HTTP 404** for `/robots.txt` and `/sitemap.xml`.

---

## 1. URL Architecture & Technical SEO Foundations

| Route Pattern | Content Scope | Index Policy | Structured Data (`JSON-LD`) |
|---|---|---|---|
| `/` | Brand Gateway (`SplashHome`) + Lifecycle Pillars | `index, follow` | `Organization`, `WebSite` (with `SearchAction`) |
| `/encyclopedia` & `/encyclopedia/:domain` & `/encyclopedia/:slug` | Finishing (22 categories), Groom, Bride (19 categories), Wedding, Married Life, Glossary | `index, follow` | `BreadcrumbList`, `Article` / `FAQPage` / `DefinedTermSet` |
| `/finishing`, `/finishing/materials/:slug` | Finishing Packages, Material Encyclopedia, Contractors | `index, follow` | `BreadcrumbList`, `Product` / `HowTo` |
| `/groom`, `/bride`, `/wedding`, `/early-start` | Pillar landing hubs & Early Start prep | `index, follow` | `BreadcrumbList`, `WebPage` |
| `/calculators` & `/calculators/:slug` | All 20 Smart Calculators | `index, follow` | `BreadcrumbList`, `SoftwareApplication` / `FAQPage` |
| `/products` & `/products/:slug` | Product Encyclopedia, specs, alternatives, price history | `index, follow` | `BreadcrumbList`, `Product`, `Offer` |
| `/vendors` & `/vendors/:slug` | Vendor Directory & Profiles | `index, follow` | `BreadcrumbList`, `LocalBusiness` |
| `/locations/:governorateSlug` & `/:categorySlug` | Egyptian Local SEO pages (Cairo, Giza, Alexandria, Mansoura, Tanta, etc.) | `index, follow` | `BreadcrumbList`, `LocalBusiness`, `CollectionPage` |
| `/guides` & `/guides/:slug` & `/stories` & `/community` | Articles, Real Wedding Cost Stories, Q&A | `index, follow` | `Article`, `QAPage`, `BreadcrumbList` |
| `/my/*`, `/workspace`, `/vendor-portal/*`, `/admin/*`, `/rsvp/:code` | Private workspaces, CRM, Admin OS, personal RSVP | **`noindex, nofollow`** | None (private / blocked in `robots.txt`) |

---

## 2. Dynamic Head & Metadata Contract (Implemented Stage 1)
Every public route updates dynamically via a centralized `<SeoHead />` manager:
- Unique localized `<title>` (`{PageTitle} | جواز إن` / `{PageTitle} | GAWAZ INN`).
- Unique `<meta name="description">` (`<= 160` characters).
- `<link rel="canonical" href="https://gawazinn.vercel.app{pathname}" />`.
- Open Graph (`og:title`, `og:description`, `og:type`, `og:url`, `og:locale`, `og:site_name`) & Twitter Card tags.
- `hreflang` alternates (`ar-EG`, `en`, `x-default`).
- `<meta name="robots" content="noindex, nofollow">` on private workspace, portal, and admin routes.

---

## 3. Egyptian Local SEO & Meaningful Content Standards
To prevent thin or spammy doorway pages on `/locations/:governorate/:category`:
1. Every location + category page must include:
   - Real governorate/city/district summary metadata (`shippingNotes`, `typicalCostFactor`, `localTips`).
   - Verified/registered local vendor count and filtered real vendor cards from DB (or honest "No registered providers in this district yet — submit RFQ to get matched" guidance).
   - Localized finishing/wedding cost context powered by regional indices + FAQ accordion + direct link to relevant Calculator & RFQ form.
2. Breadcrumb trail mirrors the exact hierarchy: `Home > Egypt > {Governorate} > {City/Category}`.

---

## 4. Crawling & Sitemap Automation
- **`public/robots.txt`:** Explicitly allows public encyclopedia, products, vendors, calculators, guides, and location hubs; disallows `/my/`, `/vendor-portal/`, `/admin/`, `/api/`. Points to `https://gawazinn.vercel.app/sitemap.xml`.
- **Dynamic Sitemap Generation (`GET /sitemap.xml` + static `public/sitemap.xml` fallback):** Generated from published CMS articles, products, approved vendor slugs, calculators, and seeded governorate routes, excluding `noindex` private/admin pages.
- **Internal Linking Graph:** Every Article links to relevant Calculators, Products, and Vendor Categories (`content_relations`); every Calculator links to related Finishing/Groom/Bride guides and Vendor RFQ entry points.


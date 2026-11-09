# GAWAZ INN — Design System Reference (Approved Visual Baseline)

> **STRICT GOVERNANCE RULE:** All GAWAZ INN 2.0 modules, pages, dashboards, calculators, encyclopedias, portals, and admin tools MUST adhere strictly to this visual identity. Do not introduce generic blue/slate SaaS themes, unrelated color palettes, or conflicting typography.

---

## 1. Brand Identity & Core Palette

Defined in `src/index.css` and active views:

| Token | Hex / Value | Usage |
|---|---|---|
| `--red-primary` | `#D91B3E` | Primary CTA buttons, active navigation pills, primary icons, price callouts, focus rings |
| `--red-deep` | `#B31331` | Hover states, secondary tagline accents, toast surface, announcement text |
| `--red-dark` | `#8C0D24` / `#590717` / `#800C22` | Deep romantic crimson gradient stops for hero banners |
| `--red-light` | `#F43F5E` / `#ED264D` / `#FF4D6D` | Gradient highlights, dark-card KPI/total highlights |
| `--pink-soft` | `#FDE8ED` / `#FFF8F9` / `#FFF8F8` | Soft rose pills, hover backgrounds, announcement bar, summary cards |
| `--pink-accent` | `#FCE4EC` | Subtle rose border/badge accents |
| `--white-pure` | `#FFFFFF` | Primary page canvas, elevated cards, modals |
| `--ivory-warm` | `#FDFBF7` / `#FAF7F2` | Subtle warm section backgrounds, spec boxes, footer surface |
| `--ivory-muted` | `#F8F4EE` | Table headers, secondary card backgrounds |
| `--gold-subtle` | `#E8D5B5` / `#C6A66B` | Sparingly used subtle borders/accents on luxury highlights & guarantees |
| `--text-charcoal` | `#2A1D20` | Primary body text & headings (with `text-gray-900` / `text-gray-700` / `text-gray-600`) |
| Dark Surface | `#1C1819` → `#2B181A` / `#261618` | Dark executive summary boxes (calculators, galleries, admin sidebar, privacy covenant) |

### Approved Gradients & Shadows (`src/index.css`)
- **Primary Gradient (`.bg-red-gradient`):** `linear-gradient(135deg, #ED264D 0%, #D91B3E 50%, #B31331 100%)`
- **Hero Banner Gradient:** `bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717]`
- **Text Gradient (`.text-red-gradient`):** `linear-gradient(135deg, #ED264D 0%, #D91B3E 50%, #B31331 100%)` with `background-clip: text`
- **Glass Surfaces:** `.bg-rose-glass` (`rgba(255,255,255,0.94)` + `blur(14px)`), `.bg-red-glass` (`rgba(179,19,49,0.9)` + `blur(14px)`)
- **Shadows:** `.red-shadow` (`0 12px 30px -8px rgba(217,27,62,0.22)...`), `.card-hover-shadow` (`translateY(-6px)`)

> **Deprecated Palette (Do Not Use):** Legacy orphaned components (`Hero.tsx`, `FourSectionsGrid.tsx`, etc.) used Navy `#17243A` + Gold `#C6A66B`. New code must **never** use `#17243A`.

---

## 2. Typography & Localization

- **Primary Arabic Font:** `'Cairo', system-ui, -apple-system, sans-serif` (weights 300–900, loaded via Google Fonts in `index.html`)
- **Secondary Arabic Support:** `'Tajawal'`
- **English Font (`[dir="ltr"]`):** `'Outfit', system-ui, -apple-system, sans-serif`
- **Directionality:** Root `<html>` toggles `lang="ar" dir="rtl"` and `lang="en" dir="ltr"`. Always use Tailwind logical properties (`start-*`, `end-*`, `ps-*`, `pe-*`, `ms-*`, `me-*`, `border-s-*`, `border-e-*`, `text-start`, `text-end`) so layouts mirror cleanly in RTL & LTR.
- **Currency Formatting:** Egyptian Pound (`ج.م` in Arabic, `EGP` in English) via localized formatting utilities (`toLocaleString()`).

---

## 3. Layout, Spacing & Component Patterns

### Header & Footer
- **Header (`Header.tsx`):**
  - Top thin announcement strip (`bg-[#FFF8F9] text-[#B31331] border-b border-[#FDE8ED]`) showing brand slogan and language switcher.
  - Sticky `h-20` frosted navbar (`bg-white/95 backdrop-blur-md border-b border-[#D91B3E]/15 shadow-sm`).
  - Brand wordmark: `جواز إن` / `GAWAZ INN` paired with a crisp `#D91B3E` crimson dot (`w-2.5 h-2.5 rounded-full bg-[#D91B3E]`) — no monogram emblem.
  - Navigation uses compact rounded-xl pills (`px-3.5 py-2 rounded-xl text-xs font-bold`), active state `bg-[#D91B3E] text-white shadow-md`.
  - Extension rule for GAWAZ INN 2.0: Keep primary header clean and uncluttered using 5–6 top-level pillars with dropdown menus (`ENCYCLOPEDIA`, `PLAN & CALCULATE`, `MARKETPLACE`, `DISCOVER & LOCAL`, `MY GAWAZ INN`) and mobile slide-out drawer.
- **Footer (`Footer.tsx`):**
  - Warm ivory surface (`bg-[#FAF7F2] border-t border-[#D91B3E]/15`).
  - Links to pillars, hotline/WhatsApp (`emerald-700`), Community Support pill (`bg-[#FDE8ED] text-[#B31331]`), intro replay trigger, and Egyptian pride sign-off.

### Cards, Surfaces & Radii
- **Feature / Pillar Cards:** `rounded-2xl sm:rounded-3xl border border-[#D91B3E]/15` or `border-2 border-rose-100 hover:border-red-300 shadow-md hover:shadow-xl`
- **Inner Info Boxes:** `bg-[#FAF7F2]` or `bg-[#FFF8F8]` with `rounded-xl` / `rounded-2xl` and `border border-rose-100`
- **Executive Summary / Dark Highlight Panels:** `bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white rounded-2xl sm:rounded-3xl border border-rose-900/30 shadow-xl`
- **Pill Badges:** `inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FDE8ED] text-[#D91B3E] text-xs font-bold border border-[#D91B3E]/20` (on light) or `bg-white/15 text-rose-100 border-white/20` (on hero banners)

### Buttons & Inputs
- **Primary CTA:** `bg-red-gradient text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-md hover:opacity-95 transition`
- **Secondary CTA (on light):** `bg-rose-50 hover:bg-[#D91B3E] text-[#D91B3E] hover:text-white border border-rose-200 rounded-xl font-bold text-xs`
- **Secondary CTA (on hero):** `bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl`
- **Form Controls:** `p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none`
- **Range Sliders:** `accent-[#D91B3E] cursor-pointer`

### Status Semantics
- **Success / Approved / Confirmed:** `bg-emerald-100 text-emerald-800 border-emerald-300`
- **In Progress / Under Review:** `bg-rose-50 text-[#D91B3E] border-rose-200`
- **Pending / Warning / Disclaimer:** `bg-amber-50 / bg-amber-100 text-amber-800 border-amber-200 / border-amber-300`
- **Cancelled / Declined:** `bg-gray-100 text-gray-700 border-gray-300`

### Modals & Drawers
- Backdrop: `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm`
- Dialog Container: `bg-white rounded-3xl p-6 sm:p-9 shadow-2xl border-2 border-[#D91B3E]/20` (with accessible `role="dialog"`, `aria-modal="true"`, Escape close)
- Iconography: `lucide-react` (`strokeWidth` default 2, consistent `w-3.5 h-3.5` to `w-5 h-5` inside pills/buttons).

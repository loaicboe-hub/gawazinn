# GAWAZ INN 2.0 — Integration & External Services Status

> **Policy:** Distinguish clearly between **(A) Working Full-Stack Internal Implementation**, **(B) Clean Adapter Ready for Provider Keys**, and **(C) Pending External Credentials / Production Infra**. Never fake live bank/SMS/payment execution when external credentials are absent.

---

## Integration Matrix (Updated After Stage 1 — `2026-11-09`)

| Capability | Category | Current Stage 1 State | Next Step / Env Requirements |
|---|---|---|---|
| **Relational Database** | Core Infra + Adapter | **(A) Working Internal (`node:sqlite` + PG parity DDL):** Real `.data/gawazinn.db` tables, foreign keys, transactions, migrations (`db/migrations/sqlite/`) + `db/migrations/postgres/` ready. | Attach managed PostgreSQL (`DATABASE_URL`) adapter for stateless Vercel serverless production. |
| **Authentication & Sessions** | Core Security | **(A) Working Internal:** Real email/phone + password (`scrypt`) login/register, `SHA-256` hashed `HttpOnly` cookie sessions (`sessions` table), RBAC (`customer`, `vendor`, `expert`, `moderator`, `editor`, `admin`, `super_admin`), rate limiting & `audit_logs`. | Optional SMS OTP gateway (Twilio / VictoryLink Egypt) stays disabled until credentials are configured in `.env`. |
| **Deployment Hosting** | DevOps | **(A) Static + Local Full-Stack + Vercel Config (`vercel.json`, `api/index.ts`)**: `npm run build` + `server/index.ts` verified; `vercel.json` routes configured. | Push to GitHub + set remote `DATABASE_URL` & `SESSION_SECRET` on Vercel/VPS. |
| **Email & Messaging Notifications** | Messaging | **(C) Pending External Provider Keys:** UI actions submit into SQLite + audit trail cleanly. | Add `server/integrations/email.ts` (`SMTP_HOST` / `RESEND_API_KEY`) when configuring transactional mail. |
| **WhatsApp Integration** | Communication | **(B) Manual Deep Links Configured:** `Footer` uses configured official support number formatting via `settings.whatsapp`; zero fake live API delivery claims. | Set verified business `VITE_SUPPORT_WHATSAPP`; add Meta Cloud API only when `WHATSAPP_TOKEN` is supplied. |
| **Payment Gateways (Card / Fawry / Installments)** | Commerce | **(A/B) Internal Orders & Financing Pipeline:** Server-computed order totals + stock decrement work internally; installment requests save with masked NID (`298********567`) + regulatory disclaimer. | Online card checkout (Paymob / Fawry) stays flagged **"Pending Merchant Credentials (`PAYMOB_API_KEY`)"**. |
| **Media & Static Assets** | Media | **(A) Verified:** Replaced broken `bride-p1` 404 URL, added `<SmartImage />` resilient fallback across views, verified 0 `naturalWidth === 0` / HTTP>=400 in headless Chrome E2E. | Optional S3/R2/Supabase Storage upload adapter when `STORAGE_BUCKET` credentials exist. |
| **AI Assistant Engine** | Intelligence | **(C) Planned Stage 10:** Will use grounded DB/calculator tool execution (`shared/calculators/` + SQL queries) with local deterministic fallback. | Add optional `AI_PROVIDER_API_KEY` adapter in Stage 10. |
| **Observability & SEO** | Core Infra | **(A) Working Internal:** Dynamic `<SeoHead />` JSON-LD + `noindex` on `/portal` & `/admin`, `public/robots.txt`, dynamic SQLite-backed `/sitemap.xml`, `audit_logs` table. | Optional Sentry/GA4 hooks controlled strictly via env config. |


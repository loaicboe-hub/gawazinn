# GAWAZ INN 2.0 — Integration & External Services Status

> **Policy:** Distinguish clearly between **(A) Working Full-Stack Internal Implementation**, **(B) Clean Adapter Ready for Provider Keys**, and **(C) Pending External Credentials / Production Infra**. Never fake live bank/SMS/payment execution when external credentials are absent.

---

## Integration Matrix (Phase Zero Baseline — `2026-11-09`)

| Capability | Category | Current State (`9c2fd04`) | Target 2.0 Architecture & Next Step |
|---|---|---|---|
| **Relational Database** | Core Infra | **None** (`localStorage` only) | **Stage 1:** Built-in `node:sqlite` (`.data/gawazinn.db`) for immediate local/test execution + **PostgreSQL/Supabase parity migrations** (`db/migrations/postgres/`) configurable via `DATABASE_URL`. |
| **Authentication & Sessions** | Security | **Mock/Broken** (auto demo login, phone-only modal) | **Stage 1:** Real internal email/phone + password (`scrypt`) & `SHA-256` hashed sessions in DB (`HttpOnly` cookie + Bearer). Optional SMS OTP gateway (Twilio / VictoryLink Egypt) adapter remains disabled until API credentials are configured in `.env`. |
| **Deployment Hosting** | DevOps | **Live SPA on Vercel** (`https://gawazinn.vercel.app/`) | Dual target: Static + Vercel Serverless adapter (`api/index.ts`) backed by external PostgreSQL (`DATABASE_URL`), plus standalone local/VPS Node server (`server/index.ts`). Requires attaching remote Postgres env var on Vercel for live multi-user persistence. |
| **Email Notifications** | Messaging | **None** | **Clean Adapter (`server/integrations/email.ts`):** Logs structured notification intents into `notifications` table + dev log; ready for Resend/SMTP (`SMTP_HOST`, `RESEND_API_KEY`). |
| **WhatsApp Integration** | Communication | `wa.me/201000000000` placeholder links in Footer/Modals | Configure real official business support number (`VITE_SUPPORT_WHATSAPP`); Meta WhatsApp Cloud API interactive notifications require `WHATSAPP_TOKEN` + `PHONE_NUMBER_ID` (left unconfigured/manual link until verified business number is set). |
| **Payment Gateways (Card / Fawry / Meeza / Installments)** | Commerce | Cash on delivery / local inquiry record only | **Clean Adapter Boundary (`server/integrations/payments.ts`):** Cash-on-delivery & explicit bank/branch follow-up workflows work end-to-end internally. Live online card checkout (Paymob / Fawry) stays flagged **"Pending Gateway Merchant Credentials (`PAYMOB_API_KEY`)"** — never silently marks fake credit card charges as paid. |
| **File & Image Storage** | Media | External Unsplash URLs (`bride-p1` HTTP 404) + `/intro-proposal.jpg` | **Stage 1:** Replace broken URL, add fallback component + local/validated upload metadata (`server/integrations/storage.ts`). S3 / R2 / Supabase Storage adapter activates when `STORAGE_BUCKET` credentials exist. |
| **AI Assistant Engine** | Intelligence | **None** | **Stage 10:** Grounded RAG/tool-calling service querying live SQLite/Postgres products, vendors, encyclopedias, and calculators (`server/services/aiAssistant.ts`). Operates cleanly using deterministic tool-orchestrated responses out of the box, with optional Gemini/OpenAI enhancement when `AI_PROVIDER_API_KEY` is provided. |
| **Analytics & Monitoring** | Observability | **None** | **Stage 1 / 9:** First-party privacy-safe `analytics_events` DB table & `/admin/analytics` queries work natively without third-party trackers. Optional GA4/Sentry hooks controlled by env vars. |

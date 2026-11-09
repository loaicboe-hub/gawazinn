# GAWAZ INN 2.0 — Quality Assurance & Testing Strategy

> **Baseline Finding (Stage 0):** Repository `9c2fd04` contains **zero automated tests** and **no test runner** in `package.json`. `oxlint` reports 0 errors / 100 unused-var warnings; `tsc -b && vite build` succeeds.

---

## 1. Multi-Layer Test Pyramid

| Layer | Tooling | Execution Target | Required Coverage |
|---|---|---|---|
| **Static Analysis** | `oxlint` + `tsc -b` | Every stage before build | **0 lint errors**, 0 TypeScript errors, progressive elimination of baseline unused-var warnings |
| **Unit Tests** | `vitest` (`node` + `jsdom` environments) | Pure domain logic (`shared/calculators/*`, Zod schemas, formatters, RBAC helpers) + isolated React components (`@testing-library/react`) | **100% of all 20 smart calculators** (happy path, zero/boundary inputs, validation rejection, precision), budget de-duplication, password hashing/verification, date/timeline dependency checks |
| **API & DB Integration Tests** | `vitest` + fresh temp/in-memory `node:sqlite` DB per suite | Real Express/HTTP router handlers & SQLite migrations | Auth register/login/logout, invalid password rejection, **RBAC ownership boundaries** (customer A cannot read customer B's savings/budget/RFQs; vendor cannot view unmatched RFQs; admin cannot inspect user private savings balances; moderator approvals; transactional RFQ accept -> budget link idempotency) |
| **Browser E2E & Visual Tests** | `playwright-core` driving local Chrome (`chrome.exe`) against live Vite + Backend server | Critical multi-page journeys across Desktop (`1440x900`) & Mobile (`375x812`), RTL (`ar`) & LTR (`en`) | Intro splash skip, zero `console.error` / `pageerror`, zero failed asset/API network calls, `scrollWidth <= clientWidth` (no horizontal clipping), Cart/Order persistence across reload, Installments/Quotes/RFQs/Early Start/Workspace flows |

---

## 2. Stage Completion Verification Gate
No stage may transition to the next stage or receive a Stage completion commit until **all** commands below run cleanly after the final edit:
1. `npm run lint` (`oxlint`) — exit `0`
2. `npm run typecheck` (`tsc -b`) — exit `0`
3. `npm run test` (`vitest run`: unit + DB/API integration) — 100% pass, exit `0`
4. `npm run build` (`vite build`) — exit `0`
5. `npm run test:e2e` (headless Chrome against built/running app on desktop + mobile) — 100% pass, `0` console/page errors, `0` HTTP >= 400 broken assets, zero RTL/mobile overflow.

---

## 3. Non-Fabrication & Honesty Rule in QA
- Never mock out a test assertion solely to make a broken integration appear green.
- Seeded demo records carry `is_demo_data = true` so QA can distinguish sample data from real transactions.
- Any external gateway without live credentials (e.g., Paymob card checkout, WhatsApp Cloud API webhook, live LLM API) is explicitly tested via its adapter boundary (`unconfigured` honest fallback vs. valid contract) and logged accurately in `INTEGRATION_STATUS.md`.

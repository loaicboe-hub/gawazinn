# GAWAZ INN 2.0 — Security & Privacy Architecture

## 1. Threat Model & Baseline Remediation
Baseline 1.0 had critical exposure: auto-logged demo user, unauthenticated phone-only login, unfiltered customer records, and plaintext `nationalId` values in `localStorage`. GAWAZ INN 2.0 enforces defense-in-depth at the server boundary.

## 2. Authentication & Session Security
- **Password Hashing:** `crypto.scrypt` with unique 16-byte random salt per user (`N=16384, r=8, p=1`), constant-time verification (`crypto.timingSafeEqual`).
- **Session Tokens:** Cryptographically random 32-byte token hashed (`SHA-256`) before storing in `sessions` table; transmitted via `HttpOnly`, `SameSite=Lax`, `Path=/` cookie (plus optional `Authorization: Bearer` header for integration clients).
- **Rate Limiting:** In-memory sliding-window rate limiter on `/api/v1/auth/*`, `/api/v1/rfq`, `/api/v1/community/reports`, and `/api/v1/support-cases` to mitigate brute force and spam.

## 3. Server-Side RBAC & Ownership Matrix

| Role | Access Scope | Explicit Restrictions |
|---|---|---|
| `customer` | Own Early Start/Future Fund, own Budget, own Journey, shared Workspace (if member with permission), own Orders/RFQs/Bookings/Home File | Zero access to other users' private finances, other RFQs, Vendor CRM, or Admin OS |
| `vendor` | Own Vendor Profile, Services, Promotions, CRM Leads, Appointments, **only matched/authorized RFQs** | Cannot view customer private financial goals, budgets, or non-assigned RFQs; cannot self-verify |
| `expert` | Public community answers + own verified credential profile | Cannot moderate platform or access user private data |
| `moderator` | Community Q&A, Wedding Stories, Reports, Expert credential review | Cannot access user private financial savings/budgets, commercial billing, or system settings |
| `editor` | CMS Articles, Materials, Encyclopedias, Guides, SEO local pages | Cannot alter user accounts, financial records, or vendor verification |
| `admin` / `super_admin` | Platform Operations, Vendor Verification, Commercial Plans, Analytics aggregates, User account status | **Privacy Rule:** Even Admins cannot inspect private user `savings_goals` / `savings_contributions` personal amounts unless anonymized aggregates |

## 4. Sensitive Data Protection
- **Private Financial Data Isolation:** `savings_goals`, `savings_contributions`, `budget_plans`, `budget_expenses`, and `home_documents` strictly enforce `user_id = authUser.id` (or explicit `workspace_members` consent). Never serialized in public endpoints or vendor payloads.
- **National ID & Social Support Confidentiality:** National IDs submitted in Financing or Social Support applications are masked (`298********678`) in API responses and protected from unauthenticated reads. Support cases are restricted to owner + authorized case reviewers.
- **XSS / SQLi / Upload Safety:** All SQL queries use bound parameters (`?` / `$1`) — zero string interpolation. All inputs validated with `zod`. File upload metadata validates MIME type allowlist, size limits, and sanitized filenames.
- **Audit Logging:** All logins, role changes, vendor verifications, moderation actions, and workspace permission changes emit immutable `audit_logs` records.

# GAWAZ INN 2.0 — Database Architecture

## 1. Engine & Migration Strategy
- **Local / Test Engine:** Built-in `node:sqlite` (`DatabaseSync`) stored in `.data/gawazinn.db` (gitignored) with `PRAGMA foreign_keys = ON`, `PRAGMA journal_mode = WAL`, and automatic versioned SQL migrations tracked in `_migrations`.
- **Production Parity:** Identical normalized table structures and constraints mirrored in `db/migrations/postgres/` for Supabase / PostgreSQL deployment.
- **Core Standards:** Foreign keys with explicit `ON DELETE` rules, unique constraints on slugs/emails/join keys, composite indexes on filter columns (`governorate_id`, `category`, `user_id`, `status`), soft deletes (`deleted_at`) where audit retention is needed, `created_at`/`updated_at` ISO timestamps, and `audit_logs` on sensitive mutations.

## 2. Core Data Domains & Tables (Normalized Relational Schema)

### Identity & Access
1. `users`: `id`, `name`, `name_en`, `email` (unique), `phone` (unique), `password_hash`, `role` (`super_admin|admin|editor|moderator|vendor|expert|customer`), `status` (`active|suspended`), `city`, `governorate_id`, `avatar_url`, `created_at`, `updated_at`, `deleted_at`
2. `sessions`: `id`, `user_id` (FK -> users), `token_hash` (unique), `expires_at`, `ip_address`, `user_agent`, `created_at`
3. `user_preferences`: `user_id` (PK/FK -> users), `language` (`ar|en`), `current_stage`, `expected_marriage_date`, `notifications_json`, `updated_at`
4. `couple_workspaces` & `workspace_members` & `workspace_invitations`: explicit partner linking with invite tokens, status (`pending|accepted|revoked`), and granular permissions JSON (`budget`, `tasks`, `shopping`, `documents`).

### Journey & Planning (Modules A, B, I, J)
5. `journey_goals`: `id`, `user_id` (FK), `workspace_id` (nullable FK), `title_ar`, `title_en`, `stage`, `timeframe_months`, `target_date`, `target_budget`, `initial_capital`, `monthly_target`, `is_private`, `created_at`, `updated_at`
6. `milestones`: `id`, `goal_id` (FK), `user_id` (FK), `title_ar`, `title_en`, `target_date`, `completed_at`, `sort_order`
7. `journey_tasks`: `id`, `user_id` (FK), `workspace_id`, `phase` (`early_start|engagement|12m|9m|6m|3m|1m|final_week|wedding_day|post_wedding`), `title_ar`, `title_en`, `description`, `owner_side` (`bride|groom|shared`), `due_date`, `depends_on_task_id` (FK), `status` (`todo|in_progress|done`), `priority`, `attachment_url`, `created_at`, `updated_at`
8. `task_comments`: `id`, `task_id` (FK), `user_id` (FK), `body`, `created_at`

### Finance & Budget Manager (Modules G, H — **Stage 3 Implemented in `003_stage3_calculators_budget.sql`**; Module A Scheduled Stage 4)
9. *(Planned Stage 4)* `early_start_profiles`, `savings_goals`, `savings_contributions`, `savings_badges`, `early_start_milestones`: up to 10-year pre-marriage planning, private future fund goals, contribution streaks, and non-public achievement badges.
10. `budget_plans` *(Implemented `003`)*: `id`, `user_id` (unique FK -> users), `title_ar`, `title_en`, `total_limit`, `emergency_reserve_target`, `expected_wedding_date`, `groom_share_percent`, `bride_share_percent`, `family_support_expected`, `notes`, `created_at`, `updated_at`.
11. `budget_categories` *(Implemented `003`)*: `id`, `budget_plan_id` (FK), `user_id` (FK), `slug`, `name_ar`, `name_en`, `owner_side` (`groom|bride|shared|family`), `planned_amount`, `limit_amount`, `sort_order`, `created_at`, `updated_at` (unique `(budget_plan_id, slug)`).
12. `budget_expenses` *(Implemented `003`)*: `id`, `budget_category_id` (FK), `user_id` (FK), `title`, `amount`, `paid_by_side`, `payment_type` (`deposit|installment|full|emergency`), `status` (`planned|paid|upcoming`), `due_date`, `paid_at`, `source_type` (`manual|order|booking|finishing_inquiry|calculator|rfq_quote`), `source_id`, `notes`, `created_at`, `updated_at` with partial unique index `idx_budget_expense_source_dedup ON budget_expenses(user_id, source_type, source_id) WHERE source_id IS NOT NULL` preventing duplicate syncs.
13. `calculator_runs` *(Implemented `003`)*: `id`, `user_id` (FK -> users), `calculator_slug`, `saved_title`, `inputs_json`, `primary_value`, `outputs_json`, `linked_budget_category_id` (nullable FK -> budget_categories `ON DELETE SET NULL`), `created_at`.

### Knowledge, CMS & Encyclopedia (Modules C, D, E, O — **Stage 2 Implemented in `002_stage2_encyclopedias.sql`**)
15. `content_categories`: `id`, `slug` (unique), `parent_id`, `domain` (`finishing|groom|bride|wedding|married_life|early_start|editorial`), `name_ar`, `name_en`, `description_ar`, `description_en`, `icon_name`, `sort_order`
16. `articles`: `id`, `slug` (unique), `category_id` (FK), `content_type` (`article|guide|tutorial|review|comparison|case_study|video|faq|glossary|local_guide`), `title_ar`, `title_en`, `excerpt_ar`, `excerpt_en`, `body_ar`, `body_en`, `featured_image`, `author_id` (FK), `tags_json`, `faq_json`, `seo_title`, `meta_description`, `canonical_url`, `status` (`draft|in_review|published|archived`), `published_at`, `updated_at`
17. `finishing_categories` *(Implemented `002`)*: 22 sequential stages (`step_order`, `phase_key`: `planning|rough_in|surfaces|fit_out|handover`, `budget_share_percent`, specs, common mistakes, inspection checklist, recommended materials).
18. `finishing_materials` *(Implemented `002`)*: `id`, `slug`, `category_slug`, `material_group` (`flooring|plumbing|electrical|paint|gypsum|countertop|windows|waterproofing`), `origin_ar/en`, `unit_ar/en`, `price_min_egp`, `price_max_egp`, `price_source`, `price_updated_at`, `pros/cons/alternatives/specs_json`, `best_use_ar/en`.
19. `before_after_projects` *(Implemented `002`)*: showcase projects by `governorate_slug`, `area_sqm`, `tier`, `duration_days`, `estimated_band_ar/en`, `before_image`, `after_image`, `scope_highlights_json`, `is_sample_listing`.
20. `finishing_contractors` *(Implemented `002`)*: `specialty_group` (`turnkey|architect_3d|mep|carpentry_kitchens`), `governorates_json`, `verification_badge` (`registered|verified`), `reviews_count` (`0` strictly for sample listings), `is_sample_listing`.
21. `groom_subcategories` & `groom_package_templates` *(Implemented `002`)*: 26 subcategories (`appliances|furniture|household`) + configurable `tier_100k`, `tier_200k`, `tier_300k`, `tier_500k`, `custom` slots JSON + `price_updated_at`.
22. `bride_categories` & `bride_checklist_templates` *(Implemented `002`)*: 19 bridal categories across 5 groups + 24 template items (`recommended_qty`, `priority`, `estimated_unit_price_egp`, `presets_json`).
23. `glossary_terms` & `faq_items` *(Implemented `002`)*: 28 bilingual terms & 12 categorized FAQs linked via `domain` & `related_calculator_slug`.
24. `user_groom_plans` & `user_bride_plans` *(Implemented `002`)*: owner-keyed (`user_id` PK/FK -> `users.id` ON DELETE CASCADE) saved configurator choices, excluded slots, preset mode, checked item IDs, quantity overrides, and custom items JSON.
25. `finishing_packages` *(Implemented `001`)*: packages (`economic|medium|luxury|ultra_luxury` with `price_per_meter`).
26. *(Planned Stage 6/9)* `content_relations`, `wedding_stories`: polymorphic joins and moderated customer stories.

### Commerce, Products & Vendors (Modules K, L, F)
21. `locations`: `id`, `slug` (unique), `level` (`country|governorate|city|district|area`), `parent_id` (FK), `name_ar`, `name_en`, `is_featured`
22. `products`: `id`, `slug` (unique), `sku` (unique), `trousseau_type` (`groom|bride|shared|finishing`), `category_slug`, `brand`, `model`, `name_ar`, `name_en`, `description_ar`, `description_en`, `specs_ar_json`, `specs_en_json`, `dimensions`, `capacity`, `energy_rating`, `warranty_months`, `pros_json`, `cons_json`, `price`, `original_price`, `price_source`, `price_updated_at`, `stock`, `availability_status`, `image_url`, `gallery_json`, `rating_avg`, `rating_count`, `is_featured`, `is_demo_data`
23. `product_price_history`: `id`, `product_id` (FK), `merchant_name`, `price`, `source`, `recorded_at`
24. `product_alternatives`: `product_id` (FK), `alternative_product_id` (FK), `reason_ar`, `reason_en`
25. `shopping_lists` & `shopping_list_items`: multi-list user shopping baskets with quantities, notes, checked status, alternative selection.
26. `vendors`: `id`, `owner_user_id` (FK), `slug` (unique), `business_name_ar`, `business_name_en`, `category_slug`, `governorate_id` (FK), `city_id` (FK), `service_areas_json`, `description_ar`, `description_en`, `logo_url`, `gallery_json`, `phone`, `whatsapp`, `email`, `verification_status` (`registered|verified|trusted|featured`), `verification_docs_json`, `subscription_plan_id` (FK), `rating_avg`, `reviews_count`, `is_demo_data`, `created_at`
27. `vendor_services` & `vendor_promotions`: service pricing ranges, capacity, active deals.
28. `subscription_plans` & `vendor_subscriptions` & `billing_records`: configurable Free/Basic/Pro/Premium plans managed from Admin OS.

### Transactions: RFQ, Bookings, Orders, Financing & Social Support (Modules M, N, + Existing)
29. `rfq_requests`: `id`, `user_id` (FK), `category_slug`, `location_id` (FK), `budget_min`, `budget_max`, `desired_date`, `requirements_json`, `description`, `attachments_json`, `preferred_contact`, `status` (`open|quoted|accepted|closed|cancelled`), `created_at`
30. `rfq_invitations` & `rfq_quotes` & `rfq_messages`: tracks authorized vendor access, quote offers, comparison, and customer Q&A.
31. `vendor_leads` & `lead_activities`: 8-stage Vendor CRM (`new_lead|contacted|quotation_sent|negotiation|accepted|in_progress|completed|lost`).
32. `appointments`: `id`, `user_id` (FK), `vendor_id` (FK), `service_id`, `appointment_type`, `slot_date`, `slot_time`, `status` (`requested|confirmed|rescheduled|cancelled|completed`), `notes`, `created_at`
33. `orders` & `order_items`, `finishing_inquiries`, `wedding_bookings`, `financing_applications`, `support_cases`, `sponsorship_inquiries` (preserving & hardening all 1.0 records with proper FKs, user ownership, and masked PII).

### Community, Wedding Day, Home Care & System (Modules P, R, S, T, Admin)
34. `community_questions`, `community_answers`, `community_reports`, `expert_profiles` (credential verification status).
35. `room_design_projects`, `moodboards`, `price_alerts`.
36. `wedding_invitations`, `wedding_guests`, `seating_tables`, `wedding_schedule_items`, `gift_registry_items`.
37. `home_inventory_items`, `home_warranties`, `maintenance_reminders`, `home_documents`.
38. `notifications`, `audit_logs`, `analytics_events`, `platform_settings`.


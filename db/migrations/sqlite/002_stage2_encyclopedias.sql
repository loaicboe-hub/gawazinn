-- GAWAZ INN 2.0 — Stage 2 Encyclopedia, Knowledge Hub & Planner State Schema (SQLite)

CREATE TABLE IF NOT EXISTS finishing_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  step_order INTEGER NOT NULL,
  phase_key TEXT NOT NULL CHECK (phase_key IN ('planning', 'rough_in', 'surfaces', 'fit_out', 'handover')),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  budget_share_percent REAL NOT NULL,
  typical_duration_ar TEXT NOT NULL,
  typical_duration_en TEXT NOT NULL,
  technical_specs_ar_json TEXT NOT NULL,
  technical_specs_en_json TEXT NOT NULL,
  common_mistakes_ar_json TEXT NOT NULL,
  common_mistakes_en_json TEXT NOT NULL,
  inspection_checklist_ar_json TEXT NOT NULL,
  inspection_checklist_en_json TEXT NOT NULL,
  recommended_materials_ar_json TEXT NOT NULL,
  recommended_materials_en_json TEXT NOT NULL,
  image_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fin_cat_step ON finishing_categories(step_order);

CREATE TABLE IF NOT EXISTS finishing_materials (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category_slug TEXT NOT NULL,
  material_group TEXT NOT NULL CHECK (material_group IN ('flooring', 'plumbing', 'electrical', 'paint', 'gypsum', 'countertop', 'windows', 'waterproofing')),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  origin_ar TEXT NOT NULL,
  origin_en TEXT NOT NULL,
  unit_ar TEXT NOT NULL,
  unit_en TEXT NOT NULL,
  price_min_egp INTEGER NOT NULL,
  price_max_egp INTEGER NOT NULL,
  price_source TEXT NOT NULL,
  price_updated_at TEXT NOT NULL,
  pros_ar_json TEXT NOT NULL,
  pros_en_json TEXT NOT NULL,
  cons_ar_json TEXT NOT NULL,
  cons_en_json TEXT NOT NULL,
  alternatives_ar_json TEXT NOT NULL,
  alternatives_en_json TEXT NOT NULL,
  specs_ar_json TEXT NOT NULL,
  specs_en_json TEXT NOT NULL,
  best_use_ar TEXT NOT NULL,
  best_use_en TEXT NOT NULL,
  image_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fin_mat_group ON finishing_materials(material_group);

CREATE TABLE IF NOT EXISTS before_after_projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  governorate_slug TEXT NOT NULL,
  governorate_ar TEXT NOT NULL,
  governorate_en TEXT NOT NULL,
  area_sqm INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('economic', 'medium', 'luxury', 'ultra_luxury', 'custom')),
  tier_ar TEXT NOT NULL,
  tier_en TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  duration_ar TEXT NOT NULL,
  duration_en TEXT NOT NULL,
  estimated_band_ar TEXT NOT NULL,
  estimated_band_en TEXT NOT NULL,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  scope_highlights_ar_json TEXT NOT NULL,
  scope_highlights_en_json TEXT NOT NULL,
  is_sample_listing INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ba_projects_gov_tier ON before_after_projects(governorate_slug, tier);

CREATE TABLE IF NOT EXISTS finishing_contractors (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  role_title_ar TEXT NOT NULL,
  role_title_en TEXT NOT NULL,
  specialty_group TEXT NOT NULL CHECK (specialty_group IN ('turnkey', 'architect_3d', 'mep', 'carpentry_kitchens')),
  specialty_ar TEXT NOT NULL,
  specialty_en TEXT NOT NULL,
  governorates_json TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  verification_badge TEXT NOT NULL CHECK (verification_badge IN ('registered', 'verified')),
  pricing_model_ar TEXT NOT NULL,
  pricing_model_en TEXT NOT NULL,
  portfolio_highlights_ar_json TEXT NOT NULL,
  portfolio_highlights_en_json TEXT NOT NULL,
  warranty_offered_ar TEXT NOT NULL,
  warranty_offered_en TEXT NOT NULL,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  rating_note_ar TEXT NOT NULL,
  rating_note_en TEXT NOT NULL,
  is_sample_listing INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS groom_subcategories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  group_key TEXT NOT NULL CHECK (group_key IN ('appliances', 'furniture', 'household')),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('essential', 'recommended', 'optional')),
  budget_share_percent REAL NOT NULL,
  estimated_min_egp INTEGER NOT NULL,
  estimated_max_egp INTEGER NOT NULL,
  buying_checklist_ar_json TEXT NOT NULL,
  buying_checklist_en_json TEXT NOT NULL,
  warranty_tips_ar TEXT NOT NULL,
  warranty_tips_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_groom_sub_group ON groom_subcategories(group_key);

CREATE TABLE IF NOT EXISTS groom_package_templates (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  tier_key TEXT NOT NULL UNIQUE CHECK (tier_key IN ('tier_100k', 'tier_200k', 'tier_300k', 'tier_500k', 'custom')),
  target_budget_egp INTEGER NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  tagline_ar TEXT NOT NULL,
  tagline_en TEXT NOT NULL,
  warranty_note_ar TEXT NOT NULL,
  warranty_note_en TEXT NOT NULL,
  price_updated_at TEXT NOT NULL,
  slots_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bride_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL,
  group_key TEXT NOT NULL CHECK (group_key IN ('kitchen_cookware', 'dining_hosting', 'linens_bedding', 'bath_home', 'personal_care')),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  budget_weight_percent REAL NOT NULL,
  anti_waste_tip_ar TEXT NOT NULL,
  anti_waste_tip_en TEXT NOT NULL,
  recommended_count_label_ar TEXT NOT NULL,
  recommended_count_label_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bride_checklist_templates (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES bride_categories(id) ON DELETE CASCADE,
  label_ar TEXT NOT NULL,
  label_en TEXT NOT NULL,
  recommended_qty INTEGER NOT NULL DEFAULT 1,
  unit_label_ar TEXT NOT NULL,
  unit_label_en TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('essential', 'recommended', 'optional')),
  estimated_unit_price_egp INTEGER NOT NULL,
  presets_json TEXT NOT NULL,
  note_ar TEXT NOT NULL,
  note_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bride_chk_cat ON bride_checklist_templates(category_id);

CREATE TABLE IF NOT EXISTS glossary_terms (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL CHECK (domain IN ('finishing', 'groom', 'bride', 'wedding', 'early_start', 'married_life', 'editorial')),
  term_ar TEXT NOT NULL,
  term_en TEXT NOT NULL,
  definition_ar TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  example_ar TEXT NOT NULL,
  example_en TEXT NOT NULL,
  related_calculator_slug TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faq_items (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL CHECK (domain IN ('finishing', 'groom', 'bride', 'wedding', 'early_start', 'married_life', 'editorial')),
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_groom_plans (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  selected_tier_key TEXT NOT NULL DEFAULT 'tier_200k',
  target_budget_egp INTEGER NOT NULL DEFAULT 200000,
  slot_selections_json TEXT NOT NULL DEFAULT '{}',
  excluded_slots_json TEXT NOT NULL DEFAULT '[]',
  custom_items_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_bride_plans (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preset_mode TEXT NOT NULL DEFAULT 'balanced' CHECK (preset_mode IN ('compact', 'balanced', 'extended')),
  target_budget_egp INTEGER NOT NULL DEFAULT 90000,
  checked_item_ids_json TEXT NOT NULL DEFAULT '[]',
  qty_overrides_json TEXT NOT NULL DEFAULT '{}',
  custom_items_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);


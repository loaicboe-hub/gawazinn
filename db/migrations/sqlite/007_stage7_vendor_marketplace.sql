-- GAWAZ INN 2.0 — Stage 7: Vendor Marketplace, 17 Categories, Verification vs Paid Plans & Local Discovery (SQLite)

CREATE TABLE IF NOT EXISTS vendor_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL CHECK (domain IN ('finishing', 'groom', 'bride', 'wedding', 'post_marriage')),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Building2',
  buyer_checklist_ar_json TEXT NOT NULL DEFAULT '[]',
  buyer_checklist_en_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vendor_categories_domain ON vendor_categories(domain, sort_order ASC);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE CHECK (code IN ('free', 'basic', 'professional', 'premium')),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  monthly_price_egp INTEGER NOT NULL DEFAULT 0,
  annual_price_egp INTEGER NOT NULL DEFAULT 0,
  max_services INTEGER NOT NULL DEFAULT 3,
  max_promotions INTEGER NOT NULL DEFAULT 0,
  max_portfolio_items INTEGER NOT NULL DEFAULT 4,
  lead_priority_boost INTEGER NOT NULL DEFAULT 0,
  analytics_tier TEXT NOT NULL DEFAULT 'basic',
  features_ar_json TEXT NOT NULL DEFAULT '[]',
  features_en_json TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  business_name_ar TEXT NOT NULL,
  business_name_en TEXT NOT NULL,
  primary_category_slug TEXT NOT NULL REFERENCES vendor_categories(slug) ON DELETE RESTRICT,
  extra_category_slugs_json TEXT NOT NULL DEFAULT '[]',
  governorate_slug TEXT NOT NULL,
  city_slug TEXT,
  service_areas_json TEXT NOT NULL DEFAULT '[]',
  address_ar TEXT NOT NULL,
  address_en TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  website_url TEXT,
  bio_ar TEXT NOT NULL,
  bio_en TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  logo_image TEXT,
  portfolio_images_json TEXT NOT NULL DEFAULT '[]',
  price_tier TEXT NOT NULL DEFAULT 'mid' CHECK (price_tier IN ('economy', 'mid', 'luxury')),
  starting_price_egp INTEGER NOT NULL DEFAULT 0,
  years_experience INTEGER NOT NULL DEFAULT 1,
  verification_status TEXT NOT NULL DEFAULT 'registered' CHECK (verification_status IN ('registered', 'verified', 'trusted', 'rejected')),
  verification_docs_json TEXT NOT NULL DEFAULT '[]',
  verification_notes TEXT,
  verified_at TEXT,
  verified_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  subscription_plan_id TEXT NOT NULL DEFAULT 'plan_free' REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  commercial_status TEXT NOT NULL DEFAULT 'active' CHECK (commercial_status IN ('active', 'past_due', 'paused')),
  subscription_started_at TEXT,
  subscription_renews_at TEXT,
  rating_avg REAL NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  profile_views INTEGER NOT NULL DEFAULT 0,
  is_featured_commercial INTEGER NOT NULL DEFAULT 0,
  is_demo_data INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendors_cat_gov ON vendors(primary_category_slug, governorate_slug);
CREATE INDEX IF NOT EXISTS idx_vendors_owner ON vendors(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_verif ON vendors(verification_status);

CREATE TABLE IF NOT EXISTS vendor_services (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  unit_label_ar TEXT NOT NULL,
  unit_label_en TEXT NOT NULL,
  starting_price_egp INTEGER NOT NULL DEFAULT 0,
  turnaround_days TEXT,
  warranty_months INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendor_services_vendor ON vendor_services(vendor_id, sort_order ASC);

CREATE TABLE IF NOT EXISTS vendor_promotions (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  promo_code TEXT,
  valid_until TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendor_promotions_vendor ON vendor_promotions(vendor_id, is_active);

CREATE TABLE IF NOT EXISTS vendor_reviews (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  author_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_verified_project INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE (vendor_id, author_user_id)
);

CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor ON vendor_reviews(vendor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS vendor_billing_records (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  amount_egp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded', 'paid', 'cancelled')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendor_billing_vendor ON vendor_billing_records(vendor_id, created_at DESC);


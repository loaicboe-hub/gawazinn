-- GAWAZ INN 2.0 — Stage 1 Core Relational Schema (PostgreSQL / Supabase Parity)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'expert', 'moderator', 'editor', 'admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  city TEXT,
  governorate_slug TEXT,
  current_stage TEXT NOT NULL DEFAULT 'thinking',
  language TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  avatar_url TEXT,
  is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK (level IN ('country', 'governorate', 'city', 'district', 'area')),
  parent_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  cost_factor DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS content_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL CHECK (domain IN ('finishing', 'groom', 'bride', 'wedding', 'early_start', 'married_life', 'editorial')),
  parent_id TEXT REFERENCES content_categories(id) ON DELETE SET NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'BookOpen',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL REFERENCES content_categories(id) ON DELETE RESTRICT,
  domain TEXT NOT NULL,
  content_type TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_ar TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  body_ar TEXT NOT NULL,
  body_en TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  tags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_calculators_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_title_ar TEXT,
  seo_title_en TEXT,
  meta_desc_ar TEXT,
  meta_desc_en TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  reading_minutes INTEGER NOT NULL DEFAULT 5,
  view_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finishing_packages (
  id TEXT PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price_per_meter INTEGER NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  features_ar_json JSONB NOT NULL,
  features_en_json JSONB NOT NULL,
  recommended_for_ar TEXT NOT NULL,
  recommended_for_en TEXT NOT NULL,
  badge TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS finishing_services (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  starting_price_per_meter INTEGER NOT NULL,
  duration_days TEXT NOT NULL,
  included_items_ar_json JSONB NOT NULL,
  included_items_en_json JSONB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  trousseau_type TEXT NOT NULL,
  category TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  category_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  brand TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  gallery_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  specs_ar_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  specs_en_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_source TEXT NOT NULL DEFAULT 'GAWAZ INN Verified Partner Baseline',
  price_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_ready_package_item BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo_data BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wedding_services (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  governorate_slug TEXT,
  location_ar TEXT NOT NULL,
  location_en TEXT NOT NULL,
  starting_price INTEGER NOT NULL,
  pricing_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gallery_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating DOUBLE PRECISION NOT NULL DEFAULT 4.8,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  capacity TEXT,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  features_ar_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  features_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge TEXT,
  is_demo_data BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_snapshot_json JSONB NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS finishing_inquiries (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  area_sqm INTEGER NOT NULL,
  rooms_count INTEGER NOT NULL,
  bathrooms_count INTEGER NOT NULL,
  finishing_tier TEXT NOT NULL,
  budget_egp INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  estimated_cost_min INTEGER,
  estimated_cost_max INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wedding_bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  service_id TEXT NOT NULL REFERENCES wedding_services(id) ON DELETE RESTRICT,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wedding_date TEXT NOT NULL,
  guest_count INTEGER,
  governorate TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financing_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  national_id_masked TEXT NOT NULL,
  national_id_hash TEXT NOT NULL,
  monthly_income INTEGER NOT NULL,
  employer TEXT NOT NULL,
  governorate TEXT NOT NULL,
  requested_amount INTEGER NOT NULL,
  tenure_months INTEGER NOT NULL,
  preferred_provider TEXT NOT NULL,
  associated_section TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_cases (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  national_id_masked TEXT NOT NULL,
  national_id_hash TEXT NOT NULL,
  phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL,
  case_description TEXT NOT NULL,
  urgency_level TEXT NOT NULL,
  documents_submitted_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'confidential_review',
  support_value_estimated INTEGER,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsorship_inquiries (
  id TEXT PRIMARY KEY,
  sponsor_name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  contribution_type TEXT NOT NULL,
  pledge_amount INTEGER,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- GAWAZ INN 2.0 — Stage 1 Core Relational Schema (SQLite)

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
  is_demo_data INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK (level IN ('country', 'governorate', 'city', 'district', 'area')),
  parent_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  cost_factor REAL NOT NULL DEFAULT 1.0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_locations_level_parent ON locations(level, parent_id);

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

CREATE INDEX IF NOT EXISTS idx_categories_domain ON content_categories(domain);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL REFERENCES content_categories(id) ON DELETE RESTRICT,
  domain TEXT NOT NULL CHECK (domain IN ('finishing', 'groom', 'bride', 'wedding', 'early_start', 'married_life', 'editorial')),
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'guide', 'tutorial', 'review', 'comparison', 'case_study', 'video', 'faq', 'glossary', 'local_guide')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_ar TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  body_ar TEXT NOT NULL,
  body_en TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  faq_json TEXT NOT NULL DEFAULT '[]',
  related_calculators_json TEXT NOT NULL DEFAULT '[]',
  seo_title_ar TEXT,
  seo_title_en TEXT,
  meta_desc_ar TEXT,
  meta_desc_en TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'in_review', 'published', 'archived')),
  reading_minutes INTEGER NOT NULL DEFAULT 5,
  view_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_domain_status ON articles(domain, status);
CREATE INDEX IF NOT EXISTS idx_articles_cat ON articles(category_id);

CREATE TABLE IF NOT EXISTS finishing_packages (
  id TEXT PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price_per_meter INTEGER NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  features_ar_json TEXT NOT NULL,
  features_en_json TEXT NOT NULL,
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
  included_items_ar_json TEXT NOT NULL,
  included_items_en_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  trousseau_type TEXT NOT NULL CHECK (trousseau_type IN ('groom', 'bride', 'shared', 'finishing')),
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
  gallery_json TEXT NOT NULL DEFAULT '[]',
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  specs_ar_json TEXT NOT NULL DEFAULT '{}',
  specs_en_json TEXT NOT NULL DEFAULT '{}',
  price_source TEXT NOT NULL DEFAULT 'GAWAZ INN Verified Partner Baseline',
  price_updated_at TEXT NOT NULL,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_ready_package_item INTEGER NOT NULL DEFAULT 0,
  is_demo_data INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_type_cat ON products(trousseau_type, category);

CREATE TABLE IF NOT EXISTS wedding_services (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('venue', 'dress', 'car', 'photography', 'beauty', 'decor', 'entertainment', 'catering', 'package')),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  governorate_slug TEXT,
  location_ar TEXT NOT NULL,
  location_en TEXT NOT NULL,
  starting_price INTEGER NOT NULL,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('fixed', 'per_person', 'per_hour', 'package')),
  image_url TEXT NOT NULL,
  gallery_json TEXT NOT NULL DEFAULT '[]',
  rating REAL NOT NULL DEFAULT 4.8,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  capacity TEXT,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  features_ar_json TEXT NOT NULL DEFAULT '[]',
  features_en_json TEXT NOT NULL DEFAULT '[]',
  badge TEXT,
  is_demo_data INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wedding_services_cat_gov ON wedding_services(category, governorate_slug);

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
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'card', 'installments_request')),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_snapshot_json TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS finishing_inquiries (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  area_sqm INTEGER NOT NULL,
  rooms_count INTEGER NOT NULL,
  bathrooms_count INTEGER NOT NULL,
  finishing_tier TEXT NOT NULL CHECK (finishing_tier IN ('economic', 'medium', 'luxury', 'ultra_luxury', 'custom')),
  budget_egp INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'site_visit_scheduled', 'quotation_ready', 'in_progress', 'completed')),
  estimated_cost_min INTEGER,
  estimated_cost_max INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_finishing_user ON finishing_inquiries(user_id);

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
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'contacted', 'date_confirmed', 'deposit_paid', 'completed', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wedding_bookings_user ON wedding_bookings(user_id);

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
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'documents_required', 'approved', 'rejected')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_financing_user ON financing_applications(user_id);

CREATE TABLE IF NOT EXISTS support_cases (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  national_id_masked TEXT NOT NULL,
  national_id_hash TEXT NOT NULL,
  phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('apartment_finishing', 'appliances_furniture', 'groom_bride_essentials', 'wedding_hall')),
  case_description TEXT NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('normal', 'urgent', 'critical')),
  documents_submitted_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'confidential_review' CHECK (status IN ('confidential_review', 'field_research', 'approved_for_support', 'funded_and_delivered', 'ineligible')),
  support_value_estimated INTEGER,
  internal_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_support_user ON support_cases(user_id);

CREATE TABLE IF NOT EXISTS sponsorship_inquiries (
  id TEXT PRIMARY KEY,
  sponsor_name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('financial', 'in_kind_goods', 'finishing_materials', 'full_wedding_sponsorship')),
  pledge_amount INTEGER,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'agreement_signed', 'fulfilled')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  ip_address TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);


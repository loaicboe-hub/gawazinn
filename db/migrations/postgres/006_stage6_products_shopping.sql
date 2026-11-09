-- GAWAZ INN 2.0 — Stage 6: Product Encyclopedia, Price Intelligence & Multi-List Shopping Baskets (PostgreSQL)

ALTER TABLE products ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS capacity TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS energy_rating TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_months INTEGER NOT NULL DEFAULT 12;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_terms_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_terms_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pros_ar_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS pros_en_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS cons_ar_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS cons_en_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS buyer_warnings_ar_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS buyer_warnings_en_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS recommended_for_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS recommended_for_en TEXT;

CREATE TABLE IF NOT EXISTS product_price_history (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  source TEXT NOT NULL,
  recorded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_price_history_prod ON product_price_history(product_id, recorded_at ASC);

CREATE TABLE IF NOT EXISTS product_merchant_offers (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  warranty_type TEXT NOT NULL CHECK (warranty_type IN ('official_agent', 'authorized_dealer', 'gray_market_importer')),
  price INTEGER NOT NULL,
  delivery_sla_ar TEXT NOT NULL,
  delivery_sla_en TEXT NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 1,
  notes_ar TEXT,
  notes_en TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_merchant_offers_prod ON product_merchant_offers(product_id, price ASC);

CREATE TABLE IF NOT EXISTS product_alternatives (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  alternative_product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('budget', 'upgrade', 'energy_saver', 'compact')),
  reason_ar TEXT NOT NULL,
  reason_en TEXT NOT NULL,
  UNIQUE (product_id, alternative_product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_alternatives_prod ON product_alternatives(product_id);

CREATE TABLE IF NOT EXISTS shopping_lists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES couple_workspaces(id) ON DELETE SET NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  list_type TEXT NOT NULL DEFAULT 'general' CHECK (list_type IN ('groom_appliances', 'bride_kitchen', 'finishing_hardware', 'home_furniture', 'general')),
  is_shared_with_partner INTEGER NOT NULL DEFAULT 0,
  budget_target INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON shopping_lists(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_ws ON shopping_lists(workspace_id, is_shared_with_partner);

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  custom_title TEXT NOT NULL,
  category_label TEXT NOT NULL DEFAULT 'general',
  quantity INTEGER NOT NULL DEFAULT 1,
  target_unit_price INTEGER NOT NULL DEFAULT 0,
  preferred_merchant TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'shortlisted', 'ready_to_buy', 'purchased')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  added_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list ON shopping_list_items(list_id, sort_order ASC);

CREATE TABLE IF NOT EXISTS price_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price INTEGER NOT NULL,
  current_price_snapshot INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'paused')),
  triggered_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id, status);


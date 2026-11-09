-- Stage 11: Married Life, Home Care & Digital Home File (PostgreSQL)

CREATE TABLE IF NOT EXISTS home_file_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_label TEXT NOT NULL,
  asset_category TEXT NOT NULL CHECK (
    asset_category IN (
      'paint_code',
      'electrical_panel',
      'plumbing_diagram',
      'appliance_manual',
      'measurement',
      'meter_serial',
      'supplier_contact'
    )
  ),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  code_or_serial TEXT,
  vendor_or_brand TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_assets_user ON home_file_assets(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS maintenance_reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  system_category TEXT NOT NULL CHECK (
    system_category IN (
      'ac_service',
      'water_heater',
      'plumbing_check',
      'electrical_safety',
      'pest_control',
      'painting_touchup',
      'appliance_filter',
      'moving_prep'
    )
  ),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  interval_months INTEGER NOT NULL DEFAULT 6,
  next_due_date TEXT NOT NULL,
  last_completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due_soon', 'overdue', 'completed')),
  estimated_cost_egp INTEGER NOT NULL DEFAULT 0,
  vendor_category_slug TEXT NOT NULL DEFAULT 'home_maintenance',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maint_rem_user_due ON maintenance_reminders(user_id, next_due_date ASC);

CREATE TABLE IF NOT EXISTS home_inventory_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_label TEXT NOT NULL,
  item_name TEXT NOT NULL,
  brand_model TEXT NOT NULL,
  purchase_date TEXT,
  purchase_price_egp INTEGER NOT NULL DEFAULT 0,
  warranty_expiry_date TEXT,
  condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('new', 'good', 'needs_service', 'replace_soon')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_inv_user ON home_inventory_items(user_id, created_at DESC);


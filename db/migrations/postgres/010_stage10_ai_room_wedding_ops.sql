-- Stage 10: Grounded AI Assistant, Smart Room Designer & Moodboards, Wedding Day Operations & Public RSVP (PostgreSQL)

CREATE TABLE IF NOT EXISTS ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  guest_token TEXT,
  session_title TEXT NOT NULL,
  messages_json TEXT NOT NULL DEFAULT '[]',
  last_intent TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user
  ON ai_conversations(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS room_moodboards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (
    room_type IN ('living', 'bedroom', 'kitchen', 'bathroom', 'dining', 'reception', 'kids')
  ),
  length_m DOUBLE PRECISION NOT NULL DEFAULT 4.5,
  width_m DOUBLE PRECISION NOT NULL DEFAULT 3.8,
  height_m DOUBLE PRECISION NOT NULL DEFAULT 2.8,
  theme_slug TEXT NOT NULL CHECK (
    theme_slug IN ('warm_beige', 'modern_cairo', 'classic_ivory', 'minimalist_nordic', 'romantic_wine')
  ),
  palette_hex_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  is_shared_with_partner SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_moodboards_user
  ON room_moodboards(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS moodboard_items (
  id TEXT PRIMARY KEY,
  moodboard_id TEXT NOT NULL REFERENCES room_moodboards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'material', 'custom_furniture')),
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  material_slug TEXT,
  label_ar TEXT NOT NULL,
  label_en TEXT NOT NULL,
  width_cm INTEGER NOT NULL DEFAULT 120,
  depth_cm INTEGER NOT NULL DEFAULT 80,
  pos_x_pct DOUBLE PRECISION NOT NULL DEFAULT 50,
  pos_y_pct DOUBLE PRECISION NOT NULL DEFAULT 50,
  estimated_price_egp INTEGER NOT NULL DEFAULT 0,
  color_hex TEXT NOT NULL DEFAULT '#D91B3E',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moodboard_items_board
  ON moodboard_items(moodboard_id, created_at ASC);

CREATE TABLE IF NOT EXISTS seating_tables (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('vip_front', 'family_center', 'friends', 'outdoor')),
  capacity INTEGER NOT NULL DEFAULT 8,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seating_tables_user
  ON seating_tables(user_id, sort_order ASC);

CREATE TABLE IF NOT EXISTS wedding_guests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  side TEXT NOT NULL CHECK (side IN ('groom', 'bride', 'shared')),
  guest_group TEXT NOT NULL CHECK (guest_group IN ('family', 'friends', 'colleagues', 'vip')),
  invited_count INTEGER NOT NULL DEFAULT 1,
  plus_one_allowed SMALLINT NOT NULL DEFAULT 0,
  rsvp_code TEXT NOT NULL UNIQUE,
  rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  attending_count INTEGER NOT NULL DEFAULT 0,
  meal_preference TEXT NOT NULL DEFAULT 'standard',
  dietary_notes TEXT,
  table_id TEXT REFERENCES seating_tables(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_guests_user_status
  ON wedding_guests(user_id, rsvp_status);

CREATE TABLE IF NOT EXISTS wedding_timeline_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  assignee TEXT NOT NULL,
  location_note TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ready', 'completed')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_timeline_user
  ON wedding_timeline_events(user_id, start_time ASC, sort_order ASC);

CREATE TABLE IF NOT EXISTS gift_registry_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  category_label TEXT NOT NULL,
  target_price_egp INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'essential' CHECK (priority IN ('essential', 'nice_to_have', 'dream')),
  reservation_status TEXT NOT NULL DEFAULT 'available' CHECK (reservation_status IN ('available', 'reserved', 'received')),
  reserved_by_name TEXT,
  reserved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_registry_user
  ON gift_registry_items(user_id, reservation_status);


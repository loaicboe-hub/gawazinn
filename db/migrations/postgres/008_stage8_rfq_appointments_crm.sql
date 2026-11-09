-- GAWAZ INN 2.0 — Stage 8: Multi-Vendor RFQ Engine, Marketplace Slot Appointments & 8-Stage Vendor CRM (PostgreSQL)

CREATE TABLE IF NOT EXISTS rfq_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category_slug TEXT NOT NULL REFERENCES vendor_categories(slug) ON DELETE RESTRICT,
  governorate_slug TEXT NOT NULL,
  city_slug TEXT,
  budget_min INTEGER NOT NULL DEFAULT 0,
  budget_max INTEGER NOT NULL DEFAULT 0,
  desired_date TEXT,
  scope_details TEXT NOT NULL,
  requirements_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferred_contact TEXT NOT NULL DEFAULT 'platform' CHECK (preferred_contact IN ('platform', 'phone', 'whatsapp')),
  target_vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'quoted', 'accepted', 'closed', 'cancelled')),
  accepted_quote_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfq_requests_user ON rfq_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfq_requests_cat_gov ON rfq_requests(category_slug, governorate_slug, status);

CREATE TABLE IF NOT EXISTS rfq_invitations (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL REFERENCES rfq_requests(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'viewed', 'quoted', 'declined')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rfq_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_rfq_invitations_vendor ON rfq_invitations(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_rfq_invitations_rfq ON rfq_invitations(rfq_id);

CREATE TABLE IF NOT EXISTS rfq_quotes (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL REFERENCES rfq_requests(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  quoted_amount_egp INTEGER NOT NULL CHECK (quoted_amount_egp > 0),
  deposit_amount_egp INTEGER NOT NULL DEFAULT 0,
  estimated_duration TEXT NOT NULL,
  warranty_months INTEGER NOT NULL DEFAULT 12,
  scope_summary TEXT NOT NULL,
  terms_notes TEXT,
  valid_until TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'rejected', 'withdrawn')),
  customer_decision_note TEXT,
  linked_budget_expense_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rfq_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_rfq_quotes_rfq ON rfq_quotes(rfq_id, quoted_amount_egp ASC);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_vendor ON rfq_quotes(vendor_id, status);

CREATE TABLE IF NOT EXISTS rfq_messages (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL REFERENCES rfq_requests(id) ON DELETE CASCADE,
  sender_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'vendor', 'admin')),
  sender_name TEXT NOT NULL,
  vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfq_messages_rfq ON rfq_messages(rfq_id, vendor_id, created_at ASC);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  service_id TEXT REFERENCES vendor_services(id) ON DELETE SET NULL,
  rfq_id TEXT REFERENCES rfq_requests(id) ON DELETE SET NULL,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('site_visit', 'showroom', 'hall_tour', 'video_consultation', 'contract_signing', 'measuring')),
  slot_date TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  customer_phone TEXT NOT NULL,
  customer_notes TEXT,
  vendor_response_note TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'rescheduled', 'cancelled', 'completed')),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id, slot_date ASC, slot_time ASC);
CREATE INDEX IF NOT EXISTS idx_appointments_vendor ON appointments(vendor_id, status, slot_date ASC);

CREATE TABLE IF NOT EXISTS vendor_leads (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  rfq_id TEXT REFERENCES rfq_requests(id) ON DELETE SET NULL,
  appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
  lead_source TEXT NOT NULL CHECK (lead_source IN ('rfq', 'appointment', 'direct_portal', 'manual')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'new_lead' CHECK (stage IN ('new_lead', 'contacted', 'quotation_sent', 'negotiation', 'accepted', 'in_progress', 'completed', 'lost')),
  estimated_value_egp INTEGER NOT NULL DEFAULT 0,
  next_follow_up_date TEXT,
  loss_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_leads_rfq_unique
  ON vendor_leads(vendor_id, rfq_id)
  WHERE rfq_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_leads_apt_unique
  ON vendor_leads(vendor_id, appointment_id)
  WHERE appointment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vendor_leads_vendor_stage ON vendor_leads(vendor_id, stage, updated_at DESC);

CREATE TABLE IF NOT EXISTS lead_activities (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES vendor_leads(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('status_change', 'note', 'call', 'quote_sent', 'appointment', 'budget_accepted')),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id, created_at DESC);


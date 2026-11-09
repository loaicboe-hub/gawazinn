-- GAWAZ INN 2.0 — Stage 3 Unified Smart Calculators & Wedding Budget Manager Schema (PostgreSQL Parity)

CREATE TABLE IF NOT EXISTS calculator_runs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  calculator_slug TEXT NOT NULL,
  inputs_json JSONB NOT NULL,
  outputs_json JSONB NOT NULL,
  primary_value NUMERIC(14,2) NOT NULL,
  saved_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calc_runs_user_slug ON calculator_runs(user_id, calculator_slug, created_at DESC);

CREATE TABLE IF NOT EXISTS budget_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL DEFAULT 'ميزانية الزواج وتجهيز البيت',
  title_en TEXT NOT NULL DEFAULT 'Wedding & Home Preparation Budget',
  total_budget_limit NUMERIC(14,2) NOT NULL DEFAULT 650000,
  groom_contribution_target NUMERIC(14,2) NOT NULL DEFAULT 420000,
  bride_contribution_target NUMERIC(14,2) NOT NULL DEFAULT 180000,
  family_support_target NUMERIC(14,2) NOT NULL DEFAULT 50000,
  emergency_reserve_target NUMERIC(14,2) NOT NULL DEFAULT 65000,
  currency TEXT NOT NULL DEFAULT 'EGP',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_categories (
  id TEXT PRIMARY KEY,
  budget_plan_id TEXT NOT NULL REFERENCES budget_plans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  owner_side TEXT NOT NULL DEFAULT 'shared' CHECK (owner_side IN ('groom', 'bride', 'shared')),
  planned_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  limit_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_cat_unique ON budget_categories(budget_plan_id, slug);
CREATE INDEX IF NOT EXISTS idx_budget_cat_user ON budget_categories(user_id, sort_order);

CREATE TABLE IF NOT EXISTS budget_expenses (
  id TEXT PRIMARY KEY,
  budget_plan_id TEXT NOT NULL REFERENCES budget_plans(id) ON DELETE CASCADE,
  budget_category_id TEXT NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vendor_or_payee TEXT,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  payment_type TEXT NOT NULL DEFAULT 'full' CHECK (payment_type IN ('deposit', 'installment', 'full', 'emergency')),
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('planned', 'upcoming', 'paid')),
  paid_by_side TEXT NOT NULL DEFAULT 'shared' CHECK (paid_by_side IN ('groom', 'bride', 'shared')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'calculator_run', 'order', 'finishing_inquiry', 'wedding_booking', 'rfq_quote')),
  source_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_expense_source_dedup
  ON budget_expenses(user_id, source_type, source_id)
  WHERE source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_budget_expense_user_status ON budget_expenses(user_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_budget_expense_cat ON budget_expenses(budget_category_id);


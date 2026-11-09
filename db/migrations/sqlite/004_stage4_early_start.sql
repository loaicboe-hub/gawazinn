-- GAWAZ INN 2.0 — Stage 4 Early Start & My Future Fund Schema (SQLite)

CREATE TABLE IF NOT EXISTS early_start_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  timeframe_preset TEXT NOT NULL DEFAULT '3y' CHECK (timeframe_preset IN ('10y', '7y', '5y', '3y', '2y', '1y', '6m', 'custom')),
  timeframe_months INTEGER NOT NULL DEFAULT 36 CHECK (timeframe_months >= 3 AND timeframe_months <= 120),
  expected_marriage_date TEXT,
  target_marriage_budget REAL NOT NULL DEFAULT 600000 CHECK (target_marriage_budget >= 20000),
  initial_capital REAL NOT NULL DEFAULT 50000 CHECK (initial_capital >= 0),
  monthly_savings_target REAL NOT NULL DEFAULT 5000 CHECK (monthly_savings_target >= 0),
  emergency_reserve_target REAL NOT NULL DEFAULT 60000 CHECK (emergency_reserve_target >= 0),
  reminder_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (reminder_frequency IN ('weekly', 'biweekly', 'monthly', 'off')),
  personal_notes TEXT,
  is_private INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('marriage', 'apartment_purchase', 'finishing', 'furniture', 'appliances', 'wedding', 'emergency')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  target_amount REAL NOT NULL CHECK (target_amount >= 1000),
  current_amount REAL NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  monthly_contribution REAL NOT NULL DEFAULT 0 CHECK (monthly_contribution >= 0),
  target_date TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  is_private INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id, priority ASC, created_at DESC);

CREATE TABLE IF NOT EXISTS savings_contributions (
  id TEXT PRIMARY KEY,
  savings_goal_id TEXT NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL CHECK (amount != 0),
  contribution_type TEXT NOT NULL DEFAULT 'deposit' CHECK (contribution_type IN ('deposit', 'adjustment')),
  contribution_date TEXT NOT NULL,
  streak_month TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_savings_contrib_user_month ON savings_contributions(user_id, streak_month DESC, contribution_date DESC);
CREATE INDEX IF NOT EXISTS idx_savings_contrib_goal ON savings_contributions(savings_goal_id, contribution_date DESC);

CREATE TABLE IF NOT EXISTS savings_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  earned_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_savings_badges_unique ON savings_badges(user_id, badge_key);

CREATE TABLE IF NOT EXISTS early_start_milestones (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track TEXT NOT NULL CHECK (track IN ('financial', 'personal', 'education', 'housing')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  target_months_out INTEGER NOT NULL DEFAULT 12,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_early_milestones_user ON early_start_milestones(user_id, sort_order ASC);

CREATE TABLE IF NOT EXISTS early_start_lesson_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (user_id, lesson_slug)
);


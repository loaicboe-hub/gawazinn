-- Stage 9: My Wedding Story, Community Q&A, Reports, Expert Credentials Directory (PostgreSQL Parity)

CREATE TABLE IF NOT EXISTS real_weddings (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  couple_title_ar TEXT NOT NULL,
  couple_title_en TEXT NOT NULL,
  governorate_slug TEXT NOT NULL,
  city_ar TEXT NOT NULL,
  city_en TEXT NOT NULL,
  wedding_year INTEGER NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 150,
  total_actual_budget_egp INTEGER NOT NULL,
  finishing_cost_egp INTEGER NOT NULL DEFAULT 0,
  groom_trousseau_egp INTEGER NOT NULL DEFAULT 0,
  bride_trousseau_egp INTEGER NOT NULL DEFAULT 0,
  wedding_cost_egp INTEGER NOT NULL DEFAULT 0,
  preparation_months INTEGER NOT NULL DEFAULT 12,
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  lessons_learned_ar TEXT NOT NULL,
  lessons_learned_en TEXT NOT NULL,
  cost_breakdown_json TEXT NOT NULL DEFAULT '[]',
  photos_json TEXT NOT NULL DEFAULT '[]',
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_notes TEXT,
  moderated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_demo_data INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_real_weddings_mod_gov
  ON real_weddings(moderation_status, governorate_slug);

CREATE TABLE IF NOT EXISTS expert_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name_ar TEXT NOT NULL,
  display_name_en TEXT NOT NULL,
  specialty_slug TEXT NOT NULL CHECK (
    specialty_slug IN (
      'finishing_engineering',
      'financial_planning',
      'bridal_trousseau',
      'wedding_direction',
      'married_life_counseling'
    )
  ),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  governorate_slug TEXT NOT NULL,
  years_experience INTEGER NOT NULL DEFAULT 3,
  credentials_ar TEXT NOT NULL,
  credentials_en TEXT NOT NULL,
  bio_ar TEXT NOT NULL,
  bio_en TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_docs_json TEXT NOT NULL DEFAULT '[]',
  verification_notes TEXT,
  verified_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  verified_at TEXT,
  answers_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_demo_data INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_status
  ON expert_profiles(verification_status, specialty_slug);

CREATE TABLE IF NOT EXISTS community_questions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL CHECK (
    category_slug IN ('finishing', 'groom', 'bride', 'wedding', 'budget', 'early_start', 'married_life')
  ),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  body_ar TEXT NOT NULL,
  body_en TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'hidden')),
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  answers_count INTEGER NOT NULL DEFAULT 0,
  is_resolved INTEGER NOT NULL DEFAULT 0,
  is_demo_data INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_questions_cat_mod
  ON community_questions(category_slug, moderation_status, created_at DESC);

CREATE TABLE IF NOT EXISTS community_answers (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body_ar TEXT NOT NULL,
  body_en TEXT NOT NULL,
  is_expert_answer INTEGER NOT NULL DEFAULT 0,
  is_helpful_marked INTEGER NOT NULL DEFAULT 0,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'hidden')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_answers_q
  ON community_answers(question_id, moderation_status, created_at ASC);

CREATE TABLE IF NOT EXISTS community_votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  target_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer', 'story', 'vendor_review')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'misleading_price', 'harassment', 'off_topic', 'self_promo')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved_hidden', 'dismissed')),
  reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  resolution_note TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_reports_status
  ON community_reports(status, created_at DESC);


-- GAWAZ INN 2.0 — Stage 5: Lifecycle Onboarding, Engagement Planner, Wedding Journey Planner & Shared Couple Workspace (SQLite)

CREATE TABLE IF NOT EXISTS user_lifecycle_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  note TEXT,
  changed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_history_user ON user_lifecycle_history(user_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS engagement_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  engagement_date TEXT,
  target_budget INTEGER NOT NULL DEFAULT 150000,
  shabka_budget INTEGER NOT NULL DEFAULT 75000,
  venue_budget INTEGER NOT NULL DEFAULT 35000,
  attire_budget INTEGER NOT NULL DEFAULT 20000,
  hospitality_budget INTEGER NOT NULL DEFAULT 20000,
  venue_name TEXT,
  venue_status TEXT NOT NULL DEFAULT 'researching' CHECK (venue_status IN ('researching', 'shortlisted', 'booked', 'home_ceremony')),
  ring_notes TEXT,
  family_notes TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS engagement_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('checklist', 'gift_ring', 'guest_group', 'budget_line')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  owner_side TEXT NOT NULL DEFAULT 'shared' CHECK (owner_side IN ('groom', 'bride', 'shared')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  estimated_cost INTEGER NOT NULL DEFAULT 0,
  actual_cost INTEGER NOT NULL DEFAULT 0,
  guest_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done')),
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_engagement_items_user ON engagement_items(user_id, item_type, sort_order);

CREATE TABLE IF NOT EXISTS couple_workspaces (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  engagement_date TEXT,
  wedding_date TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON couple_workspaces(owner_user_id);

CREATE TABLE IF NOT EXISTS workspace_members (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES couple_workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL CHECK (member_role IN ('owner', 'partner', 'planner_guest')),
  side_label TEXT NOT NULL DEFAULT 'partner' CHECK (side_label IN ('groom', 'bride', 'partner')),
  permissions_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  joined_at TEXT NOT NULL,
  revoked_at TEXT,
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id, status);

CREATE TABLE IF NOT EXISTS workspace_invitations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES couple_workspaces(id) ON DELETE CASCADE,
  inviter_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_phone TEXT,
  invite_token TEXT NOT NULL UNIQUE,
  proposed_role TEXT NOT NULL DEFAULT 'partner' CHECK (proposed_role IN ('partner', 'planner_guest')),
  proposed_side TEXT NOT NULL DEFAULT 'partner' CHECK (proposed_side IN ('groom', 'bride', 'partner')),
  permissions_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  responded_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_workspace_invites_ws ON workspace_invitations(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_email ON workspace_invitations(invitee_email);

CREATE TABLE IF NOT EXISTS workspace_approvals (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES couple_workspaces(id) ON DELETE CASCADE,
  requested_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested', 'rejected')),
  reviewer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewer_note TEXT,
  created_at TEXT NOT NULL,
  decided_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_workspace_approvals_ws ON workspace_approvals(workspace_id, status);

CREATE TABLE IF NOT EXISTS journey_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES couple_workspaces(id) ON DELETE SET NULL,
  phase TEXT NOT NULL CHECK (phase IN ('early_start', 'engagement', '12m', '9m', '6m', '3m', '1m', 'final_week', 'wedding_day', 'post_wedding')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description TEXT,
  owner_side TEXT NOT NULL DEFAULT 'shared' CHECK (owner_side IN ('groom', 'bride', 'shared')),
  assigned_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  due_date TEXT,
  reminder_date TEXT,
  depends_on_task_id TEXT REFERENCES journey_tasks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_cost INTEGER NOT NULL DEFAULT 0,
  attachment_label TEXT,
  attachment_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journey_tasks_user_phase ON journey_tasks(user_id, phase, status);
CREATE INDEX IF NOT EXISTS idx_journey_tasks_workspace ON journey_tasks(workspace_id, status);

CREATE TABLE IF NOT EXISTS task_comments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES journey_tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id, created_at);

CREATE TABLE IF NOT EXISTS user_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES couple_workspaces(id) ON DELETE SET NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('contract', 'floor_plan', 'warranty', 'receipt', 'quote', 'id_copy', 'other')),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  reference_code TEXT,
  notes TEXT,
  is_shared_with_partner INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_documents_user ON user_documents(user_id, doc_type);

CREATE TABLE IF NOT EXISTS user_warranties (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES couple_workspaces(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  model_serial TEXT,
  start_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_warranties_user ON user_warranties(user_id, expiry_date);

CREATE TABLE IF NOT EXISTS user_appointments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES couple_workspaces(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('finishing_visit', 'hall_tour', 'showroom', 'gold_shopping', 'photography_meeting', 'other')),
  provider_name TEXT NOT NULL,
  location_text TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_appointments_user ON user_appointments(user_id, scheduled_at);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notif_type TEXT NOT NULL CHECK (notif_type IN ('reminder', 'budget_alert', 'workspace_invite', 'approval', 'milestone', 'system')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  body_ar TEXT NOT NULL,
  body_en TEXT NOT NULL,
  link_path TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  read_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);


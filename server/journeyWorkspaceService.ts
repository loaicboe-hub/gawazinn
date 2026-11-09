import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import {
  DEFAULT_WORKSPACE_PERMISSIONS,
  getLifecycleStageInfo,
  STARTER_ENGAGEMENT_ITEMS,
  STARTER_JOURNEY_TASKS,
} from '../shared/journeyWorkspaceData';
import type {
  CoupleWorkspacePayload,
  EngagementItem,
  EngagementItemStatus,
  EngagementItemType,
  EngagementOverviewPayload,
  EngagementPlan,
  EngagementVenueStatus,
  JourneyOverviewPayload,
  JourneyPhaseKey,
  JourneyTask,
  JourneyTaskPriority,
  JourneyTaskStatus,
  LifecycleStage,
  LifecycleTransitionRecord,
  MyGawazInnHubPayload,
  NotificationType,
  TaskComment,
  UserAppointmentItem,
  UserAppointmentStatus,
  UserAppointmentType,
  UserDocumentItem,
  UserDocumentType,
  UserNotification,
  UserWarrantyItem,
  WorkspaceApproval,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspacePermissions,
} from '../shared/types';

function parsePermissions(raw: unknown): WorkspacePermissions {
  try {
    const parsed = JSON.parse(String(raw || '{}')) as Partial<WorkspacePermissions>;
    return { ...DEFAULT_WORKSPACE_PERMISSIONS, ...parsed };
  } catch {
    return { ...DEFAULT_WORKSPACE_PERMISSIONS };
  }
}

export function mapLifecycleTransitionRow(row: Record<string, unknown>): LifecycleTransitionRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    fromStage: row.from_stage ? (String(row.from_stage) as LifecycleStage) : null,
    toStage: String(row.to_stage) as LifecycleStage,
    note: row.note ? String(row.note) : null,
    changedAt: String(row.changed_at),
  };
}

export function mapEngagementPlanRow(row: Record<string, unknown>): EngagementPlan {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    engagementDate: row.engagement_date ? String(row.engagement_date) : null,
    targetBudget: Number(row.target_budget),
    shabkaBudget: Number(row.shabka_budget),
    venueBudget: Number(row.venue_budget),
    attireBudget: Number(row.attire_budget),
    hospitalityBudget: Number(row.hospitality_budget),
    venueName: row.venue_name ? String(row.venue_name) : null,
    venueStatus: row.venue_status as EngagementVenueStatus,
    ringNotes: row.ring_notes ? String(row.ring_notes) : null,
    familyNotes: row.family_notes ? String(row.family_notes) : null,
    updatedAt: String(row.updated_at),
  };
}

export function mapEngagementItemRow(row: Record<string, unknown>): EngagementItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    itemType: row.item_type as EngagementItemType,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    ownerSide: row.owner_side as EngagementItem['ownerSide'],
    priority: row.priority as EngagementItem['priority'],
    estimatedCost: Number(row.estimated_cost),
    actualCost: Number(row.actual_cost),
    guestCount: Number(row.guest_count),
    status: row.status as EngagementItemStatus,
    notes: row.notes ? String(row.notes) : null,
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapTaskCommentRow(row: Record<string, unknown>): TaskComment {
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    userId: String(row.user_id),
    authorName: String(row.author_name),
    body: String(row.body),
    createdAt: String(row.created_at),
  };
}

export function mapDocumentRow(row: Record<string, unknown>): UserDocumentItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    workspaceId: row.workspace_id ? String(row.workspace_id) : null,
    docType: row.doc_type as UserDocumentType,
    title: String(row.title),
    fileName: String(row.file_name),
    mimeType: String(row.mime_type),
    sizeBytes: Number(row.size_bytes),
    referenceCode: row.reference_code ? String(row.reference_code) : null,
    notes: row.notes ? String(row.notes) : null,
    isSharedWithPartner: Boolean(row.is_shared_with_partner),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapWarrantyRow(row: Record<string, unknown>): UserWarrantyItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    workspaceId: row.workspace_id ? String(row.workspace_id) : null,
    itemName: String(row.item_name),
    category: String(row.category),
    providerName: String(row.provider_name),
    modelSerial: row.model_serial ? String(row.model_serial) : null,
    startDate: String(row.start_date),
    expiryDate: String(row.expiry_date),
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at),
  };
}

export function mapAppointmentRow(row: Record<string, unknown>): UserAppointmentItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    workspaceId: row.workspace_id ? String(row.workspace_id) : null,
    title: String(row.title),
    appointmentType: row.appointment_type as UserAppointmentType,
    providerName: String(row.provider_name),
    locationText: String(row.location_text),
    scheduledAt: String(row.scheduled_at),
    status: row.status as UserAppointmentStatus,
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapNotificationRow(row: Record<string, unknown>): UserNotification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    notifType: row.notif_type as NotificationType,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    bodyAr: String(row.body_ar),
    bodyEn: String(row.body_en),
    linkPath: row.link_path ? String(row.link_path) : null,
    isRead: Boolean(row.is_read),
    createdAt: String(row.created_at),
    readAt: row.read_at ? String(row.read_at) : null,
  };
}

export function addUserNotification(
  db: DatabaseSync,
  input: {
    userId: string;
    notifType: NotificationType;
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    linkPath?: string | null;
  },
): UserNotification {
  const id = `notif-${crypto.randomUUID().slice(0, 10)}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO notifications (id, user_id, notif_type, title_ar, title_en, body_ar, body_en, link_path, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
  ).run(
    id,
    input.userId,
    input.notifType,
    input.titleAr,
    input.titleEn,
    input.bodyAr,
    input.bodyEn,
    input.linkPath ?? null,
    now,
  );
  const row = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id) as Record<string, unknown>;
  return mapNotificationRow(row);
}

/**
 * Resolves the workspace context a user should operate in.
 * Precedence:
 * 1) Active partner/planner_guest membership in a joined couple workspace (when invited & accepted)
 * 2) User's own owned couple_workspaces row (created idempotently if absent)
 */
export function resolveActiveWorkspaceForUser(
  db: DatabaseSync,
  userId: string,
): {
  workspaceRow: Record<string, unknown>;
  myMemberRow: Record<string, unknown>;
  myRole: 'owner' | 'partner' | 'planner_guest';
  myPermissions: WorkspacePermissions;
} {
  // Check active shared membership where user joined someone else's workspace
  const joined = db
    .prepare(
      `SELECT wm.*, cw.owner_user_id
       FROM workspace_members wm
       JOIN couple_workspaces cw ON cw.id = wm.workspace_id
       WHERE wm.user_id = ? AND wm.status = 'active' AND wm.member_role != 'owner' AND cw.status = 'active'
       ORDER BY wm.joined_at DESC
       LIMIT 1`,
    )
    .get(userId) as Record<string, unknown> | undefined;

  if (joined) {
    const ws = db
      .prepare('SELECT * FROM couple_workspaces WHERE id = ?')
      .get(String(joined.workspace_id)) as Record<string, unknown>;
    return {
      workspaceRow: ws,
      myMemberRow: joined,
      myRole: joined.member_role as 'partner' | 'planner_guest',
      myPermissions: parsePermissions(joined.permissions_json),
    };
  }

  // Otherwise ensure user has their own owned workspace
  let ownWs = db
    .prepare("SELECT * FROM couple_workspaces WHERE owner_user_id = ? AND status = 'active' ORDER BY created_at ASC LIMIT 1")
    .get(userId) as Record<string, unknown> | undefined;

  const now = new Date().toISOString();
  if (!ownWs) {
    const u = db.prepare('SELECT name, name_en FROM users WHERE id = ?').get(userId) as
      | { name: string; name_en?: string }
      | undefined;
    const firstName = (u?.name || 'بيتي').split(' ')[0];
    const firstNameEn = (u?.name_en || u?.name || 'Home').split(' ')[0];
    const wsId = `cw-${userId === 'usr-1' ? 'karim' : crypto.randomUUID().slice(0, 10)}`;
    const defaultWedDate = new Date(Date.now() + 270 * 86400000).toISOString().slice(0, 10);

    db.prepare(
      `INSERT INTO couple_workspaces (id, owner_user_id, name_ar, name_en, wedding_date, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
    ).run(
      wsId,
      userId,
      `بيت ${firstName} — المساحة المشتركة`,
      `${firstNameEn}'s Shared Couple Workspace`,
      defaultWedDate,
      now,
      now,
    );

    const ownerPermissions: WorkspacePermissions = {
      budgetRead: true,
      budgetWrite: true,
      tasksRead: true,
      tasksWrite: true,
      shoppingRead: true,
      shoppingWrite: true,
      documentsRead: true,
      documentsWrite: true,
      approvePurchases: true,
    };

    db.prepare(
      `INSERT OR IGNORE INTO workspace_members (id, workspace_id, user_id, member_role, side_label, permissions_json, status, joined_at)
       VALUES (?, ?, ?, 'owner', 'groom', ?, 'active', ?)`,
    ).run(`wm-${crypto.randomUUID().slice(0, 10)}`, wsId, userId, JSON.stringify(ownerPermissions), now);

    ownWs = db.prepare('SELECT * FROM couple_workspaces WHERE id = ?').get(wsId) as Record<string, unknown>;
  }

  let ownMember = db
    .prepare('SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?')
    .get(String(ownWs.id), userId) as Record<string, unknown> | undefined;

  if (!ownMember) {
    const ownerPermissions: WorkspacePermissions = {
      budgetRead: true,
      budgetWrite: true,
      tasksRead: true,
      tasksWrite: true,
      shoppingRead: true,
      shoppingWrite: true,
      documentsRead: true,
      documentsWrite: true,
      approvePurchases: true,
    };
    const memberId = `wm-${crypto.randomUUID().slice(0, 10)}`;
    db.prepare(
      `INSERT INTO workspace_members (id, workspace_id, user_id, member_role, side_label, permissions_json, status, joined_at)
       VALUES (?, ?, ?, 'owner', 'partner', ?, 'active', ?)`,
    ).run(memberId, String(ownWs.id), userId, JSON.stringify(ownerPermissions), now);
    ownMember = db.prepare('SELECT * FROM workspace_members WHERE id = ?').get(memberId) as Record<string, unknown>;
  }

  return {
    workspaceRow: ownWs,
    myMemberRow: ownMember,
    myRole: 'owner',
    myPermissions: {
      budgetRead: true,
      budgetWrite: true,
      tasksRead: true,
      tasksWrite: true,
      shoppingRead: true,
      shoppingWrite: true,
      documentsRead: true,
      documentsWrite: true,
      approvePurchases: true,
    },
  };
}

export function ensureUserEngagementAndJourney(db: DatabaseSync, userId: string): {
  workspaceId: string;
} {
  const { workspaceRow } = resolveActiveWorkspaceForUser(db, userId);
  const workspaceId = String(workspaceRow.id);
  const now = new Date().toISOString();

  // 1. Engagement Plan
  const engPlan = db.prepare('SELECT id FROM engagement_plans WHERE user_id = ?').get(userId);
  if (!engPlan) {
    const engDate = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);
    db.prepare(
      `INSERT INTO engagement_plans (id, user_id, engagement_date, target_budget, shabka_budget, venue_budget, attire_budget, hospitality_budget, venue_name, venue_status, ring_notes, family_notes, updated_at)
       VALUES (?, ?, ?, 150000, 75000, 35000, 20000, 20000, NULL, 'researching', NULL, NULL, ?)`,
    ).run(`ep-${crypto.randomUUID().slice(0, 10)}`, userId, engDate, now);

    const insertEngItem = db.prepare(
      `INSERT INTO engagement_items (id, user_id, item_type, title_ar, title_en, owner_side, priority, estimated_cost, actual_cost, guest_count, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'planned', ?, ?, ?)`,
    );
    STARTER_ENGAGEMENT_ITEMS.forEach((item, idx) => {
      insertEngItem.run(
        `ei-${crypto.randomUUID().slice(0, 10)}`,
        userId,
        item.itemType,
        item.titleAr,
        item.titleEn,
        item.ownerSide,
        item.priority,
        item.estimatedCost,
        item.guestCount,
        idx + 1,
        now,
        now,
      );
    });
  }

  // 2. Journey Tasks (initialize if user & workspace have 0 tasks)
  const taskCnt = (
    db
      .prepare('SELECT COUNT(*) as cnt FROM journey_tasks WHERE user_id = ? OR workspace_id = ?')
      .get(userId, workspaceId) as { cnt: number }
  ).cnt;

  if (taskCnt === 0) {
    const keyToId = new Map<string, string>();
    STARTER_JOURNEY_TASKS.forEach((seed) => {
      keyToId.set(seed.key, `jt-${crypto.randomUUID().slice(0, 10)}`);
    });

    const phaseOffsetDays: Record<JourneyPhaseKey, number> = {
      early_start: 14,
      engagement: 25,
      '12m': 45,
      '9m': 75,
      '6m': 120,
      '3m': 180,
      '1m': 240,
      final_week: 265,
      wedding_day: 270,
      post_wedding: 285,
    };

    const insertTask = db.prepare(
      `INSERT INTO journey_tasks
         (id, user_id, workspace_id, phase, title_ar, title_en, description, owner_side, due_date, reminder_date, depends_on_task_id, status, priority, estimated_cost, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?)`,
    );

    STARTER_JOURNEY_TASKS.forEach((seed, idx) => {
      const id = keyToId.get(seed.key)!;
      const depId = seed.dependsOnKey ? keyToId.get(seed.dependsOnKey) ?? null : null;
      const offset = phaseOffsetDays[seed.phase] ?? 30;
      const due = new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
      const reminder = new Date(Date.now() + Math.max(1, offset - 5) * 86400000)
        .toISOString()
        .slice(0, 10);

      insertTask.run(
        id,
        userId,
        workspaceId,
        seed.phase,
        seed.titleAr,
        seed.titleEn,
        seed.description,
        seed.ownerSide,
        due,
        reminder,
        depId,
        seed.priority,
        seed.estimatedCost,
        idx + 1,
        now,
        now,
      );
    });
  }

  return { workspaceId };
}

export function transitionLifecycleStage(
  db: DatabaseSync,
  userId: string,
  targetStage: LifecycleStage,
  extras?: {
    note?: string;
    city?: string;
    governorateSlug?: string;
    language?: 'ar' | 'en';
  },
): { currentStage: LifecycleStage; history: LifecycleTransitionRecord[] } {
  const userRow = db
    .prepare('SELECT current_stage FROM users WHERE id = ?')
    .get(userId) as { current_stage: LifecycleStage } | undefined;

  const fromStage = userRow?.current_stage ?? 'thinking';
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE users SET
      current_stage = ?,
      city = COALESCE(?, city),
      governorate_slug = COALESCE(?, governorate_slug),
      language = COALESCE(?, language),
      updated_at = ?
     WHERE id = ?`,
  ).run(
    targetStage,
    extras?.city ?? null,
    extras?.governorateSlug ?? null,
    extras?.language ?? null,
    now,
    userId,
  );

  db.prepare(
    `INSERT INTO user_lifecycle_history (id, user_id, from_stage, to_stage, note, changed_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    `lh-${crypto.randomUUID().slice(0, 10)}`,
    userId,
    fromStage,
    targetStage,
    extras?.note ?? null,
    now,
  );

  const stageInfo = getLifecycleStageInfo(targetStage);
  addUserNotification(db, {
    userId,
    notifType: 'milestone',
    titleAr: `انتقال المرحلة: ${stageInfo.titleAr}`,
    titleEn: `Lifecycle Stage Updated: ${stageInfo.titleEn}`,
    bodyAr: 'تم تحديث مرحلتك بنجاح مع الحفاظ الكامل على كل بياناتك ومدخراتك ومهامك.',
    bodyEn: 'Your stage updated cleanly with 100% of your historical savings, budgets, and tasks preserved.',
    linkPath: stageInfo.recommendedPrimaryRoute,
  });

  const historyRows = db
    .prepare('SELECT * FROM user_lifecycle_history WHERE user_id = ? ORDER BY changed_at DESC LIMIT 25')
    .all(userId) as Record<string, unknown>[];

  return {
    currentStage: targetStage,
    history: historyRows.map(mapLifecycleTransitionRow),
  };
}

export function buildEngagementOverview(db: DatabaseSync, userId: string): EngagementOverviewPayload {
  ensureUserEngagementAndJourney(db, userId);

  const planRow = db
    .prepare('SELECT * FROM engagement_plans WHERE user_id = ?')
    .get(userId) as Record<string, unknown>;
  const itemRows = db
    .prepare('SELECT * FROM engagement_items WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC')
    .all(userId) as Record<string, unknown>[];

  const plan = mapEngagementPlanRow(planRow);
  const items = itemRows.map(mapEngagementItemRow);

  const checklistItems = items.filter((i) => i.itemType !== 'guest_group');
  const completedTasksCount = checklistItems.filter((i) => i.status === 'done').length;
  const totalChecklistCount = checklistItems.length;
  const completionPercent =
    totalChecklistCount > 0 ? Math.round((completedTasksCount / totalChecklistCount) * 100) : 0;

  return {
    plan,
    items,
    summary: {
      targetBudget: plan.targetBudget,
      allocatedComponentsSum:
        plan.shabkaBudget + plan.venueBudget + plan.attireBudget + plan.hospitalityBudget,
      totalEstimatedItemsCost: items.reduce((s, i) => s + i.estimatedCost, 0),
      totalActualItemsCost: items.reduce((s, i) => s + i.actualCost, 0),
      totalInvitedGuests: items
        .filter((i) => i.itemType === 'guest_group')
        .reduce((s, i) => s + i.guestCount, 0),
      completedTasksCount,
      totalChecklistCount,
      completionPercent,
    },
  };
}

export function buildJourneyOverview(db: DatabaseSync, userId: string): JourneyOverviewPayload {
  ensureUserEngagementAndJourney(db, userId);
  const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, userId);
  const workspaceId = String(workspaceRow.id);

  const canReadWorkspaceTasks = myRole === 'owner' || myPermissions.tasksRead;
  const taskRows = canReadWorkspaceTasks
    ? (db
        .prepare(
          `SELECT * FROM journey_tasks
           WHERE workspace_id = ? OR (workspace_id IS NULL AND user_id = ?)
           ORDER BY sort_order ASC, due_date ASC, created_at ASC`,
        )
        .all(workspaceId, userId) as Record<string, unknown>[])
    : (db
        .prepare(
          `SELECT * FROM journey_tasks
           WHERE user_id = ?
           ORDER BY sort_order ASC, due_date ASC, created_at ASC`,
        )
        .all(userId) as Record<string, unknown>[]);

  const statusById = new Map<string, { status: string; titleAr: string; titleEn: string }>();
  taskRows.forEach((r) => {
    statusById.set(String(r.id), {
      status: String(r.status),
      titleAr: String(r.title_ar),
      titleEn: String(r.title_en),
    });
  });

  const commentStmt = db.prepare('SELECT * FROM task_comments WHERE task_id = ? ORDER BY created_at ASC');

  const todayIso = new Date().toISOString().slice(0, 10);
  const in7DaysIso = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const tasks: JourneyTask[] = taskRows.map((row) => {
    const depId = row.depends_on_task_id ? String(row.depends_on_task_id) : null;
    const dep = depId ? statusById.get(depId) : undefined;
    const isBlocked = Boolean(dep && dep.status !== 'done' && String(row.status) !== 'done');
    const comments = (commentStmt.all(String(row.id)) as Record<string, unknown>[]).map(
      mapTaskCommentRow,
    );

    return {
      id: String(row.id),
      userId: String(row.user_id),
      workspaceId: row.workspace_id ? String(row.workspace_id) : null,
      phase: String(row.phase) as JourneyPhaseKey,
      titleAr: String(row.title_ar),
      titleEn: String(row.title_en),
      description: row.description ? String(row.description) : null,
      ownerSide: String(row.owner_side) as JourneyTask['ownerSide'],
      assignedUserId: row.assigned_user_id ? String(row.assigned_user_id) : null,
      dueDate: row.due_date ? String(row.due_date) : null,
      reminderDate: row.reminder_date ? String(row.reminder_date) : null,
      dependsOnTaskId: depId,
      dependsOnTitleAr: dep?.titleAr ?? null,
      dependsOnTitleEn: dep?.titleEn ?? null,
      isDependencyBlocked: isBlocked,
      status: String(row.status) as JourneyTaskStatus,
      priority: String(row.priority) as JourneyTaskPriority,
      estimatedCost: Number(row.estimated_cost),
      attachmentLabel: row.attachment_label ? String(row.attachment_label) : null,
      attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
      sortOrder: Number(row.sort_order),
      completedAt: row.completed_at ? String(row.completed_at) : null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      comments,
    };
  });

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const blockedTasks = tasks.filter((t) => t.isDependencyBlocked).length;
  const totalTasks = tasks.length;

  return {
    tasks,
    workspaceId,
    summary: {
      totalTasks,
      doneTasks,
      inProgressTasks,
      todoTasks,
      blockedTasks,
      completionPercent: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      overdueTasksCount: tasks.filter(
        (t) => t.status !== 'done' && t.dueDate && t.dueDate < todayIso,
      ).length,
      upcomingRemindersCount: tasks.filter(
        (t) => t.status !== 'done' && t.reminderDate && t.reminderDate >= todayIso && t.reminderDate <= in7DaysIso,
      ).length,
      byOwnerSide: {
        groom: tasks.filter((t) => t.ownerSide === 'groom').length,
        bride: tasks.filter((t) => t.ownerSide === 'bride').length,
        shared: tasks.filter((t) => t.ownerSide === 'shared').length,
      },
    },
  };
}

export function buildCoupleWorkspacePayload(db: DatabaseSync, userId: string): CoupleWorkspacePayload {
  const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, userId);
  const workspaceId = String(workspaceRow.id);

  const userRow = db
    .prepare('SELECT email, phone FROM users WHERE id = ?')
    .get(userId) as { email: string; phone: string } | undefined;

  const memberRows = db
    .prepare(
      `SELECT wm.*, u.name as user_name, u.email as user_email
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = ?
       ORDER BY CASE WHEN wm.member_role = 'owner' THEN 0 ELSE 1 END, wm.joined_at ASC`,
    )
    .all(workspaceId) as Record<string, unknown>[];

  const members: WorkspaceMember[] = memberRows.map((r) => ({
    id: String(r.id),
    workspaceId: String(r.workspace_id),
    userId: String(r.user_id),
    userName: String(r.user_name),
    userEmail: String(r.user_email),
    memberRole: String(r.member_role) as WorkspaceMember['memberRole'],
    sideLabel: String(r.side_label) as WorkspaceMember['sideLabel'],
    permissions: parsePermissions(r.permissions_json),
    status: String(r.status) as WorkspaceMember['status'],
    joinedAt: String(r.joined_at),
    revokedAt: r.revoked_at ? String(r.revoked_at) : null,
  }));

  const sentInvRows = db
    .prepare(
      `SELECT wi.*, cw.name_ar as ws_name_ar, cw.name_en as ws_name_en, u.name as inviter_name
       FROM workspace_invitations wi
       JOIN couple_workspaces cw ON cw.id = wi.workspace_id
       JOIN users u ON u.id = wi.inviter_user_id
       WHERE wi.workspace_id = ?
       ORDER BY wi.created_at DESC`,
    )
    .all(workspaceId) as Record<string, unknown>[];

  const incomingInvRows = userRow
    ? (db
        .prepare(
          `SELECT wi.*, cw.name_ar as ws_name_ar, cw.name_en as ws_name_en, u.name as inviter_name
           FROM workspace_invitations wi
           JOIN couple_workspaces cw ON cw.id = wi.workspace_id
           JOIN users u ON u.id = wi.inviter_user_id
           WHERE wi.status = 'pending'
             AND wi.inviter_user_id != ?
             AND (LOWER(COALESCE(wi.invitee_email, '')) = LOWER(?) OR COALESCE(wi.invitee_phone, '') = ?)
           ORDER BY wi.created_at DESC`,
        )
        .all(userId, userRow.email, userRow.phone) as Record<string, unknown>[])
    : [];

  const mapInvite = (r: Record<string, unknown>): WorkspaceInvitation => ({
    id: String(r.id),
    workspaceId: String(r.workspace_id),
    workspaceNameAr: String(r.ws_name_ar),
    workspaceNameEn: String(r.ws_name_en),
    inviterUserId: String(r.inviter_user_id),
    inviterName: String(r.inviter_name),
    inviteeEmail: r.invitee_email ? String(r.invitee_email) : null,
    inviteePhone: r.invitee_phone ? String(r.invitee_phone) : null,
    inviteToken: String(r.invite_token),
    proposedRole: String(r.proposed_role) as WorkspaceInvitation['proposedRole'],
    proposedSide: String(r.proposed_side) as WorkspaceInvitation['proposedSide'],
    permissions: parsePermissions(r.permissions_json),
    status: String(r.status) as WorkspaceInvitation['status'],
    expiresAt: String(r.expires_at),
    createdAt: String(r.created_at),
    respondedAt: r.responded_at ? String(r.responded_at) : null,
  });

  const approvalRows = db
    .prepare(
      `SELECT wa.*, req.name as requested_by_name, rev.name as reviewer_name
       FROM workspace_approvals wa
       JOIN users req ON req.id = wa.requested_by_user_id
       LEFT JOIN users rev ON rev.id = wa.reviewer_user_id
       WHERE wa.workspace_id = ?
       ORDER BY wa.created_at DESC`,
    )
    .all(workspaceId) as Record<string, unknown>[];

  const approvals: WorkspaceApproval[] = approvalRows.map((r) => ({
    id: String(r.id),
    workspaceId: String(r.workspace_id),
    requestedByUserId: String(r.requested_by_user_id),
    requestedByName: String(r.requested_by_name),
    title: String(r.title),
    category: String(r.category),
    estimatedAmount: Number(r.estimated_amount),
    status: String(r.status) as WorkspaceApproval['status'],
    reviewerUserId: r.reviewer_user_id ? String(r.reviewer_user_id) : null,
    reviewerName: r.reviewer_name ? String(r.reviewer_name) : null,
    reviewerNote: r.reviewer_note ? String(r.reviewer_note) : null,
    createdAt: String(r.created_at),
    decidedAt: r.decided_at ? String(r.decided_at) : null,
  }));

  return {
    workspace: {
      id: workspaceId,
      ownerUserId: String(workspaceRow.owner_user_id),
      nameAr: String(workspaceRow.name_ar),
      nameEn: String(workspaceRow.name_en),
      engagementDate: workspaceRow.engagement_date ? String(workspaceRow.engagement_date) : null,
      weddingDate: workspaceRow.wedding_date ? String(workspaceRow.wedding_date) : null,
      status: String(workspaceRow.status) as 'active' | 'archived',
      createdAt: String(workspaceRow.created_at),
      updatedAt: String(workspaceRow.updated_at),
    },
    myRole,
    myPermissions,
    members,
    sentInvitations: sentInvRows.map(mapInvite),
    incomingInvitations: incomingInvRows.map(mapInvite),
    approvals,
  };
}

export function listVisibleDocumentsForUser(db: DatabaseSync, userId: string): UserDocumentItem[] {
  const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, userId);
  const workspaceId = String(workspaceRow.id);
  const canReadShared = myRole === 'owner' || myPermissions.documentsRead;

  const rows = canReadShared
    ? (db
        .prepare(
          `SELECT * FROM user_documents
           WHERE user_id = ? OR (workspace_id = ? AND is_shared_with_partner = 1)
           ORDER BY created_at DESC`,
        )
        .all(userId, workspaceId) as Record<string, unknown>[])
    : (db
        .prepare('SELECT * FROM user_documents WHERE user_id = ? ORDER BY created_at DESC')
        .all(userId) as Record<string, unknown>[]);

  return rows.map(mapDocumentRow);
}

export function buildMyGawazInnHubPayload(db: DatabaseSync, userId: string): MyGawazInnHubPayload {
  const userRow = db
    .prepare('SELECT current_stage FROM users WHERE id = ?')
    .get(userId) as { current_stage: LifecycleStage } | undefined;
  const currentStage = (userRow?.current_stage || 'thinking') as LifecycleStage;

  const historyRows = db
    .prepare('SELECT * FROM user_lifecycle_history WHERE user_id = ? ORDER BY changed_at DESC LIMIT 25')
    .all(userId) as Record<string, unknown>[];

  const engagement = buildEngagementOverview(db, userId);
  const journey = buildJourneyOverview(db, userId);
  const workspace = buildCoupleWorkspacePayload(db, userId);
  const documents = listVisibleDocumentsForUser(db, userId);

  const warrantyRows = db
    .prepare('SELECT * FROM user_warranties WHERE user_id = ? ORDER BY expiry_date ASC')
    .all(userId) as Record<string, unknown>[];

  const appointmentRows = db
    .prepare('SELECT * FROM user_appointments WHERE user_id = ? ORDER BY scheduled_at ASC')
    .all(userId) as Record<string, unknown>[];

  const notificationRows = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 40')
    .all(userId) as Record<string, unknown>[];

  const notifications = notificationRows.map(mapNotificationRow);

  const countScalar = (sql: string, ...args: (string | number)[]) =>
    (db.prepare(sql).get(...args) as { cnt: number }).cnt;

  const ordersCount = countScalar('SELECT COUNT(*) as cnt FROM orders WHERE user_id = ?', userId);
  const finishingInquiriesCount = countScalar(
    'SELECT COUNT(*) as cnt FROM finishing_inquiries WHERE user_id = ?',
    userId,
  );
  const weddingBookingsCount = countScalar(
    'SELECT COUNT(*) as cnt FROM wedding_bookings WHERE user_id = ?',
    userId,
  );
  const financingAppsCount = countScalar(
    'SELECT COUNT(*) as cnt FROM financing_applications WHERE user_id = ?',
    userId,
  );
  const calculatorRunsCount = countScalar(
    'SELECT COUNT(*) as cnt FROM calculator_runs WHERE user_id = ?',
    userId,
  );

  return {
    currentStage,
    lifecycleHistory: historyRows.map(mapLifecycleTransitionRow),
    engagement,
    journey,
    workspace,
    documents,
    warranties: warrantyRows.map(mapWarrantyRow),
    appointments: appointmentRows.map(mapAppointmentRow),
    notifications,
    unreadNotificationsCount: notifications.filter((n) => !n.isRead).length,
    counts: {
      ordersCount,
      finishingInquiriesCount,
      weddingBookingsCount,
      financingAppsCount,
      calculatorRunsCount,
      documentsCount: documents.length,
      warrantiesCount: warrantyRows.length,
      appointmentsCount: appointmentRows.length,
      pendingApprovalsCount: workspace.approvals.filter((a) => a.status === 'pending').length,
    },
  };
}


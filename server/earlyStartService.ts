import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import {
  computeSavingsStreak,
  PRIVATE_BADGE_DEFINITIONS,
} from '../shared/earlyStartData';
import type {
  EarlyStartMilestone,
  EarlyStartMilestoneTrack,
  EarlyStartOverviewPayload,
  EarlyStartProfile,
  EarlyStartReminderFrequency,
  EarlyStartTimeframePreset,
  MonthlySavingsReportPoint,
  SavingsBadge,
  SavingsContribution,
  SavingsGoal,
  SavingsGoalType,
} from '../shared/types';

function mapProfileRow(row: Record<string, unknown>): EarlyStartProfile {
  return {
    userId: String(row.user_id),
    timeframePreset: row.timeframe_preset as EarlyStartTimeframePreset,
    timeframeMonths: Number(row.timeframe_months),
    expectedMarriageDate: row.expected_marriage_date ? String(row.expected_marriage_date) : null,
    targetMarriageBudget: Number(row.target_marriage_budget),
    initialCapital: Number(row.initial_capital),
    monthlySavingsTarget: Number(row.monthly_savings_target),
    emergencyReserveTarget: Number(row.emergency_reserve_target),
    reminderFrequency: row.reminder_frequency as EarlyStartReminderFrequency,
    personalNotes: row.personal_notes ? String(row.personal_notes) : null,
    isPrivate: Boolean(row.is_private),
    updatedAt: String(row.updated_at),
  };
}

function mapGoalRow(row: Record<string, unknown>): SavingsGoal {
  const targetAmount = Number(row.target_amount);
  const currentAmount = Number(row.current_amount);
  return {
    id: String(row.id),
    userId: String(row.user_id),
    goalType: row.goal_type as SavingsGoalType,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    targetAmount,
    currentAmount,
    monthlyContribution: Number(row.monthly_contribution),
    completionPercent: targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0,
    remainingAmount: Math.max(0, targetAmount - currentAmount),
    targetDate: row.target_date ? String(row.target_date) : null,
    priority: Number(row.priority),
    isPrivate: Boolean(row.is_private),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapContributionRow(row: Record<string, unknown>): SavingsContribution {
  return {
    id: String(row.id),
    savingsGoalId: String(row.savings_goal_id),
    userId: String(row.user_id),
    amount: Number(row.amount),
    contributionType: row.contribution_type as SavingsContribution['contributionType'],
    contributionDate: String(row.contribution_date),
    streakMonth: String(row.streak_month),
    note: row.note ? String(row.note) : null,
    createdAt: String(row.created_at),
  };
}

function mapBadgeRow(row: Record<string, unknown>): SavingsBadge {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    badgeKey: String(row.badge_key),
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    descAr: String(row.desc_ar),
    descEn: String(row.desc_en),
    earnedAt: String(row.earned_at),
  };
}

function mapMilestoneRow(row: Record<string, unknown>): EarlyStartMilestone {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    track: row.track as EarlyStartMilestoneTrack,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    targetMonthsOut: Number(row.target_months_out),
    completed: Boolean(row.completed),
    completedAt: row.completed_at ? String(row.completed_at) : null,
    sortOrder: Number(row.sort_order),
  };
}

export function computeExpectedDateFromMonths(months: number): string {
  const dt = new Date();
  dt.setMonth(dt.getMonth() + months);
  return dt.toISOString().slice(0, 10);
}

export function ensureUserEarlyStartProfile(db: DatabaseSync, userId: string): EarlyStartProfile {
  const existing = db
    .prepare('SELECT * FROM early_start_profiles WHERE user_id = ?')
    .get(userId) as Record<string, unknown> | undefined;

  if (existing) {
    return mapProfileRow(existing);
  }

  const now = new Date().toISOString();
  const targetDate = computeExpectedDateFromMonths(36);

  db.prepare(
    `INSERT INTO early_start_profiles
       (user_id, timeframe_preset, timeframe_months, expected_marriage_date, target_marriage_budget, initial_capital, monthly_savings_target, emergency_reserve_target, reminder_frequency, personal_notes, is_private, updated_at)
     VALUES (?, '3y', 36, ?, 600000, 0, 5000, 60000, 'monthly', NULL, 1, ?)`,
  ).run(userId, targetDate, now);

  const goalCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM savings_goals WHERE user_id = ?').get(userId) as { cnt: number }
  ).cnt;

  if (goalCount === 0) {
    const starterGoals: {
      type: SavingsGoalType;
      titleAr: string;
      titleEn: string;
      target: number;
      monthly: number;
      priority: number;
    }[] = [
      {
        type: 'apartment_purchase',
        titleAr: 'صندوق مقدم الشقة / السكن',
        titleEn: 'Apartment Purchase & Down Payment Fund',
        target: 300000,
        monthly: 2500,
        priority: 1,
      },
      {
        type: 'finishing',
        titleAr: 'صندوق تشطيب الشقة وتجهيزها',
        titleEn: 'Apartment Finishing Reserve',
        target: 240000,
        monthly: 2000,
        priority: 2,
      },
      {
        type: 'emergency',
        titleAr: 'صندوق احتياطي الطوارئ (معزول)',
        titleEn: 'Ring-Fenced Emergency Reserve',
        target: 60000,
        monthly: 500,
        priority: 3,
      },
    ];

    const insertGoal = db.prepare(
      `INSERT INTO savings_goals
         (id, user_id, goal_type, title_ar, title_en, target_amount, current_amount, monthly_contribution, target_date, priority, is_private, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 1, ?, ?)`,
    );
    starterGoals.forEach((g) => {
      insertGoal.run(
        `sg-${crypto.randomUUID().slice(0, 10)}`,
        userId,
        g.type,
        g.titleAr,
        g.titleEn,
        g.target,
        g.monthly,
        targetDate,
        g.priority,
        now,
        now,
      );
    });
  }

  const milestoneCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM early_start_milestones WHERE user_id = ?').get(userId) as { cnt: number }
  ).cnt;

  if (milestoneCount === 0) {
    const defaultMilestones: {
      track: EarlyStartMilestoneTrack;
      titleAr: string;
      titleEn: string;
      monthsOut: number;
    }[] = [
      {
        track: 'financial',
        titleAr: 'تخصيص حساب أو صندوق مستقل لمدخرات الزواج بعيداً عن المصروف اليومي',
        titleEn: 'Separate Future Fund balance from daily spending accounts',
        monthsOut: 36,
      },
      {
        track: 'financial',
        titleAr: 'بناء احتياطي طوارئ يغطي 10% على الأقل من الهدف الإجمالي',
        titleEn: 'Reach at least 10% ring-fenced Emergency Reserve buffer',
        monthsOut: 24,
      },
      {
        track: 'education',
        titleAr: 'إتمام 3 دروس أساسية في أكاديمية البداية المبكرة للوعي المالي',
        titleEn: 'Complete 3 core modules in Early Start Academy',
        monthsOut: 24,
      },
      {
        track: 'housing',
        titleAr: 'تحديد المحافظة ومستوى التشطيب المستهدف ومقارنة الشراء مقابل التأسيس',
        titleEn: 'Benchmark target Egyptian governorate & finishing tier pricing',
        monthsOut: 18,
      },
      {
        track: 'personal',
        titleAr: 'مراجعة تطور الدخل والمهارات السنوية لرفع الادخار الشهري بنسبة 10%',
        titleEn: 'Annual career & skill review supporting a +10% savings step-up',
        monthsOut: 12,
      },
    ];

    const insertMs = db.prepare(
      `INSERT INTO early_start_milestones
         (id, user_id, track, title_ar, title_en, target_months_out, completed, completed_at, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?)`,
    );
    defaultMilestones.forEach((m, idx) => {
      insertMs.run(
        `esm-${crypto.randomUUID().slice(0, 10)}`,
        userId,
        m.track,
        m.titleAr,
        m.titleEn,
        m.monthsOut,
        idx + 1,
      );
    });
  }

  const row = db
    .prepare('SELECT * FROM early_start_profiles WHERE user_id = ?')
    .get(userId) as Record<string, unknown>;
  return mapProfileRow(row);
}

export function evaluateAndAwardPrivateBadges(db: DatabaseSync, userId: string): SavingsBadge[] {
  const existingRows = db
    .prepare('SELECT badge_key FROM savings_badges WHERE user_id = ?')
    .all(userId) as { badge_key: string }[];
  const existingKeys = new Set(existingRows.map((r) => r.badge_key));

  const deposits = db
    .prepare("SELECT streak_month FROM savings_contributions WHERE user_id = ? AND contribution_type = 'deposit'")
    .all(userId) as { streak_month: string }[];
  const streak = computeSavingsStreak(deposits.map((d) => d.streak_month));

  const goals = db
    .prepare('SELECT goal_type, target_amount, current_amount FROM savings_goals WHERE user_id = ?')
    .all(userId) as { goal_type: string; target_amount: number; current_amount: number }[];
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const emergencyCompleted = goals.some(
    (g) => g.goal_type === 'emergency' && Number(g.target_amount) > 0 && Number(g.current_amount) >= Number(g.target_amount),
  );

  const lessonsDone = (
    db.prepare('SELECT COUNT(*) as cnt FROM early_start_lesson_progress WHERE user_id = ?').get(userId) as { cnt: number }
  ).cnt;

  const qualifiedKeys: string[] = [];
  if (deposits.length >= 1) qualifiedKeys.push('first_deposit');
  if (streak >= 3) qualifiedKeys.push('streak_3m');
  if (streak >= 6) qualifiedKeys.push('streak_6m');
  if (overallPct >= 25) qualifiedKeys.push('milestone_25pct');
  if (overallPct >= 50) qualifiedKeys.push('milestone_50pct');
  if (emergencyCompleted) qualifiedKeys.push('emergency_funded');
  if (lessonsDone >= 3) qualifiedKeys.push('academy_starter');

  const insertBadge = db.prepare(
    `INSERT OR IGNORE INTO savings_badges (id, user_id, badge_key, title_ar, title_en, desc_ar, desc_en, earned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const now = new Date().toISOString();
  const newlyEarned: SavingsBadge[] = [];

  for (const key of qualifiedKeys) {
    if (existingKeys.has(key)) continue;
    const def = PRIVATE_BADGE_DEFINITIONS.find((b) => b.badgeKey === key);
    if (!def) continue;
    const id = `sb-${crypto.randomUUID().slice(0, 10)}`;
    insertBadge.run(id, userId, def.badgeKey, def.titleAr, def.titleEn, def.descAr, def.descEn, now);
    newlyEarned.push({
      id,
      userId,
      badgeKey: def.badgeKey,
      titleAr: def.titleAr,
      titleEn: def.titleEn,
      descAr: def.descAr,
      descEn: def.descEn,
      earnedAt: now,
    });
  }

  return newlyEarned;
}

export function buildEarlyStartOverview(db: DatabaseSync, userId: string): EarlyStartOverviewPayload {
  const profile = ensureUserEarlyStartProfile(db, userId);

  const goals = (
    db.prepare('SELECT * FROM savings_goals WHERE user_id = ? ORDER BY priority ASC, created_at DESC').all(userId) as Record<
      string,
      unknown
    >[]
  ).map(mapGoalRow);

  const contributions = (
    db
      .prepare('SELECT * FROM savings_contributions WHERE user_id = ? ORDER BY contribution_date DESC, created_at DESC LIMIT 80')
      .all(userId) as Record<string, unknown>[]
  ).map(mapContributionRow);

  const badges = (
    db.prepare('SELECT * FROM savings_badges WHERE user_id = ? ORDER BY earned_at DESC').all(userId) as Record<
      string,
      unknown
    >[]
  ).map(mapBadgeRow);

  const milestones = (
    db.prepare('SELECT * FROM early_start_milestones WHERE user_id = ? ORDER BY sort_order ASC, target_months_out DESC').all(userId) as Record<
      string,
      unknown
    >[]
  ).map(mapMilestoneRow);

  const completedLessonSlugs = (
    db.prepare('SELECT lesson_slug FROM early_start_lesson_progress WHERE user_id = ? ORDER BY completed_at ASC').all(userId) as {
      lesson_slug: string;
    }[]
  ).map((r) => r.lesson_slug);

  // Build chronological monthly deposit history for clean charts & reports
  const allChronoContribs = db
    .prepare('SELECT streak_month, amount FROM savings_contributions WHERE user_id = ? ORDER BY streak_month ASC, contribution_date ASC')
    .all(userId) as { streak_month: string; amount: number }[];
  const byMonth = new Map<string, number>();
  for (const c of allChronoContribs) {
    byMonth.set(c.streak_month, (byMonth.get(c.streak_month) || 0) + Number(c.amount));
  }
  const sortedMonths = Array.from(byMonth.keys()).sort();
  let runningCumulative = 0;
  const monthlyHistory: MonthlySavingsReportPoint[] = sortedMonths.map((month) => {
    const dep = Math.round(byMonth.get(month) || 0);
    runningCumulative = Math.max(0, runningCumulative + dep);
    return {
      month,
      depositedEgp: dep,
      cumulativeEgp: runningCumulative,
    };
  });

  const totalGoalsTarget =
    goals.length > 0 ? goals.reduce((s, g) => s + g.targetAmount, 0) : profile.targetMarriageBudget;
  const totalCurrentSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallCompletionPercent =
    totalGoalsTarget > 0 ? Math.min(100, Math.round((totalCurrentSaved / totalGoalsTarget) * 100)) : 0;

  const emergencyGoals = goals.filter((g) => g.goalType === 'emergency');
  const emergencySaved = emergencyGoals.reduce((s, g) => s + g.currentAmount, 0);
  const emergencyTarget =
    emergencyGoals.length > 0
      ? emergencyGoals.reduce((s, g) => s + g.targetAmount, 0)
      : profile.emergencyReserveTarget;

  const monthlyCommittedSum = goals.reduce((s, g) => s + g.monthlyContribution, 0);
  const remainingNeeded = Math.max(0, totalGoalsTarget - totalCurrentSaved);
  const safeMonths = Math.max(1, profile.timeframeMonths);
  const recommendedMonthlyNeeded = Math.ceil(remainingNeeded / safeMonths);
  const annualSavingsTarget = recommendedMonthlyNeeded * 12;

  const streakMonths = computeSavingsStreak(
    contributions.filter((c) => c.contributionType === 'deposit').map((c) => c.streakMonth),
  );
  const milestonesCompletedCount = milestones.filter((m) => m.completed).length;

  return {
    profile,
    goals,
    contributions,
    badges,
    milestones,
    completedLessonSlugs,
    monthlyHistory,
    summary: {
      totalGoalsTarget,
      totalCurrentSaved,
      overallCompletionPercent,
      emergencySaved,
      emergencyTarget,
      monthlyCommittedSum,
      recommendedMonthlyNeeded,
      annualSavingsTarget,
      streakMonths,
      milestonesCompletedCount,
      milestonesTotalCount: milestones.length,
    },
  };
}

export function recordGoalContribution(
  db: DatabaseSync,
  params: {
    userId: string;
    goalId: string;
    amount: number;
    contributionType: 'deposit' | 'adjustment';
    contributionDate?: string;
    note?: string;
  },
): {
  overview: EarlyStartOverviewPayload;
  newlyEarnedBadges: SavingsBadge[];
  contributionId: string;
} {
  const goal = db
    .prepare('SELECT id, user_id, current_amount FROM savings_goals WHERE id = ? AND user_id = ?')
    .get(params.goalId, params.userId) as { id: string; user_id: string; current_amount: number } | undefined;

  if (!goal) {
    throw new Error('GOAL_NOT_FOUND');
  }

  const now = new Date().toISOString();
  const dateStr = (params.contributionDate || now.slice(0, 10)).slice(0, 10);
  const streakMonth = dateStr.slice(0, 7);
  const contribId = `sc-${crypto.randomUUID().slice(0, 10)}`;
  const nextCurrent = Math.max(0, Math.round(Number(goal.current_amount) + params.amount));

  db.exec('BEGIN;');
  try {
    db.prepare(
      `INSERT INTO savings_contributions
         (id, savings_goal_id, user_id, amount, contribution_type, contribution_date, streak_month, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      contribId,
      goal.id,
      params.userId,
      params.amount,
      params.contributionType,
      dateStr,
      streakMonth,
      params.note ?? null,
      now,
    );

    db.prepare('UPDATE savings_goals SET current_amount = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(
      nextCurrent,
      now,
      goal.id,
      params.userId,
    );

    const newlyEarnedBadges = evaluateAndAwardPrivateBadges(db, params.userId);
    db.exec('COMMIT;');

    return {
      overview: buildEarlyStartOverview(db, params.userId),
      newlyEarnedBadges,
      contributionId: contribId,
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}


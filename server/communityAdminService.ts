import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type {
  AdminAnalyticsPayload,
  AdminModerationOverview,
  Article,
  CommunityAnswer,
  CommunityCategorySlug,
  CommunityQuestion,
  CommunityReport,
  ExpertProfile,
  ExpertSpecialtySlug,
  ExpertVerificationStatus,
  LifecycleStage,
  RealWeddingCostLine,
  RealWeddingStory,
  StoryModerationStatus,
  User,
} from '../shared/types';
import { addUserNotification } from './journeyWorkspaceService';

export function mapRealWeddingRow(row: Record<string, unknown>): RealWeddingStory {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    authorName: row.author_name ? String(row.author_name) : null,
    coupleTitleAr: String(row.couple_title_ar),
    coupleTitleEn: String(row.couple_title_en),
    governorateSlug: String(row.governorate_slug),
    cityAr: String(row.city_ar),
    cityEn: String(row.city_en),
    weddingYear: Number(row.wedding_year),
    guestCount: Number(row.guest_count),
    totalActualBudgetEgp: Number(row.total_actual_budget_egp),
    finishingCostEgp: Number(row.finishing_cost_egp),
    groomTrousseauEgp: Number(row.groom_trousseau_egp),
    brideTrousseauEgp: Number(row.bride_trousseau_egp),
    weddingCostEgp: Number(row.wedding_cost_egp),
    preparationMonths: Number(row.preparation_months),
    summaryAr: String(row.summary_ar),
    summaryEn: String(row.summary_en),
    lessonsLearnedAr: String(row.lessons_learned_ar),
    lessonsLearnedEn: String(row.lessons_learned_en),
    costBreakdown: JSON.parse(String(row.cost_breakdown_json || '[]')) as RealWeddingCostLine[],
    photos: JSON.parse(String(row.photos_json || '[]')) as string[],
    moderationStatus: row.moderation_status as StoryModerationStatus,
    moderationNotes: row.moderation_notes ? String(row.moderation_notes) : null,
    moderatedByUserId: row.moderated_by_user_id ? String(row.moderated_by_user_id) : null,
    moderatedAt: row.moderated_at ? String(row.moderated_at) : null,
    isFeatured: Boolean(row.is_featured),
    isDemoData: Boolean(row.is_demo_data),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function listRealWeddingStories(
  db: DatabaseSync,
  opts: {
    governorateSlug?: string;
    includeUnapproved?: boolean;
    onlyMineForUserId?: string;
  } = {},
): RealWeddingStory[] {
  const params: (string | number)[] = [];
  const clauses: string[] = [];

  if (opts.onlyMineForUserId) {
    clauses.push('rw.user_id = ?');
    params.push(opts.onlyMineForUserId);
  } else if (!opts.includeUnapproved) {
    clauses.push("rw.moderation_status = 'approved'");
  }

  if (opts.governorateSlug && opts.governorateSlug !== 'all') {
    clauses.push('rw.governorate_slug = ?');
    params.push(opts.governorateSlug);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `SELECT rw.*, u.name as author_name
       FROM real_weddings rw
       LEFT JOIN users u ON u.id = rw.user_id
       ${where}
       ORDER BY rw.is_featured DESC, rw.created_at DESC`,
    )
    .all(...params) as Record<string, unknown>[];
  return rows.map(mapRealWeddingRow);
}

export function createRealWeddingStory(
  db: DatabaseSync,
  user: User,
  input: {
    coupleTitleAr: string;
    coupleTitleEn?: string;
    governorateSlug: string;
    cityAr: string;
    cityEn?: string;
    weddingYear: number;
    guestCount: number;
    finishingCostEgp: number;
    groomTrousseauEgp: number;
    brideTrousseauEgp: number;
    weddingCostEgp: number;
    preparationMonths: number;
    summaryAr: string;
    summaryEn?: string;
    lessonsLearnedAr: string;
    lessonsLearnedEn?: string;
    photos: string[];
  },
): RealWeddingStory {
  const now = new Date().toISOString();
  const id = `story-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 5)}`;
  const totalActualBudgetEgp =
    input.finishingCostEgp +
    input.groomTrousseauEgp +
    input.brideTrousseauEgp +
    input.weddingCostEgp;

  const costBreakdown: RealWeddingCostLine[] = [
    { categoryAr: 'تشطيب وتجهيز الشقة', categoryEn: 'Apartment Finishing', amountEgp: input.finishingCostEgp },
    { categoryAr: 'تجهيز العريس والأجهزة والأثاث', categoryEn: "Groom's Prep & Furniture", amountEgp: input.groomTrousseauEgp },
    { categoryAr: 'جهاز العروسة', categoryEn: "Bride's Trousseau", amountEgp: input.brideTrousseauEgp },
    { categoryAr: 'حفل الزفاف والضيافة', categoryEn: 'Wedding Celebration', amountEgp: input.weddingCostEgp },
  ].filter((c) => c.amountEgp > 0);

  const photos =
    input.photos.length > 0
      ? input.photos
      : ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80'];

  db.prepare(
    `INSERT INTO real_weddings (
      id, user_id, couple_title_ar, couple_title_en, governorate_slug, city_ar, city_en,
      wedding_year, guest_count, total_actual_budget_egp, finishing_cost_egp,
      groom_trousseau_egp, bride_trousseau_egp, wedding_cost_egp, preparation_months,
      summary_ar, summary_en, lessons_learned_ar, lessons_learned_en,
      cost_breakdown_json, photos_json, moderation_status, is_featured, is_demo_data,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0, ?, ?)`,
  ).run(
    id,
    user.id,
    input.coupleTitleAr,
    input.coupleTitleEn?.trim() || input.coupleTitleAr,
    input.governorateSlug,
    input.cityAr,
    input.cityEn?.trim() || input.cityAr,
    input.weddingYear,
    input.guestCount,
    totalActualBudgetEgp,
    input.finishingCostEgp,
    input.groomTrousseauEgp,
    input.brideTrousseauEgp,
    input.weddingCostEgp,
    input.preparationMonths,
    input.summaryAr,
    input.summaryEn?.trim() || input.summaryAr,
    input.lessonsLearnedAr,
    input.lessonsLearnedEn?.trim() || input.lessonsLearnedAr,
    JSON.stringify(costBreakdown),
    JSON.stringify(photos),
    now,
    now,
  );

  const createdRow = db
    .prepare(
      `SELECT rw.*, u.name as author_name FROM real_weddings rw LEFT JOIN users u ON u.id = rw.user_id WHERE rw.id = ?`,
    )
    .get(id) as Record<string, unknown>;
  return mapRealWeddingRow(createdRow);
}

export function moderateWeddingStory(
  db: DatabaseSync,
  storyId: string,
  moderatorUserId: string,
  input: {
    moderationStatus: StoryModerationStatus;
    moderationNotes?: string | null;
    isFeatured?: boolean;
  },
): RealWeddingStory | null {
  const existing = db.prepare('SELECT * FROM real_weddings WHERE id = ?').get(storyId) as
    | Record<string, unknown>
    | undefined;
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE real_weddings
     SET moderation_status = ?,
         moderation_notes = ?,
         moderated_by_user_id = ?,
         moderated_at = ?,
         is_featured = COALESCE(?, is_featured),
         updated_at = ?
     WHERE id = ?`,
  ).run(
    input.moderationStatus,
    input.moderationNotes ?? null,
    moderatorUserId,
    now,
    input.isFeatured !== undefined ? (input.isFeatured ? 1 : 0) : null,
    now,
    storyId,
  );

  if (existing.user_id) {
    addUserNotification(db, {
      userId: String(existing.user_id),
      notifType: 'system',
      titleAr:
        input.moderationStatus === 'approved'
          ? 'تمت الموافقة ونشر قصة زفافك!'
          : input.moderationStatus === 'rejected'
            ? 'تحديث حول مراجعة قصة زفافك'
            : 'قصة زفافك قيد المراجعة',
      titleEn:
        input.moderationStatus === 'approved'
          ? 'Your Wedding Story Has Been Approved & Published!'
          : input.moderationStatus === 'rejected'
            ? 'Wedding Story Moderation Update'
            : 'Wedding Story Pending Review',
      bodyAr: `الحالة: ${input.moderationStatus}${input.moderationNotes ? ` — ${input.moderationNotes}` : ''}`,
      bodyEn: `Status: ${input.moderationStatus}${input.moderationNotes ? ` — ${input.moderationNotes}` : ''}`,
      linkPath: '/real-weddings',
    });
  }

  const row = db
    .prepare(
      `SELECT rw.*, u.name as author_name FROM real_weddings rw LEFT JOIN users u ON u.id = rw.user_id WHERE rw.id = ?`,
    )
    .get(storyId) as Record<string, unknown>;
  return mapRealWeddingRow(row);
}

export function mapExpertRow(row: Record<string, unknown>): ExpertProfile {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    slug: String(row.slug),
    displayNameAr: String(row.display_name_ar),
    displayNameEn: String(row.display_name_en),
    specialtySlug: row.specialty_slug as ExpertSpecialtySlug,
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    governorateSlug: String(row.governorate_slug),
    yearsExperience: Number(row.years_experience),
    credentialsAr: String(row.credentials_ar),
    credentialsEn: String(row.credentials_en),
    bioAr: String(row.bio_ar),
    bioEn: String(row.bio_en),
    avatarUrl: String(row.avatar_url),
    verificationStatus: row.verification_status as ExpertVerificationStatus,
    verificationDocs: JSON.parse(String(row.verification_docs_json || '[]')) as string[],
    verificationNotes: row.verification_notes ? String(row.verification_notes) : null,
    verifiedByUserId: row.verified_by_user_id ? String(row.verified_by_user_id) : null,
    verifiedAt: row.verified_at ? String(row.verified_at) : null,
    answersCount: Number(row.answers_count),
    helpfulCount: Number(row.helpful_count),
    isFeatured: Boolean(row.is_featured),
    isDemoData: Boolean(row.is_demo_data),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function listExperts(
  db: DatabaseSync,
  opts: {
    specialtySlug?: string;
    governorateSlug?: string;
    includePendingOrRejected?: boolean;
  } = {},
): ExpertProfile[] {
  const clauses: string[] = [];
  const params: string[] = [];

  if (!opts.includePendingOrRejected) {
    clauses.push("verification_status = 'verified'");
  }
  if (opts.specialtySlug && opts.specialtySlug !== 'all') {
    clauses.push('specialty_slug = ?');
    params.push(opts.specialtySlug);
  }
  if (opts.governorateSlug && opts.governorateSlug !== 'all') {
    clauses.push('governorate_slug = ?');
    params.push(opts.governorateSlug);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `SELECT * FROM expert_profiles ${where}
       ORDER BY is_featured DESC, helpful_count DESC, years_experience DESC`,
    )
    .all(...params) as Record<string, unknown>[];
  return rows.map(mapExpertRow);
}

export function applyForExpertVerification(
  db: DatabaseSync,
  user: User,
  input: {
    displayNameAr: string;
    displayNameEn: string;
    specialtySlug: ExpertSpecialtySlug;
    titleAr: string;
    titleEn: string;
    governorateSlug: string;
    yearsExperience: number;
    credentialsAr: string;
    credentialsEn: string;
    bioAr: string;
    bioEn: string;
    verificationDocs: string[];
  },
): { expert: ExpertProfile; alreadyExists: boolean } {
  const existing = db
    .prepare('SELECT * FROM expert_profiles WHERE user_id = ?')
    .get(user.id) as Record<string, unknown> | undefined;
  if (existing) {
    return { expert: mapExpertRow(existing), alreadyExists: true };
  }

  const now = new Date().toISOString();
  const id = `exp-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 4)}`;
  const slugBase = input.displayNameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'expert';
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 5)}`;

  db.prepare(
    `INSERT INTO expert_profiles (
      id, user_id, slug, display_name_ar, display_name_en, specialty_slug,
      title_ar, title_en, governorate_slug, years_experience, credentials_ar,
      credentials_en, bio_ar, bio_en, avatar_url, verification_status,
      verification_docs_json, answers_count, helpful_count, is_featured, is_demo_data,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 0, 0, 0, 0, ?, ?)`,
  ).run(
    id,
    user.id,
    slug,
    input.displayNameAr,
    input.displayNameEn,
    input.specialtySlug,
    input.titleAr,
    input.titleEn,
    input.governorateSlug,
    input.yearsExperience,
    input.credentialsAr,
    input.credentialsEn,
    input.bioAr,
    input.bioEn,
    user.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    JSON.stringify(input.verificationDocs),
    now,
    now,
  );

  const row = db.prepare('SELECT * FROM expert_profiles WHERE id = ?').get(id) as Record<string, unknown>;
  return { expert: mapExpertRow(row), alreadyExists: false };
}

export function adminVerifyExpertProfile(
  db: DatabaseSync,
  expertId: string,
  adminUserId: string,
  input: {
    verificationStatus: ExpertVerificationStatus;
    verificationNotes?: string | null;
    isFeatured?: boolean;
  },
): ExpertProfile | null {
  const existing = db.prepare('SELECT * FROM expert_profiles WHERE id = ?').get(expertId) as
    | Record<string, unknown>
    | undefined;
  if (!existing) return null;

  const now = new Date().toISOString();
  db.exec('BEGIN;');
  try {
    db.prepare(
      `UPDATE expert_profiles
       SET verification_status = ?,
           verification_notes = ?,
           verified_by_user_id = ?,
           verified_at = ?,
           is_featured = COALESCE(?, is_featured),
           updated_at = ?
       WHERE id = ?`,
    ).run(
      input.verificationStatus,
      input.verificationNotes ?? null,
      adminUserId,
      now,
      input.isFeatured !== undefined ? (input.isFeatured ? 1 : 0) : null,
      now,
      expertId,
    );

    // Update server-derived is_expert_answer flag cleanly for user's community answers
    const isNowVerified = input.verificationStatus === 'verified' ? 1 : 0;
    db.prepare('UPDATE community_answers SET is_expert_answer = ? WHERE user_id = ?').run(
      isNowVerified,
      String(existing.user_id),
    );
    const ansCountRow = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM community_answers WHERE user_id = ? AND moderation_status != 'hidden'",
      )
      .get(String(existing.user_id)) as { cnt: number };
    const helpfulCountRow = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM community_answers WHERE user_id = ? AND is_helpful_marked = 1 AND moderation_status != 'hidden'",
      )
      .get(String(existing.user_id)) as { cnt: number };
    db.prepare('UPDATE expert_profiles SET answers_count = ?, helpful_count = ? WHERE id = ?').run(
      ansCountRow.cnt,
      helpfulCountRow.cnt,
      expertId,
    );

    addUserNotification(db, {
      userId: String(existing.user_id),
      notifType: 'system',
      titleAr:
        input.verificationStatus === 'verified'
          ? 'تم اعتماد ملفك في دليل الخبراء المعتمدين!'
          : 'تحديث حول طلب اعتماد الخبير',
      titleEn:
        input.verificationStatus === 'verified'
          ? 'Your Expert Profile Has Been Verified!'
          : 'Expert Credential Review Update',
      bodyAr: `الحالة: ${input.verificationStatus}${input.verificationNotes ? ` — ${input.verificationNotes}` : ''}`,
      bodyEn: `Status: ${input.verificationStatus}${input.verificationNotes ? ` — ${input.verificationNotes}` : ''}`,
      linkPath: '/experts',
    });

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  const row = db.prepare('SELECT * FROM expert_profiles WHERE id = ?').get(expertId) as Record<string, unknown>;
  return mapExpertRow(row);
}

function getViewerVoteSet(
  db: DatabaseSync,
  viewerUserId: string | undefined,
  targetType: 'question' | 'answer',
): Set<string> {
  if (!viewerUserId) return new Set();
  const rows = db
    .prepare('SELECT target_id FROM community_votes WHERE user_id = ? AND target_type = ?')
    .all(viewerUserId, targetType) as { target_id: string }[];
  return new Set(rows.map((r) => r.target_id));
}

export function listCommunityQuestions(
  db: DatabaseSync,
  opts: {
    categorySlug?: string;
    q?: string;
    sort?: 'latest' | 'top_votes';
    includeHidden?: boolean;
    viewerUserId?: string;
  } = {},
): CommunityQuestion[] {
  const clauses: string[] = [];
  const params: string[] = [];

  if (!opts.includeHidden) {
    clauses.push("cq.moderation_status != 'hidden'");
  }
  if (opts.categorySlug && opts.categorySlug !== 'all') {
    clauses.push('cq.category_slug = ?');
    params.push(opts.categorySlug);
  }
  if (opts.q && opts.q.trim()) {
    const pattern = `%${opts.q.trim()}%`;
    clauses.push('(cq.title_ar LIKE ? OR cq.title_en LIKE ? OR cq.body_ar LIKE ? OR cq.body_en LIKE ?)');
    params.push(pattern, pattern, pattern, pattern);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const orderBy =
    opts.sort === 'top_votes'
      ? 'cq.upvotes_count DESC, cq.created_at DESC'
      : 'cq.created_at DESC';

  const qRows = db
    .prepare(
      `SELECT cq.*, u.name as author_name
       FROM community_questions cq
       JOIN users u ON u.id = cq.user_id
       ${where}
       ORDER BY ${orderBy}`,
    )
    .all(...params) as Record<string, unknown>[];

  const qVotes = getViewerVoteSet(db, opts.viewerUserId, 'question');
  const aVotes = getViewerVoteSet(db, opts.viewerUserId, 'answer');

  const qIds = qRows.map((r) => String(r.id));
  const answersByQuestion = new Map<string, CommunityAnswer[]>();

  if (qIds.length > 0) {
    const placeholders = qIds.map(() => '?').join(', ');
    const hiddenFilter = opts.includeHidden ? '' : "AND ca.moderation_status != 'hidden'";
    const aRows = db
      .prepare(
        `SELECT ca.*, u.name as author_name, u.role as author_role,
                ep.title_ar as expert_title_ar, ep.title_en as expert_title_en
         FROM community_answers ca
         JOIN users u ON u.id = ca.user_id
         LEFT JOIN expert_profiles ep ON ep.user_id = ca.user_id AND ep.verification_status = 'verified'
         WHERE ca.question_id IN (${placeholders}) ${hiddenFilter}
         ORDER BY ca.is_helpful_marked DESC, ca.is_expert_answer DESC, ca.upvotes_count DESC, ca.created_at ASC`,
      )
      .all(...qIds) as Record<string, unknown>[];

    for (const ar of aRows) {
      const qid = String(ar.question_id);
      const list = answersByQuestion.get(qid) ?? [];
      list.push({
        id: String(ar.id),
        questionId: qid,
        userId: String(ar.user_id),
        authorName: String(ar.author_name),
        authorRole: ar.author_role as User['role'],
        authorExpertTitleAr: ar.expert_title_ar ? String(ar.expert_title_ar) : null,
        authorExpertTitleEn: ar.expert_title_en ? String(ar.expert_title_en) : null,
        bodyAr: String(ar.body_ar),
        bodyEn: String(ar.body_en),
        isExpertAnswer: Boolean(ar.is_expert_answer),
        isHelpfulMarked: Boolean(ar.is_helpful_marked),
        upvotesCount: Number(ar.upvotes_count),
        moderationStatus: ar.moderation_status as CommunityQuestion['moderationStatus'],
        viewerUpvoted: aVotes.has(String(ar.id)),
        createdAt: String(ar.created_at),
        updatedAt: String(ar.updated_at),
      });
      answersByQuestion.set(qid, list);
    }
  }

  return qRows.map((r) => {
    const qid = String(r.id);
    const ansList = answersByQuestion.get(qid) ?? [];
    return {
      id: qid,
      userId: String(r.user_id),
      authorName: String(r.author_name),
      categorySlug: r.category_slug as CommunityCategorySlug,
      titleAr: String(r.title_ar),
      titleEn: String(r.title_en),
      bodyAr: String(r.body_ar),
      bodyEn: String(r.body_en),
      tags: JSON.parse(String(r.tags_json || '[]')) as string[],
      moderationStatus: r.moderation_status as CommunityQuestion['moderationStatus'],
      upvotesCount: Number(r.upvotes_count),
      answersCount: ansList.length,
      isResolved: Boolean(r.is_resolved),
      isDemoData: Boolean(r.is_demo_data),
      viewerUpvoted: qVotes.has(qid),
      answers: ansList,
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    };
  });
}

export function createCommunityQuestion(
  db: DatabaseSync,
  user: User,
  input: {
    categorySlug: CommunityCategorySlug;
    titleAr: string;
    titleEn?: string;
    bodyAr: string;
    bodyEn?: string;
    tags: string[];
  },
): CommunityQuestion {
  const now = new Date().toISOString();
  const id = `cq-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 4)}`;
  db.prepare(
    `INSERT INTO community_questions (
      id, user_id, category_slug, title_ar, title_en, body_ar, body_en,
      tags_json, moderation_status, upvotes_count, answers_count, is_resolved,
      is_demo_data, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', 0, 0, 0, 0, ?, ?)`,
  ).run(
    id,
    user.id,
    input.categorySlug,
    input.titleAr,
    input.titleEn?.trim() || input.titleAr,
    input.bodyAr,
    input.bodyEn?.trim() || input.bodyAr,
    JSON.stringify(input.tags),
    now,
    now,
  );

  const [created] = listCommunityQuestions(db, { viewerUserId: user.id }).filter((q) => q.id === id);
  return created;
}

export function createCommunityAnswer(
  db: DatabaseSync,
  user: User,
  questionId: string,
  input: { bodyAr: string; bodyEn?: string },
): { answer: CommunityAnswer; questionOwnerId: string } | null {
  const qRow = db
    .prepare("SELECT id, user_id, title_ar, title_en FROM community_questions WHERE id = ? AND moderation_status != 'hidden'")
    .get(questionId) as { id: string; user_id: string; title_ar: string; title_en: string } | undefined;
  if (!qRow) return null;

  // Determine expert badge strictly from server-verified expert profile (NEVER client input)
  const expertRow = db
    .prepare("SELECT id FROM expert_profiles WHERE user_id = ? AND verification_status = 'verified'")
    .get(user.id) as { id: string } | undefined;
  const isExpert = expertRow ? 1 : 0;

  const now = new Date().toISOString();
  const id = `ca-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 4)}`;

  db.exec('BEGIN;');
  try {
    db.prepare(
      `INSERT INTO community_answers (
        id, question_id, user_id, body_ar, body_en, is_expert_answer,
        is_helpful_marked, upvotes_count, moderation_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'approved', ?, ?)`,
    ).run(
      id,
      questionId,
      user.id,
      input.bodyAr,
      input.bodyEn?.trim() || input.bodyAr,
      isExpert,
      now,
      now,
    );

    const cnt = db
      .prepare("SELECT COUNT(*) as cnt FROM community_answers WHERE question_id = ? AND moderation_status != 'hidden'")
      .get(questionId) as { cnt: number };
    db.prepare('UPDATE community_questions SET answers_count = ?, updated_at = ? WHERE id = ?').run(
      cnt.cnt,
      now,
      questionId,
    );

    if (expertRow) {
      db.prepare('UPDATE expert_profiles SET answers_count = answers_count + 1, updated_at = ? WHERE id = ?').run(
        now,
        expertRow.id,
      );
    }

    if (qRow.user_id !== user.id) {
      addUserNotification(db, {
        userId: qRow.user_id,
        notifType: 'system',
        titleAr: isExpert ? 'إجابة جديدة من خبير معتمد على سؤالك' : 'إجابة جديدة على سؤالك في المجتمع',
        titleEn: isExpert ? 'Verified Expert Answered Your Question' : 'New Community Answer',
        bodyAr: qRow.title_ar,
        bodyEn: qRow.title_en,
        linkPath: '/community',
      });
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  const row = db
    .prepare(
      `SELECT ca.*, u.name as author_name, u.role as author_role,
              ep.title_ar as expert_title_ar, ep.title_en as expert_title_en
       FROM community_answers ca
       JOIN users u ON u.id = ca.user_id
       LEFT JOIN expert_profiles ep ON ep.user_id = ca.user_id AND ep.verification_status = 'verified'
       WHERE ca.id = ?`,
    )
    .get(id) as Record<string, unknown>;

  return {
    questionOwnerId: qRow.user_id,
    answer: {
      id: String(row.id),
      questionId: String(row.question_id),
      userId: String(row.user_id),
      authorName: String(row.author_name),
      authorRole: row.author_role as User['role'],
      authorExpertTitleAr: row.expert_title_ar ? String(row.expert_title_ar) : null,
      authorExpertTitleEn: row.expert_title_en ? String(row.expert_title_en) : null,
      bodyAr: String(row.body_ar),
      bodyEn: String(row.body_en),
      isExpertAnswer: Boolean(row.is_expert_answer),
      isHelpfulMarked: Boolean(row.is_helpful_marked),
      upvotesCount: Number(row.upvotes_count),
      moderationStatus: row.moderation_status as CommunityQuestion['moderationStatus'],
      viewerUpvoted: false,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    },
  };
}

export function toggleCommunityVote(
  db: DatabaseSync,
  userId: string,
  targetType: 'question' | 'answer',
  targetId: string,
): { upvoted: boolean; upvotesCount: number } | null {
  const table = targetType === 'question' ? 'community_questions' : 'community_answers';
  const target = db
    .prepare(`SELECT id FROM ${table} WHERE id = ? AND moderation_status != 'hidden'`)
    .get(targetId) as { id: string } | undefined;
  if (!target) return null;

  const existing = db
    .prepare('SELECT id FROM community_votes WHERE user_id = ? AND target_type = ? AND target_id = ?')
    .get(userId, targetType, targetId) as { id: string } | undefined;

  let upvoted = false;
  db.exec('BEGIN;');
  try {
    if (existing) {
      db.prepare('DELETE FROM community_votes WHERE id = ?').run(existing.id);
      upvoted = false;
    } else {
      db.prepare(
        `INSERT INTO community_votes (id, user_id, target_type, target_id, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(`cv-${crypto.randomUUID().slice(0, 8)}`, userId, targetType, targetId, new Date().toISOString());
      upvoted = true;
    }

    const countRow = db
      .prepare('SELECT COUNT(*) as cnt FROM community_votes WHERE target_type = ? AND target_id = ?')
      .get(targetType, targetId) as { cnt: number };

    db.prepare(`UPDATE ${table} SET upvotes_count = ? WHERE id = ?`).run(countRow.cnt, targetId);
    db.exec('COMMIT;');
    return { upvoted, upvotesCount: countRow.cnt };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function markCommunityAnswerHelpful(
  db: DatabaseSync,
  actorUser: User,
  questionId: string,
  answerId: string,
  isModerator: boolean,
): { ok: true } | { errorCode: 'NOT_FOUND' | 'FORBIDDEN' } {
  const qRow = db
    .prepare('SELECT id, user_id FROM community_questions WHERE id = ?')
    .get(questionId) as { id: string; user_id: string } | undefined;
  if (!qRow) return { errorCode: 'NOT_FOUND' };
  if (qRow.user_id !== actorUser.id && !isModerator) return { errorCode: 'FORBIDDEN' };

  const aRow = db
    .prepare('SELECT id, user_id FROM community_answers WHERE id = ? AND question_id = ?')
    .get(answerId, questionId) as { id: string; user_id: string } | undefined;
  if (!aRow) return { errorCode: 'NOT_FOUND' };

  const now = new Date().toISOString();
  db.exec('BEGIN;');
  try {
    db.prepare('UPDATE community_answers SET is_helpful_marked = 1, updated_at = ? WHERE id = ?').run(now, answerId);
    db.prepare('UPDATE community_questions SET is_resolved = 1, updated_at = ? WHERE id = ?').run(now, questionId);

    const helpfulCountRow = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM community_answers WHERE user_id = ? AND is_helpful_marked = 1 AND moderation_status != 'hidden'",
      )
      .get(aRow.user_id) as { cnt: number };
    db.prepare('UPDATE expert_profiles SET helpful_count = ? WHERE user_id = ?').run(
      helpfulCountRow.cnt,
      aRow.user_id,
    );
    db.exec('COMMIT;');
    return { ok: true };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function createCommunityReport(
  db: DatabaseSync,
  reporter: User,
  input: {
    targetType: 'question' | 'answer' | 'story' | 'vendor_review';
    targetId: string;
    reason: CommunityReport['reason'];
    details?: string | null;
  },
): CommunityReport {
  const id = `crep-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 4)}`;
  const now = new Date().toISOString();

  db.exec('BEGIN;');
  try {
    db.prepare(
      `INSERT INTO community_reports (
        id, reporter_user_id, target_type, target_id, reason, details, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?)`,
    ).run(id, reporter.id, input.targetType, input.targetId, input.reason, input.details ?? null, now);

    if (input.targetType === 'question') {
      db.prepare("UPDATE community_questions SET moderation_status = 'flagged' WHERE id = ? AND moderation_status = 'approved'").run(
        input.targetId,
      );
    } else if (input.targetType === 'answer') {
      db.prepare("UPDATE community_answers SET moderation_status = 'flagged' WHERE id = ? AND moderation_status = 'approved'").run(
        input.targetId,
      );
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return {
    id,
    reporterUserId: reporter.id,
    reporterName: reporter.name,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    details: input.details ?? null,
    status: 'open',
    createdAt: now,
  };
}

export function resolveCommunityReport(
  db: DatabaseSync,
  reportId: string,
  moderatorUserId: string,
  input: { action: 'resolve_hide' | 'dismiss'; resolutionNote?: string | null },
): CommunityReport | null {
  const existing = db.prepare('SELECT * FROM community_reports WHERE id = ?').get(reportId) as
    | Record<string, unknown>
    | undefined;
  if (!existing) return null;

  const now = new Date().toISOString();
  const nextStatus = input.action === 'resolve_hide' ? 'resolved_hidden' : 'dismissed';

  db.exec('BEGIN;');
  try {
    db.prepare(
      `UPDATE community_reports
       SET status = ?, reviewed_by_user_id = ?, resolution_note = ?, resolved_at = ?
       WHERE id = ?`,
    ).run(nextStatus, moderatorUserId, input.resolutionNote ?? null, now, reportId);

    const tType = String(existing.target_type);
    const tId = String(existing.target_id);

    if (input.action === 'resolve_hide') {
      if (tType === 'question') {
        db.prepare("UPDATE community_questions SET moderation_status = 'hidden', updated_at = ? WHERE id = ?").run(now, tId);
      } else if (tType === 'answer') {
        db.prepare("UPDATE community_answers SET moderation_status = 'hidden', updated_at = ? WHERE id = ?").run(now, tId);
      } else if (tType === 'story') {
        db.prepare("UPDATE real_weddings SET moderation_status = 'rejected', moderation_notes = ?, updated_at = ? WHERE id = ?").run(
          input.resolutionNote || 'Hidden after moderation review',
          now,
          tId,
        );
      }
    } else {
      if (tType === 'question') {
        db.prepare("UPDATE community_questions SET moderation_status = 'approved' WHERE id = ? AND moderation_status = 'flagged'").run(tId);
      } else if (tType === 'answer') {
        db.prepare("UPDATE community_answers SET moderation_status = 'approved' WHERE id = ? AND moderation_status = 'flagged'").run(tId);
      }
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  const updated = db
    .prepare(
      `SELECT cr.*, u.name as reporter_name FROM community_reports cr LEFT JOIN users u ON u.id = cr.reporter_user_id WHERE cr.id = ?`,
    )
    .get(reportId) as Record<string, unknown>;
  return mapCommunityReportRow(db, updated);
}

function mapCommunityReportRow(db: DatabaseSync, r: Record<string, unknown>): CommunityReport {
  const tType = String(r.target_type) as CommunityReport['targetType'];
  const tId = String(r.target_id);
  let targetPreview = tId;

  if (tType === 'question') {
    const q = db.prepare('SELECT title_ar FROM community_questions WHERE id = ?').get(tId) as
      | { title_ar: string }
      | undefined;
    if (q) targetPreview = q.title_ar;
  } else if (tType === 'answer') {
    const a = db.prepare('SELECT body_ar FROM community_answers WHERE id = ?').get(tId) as
      | { body_ar: string }
      | undefined;
    if (a) targetPreview = a.body_ar.slice(0, 90);
  } else if (tType === 'story') {
    const s = db.prepare('SELECT couple_title_ar FROM real_weddings WHERE id = ?').get(tId) as
      | { couple_title_ar: string }
      | undefined;
    if (s) targetPreview = s.couple_title_ar;
  }

  return {
    id: String(r.id),
    reporterUserId: String(r.reporter_user_id),
    reporterName: r.reporter_name ? String(r.reporter_name) : undefined,
    targetType: tType,
    targetId: tId,
    targetPreview,
    reason: r.reason as CommunityReport['reason'],
    details: r.details ? String(r.details) : null,
    status: r.status as CommunityReport['status'],
    reviewedByUserId: r.reviewed_by_user_id ? String(r.reviewed_by_user_id) : null,
    resolutionNote: r.resolution_note ? String(r.resolution_note) : null,
    resolvedAt: r.resolved_at ? String(r.resolved_at) : null,
    createdAt: String(r.created_at),
  };
}

export function buildAdminModerationOverview(db: DatabaseSync): AdminModerationOverview {
  const stories = listRealWeddingStories(db, { includeUnapproved: true });
  const reportRows = db
    .prepare(
      `SELECT cr.*, u.name as reporter_name
       FROM community_reports cr
       LEFT JOIN users u ON u.id = cr.reporter_user_id
       ORDER BY CASE WHEN cr.status = 'open' THEN 0 ELSE 1 END, cr.created_at DESC`,
    )
    .all() as Record<string, unknown>[];
  const reports = reportRows.map((r) => mapCommunityReportRow(db, r));
  const flaggedQuestions = listCommunityQuestions(db, { includeHidden: true }).filter(
    (q) => q.moderationStatus !== 'approved' || (q.answers || []).some((a) => a.moderationStatus !== 'approved'),
  );
  const experts = listExperts(db, { includePendingOrRejected: true });

  return { stories, reports, flaggedQuestions, experts };
}

export function buildAdminAnalytics(db: DatabaseSync): AdminAnalyticsPayload {
  const totalUsersRow = db.prepare('SELECT COUNT(*) as cnt FROM users WHERE deleted_at IS NULL').get() as {
    cnt: number;
  };
  const activeCustomersRow = db
    .prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'customer' AND status = 'active' AND deleted_at IS NULL")
    .get() as { cnt: number };
  const vendorPartnersRow = db
    .prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'vendor' AND deleted_at IS NULL")
    .get() as { cnt: number };
  const verifiedExpertsRow = db
    .prepare("SELECT COUNT(*) as cnt FROM expert_profiles WHERE verification_status = 'verified'")
    .get() as { cnt: number };

  const stageRows = db
    .prepare(
      'SELECT current_stage as stage, COUNT(*) as cnt FROM users WHERE deleted_at IS NULL GROUP BY current_stage ORDER BY cnt DESC',
    )
    .all() as { stage: LifecycleStage; cnt: number }[];

  const vendorsTotalRow = db.prepare('SELECT COUNT(*) as cnt FROM vendors').get() as { cnt: number };
  const vendorsVerifiedRow = db
    .prepare("SELECT COUNT(*) as cnt FROM vendors WHERE verification_status IN ('verified', 'trusted')")
    .get() as { cnt: number };
  const vendorsTrustedRow = db
    .prepare("SELECT COUNT(*) as cnt FROM vendors WHERE verification_status = 'trusted'")
    .get() as { cnt: number };

  const rfqCountsRow = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_cnt,
         SUM(CASE WHEN status = 'quoted' THEN 1 ELSE 0 END) as quoted_cnt,
         SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_cnt
       FROM rfq_requests`,
    )
    .get() as { total: number; open_cnt: number | null; quoted_cnt: number | null; accepted_cnt: number | null };

  const invCountsRow = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status IN ('quoted', 'declined') THEN 1 ELSE 0 END) as responded_cnt
       FROM rfq_invitations`,
    )
    .get() as { total: number; responded_cnt: number | null };

  const aptCountsRow = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status IN ('confirmed', 'completed') THEN 1 ELSE 0 END) as ok_cnt
       FROM appointments`,
    )
    .get() as { total: number; ok_cnt: number | null };

  const approvedStoriesRow = db
    .prepare("SELECT COUNT(*) as cnt FROM real_weddings WHERE moderation_status = 'approved'")
    .get() as { cnt: number };
  const pendingStoriesRow = db
    .prepare("SELECT COUNT(*) as cnt FROM real_weddings WHERE moderation_status = 'pending'")
    .get() as { cnt: number };
  const questionsCountRow = db
    .prepare("SELECT COUNT(*) as cnt FROM community_questions WHERE moderation_status != 'hidden'")
    .get() as { cnt: number };
  const answersCountRow = db
    .prepare("SELECT COUNT(*) as cnt FROM community_answers WHERE moderation_status != 'hidden'")
    .get() as { cnt: number };
  const openReportsRow = db
    .prepare("SELECT COUNT(*) as cnt FROM community_reports WHERE status = 'open'")
    .get() as { cnt: number };
  const pendingExpertsRow = db
    .prepare("SELECT COUNT(*) as cnt FROM expert_profiles WHERE verification_status = 'pending'")
    .get() as { cnt: number };

  const topReadRows = db
    .prepare(
      `SELECT id, slug, title_ar, title_en, domain, view_count
       FROM articles
       WHERE status = 'published'
       ORDER BY view_count DESC, updated_at DESC
       LIMIT 6`,
    )
    .all() as {
    id: string;
    slug: string;
    title_ar: string;
    title_en: string;
    domain: Article['domain'];
    view_count: number;
  }[];

  const totalRfqs = Number(rfqCountsRow.total || 0);
  const acceptedRfqs = Number(rfqCountsRow.accepted_cnt || 0);
  const totalInv = Number(invCountsRow.total || 0);
  const respondedInv = Number(invCountsRow.responded_cnt || 0);

  return {
    generatedAt: new Date().toISOString(),
    privacyNotice:
      'Analytics reflect aggregate platform funnels only. Individual Early Start balances, Future Fund targets, and private user documents remain strictly isolated from Admin Analytics.',
    usersSummary: {
      totalUsers: Number(totalUsersRow.cnt || 0),
      activeCustomers: Number(activeCustomersRow.cnt || 0),
      vendorPartners: Number(vendorPartnersRow.cnt || 0),
      verifiedExpertsCount: Number(verifiedExpertsRow.cnt || 0),
      stageDistribution: stageRows.map((s) => ({ stage: s.stage, count: Number(s.cnt) })),
    },
    marketplaceFunnel: {
      totalVendors: Number(vendorsTotalRow.cnt || 0),
      verifiedVendors: Number(vendorsVerifiedRow.cnt || 0),
      trustedVendors: Number(vendorsTrustedRow.cnt || 0),
      totalRfqs,
      openRfqs: Number(rfqCountsRow.open_cnt || 0),
      quotedRfqs: Number(rfqCountsRow.quoted_cnt || 0),
      acceptedRfqs,
      rfqAcceptanceRatePct: totalRfqs > 0 ? Math.round((acceptedRfqs / totalRfqs) * 100) : 0,
      totalInvitations: totalInv,
      respondedInvitations: respondedInv,
      vendorResponseRatePct: totalInv > 0 ? Math.round((respondedInv / totalInv) * 100) : 0,
      totalAppointments: Number(aptCountsRow.total || 0),
      confirmedOrCompletedAppointments: Number(aptCountsRow.ok_cnt || 0),
    },
    communitySummary: {
      approvedStoriesCount: Number(approvedStoriesRow.cnt || 0),
      pendingStoriesCount: Number(pendingStoriesRow.cnt || 0),
      questionsCount: Number(questionsCountRow.cnt || 0),
      answersCount: Number(answersCountRow.cnt || 0),
      openReportsCount: Number(openReportsRow.cnt || 0),
      pendingExpertsCount: Number(pendingExpertsRow.cnt || 0),
    },
    contentTopReads: topReadRows.map((r) => ({
      id: r.id,
      slug: r.slug,
      titleAr: r.title_ar,
      titleEn: r.title_en,
      domain: r.domain,
      viewCount: Number(r.view_count || 0),
    })),
  };
}

import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { ensureUserBudgetPlan, upsertBudgetExpenseFromSource } from './budgetService';
import { addUserNotification } from './journeyWorkspaceService';
import type {
  MarketplaceAppointment,
  MarketplaceAppointmentStatus,
  MarketplaceAppointmentType,
  RfqInvitation,
  RfqInvitationStatus,
  RfqMessage,
  RfqQuote,
  RfqQuoteStatus,
  RfqRequest,
  RfqStatus,
  User,
  VendorCrmOverviewPayload,
  VendorLead,
  VendorLeadActivity,
  VendorLeadActivityType,
  VendorLeadStage,
  VendorListing,
  VendorVerificationStatus,
} from '../shared/types';
import { getVendorDetailBySlugOrId } from './vendorMarketplaceService';

export const VENDOR_CRM_STAGES: VendorLeadStage[] = [
  'new_lead',
  'contacted',
  'quotation_sent',
  'negotiation',
  'accepted',
  'in_progress',
  'completed',
  'lost',
];

export function mapCategoryToBudgetBucket(categorySlug: string): {
  budgetSlug: string;
  paidBySide: 'groom' | 'bride' | 'shared';
} {
  switch (categorySlug) {
    case 'turnkey_finishing':
    case 'mep_contractors':
    case 'kitchens_dressing':
    case 'ceramics_sanitary':
    case 'lighting_decor':
    case 'architecture_3d':
      return { budgetSlug: 'finishing', paidBySide: 'groom' };
    case 'home_appliances':
    case 'smart_home':
      return { budgetSlug: 'appliances', paidBySide: 'groom' };
    case 'bedroom_furniture':
    case 'living_dining_furniture':
      return { budgetSlug: 'furniture', paidBySide: 'groom' };
    case 'cookware_dinnerware':
    case 'linens_textiles':
    case 'bridal_attire_beauty':
      return { budgetSlug: 'bride_trousseau', paidBySide: 'bride' };
    case 'gold_shabka':
      return { budgetSlug: 'gold_shabka', paidBySide: 'groom' };
    case 'wedding_venues':
    case 'photography_video':
    case 'wedding_planning_flowers':
    case 'catering_hospitality':
      return { budgetSlug: 'wedding', paidBySide: 'shared' };
    case 'moving_logistics':
    case 'home_maintenance':
    default:
      return { budgetSlug: 'emergency', paidBySide: 'shared' };
  }
}

function mapRfqRow(row: Record<string, unknown>): RfqRequest {
  let reqObj: Record<string, string | number | boolean> = {};
  try {
    reqObj = JSON.parse(String(row.requirements_json || '{}')) as Record<
      string,
      string | number | boolean
    >;
  } catch {
    reqObj = {};
  }
  return {
    id: String(row.id),
    userId: String(row.user_id),
    customerName: row.customer_name ? String(row.customer_name) : undefined,
    title: String(row.title),
    categorySlug: String(row.category_slug),
    categoryNameAr: row.cat_name_ar ? String(row.cat_name_ar) : undefined,
    categoryNameEn: row.cat_name_en ? String(row.cat_name_en) : undefined,
    governorateSlug: String(row.governorate_slug),
    citySlug: row.city_slug ? String(row.city_slug) : null,
    budgetMin: Number(row.budget_min ?? 0),
    budgetMax: Number(row.budget_max ?? 0),
    desiredDate: row.desired_date ? String(row.desired_date) : null,
    scopeDetails: String(row.scope_details),
    requirements: reqObj,
    preferredContact: (row.preferred_contact as RfqRequest['preferredContact']) || 'platform',
    targetVendorId: row.target_vendor_id ? String(row.target_vendor_id) : null,
    status: (row.status as RfqStatus) || 'open',
    acceptedQuoteId: row.accepted_quote_id ? String(row.accepted_quote_id) : null,
    invitationsCount: row.invitations_count != null ? Number(row.invitations_count) : undefined,
    quotesCount: row.quotes_count != null ? Number(row.quotes_count) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapRfqInvitationRow(row: Record<string, unknown>): RfqInvitation {
  return {
    id: String(row.id),
    rfqId: String(row.rfq_id),
    vendorId: String(row.vendor_id),
    vendorSlug: row.vendor_slug ? String(row.vendor_slug) : undefined,
    vendorNameAr: row.vendor_name_ar ? String(row.vendor_name_ar) : undefined,
    vendorNameEn: row.vendor_name_en ? String(row.vendor_name_en) : undefined,
    verificationStatus: row.verification_status
      ? (String(row.verification_status) as VendorVerificationStatus)
      : undefined,
    status: (row.status as RfqInvitationStatus) || 'invited',
    invitedAt: String(row.invited_at),
  };
}

function mapRfqQuoteRow(row: Record<string, unknown>): RfqQuote {
  return {
    id: String(row.id),
    rfqId: String(row.rfq_id),
    vendorId: String(row.vendor_id),
    vendorSlug: row.vendor_slug ? String(row.vendor_slug) : undefined,
    vendorNameAr: row.vendor_name_ar ? String(row.vendor_name_ar) : undefined,
    vendorNameEn: row.vendor_name_en ? String(row.vendor_name_en) : undefined,
    vendorVerificationStatus: row.verification_status
      ? (String(row.verification_status) as VendorVerificationStatus)
      : undefined,
    vendorRatingAvg: row.rating_avg != null ? Number(row.rating_avg) : undefined,
    vendorReviewsCount: row.reviews_count != null ? Number(row.reviews_count) : undefined,
    quotedAmountEgp: Number(row.quoted_amount_egp ?? 0),
    depositAmountEgp: Number(row.deposit_amount_egp ?? 0),
    estimatedDuration: String(row.estimated_duration),
    warrantyMonths: Number(row.warranty_months ?? 0),
    scopeSummary: String(row.scope_summary),
    termsNotes: row.terms_notes ? String(row.terms_notes) : null,
    validUntil: String(row.valid_until),
    status: (row.status as RfqQuoteStatus) || 'submitted',
    customerDecisionNote: row.customer_decision_note ? String(row.customer_decision_note) : null,
    linkedBudgetExpenseId: row.linked_budget_expense_id ? String(row.linked_budget_expense_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapRfqMessageRow(row: Record<string, unknown>): RfqMessage {
  return {
    id: String(row.id),
    rfqId: String(row.rfq_id),
    senderUserId: String(row.sender_user_id),
    senderRole: row.sender_role as RfqMessage['senderRole'],
    senderName: String(row.sender_name),
    vendorId: row.vendor_id ? String(row.vendor_id) : null,
    body: String(row.body),
    createdAt: String(row.created_at),
  };
}

function mapAppointmentRow(row: Record<string, unknown>): MarketplaceAppointment {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    customerName: row.customer_name ? String(row.customer_name) : undefined,
    vendorId: String(row.vendor_id),
    vendorSlug: row.vendor_slug ? String(row.vendor_slug) : undefined,
    vendorNameAr: row.vendor_name_ar ? String(row.vendor_name_ar) : undefined,
    vendorNameEn: row.vendor_name_en ? String(row.vendor_name_en) : undefined,
    vendorPhone: row.vendor_phone ? String(row.vendor_phone) : undefined,
    vendorVerificationStatus: row.verification_status
      ? (String(row.verification_status) as VendorVerificationStatus)
      : undefined,
    serviceId: row.service_id ? String(row.service_id) : null,
    serviceTitleAr: row.service_title_ar ? String(row.service_title_ar) : null,
    serviceTitleEn: row.service_title_en ? String(row.service_title_en) : null,
    rfqId: row.rfq_id ? String(row.rfq_id) : null,
    appointmentType: row.appointment_type as MarketplaceAppointmentType,
    slotDate: String(row.slot_date),
    slotTime: String(row.slot_time),
    durationMinutes: Number(row.duration_minutes ?? 45),
    customerPhone: String(row.customer_phone),
    customerNotes: row.customer_notes ? String(row.customer_notes) : null,
    vendorResponseNote: row.vendor_response_note ? String(row.vendor_response_note) : null,
    status: (row.status as MarketplaceAppointmentStatus) || 'requested',
    confirmedAt: row.confirmed_at ? String(row.confirmed_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapVendorLeadRow(row: Record<string, unknown>): VendorLead {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    customerUserId: row.customer_user_id ? String(row.customer_user_id) : null,
    rfqId: row.rfq_id ? String(row.rfq_id) : null,
    appointmentId: row.appointment_id ? String(row.appointment_id) : null,
    leadSource: row.lead_source as VendorLead['leadSource'],
    customerName: String(row.customer_name),
    customerPhone: row.customer_phone ? String(row.customer_phone) : null,
    title: String(row.title),
    stage: (row.stage as VendorLeadStage) || 'new_lead',
    estimatedValueEgp: Number(row.estimated_value_egp ?? 0),
    nextFollowUpDate: row.next_follow_up_date ? String(row.next_follow_up_date) : null,
    lossReason: row.loss_reason ? String(row.loss_reason) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapVendorLeadActivityRow(row: Record<string, unknown>): VendorLeadActivity {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    actorUserId: String(row.actor_user_id),
    actorName: row.actor_name ? String(row.actor_name) : undefined,
    activityType: row.activity_type as VendorLeadActivityType,
    note: String(row.note),
    createdAt: String(row.created_at),
  };
}

export function selectMatchedVendorsForRfq(
  db: DatabaseSync,
  categorySlug: string,
  governorateSlug: string,
  targetVendorId?: string | null,
  limit = 6,
): { id: string; ownerUserId: string; businessNameAr: string; businessNameEn: string }[] {
  const candidates = db
    .prepare(
      `SELECT v.id, v.owner_user_id, v.business_name_ar, v.business_name_en, v.primary_category_slug,
              v.extra_category_slugs_json, v.governorate_slug, v.service_areas_json, v.verification_status,
              COALESCE(sp.lead_priority_boost, 0) AS priority_boost
       FROM vendors v
       LEFT JOIN subscription_plans sp ON sp.id = v.subscription_plan_id
       WHERE v.verification_status != 'rejected' AND v.commercial_status = 'active'`,
    )
    .all() as Record<string, unknown>[];

  const verifWeight: Record<string, number> = { trusted: 300, verified: 200, registered: 100 };

  const scored = candidates
    .map((c) => {
      const id = String(c.id);
      const primary = String(c.primary_category_slug);
      const extras = JSON.parse(String(c.extra_category_slugs_json || '[]')) as string[];
      const areas = JSON.parse(String(c.service_areas_json || '[]')) as string[];
      const catMatch = primary === categorySlug ? 2 : extras.includes(categorySlug) ? 1 : 0;
      const govMatch =
        String(c.governorate_slug) === governorateSlug || areas.includes(governorateSlug) ? 1 : 0;
      const isDirectTarget = targetVendorId && id === targetVendorId;
      if (!isDirectTarget && catMatch === 0) return null;
      const score =
        (isDirectTarget ? 10000 : 0) +
        catMatch * 1000 +
        govMatch * 400 +
        (verifWeight[String(c.verification_status)] ?? 0) +
        Number(c.priority_boost ?? 0);
      return {
        id,
        ownerUserId: String(c.owner_user_id),
        businessNameAr: String(c.business_name_ar),
        businessNameEn: String(c.business_name_en),
        score,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ id, ownerUserId, businessNameAr, businessNameEn }) => ({
    id,
    ownerUserId,
    businessNameAr,
    businessNameEn,
  }));
}

export function ensureVendorLeadFromSource(
  db: DatabaseSync,
  params: {
    vendorId: string;
    customerUserId: string;
    customerName: string;
    customerPhone?: string | null;
    rfqId?: string | null;
    appointmentId?: string | null;
    leadSource: 'rfq' | 'appointment';
    title: string;
    estimatedValueEgp: number;
    actorUserId: string;
    activityNote: string;
  },
): VendorLead {
  const now = new Date().toISOString();
  const existing = params.rfqId
    ? (db
        .prepare('SELECT * FROM vendor_leads WHERE vendor_id = ? AND rfq_id = ?')
        .get(params.vendorId, params.rfqId) as Record<string, unknown> | undefined)
    : params.appointmentId
      ? (db
          .prepare('SELECT * FROM vendor_leads WHERE vendor_id = ? AND appointment_id = ?')
          .get(params.vendorId, params.appointmentId) as Record<string, unknown> | undefined)
      : undefined;

  if (existing) {
    return mapVendorLeadRow(existing);
  }

  const leadId = `vlead-${crypto.randomUUID().slice(0, 10)}`;
  db.prepare(
    `INSERT INTO vendor_leads
       (id, vendor_id, customer_user_id, rfq_id, appointment_id, lead_source, customer_name, customer_phone, title, stage, estimated_value_egp, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new_lead', ?, ?, ?)`,
  ).run(
    leadId,
    params.vendorId,
    params.customerUserId,
    params.rfqId ?? null,
    params.appointmentId ?? null,
    params.leadSource,
    params.customerName,
    params.customerPhone ?? null,
    params.title,
    params.estimatedValueEgp,
    now,
    now,
  );

  db.prepare(
    `INSERT INTO lead_activities (id, lead_id, actor_user_id, activity_type, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    `lact-${crypto.randomUUID().slice(0, 10)}`,
    leadId,
    params.actorUserId,
    params.leadSource === 'appointment' ? 'appointment' : 'note',
    params.activityNote,
    now,
  );

  const row = db.prepare('SELECT * FROM vendor_leads WHERE id = ?').get(leadId) as Record<string, unknown>;
  return mapVendorLeadRow(row);
}

export function createRfqRequest(
  db: DatabaseSync,
  user: User,
  input: {
    title: string;
    categorySlug: string;
    governorateSlug: string;
    citySlug?: string | null;
    budgetMin: number;
    budgetMax: number;
    desiredDate?: string | null;
    scopeDetails: string;
    requirements?: Record<string, string | number | boolean>;
    preferredContact: 'platform' | 'phone' | 'whatsapp';
    targetVendorId?: string | null;
  },
): RfqRequest {
  const rfqId = `rfq-${Date.now().toString().slice(-6)}-${crypto.randomUUID().slice(0, 4)}`;
  const now = new Date().toISOString();
  const targetVendor = input.targetVendorId ? getVendorDetailBySlugOrId(db, input.targetVendorId, false) : null;
  const resolvedTargetId = targetVendor && targetVendor.verificationStatus !== 'rejected' ? targetVendor.id : null;

  db.exec('BEGIN;');
  try {
    db.prepare(
      `INSERT INTO rfq_requests
         (id, user_id, title, category_slug, governorate_slug, city_slug, budget_min, budget_max, desired_date, scope_details, requirements_json, preferred_contact, target_vendor_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
    ).run(
      rfqId,
      user.id,
      input.title,
      input.categorySlug,
      input.governorateSlug,
      input.citySlug ?? null,
      input.budgetMin,
      Math.max(input.budgetMin, input.budgetMax),
      input.desiredDate ?? null,
      input.scopeDetails,
      JSON.stringify(input.requirements ?? {}),
      input.preferredContact,
      resolvedTargetId,
      now,
      now,
    );

    const matchedVendors = selectMatchedVendorsForRfq(
      db,
      input.categorySlug,
      input.governorateSlug,
      resolvedTargetId,
      6,
    );

    const insInvite = db.prepare(
      `INSERT OR IGNORE INTO rfq_invitations (id, rfq_id, vendor_id, status, invited_at)
       VALUES (?, ?, ?, 'invited', ?)`,
    );

    const notifiedOwners = new Set<string>();
    for (const mv of matchedVendors) {
      insInvite.run(`rinv-${crypto.randomUUID().slice(0, 10)}`, rfqId, mv.id, now);
      ensureVendorLeadFromSource(db, {
        vendorId: mv.id,
        customerUserId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        rfqId,
        leadSource: 'rfq',
        title: input.title,
        estimatedValueEgp: Math.max(input.budgetMax, input.budgetMin),
        actorUserId: user.id,
        activityNote: `طلب تسعير جديد (${input.categorySlug}) — الميزانية ${input.budgetMin.toLocaleString()}-${input.budgetMax.toLocaleString()} ج.م`,
      });
      if (!notifiedOwners.has(mv.ownerUserId) && mv.ownerUserId !== user.id) {
        notifiedOwners.add(mv.ownerUserId);
        addUserNotification(db, {
          userId: mv.ownerUserId,
          notifType: 'system',
          titleAr: `طلب تسعير جديد: ${input.title}`,
          titleEn: `New RFQ Invitation: ${input.title}`,
          bodyAr: `وصلك طلب عرض سعر في تصنيف ${input.categorySlug}. يمكنك إرسال العرض من بوابة الشريك.`,
          bodyEn: `A matched customer requested a quote in ${input.categorySlug}. Submit your offer in Vendor Portal.`,
          linkPath: `/vendor`,
        });
      }
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return getRfqDetailForCustomerOrAdmin(db, rfqId)!;
}

export function getRfqDetailForCustomerOrAdmin(db: DatabaseSync, rfqId: string): RfqRequest | null {
  const row = db
    .prepare(
      `SELECT r.*, u.name AS customer_name, c.name_ar AS cat_name_ar, c.name_en AS cat_name_en
       FROM rfq_requests r
       LEFT JOIN users u ON u.id = r.user_id
       LEFT JOIN vendor_categories c ON c.slug = r.category_slug
       WHERE r.id = ?`,
    )
    .get(rfqId) as Record<string, unknown> | undefined;
  if (!row) return null;

  const invitations = (
    db
      .prepare(
        `SELECT ri.*, v.slug AS vendor_slug, v.business_name_ar AS vendor_name_ar,
                v.business_name_en AS vendor_name_en, v.verification_status
         FROM rfq_invitations ri
         JOIN vendors v ON v.id = ri.vendor_id
         WHERE ri.rfq_id = ?
         ORDER BY ri.invited_at ASC`,
      )
      .all(rfqId) as Record<string, unknown>[]
  ).map(mapRfqInvitationRow);

  const quotes = (
    db
      .prepare(
        `SELECT q.*, v.slug AS vendor_slug, v.business_name_ar AS vendor_name_ar,
                v.business_name_en AS vendor_name_en, v.verification_status, v.rating_avg, v.reviews_count
         FROM rfq_quotes q
         JOIN vendors v ON v.id = q.vendor_id
         WHERE q.rfq_id = ?
         ORDER BY CASE WHEN q.status = 'accepted' THEN 0 ELSE 1 END, q.quoted_amount_egp ASC`,
      )
      .all(rfqId) as Record<string, unknown>[]
  ).map(mapRfqQuoteRow);

  const messages = (
    db
      .prepare('SELECT * FROM rfq_messages WHERE rfq_id = ? ORDER BY created_at ASC')
      .all(rfqId) as Record<string, unknown>[]
  ).map(mapRfqMessageRow);

  return {
    ...mapRfqRow(row),
    invitationsCount: invitations.length,
    quotesCount: quotes.length,
    invitations,
    quotes,
    messages,
  };
}

export function listRfqsForCustomer(db: DatabaseSync, userId: string): RfqRequest[] {
  const rows = db
    .prepare(
      `SELECT r.*, u.name AS customer_name, c.name_ar AS cat_name_ar, c.name_en AS cat_name_en,
              (SELECT COUNT(*) FROM rfq_invitations ri WHERE ri.rfq_id = r.id) AS invitations_count,
              (SELECT COUNT(*) FROM rfq_quotes q WHERE q.rfq_id = r.id) AS quotes_count
       FROM rfq_requests r
       LEFT JOIN users u ON u.id = r.user_id
       LEFT JOIN vendor_categories c ON c.slug = r.category_slug
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
    )
    .all(userId) as Record<string, unknown>[];

  return rows.map((r) => getRfqDetailForCustomerOrAdmin(db, String(r.id))!);
}

export function listRfqsForVendor(db: DatabaseSync, vendorId: string): RfqRequest[] {
  const rows = db
    .prepare(
      `SELECT r.*, u.name AS customer_name, c.name_ar AS cat_name_ar, c.name_en AS cat_name_en
       FROM rfq_requests r
       JOIN rfq_invitations ri ON ri.rfq_id = r.id
       LEFT JOIN users u ON u.id = r.user_id
       LEFT JOIN vendor_categories c ON c.slug = r.category_slug
       WHERE ri.vendor_id = ?
       ORDER BY r.created_at DESC`,
    )
    .all(vendorId) as Record<string, unknown>[];

  return rows.map((row) => {
    const rfqId = String(row.id);
    // Strict competitive confidentiality: invited vendor sees ONLY their own invitation, own quote, and own messages!
    const myInv = db
      .prepare(
        `SELECT ri.*, v.slug AS vendor_slug, v.business_name_ar AS vendor_name_ar,
                v.business_name_en AS vendor_name_en, v.verification_status
         FROM rfq_invitations ri
         JOIN vendors v ON v.id = ri.vendor_id
         WHERE ri.rfq_id = ? AND ri.vendor_id = ?`,
      )
      .all(rfqId, vendorId) as Record<string, unknown>[];

    const myQuote = db
      .prepare(
        `SELECT q.*, v.slug AS vendor_slug, v.business_name_ar AS vendor_name_ar,
                v.business_name_en AS vendor_name_en, v.verification_status, v.rating_avg, v.reviews_count
         FROM rfq_quotes q
         JOIN vendors v ON v.id = q.vendor_id
         WHERE q.rfq_id = ? AND q.vendor_id = ?`,
      )
      .all(rfqId, vendorId) as Record<string, unknown>[];

    const myMessages = db
      .prepare('SELECT * FROM rfq_messages WHERE rfq_id = ? AND vendor_id = ? ORDER BY created_at ASC')
      .all(rfqId, vendorId) as Record<string, unknown>[];

    return {
      ...mapRfqRow(row),
      invitationsCount: myInv.length,
      quotesCount: myQuote.length,
      invitations: myInv.map(mapRfqInvitationRow),
      quotes: myQuote.map(mapRfqQuoteRow),
      messages: myMessages.map(mapRfqMessageRow),
    };
  });
}

export function getAuthorizedRfqForUser(
  db: DatabaseSync,
  user: User,
  rfqId: string,
  requestedVendorId?: string | null,
): { status: 'ok'; rfq: RfqRequest } | { status: 'not_found' } | { status: 'forbidden' } {
  const row = db.prepare('SELECT user_id FROM rfq_requests WHERE id = ?').get(rfqId) as
    | { user_id: string }
    | undefined;
  if (!row) return { status: 'not_found' };

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  if (row.user_id === user.id || isAdmin) {
    return { status: 'ok', rfq: getRfqDetailForCustomerOrAdmin(db, rfqId)! };
  }

  // Check if user owns an invited vendor for this RFQ
  const invitedOwnedVendor = db
    .prepare(
      `SELECT v.id
       FROM rfq_invitations ri
       JOIN vendors v ON v.id = ri.vendor_id
       WHERE ri.rfq_id = ? AND v.owner_user_id = ?
       ${requestedVendorId ? 'AND v.id = ?' : ''}
       LIMIT 1`,
    )
    .get(...(requestedVendorId ? [rfqId, user.id, requestedVendorId] : [rfqId, user.id])) as
    | { id: string }
    | undefined;

  if (!invitedOwnedVendor) {
    return { status: 'forbidden' };
  }

  const vendorScoped = listRfqsForVendor(db, invitedOwnedVendor.id).find((r) => r.id === rfqId);
  if (!vendorScoped) return { status: 'not_found' };
  return { status: 'ok', rfq: vendorScoped };
}

export function submitVendorRfqQuote(
  db: DatabaseSync,
  user: User,
  rfqId: string,
  vendorId: string,
  input: {
    quotedAmountEgp: number;
    depositAmountEgp: number;
    estimatedDuration: string;
    warrantyMonths: number;
    scopeSummary: string;
    termsNotes?: string | null;
    validUntil: string;
  },
): { quote: RfqQuote; rfq: RfqRequest } {
  const now = new Date().toISOString();
  const rfqRow = db.prepare('SELECT id, user_id, title, status FROM rfq_requests WHERE id = ?').get(rfqId) as
    | { id: string; user_id: string; title: string; status: string }
    | undefined;
  if (!rfqRow) {
    throw new Error('RFQ_NOT_FOUND');
  }
  if (rfqRow.status === 'accepted' || rfqRow.status === 'closed' || rfqRow.status === 'cancelled') {
    throw new Error('RFQ_CLOSED');
  }

  const vendor = getVendorDetailBySlugOrId(db, vendorId, false);
  if (!vendor) {
    throw new Error('VENDOR_NOT_FOUND');
  }

  const inv = db
    .prepare('SELECT id FROM rfq_invitations WHERE rfq_id = ? AND vendor_id = ?')
    .get(rfqId, vendor.id) as { id: string } | undefined;
  if (!inv) {
    throw new Error('VENDOR_NOT_INVITED');
  }

  const existingQuote = db
    .prepare('SELECT id FROM rfq_quotes WHERE rfq_id = ? AND vendor_id = ?')
    .get(rfqId, vendor.id) as { id: string } | undefined;
  const quoteId = existingQuote?.id || `rfqq-${crypto.randomUUID().slice(0, 10)}`;

  db.exec('BEGIN;');
  try {
    if (existingQuote) {
      db.prepare(
        `UPDATE rfq_quotes SET
          quoted_amount_egp = ?,
          deposit_amount_egp = ?,
          estimated_duration = ?,
          warranty_months = ?,
          scope_summary = ?,
          terms_notes = ?,
          valid_until = ?,
          status = 'submitted',
          updated_at = ?
         WHERE id = ?`,
      ).run(
        input.quotedAmountEgp,
        input.depositAmountEgp,
        input.estimatedDuration,
        input.warrantyMonths,
        input.scopeSummary,
        input.termsNotes ?? null,
        input.validUntil,
        now,
        quoteId,
      );
    } else {
      db.prepare(
        `INSERT INTO rfq_quotes
           (id, rfq_id, vendor_id, quoted_amount_egp, deposit_amount_egp, estimated_duration, warranty_months, scope_summary, terms_notes, valid_until, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
      ).run(
        quoteId,
        rfqId,
        vendor.id,
        input.quotedAmountEgp,
        input.depositAmountEgp,
        input.estimatedDuration,
        input.warrantyMonths,
        input.scopeSummary,
        input.termsNotes ?? null,
        input.validUntil,
        now,
        now,
      );
    }

    db.prepare("UPDATE rfq_invitations SET status = 'quoted' WHERE id = ?").run(inv.id);
    if (rfqRow.status === 'open') {
      db.prepare("UPDATE rfq_requests SET status = 'quoted', updated_at = ? WHERE id = ?").run(now, rfqId);
    }

    // Advance vendor CRM lead -> quotation_sent
    const leadRow = db
      .prepare('SELECT id, stage FROM vendor_leads WHERE vendor_id = ? AND rfq_id = ?')
      .get(vendor.id, rfqId) as { id: string; stage: VendorLeadStage } | undefined;
    if (leadRow) {
      if (leadRow.stage === 'new_lead' || leadRow.stage === 'contacted') {
        db.prepare(
          "UPDATE vendor_leads SET stage = 'quotation_sent', estimated_value_egp = ?, updated_at = ? WHERE id = ?",
        ).run(input.quotedAmountEgp, now, leadRow.id);
      } else {
        db.prepare('UPDATE vendor_leads SET estimated_value_egp = ?, updated_at = ? WHERE id = ?').run(
          input.quotedAmountEgp,
          now,
          leadRow.id,
        );
      }
      db.prepare(
        `INSERT INTO lead_activities (id, lead_id, actor_user_id, activity_type, note, created_at)
         VALUES (?, ?, ?, 'quote_sent', ?, ?)`,
      ).run(
        `lact-${crypto.randomUUID().slice(0, 10)}`,
        leadRow.id,
        user.id,
        `تم إرسال عرض سعر بقيمة ${input.quotedAmountEgp.toLocaleString()} ج.م (مدة ${input.estimatedDuration})`,
        now,
      );
    }

    if (rfqRow.user_id !== user.id) {
      addUserNotification(db, {
        userId: rfqRow.user_id,
        notifType: 'system',
        titleAr: `عرض سعر جديد على "${rfqRow.title}"`,
        titleEn: `New Quote Received for "${rfqRow.title}"`,
        bodyAr: `قدم ${vendor.businessNameAr} عرض سعر بقيمة ${input.quotedAmountEgp.toLocaleString()} ج.م. قارن العروض في مركز التسعير.`,
        bodyEn: `${vendor.businessNameEn} submitted a ${input.quotedAmountEgp.toLocaleString()} EGP quote. Compare & decide in RFQ Center.`,
        linkPath: '/rfq',
      });
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  const scopedRfq = listRfqsForVendor(db, vendor.id).find((r) => r.id === rfqId)!;
  const quoteRow = db
    .prepare(
      `SELECT q.*, v.slug AS vendor_slug, v.business_name_ar AS vendor_name_ar,
              v.business_name_en AS vendor_name_en, v.verification_status, v.rating_avg, v.reviews_count
       FROM rfq_quotes q JOIN vendors v ON v.id = q.vendor_id WHERE q.id = ?`,
    )
    .get(quoteId) as Record<string, unknown>;
  return { quote: mapRfqQuoteRow(quoteRow), rfq: scopedRfq };
}

export function decideRfqQuote(
  db: DatabaseSync,
  user: User,
  rfqId: string,
  quoteId: string,
  input: { decision: 'accept' | 'reject'; customerDecisionNote?: string | null; linkToBudget: boolean },
): { rfq: RfqRequest; linkedBudgetExpenseId: string | null } {
  const now = new Date().toISOString();
  const rfqRow = db.prepare('SELECT * FROM rfq_requests WHERE id = ?').get(rfqId) as
    | Record<string, unknown>
    | undefined;
  if (!rfqRow) throw new Error('RFQ_NOT_FOUND');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  if (String(rfqRow.user_id) !== user.id && !isAdmin) {
    throw new Error('FORBIDDEN');
  }

  const quoteRow = db
    .prepare(
      `SELECT q.*, v.owner_user_id AS vendor_owner_id, v.business_name_ar AS vendor_name_ar, v.business_name_en AS vendor_name_en
       FROM rfq_quotes q JOIN vendors v ON v.id = q.vendor_id
       WHERE q.id = ? AND q.rfq_id = ?`,
    )
    .get(quoteId, rfqId) as Record<string, unknown> | undefined;
  if (!quoteRow) throw new Error('QUOTE_NOT_FOUND');

  if (
    input.decision === 'accept' &&
    String(rfqRow.status) === 'accepted' &&
    rfqRow.accepted_quote_id &&
    String(rfqRow.accepted_quote_id) !== quoteId
  ) {
    throw new Error('RFQ_ALREADY_ACCEPTED');
  }

  let linkedBudgetExpenseId: string | null = quoteRow.linked_budget_expense_id
    ? String(quoteRow.linked_budget_expense_id)
    : null;

  db.exec('BEGIN;');
  try {
    if (input.decision === 'reject') {
      db.prepare(
        `UPDATE rfq_quotes SET status = 'rejected', customer_decision_note = ?, updated_at = ? WHERE id = ?`,
      ).run(input.customerDecisionNote ?? null, now, quoteId);

      const leadRow = db
        .prepare('SELECT id FROM vendor_leads WHERE vendor_id = ? AND rfq_id = ?')
        .get(String(quoteRow.vendor_id), rfqId) as { id: string } | undefined;
      if (leadRow) {
        db.prepare("UPDATE vendor_leads SET stage = 'lost', loss_reason = ?, updated_at = ? WHERE id = ?").run(
          input.customerDecisionNote || 'رفض العميل عرض السعر',
          now,
          leadRow.id,
        );
      }
    } else {
      // Accept chosen quote, close others, sync Wedding Budget Manager
      if (input.linkToBudget) {
        const rfqOwnerId = String(rfqRow.user_id);
        const plan = ensureUserBudgetPlan(db, rfqOwnerId);
        const { budgetSlug, paidBySide } = mapCategoryToBudgetBucket(String(rfqRow.category_slug));
        const budgetCat = db
          .prepare('SELECT id FROM budget_categories WHERE user_id = ? AND slug = ?')
          .get(rfqOwnerId, budgetSlug) as { id: string } | undefined;
        const fallbackCat = db
          .prepare('SELECT id FROM budget_categories WHERE user_id = ? ORDER BY sort_order ASC LIMIT 1')
          .get(rfqOwnerId) as { id: string } | undefined;
        const targetCatId = budgetCat?.id || fallbackCat?.id;
        if (targetCatId) {
          const synced = upsertBudgetExpenseFromSource(db, {
            userId: rfqOwnerId,
            budgetPlanId: plan.id,
            categoryId: targetCatId,
            title: `اعتماد عرض سعر: ${String(rfqRow.title)}`,
            vendorOrPayee: String(quoteRow.vendor_name_ar),
            amount: Number(quoteRow.quoted_amount_egp),
            paymentType: Number(quoteRow.deposit_amount_egp ?? 0) > 0 ? 'deposit' : 'full',
            status: 'upcoming',
            paidBySide,
            dueDate: rfqRow.desired_date ? String(rfqRow.desired_date) : null,
            sourceType: 'rfq_quote',
            sourceId: rfqId,
            notes: `مرتبط تلقائياً بعرض السعر المقبول #${quoteId} (${String(quoteRow.estimated_duration)})`,
          });
          linkedBudgetExpenseId = synced.id;
        }
      }

      db.prepare(
        `UPDATE rfq_quotes SET status = 'accepted', customer_decision_note = ?, linked_budget_expense_id = ?, updated_at = ? WHERE id = ?`,
      ).run(input.customerDecisionNote ?? null, linkedBudgetExpenseId, now, quoteId);

      db.prepare(
        `UPDATE rfq_quotes SET status = 'rejected', customer_decision_note = COALESCE(customer_decision_note, 'اختار العميل عرضاً آخر'), updated_at = ?
         WHERE rfq_id = ? AND id != ? AND status = 'submitted'`,
      ).run(now, rfqId, quoteId);

      db.prepare(
        `UPDATE rfq_requests SET status = 'accepted', accepted_quote_id = ?, updated_at = ? WHERE id = ?`,
      ).run(quoteId, now, rfqId);

      // Update winning vendor CRM lead -> accepted + activity
      const winningVendorId = String(quoteRow.vendor_id);
      const winLead = db
        .prepare('SELECT id FROM vendor_leads WHERE vendor_id = ? AND rfq_id = ?')
        .get(winningVendorId, rfqId) as { id: string } | undefined;
      if (winLead) {
        db.prepare(
          "UPDATE vendor_leads SET stage = 'accepted', estimated_value_egp = ?, updated_at = ? WHERE id = ?",
        ).run(Number(quoteRow.quoted_amount_egp), now, winLead.id);
        db.prepare(
          `INSERT INTO lead_activities (id, lead_id, actor_user_id, activity_type, note, created_at)
           VALUES (?, ?, ?, 'budget_accepted', ?, ?)`,
        ).run(
          `lact-${crypto.randomUUID().slice(0, 10)}`,
          winLead.id,
          user.id,
          `قبل العميل العرض (${Number(quoteRow.quoted_amount_egp).toLocaleString()} ج.م) وتم ربطه بميزانية الزواج`,
          now,
        );
      }

      // Mark losing open leads as lost cleanly
      db.prepare(
        `UPDATE vendor_leads SET stage = 'lost', loss_reason = 'تم ترسية الطلب لمزود آخر', updated_at = ?
         WHERE rfq_id = ? AND vendor_id != ? AND stage IN ('new_lead', 'contacted', 'quotation_sent', 'negotiation')`,
      ).run(now, rfqId, winningVendorId);

      const vendorOwnerId = String(quoteRow.vendor_owner_id);
      if (vendorOwnerId && vendorOwnerId !== user.id) {
        addUserNotification(db, {
          userId: vendorOwnerId,
          notifType: 'approval',
          titleAr: `تهانينا! تم قبول عرض السعر على "${String(rfqRow.title)}"`,
          titleEn: `Quote Accepted for "${String(rfqRow.title)}"!`,
          bodyAr: `اعتمد العميل عرضك بقيمة ${Number(quoteRow.quoted_amount_egp).toLocaleString()} ج.م وانتقل الملف لمرحلة Accepted في CRM.`,
          bodyEn: `Your ${Number(quoteRow.quoted_amount_egp).toLocaleString()} EGP offer was accepted and moved to Accepted in Vendor CRM.`,
          linkPath: '/vendor',
        });
      }
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return {
    rfq: getRfqDetailForCustomerOrAdmin(db, rfqId)!,
    linkedBudgetExpenseId,
  };
}

export function postRfqMessage(
  db: DatabaseSync,
  user: User,
  rfqId: string,
  input: { body: string; vendorId?: string },
): { message: RfqMessage; rfq: RfqRequest } {
  const rfqRow = db.prepare('SELECT id, user_id, title, target_vendor_id FROM rfq_requests WHERE id = ?').get(rfqId) as
    | { id: string; user_id: string; title: string; target_vendor_id: string | null }
    | undefined;
  if (!rfqRow) throw new Error('RFQ_NOT_FOUND');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isCustomerOwner = rfqRow.user_id === user.id;

  let scopedVendorId: string | null = input.vendorId ?? null;
  let senderRole: 'customer' | 'vendor' | 'admin' = 'customer';

  if (isCustomerOwner) {
    senderRole = 'customer';
    if (!scopedVendorId) {
      const firstInv = db
        .prepare('SELECT vendor_id FROM rfq_invitations WHERE rfq_id = ? ORDER BY invited_at ASC LIMIT 1')
        .get(rfqId) as { vendor_id: string } | undefined;
      scopedVendorId = rfqRow.target_vendor_id || firstInv?.vendor_id || null;
    } else {
      const invCheck = db
        .prepare('SELECT id FROM rfq_invitations WHERE rfq_id = ? AND vendor_id = ?')
        .get(rfqId, scopedVendorId);
      if (!invCheck) throw new Error('VENDOR_NOT_INVITED');
    }
  } else {
    // Must be an invited vendor owner OR admin
    const invitedOwned = db
      .prepare(
        `SELECT v.id, v.owner_user_id FROM rfq_invitations ri JOIN vendors v ON v.id = ri.vendor_id
         WHERE ri.rfq_id = ? AND v.owner_user_id = ? ${scopedVendorId ? 'AND v.id = ?' : ''} LIMIT 1`,
      )
      .get(...(scopedVendorId ? [rfqId, user.id, scopedVendorId] : [rfqId, user.id])) as
      | { id: string; owner_user_id: string }
      | undefined;

    if (invitedOwned) {
      senderRole = 'vendor';
      scopedVendorId = invitedOwned.id;
    } else if (isAdmin) {
      senderRole = 'admin';
    } else {
      throw new Error('FORBIDDEN');
    }
  }

  const msgId = `rfqm-${crypto.randomUUID().slice(0, 10)}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO rfq_messages (id, rfq_id, sender_user_id, sender_role, sender_name, vendor_id, body, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(msgId, rfqId, user.id, senderRole, user.name, scopedVendorId, input.body, now);

  if (senderRole === 'vendor' && rfqRow.user_id !== user.id) {
    addUserNotification(db, {
      userId: rfqRow.user_id,
      notifType: 'system',
      titleAr: `رسالة جديدة حول "${rfqRow.title}"`,
      titleEn: `New RFQ Reply on "${rfqRow.title}"`,
      bodyAr: input.body.slice(0, 120),
      bodyEn: input.body.slice(0, 120),
      linkPath: '/rfq',
    });
  } else if (senderRole === 'customer' && scopedVendorId) {
    const vRow = db.prepare('SELECT owner_user_id FROM vendors WHERE id = ?').get(scopedVendorId) as
      | { owner_user_id: string }
      | undefined;
    if (vRow && vRow.owner_user_id !== user.id) {
      addUserNotification(db, {
        userId: vRow.owner_user_id,
        notifType: 'system',
        titleAr: `استفسار عميل على طلب "${rfqRow.title}"`,
        titleEn: `Customer Inquiry on RFQ "${rfqRow.title}"`,
        bodyAr: input.body.slice(0, 120),
        bodyEn: input.body.slice(0, 120),
        linkPath: '/vendor',
      });
    }
  }

  const authView = getAuthorizedRfqForUser(db, user, rfqId, scopedVendorId);
  const msgRow = db.prepare('SELECT * FROM rfq_messages WHERE id = ?').get(msgId) as Record<string, unknown>;
  return {
    message: mapRfqMessageRow(msgRow),
    rfq: authView.status === 'ok' ? authView.rfq : getRfqDetailForCustomerOrAdmin(db, rfqId)!,
  };
}

export function createMarketplaceAppointment(
  db: DatabaseSync,
  user: User,
  input: {
    vendorId: string;
    serviceId?: string | null;
    rfqId?: string | null;
    appointmentType: MarketplaceAppointmentType;
    slotDate: string;
    slotTime: string;
    durationMinutes: number;
    customerPhone: string;
    customerNotes?: string | null;
  },
): MarketplaceAppointment {
  const vendor = getVendorDetailBySlugOrId(db, input.vendorId, false);
  if (!vendor || vendor.verificationStatus === 'rejected') {
    throw new Error('VENDOR_NOT_FOUND');
  }

  const aptId = `mapt-${crypto.randomUUID().slice(0, 10)}`;
  const now = new Date().toISOString();

  db.exec('BEGIN;');
  try {
    db.prepare(
      `INSERT INTO appointments
         (id, user_id, vendor_id, service_id, rfq_id, appointment_type, slot_date, slot_time, duration_minutes, customer_phone, customer_notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', ?, ?)`,
    ).run(
      aptId,
      user.id,
      vendor.id,
      input.serviceId ?? null,
      input.rfqId ?? null,
      input.appointmentType,
      input.slotDate,
      input.slotTime,
      input.durationMinutes,
      input.customerPhone,
      input.customerNotes ?? null,
      now,
      now,
    );

    ensureVendorLeadFromSource(db, {
      vendorId: vendor.id,
      customerUserId: user.id,
      customerName: user.name,
      customerPhone: input.customerPhone,
      appointmentId: aptId,
      rfqId: input.rfqId ?? null,
      leadSource: 'appointment',
      title: `حجز موعد (${input.appointmentType}) — ${input.slotDate} ${input.slotTime}`,
      estimatedValueEgp: vendor.startingPriceEgp || 0,
      actorUserId: user.id,
      activityNote: `طلب موعد جديد بتاريخ ${input.slotDate} الساعة ${input.slotTime}`,
    });

    if (vendor.ownerUserId !== user.id) {
      addUserNotification(db, {
        userId: vendor.ownerUserId,
        notifType: 'reminder',
        titleAr: `طلب حجز موعد جديد (${input.slotDate} ${input.slotTime})`,
        titleEn: `New Appointment Request (${input.slotDate} ${input.slotTime})`,
        bodyAr: `طلب ${user.name} حجز موعد لدى ${vendor.businessNameAr}. يرجى التأكيد أو اقتراح بديل من بوابة الشريك.`,
        bodyEn: `${user.name} requested a slot with ${vendor.businessNameEn}. Confirm or reschedule inside Vendor Portal.`,
        linkPath: '/vendor',
      });
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return getMarketplaceAppointmentById(db, aptId)!;
}

export function getMarketplaceAppointmentById(
  db: DatabaseSync,
  aptId: string,
): MarketplaceAppointment | null {
  const row = db
    .prepare(
      `SELECT a.*, u.name AS customer_name,
              v.slug AS vendor_slug, v.business_name_ar AS vendor_name_ar, v.business_name_en AS vendor_name_en,
              v.phone AS vendor_phone, v.verification_status,
              vs.title_ar AS service_title_ar, vs.title_en AS service_title_en
       FROM appointments a
       LEFT JOIN users u ON u.id = a.user_id
       JOIN vendors v ON v.id = a.vendor_id
       LEFT JOIN vendor_services vs ON vs.id = a.service_id
       WHERE a.id = ?`,
    )
    .get(aptId) as Record<string, unknown> | undefined;
  return row ? mapAppointmentRow(row) : null;
}

export function listCustomerMarketplaceAppointments(
  db: DatabaseSync,
  userId: string,
): MarketplaceAppointment[] {
  const rows = db
    .prepare(
      `SELECT a.*, u.name AS customer_name,
              v.slug AS vendor_slug, v.business_name_ar AS vendor_name_ar, v.business_name_en AS vendor_name_en,
              v.phone AS vendor_phone, v.verification_status,
              vs.title_ar AS service_title_ar, vs.title_en AS service_title_en
       FROM appointments a
       LEFT JOIN users u ON u.id = a.user_id
       JOIN vendors v ON v.id = a.vendor_id
       LEFT JOIN vendor_services vs ON vs.id = a.service_id
       WHERE a.user_id = ?
       ORDER BY a.slot_date ASC, a.slot_time ASC`,
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map(mapAppointmentRow);
}

export function listVendorMarketplaceAppointments(
  db: DatabaseSync,
  vendorId: string,
): MarketplaceAppointment[] {
  const rows = db
    .prepare(
      `SELECT a.*, u.name AS customer_name,
              v.slug AS vendor_slug, v.business_name_ar AS vendor_name_ar, v.business_name_en AS vendor_name_en,
              v.phone AS vendor_phone, v.verification_status,
              vs.title_ar AS service_title_ar, vs.title_en AS service_title_en
       FROM appointments a
       LEFT JOIN users u ON u.id = a.user_id
       JOIN vendors v ON v.id = a.vendor_id
       LEFT JOIN vendor_services vs ON vs.id = a.service_id
       WHERE a.vendor_id = ?
       ORDER BY a.slot_date ASC, a.slot_time ASC`,
    )
    .all(vendorId) as Record<string, unknown>[];
  return rows.map(mapAppointmentRow);
}

export function patchMarketplaceAppointment(
  db: DatabaseSync,
  user: User,
  aptId: string,
  input: {
    status?: MarketplaceAppointmentStatus;
    slotDate?: string;
    slotTime?: string;
    customerNotes?: string | null;
    vendorResponseNote?: string | null;
  },
): MarketplaceAppointment {
  const row = db
    .prepare(
      `SELECT a.*, v.owner_user_id AS vendor_owner_id, v.business_name_ar AS vendor_name_ar, v.business_name_en AS vendor_name_en
       FROM appointments a JOIN vendors v ON v.id = a.vendor_id WHERE a.id = ?`,
    )
    .get(aptId) as Record<string, unknown> | undefined;
  if (!row) throw new Error('APPOINTMENT_NOT_FOUND');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isVendorOwner = String(row.vendor_owner_id) === user.id;
  const isCustomerOwner = String(row.user_id) === user.id;

  if (!isCustomerOwner && !isVendorOwner && !isAdmin) {
    throw new Error('FORBIDDEN');
  }

  let nextStatus = input.status ?? (String(row.status) as MarketplaceAppointmentStatus);
  const now = new Date().toISOString();

  // Enforce strict role separation on status transitions:
  if (isCustomerOwner && !isVendorOwner && !isAdmin) {
    if (nextStatus === 'confirmed' || nextStatus === 'completed') {
      throw new Error('CUSTOMER_CANNOT_CONFIRM');
    }
    if ((input.slotDate || input.slotTime) && nextStatus !== 'cancelled') {
      // Customer proposing a new slot always resets status to 'requested' until vendor confirms
      nextStatus = 'requested';
    }
  }

  const confirmedAt =
    nextStatus === 'confirmed'
      ? (row.confirmed_at ? String(row.confirmed_at) : now)
      : row.confirmed_at
        ? String(row.confirmed_at)
        : null;

  db.prepare(
    `UPDATE appointments SET
      status = ?,
      slot_date = COALESCE(?, slot_date),
      slot_time = COALESCE(?, slot_time),
      customer_notes = CASE WHEN ? IS NOT NULL THEN ? ELSE customer_notes END,
      vendor_response_note = CASE WHEN ? IS NOT NULL THEN ? ELSE vendor_response_note END,
      confirmed_at = ?,
      updated_at = ?
     WHERE id = ?`,
  ).run(
    nextStatus,
    input.slotDate ?? null,
    input.slotTime ?? null,
    input.customerNotes === undefined ? null : 'set',
    input.customerNotes ?? null,
    input.vendorResponseNote === undefined ? null : 'set',
    input.vendorResponseNote ?? null,
    confirmedAt,
    now,
    aptId,
  );

  // Sync CRM activity & notify customer if vendor acted
  if (isVendorOwner || isAdmin) {
    const leadRow = db
      .prepare('SELECT id FROM vendor_leads WHERE vendor_id = ? AND appointment_id = ?')
      .get(String(row.vendor_id), aptId) as { id: string } | undefined;
    if (leadRow) {
      db.prepare(
        `INSERT INTO lead_activities (id, lead_id, actor_user_id, activity_type, note, created_at)
         VALUES (?, ?, ?, 'appointment', ?, ?)`,
      ).run(
        `lact-${crypto.randomUUID().slice(0, 10)}`,
        leadRow.id,
        user.id,
        `تحديث حالة الموعد إلى "${nextStatus}" ${input.vendorResponseNote ? `— ${input.vendorResponseNote}` : ''}`,
        now,
      );
      if (nextStatus === 'confirmed') {
        db.prepare(
          "UPDATE vendor_leads SET stage = CASE WHEN stage = 'new_lead' THEN 'contacted' ELSE stage END, updated_at = ? WHERE id = ?",
        ).run(now, leadRow.id);
      }
    }

    if (String(row.user_id) !== user.id) {
      addUserNotification(db, {
        userId: String(row.user_id),
        notifType: 'reminder',
        titleAr: `تحديث موعدك لدى ${String(row.vendor_name_ar)}: ${nextStatus}`,
        titleEn: `Appointment Update from ${String(row.vendor_name_en)}: ${nextStatus}`,
        bodyAr: `الموعد: ${input.slotDate || String(row.slot_date)} ${input.slotTime || String(row.slot_time)}${input.vendorResponseNote ? ` — ${input.vendorResponseNote}` : ''}`,
        bodyEn: `Slot: ${input.slotDate || String(row.slot_date)} ${input.slotTime || String(row.slot_time)}${input.vendorResponseNote ? ` — ${input.vendorResponseNote}` : ''}`,
        linkPath: '/rfq',
      });
    }
  }

  return getMarketplaceAppointmentById(db, aptId)!;
}

export function buildVendorCrmOverview(db: DatabaseSync, vendor: VendorListing): VendorCrmOverviewPayload {
  const leadRows = db
    .prepare('SELECT * FROM vendor_leads WHERE vendor_id = ? ORDER BY updated_at DESC, created_at DESC')
    .all(vendor.id) as Record<string, unknown>[];

  const actStmt = db.prepare(
    `SELECT la.*, u.name AS actor_name
     FROM lead_activities la
     LEFT JOIN users u ON u.id = la.actor_user_id
     WHERE la.lead_id = ?
     ORDER BY la.created_at DESC`,
  );

  const leads: VendorLead[] = leadRows.map((lr) => {
    const activities = (actStmt.all(String(lr.id)) as Record<string, unknown>[]).map(
      mapVendorLeadActivityRow,
    );
    return { ...mapVendorLeadRow(lr), activities };
  });

  const stageCounts: Record<VendorLeadStage, number> = {
    new_lead: 0,
    contacted: 0,
    quotation_sent: 0,
    negotiation: 0,
    accepted: 0,
    in_progress: 0,
    completed: 0,
    lost: 0,
  };
  let pipelineValueEgp = 0;
  let wonValueEgp = 0;

  for (const lead of leads) {
    stageCounts[lead.stage] = (stageCounts[lead.stage] ?? 0) + 1;
    if (lead.stage !== 'lost') {
      pipelineValueEgp += lead.estimatedValueEgp;
    }
    if (lead.stage === 'accepted' || lead.stage === 'in_progress' || lead.stage === 'completed') {
      wonValueEgp += lead.estimatedValueEgp;
    }
  }

  return {
    vendor,
    leads,
    rfqs: listRfqsForVendor(db, vendor.id),
    appointments: listVendorMarketplaceAppointments(db, vendor.id),
    stageCounts,
    pipelineValueEgp,
    wonValueEgp,
  };
}

export function createManualVendorLead(
  db: DatabaseSync,
  user: User,
  vendorId: string,
  input: {
    customerName: string;
    customerPhone?: string | null;
    title: string;
    stage: VendorLeadStage;
    estimatedValueEgp: number;
    nextFollowUpDate?: string | null;
  },
): VendorLead {
  const id = `vlead-${crypto.randomUUID().slice(0, 10)}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO vendor_leads
       (id, vendor_id, lead_source, customer_name, customer_phone, title, stage, estimated_value_egp, next_follow_up_date, created_at, updated_at)
     VALUES (?, ?, 'manual', ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    vendorId,
    input.customerName,
    input.customerPhone ?? null,
    input.title,
    input.stage,
    input.estimatedValueEgp,
    input.nextFollowUpDate ?? null,
    now,
    now,
  );
  db.prepare(
    `INSERT INTO lead_activities (id, lead_id, actor_user_id, activity_type, note, created_at)
     VALUES (?, ?, ?, 'note', 'تمت إضافة عميل محتمل جديد يدوياً من لوحة CRM', ?)`,
  ).run(`lact-${crypto.randomUUID().slice(0, 10)}`, id, user.id, now);

  const row = db.prepare('SELECT * FROM vendor_leads WHERE id = ?').get(id) as Record<string, unknown>;
  const acts = (
    db
      .prepare(
        `SELECT la.*, u.name AS actor_name FROM lead_activities la LEFT JOIN users u ON u.id = la.actor_user_id WHERE la.lead_id = ? ORDER BY la.created_at DESC`,
      )
      .all(id) as Record<string, unknown>[]
  ).map(mapVendorLeadActivityRow);
  return { ...mapVendorLeadRow(row), activities: acts };
}

export function patchVendorLead(
  db: DatabaseSync,
  user: User,
  vendorId: string,
  leadId: string,
  input: {
    stage?: VendorLeadStage;
    estimatedValueEgp?: number;
    nextFollowUpDate?: string | null;
    lossReason?: string | null;
  },
): VendorLead | null {
  const row = db
    .prepare('SELECT * FROM vendor_leads WHERE id = ? AND vendor_id = ?')
    .get(leadId, vendorId) as Record<string, unknown> | undefined;
  if (!row) return null;

  const prevStage = String(row.stage) as VendorLeadStage;
  const nextStage = input.stage ?? prevStage;
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE vendor_leads SET
      stage = ?,
      estimated_value_egp = COALESCE(?, estimated_value_egp),
      next_follow_up_date = CASE WHEN ? IS NOT NULL THEN ? ELSE next_follow_up_date END,
      loss_reason = CASE WHEN ? IS NOT NULL THEN ? ELSE loss_reason END,
      updated_at = ?
     WHERE id = ? AND vendor_id = ?`,
  ).run(
    nextStage,
    input.estimatedValueEgp ?? null,
    input.nextFollowUpDate === undefined ? null : 'set',
    input.nextFollowUpDate ?? null,
    input.lossReason === undefined ? null : 'set',
    input.lossReason ?? null,
    now,
    leadId,
    vendorId,
  );

  if (nextStage !== prevStage) {
    db.prepare(
      `INSERT INTO lead_activities (id, lead_id, actor_user_id, activity_type, note, created_at)
       VALUES (?, ?, ?, 'status_change', ?, ?)`,
    ).run(
      `lact-${crypto.randomUUID().slice(0, 10)}`,
      leadId,
      user.id,
      `انتقل العميل من "${prevStage}" إلى "${nextStage}"`,
      now,
    );
  }

  const updated = db.prepare('SELECT * FROM vendor_leads WHERE id = ?').get(leadId) as Record<string, unknown>;
  const acts = (
    db
      .prepare(
        `SELECT la.*, u.name AS actor_name FROM lead_activities la LEFT JOIN users u ON u.id = la.actor_user_id WHERE la.lead_id = ? ORDER BY la.created_at DESC`,
      )
      .all(leadId) as Record<string, unknown>[]
  ).map(mapVendorLeadActivityRow);
  return { ...mapVendorLeadRow(updated), activities: acts };
}

export function addVendorLeadActivity(
  db: DatabaseSync,
  user: User,
  vendorId: string,
  leadId: string,
  input: { activityType: 'note' | 'call' | 'quote_sent' | 'appointment'; note: string },
): VendorLeadActivity | null {
  const row = db
    .prepare('SELECT id FROM vendor_leads WHERE id = ? AND vendor_id = ?')
    .get(leadId, vendorId) as { id: string } | undefined;
  if (!row) return null;

  const actId = `lact-${crypto.randomUUID().slice(0, 10)}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO lead_activities (id, lead_id, actor_user_id, activity_type, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(actId, leadId, user.id, input.activityType, input.note, now);
  db.prepare('UPDATE vendor_leads SET updated_at = ? WHERE id = ?').run(now, leadId);

  const actRow = db
    .prepare(
      `SELECT la.*, u.name AS actor_name FROM lead_activities la LEFT JOIN users u ON u.id = la.actor_user_id WHERE la.id = ?`,
    )
    .get(actId) as Record<string, unknown>;
  return mapVendorLeadActivityRow(actRow);
}

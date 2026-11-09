import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { estimateFinishingRange } from '../shared/catalogMeta';
import type {
  LocalCategoryGuidePayload,
  LocationNode,
  SubscriptionPlan,
  SubscriptionPlanCode,
  User,
  VendorBillingRecord,
  VendorCategory,
  VendorListing,
  VendorPortalOverviewPayload,
  VendorPromotion,
  VendorReview,
  VendorServiceOffering,
  VendorVerificationStatus,
  WeddingServiceItem,
} from '../shared/types';

export function slugifyVendorName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  const suffix = crypto.randomUUID().slice(0, 5);
  return base ? `${base}-${suffix}` : `vendor-${suffix}`;
}

export function mapVendorCategoryRow(row: Record<string, unknown>): VendorCategory {
  return {
    id: String(row.id),
    slug: String(row.slug),
    domain: row.domain as VendorCategory['domain'],
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    summaryAr: String(row.summary_ar),
    summaryEn: String(row.summary_en),
    iconName: String(row.icon_name || 'Building2'),
    buyerChecklistAr: JSON.parse(String(row.buyer_checklist_ar_json || '[]')) as string[],
    buyerChecklistEn: JSON.parse(String(row.buyer_checklist_en_json || '[]')) as string[],
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapSubscriptionPlanRow(row: Record<string, unknown>): SubscriptionPlan {
  return {
    id: String(row.id),
    code: row.code as SubscriptionPlanCode,
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    monthlyPriceEgp: Number(row.monthly_price_egp ?? 0),
    annualPriceEgp: Number(row.annual_price_egp ?? 0),
    maxServices: Number(row.max_services ?? 3),
    maxPromotions: Number(row.max_promotions ?? 0),
    maxPortfolioItems: Number(row.max_portfolio_items ?? 4),
    leadPriorityBoost: Number(row.lead_priority_boost ?? 0),
    analyticsTier: (row.analytics_tier as SubscriptionPlan['analyticsTier']) || 'basic',
    featuresAr: JSON.parse(String(row.features_ar_json || '[]')) as string[],
    featuresEn: JSON.parse(String(row.features_en_json || '[]')) as string[],
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapVendorServiceRow(row: Record<string, unknown>): VendorServiceOffering {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    unitLabelAr: String(row.unit_label_ar),
    unitLabelEn: String(row.unit_label_en),
    startingPriceEgp: Number(row.starting_price_egp ?? 0),
    turnaroundDays: row.turnaround_days ? String(row.turnaround_days) : null,
    warrantyMonths: Number(row.warranty_months ?? 0),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at),
  };
}

export function mapVendorPromotionRow(row: Record<string, unknown>): VendorPromotion {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    discountPercent: Number(row.discount_percent ?? 0),
    promoCode: row.promo_code ? String(row.promo_code) : null,
    validUntil: String(row.valid_until),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
  };
}

export function mapVendorReviewRow(row: Record<string, unknown>): VendorReview {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    authorUserId: String(row.author_user_id),
    authorName: String(row.author_name),
    rating: Number(row.rating),
    title: String(row.title),
    comment: String(row.comment),
    isVerifiedProject: Boolean(row.is_verified_project),
    createdAt: String(row.created_at),
  };
}

export function mapVendorBillingRow(row: Record<string, unknown>): VendorBillingRecord {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    planId: String(row.plan_id),
    planCode: row.plan_code ? (String(row.plan_code) as SubscriptionPlanCode) : undefined,
    planNameAr: row.plan_name_ar ? String(row.plan_name_ar) : undefined,
    planNameEn: row.plan_name_en ? String(row.plan_name_en) : undefined,
    billingCycle: (row.billing_cycle as 'monthly' | 'annual') || 'monthly',
    amountEgp: Number(row.amount_egp ?? 0),
    status: (row.status as VendorBillingRecord['status']) || 'recorded',
    createdAt: String(row.created_at),
  };
}

export function mapVendorRow(
  row: Record<string, unknown>,
  catLookup?: Map<string, VendorCategory>,
  planLookup?: Map<string, SubscriptionPlan>,
): VendorListing {
  const catSlug = String(row.primary_category_slug);
  const planId = String(row.subscription_plan_id || 'plan_free');
  const cat = catLookup?.get(catSlug);
  const plan = planLookup?.get(planId);
  const inferredCode = plan?.code ?? (planId.replace('plan_', '') as SubscriptionPlanCode) ?? 'free';

  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id),
    slug: String(row.slug),
    businessNameAr: String(row.business_name_ar),
    businessNameEn: String(row.business_name_en),
    primaryCategorySlug: catSlug,
    categoryNameAr: row.cat_name_ar ? String(row.cat_name_ar) : cat?.nameAr,
    categoryNameEn: row.cat_name_en ? String(row.cat_name_en) : cat?.nameEn,
    extraCategorySlugs: JSON.parse(String(row.extra_category_slugs_json || '[]')) as string[],
    governorateSlug: String(row.governorate_slug),
    citySlug: row.city_slug ? String(row.city_slug) : null,
    serviceAreas: JSON.parse(String(row.service_areas_json || '[]')) as string[],
    addressAr: String(row.address_ar),
    addressEn: String(row.address_en),
    phone: String(row.phone),
    whatsapp: row.whatsapp ? String(row.whatsapp) : null,
    email: row.email ? String(row.email) : null,
    websiteUrl: row.website_url ? String(row.website_url) : null,
    bioAr: String(row.bio_ar),
    bioEn: String(row.bio_en),
    coverImage: String(row.cover_image),
    logoImage: row.logo_image ? String(row.logo_image) : null,
    portfolioImages: JSON.parse(String(row.portfolio_images_json || '[]')) as string[],
    priceTier: (row.price_tier as VendorListing['priceTier']) || 'mid',
    startingPriceEgp: Number(row.starting_price_egp ?? 0),
    yearsExperience: Number(row.years_experience ?? 1),
    verificationStatus: (row.verification_status as VendorVerificationStatus) || 'registered',
    verificationDocs: JSON.parse(String(row.verification_docs_json || '[]')) as string[],
    verificationNotes: row.verification_notes ? String(row.verification_notes) : null,
    verifiedAt: row.verified_at ? String(row.verified_at) : null,
    verifiedByUserId: row.verified_by_user_id ? String(row.verified_by_user_id) : null,
    subscriptionPlanId: planId,
    subscriptionPlanCode: row.plan_code ? (String(row.plan_code) as SubscriptionPlanCode) : inferredCode,
    subscriptionPlanNameAr: row.plan_name_ar ? String(row.plan_name_ar) : plan?.nameAr,
    subscriptionPlanNameEn: row.plan_name_en ? String(row.plan_name_en) : plan?.nameEn,
    commercialStatus: (row.commercial_status as VendorListing['commercialStatus']) || 'active',
    subscriptionStartedAt: row.subscription_started_at ? String(row.subscription_started_at) : null,
    subscriptionRenewsAt: row.subscription_renews_at ? String(row.subscription_renews_at) : null,
    ratingAvg: Number(row.rating_avg ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
    profileViews: Number(row.profile_views ?? 0),
    isFeaturedCommercial: Boolean(row.is_featured_commercial),
    isDemoData: Boolean(row.is_demo_data),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function listVendorCategories(db: DatabaseSync): VendorCategory[] {
  const rows = db
    .prepare('SELECT * FROM vendor_categories ORDER BY sort_order ASC')
    .all() as Record<string, unknown>[];
  return rows.map(mapVendorCategoryRow);
}

export function listSubscriptionPlans(db: DatabaseSync): SubscriptionPlan[] {
  const rows = db
    .prepare('SELECT * FROM subscription_plans ORDER BY sort_order ASC')
    .all() as Record<string, unknown>[];
  return rows.map(mapSubscriptionPlanRow);
}

export interface VendorListFilters {
  category?: string | null;
  domain?: string | null;
  governorate?: string | null;
  verification?: string | null;
  priceTier?: string | null;
  planCode?: string | null;
  q?: string | null;
  sort?: string | null;
  includeRejected?: boolean;
}

export function listVendors(db: DatabaseSync, filters: VendorListFilters = {}): VendorListing[] {
  const categories = listVendorCategories(db);
  const plans = listSubscriptionPlans(db);
  const catLookup = new Map(categories.map((c) => [c.slug, c]));
  const planLookup = new Map(plans.map((p) => [p.id, p]));

  const rows = db
    .prepare(
      `SELECT v.*, c.name_ar AS cat_name_ar, c.name_en AS cat_name_en,
              sp.code AS plan_code, sp.name_ar AS plan_name_ar, sp.name_en AS plan_name_en
       FROM vendors v
       LEFT JOIN vendor_categories c ON c.slug = v.primary_category_slug
       LEFT JOIN subscription_plans sp ON sp.id = v.subscription_plan_id
       ORDER BY v.is_featured_commercial DESC, v.created_at DESC`,
    )
    .all() as Record<string, unknown>[];

  let list = rows.map((r) => mapVendorRow(r, catLookup, planLookup));

  if (!filters.includeRejected) {
    list = list.filter((v) => v.verificationStatus !== 'rejected');
  }

  if (filters.category && filters.category !== 'all') {
    const catSlug = filters.category;
    list = list.filter(
      (v) => v.primaryCategorySlug === catSlug || v.extraCategorySlugs.includes(catSlug),
    );
  }

  if (filters.domain && filters.domain !== 'all') {
    const matchingSlugs = new Set(categories.filter((c) => c.domain === filters.domain).map((c) => c.slug));
    list = list.filter((v) => matchingSlugs.has(v.primaryCategorySlug));
  }

  if (filters.governorate && filters.governorate !== 'all' && filters.governorate !== 'egypt') {
    const g = filters.governorate;
    list = list.filter(
      (v) => v.governorateSlug === g || v.citySlug === g || v.serviceAreas.includes(g),
    );
  }

  if (filters.verification && filters.verification !== 'all') {
    list = list.filter((v) => v.verificationStatus === filters.verification);
  }

  if (filters.priceTier && filters.priceTier !== 'all') {
    list = list.filter((v) => v.priceTier === filters.priceTier);
  }

  if (filters.planCode && filters.planCode !== 'all') {
    list = list.filter((v) => v.subscriptionPlanCode === filters.planCode);
  }

  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim().toLowerCase();
    list = list.filter((v) =>
      `${v.businessNameAr} ${v.businessNameEn} ${v.bioAr} ${v.bioEn} ${v.addressAr} ${v.addressEn} ${v.categoryNameAr || ''} ${v.categoryNameEn || ''} ${v.governorateSlug}`
        .toLowerCase()
        .includes(q),
    );
  }

  const sort = filters.sort || 'verification_desc';
  const verifRank: Record<VendorVerificationStatus, number> = {
    trusted: 3,
    verified: 2,
    registered: 1,
    rejected: 0,
  };
  const planRank: Record<SubscriptionPlanCode, number> = {
    premium: 4,
    professional: 3,
    basic: 2,
    free: 1,
  };

  if (sort === 'price_asc') {
    list.sort((a, b) => a.startingPriceEgp - b.startingPriceEgp);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.startingPriceEgp - a.startingPriceEgp);
  } else if (sort === 'rating_desc') {
    list.sort((a, b) => {
      if (b.reviewsCount === 0 && a.reviewsCount === 0) {
        return verifRank[b.verificationStatus] - verifRank[a.verificationStatus];
      }
      return b.ratingAvg - a.ratingAvg || b.reviewsCount - a.reviewsCount;
    });
  } else if (sort === 'featured_commercial') {
    list.sort(
      (a, b) =>
        planRank[b.subscriptionPlanCode] - planRank[a.subscriptionPlanCode] ||
        verifRank[b.verificationStatus] - verifRank[a.verificationStatus],
    );
  } else {
    // verification_desc default: Trusted -> Verified -> Registered, then featured commercial tier
    list.sort(
      (a, b) =>
        verifRank[b.verificationStatus] - verifRank[a.verificationStatus] ||
        planRank[b.subscriptionPlanCode] - planRank[a.subscriptionPlanCode],
    );
  }

  return list;
}

export function getVendorDetailBySlugOrId(
  db: DatabaseSync,
  slugOrId: string,
  incrementView = false,
): VendorListing | null {
  const row = db
    .prepare(
      `SELECT v.*, c.name_ar AS cat_name_ar, c.name_en AS cat_name_en,
              sp.code AS plan_code, sp.name_ar AS plan_name_ar, sp.name_en AS plan_name_en
       FROM vendors v
       LEFT JOIN vendor_categories c ON c.slug = v.primary_category_slug
       LEFT JOIN subscription_plans sp ON sp.id = v.subscription_plan_id
       WHERE v.slug = ? OR v.id = ?`,
    )
    .get(slugOrId, slugOrId) as Record<string, unknown> | undefined;

  if (!row) return null;

  if (incrementView) {
    db.prepare('UPDATE vendors SET profile_views = profile_views + 1 WHERE id = ?').run(String(row.id));
    row.profile_views = Number(row.profile_views ?? 0) + 1;
  }

  const vendor = mapVendorRow(row);
  const services = (
    db
      .prepare('SELECT * FROM vendor_services WHERE vendor_id = ? ORDER BY sort_order ASC, created_at ASC')
      .all(vendor.id) as Record<string, unknown>[]
  ).map(mapVendorServiceRow);

  const promotions = (
    db
      .prepare('SELECT * FROM vendor_promotions WHERE vendor_id = ? AND is_active = 1 ORDER BY created_at DESC')
      .all(vendor.id) as Record<string, unknown>[]
  ).map(mapVendorPromotionRow);

  const reviews = (
    db
      .prepare('SELECT * FROM vendor_reviews WHERE vendor_id = ? ORDER BY created_at DESC')
      .all(vendor.id) as Record<string, unknown>[]
  ).map(mapVendorReviewRow);

  return {
    ...vendor,
    services,
    promotions,
    reviews,
  };
}

export function getVendorPortalOverview(
  db: DatabaseSync,
  user: User,
  requestedVendorId?: string | null,
): VendorPortalOverviewPayload {
  const allPlans = listSubscriptionPlans(db);
  let targetRow: Record<string, unknown> | undefined;

  if (requestedVendorId) {
    const candidate = db
      .prepare(
        `SELECT v.*, c.name_ar AS cat_name_ar, c.name_en AS cat_name_en,
                sp.code AS plan_code, sp.name_ar AS plan_name_ar, sp.name_en AS plan_name_en
         FROM vendors v
         LEFT JOIN vendor_categories c ON c.slug = v.primary_category_slug
         LEFT JOIN subscription_plans sp ON sp.id = v.subscription_plan_id
         WHERE v.id = ? OR v.slug = ?`,
      )
      .get(requestedVendorId, requestedVendorId) as Record<string, unknown> | undefined;
    if (
      candidate &&
      (String(candidate.owner_user_id) === user.id || user.role === 'admin' || user.role === 'super_admin')
    ) {
      targetRow = candidate;
    }
  }

  if (!targetRow) {
    targetRow = db
      .prepare(
        `SELECT v.*, c.name_ar AS cat_name_ar, c.name_en AS cat_name_en,
                sp.code AS plan_code, sp.name_ar AS plan_name_ar, sp.name_en AS plan_name_en
         FROM vendors v
         LEFT JOIN vendor_categories c ON c.slug = v.primary_category_slug
         LEFT JOIN subscription_plans sp ON sp.id = v.subscription_plan_id
         WHERE v.owner_user_id = ?
         ORDER BY CASE WHEN v.id = 'vnd-el-rowad' THEN 0 ELSE 1 END, v.created_at ASC
         LIMIT 1`,
      )
      .get(user.id) as Record<string, unknown> | undefined;
  }

  if (!targetRow) {
    return {
      vendor: null,
      plan: null,
      allPlans,
      services: [],
      promotions: [],
      reviews: [],
      billingRecords: [],
      quotas: {
        servicesUsed: 0,
        maxServices: 0,
        promotionsUsed: 0,
        maxPromotions: 0,
        portfolioUsed: 0,
        maxPortfolioItems: 0,
      },
    };
  }

  const vendor = mapVendorRow(targetRow);
  const plan = allPlans.find((p) => p.id === vendor.subscriptionPlanId) ?? allPlans[0] ?? null;

  const services = (
    db
      .prepare('SELECT * FROM vendor_services WHERE vendor_id = ? ORDER BY sort_order ASC, created_at ASC')
      .all(vendor.id) as Record<string, unknown>[]
  ).map(mapVendorServiceRow);

  const promotions = (
    db
      .prepare('SELECT * FROM vendor_promotions WHERE vendor_id = ? ORDER BY created_at DESC')
      .all(vendor.id) as Record<string, unknown>[]
  ).map(mapVendorPromotionRow);

  const reviews = (
    db
      .prepare('SELECT * FROM vendor_reviews WHERE vendor_id = ? ORDER BY created_at DESC')
      .all(vendor.id) as Record<string, unknown>[]
  ).map(mapVendorReviewRow);

  const billingRecords = (
    db
      .prepare(
        `SELECT b.*, sp.code AS plan_code, sp.name_ar AS plan_name_ar, sp.name_en AS plan_name_en
         FROM vendor_billing_records b
         LEFT JOIN subscription_plans sp ON sp.id = b.plan_id
         WHERE b.vendor_id = ?
         ORDER BY b.created_at DESC`,
      )
      .all(vendor.id) as Record<string, unknown>[]
  ).map(mapVendorBillingRow);

  return {
    vendor,
    plan,
    allPlans,
    services,
    promotions,
    reviews,
    billingRecords,
    quotas: {
      servicesUsed: services.length,
      maxServices: plan?.maxServices ?? 3,
      promotionsUsed: promotions.filter((p) => p.isActive).length,
      maxPromotions: plan?.maxPromotions ?? 0,
      portfolioUsed: vendor.portfolioImages.length,
      maxPortfolioItems: plan?.maxPortfolioItems ?? 4,
    },
  };
}

export function recalculateVendorReviewStats(db: DatabaseSync, vendorId: string): {
  ratingAvg: number;
  reviewsCount: number;
} {
  const agg = db
    .prepare(
      'SELECT COUNT(*) as cnt, COALESCE(AVG(rating), 0) as avg_rating FROM vendor_reviews WHERE vendor_id = ?',
    )
    .get(vendorId) as { cnt: number; avg_rating: number };

  const count = Number(agg.cnt ?? 0);
  const avg = count > 0 ? Math.round(Number(agg.avg_rating) * 10) / 10 : 0;

  db.prepare('UPDATE vendors SET rating_avg = ?, reviews_count = ?, updated_at = ? WHERE id = ?').run(
    avg,
    count,
    new Date().toISOString(),
    vendorId,
  );
  return { ratingAvg: avg, reviewsCount: count };
}

export function switchVendorSubscriptionPlan(
  db: DatabaseSync,
  vendorId: string,
  planCode: SubscriptionPlanCode,
  billingCycle: 'monthly' | 'annual',
): { vendor: VendorListing; billingRecord: VendorBillingRecord } {
  const planRow = db
    .prepare('SELECT * FROM subscription_plans WHERE code = ?')
    .get(planCode) as Record<string, unknown> | undefined;
  if (!planRow) {
    throw new Error('PLAN_NOT_FOUND');
  }
  const plan = mapSubscriptionPlanRow(planRow);
  const now = new Date();
  const nowIso = now.toISOString();
  const days = billingCycle === 'annual' ? 365 : 30;
  const renewsIso = new Date(now.getTime() + days * 86400000).toISOString();
  const amountEgp = billingCycle === 'annual' ? plan.annualPriceEgp : plan.monthlyPriceEgp;
  const isFeaturedCommercial = plan.leadPriorityBoost >= 10 ? 1 : 0;

  // STRICT INVARIANT: Commercial plan update NEVER modifies verification_status, verification_docs_json, or verified_by_user_id!
  db.prepare(
    `UPDATE vendors SET
      subscription_plan_id = ?,
      commercial_status = 'active',
      subscription_started_at = ?,
      subscription_renews_at = ?,
      is_featured_commercial = ?,
      updated_at = ?
     WHERE id = ?`,
  ).run(plan.id, nowIso, renewsIso, isFeaturedCommercial, nowIso, vendorId);

  const billId = `vbill-${crypto.randomUUID().slice(0, 10)}`;
  db.prepare(
    `INSERT INTO vendor_billing_records (id, vendor_id, plan_id, billing_cycle, amount_egp, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(billId, vendorId, plan.id, billingCycle, amountEgp, amountEgp === 0 ? 'paid' : 'recorded', nowIso);

  const updatedVendor = getVendorDetailBySlugOrId(db, vendorId, false)!;
  const billRow = db
    .prepare(
      `SELECT b.*, sp.code AS plan_code, sp.name_ar AS plan_name_ar, sp.name_en AS plan_name_en
       FROM vendor_billing_records b
       LEFT JOIN subscription_plans sp ON sp.id = b.plan_id
       WHERE b.id = ?`,
    )
    .get(billId) as Record<string, unknown>;

  return { vendor: updatedVendor, billingRecord: mapVendorBillingRow(billRow) };
}

export function adminUpdateVendorVerification(
  db: DatabaseSync,
  vendorId: string,
  adminUserId: string,
  input: {
    verificationStatus: VendorVerificationStatus;
    verificationDocs?: string[];
    verificationNotes?: string | null;
  },
): VendorListing | null {
  const existing = db.prepare('SELECT id, verification_docs_json FROM vendors WHERE id = ?').get(vendorId) as
    | { id: string; verification_docs_json: string }
    | undefined;
  if (!existing) return null;

  const nowIso = new Date().toISOString();
  const isPositiveVerif = input.verificationStatus === 'verified' || input.verificationStatus === 'trusted';
  const docsJson = input.verificationDocs
    ? JSON.stringify(input.verificationDocs)
    : existing.verification_docs_json;

  // STRICT INVARIANT: Admin verification ONLY touches verification columns, NEVER alters subscription_plan_id!
  db.prepare(
    `UPDATE vendors SET
      verification_status = ?,
      verification_docs_json = ?,
      verification_notes = ?,
      verified_at = ?,
      verified_by_user_id = ?,
      updated_at = ?
     WHERE id = ?`,
  ).run(
    input.verificationStatus,
    docsJson,
    input.verificationNotes ?? null,
    isPositiveVerif ? nowIso : null,
    isPositiveVerif ? adminUserId : null,
    nowIso,
    vendorId,
  );

  return getVendorDetailBySlugOrId(db, vendorId, false);
}

export function buildLocalCategoryGuide(
  db: DatabaseSync,
  govSlug: string,
  catSlug: string | null,
  mapLocationRow: (row: Record<string, unknown>) => LocationNode,
  mapWeddingServiceRow: (row: Record<string, unknown>) => WeddingServiceItem,
): LocalCategoryGuidePayload | null {
  const locRow = db.prepare('SELECT * FROM locations WHERE slug = ?').get(govSlug) as
    | Record<string, unknown>
    | undefined;
  if (!locRow) return null;

  const location = mapLocationRow(locRow);
  const parentRow = location.parentId
    ? (db.prepare('SELECT * FROM locations WHERE id = ?').get(location.parentId) as
        | Record<string, unknown>
        | undefined)
    : undefined;
  const parentLocation = parentRow ? mapLocationRow(parentRow) : null;

  const children = (
    db.prepare('SELECT * FROM locations WHERE parent_id = ? ORDER BY sort_order ASC').all(location.id) as Record<
      string,
      unknown
    >[]
  ).map(mapLocationRow);

  const allCategories = listVendorCategories(db);
  const category = catSlug ? allCategories.find((c) => c.slug === catSlug) ?? null : null;
  if (catSlug && !category) {
    return null;
  }

  // Collect matching slugs (exact location, parent if district/city/area, or child districts)
  const regionSlugs = new Set<string>([location.slug]);
  children.forEach((c) => regionSlugs.add(c.slug));

  const allVendors = listVendors(db, {
    category: category ? category.slug : 'all',
    includeRejected: false,
  });

  const matchedVendors =
    location.level === 'country'
      ? allVendors
      : allVendors.filter((v) => {
          if (regionSlugs.has(v.governorateSlug)) return true;
          if (v.citySlug && regionSlugs.has(v.citySlug)) return true;
          if (v.serviceAreas.some((sa) => regionSlugs.has(sa))) return true;
          if (parentLocation && parentLocation.level !== 'country' && v.governorateSlug === parentLocation.slug) {
            return true;
          }
          return false;
        });

  const allServices = (
    db.prepare('SELECT * FROM wedding_services ORDER BY rating DESC, created_at DESC').all() as Record<
      string,
      unknown
    >[]
  ).map(mapWeddingServiceRow);

  const matchedWeddingServices =
    location.level === 'country'
      ? allServices.slice(0, 6)
      : allServices.filter(
          (srv) =>
            srv.governorateSlug === location.slug ||
            (parentLocation && srv.governorateSlug === parentLocation.slug) ||
            srv.locationAr.includes(location.nameAr) ||
            srv.locationEn.toLowerCase().includes(location.nameEn.toLowerCase()),
        );

  const baseline120 = estimateFinishingRange(120, 'medium');
  const regionalBaselineMin = Math.round(baseline120.min * location.costFactor);
  const regionalBaselineMax = Math.round(baseline120.max * location.costFactor);

  return {
    location,
    parentLocation,
    children,
    category,
    allCategories,
    matchedVendors,
    matchedWeddingServices,
    regionalBaselineMin,
    regionalBaselineMax,
  };
}


import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { DatabaseSync } from 'node:sqlite';
import {
  ADMIN_PANEL_ROLES,
  CMS_EDITOR_ROLES,
  FULL_ADMIN_ROLES,
  MODERATION_ROLES,
  hasAnyRole,
} from '../shared/rbac';
import { estimateFinishingRange, maskNationalId } from '../shared/catalogMeta';
import { getCalculatorSummary, listCalculatorSummaries, runCalculator } from '../shared/calculators';
import {
  articleUpsertSchema,
  calculateRequestSchema,
  createBudgetExpenseSchema,
  createFinancingSchema,
  createFinishingInquirySchema,
  createOrderSchema,
  createSponsorshipSchema,
  createSupportCaseSchema,
  createWeddingBookingSchema,
  importCalculatorToBudgetSchema,
  loginSchema,
  normalizeEgyptianPhone,
  patchBudgetCategorySchema,
  patchBudgetExpenseSchema,
  productUpsertSchema,
  registerSchema,
  updateBudgetPlanSchema,
  updateProfileSchema,
  upsertBudgetCategorySchema,
  userBridePlanSchema,
  userGroomPlanSchema,
  weddingServiceUpsertSchema,
} from '../shared/schemas';
import type {
  Article,
  AuditLogEntry,
  BeforeAfterProject,
  BrideCategoryGuide,
  BrideChecklistTemplateItem,
  CalculatorOutput,
  CalculatorRunRecord,
  ContentCategory,
  FaqEntry,
  FinancingApplication,
  FinishingContractorListing,
  FinishingEncyclopediaCategory,
  FinishingInquiry,
  FinishingMaterialItem,
  FinishingPackage,
  FinishingService,
  GlossaryTerm,
  GroomConfigurablePackage,
  GroomSubcategoryGuide,
  LocationNode,
  Order,
  PlatformSettings,
  Product,
  SponsorshipInquiry,
  SupportCase,
  User,
  UserBridePlanState,
  UserGroomPlanState,
  WeddingBookingRequest,
  WeddingServiceItem,
} from '../shared/types';
import {
  buildBudgetOverview,
  ensureUserBudgetPlan,
  syncUserTransactionsToBudget,
  upsertBudgetExpenseFromSource,
} from './budgetService';
import {
  SlidingWindowRateLimiter,
  buildClearSessionCookieHeader,
  buildSessionCookieHeader,
  generateSessionToken,
  hashPassword,
  hashSensitiveField,
  hashSessionToken,
  parseCookies,
  SESSION_COOKIE_NAME,
  verifyPassword,
  writeAuditLog,
} from './security';

export interface AppHandlerOptions {
  sessionSecret: string;
  appOrigin: string;
  sessionTtlSeconds: number;
  isProduction: boolean;
}

function mapUserRow(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name),
    nameEn: row.name_en ? String(row.name_en) : undefined,
    email: String(row.email),
    phone: String(row.phone),
    role: row.role as User['role'],
    status: row.status as User['status'],
    city: row.city ? String(row.city) : undefined,
    governorateSlug: row.governorate_slug ? String(row.governorate_slug) : undefined,
    currentStage: row.current_stage as User['currentStage'],
    language: (row.language as User['language']) || 'ar',
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    isDemoData: Boolean(row.is_demo_data),
    createdAt: String(row.created_at),
  };
}

function mapProductRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    trousseauType: row.trousseau_type as Product['trousseauType'],
    category: String(row.category),
    categoryAr: String(row.category_ar),
    categoryEn: String(row.category_en),
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    brand: String(row.brand),
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    sku: String(row.sku),
    stock: Number(row.stock),
    imageUrl: String(row.image_url),
    galleryUrls: JSON.parse(String(row.gallery_json || '[]')) as string[],
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    specsAr: JSON.parse(String(row.specs_ar_json || '{}')) as Record<string, string>,
    specsEn: JSON.parse(String(row.specs_en_json || '{}')) as Record<string, string>,
    priceSource: row.price_source ? String(row.price_source) : undefined,
    priceUpdatedAt: row.price_updated_at ? String(row.price_updated_at) : undefined,
    isFeatured: Boolean(row.is_featured),
    isReadyPackageItem: Boolean(row.is_ready_package_item),
    isDemoData: Boolean(row.is_demo_data),
  };
}

function mapWeddingServiceRow(row: Record<string, unknown>): WeddingServiceItem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    category: row.category as WeddingServiceItem['category'],
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    governorateSlug: row.governorate_slug ? String(row.governorate_slug) : undefined,
    locationAr: String(row.location_ar),
    locationEn: String(row.location_en),
    startingPrice: Number(row.starting_price),
    pricingType: row.pricing_type as WeddingServiceItem['pricingType'],
    imageUrl: String(row.image_url),
    galleryUrls: JSON.parse(String(row.gallery_json || '[]')) as string[],
    rating: Number(row.rating),
    reviewsCount: Number(row.reviews_count),
    capacity: row.capacity ? String(row.capacity) : undefined,
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    featuresAr: JSON.parse(String(row.features_ar_json || '[]')) as string[],
    featuresEn: JSON.parse(String(row.features_en_json || '[]')) as string[],
    badge: row.badge ? String(row.badge) : undefined,
    isDemoData: Boolean(row.is_demo_data),
  };
}

function mapArticleRow(row: Record<string, unknown>): Article {
  return {
    id: String(row.id),
    slug: String(row.slug),
    categoryId: String(row.category_id),
    domain: row.domain as Article['domain'],
    contentType: row.content_type as Article['contentType'],
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    excerptAr: String(row.excerpt_ar),
    excerptEn: String(row.excerpt_en),
    bodyAr: String(row.body_ar),
    bodyEn: String(row.body_en),
    featuredImage: String(row.featured_image),
    authorName: String(row.author_name),
    tags: JSON.parse(String(row.tags_json || '[]')) as string[],
    faqs: JSON.parse(String(row.faq_json || '[]')) as Article['faqs'],
    relatedCalculators: JSON.parse(String(row.related_calculators_json || '[]')) as string[],
    seoTitleAr: row.seo_title_ar ? String(row.seo_title_ar) : undefined,
    seoTitleEn: row.seo_title_en ? String(row.seo_title_en) : undefined,
    metaDescAr: row.meta_desc_ar ? String(row.meta_desc_ar) : undefined,
    metaDescEn: row.meta_desc_en ? String(row.meta_desc_en) : undefined,
    status: row.status as Article['status'],
    readingMinutes: Number(row.reading_minutes),
    viewCount: Number(row.view_count),
    isFeatured: Boolean(row.is_featured),
    publishedAt: String(row.published_at),
    updatedAt: String(row.updated_at),
  };
}

function mapFinishingPackageRow(row: Record<string, unknown>): FinishingPackage {
  return {
    id: String(row.id),
    tier: row.tier as FinishingPackage['tier'],
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    pricePerMeter: Number(row.price_per_meter),
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    featuresAr: JSON.parse(String(row.features_ar_json || '[]')) as string[],
    featuresEn: JSON.parse(String(row.features_en_json || '[]')) as string[],
    recommendedForAr: String(row.recommended_for_ar),
    recommendedForEn: String(row.recommended_for_en),
    badge: row.badge ? String(row.badge) : undefined,
  };
}

function mapFinishingServiceRow(row: Record<string, unknown>): FinishingService {
  return {
    id: String(row.id),
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    iconName: String(row.icon_name),
    imageUrl: String(row.image_url),
    startingPricePerMeter: Number(row.starting_price_per_meter),
    durationDays: String(row.duration_days),
    includedItemsAr: JSON.parse(String(row.included_items_ar_json || '[]')) as string[],
    includedItemsEn: JSON.parse(String(row.included_items_en_json || '[]')) as string[],
  };
}

function mapLocationRow(row: Record<string, unknown>): LocationNode {
  return {
    id: String(row.id),
    slug: String(row.slug),
    level: row.level as LocationNode['level'],
    parentId: row.parent_id ? String(row.parent_id) : null,
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    summaryAr: String(row.summary_ar),
    summaryEn: String(row.summary_en),
    costFactor: Number(row.cost_factor),
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order),
  };
}

function mapCategoryRow(row: Record<string, unknown>): ContentCategory {
  return {
    id: String(row.id),
    slug: String(row.slug),
    domain: row.domain as ContentCategory['domain'],
    parentId: row.parent_id ? String(row.parent_id) : null,
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    iconName: String(row.icon_name),
    sortOrder: Number(row.sort_order),
  };
}

function mapOrderRows(db: DatabaseSync, orderRows: Record<string, unknown>[]): Order[] {
  const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  return orderRows.map((row) => {
    const itemRows = getItems.all(String(row.id)) as Record<string, unknown>[];
    return {
      id: String(row.id),
      userId: row.user_id ? String(row.user_id) : undefined,
      customerName: String(row.customer_name),
      phone: String(row.phone),
      address: String(row.address),
      city: String(row.city),
      subtotal: Number(row.subtotal),
      deliveryFee: Number(row.delivery_fee),
      total: Number(row.total),
      paymentMethod: row.payment_method as Order['paymentMethod'],
      status: row.status as Order['status'],
      createdAt: String(row.created_at),
      items: itemRows.map((it) => ({
        product: JSON.parse(String(it.product_snapshot_json)) as Product,
        quantity: Number(it.quantity),
      })),
    };
  });
}

function mapFinishingInquiryRow(row: Record<string, unknown>): FinishingInquiry {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    customerName: String(row.customer_name),
    phone: String(row.phone),
    governorate: String(row.governorate),
    areaSqm: Number(row.area_sqm),
    roomsCount: Number(row.rooms_count),
    bathroomsCount: Number(row.bathrooms_count),
    finishingTier: row.finishing_tier as FinishingInquiry['finishingTier'],
    budgetEGP: row.budget_egp != null ? Number(row.budget_egp) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    status: row.status as FinishingInquiry['status'],
    estimatedCostMin: row.estimated_cost_min != null ? Number(row.estimated_cost_min) : undefined,
    estimatedCostMax: row.estimated_cost_max != null ? Number(row.estimated_cost_max) : undefined,
    createdAt: String(row.created_at),
  };
}

function mapWeddingBookingRow(row: Record<string, unknown>): WeddingBookingRequest {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    serviceId: String(row.service_id),
    serviceName: String(row.service_name),
    category: row.category as WeddingBookingRequest['category'],
    customerName: String(row.customer_name),
    phone: String(row.phone),
    weddingDate: String(row.wedding_date),
    guestCount: row.guest_count != null ? Number(row.guest_count) : undefined,
    governorate: String(row.governorate),
    notes: row.notes ? String(row.notes) : undefined,
    status: row.status as WeddingBookingRequest['status'],
    createdAt: String(row.created_at),
  };
}

function mapFinancingRow(row: Record<string, unknown>): FinancingApplication {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    customerName: String(row.customer_name),
    phone: String(row.phone),
    nationalId: String(row.national_id_masked),
    monthlyIncome: Number(row.monthly_income),
    employer: String(row.employer),
    governorate: String(row.governorate),
    requestedAmount: Number(row.requested_amount),
    tenureMonths: Number(row.tenure_months),
    preferredProvider: String(row.preferred_provider),
    associatedSection: row.associated_section as FinancingApplication['associatedSection'],
    status: row.status as FinancingApplication['status'],
    createdAt: String(row.created_at),
  };
}

function mapSupportRow(row: Record<string, unknown>): SupportCase {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    applicantName: String(row.applicant_name),
    nationalId: String(row.national_id_masked),
    phone: String(row.phone),
    governorate: String(row.governorate),
    address: String(row.address),
    category: row.category as SupportCase['category'],
    caseDescription: String(row.case_description),
    urgencyLevel: row.urgency_level as SupportCase['urgencyLevel'],
    documentsSubmitted: JSON.parse(String(row.documents_submitted_json || '[]')) as string[],
    status: row.status as SupportCase['status'],
    supportValueEstimated:
      row.support_value_estimated != null ? Number(row.support_value_estimated) : undefined,
    internalNotes: row.internal_notes ? String(row.internal_notes) : undefined,
    createdAt: String(row.created_at),
  };
}

function mapFinishingCategoryRow(row: Record<string, unknown>): FinishingEncyclopediaCategory {
  return {
    id: String(row.id),
    slug: String(row.slug),
    stepOrder: Number(row.step_order),
    phaseKey: row.phase_key as FinishingEncyclopediaCategory['phaseKey'],
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    summaryAr: String(row.summary_ar),
    summaryEn: String(row.summary_en),
    budgetSharePercent: Number(row.budget_share_percent),
    typicalDurationAr: String(row.typical_duration_ar),
    typicalDurationEn: String(row.typical_duration_en),
    technicalSpecsAr: JSON.parse(String(row.technical_specs_ar_json || '[]')) as string[],
    technicalSpecsEn: JSON.parse(String(row.technical_specs_en_json || '[]')) as string[],
    commonMistakesAr: JSON.parse(String(row.common_mistakes_ar_json || '[]')) as string[],
    commonMistakesEn: JSON.parse(String(row.common_mistakes_en_json || '[]')) as string[],
    inspectionChecklistAr: JSON.parse(String(row.inspection_checklist_ar_json || '[]')) as string[],
    inspectionChecklistEn: JSON.parse(String(row.inspection_checklist_en_json || '[]')) as string[],
    recommendedMaterialsAr: JSON.parse(String(row.recommended_materials_ar_json || '[]')) as string[],
    recommendedMaterialsEn: JSON.parse(String(row.recommended_materials_en_json || '[]')) as string[],
    imageUrl: String(row.image_url),
  };
}

function mapFinishingMaterialRow(row: Record<string, unknown>): FinishingMaterialItem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    categorySlug: String(row.category_slug),
    materialGroup: row.material_group as FinishingMaterialItem['materialGroup'],
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    summaryAr: String(row.summary_ar),
    summaryEn: String(row.summary_en),
    originAr: String(row.origin_ar),
    originEn: String(row.origin_en),
    unitAr: String(row.unit_ar),
    unitEn: String(row.unit_en),
    priceMinEgp: Number(row.price_min_egp),
    priceMaxEgp: Number(row.price_max_egp),
    priceSource: String(row.price_source),
    priceUpdatedAt: String(row.price_updated_at),
    prosAr: JSON.parse(String(row.pros_ar_json || '[]')) as string[],
    prosEn: JSON.parse(String(row.pros_en_json || '[]')) as string[],
    consAr: JSON.parse(String(row.cons_ar_json || '[]')) as string[],
    consEn: JSON.parse(String(row.cons_en_json || '[]')) as string[],
    alternativesAr: JSON.parse(String(row.alternatives_ar_json || '[]')) as string[],
    alternativesEn: JSON.parse(String(row.alternatives_en_json || '[]')) as string[],
    specsAr: JSON.parse(String(row.specs_ar_json || '{}')) as Record<string, string>,
    specsEn: JSON.parse(String(row.specs_en_json || '{}')) as Record<string, string>,
    bestUseAr: String(row.best_use_ar),
    bestUseEn: String(row.best_use_en),
    imageUrl: String(row.image_url),
  };
}

function mapBeforeAfterProjectRow(row: Record<string, unknown>): BeforeAfterProject {
  return {
    id: String(row.id),
    slug: String(row.slug),
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    governorateSlug: String(row.governorate_slug),
    governorateAr: String(row.governorate_ar),
    governorateEn: String(row.governorate_en),
    areaSqm: Number(row.area_sqm),
    tier: row.tier as BeforeAfterProject['tier'],
    tierAr: String(row.tier_ar),
    tierEn: String(row.tier_en),
    durationDays: Number(row.duration_days),
    durationAr: String(row.duration_ar),
    durationEn: String(row.duration_en),
    estimatedBandAr: String(row.estimated_band_ar),
    estimatedBandEn: String(row.estimated_band_en),
    beforeImage: String(row.before_image),
    afterImage: String(row.after_image),
    descriptionAr: String(row.description_ar),
    descriptionEn: String(row.description_en),
    scopeHighlightsAr: JSON.parse(String(row.scope_highlights_ar_json || '[]')) as string[],
    scopeHighlightsEn: JSON.parse(String(row.scope_highlights_en_json || '[]')) as string[],
    isSampleListing: Boolean(row.is_sample_listing),
  };
}

function mapContractorRow(row: Record<string, unknown>): FinishingContractorListing {
  return {
    id: String(row.id),
    slug: String(row.slug),
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    roleTitleAr: String(row.role_title_ar),
    roleTitleEn: String(row.role_title_en),
    specialtyGroup: row.specialty_group as FinishingContractorListing['specialtyGroup'],
    specialtyAr: String(row.specialty_ar),
    specialtyEn: String(row.specialty_en),
    governoratesCovered: JSON.parse(String(row.governorates_json || '[]')) as string[],
    experienceYears: Number(row.experience_years),
    verificationBadge: row.verification_badge as FinishingContractorListing['verificationBadge'],
    pricingModelAr: String(row.pricing_model_ar),
    pricingModelEn: String(row.pricing_model_en),
    portfolioHighlightsAr: JSON.parse(String(row.portfolio_highlights_ar_json || '[]')) as string[],
    portfolioHighlightsEn: JSON.parse(String(row.portfolio_highlights_en_json || '[]')) as string[],
    warrantyOfferedAr: String(row.warranty_offered_ar),
    warrantyOfferedEn: String(row.warranty_offered_en),
    reviewsCount: Number(row.reviews_count ?? 0),
    ratingNoteAr: String(row.rating_note_ar),
    ratingNoteEn: String(row.rating_note_en),
    isSampleListing: Boolean(row.is_sample_listing),
  };
}

function mapGroomSubcategoryRow(row: Record<string, unknown>): GroomSubcategoryGuide {
  return {
    id: String(row.id),
    slug: String(row.slug),
    groupKey: row.group_key as GroomSubcategoryGuide['groupKey'],
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    summaryAr: String(row.summary_ar),
    summaryEn: String(row.summary_en),
    priority: row.priority as GroomSubcategoryGuide['priority'],
    budgetSharePercent: Number(row.budget_share_percent),
    estimatedMinEgp: Number(row.estimated_min_egp),
    estimatedMaxEgp: Number(row.estimated_max_egp),
    buyingChecklistAr: JSON.parse(String(row.buying_checklist_ar_json || '[]')) as string[],
    buyingChecklistEn: JSON.parse(String(row.buying_checklist_en_json || '[]')) as string[],
    warrantyTipsAr: String(row.warranty_tips_ar),
    warrantyTipsEn: String(row.warranty_tips_en),
  };
}

function mapGroomPackageRow(row: Record<string, unknown>): GroomConfigurablePackage {
  return {
    id: String(row.id),
    slug: String(row.slug),
    tierKey: row.tier_key as GroomConfigurablePackage['tierKey'],
    targetBudgetEgp: Number(row.target_budget_egp),
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    taglineAr: String(row.tagline_ar),
    taglineEn: String(row.tagline_en),
    warrantyNoteAr: String(row.warranty_note_ar),
    warrantyNoteEn: String(row.warranty_note_en),
    priceUpdatedAt: String(row.price_updated_at),
    slots: JSON.parse(String(row.slots_json || '[]')) as GroomConfigurablePackage['slots'],
  };
}

function mapBrideCategoryRow(row: Record<string, unknown>): BrideCategoryGuide {
  return {
    id: String(row.id),
    slug: String(row.slug),
    sortOrder: Number(row.sort_order),
    groupKey: row.group_key as BrideCategoryGuide['groupKey'],
    nameAr: String(row.name_ar),
    nameEn: String(row.name_en),
    summaryAr: String(row.summary_ar),
    summaryEn: String(row.summary_en),
    budgetWeightPercent: Number(row.budget_weight_percent),
    antiWasteTipAr: String(row.anti_waste_tip_ar),
    antiWasteTipEn: String(row.anti_waste_tip_en),
    recommendedCountLabelAr: String(row.recommended_count_label_ar),
    recommendedCountLabelEn: String(row.recommended_count_label_en),
  };
}

function mapBrideChecklistTemplateRow(row: Record<string, unknown>): BrideChecklistTemplateItem {
  return {
    id: String(row.id),
    categoryId: String(row.category_id),
    labelAr: String(row.label_ar),
    labelEn: String(row.label_en),
    recommendedQty: Number(row.recommended_qty),
    unitLabelAr: String(row.unit_label_ar),
    unitLabelEn: String(row.unit_label_en),
    priority: row.priority as BrideChecklistTemplateItem['priority'],
    estimatedUnitPriceEgp: Number(row.estimated_unit_price_egp),
    presets: JSON.parse(String(row.presets_json || '[]')) as BrideChecklistTemplateItem['presets'],
    noteAr: String(row.note_ar),
    noteEn: String(row.note_en),
  };
}

function mapGlossaryTermRow(row: Record<string, unknown>): GlossaryTerm {
  return {
    id: String(row.id),
    slug: String(row.slug),
    domain: row.domain as GlossaryTerm['domain'],
    termAr: String(row.term_ar),
    termEn: String(row.term_en),
    definitionAr: String(row.definition_ar),
    definitionEn: String(row.definition_en),
    exampleAr: String(row.example_ar),
    exampleEn: String(row.example_en),
    relatedCalculatorSlug: row.related_calculator_slug ? String(row.related_calculator_slug) : undefined,
  };
}

function mapFaqRow(row: Record<string, unknown>): FaqEntry {
  return {
    id: String(row.id),
    domain: row.domain as FaqEntry['domain'],
    questionAr: String(row.question_ar),
    questionEn: String(row.question_en),
    answerAr: String(row.answer_ar),
    answerEn: String(row.answer_en),
    sortOrder: Number(row.sort_order),
  };
}

function mapUserGroomPlanRow(row: Record<string, unknown>): UserGroomPlanState {
  return {
    selectedTierKey: row.selected_tier_key as UserGroomPlanState['selectedTierKey'],
    targetBudgetEgp: Number(row.target_budget_egp),
    slotSelections: JSON.parse(String(row.slot_selections_json || '{}')) as Record<string, string>,
    excludedSlots: JSON.parse(String(row.excluded_slots_json || '[]')) as string[],
    customItems: JSON.parse(String(row.custom_items_json || '[]')) as string[],
    updatedAt: String(row.updated_at),
  };
}

function mapUserBridePlanRow(row: Record<string, unknown>): UserBridePlanState {
  return {
    presetMode: row.preset_mode as UserBridePlanState['presetMode'],
    targetBudgetEgp: Number(row.target_budget_egp),
    checkedItemIds: JSON.parse(String(row.checked_item_ids_json || '[]')) as string[],
    qtyOverrides: JSON.parse(String(row.qty_overrides_json || '{}')) as Record<string, number>,
    customItems: JSON.parse(String(row.custom_items_json || '[]')) as UserBridePlanState['customItems'],
    updatedAt: String(row.updated_at),
  };
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    const maxBytes = 1024 * 1024;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
  extraHeaders: Record<string, string | string[]> = {},
): void {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': String(Buffer.byteLength(body)),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...extraHeaders,
  });
  res.end(body);
}

function sendError(
  res: ServerResponse,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  sendJson(res, statusCode, { ok: false, error: { code, message, details } });
}

function resolveClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export function createAppHandler(db: DatabaseSync, options: AppHandlerOptions) {
  const authLimiter = new SlidingWindowRateLimiter(5 * 60 * 1000, 30);
  const submitLimiter = new SlidingWindowRateLimiter(5 * 60 * 1000, 60);

  function resolveSessionUser(req: IncomingMessage): { user: User | null; tokenHash: string | null } {
    let rawToken = '';
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      rawToken = authHeader.slice(7).trim();
    }
    if (!rawToken) {
      const cookies = parseCookies(req.headers.cookie);
      rawToken = cookies[SESSION_COOKIE_NAME] || '';
    }
    if (!rawToken) return { user: null, tokenHash: null };

    const tokenHash = hashSessionToken(rawToken);
    const row = db
      .prepare(
        `SELECT s.id as session_id, s.expires_at, u.*
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND u.deleted_at IS NULL`,
      )
      .get(tokenHash) as Record<string, unknown> | undefined;

    if (!row) return { user: null, tokenHash: null };

    if (new Date(String(row.expires_at)).getTime() <= Date.now()) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(String(row.session_id));
      return { user: null, tokenHash: null };
    }

    if (String(row.status) !== 'active') {
      return { user: null, tokenHash: null };
    }

    return { user: mapUserRow(row), tokenHash };
  }

  return async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const reqOrigin = req.headers.origin;
    const allowedOrigins = [options.appOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'];
    if (typeof reqOrigin === 'string' && allowedOrigins.includes(reqOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', reqOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = url.pathname;
    const method = (req.method || 'GET').toUpperCase();
    const ip = resolveClientIp(req);

    try {
      // Dynamic XML Sitemap
      if (method === 'GET' && pathname === '/sitemap.xml') {
        const baseUrl = options.appOrigin.replace(/\/$/, '');
        const staticRoutes = [
          '/',
          '/finishing',
          '/finishing/encyclopedia',
          '/finishing/materials',
          '/finishing/contractors',
          '/groom',
          '/groom/encyclopedia',
          '/bride',
          '/bride/encyclopedia',
          '/wedding',
          '/installments',
          '/social-support',
          '/encyclopedia',
          '/glossary',
          '/faqs',
          '/discover',
          '/calculators',
          ...listCalculatorSummaries().map((c) => `/calculators/${encodeURIComponent(c.slug)}`),
        ];
        const articles = db
          .prepare("SELECT slug, updated_at FROM articles WHERE status = 'published'")
          .all() as { slug: string; updated_at: string }[];
        const locations = db
          .prepare("SELECT slug FROM locations WHERE level IN ('governorate', 'city')")
          .all() as { slug: string }[];

        const urlsXml = [
          ...staticRoutes.map(
            (r) => `<url><loc>${baseUrl}${r}</loc><changefreq>weekly</changefreq></url>`,
          ),
          ...articles.map(
            (a) =>
              `<url><loc>${baseUrl}/guides/${encodeURIComponent(a.slug)}</loc><lastmod>${a.updated_at.slice(0, 10)}</lastmod><changefreq>monthly</changefreq></url>`,
          ),
          ...locations.map(
            (l) =>
              `<url><loc>${baseUrl}/locations/${encodeURIComponent(l.slug)}</loc><changefreq>monthly</changefreq></url>`,
          ),
        ].join('');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsXml}</urlset>`;
        res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
        res.end(xml);
        return;
      }

      if (!pathname.startsWith('/api/v1')) {
        sendError(res, 404, 'NOT_FOUND', 'Route not found');
        return;
      }

      const route = pathname.slice('/api/v1'.length) || '/';
      const { user: authUser, tokenHash } = resolveSessionUser(req);

      // Health check
      if (method === 'GET' && route === '/health') {
        const dbCheck = db.prepare('SELECT 1 as ok').get() as { ok: number };
        sendJson(res, 200, {
          ok: true,
          data: { status: 'healthy', sqlite: dbCheck.ok === 1, timestamp: new Date().toISOString() },
        });
        return;
      }

      // Bootstrap (safe public state + nullable authenticated user; returns 200 for zero anonymous console errors)
      if (method === 'GET' && route === '/bootstrap') {
        const products = (
          db.prepare('SELECT * FROM products ORDER BY is_featured DESC, created_at DESC').all() as Record<string, unknown>[]
        ).map(mapProductRow);
        const finishingPackages = (
          db.prepare('SELECT * FROM finishing_packages ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapFinishingPackageRow);
        const finishingServices = (
          db.prepare('SELECT * FROM finishing_services ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapFinishingServiceRow);
        const weddingServices = (
          db.prepare('SELECT * FROM wedding_services ORDER BY rating DESC, created_at DESC').all() as Record<string, unknown>[]
        ).map(mapWeddingServiceRow);
        const categories = (
          db.prepare('SELECT * FROM content_categories ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapCategoryRow);
        const locations = (
          db.prepare('SELECT * FROM locations ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapLocationRow);
        const articles = (
          db
            .prepare("SELECT * FROM articles WHERE status = 'published' ORDER BY is_featured DESC, published_at DESC")
            .all() as Record<string, unknown>[]
        ).map(mapArticleRow);
        const settingsRow = db.prepare("SELECT value_json FROM platform_settings WHERE key = 'main'").get() as
          | { value_json: string }
          | undefined;
        const settings = settingsRow ? (JSON.parse(settingsRow.value_json) as PlatformSettings) : null;

        sendJson(res, 200, {
          ok: true,
          data: {
            user: authUser,
            products,
            finishingPackages,
            finishingServices,
            weddingServices,
            categories,
            locations,
            articles,
            settings,
          },
        });
        return;
      }

      // ================= AUTH ROUTES =================
      if (method === 'POST' && route === '/auth/register') {
        const rate = authLimiter.check(`reg:${ip}`);
        if (!rate.allowed) {
          sendError(res, 429, 'RATE_LIMITED', 'Too many attempts. Please wait a few minutes.');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid registration inputs', parsed.error.flatten());
          return;
        }

        const existing = db
          .prepare('SELECT id FROM users WHERE email = ? OR phone = ?')
          .get(parsed.data.email, parsed.data.phone);
        if (existing) {
          sendError(res, 409, 'DUPLICATE_ACCOUNT', 'Email or mobile phone is already registered.');
          return;
        }

        const userId = `usr-${crypto.randomUUID().slice(0, 10)}`;
        const now = new Date().toISOString();
        const pwHash = hashPassword(parsed.data.password);

        db.prepare(
          `INSERT INTO users (id, name, email, phone, password_hash, role, status, city, governorate_slug, current_stage, language, is_demo_data, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'customer', 'active', ?, ?, 'thinking', ?, 0, ?, ?)`,
        ).run(
          userId,
          parsed.data.name,
          parsed.data.email,
          parsed.data.phone,
          pwHash,
          parsed.data.city || null,
          parsed.data.governorateSlug || null,
          parsed.data.language || 'ar',
          now,
          now,
        );

        const rawToken = generateSessionToken();
        const sessionTokenHash = hashSessionToken(rawToken);
        const expiresAt = new Date(Date.now() + options.sessionTtlSeconds * 1000).toISOString();
        db.prepare(
          `INSERT INTO sessions (id, user_id, token_hash, expires_at, ip_address, user_agent, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          `ses-${crypto.randomUUID().slice(0, 12)}`,
          userId,
          sessionTokenHash,
          expiresAt,
          ip,
          String(req.headers['user-agent'] || ''),
          now,
        );

        writeAuditLog(db, {
          actorUserId: userId,
          actorRole: 'customer',
          action: 'auth.register',
          targetType: 'user',
          targetId: userId,
          ipAddress: ip,
        });

        const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as Record<string, unknown>;
        sendJson(
          res,
          201,
          { ok: true, data: { user: mapUserRow(userRow), token: rawToken } },
          { 'Set-Cookie': buildSessionCookieHeader(rawToken, options.sessionTtlSeconds, options.isProduction) },
        );
        return;
      }

      if (method === 'POST' && route === '/auth/login') {
        const body = await readJsonBody(req);
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Email/phone and password are required', parsed.error.flatten());
          return;
        }
        const rate = authLimiter.check(`login:${ip}:${parsed.data.identifier.toLowerCase()}`);
        if (!rate.allowed) {
          sendError(res, 429, 'RATE_LIMITED', 'Too many login attempts. Try again later.');
          return;
        }

        const identifier = parsed.data.identifier.trim();
        const normalizedPhone = normalizeEgyptianPhone(identifier);
        const userRow = db
          .prepare('SELECT * FROM users WHERE (lower(email) = lower(?) OR phone = ?) AND deleted_at IS NULL')
          .get(identifier, normalizedPhone) as Record<string, unknown> | undefined;

        if (!userRow || !verifyPassword(parsed.data.password, String(userRow.password_hash))) {
          writeAuditLog(db, {
            actorRole: 'anonymous',
            action: 'auth.login_failed',
            targetType: 'user',
            metadata: { identifier: identifier.slice(0, 4) + '***' },
            ipAddress: ip,
          });
          sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email/phone or password.');
          return;
        }

        if (String(userRow.status) !== 'active') {
          sendError(res, 403, 'ACCOUNT_SUSPENDED', 'Account is suspended.');
          return;
        }

        const user = mapUserRow(userRow);
        const rawToken = generateSessionToken();
        const sessionTokenHash = hashSessionToken(rawToken);
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + options.sessionTtlSeconds * 1000).toISOString();
        db.prepare(
          `INSERT INTO sessions (id, user_id, token_hash, expires_at, ip_address, user_agent, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          `ses-${crypto.randomUUID().slice(0, 12)}`,
          user.id,
          sessionTokenHash,
          expiresAt,
          ip,
          String(req.headers['user-agent'] || ''),
          now,
        );

        writeAuditLog(db, {
          actorUserId: user.id,
          actorRole: user.role,
          action: 'auth.login',
          targetType: 'user',
          targetId: user.id,
          ipAddress: ip,
        });

        sendJson(
          res,
          200,
          { ok: true, data: { user, token: rawToken } },
          { 'Set-Cookie': buildSessionCookieHeader(rawToken, options.sessionTtlSeconds, options.isProduction) },
        );
        return;
      }

      if (method === 'POST' && route === '/auth/logout') {
        if (tokenHash) {
          db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
        }
        sendJson(
          res,
          200,
          { ok: true, data: { loggedOut: true } },
          { 'Set-Cookie': buildClearSessionCookieHeader(options.isProduction) },
        );
        return;
      }

      if (method === 'GET' && route === '/auth/me') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        sendJson(res, 200, { ok: true, data: authUser });
        return;
      }

      if (method === 'PATCH' && route === '/auth/me') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = updateProfileSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid profile updates', parsed.error.flatten());
          return;
        }
        const now = new Date().toISOString();
        db.prepare(
          `UPDATE users SET
            name = COALESCE(?, name),
            city = COALESCE(?, city),
            governorate_slug = COALESCE(?, governorate_slug),
            language = COALESCE(?, language),
            current_stage = COALESCE(?, current_stage),
            updated_at = ?
           WHERE id = ?`,
        ).run(
          parsed.data.name ?? null,
          parsed.data.city ?? null,
          parsed.data.governorateSlug ?? null,
          parsed.data.language ?? null,
          parsed.data.currentStage ?? null,
          now,
          authUser.id,
        );
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(authUser.id) as Record<string, unknown>;
        sendJson(res, 200, { ok: true, data: mapUserRow(row) });
        return;
      }

      // ================= PUBLIC CONTENT & DISCOVERY =================
      if (method === 'GET' && route === '/categories') {
        const domain = url.searchParams.get('domain');
        const rows = domain
          ? (db
              .prepare('SELECT * FROM content_categories WHERE domain = ? ORDER BY sort_order ASC')
              .all(domain) as Record<string, unknown>[])
          : (db
              .prepare('SELECT * FROM content_categories ORDER BY sort_order ASC')
              .all() as Record<string, unknown>[]);
        sendJson(res, 200, { ok: true, data: rows.map(mapCategoryRow) });
        return;
      }

      if (method === 'GET' && route === '/articles') {
        const domain = url.searchParams.get('domain');
        const contentType = url.searchParams.get('contentType');
        const q = (url.searchParams.get('q') || '').trim().toLowerCase();
        const includeDrafts = hasAnyRole(authUser?.role, CMS_EDITOR_ROLES) && url.searchParams.get('includeDrafts') === 'true';

        let sql = 'SELECT * FROM articles WHERE 1=1';
        const args: string[] = [];
        if (!includeDrafts) {
          sql += " AND status = 'published'";
        }
        if (domain) {
          sql += ' AND domain = ?';
          args.push(domain);
        }
        if (contentType) {
          sql += ' AND content_type = ?';
          args.push(contentType);
        }
        sql += ' ORDER BY is_featured DESC, published_at DESC';

        let list = (db.prepare(sql).all(...args) as Record<string, unknown>[]).map(mapArticleRow);
        if (q) {
          list = list.filter((a) =>
            `${a.titleAr} ${a.titleEn} ${a.excerptAr} ${a.excerptEn} ${a.tags.join(' ')}`.toLowerCase().includes(q),
          );
        }
        sendJson(res, 200, { ok: true, data: list });
        return;
      }

      if (method === 'GET' && route.startsWith('/articles/')) {
        const slug = decodeURIComponent(route.slice('/articles/'.length));
        const row = db.prepare('SELECT * FROM articles WHERE slug = ? OR id = ?').get(slug, slug) as
          | Record<string, unknown>
          | undefined;
        if (!row) {
          sendError(res, 404, 'NOT_FOUND', 'Article not found');
          return;
        }
        if (row.status !== 'published' && !hasAnyRole(authUser?.role, CMS_EDITOR_ROLES)) {
          sendError(res, 404, 'NOT_FOUND', 'Article not found');
          return;
        }
        db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(String(row.id));
        const article = mapArticleRow(row);
        article.viewCount += 1;
        sendJson(res, 200, { ok: true, data: article });
        return;
      }

      if (method === 'GET' && route === '/locations') {
        const rows = db.prepare('SELECT * FROM locations ORDER BY sort_order ASC').all() as Record<string, unknown>[];
        sendJson(res, 200, { ok: true, data: rows.map(mapLocationRow) });
        return;
      }

      if (method === 'GET' && route.startsWith('/locations/')) {
        const slug = decodeURIComponent(route.slice('/locations/'.length));
        const locRow = db.prepare('SELECT * FROM locations WHERE slug = ?').get(slug) as
          | Record<string, unknown>
          | undefined;
        if (!locRow) {
          sendError(res, 404, 'NOT_FOUND', 'Location not found');
          return;
        }
        const location = mapLocationRow(locRow);
        const children = (
          db.prepare('SELECT * FROM locations WHERE parent_id = ? ORDER BY sort_order ASC').all(location.id) as Record<
            string,
            unknown
          >[]
        ).map(mapLocationRow);
        const services = (
          db
            .prepare('SELECT * FROM wedding_services WHERE governorate_slug = ? OR location_ar LIKE ? OR location_en LIKE ?')
            .all(location.slug, `%${location.nameAr}%`, `%${location.nameEn}%`) as Record<string, unknown>[]
        ).map(mapWeddingServiceRow);

        sendJson(res, 200, { ok: true, data: { location, children, services } });
        return;
      }

      if (method === 'GET' && route === '/products') {
        const rows = db
          .prepare('SELECT * FROM products ORDER BY is_featured DESC, created_at DESC')
          .all() as Record<string, unknown>[];
        sendJson(res, 200, { ok: true, data: rows.map(mapProductRow) });
        return;
      }

      if (method === 'GET' && route === '/wedding-services') {
        const rows = db
          .prepare('SELECT * FROM wedding_services ORDER BY rating DESC, created_at DESC')
          .all() as Record<string, unknown>[];
        sendJson(res, 200, { ok: true, data: rows.map(mapWeddingServiceRow) });
        return;
      }

      // ================= STAGE 2: COMPLETE ENCYCLOPEDIA & KNOWLEDGE HUB PUBLIC ROUTES =================
      if (method === 'GET' && route === '/encyclopedia/bundle') {
        const finishingCategories = (
          db.prepare('SELECT * FROM finishing_categories ORDER BY step_order ASC').all() as Record<string, unknown>[]
        ).map(mapFinishingCategoryRow);
        const finishingMaterials = (
          db.prepare('SELECT * FROM finishing_materials ORDER BY material_group ASC, name_en ASC').all() as Record<
            string,
            unknown
          >[]
        ).map(mapFinishingMaterialRow);
        const beforeAfterProjects = (
          db.prepare('SELECT * FROM before_after_projects ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapBeforeAfterProjectRow);
        const contractors = (
          db.prepare('SELECT * FROM finishing_contractors ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapContractorRow);
        const groomSubcategories = (
          db.prepare('SELECT * FROM groom_subcategories ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapGroomSubcategoryRow);
        const groomConfigurablePackages = (
          db.prepare('SELECT * FROM groom_package_templates ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapGroomPackageRow);
        const brideCategories = (
          db.prepare('SELECT * FROM bride_categories ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapBrideCategoryRow);
        const brideChecklistTemplates = (
          db.prepare('SELECT * FROM bride_checklist_templates ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapBrideChecklistTemplateRow);
        const glossaryTerms = (
          db.prepare('SELECT * FROM glossary_terms ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapGlossaryTermRow);
        const faqItems = (
          db.prepare('SELECT * FROM faq_items ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapFaqRow);

        sendJson(res, 200, {
          ok: true,
          data: {
            finishingCategories,
            finishingMaterials,
            beforeAfterProjects,
            contractors,
            groomSubcategories,
            groomConfigurablePackages,
            brideCategories,
            brideChecklistTemplates,
            glossaryTerms,
            faqItems,
          },
        });
        return;
      }

      if (method === 'GET' && route === '/finishing/categories') {
        const phase = url.searchParams.get('phase');
        const rows = phase
          ? (db
              .prepare('SELECT * FROM finishing_categories WHERE phase_key = ? ORDER BY step_order ASC')
              .all(phase) as Record<string, unknown>[])
          : (db.prepare('SELECT * FROM finishing_categories ORDER BY step_order ASC').all() as Record<
              string,
              unknown
            >[]);
        sendJson(res, 200, { ok: true, data: rows.map(mapFinishingCategoryRow) });
        return;
      }

      if (method === 'GET' && route === '/finishing/materials') {
        const group = url.searchParams.get('group');
        const rows = group
          ? (db
              .prepare('SELECT * FROM finishing_materials WHERE material_group = ? ORDER BY name_en ASC')
              .all(group) as Record<string, unknown>[])
          : (db.prepare('SELECT * FROM finishing_materials ORDER BY material_group ASC, name_en ASC').all() as Record<
              string,
              unknown
            >[]);
        sendJson(res, 200, { ok: true, data: rows.map(mapFinishingMaterialRow) });
        return;
      }

      if (method === 'GET' && route === '/finishing/projects') {
        const governorate = url.searchParams.get('governorate');
        const tier = url.searchParams.get('tier');
        let list = (
          db.prepare('SELECT * FROM before_after_projects ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapBeforeAfterProjectRow);
        if (governorate) {
          list = list.filter((p) => p.governorateSlug === governorate);
        }
        if (tier) {
          list = list.filter((p) => p.tier === tier);
        }
        sendJson(res, 200, { ok: true, data: list });
        return;
      }

      if (method === 'GET' && route === '/contractors') {
        const governorate = url.searchParams.get('governorate');
        const specialty = url.searchParams.get('specialty');
        let list = (
          db.prepare('SELECT * FROM finishing_contractors ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapContractorRow);
        if (governorate) {
          list = list.filter((c) => c.governoratesCovered.includes(governorate));
        }
        if (specialty) {
          list = list.filter((c) => c.specialtyGroup === specialty);
        }
        sendJson(res, 200, { ok: true, data: list });
        return;
      }

      if (method === 'GET' && route === '/groom/encyclopedia') {
        const group = url.searchParams.get('group');
        const subcategories = (
          group
            ? (db
                .prepare('SELECT * FROM groom_subcategories WHERE group_key = ? ORDER BY sort_order ASC')
                .all(group) as Record<string, unknown>[])
            : (db.prepare('SELECT * FROM groom_subcategories ORDER BY sort_order ASC').all() as Record<
                string,
                unknown
              >[])
        ).map(mapGroomSubcategoryRow);
        const configurablePackages = (
          db.prepare('SELECT * FROM groom_package_templates ORDER BY sort_order ASC').all() as Record<string, unknown>[]
        ).map(mapGroomPackageRow);
        sendJson(res, 200, { ok: true, data: { subcategories, configurablePackages } });
        return;
      }

      if (method === 'GET' && route === '/bride/encyclopedia') {
        const group = url.searchParams.get('group');
        const categories = (
          group
            ? (db
                .prepare('SELECT * FROM bride_categories WHERE group_key = ? ORDER BY sort_order ASC')
                .all(group) as Record<string, unknown>[])
            : (db.prepare('SELECT * FROM bride_categories ORDER BY sort_order ASC').all() as Record<string, unknown>[])
        ).map(mapBrideCategoryRow);
        const checklistTemplates = (
          db.prepare('SELECT * FROM bride_checklist_templates ORDER BY sort_order ASC').all() as Record<
            string,
            unknown
          >[]
        ).map(mapBrideChecklistTemplateRow);
        sendJson(res, 200, { ok: true, data: { categories, checklistTemplates } });
        return;
      }

      if (method === 'GET' && route === '/glossary') {
        const domain = url.searchParams.get('domain');
        const q = (url.searchParams.get('q') || '').trim().toLowerCase();
        let terms = (
          domain
            ? (db
                .prepare('SELECT * FROM glossary_terms WHERE domain = ? ORDER BY sort_order ASC')
                .all(domain) as Record<string, unknown>[])
            : (db.prepare('SELECT * FROM glossary_terms ORDER BY sort_order ASC').all() as Record<string, unknown>[])
        ).map(mapGlossaryTermRow);
        if (q) {
          terms = terms.filter((item) =>
            `${item.termAr} ${item.termEn} ${item.definitionAr} ${item.definitionEn}`.toLowerCase().includes(q),
          );
        }
        sendJson(res, 200, { ok: true, data: terms });
        return;
      }

      if (method === 'GET' && route === '/faqs') {
        const domain = url.searchParams.get('domain');
        const q = (url.searchParams.get('q') || '').trim().toLowerCase();
        let faqs = (
          domain
            ? (db
                .prepare('SELECT * FROM faq_items WHERE domain = ? ORDER BY sort_order ASC')
                .all(domain) as Record<string, unknown>[])
            : (db.prepare('SELECT * FROM faq_items ORDER BY sort_order ASC').all() as Record<string, unknown>[])
        ).map(mapFaqRow);
        if (q) {
          faqs = faqs.filter((item) =>
            `${item.questionAr} ${item.questionEn} ${item.answerAr} ${item.answerEn}`.toLowerCase().includes(q),
          );
        }
        sendJson(res, 200, { ok: true, data: faqs });
        return;
      }

      // ================= STAGE 2: OWNER-SCOPED GROOM & BRIDE PLANNER ROUTES =================
      if (method === 'GET' && route === '/my/groom-plan') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to load your saved groom plan');
          return;
        }
        const row = db.prepare('SELECT * FROM user_groom_plans WHERE user_id = ?').get(authUser.id) as
          | Record<string, unknown>
          | undefined;
        const plan: UserGroomPlanState = row
          ? mapUserGroomPlanRow(row)
          : {
              selectedTierKey: 'tier_200k',
              targetBudgetEgp: 200000,
              slotSelections: {},
              excludedSlots: [],
              customItems: [],
            };
        sendJson(res, 200, { ok: true, data: plan });
        return;
      }

      if (method === 'PUT' && route === '/my/groom-plan') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to save your groom plan');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = userGroomPlanSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid groom plan inputs', parsed.error.flatten());
          return;
        }
        const now = new Date().toISOString();
        db.prepare(
          `INSERT INTO user_groom_plans (user_id, selected_tier_key, target_budget_egp, slot_selections_json, excluded_slots_json, custom_items_json, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET
             selected_tier_key = excluded.selected_tier_key,
             target_budget_egp = excluded.target_budget_egp,
             slot_selections_json = excluded.slot_selections_json,
             excluded_slots_json = excluded.excluded_slots_json,
             custom_items_json = excluded.custom_items_json,
             updated_at = excluded.updated_at`,
        ).run(
          authUser.id,
          parsed.data.selectedTierKey,
          parsed.data.targetBudgetEgp,
          JSON.stringify(parsed.data.slotSelections),
          JSON.stringify(parsed.data.excludedSlots),
          JSON.stringify(parsed.data.customItems),
          now,
        );
        writeAuditLog(db, {
          actorUserId: authUser.id,
          actorRole: authUser.role,
          action: 'planner.groom_updated',
          targetType: 'user_groom_plan',
          targetId: authUser.id,
          metadata: { selectedTierKey: parsed.data.selectedTierKey, targetBudgetEgp: parsed.data.targetBudgetEgp },
          ipAddress: ip,
        });
        const row = db.prepare('SELECT * FROM user_groom_plans WHERE user_id = ?').get(authUser.id) as Record<
          string,
          unknown
        >;
        sendJson(res, 200, { ok: true, data: mapUserGroomPlanRow(row) });
        return;
      }

      if (method === 'GET' && route === '/my/bride-plan') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to load your saved bridal plan');
          return;
        }
        const row = db.prepare('SELECT * FROM user_bride_plans WHERE user_id = ?').get(authUser.id) as
          | Record<string, unknown>
          | undefined;
        const plan: UserBridePlanState = row
          ? mapUserBridePlanRow(row)
          : {
              presetMode: 'balanced',
              targetBudgetEgp: 90000,
              checkedItemIds: ['chk-1', 'chk-4'],
              qtyOverrides: {},
              customItems: [],
            };
        sendJson(res, 200, { ok: true, data: plan });
        return;
      }

      if (method === 'PUT' && route === '/my/bride-plan') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to save your bridal plan');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = userBridePlanSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid bridal plan inputs', parsed.error.flatten());
          return;
        }
        const now = new Date().toISOString();
        db.prepare(
          `INSERT INTO user_bride_plans (user_id, preset_mode, target_budget_egp, checked_item_ids_json, qty_overrides_json, custom_items_json, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET
             preset_mode = excluded.preset_mode,
             target_budget_egp = excluded.target_budget_egp,
             checked_item_ids_json = excluded.checked_item_ids_json,
             qty_overrides_json = excluded.qty_overrides_json,
             custom_items_json = excluded.custom_items_json,
             updated_at = excluded.updated_at`,
        ).run(
          authUser.id,
          parsed.data.presetMode,
          parsed.data.targetBudgetEgp,
          JSON.stringify(parsed.data.checkedItemIds),
          JSON.stringify(parsed.data.qtyOverrides),
          JSON.stringify(parsed.data.customItems),
          now,
        );
        writeAuditLog(db, {
          actorUserId: authUser.id,
          actorRole: authUser.role,
          action: 'planner.bride_updated',
          targetType: 'user_bride_plan',
          targetId: authUser.id,
          metadata: {
            presetMode: parsed.data.presetMode,
            checkedCount: parsed.data.checkedItemIds.length,
            customCount: parsed.data.customItems.length,
          },
          ipAddress: ip,
        });
        const row = db.prepare('SELECT * FROM user_bride_plans WHERE user_id = ?').get(authUser.id) as Record<
          string,
          unknown
        >;
        sendJson(res, 200, { ok: true, data: mapUserBridePlanRow(row) });
        return;
      }

      // ================= STAGE 3: UNIFIED 20 SMART CALCULATORS & BUDGET MANAGER =================
      if (method === 'GET' && route === '/calculators') {
        sendJson(res, 200, { ok: true, data: listCalculatorSummaries() });
        return;
      }

      if (method === 'POST' && route.startsWith('/calculators/') && route.endsWith('/calculate')) {
        const slug = decodeURIComponent(route.slice('/calculators/'.length, -'/calculate'.length));
        const def = getCalculatorSummary(slug);
        if (!def) {
          sendError(res, 404, 'CALCULATOR_NOT_FOUND', `Unknown calculator: ${slug}`);
          return;
        }
        const body = await readJsonBody(req);
        const parsed = calculateRequestSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid calculator inputs', parsed.error.flatten());
          return;
        }

        const output = runCalculator(slug, parsed.data.inputs);
        let runId: string | null = null;

        if (authUser && parsed.data.saveRun) {
          runId = `calc-${crypto.randomUUID().slice(0, 10)}`;
          const now = new Date().toISOString();
          db.prepare(
            `INSERT INTO calculator_runs (id, user_id, calculator_slug, inputs_json, outputs_json, primary_value, saved_title, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            runId,
            authUser.id,
            slug,
            JSON.stringify({ ...def.defaultInputs, ...parsed.data.inputs }),
            JSON.stringify(output),
            output.primaryMetric.value,
            parsed.data.savedTitle || output.suggestedBudgetTitleAr,
            now,
          );
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'calculator.saved_run',
            targetType: 'calculator_run',
            targetId: runId,
            metadata: { slug, primaryValue: output.primaryMetric.value },
            ipAddress: ip,
          });
        }

        sendJson(res, 200, { ok: true, data: { runId, output } });
        return;
      }

      if (method === 'GET' && route === '/my/calculator-runs') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to view saved calculator runs');
          return;
        }
        const slug = url.searchParams.get('slug');
        const rows = slug
          ? (db
              .prepare(
                'SELECT * FROM calculator_runs WHERE user_id = ? AND calculator_slug = ? ORDER BY created_at DESC LIMIT 30',
              )
              .all(authUser.id, slug) as Record<string, unknown>[])
          : (db
              .prepare('SELECT * FROM calculator_runs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50')
              .all(authUser.id) as Record<string, unknown>[]);

        const runs: CalculatorRunRecord[] = rows.map((r) => ({
          id: String(r.id),
          userId: r.user_id ? String(r.user_id) : null,
          calculatorSlug: String(r.calculator_slug),
          inputs: JSON.parse(String(r.inputs_json || '{}')) as Record<string, number | string | boolean>,
          output: JSON.parse(String(r.outputs_json)) as CalculatorOutput,
          primaryValue: Number(r.primary_value),
          savedTitle: r.saved_title ? String(r.saved_title) : null,
          createdAt: String(r.created_at),
        }));
        sendJson(res, 200, { ok: true, data: runs });
        return;
      }

      if (method === 'DELETE' && route.startsWith('/my/calculator-runs/')) {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const runId = decodeURIComponent(route.slice('/my/calculator-runs/'.length));
        const existing = db
          .prepare('SELECT id, user_id FROM calculator_runs WHERE id = ?')
          .get(runId) as { id: string; user_id: string | null } | undefined;
        if (!existing || existing.user_id !== authUser.id) {
          sendError(res, 404, 'NOT_FOUND', 'Saved calculation run not found');
          return;
        }
        db.prepare('DELETE FROM calculator_runs WHERE id = ? AND user_id = ?').run(runId, authUser.id);
        sendJson(res, 200, { ok: true, data: { deletedId: runId } });
        return;
      }

      // ================= BUDGET MANAGER (OWNER-SCOPED) =================
      if (method === 'GET' && route === '/budget/overview') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to access Wedding Budget Manager');
          return;
        }
        const overview = buildBudgetOverview(db, authUser.id);
        sendJson(res, 200, { ok: true, data: overview });
        return;
      }

      if (method === 'PATCH' && route === '/budget/plan') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = updateBudgetPlanSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid budget plan values', parsed.error.flatten());
          return;
        }
        ensureUserBudgetPlan(db, authUser.id);
        const now = new Date().toISOString();
        db.prepare(
          `UPDATE budget_plans SET
            title_ar = COALESCE(?, title_ar),
            title_en = COALESCE(?, title_en),
            total_budget_limit = COALESCE(?, total_budget_limit),
            groom_contribution_target = COALESCE(?, groom_contribution_target),
            bride_contribution_target = COALESCE(?, bride_contribution_target),
            family_support_target = COALESCE(?, family_support_target),
            emergency_reserve_target = COALESCE(?, emergency_reserve_target),
            updated_at = ?
           WHERE user_id = ?`,
        ).run(
          parsed.data.titleAr ?? null,
          parsed.data.titleEn ?? null,
          parsed.data.totalBudgetLimit ?? null,
          parsed.data.groomContributionTarget ?? null,
          parsed.data.brideContributionTarget ?? null,
          parsed.data.familySupportTarget ?? null,
          parsed.data.emergencyReserveTarget ?? null,
          now,
          authUser.id,
        );
        writeAuditLog(db, {
          actorUserId: authUser.id,
          actorRole: authUser.role,
          action: 'budget.plan_updated',
          targetType: 'budget_plan',
          targetId: authUser.id,
          metadata: parsed.data,
          ipAddress: ip,
        });
        sendJson(res, 200, { ok: true, data: buildBudgetOverview(db, authUser.id) });
        return;
      }

      if (method === 'POST' && route === '/budget/categories') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = upsertBudgetCategorySchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid category details', parsed.error.flatten());
          return;
        }
        const plan = ensureUserBudgetPlan(db, authUser.id);
        db.prepare(
          `INSERT INTO budget_categories (id, budget_plan_id, user_id, slug, name_ar, name_en, owner_side, planned_amount, limit_amount, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(budget_plan_id, slug) DO UPDATE SET
             name_ar = excluded.name_ar,
             name_en = excluded.name_en,
             owner_side = excluded.owner_side,
             planned_amount = excluded.planned_amount,
             limit_amount = excluded.limit_amount`,
        ).run(
          `bc-${crypto.randomUUID().slice(0, 10)}`,
          plan.id,
          authUser.id,
          parsed.data.slug,
          parsed.data.nameAr,
          parsed.data.nameEn,
          parsed.data.ownerSide,
          parsed.data.plannedAmount,
          parsed.data.limitAmount,
          parsed.data.sortOrder ?? 20,
        );
        sendJson(res, 201, { ok: true, data: buildBudgetOverview(db, authUser.id) });
        return;
      }

      if (method === 'PATCH' && route.startsWith('/budget/categories/')) {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const catId = decodeURIComponent(route.slice('/budget/categories/'.length));
        const existing = db
          .prepare('SELECT id, user_id FROM budget_categories WHERE id = ?')
          .get(catId) as { id: string; user_id: string } | undefined;
        if (!existing || existing.user_id !== authUser.id) {
          sendError(res, 404, 'NOT_FOUND', 'Budget category not found');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = patchBudgetCategorySchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid category updates', parsed.error.flatten());
          return;
        }
        db.prepare(
          `UPDATE budget_categories SET
            name_ar = COALESCE(?, name_ar),
            name_en = COALESCE(?, name_en),
            owner_side = COALESCE(?, owner_side),
            planned_amount = COALESCE(?, planned_amount),
            limit_amount = COALESCE(?, limit_amount)
           WHERE id = ? AND user_id = ?`,
        ).run(
          parsed.data.nameAr ?? null,
          parsed.data.nameEn ?? null,
          parsed.data.ownerSide ?? null,
          parsed.data.plannedAmount ?? null,
          parsed.data.limitAmount ?? null,
          catId,
          authUser.id,
        );
        sendJson(res, 200, { ok: true, data: buildBudgetOverview(db, authUser.id) });
        return;
      }

      if (method === 'POST' && route === '/budget/expenses') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = createBudgetExpenseSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid expense fields', parsed.error.flatten());
          return;
        }
        const plan = ensureUserBudgetPlan(db, authUser.id);
        let categoryRow: { id: string } | undefined;
        if (parsed.data.categoryId) {
          categoryRow = db
            .prepare('SELECT id FROM budget_categories WHERE id = ? AND user_id = ?')
            .get(parsed.data.categoryId, authUser.id) as { id: string } | undefined;
        } else if (parsed.data.categorySlug) {
          categoryRow = db
            .prepare('SELECT id FROM budget_categories WHERE slug = ? AND user_id = ?')
            .get(parsed.data.categorySlug, authUser.id) as { id: string } | undefined;
        }
        if (!categoryRow) {
          categoryRow = db
            .prepare('SELECT id FROM budget_categories WHERE user_id = ? ORDER BY sort_order ASC LIMIT 1')
            .get(authUser.id) as { id: string } | undefined;
        }
        if (!categoryRow) {
          sendError(res, 400, 'CATEGORY_MISSING', 'Budget category does not exist');
          return;
        }

        const now = new Date().toISOString();
        if (parsed.data.sourceId && parsed.data.sourceType !== 'manual') {
          const result = upsertBudgetExpenseFromSource(db, {
            userId: authUser.id,
            budgetPlanId: plan.id,
            categoryId: categoryRow.id,
            title: parsed.data.title,
            vendorOrPayee: parsed.data.vendorOrPayee ?? null,
            amount: parsed.data.amount,
            paymentType: parsed.data.paymentType,
            status: parsed.data.status,
            paidBySide: parsed.data.paidBySide,
            dueDate: parsed.data.dueDate ?? null,
            paidAt: parsed.data.paidAt ?? null,
            sourceType: parsed.data.sourceType,
            sourceId: parsed.data.sourceId,
            notes: parsed.data.notes ?? null,
          });
          sendJson(res, result.inserted ? 201 : 200, {
            ok: true,
            data: buildBudgetOverview(db, authUser.id),
          });
          return;
        }

        const expId = `bexp-${crypto.randomUUID().slice(0, 10)}`;
        db.prepare(
          `INSERT INTO budget_expenses
             (id, budget_plan_id, budget_category_id, user_id, title, vendor_or_payee, amount, payment_type, status, paid_by_side, due_date, paid_at, source_type, source_id, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', NULL, ?, ?, ?)`,
        ).run(
          expId,
          plan.id,
          categoryRow.id,
          authUser.id,
          parsed.data.title,
          parsed.data.vendorOrPayee ?? null,
          parsed.data.amount,
          parsed.data.paymentType,
          parsed.data.status,
          parsed.data.paidBySide,
          parsed.data.dueDate ?? null,
          parsed.data.status === 'paid' ? parsed.data.paidAt || now.slice(0, 10) : null,
          parsed.data.notes ?? null,
          now,
          now,
        );

        writeAuditLog(db, {
          actorUserId: authUser.id,
          actorRole: authUser.role,
          action: 'budget.expense_created',
          targetType: 'budget_expense',
          targetId: expId,
          metadata: { amount: parsed.data.amount, status: parsed.data.status },
          ipAddress: ip,
        });
        sendJson(res, 201, { ok: true, data: buildBudgetOverview(db, authUser.id) });
        return;
      }

      if (method === 'PATCH' && route.startsWith('/budget/expenses/')) {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const expId = decodeURIComponent(route.slice('/budget/expenses/'.length));
        const existing = db
          .prepare('SELECT id, user_id, paid_at FROM budget_expenses WHERE id = ?')
          .get(expId) as { id: string; user_id: string; paid_at: string | null } | undefined;
        if (!existing || existing.user_id !== authUser.id) {
          sendError(res, 404, 'NOT_FOUND', 'Budget expense not found');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = patchBudgetExpenseSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid expense update', parsed.error.flatten());
          return;
        }
        const now = new Date().toISOString();
        const resolvedPaidAt =
          parsed.data.paidAt !== undefined
            ? parsed.data.paidAt
            : parsed.data.status === 'paid' && !existing.paid_at
              ? now.slice(0, 10)
              : existing.paid_at;

        db.prepare(
          `UPDATE budget_expenses SET
            title = COALESCE(?, title),
            vendor_or_payee = CASE WHEN ? IS NOT NULL THEN ? ELSE vendor_or_payee END,
            amount = COALESCE(?, amount),
            payment_type = COALESCE(?, payment_type),
            status = COALESCE(?, status),
            paid_by_side = COALESCE(?, paid_by_side),
            due_date = CASE WHEN ? IS NOT NULL THEN ? ELSE due_date END,
            paid_at = ?,
            notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END,
            updated_at = ?
           WHERE id = ? AND user_id = ?`,
        ).run(
          parsed.data.title ?? null,
          parsed.data.vendorOrPayee === undefined ? null : 'set',
          parsed.data.vendorOrPayee ?? null,
          parsed.data.amount ?? null,
          parsed.data.paymentType ?? null,
          parsed.data.status ?? null,
          parsed.data.paidBySide ?? null,
          parsed.data.dueDate === undefined ? null : 'set',
          parsed.data.dueDate ?? null,
          resolvedPaidAt,
          parsed.data.notes === undefined ? null : 'set',
          parsed.data.notes ?? null,
          now,
          expId,
          authUser.id,
        );
        sendJson(res, 200, { ok: true, data: buildBudgetOverview(db, authUser.id) });
        return;
      }

      if (method === 'DELETE' && route.startsWith('/budget/expenses/')) {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const expId = decodeURIComponent(route.slice('/budget/expenses/'.length));
        const existing = db
          .prepare('SELECT id, user_id FROM budget_expenses WHERE id = ?')
          .get(expId) as { id: string; user_id: string } | undefined;
        if (!existing || existing.user_id !== authUser.id) {
          sendError(res, 404, 'NOT_FOUND', 'Budget expense not found');
          return;
        }
        db.prepare('DELETE FROM budget_expenses WHERE id = ? AND user_id = ?').run(expId, authUser.id);
        sendJson(res, 200, { ok: true, data: buildBudgetOverview(db, authUser.id) });
        return;
      }

      if (method === 'POST' && route === '/budget/import-from-calculator') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to link calculator results to your Wedding Budget');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = importCalculatorToBudgetSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid import parameters', parsed.error.flatten());
          return;
        }
        const summary = getCalculatorSummary(parsed.data.calculatorSlug);
        if (!summary) {
          sendError(res, 404, 'CALCULATOR_NOT_FOUND', `Unknown calculator: ${parsed.data.calculatorSlug}`);
          return;
        }

        const output = runCalculator(parsed.data.calculatorSlug, parsed.data.inputs);
        const now = new Date().toISOString();
        let runId = parsed.data.runId;
        if (runId) {
          const runOwned = db
            .prepare('SELECT id FROM calculator_runs WHERE id = ? AND user_id = ?')
            .get(runId, authUser.id) as { id: string } | undefined;
          if (!runOwned) runId = undefined;
        }
        if (!runId) {
          runId = `calc-${crypto.randomUUID().slice(0, 10)}`;
          db.prepare(
            `INSERT INTO calculator_runs (id, user_id, calculator_slug, inputs_json, outputs_json, primary_value, saved_title, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            runId,
            authUser.id,
            parsed.data.calculatorSlug,
            JSON.stringify({ ...summary.defaultInputs, ...parsed.data.inputs }),
            JSON.stringify(output),
            output.primaryMetric.value,
            parsed.data.title || output.suggestedBudgetTitleAr,
            now,
          );
        }

        const plan = ensureUserBudgetPlan(db, authUser.id);
        const targetSlug = parsed.data.categorySlug || output.suggestedBudgetCategorySlug;
        const targetCat =
          (db
            .prepare('SELECT id, name_ar FROM budget_categories WHERE slug = ? AND user_id = ?')
            .get(targetSlug, authUser.id) as { id: string; name_ar: string } | undefined) ||
          (db
            .prepare('SELECT id, name_ar FROM budget_categories WHERE user_id = ? ORDER BY sort_order ASC LIMIT 1')
            .get(authUser.id) as { id: string; name_ar: string });

        const rawAmount = parsed.data.expenseAmount ?? output.primaryMetric.value;
        const safeAmount = Math.max(100, Math.round(rawAmount));

        if (parsed.data.mode === 'set_planned') {
          db.prepare('UPDATE budget_categories SET planned_amount = ? WHERE id = ? AND user_id = ?').run(
            safeAmount,
            targetCat.id,
            authUser.id,
          );
        } else {
          upsertBudgetExpenseFromSource(db, {
            userId: authUser.id,
            budgetPlanId: plan.id,
            categoryId: targetCat.id,
            title: parsed.data.title || output.suggestedBudgetTitleAr,
            vendorOrPayee: `حاسبة: ${output.nameAr}`,
            amount: safeAmount,
            paymentType: parsed.data.mode === 'add_deposit' ? 'deposit' : 'full',
            status: parsed.data.mode === 'add_deposit' ? 'paid' : 'planned',
            paidBySide: parsed.data.paidBySide,
            paidAt: parsed.data.mode === 'add_deposit' ? now.slice(0, 10) : null,
            sourceType: 'calculator_run',
            sourceId: runId,
            notes: `مرتبط بنتيجة الحاسبة (${output.slug}) بدون تكرار`,
          });
        }

        writeAuditLog(db, {
          actorUserId: authUser.id,
          actorRole: authUser.role,
          action: 'budget.imported_calculator',
          targetType: 'calculator_run',
          targetId: runId,
          metadata: { slug: parsed.data.calculatorSlug, mode: parsed.data.mode, amount: safeAmount },
          ipAddress: ip,
        });

        sendJson(res, 200, {
          ok: true,
          data: {
            runId,
            output,
            overview: buildBudgetOverview(db, authUser.id),
          },
        });
        return;
      }

      if (method === 'POST' && route === '/budget/sync-transactions') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
          return;
        }
        const result = syncUserTransactionsToBudget(db, authUser.id);
        writeAuditLog(db, {
          actorUserId: authUser.id,
          actorRole: authUser.role,
          action: 'budget.synced_transactions',
          targetType: 'budget_plan',
          targetId: result.overview.plan.id,
          metadata: { syncedCount: result.syncedCount },
          ipAddress: ip,
        });
        sendJson(res, 200, { ok: true, data: result });
        return;
      }

      // ================= CUSTOMER ORDERS & INQUIRIES (OWNER-SCOPED) =================
      if (method === 'GET' && route === '/orders') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to view your orders');
          return;
        }
        const rows = hasAnyRole(authUser.role, FULL_ADMIN_ROLES)
          ? (db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Record<string, unknown>[])
          : (db
              .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
              .all(authUser.id) as Record<string, unknown>[]);
        sendJson(res, 200, { ok: true, data: mapOrderRows(db, rows) });
        return;
      }

      if (method === 'POST' && route === '/orders') {
        const rate = submitLimiter.check(`order:${ip}`);
        if (!rate.allowed) {
          sendError(res, 429, 'RATE_LIMITED', 'Too many order submissions.');
          return;
        }
        const body = await readJsonBody(req);
        const parsed = createOrderSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid order fields', parsed.error.flatten());
          return;
        }

        const orderId = `ord-${Date.now().toString().slice(-6)}-${crypto.randomUUID().slice(0, 4)}`;
        const now = new Date().toISOString();

        db.exec('BEGIN;');
        try {
          let subtotal = 0;
          const resolvedItems: { product: Product; quantity: number }[] = [];

          for (const reqItem of parsed.data.items) {
            const pRow = db.prepare('SELECT * FROM products WHERE id = ?').get(reqItem.productId) as
              | Record<string, unknown>
              | undefined;
            if (!pRow) {
              throw new Error(`PRODUCT_NOT_FOUND:${reqItem.productId}`);
            }
            const product = mapProductRow(pRow);
            if (product.stock < reqItem.quantity) {
              throw new Error(`INSUFFICIENT_STOCK:${product.id}`);
            }
            subtotal += product.price * reqItem.quantity;
            resolvedItems.push({ product, quantity: reqItem.quantity });
          }

          const deliveryFee = 0;
          const total = subtotal + deliveryFee;

          db.prepare(
            `INSERT INTO orders (id, user_id, customer_name, phone, address, city, subtotal, delivery_fee, total, payment_method, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, ?)`,
          ).run(
            orderId,
            authUser?.id ?? null,
            parsed.data.customerName,
            parsed.data.phone,
            parsed.data.address,
            parsed.data.city,
            subtotal,
            deliveryFee,
            total,
            parsed.data.paymentMethod,
            now,
            now,
          );

          const insertItemStmt = db.prepare(
            `INSERT INTO order_items (id, order_id, product_id, product_snapshot_json, unit_price, quantity)
             VALUES (?, ?, ?, ?, ?, ?)`,
          );
          const decrementStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

          resolvedItems.forEach((it, idx) => {
            insertItemStmt.run(
              `${orderId}-it-${idx + 1}`,
              orderId,
              it.product.id,
              JSON.stringify(it.product),
              it.product.price,
              it.quantity,
            );
            decrementStockStmt.run(it.quantity, it.product.id);
          });

          writeAuditLog(db, {
            actorUserId: authUser?.id ?? null,
            actorRole: authUser?.role ?? 'guest',
            action: 'order.created',
            targetType: 'order',
            targetId: orderId,
            metadata: { total, itemCount: resolvedItems.length },
            ipAddress: ip,
          });

          db.exec('COMMIT;');
          const [createdOrder] = mapOrderRows(db, [
            db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Record<string, unknown>,
          ]);
          sendJson(res, 201, { ok: true, data: createdOrder });
        } catch (err) {
          db.exec('ROLLBACK;');
          const msg = err instanceof Error ? err.message : 'Order creation failed';
          if (msg.startsWith('PRODUCT_NOT_FOUND') || msg.startsWith('INSUFFICIENT_STOCK')) {
            sendError(res, 400, 'ORDER_ITEM_ERROR', msg);
            return;
          }
          throw err;
        }
        return;
      }

      if (method === 'GET' && route === '/finishing-inquiries') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to view your finishing inquiries');
          return;
        }
        const rows = hasAnyRole(authUser.role, FULL_ADMIN_ROLES)
          ? (db.prepare('SELECT * FROM finishing_inquiries ORDER BY created_at DESC').all() as Record<string, unknown>[])
          : (db
              .prepare('SELECT * FROM finishing_inquiries WHERE user_id = ? ORDER BY created_at DESC')
              .all(authUser.id) as Record<string, unknown>[]);
        sendJson(res, 200, { ok: true, data: rows.map(mapFinishingInquiryRow) });
        return;
      }

      if (method === 'POST' && route === '/finishing-inquiries') {
        const body = await readJsonBody(req);
        const parsed = createFinishingInquirySchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid finishing inquiry fields', parsed.error.flatten());
          return;
        }
        const id = `fin-${Date.now().toString().slice(-6)}-${crypto.randomUUID().slice(0, 4)}`;
        const now = new Date().toISOString();
        const estimate = estimateFinishingRange(parsed.data.areaSqm, parsed.data.finishingTier);

        db.prepare(
          `INSERT INTO finishing_inquiries (id, user_id, customer_name, phone, governorate, area_sqm, rooms_count, bathrooms_count, finishing_tier, budget_egp, notes, status, estimated_cost_min, estimated_cost_max, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
        ).run(
          id,
          authUser?.id ?? null,
          parsed.data.customerName,
          parsed.data.phone,
          parsed.data.governorate,
          parsed.data.areaSqm,
          parsed.data.roomsCount,
          parsed.data.bathroomsCount,
          parsed.data.finishingTier,
          parsed.data.budgetEGP ?? Math.round((estimate.min + estimate.max) / 2),
          parsed.data.notes ?? null,
          estimate.min,
          estimate.max,
          now,
          now,
        );

        const row = db.prepare('SELECT * FROM finishing_inquiries WHERE id = ?').get(id) as Record<string, unknown>;
        sendJson(res, 201, { ok: true, data: mapFinishingInquiryRow(row) });
        return;
      }

      if (method === 'GET' && route === '/wedding-bookings') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to view your wedding bookings');
          return;
        }
        const rows = hasAnyRole(authUser.role, FULL_ADMIN_ROLES)
          ? (db.prepare('SELECT * FROM wedding_bookings ORDER BY created_at DESC').all() as Record<string, unknown>[])
          : (db
              .prepare('SELECT * FROM wedding_bookings WHERE user_id = ? ORDER BY created_at DESC')
              .all(authUser.id) as Record<string, unknown>[]);
        sendJson(res, 200, { ok: true, data: rows.map(mapWeddingBookingRow) });
        return;
      }

      if (method === 'POST' && route === '/wedding-bookings') {
        const body = await readJsonBody(req);
        const parsed = createWeddingBookingSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid booking inquiry fields', parsed.error.flatten());
          return;
        }

        const srvRow = db.prepare('SELECT * FROM wedding_services WHERE id = ?').get(parsed.data.serviceId) as
          | Record<string, unknown>
          | undefined;
        if (!srvRow) {
          sendError(res, 404, 'SERVICE_NOT_FOUND', 'Wedding service does not exist');
          return;
        }

        const id = `wed-${Date.now().toString().slice(-6)}-${crypto.randomUUID().slice(0, 4)}`;
        const now = new Date().toISOString();

        db.prepare(
          `INSERT INTO wedding_bookings (id, user_id, service_id, service_name, category, customer_name, phone, wedding_date, guest_count, governorate, notes, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, ?)`,
        ).run(
          id,
          authUser?.id ?? null,
          String(srvRow.id),
          String(srvRow.name_ar),
          String(srvRow.category),
          parsed.data.customerName,
          parsed.data.phone,
          parsed.data.weddingDate,
          parsed.data.guestCount ?? null,
          parsed.data.governorate,
          parsed.data.notes ?? null,
          now,
          now,
        );

        const row = db.prepare('SELECT * FROM wedding_bookings WHERE id = ?').get(id) as Record<string, unknown>;
        sendJson(res, 201, { ok: true, data: mapWeddingBookingRow(row) });
        return;
      }

      if (method === 'GET' && route === '/financing-applications') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Sign in to view financing applications');
          return;
        }
        const rows = hasAnyRole(authUser.role, FULL_ADMIN_ROLES)
          ? (db
              .prepare('SELECT * FROM financing_applications ORDER BY created_at DESC')
              .all() as Record<string, unknown>[])
          : (db
              .prepare('SELECT * FROM financing_applications WHERE user_id = ? ORDER BY created_at DESC')
              .all(authUser.id) as Record<string, unknown>[]);
        sendJson(res, 200, { ok: true, data: rows.map(mapFinancingRow) });
        return;
      }

      if (method === 'POST' && route === '/financing-applications') {
        const body = await readJsonBody(req);
        const parsed = createFinancingSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid financing fields', parsed.error.flatten());
          return;
        }

        const id = `fnc-${Date.now().toString().slice(-6)}-${crypto.randomUUID().slice(0, 4)}`;
        const now = new Date().toISOString();
        const maskedNid = maskNationalId(parsed.data.nationalId);
        const nidHash = hashSensitiveField(parsed.data.nationalId, options.sessionSecret);

        db.prepare(
          `INSERT INTO financing_applications (id, user_id, customer_name, phone, national_id_masked, national_id_hash, monthly_income, employer, governorate, requested_amount, tenure_months, preferred_provider, associated_section, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
        ).run(
          id,
          authUser?.id ?? null,
          parsed.data.customerName,
          parsed.data.phone,
          maskedNid,
          nidHash,
          parsed.data.monthlyIncome,
          parsed.data.employer,
          parsed.data.governorate,
          parsed.data.requestedAmount,
          parsed.data.tenureMonths,
          parsed.data.preferredProvider,
          parsed.data.associatedSection,
          now,
          now,
        );

        const row = db.prepare('SELECT * FROM financing_applications WHERE id = ?').get(id) as Record<string, unknown>;
        sendJson(res, 201, { ok: true, data: mapFinancingRow(row) });
        return;
      }

      if (method === 'GET' && route === '/support-cases') {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication required to inspect support cases');
          return;
        }
        const canReviewAll = hasAnyRole(authUser.role, MODERATION_ROLES);
        const rows = canReviewAll
          ? (db.prepare('SELECT * FROM support_cases ORDER BY created_at DESC').all() as Record<string, unknown>[])
          : (db
              .prepare('SELECT * FROM support_cases WHERE user_id = ? ORDER BY created_at DESC')
              .all(authUser.id) as Record<string, unknown>[]);
        sendJson(res, 200, { ok: true, data: rows.map(mapSupportRow) });
        return;
      }

      if (method === 'POST' && route === '/support-cases') {
        const body = await readJsonBody(req);
        const parsed = createSupportCaseSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid support case details', parsed.error.flatten());
          return;
        }

        const id = `sup-${Date.now().toString().slice(-6)}-${crypto.randomUUID().slice(0, 4)}`;
        const now = new Date().toISOString();
        const maskedNid = maskNationalId(parsed.data.nationalId);
        const nidHash = hashSensitiveField(parsed.data.nationalId, options.sessionSecret);

        db.prepare(
          `INSERT INTO support_cases (id, user_id, applicant_name, national_id_masked, national_id_hash, phone, governorate, address, category, case_description, urgency_level, documents_submitted_json, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confidential_review', ?, ?)`,
        ).run(
          id,
          authUser?.id ?? null,
          parsed.data.applicantName,
          maskedNid,
          nidHash,
          parsed.data.phone,
          parsed.data.governorate,
          parsed.data.address,
          parsed.data.category,
          parsed.data.caseDescription,
          parsed.data.urgencyLevel,
          JSON.stringify(parsed.data.documentsSubmitted),
          now,
          now,
        );

        writeAuditLog(db, {
          actorUserId: authUser?.id ?? null,
          actorRole: authUser?.role ?? 'guest',
          action: 'support_case.submitted',
          targetType: 'support_case',
          targetId: id,
          ipAddress: ip,
        });

        const row = db.prepare('SELECT * FROM support_cases WHERE id = ?').get(id) as Record<string, unknown>;
        sendJson(res, 201, { ok: true, data: mapSupportRow(row) });
        return;
      }

      if (method === 'POST' && route === '/sponsorship-inquiries') {
        const body = await readJsonBody(req);
        const parsed = createSponsorshipSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Invalid sponsorship fields', parsed.error.flatten());
          return;
        }
        const id = `spn-${Date.now().toString().slice(-6)}-${crypto.randomUUID().slice(0, 4)}`;
        const now = new Date().toISOString();
        db.prepare(
          `INSERT INTO sponsorship_inquiries (id, sponsor_name, company_name, phone, email, contribution_type, pledge_amount, message, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
        ).run(
          id,
          parsed.data.sponsorName,
          parsed.data.companyName ?? null,
          parsed.data.phone,
          parsed.data.email,
          parsed.data.contributionType,
          parsed.data.pledgeAmount ?? null,
          parsed.data.message,
          now,
        );
        const row = db.prepare('SELECT * FROM sponsorship_inquiries WHERE id = ?').get(id) as Record<string, unknown>;
        const out: SponsorshipInquiry = {
          id: String(row.id),
          sponsorName: String(row.sponsor_name),
          companyName: row.company_name ? String(row.company_name) : undefined,
          phone: String(row.phone),
          email: String(row.email),
          contributionType: row.contribution_type as SponsorshipInquiry['contributionType'],
          pledgeAmount: row.pledge_amount != null ? Number(row.pledge_amount) : undefined,
          message: String(row.message),
          status: row.status as SponsorshipInquiry['status'],
          createdAt: String(row.created_at),
        };
        sendJson(res, 201, { ok: true, data: out });
        return;
      }

      // ================= ADMIN / STAFF RBAC ROUTES =================
      if (route.startsWith('/admin/')) {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Staff authentication required');
          return;
        }
        if (!hasAnyRole(authUser.role, ADMIN_PANEL_ROLES)) {
          sendError(res, 403, 'FORBIDDEN', 'Insufficient privileges to access Admin OS');
          return;
        }

        if (method === 'GET' && route === '/admin/overview') {
          const users = (
            db.prepare('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC').all() as Record<
              string,
              unknown
            >[]
          ).map(mapUserRow);

          const isFullAdmin = hasAnyRole(authUser.role, FULL_ADMIN_ROLES);
          const canModerate = hasAnyRole(authUser.role, MODERATION_ROLES);

          const orders = isFullAdmin
            ? mapOrderRows(
                db,
                db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Record<string, unknown>[],
              )
            : [];
          const finishingInquiries = isFullAdmin
            ? (db
                .prepare('SELECT * FROM finishing_inquiries ORDER BY created_at DESC')
                .all() as Record<string, unknown>[]).map(mapFinishingInquiryRow)
            : [];
          const weddingBookings = isFullAdmin
            ? (db
                .prepare('SELECT * FROM wedding_bookings ORDER BY created_at DESC')
                .all() as Record<string, unknown>[]).map(mapWeddingBookingRow)
            : [];
          const financingApplications = isFullAdmin
            ? (db
                .prepare('SELECT * FROM financing_applications ORDER BY created_at DESC')
                .all() as Record<string, unknown>[]).map(mapFinancingRow)
            : [];
          const supportCases = canModerate
            ? (db
                .prepare('SELECT * FROM support_cases ORDER BY created_at DESC')
                .all() as Record<string, unknown>[]).map(mapSupportRow)
            : [];
          const sponsorships = isFullAdmin
            ? (db
                .prepare('SELECT * FROM sponsorship_inquiries ORDER BY created_at DESC')
                .all() as Record<string, unknown>[]).map((r) => ({
                id: String(r.id),
                sponsorName: String(r.sponsor_name),
                companyName: r.company_name ? String(r.company_name) : undefined,
                phone: String(r.phone),
                email: String(r.email),
                contributionType: r.contribution_type as SponsorshipInquiry['contributionType'],
                pledgeAmount: r.pledge_amount != null ? Number(r.pledge_amount) : undefined,
                message: String(r.message),
                status: r.status as SponsorshipInquiry['status'],
                createdAt: String(r.created_at),
              }))
            : [];

          const articles = (
            db.prepare('SELECT * FROM articles ORDER BY updated_at DESC').all() as Record<string, unknown>[]
          ).map(mapArticleRow);

          const auditLogs = isFullAdmin
            ? (
                db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all() as Record<
                  string,
                  unknown
                >[]
              ).map(
                (r): AuditLogEntry => ({
                  id: String(r.id),
                  actorUserId: r.actor_user_id ? String(r.actor_user_id) : null,
                  actorRole: String(r.actor_role),
                  action: String(r.action),
                  targetType: String(r.target_type),
                  targetId: r.target_id ? String(r.target_id) : null,
                  metadata: JSON.parse(String(r.metadata_json || '{}')) as Record<string, unknown>,
                  ipAddress: r.ip_address ? String(r.ip_address) : null,
                  createdAt: String(r.created_at),
                }),
              )
            : [];

          const counts = {
            totalUsers: users.length,
            activeCustomers: users.filter((u) => u.role === 'customer' && u.status === 'active').length,
            totalOrders: orders.length,
            totalFinishing: finishingInquiries.length,
            totalBookings: weddingBookings.length,
            totalFinancing: financingApplications.length,
            totalSupport: supportCases.length,
            totalArticles: articles.length,
          };

          sendJson(res, 200, {
            ok: true,
            data: {
              counts,
              users: isFullAdmin ? users : [],
              orders,
              finishingInquiries,
              weddingBookings,
              financingApplications,
              supportCases,
              sponsorships,
              articles,
              auditLogs,
            },
          });
          return;
        }

        // Products Admin CRUD
        if (method === 'POST' && route === '/admin/products') {
          if (!hasAnyRole(authUser.role, CMS_EDITOR_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires editor or admin role');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = productUpsertSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid product inputs', parsed.error.flatten());
            return;
          }
          const id = parsed.data.id || `${parsed.data.trousseauType}-p-${Date.now().toString().slice(-5)}`;
          const now = new Date().toISOString();
          db.prepare(
            `INSERT INTO products (id, slug, sku, trousseau_type, category, category_ar, category_en, name_ar, name_en, brand, price, original_price, stock, image_url, gallery_json, description_ar, description_en, specs_ar_json, specs_en_json, price_source, price_updated_at, is_featured, is_ready_package_item, is_demo_data, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, 'Admin Entry', ?, ?, ?, 0, ?, ?)`,
          ).run(
            id,
            id,
            parsed.data.sku,
            parsed.data.trousseauType,
            parsed.data.category,
            parsed.data.categoryAr,
            parsed.data.categoryEn,
            parsed.data.nameAr,
            parsed.data.nameEn,
            parsed.data.brand,
            parsed.data.price,
            parsed.data.originalPrice ?? null,
            parsed.data.stock,
            parsed.data.imageUrl,
            parsed.data.descriptionAr,
            parsed.data.descriptionEn,
            JSON.stringify(parsed.data.specsAr),
            JSON.stringify(parsed.data.specsEn),
            now,
            parsed.data.isFeatured ? 1 : 0,
            parsed.data.isReadyPackageItem ? 1 : 0,
            now,
            now,
          );
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'admin.product_created',
            targetType: 'product',
            targetId: id,
            ipAddress: ip,
          });
          const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Record<string, unknown>;
          sendJson(res, 201, { ok: true, data: mapProductRow(row) });
          return;
        }

        if (method === 'PATCH' && route.startsWith('/admin/products/')) {
          if (!hasAnyRole(authUser.role, CMS_EDITOR_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires editor or admin role');
            return;
          }
          const id = decodeURIComponent(route.slice('/admin/products/'.length));
          const body = await readJsonBody(req);
          const parsed = productUpsertSchema.partial().safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid product update', parsed.error.flatten());
            return;
          }
          const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as
            | Record<string, unknown>
            | undefined;
          if (!existing) {
            sendError(res, 404, 'NOT_FOUND', 'Product not found');
            return;
          }
          const d = parsed.data;
          const now = new Date().toISOString();
          db.prepare(
            `UPDATE products SET
              name_ar = COALESCE(?, name_ar),
              name_en = COALESCE(?, name_en),
              brand = COALESCE(?, brand),
              category = COALESCE(?, category),
              category_ar = COALESCE(?, category_ar),
              category_en = COALESCE(?, category_en),
              price = COALESCE(?, price),
              stock = COALESCE(?, stock),
              image_url = COALESCE(?, image_url),
              description_ar = COALESCE(?, description_ar),
              description_en = COALESCE(?, description_en),
              updated_at = ?
             WHERE id = ?`,
          ).run(
            d.nameAr ?? null,
            d.nameEn ?? null,
            d.brand ?? null,
            d.category ?? null,
            d.categoryAr ?? null,
            d.categoryEn ?? null,
            d.price ?? null,
            d.stock ?? null,
            d.imageUrl ?? null,
            d.descriptionAr ?? null,
            d.descriptionEn ?? null,
            now,
            id,
          );
          const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Record<string, unknown>;
          sendJson(res, 200, { ok: true, data: mapProductRow(row) });
          return;
        }

        if (method === 'DELETE' && route.startsWith('/admin/products/')) {
          if (!hasAnyRole(authUser.role, FULL_ADMIN_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires admin role');
            return;
          }
          const id = decodeURIComponent(route.slice('/admin/products/'.length));
          db.prepare('DELETE FROM products WHERE id = ?').run(id);
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'admin.product_deleted',
            targetType: 'product',
            targetId: id,
            ipAddress: ip,
          });
          sendJson(res, 200, { ok: true, data: { deleted: true } });
          return;
        }

        // Wedding Services Admin CRUD
        if (method === 'POST' && route === '/admin/wedding-services') {
          if (!hasAnyRole(authUser.role, CMS_EDITOR_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires editor or admin role');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = weddingServiceUpsertSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid wedding service data', parsed.error.flatten());
            return;
          }
          const id = parsed.data.id || `wed-${Date.now().toString().slice(-6)}`;
          const now = new Date().toISOString();
          db.prepare(
            `INSERT INTO wedding_services (id, slug, category, name_ar, name_en, governorate_slug, location_ar, location_en, starting_price, pricing_type, image_url, gallery_json, rating, reviews_count, capacity, description_ar, description_en, features_ar_json, features_en_json, badge, is_demo_data, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.8, 0, ?, ?, ?, ?, ?, ?, 0, ?)`,
          ).run(
            id,
            id,
            parsed.data.category,
            parsed.data.nameAr,
            parsed.data.nameEn,
            parsed.data.governorateSlug ?? null,
            parsed.data.locationAr,
            parsed.data.locationEn,
            parsed.data.startingPrice,
            parsed.data.pricingType,
            parsed.data.imageUrl,
            JSON.stringify(parsed.data.galleryUrls),
            parsed.data.capacity ?? null,
            parsed.data.descriptionAr,
            parsed.data.descriptionEn,
            JSON.stringify(parsed.data.featuresAr),
            JSON.stringify(parsed.data.featuresEn),
            parsed.data.badge ?? null,
            now,
          );
          const row = db.prepare('SELECT * FROM wedding_services WHERE id = ?').get(id) as Record<string, unknown>;
          sendJson(res, 201, { ok: true, data: mapWeddingServiceRow(row) });
          return;
        }

        if (method === 'PATCH' && route.startsWith('/admin/wedding-services/')) {
          if (!hasAnyRole(authUser.role, CMS_EDITOR_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires editor or admin role');
            return;
          }
          const id = decodeURIComponent(route.slice('/admin/wedding-services/'.length));
          const body = await readJsonBody(req);
          const parsed = weddingServiceUpsertSchema.partial().safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid wedding service update', parsed.error.flatten());
            return;
          }
          const existing = db.prepare('SELECT * FROM wedding_services WHERE id = ?').get(id) as
            | Record<string, unknown>
            | undefined;
          if (!existing) {
            sendError(res, 404, 'NOT_FOUND', 'Wedding service not found');
            return;
          }
          const d = parsed.data;
          db.prepare(
            `UPDATE wedding_services SET
              category = COALESCE(?, category),
              name_ar = COALESCE(?, name_ar),
              name_en = COALESCE(?, name_en),
              governorate_slug = COALESCE(?, governorate_slug),
              location_ar = COALESCE(?, location_ar),
              location_en = COALESCE(?, location_en),
              starting_price = COALESCE(?, starting_price),
              pricing_type = COALESCE(?, pricing_type),
              image_url = COALESCE(?, image_url),
              capacity = COALESCE(?, capacity),
              description_ar = COALESCE(?, description_ar),
              description_en = COALESCE(?, description_en),
              badge = COALESCE(?, badge)
             WHERE id = ?`,
          ).run(
            d.category ?? null,
            d.nameAr ?? null,
            d.nameEn ?? null,
            d.governorateSlug ?? null,
            d.locationAr ?? null,
            d.locationEn ?? null,
            d.startingPrice ?? null,
            d.pricingType ?? null,
            d.imageUrl ?? null,
            d.capacity ?? null,
            d.descriptionAr ?? null,
            d.descriptionEn ?? null,
            d.badge ?? null,
            id,
          );
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'admin.wedding_service_updated',
            targetType: 'wedding_service',
            targetId: id,
            ipAddress: ip,
          });
          const row = db.prepare('SELECT * FROM wedding_services WHERE id = ?').get(id) as Record<string, unknown>;
          sendJson(res, 200, { ok: true, data: mapWeddingServiceRow(row) });
          return;
        }

        if (method === 'DELETE' && route.startsWith('/admin/wedding-services/')) {
          if (!hasAnyRole(authUser.role, FULL_ADMIN_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires admin role');
            return;
          }
          const id = decodeURIComponent(route.slice('/admin/wedding-services/'.length));
          db.prepare('DELETE FROM wedding_services WHERE id = ?').run(id);
          sendJson(res, 200, { ok: true, data: { deleted: true } });
          return;
        }

        // CMS Articles CRUD
        if (method === 'POST' && route === '/admin/articles') {
          if (!hasAnyRole(authUser.role, CMS_EDITOR_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires editor or admin role');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = articleUpsertSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid article fields', parsed.error.flatten());
            return;
          }
          const id = parsed.data.id || `art-${Date.now().toString().slice(-6)}`;
          const now = new Date().toISOString();
          db.prepare(
            `INSERT INTO articles (id, slug, category_id, domain, content_type, title_ar, title_en, excerpt_ar, excerpt_en, body_ar, body_en, featured_image, author_id, author_name, tags_json, faq_json, related_calculators_json, status, reading_minutes, view_count, is_featured, published_at, updated_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, 0, ?, ?, ?, ?)`,
          ).run(
            id,
            parsed.data.slug,
            parsed.data.categoryId,
            parsed.data.domain,
            parsed.data.contentType,
            parsed.data.titleAr,
            parsed.data.titleEn,
            parsed.data.excerptAr,
            parsed.data.excerptEn,
            parsed.data.bodyAr,
            parsed.data.bodyEn,
            parsed.data.featuredImage,
            authUser.id,
            authUser.name,
            JSON.stringify(parsed.data.tags),
            JSON.stringify(parsed.data.relatedCalculators),
            parsed.data.status,
            parsed.data.readingMinutes,
            parsed.data.isFeatured ? 1 : 0,
            now,
            now,
            now,
          );
          const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as Record<string, unknown>;
          sendJson(res, 201, { ok: true, data: mapArticleRow(row) });
          return;
        }

        // Status updates
        const statusMatch = route.match(
          /^\/admin\/(orders|finishing-inquiries|wedding-bookings|financing-applications|support-cases)\/([^/]+)\/status$/,
        );
        if (method === 'PATCH' && statusMatch) {
          const resource = statusMatch[1];
          const id = decodeURIComponent(statusMatch[2]);
          if (resource === 'support-cases' && !hasAnyRole(authUser.role, MODERATION_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires moderator or admin role');
            return;
          }
          if (resource !== 'support-cases' && !hasAnyRole(authUser.role, FULL_ADMIN_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires admin role');
            return;
          }
          const body = (await readJsonBody(req)) as { status?: string };
          if (!body.status) {
            sendError(res, 400, 'VALIDATION_ERROR', 'status field is required');
            return;
          }
          const tableMap: Record<string, string> = {
            orders: 'orders',
            'finishing-inquiries': 'finishing_inquiries',
            'wedding-bookings': 'wedding_bookings',
            'financing-applications': 'financing_applications',
            'support-cases': 'support_cases',
          };
          const table = tableMap[resource];
          db.prepare(`UPDATE ${table} SET status = ?, updated_at = ? WHERE id = ?`).run(
            body.status,
            new Date().toISOString(),
            id,
          );
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: `admin.${resource}_status_updated`,
            targetType: resource,
            targetId: id,
            metadata: { status: body.status },
            ipAddress: ip,
          });
          sendJson(res, 200, { ok: true, data: { id, status: body.status } });
          return;
        }

        if (method === 'PATCH' && route === '/admin/settings') {
          if (!hasAnyRole(authUser.role, FULL_ADMIN_ROLES)) {
            sendError(res, 403, 'FORBIDDEN', 'Requires admin role');
            return;
          }
          const body = await readJsonBody(req);
          const now = new Date().toISOString();
          db.prepare("UPDATE platform_settings SET value_json = ?, updated_at = ? WHERE key = 'main'").run(
            JSON.stringify(body),
            now,
          );
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'admin.settings_updated',
            targetType: 'platform_settings',
            targetId: 'main',
            ipAddress: ip,
          });
          sendJson(res, 200, { ok: true, data: body });
          return;
        }
      }

      sendError(res, 404, 'API_ROUTE_NOT_FOUND', `No handler for ${method} ${pathname}`);
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_JSON') {
        sendError(res, 400, 'INVALID_JSON', 'Malformed JSON body');
        return;
      }
      if (err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE') {
        sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'Request payload exceeds 1MB limit');
        return;
      }
      console.error('[GAWAZ INN API Error]', err);
      sendError(res, 500, 'INTERNAL_ERROR', 'Internal server error');
    }
  };
}

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
  EARLY_START_ACADEMY_LESSONS,
  EARLY_START_TIMEFRAME_PRESETS,
} from '../shared/earlyStartData';
import {
  articleUpsertSchema,
  calculateRequestSchema,
  createBudgetExpenseSchema,
  createEarlyStartMilestoneSchema,
  createFinancingSchema,
  createFinishingInquirySchema,
  createOrderSchema,
  createSavingsContributionSchema,
  createSavingsGoalSchema,
  createSponsorshipSchema,
  createSupportCaseSchema,
  createWeddingBookingSchema,
  importCalculatorToBudgetSchema,
  loginSchema,
  normalizeEgyptianPhone,
  patchBudgetCategorySchema,
  patchBudgetExpenseSchema,
  patchEarlyStartMilestoneSchema,
  patchSavingsGoalSchema,
  productUpsertSchema,
  registerSchema,
  updateBudgetPlanSchema,
  updateEarlyStartProfileSchema,
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
  buildEarlyStartOverview,
  computeExpectedDateFromMonths,
  ensureUserEarlyStartProfile,
  evaluateAndAwardPrivateBadges,
  recordGoalContribution,
} from './earlyStartService';
import {
  addUserNotification,
  buildCoupleWorkspacePayload,
  buildEngagementOverview,
  buildJourneyOverview,
  buildMyGawazInnHubPayload,
  ensureUserEngagementAndJourney,
  listVisibleDocumentsForUser,
  mapAppointmentRow,
  mapDocumentRow,
  mapWarrantyRow,
  resolveActiveWorkspaceForUser,
  transitionLifecycleStage,
} from './journeyWorkspaceService';
import {
  createEngagementItemSchema,
  createJourneyTaskSchema,
  createTaskCommentSchema,
  createUserAppointmentSchema,
  createUserDocumentSchema,
  createUserWarrantySchema,
  createWorkspaceApprovalSchema,
  decideWorkspaceApprovalSchema,
  inviteWorkspacePartnerSchema,
  onboardingStageTransitionSchema,
  patchEngagementItemSchema,
  patchJourneyTaskSchema,
  patchUserAppointmentSchema,
  updateEngagementPlanSchema,
  updateWorkspaceMetaSchema,
  workspacePermissionsSchema,
  compareProductsRequestSchema,
  createShoppingListSchema,
  patchShoppingListSchema,
  createShoppingListItemSchema,
  patchShoppingListItemSchema,
  createPriceAlertSchema,
  patchPriceAlertSchema,
} from '../shared/schemas';
import {
  authorizeShoppingListAccess,
  compareProductsByIds,
  evaluateTriggeredPriceAlertsForProduct,
  getProductEncyclopediaDetail,
  listPriceAlertsForUser,
  listShoppingListsForUser,
  mapProductEncyclopediaRow,
  upsertUserPriceAlert,
} from './productShoppingService';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../shared/journeyWorkspaceData';
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
  return mapProductEncyclopediaRow(row);
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
          '/early-start',
          '/early-start/academy',
          '/onboarding',
          '/engagement',
          '/journey',
          '/products',
          '/products/compare',
          ...listCalculatorSummaries().map((c) => `/calculators/${encodeURIComponent(c.slug)}`),
        ];
        const articles = db
          .prepare("SELECT slug, updated_at FROM articles WHERE status = 'published'")
          .all() as { slug: string; updated_at: string }[];
        const locations = db
          .prepare("SELECT slug FROM locations WHERE level IN ('governorate', 'city')")
          .all() as { slug: string }[];
        const productSlugs = db
          .prepare('SELECT slug, updated_at FROM products')
          .all() as { slug: string; updated_at: string }[];

        const urlsXml = [
          ...staticRoutes.map(
            (r) => `<url><loc>${baseUrl}${r}</loc><changefreq>weekly</changefreq></url>`,
          ),
          ...productSlugs.map(
            (p) =>
              `<url><loc>${baseUrl}/products/${encodeURIComponent(p.slug)}</loc><lastmod>${p.updated_at.slice(0, 10)}</lastmod><changefreq>weekly</changefreq></url>`,
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
        const typeFilter = url.searchParams.get('type') || url.searchParams.get('trousseauType');
        const categoryFilter = url.searchParams.get('category');
        const brandFilter = (url.searchParams.get('brand') || '').trim().toLowerCase();
        const energyFilter = url.searchParams.get('energyRating');
        const maxPrice = Number(url.searchParams.get('maxPrice') || '0');
        const q = (url.searchParams.get('q') || '').trim().toLowerCase();
        const sort = url.searchParams.get('sort') || url.searchParams.get('sortBy') || 'featured';

        let items = (
          db.prepare('SELECT * FROM products ORDER BY is_featured DESC, created_at DESC').all() as Record<
            string,
            unknown
          >[]
        ).map(mapProductRow);

        if (typeFilter) items = items.filter((p) => p.trousseauType === typeFilter);
        if (categoryFilter) items = items.filter((p) => p.category === categoryFilter);
        if (brandFilter) items = items.filter((p) => p.brand.toLowerCase().includes(brandFilter));
        if (energyFilter) items = items.filter((p) => p.energyRating === energyFilter);
        if (maxPrice > 0) items = items.filter((p) => p.price <= maxPrice);
        if (q) {
          items = items.filter((p) =>
            `${p.nameAr} ${p.nameEn} ${p.brand} ${p.model || ''} ${p.categoryAr} ${p.categoryEn} ${p.descriptionAr} ${p.descriptionEn}`
              .toLowerCase()
              .includes(q),
          );
        }

        if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
        else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
        else if (sort === 'warranty_desc') items.sort((a, b) => (b.warrantyMonths ?? 0) - (a.warrantyMonths ?? 0));

        sendJson(res, 200, { ok: true, data: items });
        return;
      }

      if (method === 'GET' && route === '/products/compare') {
        const rawIds = url.searchParams.get('ids') || '';
        const ids = rawIds
          .split(',')
          .map((s) => decodeURIComponent(s.trim()))
          .filter(Boolean);
        sendJson(res, 200, { ok: true, data: compareProductsByIds(db, ids) });
        return;
      }

      if (method === 'POST' && route === '/products/compare') {
        const body = await readJsonBody(req);
        const parsed = compareProductsRequestSchema.safeParse(body);
        if (!parsed.success) {
          sendError(res, 400, 'VALIDATION_ERROR', 'Provide 1 to 4 product IDs to compare', parsed.error.flatten());
          return;
        }
        sendJson(res, 200, { ok: true, data: compareProductsByIds(db, parsed.data.ids) });
        return;
      }

      if (method === 'GET' && route.startsWith('/products/')) {
        const token = decodeURIComponent(route.slice('/products/'.length));
        const detail = getProductEncyclopediaDetail(db, token);
        if (!detail) {
          sendError(res, 404, 'NOT_FOUND', 'Product not found');
          return;
        }
        sendJson(res, 200, { ok: true, data: detail });
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

      // ================= STAGE 4: EARLY START & MY FUTURE FUND (MODULE A) =================
      if (method === 'GET' && route === '/early-start/academy') {
        const completedSlugs = authUser
          ? (
              db
                .prepare('SELECT lesson_slug FROM early_start_lesson_progress WHERE user_id = ? ORDER BY completed_at ASC')
                .all(authUser.id) as { lesson_slug: string }[]
            ).map((r) => r.lesson_slug)
          : [];
        sendJson(res, 200, {
          ok: true,
          data: {
            lessons: EARLY_START_ACADEMY_LESSONS,
            completedSlugs,
          },
        });
        return;
      }

      if (route.startsWith('/early-start/')) {
        if (!authUser) {
          sendError(
            res,
            401,
            'UNAUTHORIZED',
            'Sign in to access your private Early Start & Future Fund workspace',
          );
          return;
        }

        if (method === 'GET' && route === '/early-start/overview') {
          sendJson(res, 200, { ok: true, data: buildEarlyStartOverview(db, authUser.id) });
          return;
        }

        if (method === 'PUT' && route === '/early-start/profile') {
          const body = await readJsonBody(req);
          const parsed = updateEarlyStartProfileSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid Early Start profile settings', parsed.error.flatten());
            return;
          }
          const currentProfile = ensureUserEarlyStartProfile(db, authUser.id);
          const nextPreset = parsed.data.timeframePreset ?? currentProfile.timeframePreset;
          const presetMeta = EARLY_START_TIMEFRAME_PRESETS.find((p) => p.key === nextPreset);

          let nextMonths = parsed.data.timeframeMonths;
          if (nextMonths === undefined) {
            if (parsed.data.timeframePreset && parsed.data.timeframePreset !== 'custom' && presetMeta) {
              nextMonths = presetMeta.months;
            } else {
              nextMonths = currentProfile.timeframeMonths;
            }
          }

          let nextExpectedDate = parsed.data.expectedMarriageDate;
          if (nextExpectedDate === undefined) {
            if (nextMonths !== currentProfile.timeframeMonths || !currentProfile.expectedMarriageDate) {
              nextExpectedDate = computeExpectedDateFromMonths(nextMonths);
            } else {
              nextExpectedDate = currentProfile.expectedMarriageDate;
            }
          }

          const now = new Date().toISOString();
          db.prepare(
            `UPDATE early_start_profiles SET
              timeframe_preset = ?,
              timeframe_months = ?,
              expected_marriage_date = ?,
              target_marriage_budget = COALESCE(?, target_marriage_budget),
              initial_capital = COALESCE(?, initial_capital),
              monthly_savings_target = COALESCE(?, monthly_savings_target),
              emergency_reserve_target = COALESCE(?, emergency_reserve_target),
              reminder_frequency = COALESCE(?, reminder_frequency),
              personal_notes = CASE WHEN ? IS NOT NULL THEN ? ELSE personal_notes END,
              updated_at = ?
             WHERE user_id = ?`,
          ).run(
            nextPreset,
            nextMonths,
            nextExpectedDate ?? null,
            parsed.data.targetMarriageBudget ?? null,
            parsed.data.initialCapital ?? null,
            parsed.data.monthlySavingsTarget ?? null,
            parsed.data.emergencyReserveTarget ?? null,
            parsed.data.reminderFrequency ?? null,
            parsed.data.personalNotes === undefined ? null : 'set',
            parsed.data.personalNotes ?? null,
            now,
            authUser.id,
          );

          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'early_start.profile_updated',
            targetType: 'early_start_profile',
            targetId: authUser.id,
            metadata: { preset: nextPreset, months: nextMonths },
            ipAddress: ip,
          });
          sendJson(res, 200, { ok: true, data: buildEarlyStartOverview(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/early-start/goals') {
          const body = await readJsonBody(req);
          const parsed = createSavingsGoalSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid savings goal details', parsed.error.flatten());
            return;
          }
          ensureUserEarlyStartProfile(db, authUser.id);
          const goalId = `sg-${crypto.randomUUID().slice(0, 10)}`;
          const now = new Date().toISOString();
          const dateStr = now.slice(0, 10);
          const streakMonth = dateStr.slice(0, 7);

          db.exec('BEGIN;');
          let newlyEarnedBadges = [];
          try {
            db.prepare(
              `INSERT INTO savings_goals
                 (id, user_id, goal_type, title_ar, title_en, target_amount, current_amount, monthly_contribution, target_date, priority, is_private, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
            ).run(
              goalId,
              authUser.id,
              parsed.data.goalType,
              parsed.data.titleAr,
              parsed.data.titleEn,
              parsed.data.targetAmount,
              parsed.data.currentAmount,
              parsed.data.monthlyContribution,
              parsed.data.targetDate ?? null,
              parsed.data.priority,
              now,
              now,
            );

            if (parsed.data.currentAmount > 0) {
              db.prepare(
                `INSERT INTO savings_contributions
                   (id, savings_goal_id, user_id, amount, contribution_type, contribution_date, streak_month, note, created_at)
                 VALUES (?, ?, ?, ?, 'deposit', ?, ?, ?, ?)`,
              ).run(
                `sc-${crypto.randomUUID().slice(0, 10)}`,
                goalId,
                authUser.id,
                parsed.data.currentAmount,
                dateStr,
                streakMonth,
                'رصيد افتتاحي للهدف',
                now,
              );
            }

            newlyEarnedBadges = evaluateAndAwardPrivateBadges(db, authUser.id);
            db.exec('COMMIT;');
          } catch (err) {
            db.exec('ROLLBACK;');
            throw err;
          }

          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'early_start.goal_created',
            targetType: 'savings_goal',
            targetId: goalId,
            metadata: { goalType: parsed.data.goalType, targetAmount: parsed.data.targetAmount },
            ipAddress: ip,
          });

          sendJson(res, 201, {
            ok: true,
            data: {
              goalId,
              newlyEarnedBadges,
              overview: buildEarlyStartOverview(db, authUser.id),
            },
          });
          return;
        }

        const goalContribMatch = route.match(/^\/early-start\/goals\/([^/]+)\/contributions$/);
        if (method === 'POST' && goalContribMatch) {
          const goalId = decodeURIComponent(goalContribMatch[1]);
          const body = await readJsonBody(req);
          const parsed = createSavingsContributionSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid contribution entry', parsed.error.flatten());
            return;
          }

          try {
            const result = recordGoalContribution(db, {
              userId: authUser.id,
              goalId,
              amount: parsed.data.amount,
              contributionType: parsed.data.contributionType,
              contributionDate: parsed.data.contributionDate,
              note: parsed.data.note,
            });
            writeAuditLog(db, {
              actorUserId: authUser.id,
              actorRole: authUser.role,
              action: 'early_start.contribution_logged',
              targetType: 'savings_contribution',
              targetId: result.contributionId,
              metadata: { goalId, amount: parsed.data.amount },
              ipAddress: ip,
            });
            sendJson(res, 201, { ok: true, data: result });
          } catch (err) {
            if (err instanceof Error && err.message === 'GOAL_NOT_FOUND') {
              sendError(res, 404, 'NOT_FOUND', 'Savings goal not found');
              return;
            }
            throw err;
          }
          return;
        }

        const goalItemMatch = route.match(/^\/early-start\/goals\/([^/]+)$/);
        if (method === 'PATCH' && goalItemMatch) {
          const goalId = decodeURIComponent(goalItemMatch[1]);
          const existing = db
            .prepare('SELECT id, user_id FROM savings_goals WHERE id = ?')
            .get(goalId) as { id: string; user_id: string } | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Savings goal not found');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = patchSavingsGoalSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid savings goal updates', parsed.error.flatten());
            return;
          }
          const now = new Date().toISOString();
          db.prepare(
            `UPDATE savings_goals SET
              title_ar = COALESCE(?, title_ar),
              title_en = COALESCE(?, title_en),
              target_amount = COALESCE(?, target_amount),
              monthly_contribution = COALESCE(?, monthly_contribution),
              target_date = CASE WHEN ? IS NOT NULL THEN ? ELSE target_date END,
              priority = COALESCE(?, priority),
              updated_at = ?
             WHERE id = ? AND user_id = ?`,
          ).run(
            parsed.data.titleAr ?? null,
            parsed.data.titleEn ?? null,
            parsed.data.targetAmount ?? null,
            parsed.data.monthlyContribution ?? null,
            parsed.data.targetDate === undefined ? null : 'set',
            parsed.data.targetDate ?? null,
            parsed.data.priority ?? null,
            now,
            goalId,
            authUser.id,
          );

          const newlyEarnedBadges = evaluateAndAwardPrivateBadges(db, authUser.id);
          sendJson(res, 200, {
            ok: true,
            data: {
              newlyEarnedBadges,
              overview: buildEarlyStartOverview(db, authUser.id),
            },
          });
          return;
        }

        if (method === 'DELETE' && goalItemMatch) {
          const goalId = decodeURIComponent(goalItemMatch[1]);
          const existing = db
            .prepare('SELECT id, user_id FROM savings_goals WHERE id = ?')
            .get(goalId) as { id: string; user_id: string } | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Savings goal not found');
            return;
          }
          db.prepare('DELETE FROM savings_goals WHERE id = ? AND user_id = ?').run(goalId, authUser.id);
          sendJson(res, 200, { ok: true, data: buildEarlyStartOverview(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/early-start/milestones') {
          const body = await readJsonBody(req);
          const parsed = createEarlyStartMilestoneSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid milestone fields', parsed.error.flatten());
            return;
          }
          ensureUserEarlyStartProfile(db, authUser.id);
          const msId = `esm-${crypto.randomUUID().slice(0, 10)}`;
          const maxOrder =
            (
              db
                .prepare('SELECT MAX(sort_order) as max_ord FROM early_start_milestones WHERE user_id = ?')
                .get(authUser.id) as { max_ord: number | null }
            ).max_ord ?? 0;

          db.prepare(
            `INSERT INTO early_start_milestones
               (id, user_id, track, title_ar, title_en, target_months_out, completed, completed_at, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?)`,
          ).run(
            msId,
            authUser.id,
            parsed.data.track,
            parsed.data.titleAr,
            parsed.data.titleEn,
            parsed.data.targetMonthsOut,
            maxOrder + 1,
          );
          sendJson(res, 201, { ok: true, data: buildEarlyStartOverview(db, authUser.id) });
          return;
        }

        const milestoneMatch = route.match(/^\/early-start\/milestones\/([^/]+)$/);
        if (method === 'PATCH' && milestoneMatch) {
          const msId = decodeURIComponent(milestoneMatch[1]);
          const existing = db
            .prepare('SELECT id, user_id FROM early_start_milestones WHERE id = ?')
            .get(msId) as { id: string; user_id: string } | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Milestone not found');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = patchEarlyStartMilestoneSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid milestone toggle', parsed.error.flatten());
            return;
          }
          const now = new Date().toISOString();
          db.prepare(
            'UPDATE early_start_milestones SET completed = ?, completed_at = ? WHERE id = ? AND user_id = ?',
          ).run(parsed.data.completed ? 1 : 0, parsed.data.completed ? now : null, msId, authUser.id);
          sendJson(res, 200, { ok: true, data: buildEarlyStartOverview(db, authUser.id) });
          return;
        }

        if (method === 'DELETE' && milestoneMatch) {
          const msId = decodeURIComponent(milestoneMatch[1]);
          const existing = db
            .prepare('SELECT id, user_id FROM early_start_milestones WHERE id = ?')
            .get(msId) as { id: string; user_id: string } | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Milestone not found');
            return;
          }
          db.prepare('DELETE FROM early_start_milestones WHERE id = ? AND user_id = ?').run(msId, authUser.id);
          sendJson(res, 200, { ok: true, data: buildEarlyStartOverview(db, authUser.id) });
          return;
        }

        const academyMatch = route.match(/^\/early-start\/academy\/([^/]+)\/complete$/);
        if (method === 'POST' && academyMatch) {
          const slug = decodeURIComponent(academyMatch[1]);
          const lesson = EARLY_START_ACADEMY_LESSONS.find((l) => l.slug === slug);
          if (!lesson) {
            sendError(res, 404, 'NOT_FOUND', 'Academy lesson not found');
            return;
          }
          const body = (await readJsonBody(req)) as { completed?: boolean };
          const markCompleted = body.completed !== false;
          const now = new Date().toISOString();

          ensureUserEarlyStartProfile(db, authUser.id);
          if (markCompleted) {
            db.prepare(
              `INSERT OR IGNORE INTO early_start_lesson_progress (user_id, lesson_slug, completed_at)
               VALUES (?, ?, ?)`,
            ).run(authUser.id, slug, now);
          } else {
            db.prepare(
              'DELETE FROM early_start_lesson_progress WHERE user_id = ? AND lesson_slug = ?',
            ).run(authUser.id, slug);
          }

          const newlyEarnedBadges = evaluateAndAwardPrivateBadges(db, authUser.id);
          const overview = buildEarlyStartOverview(db, authUser.id);
          sendJson(res, 200, {
            ok: true,
            data: {
              newlyEarnedBadges,
              completedSlugs: overview.completedLessonSlugs,
              overview,
            },
          });
          return;
        }
      }

      // ================= STAGE 5: LIFECYCLE ONBOARDING, ENGAGEMENT, JOURNEY & WORKSPACE =================
      if (
        route === '/onboarding/stage' ||
        route === '/my/hub' ||
        route.startsWith('/engagement/') ||
        route.startsWith('/journey/') ||
        route === '/workspace' ||
        route.startsWith('/workspace/') ||
        route.startsWith('/my/documents') ||
        route.startsWith('/my/warranties') ||
        route.startsWith('/my/appointments') ||
        route.startsWith('/my/notifications')
      ) {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication is required for personal workspace planning');
          return;
        }

        // 1. 11-Stage Lifecycle Onboarding & Transitions (non-destructive)
        if (method === 'POST' && route === '/onboarding/stage') {
          const body = await readJsonBody(req);
          const parsed = onboardingStageTransitionSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid lifecycle stage payload', parsed.error.flatten());
            return;
          }
          const result = transitionLifecycleStage(db, authUser.id, parsed.data.targetStage, {
            note: parsed.data.note,
            city: parsed.data.city,
            governorateSlug: parsed.data.governorateSlug,
            language: parsed.data.language,
          });
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'lifecycle.stage_transitioned',
            targetType: 'user',
            targetId: authUser.id,
            metadata: { targetStage: parsed.data.targetStage, note: parsed.data.note ?? null },
            ipAddress: ip,
          });
          const updatedUserRow = db.prepare('SELECT * FROM users WHERE id = ?').get(authUser.id) as Record<string, unknown>;
          sendJson(res, 200, {
            ok: true,
            data: {
              user: mapUserRow(updatedUserRow),
              currentStage: result.currentStage,
              lifecycleHistory: result.history,
              hub: buildMyGawazInnHubPayload(db, authUser.id),
            },
          });
          return;
        }

        // 2. Full 17-Module My Gawaz Inn Command Center Hub
        if (method === 'GET' && route === '/my/hub') {
          sendJson(res, 200, { ok: true, data: buildMyGawazInnHubPayload(db, authUser.id) });
          return;
        }

        // 3. Module B — Engagement Readiness Planner
        if (method === 'GET' && route === '/engagement/overview') {
          sendJson(res, 200, { ok: true, data: buildEngagementOverview(db, authUser.id) });
          return;
        }

        if (method === 'PUT' && route === '/engagement/plan') {
          const body = await readJsonBody(req);
          const parsed = updateEngagementPlanSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid engagement plan updates', parsed.error.flatten());
            return;
          }
          ensureUserEngagementAndJourney(db, authUser.id);
          const d = parsed.data;
          const now = new Date().toISOString();
          db.prepare(
            `UPDATE engagement_plans SET
              engagement_date = CASE WHEN ? IS NOT NULL THEN ? ELSE engagement_date END,
              target_budget = COALESCE(?, target_budget),
              shabka_budget = COALESCE(?, shabka_budget),
              venue_budget = COALESCE(?, venue_budget),
              attire_budget = COALESCE(?, attire_budget),
              hospitality_budget = COALESCE(?, hospitality_budget),
              venue_name = CASE WHEN ? IS NOT NULL THEN ? ELSE venue_name END,
              venue_status = COALESCE(?, venue_status),
              ring_notes = CASE WHEN ? IS NOT NULL THEN ? ELSE ring_notes END,
              family_notes = CASE WHEN ? IS NOT NULL THEN ? ELSE family_notes END,
              updated_at = ?
             WHERE user_id = ?`,
          ).run(
            d.engagementDate === undefined ? null : 'set',
            d.engagementDate ?? null,
            d.targetBudget ?? null,
            d.shabkaBudget ?? null,
            d.venueBudget ?? null,
            d.attireBudget ?? null,
            d.hospitalityBudget ?? null,
            d.venueName === undefined ? null : 'set',
            d.venueName ?? null,
            d.venueStatus ?? null,
            d.ringNotes === undefined ? null : 'set',
            d.ringNotes ?? null,
            d.familyNotes === undefined ? null : 'set',
            d.familyNotes ?? null,
            now,
            authUser.id,
          );
          sendJson(res, 200, { ok: true, data: buildEngagementOverview(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/engagement/items') {
          const body = await readJsonBody(req);
          const parsed = createEngagementItemSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid engagement item inputs', parsed.error.flatten());
            return;
          }
          ensureUserEngagementAndJourney(db, authUser.id);
          const id = `ei-${crypto.randomUUID().slice(0, 10)}`;
          const now = new Date().toISOString();
          const maxOrd =
            (
              db
                .prepare('SELECT MAX(sort_order) as max_ord FROM engagement_items WHERE user_id = ?')
                .get(authUser.id) as { max_ord: number | null }
            ).max_ord ?? 0;

          db.prepare(
            `INSERT INTO engagement_items
               (id, user_id, item_type, title_ar, title_en, owner_side, priority, estimated_cost, actual_cost, guest_count, status, notes, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            id,
            authUser.id,
            parsed.data.itemType,
            parsed.data.titleAr,
            parsed.data.titleEn,
            parsed.data.ownerSide,
            parsed.data.priority,
            parsed.data.estimatedCost,
            parsed.data.actualCost,
            parsed.data.guestCount,
            parsed.data.status,
            parsed.data.notes ?? null,
            maxOrd + 1,
            now,
            now,
          );
          sendJson(res, 201, {
            ok: true,
            data: { itemId: id, overview: buildEngagementOverview(db, authUser.id) },
          });
          return;
        }

        const engItemMatch = route.match(/^\/engagement\/items\/([^/]+)$/);
        if (method === 'PATCH' && engItemMatch) {
          const itemId = decodeURIComponent(engItemMatch[1]);
          const existing = db
            .prepare('SELECT user_id FROM engagement_items WHERE id = ?')
            .get(itemId) as { user_id: string } | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Engagement item not found');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = patchEngagementItemSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid engagement item update', parsed.error.flatten());
            return;
          }
          const d = parsed.data;
          db.prepare(
            `UPDATE engagement_items SET
              title_ar = COALESCE(?, title_ar),
              title_en = COALESCE(?, title_en),
              owner_side = COALESCE(?, owner_side),
              priority = COALESCE(?, priority),
              estimated_cost = COALESCE(?, estimated_cost),
              actual_cost = COALESCE(?, actual_cost),
              guest_count = COALESCE(?, guest_count),
              status = COALESCE(?, status),
              notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END,
              updated_at = ?
             WHERE id = ? AND user_id = ?`,
          ).run(
            d.titleAr ?? null,
            d.titleEn ?? null,
            d.ownerSide ?? null,
            d.priority ?? null,
            d.estimatedCost ?? null,
            d.actualCost ?? null,
            d.guestCount ?? null,
            d.status ?? null,
            d.notes === undefined ? null : 'set',
            d.notes ?? null,
            new Date().toISOString(),
            itemId,
            authUser.id,
          );
          sendJson(res, 200, { ok: true, data: buildEngagementOverview(db, authUser.id) });
          return;
        }

        if (method === 'DELETE' && engItemMatch) {
          const itemId = decodeURIComponent(engItemMatch[1]);
          const existing = db
            .prepare('SELECT user_id FROM engagement_items WHERE id = ?')
            .get(itemId) as { user_id: string } | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Engagement item not found');
            return;
          }
          db.prepare('DELETE FROM engagement_items WHERE id = ? AND user_id = ?').run(itemId, authUser.id);
          sendJson(res, 200, { ok: true, data: buildEngagementOverview(db, authUser.id) });
          return;
        }

        // 4. Module I — Wedding Journey Planner (Workspace & Owner Scoped + Dependencies + Comments)
        if (method === 'GET' && route === '/journey/tasks') {
          sendJson(res, 200, { ok: true, data: buildJourneyOverview(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/journey/tasks') {
          ensureUserEngagementAndJourney(db, authUser.id);
          const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, authUser.id);
          if (myRole !== 'owner' && !myPermissions.tasksWrite) {
            sendError(res, 403, 'FORBIDDEN', 'Your workspace role does not permit creating journey tasks');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = createJourneyTaskSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid journey task inputs', parsed.error.flatten());
            return;
          }
          const workspaceId = String(workspaceRow.id);
          if (parsed.data.dependsOnTaskId) {
            const dep = db
              .prepare('SELECT id, workspace_id, user_id FROM journey_tasks WHERE id = ?')
              .get(parsed.data.dependsOnTaskId) as
              | { id: string; workspace_id: string | null; user_id: string }
              | undefined;
            if (!dep || (dep.workspace_id !== workspaceId && dep.user_id !== authUser.id)) {
              sendError(res, 400, 'INVALID_DEPENDENCY', 'Dependency task belongs to another workspace');
              return;
            }
          }
          const id = `jt-${crypto.randomUUID().slice(0, 10)}`;
          const now = new Date().toISOString();
          const maxOrd =
            (
              db
                .prepare('SELECT MAX(sort_order) as max_ord FROM journey_tasks WHERE workspace_id = ? OR user_id = ?')
                .get(workspaceId, authUser.id) as { max_ord: number | null }
            ).max_ord ?? 0;

          db.prepare(
            `INSERT INTO journey_tasks
               (id, user_id, workspace_id, phase, title_ar, title_en, description, owner_side, due_date, reminder_date, depends_on_task_id, status, priority, estimated_cost, attachment_label, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?, ?)`,
          ).run(
            id,
            authUser.id,
            workspaceId,
            parsed.data.phase,
            parsed.data.titleAr,
            parsed.data.titleEn,
            parsed.data.description ?? null,
            parsed.data.ownerSide,
            parsed.data.dueDate ?? null,
            parsed.data.reminderDate ?? null,
            parsed.data.dependsOnTaskId ?? null,
            parsed.data.priority,
            parsed.data.estimatedCost,
            parsed.data.attachmentLabel ?? null,
            maxOrd + 1,
            now,
            now,
          );
          sendJson(res, 201, {
            ok: true,
            data: { taskId: id, overview: buildJourneyOverview(db, authUser.id) },
          });
          return;
        }

        const taskMatch = route.match(/^\/journey\/tasks\/([^/]+)$/);
        if (method === 'PATCH' && taskMatch) {
          const taskId = decodeURIComponent(taskMatch[1]);
          const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, authUser.id);
          const workspaceId = String(workspaceRow.id);

          const taskRow = db.prepare('SELECT * FROM journey_tasks WHERE id = ?').get(taskId) as
            | Record<string, unknown>
            | undefined;
          if (!taskRow) {
            sendError(res, 404, 'NOT_FOUND', 'Journey task not found');
            return;
          }
          const sameOwner = String(taskRow.user_id) === authUser.id;
          const sameWorkspace = taskRow.workspace_id && String(taskRow.workspace_id) === workspaceId;
          if (!sameOwner && !sameWorkspace) {
            sendError(res, 404, 'NOT_FOUND', 'Journey task not found');
            return;
          }
          if (!sameOwner && myRole !== 'owner' && !myPermissions.tasksWrite) {
            sendError(res, 403, 'FORBIDDEN', 'Your workspace role does not have permission to edit tasks');
            return;
          }

          const body = await readJsonBody(req);
          const parsed = patchJourneyTaskSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid task update', parsed.error.flatten());
            return;
          }
          const d = parsed.data;
          const now = new Date().toISOString();

          // Check unmet dependency warning metadata
          let dependencyWarning: string | null = null;
          const effectiveDepId =
            d.dependsOnTaskId !== undefined
              ? d.dependsOnTaskId
              : taskRow.depends_on_task_id
                ? String(taskRow.depends_on_task_id)
                : null;
          if (d.status === 'done' && effectiveDepId) {
            const depRow = db.prepare('SELECT status, title_en FROM journey_tasks WHERE id = ?').get(effectiveDepId) as
              | { status: string; title_en: string }
              | undefined;
            if (depRow && depRow.status !== 'done') {
              dependencyWarning = `Prerequisite "${depRow.title_en}" is still incomplete`;
            }
          }

          db.prepare(
            `UPDATE journey_tasks SET
              phase = COALESCE(?, phase),
              title_ar = COALESCE(?, title_ar),
              title_en = COALESCE(?, title_en),
              description = CASE WHEN ? IS NOT NULL THEN ? ELSE description END,
              owner_side = COALESCE(?, owner_side),
              due_date = CASE WHEN ? IS NOT NULL THEN ? ELSE due_date END,
              reminder_date = CASE WHEN ? IS NOT NULL THEN ? ELSE reminder_date END,
              depends_on_task_id = CASE WHEN ? IS NOT NULL THEN ? ELSE depends_on_task_id END,
              status = COALESCE(?, status),
              priority = COALESCE(?, priority),
              estimated_cost = COALESCE(?, estimated_cost),
              attachment_label = CASE WHEN ? IS NOT NULL THEN ? ELSE attachment_label END,
              completed_at = CASE WHEN ? = 'done' THEN COALESCE(completed_at, ?) WHEN ? IS NOT NULL THEN NULL ELSE completed_at END,
              updated_at = ?
             WHERE id = ?`,
          ).run(
            d.phase ?? null,
            d.titleAr ?? null,
            d.titleEn ?? null,
            d.description === undefined ? null : 'set',
            d.description ?? null,
            d.ownerSide ?? null,
            d.dueDate === undefined ? null : 'set',
            d.dueDate ?? null,
            d.reminderDate === undefined ? null : 'set',
            d.reminderDate ?? null,
            d.dependsOnTaskId === undefined ? null : 'set',
            d.dependsOnTaskId ?? null,
            d.status ?? null,
            d.priority ?? null,
            d.estimatedCost ?? null,
            d.attachmentLabel === undefined ? null : 'set',
            d.attachmentLabel ?? null,
            d.status ?? null,
            now,
            d.status ?? null,
            now,
            taskId,
          );

          sendJson(res, 200, {
            ok: true,
            data: {
              dependencyWarning,
              overview: buildJourneyOverview(db, authUser.id),
            },
          });
          return;
        }

        if (method === 'DELETE' && taskMatch) {
          const taskId = decodeURIComponent(taskMatch[1]);
          const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, authUser.id);
          const workspaceId = String(workspaceRow.id);
          const taskRow = db.prepare('SELECT user_id, workspace_id FROM journey_tasks WHERE id = ?').get(taskId) as
            | { user_id: string; workspace_id: string | null }
            | undefined;
          if (!taskRow) {
            sendError(res, 404, 'NOT_FOUND', 'Journey task not found');
            return;
          }
          const sameOwner = taskRow.user_id === authUser.id;
          const sameWorkspace = taskRow.workspace_id === workspaceId;
          if (!sameOwner && !sameWorkspace) {
            sendError(res, 404, 'NOT_FOUND', 'Journey task not found');
            return;
          }
          if (!sameOwner && myRole !== 'owner' && !myPermissions.tasksWrite) {
            sendError(res, 403, 'FORBIDDEN', 'No permission to delete workspace task');
            return;
          }
          db.prepare('DELETE FROM journey_tasks WHERE id = ?').run(taskId);
          sendJson(res, 200, { ok: true, data: buildJourneyOverview(db, authUser.id) });
          return;
        }

        const commentMatch = route.match(/^\/journey\/tasks\/([^/]+)\/comments$/);
        if (method === 'POST' && commentMatch) {
          const taskId = decodeURIComponent(commentMatch[1]);
          const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, authUser.id);
          const workspaceId = String(workspaceRow.id);
          const taskRow = db.prepare('SELECT user_id, workspace_id FROM journey_tasks WHERE id = ?').get(taskId) as
            | { user_id: string; workspace_id: string | null }
            | undefined;
          if (!taskRow || (taskRow.user_id !== authUser.id && taskRow.workspace_id !== workspaceId)) {
            sendError(res, 404, 'NOT_FOUND', 'Journey task not found');
            return;
          }
          if (taskRow.user_id !== authUser.id && myRole !== 'owner' && !myPermissions.tasksRead) {
            sendError(res, 403, 'FORBIDDEN', 'No permission to comment on workspace tasks');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = createTaskCommentSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Comment body required', parsed.error.flatten());
            return;
          }
          const id = `tc-${crypto.randomUUID().slice(0, 10)}`;
          db.prepare(
            `INSERT INTO task_comments (id, task_id, user_id, author_name, body, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
          ).run(id, taskId, authUser.id, authUser.name, parsed.data.body, new Date().toISOString());
          sendJson(res, 201, { ok: true, data: buildJourneyOverview(db, authUser.id) });
          return;
        }

        // 5. Shared Couple Workspace (Invites, Consent Accept/Decline, Granular Permissions, Revocation, Approvals)
        if (method === 'GET' && route === '/workspace') {
          sendJson(res, 200, { ok: true, data: buildCoupleWorkspacePayload(db, authUser.id) });
          return;
        }

        if (method === 'PATCH' && route === '/workspace') {
          const { workspaceRow, myRole } = resolveActiveWorkspaceForUser(db, authUser.id);
          if (myRole !== 'owner') {
            sendError(res, 403, 'FORBIDDEN', 'Only workspace owner can update workspace settings');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = updateWorkspaceMetaSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid workspace fields', parsed.error.flatten());
            return;
          }
          const d = parsed.data;
          db.prepare(
            `UPDATE couple_workspaces SET
              name_ar = COALESCE(?, name_ar),
              name_en = COALESCE(?, name_en),
              engagement_date = CASE WHEN ? IS NOT NULL THEN ? ELSE engagement_date END,
              wedding_date = CASE WHEN ? IS NOT NULL THEN ? ELSE wedding_date END,
              updated_at = ?
             WHERE id = ?`,
          ).run(
            d.nameAr ?? null,
            d.nameEn ?? null,
            d.engagementDate === undefined ? null : 'set',
            d.engagementDate ?? null,
            d.weddingDate === undefined ? null : 'set',
            d.weddingDate ?? null,
            new Date().toISOString(),
            String(workspaceRow.id),
          );
          sendJson(res, 200, { ok: true, data: buildCoupleWorkspacePayload(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/workspace/invite') {
          const { workspaceRow, myRole } = resolveActiveWorkspaceForUser(db, authUser.id);
          if (myRole !== 'owner') {
            sendError(res, 403, 'FORBIDDEN', 'Only the workspace owner can invite partners');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = inviteWorkspacePartnerSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid partner invitation input', parsed.error.flatten());
            return;
          }
          const workspaceId = String(workspaceRow.id);
          const rawIdent = parsed.data.inviteeIdentifier.trim();
          const isEmail = rawIdent.includes('@');
          const inviteeEmail = isEmail ? rawIdent.toLowerCase() : null;
          const inviteePhone = isEmail ? null : normalizeEgyptianPhone(rawIdent);

          if ((inviteeEmail && inviteeEmail === authUser.email.toLowerCase()) || (inviteePhone && inviteePhone === authUser.phone)) {
            sendError(res, 400, 'SELF_INVITE', 'Cannot invite your own account');
            return;
          }

          const token = `gwi-${crypto.randomBytes(12).toString('hex')}`;
          const now = new Date().toISOString();
          const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();
          const permissions = { ...DEFAULT_WORKSPACE_PERMISSIONS, ...(parsed.data.permissions || {}) };
          const invId = `wi-${crypto.randomUUID().slice(0, 10)}`;

          db.prepare(
            `INSERT INTO workspace_invitations
               (id, workspace_id, inviter_user_id, invitee_email, invitee_phone, invite_token, proposed_role, proposed_side, permissions_json, status, expires_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
          ).run(
            invId,
            workspaceId,
            authUser.id,
            inviteeEmail,
            inviteePhone,
            token,
            parsed.data.proposedRole,
            parsed.data.proposedSide,
            JSON.stringify(permissions),
            expiresAt,
            now,
          );

          // Notify invitee directly inside app if registered
          const targetUser = (
            inviteeEmail
              ? db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(inviteeEmail)
              : db.prepare('SELECT id FROM users WHERE phone = ?').get(inviteePhone)
          ) as { id: string } | undefined;

          if (targetUser) {
            addUserNotification(db, {
              userId: targetUser.id,
              notifType: 'workspace_invite',
              titleAr: `دعوة لمساحة زوجين مشتركة من ${authUser.name}`,
              titleEn: `Couple Workspace Invite from ${authUser.name}`,
              bodyAr: 'تمت دعوتك للانضمام لمساحة التخطيط المشتركة. افتح "مساحة الزوجين" للموافقة أو الرفض.',
              bodyEn: 'You have an explicit partner invite. Open Shared Workspace in My Gawaz Inn to Accept or Decline.',
              linkPath: '/my/workspace',
            });
          }

          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'workspace.invite_sent',
            targetType: 'workspace_invitation',
            targetId: invId,
            metadata: { inviteeEmail, inviteePhone, proposedRole: parsed.data.proposedRole },
            ipAddress: ip,
          });

          sendJson(res, 201, {
            ok: true,
            data: {
              inviteToken: token,
              workspace: buildCoupleWorkspacePayload(db, authUser.id),
            },
          });
          return;
        }

        const acceptMatch = route.match(/^\/workspace\/invitations\/([^/]+)\/accept$/);
        if (method === 'POST' && acceptMatch) {
          const token = decodeURIComponent(acceptMatch[1]);
          const inv = db
            .prepare("SELECT * FROM workspace_invitations WHERE invite_token = ? AND status = 'pending'")
            .get(token) as Record<string, unknown> | undefined;
          if (!inv) {
            sendError(res, 404, 'NOT_FOUND', 'Pending workspace invitation not found or already used');
            return;
          }
          const matchesEmail =
            inv.invitee_email && String(inv.invitee_email).toLowerCase() === authUser.email.toLowerCase();
          const matchesPhone = inv.invitee_phone && String(inv.invitee_phone) === authUser.phone;
          if (!matchesEmail && !matchesPhone) {
            sendError(res, 403, 'FORBIDDEN', 'This invitation is addressed to a different user account');
            return;
          }
          if (new Date(String(inv.expires_at)).getTime() < Date.now()) {
            sendError(res, 410, 'EXPIRED', 'Invitation has expired');
            return;
          }

          const now = new Date().toISOString();
          const wsId = String(inv.workspace_id);
          db.exec('BEGIN;');
          try {
            db.prepare(
              `UPDATE workspace_invitations SET status = 'accepted', responded_at = ? WHERE id = ?`,
            ).run(now, String(inv.id));

            const existingMember = db
              .prepare('SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?')
              .get(wsId, authUser.id) as { id: string } | undefined;

            if (existingMember) {
              db.prepare(
                `UPDATE workspace_members SET
                  member_role = ?,
                  side_label = ?,
                  permissions_json = ?,
                  status = 'active',
                  joined_at = ?,
                  revoked_at = NULL
                 WHERE id = ?`,
              ).run(
                String(inv.proposed_role),
                String(inv.proposed_side),
                String(inv.permissions_json),
                now,
                existingMember.id,
              );
            } else {
              db.prepare(
                `INSERT INTO workspace_members
                   (id, workspace_id, user_id, member_role, side_label, permissions_json, status, joined_at)
                 VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
              ).run(
                `wm-${crypto.randomUUID().slice(0, 10)}`,
                wsId,
                authUser.id,
                String(inv.proposed_role),
                String(inv.proposed_side),
                String(inv.permissions_json),
                now,
              );
            }

            addUserNotification(db, {
              userId: String(inv.inviter_user_id),
              notifType: 'workspace_invite',
              titleAr: `قبل ${authUser.name} دعوة المساحة المشتركة`,
              titleEn: `${authUser.name} joined your Couple Workspace`,
              bodyAr: 'أصبح بإمكانكما الآن تنسيق المهام والموافقات المشتركة.',
              bodyEn: 'You can now collaborate on journey tasks, comments, and purchase approvals.',
              linkPath: '/my/workspace',
            });

            writeAuditLog(db, {
              actorUserId: authUser.id,
              actorRole: authUser.role,
              action: 'workspace.invite_accepted',
              targetType: 'couple_workspace',
              targetId: wsId,
              ipAddress: ip,
            });
            db.exec('COMMIT;');
          } catch (err) {
            db.exec('ROLLBACK;');
            throw err;
          }

          sendJson(res, 200, { ok: true, data: buildCoupleWorkspacePayload(db, authUser.id) });
          return;
        }

        const declineMatch = route.match(/^\/workspace\/invitations\/([^/]+)\/decline$/);
        if (method === 'POST' && declineMatch) {
          const token = decodeURIComponent(declineMatch[1]);
          const inv = db
            .prepare("SELECT * FROM workspace_invitations WHERE invite_token = ? AND status = 'pending'")
            .get(token) as Record<string, unknown> | undefined;
          if (!inv) {
            sendError(res, 404, 'NOT_FOUND', 'Pending workspace invitation not found');
            return;
          }
          const matchesEmail =
            inv.invitee_email && String(inv.invitee_email).toLowerCase() === authUser.email.toLowerCase();
          const matchesPhone = inv.invitee_phone && String(inv.invitee_phone) === authUser.phone;
          const isInviterRevoking = String(inv.inviter_user_id) === authUser.id;
          if (!matchesEmail && !matchesPhone && !isInviterRevoking) {
            sendError(res, 403, 'FORBIDDEN', 'Cannot respond to this invitation');
            return;
          }
          db.prepare("UPDATE workspace_invitations SET status = ?, responded_at = ? WHERE id = ?").run(
            isInviterRevoking ? 'revoked' : 'declined',
            new Date().toISOString(),
            String(inv.id),
          );
          sendJson(res, 200, { ok: true, data: buildCoupleWorkspacePayload(db, authUser.id) });
          return;
        }

        const memberMatch = route.match(/^\/workspace\/members\/([^/]+)$/);
        if (method === 'PATCH' && memberMatch) {
          const memberId = decodeURIComponent(memberMatch[1]);
          const { workspaceRow, myRole } = resolveActiveWorkspaceForUser(db, authUser.id);
          if (myRole !== 'owner') {
            sendError(res, 403, 'FORBIDDEN', 'Only workspace owner can edit member permissions');
            return;
          }
          const wsId = String(workspaceRow.id);
          const target = db
            .prepare('SELECT id, member_role FROM workspace_members WHERE id = ? AND workspace_id = ?')
            .get(memberId, wsId) as { id: string; member_role: string } | undefined;
          if (!target) {
            sendError(res, 404, 'NOT_FOUND', 'Workspace member not found');
            return;
          }
          if (target.member_role === 'owner') {
            sendError(res, 400, 'CANNOT_DEMOTE_OWNER', 'Owner retains full workspace permissions');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = workspacePermissionsSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid permissions payload', parsed.error.flatten());
            return;
          }
          db.prepare('UPDATE workspace_members SET permissions_json = ? WHERE id = ?').run(
            JSON.stringify(parsed.data),
            memberId,
          );
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'workspace.permissions_updated',
            targetType: 'workspace_member',
            targetId: memberId,
            metadata: parsed.data,
            ipAddress: ip,
          });
          sendJson(res, 200, { ok: true, data: buildCoupleWorkspacePayload(db, authUser.id) });
          return;
        }

        if (method === 'DELETE' && memberMatch) {
          const memberId = decodeURIComponent(memberMatch[1]);
          const { workspaceRow, myRole } = resolveActiveWorkspaceForUser(db, authUser.id);
          const wsId = String(workspaceRow.id);
          const target = db
            .prepare('SELECT id, user_id, member_role FROM workspace_members WHERE id = ? AND workspace_id = ?')
            .get(memberId, wsId) as { id: string; user_id: string; member_role: string } | undefined;
          if (!target) {
            sendError(res, 404, 'NOT_FOUND', 'Workspace member not found');
            return;
          }
          if (target.member_role === 'owner') {
            sendError(res, 400, 'CANNOT_REVOKE_OWNER', 'Workspace owner cannot be revoked');
            return;
          }
          // Owner can revoke anyone; partner can leave voluntarily
          if (myRole !== 'owner' && target.user_id !== authUser.id) {
            sendError(res, 403, 'FORBIDDEN', 'Only workspace owner can revoke access for another member');
            return;
          }
          const now = new Date().toISOString();
          db.prepare("UPDATE workspace_members SET status = 'revoked', revoked_at = ? WHERE id = ?").run(now, memberId);
          writeAuditLog(db, {
            actorUserId: authUser.id,
            actorRole: authUser.role,
            action: 'workspace.member_revoked',
            targetType: 'workspace_member',
            targetId: memberId,
            metadata: { revokedUserId: target.user_id },
            ipAddress: ip,
          });
          sendJson(res, 200, { ok: true, data: buildCoupleWorkspacePayload(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/workspace/approvals') {
          const { workspaceRow } = resolveActiveWorkspaceForUser(db, authUser.id);
          const body = await readJsonBody(req);
          const parsed = createWorkspaceApprovalSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid approval request', parsed.error.flatten());
            return;
          }
          const id = `wa-${crypto.randomUUID().slice(0, 10)}`;
          db.prepare(
            `INSERT INTO workspace_approvals (id, workspace_id, requested_by_user_id, title, category, estimated_amount, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
          ).run(
            id,
            String(workspaceRow.id),
            authUser.id,
            parsed.data.title,
            parsed.data.category,
            parsed.data.estimatedAmount,
            new Date().toISOString(),
          );
          sendJson(res, 201, { ok: true, data: buildCoupleWorkspacePayload(db, authUser.id) });
          return;
        }

        const approvalMatch = route.match(/^\/workspace\/approvals\/([^/]+)$/);
        if (method === 'PATCH' && approvalMatch) {
          const approvalId = decodeURIComponent(approvalMatch[1]);
          const { workspaceRow, myRole, myPermissions } = resolveActiveWorkspaceForUser(db, authUser.id);
          const wsId = String(workspaceRow.id);
          const appRow = db
            .prepare('SELECT id, workspace_id FROM workspace_approvals WHERE id = ?')
            .get(approvalId) as { id: string; workspace_id: string } | undefined;
          if (!appRow || appRow.workspace_id !== wsId) {
            sendError(res, 404, 'NOT_FOUND', 'Workspace approval item not found');
            return;
          }
          if (myRole !== 'owner' && !myPermissions.approvePurchases) {
            sendError(res, 403, 'FORBIDDEN', 'Your workspace permissions do not allow approving purchases');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = decideWorkspaceApprovalSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid decision', parsed.error.flatten());
            return;
          }
          db.prepare(
            `UPDATE workspace_approvals SET status = ?, reviewer_user_id = ?, reviewer_note = ?, decided_at = ? WHERE id = ?`,
          ).run(
            parsed.data.status,
            authUser.id,
            parsed.data.reviewerNote ?? null,
            new Date().toISOString(),
            approvalId,
          );
          sendJson(res, 200, { ok: true, data: buildCoupleWorkspacePayload(db, authUser.id) });
          return;
        }

        // 6. Module J Documents, Warranties, Appointments & Notifications
        if (method === 'GET' && route === '/my/documents') {
          sendJson(res, 200, { ok: true, data: listVisibleDocumentsForUser(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/my/documents') {
          const { workspaceRow } = resolveActiveWorkspaceForUser(db, authUser.id);
          const body = await readJsonBody(req);
          const parsed = createUserDocumentSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid document metadata', parsed.error.flatten());
            return;
          }
          const id = `doc-${crypto.randomUUID().slice(0, 10)}`;
          const now = new Date().toISOString();
          const safeFileName = parsed.data.fileName.replace(/[^\w.\-\u0600-\u06FF ]+/g, '_');
          db.prepare(
            `INSERT INTO user_documents
               (id, user_id, workspace_id, doc_type, title, file_name, mime_type, size_bytes, reference_code, notes, is_shared_with_partner, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            id,
            authUser.id,
            String(workspaceRow.id),
            parsed.data.docType,
            parsed.data.title,
            safeFileName,
            parsed.data.mimeType,
            parsed.data.sizeBytes,
            parsed.data.referenceCode ?? null,
            parsed.data.notes ?? null,
            parsed.data.isSharedWithPartner ? 1 : 0,
            now,
            now,
          );
          const created = db.prepare('SELECT * FROM user_documents WHERE id = ?').get(id) as Record<string, unknown>;
          sendJson(res, 201, {
            ok: true,
            data: { document: mapDocumentRow(created), documents: listVisibleDocumentsForUser(db, authUser.id) },
          });
          return;
        }

        const docMatch = route.match(/^\/my\/documents\/([^/]+)$/);
        if (method === 'DELETE' && docMatch) {
          const docId = decodeURIComponent(docMatch[1]);
          const existing = db.prepare('SELECT user_id FROM user_documents WHERE id = ?').get(docId) as
            | { user_id: string }
            | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Document not found');
            return;
          }
          db.prepare('DELETE FROM user_documents WHERE id = ? AND user_id = ?').run(docId, authUser.id);
          sendJson(res, 200, { ok: true, data: listVisibleDocumentsForUser(db, authUser.id) });
          return;
        }

        if (method === 'GET' && route === '/my/warranties') {
          const rows = db
            .prepare('SELECT * FROM user_warranties WHERE user_id = ? ORDER BY expiry_date ASC')
            .all(authUser.id) as Record<string, unknown>[];
          sendJson(res, 200, { ok: true, data: rows.map(mapWarrantyRow) });
          return;
        }

        if (method === 'POST' && route === '/my/warranties') {
          const { workspaceRow } = resolveActiveWorkspaceForUser(db, authUser.id);
          const body = await readJsonBody(req);
          const parsed = createUserWarrantySchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid warranty inputs', parsed.error.flatten());
            return;
          }
          const id = `war-${crypto.randomUUID().slice(0, 10)}`;
          db.prepare(
            `INSERT INTO user_warranties
               (id, user_id, workspace_id, item_name, category, provider_name, model_serial, start_date, expiry_date, notes, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            id,
            authUser.id,
            String(workspaceRow.id),
            parsed.data.itemName,
            parsed.data.category,
            parsed.data.providerName,
            parsed.data.modelSerial ?? null,
            parsed.data.startDate,
            parsed.data.expiryDate,
            parsed.data.notes ?? null,
            new Date().toISOString(),
          );
          const rows = db
            .prepare('SELECT * FROM user_warranties WHERE user_id = ? ORDER BY expiry_date ASC')
            .all(authUser.id) as Record<string, unknown>[];
          sendJson(res, 201, { ok: true, data: rows.map(mapWarrantyRow) });
          return;
        }

        const warMatch = route.match(/^\/my\/warranties\/([^/]+)$/);
        if (method === 'DELETE' && warMatch) {
          const warId = decodeURIComponent(warMatch[1]);
          const existing = db.prepare('SELECT user_id FROM user_warranties WHERE id = ?').get(warId) as
            | { user_id: string }
            | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Warranty item not found');
            return;
          }
          db.prepare('DELETE FROM user_warranties WHERE id = ? AND user_id = ?').run(warId, authUser.id);
          const rows = db
            .prepare('SELECT * FROM user_warranties WHERE user_id = ? ORDER BY expiry_date ASC')
            .all(authUser.id) as Record<string, unknown>[];
          sendJson(res, 200, { ok: true, data: rows.map(mapWarrantyRow) });
          return;
        }

        if (method === 'GET' && route === '/my/appointments') {
          const rows = db
            .prepare('SELECT * FROM user_appointments WHERE user_id = ? ORDER BY scheduled_at ASC')
            .all(authUser.id) as Record<string, unknown>[];
          sendJson(res, 200, { ok: true, data: rows.map(mapAppointmentRow) });
          return;
        }

        if (method === 'POST' && route === '/my/appointments') {
          const { workspaceRow } = resolveActiveWorkspaceForUser(db, authUser.id);
          const body = await readJsonBody(req);
          const parsed = createUserAppointmentSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid appointment fields', parsed.error.flatten());
            return;
          }
          const id = `apt-${crypto.randomUUID().slice(0, 10)}`;
          const now = new Date().toISOString();
          db.prepare(
            `INSERT INTO user_appointments
               (id, user_id, workspace_id, title, appointment_type, provider_name, location_text, scheduled_at, status, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?)`,
          ).run(
            id,
            authUser.id,
            String(workspaceRow.id),
            parsed.data.title,
            parsed.data.appointmentType,
            parsed.data.providerName,
            parsed.data.locationText,
            parsed.data.scheduledAt,
            parsed.data.notes ?? null,
            now,
            now,
          );
          const rows = db
            .prepare('SELECT * FROM user_appointments WHERE user_id = ? ORDER BY scheduled_at ASC')
            .all(authUser.id) as Record<string, unknown>[];
          sendJson(res, 201, { ok: true, data: rows.map(mapAppointmentRow) });
          return;
        }

        const aptMatch = route.match(/^\/my\/appointments\/([^/]+)$/);
        if (method === 'PATCH' && aptMatch) {
          const aptId = decodeURIComponent(aptMatch[1]);
          const existing = db.prepare('SELECT user_id FROM user_appointments WHERE id = ?').get(aptId) as
            | { user_id: string }
            | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Appointment not found');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = patchUserAppointmentSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid appointment update', parsed.error.flatten());
            return;
          }
          db.prepare(
            `UPDATE user_appointments SET
              status = COALESCE(?, status),
              scheduled_at = COALESCE(?, scheduled_at),
              notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END,
              updated_at = ?
             WHERE id = ? AND user_id = ?`,
          ).run(
            parsed.data.status ?? null,
            parsed.data.scheduledAt ?? null,
            parsed.data.notes === undefined ? null : 'set',
            parsed.data.notes ?? null,
            new Date().toISOString(),
            aptId,
            authUser.id,
          );
          const rows = db
            .prepare('SELECT * FROM user_appointments WHERE user_id = ? ORDER BY scheduled_at ASC')
            .all(authUser.id) as Record<string, unknown>[];
          sendJson(res, 200, { ok: true, data: rows.map(mapAppointmentRow) });
          return;
        }

        if (method === 'POST' && route === '/my/notifications/read-all') {
          const now = new Date().toISOString();
          db.prepare('UPDATE notifications SET is_read = 1, read_at = COALESCE(read_at, ?) WHERE user_id = ?').run(
            now,
            authUser.id,
          );
          sendJson(res, 200, { ok: true, data: buildMyGawazInnHubPayload(db, authUser.id).notifications });
          return;
        }

        const notifReadMatch = route.match(/^\/my\/notifications\/([^/]+)\/read$/);
        if (method === 'POST' && notifReadMatch) {
          const notifId = decodeURIComponent(notifReadMatch[1]);
          const existing = db.prepare('SELECT user_id FROM notifications WHERE id = ?').get(notifId) as
            | { user_id: string }
            | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Notification not found');
            return;
          }
          db.prepare('UPDATE notifications SET is_read = 1, read_at = COALESCE(read_at, ?) WHERE id = ?').run(
            new Date().toISOString(),
            notifId,
          );
          sendJson(res, 200, { ok: true, data: buildMyGawazInnHubPayload(db, authUser.id).notifications });
          return;
        }
      }

      // ================= STAGE 6: MULTI-LIST SHOPPING BASKETS & PRICE ALERTS =================
      if (
        route === '/shopping-lists' ||
        route.startsWith('/shopping-lists/') ||
        route.startsWith('/shopping-list-items/') ||
        route === '/price-alerts' ||
        route.startsWith('/price-alerts/')
      ) {
        if (!authUser) {
          sendError(res, 401, 'UNAUTHORIZED', 'Authentication is required for shopping baskets and price alerts');
          return;
        }

        if (method === 'GET' && route === '/shopping-lists') {
          sendJson(res, 200, { ok: true, data: listShoppingListsForUser(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/shopping-lists') {
          const body = await readJsonBody(req);
          const parsed = createShoppingListSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid shopping list inputs', parsed.error.flatten());
            return;
          }
          const { workspaceRow } = resolveActiveWorkspaceForUser(db, authUser.id);
          const id = `sl-${crypto.randomUUID().slice(0, 10)}`;
          const now = new Date().toISOString();
          db.prepare(
            `INSERT INTO shopping_lists
               (id, user_id, workspace_id, title_ar, title_en, list_type, is_shared_with_partner, budget_target, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            id,
            authUser.id,
            String(workspaceRow.id),
            parsed.data.titleAr,
            parsed.data.titleEn,
            parsed.data.listType,
            parsed.data.isSharedWithPartner ? 1 : 0,
            parsed.data.budgetTarget,
            parsed.data.notes ?? null,
            now,
            now,
          );
          sendJson(res, 201, {
            ok: true,
            data: { listId: id, lists: listShoppingListsForUser(db, authUser.id) },
          });
          return;
        }

        const listMatch = route.match(/^\/shopping-lists\/([^/]+)$/);
        if (method === 'PATCH' && listMatch) {
          const listId = decodeURIComponent(listMatch[1]);
          const existing = db.prepare('SELECT user_id FROM shopping_lists WHERE id = ?').get(listId) as
            | { user_id: string }
            | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Shopping list not found or not owned by your account');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = patchShoppingListSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid shopping list update', parsed.error.flatten());
            return;
          }
          const d = parsed.data;
          db.prepare(
            `UPDATE shopping_lists SET
              title_ar = COALESCE(?, title_ar),
              title_en = COALESCE(?, title_en),
              list_type = COALESCE(?, list_type),
              is_shared_with_partner = CASE WHEN ? IS NOT NULL THEN ? ELSE is_shared_with_partner END,
              budget_target = COALESCE(?, budget_target),
              notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END,
              updated_at = ?
             WHERE id = ? AND user_id = ?`,
          ).run(
            d.titleAr ?? null,
            d.titleEn ?? null,
            d.listType ?? null,
            d.isSharedWithPartner === undefined ? null : 'set',
            d.isSharedWithPartner ? 1 : 0,
            d.budgetTarget ?? null,
            d.notes === undefined ? null : 'set',
            d.notes ?? null,
            new Date().toISOString(),
            listId,
            authUser.id,
          );
          sendJson(res, 200, { ok: true, data: listShoppingListsForUser(db, authUser.id) });
          return;
        }

        if (method === 'DELETE' && listMatch) {
          const listId = decodeURIComponent(listMatch[1]);
          const existing = db.prepare('SELECT user_id FROM shopping_lists WHERE id = ?').get(listId) as
            | { user_id: string }
            | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Shopping list not found or not owned by your account');
            return;
          }
          db.prepare('DELETE FROM shopping_lists WHERE id = ? AND user_id = ?').run(listId, authUser.id);
          sendJson(res, 200, { ok: true, data: listShoppingListsForUser(db, authUser.id) });
          return;
        }

        const addItemMatch = route.match(/^\/shopping-lists\/([^/]+)\/items$/);
        if (method === 'POST' && addItemMatch) {
          const listId = decodeURIComponent(addItemMatch[1]);
          const access = authorizeShoppingListAccess(db, listId, authUser.id, true);
          if (access === 'not_found') {
            sendError(res, 404, 'NOT_FOUND', 'Shopping list not found');
            return;
          }
          if (access === 'forbidden') {
            sendError(res, 403, 'FORBIDDEN', 'Your workspace permissions do not permit editing shopping lists');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = createShoppingListItemSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid shopping list item inputs', parsed.error.flatten());
            return;
          }

          let resolvedProductId: string | null = null;
          let resolvedPrice = parsed.data.targetUnitPrice;
          if (parsed.data.productId) {
            const prodRow = db
              .prepare('SELECT id, price FROM products WHERE id = ? OR slug = ?')
              .get(parsed.data.productId, parsed.data.productId) as { id: string; price: number } | undefined;
            if (!prodRow) {
              sendError(res, 400, 'INVALID_PRODUCT', 'Referenced product does not exist');
              return;
            }
            resolvedProductId = prodRow.id;
            if (resolvedPrice === 0) resolvedPrice = prodRow.price;
          }

          const itemId = `sli-${crypto.randomUUID().slice(0, 10)}`;
          const now = new Date().toISOString();
          const maxOrd =
            (
              db
                .prepare('SELECT MAX(sort_order) as max_ord FROM shopping_list_items WHERE list_id = ?')
                .get(listId) as { max_ord: number | null }
            ).max_ord ?? 0;

          db.prepare(
            `INSERT INTO shopping_list_items
               (id, list_id, product_id, custom_title, category_label, quantity, target_unit_price, preferred_merchant, status, priority, notes, added_by_user_id, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            itemId,
            listId,
            resolvedProductId,
            parsed.data.customTitle,
            parsed.data.categoryLabel,
            parsed.data.quantity,
            resolvedPrice,
            parsed.data.preferredMerchant ?? null,
            parsed.data.status,
            parsed.data.priority,
            parsed.data.notes ?? null,
            authUser.id,
            maxOrd + 1,
            now,
            now,
          );
          db.prepare('UPDATE shopping_lists SET updated_at = ? WHERE id = ?').run(now, listId);
          sendJson(res, 201, {
            ok: true,
            data: { itemId, lists: listShoppingListsForUser(db, authUser.id) },
          });
          return;
        }

        const itemMatch = route.match(/^\/shopping-list-items\/([^/]+)$/);
        if (method === 'PATCH' && itemMatch) {
          const itemId = decodeURIComponent(itemMatch[1]);
          const row = db.prepare('SELECT list_id FROM shopping_list_items WHERE id = ?').get(itemId) as
            | { list_id: string }
            | undefined;
          if (!row) {
            sendError(res, 404, 'NOT_FOUND', 'Shopping list item not found');
            return;
          }
          const access = authorizeShoppingListAccess(db, row.list_id, authUser.id, true);
          if (access === 'not_found') {
            sendError(res, 404, 'NOT_FOUND', 'Shopping list item not found');
            return;
          }
          if (access === 'forbidden') {
            sendError(res, 403, 'FORBIDDEN', 'Your workspace permissions do not permit editing this item');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = patchShoppingListItemSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid item updates', parsed.error.flatten());
            return;
          }
          const d = parsed.data;
          const now = new Date().toISOString();
          db.prepare(
            `UPDATE shopping_list_items SET
              quantity = COALESCE(?, quantity),
              target_unit_price = COALESCE(?, target_unit_price),
              preferred_merchant = CASE WHEN ? IS NOT NULL THEN ? ELSE preferred_merchant END,
              status = COALESCE(?, status),
              priority = COALESCE(?, priority),
              notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END,
              updated_at = ?
             WHERE id = ?`,
          ).run(
            d.quantity ?? null,
            d.targetUnitPrice ?? null,
            d.preferredMerchant === undefined ? null : 'set',
            d.preferredMerchant ?? null,
            d.status ?? null,
            d.priority ?? null,
            d.notes === undefined ? null : 'set',
            d.notes ?? null,
            now,
            itemId,
          );
          db.prepare('UPDATE shopping_lists SET updated_at = ? WHERE id = ?').run(now, row.list_id);
          sendJson(res, 200, { ok: true, data: listShoppingListsForUser(db, authUser.id) });
          return;
        }

        if (method === 'DELETE' && itemMatch) {
          const itemId = decodeURIComponent(itemMatch[1]);
          const row = db.prepare('SELECT list_id FROM shopping_list_items WHERE id = ?').get(itemId) as
            | { list_id: string }
            | undefined;
          if (!row) {
            sendError(res, 404, 'NOT_FOUND', 'Shopping list item not found');
            return;
          }
          const access = authorizeShoppingListAccess(db, row.list_id, authUser.id, true);
          if (access === 'not_found') {
            sendError(res, 404, 'NOT_FOUND', 'Shopping list item not found');
            return;
          }
          if (access === 'forbidden') {
            sendError(res, 403, 'FORBIDDEN', 'Your workspace permissions do not permit deleting this item');
            return;
          }
          db.prepare('DELETE FROM shopping_list_items WHERE id = ?').run(itemId);
          sendJson(res, 200, { ok: true, data: listShoppingListsForUser(db, authUser.id) });
          return;
        }

        if (method === 'GET' && route === '/price-alerts') {
          sendJson(res, 200, { ok: true, data: listPriceAlertsForUser(db, authUser.id) });
          return;
        }

        if (method === 'POST' && route === '/price-alerts') {
          const body = await readJsonBody(req);
          const parsed = createPriceAlertSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid price alert inputs', parsed.error.flatten());
            return;
          }
          const alert = upsertUserPriceAlert(db, authUser.id, parsed.data.productId, parsed.data.targetPrice);
          if (!alert) {
            sendError(res, 404, 'NOT_FOUND', 'Product not found');
            return;
          }
          sendJson(res, 201, { ok: true, data: { alert, alerts: listPriceAlertsForUser(db, authUser.id) } });
          return;
        }

        const alertMatch = route.match(/^\/price-alerts\/([^/]+)$/);
        if (method === 'PATCH' && alertMatch) {
          const alertId = decodeURIComponent(alertMatch[1]);
          const existing = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(alertId) as
            | Record<string, unknown>
            | undefined;
          if (!existing || String(existing.user_id) !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Price alert not found');
            return;
          }
          const body = await readJsonBody(req);
          const parsed = patchPriceAlertSchema.safeParse(body);
          if (!parsed.success) {
            sendError(res, 400, 'VALIDATION_ERROR', 'Invalid price alert update', parsed.error.flatten());
            return;
          }
          db.prepare(
            `UPDATE price_alerts SET
              target_price = COALESCE(?, target_price),
              status = COALESCE(?, status)
             WHERE id = ? AND user_id = ?`,
          ).run(parsed.data.targetPrice ?? null, parsed.data.status ?? null, alertId, authUser.id);
          sendJson(res, 200, { ok: true, data: listPriceAlertsForUser(db, authUser.id) });
          return;
        }

        if (method === 'DELETE' && alertMatch) {
          const alertId = decodeURIComponent(alertMatch[1]);
          const existing = db.prepare('SELECT user_id FROM price_alerts WHERE id = ?').get(alertId) as
            | { user_id: string }
            | undefined;
          if (!existing || existing.user_id !== authUser.id) {
            sendError(res, 404, 'NOT_FOUND', 'Price alert not found');
            return;
          }
          db.prepare('DELETE FROM price_alerts WHERE id = ? AND user_id = ?').run(alertId, authUser.id);
          sendJson(res, 200, { ok: true, data: listPriceAlertsForUser(db, authUser.id) });
          return;
        }
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
              model = COALESCE(?, model),
              category = COALESCE(?, category),
              category_ar = COALESCE(?, category_ar),
              category_en = COALESCE(?, category_en),
              price = COALESCE(?, price),
              stock = COALESCE(?, stock),
              image_url = COALESCE(?, image_url),
              description_ar = COALESCE(?, description_ar),
              description_en = COALESCE(?, description_en),
              dimensions = COALESCE(?, dimensions),
              capacity = COALESCE(?, capacity),
              energy_rating = COALESCE(?, energy_rating),
              warranty_months = COALESCE(?, warranty_months),
              price_updated_at = CASE WHEN ? IS NOT NULL THEN ? ELSE price_updated_at END,
              updated_at = ?
             WHERE id = ?`,
          ).run(
            d.nameAr ?? null,
            d.nameEn ?? null,
            d.brand ?? null,
            d.model ?? null,
            d.category ?? null,
            d.categoryAr ?? null,
            d.categoryEn ?? null,
            d.price ?? null,
            d.stock ?? null,
            d.imageUrl ?? null,
            d.descriptionAr ?? null,
            d.descriptionEn ?? null,
            d.dimensions ?? null,
            d.capacity ?? null,
            d.energyRating ?? null,
            d.warrantyMonths ?? null,
            d.price !== undefined ? 'set' : null,
            now.slice(0, 10),
            now,
            id,
          );
          if (d.price !== undefined && Number(d.price) !== Number(existing.price)) {
            db.prepare(
              `INSERT INTO product_price_history (id, product_id, merchant_name, price, source, recorded_at)
               VALUES (?, ?, 'تحديث الكتالوج المعتمد', ?, 'Verified Catalog Price Update', ?)`,
            ).run(`pph-${crypto.randomUUID().slice(0, 10)}`, id, d.price, now.slice(0, 10));
            evaluateTriggeredPriceAlertsForProduct(db, id);
          }
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

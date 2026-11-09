export type Language = 'ar' | 'en';

export type UserRole =
  | 'customer'
  | 'vendor'
  | 'expert'
  | 'moderator'
  | 'editor'
  | 'admin'
  | 'super_admin';

export type UserStatus = 'active' | 'suspended';

export type LifecycleStage =
  | 'thinking'
  | 'early_saving'
  | 'post_engagement'
  | 'apartment_search'
  | 'finishing_apartment'
  | 'furnishing_groom'
  | 'preparing_bride'
  | 'planning_wedding'
  | 'wedding_soon'
  | 'newlywed'
  | 'maintaining_home';

export interface User {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  city?: string;
  governorateSlug?: string;
  currentStage?: LifecycleStage;
  language?: Language;
  avatarUrl?: string;
  isDemoData?: boolean;
  createdAt: string;
}

// Section 1: Apartment Finishing
export type FinishingTier = 'economic' | 'medium' | 'luxury' | 'ultra_luxury' | 'custom';

export interface FinishingService {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  imageUrl: string;
  startingPricePerMeter: number;
  durationDays: string;
  includedItemsAr: string[];
  includedItemsEn: string[];
}

export interface FinishingPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  tier: FinishingTier;
  pricePerMeter: number;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  recommendedForAr: string;
  recommendedForEn: string;
  badge?: string;
}

export interface FinishingInquiry {
  id: string;
  userId?: string;
  customerName: string;
  phone: string;
  governorate: string;
  areaSqm: number;
  roomsCount: number;
  bathroomsCount: number;
  finishingTier: FinishingTier;
  budgetEGP?: number;
  notes?: string;
  status:
    | 'pending'
    | 'under_review'
    | 'site_visit_scheduled'
    | 'quotation_ready'
    | 'in_progress'
    | 'completed';
  createdAt: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
}

// Section 2 & 3: Products (Groom & Bride)
export type TrousseauType = 'groom' | 'bride' | 'shared' | 'finishing';

export interface Product {
  id: string;
  slug?: string;
  trousseauType: TrousseauType;
  category: string;
  categoryAr: string;
  categoryEn: string;
  nameAr: string;
  nameEn: string;
  brand: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
  imageUrl: string;
  galleryUrls?: string[];
  descriptionAr: string;
  descriptionEn: string;
  specsAr: Record<string, string>;
  specsEn: Record<string, string>;
  priceSource?: string;
  priceUpdatedAt?: string;
  isFeatured?: boolean;
  isReadyPackageItem?: boolean;
  isDemoData?: boolean;
}

export interface TrousseauPackage {
  id: string;
  trousseauType: TrousseauType;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  totalPrice: number;
  originalPrice: number;
  savings: number;
  imageUrl: string;
  itemsCount: number;
  itemsAr: string[];
  itemsEn: string[];
  popular?: boolean;
}

// Section 4: Wedding Planner
export type WeddingCategory =
  | 'venue'
  | 'dress'
  | 'car'
  | 'photography'
  | 'beauty'
  | 'decor'
  | 'entertainment'
  | 'catering'
  | 'package';

export interface WeddingServiceItem {
  id: string;
  slug?: string;
  category: WeddingCategory;
  nameAr: string;
  nameEn: string;
  governorateSlug?: string;
  locationAr: string;
  locationEn: string;
  startingPrice: number;
  pricingType: 'fixed' | 'per_person' | 'per_hour' | 'package';
  imageUrl: string;
  galleryUrls: string[];
  rating: number;
  reviewsCount: number;
  capacity?: string;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  badge?: string;
  isDemoData?: boolean;
}

export interface WeddingBookingRequest {
  id: string;
  userId?: string;
  serviceId: string;
  serviceName: string;
  category: WeddingCategory;
  customerName: string;
  phone: string;
  weddingDate: string;
  guestCount?: number;
  governorate: string;
  notes?: string;
  status:
    | 'pending_review'
    | 'contacted'
    | 'date_confirmed'
    | 'deposit_paid'
    | 'completed'
    | 'cancelled';
  createdAt: string;
}

// Cart & Orders
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cash_on_delivery' | 'card' | 'installments_request';
  status: 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

// Financing / Installments
export interface FinancingApplication {
  id: string;
  userId?: string;
  customerName: string;
  phone: string;
  nationalId: string;
  monthlyIncome: number;
  employer: string;
  governorate: string;
  requestedAmount: number;
  tenureMonths: number;
  preferredProvider: string;
  associatedSection: 'finishing' | 'groom' | 'bride' | 'wedding' | 'general';
  status: 'submitted' | 'under_review' | 'documents_required' | 'approved' | 'rejected';
  createdAt: string;
}

// Social Support Initiative
export interface SupportCase {
  id: string;
  userId?: string;
  applicantName: string;
  nationalId: string;
  phone: string;
  governorate: string;
  address: string;
  category:
    | 'apartment_finishing'
    | 'appliances_furniture'
    | 'groom_bride_essentials'
    | 'wedding_hall';
  caseDescription: string;
  urgencyLevel: 'normal' | 'urgent' | 'critical';
  documentsSubmitted: string[];
  status:
    | 'confidential_review'
    | 'field_research'
    | 'approved_for_support'
    | 'funded_and_delivered'
    | 'ineligible';
  supportValueEstimated?: number;
  createdAt: string;
  internalNotes?: string;
}

export interface SponsorshipInquiry {
  id: string;
  sponsorName: string;
  companyName?: string;
  phone: string;
  email: string;
  contributionType:
    | 'financial'
    | 'in_kind_goods'
    | 'finishing_materials'
    | 'full_wedding_sponsorship';
  pledgeAmount?: number;
  message: string;
  status: 'new' | 'contacted' | 'agreement_signed' | 'fulfilled';
  createdAt: string;
}

// Platform Settings
export interface PlatformSettings {
  brandNameAr: string;
  brandNameEn: string;
  sloganAr: string;
  sloganEn: string;
  hotline: string;
  whatsapp: string;
  email: string;
  addressAr: string;
  addressEn: string;
  activeInstallmentProviders: string[];
  interestRateAnnual: number;
  enableFinancing: boolean;
  enableSocialSupport: boolean;
  currencyAr: string;
  currencyEn: string;
}

// CMS, Encyclopedia & Local SEO Foundation (Stage 1)
export type ContentDomain =
  | 'finishing'
  | 'groom'
  | 'bride'
  | 'wedding'
  | 'early_start'
  | 'married_life'
  | 'editorial';

export type ContentType =
  | 'article'
  | 'guide'
  | 'tutorial'
  | 'review'
  | 'comparison'
  | 'case_study'
  | 'video'
  | 'faq'
  | 'glossary'
  | 'local_guide';

export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface ContentCategory {
  id: string;
  slug: string;
  domain: ContentDomain;
  parentId?: string | null;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  sortOrder: number;
}

export interface ArticleFaqItem {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export interface Article {
  id: string;
  slug: string;
  categoryId: string;
  domain: ContentDomain;
  contentType: ContentType;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  bodyAr: string;
  bodyEn: string;
  featuredImage: string;
  authorName: string;
  tags: string[];
  faqs: ArticleFaqItem[];
  relatedCalculators: string[];
  seoTitleAr?: string;
  seoTitleEn?: string;
  metaDescAr?: string;
  metaDescEn?: string;
  status: ArticleStatus;
  readingMinutes: number;
  viewCount: number;
  isFeatured: boolean;
  publishedAt: string;
  updatedAt: string;
}

export interface LocationNode {
  id: string;
  slug: string;
  level: 'country' | 'governorate' | 'city' | 'district' | 'area';
  parentId?: string | null;
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  costFactor: number;
  isFeatured: boolean;
  sortOrder: number;
}

export interface AuditLogEntry {
  id: string;
  actorUserId?: string | null;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: string;
}

// =========================================================================
// STAGE 2: COMPLETE ENCYCLOPEDIA & KNOWLEDGE HUB TYPES (MODULES C, D, E, O)
// =========================================================================

export interface FinishingEncyclopediaCategory {
  id: string;
  slug: string;
  stepOrder: number;
  phaseKey: 'planning' | 'rough_in' | 'surfaces' | 'fit_out' | 'handover';
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  budgetSharePercent: number;
  typicalDurationAr: string;
  typicalDurationEn: string;
  technicalSpecsAr: string[];
  technicalSpecsEn: string[];
  commonMistakesAr: string[];
  commonMistakesEn: string[];
  inspectionChecklistAr: string[];
  inspectionChecklistEn: string[];
  recommendedMaterialsAr: string[];
  recommendedMaterialsEn: string[];
  imageUrl: string;
}

export interface FinishingMaterialItem {
  id: string;
  slug: string;
  categorySlug: string;
  materialGroup: 'flooring' | 'plumbing' | 'electrical' | 'paint' | 'gypsum' | 'countertop' | 'windows' | 'waterproofing';
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  originAr: string;
  originEn: string;
  unitAr: string;
  unitEn: string;
  priceMinEgp: number;
  priceMaxEgp: number;
  priceSource: string;
  priceUpdatedAt: string;
  prosAr: string[];
  prosEn: string[];
  consAr: string[];
  consEn: string[];
  alternativesAr: string[];
  alternativesEn: string[];
  specsAr: Record<string, string>;
  specsEn: Record<string, string>;
  bestUseAr: string;
  bestUseEn: string;
  imageUrl: string;
}

export interface BeforeAfterProject {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  governorateSlug: string;
  governorateAr: string;
  governorateEn: string;
  areaSqm: number;
  tier: FinishingTier;
  tierAr: string;
  tierEn: string;
  durationDays: number;
  durationAr: string;
  durationEn: string;
  estimatedBandAr: string;
  estimatedBandEn: string;
  beforeImage: string;
  afterImage: string;
  descriptionAr: string;
  descriptionEn: string;
  scopeHighlightsAr: string[];
  scopeHighlightsEn: string[];
  isSampleListing: boolean;
}

export interface FinishingContractorListing {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  roleTitleAr: string;
  roleTitleEn: string;
  specialtyGroup: 'turnkey' | 'architect_3d' | 'mep' | 'carpentry_kitchens';
  specialtyAr: string;
  specialtyEn: string;
  governoratesCovered: string[];
  experienceYears: number;
  verificationBadge: 'registered' | 'verified';
  pricingModelAr: string;
  pricingModelEn: string;
  portfolioHighlightsAr: string[];
  portfolioHighlightsEn: string[];
  warrantyOfferedAr: string;
  warrantyOfferedEn: string;
  reviewsCount: number;
  ratingNoteAr: string;
  ratingNoteEn: string;
  isSampleListing: boolean;
}

export interface GroomSubcategoryGuide {
  id: string;
  slug: string;
  groupKey: 'appliances' | 'furniture' | 'household';
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  priority: 'essential' | 'recommended' | 'optional';
  budgetSharePercent: number;
  estimatedMinEgp: number;
  estimatedMaxEgp: number;
  buyingChecklistAr: string[];
  buyingChecklistEn: string[];
  warrantyTipsAr: string;
  warrantyTipsEn: string;
}

export interface GroomPackageOption {
  optionId: string;
  tierLevel: 'economic' | 'balanced' | 'premium';
  productId?: string;
  nameAr: string;
  nameEn: string;
  brand: string;
  specsAr: string;
  specsEn: string;
  priceEgp: number;
}

export interface GroomPackageSlot {
  slotKey: string;
  slotLabelAr: string;
  slotLabelEn: string;
  categoryGroup: 'appliances' | 'furniture' | 'household';
  required: boolean;
  defaultOptionId: string;
  options: GroomPackageOption[];
}

export interface GroomConfigurablePackage {
  id: string;
  slug: string;
  tierKey: 'tier_100k' | 'tier_200k' | 'tier_300k' | 'tier_500k' | 'custom';
  targetBudgetEgp: number;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  warrantyNoteAr: string;
  warrantyNoteEn: string;
  priceUpdatedAt: string;
  slots: GroomPackageSlot[];
}

export interface BrideCategoryGuide {
  id: string;
  slug: string;
  sortOrder: number;
  groupKey: 'kitchen_cookware' | 'dining_hosting' | 'linens_bedding' | 'bath_home' | 'personal_care';
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  budgetWeightPercent: number;
  antiWasteTipAr: string;
  antiWasteTipEn: string;
  recommendedCountLabelAr: string;
  recommendedCountLabelEn: string;
}

export interface BrideChecklistTemplateItem {
  id: string;
  categoryId: string;
  labelAr: string;
  labelEn: string;
  recommendedQty: number;
  unitLabelAr: string;
  unitLabelEn: string;
  priority: 'essential' | 'recommended' | 'optional';
  estimatedUnitPriceEgp: number;
  presets: ('compact' | 'balanced' | 'extended')[];
  noteAr: string;
  noteEn: string;
}

export interface UserGroomPlanState {
  selectedTierKey: 'tier_100k' | 'tier_200k' | 'tier_300k' | 'tier_500k' | 'custom';
  targetBudgetEgp: number;
  slotSelections: Record<string, string>;
  excludedSlots: string[];
  customItems: string[];
  updatedAt?: string;
}

export interface UserBrideCustomItem {
  id: string;
  categoryId: string;
  labelAr: string;
  labelEn: string;
  qty: number;
  estimatedUnitPriceEgp: number;
  checked: boolean;
}

export interface UserBridePlanState {
  presetMode: 'compact' | 'balanced' | 'extended';
  targetBudgetEgp: number;
  checkedItemIds: string[];
  qtyOverrides: Record<string, number>;
  customItems: UserBrideCustomItem[];
  updatedAt?: string;
}

export interface GlossaryTerm {
  id: string;
  slug: string;
  domain: ContentDomain;
  termAr: string;
  termEn: string;
  definitionAr: string;
  definitionEn: string;
  exampleAr: string;
  exampleEn: string;
  relatedCalculatorSlug?: string;
}

export interface FaqEntry {
  id: string;
  domain: ContentDomain;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  sortOrder: number;
}

// =========================================================================
// STAGE 3: UNIFIED 20 SMART CALCULATORS & WEDDING BUDGET MANAGER (MODULES G, H)
// =========================================================================

export type CalculatorCategoryGroup =
  | 'comprehensive'
  | 'finishing_home'
  | 'trousseau'
  | 'celebration_life'
  | 'finance_planning';

export type CalculatorFieldType = 'number' | 'select' | 'boolean';

export interface CalculatorFieldOption {
  value: string;
  labelAr: string;
  labelEn: string;
}

export interface CalculatorFieldDescriptor {
  key: string;
  type: CalculatorFieldType;
  labelAr: string;
  labelEn: string;
  helperAr?: string;
  helperEn?: string;
  unitAr?: string;
  unitEn?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: CalculatorFieldOption[];
}

export interface CalculatorBreakdownItem {
  key: string;
  labelAr: string;
  labelEn: string;
  amount: number;
  unit?: string;
  unitLabelAr?: string;
  unitLabelEn?: string;
  percent?: number;
}

export interface CalculatorOutput {
  slug: string;
  nameAr: string;
  nameEn: string;
  primaryMetric: {
    labelAr: string;
    labelEn: string;
    value: number;
    unit: string;
    unitLabelAr: string;
    unitLabelEn: string;
  };
  secondaryMetrics: {
    key: string;
    labelAr: string;
    labelEn: string;
    value: string;
    rawValue?: number;
  }[];
  breakdown: CalculatorBreakdownItem[];
  formulaSummaryAr: string;
  formulaSummaryEn: string;
  assumptionsAr: string[];
  assumptionsEn: string[];
  warningsAr: string[];
  warningsEn: string[];
  suggestedBudgetCategorySlug: string;
  suggestedBudgetTitleAr: string;
  suggestedBudgetTitleEn: string;
  recommendedChecklistItems?: {
    domain: 'finishing' | 'groom' | 'bride' | 'wedding';
    labelAr: string;
    labelEn: string;
  }[];
  computedAt: string;
}

export interface CalculatorSummary {
  slug: string;
  order: number;
  categoryGroup: CalculatorCategoryGroup;
  nameAr: string;
  nameEn: string;
  shortDescAr: string;
  shortDescEn: string;
  iconName: string;
  primaryUnit: string;
  suggestedBudgetCategorySlug: string;
  defaultInputs: Record<string, number | string | boolean>;
  fields: CalculatorFieldDescriptor[];
}

export interface CalculatorRunRecord {
  id: string;
  userId?: string | null;
  calculatorSlug: string;
  inputs: Record<string, number | string | boolean>;
  output: CalculatorOutput;
  primaryValue: number;
  savedTitle?: string | null;
  createdAt: string;
}

export type BudgetOwnerSide = 'groom' | 'bride' | 'shared';
export type BudgetPaymentType = 'deposit' | 'installment' | 'full' | 'emergency';
export type BudgetExpenseStatus = 'planned' | 'upcoming' | 'paid';
export type BudgetSourceType =
  | 'manual'
  | 'calculator_run'
  | 'order'
  | 'finishing_inquiry'
  | 'wedding_booking'
  | 'rfq_quote';

export interface BudgetPlan {
  id: string;
  userId: string;
  titleAr: string;
  titleEn: string;
  totalBudgetLimit: number;
  groomContributionTarget: number;
  brideContributionTarget: number;
  familySupportTarget: number;
  emergencyReserveTarget: number;
  currency: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  budgetPlanId: string;
  userId: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  ownerSide: BudgetOwnerSide;
  plannedAmount: number;
  limitAmount: number;
  paidAmount: number;
  upcomingAmount: number;
  totalCommitted: number;
  remainingAmount: number;
  isOverLimit: boolean;
  sortOrder: number;
}

export interface BudgetExpense {
  id: string;
  budgetPlanId: string;
  budgetCategoryId: string;
  categorySlug: string;
  userId: string;
  title: string;
  vendorOrPayee?: string | null;
  amount: number;
  paymentType: BudgetPaymentType;
  status: BudgetExpenseStatus;
  paidBySide: BudgetOwnerSide;
  dueDate?: string | null;
  paidAt?: string | null;
  sourceType: BudgetSourceType;
  sourceId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  type: 'over_limit' | 'upcoming_payment' | 'reserve_low';
  severity: 'warning' | 'critical';
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  categorySlug?: string;
  expenseId?: string;
}

export interface BudgetOverviewPayload {
  plan: BudgetPlan;
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  alerts: BudgetAlert[];
  summary: {
    totalBudgetLimit: number;
    totalPlanned: number;
    totalPaid: number;
    totalUpcoming: number;
    totalCommitted: number;
    remainingFromLimit: number;
    utilizationPercent: number;
    groomAllocated: number;
    brideAllocated: number;
    sharedAllocated: number;
    groomPaid: number;
    bridePaid: number;
    sharedPaid: number;
  };
}

// =========================================================================
// STAGE 4: EARLY START & MY FUTURE FUND (MODULE A)
// =========================================================================

export type EarlyStartTimeframePreset =
  | '10y'
  | '7y'
  | '5y'
  | '3y'
  | '2y'
  | '1y'
  | '6m'
  | 'custom';

export type EarlyStartReminderFrequency = 'weekly' | 'biweekly' | 'monthly' | 'off';

export type SavingsGoalType =
  | 'marriage'
  | 'apartment_purchase'
  | 'finishing'
  | 'furniture'
  | 'appliances'
  | 'wedding'
  | 'emergency';

export type EarlyStartMilestoneTrack = 'financial' | 'personal' | 'education' | 'housing';

export interface EarlyStartProfile {
  userId: string;
  timeframePreset: EarlyStartTimeframePreset;
  timeframeMonths: number;
  expectedMarriageDate?: string | null;
  targetMarriageBudget: number;
  initialCapital: number;
  monthlySavingsTarget: number;
  emergencyReserveTarget: number;
  reminderFrequency: EarlyStartReminderFrequency;
  personalNotes?: string | null;
  isPrivate: boolean;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  goalType: SavingsGoalType;
  titleAr: string;
  titleEn: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  completionPercent: number;
  remainingAmount: number;
  targetDate?: string | null;
  priority: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsContribution {
  id: string;
  savingsGoalId: string;
  userId: string;
  amount: number;
  contributionType: 'deposit' | 'adjustment';
  contributionDate: string;
  streakMonth: string;
  note?: string | null;
  createdAt: string;
}

export interface SavingsBadge {
  id: string;
  userId: string;
  badgeKey: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  earnedAt: string;
}

export interface EarlyStartMilestone {
  id: string;
  userId: string;
  track: EarlyStartMilestoneTrack;
  titleAr: string;
  titleEn: string;
  targetMonthsOut: number;
  completed: boolean;
  completedAt?: string | null;
  sortOrder: number;
}

export interface EarlyStartAcademyLesson {
  slug: string;
  order: number;
  track: EarlyStartMilestoneTrack;
  titleAr: string;
  titleEn: string;
  readingMinutes: number;
  summaryAr: string;
  summaryEn: string;
  keyPointsAr: string[];
  keyPointsEn: string[];
  practicalActionAr: string;
  practicalActionEn: string;
}

export interface MonthlySavingsReportPoint {
  month: string;
  depositedEgp: number;
  cumulativeEgp: number;
}

export interface WhatIfScenarioResult {
  key: string;
  labelAr: string;
  labelEn: string;
  monthlyStartEgp: number;
  annualStepUpPercent: number;
  horizonMonths: number;
  projectedCashEgp: number;
  projectedGoalCostEgp: number;
  coveragePercent: number;
  gapOrSurplusEgp: number;
  requiredMonthlyAtConstantRateEgp: number;
}

export interface EarlyStartOverviewPayload {
  profile: EarlyStartProfile;
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  badges: SavingsBadge[];
  milestones: EarlyStartMilestone[];
  completedLessonSlugs: string[];
  monthlyHistory: MonthlySavingsReportPoint[];
  summary: {
    totalGoalsTarget: number;
    totalCurrentSaved: number;
    overallCompletionPercent: number;
    emergencySaved: number;
    emergencyTarget: number;
    monthlyCommittedSum: number;
    recommendedMonthlyNeeded: number;
    annualSavingsTarget: number;
    streakMonths: number;
    milestonesCompletedCount: number;
    milestonesTotalCount: number;
  };
}

// =========================================================================
// STAGE 5: LIFECYCLE ONBOARDING, ENGAGEMENT, JOURNEY PLANNER & SHARED WORKSPACE (MODULES B, I, J)
// =========================================================================

export interface LifecycleStageInfo {
  stage: LifecycleStage;
  order: number;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  recommendedPrimaryRoute: string;
  recommendedPrimaryLabelAr: string;
  recommendedPrimaryLabelEn: string;
  recommendedSecondaryRoute: string;
  recommendedSecondaryLabelAr: string;
  recommendedSecondaryLabelEn: string;
  keyFocusAr: string[];
  keyFocusEn: string[];
}

export interface LifecycleTransitionRecord {
  id: string;
  userId: string;
  fromStage?: LifecycleStage | null;
  toStage: LifecycleStage;
  note?: string | null;
  changedAt: string;
}

export type EngagementVenueStatus = 'researching' | 'shortlisted' | 'booked' | 'home_ceremony';
export type EngagementItemType = 'checklist' | 'gift_ring' | 'guest_group' | 'budget_line';
export type EngagementItemStatus = 'planned' | 'in_progress' | 'done';

export interface EngagementPlan {
  id: string;
  userId: string;
  engagementDate?: string | null;
  targetBudget: number;
  shabkaBudget: number;
  venueBudget: number;
  attireBudget: number;
  hospitalityBudget: number;
  venueName?: string | null;
  venueStatus: EngagementVenueStatus;
  ringNotes?: string | null;
  familyNotes?: string | null;
  updatedAt: string;
}

export interface EngagementItem {
  id: string;
  userId: string;
  itemType: EngagementItemType;
  titleAr: string;
  titleEn: string;
  ownerSide: 'groom' | 'bride' | 'shared';
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  actualCost: number;
  guestCount: number;
  status: EngagementItemStatus;
  notes?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementOverviewPayload {
  plan: EngagementPlan;
  items: EngagementItem[];
  summary: {
    targetBudget: number;
    allocatedComponentsSum: number;
    totalEstimatedItemsCost: number;
    totalActualItemsCost: number;
    totalInvitedGuests: number;
    completedTasksCount: number;
    totalChecklistCount: number;
    completionPercent: number;
  };
}

export type JourneyPhaseKey =
  | 'early_start'
  | 'engagement'
  | '12m'
  | '9m'
  | '6m'
  | '3m'
  | '1m'
  | 'final_week'
  | 'wedding_day'
  | 'post_wedding';

export type JourneyTaskStatus = 'todo' | 'in_progress' | 'done';
export type JourneyTaskPriority = 'low' | 'medium' | 'high';

export interface JourneyPhaseInfo {
  key: JourneyPhaseKey;
  order: number;
  titleAr: string;
  titleEn: string;
  windowLabelAr: string;
  windowLabelEn: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface JourneyTask {
  id: string;
  userId: string;
  workspaceId?: string | null;
  phase: JourneyPhaseKey;
  titleAr: string;
  titleEn: string;
  description?: string | null;
  ownerSide: 'groom' | 'bride' | 'shared';
  assignedUserId?: string | null;
  dueDate?: string | null;
  reminderDate?: string | null;
  dependsOnTaskId?: string | null;
  dependsOnTitleAr?: string | null;
  dependsOnTitleEn?: string | null;
  isDependencyBlocked?: boolean;
  status: JourneyTaskStatus;
  priority: JourneyTaskPriority;
  estimatedCost: number;
  attachmentLabel?: string | null;
  attachmentUrl?: string | null;
  sortOrder: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
}

export interface JourneyOverviewPayload {
  tasks: JourneyTask[];
  workspaceId?: string | null;
  summary: {
    totalTasks: number;
    doneTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    blockedTasks: number;
    completionPercent: number;
    overdueTasksCount: number;
    upcomingRemindersCount: number;
    byOwnerSide: {
      groom: number;
      bride: number;
      shared: number;
    };
  };
}

export interface WorkspacePermissions {
  budgetRead: boolean;
  budgetWrite: boolean;
  tasksRead: boolean;
  tasksWrite: boolean;
  shoppingRead: boolean;
  shoppingWrite: boolean;
  documentsRead: boolean;
  documentsWrite: boolean;
  approvePurchases: boolean;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  memberRole: 'owner' | 'partner' | 'planner_guest';
  sideLabel: 'groom' | 'bride' | 'partner';
  permissions: WorkspacePermissions;
  status: 'active' | 'revoked';
  joinedAt: string;
  revokedAt?: string | null;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceNameAr: string;
  workspaceNameEn: string;
  inviterUserId: string;
  inviterName: string;
  inviteeEmail?: string | null;
  inviteePhone?: string | null;
  inviteToken: string;
  proposedRole: 'partner' | 'planner_guest';
  proposedSide: 'groom' | 'bride' | 'partner';
  permissions: WorkspacePermissions;
  status: 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';
  expiresAt: string;
  createdAt: string;
  respondedAt?: string | null;
}

export interface WorkspaceApproval {
  id: string;
  workspaceId: string;
  requestedByUserId: string;
  requestedByName: string;
  title: string;
  category: string;
  estimatedAmount: number;
  status: 'pending' | 'approved' | 'changes_requested' | 'rejected';
  reviewerUserId?: string | null;
  reviewerName?: string | null;
  reviewerNote?: string | null;
  createdAt: string;
  decidedAt?: string | null;
}

export interface CoupleWorkspacePayload {
  workspace: {
    id: string;
    ownerUserId: string;
    nameAr: string;
    nameEn: string;
    engagementDate?: string | null;
    weddingDate?: string | null;
    status: 'active' | 'archived';
    createdAt: string;
    updatedAt: string;
  };
  myRole: 'owner' | 'partner' | 'planner_guest';
  myPermissions: WorkspacePermissions;
  members: WorkspaceMember[];
  sentInvitations: WorkspaceInvitation[];
  incomingInvitations: WorkspaceInvitation[];
  approvals: WorkspaceApproval[];
}

export type UserDocumentType =
  | 'contract'
  | 'floor_plan'
  | 'warranty'
  | 'receipt'
  | 'quote'
  | 'id_copy'
  | 'other';

export interface UserDocumentItem {
  id: string;
  userId: string;
  workspaceId?: string | null;
  docType: UserDocumentType;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  referenceCode?: string | null;
  notes?: string | null;
  isSharedWithPartner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWarrantyItem {
  id: string;
  userId: string;
  workspaceId?: string | null;
  itemName: string;
  category: string;
  providerName: string;
  modelSerial?: string | null;
  startDate: string;
  expiryDate: string;
  notes?: string | null;
  createdAt: string;
}

export type UserAppointmentType =
  | 'finishing_visit'
  | 'hall_tour'
  | 'showroom'
  | 'gold_shopping'
  | 'photography_meeting'
  | 'other';

export type UserAppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'rescheduled'
  | 'completed'
  | 'cancelled';

export interface UserAppointmentItem {
  id: string;
  userId: string;
  workspaceId?: string | null;
  title: string;
  appointmentType: UserAppointmentType;
  providerName: string;
  locationText: string;
  scheduledAt: string;
  status: UserAppointmentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'reminder'
  | 'budget_alert'
  | 'workspace_invite'
  | 'approval'
  | 'milestone'
  | 'system';

export interface UserNotification {
  id: string;
  userId: string;
  notifType: NotificationType;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  linkPath?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export type MyGawazInnSubmoduleKey =
  | 'profile'
  | 'journey'
  | 'budget'
  | 'savings'
  | 'checklists'
  | 'shopping'
  | 'favorites'
  | 'comparisons'
  | 'quotations'
  | 'bookings'
  | 'appointments'
  | 'documents'
  | 'invoices'
  | 'warranties'
  | 'notifications'
  | 'workspace'
  | 'settings';

export interface MyGawazInnHubPayload {
  currentStage: LifecycleStage;
  lifecycleHistory: LifecycleTransitionRecord[];
  engagement: EngagementOverviewPayload;
  journey: JourneyOverviewPayload;
  workspace: CoupleWorkspacePayload;
  documents: UserDocumentItem[];
  warranties: UserWarrantyItem[];
  appointments: UserAppointmentItem[];
  notifications: UserNotification[];
  unreadNotificationsCount: number;
  counts: {
    ordersCount: number;
    finishingInquiriesCount: number;
    weddingBookingsCount: number;
    financingAppsCount: number;
    calculatorRunsCount: number;
    documentsCount: number;
    warrantiesCount: number;
    appointmentsCount: number;
    pendingApprovalsCount: number;
  };
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  meta?: PaginatedMeta;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;


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
  model?: string;
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
  dimensions?: string;
  capacity?: string;
  energyRating?: string;
  warrantyMonths?: number;
  warrantyTermsAr?: string;
  warrantyTermsEn?: string;
  originCountryAr?: string;
  originCountryEn?: string;
  prosAr?: string[];
  prosEn?: string[];
  consAr?: string[];
  consEn?: string[];
  buyerWarningsAr?: string[];
  buyerWarningsEn?: string[];
  recommendedForAr?: string;
  recommendedForEn?: string;
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

// ==================== STAGE 6: PRODUCT ENCYCLOPEDIA, COMPARISONS & SHOPPING LISTS ====================

export type MerchantWarrantyType = 'official_agent' | 'authorized_dealer' | 'gray_market_importer';
export type AlternativeRelationType = 'budget' | 'upgrade' | 'energy_saver' | 'compact';
export type ShoppingListType =
  | 'groom_appliances'
  | 'bride_kitchen'
  | 'finishing_hardware'
  | 'home_furniture'
  | 'general';
export type ShoppingListItemStatus = 'planned' | 'shortlisted' | 'ready_to_buy' | 'purchased';
export type PriceAlertStatus = 'active' | 'triggered' | 'paused';

export interface ProductPricePoint {
  id: string;
  productId: string;
  merchantName: string;
  price: number;
  source: string;
  recordedAt: string;
}

export interface ProductMerchantOffer {
  id: string;
  productId: string;
  merchantName: string;
  warrantyType: MerchantWarrantyType;
  price: number;
  deliverySlaAr: string;
  deliverySlaEn: string;
  inStock: boolean;
  notesAr?: string | null;
  notesEn?: string | null;
  updatedAt: string;
}

export interface ProductAlternativeLink {
  id: string;
  productId: string;
  alternativeProductId: string;
  relationType: AlternativeRelationType;
  reasonAr: string;
  reasonEn: string;
  alternativeProduct?: Product;
}

export interface ProductEncyclopediaDetail {
  product: Product;
  priceHistory: ProductPricePoint[];
  merchantOffers: ProductMerchantOffer[];
  alternatives: ProductAlternativeLink[];
}

export interface ProductComparisonMatrixPayload {
  products: Product[];
  offersByProductId: Record<string, ProductMerchantOffer[]>;
  highlights: {
    lowestPriceProductId?: string;
    longestWarrantyProductId?: string;
    bestEnergyProductId?: string;
    bestWarrantyValueProductId?: string;
  };
  unifiedSpecKeysAr: string[];
  unifiedSpecKeysEn: string[];
}

export interface ShoppingListItem {
  id: string;
  listId: string;
  productId?: string | null;
  product?: Product | null;
  customTitle: string;
  categoryLabel: string;
  quantity: number;
  targetUnitPrice: number;
  preferredMerchant?: string | null;
  status: ShoppingListItemStatus;
  priority: 'high' | 'medium' | 'low';
  notes?: string | null;
  addedByUserId?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  userId: string;
  workspaceId?: string | null;
  titleAr: string;
  titleEn: string;
  listType: ShoppingListType;
  isSharedWithPartner: boolean;
  budgetTarget: number;
  notes?: string | null;
  items: ShoppingListItem[];
  totalEstimatedCost: number;
  totalPurchasedCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  product?: Product | null;
  targetPrice: number;
  currentPriceSnapshot: number;
  status: PriceAlertStatus;
  triggeredAt?: string | null;
  createdAt: string;
}

// ==================== STAGE 7: VENDOR MARKETPLACE, SUBSCRIPTIONS & LOCAL DISCOVERY SEO ====================

export type VendorDomain = 'finishing' | 'groom' | 'bride' | 'wedding' | 'post_marriage';
export type VendorVerificationStatus = 'registered' | 'verified' | 'trusted' | 'rejected';
export type VendorCommercialStatus = 'active' | 'past_due' | 'paused';
export type VendorPriceTier = 'economy' | 'mid' | 'luxury';
export type SubscriptionPlanCode = 'free' | 'basic' | 'professional' | 'premium';

export interface VendorCategory {
  id: string;
  slug: string;
  domain: VendorDomain;
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  iconName: string;
  buyerChecklistAr: string[];
  buyerChecklistEn: string[];
  sortOrder: number;
}

export interface SubscriptionPlan {
  id: string;
  code: SubscriptionPlanCode;
  nameAr: string;
  nameEn: string;
  monthlyPriceEgp: number;
  annualPriceEgp: number;
  maxServices: number;
  maxPromotions: number;
  maxPortfolioItems: number;
  leadPriorityBoost: number;
  analyticsTier: 'basic' | 'standard' | 'advanced' | 'enterprise';
  featuresAr: string[];
  featuresEn: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface VendorServiceOffering {
  id: string;
  vendorId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  unitLabelAr: string;
  unitLabelEn: string;
  startingPriceEgp: number;
  turnaroundDays?: string | null;
  warrantyMonths: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface VendorPromotion {
  id: string;
  vendorId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  discountPercent: number;
  promoCode?: string | null;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export interface VendorReview {
  id: string;
  vendorId: string;
  authorUserId: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedProject: boolean;
  createdAt: string;
}

export interface VendorListing {
  id: string;
  ownerUserId: string;
  slug: string;
  businessNameAr: string;
  businessNameEn: string;
  primaryCategorySlug: string;
  categoryNameAr?: string;
  categoryNameEn?: string;
  extraCategorySlugs: string[];
  governorateSlug: string;
  citySlug?: string | null;
  serviceAreas: string[];
  addressAr: string;
  addressEn: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  bioAr: string;
  bioEn: string;
  coverImage: string;
  logoImage?: string | null;
  portfolioImages: string[];
  priceTier: VendorPriceTier;
  startingPriceEgp: number;
  yearsExperience: number;
  verificationStatus: VendorVerificationStatus;
  verificationDocs: string[];
  verificationNotes?: string | null;
  verifiedAt?: string | null;
  verifiedByUserId?: string | null;
  subscriptionPlanId: string;
  subscriptionPlanCode: SubscriptionPlanCode;
  subscriptionPlanNameAr?: string;
  subscriptionPlanNameEn?: string;
  commercialStatus: VendorCommercialStatus;
  subscriptionStartedAt?: string | null;
  subscriptionRenewsAt?: string | null;
  ratingAvg: number;
  reviewsCount: number;
  profileViews: number;
  isFeaturedCommercial: boolean;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
  services?: VendorServiceOffering[];
  promotions?: VendorPromotion[];
  reviews?: VendorReview[];
}

export interface VendorBillingRecord {
  id: string;
  vendorId: string;
  planId: string;
  planCode?: SubscriptionPlanCode;
  planNameAr?: string;
  planNameEn?: string;
  billingCycle: 'monthly' | 'annual';
  amountEgp: number;
  status: 'recorded' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface VendorPortalOverviewPayload {
  vendor: VendorListing | null;
  plan: SubscriptionPlan | null;
  allPlans: SubscriptionPlan[];
  services: VendorServiceOffering[];
  promotions: VendorPromotion[];
  reviews: VendorReview[];
  billingRecords: VendorBillingRecord[];
  quotas: {
    servicesUsed: number;
    maxServices: number;
    promotionsUsed: number;
    maxPromotions: number;
    portfolioUsed: number;
    maxPortfolioItems: number;
  };
}

export interface LocalCategoryGuidePayload {
  location: LocationNode;
  parentLocation: LocationNode | null;
  children: LocationNode[];
  category: VendorCategory | null;
  allCategories: VendorCategory[];
  matchedVendors: VendorListing[];
  matchedWeddingServices: WeddingServiceItem[];
  regionalBaselineMin: number;
  regionalBaselineMax: number;
}

// ==================== STAGE 8: MULTI-VENDOR RFQ ENGINE, SLOT APPOINTMENTS & VENDOR CRM ====================

export type RfqStatus = 'open' | 'quoted' | 'accepted' | 'closed' | 'cancelled';
export type RfqInvitationStatus = 'invited' | 'viewed' | 'quoted' | 'declined';
export type RfqQuoteStatus = 'submitted' | 'accepted' | 'rejected' | 'withdrawn';
export type MarketplaceAppointmentType =
  | 'site_visit'
  | 'showroom'
  | 'hall_tour'
  | 'video_consultation'
  | 'contract_signing'
  | 'measuring';
export type MarketplaceAppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'rescheduled'
  | 'cancelled'
  | 'completed';
export type VendorLeadStage =
  | 'new_lead'
  | 'contacted'
  | 'quotation_sent'
  | 'negotiation'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'lost';
export type VendorLeadActivityType =
  | 'status_change'
  | 'note'
  | 'call'
  | 'quote_sent'
  | 'appointment'
  | 'budget_accepted';

export interface RfqInvitation {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorSlug?: string;
  vendorNameAr?: string;
  vendorNameEn?: string;
  verificationStatus?: VendorVerificationStatus;
  status: RfqInvitationStatus;
  invitedAt: string;
}

export interface RfqQuote {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorSlug?: string;
  vendorNameAr?: string;
  vendorNameEn?: string;
  vendorVerificationStatus?: VendorVerificationStatus;
  vendorRatingAvg?: number;
  vendorReviewsCount?: number;
  quotedAmountEgp: number;
  depositAmountEgp: number;
  estimatedDuration: string;
  warrantyMonths: number;
  scopeSummary: string;
  termsNotes?: string | null;
  validUntil: string;
  status: RfqQuoteStatus;
  customerDecisionNote?: string | null;
  linkedBudgetExpenseId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RfqMessage {
  id: string;
  rfqId: string;
  senderUserId: string;
  senderRole: 'customer' | 'vendor' | 'admin';
  senderName: string;
  vendorId?: string | null;
  body: string;
  createdAt: string;
}

export interface RfqRequest {
  id: string;
  userId: string;
  customerName?: string;
  title: string;
  categorySlug: string;
  categoryNameAr?: string;
  categoryNameEn?: string;
  governorateSlug: string;
  citySlug?: string | null;
  budgetMin: number;
  budgetMax: number;
  desiredDate?: string | null;
  scopeDetails: string;
  requirements: Record<string, string | number | boolean>;
  preferredContact: 'platform' | 'phone' | 'whatsapp';
  targetVendorId?: string | null;
  status: RfqStatus;
  acceptedQuoteId?: string | null;
  invitationsCount?: number;
  quotesCount?: number;
  createdAt: string;
  updatedAt: string;
  invitations?: RfqInvitation[];
  quotes?: RfqQuote[];
  messages?: RfqMessage[];
}

export interface MarketplaceAppointment {
  id: string;
  userId: string;
  customerName?: string;
  vendorId: string;
  vendorSlug?: string;
  vendorNameAr?: string;
  vendorNameEn?: string;
  vendorPhone?: string;
  vendorVerificationStatus?: VendorVerificationStatus;
  serviceId?: string | null;
  serviceTitleAr?: string | null;
  serviceTitleEn?: string | null;
  rfqId?: string | null;
  appointmentType: MarketplaceAppointmentType;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
  customerPhone: string;
  customerNotes?: string | null;
  vendorResponseNote?: string | null;
  status: MarketplaceAppointmentStatus;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorLeadActivity {
  id: string;
  leadId: string;
  actorUserId: string;
  actorName?: string;
  activityType: VendorLeadActivityType;
  note: string;
  createdAt: string;
}

export interface VendorLead {
  id: string;
  vendorId: string;
  customerUserId?: string | null;
  rfqId?: string | null;
  appointmentId?: string | null;
  leadSource: 'rfq' | 'appointment' | 'direct_portal' | 'manual';
  customerName: string;
  customerPhone?: string | null;
  title: string;
  stage: VendorLeadStage;
  estimatedValueEgp: number;
  nextFollowUpDate?: string | null;
  lossReason?: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: VendorLeadActivity[];
}

export interface VendorCrmOverviewPayload {
  vendor: VendorListing;
  leads: VendorLead[];
  rfqs: RfqRequest[];
  appointments: MarketplaceAppointment[];
  stageCounts: Record<VendorLeadStage, number>;
  pipelineValueEgp: number;
  wonValueEgp: number;
}

// ==============================================================================
// STAGE 9: MY WEDDING STORY, COMMUNITY Q&A, EXPERTS & ADMIN OS ANALYTICS
// ==============================================================================

export type StoryModerationStatus = 'pending' | 'approved' | 'rejected';

export type CommunityCategorySlug =
  | 'finishing'
  | 'groom'
  | 'bride'
  | 'wedding'
  | 'budget'
  | 'early_start'
  | 'married_life';

export type CommunityModerationStatus = 'approved' | 'flagged' | 'hidden';

export type CommunityReportReason =
  | 'spam'
  | 'misleading_price'
  | 'harassment'
  | 'off_topic'
  | 'self_promo';

export type CommunityReportStatus = 'open' | 'resolved_hidden' | 'dismissed';

export type ExpertSpecialtySlug =
  | 'finishing_engineering'
  | 'financial_planning'
  | 'bridal_trousseau'
  | 'wedding_direction'
  | 'married_life_counseling';

export type ExpertVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface RealWeddingCostLine {
  categoryAr: string;
  categoryEn: string;
  amountEgp: number;
}

export interface RealWeddingStory {
  id: string;
  userId?: string | null;
  authorName?: string | null;
  coupleTitleAr: string;
  coupleTitleEn: string;
  governorateSlug: string;
  cityAr: string;
  cityEn: string;
  weddingYear: number;
  guestCount: number;
  totalActualBudgetEgp: number;
  finishingCostEgp: number;
  groomTrousseauEgp: number;
  brideTrousseauEgp: number;
  weddingCostEgp: number;
  preparationMonths: number;
  summaryAr: string;
  summaryEn: string;
  lessonsLearnedAr: string;
  lessonsLearnedEn: string;
  costBreakdown: RealWeddingCostLine[];
  photos: string[];
  moderationStatus: StoryModerationStatus;
  moderationNotes?: string | null;
  moderatedByUserId?: string | null;
  moderatedAt?: string | null;
  isFeatured: boolean;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityAnswer {
  id: string;
  questionId: string;
  userId: string;
  authorName: string;
  authorRole?: UserRole;
  authorExpertTitleAr?: string | null;
  authorExpertTitleEn?: string | null;
  bodyAr: string;
  bodyEn: string;
  isExpertAnswer: boolean;
  isHelpfulMarked: boolean;
  upvotesCount: number;
  moderationStatus: CommunityModerationStatus;
  viewerUpvoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQuestion {
  id: string;
  userId: string;
  authorName: string;
  categorySlug: CommunityCategorySlug;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  tags: string[];
  moderationStatus: CommunityModerationStatus;
  upvotesCount: number;
  answersCount: number;
  isResolved: boolean;
  isDemoData: boolean;
  viewerUpvoted?: boolean;
  answers?: CommunityAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityReport {
  id: string;
  reporterUserId: string;
  reporterName?: string;
  targetType: 'question' | 'answer' | 'story' | 'vendor_review';
  targetId: string;
  targetPreview?: string;
  reason: CommunityReportReason;
  details?: string | null;
  status: CommunityReportStatus;
  reviewedByUserId?: string | null;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface ExpertProfile {
  id: string;
  userId: string;
  slug: string;
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
  avatarUrl: string;
  verificationStatus: ExpertVerificationStatus;
  verificationDocs: string[];
  verificationNotes?: string | null;
  verifiedByUserId?: string | null;
  verifiedAt?: string | null;
  answersCount: number;
  helpfulCount: number;
  isFeatured: boolean;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminModerationOverview {
  stories: RealWeddingStory[];
  reports: CommunityReport[];
  flaggedQuestions: CommunityQuestion[];
  experts: ExpertProfile[];
}

export interface AdminAnalyticsPayload {
  generatedAt: string;
  privacyNotice: string;
  usersSummary: {
    totalUsers: number;
    activeCustomers: number;
    vendorPartners: number;
    verifiedExpertsCount: number;
    stageDistribution: { stage: LifecycleStage; count: number }[];
  };
  marketplaceFunnel: {
    totalVendors: number;
    verifiedVendors: number;
    trustedVendors: number;
    totalRfqs: number;
    openRfqs: number;
    quotedRfqs: number;
    acceptedRfqs: number;
    rfqAcceptanceRatePct: number;
    totalInvitations: number;
    respondedInvitations: number;
    vendorResponseRatePct: number;
    totalAppointments: number;
    confirmedOrCompletedAppointments: number;
  };
  communitySummary: {
    approvedStoriesCount: number;
    pendingStoriesCount: number;
    questionsCount: number;
    answersCount: number;
    openReportsCount: number;
    pendingExpertsCount: number;
  };
  contentTopReads: {
    id: string;
    slug: string;
    titleAr: string;
    titleEn: string;
    domain: Article['domain'];
    viewCount: number;
  }[];
}






// =========================================================================
// STAGE 10: GROUNDED AI ASSISTANT, SMART ROOM DESIGNER & WEDDING DAY OPS
// =========================================================================

export type AiCitationKind = 'product' | 'vendor' | 'material' | 'article' | 'calculator' | 'story' | 'user_budget';

export interface AiCitation {
  kind: AiCitationKind;
  id: string;
  labelAr: string;
  labelEn: string;
  route: string;
  priceEgp?: number | null;
  metaText?: string | null;
}

export interface AiCalculationSnippet {
  calculatorSlug: string;
  nameAr: string;
  nameEn: string;
  primaryLabelAr: string;
  primaryLabelEn: string;
  primaryValue: number;
  unit: string;
  assumptionsAr: string[];
  assumptionsEn: string[];
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  contentAr: string;
  contentEn: string;
  citations: AiCitation[];
  calculations: AiCalculationSnippet[];
  createdAt: string;
}

export interface AiAssistantReplyPayload {
  conversationId: string;
  intent: string;
  providerMode: 'deterministic_db_rag' | 'external_llm_rag';
  groundedFactsCount: number;
  usedPersonalContext: boolean;
  disclaimerAr: string;
  disclaimerEn: string;
  userMessage: AiChatMessage;
  assistantMessage: AiChatMessage;
}

export interface AiConversationSummary {
  id: string;
  sessionTitle: string;
  lastIntent: string;
  messages: AiChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type RoomType =
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'dining'
  | 'reception'
  | 'kids';

export type RoomThemeSlug =
  | 'warm_beige'
  | 'modern_cairo'
  | 'classic_ivory'
  | 'minimalist_nordic'
  | 'romantic_wine';

export type MoodboardItemType = 'product' | 'material' | 'custom_furniture';

export interface MoodboardItem {
  id: string;
  moodboardId: string;
  userId: string;
  itemType: MoodboardItemType;
  productId?: string | null;
  materialSlug?: string | null;
  labelAr: string;
  labelEn: string;
  widthCm: number;
  depthCm: number;
  posXPct: number;
  posYPct: number;
  estimatedPriceEgp: number;
  colorHex: string;
  notes?: string | null;
  createdAt: string;
}

export interface RoomMoodboard {
  id: string;
  userId: string;
  titleAr: string;
  titleEn: string;
  roomType: RoomType;
  lengthM: number;
  widthM: number;
  heightM: number;
  themeSlug: RoomThemeSlug;
  paletteHex: string[];
  notes?: string | null;
  isSharedWithPartner: boolean;
  items: MoodboardItem[];
  totalEstimatedCostEgp: number;
  floorAreaSqm: number;
  occupiedAreaPercent: number;
  createdAt: string;
  updatedAt: string;
}

export type GuestSide = 'groom' | 'bride' | 'shared';
export type GuestGroup = 'family' | 'friends' | 'colleagues' | 'vip';
export type RsvpStatus = 'pending' | 'confirmed' | 'declined';
export type TableZone = 'vip_front' | 'family_center' | 'friends' | 'outdoor';
export type TimelineEventStatus = 'planned' | 'ready' | 'completed';
export type GiftPriority = 'essential' | 'nice_to_have' | 'dream';
export type GiftReservationStatus = 'available' | 'reserved' | 'received';

export interface SeatingTable {
  id: string;
  userId: string;
  tableName: string;
  zone: TableZone;
  capacity: number;
  notes?: string | null;
  sortOrder: number;
  assignedHeadcount: number;
  assignedGuestsCount: number;
  isFull: boolean;
  createdAt: string;
}

export interface WeddingGuest {
  id: string;
  userId: string;
  fullName: string;
  phone?: string | null;
  side: GuestSide;
  guestGroup: GuestGroup;
  invitedCount: number;
  plusOneAllowed: boolean;
  rsvpCode: string;
  rsvpStatus: RsvpStatus;
  attendingCount: number;
  mealPreference: string;
  dietaryNotes?: string | null;
  tableId?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeddingTimelineEvent {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  titleAr: string;
  titleEn: string;
  assignee: string;
  locationNote?: string | null;
  status: TimelineEventStatus;
  sortOrder: number;
  createdAt: string;
}

export interface GiftRegistryItem {
  id: string;
  userId: string;
  productId?: string | null;
  titleAr: string;
  titleEn: string;
  categoryLabel: string;
  targetPriceEgp: number;
  priority: GiftPriority;
  reservationStatus: GiftReservationStatus;
  reservedByName?: string | null;
  reservedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface WeddingDayOverviewPayload {
  guests: WeddingGuest[];
  tables: SeatingTable[];
  timelineEvents: WeddingTimelineEvent[];
  giftRegistry: GiftRegistryItem[];
  stats: {
    totalInvitedParties: number;
    totalInvitedSeats: number;
    confirmedParties: number;
    confirmedHeadcount: number;
    pendingParties: number;
    declinedParties: number;
    totalTableSeats: number;
    seatedHeadcount: number;
    timelineTotal: number;
    timelineReadyOrDone: number;
    registryTotal: number;
    registryReservedOrReceived: number;
  };
}

export interface PublicRsvpPayload {
  guest: {
    id: string;
    fullName: string;
    side: GuestSide;
    guestGroup: GuestGroup;
    invitedCount: number;
    plusOneAllowed: boolean;
    maxAllowedHeadcount: number;
    rsvpCode: string;
    rsvpStatus: RsvpStatus;
    attendingCount: number;
    mealPreference: string;
    dietaryNotes?: string | null;
    respondedAt?: string | null;
  };
  hostCoupleName: string;
  expectedWeddingDate?: string | null;
  giftRegistry: {
    id: string;
    productId?: string | null;
    titleAr: string;
    titleEn: string;
    categoryLabel: string;
    targetPriceEgp: number;
    priority: GiftPriority;
    reservationStatus: GiftReservationStatus;
  }[];
}

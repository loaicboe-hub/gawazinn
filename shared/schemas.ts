import { z } from 'zod';

const phoneRegex = /^(\+?20)?0?1[0125][0-9]{8}$/;

export function normalizeEgyptianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('201') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  return digits;
}

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z
    .string()
    .trim()
    .transform(normalizeEgyptianPhone)
    .refine((v) => phoneRegex.test(v), 'Invalid Egyptian mobile number (01XXXXXXXXX)'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  city: z.string().trim().max(120).optional(),
  governorateSlug: z.string().trim().max(64).optional(),
  language: z.enum(['ar', 'en']).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or phone is required').max(160),
  password: z.string().min(4, 'Password is required').max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  city: z.string().trim().max(120).optional(),
  governorateSlug: z.string().trim().max(64).optional(),
  language: z.enum(['ar', 'en']).optional(),
  currentStage: z
    .enum([
      'thinking',
      'early_saving',
      'post_engagement',
      'apartment_search',
      'finishing_apartment',
      'furnishing_groom',
      'preparing_bride',
      'planning_wedding',
      'wedding_soon',
      'newlywed',
      'maintaining_home',
    ])
    .optional(),
});

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  paymentMethod: z.enum(['cash_on_delivery', 'card', 'installments_request']),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1, 'Cart cannot be empty'),
});

export const createFinishingInquirySchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  governorate: z.string().trim().min(2).max(100),
  areaSqm: z.number().min(25).max(2000),
  roomsCount: z.number().int().min(1).max(20),
  bathroomsCount: z.number().int().min(1).max(10),
  finishingTier: z.enum(['economic', 'medium', 'luxury', 'ultra_luxury', 'custom']),
  budgetEGP: z.number().min(0).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const createWeddingBookingSchema = z.object({
  serviceId: z.string().min(1),
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  weddingDate: z.string().trim().min(8).max(30),
  guestCount: z.number().int().min(10).max(5000).optional(),
  governorate: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(2000).optional(),
});

export const createFinancingSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  nationalId: z
    .string()
    .trim()
    .regex(/^[0-9]{14}$/, 'Egyptian National ID must be 14 digits'),
  monthlyIncome: z.number().min(1000).max(10000000),
  employer: z.string().trim().min(2).max(160),
  governorate: z.string().trim().min(2).max(100),
  requestedAmount: z.number().min(5000).max(5000000),
  tenureMonths: z.number().int().min(6).max(60),
  preferredProvider: z.string().trim().min(2).max(100),
  associatedSection: z.enum(['finishing', 'groom', 'bride', 'wedding', 'general']),
});

export const createSupportCaseSchema = z.object({
  applicantName: z.string().trim().min(2).max(120),
  nationalId: z
    .string()
    .trim()
    .regex(/^[0-9]{14}$/, 'Egyptian National ID must be 14 digits'),
  phone: z.string().trim().min(8).max(20),
  governorate: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(300),
  category: z.enum([
    'apartment_finishing',
    'appliances_furniture',
    'groom_bride_essentials',
    'wedding_hall',
  ]),
  caseDescription: z.string().trim().min(15).max(4000),
  urgencyLevel: z.enum(['normal', 'urgent', 'critical']),
  documentsSubmitted: z.array(z.string().min(1)).default([]),
});

export const createSponsorshipSchema = z.object({
  sponsorName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(150).optional(),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email(),
  contributionType: z.enum([
    'financial',
    'in_kind_goods',
    'finishing_materials',
    'full_wedding_sponsorship',
  ]),
  pledgeAmount: z.number().min(0).optional(),
  message: z.string().trim().max(2000).default(''),
});

export const productUpsertSchema = z.object({
  id: z.string().optional(),
  trousseauType: z.enum(['groom', 'bride', 'shared', 'finishing']),
  category: z.string().trim().min(1).max(64),
  categoryAr: z.string().trim().min(1).max(120),
  categoryEn: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().min(2).max(200),
  nameEn: z.string().trim().min(2).max(200),
  brand: z.string().trim().min(1).max(100),
  model: z.string().trim().max(100).optional(),
  price: z.number().min(1),
  originalPrice: z.number().min(1).optional(),
  sku: z.string().trim().min(2).max(64),
  stock: z.number().int().min(0).default(10),
  imageUrl: z.string().trim().min(1),
  descriptionAr: z.string().trim().min(2).max(2000),
  descriptionEn: z.string().trim().min(2).max(2000),
  specsAr: z.record(z.string(), z.string()).default({}),
  specsEn: z.record(z.string(), z.string()).default({}),
  dimensions: z.string().trim().max(120).optional(),
  capacity: z.string().trim().max(120).optional(),
  energyRating: z.string().trim().max(32).optional(),
  warrantyMonths: z.number().int().min(0).max(240).optional(),
  warrantyTermsAr: z.string().trim().max(400).optional(),
  warrantyTermsEn: z.string().trim().max(400).optional(),
  originCountryAr: z.string().trim().max(80).optional(),
  originCountryEn: z.string().trim().max(80).optional(),
  prosAr: z.array(z.string()).optional(),
  prosEn: z.array(z.string()).optional(),
  consAr: z.array(z.string()).optional(),
  consEn: z.array(z.string()).optional(),
  buyerWarningsAr: z.array(z.string()).optional(),
  buyerWarningsEn: z.array(z.string()).optional(),
  recommendedForAr: z.string().trim().max(300).optional(),
  recommendedForEn: z.string().trim().max(300).optional(),
  isFeatured: z.boolean().optional(),
  isReadyPackageItem: z.boolean().optional(),
});

export const weddingServiceUpsertSchema = z.object({
  id: z.string().optional(),
  category: z.enum([
    'venue',
    'dress',
    'car',
    'photography',
    'beauty',
    'decor',
    'entertainment',
    'catering',
    'package',
  ]),
  nameAr: z.string().trim().min(2).max(200),
  nameEn: z.string().trim().min(2).max(200),
  governorateSlug: z.string().trim().max(64).optional(),
  locationAr: z.string().trim().min(2).max(150),
  locationEn: z.string().trim().min(2).max(150),
  startingPrice: z.number().min(1),
  pricingType: z.enum(['fixed', 'per_person', 'per_hour', 'package']),
  imageUrl: z.string().trim().min(1),
  galleryUrls: z.array(z.string()).default([]),
  capacity: z.string().trim().max(100).optional(),
  descriptionAr: z.string().trim().min(2).max(2000),
  descriptionEn: z.string().trim().min(2).max(2000),
  featuresAr: z.array(z.string()).default([]),
  featuresEn: z.array(z.string()).default([]),
  badge: z.string().trim().max(64).optional(),
});

export const articleUpsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(2).max(140),
  categoryId: z.string().trim().min(1),
  domain: z.enum([
    'finishing',
    'groom',
    'bride',
    'wedding',
    'early_start',
    'married_life',
    'editorial',
  ]),
  contentType: z.enum([
    'article',
    'guide',
    'tutorial',
    'review',
    'comparison',
    'case_study',
    'video',
    'faq',
    'glossary',
    'local_guide',
  ]),
  titleAr: z.string().trim().min(3).max(200),
  titleEn: z.string().trim().min(3).max(200),
  excerptAr: z.string().trim().min(5).max(500),
  excerptEn: z.string().trim().min(5).max(500),
  bodyAr: z.string().trim().min(20),
  bodyEn: z.string().trim().min(20),
  featuredImage: z.string().trim().min(1),
  tags: z.array(z.string()).default([]),
  relatedCalculators: z.array(z.string()).default([]),
  status: z.enum(['draft', 'in_review', 'published', 'archived']).default('published'),
  readingMinutes: z.number().int().min(1).max(60).default(5),
  isFeatured: z.boolean().default(false),
});

export const userGroomPlanSchema = z.object({
  selectedTierKey: z.enum(['tier_100k', 'tier_200k', 'tier_300k', 'tier_500k', 'custom']),
  targetBudgetEgp: z.number().int().min(25000).max(3000000),
  slotSelections: z.record(z.string(), z.string()).default({}),
  excludedSlots: z.array(z.string()).default([]),
  customItems: z.array(z.string().trim().min(1).max(160)).max(40).default([]),
});

export const userBridePlanSchema = z.object({
  presetMode: z.enum(['compact', 'balanced', 'extended']),
  targetBudgetEgp: z.number().int().min(10000).max(2000000),
  checkedItemIds: z.array(z.string().min(1).max(100)).max(300).default([]),
  qtyOverrides: z.record(z.string(), z.number().int().min(1).max(100)).default({}),
  customItems: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        categoryId: z.string().min(1).max(64),
        labelAr: z.string().trim().min(1).max(160),
        labelEn: z.string().trim().min(1).max(160),
        qty: z.number().int().min(1).max(100),
        estimatedUnitPriceEgp: z.number().int().min(0).max(1000000),
        checked: z.boolean(),
      }),
    )
    .max(100)
    .default([]),
});

export const calculateRequestSchema = z.object({
  inputs: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).default({}),
  saveRun: z.boolean().default(true),
  savedTitle: z.string().trim().max(160).optional(),
});

export const updateBudgetPlanSchema = z.object({
  titleAr: z.string().trim().min(2).max(160).optional(),
  titleEn: z.string().trim().min(2).max(160).optional(),
  totalBudgetLimit: z.number().min(10000).max(50000000).optional(),
  groomContributionTarget: z.number().min(0).max(50000000).optional(),
  brideContributionTarget: z.number().min(0).max(50000000).optional(),
  familySupportTarget: z.number().min(0).max(50000000).optional(),
  emergencyReserveTarget: z.number().min(0).max(10000000).optional(),
});

export const upsertBudgetCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9_-]+$/),
  nameAr: z.string().trim().min(2).max(120),
  nameEn: z.string().trim().min(2).max(120),
  ownerSide: z.enum(['groom', 'bride', 'shared']).default('shared'),
  plannedAmount: z.number().min(0).max(50000000),
  limitAmount: z.number().min(0).max(50000000),
  sortOrder: z.number().int().min(0).max(100).optional(),
});

export const patchBudgetCategorySchema = z.object({
  nameAr: z.string().trim().min(2).max(120).optional(),
  nameEn: z.string().trim().min(2).max(120).optional(),
  ownerSide: z.enum(['groom', 'bride', 'shared']).optional(),
  plannedAmount: z.number().min(0).max(50000000).optional(),
  limitAmount: z.number().min(0).max(50000000).optional(),
});

export const createBudgetExpenseSchema = z.object({
  categoryId: z.string().min(1).max(64).optional(),
  categorySlug: z.string().min(1).max(64).optional(),
  title: z.string().trim().min(2).max(180),
  vendorOrPayee: z.string().trim().max(160).optional(),
  amount: z.number().min(1).max(50000000),
  paymentType: z.enum(['deposit', 'installment', 'full', 'emergency']).default('full'),
  status: z.enum(['planned', 'upcoming', 'paid']).default('paid'),
  paidBySide: z.enum(['groom', 'bride', 'shared']).default('shared'),
  dueDate: z.string().trim().max(32).nullable().optional(),
  paidAt: z.string().trim().max(32).nullable().optional(),
  sourceType: z
    .enum(['manual', 'calculator_run', 'order', 'finishing_inquiry', 'wedding_booking', 'rfq_quote'])
    .default('manual'),
  sourceId: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const patchBudgetExpenseSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  vendorOrPayee: z.string().trim().max(160).nullable().optional(),
  amount: z.number().min(1).max(50000000).optional(),
  paymentType: z.enum(['deposit', 'installment', 'full', 'emergency']).optional(),
  status: z.enum(['planned', 'upcoming', 'paid']).optional(),
  paidBySide: z.enum(['groom', 'bride', 'shared']).optional(),
  dueDate: z.string().trim().max(32).nullable().optional(),
  paidAt: z.string().trim().max(32).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const importCalculatorToBudgetSchema = z.object({
  calculatorSlug: z.string().trim().min(2).max(80),
  inputs: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).default({}),
  runId: z.string().trim().max(80).optional(),
  categorySlug: z.string().trim().max(64).optional(),
  title: z.string().trim().min(2).max(180).optional(),
  mode: z.enum(['set_planned', 'add_planned_expense', 'add_deposit']).default('add_planned_expense'),
  expenseAmount: z.number().min(1).max(50000000).optional(),
  paidBySide: z.enum(['groom', 'bride', 'shared']).default('shared'),
});

// Stage 4: Early Start & My Future Fund Validation Schemas
export const updateEarlyStartProfileSchema = z.object({
  timeframePreset: z.enum(['10y', '7y', '5y', '3y', '2y', '1y', '6m', 'custom']).optional(),
  timeframeMonths: z.number().int().min(3).max(120).optional(),
  expectedMarriageDate: z.string().trim().max(32).nullable().optional(),
  targetMarriageBudget: z.number().min(20000).max(50000000).optional(),
  initialCapital: z.number().min(0).max(20000000).optional(),
  monthlySavingsTarget: z.number().min(0).max(1000000).optional(),
  emergencyReserveTarget: z.number().min(0).max(10000000).optional(),
  reminderFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'off']).optional(),
  personalNotes: z.string().trim().max(2000).nullable().optional(),
});

export const createSavingsGoalSchema = z.object({
  goalType: z.enum([
    'marriage',
    'apartment_purchase',
    'finishing',
    'furniture',
    'appliances',
    'wedding',
    'emergency',
  ]),
  titleAr: z.string().trim().min(2).max(160),
  titleEn: z.string().trim().min(2).max(160),
  targetAmount: z.number().min(1000).max(50000000),
  currentAmount: z.number().min(0).max(50000000).default(0),
  monthlyContribution: z.number().min(0).max(1000000).default(0),
  targetDate: z.string().trim().max(32).nullable().optional(),
  priority: z.number().int().min(1).max(20).default(1),
});

export const patchSavingsGoalSchema = z.object({
  titleAr: z.string().trim().min(2).max(160).optional(),
  titleEn: z.string().trim().min(2).max(160).optional(),
  targetAmount: z.number().min(1000).max(50000000).optional(),
  monthlyContribution: z.number().min(0).max(1000000).optional(),
  targetDate: z.string().trim().max(32).nullable().optional(),
  priority: z.number().int().min(1).max(20).optional(),
});

export const createSavingsContributionSchema = z.object({
  amount: z.number().min(-5000000).max(20000000).refine((v) => v !== 0, 'Amount cannot be zero'),
  contributionType: z.enum(['deposit', 'adjustment']).default('deposit'),
  contributionDate: z.string().trim().max(32).optional(),
  note: z.string().trim().max(400).optional(),
});

export const createEarlyStartMilestoneSchema = z.object({
  track: z.enum(['financial', 'personal', 'education', 'housing']),
  titleAr: z.string().trim().min(3).max(200),
  titleEn: z.string().trim().min(3).max(200),
  targetMonthsOut: z.number().int().min(1).max(120).default(12),
});

export const patchEarlyStartMilestoneSchema = z.object({
  completed: z.boolean(),
});

// Stage 5: Lifecycle Onboarding, Engagement Planner, Journey Planner & Shared Workspace Schemas
export const lifecycleStageEnum = z.enum([
  'thinking',
  'early_saving',
  'post_engagement',
  'apartment_search',
  'finishing_apartment',
  'furnishing_groom',
  'preparing_bride',
  'planning_wedding',
  'wedding_soon',
  'newlywed',
  'maintaining_home',
]);

export const onboardingStageTransitionSchema = z.object({
  targetStage: lifecycleStageEnum,
  note: z.string().trim().max(400).optional(),
  city: z.string().trim().max(120).optional(),
  governorateSlug: z.string().trim().max(64).optional(),
  language: z.enum(['ar', 'en']).optional(),
});

export const updateEngagementPlanSchema = z.object({
  engagementDate: z.string().trim().max(32).nullable().optional(),
  targetBudget: z.number().min(5000).max(20000000).optional(),
  shabkaBudget: z.number().min(0).max(10000000).optional(),
  venueBudget: z.number().min(0).max(10000000).optional(),
  attireBudget: z.number().min(0).max(5000000).optional(),
  hospitalityBudget: z.number().min(0).max(5000000).optional(),
  venueName: z.string().trim().max(160).nullable().optional(),
  venueStatus: z.enum(['researching', 'shortlisted', 'booked', 'home_ceremony']).optional(),
  ringNotes: z.string().trim().max(1000).nullable().optional(),
  familyNotes: z.string().trim().max(2000).nullable().optional(),
});

export const createEngagementItemSchema = z.object({
  itemType: z.enum(['checklist', 'gift_ring', 'guest_group', 'budget_line']),
  titleAr: z.string().trim().min(2).max(180),
  titleEn: z.string().trim().min(2).max(180),
  ownerSide: z.enum(['groom', 'bride', 'shared']).default('shared'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  estimatedCost: z.number().min(0).max(10000000).default(0),
  actualCost: z.number().min(0).max(10000000).default(0),
  guestCount: z.number().int().min(0).max(2000).default(0),
  status: z.enum(['planned', 'in_progress', 'done']).default('planned'),
  notes: z.string().trim().max(600).optional(),
});

export const patchEngagementItemSchema = z.object({
  titleAr: z.string().trim().min(2).max(180).optional(),
  titleEn: z.string().trim().min(2).max(180).optional(),
  ownerSide: z.enum(['groom', 'bride', 'shared']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  estimatedCost: z.number().min(0).max(10000000).optional(),
  actualCost: z.number().min(0).max(10000000).optional(),
  guestCount: z.number().int().min(0).max(2000).optional(),
  status: z.enum(['planned', 'in_progress', 'done']).optional(),
  notes: z.string().trim().max(600).nullable().optional(),
});

export const journeyPhaseEnum = z.enum([
  'early_start',
  'engagement',
  '12m',
  '9m',
  '6m',
  '3m',
  '1m',
  'final_week',
  'wedding_day',
  'post_wedding',
]);

export const createJourneyTaskSchema = z.object({
  phase: journeyPhaseEnum,
  titleAr: z.string().trim().min(2).max(200),
  titleEn: z.string().trim().min(2).max(200),
  description: z.string().trim().max(1000).optional(),
  ownerSide: z.enum(['groom', 'bride', 'shared']).default('shared'),
  dueDate: z.string().trim().max(32).nullable().optional(),
  reminderDate: z.string().trim().max(32).nullable().optional(),
  dependsOnTaskId: z.string().trim().max(80).nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimatedCost: z.number().min(0).max(20000000).default(0),
  attachmentLabel: z.string().trim().max(160).optional(),
});

export const patchJourneyTaskSchema = z.object({
  phase: journeyPhaseEnum.optional(),
  titleAr: z.string().trim().min(2).max(200).optional(),
  titleEn: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  ownerSide: z.enum(['groom', 'bride', 'shared']).optional(),
  dueDate: z.string().trim().max(32).nullable().optional(),
  reminderDate: z.string().trim().max(32).nullable().optional(),
  dependsOnTaskId: z.string().trim().max(80).nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  estimatedCost: z.number().min(0).max(20000000).optional(),
  attachmentLabel: z.string().trim().max(160).nullable().optional(),
});

export const createTaskCommentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

export const workspacePermissionsSchema = z.object({
  budgetRead: z.boolean().default(true),
  budgetWrite: z.boolean().default(false),
  tasksRead: z.boolean().default(true),
  tasksWrite: z.boolean().default(true),
  shoppingRead: z.boolean().default(true),
  shoppingWrite: z.boolean().default(true),
  documentsRead: z.boolean().default(true),
  documentsWrite: z.boolean().default(false),
  approvePurchases: z.boolean().default(true),
});

export const inviteWorkspacePartnerSchema = z.object({
  inviteeIdentifier: z.string().trim().min(3).max(160),
  proposedRole: z.enum(['partner', 'planner_guest']).default('partner'),
  proposedSide: z.enum(['groom', 'bride', 'partner']).default('partner'),
  permissions: workspacePermissionsSchema.optional(),
});

export const updateWorkspaceMetaSchema = z.object({
  nameAr: z.string().trim().min(2).max(140).optional(),
  nameEn: z.string().trim().min(2).max(140).optional(),
  engagementDate: z.string().trim().max(32).nullable().optional(),
  weddingDate: z.string().trim().max(32).nullable().optional(),
});

export const createWorkspaceApprovalSchema = z.object({
  title: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(80),
  estimatedAmount: z.number().min(0).max(50000000),
});

export const decideWorkspaceApprovalSchema = z.object({
  status: z.enum(['approved', 'changes_requested', 'rejected']),
  reviewerNote: z.string().trim().max(600).optional(),
});

export const createUserDocumentSchema = z.object({
  docType: z.enum(['contract', 'floor_plan', 'warranty', 'receipt', 'quote', 'id_copy', 'other']),
  title: z.string().trim().min(2).max(160),
  fileName: z.string().trim().min(2).max(160),
  mimeType: z
    .enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'])
    .default('application/pdf'),
  sizeBytes: z.number().int().min(1).max(25000000).default(120000),
  referenceCode: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(800).optional(),
  isSharedWithPartner: z.boolean().default(false),
});

export const createUserWarrantySchema = z.object({
  itemName: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(80),
  providerName: z.string().trim().min(2).max(120),
  modelSerial: z.string().trim().max(100).optional(),
  startDate: z.string().trim().min(8).max(32),
  expiryDate: z.string().trim().min(8).max(32),
  notes: z.string().trim().max(500).optional(),
});

export const createUserAppointmentSchema = z.object({
  title: z.string().trim().min(2).max(160),
  appointmentType: z.enum([
    'finishing_visit',
    'hall_tour',
    'showroom',
    'gold_shopping',
    'photography_meeting',
    'other',
  ]),
  providerName: z.string().trim().min(2).max(140),
  locationText: z.string().trim().min(2).max(200),
  scheduledAt: z.string().trim().min(8).max(40),
  notes: z.string().trim().max(500).optional(),
});

export const patchUserAppointmentSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled']).optional(),
  scheduledAt: z.string().trim().min(8).max(40).optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

// Stage 6 Schemas: Product Comparisons, Multi-List Shopping Baskets & Price Alerts
export const compareProductsRequestSchema = z.object({
  ids: z.array(z.string().trim().min(1).max(80)).min(1).max(4),
});

export const createShoppingListSchema = z.object({
  titleAr: z.string().trim().min(2).max(160),
  titleEn: z.string().trim().min(2).max(160),
  listType: z
    .enum(['groom_appliances', 'bride_kitchen', 'finishing_hardware', 'home_furniture', 'general'])
    .default('general'),
  isSharedWithPartner: z.boolean().default(false),
  budgetTarget: z.number().min(0).max(50000000).default(0),
  notes: z.string().trim().max(600).optional(),
});

export const patchShoppingListSchema = z.object({
  titleAr: z.string().trim().min(2).max(160).optional(),
  titleEn: z.string().trim().min(2).max(160).optional(),
  listType: z
    .enum(['groom_appliances', 'bride_kitchen', 'finishing_hardware', 'home_furniture', 'general'])
    .optional(),
  isSharedWithPartner: z.boolean().optional(),
  budgetTarget: z.number().min(0).max(50000000).optional(),
  notes: z.string().trim().max(600).nullable().optional(),
});

export const createShoppingListItemSchema = z.object({
  productId: z.string().trim().max(80).nullable().optional(),
  customTitle: z.string().trim().min(2).max(200),
  categoryLabel: z.string().trim().min(1).max(80).default('general'),
  quantity: z.number().int().min(1).max(200).default(1),
  targetUnitPrice: z.number().min(0).max(50000000).default(0),
  preferredMerchant: z.string().trim().max(120).optional(),
  status: z.enum(['planned', 'shortlisted', 'ready_to_buy', 'purchased']).default('planned'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  notes: z.string().trim().max(600).optional(),
});

export const patchShoppingListItemSchema = z.object({
  quantity: z.number().int().min(1).max(200).optional(),
  targetUnitPrice: z.number().min(0).max(50000000).optional(),
  preferredMerchant: z.string().trim().max(120).nullable().optional(),
  status: z.enum(['planned', 'shortlisted', 'ready_to_buy', 'purchased']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  notes: z.string().trim().max(600).nullable().optional(),
});

export const createPriceAlertSchema = z.object({
  productId: z.string().trim().min(1).max(80),
  targetPrice: z.number().int().min(10).max(50000000),
});

export const patchPriceAlertSchema = z.object({
  targetPrice: z.number().int().min(10).max(50000000).optional(),
  status: z.enum(['active', 'triggered', 'paused']).optional(),
});

// Stage 7 Schemas: Vendor Marketplace, Subscriptions, Reviews & Verification
export const registerVendorSchema = z.object({
  businessNameAr: z.string().trim().min(2).max(160),
  businessNameEn: z.string().trim().min(2).max(160),
  primaryCategorySlug: z.string().trim().min(2).max(80),
  extraCategorySlugs: z.array(z.string().trim().min(2).max(80)).max(5).optional(),
  governorateSlug: z.string().trim().min(2).max(80),
  citySlug: z.string().trim().max(80).nullable().optional(),
  serviceAreas: z.array(z.string().trim().min(2).max(80)).max(12).optional(),
  addressAr: z.string().trim().min(4).max(240),
  addressEn: z.string().trim().min(4).max(240),
  phone: z.string().trim().min(8).max(24),
  whatsapp: z.string().trim().max(24).optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  websiteUrl: z.string().trim().max(240).optional(),
  bioAr: z.string().trim().min(12).max(1500),
  bioEn: z.string().trim().min(12).max(1500),
  coverImage: z.string().trim().min(10).max(500).optional(),
  portfolioImages: z.array(z.string().trim().min(10).max(500)).max(20).optional(),
  priceTier: z.enum(['economy', 'mid', 'luxury']).default('mid'),
  startingPriceEgp: z.number().int().min(0).max(50000000).default(5000),
  yearsExperience: z.number().int().min(1).max(80).default(3),
  verificationDocs: z.array(z.string().trim().min(2).max(120)).max(10).optional(),
});

export const updateVendorProfileSchema = registerVendorSchema.partial();

export const vendorServiceUpsertSchema = z.object({
  titleAr: z.string().trim().min(2).max(180),
  titleEn: z.string().trim().min(2).max(180),
  descriptionAr: z.string().trim().min(6).max(800),
  descriptionEn: z.string().trim().min(6).max(800),
  unitLabelAr: z.string().trim().min(1).max(60).default('مشروع / باقة'),
  unitLabelEn: z.string().trim().min(1).max(60).default('Package / Project'),
  startingPriceEgp: z.number().int().min(0).max(50000000).default(1000),
  turnaroundDays: z.string().trim().max(60).nullable().optional(),
  warrantyMonths: z.number().int().min(0).max(240).default(12),
  isActive: z.boolean().default(true),
});

export const vendorPromotionCreateSchema = z.object({
  titleAr: z.string().trim().min(3).max(160),
  titleEn: z.string().trim().min(3).max(160),
  descriptionAr: z.string().trim().min(6).max(500),
  descriptionEn: z.string().trim().min(6).max(500),
  discountPercent: z.number().int().min(1).max(90),
  promoCode: z.string().trim().max(32).optional(),
  validUntil: z.string().trim().min(8).max(32),
});

export const vendorReviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(120),
  comment: z.string().trim().min(6).max(1000),
});

export const switchVendorSubscriptionSchema = z.object({
  planCode: z.enum(['free', 'basic', 'professional', 'premium']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
});

export const adminVerifyVendorSchema = z.object({
  verificationStatus: z.enum(['registered', 'verified', 'trusted', 'rejected']),
  verificationDocs: z.array(z.string().trim().min(2).max(120)).max(12).optional(),
  verificationNotes: z.string().trim().max(600).nullable().optional(),
});

export const adminUpdateSubscriptionPlanSchema = z.object({
  monthlyPriceEgp: z.number().int().min(0).max(500000).optional(),
  annualPriceEgp: z.number().int().min(0).max(5000000).optional(),
  maxServices: z.number().int().min(1).max(500).optional(),
  maxPromotions: z.number().int().min(0).max(200).optional(),
  maxPortfolioItems: z.number().int().min(1).max(200).optional(),
  leadPriorityBoost: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

// Stage 8 Schemas: Multi-Vendor RFQ Engine, Slot Appointments & Vendor CRM
export const createRfqRequestSchema = z.object({
  title: z.string().trim().min(4).max(180),
  categorySlug: z.string().trim().min(2).max(80),
  governorateSlug: z.string().trim().min(2).max(80),
  citySlug: z.string().trim().max(80).nullable().optional(),
  budgetMin: z.number().int().min(0).max(100000000).default(0),
  budgetMax: z.number().int().min(0).max(100000000).default(0),
  desiredDate: z.string().trim().max(32).nullable().optional(),
  scopeDetails: z.string().trim().min(10).max(3000),
  requirements: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  preferredContact: z.enum(['platform', 'phone', 'whatsapp']).default('platform'),
  targetVendorId: z.string().trim().min(1).max(80).nullable().optional(),
});

export const submitRfqQuoteSchema = z.object({
  vendorId: z.string().trim().min(1).max(80).optional(),
  quotedAmountEgp: z.number().int().min(100).max(100000000),
  depositAmountEgp: z.number().int().min(0).max(100000000).default(0),
  estimatedDuration: z.string().trim().min(2).max(120),
  warrantyMonths: z.number().int().min(0).max(240).default(12),
  scopeSummary: z.string().trim().min(10).max(2000),
  termsNotes: z.string().trim().max(800).nullable().optional(),
  validUntil: z.string().trim().min(8).max(32),
});

export const decideRfqQuoteSchema = z.object({
  decision: z.enum(['accept', 'reject']),
  customerDecisionNote: z.string().trim().max(600).nullable().optional(),
  linkToBudget: z.boolean().default(true),
});

export const createRfqMessageSchema = z.object({
  body: z.string().trim().min(2).max(1500),
  vendorId: z.string().trim().min(1).max(80).optional(),
});

export const createMarketplaceAppointmentSchema = z.object({
  vendorId: z.string().trim().min(1).max(80),
  serviceId: z.string().trim().max(80).nullable().optional(),
  rfqId: z.string().trim().max(80).nullable().optional(),
  appointmentType: z
    .enum(['site_visit', 'showroom', 'hall_tour', 'video_consultation', 'contract_signing', 'measuring'])
    .default('showroom'),
  slotDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().min(15).max(240).default(45),
  customerPhone: z.string().trim().min(8).max(24),
  customerNotes: z.string().trim().max(800).nullable().optional(),
});

export const patchMarketplaceAppointmentSchema = z.object({
  status: z.enum(['requested', 'confirmed', 'rescheduled', 'cancelled', 'completed']).optional(),
  slotDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  slotTime: z.string().trim().regex(/^\d{2}:\d{2}$/).optional(),
  customerNotes: z.string().trim().max(800).nullable().optional(),
  vendorResponseNote: z.string().trim().max(800).nullable().optional(),
});

export const createVendorLeadSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().max(24).nullable().optional(),
  title: z.string().trim().min(3).max(180),
  stage: z
    .enum([
      'new_lead',
      'contacted',
      'quotation_sent',
      'negotiation',
      'accepted',
      'in_progress',
      'completed',
      'lost',
    ])
    .default('new_lead'),
  estimatedValueEgp: z.number().int().min(0).max(100000000).default(0),
  nextFollowUpDate: z.string().trim().max(32).nullable().optional(),
});

export const patchVendorLeadSchema = z.object({
  stage: z
    .enum([
      'new_lead',
      'contacted',
      'quotation_sent',
      'negotiation',
      'accepted',
      'in_progress',
      'completed',
      'lost',
    ])
    .optional(),
  estimatedValueEgp: z.number().int().min(0).max(100000000).optional(),
  nextFollowUpDate: z.string().trim().max(32).nullable().optional(),
  lossReason: z.string().trim().max(300).nullable().optional(),
});

export const createVendorLeadActivitySchema = z.object({
  activityType: z.enum(['note', 'call', 'quote_sent', 'appointment']).default('note'),
  note: z.string().trim().min(2).max(1000),
});

// ==============================================================================
// STAGE 9: REAL WEDDING STORIES, COMMUNITY Q&A, REPORTS, EXPERTS & MODERATION
// ==============================================================================

export const createWeddingStorySchema = z.object({
  coupleTitleAr: z.string().trim().min(4).max(160),
  coupleTitleEn: z.string().trim().max(160).optional(),
  governorateSlug: z.string().trim().min(2).max(60),
  cityAr: z.string().trim().min(2).max(100),
  cityEn: z.string().trim().max(100).optional(),
  weddingYear: z.number().int().min(2015).max(2030),
  guestCount: z.number().int().min(0).max(3000).default(150),
  finishingCostEgp: z.number().int().min(0).max(50000000).default(0),
  groomTrousseauEgp: z.number().int().min(0).max(50000000).default(0),
  brideTrousseauEgp: z.number().int().min(0).max(50000000).default(0),
  weddingCostEgp: z.number().int().min(0).max(50000000).default(0),
  preparationMonths: z.number().int().min(1).max(120).default(12),
  summaryAr: z.string().trim().min(20).max(2500),
  summaryEn: z.string().trim().max(2500).optional(),
  lessonsLearnedAr: z.string().trim().min(10).max(2000),
  lessonsLearnedEn: z.string().trim().max(2000).optional(),
  photos: z.array(z.string().trim().min(8).max(500)).max(6).default([]),
});

export const moderateStorySchema = z.object({
  moderationStatus: z.enum(['approved', 'rejected', 'pending']),
  moderationNotes: z.string().trim().max(500).nullable().optional(),
  isFeatured: z.boolean().optional(),
});

export const createCommunityQuestionSchema = z.object({
  categorySlug: z.enum([
    'finishing',
    'groom',
    'bride',
    'wedding',
    'budget',
    'early_start',
    'married_life',
  ]),
  titleAr: z.string().trim().min(6).max(200),
  titleEn: z.string().trim().max(200).optional(),
  bodyAr: z.string().trim().min(12).max(3000),
  bodyEn: z.string().trim().max(3000).optional(),
  tags: z.array(z.string().trim().min(2).max(40)).max(6).default([]),
});

export const createCommunityAnswerSchema = z.object({
  bodyAr: z.string().trim().min(8).max(3000),
  bodyEn: z.string().trim().max(3000).optional(),
});

export const communityVoteSchema = z.object({
  targetType: z.enum(['question', 'answer']),
  targetId: z.string().trim().min(2).max(120),
});

export const createCommunityReportSchema = z.object({
  targetType: z.enum(['question', 'answer', 'story', 'vendor_review']),
  targetId: z.string().trim().min(2).max(120),
  reason: z.enum(['spam', 'misleading_price', 'harassment', 'off_topic', 'self_promo']),
  details: z.string().trim().max(600).nullable().optional(),
});

export const resolveCommunityReportSchema = z.object({
  action: z.enum(['resolve_hide', 'dismiss']),
  resolutionNote: z.string().trim().max(500).nullable().optional(),
});

export const applyExpertProfileSchema = z.object({
  displayNameAr: z.string().trim().min(3).max(120),
  displayNameEn: z.string().trim().min(3).max(120),
  specialtySlug: z.enum([
    'finishing_engineering',
    'financial_planning',
    'bridal_trousseau',
    'wedding_direction',
    'married_life_counseling',
  ]),
  titleAr: z.string().trim().min(3).max(140),
  titleEn: z.string().trim().min(3).max(140),
  governorateSlug: z.string().trim().min(2).max(60),
  yearsExperience: z.number().int().min(1).max(60).default(5),
  credentialsAr: z.string().trim().min(6).max(300),
  credentialsEn: z.string().trim().min(6).max(300),
  bioAr: z.string().trim().min(15).max(1500),
  bioEn: z.string().trim().min(15).max(1500),
  verificationDocs: z.array(z.string().trim().min(3).max(200)).min(1).max(8),
});

export const adminVerifyExpertSchema = z.object({
  verificationStatus: z.enum(['verified', 'rejected', 'pending']),
  verificationNotes: z.string().trim().max(500).nullable().optional(),
  isFeatured: z.boolean().optional(),
});






import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type {
  Language,
  User,
  Product,
  CartItem,
  FinishingInquiry,
  WeddingBookingRequest,
  WeddingServiceItem,
  Order,
  FinancingApplication,
  SupportCase,
  SponsorshipInquiry,
  PlatformSettings,
  FinishingService,
  FinishingPackage,
  FinishingTier,
  Article,
  ContentCategory,
  LocationNode,
  AuditLogEntry,
  FinishingEncyclopediaCategory,
  FinishingMaterialItem,
  BeforeAfterProject,
  FinishingContractorListing,
  GroomSubcategoryGuide,
  GroomConfigurablePackage,
  BrideCategoryGuide,
  BrideChecklistTemplateItem,
  GlossaryTerm,
  FaqEntry,
  UserGroomPlanState,
  UserBridePlanState,
  CalculatorSummary,
  CalculatorOutput,
  CalculatorRunRecord,
  BudgetOverviewPayload,
  BudgetOwnerSide,
  BudgetPaymentType,
  BudgetExpenseStatus,
  EarlyStartAcademyLesson,
  EarlyStartMilestoneTrack,
  EarlyStartOverviewPayload,
  EarlyStartReminderFrequency,
  EarlyStartTimeframePreset,
  SavingsBadge,
  SavingsGoalType,
  CoupleWorkspacePayload,
  EngagementItemStatus,
  EngagementItemType,
  EngagementOverviewPayload,
  EngagementVenueStatus,
  JourneyOverviewPayload,
  JourneyPhaseKey,
  JourneyTaskPriority,
  JourneyTaskStatus,
  LifecycleStage,
  MyGawazInnHubPayload,
  UserAppointmentItem,
  UserAppointmentStatus,
  UserAppointmentType,
  UserDocumentItem,
  UserDocumentType,
  UserNotification,
  UserWarrantyItem,
  WorkspacePermissions,
  PriceAlert,
  PriceAlertStatus,
  ShoppingList,
  ShoppingListItemStatus,
  ShoppingListType,
  SubscriptionPlan,
  VendorCategory,
  VendorListing,
  VendorReview,
  VendorVerificationStatus,
  MarketplaceAppointment,
  MarketplaceAppointmentStatus,
  MarketplaceAppointmentType,
  RfqRequest,
  RealWeddingStory,
  StoryModerationStatus,
  CommunityQuestion,
  CommunityAnswer,
  CommunityCategorySlug,
  CommunityReport,
  CommunityReportReason,
  ExpertProfile,
  ExpertSpecialtySlug,
  ExpertVerificationStatus,
  AdminAnalyticsPayload,
  AdminModerationOverview,
  AiAssistantReplyPayload,
  AiConversationSummary,
  GiftPriority,
  GuestGroup,
  GuestSide,
  MoodboardItemType,
  RoomMoodboard,
  RoomThemeSlug,
  RoomType,
  RsvpStatus,
  TableZone,
  TimelineEventStatus,
  WeddingDayOverviewPayload,
} from '../types';
import { translations } from '../i18n/translations';
import {
  initialSettings,
  initialFinishingPackages,
  initialFinishingServices,
  initialGroomProducts,
  initialBrideProducts,
  initialWeddingServices,
  sampleFinishingInquiries,
  sampleWeddingBookings,
  sampleOrders,
  sampleFinancingApplications,
  sampleSupportCases,
} from '../data/initialData';
import {
  PRODUCT_ENCYCLOPEDIA_EXTENSIONS,
  STAGE6_ADDITIONAL_PRODUCTS,
} from '../../shared/productEncyclopediaData';
import { SEED_ARTICLES, SEED_CATEGORIES, SEED_LOCATIONS } from '../../shared/cmsSeedData';
import {
  EXTRA_EGYPTIAN_LOCATIONS,
  STAGE7_VENDORS_SEED,
  SUBSCRIPTION_PLANS_SEED,
  VENDOR_CATEGORIES_SEED,
} from '../../shared/vendorMarketplaceData';
import {
  FINISHING_ENCYCLOPEDIA_CATEGORIES,
  FINISHING_MATERIALS_DB,
  STAGE2_BEFORE_AFTER_PROJECTS,
  FINISHING_CONTRACTORS_DIRECTORY,
} from '../../shared/finishingEncyclopediaData';
import {
  GROOM_SUBCATEGORIES,
  GROOM_CONFIGURABLE_PACKAGES,
  BRIDE_ENCYCLOPEDIA_CATEGORIES,
  BRIDE_CHECKLIST_TEMPLATES,
} from '../../shared/trousseauEncyclopediaData';
import { STAGE2_GLOSSARY_TERMS, STAGE2_FAQ_ITEMS } from '../../shared/knowledgeGlossaryData';
import { listCalculatorSummaries, runCalculator } from '../../shared/calculators';
import { EARLY_START_ACADEMY_LESSONS } from '../../shared/earlyStartData';
import { ADMIN_PANEL_ROLES, FULL_ADMIN_ROLES, MODERATION_ROLES, hasAnyRole } from '../../shared/rbac';
import { estimateFinishingRange, maskNationalId } from '../../shared/catalogMeta';
import { apiRequest, ApiClientError } from '../services/api';

export type SectionKey =
  | 'home'
  | 'onboarding'
  | 'earlyStart'
  | 'engagement'
  | 'journey'
  | 'finishing'
  | 'groom'
  | 'bride'
  | 'wedding'
  | 'installments'
  | 'socialSupport'
  | 'encyclopedia'
  | 'calculators'
  | 'budget'
  | 'discover'
  | 'products'
  | 'compare'
  | 'shoppingLists'
  | 'vendors'
  | 'stories'
  | 'community'
  | 'experts'
  | 'assistant'
  | 'roomDesigner'
  | 'weddingDay'
  | 'rfq'
  | 'vendorPortal'
  | 'myHub'
  | 'customerPortal'
  | 'admin';

export const SECTION_ROUTES: Record<SectionKey, string> = {
  home: '/',
  onboarding: '/onboarding',
  earlyStart: '/early-start',
  engagement: '/engagement',
  journey: '/journey',
  finishing: '/finishing',
  groom: '/groom',
  bride: '/bride',
  wedding: '/wedding',
  installments: '/installments',
  socialSupport: '/social-support',
  encyclopedia: '/encyclopedia',
  calculators: '/calculators',
  budget: '/my/budget',
  discover: '/discover',
  products: '/products',
  compare: '/products/compare',
  shoppingLists: '/my/shopping-lists',
  vendors: '/vendors',
  stories: '/real-weddings',
  community: '/community',
  experts: '/experts',
  assistant: '/assistant',
  roomDesigner: '/room-designer',
  weddingDay: '/wedding-day',
  rfq: '/rfq',
  vendorPortal: '/vendor',
  myHub: '/my/workspace',
  customerPortal: '/portal',
  admin: '/admin',
};

export interface FinishingPrefill {
  areaSqm: number;
  roomsCount: number;
  bathroomsCount: number;
  finishingTier: FinishingTier;
  governorate?: string;
  notes?: string;
}

interface EncyclopediaBundlePayload {
  finishingCategories: FinishingEncyclopediaCategory[];
  finishingMaterials: FinishingMaterialItem[];
  beforeAfterProjects: BeforeAfterProject[];
  contractors: FinishingContractorListing[];
  groomSubcategories: GroomSubcategoryGuide[];
  groomConfigurablePackages: GroomConfigurablePackage[];
  brideCategories: BrideCategoryGuide[];
  brideChecklistTemplates: BrideChecklistTemplateItem[];
  glossaryTerms: GlossaryTerm[];
  faqItems: FaqEntry[];
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeCustomers: number;
  totalOrders: number;
  totalFinishing: number;
  totalBookings: number;
  totalFinancing: number;
  totalSupport: number;
  totalArticles: number;
}

interface BootstrapPayload {
  user: User | null;
  products: Product[];
  finishingPackages: FinishingPackage[];
  finishingServices: FinishingService[];
  weddingServices: WeddingServiceItem[];
  categories: ContentCategory[];
  locations: LocationNode[];
  articles: Article[];
  settings: PlatformSettings | null;
  vendorCategories?: VendorCategory[];
  vendors?: VendorListing[];
  subscriptionPlans?: SubscriptionPlan[];
}

interface AdminOverviewPayload {
  counts: AdminOverviewStats;
  users: User[];
  orders: Order[];
  finishingInquiries: FinishingInquiry[];
  weddingBookings: WeddingBookingRequest[];
  financingApplications: FinancingApplication[];
  supportCases: SupportCase[];
  sponsorships: SponsorshipInquiry[];
  articles: Article[];
  auditLogs: AuditLogEntry[];
}

interface AppContextType {
  // Backend Connectivity
  apiConnected: boolean;
  isHydrating: boolean;

  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ar'];
  dir: 'rtl' | 'ltr';

  // Navigation (Router-backed)
  activeSection: SectionKey;
  setActiveSection: (sec: SectionKey) => void;

  // Authentication
  currentUser: User | null;
  loginWithCredentials: (identifier: string, password: string) => Promise<User>;
  registerAccount: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    city?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isStaff: boolean;

  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;

  // Persisted Bridal Checklist & Groom Budget Builder
  brideChecklist: string[];
  toggleBrideChecklistItem: (itemId: string) => void;
  groomBudgetTarget: number;
  setGroomBudgetTarget: (target: number) => void;
  groomBudgetItems: string[];
  toggleGroomBudgetItem: (productId: string) => void;

  // Stage 2 Interactive Plans (Guest localStorage + Signed-in SQLite)
  userGroomPlan: UserGroomPlanState;
  saveUserGroomPlan: (
    updater: UserGroomPlanState | ((prev: UserGroomPlanState) => UserGroomPlanState),
  ) => void;
  userBridePlan: UserBridePlanState;
  saveUserBridePlan: (
    updater: UserBridePlanState | ((prev: UserBridePlanState) => UserBridePlanState),
  ) => void;

  // Stage 2 Encyclopedia & Knowledge Hub Collections
  finishingCategories: FinishingEncyclopediaCategory[];
  finishingMaterials: FinishingMaterialItem[];
  beforeAfterProjects: BeforeAfterProject[];
  contractors: FinishingContractorListing[];
  groomSubcategories: GroomSubcategoryGuide[];
  groomConfigurablePackages: GroomConfigurablePackage[];
  brideCategories: BrideCategoryGuide[];
  brideChecklistTemplates: BrideChecklistTemplateItem[];
  glossaryTerms: GlossaryTerm[];
  faqItems: FaqEntry[];

  // Customer & Admin Data
  finishingInquiries: FinishingInquiry[];
  addFinishingInquiry: (inquiry: Omit<FinishingInquiry, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateFinishingStatus: (id: string, status: FinishingInquiry['status']) => Promise<void>;

  weddingBookings: WeddingBookingRequest[];
  addWeddingBooking: (booking: Omit<WeddingBookingRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateWeddingBookingStatus: (id: string, status: WeddingBookingRequest['status']) => Promise<void>;

  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: Order['paymentMethod'];
  }) => Promise<string>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;

  financingApplications: FinancingApplication[];
  addFinancingApplication: (application: Omit<FinancingApplication, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateFinancingStatus: (id: string, status: FinancingApplication['status']) => Promise<void>;

  supportCases: SupportCase[];
  addSupportCase: (caseData: Omit<SupportCase, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateSupportCaseStatus: (id: string, status: SupportCase['status']) => Promise<void>;

  sponsorshipInquiries: SponsorshipInquiry[];
  addSponsorshipInquiry: (inquiry: Omit<SponsorshipInquiry, 'id' | 'createdAt' | 'status'>) => Promise<string>;

  // Products & Services
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  weddingServices: WeddingServiceItem[];
  addWeddingService: (service: WeddingServiceItem) => Promise<void>;
  updateWeddingService: (service: WeddingServiceItem) => Promise<void>;
  deleteWeddingService: (id: string) => Promise<void>;

  // CMS & Locations (Stage 1 Foundation)
  categories: ContentCategory[];
  articles: Article[];
  locations: LocationNode[];
  addArticle: (article: Omit<Article, 'id' | 'viewCount' | 'publishedAt' | 'updatedAt' | 'authorName'>) => Promise<void>;

  // Admin Overview & Audit
  adminStats: AdminOverviewStats | null;
  adminUsers: User[];
  auditLogs: AuditLogEntry[];
  refreshAdminData: () => Promise<void>;

  finishingPackages: FinishingPackage[];
  finishingServices: FinishingService[];
  settings: PlatformSettings;
  updateSettings: (settings: PlatformSettings) => Promise<void>;

  // Stage 3: Unified 20 Smart Calculators & Wedding Budget Manager
  calculatorSummaries: CalculatorSummary[];
  calculatorRuns: CalculatorRunRecord[];
  budgetOverview: BudgetOverviewPayload | null;
  runAndSaveCalculator: (
    slug: string,
    inputs: Record<string, number | string | boolean>,
    savedTitle?: string,
  ) => Promise<{ runId: string | null; output: CalculatorOutput }>;
  deleteCalculatorRun: (runId: string) => Promise<void>;
  refreshBudgetOverview: () => Promise<void>;
  updateBudgetPlan: (patch: {
    titleAr?: string;
    titleEn?: string;
    totalBudgetLimit?: number;
    groomContributionTarget?: number;
    brideContributionTarget?: number;
    familySupportTarget?: number;
    emergencyReserveTarget?: number;
  }) => Promise<void>;
  upsertBudgetCategory: (input: {
    slug: string;
    nameAr: string;
    nameEn: string;
    ownerSide: BudgetOwnerSide;
    plannedAmount: number;
    limitAmount: number;
  }) => Promise<void>;
  updateBudgetCategory: (
    categoryId: string,
    patch: {
      nameAr?: string;
      nameEn?: string;
      ownerSide?: BudgetOwnerSide;
      plannedAmount?: number;
      limitAmount?: number;
    },
  ) => Promise<void>;
  createBudgetExpense: (input: {
    categoryId?: string;
    categorySlug?: string;
    title: string;
    vendorOrPayee?: string;
    amount: number;
    paymentType: BudgetPaymentType;
    status: BudgetExpenseStatus;
    paidBySide: BudgetOwnerSide;
    dueDate?: string | null;
    notes?: string;
  }) => Promise<void>;
  updateBudgetExpense: (
    expenseId: string,
    patch: {
      title?: string;
      amount?: number;
      status?: BudgetExpenseStatus;
      paymentType?: BudgetPaymentType;
      paidBySide?: BudgetOwnerSide;
      dueDate?: string | null;
      notes?: string | null;
    },
  ) => Promise<void>;
  deleteBudgetExpense: (expenseId: string) => Promise<void>;
  importCalculatorToBudget: (input: {
    calculatorSlug: string;
    inputs: Record<string, number | string | boolean>;
    runId?: string;
    categorySlug?: string;
    title?: string;
    mode: 'set_planned' | 'add_planned_expense' | 'add_deposit';
    expenseAmount?: number;
    paidBySide?: BudgetOwnerSide;
  }) => Promise<{ runId: string; output: CalculatorOutput }>;
  syncBudgetTransactions: () => Promise<number>;

  // Stage 4: Early Start & My Future Fund
  academyLessons: EarlyStartAcademyLesson[];
  earlyStartOverview: EarlyStartOverviewPayload | null;
  refreshEarlyStartOverview: () => Promise<void>;
  updateEarlyStartProfile: (patch: {
    timeframePreset?: EarlyStartTimeframePreset;
    timeframeMonths?: number;
    expectedMarriageDate?: string | null;
    targetMarriageBudget?: number;
    initialCapital?: number;
    monthlySavingsTarget?: number;
    emergencyReserveTarget?: number;
    reminderFrequency?: EarlyStartReminderFrequency;
    personalNotes?: string | null;
  }) => Promise<void>;
  createSavingsGoal: (input: {
    goalType: SavingsGoalType;
    titleAr: string;
    titleEn: string;
    targetAmount: number;
    currentAmount?: number;
    monthlyContribution?: number;
    targetDate?: string | null;
    priority?: number;
  }) => Promise<SavingsBadge[]>;
  patchSavingsGoal: (
    goalId: string,
    patch: {
      titleAr?: string;
      titleEn?: string;
      targetAmount?: number;
      monthlyContribution?: number;
      targetDate?: string | null;
      priority?: number;
    },
  ) => Promise<SavingsBadge[]>;
  deleteSavingsGoal: (goalId: string) => Promise<void>;
  recordSavingsContribution: (
    goalId: string,
    input: {
      amount: number;
      contributionType?: 'deposit' | 'adjustment';
      contributionDate?: string;
      note?: string;
    },
  ) => Promise<SavingsBadge[]>;
  addEarlyStartMilestone: (input: {
    track: EarlyStartMilestoneTrack;
    titleAr: string;
    titleEn: string;
    targetMonthsOut?: number;
  }) => Promise<void>;
  toggleEarlyStartMilestone: (milestoneId: string, completed: boolean) => Promise<void>;
  deleteEarlyStartMilestone: (milestoneId: string) => Promise<void>;
  toggleAcademyLessonComplete: (slug: string, completed?: boolean) => Promise<SavingsBadge[]>;

  // Stage 5: Lifecycle Onboarding, Engagement, Journey Planner & Shared Couple Workspace
  myHubPayload: MyGawazInnHubPayload | null;
  refreshMyHub: () => Promise<void>;
  transitionLifecycleStage: (
    targetStage: LifecycleStage,
    note?: string,
  ) => Promise<void>;
  updateEngagementPlan: (patch: {
    engagementDate?: string | null;
    targetBudget?: number;
    shabkaBudget?: number;
    venueBudget?: number;
    attireBudget?: number;
    hospitalityBudget?: number;
    venueName?: string | null;
    venueStatus?: EngagementVenueStatus;
    ringNotes?: string | null;
    familyNotes?: string | null;
  }) => Promise<void>;
  createEngagementItem: (input: {
    itemType: EngagementItemType;
    titleAr: string;
    titleEn: string;
    ownerSide?: 'groom' | 'bride' | 'shared';
    priority?: 'high' | 'medium' | 'low';
    estimatedCost?: number;
    actualCost?: number;
    guestCount?: number;
    status?: EngagementItemStatus;
    notes?: string;
  }) => Promise<void>;
  patchEngagementItem: (
    itemId: string,
    patch: {
      titleAr?: string;
      titleEn?: string;
      ownerSide?: 'groom' | 'bride' | 'shared';
      priority?: 'high' | 'medium' | 'low';
      estimatedCost?: number;
      actualCost?: number;
      guestCount?: number;
      status?: EngagementItemStatus;
      notes?: string | null;
    },
  ) => Promise<void>;
  deleteEngagementItem: (itemId: string) => Promise<void>;
  createJourneyTask: (input: {
    phase: JourneyPhaseKey;
    titleAr: string;
    titleEn: string;
    description?: string;
    ownerSide?: 'groom' | 'bride' | 'shared';
    dueDate?: string | null;
    reminderDate?: string | null;
    dependsOnTaskId?: string | null;
    priority?: JourneyTaskPriority;
    estimatedCost?: number;
    attachmentLabel?: string;
  }) => Promise<void>;
  patchJourneyTask: (
    taskId: string,
    patch: {
      phase?: JourneyPhaseKey;
      titleAr?: string;
      titleEn?: string;
      description?: string | null;
      ownerSide?: 'groom' | 'bride' | 'shared';
      dueDate?: string | null;
      reminderDate?: string | null;
      dependsOnTaskId?: string | null;
      status?: JourneyTaskStatus;
      priority?: JourneyTaskPriority;
      estimatedCost?: number;
      attachmentLabel?: string | null;
    },
  ) => Promise<string | null>;
  deleteJourneyTask: (taskId: string) => Promise<void>;
  addJourneyTaskComment: (taskId: string, body: string) => Promise<void>;
  updateWorkspaceMeta: (patch: {
    nameAr?: string;
    nameEn?: string;
    engagementDate?: string | null;
    weddingDate?: string | null;
  }) => Promise<void>;
  inviteWorkspacePartner: (input: {
    inviteeIdentifier: string;
    proposedRole?: 'partner' | 'planner_guest';
    proposedSide?: 'groom' | 'bride' | 'partner';
    permissions?: Partial<WorkspacePermissions>;
  }) => Promise<string>;
  respondWorkspaceInvitation: (token: string, action: 'accept' | 'decline') => Promise<void>;
  updateWorkspaceMemberPermissions: (
    memberId: string,
    permissions: WorkspacePermissions,
  ) => Promise<void>;
  revokeWorkspaceMember: (memberId: string) => Promise<void>;
  createWorkspaceApproval: (input: {
    title: string;
    category: string;
    estimatedAmount: number;
  }) => Promise<void>;
  decideWorkspaceApproval: (
    approvalId: string,
    status: 'approved' | 'changes_requested' | 'rejected',
    reviewerNote?: string,
  ) => Promise<void>;
  createUserDocument: (input: {
    docType: UserDocumentType;
    title: string;
    fileName: string;
    mimeType?: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp' | 'text/plain';
    sizeBytes?: number;
    referenceCode?: string;
    notes?: string;
    isSharedWithPartner?: boolean;
  }) => Promise<void>;
  deleteUserDocument: (docId: string) => Promise<void>;
  createUserWarranty: (input: {
    itemName: string;
    category: string;
    providerName: string;
    modelSerial?: string;
    startDate: string;
    expiryDate: string;
    notes?: string;
  }) => Promise<void>;
  deleteUserWarranty: (warrantyId: string) => Promise<void>;
  createUserAppointment: (input: {
    title: string;
    appointmentType: UserAppointmentType;
    providerName: string;
    locationText: string;
    scheduledAt: string;
    notes?: string;
  }) => Promise<void>;
  patchUserAppointment: (
    appointmentId: string,
    patch: { status?: UserAppointmentStatus; scheduledAt?: string; notes?: string | null },
  ) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Stage 6: Product Encyclopedia, Multi-Product Comparison, Multi-List Shopping Baskets & Price Alerts
  compareProductIds: string[];
  toggleCompareProduct: (productId: string) => void;
  clearCompareProducts: () => void;
  shoppingLists: ShoppingList[];
  priceAlerts: PriceAlert[];
  refreshShoppingAndAlerts: () => Promise<void>;
  createShoppingList: (input: {
    titleAr: string;
    titleEn: string;
    listType?: ShoppingListType;
    isSharedWithPartner?: boolean;
    budgetTarget?: number;
    notes?: string;
  }) => Promise<string>;
  updateShoppingList: (
    listId: string,
    patch: {
      titleAr?: string;
      titleEn?: string;
      listType?: ShoppingListType;
      isSharedWithPartner?: boolean;
      budgetTarget?: number;
      notes?: string | null;
    },
  ) => Promise<void>;
  deleteShoppingList: (listId: string) => Promise<void>;
  addShoppingListItem: (
    listId: string,
    input: {
      productId?: string | null;
      customTitle: string;
      categoryLabel?: string;
      quantity?: number;
      targetUnitPrice?: number;
      preferredMerchant?: string;
      status?: ShoppingListItemStatus;
      priority?: 'high' | 'medium' | 'low';
      notes?: string;
    },
  ) => Promise<void>;
  updateShoppingListItem: (
    itemId: string,
    patch: {
      quantity?: number;
      targetUnitPrice?: number;
      preferredMerchant?: string | null;
      status?: ShoppingListItemStatus;
      priority?: 'high' | 'medium' | 'low';
      notes?: string | null;
    },
  ) => Promise<void>;
  deleteShoppingListItem: (itemId: string) => Promise<void>;
  upsertPriceAlert: (productId: string, targetPrice: number) => Promise<PriceAlert>;
  updatePriceAlert: (
    alertId: string,
    patch: { targetPrice?: number; status?: PriceAlertStatus },
  ) => Promise<void>;
  deletePriceAlert: (alertId: string) => Promise<void>;

  // Stage 7: Vendor Marketplace, Subscriptions, Reviews & Admin Verification
  vendorCategories: VendorCategory[];
  vendors: VendorListing[];
  subscriptionPlans: SubscriptionPlan[];
  adminVendors: VendorListing[];
  refreshVendors: (filters?: Record<string, string>) => Promise<VendorListing[]>;
  registerVendor: (input: {
    businessNameAr: string;
    businessNameEn: string;
    primaryCategorySlug: string;
    governorateSlug: string;
    citySlug?: string | null;
    serviceAreas?: string[];
    addressAr: string;
    addressEn: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    websiteUrl?: string;
    bioAr: string;
    bioEn: string;
    coverImage?: string;
    priceTier?: 'economy' | 'mid' | 'luxury';
    startingPriceEgp?: number;
    yearsExperience?: number;
    verificationDocs?: string[];
  }) => Promise<VendorListing>;
  submitVendorReview: (
    slugOrId: string,
    input: { rating: number; title: string; comment: string },
  ) => Promise<{ review: VendorReview; vendor: VendorListing }>;
  refreshAdminVendors: () => Promise<void>;
  adminVerifyVendor: (
    vendorId: string,
    input: {
      verificationStatus: VendorVerificationStatus;
      verificationDocs?: string[];
      verificationNotes?: string | null;
    },
  ) => Promise<VendorListing>;
  adminUpdateSubscriptionPlan: (
    planId: string,
    patch: {
      monthlyPriceEgp?: number;
      annualPriceEgp?: number;
      maxServices?: number;
      maxPromotions?: number;
      maxPortfolioItems?: number;
      leadPriorityBoost?: number;
      isActive?: boolean;
    },
  ) => Promise<SubscriptionPlan[]>;

  // Stage 8: Multi-Vendor RFQ Engine & Marketplace Slot Appointments
  myRfqs: RfqRequest[];
  marketplaceAppointments: MarketplaceAppointment[];
  refreshRfqAndAppointments: () => Promise<void>;
  createRfqRequest: (input: {
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
  }) => Promise<RfqRequest>;
  decideRfqQuote: (
    rfqId: string,
    quoteId: string,
    input: { decision: 'accept' | 'reject'; customerDecisionNote?: string | null; linkToBudget?: boolean },
  ) => Promise<{ rfq: RfqRequest; linkedBudgetExpenseId: string | null }>;
  postRfqMessage: (rfqId: string, body: string, vendorId?: string) => Promise<RfqRequest>;
  createMarketplaceAppointment: (input: {
    vendorId: string;
    serviceId?: string | null;
    rfqId?: string | null;
    appointmentType: MarketplaceAppointmentType;
    slotDate: string;
    slotTime: string;
    durationMinutes?: number;
    customerPhone: string;
    customerNotes?: string | null;
  }) => Promise<MarketplaceAppointment>;
  patchMarketplaceAppointment: (
    aptId: string,
    patch: {
      status?: MarketplaceAppointmentStatus;
      slotDate?: string;
      slotTime?: string;
      customerNotes?: string | null;
      vendorResponseNote?: string | null;
    },
  ) => Promise<MarketplaceAppointment>;

  // Stage 9: Real Wedding Stories, Community Q&A, Experts & Full Admin OS Analytics + Moderation
  realWeddings: RealWeddingStory[];
  mySubmittedStories: RealWeddingStory[];
  communityQuestions: CommunityQuestion[];
  verifiedExperts: ExpertProfile[];
  adminAnalytics: AdminAnalyticsPayload | null;
  adminModeration: AdminModerationOverview | null;
  refreshStage9Public: () => Promise<void>;
  submitWeddingStory: (input: {
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
    photos?: string[];
  }) => Promise<RealWeddingStory>;
  createCommunityQuestion: (input: {
    categorySlug: CommunityCategorySlug;
    titleAr: string;
    titleEn?: string;
    bodyAr: string;
    bodyEn?: string;
    tags?: string[];
  }) => Promise<CommunityQuestion>;
  postCommunityAnswer: (questionId: string, bodyAr: string, bodyEn?: string) => Promise<CommunityAnswer>;
  toggleCommunityVote: (targetType: 'question' | 'answer', targetId: string) => Promise<void>;
  markAnswerHelpful: (questionId: string, answerId: string) => Promise<void>;
  submitCommunityReport: (input: {
    targetType: 'question' | 'answer' | 'story' | 'vendor_review';
    targetId: string;
    reason: CommunityReportReason;
    details?: string | null;
  }) => Promise<CommunityReport>;
  applyExpertProfile: (input: {
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
  }) => Promise<ExpertProfile>;
  refreshAdminStage9: () => Promise<void>;
  moderateStoryDecision: (
    storyId: string,
    input: { moderationStatus: StoryModerationStatus; moderationNotes?: string | null; isFeatured?: boolean },
  ) => Promise<RealWeddingStory>;
  resolveCommunityReportDecision: (
    reportId: string,
    input: { action: 'resolve_hide' | 'dismiss'; resolutionNote?: string | null },
  ) => Promise<CommunityReport>;
  verifyExpertProfileDecision: (
    expertId: string,
    input: { verificationStatus: ExpertVerificationStatus; verificationNotes?: string | null; isFeatured?: boolean },
  ) => Promise<ExpertProfile>;
  adminUpdateArticleStatus: (
    articleId: string,
    patch: { status?: Article['status']; isFeatured?: boolean },
  ) => Promise<Article>;
  adminUpdateUserStatus: (userId: string, status: User['status']) => Promise<User>;

  // Stage 10: Grounded AI Assistant, Smart Room Designer & Wedding Day Operations
  aiConversations: AiConversationSummary[];
  roomMoodboards: RoomMoodboard[];
  weddingDayOverview: WeddingDayOverviewPayload | null;
  askAiAssistant: (query: string, conversationId?: string) => Promise<AiAssistantReplyPayload>;
  refreshRoomMoodboards: () => Promise<void>;
  createRoomMoodboard: (input: {
    titleAr: string;
    titleEn?: string;
    roomType: RoomType;
    lengthM: number;
    widthM: number;
    heightM?: number;
    themeSlug: RoomThemeSlug;
    isSharedWithPartner?: boolean;
  }) => Promise<RoomMoodboard>;
  deleteRoomMoodboard: (moodboardId: string) => Promise<void>;
  addMoodboardItem: (
    moodboardId: string,
    input: {
      itemType: MoodboardItemType;
      productId?: string | null;
      materialSlug?: string | null;
      labelAr: string;
      labelEn?: string;
      widthCm: number;
      depthCm: number;
      posXPct: number;
      posYPct: number;
      estimatedPriceEgp: number;
      colorHex?: string;
      notes?: string | null;
    },
  ) => Promise<RoomMoodboard>;
  updateMoodboardItem: (
    itemId: string,
    patch: { posXPct?: number; posYPct?: number; widthCm?: number; depthCm?: number },
  ) => Promise<RoomMoodboard>;
  deleteMoodboardItem: (itemId: string) => Promise<RoomMoodboard>;
  refreshWeddingDayOverview: () => Promise<void>;
  createSeatingTable: (input: {
    tableName: string;
    zone: TableZone;
    capacity: number;
    notes?: string | null;
  }) => Promise<WeddingDayOverviewPayload>;
  deleteSeatingTable: (tableId: string) => Promise<WeddingDayOverviewPayload>;
  createWeddingGuest: (input: {
    fullName: string;
    phone?: string | null;
    side: GuestSide;
    guestGroup: GuestGroup;
    invitedCount: number;
    plusOneAllowed: boolean;
    tableId?: string | null;
  }) => Promise<WeddingDayOverviewPayload>;
  updateWeddingGuest: (
    guestId: string,
    patch: { rsvpStatus?: RsvpStatus; tableId?: string | null; attendingCount?: number },
  ) => Promise<WeddingDayOverviewPayload>;
  deleteWeddingGuest: (guestId: string) => Promise<WeddingDayOverviewPayload>;
  createTimelineEvent: (input: {
    startTime: string;
    endTime: string;
    titleAr: string;
    titleEn?: string;
    assignee: string;
    locationNote?: string | null;
  }) => Promise<WeddingDayOverviewPayload>;
  updateTimelineEvent: (
    eventId: string,
    patch: { status?: TimelineEventStatus },
  ) => Promise<WeddingDayOverviewPayload>;
  deleteTimelineEvent: (eventId: string) => Promise<WeddingDayOverviewPayload>;
  createGiftRegistryItem: (input: {
    productId?: string | null;
    titleAr: string;
    titleEn?: string;
    categoryLabel: string;
    targetPriceEgp: number;
    priority: GiftPriority;
    notes?: string | null;
  }) => Promise<WeddingDayOverviewPayload>;
  deleteGiftRegistryItem: (itemId: string) => Promise<WeddingDayOverviewPayload>;

  // Modals & Interactivity
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  finishingModalOpen: boolean;
  setFinishingModalOpen: (open: boolean) => void;
  finishingPrefill: FinishingPrefill;
  setFinishingPrefill: (prefill: FinishingPrefill) => void;
  weddingBookingModalOpen: boolean;
  setWeddingBookingModalOpen: (open: boolean) => void;
  selectedWeddingService: WeddingServiceItem | null;
  setSelectedWeddingService: (srv: WeddingServiceItem | null) => void;
  productDetailModalOpen: boolean;
  setProductDetailModalOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  installmentModalOpen: boolean;
  setInstallmentModalOpen: (open: boolean) => void;
  installmentPrefillAmount: number;
  setInstallmentPrefillAmount: (amt: number) => void;
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
  sponsorModalOpen: boolean;
  setSponsorModalOpen: (open: boolean) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'gawaz_inn_';

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors safely
  }
}

function resolveSectionFromPath(pathname: string): SectionKey {
  if (pathname.startsWith('/onboarding')) return 'onboarding';
  if (pathname.startsWith('/early-start') || pathname.startsWith('/my/future-fund')) {
    return 'earlyStart';
  }
  if (pathname.startsWith('/engagement') || pathname.startsWith('/my/engagement')) {
    return 'engagement';
  }
  if (pathname.startsWith('/journey') || pathname.startsWith('/my/journey')) {
    return 'journey';
  }
  if (pathname.startsWith('/finishing')) return 'finishing';
  if (pathname.startsWith('/groom')) return 'groom';
  if (pathname.startsWith('/bride')) return 'bride';
  if (pathname.startsWith('/wedding')) return 'wedding';
  if (pathname.startsWith('/installments')) return 'installments';
  if (pathname.startsWith('/social-support')) return 'socialSupport';
  if (pathname.startsWith('/calculators')) return 'calculators';
  if (pathname.startsWith('/my/budget')) return 'budget';
  if (pathname.startsWith('/my/shopping-lists')) return 'shoppingLists';
  if (pathname.startsWith('/my/workspace')) return 'myHub';
  if (pathname.startsWith('/products/compare')) return 'compare';
  if (pathname.startsWith('/products')) return 'products';
  if (
    pathname.startsWith('/encyclopedia') ||
    pathname.startsWith('/guides') ||
    pathname.startsWith('/glossary') ||
    pathname.startsWith('/faqs')
  ) {
    return 'encyclopedia';
  }
  if (pathname.startsWith('/discover') || pathname.startsWith('/locations')) return 'discover';
  if (pathname.startsWith('/real-weddings')) return 'stories';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/experts')) return 'experts';
  if (pathname.startsWith('/assistant')) return 'assistant';
  if (pathname.startsWith('/room-designer')) return 'roomDesigner';
  if (pathname.startsWith('/wedding-day') || pathname.startsWith('/rsvp/')) return 'weddingDay';
  if (pathname === '/rfq' || pathname.startsWith('/rfq/')) return 'rfq';
  if (pathname.startsWith('/vendors')) return 'vendors';
  if (pathname === '/vendor' || pathname.startsWith('/vendor/')) return 'vendorPortal';
  if (pathname.startsWith('/portal') || pathname.startsWith('/my')) return 'customerPortal';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'home';
}

const DEFAULT_GUEST_GROOM_PLAN: UserGroomPlanState = {
  selectedTierKey: 'tier_200k',
  targetBudgetEgp: 200000,
  slotSelections: {},
  excludedSlots: [],
  customItems: [],
};

function createDefaultGuestBridePlan(): UserBridePlanState {
  const legacyChecked = getStoredItem<string[]>('bride_checklist_v2', ['chk-1', 'chk-4']);
  return {
    presetMode: 'balanced',
    targetBudgetEgp: 90000,
    checkedItemIds: legacyChecked,
    qtyOverrides: {},
    customItems: [],
  };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [apiConnected, setApiConnected] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Localization
  const [language, setLanguageState] = useState<Language>(() =>
    getStoredItem<Language>('lang', 'ar'),
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setStoredItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = translations[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Router-backed activeSection
  const activeSection = resolveSectionFromPath(location.pathname);

  const setActiveSection = useCallback(
    (sec: SectionKey) => {
      const target = SECTION_ROUTES[sec] || '/';
      if (location.pathname !== target) {
        navigate(target);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [location.pathname, navigate],
  );

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Auth State — SECURE BY DEFAULT: visitors start unauthenticated (null)!
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Catalog & Public CMS State
  const [products, setProducts] = useState<Product[]>(() => [
    ...[...initialGroomProducts, ...initialBrideProducts].map((p) => {
      const meta = PRODUCT_ENCYCLOPEDIA_EXTENSIONS[p.id];
      return meta ? { ...p, ...meta } : { ...p, slug: p.slug ?? p.id };
    }),
    ...STAGE6_ADDITIONAL_PRODUCTS,
  ]);
  const [weddingServices, setWeddingServices] = useState<WeddingServiceItem[]>(initialWeddingServices);
  const [finishingPackages, setFinishingPackages] = useState<FinishingPackage[]>(initialFinishingPackages);
  const [finishingServices, setFinishingServices] = useState<FinishingService[]>(initialFinishingServices);
  const [categories, setCategories] = useState<ContentCategory[]>(SEED_CATEGORIES);
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);
  const [locations, setLocations] = useState<LocationNode[]>([
    ...SEED_LOCATIONS,
    ...EXTRA_EGYPTIAN_LOCATIONS,
  ]);
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);

  // Stage 7 Vendor Marketplace State
  const [vendorCategories, setVendorCategories] = useState<VendorCategory[]>(VENDOR_CATEGORIES_SEED);
  const [vendors, setVendors] = useState<VendorListing[]>(STAGE7_VENDORS_SEED);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS_SEED);

  // Stage 2 Encyclopedia Catalog State
  const [finishingCategories, setFinishingCategories] = useState<FinishingEncyclopediaCategory[]>(
    FINISHING_ENCYCLOPEDIA_CATEGORIES,
  );
  const [finishingMaterials, setFinishingMaterials] = useState<FinishingMaterialItem[]>(
    FINISHING_MATERIALS_DB,
  );
  const [beforeAfterProjects, setBeforeAfterProjects] = useState<BeforeAfterProject[]>(
    STAGE2_BEFORE_AFTER_PROJECTS,
  );
  const [contractors, setContractors] = useState<FinishingContractorListing[]>(
    FINISHING_CONTRACTORS_DIRECTORY,
  );
  const [groomSubcategories, setGroomSubcategories] = useState<GroomSubcategoryGuide[]>(
    GROOM_SUBCATEGORIES,
  );
  const [groomConfigurablePackages, setGroomConfigurablePackages] = useState<
    GroomConfigurablePackage[]
  >(GROOM_CONFIGURABLE_PACKAGES);
  const [brideCategories, setBrideCategories] = useState<BrideCategoryGuide[]>(
    BRIDE_ENCYCLOPEDIA_CATEGORIES,
  );
  const [brideChecklistTemplates, setBrideChecklistTemplates] = useState<
    BrideChecklistTemplateItem[]
  >(BRIDE_CHECKLIST_TEMPLATES);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(STAGE2_GLOSSARY_TERMS);
  const [faqItems, setFaqItems] = useState<FaqEntry[]>(STAGE2_FAQ_ITEMS);

  // Stage 3 Calculators & Budget State
  const [calculatorSummaries, setCalculatorSummaries] = useState<CalculatorSummary[]>(() =>
    listCalculatorSummaries(),
  );
  const [calculatorRuns, setCalculatorRuns] = useState<CalculatorRunRecord[]>([]);
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverviewPayload | null>(null);

  // Stage 4 Early Start & My Future Fund State
  const [academyLessons, setAcademyLessons] = useState<EarlyStartAcademyLesson[]>(
    EARLY_START_ACADEMY_LESSONS,
  );
  const [earlyStartOverview, setEarlyStartOverview] = useState<EarlyStartOverviewPayload | null>(
    null,
  );

  // Stage 5 Lifecycle, Engagement, Journey & Shared Couple Workspace State
  const [myHubPayload, setMyHubPayload] = useState<MyGawazInnHubPayload | null>(null);

  // Stage 6 Product Comparison Tray (client persistent), Multi-List Shopping Baskets & Price Alerts
  const [compareProductIds, setCompareProductIds] = useState<string[]>(() =>
    getStoredItem<string[]>('compare_product_ids_v2', []),
  );
  useEffect(() => {
    setStoredItem('compare_product_ids_v2', compareProductIds);
  }, [compareProductIds]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  // Scoped Transaction State
  const [finishingInquiries, setFinishingInquiries] = useState<FinishingInquiry[]>([]);
  const [weddingBookings, setWeddingBookings] = useState<WeddingBookingRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [financingApplications, setFinancingApplications] = useState<FinancingApplication[]>([]);
  const [supportCases, setSupportCases] = useState<SupportCase[]>([]);
  const [sponsorshipInquiries, setSponsorshipInquiries] = useState<SponsorshipInquiry[]>([]);

  // Stage 2 Interactive Plan State
  const [userGroomPlan, setUserGroomPlan] = useState<UserGroomPlanState>(() =>
    getStoredItem<UserGroomPlanState>('user_groom_plan_v2', DEFAULT_GUEST_GROOM_PLAN),
  );
  const [userBridePlan, setUserBridePlan] = useState<UserBridePlanState>(() =>
    getStoredItem<UserBridePlanState>('user_bride_plan_v2', createDefaultGuestBridePlan()),
  );
  const userGroomPlanRef = useRef(userGroomPlan);
  const userBridePlanRef = useRef(userBridePlan);
  useEffect(() => {
    userGroomPlanRef.current = userGroomPlan;
  }, [userGroomPlan]);
  useEffect(() => {
    userBridePlanRef.current = userBridePlan;
  }, [userBridePlan]);

  // Admin Overview State
  const [adminStats, setAdminStats] = useState<AdminOverviewStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminVendors, setAdminVendors] = useState<VendorListing[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [myRfqs, setMyRfqs] = useState<RfqRequest[]>([]);
  const [marketplaceAppointments, setMarketplaceAppointments] = useState<MarketplaceAppointment[]>([]);

  // Stage 9 Community, Stories, Experts & Admin OS Analytics/Moderation State
  const [realWeddings, setRealWeddings] = useState<RealWeddingStory[]>([]);
  const [mySubmittedStories, setMySubmittedStories] = useState<RealWeddingStory[]>([]);
  const [communityQuestions, setCommunityQuestions] = useState<CommunityQuestion[]>([]);
  const [verifiedExperts, setVerifiedExperts] = useState<ExpertProfile[]>([]);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalyticsPayload | null>(null);
  const [adminModeration, setAdminModeration] = useState<AdminModerationOverview | null>(null);

  // Stage 10 AI Assistant, Room Studio & Wedding Day Operations State
  const [aiConversations, setAiConversations] = useState<AiConversationSummary[]>([]);
  const [roomMoodboards, setRoomMoodboards] = useState<RoomMoodboard[]>([]);
  const [weddingDayOverview, setWeddingDayOverview] = useState<WeddingDayOverviewPayload | null>(null);

  const loadUserScopedData = useCallback(async (user: User | null, connected: boolean) => {
    if (!user) {
      setOrders([]);
      setFinishingInquiries([]);
      setWeddingBookings([]);
      setFinancingApplications([]);
      setSupportCases([]);
      setCalculatorRuns([]);
      setBudgetOverview(null);
      setEarlyStartOverview(null);
      setMyHubPayload(null);
      setShoppingLists([]);
      setPriceAlerts([]);
      setAdminStats(null);
      setAdminUsers([]);
      setAdminVendors([]);
      setAuditLogs([]);
      setMyRfqs([]);
      setMarketplaceAppointments([]);
      setMySubmittedStories([]);
      setAdminAnalytics(null);
      setAdminModeration(null);
      setAiConversations([]);
      setRoomMoodboards([]);
      setWeddingDayOverview(null);
      setCommunityQuestions((prev) =>
        prev.map((q) => ({
          ...q,
          viewerUpvoted: false,
          answers: (q.answers || []).map((a) => ({ ...a, viewerUpvoted: false })),
        })),
      );
      setUserGroomPlan(getStoredItem<UserGroomPlanState>('user_groom_plan_v2', DEFAULT_GUEST_GROOM_PLAN));
      setUserBridePlan(
        getStoredItem<UserBridePlanState>('user_bride_plan_v2', createDefaultGuestBridePlan()),
      );
      return;
    }

    if (!connected) {
      // Static demo offline fallback scoped strictly to userId
      const localOrders = getStoredItem<Order[]>('orders_v2', sampleOrders).filter(
        (o) => o.userId === user.id || user.role === 'admin',
      );
      const localFin = getStoredItem<FinishingInquiry[]>('finishing_v2', sampleFinishingInquiries).filter(
        (f) => f.userId === user.id || user.role === 'admin',
      );
      const localWed = getStoredItem<WeddingBookingRequest[]>('bookings_v2', sampleWeddingBookings).filter(
        (b) => b.userId === user.id || user.role === 'admin',
      );
      const localFnc = getStoredItem<FinancingApplication[]>('financing_v2', sampleFinancingApplications).filter(
        (a) => a.userId === user.id || user.role === 'admin',
      );
      setOrders(localOrders);
      setFinishingInquiries(localFin);
      setWeddingBookings(localWed);
      setFinancingApplications(localFnc);
      setSupportCases(
        hasAnyRole(user.role, ['admin', 'super_admin', 'moderator'])
          ? getStoredItem<SupportCase[]>('support_v2', sampleSupportCases)
          : [],
      );
      return;
    }

    try {
      const [
        uOrders,
        uFin,
        uWed,
        uFnc,
        uSup,
        uGroomPlan,
        uBridePlan,
        uCalcRuns,
        uBudget,
        uEarlyStart,
        uMyHub,
        uShoppingLists,
        uPriceAlerts,
        uRfqs,
        uAppointments,
        uMyStories,
        uQuestions,
        uAiConvs,
        uMoodboards,
        uWeddingDay,
      ] =
        await Promise.all([
          apiRequest<Order[]>('/orders'),
          apiRequest<FinishingInquiry[]>('/finishing-inquiries'),
          apiRequest<WeddingBookingRequest[]>('/wedding-bookings'),
          apiRequest<FinancingApplication[]>('/financing-applications'),
          apiRequest<SupportCase[]>('/support-cases'),
          apiRequest<UserGroomPlanState>('/my/groom-plan').catch(() => DEFAULT_GUEST_GROOM_PLAN),
          apiRequest<UserBridePlanState>('/my/bride-plan').catch(() => createDefaultGuestBridePlan()),
          apiRequest<CalculatorRunRecord[]>('/my/calculator-runs').catch(() => []),
          apiRequest<BudgetOverviewPayload>('/budget/overview').catch(() => null),
          apiRequest<EarlyStartOverviewPayload>('/early-start/overview').catch(() => null),
          apiRequest<MyGawazInnHubPayload>('/my/hub').catch(() => null),
          apiRequest<ShoppingList[]>('/shopping-lists').catch(() => []),
          apiRequest<PriceAlert[]>('/price-alerts').catch(() => []),
          apiRequest<RfqRequest[]>('/rfq').catch(() => []),
          apiRequest<MarketplaceAppointment[]>('/appointments').catch(() => []),
          apiRequest<RealWeddingStory[]>('/stories?mine=1').catch(() => []),
          apiRequest<CommunityQuestion[]>('/community/questions').catch(() => null),
          apiRequest<AiConversationSummary[]>('/assistant/history').catch(() => []),
          apiRequest<RoomMoodboard[]>('/room-studio/moodboards').catch(() => []),
          apiRequest<WeddingDayOverviewPayload>('/wedding-day/overview').catch(() => null),
        ]);
      setOrders(uOrders);
      setFinishingInquiries(uFin);
      setWeddingBookings(uWed);
      setFinancingApplications(uFnc);
      setSupportCases(uSup);
      userGroomPlanRef.current = uGroomPlan;
      userBridePlanRef.current = uBridePlan;
      setUserGroomPlan(uGroomPlan);
      setUserBridePlan(uBridePlan);
      setCalculatorRuns(uCalcRuns);
      setBudgetOverview(uBudget);
      setEarlyStartOverview(uEarlyStart);
      setMyHubPayload(uMyHub);
      setShoppingLists(uShoppingLists);
      setPriceAlerts(uPriceAlerts);
      setMyRfqs(uRfqs);
      setMarketplaceAppointments(uAppointments);
      setMySubmittedStories(uMyStories);
      if (uQuestions) setCommunityQuestions(uQuestions);
      setAiConversations(uAiConvs);
      setRoomMoodboards(uMoodboards);
      setWeddingDayOverview(uWeddingDay);
    } catch {
      // Non-fatal fallback
    }
  }, []);

  const refreshAdminVendors = useCallback(async () => {
    if (!apiConnected || !currentUser || !hasAnyRole(currentUser.role, FULL_ADMIN_ROLES)) {
      return;
    }
    const [vList, pList] = await Promise.all([
      apiRequest<VendorListing[]>('/admin/vendors'),
      apiRequest<SubscriptionPlan[]>('/admin/subscription-plans'),
    ]);
    setAdminVendors(vList);
    if (pList.length > 0) setSubscriptionPlans(pList);
  }, [apiConnected, currentUser]);

  const refreshAdminData = useCallback(async () => {
    if (!apiConnected || !currentUser || !hasAnyRole(currentUser.role, ADMIN_PANEL_ROLES)) {
      return;
    }
    const overview = await apiRequest<AdminOverviewPayload>('/admin/overview');
    setAdminStats(overview.counts);
    setAdminUsers(overview.users);
    if (overview.orders.length > 0 || hasAnyRole(currentUser.role, ['admin', 'super_admin'])) {
      setOrders(overview.orders);
      setFinishingInquiries(overview.finishingInquiries);
      setWeddingBookings(overview.weddingBookings);
      setFinancingApplications(overview.financingApplications);
      setSponsorshipInquiries(overview.sponsorships);
      setAuditLogs(overview.auditLogs);
    }
    if (hasAnyRole(currentUser.role, ['admin', 'super_admin', 'moderator'])) {
      setSupportCases(overview.supportCases);
    }
    setArticles(overview.articles);
    if (hasAnyRole(currentUser.role, FULL_ADMIN_ROLES)) {
      const [vList, pList] = await Promise.all([
        apiRequest<VendorListing[]>('/admin/vendors').catch(() => null),
        apiRequest<SubscriptionPlan[]>('/admin/subscription-plans').catch(() => null),
      ]);
      if (vList) setAdminVendors(vList);
      if (pList && pList.length > 0) setSubscriptionPlans(pList);
    }
    const [anData, modData] = await Promise.all([
      apiRequest<AdminAnalyticsPayload>('/admin/analytics').catch(() => null),
      hasAnyRole(currentUser.role, MODERATION_ROLES)
        ? apiRequest<AdminModerationOverview>('/admin/moderation/overview').catch(() => null)
        : Promise.resolve(null),
    ]);
    if (anData) setAdminAnalytics(anData);
    if (modData) setAdminModeration(modData);
  }, [apiConnected, currentUser]);

  // Initial Bootstrap from Backend API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [payload, encBundle, calcMeta, academyRes, sList, qList, expList] = await Promise.all([
          apiRequest<BootstrapPayload>('/bootstrap'),
          apiRequest<EncyclopediaBundlePayload>('/encyclopedia/bundle').catch(() => null),
          apiRequest<CalculatorSummary[]>('/calculators').catch(() => null),
          apiRequest<{ lessons: EarlyStartAcademyLesson[]; completedSlugs: string[] }>(
            '/early-start/academy',
          ).catch(() => null),
          apiRequest<RealWeddingStory[]>('/stories').catch(() => null),
          apiRequest<CommunityQuestion[]>('/community/questions').catch(() => null),
          apiRequest<ExpertProfile[]>('/experts').catch(() => null),
        ]);
        if (!active) return;
        setApiConnected(true);
        if (sList) setRealWeddings(sList);
        if (qList) setCommunityQuestions(qList);
        if (expList) setVerifiedExperts(expList);
        if (calcMeta && calcMeta.length > 0) setCalculatorSummaries(calcMeta);
        if (academyRes?.lessons && academyRes.lessons.length > 0) {
          setAcademyLessons(academyRes.lessons);
        }
        if (payload.products.length > 0) setProducts(payload.products);
        if (payload.finishingPackages.length > 0) setFinishingPackages(payload.finishingPackages);
        if (payload.finishingServices.length > 0) setFinishingServices(payload.finishingServices);
        if (payload.weddingServices.length > 0) setWeddingServices(payload.weddingServices);
        if (payload.categories.length > 0) setCategories(payload.categories);
        if (payload.articles.length > 0) setArticles(payload.articles);
        if (payload.locations.length > 0) setLocations(payload.locations);
        if (payload.vendorCategories && payload.vendorCategories.length > 0) {
          setVendorCategories(payload.vendorCategories);
        }
        if (payload.vendors && payload.vendors.length > 0) setVendors(payload.vendors);
        if (payload.subscriptionPlans && payload.subscriptionPlans.length > 0) {
          setSubscriptionPlans(payload.subscriptionPlans);
        }
        if (payload.settings) setSettings(payload.settings);
        if (encBundle) {
          if (encBundle.finishingCategories.length > 0) {
            setFinishingCategories(encBundle.finishingCategories);
          }
          if (encBundle.finishingMaterials.length > 0) {
            setFinishingMaterials(encBundle.finishingMaterials);
          }
          if (encBundle.beforeAfterProjects.length > 0) {
            setBeforeAfterProjects(encBundle.beforeAfterProjects);
          }
          if (encBundle.contractors.length > 0) setContractors(encBundle.contractors);
          if (encBundle.groomSubcategories.length > 0) {
            setGroomSubcategories(encBundle.groomSubcategories);
          }
          if (encBundle.groomConfigurablePackages.length > 0) {
            setGroomConfigurablePackages(encBundle.groomConfigurablePackages);
          }
          if (encBundle.brideCategories.length > 0) setBrideCategories(encBundle.brideCategories);
          if (encBundle.brideChecklistTemplates.length > 0) {
            setBrideChecklistTemplates(encBundle.brideChecklistTemplates);
          }
          if (encBundle.glossaryTerms.length > 0) setGlossaryTerms(encBundle.glossaryTerms);
          if (encBundle.faqItems.length > 0) setFaqItems(encBundle.faqItems);
        }
        setCurrentUser(payload.user);
        if (payload.user) {
          await loadUserScopedData(payload.user, true);
          if (hasAnyRole(payload.user.role, ADMIN_PANEL_ROLES)) {
            const ov = await apiRequest<AdminOverviewPayload>('/admin/overview');
            if (!active) return;
            setAdminStats(ov.counts);
            setAdminUsers(ov.users);
            if (hasAnyRole(payload.user.role, ['admin', 'super_admin'])) {
              setOrders(ov.orders);
              setFinishingInquiries(ov.finishingInquiries);
              setWeddingBookings(ov.weddingBookings);
              setFinancingApplications(ov.financingApplications);
              setSponsorshipInquiries(ov.sponsorships);
              setAuditLogs(ov.auditLogs);
            }
            setSupportCases(ov.supportCases);
            setArticles(ov.articles);
            if (hasAnyRole(payload.user.role, FULL_ADMIN_ROLES)) {
              const [vList, pList] = await Promise.all([
                apiRequest<VendorListing[]>('/admin/vendors').catch(() => null),
                apiRequest<SubscriptionPlan[]>('/admin/subscription-plans').catch(() => null),
              ]);
              if (!active) return;
              if (vList) setAdminVendors(vList);
              if (pList && pList.length > 0) setSubscriptionPlans(pList);
            }
            const [anData, modData] = await Promise.all([
              apiRequest<AdminAnalyticsPayload>('/admin/analytics').catch(() => null),
              hasAnyRole(payload.user.role, MODERATION_ROLES)
                ? apiRequest<AdminModerationOverview>('/admin/moderation/overview').catch(() => null)
                : Promise.resolve(null),
            ]);
            if (!active) return;
            if (anData) setAdminAnalytics(anData);
            if (modData) setAdminModeration(modData);
          }
        }
      } catch {
        if (!active) return;
        setApiConnected(false);
      } finally {
        if (active) setIsHydrating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadUserScopedData]);

  // Auth Methods
  const loginWithCredentials = async (identifier: string, password: string): Promise<User> => {
    if (!apiConnected) {
      throw new ApiClientError(
        503,
        'API_UNAVAILABLE',
        language === 'ar'
          ? 'الخادم غير متصل حالياً لتأكيد الحساب.'
          : 'Backend authentication service is offline.',
      );
    }
    const res = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    await loadUserScopedData(res.user, true);
    setCurrentUser(res.user);
    if (hasAnyRole(res.user.role, ADMIN_PANEL_ROLES)) {
      const ov = await apiRequest<AdminOverviewPayload>('/admin/overview');
      setAdminStats(ov.counts);
      setAdminUsers(ov.users);
      if (hasAnyRole(res.user.role, ['admin', 'super_admin'])) {
        setOrders(ov.orders);
        setFinishingInquiries(ov.finishingInquiries);
        setWeddingBookings(ov.weddingBookings);
        setFinancingApplications(ov.financingApplications);
        setSponsorshipInquiries(ov.sponsorships);
        setAuditLogs(ov.auditLogs);
      }
      setSupportCases(ov.supportCases);
      setArticles(ov.articles);
      if (hasAnyRole(res.user.role, FULL_ADMIN_ROLES)) {
        const [vList, pList] = await Promise.all([
          apiRequest<VendorListing[]>('/admin/vendors').catch(() => null),
          apiRequest<SubscriptionPlan[]>('/admin/subscription-plans').catch(() => null),
        ]);
        if (vList) setAdminVendors(vList);
        if (pList && pList.length > 0) setSubscriptionPlans(pList);
      }
      const [anData, modData] = await Promise.all([
        apiRequest<AdminAnalyticsPayload>('/admin/analytics').catch(() => null),
        hasAnyRole(res.user.role, MODERATION_ROLES)
          ? apiRequest<AdminModerationOverview>('/admin/moderation/overview').catch(() => null)
          : Promise.resolve(null),
      ]);
      if (anData) setAdminAnalytics(anData);
      if (modData) setAdminModeration(modData);
    }
    showToast(
      language === 'ar' ? `أهلاً بك، ${res.user.name}!` : `Welcome back, ${res.user.nameEn || res.user.name}!`,
    );
    return res.user;
  };

  const registerAccount = async (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    city?: string;
  }): Promise<User> => {
    if (!apiConnected) {
      throw new ApiClientError(
        503,
        'API_UNAVAILABLE',
        language === 'ar' ? 'الخادم غير متصل حالياً.' : 'Backend registration service is offline.',
      );
    }
    const res = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...input, language }),
    });
    setCurrentUser(res.user);
    await loadUserScopedData(res.user, true);
    showToast(language === 'ar' ? `تم إنشاء حسابك بنجاح، ${res.user.name}!` : `Account created for ${res.user.name}!`);
    return res.user;
  };

  const logout = async () => {
    if (apiConnected) {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } catch {
        // Proceed with client state clear
      }
    }
    setCurrentUser(null);
    await loadUserScopedData(null, apiConnected);
    showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح.' : 'Logged out successfully.');
    if (activeSection === 'admin' || activeSection === 'customerPortal') {
      setActiveSection('home');
    }
  };

  const isLoggedIn = !!currentUser;
  const isStaff = hasAnyRole(currentUser?.role, ADMIN_PANEL_ROLES);
  const isAdmin = hasAnyRole(currentUser?.role, ['admin', 'super_admin']);

  // Cart (persisted locally for seamless browsing)
  const [cart, setCart] = useState<CartItem[]>(() =>
    getStoredItem<CartItem[]>('cart_v2', []),
  );

  useEffect(() => {
    setStoredItem('cart_v2', cart);
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(
      language === 'ar'
        ? `تم إضافة "${product.nameAr}" للسلة.`
        : `Added "${product.nameEn}" to cart.`,
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist
  const [wishlist, setWishlist] = useState<Product[]>(() =>
    getStoredItem<Product[]>('wishlist_v2', []),
  );

  useEffect(() => {
    setStoredItem('wishlist_v2', wishlist);
  }, [wishlist]);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(language === 'ar' ? 'تمت الإزالة من المفضلة.' : 'Removed from wishlist.');
        return prev.filter((p) => p.id !== product.id);
      }
      showToast(language === 'ar' ? 'تمت الإضافة للمفضلة.' : 'Added to wishlist.');
      return [...prev, product];
    });
  };

  const isWishlisted = (productId: string) => wishlist.some((p) => p.id === productId);

  // Persisted Bridal Checklist, Groom Configurable Plan & Groom Budget
  const saveUserGroomPlan = useCallback(
    (updater: UserGroomPlanState | ((prev: UserGroomPlanState) => UserGroomPlanState)) => {
      const next =
        typeof updater === 'function' ? updater(userGroomPlanRef.current) : updater;
      userGroomPlanRef.current = next;
      setUserGroomPlan(next);
      if (!currentUser) {
        setStoredItem('user_groom_plan_v2', next);
      }
      if (apiConnected && currentUser) {
        void apiRequest<UserGroomPlanState>('/my/groom-plan', {
          method: 'PUT',
          body: JSON.stringify({
            selectedTierKey: next.selectedTierKey,
            targetBudgetEgp: next.targetBudgetEgp,
            slotSelections: next.slotSelections,
            excludedSlots: next.excludedSlots,
            customItems: next.customItems,
          }),
        }).catch(() => {});
      }
    },
    [apiConnected, currentUser],
  );

  const saveUserBridePlan = useCallback(
    (updater: UserBridePlanState | ((prev: UserBridePlanState) => UserBridePlanState)) => {
      const next =
        typeof updater === 'function' ? updater(userBridePlanRef.current) : updater;
      userBridePlanRef.current = next;
      setUserBridePlan(next);
      if (!currentUser) {
        setStoredItem('bride_checklist_v2', next.checkedItemIds);
        setStoredItem('user_bride_plan_v2', next);
      }
      if (apiConnected && currentUser) {
        void apiRequest<UserBridePlanState>('/my/bride-plan', {
          method: 'PUT',
          body: JSON.stringify({
            presetMode: next.presetMode,
            targetBudgetEgp: next.targetBudgetEgp,
            checkedItemIds: next.checkedItemIds,
            qtyOverrides: next.qtyOverrides,
            customItems: next.customItems,
          }),
        }).catch(() => {});
      }
    },
    [apiConnected, currentUser],
  );

  const brideChecklist = userBridePlan.checkedItemIds;

  const toggleBrideChecklistItem = useCallback(
    (itemId: string) => {
      saveUserBridePlan((prev) => ({
        ...prev,
        checkedItemIds: prev.checkedItemIds.includes(itemId)
          ? prev.checkedItemIds.filter((id) => id !== itemId)
          : [...prev.checkedItemIds, itemId],
      }));
    },
    [saveUserBridePlan],
  );

  const [groomBudgetTarget, setGroomBudgetTargetState] = useState<number>(() =>
    getStoredItem<number>('groom_budget_target_v2', 150000),
  );
  const [groomBudgetItems, setGroomBudgetItems] = useState<string[]>(() =>
    getStoredItem<string[]>('groom_budget_items_v2', ['groom-p1', 'groom-p2']),
  );

  const setGroomBudgetTarget = (target: number) => {
    setGroomBudgetTargetState(target);
    setStoredItem('groom_budget_target_v2', target);
  };

  useEffect(() => {
    setStoredItem('groom_budget_items_v2', groomBudgetItems);
  }, [groomBudgetItems]);

  const toggleGroomBudgetItem = (productId: string) => {
    setGroomBudgetItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  // Transactions
  const addFinishingInquiry = async (
    data: Omit<FinishingInquiry, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<FinishingInquiry>('/finishing-inquiries', {
        method: 'POST',
        body: JSON.stringify({
          customerName: data.customerName,
          phone: data.phone,
          governorate: data.governorate,
          areaSqm: data.areaSqm,
          roomsCount: data.roomsCount,
          bathroomsCount: data.bathroomsCount,
          finishingTier: data.finishingTier,
          budgetEGP: data.budgetEGP,
          notes: data.notes,
        }),
      });
      setFinishingInquiries((prev) => [created, ...prev]);
      showToast(
        language === 'ar'
          ? `تم استلام طلب المقايسة برقم مرجعي: ${created.id}`
          : `Finishing inquiry submitted (#${created.id})`,
      );
      return created.id;
    }

    const est = estimateFinishingRange(data.areaSqm, data.finishingTier);
    const id = 'fin-' + Date.now().toString().slice(-6);
    const created: FinishingInquiry = {
      ...data,
      id,
      userId: currentUser?.id,
      estimatedCostMin: est.min,
      estimatedCostMax: est.max,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setFinishingInquiries((prev) => {
      const next = [created, ...prev];
      setStoredItem('finishing_v2', next);
      return next;
    });
    showToast(
      language === 'ar' ? `تم حفظ المقايسة (#${id})` : `Finishing inquiry saved (#${id})`,
    );
    return id;
  };

  const updateFinishingStatus = async (id: string, status: FinishingInquiry['status']) => {
    if (apiConnected) {
      await apiRequest(`/admin/finishing-inquiries/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setFinishingInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    showToast(language === 'ar' ? `تم تحديث حالة الاستفسار (#${id})` : `Updated inquiry #${id}`);
  };

  const addWeddingBooking = async (
    data: Omit<WeddingBookingRequest, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<WeddingBookingRequest>('/wedding-bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: data.serviceId,
          customerName: data.customerName,
          phone: data.phone,
          weddingDate: data.weddingDate,
          guestCount: data.guestCount,
          governorate: data.governorate,
          notes: data.notes,
        }),
      });
      setWeddingBookings((prev) => [created, ...prev]);
      showToast(
        language === 'ar'
          ? `تم تسجيل طلب حجز الفرح المبدئي: ${created.id}`
          : `Wedding booking inquiry submitted (#${created.id})`,
      );
      return created.id;
    }

    const id = 'wed-' + Date.now().toString().slice(-6);
    const created: WeddingBookingRequest = {
      ...data,
      id,
      userId: currentUser?.id,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };
    setWeddingBookings((prev) => {
      const next = [created, ...prev];
      setStoredItem('bookings_v2', next);
      return next;
    });
    return id;
  };

  const updateWeddingBookingStatus = async (
    id: string,
    status: WeddingBookingRequest['status'],
  ) => {
    if (apiConnected) {
      await apiRequest(`/admin/wedding-bookings/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setWeddingBookings((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    showToast(language === 'ar' ? `تم تحديث حالة الحجز (#${id})` : `Updated wedding booking #${id}`);
  };

  const createOrder = async (orderData: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: Order['paymentMethod'];
  }): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...orderData,
          items: cart.map((it) => ({ productId: it.product.id, quantity: it.quantity })),
        }),
      });
      setOrders((prev) => [created, ...prev]);
      clearCart();
      showToast(
        language === 'ar'
          ? `تم تأكيد طلبك بنجاح برقم: ${created.id}`
          : `Order placed successfully (#${created.id})`,
      );
      return created.id;
    }

    const id = 'ord-' + Date.now().toString().slice(-6);
    const created: Order = {
      id,
      userId: currentUser?.id,
      customerName: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      items: [...cart],
      subtotal: cartTotal,
      deliveryFee: 0,
      total: cartTotal,
      paymentMethod: orderData.paymentMethod,
      status: 'received',
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => {
      const next = [created, ...prev];
      setStoredItem('orders_v2', next);
      return next;
    });
    clearCart();
    showToast(language === 'ar' ? `تم تأكيد الطلب (#${id})` : `Order confirmed (#${id})`);
    return id;
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    if (apiConnected) {
      await apiRequest(`/admin/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    showToast(language === 'ar' ? `تم تحديث حالة الطلب (#${id})` : `Updated order #${id}`);
  };

  const addFinancingApplication = async (
    appData: Omit<FinancingApplication, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<FinancingApplication>('/financing-applications', {
        method: 'POST',
        body: JSON.stringify({
          customerName: appData.customerName,
          phone: appData.phone,
          nationalId: appData.nationalId,
          monthlyIncome: appData.monthlyIncome,
          employer: appData.employer,
          governorate: appData.governorate,
          requestedAmount: appData.requestedAmount,
          tenureMonths: appData.tenureMonths,
          preferredProvider: appData.preferredProvider,
          associatedSection: appData.associatedSection,
        }),
      });
      setFinancingApplications((prev) => [created, ...prev]);
      showToast(
        language === 'ar'
          ? `تم إرسال طلب التقسيط بنجاح (#${created.id})`
          : `Financing application submitted (#${created.id})`,
      );
      return created.id;
    }

    const id = 'fnc-' + Date.now().toString().slice(-6);
    const created: FinancingApplication = {
      ...appData,
      id,
      userId: currentUser?.id,
      nationalId: maskNationalId(appData.nationalId),
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };
    setFinancingApplications((prev) => [created, ...prev]);
    return id;
  };

  const updateFinancingStatus = async (id: string, status: FinancingApplication['status']) => {
    if (apiConnected) {
      await apiRequest(`/admin/financing-applications/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setFinancingApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    showToast(language === 'ar' ? `تم تحديث طلب التمويل (#${id})` : `Updated financing #${id}`);
  };

  const addSupportCase = async (
    caseData: Omit<SupportCase, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<SupportCase>('/support-cases', {
        method: 'POST',
        body: JSON.stringify({
          applicantName: caseData.applicantName,
          nationalId: caseData.nationalId,
          phone: caseData.phone,
          governorate: caseData.governorate,
          address: caseData.address,
          category: caseData.category,
          caseDescription: caseData.caseDescription,
          urgencyLevel: caseData.urgencyLevel,
          documentsSubmitted: caseData.documentsSubmitted,
        }),
      });
      if (hasAnyRole(currentUser?.role, ['admin', 'super_admin', 'moderator'])) {
        setSupportCases((prev) => [created, ...prev]);
      }
      showToast(
        language === 'ar'
          ? `تم تسجيل طلب المساعدة بسرية تامة: ${created.id}`
          : `Support case registered confidentially (#${created.id})`,
      );
      return created.id;
    }

    const id = 'sup-' + Date.now().toString().slice(-6);
    showToast(language === 'ar' ? `تم التسجيل برقم كودي: ${id}` : `Registered (#${id})`);
    return id;
  };

  const updateSupportCaseStatus = async (id: string, status: SupportCase['status']) => {
    if (apiConnected) {
      await apiRequest(`/admin/support-cases/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    setSupportCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    showToast(language === 'ar' ? `تم تحديث حالة الملف (#${id})` : `Updated support case #${id}`);
  };

  const addSponsorshipInquiry = async (
    inquiry: Omit<SponsorshipInquiry, 'id' | 'createdAt' | 'status'>,
  ): Promise<string> => {
    if (apiConnected) {
      const created = await apiRequest<SponsorshipInquiry>('/sponsorship-inquiries', {
        method: 'POST',
        body: JSON.stringify(inquiry),
      });
      showToast(
        language === 'ar'
          ? `شكراً لك! تم استلام طلب المساهمة الكريمة برقم: ${created.id}`
          : `Sponsorship inquiry received (#${created.id})`,
      );
      return created.id;
    }
    const id = 'spn-' + Date.now().toString().slice(-6);
    showToast(language === 'ar' ? `تم استلام المساهمة (${id})` : `Saved (#${id})`);
    return id;
  };

  // Products Admin CRUD
  const addProduct = async (prod: Product) => {
    if (apiConnected) {
      const created = await apiRequest<Product>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(prod),
      });
      setProducts((prev) => [created, ...prev]);
    } else {
      setProducts((prev) => [prod, ...prev]);
    }
    showToast(language === 'ar' ? 'تمت إضافة المنتج بنجاح.' : 'Product added successfully.');
  };

  const updateProduct = async (prod: Product) => {
    if (apiConnected) {
      const updated = await apiRequest<Product>(`/admin/products/${encodeURIComponent(prod.id)}`, {
        method: 'PATCH',
        body: JSON.stringify(prod),
      });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
    }
    showToast(language === 'ar' ? 'تم تحديث بيانات المنتج.' : 'Product updated.');
  };

  const deleteProduct = async (id: string) => {
    if (apiConnected) {
      await apiRequest(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(language === 'ar' ? 'تم حذف المنتج.' : 'Product deleted.');
  };

  // Wedding Services Admin CRUD
  const addWeddingService = async (srv: WeddingServiceItem) => {
    if (apiConnected) {
      const created = await apiRequest<WeddingServiceItem>('/admin/wedding-services', {
        method: 'POST',
        body: JSON.stringify(srv),
      });
      setWeddingServices((prev) => [created, ...prev]);
    } else {
      setWeddingServices((prev) => [srv, ...prev]);
    }
    showToast(language === 'ar' ? 'تمت إضافة خدمة الفرح بنجاح.' : 'Wedding service added.');
  };

  const updateWeddingService = async (srv: WeddingServiceItem) => {
    if (apiConnected) {
      const updated = await apiRequest<WeddingServiceItem>(
        `/admin/wedding-services/${encodeURIComponent(srv.id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(srv),
        },
      );
      setWeddingServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      setWeddingServices((prev) => prev.map((s) => (s.id === srv.id ? srv : s)));
    }
    showToast(language === 'ar' ? 'تم تحديث خدمة الفرح.' : 'Wedding service updated.');
  };

  const deleteWeddingService = async (id: string) => {
    if (apiConnected) {
      await apiRequest(`/admin/wedding-services/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
    setWeddingServices((prev) => prev.filter((s) => s.id !== id));
    showToast(language === 'ar' ? 'تم حذف خدمة الفرح.' : 'Wedding service deleted.');
  };

  // CMS Article Creation
  const addArticle = async (
    articleData: Omit<Article, 'id' | 'viewCount' | 'publishedAt' | 'updatedAt' | 'authorName'>,
  ) => {
    if (apiConnected) {
      const created = await apiRequest<Article>('/admin/articles', {
        method: 'POST',
        body: JSON.stringify(articleData),
      });
      setArticles((prev) => [created, ...prev]);
    }
    showToast(language === 'ar' ? 'تم نشر المقال في الموسوعة.' : 'Article published to encyclopedia.');
  };

  const updateSettings = async (newSettings: PlatformSettings) => {
    if (apiConnected) {
      await apiRequest('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(newSettings),
      });
    }
    setSettings(newSettings);
    showToast(language === 'ar' ? 'تم حفظ إعدادات المنصة بنجاح.' : 'Settings saved successfully.');
  };

  // Stage 3: Unified Calculators & Wedding Budget Manager Methods
  const runAndSaveCalculator = useCallback(
    async (
      slug: string,
      inputs: Record<string, number | string | boolean>,
      savedTitle?: string,
    ): Promise<{ runId: string | null; output: CalculatorOutput }> => {
      if (apiConnected && currentUser) {
        const res = await apiRequest<{ runId: string | null; output: CalculatorOutput }>(
          `/calculators/${encodeURIComponent(slug)}/calculate`,
          {
            method: 'POST',
            body: JSON.stringify({ inputs, saveRun: true, savedTitle }),
          },
        );
        if (res.runId) {
          const updatedRuns = await apiRequest<CalculatorRunRecord[]>('/my/calculator-runs').catch(
            () => null,
          );
          if (updatedRuns) setCalculatorRuns(updatedRuns);
        }
        showToast(
          language === 'ar'
            ? 'تم حفظ نتيجة الحاسبة في سجل حسابك.'
            : 'Calculation saved to your account history.',
        );
        return res;
      }

      const output = runCalculator(slug, inputs);
      showToast(
        language === 'ar'
          ? 'تم التحديث — سجل الدخول لحفظ النتائج في ميزانيتك السحابية.'
          : 'Updated locally — sign in to save runs to your Wedding Budget.',
      );
      return { runId: null, output };
    },
    [apiConnected, currentUser, language, showToast],
  );

  const deleteCalculatorRun = useCallback(
    async (runId: string) => {
      if (apiConnected && currentUser) {
        await apiRequest(`/my/calculator-runs/${encodeURIComponent(runId)}`, { method: 'DELETE' });
      }
      setCalculatorRuns((prev) => prev.filter((r) => r.id !== runId));
      showToast(language === 'ar' ? 'تم حذف النتيجة المحفوظة.' : 'Saved run deleted.');
    },
    [apiConnected, currentUser, language, showToast],
  );

  const refreshBudgetOverview = useCallback(async () => {
    if (!apiConnected || !currentUser) return;
    const overview = await apiRequest<BudgetOverviewPayload>('/budget/overview');
    setBudgetOverview(overview);
  }, [apiConnected, currentUser]);

  const updateBudgetPlan = useCallback(
    async (patch: {
      titleAr?: string;
      titleEn?: string;
      totalBudgetLimit?: number;
      groomContributionTarget?: number;
      brideContributionTarget?: number;
      familySupportTarget?: number;
      emergencyReserveTarget?: number;
    }) => {
      const overview = await apiRequest<BudgetOverviewPayload>('/budget/plan', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setBudgetOverview(overview);
      showToast(language === 'ar' ? 'تم تحديث سقف وأهداف الميزانية.' : 'Budget limits updated.');
    },
    [language, showToast],
  );

  const upsertBudgetCategory = useCallback(
    async (input: {
      slug: string;
      nameAr: string;
      nameEn: string;
      ownerSide: BudgetOwnerSide;
      plannedAmount: number;
      limitAmount: number;
    }) => {
      const overview = await apiRequest<BudgetOverviewPayload>('/budget/categories', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setBudgetOverview(overview);
      showToast(language === 'ar' ? 'تم حفظ بند الميزانية.' : 'Budget category saved.');
    },
    [language, showToast],
  );

  const updateBudgetCategory = useCallback(
    async (
      categoryId: string,
      patch: {
        nameAr?: string;
        nameEn?: string;
        ownerSide?: BudgetOwnerSide;
        plannedAmount?: number;
        limitAmount?: number;
      },
    ) => {
      const overview = await apiRequest<BudgetOverviewPayload>(
        `/budget/categories/${encodeURIComponent(categoryId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setBudgetOverview(overview);
      showToast(language === 'ar' ? 'تم تحديث تخصيص البند.' : 'Category allocation updated.');
    },
    [language, showToast],
  );

  const createBudgetExpense = useCallback(
    async (input: {
      categoryId?: string;
      categorySlug?: string;
      title: string;
      vendorOrPayee?: string;
      amount: number;
      paymentType: BudgetPaymentType;
      status: BudgetExpenseStatus;
      paidBySide: BudgetOwnerSide;
      dueDate?: string | null;
      notes?: string;
    }) => {
      const overview = await apiRequest<BudgetOverviewPayload>('/budget/expenses', {
        method: 'POST',
        body: JSON.stringify({ ...input, sourceType: 'manual' }),
      });
      setBudgetOverview(overview);
      showToast(language === 'ar' ? 'تم تسجيل المصروف/الالتزام بنجاح.' : 'Expense recorded.');
    },
    [language, showToast],
  );

  const updateBudgetExpense = useCallback(
    async (
      expenseId: string,
      patch: {
        title?: string;
        amount?: number;
        status?: BudgetExpenseStatus;
        paymentType?: BudgetPaymentType;
        paidBySide?: BudgetOwnerSide;
        dueDate?: string | null;
        notes?: string | null;
      },
    ) => {
      const overview = await apiRequest<BudgetOverviewPayload>(
        `/budget/expenses/${encodeURIComponent(expenseId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setBudgetOverview(overview);
      showToast(language === 'ar' ? 'تم تحديث حالة البند.' : 'Expense status updated.');
    },
    [language, showToast],
  );

  const deleteBudgetExpense = useCallback(
    async (expenseId: string) => {
      const overview = await apiRequest<BudgetOverviewPayload>(
        `/budget/expenses/${encodeURIComponent(expenseId)}`,
        { method: 'DELETE' },
      );
      setBudgetOverview(overview);
      showToast(language === 'ar' ? 'تم حذف المصروف.' : 'Expense deleted.');
    },
    [language, showToast],
  );

  const importCalculatorToBudget = useCallback(
    async (input: {
      calculatorSlug: string;
      inputs: Record<string, number | string | boolean>;
      runId?: string;
      categorySlug?: string;
      title?: string;
      mode: 'set_planned' | 'add_planned_expense' | 'add_deposit';
      expenseAmount?: number;
      paidBySide?: BudgetOwnerSide;
    }): Promise<{ runId: string; output: CalculatorOutput }> => {
      const res = await apiRequest<{
        runId: string;
        output: CalculatorOutput;
        overview: BudgetOverviewPayload;
      }>('/budget/import-from-calculator', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setBudgetOverview(res.overview);
      const updatedRuns = await apiRequest<CalculatorRunRecord[]>('/my/calculator-runs').catch(() => null);
      if (updatedRuns) setCalculatorRuns(updatedRuns);
      showToast(
        language === 'ar'
          ? 'تم ربط نتيجة الحاسبة بميزانية زواجك دون تكرار.'
          : 'Linked calculation directly into your Wedding Budget Manager.',
      );
      return { runId: res.runId, output: res.output };
    },
    [language, showToast],
  );

  const syncBudgetTransactions = useCallback(async () => {
    const res = await apiRequest<{ syncedCount: number; overview: BudgetOverviewPayload }>(
      '/budget/sync-transactions',
      { method: 'POST' },
    );
    setBudgetOverview(res.overview);
    showToast(
      language === 'ar'
        ? res.syncedCount > 0
          ? `تمت مزامنة ${res.syncedCount} معاملات جديدة في الميزانية.`
          : 'جميع طلباتك وحجوزاتك متزامنة بالفعل بدون تكرار.'
        : res.syncedCount > 0
          ? `Synced ${res.syncedCount} new transactions cleanly.`
          : 'All orders & bookings are already synced with zero duplicates.',
    );
    return res.syncedCount;
  }, [language, showToast]);

  // Stage 4: Early Start & My Future Fund Actions
  const refreshEarlyStartOverview = useCallback(async () => {
    if (!apiConnected || !currentUser) return;
    const overview = await apiRequest<EarlyStartOverviewPayload>('/early-start/overview');
    setEarlyStartOverview(overview);
  }, [apiConnected, currentUser]);

  const updateEarlyStartProfile = useCallback(
    async (patch: {
      timeframePreset?: EarlyStartTimeframePreset;
      timeframeMonths?: number;
      expectedMarriageDate?: string | null;
      targetMarriageBudget?: number;
      initialCapital?: number;
      monthlySavingsTarget?: number;
      emergencyReserveTarget?: number;
      reminderFrequency?: EarlyStartReminderFrequency;
      personalNotes?: string | null;
    }) => {
      const overview = await apiRequest<EarlyStartOverviewPayload>('/early-start/profile', {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      setEarlyStartOverview(overview);
      showToast(
        language === 'ar' ? 'تم تحديث خطة البداية المبكرة بنجاح.' : 'Early Start timeline & goals saved.',
      );
    },
    [language, showToast],
  );

  const createSavingsGoal = useCallback(
    async (input: {
      goalType: SavingsGoalType;
      titleAr: string;
      titleEn: string;
      targetAmount: number;
      currentAmount?: number;
      monthlyContribution?: number;
      targetDate?: string | null;
      priority?: number;
    }): Promise<SavingsBadge[]> => {
      const res = await apiRequest<{
        goalId: string;
        newlyEarnedBadges: SavingsBadge[];
        overview: EarlyStartOverviewPayload;
      }>('/early-start/goals', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setEarlyStartOverview(res.overview);
      if (res.newlyEarnedBadges.length > 0) {
        const b = res.newlyEarnedBadges[0];
        showToast(
          language === 'ar'
            ? `مبروك! حصلت على شارة خاصة: ${b.titleAr}`
            : `Private badge unlocked: ${b.titleEn}`,
        );
      } else {
        showToast(
          language === 'ar'
            ? 'تمت إضافة هدف الادخار في صندوق مستقبلك.'
            : 'Savings goal added to My Future Fund.',
        );
      }
      return res.newlyEarnedBadges;
    },
    [language, showToast],
  );

  const patchSavingsGoal = useCallback(
    async (
      goalId: string,
      patch: {
        titleAr?: string;
        titleEn?: string;
        targetAmount?: number;
        monthlyContribution?: number;
        targetDate?: string | null;
        priority?: number;
      },
    ): Promise<SavingsBadge[]> => {
      const res = await apiRequest<{
        newlyEarnedBadges: SavingsBadge[];
        overview: EarlyStartOverviewPayload;
      }>(`/early-start/goals/${encodeURIComponent(goalId)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setEarlyStartOverview(res.overview);
      showToast(language === 'ar' ? 'تم تعديل هدف الادخار.' : 'Savings goal updated.');
      return res.newlyEarnedBadges;
    },
    [language, showToast],
  );

  const deleteSavingsGoal = useCallback(
    async (goalId: string) => {
      const overview = await apiRequest<EarlyStartOverviewPayload>(
        `/early-start/goals/${encodeURIComponent(goalId)}`,
        { method: 'DELETE' },
      );
      setEarlyStartOverview(overview);
      showToast(language === 'ar' ? 'تم حذف هدف الادخار.' : 'Savings goal deleted.');
    },
    [language, showToast],
  );

  const recordSavingsContribution = useCallback(
    async (
      goalId: string,
      input: {
        amount: number;
        contributionType?: 'deposit' | 'adjustment';
        contributionDate?: string;
        note?: string;
      },
    ): Promise<SavingsBadge[]> => {
      const res = await apiRequest<{
        overview: EarlyStartOverviewPayload;
        newlyEarnedBadges: SavingsBadge[];
        contributionId: string;
      }>(`/early-start/goals/${encodeURIComponent(goalId)}/contributions`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setEarlyStartOverview(res.overview);
      if (res.newlyEarnedBadges.length > 0) {
        const b = res.newlyEarnedBadges[0];
        showToast(
          language === 'ar'
            ? `إيداع ناجح + شارة خاصة جديدة: ${b.titleAr}`
            : `Deposit logged + Private Badge Unlocked: ${b.titleEn}`,
        );
      } else {
        showToast(
          language === 'ar'
            ? 'تم تسجيل الإيداع وتحديث سلسلة الالتزام.'
            : 'Contribution recorded and streak updated.',
        );
      }
      return res.newlyEarnedBadges;
    },
    [language, showToast],
  );

  const addEarlyStartMilestone = useCallback(
    async (input: {
      track: EarlyStartMilestoneTrack;
      titleAr: string;
      titleEn: string;
      targetMonthsOut?: number;
    }) => {
      const overview = await apiRequest<EarlyStartOverviewPayload>('/early-start/milestones', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setEarlyStartOverview(overview);
      showToast(language === 'ar' ? 'تمت إضافة خطوة تحضير جديدة.' : 'Preparation milestone added.');
    },
    [language, showToast],
  );

  const toggleEarlyStartMilestone = useCallback(
    async (milestoneId: string, completed: boolean) => {
      const overview = await apiRequest<EarlyStartOverviewPayload>(
        `/early-start/milestones/${encodeURIComponent(milestoneId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ completed }),
        },
      );
      setEarlyStartOverview(overview);
      showToast(
        language === 'ar'
          ? completed
            ? 'أحسنت! تم إنجاز المرحلة.'
            : 'تمت إعادة فتح المرحلة.'
          : completed
            ? 'Milestone marked complete.'
            : 'Milestone reopened.',
      );
    },
    [language, showToast],
  );

  const deleteEarlyStartMilestone = useCallback(
    async (milestoneId: string) => {
      const overview = await apiRequest<EarlyStartOverviewPayload>(
        `/early-start/milestones/${encodeURIComponent(milestoneId)}`,
        { method: 'DELETE' },
      );
      setEarlyStartOverview(overview);
      showToast(language === 'ar' ? 'تم حذف المرحلة.' : 'Milestone deleted.');
    },
    [language, showToast],
  );

  const toggleAcademyLessonComplete = useCallback(
    async (slug: string, completed = true): Promise<SavingsBadge[]> => {
      const res = await apiRequest<{
        newlyEarnedBadges: SavingsBadge[];
        completedSlugs: string[];
        overview: EarlyStartOverviewPayload;
      }>(`/early-start/academy/${encodeURIComponent(slug)}/complete`, {
        method: 'POST',
        body: JSON.stringify({ completed }),
      });
      setEarlyStartOverview(res.overview);
      if (res.newlyEarnedBadges.length > 0) {
        const b = res.newlyEarnedBadges[0];
        showToast(
          language === 'ar'
            ? `تهانينا! شارة جديدة من الأكاديمية: ${b.titleAr}`
            : `Academy Badge Unlocked: ${b.titleEn}`,
        );
      } else {
        showToast(
          language === 'ar'
            ? completed
              ? 'تم تسجيل إتمام الدرس في ملفك الشخصي.'
              : 'تم إلغاء علامة إتمام الدرس.'
            : completed
              ? 'Lesson marked completed.'
              : 'Lesson completion cleared.',
        );
      }
      return res.newlyEarnedBadges;
    },
    [language, showToast],
  );

  // Stage 5: Lifecycle Onboarding, Engagement, Journey Planner & Shared Couple Workspace Actions
  const refreshMyHub = useCallback(async () => {
    if (!apiConnected || !currentUser) return;
    const hub = await apiRequest<MyGawazInnHubPayload>('/my/hub');
    setMyHubPayload(hub);
  }, [apiConnected, currentUser]);

  const transitionLifecycleStage = useCallback(
    async (targetStage: LifecycleStage, note?: string) => {
      const res = await apiRequest<{
        user: User;
        currentStage: LifecycleStage;
        hub: MyGawazInnHubPayload;
      }>('/onboarding/stage', {
        method: 'POST',
        body: JSON.stringify({ targetStage, note }),
      });
      setCurrentUser(res.user);
      setMyHubPayload(res.hub);
      showToast(
        language === 'ar'
          ? 'تم تحديث مرحلتك بنجاح مع الحفاظ الكامل على كل بياناتك السابقة.'
          : 'Lifecycle stage updated with all existing records preserved.',
      );
    },
    [language, showToast],
  );

  const updateEngagementPlan = useCallback(
    async (patch: {
      engagementDate?: string | null;
      targetBudget?: number;
      shabkaBudget?: number;
      venueBudget?: number;
      attireBudget?: number;
      hospitalityBudget?: number;
      venueName?: string | null;
      venueStatus?: EngagementVenueStatus;
      ringNotes?: string | null;
      familyNotes?: string | null;
    }) => {
      const eng = await apiRequest<EngagementOverviewPayload>('/engagement/plan', {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      setMyHubPayload((prev) => (prev ? { ...prev, engagement: eng } : prev));
      showToast(language === 'ar' ? 'تم حفظ خطة وميزانية الخطوبة.' : 'Engagement plan saved.');
    },
    [language, showToast],
  );

  const createEngagementItem = useCallback(
    async (input: {
      itemType: EngagementItemType;
      titleAr: string;
      titleEn: string;
      ownerSide?: 'groom' | 'bride' | 'shared';
      priority?: 'high' | 'medium' | 'low';
      estimatedCost?: number;
      actualCost?: number;
      guestCount?: number;
      status?: EngagementItemStatus;
      notes?: string;
    }) => {
      const res = await apiRequest<{ itemId: string; overview: EngagementOverviewPayload }>(
        '/engagement/items',
        { method: 'POST', body: JSON.stringify(input) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, engagement: res.overview } : prev));
      showToast(language === 'ar' ? 'تمت إضافة العنصر لخطة الخطوبة.' : 'Engagement item added.');
    },
    [language, showToast],
  );

  const patchEngagementItem = useCallback(
    async (
      itemId: string,
      patch: {
        titleAr?: string;
        titleEn?: string;
        ownerSide?: 'groom' | 'bride' | 'shared';
        priority?: 'high' | 'medium' | 'low';
        estimatedCost?: number;
        actualCost?: number;
        guestCount?: number;
        status?: EngagementItemStatus;
        notes?: string | null;
      },
    ) => {
      const overview = await apiRequest<EngagementOverviewPayload>(
        `/engagement/items/${encodeURIComponent(itemId)}`,
        { method: 'PATCH', body: JSON.stringify(patch) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, engagement: overview } : prev));
    },
    [],
  );

  const deleteEngagementItem = useCallback(
    async (itemId: string) => {
      const overview = await apiRequest<EngagementOverviewPayload>(
        `/engagement/items/${encodeURIComponent(itemId)}`,
        { method: 'DELETE' },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, engagement: overview } : prev));
      showToast(language === 'ar' ? 'تم حذف عنصر الخطوبة.' : 'Engagement item deleted.');
    },
    [language, showToast],
  );

  const createJourneyTask = useCallback(
    async (input: {
      phase: JourneyPhaseKey;
      titleAr: string;
      titleEn: string;
      description?: string;
      ownerSide?: 'groom' | 'bride' | 'shared';
      dueDate?: string | null;
      reminderDate?: string | null;
      dependsOnTaskId?: string | null;
      priority?: JourneyTaskPriority;
      estimatedCost?: number;
      attachmentLabel?: string;
    }) => {
      const res = await apiRequest<{ taskId: string; overview: JourneyOverviewPayload }>(
        '/journey/tasks',
        { method: 'POST', body: JSON.stringify(input) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, journey: res.overview } : prev));
      showToast(language === 'ar' ? 'تمت إضافة مهمة جديدة لمخطط الرحلة.' : 'Journey task created.');
    },
    [language, showToast],
  );

  const patchJourneyTask = useCallback(
    async (
      taskId: string,
      patch: {
        phase?: JourneyPhaseKey;
        titleAr?: string;
        titleEn?: string;
        description?: string | null;
        ownerSide?: 'groom' | 'bride' | 'shared';
        dueDate?: string | null;
        reminderDate?: string | null;
        dependsOnTaskId?: string | null;
        status?: JourneyTaskStatus;
        priority?: JourneyTaskPriority;
        estimatedCost?: number;
        attachmentLabel?: string | null;
      },
    ): Promise<string | null> => {
      const res = await apiRequest<{
        dependencyWarning: string | null;
        overview: JourneyOverviewPayload;
      }>(`/journey/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setMyHubPayload((prev) => (prev ? { ...prev, journey: res.overview } : prev));
      if (res.dependencyWarning) {
        showToast(
          language === 'ar'
            ? `تنبيه اعتمادية: ${res.dependencyWarning}`
            : `Dependency notice: ${res.dependencyWarning}`,
        );
      }
      return res.dependencyWarning;
    },
    [language, showToast],
  );

  const deleteJourneyTask = useCallback(
    async (taskId: string) => {
      const overview = await apiRequest<JourneyOverviewPayload>(
        `/journey/tasks/${encodeURIComponent(taskId)}`,
        { method: 'DELETE' },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, journey: overview } : prev));
      showToast(language === 'ar' ? 'تم حذف المهمة.' : 'Task deleted.');
    },
    [language, showToast],
  );

  const addJourneyTaskComment = useCallback(
    async (taskId: string, body: string) => {
      const overview = await apiRequest<JourneyOverviewPayload>(
        `/journey/tasks/${encodeURIComponent(taskId)}/comments`,
        { method: 'POST', body: JSON.stringify({ body }) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, journey: overview } : prev));
      showToast(language === 'ar' ? 'تمت إضافة التعليق على المهمة.' : 'Task comment posted.');
    },
    [language, showToast],
  );

  const updateWorkspaceMeta = useCallback(
    async (patch: {
      nameAr?: string;
      nameEn?: string;
      engagementDate?: string | null;
      weddingDate?: string | null;
    }) => {
      const ws = await apiRequest<CoupleWorkspacePayload>('/workspace', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setMyHubPayload((prev) => (prev ? { ...prev, workspace: ws } : prev));
      showToast(language === 'ar' ? 'تم تحديث بيانات المساحة المشتركة.' : 'Workspace settings updated.');
    },
    [language, showToast],
  );

  const inviteWorkspacePartner = useCallback(
    async (input: {
      inviteeIdentifier: string;
      proposedRole?: 'partner' | 'planner_guest';
      proposedSide?: 'groom' | 'bride' | 'partner';
      permissions?: Partial<WorkspacePermissions>;
    }): Promise<string> => {
      const res = await apiRequest<{ inviteToken: string; workspace: CoupleWorkspacePayload }>(
        '/workspace/invite',
        { method: 'POST', body: JSON.stringify(input) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, workspace: res.workspace } : prev));
      showToast(
        language === 'ar'
          ? 'تم إرسال دعوة المساحة المشتركة برمز تحقق خاص.'
          : 'Workspace invitation sent with dedicated invite token.',
      );
      return res.inviteToken;
    },
    [language, showToast],
  );

  const respondWorkspaceInvitation = useCallback(
    async (token: string, action: 'accept' | 'decline') => {
      await apiRequest<CoupleWorkspacePayload>(
        `/workspace/invitations/${encodeURIComponent(token)}/${action}`,
        { method: 'POST' },
      );
      await refreshMyHub();
      showToast(
        language === 'ar'
          ? action === 'accept'
            ? 'انضممت إلى مساحة الزوجين المشتركة بنجاح.'
            : 'تم رفض الدعوة.'
          : action === 'accept'
            ? 'Joined Shared Couple Workspace.'
            : 'Invitation declined.',
      );
    },
    [language, refreshMyHub, showToast],
  );

  const updateWorkspaceMemberPermissions = useCallback(
    async (memberId: string, permissions: WorkspacePermissions) => {
      const ws = await apiRequest<CoupleWorkspacePayload>(
        `/workspace/members/${encodeURIComponent(memberId)}`,
        { method: 'PATCH', body: JSON.stringify(permissions) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, workspace: ws } : prev));
      showToast(language === 'ar' ? 'تم تحديث صلاحيات الشريك.' : 'Partner permissions updated.');
    },
    [language, showToast],
  );

  const revokeWorkspaceMember = useCallback(
    async (memberId: string) => {
      const ws = await apiRequest<CoupleWorkspacePayload>(
        `/workspace/members/${encodeURIComponent(memberId)}`,
        { method: 'DELETE' },
      );
      await refreshMyHub();
      setMyHubPayload((prev) => (prev ? { ...prev, workspace: ws } : prev));
      showToast(language === 'ar' ? 'تم إلغاء صلاحية الوصول للمساحة المشتركة.' : 'Workspace access revoked.');
    },
    [language, refreshMyHub, showToast],
  );

  const createWorkspaceApproval = useCallback(
    async (input: { title: string; category: string; estimatedAmount: number }) => {
      const ws = await apiRequest<CoupleWorkspacePayload>('/workspace/approvals', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setMyHubPayload((prev) => (prev ? { ...prev, workspace: ws } : prev));
      showToast(language === 'ar' ? 'تم إرسال طلب اعتماد الشراء للمساحة المشتركة.' : 'Purchase approval requested.');
    },
    [language, showToast],
  );

  const decideWorkspaceApproval = useCallback(
    async (
      approvalId: string,
      status: 'approved' | 'changes_requested' | 'rejected',
      reviewerNote?: string,
    ) => {
      const ws = await apiRequest<CoupleWorkspacePayload>(
        `/workspace/approvals/${encodeURIComponent(approvalId)}`,
        { method: 'PATCH', body: JSON.stringify({ status, reviewerNote }) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, workspace: ws } : prev));
      showToast(language === 'ar' ? 'تم تسجيل القرار في سجل الموافقات.' : 'Approval decision saved.');
    },
    [language, showToast],
  );

  const createUserDocument = useCallback(
    async (input: {
      docType: UserDocumentType;
      title: string;
      fileName: string;
      mimeType?: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp' | 'text/plain';
      sizeBytes?: number;
      referenceCode?: string;
      notes?: string;
      isSharedWithPartner?: boolean;
    }) => {
      const res = await apiRequest<{ document: UserDocumentItem; documents: UserDocumentItem[] }>(
        '/my/documents',
        { method: 'POST', body: JSON.stringify(input) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, documents: res.documents } : prev));
      showToast(language === 'ar' ? 'تمت أرشفة المستند بأمان.' : 'Document stored cleanly.');
    },
    [language, showToast],
  );

  const deleteUserDocument = useCallback(
    async (docId: string) => {
      const docs = await apiRequest<UserDocumentItem[]>(
        `/my/documents/${encodeURIComponent(docId)}`,
        { method: 'DELETE' },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, documents: docs } : prev));
      showToast(language === 'ar' ? 'تم حذف المستند.' : 'Document deleted.');
    },
    [language, showToast],
  );

  const createUserWarranty = useCallback(
    async (input: {
      itemName: string;
      category: string;
      providerName: string;
      modelSerial?: string;
      startDate: string;
      expiryDate: string;
      notes?: string;
    }) => {
      const warranties = await apiRequest<UserWarrantyItem[]>('/my/warranties', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setMyHubPayload((prev) => (prev ? { ...prev, warranties } : prev));
      showToast(language === 'ar' ? 'تم تسجيل شهادة الضمان.' : 'Warranty registered.');
    },
    [language, showToast],
  );

  const deleteUserWarranty = useCallback(
    async (warrantyId: string) => {
      const warranties = await apiRequest<UserWarrantyItem[]>(
        `/my/warranties/${encodeURIComponent(warrantyId)}`,
        { method: 'DELETE' },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, warranties } : prev));
      showToast(language === 'ar' ? 'تم حذف الضمان.' : 'Warranty removed.');
    },
    [language, showToast],
  );

  const createUserAppointment = useCallback(
    async (input: {
      title: string;
      appointmentType: UserAppointmentType;
      providerName: string;
      locationText: string;
      scheduledAt: string;
      notes?: string;
    }) => {
      const appointments = await apiRequest<UserAppointmentItem[]>('/my/appointments', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setMyHubPayload((prev) => (prev ? { ...prev, appointments } : prev));
      showToast(language === 'ar' ? 'تم تسجيل الموعد.' : 'Appointment scheduled.');
    },
    [language, showToast],
  );

  const patchUserAppointment = useCallback(
    async (
      appointmentId: string,
      patch: { status?: UserAppointmentStatus; scheduledAt?: string; notes?: string | null },
    ) => {
      const appointments = await apiRequest<UserAppointmentItem[]>(
        `/my/appointments/${encodeURIComponent(appointmentId)}`,
        { method: 'PATCH', body: JSON.stringify(patch) },
      );
      setMyHubPayload((prev) => (prev ? { ...prev, appointments } : prev));
    },
    [],
  );

  const markNotificationRead = useCallback(async (notifId: string) => {
    const notifications = await apiRequest<UserNotification[]>(
      `/my/notifications/${encodeURIComponent(notifId)}/read`,
      { method: 'POST' },
    );
    setMyHubPayload((prev) =>
      prev
        ? {
            ...prev,
            notifications,
            unreadNotificationsCount: notifications.filter((n) => !n.isRead).length,
          }
        : prev,
    );
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const notifications = await apiRequest<UserNotification[]>('/my/notifications/read-all', {
      method: 'POST',
    });
    setMyHubPayload((prev) =>
      prev
        ? {
            ...prev,
            notifications,
            unreadNotificationsCount: 0,
          }
        : prev,
    );
  }, []);

  // Stage 6 Callbacks: Compare Tray, Multi-List Shopping Baskets & Price Alerts
  const toggleCompareProduct = useCallback(
    (productId: string) => {
      setCompareProductIds((prev) => {
        if (prev.includes(productId)) {
          return prev.filter((id) => id !== productId);
        }
        if (prev.length >= 4) {
          showToast(
            language === 'ar'
              ? 'الحد الأقصى للمقارنة هو 4 منتجات معاً.'
              : 'Compare tray supports up to 4 products.',
          );
          return prev;
        }
        return [...prev, productId];
      });
    },
    [language, showToast],
  );

  const clearCompareProducts = useCallback(() => {
    setCompareProductIds([]);
  }, []);

  const refreshShoppingAndAlerts = useCallback(async () => {
    if (!apiConnected || !currentUser) return;
    const [lists, alerts] = await Promise.all([
      apiRequest<ShoppingList[]>('/shopping-lists').catch(() => []),
      apiRequest<PriceAlert[]>('/price-alerts').catch(() => []),
    ]);
    setShoppingLists(lists);
    setPriceAlerts(alerts);
  }, [apiConnected, currentUser]);

  const createShoppingList = useCallback(
    async (input: {
      titleAr: string;
      titleEn: string;
      listType?: ShoppingListType;
      isSharedWithPartner?: boolean;
      budgetTarget?: number;
      notes?: string;
    }) => {
      const res = await apiRequest<{ listId: string; lists: ShoppingList[] }>('/shopping-lists', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setShoppingLists(res.lists);
      showToast(language === 'ar' ? 'تم إنشاء سلة تسوق جديدة.' : 'Shopping basket created.');
      return res.listId;
    },
    [language, showToast],
  );

  const updateShoppingList = useCallback(
    async (
      listId: string,
      patch: {
        titleAr?: string;
        titleEn?: string;
        listType?: ShoppingListType;
        isSharedWithPartner?: boolean;
        budgetTarget?: number;
        notes?: string | null;
      },
    ) => {
      const lists = await apiRequest<ShoppingList[]>(
        `/shopping-lists/${encodeURIComponent(listId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setShoppingLists(lists);
      showToast(language === 'ar' ? 'تم تحديث السلة بنجاح.' : 'Shopping basket updated.');
    },
    [language, showToast],
  );

  const deleteShoppingList = useCallback(
    async (listId: string) => {
      const lists = await apiRequest<ShoppingList[]>(
        `/shopping-lists/${encodeURIComponent(listId)}`,
        { method: 'DELETE' },
      );
      setShoppingLists(lists);
      showToast(language === 'ar' ? 'تم حذف سلة التسوق.' : 'Shopping basket removed.');
    },
    [language, showToast],
  );

  const addShoppingListItem = useCallback(
    async (
      listId: string,
      input: {
        productId?: string | null;
        customTitle: string;
        categoryLabel?: string;
        quantity?: number;
        targetUnitPrice?: number;
        preferredMerchant?: string;
        status?: ShoppingListItemStatus;
        priority?: 'high' | 'medium' | 'low';
        notes?: string;
      },
    ) => {
      const res = await apiRequest<{ itemId: string; lists: ShoppingList[] }>(
        `/shopping-lists/${encodeURIComponent(listId)}/items`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
      setShoppingLists(res.lists);
      showToast(language === 'ar' ? 'تمت إضافة الصنف لسلة التسوق.' : 'Item added to shopping basket.');
    },
    [language, showToast],
  );

  const updateShoppingListItem = useCallback(
    async (
      itemId: string,
      patch: {
        quantity?: number;
        targetUnitPrice?: number;
        preferredMerchant?: string | null;
        status?: ShoppingListItemStatus;
        priority?: 'high' | 'medium' | 'low';
        notes?: string | null;
      },
    ) => {
      const lists = await apiRequest<ShoppingList[]>(
        `/shopping-list-items/${encodeURIComponent(itemId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setShoppingLists(lists);
    },
    [],
  );

  const deleteShoppingListItem = useCallback(async (itemId: string) => {
    const lists = await apiRequest<ShoppingList[]>(
      `/shopping-list-items/${encodeURIComponent(itemId)}`,
      { method: 'DELETE' },
    );
    setShoppingLists(lists);
  }, []);

  const upsertPriceAlert = useCallback(
    async (productId: string, targetPrice: number) => {
      const res = await apiRequest<{ alert: PriceAlert; alerts: PriceAlert[] }>('/price-alerts', {
        method: 'POST',
        body: JSON.stringify({ productId, targetPrice }),
      });
      setPriceAlerts(res.alerts);
      showToast(
        res.alert.status === 'triggered'
          ? language === 'ar'
            ? 'السعر الحالي يطابق هدفك بالفعل! تم تفعيل التنبيه.'
            : 'Current catalog price already meets your target! Alert triggered.'
          : language === 'ar'
            ? 'تم حفظ تنبيه السعر بنجاح.'
            : 'Price alert saved.',
      );
      return res.alert;
    },
    [language, showToast],
  );

  const updatePriceAlert = useCallback(
    async (alertId: string, patch: { targetPrice?: number; status?: PriceAlertStatus }) => {
      const alerts = await apiRequest<PriceAlert[]>(
        `/price-alerts/${encodeURIComponent(alertId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setPriceAlerts(alerts);
    },
    [],
  );

  const deletePriceAlert = useCallback(
    async (alertId: string) => {
      const alerts = await apiRequest<PriceAlert[]>(
        `/price-alerts/${encodeURIComponent(alertId)}`,
        { method: 'DELETE' },
      );
      setPriceAlerts(alerts);
      showToast(language === 'ar' ? 'تم حذف تنبيه السعر.' : 'Price alert deleted.');
    },
    [language, showToast],
  );

  // Stage 7: Vendor Marketplace, Subscriptions, Reviews & Admin Verification
  const refreshVendors = useCallback(
    async (filters?: Record<string, string>) => {
      if (!apiConnected) return vendors;
      const qs = filters
        ? new URLSearchParams(
            Object.entries(filters).filter(([, v]) => Boolean(v) && v !== 'all'),
          ).toString()
        : '';
      const list = await apiRequest<VendorListing[]>(`/vendors${qs ? `?${qs}` : ''}`);
      if (!qs) {
        setVendors(list);
      }
      return list;
    },
    [apiConnected, vendors],
  );

  const registerVendor = useCallback(
    async (input: {
      businessNameAr: string;
      businessNameEn: string;
      primaryCategorySlug: string;
      governorateSlug: string;
      citySlug?: string | null;
      serviceAreas?: string[];
      addressAr: string;
      addressEn: string;
      phone: string;
      whatsapp?: string;
      email?: string;
      websiteUrl?: string;
      bioAr: string;
      bioEn: string;
      coverImage?: string;
      priceTier?: 'economy' | 'mid' | 'luxury';
      startingPriceEgp?: number;
      yearsExperience?: number;
      verificationDocs?: string[];
    }) => {
      const created = await apiRequest<VendorListing>('/vendors/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setVendors((prev) => [created, ...prev.filter((v) => v.id !== created.id)]);
      showToast(
        language === 'ar'
          ? 'تم تسجيل ملف النشاط التجاري بحالة "مسجل" وعلى الباقة المجانية.'
          : 'Business profile registered with "Registered" status on the Free plan.',
      );
      return created;
    },
    [language, showToast],
  );

  const submitVendorReview = useCallback(
    async (slugOrId: string, input: { rating: number; title: string; comment: string }) => {
      const res = await apiRequest<{ review: VendorReview; vendor: VendorListing }>(
        `/vendors/${encodeURIComponent(slugOrId)}/reviews`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
      setVendors((prev) => prev.map((v) => (v.id === res.vendor.id ? { ...v, ...res.vendor } : v)));
      showToast(
        language === 'ar'
          ? 'شكراً لمشاركتك تقييمك الحقيقي بنجاح!'
          : 'Thank you! Your authentic review has been published.',
      );
      return res;
    },
    [language, showToast],
  );

  const adminVerifyVendor = useCallback(
    async (
      vendorId: string,
      input: {
        verificationStatus: VendorVerificationStatus;
        verificationDocs?: string[];
        verificationNotes?: string | null;
      },
    ) => {
      const updated = await apiRequest<VendorListing>(
        `/admin/vendors/${encodeURIComponent(vendorId)}/verify`,
        {
          method: 'PATCH',
          body: JSON.stringify(input),
        },
      );
      setAdminVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setVendors((prev) => {
        if (updated.verificationStatus === 'rejected') {
          return prev.filter((v) => v.id !== updated.id);
        }
        const exists = prev.some((v) => v.id === updated.id);
        return exists ? prev.map((v) => (v.id === updated.id ? updated : v)) : [updated, ...prev];
      });
      showToast(
        language === 'ar'
          ? `تم تحديث حالة التوثيق إلى "${updated.verificationStatus}".`
          : `Vendor verification status updated to "${updated.verificationStatus}".`,
      );
      return updated;
    },
    [language, showToast],
  );

  const adminUpdateSubscriptionPlan = useCallback(
    async (
      planId: string,
      patch: {
        monthlyPriceEgp?: number;
        annualPriceEgp?: number;
        maxServices?: number;
        maxPromotions?: number;
        maxPortfolioItems?: number;
        leadPriorityBoost?: number;
        isActive?: boolean;
      },
    ) => {
      const plans = await apiRequest<SubscriptionPlan[]>(
        `/admin/subscription-plans/${encodeURIComponent(planId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setSubscriptionPlans(plans);
      showToast(
        language === 'ar'
          ? 'تم حفظ حدود وتسعير الباقة التجارية.'
          : 'Commercial subscription plan limits and pricing updated.',
      );
      return plans;
    },
    [language, showToast],
  );

  // Stage 8 Actions: RFQ Engine & Marketplace Slot Appointments
  const refreshRfqAndAppointments = useCallback(async () => {
    if (!apiConnected || !currentUser) return;
    const [rfqs, apts] = await Promise.all([
      apiRequest<RfqRequest[]>('/rfq').catch(() => []),
      apiRequest<MarketplaceAppointment[]>('/appointments').catch(() => []),
    ]);
    setMyRfqs(rfqs);
    setMarketplaceAppointments(apts);
  }, [apiConnected, currentUser]);

  const createRfqRequest = useCallback(
    async (input: {
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
    }) => {
      const created = await apiRequest<RfqRequest>('/rfq', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setMyRfqs((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      showToast(
        language === 'ar'
          ? `تم إرسال طلب التسعير ومطابقة ${created.invitationsCount ?? 0} مزود خدمة.`
          : `RFQ sent & matched with ${created.invitationsCount ?? 0} qualified vendors.`,
      );
      return created;
    },
    [language, showToast],
  );

  const decideRfqQuote = useCallback(
    async (
      rfqId: string,
      quoteId: string,
      input: { decision: 'accept' | 'reject'; customerDecisionNote?: string | null; linkToBudget?: boolean },
    ) => {
      const result = await apiRequest<{ rfq: RfqRequest; linkedBudgetExpenseId: string | null }>(
        `/rfq/${encodeURIComponent(rfqId)}/quotes/${encodeURIComponent(quoteId)}/decide`,
        {
          method: 'POST',
          body: JSON.stringify({
            decision: input.decision,
            customerDecisionNote: input.customerDecisionNote ?? null,
            linkToBudget: input.linkToBudget ?? true,
          }),
        },
      );
      setMyRfqs((prev) => prev.map((r) => (r.id === result.rfq.id ? result.rfq : r)));
      if (input.decision === 'accept') {
        const updatedBudget = await apiRequest<BudgetOverviewPayload>('/budget/overview').catch(() => null);
        if (updatedBudget) setBudgetOverview(updatedBudget);
      }
      showToast(
        input.decision === 'accept'
          ? language === 'ar'
            ? 'تم اعتماد عرض السعر وربطه مباشرةً بميزانية الزواج!'
            : 'Quote accepted and synced directly into Wedding Budget Manager!'
          : language === 'ar'
            ? 'تم تحديث حالة عرض السعر.'
            : 'Quote decision updated.',
      );
      return result;
    },
    [language, showToast],
  );

  const postRfqMessage = useCallback(
    async (rfqId: string, body: string, vendorId?: string) => {
      const res = await apiRequest<{ rfq: RfqRequest }>(
        `/rfq/${encodeURIComponent(rfqId)}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body, vendorId }),
        },
      );
      setMyRfqs((prev) => prev.map((r) => (r.id === res.rfq.id ? res.rfq : r)));
      return res.rfq;
    },
    [],
  );

  const createMarketplaceAppointment = useCallback(
    async (input: {
      vendorId: string;
      serviceId?: string | null;
      rfqId?: string | null;
      appointmentType: MarketplaceAppointmentType;
      slotDate: string;
      slotTime: string;
      durationMinutes?: number;
      customerPhone: string;
      customerNotes?: string | null;
    }) => {
      const created = await apiRequest<MarketplaceAppointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setMarketplaceAppointments((prev) => [...prev.filter((a) => a.id !== created.id), created]);
      showToast(
        language === 'ar'
          ? `تم إرسال طلب حجز الموعد (${created.slotDate} ${created.slotTime}) للشريك للتأكيد.`
          : `Slot appointment requested (${created.slotDate} ${created.slotTime}). Awaiting vendor confirmation.`,
      );
      return created;
    },
    [language, showToast],
  );

  const patchMarketplaceAppointment = useCallback(
    async (
      aptId: string,
      patch: {
        status?: MarketplaceAppointmentStatus;
        slotDate?: string;
        slotTime?: string;
        customerNotes?: string | null;
        vendorResponseNote?: string | null;
      },
    ) => {
      const updated = await apiRequest<MarketplaceAppointment>(
        `/appointments/${encodeURIComponent(aptId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setMarketplaceAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(
        language === 'ar' ? 'تم تحديث بيانات الموعد.' : 'Appointment status updated.',
      );
      return updated;
    },
    [language, showToast],
  );

  // Stage 9: Stories, Community Q&A, Experts & Full Admin Analytics/Moderation Actions
  const refreshStage9Public = useCallback(async () => {
    if (!apiConnected) return;
    const [sList, qList, expList, myStories] = await Promise.all([
      apiRequest<RealWeddingStory[]>('/stories').catch(() => null),
      apiRequest<CommunityQuestion[]>('/community/questions').catch(() => null),
      apiRequest<ExpertProfile[]>('/experts').catch(() => null),
      currentUser ? apiRequest<RealWeddingStory[]>('/stories?mine=1').catch(() => null) : Promise.resolve(null),
    ]);
    if (sList) setRealWeddings(sList);
    if (qList) setCommunityQuestions(qList);
    if (expList) setVerifiedExperts(expList);
    if (myStories) setMySubmittedStories(myStories);
  }, [apiConnected, currentUser]);

  const submitWeddingStory = useCallback(
    async (input: {
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
      photos?: string[];
    }) => {
      const created = await apiRequest<RealWeddingStory>('/stories', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setMySubmittedStories((prev) => [created, ...prev]);
      showToast(
        language === 'ar'
          ? 'تم استلام قصتك وباتت قيد مراجعة المشرف قبل النشر العام.'
          : 'Story submitted! It stays pending moderator review before public listing.',
      );
      return created;
    },
    [language, showToast],
  );

  const createCommunityQuestion = useCallback(
    async (input: {
      categorySlug: CommunityCategorySlug;
      titleAr: string;
      titleEn?: string;
      bodyAr: string;
      bodyEn?: string;
      tags?: string[];
    }) => {
      const created = await apiRequest<CommunityQuestion>('/community/questions', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setCommunityQuestions((prev) => [created, ...prev]);
      showToast(language === 'ar' ? 'تم نشر سؤالك في مجتمع جواز إن.' : 'Question published to Community Q&A.');
      return created;
    },
    [language, showToast],
  );

  const postCommunityAnswer = useCallback(
    async (questionId: string, bodyAr: string, bodyEn?: string) => {
      const created = await apiRequest<CommunityAnswer>(
        `/community/questions/${encodeURIComponent(questionId)}/answers`,
        {
          method: 'POST',
          body: JSON.stringify({ bodyAr, bodyEn }),
        },
      );
      setCommunityQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                answersCount: q.answersCount + 1,
                answers: [...(q.answers || []), created],
              }
            : q,
        ),
      );
      showToast(language === 'ar' ? 'تمت إضافة إجابتك بنجاح.' : 'Answer posted successfully.');
      return created;
    },
    [language, showToast],
  );

  const toggleCommunityVote = useCallback(
    async (targetType: 'question' | 'answer', targetId: string) => {
      const res = await apiRequest<{ upvoted: boolean; upvotesCount: number }>('/community/vote', {
        method: 'POST',
        body: JSON.stringify({ targetType, targetId }),
      });
      setCommunityQuestions((prev) =>
        prev.map((q) => {
          if (targetType === 'question' && q.id === targetId) {
            return { ...q, viewerUpvoted: res.upvoted, upvotesCount: res.upvotesCount };
          }
          if (targetType === 'answer') {
            return {
              ...q,
              answers: (q.answers || []).map((a) =>
                a.id === targetId
                  ? { ...a, viewerUpvoted: res.upvoted, upvotesCount: res.upvotesCount }
                  : a,
              ),
            };
          }
          return q;
        }),
      );
    },
    [],
  );

  const markAnswerHelpful = useCallback(
    async (questionId: string, answerId: string) => {
      await apiRequest(
        `/community/questions/${encodeURIComponent(questionId)}/answers/${encodeURIComponent(answerId)}/helpful`,
        { method: 'POST' },
      );
      setCommunityQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                isResolved: true,
                answers: (q.answers || []).map((a) =>
                  a.id === answerId ? { ...a, isHelpfulMarked: true } : a,
                ),
              }
            : q,
        ),
      );
      showToast(language === 'ar' ? 'تم تمييز الإجابة كمفيدة وحل السؤال.' : 'Marked answer as helpful.');
    },
    [language, showToast],
  );

  const submitCommunityReport = useCallback(
    async (input: {
      targetType: 'question' | 'answer' | 'story' | 'vendor_review';
      targetId: string;
      reason: CommunityReportReason;
      details?: string | null;
    }) => {
      const created = await apiRequest<CommunityReport>('/community/reports', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      showToast(
        language === 'ar'
          ? 'تم إرسال البلاغ لفريق الإشراف لمراجعته.'
          : 'Report submitted to the moderation queue.',
      );
      return created;
    },
    [language, showToast],
  );

  const applyExpertProfile = useCallback(
    async (input: {
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
    }) => {
      const created = await apiRequest<ExpertProfile>('/experts/apply', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      showToast(
        language === 'ar'
          ? 'تم استلام طلب اعتماد الخبير بنجاح وهو قيد فحص الأوراق عبر الإدارة.'
          : 'Expert credential application received (pending admin audit).',
      );
      return created;
    },
    [language, showToast],
  );

  const refreshAdminStage9 = useCallback(async () => {
    if (!apiConnected || !currentUser || !hasAnyRole(currentUser.role, ADMIN_PANEL_ROLES)) return;
    const [anData, modData] = await Promise.all([
      apiRequest<AdminAnalyticsPayload>('/admin/analytics').catch(() => null),
      hasAnyRole(currentUser.role, MODERATION_ROLES)
        ? apiRequest<AdminModerationOverview>('/admin/moderation/overview').catch(() => null)
        : Promise.resolve(null),
    ]);
    if (anData) setAdminAnalytics(anData);
    if (modData) setAdminModeration(modData);
  }, [apiConnected, currentUser]);

  const moderateStoryDecision = useCallback(
    async (
      storyId: string,
      input: { moderationStatus: StoryModerationStatus; moderationNotes?: string | null; isFeatured?: boolean },
    ) => {
      const updated = await apiRequest<RealWeddingStory>(
        `/admin/moderation/stories/${encodeURIComponent(storyId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(input),
        },
      );
      setAdminModeration((prev) =>
        prev
          ? { ...prev, stories: prev.stories.map((s) => (s.id === updated.id ? updated : s)) }
          : prev,
      );
      await refreshStage9Public();
      await refreshAdminStage9();
      showToast(
        language === 'ar'
          ? `تم تحديث مراجعة القصة إلى: ${updated.moderationStatus}`
          : `Story moderation updated to ${updated.moderationStatus}.`,
      );
      return updated;
    },
    [language, refreshAdminStage9, refreshStage9Public, showToast],
  );

  const resolveCommunityReportDecision = useCallback(
    async (reportId: string, input: { action: 'resolve_hide' | 'dismiss'; resolutionNote?: string | null }) => {
      const updated = await apiRequest<CommunityReport>(
        `/admin/moderation/reports/${encodeURIComponent(reportId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(input),
        },
      );
      setAdminModeration((prev) =>
        prev
          ? { ...prev, reports: prev.reports.map((r) => (r.id === updated.id ? updated : r)) }
          : prev,
      );
      await refreshStage9Public();
      await refreshAdminStage9();
      showToast(language === 'ar' ? 'تم تنفيذ قرار الإشراف على البلاغ.' : 'Report moderation decision recorded.');
      return updated;
    },
    [language, refreshAdminStage9, refreshStage9Public, showToast],
  );

  const verifyExpertProfileDecision = useCallback(
    async (
      expertId: string,
      input: { verificationStatus: ExpertVerificationStatus; verificationNotes?: string | null; isFeatured?: boolean },
    ) => {
      const updated = await apiRequest<ExpertProfile>(
        `/admin/moderation/experts/${encodeURIComponent(expertId)}/verify`,
        {
          method: 'PATCH',
          body: JSON.stringify(input),
        },
      );
      setAdminModeration((prev) =>
        prev
          ? { ...prev, experts: prev.experts.map((e) => (e.id === updated.id ? updated : e)) }
          : prev,
      );
      await refreshStage9Public();
      await refreshAdminStage9();
      showToast(
        language === 'ar'
          ? `تم تحديث اعتماد الخبير إلى: ${updated.verificationStatus}`
          : `Expert verification status updated to ${updated.verificationStatus}.`,
      );
      return updated;
    },
    [language, refreshAdminStage9, refreshStage9Public, showToast],
  );

  const adminUpdateArticleStatus = useCallback(
    async (articleId: string, patch: { status?: Article['status']; isFeatured?: boolean }) => {
      const updated = await apiRequest<Article>(
        `/admin/cms/articles/${encodeURIComponent(articleId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(language === 'ar' ? 'تم تحديث حالة المقال بنجاح.' : 'Article status updated.');
      return updated;
    },
    [language, showToast],
  );

  const adminUpdateUserStatus = useCallback(
    async (userId: string, status: User['status']) => {
      const updated = await apiRequest<User>(`/admin/users/${encodeURIComponent(userId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setAdminUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(language === 'ar' ? 'تم تحديث حالة الحساب بنجاح.' : 'User status updated.');
      return updated;
    },
    [language, showToast],
  );

  // Stage 10: Grounded AI Assistant, Smart Room Designer & Wedding Day Operations Actions
  const askAiAssistant = useCallback(
    async (query: string, conversationId?: string): Promise<AiAssistantReplyPayload> => {
      const res = await apiRequest<AiAssistantReplyPayload>('/assistant/ask', {
        method: 'POST',
        body: JSON.stringify({ query, conversationId, language }),
      });
      if (currentUser) {
        const hist = await apiRequest<AiConversationSummary[]>('/assistant/history').catch(() => null);
        if (hist) setAiConversations(hist);
      }
      return res;
    },
    [currentUser, language],
  );

  const refreshRoomMoodboards = useCallback(async () => {
    if (!apiConnected || !currentUser) return;
    const boards = await apiRequest<RoomMoodboard[]>('/room-studio/moodboards');
    setRoomMoodboards(boards);
  }, [apiConnected, currentUser]);

  const createRoomMoodboard = useCallback(
    async (input: {
      titleAr: string;
      titleEn?: string;
      roomType: RoomType;
      lengthM: number;
      widthM: number;
      heightM?: number;
      themeSlug: RoomThemeSlug;
      isSharedWithPartner?: boolean;
    }) => {
      const created = await apiRequest<RoomMoodboard>('/room-studio/moodboards', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setRoomMoodboards((prev) => [created, ...prev]);
      showToast(language === 'ar' ? 'تم إنشاء لوحة الغرفة وحفظ الأبعاد.' : 'Room moodboard created.');
      return created;
    },
    [language, showToast],
  );

  const deleteRoomMoodboard = useCallback(
    async (moodboardId: string) => {
      await apiRequest(`/room-studio/moodboards/${encodeURIComponent(moodboardId)}`, {
        method: 'DELETE',
      });
      setRoomMoodboards((prev) => prev.filter((b) => b.id !== moodboardId));
      showToast(language === 'ar' ? 'تم حذف لوحة التصميم.' : 'Moodboard deleted.');
    },
    [language, showToast],
  );

  const addMoodboardItem = useCallback(
    async (
      moodboardId: string,
      input: {
        itemType: MoodboardItemType;
        productId?: string | null;
        materialSlug?: string | null;
        labelAr: string;
        labelEn?: string;
        widthCm: number;
        depthCm: number;
        posXPct: number;
        posYPct: number;
        estimatedPriceEgp: number;
        colorHex?: string;
        notes?: string | null;
      },
    ) => {
      const updated = await apiRequest<RoomMoodboard>(
        `/room-studio/moodboards/${encodeURIComponent(moodboardId)}/items`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
      setRoomMoodboards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      showToast(language === 'ar' ? 'تمت إضافة العنصر للمخطط الهندسي.' : 'Item placed on floor plan.');
      return updated;
    },
    [language, showToast],
  );

  const updateMoodboardItem = useCallback(
    async (
      itemId: string,
      patch: { posXPct?: number; posYPct?: number; widthCm?: number; depthCm?: number },
    ) => {
      const updated = await apiRequest<RoomMoodboard>(
        `/room-studio/items/${encodeURIComponent(itemId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setRoomMoodboards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      return updated;
    },
    [],
  );

  const deleteMoodboardItem = useCallback(
    async (itemId: string) => {
      const updated = await apiRequest<RoomMoodboard>(
        `/room-studio/items/${encodeURIComponent(itemId)}`,
        { method: 'DELETE' },
      );
      setRoomMoodboards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      showToast(language === 'ar' ? 'تمت إزالة القطعة من الغرفة.' : 'Removed item from floor plan.');
      return updated;
    },
    [language, showToast],
  );

  const refreshWeddingDayOverview = useCallback(async () => {
    if (!apiConnected || !currentUser) return;
    const ov = await apiRequest<WeddingDayOverviewPayload>('/wedding-day/overview');
    setWeddingDayOverview(ov);
  }, [apiConnected, currentUser]);

  const createSeatingTable = useCallback(
    async (input: { tableName: string; zone: TableZone; capacity: number; notes?: string | null }) => {
      const ov = await apiRequest<WeddingDayOverviewPayload>('/wedding-day/tables', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setWeddingDayOverview(ov);
      showToast(language === 'ar' ? 'تمت إضافة الطاولة بنجاح.' : 'Seating table added.');
      return ov;
    },
    [language, showToast],
  );

  const deleteSeatingTable = useCallback(
    async (tableId: string) => {
      const ov = await apiRequest<WeddingDayOverviewPayload>(
        `/wedding-day/tables/${encodeURIComponent(tableId)}`,
        { method: 'DELETE' },
      );
      setWeddingDayOverview(ov);
      return ov;
    },
    [],
  );

  const createWeddingGuest = useCallback(
    async (input: {
      fullName: string;
      phone?: string | null;
      side: GuestSide;
      guestGroup: GuestGroup;
      invitedCount: number;
      plusOneAllowed: boolean;
      tableId?: string | null;
    }) => {
      const ov = await apiRequest<WeddingDayOverviewPayload>('/wedding-day/guests', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setWeddingDayOverview(ov);
      showToast(language === 'ar' ? 'تمت إضافة المدعو وإنشاء رابط RSVP.' : 'Guest added with RSVP code.');
      return ov;
    },
    [language, showToast],
  );

  const updateWeddingGuest = useCallback(
    async (
      guestId: string,
      patch: { rsvpStatus?: RsvpStatus; tableId?: string | null; attendingCount?: number },
    ) => {
      const ov = await apiRequest<WeddingDayOverviewPayload>(
        `/wedding-day/guests/${encodeURIComponent(guestId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setWeddingDayOverview(ov);
      showToast(language === 'ar' ? 'تم تحديث بيانات وتسكين الضيف.' : 'Guest & seating updated.');
      return ov;
    },
    [language, showToast],
  );

  const deleteWeddingGuest = useCallback(async (guestId: string) => {
    const ov = await apiRequest<WeddingDayOverviewPayload>(
      `/wedding-day/guests/${encodeURIComponent(guestId)}`,
      { method: 'DELETE' },
    );
    setWeddingDayOverview(ov);
    return ov;
  }, []);

  const createTimelineEvent = useCallback(
    async (input: {
      startTime: string;
      endTime: string;
      titleAr: string;
      titleEn?: string;
      assignee: string;
      locationNote?: string | null;
    }) => {
      const ov = await apiRequest<WeddingDayOverviewPayload>('/wedding-day/timeline', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setWeddingDayOverview(ov);
      showToast(language === 'ar' ? 'تمت إضافة الفقرة لجدول يوم الزفاف.' : 'Timeline event added.');
      return ov;
    },
    [language, showToast],
  );

  const updateTimelineEvent = useCallback(
    async (eventId: string, patch: { status?: TimelineEventStatus }) => {
      const ov = await apiRequest<WeddingDayOverviewPayload>(
        `/wedding-day/timeline/${encodeURIComponent(eventId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
      );
      setWeddingDayOverview(ov);
      return ov;
    },
    [],
  );

  const deleteTimelineEvent = useCallback(async (eventId: string) => {
    const ov = await apiRequest<WeddingDayOverviewPayload>(
      `/wedding-day/timeline/${encodeURIComponent(eventId)}`,
      { method: 'DELETE' },
    );
    setWeddingDayOverview(ov);
    return ov;
  }, []);

  const createGiftRegistryItem = useCallback(
    async (input: {
      productId?: string | null;
      titleAr: string;
      titleEn?: string;
      categoryLabel: string;
      targetPriceEgp: number;
      priority: GiftPriority;
      notes?: string | null;
    }) => {
      const ov = await apiRequest<WeddingDayOverviewPayload>('/wedding-day/registry', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setWeddingDayOverview(ov);
      showToast(language === 'ar' ? 'تمت إضافة الهدية لقائمة الرغبات.' : 'Gift added to registry.');
      return ov;
    },
    [language, showToast],
  );

  const deleteGiftRegistryItem = useCallback(async (itemId: string) => {
    const ov = await apiRequest<WeddingDayOverviewPayload>(
      `/wedding-day/registry/${encodeURIComponent(itemId)}`,
      { method: 'DELETE' },
    );
    setWeddingDayOverview(ov);
    return ov;
  }, []);

  // Modals & Prefill
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [finishingModalOpen, setFinishingModalOpen] = useState(false);
  const [finishingPrefill, setFinishingPrefill] = useState<FinishingPrefill>({
    areaSqm: 130,
    roomsCount: 3,
    bathroomsCount: 2,
    finishingTier: 'luxury',
  });
  const [weddingBookingModalOpen, setWeddingBookingModalOpen] = useState(false);
  const [selectedWeddingService, setSelectedWeddingService] = useState<WeddingServiceItem | null>(null);
  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [installmentPrefillAmount, setInstallmentPrefillAmount] = useState(100000);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        apiConnected,
        isHydrating,
        language,
        setLanguage,
        t,
        dir,
        activeSection,
        setActiveSection,
        currentUser,
        loginWithCredentials,
        registerAccount,
        logout,
        isLoggedIn,
        isAdmin,
        isStaff,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        isWishlisted,
        brideChecklist,
        toggleBrideChecklistItem,
        groomBudgetTarget,
        setGroomBudgetTarget,
        groomBudgetItems,
        toggleGroomBudgetItem,
        userGroomPlan,
        saveUserGroomPlan,
        userBridePlan,
        saveUserBridePlan,
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
        finishingInquiries,
        addFinishingInquiry,
        updateFinishingStatus,
        weddingBookings,
        addWeddingBooking,
        updateWeddingBookingStatus,
        orders,
        createOrder,
        updateOrderStatus,
        financingApplications,
        addFinancingApplication,
        updateFinancingStatus,
        supportCases,
        addSupportCase,
        updateSupportCaseStatus,
        sponsorshipInquiries,
        addSponsorshipInquiry,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        weddingServices,
        addWeddingService,
        updateWeddingService,
        deleteWeddingService,
        categories,
        articles,
        locations,
        addArticle,
        adminStats,
        adminUsers,
        auditLogs,
        refreshAdminData,
        finishingPackages,
        finishingServices,
        settings,
        updateSettings,
        calculatorSummaries,
        calculatorRuns,
        budgetOverview,
        runAndSaveCalculator,
        deleteCalculatorRun,
        refreshBudgetOverview,
        updateBudgetPlan,
        upsertBudgetCategory,
        updateBudgetCategory,
        createBudgetExpense,
        updateBudgetExpense,
        deleteBudgetExpense,
        importCalculatorToBudget,
        syncBudgetTransactions,
        academyLessons,
        earlyStartOverview,
        refreshEarlyStartOverview,
        updateEarlyStartProfile,
        createSavingsGoal,
        patchSavingsGoal,
        deleteSavingsGoal,
        recordSavingsContribution,
        addEarlyStartMilestone,
        toggleEarlyStartMilestone,
        deleteEarlyStartMilestone,
        toggleAcademyLessonComplete,
        myHubPayload,
        refreshMyHub,
        transitionLifecycleStage,
        updateEngagementPlan,
        createEngagementItem,
        patchEngagementItem,
        deleteEngagementItem,
        createJourneyTask,
        patchJourneyTask,
        deleteJourneyTask,
        addJourneyTaskComment,
        updateWorkspaceMeta,
        inviteWorkspacePartner,
        respondWorkspaceInvitation,
        updateWorkspaceMemberPermissions,
        revokeWorkspaceMember,
        createWorkspaceApproval,
        decideWorkspaceApproval,
        createUserDocument,
        deleteUserDocument,
        createUserWarranty,
        deleteUserWarranty,
        createUserAppointment,
        patchUserAppointment,
        markNotificationRead,
        markAllNotificationsRead,
        compareProductIds,
        toggleCompareProduct,
        clearCompareProducts,
        shoppingLists,
        priceAlerts,
        refreshShoppingAndAlerts,
        createShoppingList,
        updateShoppingList,
        deleteShoppingList,
        addShoppingListItem,
        updateShoppingListItem,
        deleteShoppingListItem,
        upsertPriceAlert,
        updatePriceAlert,
        deletePriceAlert,
        vendorCategories,
        vendors,
        subscriptionPlans,
        adminVendors,
        refreshVendors,
        registerVendor,
        submitVendorReview,
        refreshAdminVendors,
        adminVerifyVendor,
        adminUpdateSubscriptionPlan,
        myRfqs,
        marketplaceAppointments,
        refreshRfqAndAppointments,
        createRfqRequest,
        decideRfqQuote,
        postRfqMessage,
        createMarketplaceAppointment,
        patchMarketplaceAppointment,
        realWeddings,
        mySubmittedStories,
        communityQuestions,
        verifiedExperts,
        adminAnalytics,
        adminModeration,
        refreshStage9Public,
        submitWeddingStory,
        createCommunityQuestion,
        postCommunityAnswer,
        toggleCommunityVote,
        markAnswerHelpful,
        submitCommunityReport,
        applyExpertProfile,
        refreshAdminStage9,
        moderateStoryDecision,
        resolveCommunityReportDecision,
        verifyExpertProfileDecision,
        adminUpdateArticleStatus,
        adminUpdateUserStatus,
        aiConversations,
        roomMoodboards,
        weddingDayOverview,
        askAiAssistant,
        refreshRoomMoodboards,
        createRoomMoodboard,
        deleteRoomMoodboard,
        addMoodboardItem,
        updateMoodboardItem,
        deleteMoodboardItem,
        refreshWeddingDayOverview,
        createSeatingTable,
        deleteSeatingTable,
        createWeddingGuest,
        updateWeddingGuest,
        deleteWeddingGuest,
        createTimelineEvent,
        updateTimelineEvent,
        deleteTimelineEvent,
        createGiftRegistryItem,
        deleteGiftRegistryItem,
        authModalOpen,
        setAuthModalOpen,
        finishingModalOpen,
        setFinishingModalOpen,
        finishingPrefill,
        setFinishingPrefill,
        weddingBookingModalOpen,
        setWeddingBookingModalOpen,
        selectedWeddingService,
        setSelectedWeddingService,
        productDetailModalOpen,
        setProductDetailModalOpen,
        selectedProduct,
        setSelectedProduct,
        installmentModalOpen,
        setInstallmentModalOpen,
        installmentPrefillAmount,
        setInstallmentPrefillAmount,
        supportModalOpen,
        setSupportModalOpen,
        sponsorModalOpen,
        setSponsorModalOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

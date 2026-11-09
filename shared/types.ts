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


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
  price: z.number().min(1),
  originalPrice: z.number().min(1).optional(),
  sku: z.string().trim().min(2).max(64),
  stock: z.number().int().min(0).default(10),
  imageUrl: z.string().trim().min(1),
  descriptionAr: z.string().trim().min(2).max(2000),
  descriptionEn: z.string().trim().min(2).max(2000),
  specsAr: z.record(z.string(), z.string()).default({}),
  specsEn: z.record(z.string(), z.string()).default({}),
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


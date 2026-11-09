import type {
  CommunityCategorySlug,
  CommunityReportReason,
  ExpertSpecialtySlug,
} from './types';

export const COMMUNITY_CATEGORY_META: Record<
  CommunityCategorySlug,
  { ar: string; en: string }
> = {
  finishing: { ar: 'تشطيب الشقة', en: 'Apartment Finishing' },
  groom: { ar: 'تجهيز العريس', en: "Groom's Preparation" },
  bride: { ar: 'جهاز العروسة', en: "Bride's Trousseau" },
  wedding: { ar: 'تنظيم الفرح', en: 'Wedding Planning' },
  budget: { ar: 'الميزانية والتكاليف', en: 'Budget & Costs' },
  early_start: { ar: 'البداية المبكرة والادخار', en: 'Early Start & Saving' },
  married_life: { ar: 'الحياة الزوجية وصيانة المنزل', en: 'Married Life & Home Care' },
};

export const EXPERT_SPECIALTY_META: Record<
  ExpertSpecialtySlug,
  { ar: string; en: string }
> = {
  finishing_engineering: {
    ar: 'هندسة التشطيبات والديكور',
    en: 'Finishing & Interior Engineering',
  },
  financial_planning: {
    ar: 'التخطيط المالي وبناء الميزانية',
    en: 'Marriage Financial Planning',
  },
  bridal_trousseau: {
    ar: 'استشارات جهاز العروسة والمنزل',
    en: 'Bridal Trousseau & Home Curation',
  },
  wedding_direction: {
    ar: 'إدارة وتنظيم حفلات الزفاف',
    en: 'Wedding Production & Operations',
  },
  married_life_counseling: {
    ar: 'الاستشارات الأسرية وإدارة المنزل',
    en: 'Family & Household Advisory',
  },
};

export const COMMUNITY_REPORT_REASON_META: Record<
  CommunityReportReason,
  { ar: string; en: string }
> = {
  spam: { ar: 'إعلان غير مرغوب / سبام', en: 'Spam / Unsolicited Promo' },
  misleading_price: {
    ar: 'أسعار مضللة أو غير حقيقية',
    en: 'Misleading Pricing / Claim',
  },
  harassment: { ar: 'إساءة أو تجاوز في النقاش', en: 'Abusive / Harassment' },
  off_topic: { ar: 'خارج سياق المنصة', en: 'Off-Topic Content' },
  self_promo: { ar: 'دعاية تجارية مقنّعة', en: 'Disguised Self-Promotion' },
};


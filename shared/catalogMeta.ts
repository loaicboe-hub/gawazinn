import type { ContentDomain, FinishingTier } from './types';

export const FINISHING_TIER_RATES_EGP: Record<FinishingTier, number> = {
  economic: 3400,
  medium: 4300,
  luxury: 5200,
  ultra_luxury: 7800,
  custom: 4500,
};

export function estimateFinishingRange(areaSqm: number, tier: FinishingTier): { min: number; max: number } {
  const rate = FINISHING_TIER_RATES_EGP[tier] ?? 4500;
  const base = Math.max(20, Math.round(areaSqm)) * rate;
  return {
    min: Math.round(base * 0.92),
    max: Math.round(base * 1.12),
  };
}

export function maskNationalId(nationalId: string | undefined | null): string {
  const clean = (nationalId || '').replace(/\s+/g, '');
  if (!clean) return '—';
  if (clean.length <= 6) return '***' + clean.slice(-2);
  return `${clean.slice(0, 3)}${'*'.repeat(Math.max(4, clean.length - 6))}${clean.slice(-3)}`;
}

export const DOMAIN_META: Record<
  ContentDomain,
  { slug: string; nameAr: string; nameEn: string; route: string }
> = {
  finishing: {
    slug: 'finishing',
    nameAr: 'تشطيب الشقة والديكور',
    nameEn: 'Apartment Finishing & Decor',
    route: '/finishing',
  },
  groom: {
    slug: 'groom',
    nameAr: 'جهاز العريس والأجهزة',
    nameEn: "Groom's Preparation & Appliances",
    route: '/groom',
  },
  bride: {
    slug: 'bride',
    nameAr: 'جهاز العروسة والمفروشات',
    nameEn: "Bride's Trousseau & Cookware",
    route: '/bride',
  },
  wedding: {
    slug: 'wedding',
    nameAr: 'تنظيم الفرح وليلة العمر',
    nameEn: 'Wedding Planning & Venues',
    route: '/wedding',
  },
  early_start: {
    slug: 'early_start',
    nameAr: 'البداية المبكرة والادخار',
    nameEn: 'Early Start & Financial Readiness',
    route: '/installments',
  },
  married_life: {
    slug: 'married_life',
    nameAr: 'إدارة البيت ما بعد الزواج',
    nameEn: 'Married Life & Home Care',
    route: '/encyclopedia/married_life',
  },
  editorial: {
    slug: 'editorial',
    nameAr: 'أدلة ومقالات ومصطلحات',
    nameEn: 'Guides, FAQs & Glossary',
    route: '/encyclopedia',
  },
};

export const EGYPT_GOVERNORATES_LIST = [
  { slug: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo' },
  { slug: 'giza', nameAr: 'الجيزة', nameEn: 'Giza' },
  { slug: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
  { slug: 'dakahlia', nameAr: 'الدقهلية (المنصورة)', nameEn: 'Dakahlia (Mansoura)' },
  { slug: 'gharbia', nameAr: 'الغربية (طنطا)', nameEn: 'Gharbia (Tanta)' },
  { slug: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia' },
  { slug: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia' },
  { slug: 'fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum' },
];


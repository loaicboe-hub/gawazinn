import type {
  CalculatorCategoryGroup,
  CalculatorFieldDescriptor,
  CalculatorOutput,
  CalculatorSummary,
} from '../types';

export interface CalculatorDefinition {
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
  compute: (inputs: Record<string, number | string | boolean>) => CalculatorOutput;
}

export const GOVERNORATE_FACTORS: Record<
  string,
  { factor: number; labelAr: string; labelEn: string }
> = {
  base: { factor: 1.0, labelAr: 'المتوسط العام في مصر (1.00×)', labelEn: 'Egypt Baseline (1.00×)' },
  cairo: { factor: 1.08, labelAr: 'القاهرة الكبرى (1.08×)', labelEn: 'Greater Cairo (1.08×)' },
  new_cairo: {
    factor: 1.12,
    labelAr: 'التجمع والعاصمة الإدارية والشيخ زايد (1.12×)',
    labelEn: 'New Cairo & Sheikh Zayed (1.12×)',
  },
  giza: { factor: 1.05, labelAr: 'الجيزة (1.05×)', labelEn: 'Giza (1.05×)' },
  alexandria: { factor: 1.02, labelAr: 'الإسكندرية والساحل (1.02×)', labelEn: 'Alexandria (1.02×)' },
  dakahlia: { factor: 0.92, labelAr: 'الدقهلية والمنصورة (0.92×)', labelEn: 'Dakahlia & Mansoura (0.92×)' },
  gharbia: { factor: 0.9, labelAr: 'الغربية والدلتا (0.90×)', labelEn: 'Gharbia & Delta (0.90×)' },
};

export function numVal(
  inputs: Record<string, unknown>,
  key: string,
  fallback: number,
  min = -Infinity,
  max = Infinity,
): number {
  const raw = inputs[key];
  const parsed = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function strVal<T extends string>(
  inputs: Record<string, unknown>,
  key: string,
  fallback: T,
  allowed?: readonly T[],
): T {
  const raw = inputs[key];
  if (typeof raw !== 'string') return fallback;
  if (allowed && !allowed.includes(raw as T)) return fallback;
  return raw as T;
}

export function boolVal(inputs: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const raw = inputs[key];
  if (typeof raw === 'boolean') return raw;
  if (raw === 'true' || raw === 1) return true;
  if (raw === 'false' || raw === 0) return false;
  return fallback;
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function fmtEgp(n: number): string {
  return `${Math.round(n).toLocaleString('en-US')} EGP`;
}

export function fmtEgpAr(n: number): string {
  return `${Math.round(n).toLocaleString('en-US')} ج.م`;
}

export function toCalculatorSummary(def: CalculatorDefinition): CalculatorSummary {
  return {
    slug: def.slug,
    order: def.order,
    categoryGroup: def.categoryGroup,
    nameAr: def.nameAr,
    nameEn: def.nameEn,
    shortDescAr: def.shortDescAr,
    shortDescEn: def.shortDescEn,
    iconName: def.iconName,
    primaryUnit: def.primaryUnit,
    suggestedBudgetCategorySlug: def.suggestedBudgetCategorySlug,
    defaultInputs: def.defaultInputs,
    fields: def.fields,
  };
}

export const DEFAULT_BUDGET_CATEGORIES = [
  {
    slug: 'finishing',
    nameAr: 'تشطيب الشقة والديكور',
    nameEn: 'Apartment Finishing & Decor',
    ownerSide: 'groom' as const,
    plannedAmount: 260000,
    limitAmount: 290000,
    sortOrder: 1,
  },
  {
    slug: 'appliances',
    nameAr: 'الأجهزة الكهربائية',
    nameEn: 'Home Appliances',
    ownerSide: 'groom' as const,
    plannedAmount: 135000,
    limitAmount: 150000,
    sortOrder: 2,
  },
  {
    slug: 'furniture',
    nameAr: 'الأثاث والخشب والمراتب',
    nameEn: 'Furniture & Upholstery',
    ownerSide: 'groom' as const,
    plannedAmount: 115000,
    limitAmount: 130000,
    sortOrder: 3,
  },
  {
    slug: 'bride_trousseau',
    nameAr: 'جهاز العروسة والمفروشات والمطبخ',
    nameEn: "Bride's Trousseau & Cookware",
    ownerSide: 'bride' as const,
    plannedAmount: 95000,
    limitAmount: 110000,
    sortOrder: 4,
  },
  {
    slug: 'gold_shabka',
    nameAr: 'الشبكة والذهب',
    nameEn: 'Gold & Engagement Shabka',
    ownerSide: 'groom' as const,
    plannedAmount: 85000,
    limitAmount: 100000,
    sortOrder: 5,
  },
  {
    slug: 'wedding',
    nameAr: 'قاعة وتنظيم الفرح',
    nameEn: 'Wedding Hall & Celebration',
    ownerSide: 'shared' as const,
    plannedAmount: 110000,
    limitAmount: 125000,
    sortOrder: 6,
  },
  {
    slug: 'honeymoon',
    nameAr: 'شهر العسل والسفر',
    nameEn: 'Honeymoon & Travel',
    ownerSide: 'shared' as const,
    plannedAmount: 45000,
    limitAmount: 55000,
    sortOrder: 7,
  },
  {
    slug: 'emergency',
    nameAr: 'احتياطي الطوارئ (10–15%)',
    nameEn: 'Emergency Buffer Reserve',
    ownerSide: 'shared' as const,
    plannedAmount: 65000,
    limitAmount: 80000,
    sortOrder: 8,
  },
];

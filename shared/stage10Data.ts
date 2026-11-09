import type { RoomThemeSlug, RoomType, TableZone } from './types';

export const ROOM_TYPE_META: Record<
  RoomType,
  { nameAr: string; nameEn: string; defaultLengthM: number; defaultWidthM: number }
> = {
  living: { nameAr: 'غرفة المعيشة', nameEn: 'Living Room', defaultLengthM: 5.0, defaultWidthM: 4.0 },
  bedroom: { nameAr: 'غرفة النوم الرئيسية', nameEn: 'Master Bedroom', defaultLengthM: 4.5, defaultWidthM: 4.0 },
  kitchen: { nameAr: 'المطبخ', nameEn: 'Kitchen', defaultLengthM: 4.0, defaultWidthM: 3.2 },
  bathroom: { nameAr: 'الحمام', nameEn: 'Bathroom', defaultLengthM: 2.8, defaultWidthM: 2.2 },
  dining: { nameAr: 'السفرة', nameEn: 'Dining Room', defaultLengthM: 4.8, defaultWidthM: 3.8 },
  reception: { nameAr: 'الريسبشن', nameEn: 'Reception', defaultLengthM: 7.0, defaultWidthM: 4.2 },
  kids: { nameAr: 'غرفة الأطفال', nameEn: 'Kids Room', defaultLengthM: 3.8, defaultWidthM: 3.5 },
};

export const ROOM_THEME_META: Record<
  RoomThemeSlug,
  { nameAr: string; nameEn: string; palette: string[]; canvasBgHex: string }
> = {
  warm_beige: {
    nameAr: 'بيج دافئ وخشب طبيعي',
    nameEn: 'Warm Beige & Oak',
    palette: ['#FAF7F2', '#E5D3B3', '#B08968', '#2A1D20', '#D91B3E'],
    canvasBgHex: '#FAF7F2',
  },
  modern_cairo: {
    nameAr: 'مودرن القاهرة (رمادي وكريمي)',
    nameEn: 'Modern Cairo Neutrals',
    palette: ['#FFFFFF', '#E5E7EB', '#4B5563', '#2A1D20', '#D91B3E'],
    canvasBgHex: '#F9FAFB',
  },
  classic_ivory: {
    nameAr: 'كلاسيك عاجي وذهبي هادئ',
    nameEn: 'Classic Ivory & Brass',
    palette: ['#FFFDF9', '#F3E8D2', '#A68A56', '#3B2F2F', '#B31331'],
    canvasBgHex: '#FFFDF9',
  },
  minimalist_nordic: {
    nameAr: 'مينيمال ناعم وإضاءة بيضاء',
    nameEn: 'Soft Nordic Minimalist',
    palette: ['#FFFFFF', '#F1F5F9', '#94A3B8', '#1E293B', '#D91B3E'],
    canvasBgHex: '#F8FAFC',
  },
  romantic_wine: {
    nameAr: 'لمسة جواز إن الملكية الدافئة',
    nameEn: 'GAWAZ INN Wine Accent',
    palette: ['#FFF8F9', '#FDE8ED', '#D91B3E', '#2A1D20', '#D4AF37'],
    canvasBgHex: '#FFF8F9',
  },
};

export const TABLE_ZONE_META: Record<TableZone, { nameAr: string; nameEn: string }> = {
  vip_front: { nameAr: 'الصف الأول VIP', nameEn: 'VIP Front' },
  family_center: { nameAr: 'وسط القاعة — العائلة', nameEn: 'Family Center' },
  friends: { nameAr: 'قسم الأصدقاء', nameEn: 'Friends Section' },
  outdoor: { nameAr: 'التراس / الأوبن إير', nameEn: 'Outdoor / Terrace' },
};

export const MEAL_PREFERENCE_META: Record<string, { nameAr: string; nameEn: string }> = {
  standard: { nameAr: 'قائمة الضيافة الرئيسية', nameEn: 'Standard Main Menu' },
  vegetarian: { nameAr: 'نباتي', nameEn: 'Vegetarian' },
  kids: { nameAr: 'وجبة أطفال', nameEn: 'Kids Meal' },
  gluten_free: { nameAr: 'خالي من الجلوتين', nameEn: 'Gluten-Free' },
};

export const AI_STARTER_PROMPTS: {
  id: string;
  labelAr: string;
  labelEn: string;
  queryAr: string;
  queryEn: string;
}[] = [
  {
    id: 'prompt-finish-120',
    labelAr: 'احسب تشطيب شقة 120م',
    labelEn: '120m² Finishing Cost',
    queryAr: 'احسب لي تكلفة تشطيب شقة 120 متر باقة متوسطة مع أهم نصائح الخامات',
    queryEn: 'Calculate apartment finishing cost for 120 sqm medium tier with materials guide',
  },
  {
    id: 'prompt-fridge-budget',
    labelAr: 'أفضل ثلاجة تحت 38 ألف ج.م',
    labelEn: 'Fridge Under 38k EGP',
    queryAr: 'رشح لي ثلاجة وأجهزة موثوقة من الكتالوج تحت 38000 ج.م',
    queryEn: 'Recommend catalog refrigerators and appliances under 38000 EGP',
  },
  {
    id: 'prompt-vendors-cairo',
    labelAr: 'شركاء التشطيب والفرح في القاهرة',
    labelEn: 'Cairo Vendors & Halls',
    queryAr: 'اعرض لي شركاء التشطيب وقاعات الفرح المعتمدين في القاهرة والجيزة',
    queryEn: 'Show me verified finishing and wedding vendors in Cairo and Giza',
  },
  {
    id: 'prompt-my-budget',
    labelAr: 'ملخص ميزانيتي ورحلتي الحالية',
    labelEn: 'Audit My Budget & Plan',
    queryAr: 'حلل لي ميزانية الزواج الحالية وحالة مدخرات البداية المبكرة الخاصة بي',
    queryEn: 'Analyze my current wedding budget and early start savings plan',
  },
];

export function computeMoodboardMetrics(
  lengthM: number,
  widthM: number,
  items: { widthCm: number; depthCm: number; estimatedPriceEgp: number }[],
): { floorAreaSqm: number; occupiedAreaPercent: number; totalEstimatedCostEgp: number } {
  const floorAreaSqm = Math.max(1, Number((lengthM * widthM).toFixed(2)));
  let itemAreaSqm = 0;
  let totalEstimatedCostEgp = 0;
  for (const item of items) {
    itemAreaSqm += (item.widthCm / 100) * (item.depthCm / 100);
    totalEstimatedCostEgp += Number(item.estimatedPriceEgp) || 0;
  }
  const occupiedAreaPercent = Math.min(100, Math.round((itemAreaSqm / floorAreaSqm) * 100));
  return { floorAreaSqm, occupiedAreaPercent, totalEstimatedCostEgp };
}


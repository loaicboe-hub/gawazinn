import type {
  HomeAssetCategory,
  HomeItemCondition,
  MaintenanceSystemCategory,
  NewlywedGuideTrack,
} from './types';

export const HOME_ASSET_CATEGORY_META: Record<
  HomeAssetCategory,
  {
    labelAr: string;
    labelEn: string;
    placeholderCodeAr: string;
    placeholderCodeEn: string;
  }
> = {
  paint_code: {
    labelAr: 'كود دهان وخلط ألوان',
    labelEn: 'Paint Shade & Tint Code',
    placeholderCodeAr: 'مثال: جوتن 10678 أو RAL 9010',
    placeholderCodeEn: 'e.g. Jotun 10678 or RAL 9010',
  },
  electrical_panel: {
    labelAr: 'خريطة لوحة الكهرباء والقواطع',
    labelEn: 'Electrical Breaker Legend',
    placeholderCodeAr: 'مثال: ABB-PNL-16L (RCD 30mA)',
    placeholderCodeEn: 'e.g. ABB-PNL-16L (RCD 30mA)',
  },
  plumbing_diagram: {
    labelAr: 'مسار السباكة ومحابس الغلق',
    labelEn: 'Plumbing Shutoff & Valves',
    placeholderCodeAr: 'مثال: كود اختبار كبس BR-PPR',
    placeholderCodeEn: 'e.g. PP-R Pressure Cert',
  },
  appliance_manual: {
    labelAr: 'كتالوج وصيانة جهاز',
    labelEn: 'Appliance Care Manual',
    placeholderCodeAr: 'مثال: موديل وسيريال الجهاز',
    placeholderCodeEn: 'e.g. Model & Serial Number',
  },
  measurement: {
    labelAr: 'مقاسات غرف وستائر ومطبخ',
    labelEn: 'Room / Cabinetry Dimensions',
    placeholderCodeAr: 'مثال: 245 سم × 60 سم',
    placeholderCodeEn: 'e.g. 245cm × 60cm',
  },
  meter_serial: {
    labelAr: 'أرقام عدادات (كهرباء/مياه/غاز)',
    labelEn: 'Utility Meter Serial',
    placeholderCodeAr: 'مثال: رقم العداد الكودي',
    placeholderCodeEn: 'e.g. Prepaid Utility Meter ID',
  },
  supplier_contact: {
    labelAr: 'جهة صيانة / سباك / كهربائي معتمد',
    labelEn: 'Trusted Home Technician',
    placeholderCodeAr: 'مثال: رقم التواصل وتكلفة الكشف',
    placeholderCodeEn: 'e.g. Hotline & Warranty Note',
  },
};

export const MAINTENANCE_SYSTEM_META: Record<
  MaintenanceSystemCategory,
  {
    labelAr: string;
    labelEn: string;
    defaultIntervalMonths: number;
    defaultCostEgp: number;
    vendorCategorySlug: string;
  }
> = {
  ac_service: {
    labelAr: 'صيانة وتنظيف التكييفات الموسمية',
    labelEn: 'Seasonal AC Servicing & Filter Wash',
    defaultIntervalMonths: 6,
    defaultCostEgp: 650,
    vendorCategorySlug: 'home_maintenance',
  },
  water_heater: {
    labelAr: 'فحص السخان وصمام الأمان وعمود المغنيسيوم',
    labelEn: 'Water Heater Anode & Safety Valve Check',
    defaultIntervalMonths: 12,
    defaultCostEgp: 450,
    vendorCategorySlug: 'home_maintenance',
  },
  plumbing_check: {
    labelAr: 'فحص محابس الدفن والهوايات والتسريب',
    labelEn: 'Concealed Valve & Plumbing Leak Check',
    defaultIntervalMonths: 6,
    defaultCostEgp: 350,
    vendorCategorySlug: 'home_maintenance',
  },
  electrical_safety: {
    labelAr: 'اختبار مفتاح الأمان الأرضي RCD واللوحة',
    labelEn: 'Electrical Panel & RCD Breaker Test',
    defaultIntervalMonths: 12,
    defaultCostEgp: 400,
    vendorCategorySlug: 'home_maintenance',
  },
  pest_control: {
    labelAr: 'وقاية ورش آمن للمطبخ والبيوت',
    labelEn: 'Eco-Safe Pest Prevention Inspection',
    defaultIntervalMonths: 6,
    defaultCostEgp: 550,
    vendorCategorySlug: 'home_maintenance',
  },
  painting_touchup: {
    labelAr: 'مراجعة دهانات الحوائط وسيلكون الحمام',
    labelEn: 'Wall Touch-Up & Silicone Re-Sealing',
    defaultIntervalMonths: 12,
    defaultCostEgp: 600,
    vendorCategorySlug: 'home_maintenance',
  },
  appliance_filter: {
    labelAr: 'تغيير شمعات فلتر المياه وفحص الغسالة',
    labelEn: 'RO Water Filter Cartridges & Washer Seal',
    defaultIntervalMonths: 3,
    defaultCostEgp: 480,
    vendorCategorySlug: 'home_maintenance',
  },
  moving_prep: {
    labelAr: 'نقل عفش أو صيانة وتظبيط مفصلات الأبواب',
    labelEn: 'Cabinet Hinge Re-Alignment & Moving Care',
    defaultIntervalMonths: 12,
    defaultCostEgp: 500,
    vendorCategorySlug: 'moving_logistics',
  },
};

export const HOME_ITEM_CONDITION_META: Record<
  HomeItemCondition,
  { labelAr: string; labelEn: string; badgeClass: string }
> = {
  new: {
    labelAr: 'جديد بالضمان',
    labelEn: 'New / Under Warranty',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  good: {
    labelAr: 'يعمل بكفاءة',
    labelEn: 'Good Condition',
    badgeClass: 'bg-[#FAF7F2] text-[#2A1D20] border-gray-200',
  },
  needs_service: {
    labelAr: 'يحتاج صيانة دورية',
    labelEn: 'Needs Service',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  replace_soon: {
    labelAr: 'مخطط استبداله',
    labelEn: 'Replace Soon',
    badgeClass: 'bg-rose-50 text-[#B31331] border-rose-200',
  },
};

export const NEWLYWED_TRACKS_META: NewlywedGuideTrack[] = [
  {
    id: 'nwt-01',
    slug: 'post_wedding_moving',
    titleAr: '1. نقل العفش والتسكين الآمن قبل الانتقال',
    titleEn: '1. Safe Moving, Hoist Logistics & First-Night Readiness',
    summaryAr:
      'التأكد من تغليف الأجهزة والأخشاب بالبابلز والاسترتش، فحص الونش، وفتح كراتين الأجهزة بحضور فني التوكيل فقط.',
    summaryEn:
      'Coordinate enclosed transport, hydraulic hoist street checks, and preserve factory seals until official technician unboxing.',
    timeframeAr: 'أسبوع قبل الانتقال',
    timeframeEn: '1 Week Pre-Move',
    ctaPath: '/home-care',
    ctaLabelAr: 'دليل شركات النقل والونش',
    ctaLabelEn: 'Moving & Hoist Partners',
    stepsAr: [
      { key: 'm-1', text: 'معاينة عرض الشارع والبلكونة لوقوف ونش الرفع الهيدروليكي بأمان.' },
      { key: 'm-2', text: 'ترك كراتين الثلاجة والغسالة والتكييف مغلقة لحين حضور فني الوكيل لتفعيل الضمان.' },
      { key: 'm-3', text: 'فحص توصيل الغاز الطبيعي وسلامة عدادات الكهرباء والمياه الكودية أول يوم.' },
    ],
    stepsEn: [
      { key: 'm-1', text: 'Inspect street width & balcony angle before booking exterior hoist trucks.' },
      { key: 'm-2', text: 'Keep large appliance boxes sealed until authorized agent installs and stamps warranty.' },
      { key: 'm-3', text: 'Log prepaid electricity, water & gas meter IDs in your Digital Home File.' },
    ],
  },
  {
    id: 'nwt-02',
    slug: 'digital_home_file',
    titleAr: '2. توثيق ملف البيت الرقمي (الدهان، المحابس، اللوحة)',
    titleEn: '2. Archive Paint Codes, Breaker Map & Plumbing Shutoffs',
    summaryAr:
      'حفظ أكواد دهان جوتن/سايبس، خريطة مفاتيح الكهرباء، ومقاسات الرخام والستائر قبل نسيانها في زحام الانتقال.',
    summaryEn:
      'Record exact paint shade codes, RCD circuit breaker labels, main water shutoffs, and cabinetry dimensions permanently.',
    timeframeAr: 'الشهر الأول',
    timeframeEn: 'Month 1',
    ctaPath: '/my/home-file',
    ctaLabelAr: 'افتح ملف البيت الرقمي',
    ctaLabelEn: 'Open Digital Home File',
    stepsAr: [
      { key: 'h-1', text: 'تسجيل أرقام خلط ألوان الدهانات لكل غرفة لاستخدامها في أي ترميم لاحق دون فرق لون.' },
      { key: 'h-2', text: 'توثيق مكان محبس المياه العمومي وخطوط الصرف لتلافي أي تسريب طارئ.' },
      { key: 'h-3', text: 'حفظ مقاسات النيش والمطبخ والستائر بالسنتمتر داخل الأصول المرجعية.' },
    ],
    stepsEn: [
      { key: 'h-1', text: 'Store room-by-room paint tint codes to avoid patchy wall touch-ups later.' },
      { key: 'h-2', text: 'Document main cold/hot water shutoff locations and RCD test breaker placement.' },
      { key: 'h-3', text: 'Save exact cabinet, window & wall dimensions inside Home File Assets.' },
    ],
  },
  {
    id: 'nwt-03',
    slug: 'year_one_household_budget',
    titleAr: '3. إدارة مصروف البيت واحتياطي الطوارئ في السنة الأولى',
    titleEn: '3. Year-One Household Cashflow & Emergency Runway',
    summaryAr:
      'ضبط المصروفات الشهرية الثابتة (مرافق، صيانة، طعام، أقساط) وفصل صندوق طوارئ 3 أشهر لحماية استقرار الأسرة.',
    summaryEn:
      'Balance utilities, installments, recurring home care, and keep a ring-fenced 3-month living runway debt-free.',
    timeframeAr: 'أول 3 أشهر',
    timeframeEn: 'Months 1–3',
    ctaPath: '/calculators/emergency-reserve',
    ctaLabelAr: 'احسب وسادة الأمان الشهرية',
    ctaLabelEn: 'Calculate Living Runway',
    stepsAr: [
      { key: 'b-1', text: 'فصل حساب المصاريف الشهرية عن صندوق ادخار الأقساط والالتزامات المؤجلة.' },
      { key: 'b-2', text: 'تخصيص 3–5% شهرياً لصندوق الصيانة الوقائية للأجهزة والتشطيبات.' },
      { key: 'b-3', text: 'مراجعة المصروف الفعلي أول 3 أشهر وتعديل السقف من مدير الميزانية.' },
    ],
    stepsEn: [
      { key: 'b-1', text: 'Separate recurring monthly bills from scheduled loan or furniture installments.' },
      { key: 'b-2', text: 'Allocate a modest monthly sinking fund for semi-annual home maintenance.' },
      { key: 'b-3', text: 'Review actual spend after 90 days in Wedding & Home Budget Manager.' },
    ],
  },
  {
    id: 'nwt-04',
    slug: 'preventive_maintenance_cycle',
    titleAr: '4. روتين الصيانة الوقائية (التكييفات، الفلاتر، السخان)',
    titleEn: '4. Preventive Home Maintenance Cycle (AC, Filters, Boiler)',
    summaryAr:
      'جدولة تنظيف فلاتر التكييف كل 6 أشهر وتغيير شمعات فلتر المياه وفحص السخان قبل الشتاء لتفادي الأعطال المكلفة.',
    summaryEn:
      'Prevent costly emergency breakdowns with semi-annual HVAC cleaning, RO filter swaps, and pre-winter water heater checks.',
    timeframeAr: 'كل 3 – 6 أشهر',
    timeframeEn: 'Quarterly / Biannual',
    ctaPath: '/my/home-file?tab=maintenance',
    ctaLabelAr: 'جدول الصيانة الدورية',
    ctaLabelEn: 'Maintenance Schedule',
    stepsAr: [
      { key: 'p-1', text: 'تنظيف فلاتر التكييفات وفحص الفريون قبل بداية موسم الصيف كل عام.' },
      { key: 'p-2', text: 'تغيير شمعات فلتر المياه الـ 3 الأولية بانتظام كل 3 إلى 6 أشهر.' },
      { key: 'p-3', text: 'فحص سيلكون أحواض الحمام والمطبخ سنوياً لمنع تسرب الرطوبة للخشب والرخام.' },
    ],
    stepsEn: [
      { key: 'p-1', text: 'Service AC coils & refrigerant charge ahead of peak Egyptian summer heat.' },
      { key: 'p-2', text: 'Replace sediment & carbon water-filter stages every 3–6 months.' },
      { key: 'p-3', text: 'Inspect shower & sink silicone beads yearly to protect vanity woodwork.' },
    ],
  },
  {
    id: 'nwt-05',
    slug: 'warranties_and_inventory',
    titleAr: '5. متابعة شهادات الضمان وجرد أصول المنزل',
    titleEn: '5. Warranty Vault & Household Asset Ledger',
    summaryAr:
      'تجميع فواتير الشراء الضريبية وتواريخ انتهاء ضمانات 5 و10 سنوات للثلاجة والغسالة والتشطيبات في سجل واحد.',
    summaryEn:
      'Track compressor/motor agent warranty expirations, tax invoices & itemized household equipment value cleanly.',
    timeframeAr: 'مستمر',
    timeframeEn: 'Ongoing',
    ctaPath: '/my/home-file?tab=warranties',
    ctaLabelAr: 'سجل الضمانات والجرد',
    ctaLabelEn: 'Vault & Warranties',
    stepsAr: [
      { key: 'w-1', text: 'إدخال أرقام السيريال وتاريخ انتهاء الضمان لكل جهاز كهربائي كبير.' },
      { key: 'w-2', text: 'التنبيه المبكر قبل انتهاء ضمان المقاول أو الوكيل بـ 90 يوماً لعمل فحص شامل.' },
      { key: 'w-3', text: 'مشاركة نسخة العقود والضمانات في مساحة الزوجين لسهولة الوصول في أي وقت.' },
    ],
    stepsEn: [
      { key: 'w-1', text: 'Store model serials and expiry dates for refrigerators, washers, cookers & TVs.' },
      { key: 'w-2', text: 'Run an end-of-warranty diagnostic 90 days before contractor/agent coverage ends.' },
      { key: 'w-3', text: 'Keep shared house contracts accessible to both partners in Document Locker.' },
    ],
  },
  {
    id: 'nwt-06',
    slug: 'legal_and_utilities_handover',
    titleAr: '6. نقل ملكية المرافق وتأمين المستندات القانونية',
    titleEn: '6. Legal Handover, Utility Meters & Emergency Backup',
    summaryAr:
      'تحديث بيانات المشترك للغاز والإنترنت والكهرباء والاحتفاظ بنسخة رقمية آمنة من قسيمة الزواج وعقد الشقة.',
    summaryEn:
      'Transfer utility accounts into household records and back up contracts securely inside your private Locker.',
    timeframeAr: 'أول 60 يوماً',
    timeframeEn: 'First 60 Days',
    ctaPath: '/my/workspace?tab=documents',
    ctaLabelAr: 'خزنة المستندات الآمنة',
    ctaLabelEn: 'Document Locker',
    stepsAr: [
      { key: 'l-1', text: 'مراجعة أصل عقد التمليك أو الإيجار وملحقاته وحفظ نسخة PDF مشفرة الوصول.' },
      { key: 'l-2', text: 'تسجيل أرقام خدمة عملاء توكيلات الأجهزة وطوارئ الغاز والكهرباء بمصر.' },
      { key: 'l-3', text: 'الاحتفاظ بتسجيل قائمة المنقولات وفواتير الشراء الضريبية في ملف آمن.' },
    ],
    stepsEn: [
      { key: 'l-1', text: 'Verify lease/deed ownership attachments & store an organized PDF index.' },
      { key: 'l-2', text: 'Keep verified utility emergency hotlines (129 Gas / 121 Power) pinned in assets.' },
      { key: 'l-3', text: 'Store stamped gold & appliance tax invoices inside your private vault.' },
    ],
  },
];

export function addMonthsIsoDate(baseIso: string, months: number): string {
  const safeMatch = baseIso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  const now = new Date();
  const y = safeMatch ? Number(safeMatch[1]) : now.getUTCFullYear();
  const m = safeMatch ? Number(safeMatch[2]) - 1 : now.getUTCMonth();
  const d = safeMatch ? Number(safeMatch[3]) : now.getUTCDate();

  const totalMonths = y * 12 + m + Math.max(1, Math.round(months));
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = totalMonths % 12;
  const maxDayInMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(d, maxDayInMonth);
  return new Date(Date.UTC(targetYear, targetMonth, clampedDay)).toISOString().slice(0, 10);
}

export function computeMaintenanceDueStatus(
  nextDueDate: string,
  referenceDateIso?: string,
): 'upcoming' | 'due_soon' | 'overdue' {
  const ref = (referenceDateIso || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const due = nextDueDate.slice(0, 10);
  if (due < ref) return 'overdue';

  const refMs = Date.parse(`${ref}T00:00:00Z`);
  const dueMs = Date.parse(`${due}T00:00:00Z`);
  if (Number.isFinite(refMs) && Number.isFinite(dueMs)) {
    const diffDays = Math.ceil((dueMs - refMs) / 86400000);
    if (diffDays <= 14) return 'due_soon';
  }
  return 'upcoming';
}

export function isWarrantyExpiringWithinDays(
  expiryDate: string,
  days = 90,
  referenceDateIso?: string,
): boolean {
  const ref = (referenceDateIso || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const exp = expiryDate.slice(0, 10);
  if (exp < ref) return false;
  const refMs = Date.parse(`${ref}T00:00:00Z`);
  const expMs = Date.parse(`${exp}T00:00:00Z`);
  if (!Number.isFinite(refMs) || !Number.isFinite(expMs)) return false;
  const diffDays = Math.ceil((expMs - refMs) / 86400000);
  return diffDays <= days;
}


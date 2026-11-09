import { FINISHING_TIER_RATES_EGP } from '../catalogMeta';
import type { FinishingTier } from '../types';
import {
  GOVERNORATE_FACTORS,
  boolVal,
  fmtEgp,
  numVal,
  pct,
  strVal,
  type CalculatorDefinition,
} from './helpers';

export const TROUSSEAU_CELEBRATION_CALCULATORS: CalculatorDefinition[] = [
  // #1: Total Marriage Budget Calculator
  {
    slug: 'total-marriage-budget',
    order: 1,
    categoryGroup: 'comprehensive',
    nameAr: 'حاسبة ميزانية الزواج الشاملة',
    nameEn: 'Total Marriage Budget Calculator',
    shortDescAr: 'تجمع كل بنود التجهيز (تشطيب + أجهزة + أثاث + جهاز العروسة + شبكة + فرح + احتياطي) في خطة واحدة.',
    shortDescEn: 'Combines finishing, appliances, furniture, bridal trousseau, gold, wedding & emergency reserve.',
    iconName: 'Compass',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'emergency',
    defaultInputs: {
      areaSqm: 120,
      finishingTier: 'medium',
      governorate: 'cairo',
      appliancesAndFurnitureBudget: 250000,
      brideTrousseauBudget: 95000,
      goldShabkaBudget: 85000,
      weddingAndHoneymoonBudget: 145000,
      emergencyBufferPercent: 10,
    },
    fields: [
      { key: 'areaSqm', type: 'number', labelAr: 'مساحة الشقة للتشطيب', labelEn: 'Apartment Area', unitAr: 'م²', unitEn: 'm²', min: 55, max: 400, step: 5 },
      {
        key: 'finishingTier',
        type: 'select',
        labelAr: 'باقة التشطيب',
        labelEn: 'Finishing Package Tier',
        options: [
          { value: 'economic', labelAr: 'اقتصادية (3,400 ج.م/م²)', labelEn: 'Economic (3,400 EGP/m²)' },
          { value: 'medium', labelAr: 'متوسطة (4,300 ج.م/م²)', labelEn: 'Medium (4,300 EGP/m²)' },
          { value: 'luxury', labelAr: 'متميزة (5,200 ج.م/م²)', labelEn: 'Luxury (5,200 EGP/m²)' },
          { value: 'ultra_luxury', labelAr: 'ملكية (7,800 ج.م/م²)', labelEn: 'Ultra Luxury (7,800 EGP/m²)' },
        ],
      },
      {
        key: 'governorate',
        type: 'select',
        labelAr: 'المحافظة',
        labelEn: 'Governorate',
        options: Object.entries(GOVERNORATE_FACTORS).map(([value, g]) => ({
          value,
          labelAr: g.labelAr,
          labelEn: g.labelEn,
        })),
      },
      { key: 'appliancesAndFurnitureBudget', type: 'number', labelAr: 'مخصص الأجهزة الكهربائية والأثاث', labelEn: 'Appliances & Furniture Allocation', unitAr: 'ج.م', unitEn: 'EGP', min: 40000, max: 1500000, step: 5000 },
      { key: 'brideTrousseauBudget', type: 'number', labelAr: 'مخصص جهاز العروسة والمفروشات', labelEn: "Bride's Trousseau Allocation", unitAr: 'ج.م', unitEn: 'EGP', min: 25000, max: 600000, step: 5000 },
      { key: 'goldShabkaBudget', type: 'number', labelAr: 'ميزانية الشبكة والذهب', labelEn: 'Gold & Shabka Budget', unitAr: 'ج.م', unitEn: 'EGP', min: 15000, max: 600000, step: 5000 },
      { key: 'weddingAndHoneymoonBudget', type: 'number', labelAr: 'ميزانية الفرح وشهر العسل', labelEn: 'Wedding Ceremony & Honeymoon', unitAr: 'ج.م', unitEn: 'EGP', min: 0, max: 1000000, step: 5000 },
      { key: 'emergencyBufferPercent', type: 'number', labelAr: 'نسبة احتياطي الطوارئ (%)', labelEn: 'Emergency Buffer (%)', unitAr: '%', unitEn: '%', min: 0, max: 25, step: 1 },
    ],
    compute(inputs) {
      const area = numVal(inputs, 'areaSqm', 120, 40, 500);
      const tier = strVal<FinishingTier>(inputs, 'finishingTier', 'medium', ['economic', 'medium', 'luxury', 'ultra_luxury']);
      const gov = strVal<string>(inputs, 'governorate', 'cairo');
      const groomGear = numVal(inputs, 'appliancesAndFurnitureBudget', 250000, 0, 3000000);
      const brideGear = numVal(inputs, 'brideTrousseauBudget', 95000, 0, 2000000);
      const gold = numVal(inputs, 'goldShabkaBudget', 85000, 0, 2000000);
      const weddingHoney = numVal(inputs, 'weddingAndHoneymoonBudget', 145000, 0, 3000000);
      const bufferPct = numVal(inputs, 'emergencyBufferPercent', 10, 0, 30);

      const finishingCost = Math.round(
        area * (FINISHING_TIER_RATES_EGP[tier] ?? 4300) * (GOVERNORATE_FACTORS[gov]?.factor ?? 1.0),
      );
      const coreSubtotal = finishingCost + groomGear + brideGear + gold + weddingHoney;
      const bufferCost = Math.round(coreSubtotal * (bufferPct / 100));
      const grandTotal = coreSubtotal + bufferCost;

      const groomTotalEstimate = finishingCost + groomGear + gold + Math.round((weddingHoney + bufferCost) * 0.65);
      const brideTotalEstimate = brideGear + Math.round((weddingHoney + bufferCost) * 0.35);

      return {
        slug: 'total-marriage-budget',
        nameAr: 'حاسبة ميزانية الزواج الشاملة',
        nameEn: 'Total Marriage Budget Calculator',
        primaryMetric: {
          labelAr: 'إجمالي الميزانية المخططة للزواج وتجهيز البيت',
          labelEn: 'Total Planned Marriage & Home Budget',
          value: grandTotal,
          unit: 'EGP',
          unitLabelAr: 'ج.م',
          unitLabelEn: 'EGP',
        },
        secondaryMetrics: [
          { key: 'finishing_est', labelAr: 'تشطيب الشقة', labelEn: 'Finishing Share', value: fmtEgp(finishingCost), rawValue: finishingCost },
          { key: 'groom_est', labelAr: 'نصيب العريس التقديري', labelEn: 'Illustrative Groom Share', value: fmtEgp(groomTotalEstimate) },
          { key: 'bride_est', labelAr: 'نصيب العروسة التقديري', labelEn: 'Illustrative Bride Share', value: fmtEgp(brideTotalEstimate) },
        ],
        breakdown: [
          { key: 'finishing', labelAr: `تشطيب الشقة (${area}م²)`, labelEn: `Apartment Finishing (${area}m²)`, amount: finishingCost, percent: pct(finishingCost, grandTotal) },
          { key: 'groom_gear', labelAr: 'الأجهزة الكهربائية والأثاث', labelEn: 'Appliances & Furniture', amount: groomGear, percent: pct(groomGear, grandTotal) },
          { key: 'wedding_honey', labelAr: 'الفرح وشهر العسل', labelEn: 'Wedding & Honeymoon', amount: weddingHoney, percent: pct(weddingHoney, grandTotal) },
          { key: 'bride', labelAr: 'جهاز العروسة والمفروشات', labelEn: "Bride's Trousseau", amount: brideGear, percent: pct(brideGear, grandTotal) },
          { key: 'gold', labelAr: 'الشبكة والذهب', labelEn: 'Gold & Shabka', amount: gold, percent: pct(gold, grandTotal) },
          { key: 'buffer', labelAr: `احتياطي الطوارئ (${bufferPct}%)`, labelEn: `Emergency Reserve (${bufferPct}%)`, amount: bufferCost, percent: pct(bufferCost, grandTotal) },
        ],
        formulaSummaryAr: 'تكلفة التشطيب المحسوبة + الأجهزة والأثاث + جهاز العروسة + الشبكة + الفرح وشهر العسل + نسبة الطوارئ',
        formulaSummaryEn: 'Finishing (Area × Tier × Governorate) + Appliances/Furniture + Bride Trousseau + Gold + Wedding + Reserve %',
        assumptionsAr: ['تقسيم نصيب الطرفين استرشادي (65%/35% على المصاريف المشتركة) وقابل للتخصيص في مدير الميزانية.'],
        assumptionsEn: ['Couple split assumption is strictly illustrative — adjust every category owner inside Wedding Budget Manager.'],
        warningsAr: bufferPct < 8 ? ['يوصى برفع احتياطي الطوارئ إلى 10% على الأقل لحماية الشقة من فروق التشطيب.'] : [],
        warningsEn: bufferPct < 8 ? ['Keep at least 10% emergency cushion so late finishing variations never trigger high-cost debt.'] : [],
        suggestedBudgetCategorySlug: 'emergency',
        suggestedBudgetTitleAr: `خطة الميزانية الكلية (${Math.round(grandTotal / 1000)}k ج.م)`,
        suggestedBudgetTitleEn: `Master Marriage Plan (${Math.round(grandTotal / 1000)}k EGP)`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #3: Groom Large Appliances Calculator
  {
    slug: 'groom-appliances',
    order: 3,
    categoryGroup: 'trousseau',
    nameAr: 'حاسبة باقة أجهزة العريس الكهربائية',
    nameEn: "Groom's Large Appliances Package Calculator",
    shortDescAr: 'تختار مواصفات الثلاجة، الغسالة، البوتاجاز، الشاشة، التكييفات، وغسالة الأطباق لتحصل على الإجمالي.',
    shortDescEn: 'Configure fridge, washer, cooker, TV size, split AC count & dishwasher for instant pricing.',
    iconName: 'Briefcase',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'appliances',
    defaultInputs: {
      applianceGrade: 'inverter_balanced',
      acUnitsCount: 2,
      tvInches: 55,
      includeDishwasher: false,
      includeMicrowaveAndHeater: true,
    },
    fields: [
      {
        key: 'applianceGrade',
        type: 'select',
        labelAr: 'فئة الأجهزة والضمان',
        labelEn: 'Appliance Lineup Tier',
        options: [
          { value: 'economic', labelAr: 'اقتصادية عملية (توشيبا/زانوسي/يونيون إير)', labelEn: 'Economic Practical' },
          { value: 'inverter_balanced', labelAr: 'إنفرتر متوازنة (شارب/LG/بيكو)', labelEn: 'Inverter Balanced (Sharp/LG/Beko)' },
          { value: 'premium_smart', labelAr: 'فئة عليا سمارت (سامسونج/LG/بوش)', labelEn: 'Premium Smart (Samsung/LG/Bosch)' },
        ],
      },
      { key: 'acUnitsCount', type: 'number', labelAr: 'عدد التكييفات (سبليت 1.5–2.25 حصان)', labelEn: 'Split AC Units Count', unitAr: 'تكييف', unitEn: 'units', min: 0, max: 5, step: 1 },
      { key: 'tvInches', type: 'number', labelAr: 'حجم الشاشة 4K بالبوصة', labelEn: 'Smart 4K TV Size', unitAr: 'بوصة', unitEn: 'inch', min: 43, max: 75, step: 5 },
      { key: 'includeDishwasher', type: 'boolean', labelAr: 'إضافة غسالة أطباق 13–14 فرد', labelEn: 'Include 14-Place Dishwasher' },
      { key: 'includeMicrowaveAndHeater', type: 'boolean', labelAr: 'إضافة سخان مياه + ميكروويف + كولديير', labelEn: 'Include Water Heater + Microwave + Dispenser' },
    ],
    compute(inputs) {
      const grade = strVal(inputs, 'applianceGrade', 'inverter_balanced', ['economic', 'inverter_balanced', 'premium_smart']);
      const acCount = numVal(inputs, 'acUnitsCount', 2, 0, 6);
      const tvInches = numVal(inputs, 'tvInches', 55, 32, 85);
      const dishwasher = boolVal(inputs, 'includeDishwasher', false);
      const smallEssentials = boolVal(inputs, 'includeMicrowaveAndHeater', true);

      const mult = grade === 'economic' ? 0.78 : grade === 'premium_smart' ? 1.38 : 1.0;
      const fridge = Math.round(36000 * mult);
      const washer = Math.round(24500 * mult);
      const cooker = Math.round(18500 * mult);
      const tvCost = Math.round((tvInches >= 65 ? 29500 : tvInches >= 55 ? 21500 : 14500) * (grade === 'premium_smart' ? 1.25 : 1));
      const acCost = acCount * Math.round(25500 * (grade === 'economic' ? 0.85 : grade === 'premium_smart' ? 1.2 : 1));
      const dwCost = dishwasher ? Math.round(23500 * (grade === 'economic' ? 0.82 : 1.05)) : 0;
      const extrasCost = smallEssentials ? 16500 : 0;

      const total = fridge + washer + cooker + tvCost + acCost + dwCost + extrasCost;

      return {
        slug: 'groom-appliances',
        nameAr: 'حاسبة باقة أجهزة العريس الكهربائية',
        nameEn: "Groom's Large Appliances Package Calculator",
        primaryMetric: { labelAr: 'إجمالي ميزانية الأجهزة الكهربائية', labelEn: 'Estimated Appliances Package Total', value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'core4', labelAr: 'الأربعة الأساسية (ثلاجة+غسالة+بوتاجاز+شاشة)', labelEn: 'Big 4 Core Appliances', value: fmtEgp(fridge + washer + cooker + tvCost) },
          { key: 'monthly_18m', labelAr: 'قسط استرشادي على 18 شهر (بمقدم 20%)', labelEn: 'Indicative 18m Installment', value: fmtEgp((total * 0.8 * 1.27) / 18) },
        ],
        breakdown: [
          { key: 'fridge', labelAr: 'ثلاجة نوفروست', labelEn: 'No-Frost Refrigerator', amount: fridge, percent: pct(fridge, total) },
          { key: 'ac', labelAr: `تكييفات سبليت (${acCount} وحدة)`, labelEn: `Split ACs (${acCount} units)`, amount: acCost, percent: pct(acCost, total) },
          { key: 'washer', labelAr: 'غسالة أوتوماتيك', labelEn: 'Front-Load Washer', amount: washer, percent: pct(washer, total) },
          { key: 'tv', labelAr: `شاشة سمارت (${tvInches} بوصة)`, labelEn: `4K TV (${tvInches}")`, amount: tvCost, percent: pct(tvCost, total) },
          { key: 'cooker', labelAr: 'بوتاجاز 5 عيون / بلت إن', labelEn: '5-Burner Cooker / Hob', amount: cooker, percent: pct(cooker, total) },
          ...(dwCost > 0 ? [{ key: 'dw', labelAr: 'غسالة أطباق', labelEn: 'Dishwasher', amount: dwCost, percent: pct(dwCost, total) }] : []),
          ...(extrasCost > 0 ? [{ key: 'ext', labelAr: 'سخان + ميكروويف + مبرد مياه', labelEn: 'Water Heater, Microwave & Dispenser', amount: extrasCost, percent: pct(extrasCost, total) }] : []),
        ],
        formulaSummaryAr: '(ثلاجة + غسالة + بوتاجاز) × معامل الفئة + الشاشة + التكييفات + الأجهزة المضافة',
        formulaSummaryEn: '(Core Trio × Tier Multiplier) + TV + Split ACs + Dishwasher/Small Essentials',
        assumptionsAr: ['مبنية على متوسطات التوكيلات الموثوقة بضمان رسمي من 5–10 سنوات.'],
        assumptionsEn: ['Built around official Egyptian agent warranty units; check voltage protection & energy labels.'],
        warningsAr: grade === 'economic' && acCount === 0 ? ['تأكد من تأسيس صرف وفريون التكييف داخل الجدران أثناء تشطيب الشقة حتى لو تأجل الشراء.'] : [],
        warningsEn: grade === 'economic' && acCount === 0 ? ['Even if deferring AC purchase, lay concealed AC drains & copper sleeves during finishing.'] : [],
        suggestedBudgetCategorySlug: 'appliances',
        suggestedBudgetTitleAr: `باقة أجهزة العريس (${grade}, ${acCount} تكييف)`,
        suggestedBudgetTitleEn: `Groom Appliances (${grade}, ${acCount} ACs)`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #4: Bride Trousseau Calculator
  {
    slug: 'bride-trousseau',
    order: 4,
    categoryGroup: 'trousseau',
    nameAr: 'حاسبة ميزانية جهاز العروسة الذكي',
    nameEn: "Bride's Trousseau Budgeting Calculator",
    shortDescAr: 'تساعدك على تسعير وتوزيع جهاز المطبخ والمفروشات القطنية والسفرة بدون تكديس أو هدر.',
    shortDescEn: 'Prices cookware suites, Egyptian cotton linens, diningware & kitchen prep tools cleanly.',
    iconName: 'Sparkles',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'bride_trousseau',
    defaultInputs: {
      presetMode: 'balanced',
      linensSetsCount: 10,
      includeCrystalDining: true,
      smallKitchenPackLevel: 'complete',
    },
    fields: [
      {
        key: 'presetMode',
        type: 'select',
        labelAr: 'أسلوب قائمة العروسة',
        labelEn: 'Trousseau Preset Depth',
        options: [
          { value: 'compact', labelAr: 'القائمة العملية الذكية (Compact بلا تكرار)', labelEn: 'Compact Zero-Waste' },
          { value: 'balanced', labelAr: 'القائمة المتوازنة القياسية', labelEn: 'Balanced Standard' },
          { value: 'extended', labelAr: 'القائمة الموسعة الفاخرة', labelEn: 'Extended Luxury' },
        ],
      },
      { key: 'linensSetsCount', type: 'number', labelAr: 'عدد أطقم الملايات والمفروشات القطنية', labelEn: 'Egyptian Cotton Linen Sets', unitAr: 'طقم', unitEn: 'sets', min: 4, max: 24, step: 1 },
      { key: 'includeCrystalDining', type: 'boolean', labelAr: 'تضمين طقم صيني/بورسلين + كاسات ضيافة', labelEn: 'Include Porcelain Dinnerware & Hosting Glassware' },
      {
        key: 'smallKitchenPackLevel',
        type: 'select',
        labelAr: 'مجموعة أجهزة المطبخ الصغيرة (خلاط، إيرفراير، مضرب...)',
        labelEn: 'Small Kitchen Appliances Level',
        options: [
          { value: 'essential', labelAr: 'أساسي فقط (خلاط + هاند بليندر + كاتيل)', labelEn: 'Essential Trio Only' },
          { value: 'complete', labelAr: 'كامل عملي (+ إيرفراير + عجان/كبة)', labelEn: 'Complete Daily (+ Air Fryer & Processor)' },
        ],
      },
    ],
    compute(inputs) {
      const preset = strVal(inputs, 'presetMode', 'balanced', ['compact', 'balanced', 'extended']);
      const linens = numVal(inputs, 'linensSetsCount', 10, 4, 30);
      const crystal = boolVal(inputs, 'includeCrystalDining', true);
      const smallPack = strVal(inputs, 'smallKitchenPackLevel', 'complete', ['essential', 'complete']);

      const cookwareMult = preset === 'compact' ? 0.8 : preset === 'extended' ? 1.45 : 1.0;
      const cookwareCost = Math.round(28500 * cookwareMult);
      const linensCost = Math.round(linens * (preset === 'extended' ? 1950 : 1450) + (preset === 'extended' ? 18500 : 12000));
      const diningCrystalCost = crystal ? Math.round(19500 * (preset === 'extended' ? 1.55 : preset === 'compact' ? 0.75 : 1.0)) : 4500;
      const smallAppliancesCost = smallPack === 'complete' ? 21500 : 9500;
      const careCleaningOrg = preset === 'compact' ? 7500 : 11500;
      const total = cookwareCost + linensCost + diningCrystalCost + smallAppliancesCost + careCleaningOrg;

      return {
        slug: 'bride-trousseau',
        nameAr: 'حاسبة ميزانية جهاز العروسة الذكي',
        nameEn: "Bride's Trousseau Budgeting Calculator",
        primaryMetric: { labelAr: 'إجمالي ميزانية جهاز العروسة', labelEn: "Bride's Trousseau Estimated Total", value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'per_linens', labelAr: 'مفروشات وأقطان وبشاكير', labelEn: 'Linens & Bath Textiles', value: fmtEgp(linensCost) },
          { key: 'anti_waste', labelAr: 'توصية المساحة', labelEn: 'Zero-Waste Advice', value: linens > 14 ? 'High Storage Needed' : 'Optimal Closet Fit' },
        ],
        breakdown: [
          { key: 'cookware', labelAr: 'أواني الطهي والتفريز والصواني', labelEn: 'Cookware & Bakeware Suites', amount: cookwareCost, percent: pct(cookwareCost, total) },
          { key: 'linens', labelAr: `المفروشات القطنية والبطاطين (${linens} طقم)`, labelEn: `Cotton Linens & Duvet (${linens} sets)`, amount: linensCost, percent: pct(linensCost, total) },
          { key: 'small_app', labelAr: 'أجهزة المطبخ الصغيرة', labelEn: 'Small Kitchen Appliances', amount: smallAppliancesCost, percent: pct(smallAppliancesCost, total) },
          { key: 'dining', labelAr: 'السفرة والصيني والضيافة', labelEn: 'Dinnerware & Hosting', amount: diningCrystalCost, percent: pct(diningCrystalCost, total) },
          { key: 'care', labelAr: 'مستلزمات الحمام والتخزين والمكواة', labelEn: 'Bath Storage, Steam Iron & Organizers', amount: careCleaningOrg, percent: pct(careCleaningOrg, total) },
        ],
        formulaSummaryAr: 'أواني الطهي × معامل النمط + (أطقم المفروشات + الأغطية) + الضيافة + أجهزة المطبخ الصغيرة',
        formulaSummaryEn: 'Cookware × Preset Factor + Linens & Quilts + Diningware + Small Kitchen Appliances + Care',
        assumptionsAr: ['تتيح مقارنة الوفر بين النمط العملي والنمط الموسع بدون التضحية بالأساسيات.'],
        assumptionsEn: ['Highlights real savings between Compact Zero-Waste lists and traditional Extended bundles.'],
        warningsAr: linens > 14 ? ['أكثر من 14 طقم ملايات يستهلك مساحة تخزين كبيرة؛ يُفضل الاكتفاء بـ 8–10 أطقم قطن عالية التيلة.'] : [],
        warningsEn: linens > 14 ? ['Storing more than 14 sheet sets strains wardrobe space — 8 to 10 high-TC Egyptian cotton sets suffice.'] : [],
        suggestedBudgetCategorySlug: 'bride_trousseau',
        suggestedBudgetTitleAr: `تخطيط جهاز العروسة (${preset})`,
        suggestedBudgetTitleEn: `Bride Trousseau (${preset})`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #5: Gold & Shabka Calculator
  {
    slug: 'gold-jewelry',
    order: 5,
    categoryGroup: 'trousseau',
    nameAr: 'حاسبة ميزانية الشبكة والذهب',
    nameEn: 'Gold & Shabka Budget Calculator',
    shortDescAr: 'تحسب إجمالي تكلفة الشبكة حسب الوزن بالجرام وعيار الذهب وسعر الجرام اليومي + المصنعية والدمغة.',
    shortDescEn: 'Calculates engagement rings & jewelry total using editable local gram rate, weight & workmanship.',
    iconName: 'Gem',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'gold_shabka',
    defaultInputs: {
      karat: '21k',
      spotPricePerGramEgp: 3850,
      totalWeightGrams: 22,
      workmanshipPerGramEgp: 195,
    },
    fields: [
      {
        key: 'karat',
        type: 'select',
        labelAr: 'العيار المختار',
        labelEn: 'Gold Karat Purity',
        options: [
          { value: '21k', labelAr: 'عيار 21 (الأكثر شيوعاً في مصر)', labelEn: '21K Gold (Egyptian Standard)' },
          { value: '18k', labelAr: 'عيار 18 (تصميمات عصرية)', labelEn: '18K Gold (Modern Italian/Bridal)' },
        ],
      },
      {
        key: 'spotPricePerGramEgp',
        type: 'number',
        labelAr: 'سعر الجرام الخام اليوم (قابل للتعديل يدوياً)',
        labelEn: 'Current Market Spot Price / Gram (Editable)',
        unitAr: 'ج.م/جم',
        unitEn: 'EGP/g',
        min: 1000,
        max: 15000,
        step: 25,
      },
      { key: 'totalWeightGrams', type: 'number', labelAr: 'الوزن الإجمالي بالجرام (دبل + توينز + شبكه)', labelEn: 'Total Jewelry Weight', unitAr: 'جرام', unitEn: 'g', min: 2, max: 150, step: 1 },
      { key: 'workmanshipPerGramEgp', type: 'number', labelAr: 'متوسط المصنعية والدمغة والضريبة للجرام', labelEn: 'Workmanship + Hallmarking / Gram', unitAr: 'ج.م/جم', unitEn: 'EGP/g', min: 60, max: 800, step: 10 },
    ],
    compute(inputs) {
      const karat = strVal(inputs, 'karat', '21k', ['21k', '18k']);
      const spotPerGram = numVal(inputs, 'spotPricePerGramEgp', 3850, 500, 20000);
      const grams = numVal(inputs, 'totalWeightGrams', 22, 1, 300);
      const masnaeya = numVal(inputs, 'workmanshipPerGramEgp', 195, 20, 2000);

      const pureGoldValue = Math.round(grams * spotPerGram);
      const workmanshipValue = Math.round(grams * masnaeya);
      const total = pureGoldValue + workmanshipValue;

      return {
        slug: 'gold-jewelry',
        nameAr: 'حاسبة ميزانية الشبكة والذهب',
        nameEn: 'Gold & Shabka Budget Calculator',
        primaryMetric: { labelAr: `إجمالي تكلفة الشبكة (${grams} جم عيار ${karat === '21k' ? '21' : '18'})`, labelEn: `Total Shabka Estimate (${grams}g ${karat.toUpperCase()})`, value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'effective_gram', labelAr: 'سعر الجرام شامل المصنعية', labelEn: 'All-in Rate / Gram', value: fmtEgp(spotPerGram + masnaeya) },
          { key: 'work_pct', labelAr: 'نسبة المصنعية من الإجمالي', labelEn: 'Workmanship Share', value: `${pct(workmanshipValue, total)}%` },
        ],
        breakdown: [
          { key: 'gold', labelAr: `قيمة الذهب الصافي (${grams} جم × ${spotPerGram.toLocaleString()})`, labelEn: `Pure Gold Value (${grams}g)`, amount: pureGoldValue, percent: pct(pureGoldValue, total) },
          { key: 'masnaeya', labelAr: `المصنعية والدمغة (${grams} جم × ${masnaeya})`, labelEn: `Workmanship & Stamp (${grams}g)`, amount: workmanshipValue, percent: pct(workmanshipValue, total) },
        ],
        formulaSummaryAr: 'الإجمالي = (الوزن بالجرام × سعر الجرام المحدّث) + (الوزن بالجرام × المصنعية والدمغة)',
        formulaSummaryEn: 'Total = (Grams × User-Entered Spot Price/g) + (Grams × Workmanship/g)',
        assumptionsAr: [
          'سعر الجرام يتغير لحظياً؛ يُرجى إدخال تسعيرة اليوم من الصاغة قبل الشراء مباشرة.',
          'اطلب فاتورة ضريبية مفصل فيها الوزن بالجرام والعيار وسعر المصنعية لحفظ قيمة إعادة البيع.',
        ],
        assumptionsEn: [
          'Gold prices fluctuate daily — overwrite the spot EGP/g field with today’s live bullion board quote.',
          'Always obtain a stamped invoice listing exact weight in grams, karat, and workmanship.',
        ],
        warningsAr: masnaeya > 400 ? ['المصنعيات المرتفعة تفقد جزءاً من قيمتها عند إعادة البيع؛ راعِ التوازن بين الشكل والوزن.'] : [],
        warningsEn: masnaeya > 400 ? ['Very high workmanship fees are unrecoverable on resale — balance design elegance with solid gram retention.'] : [],
        suggestedBudgetCategorySlug: 'gold_shabka',
        suggestedBudgetTitleAr: `الشبكة (${grams} جرام عيار ${karat === '21k' ? '21' : '18'})`,
        suggestedBudgetTitleEn: `Shabka (${grams}g ${karat.toUpperCase()})`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #6: Wedding Ceremony Cost Calculator
  {
    slug: 'wedding-cost',
    order: 6,
    categoryGroup: 'celebration_life',
    nameAr: 'حاسبة تكلفة حفل الزفاف والقاعة',
    nameEn: 'Wedding Ceremony & Reception Cost Calculator',
    shortDescAr: 'تشمل سعر القاعة والعشاء لعدد المدعوين + الفستان والبدلة + التصوير + الزفة + الضريبة والخدمة.',
    shortDescEn: 'Models venue per-head dinner catering, dress/makeup, photo/video, decor & ++ taxes.',
    iconName: 'Heart',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'wedding',
    defaultInputs: {
      venueTier: 'social_club',
      guestsCount: 180,
      perGuestCostEgp: 360,
      dressSuitBeautyCost: 28000,
      photoVideoDecorCost: 26000,
      taxesAndServicePercent: 14,
    },
    fields: [
      {
        key: 'venueTier',
        type: 'select',
        labelAr: 'نوع ومستوى المكان',
        labelEn: 'Venue Format',
        options: [
          { value: 'katb_ketab', labelAr: 'كتب كتاب وإستقبال عائلي راقي', labelEn: 'Katb Ketab Intimate Reception' },
          { value: 'social_club', labelAr: 'نادي / قاعة اجتماعية متكاملة', labelEn: 'Social Club Ballroom' },
          { value: 'open_air_villa', labelAr: 'فيلا أوبن إير', labelEn: 'Open-Air Garden Villa' },
          { value: 'five_star_hotel', labelAr: 'فندق 5 نجوم', labelEn: '5-Star Hotel Ballroom' },
        ],
      },
      { key: 'guestsCount', type: 'number', labelAr: 'عدد المدعوين', labelEn: 'Expected Guests Count', unitAr: 'فرد', unitEn: 'guests', min: 30, max: 1000, step: 10 },
      { key: 'perGuestCostEgp', type: 'number', labelAr: 'تكلفة الفرد (بوفيه/عشاء + قاعة)', labelEn: 'Per-Guest Venue & Catering', unitAr: 'ج.م', unitEn: 'EGP', min: 100, max: 3500, step: 25 },
      { key: 'dressSuitBeautyCost', type: 'number', labelAr: 'الفستان + الميك أب + البدلة', labelEn: 'Dress, Makeup & Groom Suit', unitAr: 'ج.م', unitEn: 'EGP', min: 5000, max: 250000, step: 1000 },
      { key: 'photoVideoDecorCost', type: 'number', labelAr: 'التصوير + الزفة/DJ + الكوشة والورد', labelEn: 'Photo/Video + Zaffa/DJ + Decor', unitAr: 'ج.م', unitEn: 'EGP', min: 3000, max: 200000, step: 1000 },
      { key: 'taxesAndServicePercent', type: 'number', labelAr: 'ضريبة القيمة المضافة والخدمة (%)', labelEn: 'VAT & Service Charge (%)', unitAr: '%', unitEn: '%', min: 0, max: 30, step: 2 },
    ],
    compute(inputs) {
      const venueTier = strVal(inputs, 'venueTier', 'social_club', ['katb_ketab', 'social_club', 'open_air_villa', 'five_star_hotel']);
      const guests = numVal(inputs, 'guestsCount', 180, 20, 1500);
      const perGuest = numVal(inputs, 'perGuestCostEgp', 360, 50, 5000);
      const look = numVal(inputs, 'dressSuitBeautyCost', 28000, 0, 500000);
      const mediaDecor = numVal(inputs, 'photoVideoDecorCost', 26000, 0, 500000);
      const taxPct = numVal(inputs, 'taxesAndServicePercent', 14, 0, 35);

      const baseRentalFee = venueTier === 'five_star_hotel' ? 35000 : venueTier === 'open_air_villa' ? 28000 : venueTier === 'social_club' ? 14000 : 6000;
      const cateringSubtotal = guests * perGuest + baseRentalFee;
      const venueTax = Math.round(cateringSubtotal * (taxPct / 100));
      const total = cateringSubtotal + venueTax + look + mediaDecor;

      return {
        slug: 'wedding-cost',
        nameAr: 'حاسبة تكلفة حفل الزفاف والقاعة',
        nameEn: 'Wedding Ceremony & Reception Cost Calculator',
        primaryMetric: { labelAr: 'إجمالي تكلفة الفرح والخدمات', labelEn: 'All-In Wedding Night Cost', value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'per_guest_all_in', labelAr: 'التكلفة الحقيقية للفرد شامل الضريبة والخدمات', labelEn: 'All-In Cost / Guest', value: fmtEgp(total / guests) },
          { key: 'venue_tax', labelAr: 'رسوم الضريبة والخدمة المقدرة', labelEn: 'Estimated ++ Taxes/Service', value: fmtEgp(venueTax), rawValue: venueTax },
        ],
        breakdown: [
          { key: 'catering', labelAr: `القاعة وبوفيه ${guests} فرد (شامل رسوم المكان)`, labelEn: `Venue & Catering (${guests} guests)`, amount: cateringSubtotal, percent: pct(cateringSubtotal, total) },
          { key: 'look', labelAr: 'فستان الزفاف والميك أب وبدلة العريس', labelEn: 'Bridal Look & Groom Suit', amount: look, percent: pct(look, total) },
          { key: 'media', labelAr: 'التصوير والفيديو والزفة والدي جي والكوشة', labelEn: 'Photo/Video, DJ/Zaffa & Florals', amount: mediaDecor, percent: pct(mediaDecor, total) },
          { key: 'tax', labelAr: `الضريبة والخدمة (${taxPct}%)`, labelEn: `VAT & Service Charges (${taxPct}%)`, amount: venueTax, percent: pct(venueTax, total) },
        ],
        formulaSummaryAr: '(رسم القاعة الأساسي + عدد الضيوف × سعر الفرد) × (1 + نسبة الضريبة%) + الإطلالة + التصوير والديكور',
        formulaSummaryEn: '(Venue Base + Guests × Head Rate) × (1 + Tax/Service%) + Attire + Photo/Decor',
        assumptionsAr: ['في الفنادق الكبرى غالباً تصل الضريبة والخدمة معاً إلى 26–28% (++)، تأكد قبل التوقيع.'],
        assumptionsEn: ['5-star hotels frequently apply up to ~28% combined VAT & service (++); enter exact ++ quote above.'],
        warningsAr: venueTier === 'five_star_hotel' && taxPct < 24 ? ['تنبيه: فنادق الـ 5 نجوم تضيف عادة 14% ضريبة + 12% خدمة (26%+).'] : [],
        warningsEn: venueTier === 'five_star_hotel' && taxPct < 24 ? ['Alert: Most 5-star Egyptian hotels charge 26%+ combined tax & service charge (++).'] : [],
        suggestedBudgetCategorySlug: 'wedding',
        suggestedBudgetTitleAr: `فرح ${guests} فرد (${venueTier})`,
        suggestedBudgetTitleEn: `Wedding Reception (${guests} guests)`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #7: Furniture Calculator
  {
    slug: 'furniture-budget',
    order: 7,
    categoryGroup: 'trousseau',
    nameAr: 'حاسبة ميزانية الأثاث والموبيليا',
    nameEn: 'Home Furniture & Woodwork Budget Calculator',
    shortDescAr: 'تحسب تكلفة غرف النوم، الركنة أو الأنتريه، السفرة، والمراتب الطبية حسب نوع الخشب ومستوى التصنيع.',
    shortDescEn: 'Estimates master bedroom, kids room, living sofa, dining table & orthopedic mattresses by wood tier.',
    iconName: 'Armchair',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'furniture',
    defaultInputs: {
      woodGrade: 'contre_beech',
      bedroomsToFurnish: 2,
      includeFormalSalon: false,
      includeMattresses: true,
    },
    fields: [
      {
        key: 'woodGrade',
        type: 'select',
        labelAr: 'مستوى الخشب والتنجيد',
        labelEn: 'Carpentry & Wood Specification',
        options: [
          { value: 'economic_mdf', labelAr: 'عملي اقتصادي (كبس كونتر مع قوائم زان)', labelEn: 'Practical Economic Wood' },
          { value: 'contre_beech', labelAr: 'مواصفات دمياط الممتازة (كونتر جودو + زان أحمر)', labelEn: 'Damietta Beech + Goodwood Contre' },
          { value: 'custom_luxury', labelAr: 'تفصيل فاخر قشرة جوز/أرو طبيعي + إسفنج 38', labelEn: 'Bespoke Walnut/Oak Veneer + High Density' },
        ],
      },
      { key: 'bedroomsToFurnish', type: 'number', labelAr: 'عدد غرف النوم المطلوب فرشها', labelEn: 'Bedrooms to Furnish', unitAr: 'غرفة', unitEn: 'rooms', min: 1, max: 4, step: 1 },
      { key: 'includeFormalSalon', type: 'boolean', labelAr: 'إضافة صالون استقبال منفصل بجانب الركنة', labelEn: 'Include Formal Reception Salon' },
      { key: 'includeMattresses', type: 'boolean', labelAr: 'إضافة المراتب الطبية والملل الخشبية', labelEn: 'Include Orthopedic Mattresses & Slats' },
    ],
    compute(inputs) {
      const wood = strVal(inputs, 'woodGrade', 'contre_beech', ['economic_mdf', 'contre_beech', 'custom_luxury']);
      const bedrooms = numVal(inputs, 'bedroomsToFurnish', 2, 1, 5);
      const salon = boolVal(inputs, 'includeFormalSalon', false);
      const mattresses = boolVal(inputs, 'includeMattresses', true);

      const mult = wood === 'economic_mdf' ? 0.72 : wood === 'custom_luxury' ? 1.45 : 1.0;
      const masterCost = Math.round(48000 * mult);
      const extraBedCost = Math.round(Math.max(0, bedrooms - 1) * 32000 * mult);
      const livingSofaCost = Math.round(31000 * mult);
      const diningCost = Math.round(33000 * mult);
      const salonCost = salon ? Math.round(44000 * mult) : 0;
      const mattressCost = mattresses ? 10500 + Math.max(0, bedrooms - 1) * 7500 : 0;

      const total = masterCost + extraBedCost + livingSofaCost + diningCost + salonCost + mattressCost;

      return {
        slug: 'furniture-budget',
        nameAr: 'حاسبة ميزانية الأثاث والموبيليا',
        nameEn: 'Home Furniture & Woodwork Budget Calculator',
        primaryMetric: { labelAr: 'إجمالي ميزانية الأثاث', labelEn: 'Estimated Furniture Total', value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'beds', labelAr: 'توصية المعاينة', labelEn: 'Damietta Check Rule', value: wood === 'contre_beech' ? 'Inspect Raw White Wood' : 'Check Warranty Invoice' },
          { key: 'share_living', labelAr: 'النوم + الركنة الأساسية', labelEn: 'Master + Everyday Sofa', value: fmtEgp(masterCost + livingSofaCost) },
        ],
        breakdown: [
          { key: 'master', labelAr: 'غرفة النوم الماستر', labelEn: 'Master Bedroom', amount: masterCost, percent: pct(masterCost, total) },
          ...(extraBedCost > 0 ? [{ key: 'extra', labelAr: `غرف النوم الإضافية (${bedrooms - 1})`, labelEn: `Additional Bedrooms (${bedrooms - 1})`, amount: extraBedCost, percent: pct(extraBedCost, total) }] : []),
          { key: 'dining', labelAr: 'السفرة (ترابيزة + 6 كراسي + بوفيه)', labelEn: 'Dining Set + Sideboard', amount: diningCost, percent: pct(diningCost, total) },
          { key: 'living', labelAr: 'ركنة المعيشة + طاولة القهوة', labelEn: 'Living L-Sofa + Coffee Table', amount: livingSofaCost, percent: pct(livingSofaCost, total) },
          ...(salonCost > 0 ? [{ key: 'salon', labelAr: 'صالون الضيوف', labelEn: 'Formal Guest Salon', amount: salonCost, percent: pct(salonCost, total) }] : []),
          ...(mattressCost > 0 ? [{ key: 'mattress', labelAr: 'مراتب السوست المنفصلة الطبية', labelEn: 'Pocket-Spring Orthopedic Mattresses', amount: mattressCost, percent: pct(mattressCost, total) }] : []),
        ],
        formulaSummaryAr: '(سعر الماستر + الغرف الإضافية + الركنة + السفرة + الصالون) × معامل الخشب + المراتب',
        formulaSummaryEn: '(Master + Extra Beds + Living + Dining + Optional Salon) × Wood Grade Multiplier + Mattresses',
        assumptionsAr: ['عاين الخشب أبيض قبل الدهان واكتب في الفاتورة نوع الخشب (زان أحمر + كونتر) وكثافة الإسفنج (33+).'],
        assumptionsEn: ['Inspect bare frames prior to lacquer and specify kiln-dried beech & density-33+ foam on receipts.'],
        warningsAr: [],
        warningsEn: [],
        suggestedBudgetCategorySlug: 'furniture',
        suggestedBudgetTitleAr: `أثاث ${bedrooms} غرف (${wood})`,
        suggestedBudgetTitleEn: `Furniture (${bedrooms} rooms, ${wood})`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #14: Monthly Electricity Estimator
  {
    slug: 'electricity-consumption',
    order: 14,
    categoryGroup: 'celebration_life',
    nameAr: 'حاسبة استهلاك الكهرباء الشهري للأجهزة',
    nameEn: 'Appliances Monthly Electricity Cost Estimator',
    shortDescAr: 'تقارن فاتورة الكهرباء المتوقعة شهرياً للثلاجة والغسالة والتكييفات وتوضح وفر تقنية الإنفرتر.',
    shortDescEn: 'Estimates monthly kWh & illustrative EGP electricity bill based on ACs, fridge inverter & usage.',
    iconName: 'Zap',
    primaryUnit: 'kWh/mo',
    suggestedBudgetCategorySlug: 'emergency',
    defaultInputs: {
      isInverterFridgeAndAc: true,
      acDailyHoursTotal: 8,
      washerCyclesPerWeek: 4,
      electricWaterHeaterOn: true,
    },
    fields: [
      { key: 'isInverterFridgeAndAc', type: 'boolean', labelAr: 'أجهزة بتقنية إنفرتر موفرة للطاقة (توفر ~32%)', labelEn: 'Inverter Compressor Fridge & ACs (~32% Savings)' },
      { key: 'acDailyHoursTotal', type: 'number', labelAr: 'إجمالي ساعات تشغيل التكييف يومياً', labelEn: 'Daily Split AC Hours (Combined)', unitAr: 'ساعة/يوم', unitEn: 'hr/day', min: 0, max: 24, step: 1 },
      { key: 'washerCyclesPerWeek', type: 'number', labelAr: 'عدد دورات غسيل الملابس أسبوعياً', labelEn: 'Washer Cycles / Week', unitAr: 'دورة', unitEn: 'cycles', min: 1, max: 14, step: 1 },
      { key: 'electricWaterHeaterOn', type: 'boolean', labelAr: 'تشغيل سخان مياه كهربائي (بدل الغاز)', labelEn: 'Electric Storage Water Heater Active' },
    ],
    compute(inputs) {
      const inverter = boolVal(inputs, 'isInverterFridgeAndAc', true);
      const acHrs = numVal(inputs, 'acDailyHoursTotal', 8, 0, 36);
      const washerCycles = numVal(inputs, 'washerCyclesPerWeek', 4, 1, 20);
      const electricHeater = boolVal(inputs, 'electricWaterHeaterOn', true);

      const fridgeKwh = inverter ? 38 : 62;
      const acKwh = Math.round(acHrs * 30 * (inverter ? 0.92 : 1.38));
      const washerKwh = Math.round(washerCycles * 4.3 * 1.15);
      const heaterKwh = electricHeater ? 105 : 15;
      const lightingTvBase = 75;
      const totalKwh = fridgeKwh + acKwh + washerKwh + heaterKwh + lightingTvBase;

      // Illustrative stepped Egyptian residential tariff approximation
      const blendedTariff = totalKwh > 650 ? 2.15 : totalKwh > 350 ? 1.75 : 1.25;
      const estBillEgp = Math.round(totalKwh * blendedTariff);
      const nonInverterBill = Math.round((totalKwh + (inverter ? 130 : 0)) * blendedTariff);
      const inverterSavings = inverter ? Math.max(0, nonInverterBill - estBillEgp) : 0;

      return {
        slug: 'electricity-consumption',
        nameAr: 'حاسبة استهلاك الكهرباء الشهري للأجهزة',
        nameEn: 'Appliances Monthly Electricity Cost Estimator',
        primaryMetric: { labelAr: 'الاستهلاك الشهري المقدر', labelEn: 'Estimated Monthly Consumption', value: totalKwh, unit: 'kWh/mo', unitLabelAr: 'كيلووات/شهر', unitLabelEn: 'kWh/mo' },
        secondaryMetrics: [
          { key: 'bill', labelAr: 'متوسط الفاتورة الشهرية التقريبية', labelEn: 'Illustrative Monthly Bill', value: fmtEgp(estBillEgp), rawValue: estBillEgp },
          { key: 'saving', labelAr: inverter ? 'وفر الإنفرتر التقديري/سنة' : 'خسارة عدم وجود إنفرتر/سنة', labelEn: inverter ? 'Annual Inverter Savings' : 'Potential Annual Savings', value: fmtEgp((inverter ? inverterSavings : 260) * 12) },
        ],
        breakdown: [
          { key: 'ac', labelAr: `التكييفات (${acHrs} ساعة/يوم)`, labelEn: `Split ACs (${acHrs}h/day)`, amount: acKwh, unit: 'kWh', unitLabelAr: 'ك.و', unitLabelEn: 'kWh', percent: pct(acKwh, totalKwh) },
          { key: 'heater', labelAr: electricHeater ? 'سخان المياه الكهربائي' : 'استهلاك غاز / سخان فوري', labelEn: electricHeater ? 'Electric Water Heater' : 'Gas Igniter / Minor', amount: heaterKwh, unit: 'kWh', unitLabelAr: 'ك.و', unitLabelEn: 'kWh', percent: pct(heaterKwh, totalKwh) },
          { key: 'base', labelAr: 'الإضاءة والشاشات والمطبخ', labelEn: 'Lighting, TVs & Small Kitchen', amount: lightingTvBase, unit: 'kWh', unitLabelAr: 'ك.و', unitLabelEn: 'kWh', percent: pct(lightingTvBase, totalKwh) },
          { key: 'fridge', labelAr: 'الثلاجة (24 ساعة)', labelEn: 'Refrigerator (24/7)', amount: fridgeKwh, unit: 'kWh', unitLabelAr: 'ك.و', unitLabelEn: 'kWh', percent: pct(fridgeKwh, totalKwh) },
          { key: 'washer', labelAr: `الغسالة (${washerCycles} دورات/أسبوع)`, labelEn: `Washer (${washerCycles} cycles/wk)`, amount: washerKwh, unit: 'kWh', unitLabelAr: 'ك.و', unitLabelEn: 'kWh', percent: pct(washerKwh, totalKwh) },
        ],
        formulaSummaryAr: 'مجموع استهلاك الأجهزة بالكيلووات × الشريحة الاستهلاكية الاسترشادية للشقة',
        formulaSummaryEn: 'Sum of Monthly Appliance kWh × Illustrative Residential Tariff Bracket',
        assumptionsAr: ['تقدير فني استرشادي للشرائح السكنية لمقارنة تكلفة التشغيل السنوية قبل شراء الأجهزة.'],
        assumptionsEn: ['Illustrative consumption estimate for comparing lifetime appliance running cost before purchasing.'],
        warningsAr: totalKwh > 650 ? ['تجاوز حاجز 650 ك.و/شهر ينقل الشريحة لمستوى أعلى؛ تكييف وإنفرتر وغاز طبيعي يخفض الفاتورة بشدة.'] : [],
        warningsEn: totalKwh > 650 ? ['Exceeding 650 kWh/month lifts tariff tiers sharply; inverter units & gas heaters cut ongoing utility costs.'] : [],
        suggestedBudgetCategorySlug: 'emergency',
        suggestedBudgetTitleAr: `تقدير فاتورة الكهرباء (${totalKwh} ك.و)`,
        suggestedBudgetTitleEn: `Monthly Electricity Plan (${totalKwh} kWh)`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #15: Moving & Crane Hoist Calculator
  {
    slug: 'moving-cost',
    order: 15,
    categoryGroup: 'celebration_life',
    nameAr: 'حاسبة تكلفة نقل العفش والونش والتغليف',
    nameEn: 'Furniture Moving, Packing & Crane Cost Calculator',
    shortDescAr: 'تحسب تكلفة سيارة النقل المغلقة، العمالة المتخصصة، التغليف الفقاعي، واستئجار ونش رفع الأثاث حسب الدور.',
    shortDescEn: 'Prices closed moving truck, trained movers, bubble/stretch packing & exterior crane hoist by floor.',
    iconName: 'Truck',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'emergency',
    defaultInputs: {
      roomsCount: 3,
      destinationFloor: 5,
      useHydraulicCrane: true,
      includeFullPacking: true,
      distanceZone: 'same_governorate',
    },
    fields: [
      { key: 'roomsCount', type: 'number', labelAr: 'عدد الغرف والقطع المنقولة', labelEn: 'Rooms / Load Size', unitAr: 'غرفة', unitEn: 'rooms', min: 1, max: 6, step: 1 },
      { key: 'destinationFloor', type: 'number', labelAr: 'الدور السكني للشقة الجديدة', labelEn: 'Destination Apartment Floor', unitAr: 'دور', unitEn: 'floor', min: 1, max: 16, step: 1 },
      { key: 'useHydraulicCrane', type: 'boolean', labelAr: 'تضمين ونش رفع أثاث هيدروليكي للواجهة', labelEn: 'Include Exterior Hydraulic Furniture Crane' },
      { key: 'includeFullPacking', type: 'boolean', labelAr: 'تغليف شامل (بابليز، كرتون، استرتش، نجار فك وتركيب)', labelEn: 'Full Bubble Packing + Carpenter Disassembly' },
      {
        key: 'distanceZone',
        type: 'select',
        labelAr: 'المسافة والنطاق الجغرافي',
        labelEn: 'Route Distance',
        options: [
          { value: 'same_governorate', labelAr: 'داخل نفس المحافظة', labelEn: 'Same Governorate / City' },
          { value: 'greater_cairo_edge', labelAr: 'توسعات المدن الجديدة (التجمع/أكتوبر/العبور)', labelEn: 'New Cities Ring Transfer' },
          { value: 'inter_governorate', labelAr: 'سفر بين المحافظات (مثل دمياط -> القاهرة)', labelEn: 'Inter-Governorate Long Haul' },
        ],
      },
    ],
    compute(inputs) {
      const rooms = numVal(inputs, 'roomsCount', 3, 1, 7);
      const floor = numVal(inputs, 'destinationFloor', 5, 1, 20);
      const crane = boolVal(inputs, 'useHydraulicCrane', true);
      const packing = boolVal(inputs, 'includeFullPacking', true);
      const zone = strVal(inputs, 'distanceZone', 'same_governorate', ['same_governorate', 'greater_cairo_edge', 'inter_governorate']);

      const truckCost = zone === 'inter_governorate' ? 4800 : zone === 'greater_cairo_edge' ? 2400 : 1650;
      const crewCarpenterCost = 1100 + rooms * 380;
      const craneCost = crane ? (floor > 7 ? 2400 : 1450) : floor * 260;
      const packingCost = packing ? 950 + rooms * 420 : 0;
      const total = truckCost + crewCarpenterCost + craneCost + packingCost;

      return {
        slug: 'moving-cost',
        nameAr: 'حاسبة تكلفة نقل العفش والونش والتغليف',
        nameEn: 'Furniture Moving, Packing & Crane Cost Calculator',
        primaryMetric: { labelAr: 'إجمالي تكلفة النقل والتسليم الآمن', labelEn: 'Estimated Safe Moving Total', value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'crane_note', labelAr: crane ? 'حماية الأثاث والأجهزة' : 'تنبيه حمل السلالم', labelEn: crane ? 'Crane Hoist Protection' : 'Staircarry Note', value: crane ? 'Zero Stair Scratches' : `Floor ${floor} Stair Fee` },
        ],
        breakdown: [
          { key: 'truck', labelAr: 'سيارة نقل مجهزة مغلقة (جامبو)', labelEn: 'Enclosed Padded Truck', amount: truckCost, percent: pct(truckCost, total) },
          { key: 'crew', labelAr: 'فني فك وتركيب (نجار/تكييف) + عمالة', labelEn: 'Trained Movers & Joinery Carpenter', amount: crewCarpenterCost, percent: pct(crewCarpenterCost, total) },
          { key: 'crane', labelAr: crane ? `ونش رفع هيدروليك (الدور ${floor})` : `رفع يدوي للسلالم (الدور ${floor})`, labelEn: crane ? `Hydraulic Crane (Floor ${floor})` : `Manual Stair Carry (Floor ${floor})`, amount: craneCost, percent: pct(craneCost, total) },
          ...(packingCost > 0 ? [{ key: 'packing', labelAr: 'خامات التغليف (كرتون + استرتش + بابلز)', labelEn: 'Bubble Wrap, Boxes & Stretch Pack', amount: packingCost, percent: pct(packingCost, total) }] : []),
        ],
        formulaSummaryAr: 'سيارة النقل حسب المسافة + النجار والعمالة + (الونش أو دور السلم) + خامات التغليف',
        formulaSummaryEn: 'Closed Truck + Carpenter & Movers + (Crane or Stair Carry by Floor) + Packing Materials',
        assumptionsAr: ['يوصى دائماً باستخدام الونش من الدور الثالث فما فوق لحماية الثلاجات والمرايا وبانوهات الخشب.'],
        assumptionsEn: ['Hydraulic cranes from Floor 3+ dramatically prevent cracked mirrors, door-frame dings & fridge damage.'],
        warningsAr: !crane && floor >= 4 ? ['تنبيه: رفع الثلاجة والأثاث يدوياً عبر السلم للدور الرابع فأعلى يعرضها للكسر ويزيد أجرة العمال.'] : [],
        warningsEn: !crane && floor >= 4 ? ['Carrying wide fridges & beds manually up 4+ flights risks wall/appliance damage; crane hoist recommended.'] : [],
        suggestedBudgetCategorySlug: 'emergency',
        suggestedBudgetTitleAr: `نقل الأثاث وونش الدور ${floor}`,
        suggestedBudgetTitleEn: `Moving & Crane (Floor ${floor})`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #16: Honeymoon Budget Calculator
  {
    slug: 'honeymoon-budget',
    order: 16,
    categoryGroup: 'celebration_life',
    nameAr: 'حاسبة ميزانية شهر العسل والسفر',
    nameEn: 'Honeymoon Trip Budget Calculator',
    shortDescAr: 'تقدير كامل لتكلفة الإقامة الفندقية، المواصلات أو الطيران، والرحلات والمصروف اليومي لشخصين.',
    shortDescEn: 'Calculates couples accommodation, flights/transfers, excursions & daily spending pocket.',
    iconName: 'Plane',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'honeymoon',
    defaultInputs: {
      destination: 'red_sea',
      nightsCount: 6,
      hotelGrade: 'five_star',
      dailyPocketEgp: 2200,
    },
    fields: [
      {
        key: 'destination',
        type: 'select',
        labelAr: 'الوجهة المختارة',
        labelEn: 'Honeymoon Destination',
        options: [
          { value: 'dahab_sokhna', labelAr: 'دهب / العين السخنة / سيوة', labelEn: 'Dahab / Ain Sokhna / Siwa' },
          { value: 'red_sea', labelAr: 'شرم الشيخ / الجونة / الغردقة', labelEn: 'Sharm El-Sheikh / El Gouna / Hurghada' },
          { value: 'nile_cruise', labelAr: 'الأقصر وأسوان (كروز 5 نجوم)', labelEn: 'Luxor & Aswan 5-Star Nile Cruise' },
          { value: 'turkey_regional', labelAr: 'سفر إقليمي (شرم خارجي / أنطاليا / دبي)', labelEn: 'Regional Flight (Turkey / Dubai)' },
        ],
      },
      { key: 'nightsCount', type: 'number', labelAr: 'عدد الليالي', labelEn: 'Nights Count', unitAr: 'ليلة', unitEn: 'nights', min: 2, max: 14, step: 1 },
      {
        key: 'hotelGrade',
        type: 'select',
        labelAr: 'تصنيف الفندق والإقامة',
        labelEn: 'Hotel & Meal Plan',
        options: [
          { value: 'four_star', labelAr: '4 نجوم متميز (نصف إقامة)', labelEn: '4-Star Boutique (Half Board)' },
          { value: 'five_star', labelAr: '5 نجوم شامل كلياً (All-Inclusive)', labelEn: '5-Star Resort (All-Inclusive)' },
        ],
      },
      { key: 'dailyPocketEgp', type: 'number', labelAr: 'مصروف الأنشطة والمشتريات والهدايا يومياً', labelEn: 'Daily Excursions & Spending / Day', unitAr: 'ج.م', unitEn: 'EGP', min: 500, max: 15000, step: 250 },
    ],
    compute(inputs) {
      const dest = strVal(inputs, 'destination', 'red_sea', ['dahab_sokhna', 'red_sea', 'nile_cruise', 'turkey_regional']);
      const nights = numVal(inputs, 'nightsCount', 6, 2, 21);
      const grade = strVal(inputs, 'hotelGrade', 'five_star', ['four_star', 'five_star']);
      const dailyPocket = numVal(inputs, 'dailyPocketEgp', 2200, 300, 30000);

      const nightlyRate =
        dest === 'turkey_regional'
          ? grade === 'five_star' ? 9800 : 6200
          : dest === 'nile_cruise'
            ? grade === 'five_star' ? 8500 : 5400
            : dest === 'red_sea'
              ? grade === 'five_star' ? 6200 : 3900
              : grade === 'five_star' ? 4600 : 2800;

      const flightsOrTransfer = dest === 'turkey_regional' ? 38000 : dest === 'nile_cruise' ? 9500 : dest === 'red_sea' ? 8000 : 2800;
      const hotelTotal = nights * nightlyRate;
      const pocketTotal = (nights + 1) * dailyPocket;
      const total = hotelTotal + flightsOrTransfer + pocketTotal;

      return {
        slug: 'honeymoon-budget',
        nameAr: 'حاسبة ميزانية شهر العسل والسفر',
        nameEn: 'Honeymoon Trip Budget Calculator',
        primaryMetric: { labelAr: 'إجمالي ميزانية شهر العسل لشخصين', labelEn: 'Total Honeymoon Budget (Couples)', value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'per_night', labelAr: 'متوسط تكلفة الليلة الشاملة', labelEn: 'All-in Avg / Night', value: fmtEgp(total / nights) },
          { key: 'hotel', labelAr: 'باقة الفندق والإقامة', labelEn: 'Hotel Stay Portion', value: fmtEgp(hotelTotal) },
        ],
        breakdown: [
          { key: 'hotel', labelAr: `إقامة ${nights} ليالي لشخصين (${grade})`, labelEn: `${nights} Nights Couples Stay`, amount: hotelTotal, percent: pct(hotelTotal, total) },
          { key: 'pocket', labelAr: 'الرحلات البحرية والمشتريات والمصروف اليومي', labelEn: 'Activities & Daily Spending Pocket', amount: pocketTotal, percent: pct(pocketTotal, total) },
          { key: 'travel', labelAr: 'تذاكر الطيران أو الانتقالات الداخلية', labelEn: 'Flights / Transfers for Two', amount: flightsOrTransfer, percent: pct(flightsOrTransfer, total) },
        ],
        formulaSummaryAr: '(عدد الليالي × سعر الليلة لشخصين) + الطيران/الانتقالات + (الأيام × المصروف اليومي)',
        formulaSummaryEn: '(Nights × Couples Nightly Rate) + Flights/Transfers + (Days × Daily Spending)',
        assumptionsAr: ['تختلف أسعار المنتجعات والطيران موسمياً (الشتاء لأقصر وأسوان والصيف للساحل والبحر الأحمر).'],
        assumptionsEn: ['Seasonal rates peak in winter for Luxor/Aswan and summer/Eid holidays for Red Sea resorts.'],
        warningsAr: [],
        warningsEn: [],
        suggestedBudgetCategorySlug: 'honeymoon',
        suggestedBudgetTitleAr: `شهر العسل (${nights} ليالي - ${dest})`,
        suggestedBudgetTitleEn: `Honeymoon (${nights}n ${dest})`,
        computedAt: new Date().toISOString(),
      };
    },
  },
];

import { FINISHING_TIER_RATES_EGP } from '../catalogMeta';
import type { FinishingTier } from '../types';
import {
  GOVERNORATE_FACTORS,
  boolVal,
  fmtEgp,
  fmtEgpAr,
  numVal,
  pct,
  strVal,
  type CalculatorDefinition,
} from './helpers';

export const HOME_FINISHING_CALCULATORS: CalculatorDefinition[] = [
  // #2: Apartment Finishing Cost Calculator
  {
    slug: 'finishing-cost',
    order: 2,
    categoryGroup: 'finishing_home',
    nameAr: 'حاسبة تكلفة تشطيب الشقة',
    nameEn: 'Apartment Finishing Cost Calculator',
    shortDescAr: 'تقدير دقيق للتكلفة حسب المساحة، حالة الاستلام (طوب أحمر/نصف تشطيب)، مستوى الباقة، والمحافظة.',
    shortDescEn: 'Estimate finishing total by apartment m², shell condition, finish tier & Egyptian governorate.',
    iconName: 'Building2',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'finishing',
    defaultInputs: {
      areaSqm: 120,
      tier: 'medium',
      condition: 'red_brick',
      bathroomsCount: 2,
      governorate: 'cairo',
      includeGypsumAndAcPrep: true,
    },
    fields: [
      {
        key: 'areaSqm',
        type: 'number',
        labelAr: 'مساحة الشقة الإجمالية',
        labelEn: 'Apartment Gross Area',
        unitAr: 'م²',
        unitEn: 'm²',
        min: 55,
        max: 450,
        step: 5,
      },
      {
        key: 'tier',
        type: 'select',
        labelAr: 'مستوى باقة التشطيب',
        labelEn: 'Finishing Package Tier',
        options: [
          { value: 'economic', labelAr: 'الباقة الاقتصادية (3,400 ج.م/م²)', labelEn: 'Economic (3,400 EGP/m²)' },
          { value: 'medium', labelAr: 'الباقة المتوسطة المتوازنة (4,300 ج.م/م²)', labelEn: 'Medium Balanced (4,300 EGP/m²)' },
          { value: 'luxury', labelAr: 'الباقة المتميزة الفاخرة (5,200 ج.م/م²)', labelEn: 'Luxury (5,200 EGP/m²)' },
          { value: 'ultra_luxury', labelAr: 'الباقة الملكية السمارت (7,800 ج.م/م²)', labelEn: 'Ultra Luxury Smart (7,800 EGP/m²)' },
        ],
      },
      {
        key: 'condition',
        type: 'select',
        labelAr: 'حالة استلام الشقة',
        labelEn: 'Delivery Condition',
        options: [
          { value: 'red_brick', labelAr: 'على الطوب الأحمر (100% من البداية)', labelEn: 'Red Brick / Core & Shell (100%)' },
          { value: 'semi_finished', labelAr: 'نصف تشطيب محارة وحلوق (-22%)', labelEn: 'Semi-Finished Plastered (-22%)' },
          { value: 'renovation', labelAr: 'تجديد شقة قديمة شامل تكسير (+12%)', labelEn: 'Full Renovation w/ Demo (+12%)' },
        ],
      },
      {
        key: 'bathroomsCount',
        type: 'number',
        labelAr: 'عدد الحمامات والمطبخ',
        labelEn: 'Bathrooms Count',
        unitAr: 'حمام',
        unitEn: 'bath',
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: 'governorate',
        type: 'select',
        labelAr: 'المحافظة / المنطقة',
        labelEn: 'Governorate / Region',
        options: Object.entries(GOVERNORATE_FACTORS).map(([value, g]) => ({
          value,
          labelAr: g.labelAr,
          labelEn: g.labelEn,
        })),
      },
      {
        key: 'includeGypsumAndAcPrep',
        type: 'boolean',
        labelAr: 'تضمين جبسن بورد وتأسيس صرف وفريون التكييفات',
        labelEn: 'Include gypsum ceilings & AC drain/copper prep',
      },
    ],
    compute(inputs) {
      const areaSqm = numVal(inputs, 'areaSqm', 120, 40, 600);
      const tier = strVal<FinishingTier>(inputs, 'tier', 'medium', [
        'economic',
        'medium',
        'luxury',
        'ultra_luxury',
      ]);
      const condition = strVal(inputs, 'condition', 'red_brick', [
        'red_brick',
        'semi_finished',
        'renovation',
      ]);
      const bathroomsCount = numVal(inputs, 'bathroomsCount', 2, 1, 6);
      const govSlug = strVal<string>(inputs, 'governorate', 'cairo');
      const includeGypsum = boolVal(inputs, 'includeGypsumAndAcPrep', true);

      const baseRate = FINISHING_TIER_RATES_EGP[tier] ?? 4300;
      const condMult = condition === 'semi_finished' ? 0.78 : condition === 'renovation' ? 1.12 : 1.0;
      const govFactor = GOVERNORATE_FACTORS[govSlug]?.factor ?? 1.0;

      const shellBase = Math.round(areaSqm * baseRate * condMult * govFactor);
      const extraWetZone = Math.max(0, bathroomsCount - 1) * Math.round(14500 * govFactor);
      const acGypsumAddon = includeGypsum ? Math.round(areaSqm * 260 * govFactor) : 0;
      const total = shellBase + extraWetZone + acGypsumAddon;

      const mepShare = Math.round(total * 0.25);
      const plasterWaterproofShare = Math.round(total * 0.16);
      const flooringPaintShare = Math.round(total * 0.34);
      const carpentryAlumShare = Math.round(total * 0.15);
      const contingencyBuffer = total - (mepShare + plasterWaterproofShare + flooringPaintShare + carpentryAlumShare);
      const minBand = Math.round(total * 0.93);
      const maxBand = Math.round(total * 1.1);
      const effectivePerSqm = Math.round(total / areaSqm);

      return {
        slug: 'finishing-cost',
        nameAr: 'حاسبة تكلفة تشطيب الشقة',
        nameEn: 'Apartment Finishing Cost Calculator',
        primaryMetric: {
          labelAr: 'التكلفة التقديرية لتشطيب الشقة',
          labelEn: 'Estimated Apartment Finishing Budget',
          value: total,
          unit: 'EGP',
          unitLabelAr: 'ج.م',
          unitLabelEn: 'EGP',
        },
        secondaryMetrics: [
          {
            key: 'effective_sqm',
            labelAr: 'سعر المتر المعدّل',
            labelEn: 'Effective Rate / m²',
            value: fmtEgp(effectivePerSqm),
            rawValue: effectivePerSqm,
          },
          {
            key: 'range_band',
            labelAr: 'النطاق السعري الواقعي',
            labelEn: 'Realistic Market Band',
            value: `${Math.round(minBand / 1000)}k – ${Math.round(maxBand / 1000)}k EGP`,
          },
          {
            key: 'contingency',
            labelAr: 'احتياطي فروق بنود (10%)',
            labelEn: 'BOQ Buffer (10%)',
            value: fmtEgp(contingencyBuffer),
            rawValue: contingencyBuffer,
          },
        ],
        breakdown: [
          {
            key: 'flooring_paint',
            labelAr: 'الأرضيات والسيراميك والدهانات (34%)',
            labelEn: 'Flooring, Porcelain & Paints (34%)',
            amount: flooringPaintShare,
            unit: 'EGP',
            percent: 34,
          },
          {
            key: 'mep',
            labelAr: 'تأسيس وتشطيب الكهرباء والسباكة والتكييفات (25%)',
            labelEn: 'Electrical, Plumbing & HVAC Rough-in (25%)',
            amount: mepShare,
            unit: 'EGP',
            percent: 25,
          },
          {
            key: 'plaster_waterproof',
            labelAr: 'المحارة والعزل المائي والحراري والجبس (16%)',
            labelEn: 'Plastering, Waterproofing & Gypsum (16%)',
            amount: plasterWaterproofShare,
            unit: 'EGP',
            percent: 16,
          },
          {
            key: 'carpentry_alum',
            labelAr: 'الأبواب والنجارة والشبابيك الألوميتال (15%)',
            labelEn: 'Doors, Woodwork & Acoustic Aluminum (15%)',
            amount: carpentryAlumShare,
            unit: 'EGP',
            percent: 15,
          },
          {
            key: 'contingency',
            labelAr: 'تشوين وهدر ونقل ورسوم تسليم (10%)',
            labelEn: 'Logistics, Haulage & Snagging Buffer (10%)',
            amount: contingencyBuffer,
            unit: 'EGP',
            percent: 10,
          },
        ],
        formulaSummaryAr:
          '(المساحة × سعر المتر الأساسي × معامل حالة الشقة × معامل المحافظة) + إضافي الحمامات + (جبسن بورد وتأسيس التكييفات)',
        formulaSummaryEn:
          '(Area × Tier EGP/m² × Condition Multiplier × Governorate Index) + Extra Wet Zones + AC/Gypsum Scope',
        assumptionsAr: [
          'تقدير استرشادي بأسعار خامات ومصنعيات 2026، ولا يشمل المطبخ الخشبي أو أجهزة التكييف.',
          'تمت إضافة بند حمامات إضافية بقيمة 14,500 ج.م للحمام الإضافي لتغطية العزل والصحّي والسباكة.',
        ],
        assumptionsEn: [
          '2026 baseline estimate covering materials & trades; excludes modular kitchen cabinetry & AC compressors.',
          'Each additional bathroom adds ~14,500 EGP baseline for extra piping, waterproofing & fixtures.',
        ],
        warningsAr:
          tier === 'economic' && govSlug === 'alexandria'
            ? ['في الإسكندرية يُنصح برفع مخصص العزل المائي والجبس الأخضر المقاوم للرطوبة البحرية.']
            : [],
        warningsEn:
          tier === 'economic' && govSlug === 'alexandria'
            ? ['Coastal Alexandria apartments benefit from upgrading to green moisture-resistant gypsum and polymer waterproofing.']
            : [],
        suggestedBudgetCategorySlug: 'finishing',
        suggestedBudgetTitleAr: `تشطيب شقة ${areaSqm}م² (${tier})`,
        suggestedBudgetTitleEn: `${areaSqm}m² Finishing Plan (${tier})`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #8: Kitchen Setup Calculator
  {
    slug: 'kitchen-setup',
    order: 8,
    categoryGroup: 'finishing_home',
    nameAr: 'حاسبة تجهيز المطبخ بالكامل',
    nameEn: 'Full Kitchen Setup Calculator',
    shortDescAr: 'تحسب تكلفة دواليب المطبخ + الرخام أو الكوارتز + الحوض والخلاط والشفاط والمسطح.',
    shortDescEn: 'Budget cabinetry meters, stone countertop, sink/faucet hardware & built-in hood/hob.',
    iconName: 'Utensils',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'finishing',
    defaultInputs: {
      linearMeters: 4.5,
      cabinetMaterial: 'poly_lac',
      countertopType: 'granite',
      includeSinkAndFaucet: true,
      includeBuiltInHoodHob: false,
    },
    fields: [
      {
        key: 'linearMeters',
        type: 'number',
        labelAr: 'طول المطبخ بالمتر الطولي الكامل (علوي + سفلي)',
        labelEn: 'Kitchen Run Length (Upper + Lower Set)',
        unitAr: 'متر',
        unitEn: 'm',
        min: 2,
        max: 14,
        step: 0.5,
      },
      {
        key: 'cabinetMaterial',
        type: 'select',
        labelAr: 'خامة الدواليب والشاسيه',
        labelEn: 'Cabinetry & Finish Material',
        options: [
          { value: 'hpl', labelAr: 'كلادينج / HPL اقتصادي (6,800 ج.م/م)', labelEn: 'HPL / Cladding (6,800 EGP/m)' },
          { value: 'poly_lac', labelAr: 'بولي لاك على كونتر جودو (9,500 ج.م/م)', labelEn: 'Poly-Lac on Contre (9,500 EGP/m)' },
          { value: 'acrylic', labelAr: 'أكريليك تركي ومفصلات هيدروليك (11,800 ج.م/م)', labelEn: 'Turkish Acrylic (11,800 EGP/m)' },
          { value: 'uv_lac_wood', labelAr: 'قشرة أرو / UV لاك فاخر (14,500 ج.م/م)', labelEn: 'Oak Veneer / UV Lac (14,500 EGP/m)' },
        ],
      },
      {
        key: 'countertopType',
        type: 'select',
        labelAr: 'نوع الرخامة (الكاونتر)',
        labelEn: 'Countertop Stone Surface',
        options: [
          { value: 'granite', labelAr: 'جرانيت جلاكسي / دبل بلاك (4,200 ج.م/م)', labelEn: 'Black Galaxy Granite (4,200 EGP/m)' },
          { value: 'quartz', labelAr: 'كوارتز مهندس مقاوم للبقع (8,400 ج.م/م)', labelEn: 'Engineered Quartz (8,400 EGP/m)' },
          { value: 'local_marble', labelAr: 'جرانيت محلي جندولا/فيردي (2,600 ج.م/م)', labelEn: 'Local Granite (2,600 EGP/m)' },
        ],
      },
      {
        key: 'includeSinkAndFaucet',
        type: 'boolean',
        labelAr: 'تضمين حوض ستانلس عميق + خلاط سحب + إكسسوارات ترولي',
        labelEn: 'Include deep stainless sink, pull-out faucet & corners',
      },
      {
        key: 'includeBuiltInHoodHob',
        type: 'boolean',
        labelAr: 'تضمين شفاط بلت إن + مسطح غاز 5 عيون',
        labelEn: 'Include built-in chimney hood & 5-burner hob',
      },
    ],
    compute(inputs) {
      const meters = numVal(inputs, 'linearMeters', 4.5, 1.5, 20);
      const cab = strVal(inputs, 'cabinetMaterial', 'poly_lac', ['hpl', 'poly_lac', 'acrylic', 'uv_lac_wood']);
      const stone = strVal(inputs, 'countertopType', 'granite', ['granite', 'quartz', 'local_marble']);
      const incSink = boolVal(inputs, 'includeSinkAndFaucet', true);
      const incBuiltIn = boolVal(inputs, 'includeBuiltInHoodHob', false);

      const cabRate = cab === 'hpl' ? 6800 : cab === 'acrylic' ? 11800 : cab === 'uv_lac_wood' ? 14500 : 9500;
      const stoneRate = stone === 'quartz' ? 8400 : stone === 'local_marble' ? 2600 : 4200;

      const cabinetryCost = Math.round(meters * cabRate);
      const stoneCost = Math.round(meters * stoneRate);
      const sinkAccessoriesCost = incSink ? 14500 : 0;
      const builtInCost = incBuiltIn ? 24500 : 0;
      const installTransportCost = Math.round(meters * 900);
      const total = cabinetryCost + stoneCost + sinkAccessoriesCost + builtInCost + installTransportCost;

      return {
        slug: 'kitchen-setup',
        nameAr: 'حاسبة تجهيز المطبخ بالكامل',
        nameEn: 'Full Kitchen Setup Calculator',
        primaryMetric: {
          labelAr: 'إجمالي ميزانية تأسيس المطبخ',
          labelEn: 'Total Kitchen Setup Budget',
          value: total,
          unit: 'EGP',
          unitLabelAr: 'ج.م',
          unitLabelEn: 'EGP',
        },
        secondaryMetrics: [
          {
            key: 'per_meter',
            labelAr: 'التكلفة الشاملة للمتر الطولي',
            labelEn: 'All-in Cost / Linear Meter',
            value: fmtEgp(total / meters),
            rawValue: Math.round(total / meters),
          },
          {
            key: 'cab_pct',
            labelAr: 'نسبة الدواليب',
            labelEn: 'Cabinetry Share',
            value: `${pct(cabinetryCost, total)}%`,
          },
        ],
        breakdown: [
          { key: 'cabinetry', labelAr: 'الدواليب والضلف (كونتر + إكسسوار)', labelEn: 'Cabinetry & Carcass', amount: cabinetryCost, percent: pct(cabinetryCost, total) },
          { key: 'stone', labelAr: 'الرخامة والوزرة وفتحة الحوض', labelEn: 'Stone Slab & Cutout', amount: stoneCost, percent: pct(stoneCost, total) },
          { key: 'sink_hw', labelAr: 'حوض وخلاط وإكسسوارات ترولي', labelEn: 'Sink, Faucet & Organizers', amount: sinkAccessoriesCost, percent: pct(sinkAccessoriesCost, total) },
          { key: 'builtin', labelAr: 'أجهزة بلت إن (مسطح وشفاط)', labelEn: 'Built-in Hood & Hob', amount: builtInCost, percent: pct(builtInCost, total) },
          { key: 'install', labelAr: 'النقل والتركيب بالليزر', labelEn: 'Transport & Laser Fitting', amount: installTransportCost, percent: pct(installTransportCost, total) },
        ],
        formulaSummaryAr: '(الأمتار الطولية × سعر خامة المطبخ) + (الأمتار × سعر الرخام) + التجهيزات + التركيب',
        formulaSummaryEn: '(Meters × Cabinet Rate) + (Meters × Countertop Rate) + Sink/Built-in + Installation',
        assumptionsAr: ['يُرفع مقاس المطبخ النهائي بالليزر فقط بعد تركيب السيراميك وشراء أبعاد الأجهزة.'],
        assumptionsEn: ['Final laser measurement occurs strictly after wall tiling and locking appliance widths.'],
        warningsAr:
          stone === 'local_marble'
            ? ['الرخام الفاتح المسامي يتشرب الزيوت والليمون سريعاً؛ يُفضل الجرانيت الأسود أو الكوارتز لسطح العمل.']
            : [],
        warningsEn:
          stone === 'local_marble'
            ? ['Porous light marble stains from lemon & oil spills; dark granite or quartz offers superior durability.']
            : [],
        suggestedBudgetCategorySlug: 'finishing',
        suggestedBudgetTitleAr: `تجهيز المطبخ (${meters}م ${cab})`,
        suggestedBudgetTitleEn: `Kitchen Setup (${meters}m ${cab})`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #9: Bathroom Setup Calculator
  {
    slug: 'bathroom-setup',
    order: 9,
    categoryGroup: 'finishing_home',
    nameAr: 'حاسبة تجهيز وتأسيس الحمامات',
    nameEn: 'Bathroom Sanitary & Setup Calculator',
    shortDescAr: 'تشمل العزل والسيراميك أو البورسلين وأطقم الصحّي والخلاطات وكابينة السيكوريت.',
    shortDescEn: 'Covers waterproofing, wall/floor tiling, sanitary ware, brassware, vanity & shower cabin.',
    iconName: 'Droplets',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'finishing',
    defaultInputs: {
      bathroomsCount: 2,
      fixtureTier: 'ideal_standard',
      wallFloorAreaPerBathSqm: 28,
      includeShowerCabin: true,
      includeVanityCabinet: true,
    },
    fields: [
      { key: 'bathroomsCount', type: 'number', labelAr: 'عدد الحمامات', labelEn: 'Bathrooms Count', unitAr: 'حمام', unitEn: 'bath', min: 1, max: 5, step: 1 },
      {
        key: 'fixtureTier',
        type: 'select',
        labelAr: 'فئة الأطقم والخلاطات الصحية',
        labelEn: 'Sanitary & Brassware Tier',
        options: [
          { value: 'economic', labelAr: 'اقتصادي موثوق (كليوباترا / ليزا)', labelEn: 'Economic (Cleopatra / Local Certified)' },
          { value: 'ideal_standard', labelAr: 'متوازن متميز (أيديال ستاندرد + دفن)', labelEn: 'Balanced Premium (Ideal Standard)' },
          { value: 'grohe_duravit', labelAr: 'فاخر سويسري/ألماني (جروهي + ديورافيت)', labelEn: 'Luxury (Grohe Concealed + Duravit)' },
        ],
      },
      { key: 'wallFloorAreaPerBathSqm', type: 'number', labelAr: 'متوسط مساحة الحوائط والأرضية للحمام', labelEn: 'Avg Wall + Floor Area / Bath', unitAr: 'م²', unitEn: 'm²', min: 16, max: 60, step: 2 },
      { key: 'includeShowerCabin', type: 'boolean', labelAr: 'تضمين كابينة شاور زجاج سيكوريت 10مم', labelEn: 'Include 10mm Tempered Shower Enclosure' },
      { key: 'includeVanityCabinet', type: 'boolean', labelAr: 'تضمين وحدة حوض خشب ضد الماء + مرآة ليد', labelEn: 'Include Waterproof Vanity Unit + LED Mirror' },
    ],
    compute(inputs) {
      const count = numVal(inputs, 'bathroomsCount', 2, 1, 5);
      const tier = strVal(inputs, 'fixtureTier', 'ideal_standard', ['economic', 'ideal_standard', 'grohe_duravit']);
      const tileSqm = numVal(inputs, 'wallFloorAreaPerBathSqm', 28, 12, 80);
      const cabin = boolVal(inputs, 'includeShowerCabin', true);
      const vanity = boolVal(inputs, 'includeVanityCabinet', true);

      const fixtureSetPerBath = tier === 'economic' ? 16500 : tier === 'grohe_duravit' ? 49000 : 28500;
      const tileMatAndLaborPerSqm = tier === 'economic' ? 480 : tier === 'grohe_duravit' ? 1100 : 720;
      const waterproofCost = count * 5200;
      const tilingCost = Math.round(count * tileSqm * tileMatAndLaborPerSqm);
      const fixturesCost = count * fixtureSetPerBath;
      const cabinCost = cabin ? count * 11500 : 0;
      const vanityCost = vanity ? count * 8500 : 0;
      const total = waterproofCost + tilingCost + fixturesCost + cabinCost + vanityCost;

      return {
        slug: 'bathroom-setup',
        nameAr: 'حاسبة تجهيز وتأسيس الحمامات',
        nameEn: 'Bathroom Sanitary & Setup Calculator',
        primaryMetric: { labelAr: 'إجمالي تجهيز الحمامات', labelEn: 'Total Bathroom Setup Cost', value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'per_bath', labelAr: 'متوسط الحمام الواحد', labelEn: 'Avg per Bathroom', value: fmtEgp(total / count), rawValue: Math.round(total / count) },
          { key: 'tile_area', labelAr: 'إجمالي سيراميك الحمامات (+10% هالك)', labelEn: 'Tile Order (+10% Waste)', value: `${Math.round(count * tileSqm * 1.1)} m²` },
        ],
        breakdown: [
          { key: 'fixtures', labelAr: 'أطقم الحمام والخلاطات والإكسسوارات', labelEn: 'Sanitary Ware & Faucets', amount: fixturesCost, percent: pct(fixturesCost, total) },
          { key: 'tiling', labelAr: 'سيراميك/بورسلين الحوائط والأرضيات + التركيب', labelEn: 'Wall/Floor Tiles & Adhesive Labor', amount: tilingCost, percent: pct(tilingCost, total) },
          { key: 'cabins', labelAr: 'كبائن السيكوريت المضادة للماء', labelEn: 'Tempered Glass Shower Enclosures', amount: cabinCost, percent: pct(cabinCost, total) },
          { key: 'vanity', labelAr: 'وحدات الحوض والمرايا', labelEn: 'Waterproof Vanity Cabinets', amount: vanityCost, percent: pct(vanityCost, total) },
          { key: 'waterproof', labelAr: 'العزل الأسمنتي واختبار الغمر 48 ساعة', labelEn: 'Waterproofing Membrane & Flood Test', amount: waterproofCost, percent: pct(waterproofCost, total) },
        ],
        formulaSummaryAr: '(عدد الحمامات × فئة الصحي) + (المساحة × سعر المتر توريد وتركيب) + العزل + الكابينة والوحدة',
        formulaSummaryEn: '(Baths × Sanitary Tier) + (Wall/Floor m² × Rate) + Waterproofing + Enclosures/Vanities',
        assumptionsAr: ['يُضاف بند سباكة التأسيس والصرف في حال عدم استلام الحمامات مؤسسة بالكامل.'],
        assumptionsEn: ['Assumes rough-in concealed supply piping is billed inside core plumbing BOQ or included in finishing scope.'],
        warningsAr: [],
        warningsEn: [],
        suggestedBudgetCategorySlug: 'finishing',
        suggestedBudgetTitleAr: `تجهيز ${count} حمام (${tier})`,
        suggestedBudgetTitleEn: `${count} Bathroom Setup (${tier})`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #10: Room-by-Room Allocator
  {
    slug: 'room-by-room',
    order: 10,
    categoryGroup: 'finishing_home',
    nameAr: 'حاسبة توزيع التكلفة غرفة بغرفة',
    nameEn: 'Room-by-Room Setup Calculator',
    shortDescAr: 'توزع ميزانيات التشطيب والفرش (أرضيات، دهان، ستائر، تكييف، إضاءة) لكل غرفة منفصلة.',
    shortDescEn: 'Allocates finishing, paint, AC, lighting & curtains room-by-room across the whole home.',
    iconName: 'LayoutGrid',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'furniture',
    defaultInputs: {
      bedroomsCount: 3,
      receptionPieces: 3,
      apartmentAreaSqm: 135,
      finishStyle: 'modern',
    },
    fields: [
      { key: 'bedroomsCount', type: 'number', labelAr: 'عدد غرف النوم', labelEn: 'Bedrooms Count', unitAr: 'غرفة', unitEn: 'rooms', min: 1, max: 6, step: 1 },
      { key: 'receptionPieces', type: 'number', labelAr: 'قطع الريسبشن والمعيشة', labelEn: 'Reception Zones Count', unitAr: 'قطعة', unitEn: 'zones', min: 1, max: 5, step: 1 },
      { key: 'apartmentAreaSqm', type: 'number', labelAr: 'المساحة الإجمالية', labelEn: 'Apartment Area', unitAr: 'م²', unitEn: 'm²', min: 65, max: 400, step: 5 },
      {
        key: 'finishStyle',
        type: 'select',
        labelAr: 'طراز التجهيز والفرش',
        labelEn: 'Finish & Styling Level',
        options: [
          { value: 'minimal', labelAr: 'مودرن عملي اقتصادي', labelEn: 'Minimal Practical' },
          { value: 'modern', labelAr: 'مودرن متكامل مع سبوتات وإضاءة مخفية', labelEn: 'Modern w/ Profile Lighting' },
          { value: 'neoclassic', labelAr: 'نيوكلاسيك مع بانوهات وتجليد', labelEn: 'Neoclassic w/ Moldings' },
        ],
      },
    ],
    compute(inputs) {
      const bedrooms = numVal(inputs, 'bedroomsCount', 3, 1, 6);
      const reception = numVal(inputs, 'receptionPieces', 3, 1, 5);
      const area = numVal(inputs, 'apartmentAreaSqm', 135, 60, 450);
      const style = strVal(inputs, 'finishStyle', 'modern', ['minimal', 'modern', 'neoclassic']);
      const styleMult = style === 'minimal' ? 0.85 : style === 'neoclassic' ? 1.28 : 1.0;

      const masterSuite = Math.round(95000 * styleMult);
      const secondaryRooms = Math.round(Math.max(0, bedrooms - 1) * 52000 * styleMult);
      const receptionZone = Math.round((85000 + reception * 22000) * styleMult);
      const lightingCurtains = Math.round(area * 340 * styleMult);
      const total = masterSuite + secondaryRooms + receptionZone + lightingCurtains;

      return {
        slug: 'room-by-room',
        nameAr: 'حاسبة توزيع التكلفة غرفة بغرفة',
        nameEn: 'Room-by-Room Setup Calculator',
        primaryMetric: { labelAr: 'إجمالي تجهيز وفرش الغرف', labelEn: 'Room-by-Room Total Estimate', value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'rooms_total', labelAr: 'عدد المساحات المخططة', labelEn: 'Planned Spaces', value: `${bedrooms + reception} ${bedrooms + reception === 1 ? 'Space' : 'Spaces'}` },
          { key: 'per_room_avg', labelAr: 'المتوسط للغرفة', labelEn: 'Avg per Bedroom', value: fmtEgp((masterSuite + secondaryRooms) / bedrooms) },
        ],
        breakdown: [
          { key: 'reception', labelAr: 'الريسبشن والمعيشة (فرش، ستائر، سبوتات، تكييف)', labelEn: 'Reception & Living Setup', amount: receptionZone, percent: pct(receptionZone, total) },
          { key: 'master', labelAr: 'غرفة النوم الرئيسية (ماستر)', labelEn: 'Master Bedroom Suite', amount: masterSuite, percent: pct(masterSuite, total) },
          { key: 'kids_guest', labelAr: `الغرف الإضافية (${Math.max(0, bedrooms - 1)} غرفة)`, labelEn: `Secondary Rooms (${Math.max(0, bedrooms - 1)})`, amount: secondaryRooms, percent: pct(secondaryRooms, total) },
          { key: 'lighting_curtains', labelAr: 'وحدات الإضاءة والستائر والسجاد', labelEn: 'Lighting, Curtains & Area Rugs', amount: lightingCurtains, percent: pct(lightingCurtains, total) },
        ],
        formulaSummaryAr: 'تخصيص تكلفة كل غرفة منفردة (أخشاب + إضاءة + ستائر + دهانات مميزة) × معامل الطراز',
        formulaSummaryEn: 'Master Suite + Secondary Rooms + Reception Pieces + Area-Scaled Lighting/Curtains × Style Multiplier',
        assumptionsAr: ['تسمح بتقسيم المشتريات على مراحل: إعطاء الأولوية للماستر والريسبشن أولاً.'],
        assumptionsEn: ['Enables phased purchasing — furnishing the master suite & living area first without stalling move-in.'],
        warningsAr: bedrooms > 2 ? ['تذكير: يمكن تأجيل فرش الغرفة الثالثة في السنة الأولى لتوفير سيولة لاحتياطي الطوارئ.'] : [],
        warningsEn: bedrooms > 2 ? ['Tip: Deferring non-essential third bedroom furniture frees up substantial day-one cash reserve.'] : [],
        suggestedBudgetCategorySlug: 'furniture',
        suggestedBudgetTitleAr: `تجهيز ${bedrooms} غرف و${reception} ريسبشن`,
        suggestedBudgetTitleEn: `${bedrooms} Rooms & Reception Setup`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #11: Flooring Quantities Calculator
  {
    slug: 'flooring-quantities',
    order: 11,
    categoryGroup: 'finishing_home',
    nameAr: 'حاسبة كميات السيراميك والبورسلين والأرضيات',
    nameEn: 'Flooring Tiles & Adhesive Quantities Calculator',
    shortDescAr: 'تحسب عدد الأمتار + نسبة الهالك + عدد الكراتين + شكاير المادة اللاصقة + الوزرة + التكلفة.',
    shortDescEn: 'Computes net m², wastage allowance, boxes needed, polymer adhesive bags & total cost.',
    iconName: 'Grid',
    primaryUnit: 'm²',
    suggestedBudgetCategorySlug: 'finishing',
    defaultInputs: {
      floorAreaSqm: 110,
      skirtingPerimeterMeters: 95,
      materialType: 'porcelain',
      wastePercent: 10,
      tilePricePerSqm: 580,
    },
    fields: [
      { key: 'floorAreaSqm', type: 'number', labelAr: 'صافي مساحة الأرضيات المطلوبة', labelEn: 'Net Floor Area', unitAr: 'م²', unitEn: 'm²', min: 15, max: 450, step: 5 },
      { key: 'skirtingPerimeterMeters', type: 'number', labelAr: 'محيط الحوائط لتركيب الوزرة', labelEn: 'Perimeter for Skirting (Wezra)', unitAr: 'م.ط', unitEn: 'm', min: 10, max: 350, step: 5 },
      {
        key: 'materialType',
        type: 'select',
        labelAr: 'نوع خامة الأرضية',
        labelEn: 'Flooring Material',
        options: [
          { value: 'ceramic', labelAr: 'سيراميك فرز أول بالمونة', labelEn: 'Grade-A Ceramic (Cement Bed)' },
          { value: 'porcelain', labelAr: 'بورسلين ليزر كت بالمادة اللاصقة', labelEn: 'Rectified Porcelain (Adhesive)' },
          { value: 'hdf', labelAr: 'خشب HDF مع فوم عازل للرطوبة', labelEn: 'AC4 HDF Laminate w/ Underlay' },
        ],
      },
      { key: 'wastePercent', type: 'number', labelAr: 'نسبة الهالك والتقطيع (8–15%)', labelEn: 'Cutting Waste Allowance (%)', unitAr: '%', unitEn: '%', min: 5, max: 20, step: 1 },
      { key: 'tilePricePerSqm', type: 'number', labelAr: 'سعر المتر المربع من الخامة المختارة', labelEn: 'Material Price / m²', unitAr: 'ج.م', unitEn: 'EGP', min: 180, max: 4000, step: 20 },
    ],
    compute(inputs) {
      const floorArea = numVal(inputs, 'floorAreaSqm', 110, 10, 500);
      const skirtingM = numVal(inputs, 'skirtingPerimeterMeters', 95, 0, 500);
      const mat = strVal(inputs, 'materialType', 'porcelain', ['ceramic', 'porcelain', 'hdf']);
      const wastePct = numVal(inputs, 'wastePercent', 10, 5, 25);
      const pricePerSqm = numVal(inputs, 'tilePricePerSqm', 580, 120, 6000);

      const skirtingSqm = Number((skirtingM * 0.1).toFixed(1));
      const baseWithSkirting = floorArea + skirtingSqm;
      const orderSqm = Number((baseWithSkirting * (1 + wastePct / 100)).toFixed(1));
      const boxCoverage = mat === 'hdf' ? 2.13 : 1.44;
      const cartonsCount = Math.ceil(orderSqm / boxCoverage);
      const adhesiveBags = mat === 'porcelain' ? Math.ceil(orderSqm / 3.8) : mat === 'ceramic' ? 0 : 0;
      const laborPerSqm = mat === 'porcelain' ? 190 : mat === 'hdf' ? 95 : 135;

      const matCost = Math.round(orderSqm * pricePerSqm);
      const adhesiveCost = mat === 'porcelain' ? adhesiveBags * 290 : mat === 'hdf' ? Math.round(orderSqm * 55) : Math.round(orderSqm * 85);
      const laborCost = Math.round(floorArea * laborPerSqm + skirtingM * 45);
      const totalEgp = matCost + adhesiveCost + laborCost;

      return {
        slug: 'flooring-quantities',
        nameAr: 'حاسبة كميات السيراميك والبورسلين والأرضيات',
        nameEn: 'Flooring Tiles & Adhesive Quantities Calculator',
        primaryMetric: {
          labelAr: 'إجمالي المساحة المطلوب شراؤها (+الهالك والوزرة)',
          labelEn: 'Total Material Area to Purchase (inc. Skirting & Waste)',
          value: orderSqm,
          unit: 'm²',
          unitLabelAr: 'م²',
          unitLabelEn: 'm²',
        },
        secondaryMetrics: [
          { key: 'cartons', labelAr: 'عدد الكراتين التقديري', labelEn: 'Estimated Boxes/Cartons', value: `${cartonsCount} (${boxCoverage} m²/box)`, rawValue: cartonsCount },
          { key: 'total_egp', labelAr: 'التكلفة الإجمالية (خامة + لصق + مصنعية)', labelEn: 'Estimated Total Cost', value: fmtEgp(totalEgp), rawValue: totalEgp },
          {
            key: 'adhesive',
            labelAr: mat === 'porcelain' ? 'شكاير مادة لصق مرنة' : mat === 'hdf' ? 'رولات فوم + إكسسوار' : 'توريد رمل وأسمنت',
            labelEn: mat === 'porcelain' ? 'Flexible Adhesive Bags' : mat === 'hdf' ? 'Acoustic Underlay' : 'Mortar Sub-base',
            value: mat === 'porcelain' ? `${adhesiveBags} bags (25kg)` : fmtEgp(adhesiveCost),
          },
        ],
        breakdown: [
          { key: 'mat', labelAr: `توريد ${orderSqm}م² خامات (${mat})`, labelEn: `${orderSqm}m² Tiles/Laminate`, amount: matCost, percent: pct(matCost, totalEgp) },
          { key: 'labor', labelAr: 'مصنعية التركيب والوزر والتشطيب', labelEn: 'Trade Installation & Leveling', amount: laborCost, percent: pct(laborCost, totalEgp) },
          { key: 'bond', labelAr: 'مواد اللصق / المونة / الفوم العازل + السقية', labelEn: 'Adhesive / Mortar / Grout', amount: adhesiveCost, percent: pct(adhesiveCost, totalEgp) },
        ],
        formulaSummaryAr: 'الكمية المطلوبة = (مساحة الأرضية + مساحة الوزر) × (1 + نسبة الهالك%) ÷ مساحة الكرتونة',
        formulaSummaryEn: 'Order Area = (Net Floor m² + 0.1m × Skirting Perimeter) × (1 + Waste%); Boxes = Area / Carton m²',
        assumptionsAr: [
          'تم احتساب الوزرة بارتفاع قياسي 10 سم، وكرتونة البورسلين/السيراميك القياسية 1.44م².',
          'معدل فرد شيكارة اللصق المرن C2TE للبورسلين ≈ 3.8م² بالمشط المزدوج.',
        ],
        assumptionsEn: [
          'Assumes 10cm high skirting strip and standard 1.44 m² ceramic/porcelain box yield (2.13 m² for HDF).',
          'Flexible C2TE porcelain adhesive yield calculated at ~3.8 m² per 25kg bag.',
        ],
        warningsAr:
          mat === 'porcelain' && wastePct < 10
            ? ['الألواح الكبيرة (60×120) تحتاج نسبة هالك لا تقل عن 10–12% لتفادي اختلافات الباتش لاحقاً.']
            : [],
        warningsEn:
          mat === 'porcelain' && wastePct < 10
            ? ['Large-format porcelain tiles should allow 10–12% extra so all boxes match the exact dye-lot caliber.']
            : [],
        suggestedBudgetCategorySlug: 'finishing',
        suggestedBudgetTitleAr: `توريد وتركيب ${orderSqm}م² أرضيات`,
        suggestedBudgetTitleEn: `Flooring (${orderSqm}m² ${mat})`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #12: Paint Quantities Calculator
  {
    slug: 'paint-quantities',
    order: 12,
    categoryGroup: 'finishing_home',
    nameAr: 'حاسبة كميات الدهانات والمعجون والسيلر',
    nameEn: 'Interior Paint, Putty & Primer Quantities Calculator',
    shortDescAr: 'تحسب صافي مساحة الحوائط والأسقف + شكاير المعجون + جالونات السيلر وبستلات البلاستيك.',
    shortDescEn: 'Calculates paintable wall & ceiling m², acrylic putty sacks, water sealer & topcoat pails.',
    iconName: 'PaintBucket',
    primaryUnit: 'Buckets',
    suggestedBudgetCategorySlug: 'finishing',
    defaultInputs: {
      apartmentAreaSqm: 120,
      ceilingHeightMeters: 2.9,
      wallCoatsCount: 3,
      isFreshPlaster: true,
    },
    fields: [
      { key: 'apartmentAreaSqm', type: 'number', labelAr: 'مساحة الشقة بالمتر المربع', labelEn: 'Apartment Floor Area', unitAr: 'م²', unitEn: 'm²', min: 45, max: 450, step: 5 },
      { key: 'ceilingHeightMeters', type: 'number', labelAr: 'ارتفاع السقف', labelEn: 'Ceiling Height', unitAr: 'متر', unitEn: 'm', min: 2.5, max: 4.5, step: 0.1 },
      { key: 'wallCoatsCount', type: 'number', labelAr: 'عدد أوجه الدهان النهائي', labelEn: 'Finish Coats Count', unitAr: 'وش', unitEn: 'coats', min: 2, max: 4, step: 1 },
      { key: 'isFreshPlaster', type: 'boolean', labelAr: 'تأسيس كامل على المحارة (سيلر + 3 سكينة معجون)', labelEn: 'Fresh Plaster Prep (Sealer + 3 Putty Coats)' },
    ],
    compute(inputs) {
      const area = numVal(inputs, 'apartmentAreaSqm', 120, 40, 500);
      const height = numVal(inputs, 'ceilingHeightMeters', 2.9, 2.4, 5);
      const coats = numVal(inputs, 'wallCoatsCount', 3, 2, 4);
      const fresh = boolVal(inputs, 'isFreshPlaster', true);

      // Standard architectural heuristic: paintable net walls+ceilings ≈ area * (2.25 * (height/2.85))
      const paintableSqm = Math.round(area * (2.35 * (height / 2.85)));
      const pails10L = Math.ceil((paintableSqm * coats) / 90);
      const sealerPails = fresh ? Math.ceil(paintableSqm / 110) : 0;
      const puttySacks15Kg = fresh ? Math.ceil((paintableSqm * 0.45) / 15) : Math.ceil(paintableSqm * 0.08 / 15);

      const paintMatCost = pails10L * 2350 + sealerPails * 1450 + puttySacks15Kg * 340;
      const laborCost = Math.round(paintableSqm * (fresh ? 95 : 55));
      const totalEgp = paintMatCost + laborCost;

      return {
        slug: 'paint-quantities',
        nameAr: 'حاسبة كميات الدهانات والمعجون والسيلر',
        nameEn: 'Interior Paint, Putty & Primer Quantities Calculator',
        primaryMetric: {
          labelAr: 'بستلات البلاستيك النهائي المطلوبة (فئة 9–10 لتر)',
          labelEn: 'Topcoat Washable Paint Buckets (9–10L Pails)',
          value: pails10L,
          unit: 'Buckets',
          unitLabelAr: 'بستلة',
          unitLabelEn: 'Pails',
        },
        secondaryMetrics: [
          { key: 'sqm', labelAr: 'المساحة التقديرية للدهان (حوائط + أسقف)', labelEn: 'Net Paintable Area', value: `${paintableSqm} m²`, rawValue: paintableSqm },
          { key: 'putty', labelAr: 'شكاير المعجون (15 كجم)', labelEn: 'Putty Bags (15kg)', value: `${puttySacks15Kg} bags` },
          { key: 'cost', labelAr: 'إجمالي الخامات + المصنعية', labelEn: 'Total Paint & Labor Cost', value: fmtEgp(totalEgp), rawValue: totalEgp },
        ],
        breakdown: [
          { key: 'topcoat', labelAr: `دهان بلاستيك قابل للغسيل (${pails10L} بستلة)`, labelEn: `Washable Silk/Matte Paint (${pails10L} pails)`, amount: pails10L * 2350, percent: pct(pails10L * 2350, totalEgp) },
          { key: 'prep_mat', labelAr: `سيلر مائي (${sealerPails}) + معجون (${puttySacks15Kg} شيكارة)`, labelEn: `Sealer (${sealerPails}) & Putty (${puttySacks15Kg} bags)`, amount: sealerPails * 1450 + puttySacks15Kg * 340, percent: pct(sealerPails * 1450 + puttySacks15Kg * 340, totalEgp) },
          { key: 'labor', labelAr: 'مصنعية النقاشة والصنفرة والرش', labelEn: 'Painting Trade Labor', amount: laborCost, percent: pct(laborCost, totalEgp) },
        ],
        formulaSummaryAr: 'المساحة القابلة للدهان × عدد الأوجه ÷ معدل فرد البستلة (90 م²/وجه للـ 9-10 لتر)',
        formulaSummaryEn: 'Net Paintable Area × Finish Coats ÷ 90 m²/coat yield per 9–10L Pail',
        assumptionsAr: ['معدل الفرد محسوب لدهان أكريليك معتمد (جوتن فينوماستيك أو GLC).'],
        assumptionsEn: ['Yield benchmark assumes high-opacity washable emulsion coats after proper priming.'],
        warningsAr: [],
        warningsEn: [],
        suggestedBudgetCategorySlug: 'finishing',
        suggestedBudgetTitleAr: `دهانات ونقاشة (${pails10L} بستلة)`,
        suggestedBudgetTitleEn: `Painting & Putty (${pails10L} Pails)`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #13: Kitchen Cost per Meter Calculator
  {
    slug: 'kitchen-cost-per-meter',
    order: 13,
    categoryGroup: 'finishing_home',
    nameAr: 'حاسبة سعر متر المطبخ الخشب والألوميتال',
    nameEn: 'Kitchen Cost per Meter Breakdown Calculator',
    shortDescAr: 'تفصل بدقة سعر متر العلب السفلية عن العلوية ومتر الجزيرة أو الدواليب الطويلة (بلت إن).',
    shortDescEn: 'Splits lower vs. upper linear meters, tall pantry towers & soft-close hardware surcharges.',
    iconName: 'Ruler',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'finishing',
    defaultInputs: {
      lowerMeters: 3.5,
      upperMeters: 3.0,
      tallTowerUnits: 1,
      tier: 'poly_lac_blums',
    },
    fields: [
      { key: 'lowerMeters', type: 'number', labelAr: 'أمتار العلب السفلية', labelEn: 'Lower Base Cabinet Meters', unitAr: 'متر', unitEn: 'm', min: 1, max: 12, step: 0.5 },
      { key: 'upperMeters', type: 'number', labelAr: 'أمتار العلب العلوية', labelEn: 'Upper Wall Cabinet Meters', unitAr: 'متر', unitEn: 'm', min: 0, max: 12, step: 0.5 },
      { key: 'tallTowerUnits', type: 'number', labelAr: 'عدد وحدات التاور الطويلة (ثلاجة/فرن)', labelEn: 'Tall Appliance/Pantry Towers', unitAr: 'وحدة', unitEn: 'units', min: 0, max: 4, step: 1 },
      {
        key: 'tier',
        type: 'select',
        labelAr: 'فئة الخامة والمفصلات',
        labelEn: 'Panel & Hinge Spec',
        options: [
          { value: 'alumetal', labelAr: 'كلادينج / ألوميتال مبطن فايبر', labelEn: 'Fiber-Lined Cladding Aluminum' },
          { value: 'poly_lac_blums', labelAr: 'كونتر جودو 18مم + بولي لاك + إكسسوار تركي', labelEn: 'Goodwood Contre + Poly-Lac + Turkish HW' },
          { value: 'acrylic_blum', labelAr: 'أكريليك لاك + مفصلات وبلومات ألماني/نمساوي', labelEn: 'Acrylic Lacquer + Blum Soft-Close HW' },
        ],
      },
    ],
    compute(inputs) {
      const lower = numVal(inputs, 'lowerMeters', 3.5, 0.5, 15);
      const upper = numVal(inputs, 'upperMeters', 3.0, 0, 15);
      const towers = numVal(inputs, 'tallTowerUnits', 1, 0, 5);
      const tier = strVal(inputs, 'tier', 'poly_lac_blums', ['alumetal', 'poly_lac_blums', 'acrylic_blum']);

      const lowerRate = tier === 'alumetal' ? 4200 : tier === 'acrylic_blum' ? 6800 : 5400;
      const upperRate = tier === 'alumetal' ? 3200 : tier === 'acrylic_blum' ? 5200 : 4100;
      const towerUnitCost = tier === 'alumetal' ? 12500 : tier === 'acrylic_blum' ? 21500 : 16500;

      const lowerTotal = Math.round(lower * lowerRate);
      const upperTotal = Math.round(upper * upperRate);
      const towersTotal = Math.round(towers * towerUnitCost);
      const ledStripAndHandles = Math.round((lower + upper) * 550);
      const total = lowerTotal + upperTotal + towersTotal + ledStripAndHandles;
      const blendedPerLinear = Math.round(total / Math.max(lower, 1));

      return {
        slug: 'kitchen-cost-per-meter',
        nameAr: 'حاسبة سعر متر المطبخ الخشب والألوميتال',
        nameEn: 'Kitchen Cost per Meter Breakdown Calculator',
        primaryMetric: { labelAr: 'التكلفة الإجمالية للنجارة والعلب', labelEn: 'Total Cabinetry Valuation', value: total, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'blended', labelAr: 'السعر المكافئ للمتر الأرضي', labelEn: 'Blended Cost / Base Meter', value: fmtEgp(blendedPerLinear), rawValue: blendedPerLinear },
          { key: 'rates', labelAr: 'تفصيلة المتر', labelEn: 'Unit Meter Rates', value: `${fmtEgpAr(lowerRate)} / ${fmtEgpAr(upperRate)}` },
        ],
        breakdown: [
          { key: 'lower', labelAr: `الوحدات السفلية (${lower}م × ${lowerRate.toLocaleString()})`, labelEn: `Lower Units (${lower}m)`, amount: lowerTotal, percent: pct(lowerTotal, total) },
          { key: 'upper', labelAr: `الوحدات العلوية (${upper}م × ${upperRate.toLocaleString()})`, labelEn: `Upper Units (${upper}m)`, amount: upperTotal, percent: pct(upperTotal, total) },
          { key: 'towers', labelAr: `وحدات التاور الطويلة (${towers} وحدة)`, labelEn: `Tall Towers (${towers} units)`, amount: towersTotal, percent: pct(towersTotal, total) },
          { key: 'hw', labelAr: 'ليد بروفايل ومقابض جرووف', labelEn: 'LED Profiles & Recessed Pulls', amount: ledStripAndHandles, percent: pct(ledStripAndHandles, total) },
        ],
        formulaSummaryAr: '(متر سفلي × سعره) + (متر علوي × سعره) + (عدد وحدات التاور × سعر الوحدة) + إضافات الليد',
        formulaSummaryEn: '(Lower m × Rate) + (Upper m × Rate) + (Tall Towers × Unit Price) + LED Hardware',
        assumptionsAr: ['لا تشمل رخامة الكاونتر (تُحسب منفردة في حاسبة تجهيز المطبخ).'],
        assumptionsEn: ['Excludes stone countertop surface; combine with Full Kitchen Setup for stone pricing.'],
        warningsAr: [],
        warningsEn: [],
        suggestedBudgetCategorySlug: 'finishing',
        suggestedBudgetTitleAr: `نجارة مطبخ (${lower}م سفلي + ${upper}م علوي)`,
        suggestedBudgetTitleEn: `Kitchen Joinery (${lower}m L + ${upper}m U)`,
        computedAt: new Date().toISOString(),
      };
    },
  },
];

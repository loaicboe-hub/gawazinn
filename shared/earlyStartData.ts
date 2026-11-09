import type {
  EarlyStartAcademyLesson,
  EarlyStartTimeframePreset,
  SavingsGoalType,
  WhatIfScenarioResult,
} from './types';

export const EARLY_START_TIMEFRAME_PRESETS: {
  key: EarlyStartTimeframePreset;
  months: number;
  labelAr: string;
  labelEn: string;
}[] = [
  { key: '10y', months: 120, labelAr: '10 سنوات (بداية مبكرة جداً)', labelEn: '10 Years (Ultra Early)' },
  { key: '7y', months: 84, labelAr: '7 سنوات', labelEn: '7 Years' },
  { key: '5y', months: 60, labelAr: '5 سنوات', labelEn: '5 Years' },
  { key: '3y', months: 36, labelAr: '3 سنوات (متوازن)', labelEn: '3 Years (Balanced)' },
  { key: '2y', months: 24, labelAr: 'سنتان', labelEn: '2 Years' },
  { key: '1y', months: 12, labelAr: 'سنة واحدة', labelEn: '1 Year' },
  { key: '6m', months: 6, labelAr: '6 أشهر (استعداد عاجل)', labelEn: '6 Months (Sprint)' },
  { key: 'custom', months: 48, labelAr: 'مدة مخصصة', labelEn: 'Custom Months' },
];

export const SAVINGS_GOAL_TYPES: {
  type: SavingsGoalType;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  defaultTargetEgp: number;
}[] = [
  {
    type: 'marriage',
    labelAr: 'التجهيز الكلي للزواج',
    labelEn: 'Overall Marriage Preparation',
    descAr: 'وعاء عام مرن لتمويل باقي خطوات الاستعداد والزواج.',
    descEn: 'Flexible umbrella fund covering core pre-marriage milestones.',
    defaultTargetEgp: 200000,
  },
  {
    type: 'apartment_purchase',
    labelAr: 'مقدم وشراء الشقة',
    labelEn: 'Apartment Purchase / Down Payment',
    descAr: 'ادخار مقدم الوحدة السكنية أو دفعات الاستلام والأقساط الأولى.',
    descEn: 'Down payment, reservation deposits, and handover installments.',
    defaultTargetEgp: 350000,
  },
  {
    type: 'finishing',
    labelAr: 'تشطيب الشقة وتأسيسها',
    labelEn: 'Apartment Finishing',
    descAr: 'صندوق التشطيب المعماري والسباكة والكهرباء والأرضيات.',
    descEn: 'Plumbing, electrical rough-in, porcelain flooring, and painting.',
    defaultTargetEgp: 220000,
  },
  {
    type: 'furniture',
    labelAr: 'الأثاث والنجارة',
    labelEn: 'Furniture & Joinery',
    descAr: 'غرفة النوم والصالون والسفرة والمطبخ والنجارة الداخلية.',
    descEn: 'Bedroom, living room, dining room, and fitted cabinetry.',
    defaultTargetEgp: 150000,
  },
  {
    type: 'appliances',
    labelAr: 'الأجهزة الكهربائية',
    labelEn: 'Home Appliances',
    descAr: 'الثلاجة والغسالة والبوتاجاز والتكييفات والسخان والشاشة.',
    descEn: 'Refrigerator, washer, cooker, AC units, water heater & TV.',
    defaultTargetEgp: 120000,
  },
  {
    type: 'wedding',
    labelAr: 'تكاليف الخطوبة والفرح',
    labelEn: 'Wedding & Celebration',
    descAr: 'الشبكة، القاعة، الفستان والبدلة، التصوير، والتجهيزات الاحتفالية.',
    descEn: 'Engagement rings, hall booking, attire, photography & celebration.',
    defaultTargetEgp: 110000,
  },
  {
    type: 'emergency',
    labelAr: 'احتياطي الطوارئ (معزول)',
    labelEn: 'Ring-Fenced Emergency Reserve',
    descAr: 'صندوق أمان 10–15% لحمايتك من تقلبات الأسعار والظروف غير المتوقعة.',
    descEn: 'Protective 10–15% safety cushion against unexpected shocks.',
    defaultTargetEgp: 65000,
  },
];

export const EARLY_START_ACADEMY_LESSONS: EarlyStartAcademyLesson[] = [
  {
    slug: 'financial-literacy-before-engagement',
    order: 1,
    track: 'financial',
    titleAr: '1. أساسيات الثقافة المالية قبل الخطوبة بسنوات',
    titleEn: '1. Financial Literacy Years Before Engagement',
    readingMinutes: 5,
    summaryAr: 'كيف تفرّق بين الدخل المتاح، الالتزامات الثابتة، والرصيد القابل للادخار الشهري منذ أول وظيفة.',
    summaryEn: 'Distinguishing disposable income, fixed essentials, and repeatable monthly savings from your earliest paycheck.',
    keyPointsAr: [
      'قاعدة "ادفع لصندوق مستقبلك أولاً" فور استلام الراتب وليس مما يتبقى آخر الشهر.',
      'فصل صندوق الزواج عن مصروف التنقل والطعام يمنع التآكل الصامت.',
      'ابدأ ولو بمبلغ بسيط منتظم — العادة أهم من ضخامة أول إيداع.',
    ],
    keyPointsEn: [
      'Apply "Pay Your Future Fund First" on payday rather than saving leftovers.',
      'Separate marriage savings from daily spending balances to avoid silent leakage.',
      'Small regular contributions build irreversible momentum across 2–10 years.',
    ],
    practicalActionAr: 'حدّد رقم ادخار شهري واقعي قابل للاستمرار 12 شهراً دون عجز.',
    practicalActionEn: 'Lock a realistic monthly transfer you can sustain cleanly for 12 straight months.',
  },
  {
    slug: 'smart-personal-budgeting-egypt',
    order: 2,
    track: 'financial',
    titleAr: '2. هندسة الميزانية الشخصية وتقليل الهدر الشهري',
    titleEn: '2. Personal Cash-Flow Budgeting & Waste Audits',
    readingMinutes: 4,
    summaryAr: 'نظام عملي لتقسيم دخلك في مصر (احتياجات أساسية، بناء المستقبل، تطوير الذات ومرونة المعيشة).',
    summaryEn: 'Practical Egyptian monthly salary framework balancing living essentials, Future Fund, and skill growth.',
    keyPointsAr: [
      'راقب الاشتراكات المتكررة والطلبات السريعة لمدة 30 يوماً لاكتشاف التسرب الخفي.',
      'وجّه أي مكافأة موسمية أو دخل إضافي بنسبة 60% إلى صندوق المستقبل.',
    ],
    keyPointsEn: [
      'Audit recurring subscriptions and impulse delivery spending for 30 consecutive days.',
      'Route at least 60% of bonuses or side-income directly into Future Fund buckets.',
    ],
    practicalActionAr: 'راجع آخر كشف مصروفات وحدد بنداً واحداً يمكن توجيه 500–1,000 ج.م منه شهرياً.',
    practicalActionEn: 'Spot one recurring habit to redirect 500–1,000 EGP/month toward your apartment reserve.',
  },
  {
    slug: 'habit-streaks-and-consistency',
    order: 3,
    track: 'personal',
    titleAr: '3. بناء انضباط الادخار والالتزام طويل النفس',
    titleEn: '3. Building Saving Habits & Multi-Year Stamina',
    readingMinutes: 4,
    summaryAr: 'لماذا يتفوق المتسابق المتواصل لـ 36 شهراً على من يدخر بحماس شهرين ثم يتوقف؟',
    summaryEn: 'Why steady monthly streaks across 36 months outperform short bursts followed by burnout.',
    keyPointsAr: [
      'استخدم تاريخاً شهرياً ثابتاً لتسجيل الإيداع وتتبّع سلسلة الالتزام.',
      'الاحتفال بالإنجاز الصغير (25% / 50%) يحمي الدافعية دون مقارنة مؤذية مع الآخرين.',
    ],
    keyPointsEn: [
      'Pick one calendar day each month to record a contribution in My Future Fund.',
      'Track private milestones (25% / 50%) without unhealthy social comparisons.',
    ],
    practicalActionAr: 'فعّل تذكير الادخار الشهري وسجل أول إيداع حتى لو 1,000 ج.م.',
    practicalActionEn: 'Enable your private monthly reminder and log your first contribution.',
  },
  {
    slug: 'income-growth-and-career-planning',
    order: 4,
    track: 'personal',
    titleAr: '4. تخطيط الدخل وتطوير القدرة الكسبية قبل الزواج',
    titleEn: '4. Income Planning & Earning-Power Step-Ups',
    readingMinutes: 6,
    summaryAr: 'الادخار وحده له سقف؛ كيف ترفع دخلك بنسبة 10–15% سنوياً وتضاعف سرعة تحقيق هدفك؟',
    summaryEn: 'Savings has a ceiling; structuring annual income step-ups dramatically accelerates readiness.',
    keyPointsAr: [
      'خصّص نسبة من ميزانية التطوير المهني (شهادات، لغة، مهارات تقنية) خلال السنوات الأولى.',
      'استخدم محاكي "ماذا لو؟" لاختبار أثر زيادة الادخار السنوي 10% على موعد الزواج.',
    ],
    keyPointsEn: [
      'Budget intentionally for career certifications, languages, and marketable skills early.',
      'Model a 10% annual contribution step-up in the What-If Simulator.',
    ],
    practicalActionAr: 'ضع هدفاً مهنياً واضحاً على بُعد 12 شهراً ضمن معالم النمو الشخصي.',
    practicalActionEn: 'Add one 12-month career or skill milestone in your Personal Track.',
  },
  {
    slug: 'understanding-egyptian-real-estate-basics',
    order: 5,
    track: 'housing',
    titleAr: '5. فهم سوق العقارات في مصر: التمليك مقابل الإيجار والتقسيط',
    titleEn: '5. Egyptian Real Estate & Apartment Ownership Fundamentals',
    readingMinutes: 7,
    summaryAr: 'معايير اختيار الشقة: الأوراق القانونية، المرافق، التكلفة الخفية لودائع الصيانة والتشطيب.',
    summaryEn: 'Evaluating titles, developer handover readiness, maintenance deposits, and realistic finishing reserves.',
    keyPointsAr: [
      'لا تحسب سعر الشقة فقط — أضف 15–25% لتشطيب نصف تشطيب أو طوب أحمر ووديعة صيانة.',
      'راجع تسلسل الملكية ورخصة المباني أو عقد التخصيص الرسمي قبل أي عربون.',
    ],
    keyPointsEn: [
      'Factor 15–25% on top of shell price for MEP finishing, maintenance deposit & transfer fees.',
      'Verify official title chain, utilities eligibility, and building permit before reservation.',
    ],
    practicalActionAr: 'افصل صندوق "مقدم الشقة" عن صندوق "تشطيب الشقة" داخل صندوق مستقبلك.',
    practicalActionEn: 'Keep Apartment Purchase and Apartment Finishing as separate buckets.',
  },
  {
    slug: 'inflation-realism-vs-false-promises',
    order: 6,
    track: 'financial',
    titleAr: '6. التخطيط الواقعي للأسعار دون وعود عوائد مضمونة',
    titleEn: '6. Inflation Reality & Realistic Projections (No Return Hype)',
    readingMinutes: 5,
    summaryAr: 'الفرق الحقيقي بين قيمة الجنيه الحالية والتكلفة الاسمية المتوقعة بعد 3–7 سنوات.',
    summaryEn: 'Separating today’s cash purchasing power from nominal projected goal targets honestly.',
    keyPointsAr: [
      'احسب التزاماتك المستقبلية بمرونة مع إضافة هامش أمان 10–15% ولا تعتمد على افتراضات عوائد مبالغ فيها.',
      'شراء بعض البنود الدائمة يكون في توقيت منضبط فقط وليس بتخزين عشوائي يربك التخزين.',
    ],
    keyPointsEn: [
      'Use conservative escalation buffers (10–15%) rather than relying on speculative yields.',
      'Avoid premature bulk hoarding that eats liquidity or degrades warranties before move-in.',
    ],
    practicalActionAr: 'اختبر سيناريو زيادة تكلفة الزواج +15% في جدول ماذا لو مقارنةً مع دخلك.',
    practicalActionEn: 'Test a +15% cost stress scenario in the What-If Comparison Grid.',
  },
  {
    slug: 'phased-finishing-and-trousseau-timing',
    order: 7,
    track: 'housing',
    titleAr: '7. التوقيت الذكي لتجهيز الشقة والأجهزة والعروسة',
    titleEn: '7. Smart Phasing: When to Buy vs. Wait Until Move-In',
    readingMinutes: 5,
    summaryAr: 'متى تشتري الأجهزة حتى لا يضيع الضمان قبل السكن؟ وما البنود المناسبة للبدء المبكر؟',
    summaryEn: 'Protecting appliance warranties and preventing dead cash by sequencing purchases intelligently.',
    keyPointsAr: [
      'الأجهزة الكهربائية الكبيرة: يبدأ تشغيل الضمان من التفعيل أو الفاتورة حسب الوكيل — تجنّب شراءها قبل التشغيل بسنتين.',
      'المفروشات الأساسية القطنية: يمكن تقنين شرائها مبكراً ضمن حدود المساحة الحقيقية دون إسراف.',
    ],
    keyPointsEn: [
      'Delay big-ticket appliances until apartment finishing nears completion so warranty years are preserved.',
      'Phase non-perishable textiles thoughtfully rather than filling extra storage prematurely.',
    ],
    practicalActionAr: 'راجع موسوعة العريس والعروسة لتحديد الضروريات الحقيقية في أول خطة.',
    practicalActionEn: 'Review Groom & Bride Encyclopedias to lock realistic essentials first.',
  },
  {
    slug: 'avoiding-toxic-consumer-debt',
    order: 8,
    track: 'financial',
    titleAr: '8. تجنب فخ الديون الاستهلاكية وأقساط ما بعد الفرح',
    titleEn: '8. Avoiding Debt Traps & Post-Wedding Cash Crunches',
    readingMinutes: 5,
    summaryAr: 'القاعدة الذهبية: ألا يتجاوز مجموع الأقساط الشهرية 30–35% من صافي الدخل بعد الزواج.',
    summaryEn: 'Protecting year-one family peace by capping total monthly debt service below 30–35% of income.',
    keyPointsAr: [
      'تفرقة مصير الفرح: ليلة واحدة عالية التكلفة لا تستحق 4 سنوات من القلق الائتماني.',
      'اسأل عن السعر النقدي مقابل الإجمالي الفعلي على مدار الشهور في أي عقد تقسيط.',
    ],
    keyPointsEn: [
      'Never sacrifice four years of newlywed financial peace for single-night status pressure.',
      'Always calculate total cumulative interest repaid over tenure via Calculator #17.',
    ],
    practicalActionAr: 'تحقق من نسبة القسط للدخل قبل أي التزام مالي عبر حاسبة التقسيط #17.',
    practicalActionEn: 'Verify debt-to-income safety in Calculator #17 before signing any installment.',
  },
  {
    slug: 'transparent-couple-family-alignment',
    order: 9,
    track: 'education',
    titleAr: '9. التوافق الأسري والمالي بشفافية واحترام متبادل',
    titleEn: '9. Transparent Family & Partner Financial Expectations',
    readingMinutes: 4,
    summaryAr: 'كيف تفتح حواراً هادئاً مبكراً حول الأولويات والمساهمات وتفادي المفاجآت عند الاتفاق؟',
    summaryEn: 'Aligning expectations early on housing, finishing tier, trousseau scope, and realistic timelines.',
    keyPointsAr: [
      'اتفقوا على مستوى التشطيب والاحتفال بناءً على الإمكانات الفعلية لا المقارنات الاجتماعية.',
      'الوضوح حول التزامات كل طرف يحوّل مرحلة الخطوبة من توتر إلى شراكة حقيقية.',
    ],
    keyPointsEn: [
      'Calibrate apartment & celebration expectations to real capacity rather than external pressure.',
      'Document shared assumptions clearly before venue deposits or contracting.',
    ],
    practicalActionAr: 'حدّث هدف الميزانية الإجمالي واضبط التاريخ المتوقع في لوحة البداية المبكرة.',
    practicalActionEn: 'Calibrate your realistic Target Budget & Marriage Horizon together.',
  },
  {
    slug: 'emergency-fund-and-first-year-stability',
    order: 10,
    track: 'education',
    titleAr: '10. صندوق الأمان واستقرار السنة الأولى بعد الزواج',
    titleEn: '10. Ring-Fencing Your Emergency Buffer & Year-One Stability',
    readingMinutes: 5,
    summaryAr: 'لماذا يجب ألا يدخل مبلغ الطوارئ وأول 3 أشهر معيشة ضمن مصروفات القاعة والتشطيب؟',
    summaryEn: 'Keeping 10–15% buffer plus 3-month living runway untouched right through moving day.',
    keyPointsAr: [
      'احتفظ بوعاء "احتياطي الطوارئ" معزولاً في صندوق مستقبلك حتى نهاية الأسبوع الأول في البيت.',
      'أي فروق أسعار مفاجئة في النقاشة أو التوصيل تُمتص بهدوء دون استدانة سريعة.',
    ],
    keyPointsEn: [
      'Ring-fence an Emergency Reserve goal bucket separate from ballroom or decor budgets.',
      'Covers unexpected finishing variations and first-quarter utility setup calmly.',
    ],
    practicalActionAr: 'أنشئ أو استكمل هدف "احتياطي الطوارئ" بحيث يغطي ≥ 10% من خطتك.',
    practicalActionEn: 'Establish your dedicated Emergency Reserve bucket at ≥10% of target cost.',
  },
];

export const PRIVATE_BADGE_DEFINITIONS = [
  {
    badgeKey: 'first_deposit',
    titleAr: 'الخطوة الأولى الجادة',
    titleEn: 'First Serious Step',
    descAr: 'سجلت أول إيداع نقدي داخل صندوق مستقبلك.',
    descEn: 'Logged your very first cash savings deposit inside My Future Fund.',
  },
  {
    badgeKey: 'streak_3m',
    titleAr: 'ثلاثية الالتزام (3 أشهر)',
    titleEn: '3-Month Savings Streak',
    descAr: 'واصلت الادخار 3 أشهر متتالية بدون انقطاع.',
    descEn: 'Recorded contributions across 3 consecutive calendar months.',
  },
  {
    badgeKey: 'streak_6m',
    titleAr: 'انضباط النصف عام (6 أشهر)',
    titleEn: '6-Month Consistency Master',
    descAr: 'حققت 6 أشهر متواصلة من الادخار المنضبط.',
    descEn: 'Sustained 6 consecutive months of disciplined saving.',
  },
  {
    badgeKey: 'milestone_25pct',
    titleAr: 'تخطي ربع الطريق (25%)',
    titleEn: 'Quarter-Way Ready (25%)',
    descAr: 'تجاوز إجمالي مدخراتك الحالية 25% من مجموع أهدافك.',
    descEn: 'Your cumulative savings crossed 25% of your Future Fund goals.',
  },
  {
    badgeKey: 'milestone_50pct',
    titleAr: 'نصف المسافة نحو المستقبل (50%)',
    titleEn: 'Halfway Milestone (50%)',
    descAr: 'بلغت مدخراتك نصف قيمة أهدافك التمويلية بنجاح.',
    descEn: 'Your Future Fund reached at least 50% of combined goals.',
  },
  {
    badgeKey: 'emergency_funded',
    titleAr: 'درع الطوارئ مكتمل',
    titleEn: 'Emergency Buffer Secured',
    descAr: 'أكملت 100% من صندوق احتياطي الطوارئ الأُسري.',
    descEn: 'Reached 100% of your ring-fenced emergency reserve goal.',
  },
  {
    badgeKey: 'academy_starter',
    titleAr: 'وعي التخطيط المبكر',
    titleEn: 'Academy Graduate Track',
    descAr: 'أنهيت 3 وحدات تعليمية على الأقل في أكاديمية البداية المبكرة.',
    descEn: 'Completed at least 3 financial readiness lessons in Early Start Academy.',
  },
];

/**
 * Pure helper counting consecutive trailing calendar months present in yyyy-mm contribution set.
 */
export function computeSavingsStreak(streakMonths: string[]): number {
  const uniqueSorted = Array.from(new Set(streakMonths.filter((m) => /^\d{4}-\d{2}$/.test(m)))).sort();
  if (uniqueSorted.length === 0) return 0;

  let streak = 1;
  for (let i = uniqueSorted.length - 1; i > 0; i--) {
    const [y2, m2] = uniqueSorted[i].split('-').map(Number);
    const [y1, m1] = uniqueSorted[i - 1].split('-').map(Number);
    const diff = (y2 - y1) * 12 + (m2 - m1);
    if (diff === 1) {
      streak += 1;
    } else if (diff > 1) {
      break;
    }
  }
  return streak;
}

export function simulateWhatIfScenarios(params: {
  initialCapitalEgp: number;
  baseMonthlyEgp: number;
  horizonMonths: number;
  annualStepUpPercent: number;
  todayTargetCostEgp: number;
  assumedAnnualCostEscalationPercent: number;
}): {
  scenarios: WhatIfScenarioResult[];
  transparentDisclaimerAr: string;
  transparentDisclaimerEn: string;
} {
  const initial = Math.max(0, params.initialCapitalEgp);
  const horizonMonths = Math.min(120, Math.max(3, Math.round(params.horizonMonths)));
  const baseMonthly = Math.max(0, params.baseMonthlyEgp);
  const stepUpPct = Math.min(25, Math.max(0, params.annualStepUpPercent));
  const todayCost = Math.max(20000, params.todayTargetCostEgp);
  const escPct = Math.min(25, Math.max(0, params.assumedAnnualCostEscalationPercent));

  const runScenario = (
    key: string,
    labelAr: string,
    labelEn: string,
    monthlyStart: number,
    annualStep: number,
    months: number,
    costMultiplier: number,
  ): WhatIfScenarioResult => {
    let cash = initial;
    for (let m = 0; m < months; m++) {
      const yearIdx = Math.floor(m / 12);
      cash += monthlyStart * Math.pow(1 + annualStep / 100, yearIdx);
    }
    const years = months / 12;
    const projectedCost = Math.round(todayCost * costMultiplier * Math.pow(1 + escPct / 100, years));
    const roundedCash = Math.round(cash);
    const gapOrSurplus = roundedCash - projectedCost;
    const coveragePct = projectedCost > 0 ? Math.min(250, Math.round((roundedCash / projectedCost) * 100)) : 0;
    const neededConstant = Math.ceil(Math.max(0, projectedCost - initial) / months);

    return {
      key,
      labelAr,
      labelEn,
      monthlyStartEgp: Math.round(monthlyStart),
      annualStepUpPercent: annualStep,
      horizonMonths: months,
      projectedCashEgp: roundedCash,
      projectedGoalCostEgp: projectedCost,
      coveragePercent: coveragePct,
      gapOrSurplusEgp: gapOrSurplus,
      requiredMonthlyAtConstantRateEgp: neededConstant,
    };
  };

  const delayMonths = Math.min(120, horizonMonths + 12);

  return {
    scenarios: [
      runScenario(
        'save_1000',
        'ماذا لو ادخرت 1,000 ج.م/شهر؟',
        'What if I save 1,000 EGP/mo?',
        1000,
        0,
        horizonMonths,
        1,
      ),
      runScenario(
        'save_3000',
        'ماذا لو ادخرت 3,000 ج.م/شهر؟',
        'What if I save 3,000 EGP/mo?',
        3000,
        0,
        horizonMonths,
        1,
      ),
      runScenario(
        'custom_stepup',
        `خطتك (${baseMonthly.toLocaleString()} ج.م + ${stepUpPct}% زيادة سنوية)`,
        `Your Plan (${baseMonthly.toLocaleString()} EGP + ${stepUpPct}%/yr)`,
        baseMonthly,
        stepUpPct,
        horizonMonths,
        1,
      ),
      runScenario(
        'delay_12m',
        `ماذا لو أجّلت الموعد +12 شهراً (${delayMonths}ش)؟`,
        `What if I extend timeline +12m (${delayMonths}m)?`,
        baseMonthly,
        stepUpPct,
        delayMonths,
        1,
      ),
      runScenario(
        'cost_plus_15',
        'اختبار ضغط: زيادة تكلفة الزواج +15%',
        'Stress Test: +15% Higher Wedding Cost',
        baseMonthly,
        stepUpPct,
        horizonMonths,
        1.15,
      ),
    ],
    transparentDisclaimerAr:
      'جواز إن أداة تخطيط مالي وادخاري شخصية فقط — لا يمثل حساباً بنكياً ولا يقدم وعوداً بعوائد استثمارية مضمونة، ويفصل بوضوح بين رصيدك النقدي الحالي والقيمة المستهدفة مستقبلاً.',
    transparentDisclaimerEn:
      'GAWAZ INN Early Start is strictly a personal planning tool — NOT a bank account or investment platform. Zero guaranteed yields are assumed; current cash is clearly separated from future nominal goals.',
  };
}


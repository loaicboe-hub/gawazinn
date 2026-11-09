import { boolVal, fmtEgp, numVal, pct, type CalculatorDefinition } from './helpers';

export const FINANCE_PLANNING_CALCULATORS: CalculatorDefinition[] = [
  // #17: Installment & Financing Plan Calculator
  {
    slug: 'installment-plan',
    order: 17,
    categoryGroup: 'finance_planning',
    nameAr: 'حاسبة التقسيط وتقييم القسط للدخل',
    nameEn: 'Installment & Debt-to-Income Calculator',
    shortDescAr: 'تحسب القسط الشهري وإجمالي التكلفة وتتحقق من أمان نسبة القسط مقارنة بصافي دخلك الشهري.',
    shortDescEn: 'Computes monthly installment, total financing cost & checks safe debt-to-income ratio.',
    iconName: 'CreditCard',
    primaryUnit: 'EGP/mo',
    suggestedBudgetCategorySlug: 'appliances',
    defaultInputs: {
      totalAmountEgp: 150000,
      downPaymentEgp: 25000,
      tenureMonths: 24,
      annualFlatRatePercent: 18,
      monthlyNetIncomeEgp: 22000,
    },
    fields: [
      { key: 'totalAmountEgp', type: 'number', labelAr: 'إجمالي المشتريات أو التعاقد المطلوب تقسيطه', labelEn: 'Purchase / Contract Amount', unitAr: 'ج.م', unitEn: 'EGP', min: 10000, max: 2000000, step: 5000 },
      { key: 'downPaymentEgp', type: 'number', labelAr: 'المقدم المتاح دفعه الآن', labelEn: 'Cash Down Payment', unitAr: 'ج.م', unitEn: 'EGP', min: 0, max: 1000000, step: 2500 },
      { key: 'tenureMonths', type: 'number', labelAr: 'مدة التقسيط بالشهور', labelEn: 'Tenure Months', unitAr: 'شهر', unitEn: 'months', min: 6, max: 60, step: 6 },
      { key: 'annualFlatRatePercent', type: 'number', labelAr: 'نسبة الفائدة السنوية الاسترشادية (%)', labelEn: 'Indicative Annual Flat Rate (%)', unitAr: '%', unitEn: '%', min: 0, max: 40, step: 1 },
      { key: 'monthlyNetIncomeEgp', type: 'number', labelAr: 'صافي الدخل الشهري لقياس أمان الالتزام', labelEn: 'Monthly Net Income (DTI Safety Check)', unitAr: 'ج.م', unitEn: 'EGP', min: 4000, max: 500000, step: 1000 },
    ],
    compute(inputs) {
      const amount = numVal(inputs, 'totalAmountEgp', 150000, 5000, 3000000);
      const downPayment = Math.min(amount, numVal(inputs, 'downPaymentEgp', 25000, 0, amount));
      const tenure = numVal(inputs, 'tenureMonths', 24, 3, 72);
      const flatRate = numVal(inputs, 'annualFlatRatePercent', 18, 0, 50);
      const income = numVal(inputs, 'monthlyNetIncomeEgp', 22000, 3000, 1000000);

      const financed = Math.max(0, amount - downPayment);
      const totalInterest = Math.round(financed * ((flatRate / 100) * (tenure / 12)));
      const totalRepayable = financed + totalInterest;
      const monthlyInstallment = Math.round(totalRepayable / tenure);
      const dtiPercent = Math.round((monthlyInstallment / income) * 100);

      const warningsAr: string[] = [];
      const warningsEn: string[] = [];
      if (dtiPercent > 35) {
        warningsAr.push(`تنبيه مهم: القسط يمثل ${dtiPercent}% من دخلك الشهري (الحد الآمن الموصى به ≤ 30–35%). فكر في زيادة المقدم أو تقليل المبلغ.`);
        warningsEn.push(`Alert: Monthly payment consumes ${dtiPercent}% of net income (recommended cap ≤ 35%). Increase down payment or stretch tenure.`);
      }

      return {
        slug: 'installment-plan',
        nameAr: 'حاسبة التقسيط وتقييم القسط للدخل',
        nameEn: 'Installment & Debt-to-Income Calculator',
        primaryMetric: { labelAr: 'القسط الشهري التقديري', labelEn: 'Estimated Monthly Installment', value: monthlyInstallment, unit: 'EGP/mo', unitLabelAr: 'ج.م/شهر', unitLabelEn: 'EGP/mo' },
        secondaryMetrics: [
          { key: 'total_interest', labelAr: 'إجمالي الفوائد والمصاريف', labelEn: 'Total Interest Cost', value: fmtEgp(totalInterest), rawValue: totalInterest },
          { key: 'dti', labelAr: 'نسبة القسط من الدخل الشهري', labelEn: 'Income Load Ratio (DTI)', value: `${dtiPercent}%` },
          { key: 'total_cash_paid', labelAr: 'إجمالي السداد النهائي (+المقدم)', labelEn: 'Grand Total Paid (+Down)', value: fmtEgp(downPayment + totalRepayable) },
        ],
        breakdown: [
          { key: 'principal', labelAr: 'أصل المبلغ الممول', labelEn: 'Financed Principal', amount: financed, percent: pct(financed, downPayment + totalRepayable) },
          { key: 'interest', labelAr: `إجمالي الفوائد خلال ${tenure} شهراً`, labelEn: `Cumulative Interest (${tenure}m)`, amount: totalInterest, percent: pct(totalInterest, downPayment + totalRepayable) },
          { key: 'down', labelAr: 'الدفعة المقدمة', labelEn: 'Upfront Down Payment', amount: downPayment, percent: pct(downPayment, downPayment + totalRepayable) },
        ],
        formulaSummaryAr: 'المبلغ الممول = الإجمالي − المقدم؛ القسط الشهري = (الممول + الممول × الفائدة% × السنوات) ÷ عدد الشهور',
        formulaSummaryEn: 'Financed = Total − Down; Monthly = (Financed + Financed × FlatRate% × Years) / TenureMonths',
        assumptionsAr: [
          'أرقام استرشادية غير ملزمة وتخضع لموافقة ومعدل الفائدة المعلن وقت التعاقد لدى شركة التمويل المختارة.',
          'تمت مواءمة المعادلة بالكامل مع صفحة حلول التقسيط الرسمية بجواز إن.',
        ],
        assumptionsEn: [
          'Indicative planning figure subject to formal credit underwriting and provider APR at contract signing.',
          'Matches the official formula used across GAWAZ INN Installment Solutions.',
        ],
        warningsAr,
        warningsEn,
        suggestedBudgetCategorySlug: 'appliances',
        suggestedBudgetTitleAr: `خطة تقسيط (${fmtEgp(monthlyInstallment)} × ${tenure}م)`,
        suggestedBudgetTitleEn: `Installment (${monthlyInstallment.toLocaleString()} × ${tenure}m)`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #18: Monthly Target Savings Calculator
  {
    slug: 'monthly-savings',
    order: 18,
    categoryGroup: 'finance_planning',
    nameAr: 'حاسبة الادخار الشهري المطلوب للزواج',
    nameEn: 'Monthly Marriage Savings Calculator',
    shortDescAr: 'تحدد المبلغ الشهري واليومي اللازم للوصول لهدف الزواج في موعدك المستهدف بشفافية وبدون وعود عوائد مضمونة.',
    shortDescEn: 'Computes exact monthly & daily cash savings required to hit your target budget without debt.',
    iconName: 'PiggyBank',
    primaryUnit: 'EGP/mo',
    suggestedBudgetCategorySlug: 'emergency',
    defaultInputs: {
      targetMarriageBudgetEgp: 550000,
      currentSavingsEgp: 80000,
      monthsUntilMarriage: 36,
      includeSafetyMargin: true,
    },
    fields: [
      { key: 'targetMarriageBudgetEgp', type: 'number', labelAr: 'إجمالي المبلغ المستهدف تجهيزه', labelEn: 'Target Marriage Goal', unitAr: 'ج.م', unitEn: 'EGP', min: 30000, max: 5000000, step: 10000 },
      { key: 'currentSavingsEgp', type: 'number', labelAr: 'الرصيد المتوفر حالياً', labelEn: 'Current Initial Savings', unitAr: 'ج.م', unitEn: 'EGP', min: 0, max: 4000000, step: 5000 },
      { key: 'monthsUntilMarriage', type: 'number', labelAr: 'عدد الشهور المتبقية للموعد المستهدف', labelEn: 'Months Remaining Until Target', unitAr: 'شهر', unitEn: 'months', min: 3, max: 120, step: 3 },
      { key: 'includeSafetyMargin', type: 'boolean', labelAr: 'إضافة هامش أمان 10% لتقلبات الأسعار', labelEn: 'Include +10% Cost Fluctuation Buffer' },
    ],
    compute(inputs) {
      const targetRaw = numVal(inputs, 'targetMarriageBudgetEgp', 550000, 10000, 10000000);
      const current = numVal(inputs, 'currentSavingsEgp', 80000, 0, targetRaw * 2);
      const months = numVal(inputs, 'monthsUntilMarriage', 36, 1, 144);
      const safety = boolVal(inputs, 'includeSafetyMargin', true);

      const effectiveTarget = safety ? Math.round(targetRaw * 1.1) : targetRaw;
      const netRemaining = Math.max(0, effectiveTarget - current);
      const requiredMonthly = Math.ceil(netRemaining / months);
      const requiredDaily = Math.ceil(requiredMonthly / 30);
      const requiredAnnual = requiredMonthly * 12;

      return {
        slug: 'monthly-savings',
        nameAr: 'حاسبة الادخار الشهري المطلوب للزواج',
        nameEn: 'Monthly Marriage Savings Calculator',
        primaryMetric: { labelAr: 'الادخار الشهري المطلوب للالتزام بالموعد', labelEn: 'Required Monthly Savings Target', value: requiredMonthly, unit: 'EGP/mo', unitLabelAr: 'ج.م/شهر', unitLabelEn: 'EGP/mo' },
        secondaryMetrics: [
          { key: 'remaining', labelAr: 'المتبقي المطلوب ادخاره', labelEn: 'Remaining Amount Needed', value: fmtEgp(netRemaining), rawValue: netRemaining },
          { key: 'daily', labelAr: 'المكافئ اليومي', labelEn: 'Daily Discipline Equivalent', value: fmtEgp(requiredDaily) },
          { key: 'annual', labelAr: 'الهدف السنوي', labelEn: 'Annual Savings Milestone', value: fmtEgp(requiredAnnual) },
        ],
        breakdown: [
          { key: 'initial', labelAr: 'رأس المال المتاح حالياً', labelEn: 'Current Available Cash', amount: Math.min(current, effectiveTarget), percent: pct(Math.min(current, effectiveTarget), effectiveTarget) },
          { key: 'planned_cash', labelAr: `إجمالي دفعات الادخار على ${months} شهراً`, labelEn: `Cumulative Contributions (${months}m)`, amount: netRemaining, percent: pct(netRemaining, effectiveTarget) },
        ],
        formulaSummaryAr: 'الادخار الشهري = (الهدف الكلي [+10% هامش أمان] − المدخرات الحالية) ÷ عدد الشهور',
        formulaSummaryEn: 'Monthly Required = (Target Goal [+10% Buffer] − Current Savings) / Months Remaining',
        assumptionsAr: [
          'جواز إن أداة تخطيط مالي ولا تَعِد بأي عوائد استثمارية مضمونة أو فوائد بنكية افتراضية.',
          'النتيجة تفترض الانضباط الشخصي في الادخار الصافي فقط.',
        ],
        assumptionsEn: [
          'GAWAZ INN is a planning tool — zero investment return or guaranteed yield is promised.',
          'Shows pure cash principal discipline; personal bank/certificate returns would act purely as upside.',
        ],
        warningsAr: months < 12 && requiredMonthly > 20000 ? ['الفترة الزمنية القصيرة تتطلب ادخاراً شهرياً مرتفعاً؛ يمكنك تجربة إطالة المدة أو تقسيم المراحل في صندوق مستقبلي.'] : [],
        warningsEn: months < 12 && requiredMonthly > 20000 ? ['Short timeline raises monthly savings steeply; consider adjusting target date or splitting phases.'] : [],
        suggestedBudgetCategorySlug: 'emergency',
        suggestedBudgetTitleAr: `خطة ادخار ${fmtEgp(requiredMonthly)}/شهر`,
        suggestedBudgetTitleEn: `Savings Target (${requiredMonthly.toLocaleString()}/mo)`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #19: Long-Term Projections Calculator (Up to 10 Years Early Start)
  {
    slug: 'long-term-projections',
    order: 19,
    categoryGroup: 'finance_planning',
    nameAr: 'حاسبة التوقعات طويلة المدى وزيادة الادخار (حتى 10 سنوات)',
    nameEn: 'Long-Term Savings & Inflation Projection (1–10 Years)',
    shortDescAr: 'تحاكي نمو مدخراتك مع زيادة سنوية في الدفعة الشهرية مقابل التغير المحتمل في تكاليف التجهيز على مدار 1 إلى 10 سنوات.',
    shortDescEn: 'Models 1–10 year cumulative savings with annual step-ups against transparent cost inflation sensitivity.',
    iconName: 'TrendingUp',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'emergency',
    defaultInputs: {
      horizonYears: 5,
      initialCapitalEgp: 50000,
      monthlyContributionEgp: 5000,
      annualContributionStepUpPercent: 10,
      todayEstimatedCostEgp: 500000,
      assumedCostInflationPercent: 8,
    },
    fields: [
      { key: 'horizonYears', type: 'number', labelAr: 'أفق التحضير بالسنوات (من 1 إلى 10 سنوات)', labelEn: 'Preparation Horizon (Years)', unitAr: 'سنة', unitEn: 'yrs', min: 1, max: 10, step: 1 },
      { key: 'initialCapitalEgp', type: 'number', labelAr: 'المدخرات الحالية', labelEn: 'Initial Savings Today', unitAr: 'ج.م', unitEn: 'EGP', min: 0, max: 3000000, step: 10000 },
      { key: 'monthlyContributionEgp', type: 'number', labelAr: 'الادخار الشهري المبدئي (السنة الأولى)', labelEn: 'Year-1 Monthly Contribution', unitAr: 'ج.م', unitEn: 'EGP', min: 500, max: 200000, step: 500 },
      { key: 'annualContributionStepUpPercent', type: 'number', labelAr: 'الزيادة السنوية في قدرتك على الادخار (%)', labelEn: 'Annual Step-Up in Monthly Savings (%)', unitAr: '%', unitEn: '%', min: 0, max: 25, step: 2 },
      { key: 'todayEstimatedCostEgp', type: 'number', labelAr: 'تقدير تكلفة الزواج بأسعار اليوم', labelEn: "Today's Estimated Marriage Cost", unitAr: 'ج.م', unitEn: 'EGP', min: 50000, max: 5000000, step: 25000 },
      { key: 'assumedCostInflationPercent', type: 'number', labelAr: 'افتراض زيادة الأسعار السنوية لاختبار التحمل (%)', labelEn: 'Sensitivity: Annual Cost Escalation (%)', unitAr: '%', unitEn: '%', min: 0, max: 25, step: 1 },
    ],
    compute(inputs) {
      const years = numVal(inputs, 'horizonYears', 5, 1, 10);
      const initial = numVal(inputs, 'initialCapitalEgp', 50000, 0, 5000000);
      const year1Monthly = numVal(inputs, 'monthlyContributionEgp', 5000, 100, 500000);
      const stepUpPct = numVal(inputs, 'annualContributionStepUpPercent', 10, 0, 30);
      const todayCost = numVal(inputs, 'todayEstimatedCostEgp', 500000, 20000, 10000000);
      const inflationPct = numVal(inputs, 'assumedCostInflationPercent', 8, 0, 30);

      let cumulativeSavings = initial;
      const yearSnapshots: { year: number; totalSaved: number; monthlyRate: number }[] = [];
      let totalContributions = 0;

      for (let y = 1; y <= years; y++) {
        const monthlyThisYear = year1Monthly * Math.pow(1 + stepUpPct / 100, y - 1);
        const addedYear = Math.round(monthlyThisYear * 12);
        cumulativeSavings += addedYear;
        totalContributions += addedYear;
        yearSnapshots.push({
          year: y,
          totalSaved: Math.round(cumulativeSavings),
          monthlyRate: Math.round(monthlyThisYear),
        });
      }

      const projectedCost = Math.round(todayCost * Math.pow(1 + inflationPct / 100, years));
      const balanceDelta = Math.round(cumulativeSavings - projectedCost);
      const coveragePct = pct(cumulativeSavings, projectedCost);

      return {
        slug: 'long-term-projections',
        nameAr: 'حاسبة التوقعات طويلة المدى وزيادة الادخار',
        nameEn: 'Long-Term Savings & Inflation Projection (1–10 Years)',
        primaryMetric: { labelAr: `إجمالي المدخرات المتوقعة بعد ${years} سنوات`, labelEn: `Projected Cash Reserve After ${years} Years`, value: Math.round(cumulativeSavings), unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'proj_cost', labelAr: `التكلفة المتوقعة عند +${inflationPct}%/سنة`, labelEn: `Inflation-Adjusted Goal (${inflationPct}%/yr)`, value: fmtEgp(projectedCost), rawValue: projectedCost },
          { key: 'coverage', labelAr: 'نسبة تغطية الهدف المستقبلي', labelEn: 'Projected Goal Coverage', value: `${coveragePct}%` },
          { key: 'delta', labelAr: balanceDelta >= 0 ? 'فائض جاهزية' : 'فجوة يجب سدها', labelEn: balanceDelta >= 0 ? 'Projected Surplus' : 'Projected Gap', value: fmtEgp(Math.abs(balanceDelta)) },
        ],
        breakdown: [
          { key: 'initial', labelAr: 'رأس المال البدائي', labelEn: 'Initial Capital', amount: initial, percent: pct(initial, cumulativeSavings) },
          { key: 'contribs', labelAr: `إجمالي دفعاتك بزيادة ${stepUpPct}% سنوياً`, labelEn: `Contributions w/ ${stepUpPct}% Annual Step-Up`, amount: totalContributions, percent: pct(totalContributions, cumulativeSavings) },
          ...(yearSnapshots.length >= 2
            ? [
                {
                  key: 'halfway',
                  labelAr: `رصيد منتصف المدة (السنة ${yearSnapshots[Math.floor(yearSnapshots.length / 2) - 1].year})`,
                  labelEn: `Midpoint Check (Year ${yearSnapshots[Math.floor(yearSnapshots.length / 2) - 1].year})`,
                  amount: yearSnapshots[Math.floor(yearSnapshots.length / 2) - 1].totalSaved,
                },
              ]
            : []),
        ],
        formulaSummaryAr: 'تراكم خطي حقيقي للدفعات الشهرية المتصاعدة سنوياً مقارنة بالتكلفة المعدّلة بافتراض التضخم المختار',
        formulaSummaryEn: 'Savings = Initial + Σ(Year1Monthly × (1+StepUp%)^(y−1) × 12) vs. TodayCost × (1+Inflation%)^Years',
        assumptionsAr: [
          'التوقعات مبنية على إجمالي مدخراتك النقدية الصافية فقط مع فصل واضح بين المبلغ المتاح حالياً والمستهدف مستقبلاً.',
          'نسبة التضخم في التكلفة معامل اختبار شفاف قابل للتعديل ولا يُعد توقعاً اقتصادياً رسمياً.',
        ],
        assumptionsEn: [
          'Distinguishes clearly between today’s cash vs. future nominal savings — zero speculative investment return assumed.',
          'Cost escalation rate is an editable sensitivity parameter rather than a guaranteed macro forecast.',
        ],
        warningsAr:
          balanceDelta < 0
            ? [`تظهر المحاكاة فجوة قدرها ${Math.abs(balanceDelta).toLocaleString()} ج.م — يمكنك رفع الادخار الشهري المبدئي أو تمديد الأفق الزمني.`]
            : [],
        warningsEn:
          balanceDelta < 0
            ? [`Projection leaves a ${fmtEgp(Math.abs(balanceDelta))} gap — increasing monthly step-ups or extending timeline closes it cleanly.`]
            : [],
        suggestedBudgetCategorySlug: 'emergency',
        suggestedBudgetTitleAr: `تخطيط طويل المدى (${years} سنوات)`,
        suggestedBudgetTitleEn: `${years}-Year Savings Trajectory`,
        computedAt: new Date().toISOString(),
      };
    },
  },

  // #20: Emergency Reserve Calculator
  {
    slug: 'emergency-reserve',
    order: 20,
    categoryGroup: 'finance_planning',
    nameAr: 'حاسبة احتياطي الطوارئ وأمان ما بعد الفرح',
    nameEn: 'Marriage & Move-In Emergency Reserve Calculator',
    shortDescAr: 'تحدد الصندوق الآمن لتقلبات الأسعار (10–15%) + مصروف معيشة أول 3 أشهر بعد الزواج بعيداً عن الديون.',
    shortDescEn: 'Computes the protective buffer (10–15%) plus 3-month newlywed living runway.',
    iconName: 'ShieldCheck',
    primaryUnit: 'EGP',
    suggestedBudgetCategorySlug: 'emergency',
    defaultInputs: {
      totalMarriageBudgetEgp: 650000,
      monthlyHouseholdRunCostEgp: 14000,
      reserveRatioPercent: 12,
      monthsLivingRunway: 3,
    },
    fields: [
      { key: 'totalMarriageBudgetEgp', type: 'number', labelAr: 'إجمالي ميزانية الزواج والتشطيب الحالية', labelEn: 'Total Planned Marriage Budget', unitAr: 'ج.م', unitEn: 'EGP', min: 50000, max: 5000000, step: 10000 },
      { key: 'monthlyHouseholdRunCostEgp', type: 'number', labelAr: 'متوسط مصروف البيت الشهري المتوقع بعد الفرح', labelEn: 'Expected Monthly Household Living Cost', unitAr: 'ج.م', unitEn: 'EGP', min: 4000, max: 200000, step: 1000 },
      { key: 'reserveRatioPercent', type: 'number', labelAr: 'نسبة احتياطي طوارئ التشطيب والزفاف (%)', labelEn: 'Project Contingency Ratio (%)', unitAr: '%', unitEn: '%', min: 5, max: 25, step: 1 },
      { key: 'monthsLivingRunway', type: 'number', labelAr: 'أشهر الأمان للمعيشة بعد الزواج', labelEn: 'Post-Wedding Runway Months', unitAr: 'شهور', unitEn: 'months', min: 1, max: 6, step: 1 },
    ],
    compute(inputs) {
      const budget = numVal(inputs, 'totalMarriageBudgetEgp', 650000, 20000, 10000000);
      const monthlyLiving = numVal(inputs, 'monthlyHouseholdRunCostEgp', 14000, 2000, 500000);
      const ratio = numVal(inputs, 'reserveRatioPercent', 12, 5, 30);
      const runwayMonths = numVal(inputs, 'monthsLivingRunway', 3, 1, 12);

      const projectBuffer = Math.round(budget * (ratio / 100));
      const newlywedRunway = monthlyLiving * runwayMonths;
      const totalCushion = projectBuffer + newlywedRunway;

      return {
        slug: 'emergency-reserve',
        nameAr: 'حاسبة احتياطي الطوارئ وأمان ما بعد الفرح',
        nameEn: 'Marriage & Move-In Emergency Reserve Calculator',
        primaryMetric: { labelAr: 'إجمالي وسادة الأمان المطلوبة بعيداً عن أي سحب', labelEn: 'Recommended Total Safety Cushion', value: totalCushion, unit: 'EGP', unitLabelAr: 'ج.م', unitLabelEn: 'EGP' },
        secondaryMetrics: [
          { key: 'proj_buf', labelAr: `احتياطي تقلبات التنفيذ (${ratio}%)`, labelEn: `Project Contingency (${ratio}%)`, value: fmtEgp(projectBuffer) },
          { key: 'living_run', labelAr: `سيولة المعيشة لـ ${runwayMonths} أشهر`, labelEn: `${runwayMonths}-Month Living Runway`, value: fmtEgp(newlywedRunway) },
        ],
        breakdown: [
          { key: 'project', labelAr: `صندوق فروق أسعار التشطيب والزفاف (${ratio}%)`, labelEn: `Finishing & Event Contingency (${ratio}%)`, amount: projectBuffer, percent: pct(projectBuffer, totalCushion) },
          { key: 'runway', labelAr: `مصروف البيت لأول ${runwayMonths} شهور بعد الزواج`, labelEn: `Newlywed Household Runway (${runwayMonths}m)`, amount: newlywedRunway, percent: pct(newlywedRunway, totalCushion) },
        ],
        formulaSummaryAr: 'صندوق الأمان = (الميزانية × نسبة الطوارئ%) + (مصروف البيت الشهري × أشهر الأمان)',
        formulaSummaryEn: 'Safety Cushion = (Marriage Budget × Contingency%) + (Monthly Household Cost × Runway Months)',
        assumptionsAr: ['يُفضل فصل هذا المبلغ في حساب منفصل وعدم إدراجه ضمن ميزانية القاعة أو التشطيب الافتراضية.'],
        assumptionsEn: ['Ring-fence this cash in a separate bucket — never allocate it into ballroom or decor upgrades.'],
        warningsAr: ratio < 10 ? ['ينصح خبراء التخطيط الأسري بألا تقل نسبة احتياطي التشطيب عن 10%.'] : [],
        warningsEn: ratio < 10 ? ['Financial planners recommend keeping at least a 10% finishing contingency ratio.'] : [],
        suggestedBudgetCategorySlug: 'emergency',
        suggestedBudgetTitleAr: `احتياطي الطوارئ ومعيشة ${runwayMonths} شهور`,
        suggestedBudgetTitleEn: `Emergency Reserve & ${runwayMonths}m Runway`,
        computedAt: new Date().toISOString(),
      };
    },
  },
];

import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type {
  AiAssistantReplyPayload,
  AiCalculationSnippet,
  AiChatMessage,
  AiCitation,
  AiConversationSummary,
} from '../shared/types';
import { getCalculatorSummary, runCalculator } from '../shared/calculators';

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

function parseJsonArray<T>(raw: unknown): T[] {
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function listUserAiConversations(
  db: DatabaseSync,
  userId: string,
): AiConversationSummary[] {
  const rows = db
    .prepare(
      'SELECT * FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20',
    )
    .all(userId) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: String(row.id),
    sessionTitle: String(row.session_title),
    lastIntent: String(row.last_intent || 'general'),
    messages: parseJsonArray<AiChatMessage>(row.messages_json),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

function extractNumbersNearBudget(query: string): number | null {
  const normalized = query.replace(/,/g, '').replace(/[٠-٩]/g, (d) =>
    String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)),
  );
  const kMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:k|ألف|الف)\b/i);
  if (kMatch) {
    return Math.round(Number(kMatch[1]) * 1000);
  }
  const numMatch = normalized.match(/\b(\d{4,7})\b/);
  if (numMatch) {
    return Number(numMatch[1]);
  }
  return null;
}

function extractAreaSqm(query: string): number | null {
  const normalized = query.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const match = normalized.match(/(\d{2,3})\s*(?:متر|م2|م²|m2|m²|sqm|م\b)/i);
  if (match) {
    const val = Number(match[1]);
    if (val >= 40 && val <= 600) return val;
  }
  return null;
}

function extractGuestCount(query: string): number | null {
  const normalized = query.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const match = normalized.match(/(\d{2,3})\s*(?:فرد|ضيف|مدعو|شخص|guest|guests|people)/i);
  if (match) {
    const val = Number(match[1]);
    if (val >= 20 && val <= 1000) return val;
  }
  return null;
}

function detectIntent(query: string): string {
  const q = query.toLowerCase();
  if (/ميزانيت|مدخرات|البداية المبكرة|رحلتي|my budget|early start|my plan/.test(q)) {
    return 'personal_plan_audit';
  }
  if (/تشطيب|شقة|متر|دهان|سيراميك|بورسلين|سباكة|كهرباء|finishing|paint|tile|sqm/.test(q)) {
    return 'finishing_planning';
  }
  if (/ثلاجة|غسالة|تكييف|شاشة|بوتاجاز|فرن|سخان|ديب فريزر|أجهزة|منتج|fridge|washer|tv|ac|appliance|product/.test(q)) {
    return 'product_intelligence';
  }
  if (/فرح|قاعة|معازيم|مدعوين|فستان|شريك|مقاول|شركاء|wedding|venue|vendor|contractor|hall/.test(q)) {
    return 'vendors_and_wedding';
  }
  return 'general_ecosystem';
}

export function askGroundedAiAssistant(
  db: DatabaseSync,
  viewerUserId: string | null,
  input: {
    query: string;
    conversationId?: string;
    language?: 'ar' | 'en';
  },
): AiAssistantReplyPayload {
  const query = input.query.trim();
  const qLower = query.toLowerCase();
  const now = new Date().toISOString();
  const intent = detectIntent(query);

  const citations: AiCitation[] = [];
  const calculations: AiCalculationSnippet[] = [];
  const arSections: string[] = [];
  const enSections: string[] = [];

  // 1. Live Calculator Grounding (Finishing, Wedding, Paint, Savings)
  const areaSqm = extractAreaSqm(query);
  if (
    intent === 'finishing_planning' ||
    areaSqm !== null ||
    /حساب|تكلفة|تقدير|calculate|cost/.test(qLower)
  ) {
    const targetArea = areaSqm ?? 120;
    const tier = /فاخر|luxury|ألترا|ultra/.test(qLower)
      ? 'luxury'
      : /اقتصادي|economy|economic/.test(qLower)
        ? 'economic'
        : 'medium';

    const finishOut = runCalculator('finishing-cost', { areaSqm: targetArea, tier });
    const finishSummary = getCalculatorSummary('finishing-cost');
    const finishVal = finishOut.primaryMetric.value;
    calculations.push({
      calculatorSlug: 'finishing-cost',
      nameAr: finishSummary?.nameAr || 'حاسبة تكلفة تشطيب الشقة',
      nameEn: finishSummary?.nameEn || 'Apartment Finishing Cost Calculator',
      primaryLabelAr: finishOut.primaryMetric.labelAr,
      primaryLabelEn: finishOut.primaryMetric.labelEn,
      primaryValue: finishVal,
      unit: finishOut.primaryMetric.unit,
      assumptionsAr: finishOut.assumptionsAr,
      assumptionsEn: finishOut.assumptionsEn,
    });
    citations.push({
      kind: 'calculator',
      id: 'calc-finishing-cost',
      labelAr: finishSummary?.nameAr || 'حاسبة تكلفة التشطيب',
      labelEn: finishSummary?.nameEn || 'Finishing Cost Calculator',
      route: '/calculators/finishing-cost',
      priceEgp: finishVal,
      metaText: `${targetArea}m² (${tier})`,
    });

    arSections.push(
      `• **التقدير الهندسي من الحاسبة المباشرة (مساحة ${targetArea} م² — باقة ${tier === 'medium' ? 'متوسطة' : tier === 'luxury' ? 'فاخرة' : 'اقتصادية'}):** التقدير المبدئي هو **${finishVal.toLocaleString()} ج.م**، ومبني على قواعد السباكة والكهرباء والأرضيات والدهانات في موسوعة التشطيب.`,
    );
    enSections.push(
      `• **Live Calculator Estimate (${targetArea} m² — ${tier} tier):** Estimated finishing budget is **${finishVal.toLocaleString()} EGP** based on standard Egyptian MEP, tiling, and paint phases.`,
    );

    if (/دهان|paint/.test(qLower)) {
      const paintOut = runCalculator('paint-quantities', {
        areaSqm: targetArea,
        coats: 3,
      });
      const paintVal = paintOut.primaryMetric.value;
      calculations.push({
        calculatorSlug: 'paint-quantities',
        nameAr: 'حاسبة كميات الدهانات والمعجون',
        nameEn: 'Paint & Putty Calculator',
        primaryLabelAr: paintOut.primaryMetric.labelAr,
        primaryLabelEn: paintOut.primaryMetric.labelEn,
        primaryValue: paintVal,
        unit: paintOut.primaryMetric.unit,
        assumptionsAr: paintOut.assumptionsAr,
        assumptionsEn: paintOut.assumptionsEn,
      });
      citations.push({
        kind: 'calculator',
        id: 'calc-paint',
        labelAr: 'حاسبة كميات الدهانات',
        labelEn: 'Paint Quantities Calculator',
        route: '/calculators/paint-quantities',
        priceEgp: paintVal,
      });
    }
  }

  const guestsNum = extractGuestCount(query);
  if (guestsNum !== null || (/فرح|قاعة|wedding|venue/.test(qLower) && intent !== 'finishing_planning')) {
    const gCount = guestsNum ?? 180;
    const wedOut = runCalculator('wedding-cost', { guestsCount: gCount, venueTier: 'social_club' });
    const wedVal = wedOut.primaryMetric.value;
    calculations.push({
      calculatorSlug: 'wedding-cost',
      nameAr: 'حاسبة تكلفة حفل الزفاف والقاعة',
      nameEn: 'Wedding Ceremony & Reception Cost Calculator',
      primaryLabelAr: wedOut.primaryMetric.labelAr,
      primaryLabelEn: wedOut.primaryMetric.labelEn,
      primaryValue: wedVal,
      unit: wedOut.primaryMetric.unit,
      assumptionsAr: wedOut.assumptionsAr,
      assumptionsEn: wedOut.assumptionsEn,
    });
    citations.push({
      kind: 'calculator',
      id: 'calc-wedding-cost',
      labelAr: 'حاسبة تكلفة الزفاف',
      labelEn: 'Wedding Cost Calculator',
      route: '/calculators/wedding-cost',
      priceEgp: wedVal,
    });
    arSections.push(
      `• **تقدير تكلفة الزفاف (${gCount} مدعو تقريباً):** عبر حاسبة الفرح الموحدة ≈ **${wedVal.toLocaleString()} ج.م**.`,
    );
    enSections.push(
      `• **Wedding Budget Model (~${gCount} guests):** Estimated at **${wedVal.toLocaleString()} EGP**.`,
    );
  }

  // 2. Live DB Product Grounding
  const budgetCap = extractNumbersNearBudget(query);
  const searchTerms: string[] = [];
  if (/ثلاج|fridge|refrigerator/.test(qLower)) searchTerms.push('ثلاجة', 'fridge', 'Sharp', 'Tornado', 'LG');
  if (/غسال|washer|laundry/.test(qLower)) searchTerms.push('غسالة', 'washer', 'wash');
  if (/تكييف|ac\b|inverter/.test(qLower)) searchTerms.push('تكييف', 'Carrier', 'air');
  if (/شاش|tv|تليفزيون/.test(qLower)) searchTerms.push('شاشة', 'Samsung', 'TV');
  if (/بوتاجاز|فرن|cooker|oven/.test(qLower)) searchTerms.push('بوتاجاز', 'Fresh', 'cooker');
  if (/عروسة|أدوات مطبخ|جرانيت|cookware|bride/.test(qLower)) searchTerms.push('طقم', 'Cookware', 'Tefal');

  if (intent === 'product_intelligence' || searchTerms.length > 0 || budgetCap !== null) {
    let productRows = db
      .prepare(
        `SELECT id, slug, name_ar, name_en, brand, price, warranty_months, energy_rating, category
         FROM products
         WHERE stock > 0 ${budgetCap ? 'AND price <= ?' : ''}
         ORDER BY is_featured DESC, price ASC`,
      )
      .all(...(budgetCap ? [budgetCap] : [])) as Record<string, unknown>[];

    if (searchTerms.length > 0) {
      const matched = productRows.filter((r) => {
        const hay = `${r.name_ar} ${r.name_en} ${r.brand} ${r.category}`.toLowerCase();
        return searchTerms.some((term) => hay.includes(term.toLowerCase()));
      });
      if (matched.length > 0) {
        productRows = matched;
      }
    }

    const pickedProducts = productRows.slice(0, 4);
    if (pickedProducts.length > 0) {
      for (const p of pickedProducts) {
        citations.push({
          kind: 'product',
          id: String(p.id),
          labelAr: String(p.name_ar),
          labelEn: String(p.name_en),
          route: `/products/${String(p.slug || p.id)}`,
          priceEgp: Number(p.price),
          metaText: `${Number(p.warranty_months || 12)}m warranty`,
        });
      }
      const listAr = pickedProducts
        .map(
          (p) =>
            `${String(p.name_ar)} (${Number(p.price).toLocaleString()} ج.م — ضمان ${Number(p.warranty_months || 12)} شهر)`,
        )
        .join(' • ');
      const listEn = pickedProducts
        .map(
          (p) =>
            `${String(p.name_en)} (${Number(p.price).toLocaleString()} EGP — ${Number(p.warranty_months || 12)}m warranty)`,
        )
        .join(' • ');
      arSections.push(
        `• **منتجات موثقة الأسعار من موسوعة الكتالوج${budgetCap ? ` (بحد أقصى ${budgetCap.toLocaleString()} ج.م)` : ''}:** ${listAr}.`,
      );
      enSections.push(
        `• **Live Catalog Products${budgetCap ? ` (under ${budgetCap.toLocaleString()} EGP)` : ''}:** ${listEn}.`,
      );
    } else if (budgetCap !== null) {
      arSections.push(
        `• لم نجد منتجات متطابقة في المخزون بسعر أقل من ${budgetCap.toLocaleString()} ج.م — يمكنك تصفح مقارنة الأسعار وتفعيل تنبيه السعر في موسوعة المنتجات.`,
      );
      enSections.push(
        `• No in-stock catalog item matched under ${budgetCap.toLocaleString()} EGP — explore comparable tiers or set a Price Alert in the Product Encyclopedia.`,
      );
    }
  }

  // 3. Live DB Vendors & Finishing Materials Grounding
  const govFilter = /القاهرة|cairo/.test(qLower)
    ? 'cairo'
    : /الجيزة|giza/.test(qLower)
      ? 'giza'
      : /الإسكندرية|الاسكندرية|alexandria/.test(qLower)
        ? 'alexandria'
        : null;

  if (
    intent === 'vendors_and_wedding' ||
    intent === 'finishing_planning' ||
    govFilter !== null
  ) {
    const vendorRows = db
      .prepare(
        `SELECT id, slug, business_name_ar, business_name_en, governorate_slug, verification_status, starting_price_egp, primary_category_slug
         FROM vendors
         WHERE verification_status != 'rejected'
         ${govFilter ? 'AND governorate_slug = ?' : ''}
         ORDER BY CASE verification_status WHEN 'trusted' THEN 1 WHEN 'verified' THEN 2 ELSE 3 END, is_featured_commercial DESC
         LIMIT 4`,
      )
      .all(...(govFilter ? [govFilter] : [])) as Record<string, unknown>[];

    if (vendorRows.length > 0) {
      for (const v of vendorRows) {
        citations.push({
          kind: 'vendor',
          id: String(v.id),
          labelAr: String(v.business_name_ar),
          labelEn: String(v.business_name_en),
          route: `/vendors/${String(v.slug)}`,
          priceEgp: Number(v.starting_price_egp || 0) || null,
          metaText: String(v.verification_status),
        });
      }
      arSections.push(
        `• **شركاء من الدليل الرسمي${govFilter ? ` (${govFilter})` : ''}:** ${vendorRows
          .map(
            (v) =>
              `${String(v.business_name_ar)} [${String(v.verification_status) === 'trusted' ? 'شريك موثوق' : String(v.verification_status) === 'verified' ? 'معتمد' : 'مسجل'}]`,
          )
          .join('، ')} — يمكنك طلب عروض أسعار سرية من أكثر من شريك عبر مركز RFQ.`,
      );
      enSections.push(
        `• **Live Vendor Directory${govFilter ? ` (${govFilter})` : ''}:** ${vendorRows
          .map((v) => `${String(v.business_name_en)} [${String(v.verification_status)}]`)
          .join(', ')} — request confidential multi-vendor quotes via the RFQ Center.`,
      );
    }

    if (intent === 'finishing_planning') {
      const matRows = db
        .prepare(
          'SELECT id, slug, name_ar, name_en, price_min_egp, price_max_egp, unit_ar, unit_en FROM finishing_materials LIMIT 3',
        )
        .all() as Record<string, unknown>[];
      for (const m of matRows) {
        citations.push({
          kind: 'material',
          id: String(m.id),
          labelAr: `${String(m.name_ar)} (${Number(m.price_min_egp).toLocaleString()}–${Number(m.price_max_egp).toLocaleString()} ج.م / ${String(m.unit_ar)})`,
          labelEn: `${String(m.name_en)} (${Number(m.price_min_egp).toLocaleString()}–${Number(m.price_max_egp).toLocaleString()} EGP / ${String(m.unit_en)})`,
          route: '/finishing/materials',
          priceEgp: Number(m.price_min_egp),
        });
      }
    }
  }

  // 4. Published Editorial Guides Grounding
  const guideRows = db
    .prepare(
      `SELECT id, slug, title_ar, title_en, domain FROM articles WHERE status = 'published' ORDER BY view_count DESC LIMIT 2`,
    )
    .all() as Record<string, unknown>[];
  for (const g of guideRows) {
    citations.push({
      kind: 'article',
      id: String(g.id),
      labelAr: String(g.title_ar),
      labelEn: String(g.title_en),
      route: `/guides/${String(g.slug)}`,
      metaText: String(g.domain),
    });
  }

  // 5. Strict Authenticated Personal Journey / Budget Context Grounding
  let usedPersonalContext = false;
  if (viewerUserId) {
    const budgetPlan = db
      .prepare('SELECT id, total_budget_limit FROM budget_plans WHERE user_id = ?')
      .get(viewerUserId) as { id: string; total_budget_limit: number } | undefined;
    const paidSumRow = db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) as paid, COALESCE(SUM(CASE WHEN status != 'paid' THEN amount ELSE 0 END), 0) as pending FROM budget_expenses WHERE user_id = ?",
      )
      .get(viewerUserId) as { paid: number; pending: number };
    const earlyProfile = db
      .prepare(
        'SELECT target_marriage_budget, timeframe_months, monthly_savings_target FROM early_start_profiles WHERE user_id = ?',
      )
      .get(viewerUserId) as
      | { target_marriage_budget: number; timeframe_months: number; monthly_savings_target: number }
      | undefined;
    const tasksRow = db
      .prepare("SELECT COUNT(*) as open_tasks FROM journey_tasks WHERE user_id = ? AND status != 'done'")
      .get(viewerUserId) as { open_tasks: number };

    if (budgetPlan || earlyProfile) {
      usedPersonalContext = true;
      if (budgetPlan) {
        citations.push({
          kind: 'user_budget',
          id: budgetPlan.id,
          labelAr: `ميزانيتك الحالية (سقف ${Number(budgetPlan.total_budget_limit).toLocaleString()} ج.م)`,
          labelEn: `Your Active Budget (Cap ${Number(budgetPlan.total_budget_limit).toLocaleString()} EGP)`,
          route: '/my/budget',
          priceEgp: Number(budgetPlan.total_budget_limit),
        });
        arSections.push(
          `• **ملخص حسابك الخاص (البيانات محمية ومرئية لك فقط):** سقف ميزانيتك المسجل **${Number(budgetPlan.total_budget_limit).toLocaleString()} ج.م**، تم سداد **${Number(paidSumRow.paid).toLocaleString()} ج.م** ومتبقي مصروفات مجدولة **${Number(paidSumRow.pending).toLocaleString()} ج.م**، ولديك **${Number(tasksRow.open_tasks)}** مهام مفتوحة في مخطط الرحلة.`,
        );
        enSections.push(
          `• **Your Private Workspace Snapshot:** Active budget cap **${Number(budgetPlan.total_budget_limit).toLocaleString()} EGP**, paid **${Number(paidSumRow.paid).toLocaleString()} EGP**, pending **${Number(paidSumRow.pending).toLocaleString()} EGP**, plus **${Number(tasksRow.open_tasks)}** open journey tasks.`,
        );
      }
      if (earlyProfile) {
        arSections.push(
          `• **خطة البداية المبكرة الخاصة بك:** أفق تجهيز **${earlyProfile.timeframe_months} شهراً** بهدف إدخار شهري **${Number(earlyProfile.monthly_savings_target).toLocaleString()} ج.م** نحو ميزانية **${Number(earlyProfile.target_marriage_budget).toLocaleString()} ج.م**.`,
        );
        enSections.push(
          `• **Early Start Plan:** **${earlyProfile.timeframe_months}-month** horizon saving **${Number(earlyProfile.monthly_savings_target).toLocaleString()} EGP/mo** toward **${Number(earlyProfile.target_marriage_budget).toLocaleString()} EGP**.`,
        );
      }
    }
  } else if (intent === 'personal_plan_audit') {
    arSections.push(
      `• لتحليل ميزانيتك الفعلية ومهام رحلتك، يرجى تسجيل الدخول بحسابك (نحافظ على سرية بياناتك المالية 100% ولا نعرضها للعامة).`,
    );
    enSections.push(
      `• Sign in to analyze your live budget ledger, savings horizon, and open journey tasks (kept strictly private to your account).`,
    );
  }

  if (arSections.length === 0) {
    arSections.push(
      `• يمكنني مساعدتك فوراً بأرقام وحقائق حية من قاعدة بيانات جواز إن: اكتب مثلاً مساحة شقتك لحساب التشطيب، أو حدد جهازاً بميزانية (مثل: ثلاجة تحت 38000 ج.م)، أو اسم محافظة لاستعراض الشركاء.`,
    );
    enSections.push(
      `• I ground every answer in live GAWAZ INN database records and deterministic calculators. Ask for apartment finishing estimates (e.g. 120m²), catalog appliances under a target EGP price, verified local vendors, or your private budget status.`,
    );
  }

  const disclaimerAr =
    'إرشاد مبني على بيانات جواز إن الحية وحاسباتها الهندسية والمالية؛ لا يُعد فتوى قانونية أو استشارة استثمارية، وتُراجع العقود والمقاسات ميدانياً قبل التنفيذ.';
  const disclaimerEn =
    'Grounded strictly in live GAWAZ INN catalog, vendor, and calculator records; informational planning guidance only — verify on-site measurements and contracts before payment.';

  const userMessage: AiChatMessage = {
    id: newId('msg-u'),
    role: 'user',
    contentAr: query,
    contentEn: query,
    citations: [],
    calculations: [],
    createdAt: now,
  };

  const assistantMessage: AiChatMessage = {
    id: newId('msg-a'),
    role: 'assistant',
    contentAr: arSections.join('\n'),
    contentEn: enSections.join('\n'),
    citations,
    calculations,
    createdAt: new Date(Date.now() + 1).toISOString(),
  };

  // Persist conversation for signed-in owner (with strict ownership guard)
  let conversationId = input.conversationId || newId('ai-conv');
  if (viewerUserId) {
    const existing = db
      .prepare('SELECT id, user_id, messages_json FROM ai_conversations WHERE id = ?')
      .get(conversationId) as
      | { id: string; user_id: string | null; messages_json: string }
      | undefined;

    if (existing) {
      if (existing.user_id !== viewerUserId) {
        const err = new Error('Forbidden conversation access');
        (err as Error & { statusCode?: number; code?: string }).statusCode = 403;
        (err as Error & { statusCode?: number; code?: string }).code = 'FORBIDDEN';
        throw err;
      }
      const prevMessages = parseJsonArray<AiChatMessage>(existing.messages_json);
      const updated = [...prevMessages, userMessage, assistantMessage].slice(-30);
      db.prepare(
        'UPDATE ai_conversations SET messages_json = ?, last_intent = ?, updated_at = ? WHERE id = ?',
      ).run(JSON.stringify(updated), intent, now, conversationId);
    } else {
      conversationId = newId('ai-conv');
      db.prepare(
        `INSERT INTO ai_conversations (id, user_id, guest_token, session_title, messages_json, last_intent, created_at, updated_at)
         VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
      ).run(
        conversationId,
        viewerUserId,
        query.slice(0, 72),
        JSON.stringify([userMessage, assistantMessage]),
        intent,
        now,
        now,
      );
    }
  }

  const providerMode: AiAssistantReplyPayload['providerMode'] =
    process.env.AI_PROVIDER_API_KEY && process.env.AI_PROVIDER_API_KEY.trim().length > 8
      ? 'external_llm_rag'
      : 'deterministic_db_rag';

  return {
    conversationId,
    intent,
    providerMode,
    groundedFactsCount: citations.length + calculations.length,
    usedPersonalContext,
    disclaimerAr,
    disclaimerEn,
    userMessage,
    assistantMessage,
  };
}

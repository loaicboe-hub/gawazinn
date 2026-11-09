import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { DEFAULT_BUDGET_CATEGORIES } from '../shared/calculators';
import type {
  BudgetAlert,
  BudgetCategory,
  BudgetExpense,
  BudgetExpenseStatus,
  BudgetOverviewPayload,
  BudgetOwnerSide,
  BudgetPaymentType,
  BudgetPlan,
  BudgetSourceType,
} from '../shared/types';

export function mapBudgetPlanRow(row: Record<string, unknown>): BudgetPlan {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    titleAr: String(row.title_ar),
    titleEn: String(row.title_en),
    totalBudgetLimit: Number(row.total_budget_limit),
    groomContributionTarget: Number(row.groom_contribution_target),
    brideContributionTarget: Number(row.bride_contribution_target),
    familySupportTarget: Number(row.family_support_target),
    emergencyReserveTarget: Number(row.emergency_reserve_target),
    currency: String(row.currency || 'EGP'),
    updatedAt: String(row.updated_at),
  };
}

export function mapBudgetExpenseRow(
  row: Record<string, unknown>,
  catSlugMap: Map<string, string>,
): BudgetExpense {
  const catId = String(row.budget_category_id);
  return {
    id: String(row.id),
    budgetPlanId: String(row.budget_plan_id),
    budgetCategoryId: catId,
    categorySlug: catSlugMap.get(catId) || String(row.category_slug || 'emergency'),
    userId: String(row.user_id),
    title: String(row.title),
    vendorOrPayee: row.vendor_or_payee ? String(row.vendor_or_payee) : null,
    amount: Number(row.amount),
    paymentType: row.payment_type as BudgetPaymentType,
    status: row.status as BudgetExpenseStatus,
    paidBySide: row.paid_by_side as BudgetOwnerSide,
    dueDate: row.due_date ? String(row.due_date) : null,
    paidAt: row.paid_at ? String(row.paid_at) : null,
    sourceType: row.source_type as BudgetSourceType,
    sourceId: row.source_id ? String(row.source_id) : null,
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function ensureUserBudgetPlan(db: DatabaseSync, userId: string): BudgetPlan {
  const existing = db
    .prepare('SELECT * FROM budget_plans WHERE user_id = ?')
    .get(userId) as Record<string, unknown> | undefined;
  const now = new Date().toISOString();

  if (existing) {
    return mapBudgetPlanRow(existing);
  }

  const planId = `bp-${crypto.randomUUID().slice(0, 10)}`;
  const defaultTotal = DEFAULT_BUDGET_CATEGORIES.reduce((s, c) => s + c.plannedAmount, 0);

  db.prepare(
    `INSERT INTO budget_plans (id, user_id, title_ar, title_en, total_budget_limit, groom_contribution_target, bride_contribution_target, family_support_target, emergency_reserve_target, currency, updated_at)
     VALUES (?, ?, 'ميزانية الزواج وتجهيز البيت', 'Wedding & Home Preparation Budget', ?, ?, ?, ?, 65000, 'EGP', ?)`,
  ).run(
    planId,
    userId,
    defaultTotal,
    Math.round(defaultTotal * 0.65),
    Math.round(defaultTotal * 0.25),
    Math.round(defaultTotal * 0.1),
    now,
  );

  const insertCat = db.prepare(
    `INSERT INTO budget_categories (id, budget_plan_id, user_id, slug, name_ar, name_en, owner_side, planned_amount, limit_amount, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  for (const cat of DEFAULT_BUDGET_CATEGORIES) {
    insertCat.run(
      `bc-${crypto.randomUUID().slice(0, 10)}`,
      planId,
      userId,
      cat.slug,
      cat.nameAr,
      cat.nameEn,
      cat.ownerSide,
      cat.plannedAmount,
      cat.limitAmount,
      cat.sortOrder,
    );
  }

  const created = db
    .prepare('SELECT * FROM budget_plans WHERE id = ?')
    .get(planId) as Record<string, unknown>;
  return mapBudgetPlanRow(created);
}

export function buildBudgetOverview(db: DatabaseSync, userId: string): BudgetOverviewPayload {
  const plan = ensureUserBudgetPlan(db, userId);

  const catRows = db
    .prepare('SELECT * FROM budget_categories WHERE user_id = ? ORDER BY sort_order ASC, name_en ASC')
    .all(userId) as Record<string, unknown>[];
  const catSlugMap = new Map<string, string>();
  catRows.forEach((c) => catSlugMap.set(String(c.id), String(c.slug)));

  const expRows = db
    .prepare('SELECT * FROM budget_expenses WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Record<string, unknown>[];
  const expenses = expRows.map((row) => mapBudgetExpenseRow(row, catSlugMap));

  const paidByCat = new Map<string, number>();
  const upcomingByCat = new Map<string, number>();
  const plannedExpByCat = new Map<string, number>();

  let totalPaid = 0;
  let totalUpcoming = 0;
  let groomPaid = 0;
  let bridePaid = 0;
  let sharedPaid = 0;

  for (const exp of expenses) {
    if (exp.status === 'paid') {
      totalPaid += exp.amount;
      paidByCat.set(exp.budgetCategoryId, (paidByCat.get(exp.budgetCategoryId) || 0) + exp.amount);
      if (exp.paidBySide === 'groom') groomPaid += exp.amount;
      else if (exp.paidBySide === 'bride') bridePaid += exp.amount;
      else sharedPaid += exp.amount;
    } else if (exp.status === 'upcoming') {
      totalUpcoming += exp.amount;
      upcomingByCat.set(exp.budgetCategoryId, (upcomingByCat.get(exp.budgetCategoryId) || 0) + exp.amount);
    } else {
      plannedExpByCat.set(exp.budgetCategoryId, (plannedExpByCat.get(exp.budgetCategoryId) || 0) + exp.amount);
    }
  }

  let totalPlanned = 0;
  let groomAllocated = 0;
  let brideAllocated = 0;
  let sharedAllocated = 0;
  const alerts: BudgetAlert[] = [];

  const categories: BudgetCategory[] = catRows.map((row) => {
    const id = String(row.id);
    const slug = String(row.slug);
    const nameAr = String(row.name_ar);
    const nameEn = String(row.name_en);
    const ownerSide = row.owner_side as BudgetOwnerSide;
    const plannedAmount = Number(row.planned_amount);
    const limitAmount = Number(row.limit_amount);
    const paidAmount = paidByCat.get(id) || 0;
    const upcomingAmount = upcomingByCat.get(id) || 0;
    const totalCommitted = paidAmount + upcomingAmount + (plannedExpByCat.get(id) || 0);
    const remainingAmount = Math.max(0, limitAmount - (paidAmount + upcomingAmount));
    const isOverLimit = limitAmount > 0 && paidAmount + upcomingAmount > limitAmount;

    totalPlanned += plannedAmount;
    if (ownerSide === 'groom') groomAllocated += plannedAmount;
    else if (ownerSide === 'bride') brideAllocated += plannedAmount;
    else sharedAllocated += plannedAmount;

    if (isOverLimit) {
      const overrun = Math.round(paidAmount + upcomingAmount - limitAmount);
      alerts.push({
        type: 'over_limit',
        severity: 'critical',
        titleAr: `تجاوز سقف بند "${nameAr}"`,
        titleEn: `Category "${nameEn}" exceeds cap`,
        detailAr: `المصروفات والالتزامات القادمة تجاوزت الحد المسموح بمقدار ${overrun.toLocaleString()} ج.م.`,
        detailEn: `Paid & upcoming obligations exceed cap by ${overrun.toLocaleString()} EGP.`,
        categorySlug: slug,
      });
    }

    return {
      id,
      budgetPlanId: String(row.budget_plan_id),
      userId: String(row.user_id),
      slug,
      nameAr,
      nameEn,
      ownerSide,
      plannedAmount,
      limitAmount,
      paidAmount,
      upcomingAmount,
      totalCommitted,
      remainingAmount,
      isOverLimit,
      sortOrder: Number(row.sort_order),
    };
  });

  // Alert on upcoming payments within the next 14 days (or already past due)
  const nowTime = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  for (const exp of expenses) {
    if (exp.status === 'upcoming' && exp.dueDate) {
      const dueTs = Date.parse(exp.dueDate);
      if (Number.isFinite(dueTs) && dueTs - nowTime <= fourteenDaysMs) {
        const isOverdue = dueTs < nowTime;
        alerts.push({
          type: 'upcoming_payment',
          severity: isOverdue ? 'critical' : 'warning',
          titleAr: isOverdue ? `دفعة مستحقة متأخرة: ${exp.title}` : `دفعة قادمة قريباً: ${exp.title}`,
          titleEn: isOverdue ? `Overdue Payment: ${exp.title}` : `Upcoming Payment Due: ${exp.title}`,
          detailAr: `${exp.amount.toLocaleString()} ج.م — تاريخ الاستحقاق ${exp.dueDate.slice(0, 10)}`,
          detailEn: `${exp.amount.toLocaleString()} EGP due on ${exp.dueDate.slice(0, 10)}.`,
          categorySlug: exp.categorySlug,
          expenseId: exp.id,
        });
      }
    }
  }

  const emergencyCat = categories.find((c) => c.slug === 'emergency');
  if (
    plan.emergencyReserveTarget > 0 &&
    emergencyCat &&
    emergencyCat.plannedAmount < plan.emergencyReserveTarget * 0.7
  ) {
    alerts.push({
      type: 'reserve_low',
      severity: 'warning',
      titleAr: 'مخصص احتياطي الطوارئ أقل من الهدف المحدد',
      titleEn: 'Emergency Reserve Allocation Below Target',
      detailAr: 'يُنصح بالحفاظ على احتياطي لا يقل عن 10% لتفادي أي ضغوط أثناء التشطيب.',
      detailEn: 'Consider raising the Emergency Reserve category to stay cushioned during execution.',
      categorySlug: 'emergency',
    });
  }

  const totalCommitted = totalPaid + totalUpcoming;
  const remainingFromLimit = Math.max(0, plan.totalBudgetLimit - totalCommitted);
  const utilizationPercent =
    plan.totalBudgetLimit > 0 ? Math.min(200, Math.round((totalCommitted / plan.totalBudgetLimit) * 100)) : 0;

  return {
    plan,
    categories,
    expenses,
    alerts,
    summary: {
      totalBudgetLimit: plan.totalBudgetLimit,
      totalPlanned,
      totalPaid,
      totalUpcoming,
      totalCommitted,
      remainingFromLimit,
      utilizationPercent,
      groomAllocated,
      brideAllocated,
      sharedAllocated,
      groomPaid,
      bridePaid,
      sharedPaid,
    },
  };
}

export function upsertBudgetExpenseFromSource(
  db: DatabaseSync,
  params: {
    userId: string;
    categoryId: string;
    budgetPlanId: string;
    title: string;
    vendorOrPayee?: string | null;
    amount: number;
    paymentType: BudgetPaymentType;
    status: BudgetExpenseStatus;
    paidBySide: BudgetOwnerSide;
    dueDate?: string | null;
    paidAt?: string | null;
    sourceType: BudgetSourceType;
    sourceId: string;
    notes?: string | null;
  },
): { id: string; inserted: boolean } {
  const existing = db
    .prepare('SELECT id FROM budget_expenses WHERE user_id = ? AND source_type = ? AND source_id = ?')
    .get(params.userId, params.sourceType, params.sourceId) as { id: string } | undefined;
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(
      `UPDATE budget_expenses SET
         budget_category_id = ?,
         title = ?,
         vendor_or_payee = COALESCE(?, vendor_or_payee),
         amount = ?,
         payment_type = ?,
         status = ?,
         paid_by_side = ?,
         notes = COALESCE(?, notes),
         updated_at = ?
       WHERE id = ?`,
    ).run(
      params.categoryId,
      params.title,
      params.vendorOrPayee ?? null,
      params.amount,
      params.paymentType,
      params.status,
      params.paidBySide,
      params.notes ?? null,
      now,
      existing.id,
    );
    return { id: existing.id, inserted: false };
  }

  const newId = `bexp-${crypto.randomUUID().slice(0, 10)}`;
  db.prepare(
    `INSERT INTO budget_expenses
       (id, budget_plan_id, budget_category_id, user_id, title, vendor_or_payee, amount, payment_type, status, paid_by_side, due_date, paid_at, source_type, source_id, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    newId,
    params.budgetPlanId,
    params.categoryId,
    params.userId,
    params.title,
    params.vendorOrPayee ?? null,
    params.amount,
    params.paymentType,
    params.status,
    params.paidBySide,
    params.dueDate ?? null,
    params.status === 'paid' ? params.paidAt || now : null,
    params.sourceType,
    params.sourceId,
    params.notes ?? null,
    now,
    now,
  );
  return { id: newId, inserted: true };
}

export function syncUserTransactionsToBudget(
  db: DatabaseSync,
  userId: string,
): { syncedCount: number; overview: BudgetOverviewPayload } {
  const plan = ensureUserBudgetPlan(db, userId);
  const catRows = db
    .prepare('SELECT id, slug FROM budget_categories WHERE user_id = ?')
    .all(userId) as { id: string; slug: string }[];
  const bySlug = new Map<string, string>(catRows.map((c) => [c.slug, c.id]));
  const fallbackCatId = bySlug.get('appliances') || catRows[0]?.id;
  let syncedCount = 0;

  if (!fallbackCatId) {
    return { syncedCount: 0, overview: buildBudgetOverview(db, userId) };
  }

  // 1. Sync customer's Orders -> appliances / bride_trousseau category
  const userOrders = db
    .prepare("SELECT id, total, payment_method, status, created_at FROM orders WHERE user_id = ? AND status != 'cancelled'")
    .all(userId) as { id: string; total: number; payment_method: string; status: string; created_at: string }[];

  for (const ord of userOrders) {
    const firstItemRow = db
      .prepare('SELECT product_snapshot_json FROM order_items WHERE order_id = ? LIMIT 1')
      .get(ord.id) as { product_snapshot_json: string } | undefined;
    let targetSlug = 'appliances';
    let side: BudgetOwnerSide = 'groom';
    if (firstItemRow) {
      try {
        const snap = JSON.parse(firstItemRow.product_snapshot_json) as { trousseauType?: string };
        if (snap.trousseauType === 'bride') {
          targetSlug = 'bride_trousseau';
          side = 'bride';
        }
      } catch {
        // default appliances
      }
    }
    const catId = bySlug.get(targetSlug) || fallbackCatId;
    const res = upsertBudgetExpenseFromSource(db, {
      userId,
      budgetPlanId: plan.id,
      categoryId: catId,
      title: `طلب متجر جواز إن #${ord.id}`,
      vendorOrPayee: 'GAWAZ INN Store',
      amount: Number(ord.total),
      paymentType: ord.payment_method === 'installments_request' ? 'installment' : 'full',
      status: ord.status === 'delivered' ? 'paid' : 'upcoming',
      paidBySide: side,
      paidAt: ord.status === 'delivered' ? ord.created_at : null,
      sourceType: 'order',
      sourceId: ord.id,
      notes: 'مزامنة تلقائية من سجل الطلبات بدون تكرار',
    });
    if (res.inserted) syncedCount += 1;
  }

  // 2. Sync customer's Wedding Bookings -> wedding category
  const weddings = db
    .prepare(
      "SELECT wb.id, wb.service_name, wb.wedding_date, wb.status, COALESCE(ws.starting_price, 45000) as est_price FROM wedding_bookings wb LEFT JOIN wedding_services ws ON ws.id = wb.service_id WHERE wb.user_id = ? AND wb.status != 'cancelled'",
    )
    .all(userId) as { id: string; service_name: string; wedding_date: string; status: string; est_price: number }[];
  const wedCatId = bySlug.get('wedding') || fallbackCatId;

  for (const wb of weddings) {
    const res = upsertBudgetExpenseFromSource(db, {
      userId,
      budgetPlanId: plan.id,
      categoryId: wedCatId,
      title: `حجز فرح: ${wb.service_name}`,
      vendorOrPayee: wb.service_name,
      amount: Number(wb.est_price),
      paymentType: 'deposit',
      status: wb.status === 'date_confirmed' ? 'upcoming' : 'planned',
      paidBySide: 'shared',
      dueDate: wb.wedding_date,
      sourceType: 'wedding_booking',
      sourceId: wb.id,
      notes: 'مزامنة من طلبات فرحي',
    });
    if (res.inserted) syncedCount += 1;
  }

  return { syncedCount, overview: buildBudgetOverview(db, userId) };
}


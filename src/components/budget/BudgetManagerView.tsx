import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { BudgetExpenseStatus, BudgetOwnerSide, BudgetPaymentType } from '../../types';
import {
  Wallet,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  Printer,
  RefreshCw,
  Calculator,
  Edit3,
  Check,
  User as UserIcon,
} from 'lucide-react';

export const BudgetManagerView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    budgetOverview,
    updateBudgetPlan,
    updateBudgetCategory,
    createBudgetExpense,
    updateBudgetExpense,
    deleteBudgetExpense,
    syncBudgetTransactions,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses'>('overview');
  const [sideFilter, setSideFilter] = useState<'all' | BudgetOwnerSide>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | BudgetExpenseStatus>('all');
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState<string>('');
  const [syncing, setSyncing] = useState(false);

  // Add Expense Form
  const [expCategorySlug, setExpCategorySlug] = useState('finishing');
  const [expTitle, setExpTitle] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expType, setExpType] = useState<BudgetPaymentType>('deposit');
  const [expStatus, setExpStatus] = useState<BudgetExpenseStatus>('paid');
  const [expSide, setExpSide] = useState<BudgetOwnerSide>('shared');
  const [expDueDate, setExpDueDate] = useState('');

  // Inline category planned edit
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catPlannedInput, setCatPlannedInput] = useState('');
  const [catLimitInput, setCatLimitInput] = useState('');

  const filteredCategories = useMemo(() => {
    if (!budgetOverview) return [];
    if (sideFilter === 'all') return budgetOverview.categories;
    return budgetOverview.categories.filter((c) => c.ownerSide === sideFilter);
  }, [budgetOverview, sideFilter]);

  const filteredExpenses = useMemo(() => {
    if (!budgetOverview) return [];
    return budgetOverview.expenses.filter((e) => {
      if (sideFilter !== 'all' && e.paidBySide !== sideFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      return true;
    });
  }, [budgetOverview, sideFilter, statusFilter]);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] mx-auto flex items-center justify-center shadow-lg border border-rose-100">
          <Wallet className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar'
            ? 'مدير ميزانية الزواج الخاص بك'
            : 'Personal Wedding & Home Budget Manager'}
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {language === 'ar'
            ? 'سجّل الدخول لمتابعة سقف كل بند (تشطيب، أجهزة، أثاث، شبكة، فرح)، وتسجيل الدفعات والعربون والمصروفات الفعلية، وتنبيهات تجاوز الحد وتصدير التقارير.'
            : 'Sign in to organize category caps, track deposits vs. upcoming installments, receive overrun alerts, and export clean CSV/PDF budgets.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            data-testid="budget-signin-btn"
            className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
          >
            <UserIcon className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل الدخول لإدارة ميزانيتي' : 'Sign In to Open My Budget'}</span>
          </button>
          <Link
            to="/calculators"
            className="bg-white border border-gray-200 hover:border-[#D91B3E]/40 text-gray-700 font-bold text-xs py-3 px-6 rounded-xl transition flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'استخدم الحاسبات الـ 20 مجاناً' : 'Explore 20 Free Calculators'}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!budgetOverview) {
    return (
      <div className="min-h-[45vh] flex flex-col items-center justify-center gap-3 py-16">
        <div className="w-9 h-9 rounded-full border-4 border-[#FDE8ED] border-t-[#D91B3E] animate-spin" />
        <p className="text-xs font-bold text-[#B31331]">
          {language === 'ar' ? 'جاري تحميل ميزانية الزواج...' : 'Loading Wedding Budget Manager...'}
        </p>
      </div>
    );
  }

  const { plan, summary, alerts, categories } = budgetOverview;
  const egp = language === 'ar' ? 'ج.م' : 'EGP';

  const handleSaveTotalLimit = async () => {
    const val = Number(limitInput);
    if (!Number.isFinite(val) || val < 10000) return;
    await updateBudgetPlan({ totalBudgetLimit: val });
    setEditingLimit(false);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = Number(expAmount);
    if (!expTitle.trim() || !Number.isFinite(numAmt) || numAmt <= 0) {
      showToast(language === 'ar' ? 'أدخل عنوان المصروف وقيمة صحيحة.' : 'Enter expense title and valid amount.');
      return;
    }
    await createBudgetExpense({
      categorySlug: expCategorySlug,
      title: expTitle.trim(),
      vendorOrPayee: expVendor.trim() || undefined,
      amount: numAmt,
      paymentType: expType,
      status: expStatus,
      paidBySide: expSide,
      dueDate: expDueDate || null,
    });
    setExpTitle('');
    setExpVendor('');
    setExpAmount('');
    setExpDueDate('');
    setActiveTab('expenses');
  };

  const handleExportCsv = () => {
    const headers = ['Category', 'Title', 'Vendor/Payee', 'Amount EGP', 'Type', 'Status', 'Owner Side', 'Due Date', 'Source'];
    const catMap = new Map(categories.map((c) => [c.id, language === 'ar' ? c.nameAr : c.nameEn]));
    const rows = budgetOverview.expenses.map((ex) => [
      catMap.get(ex.budgetCategoryId) || ex.categorySlug,
      ex.title,
      ex.vendorOrPayee || '',
      String(ex.amount),
      ex.paymentType,
      ex.status,
      ex.paidBySide,
      ex.dueDate || '',
      ex.sourceType,
    ]);
    const csvBody = [headers, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob(['\uFEFF' + csvBody], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gawazinn-budget-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(language === 'ar' ? 'تم تصدير تقرير الميزانية بصيغة CSV.' : 'Exported Wedding Budget CSV.');
  };

  return (
    <div className="space-y-10 pb-24 print:pb-4">
      {/* Crimson Header Banner */}
      <div className="bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-12 border-b border-white/10 print:bg-white print:text-[#2A1D20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 print:hidden">
              <Wallet className="w-4 h-4" />
              <span>{language === 'ar' ? 'الحسابات والالتزامات' : 'Budget & Cash Control'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black">
              {language === 'ar' ? plan.titleAr : plan.titleEn}
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 print:text-gray-600">
              {language === 'ar'
                ? 'تحكم في المخطط مقابل المصروف الفعلي والدفعات القادمة وتنبيهات تجاوز السقف لكل بند.'
                : 'Control planned ceilings, deposits, upcoming payments, and category overrun warnings in one place.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <Link
              to="/calculators"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/25 flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'الحاسبات الـ 20' : '20 Calculators'}</span>
            </Link>

            <button
              type="button"
              disabled={syncing}
              onClick={async () => {
                setSyncing(true);
                try {
                  await syncBudgetTransactions();
                } finally {
                  setSyncing(false);
                }
              }}
              data-testid="budget-sync-btn"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/25 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{language === 'ar' ? 'مزامنة طلباتي وحجوزاتي' : 'Sync Orders & Bookings'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              data-testid="budget-export-csv-btn"
              className="px-4 py-2.5 rounded-xl bg-white text-[#D91B3E] text-xs font-bold shadow-md hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              data-testid="budget-print-btn"
              className="px-4 py-2.5 rounded-xl bg-black/25 hover:bg-black/35 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white p-5 rounded-3xl border border-rose-900/30 shadow-lg space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-rose-200 font-bold">
              <span>{language === 'ar' ? 'السقف الأعلى للميزانية' : 'Total Budget Cap'}</span>
              <button
                type="button"
                onClick={() => {
                  setLimitInput(String(summary.totalBudgetLimit));
                  setEditingLimit(!editingLimit);
                }}
                aria-label="Edit budget limit"
                className="p-1 rounded-lg hover:bg-white/10 cursor-pointer print:hidden"
              >
                <Edit3 className="w-3.5 h-3.5 text-rose-200" />
              </button>
            </div>
            {editingLimit ? (
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-white text-[#2A1D20] text-xs font-black outline-none"
                />
                <button
                  type="button"
                  onClick={() => void handleSaveTotalLimit()}
                  className="p-1.5 rounded-lg bg-[#D91B3E] text-white cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div data-testid="budget-total-limit" className="text-xl sm:text-2xl font-black text-white">
                {summary.totalBudgetLimit.toLocaleString()} <span className="text-xs">{egp}</span>
              </div>
            )}
            <p className="text-[11px] text-gray-400">
              {language === 'ar'
                ? `نسبة الالتزام: ${summary.utilizationPercent}%`
                : `Utilization: ${summary.utilizationPercent}%`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-1.5">
            <span className="text-[11px] font-bold text-gray-500 block">
              {language === 'ar' ? 'المصروف المسدد فعلياً' : 'Actual Paid to Date'}
            </span>
            <div data-testid="budget-total-paid" className="text-xl sm:text-2xl font-black text-[#D91B3E]">
              {summary.totalPaid.toLocaleString()} <span className="text-xs">{egp}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              {language === 'ar'
                ? `العريس: ${summary.groomPaid.toLocaleString()} • العروسة: ${summary.bridePaid.toLocaleString()}`
                : `Groom: ${summary.groomPaid.toLocaleString()} • Bride: ${summary.bridePaid.toLocaleString()}`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-1.5">
            <span className="text-[11px] font-bold text-amber-800 block">
              {language === 'ar' ? 'دفعات قادمة ومستحقة' : 'Upcoming Commitments'}
            </span>
            <div data-testid="budget-total-upcoming" className="text-xl sm:text-2xl font-black text-amber-700">
              {summary.totalUpcoming.toLocaleString()} <span className="text-xs">{egp}</span>
            </div>
            <p className="text-[11px] text-amber-700/80">
              {language === 'ar' ? 'عربون أو أقساط مجدولة' : 'Scheduled deposits & bills'}
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#D91B3E]/15 shadow-sm space-y-1.5">
            <span className="text-[11px] font-bold text-gray-600 block">
              {language === 'ar' ? 'المتاح المتبقي من السقف' : 'Remaining Headroom'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              {summary.remainingFromLimit.toLocaleString()} <span className="text-xs">{egp}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              {language === 'ar'
                ? `مخطط البنود: ${summary.totalPlanned.toLocaleString()} ${egp}`
                : `Planned Sum: ${summary.totalPlanned.toLocaleString()} ${egp}`}
            </p>
          </div>
        </div>

        {/* Alerts Strip (Overruns & Upcoming Payments) */}
        {alerts.length > 0 && (
          <div data-testid="budget-alerts-strip" className="space-y-2.5">
            {alerts.map((al, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                  al.severity === 'critical'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {al.type === 'upcoming_payment' ? (
                  <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#D91B3E] shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block">{language === 'ar' ? al.titleAr : al.titleEn}</strong>
                  <span className="text-[11px] opacity-90">{language === 'ar' ? al.detailAr : al.detailEn}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controls Row: Tabs + Owner Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              data-testid="budget-tab-overview"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#D91B3E] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-[#FDE8ED]'
              }`}
            >
              {language === 'ar' ? `بنود الميزانية (${categories.length})` : `Budget Categories (${categories.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              data-testid="budget-tab-expenses"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-[#D91B3E] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-[#FDE8ED]'
              }`}
            >
              {language === 'ar'
                ? `سجل المصروفات والدفعات (${budgetOverview.expenses.length})`
                : `Expenses & Deposits (${budgetOverview.expenses.length})`}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'groom', 'bride', 'shared'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSideFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                  sideFilter === s
                    ? 'bg-[#2A1D20] text-white border-[#2A1D20]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#D91B3E]/40'
                }`}
              >
                {s === 'all'
                  ? language === 'ar'
                    ? 'الجميع'
                    : 'All Sides'
                  : s === 'groom'
                    ? language === 'ar'
                      ? 'العريس'
                      : 'Groom'
                    : s === 'bride'
                      ? language === 'ar'
                        ? 'العروسة'
                        : 'Bride'
                      : language === 'ar'
                        ? 'مشترك'
                        : 'Shared'}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: CATEGORY ALLOCATIONS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="budget-categories-grid">
            {filteredCategories.map((cat) => {
              const barDenominator = Math.max(cat.limitAmount, cat.plannedAmount, 1);
              const committedPct = Math.min(100, Math.round(((cat.paidAmount + cat.upcomingAmount) / barDenominator) * 100));
              const isEditing = editingCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  data-testid={`budget-cat-${cat.slug}`}
                  className={`bg-white rounded-3xl p-5 border shadow-sm space-y-3.5 ${
                    cat.isOverLimit ? 'border-rose-400 bg-rose-50/30' : 'border-rose-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-black text-[#2A1D20]">
                          {language === 'ar' ? cat.nameAr : cat.nameEn}
                        </h2>
                        {cat.isOverLimit && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#D91B3E] text-[10px] font-black border border-rose-300">
                            {language === 'ar' ? 'تجاوز الحد' : 'Over Cap'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">
                        {cat.ownerSide === 'groom'
                          ? language === 'ar'
                            ? 'بند العريس'
                            : 'Groom Side'
                          : cat.ownerSide === 'bride'
                            ? language === 'ar'
                              ? 'بند العروسة'
                              : 'Bride Side'
                            : language === 'ar'
                              ? 'بند مشترك'
                              : 'Shared'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          setEditingCatId(null);
                        } else {
                          setEditingCatId(cat.id);
                          setCatPlannedInput(String(cat.plannedAmount));
                          setCatLimitInput(String(cat.limitAmount));
                        }
                      }}
                      className="p-2 rounded-xl bg-[#FAF7F2] text-gray-600 hover:text-[#D91B3E] border border-gray-200 cursor-pointer print:hidden"
                      title={language === 'ar' ? 'تعديل المخطط والسقف' : 'Edit planned & limit'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-rose-200">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600">
                          {language === 'ar' ? 'المخطط (ج.م)' : 'Planned EGP'}
                        </label>
                        <input
                          type="number"
                          value={catPlannedInput}
                          onChange={(e) => setCatPlannedInput(e.target.value)}
                          className="w-full p-2 rounded-lg border border-gray-300 text-xs font-bold bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600">
                          {language === 'ar' ? 'الحد الأقصى (ج.م)' : 'Cap Limit EGP'}
                        </label>
                        <input
                          type="number"
                          value={catLimitInput}
                          onChange={(e) => setCatLimitInput(e.target.value)}
                          className="w-full p-2 rounded-lg border border-gray-300 text-xs font-bold bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await updateBudgetCategory(cat.id, {
                            plannedAmount: Number(catPlannedInput || 0),
                            limitAmount: Number(catLimitInput || 0),
                          });
                          setEditingCatId(null);
                        }}
                        className="col-span-2 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold cursor-pointer"
                      >
                        {language === 'ar' ? 'حفظ التعديلات' : 'Save Category Limits'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="h-2.5 rounded-full bg-[#FDE8ED] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            cat.isOverLimit ? 'bg-rose-600' : 'bg-red-gradient'
                          }`}
                          style={{ width: `${Math.max(cat.paidAmount > 0 ? 4 : 0, committedPct)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] bg-[#FAF7F2] p-3 rounded-2xl">
                        <div>
                          <span className="text-gray-500 block">{language === 'ar' ? 'المسدد' : 'Paid'}</span>
                          <strong className="text-[#D91B3E]">{cat.paidAmount.toLocaleString()} {egp}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">{language === 'ar' ? 'المجدول' : 'Upcoming'}</span>
                          <strong className="text-amber-700">{cat.upcomingAmount.toLocaleString()} {egp}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">{language === 'ar' ? 'السقف الأقصى' : 'Cap Limit'}</span>
                          <strong className="text-[#2A1D20]">{cat.limitAmount.toLocaleString()} {egp}</strong>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Add Expense / Deposit + Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Add Expense Form */}
          <form
            onSubmit={(e) => void handleCreateExpense(e)}
            className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#D91B3E]/15 shadow-sm space-y-4 print:hidden"
          >
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Plus className="w-4 h-4 text-[#D91B3E]" />
              <h2 className="text-sm font-black text-[#2A1D20]">
                {language === 'ar' ? 'تسجيل مصروف أو عربون جديد' : 'Log New Expense or Deposit'}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'البند' : 'Category'}
                </label>
                <select
                  data-testid="expense-category-select"
                  value={expCategorySlug}
                  onChange={(e) => setExpCategorySlug(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'عنوان البند / الدفعة' : 'Title / Description'}
                </label>
                <input
                  type="text"
                  required
                  data-testid="expense-title-input"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: دفعة تعاقد السيراميك' : 'e.g. Ceramic Tile Order Deposit'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#D91B3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'المبلغ (ج.م)' : 'Amount (EGP)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    data-testid="expense-amount-input"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#D91B3E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as BudgetPaymentType)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none"
                  >
                    <option value="deposit">{language === 'ar' ? 'عربون / دفعة' : 'Deposit'}</option>
                    <option value="full">{language === 'ar' ? 'سداد كامل' : 'Full Payment'}</option>
                    <option value="installment">{language === 'ar' ? 'قسط' : 'Installment'}</option>
                    <option value="emergency">{language === 'ar' ? 'طوارئ' : 'Emergency'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    data-testid="expense-status-select"
                    value={expStatus}
                    onChange={(e) => setExpStatus(e.target.value as BudgetExpenseStatus)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none"
                  >
                    <option value="paid">{language === 'ar' ? 'تم السداد' : 'Paid'}</option>
                    <option value="upcoming">{language === 'ar' ? 'قادم مستحق' : 'Upcoming Due'}</option>
                    <option value="planned">{language === 'ar' ? 'مخطط مستقبلاً' : 'Planned'}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'الجهة الدافعة' : 'Side'}
                  </label>
                  <select
                    value={expSide}
                    onChange={(e) => setExpSide(e.target.value as BudgetOwnerSide)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none"
                  >
                    <option value="shared">{language === 'ar' ? 'مشترك' : 'Shared'}</option>
                    <option value="groom">{language === 'ar' ? 'العريس' : 'Groom'}</option>
                    <option value="bride">{language === 'ar' ? 'العروسة' : 'Bride'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'تاريخ الاستحقاق (اختياري للقادم)' : 'Due Date (Optional)'}
                </label>
                <input
                  type="date"
                  value={expDueDate}
                  onChange={(e) => setExpDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#D91B3E]"
                />
              </div>

              <button
                type="submit"
                data-testid="expense-submit-btn"
                className="w-full py-3 rounded-xl bg-red-gradient text-white font-bold text-xs shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة إلى الميزانية' : 'Record Expense'}</span>
              </button>
            </div>
          </form>

          {/* Expenses Ledger Table / Cards */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-[#2A1D20]">
                {language === 'ar' ? 'سجل المعاملات والدفعات والالتزامات' : 'Transactions & Scheduled Payments'}
              </h2>
              <div className="flex gap-1.5 print:hidden">
                {(['all', 'paid', 'upcoming', 'planned'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                        : 'bg-[#FAF7F2] text-gray-600 border-rose-100'
                    }`}
                  >
                    {st === 'all'
                      ? language === 'ar'
                        ? 'الكل'
                        : 'All'
                      : st === 'paid'
                        ? language === 'ar'
                          ? 'مسدد'
                          : 'Paid'
                        : st === 'upcoming'
                          ? language === 'ar'
                            ? 'قادم'
                            : 'Upcoming'
                          : language === 'ar'
                            ? 'مخطط'
                            : 'Planned'}
                  </button>
                ))}
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                {language === 'ar'
                  ? 'لا توجد مصروفات مطابقة لهذا الفلتر بعد.'
                  : 'No expenses match the selected filters yet.'}
              </div>
            ) : (
              <div className="space-y-3" data-testid="budget-expenses-list">
                {filteredExpenses.map((ex) => {
                  const catObj = categories.find((c) => c.id === ex.budgetCategoryId);
                  return (
                    <div
                      key={ex.id}
                      data-testid={`budget-expense-item-${ex.id}`}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs sm:text-sm text-[#2A1D20]">{ex.title}</strong>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              ex.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : ex.status === 'upcoming'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            {ex.status === 'paid'
                              ? language === 'ar'
                                ? 'مسدد'
                                : 'Paid'
                              : ex.status === 'upcoming'
                                ? language === 'ar'
                                  ? 'قادم مستحق'
                                  : 'Upcoming'
                                : language === 'ar'
                                  ? 'مخطط'
                                  : 'Planned'}
                          </span>
                          {ex.sourceType !== 'manual' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FDE8ED] text-[#B31331] text-[10px] font-bold">
                              {ex.sourceType === 'calculator_run'
                                ? language === 'ar'
                                  ? 'من الحاسبة'
                                  : 'From Calculator'
                                : ex.sourceType === 'order'
                                  ? language === 'ar'
                                    ? 'طلب متجر'
                                    : 'Store Order'
                                  : language === 'ar'
                                    ? 'مزامنة المنصة'
                                    : 'Platform Linked'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600">
                          {catObj ? (language === 'ar' ? catObj.nameAr : catObj.nameEn) : ex.categorySlug}
                          {ex.vendorOrPayee ? ` • ${ex.vendorOrPayee}` : ''}
                          {ex.dueDate ? ` • ${language === 'ar' ? 'الاستحقاق' : 'Due'}: ${ex.dueDate.slice(0, 10)}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <strong className="text-sm font-black text-[#D91B3E]">
                          {ex.amount.toLocaleString()} {egp}
                        </strong>

                        {ex.status !== 'paid' && (
                          <button
                            type="button"
                            data-testid={`mark-paid-btn-${ex.id}`}
                            onClick={() => void updateBudgetExpense(ex.id, { status: 'paid' })}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer print:hidden"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{language === 'ar' ? 'تأكيد السداد' : 'Mark Paid'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void deleteBudgetExpense(ex.id)}
                          aria-label="Delete expense"
                          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-rose-600 transition cursor-pointer print:hidden"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getCalculatorSummary, runCalculator } from '../../../shared/calculators';
import type { BudgetOwnerSide } from '../../types';
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  Wallet,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Trash2,
} from 'lucide-react';

export const CalculatorDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, dir } = useApp();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const calcDef = useMemo(
    () => (slug ? getCalculatorSummary(decodeURIComponent(slug)) : undefined),
    [slug],
  );

  if (!calcDef) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] flex items-center justify-center mx-auto">
          <Calculator className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar' ? 'الحاسبة غير موجودة' : 'Calculator Not Found'}
        </h1>
        <Link
          to="/calculators"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md"
        >
          <span>{language === 'ar' ? 'استعراض الـ 20 حاسبة' : 'Browse All 20 Calculators'}</span>
          <ArrowIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return <CalculatorDetailStudio key={calcDef.slug} calcDef={calcDef} />;
};

const CalculatorDetailStudio: React.FC<{
  calcDef: NonNullable<ReturnType<typeof getCalculatorSummary>>;
}> = ({ calcDef }) => {
  const navigate = useNavigate();
  const {
    language,
    dir,
    calculatorSummaries,
    calculatorRuns,
    currentUser,
    setAuthModalOpen,
    runAndSaveCalculator,
    deleteCalculatorRun,
    importCalculatorToBudget,
    setFinishingPrefill,
    setFinishingModalOpen,
    setInstallmentPrefillAmount,
    setInstallmentModalOpen,
    showToast,
  } = useApp();

  const [inputs, setInputs] = useState<Record<string, number | string | boolean>>(() => ({
    ...calcDef.defaultInputs,
  }));
  const [savingRun, setSavingRun] = useState(false);
  const [importingMode, setImportingMode] = useState<'add_planned_expense' | 'set_planned' | 'add_deposit'>('add_planned_expense');
  const [paidBySide, setPaidBySide] = useState<BudgetOwnerSide>('shared');
  const [isLinkingBudget, setIsLinkingBudget] = useState(false);

  const BreadcrumbSep = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const liveOutput = useMemo(() => runCalculator(calcDef.slug, inputs), [calcDef.slug, inputs]);

  const maxBreakdown = Math.max(
    1,
    ...liveOutput.breakdown.map((b) => (Number.isFinite(b.amount) ? b.amount : 0)),
  );

  const matchingRuns = calculatorRuns.filter((r) => r.calculatorSlug === calcDef.slug);

  const handleSaveRun = async () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast(
        language === 'ar'
          ? 'سجّل الدخول لحفظ الحسابات والرجوع لها من أي جهاز.'
          : 'Sign in to save your calculation runs across devices.',
      );
      return;
    }
    setSavingRun(true);
    try {
      await runAndSaveCalculator(
        calcDef.slug,
        inputs,
        language === 'ar' ? liveOutput.suggestedBudgetTitleAr : liveOutput.suggestedBudgetTitleEn,
      );
    } finally {
      setSavingRun(false);
    }
  };

  const handleApplyToBudget = async () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast(
        language === 'ar'
          ? 'سجّل الدخول لربط نتيجة الحاسبة مباشرة بمدير ميزانية الزواج.'
          : 'Sign in to link this estimate into your Wedding Budget Manager.',
      );
      return;
    }
    setIsLinkingBudget(true);
    try {
      await importCalculatorToBudget({
        calculatorSlug: calcDef.slug,
        inputs,
        categorySlug: liveOutput.suggestedBudgetCategorySlug,
        title: language === 'ar' ? liveOutput.suggestedBudgetTitleAr : liveOutput.suggestedBudgetTitleEn,
        mode: importingMode,
        paidBySide,
      });
    } finally {
      setIsLinkingBudget(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Compact Red Hero + Breadcrumbs */}
      <div className="bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 lg:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-rose-100/90 font-medium"
          >
            <Link to="/" className="hover:text-white transition">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
            <Link to="/calculators" className="hover:text-white transition">
              {language === 'ar' ? 'الـ 20 حاسبة ذكية' : '20 Smart Calculators'}
            </Link>
            <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
            <span className="text-white font-bold">
              {language === 'ar' ? calcDef.nameAr : calcDef.nameEn}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-rose-100 text-[11px] font-bold border border-white/20">
                <Calculator className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar' ? `أداة حسابية #${calcDef.order}` : `Calculator #${calcDef.order}`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                {language === 'ar' ? calcDef.nameAr : calcDef.nameEn}
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
                {language === 'ar' ? calcDef.shortDescAr : calcDef.shortDescEn}
              </p>
            </div>

            <Link
              to="/my/budget"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/25 flex items-center gap-2 self-start md:self-auto"
            >
              <Wallet className="w-4 h-4" />
              <span>{language === 'ar' ? 'إدارة ميزانيتي' : 'My Wedding Budget'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Studio: Inputs (7 cols) + Dark Summary Output (5 cols) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Structured Validated Inputs */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#D91B3E]/15 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar' ? 'أدخل بياناتك ومعاييرك' : 'Configure Your Parameters'}
              </h2>
              <button
                type="button"
                onClick={() => setInputs({ ...calcDef.defaultInputs })}
                className="text-xs font-bold text-[#D91B3E] hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'إعادة تعيين الافتراضي' : 'Reset Defaults'}
              </button>
            </div>

            <div className="space-y-5">
              {calcDef.fields.map((field) => {
                const rawVal = inputs[field.key] ?? calcDef.defaultInputs[field.key];
                if (field.type === 'number') {
                  const nVal = Number(rawVal ?? 0);
                  const min = field.min ?? 0;
                  const max = field.max ?? 1000000;
                  const step = field.step ?? 1;
                  return (
                    <div key={field.key} className="space-y-2 bg-[#FAF7F2] p-4 rounded-2xl border border-rose-100">
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor={`calc-field-${field.key}`}
                          className="text-xs sm:text-sm font-bold text-[#2A1D20]"
                        >
                          {language === 'ar' ? field.labelAr : field.labelEn}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            id={`calc-field-${field.key}`}
                            data-testid={`calc-input-${field.key}`}
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={nVal}
                            onChange={(e) =>
                              setInputs((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))
                            }
                            className="w-28 px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs font-black text-[#D91B3E] bg-white focus:border-[#D91B3E] outline-none text-end"
                          />
                          {(field.unitAr || field.unitEn) && (
                            <span className="text-[11px] font-bold text-gray-600">
                              {language === 'ar' ? field.unitAr : field.unitEn}
                            </span>
                          )}
                        </div>
                      </div>

                      <input
                        type="range"
                        aria-label={language === 'ar' ? field.labelAr : field.labelEn}
                        min={min}
                        max={max}
                        step={step}
                        value={Math.min(max, Math.max(min, Number.isFinite(nVal) ? nVal : min))}
                        onChange={(e) =>
                          setInputs((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))
                        }
                        className="w-full accent-[#D91B3E] cursor-pointer"
                      />
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.key} className="space-y-2">
                      <label
                        htmlFor={`calc-field-${field.key}`}
                        className="text-xs sm:text-sm font-bold text-[#2A1D20] block"
                      >
                        {language === 'ar' ? field.labelAr : field.labelEn}
                      </label>
                      <select
                        id={`calc-field-${field.key}`}
                        data-testid={`calc-input-${field.key}`}
                        value={String(rawVal)}
                        onChange={(e) =>
                          setInputs((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="w-full p-3 rounded-xl border border-gray-300 text-xs font-bold text-[#2A1D20] bg-white focus:border-[#D91B3E] outline-none"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {language === 'ar' ? opt.labelAr : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <label
                    key={field.key}
                    className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFF8F9] border border-rose-200/70 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#2A1D20]">
                      {language === 'ar' ? field.labelAr : field.labelEn}
                    </span>
                    <input
                      data-testid={`calc-input-${field.key}`}
                      type="checkbox"
                      checked={Boolean(rawVal)}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, [field.key]: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#D91B3E] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            {/* Breakdown Visualization */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-sm font-black text-[#2A1D20]">
                {language === 'ar' ? 'تحليل مكونات النتيجة' : 'Detailed Cost & Quantity Breakdown'}
              </h3>
              <div className="space-y-3" data-testid="calc-breakdown-list">
                {liveOutput.breakdown.map((item) => {
                  const barPct = item.percent ?? Math.min(100, Math.round((item.amount / maxBreakdown) * 100));
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-bold text-gray-800">
                          {language === 'ar' ? item.labelAr : item.labelEn}
                        </span>
                        <span className="font-black text-[#2A1D20] shrink-0">
                          {item.amount.toLocaleString()}{' '}
                          {language === 'ar'
                            ? item.unitLabelAr || liveOutput.primaryMetric.unitLabelAr
                            : item.unitLabelEn || liveOutput.primaryMetric.unitLabelEn}
                          {item.percent !== undefined ? ` (${item.percent}%)` : ''}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#FDE8ED] overflow-hidden">
                        <div
                          className="h-full bg-red-gradient rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(4, Math.min(100, barPct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Dark Executive KPI Card & Budget Integration */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white rounded-3xl p-6 sm:p-8 border border-rose-900/40 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-5 space-y-2">
                <span className="text-xs font-bold text-rose-200 block">
                  {language === 'ar'
                    ? liveOutput.primaryMetric.labelAr
                    : liveOutput.primaryMetric.labelEn}
                </span>
                <div
                  data-testid="calc-primary-result"
                  className="text-3xl sm:text-4xl font-black text-[#FF4D6D]"
                >
                  {liveOutput.primaryMetric.value.toLocaleString()}{' '}
                  <span className="text-base text-gray-200 font-bold">
                    {language === 'ar'
                      ? liveOutput.primaryMetric.unitLabelAr
                      : liveOutput.primaryMetric.unitLabelEn}
                  </span>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 gap-2.5 text-xs">
                {liveOutput.secondaryMetrics.map((m) => (
                  <div
                    key={m.key}
                    className="flex items-center justify-between bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/10 gap-2"
                  >
                    <span className="text-gray-300">
                      {language === 'ar' ? m.labelAr : m.labelEn}
                    </span>
                    <strong className="text-white text-end">{m.value}</strong>
                  </div>
                ))}
              </div>

              {/* Warnings */}
              {(language === 'ar' ? liveOutput.warningsAr : liveOutput.warningsEn).map((warn, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-100 text-xs flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{warn}</span>
                </div>
              ))}

              {/* Link Directly to Wedding Budget Manager */}
              <div className="bg-white/5 border border-white/15 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-rose-100 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-[#FF4D6D]" />
                  <span>
                    {language === 'ar'
                      ? 'ربط النتيجة بمدير ميزانية الزواج'
                      : 'Link Result to Wedding Budget'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    aria-label="Import mode"
                    value={importingMode}
                    onChange={(e) =>
                      setImportingMode(
                        e.target.value as 'add_planned_expense' | 'set_planned' | 'add_deposit',
                      )
                    }
                    className="p-2 rounded-xl bg-[#261618] border border-white/20 text-[11px] font-bold text-white outline-none"
                  >
                    <option value="add_planned_expense">
                      {language === 'ar' ? 'إضافة كبند مخطط' : 'Add Planned Item'}
                    </option>
                    <option value="set_planned">
                      {language === 'ar' ? 'تعيين سقف البند' : 'Update Category Target'}
                    </option>
                    <option value="add_deposit">
                      {language === 'ar' ? 'تسجيل كدفعة مسددة' : 'Record Paid Expense'}
                    </option>
                  </select>

                  <select
                    aria-label="Owner side"
                    value={paidBySide}
                    onChange={(e) => setPaidBySide(e.target.value as BudgetOwnerSide)}
                    className="p-2 rounded-xl bg-[#261618] border border-white/20 text-[11px] font-bold text-white outline-none"
                  >
                    <option value="shared">{language === 'ar' ? 'مشترك' : 'Shared'}</option>
                    <option value="groom">{language === 'ar' ? 'العريس' : 'Groom'}</option>
                    <option value="bride">{language === 'ar' ? 'العروسة' : 'Bride'}</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={isLinkingBudget}
                  onClick={() => void handleApplyToBudget()}
                  data-testid="calc-save-to-budget-btn"
                  className="w-full py-3 px-4 rounded-xl bg-red-gradient text-white font-bold text-xs shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Wallet className="w-4 h-4" />
                  <span>
                    {isLinkingBudget
                      ? language === 'ar'
                        ? 'جاري الحفظ...'
                        : 'Linking...'
                      : language === 'ar'
                        ? 'حفظ وإضافة لميزانيتي'
                        : 'Save & Add to My Budget'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                disabled={savingRun}
                onClick={() => void handleSaveRun()}
                data-testid="calc-save-run-btn"
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? 'حفظ لقطة في سجل الحسابات'
                    : 'Save Snapshot in Calculation History'}
                </span>
              </button>

              {/* Contextual Smart Actions per Calculator */}
              {calcDef.slug === 'finishing-cost' && (
                <button
                  type="button"
                  onClick={() => {
                    setFinishingPrefill({
                      areaSqm: Number(inputs.areaSqm || 120),
                      roomsCount: 3,
                      bathroomsCount: Number(inputs.bathroomsCount || 2),
                      finishingTier: String(inputs.tier || 'medium') as 'economic' | 'medium' | 'luxury' | 'ultra_luxury',
                    });
                    setFinishingModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'ar'
                      ? 'طلب مقايسة هندسية بنفس المقاس'
                      : 'Request Engineering Finishing Quote'}
                  </span>
                </button>
              )}

              {calcDef.slug === 'installment-plan' && (
                <button
                  type="button"
                  onClick={() => {
                    setInstallmentPrefillAmount(Number(inputs.totalAmountEgp || 150000));
                    setInstallmentModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'ar'
                      ? 'تقديم طلب تقسيط بهذا المبلغ'
                      : 'Apply for Financing w/ This Amount'}
                  </span>
                </button>
              )}
            </div>

            {/* Transparent Formula & Assumptions */}
            <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#D91B3E]/15 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-black text-[#2A1D20]">
                <Info className="w-4 h-4 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'المعادلة والافتراضات الشفافة' : 'Transparent Formula & Assumptions'}</span>
              </div>
              <p className="text-gray-800 font-semibold leading-relaxed bg-white p-3 rounded-xl border border-rose-100">
                {language === 'ar' ? liveOutput.formulaSummaryAr : liveOutput.formulaSummaryEn}
              </p>
              <ul className="space-y-1.5 text-gray-600 list-disc ps-4">
                {(language === 'ar' ? liveOutput.assumptionsAr : liveOutput.assumptionsEn).map((a, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Saved History Runs for This Calculator */}
        {matchingRuns.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-[#2A1D20]">
              {language === 'ar' ? 'سجل نتائجك السابقة لهذه الحاسبة' : 'Your Saved Runs for This Calculator'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchingRuns.map((run) => (
                <div
                  key={run.id}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setInputs({ ...calcDef.defaultInputs, ...run.inputs })}
                    className="text-start min-w-0 flex-1 cursor-pointer"
                  >
                    <p className="text-xs font-bold text-[#2A1D20] truncate hover:text-[#D91B3E]">
                      {run.savedTitle || run.calculatorSlug}
                    </p>
                    <p className="text-xs font-black text-[#D91B3E]">
                      {run.primaryValue.toLocaleString()}{' '}
                      {language === 'ar'
                        ? run.output.primaryMetric.unitLabelAr
                        : run.output.primaryMetric.unitLabelEn}
                    </p>
                    <span className="text-[10px] text-gray-500">{run.createdAt.slice(0, 10)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteCalculatorRun(run.id)}
                    aria-label="Delete saved run"
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Switcher Pills Across All 20 Calculators */}
        <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#D91B3E]/15 space-y-3">
          <h3 className="text-sm font-black text-[#2A1D20]">
            {language === 'ar' ? 'انتقال سريع بين جميع الحاسبات الـ 20' : 'Quick Switch Across All 20 Calculators'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {calculatorSummaries.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => navigate(`/calculators/${c.slug}`)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                  c.slug === calcDef.slug
                    ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#D91B3E]/40 hover:text-[#D91B3E]'
                }`}
              >
                {c.order}. {language === 'ar' ? c.nameAr : c.nameEn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

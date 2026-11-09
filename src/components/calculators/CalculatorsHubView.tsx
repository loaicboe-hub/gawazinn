import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { runCalculator } from '../../../shared/calculators';
import type { CalculatorCategoryGroup } from '../../types';
import {
  Calculator,
  Search,
  Wallet,
  ArrowLeft,
  ArrowRight,
  Compass,
  Building2,
  Briefcase,
  Sparkles,
  Gem,
  Heart,
  Armchair,
  Utensils,
  Droplets,
  LayoutGrid,
  Grid,
  PaintBucket,
  Ruler,
  Zap,
  Truck,
  Plane,
  CreditCard,
  PiggyBank,
  TrendingUp,
  ShieldCheck,
  History,
} from 'lucide-react';

function renderCalcIcon(iconName: string) {
  const cls = 'w-5 h-5 text-[#D91B3E]';
  switch (iconName) {
    case 'Compass':
      return <Compass className={cls} />;
    case 'Building2':
      return <Building2 className={cls} />;
    case 'Briefcase':
      return <Briefcase className={cls} />;
    case 'Sparkles':
      return <Sparkles className={cls} />;
    case 'Gem':
      return <Gem className={cls} />;
    case 'Heart':
      return <Heart className={cls} />;
    case 'Armchair':
      return <Armchair className={cls} />;
    case 'Utensils':
      return <Utensils className={cls} />;
    case 'Droplets':
      return <Droplets className={cls} />;
    case 'LayoutGrid':
      return <LayoutGrid className={cls} />;
    case 'Grid':
      return <Grid className={cls} />;
    case 'PaintBucket':
      return <PaintBucket className={cls} />;
    case 'Ruler':
      return <Ruler className={cls} />;
    case 'Zap':
      return <Zap className={cls} />;
    case 'Truck':
      return <Truck className={cls} />;
    case 'Plane':
      return <Plane className={cls} />;
    case 'CreditCard':
      return <CreditCard className={cls} />;
    case 'PiggyBank':
      return <PiggyBank className={cls} />;
    case 'TrendingUp':
      return <TrendingUp className={cls} />;
    case 'ShieldCheck':
      return <ShieldCheck className={cls} />;
    default:
      return <Calculator className={cls} />;
  }
}

export const CalculatorsHubView: React.FC = () => {
  const { language, dir, calculatorSummaries, calculatorRuns, budgetOverview, currentUser } =
    useApp();
  const [groupFilter, setGroupFilter] = useState<CalculatorCategoryGroup | 'all'>('all');
  const [query, setQuery] = useState('');

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const groups: { key: CalculatorCategoryGroup | 'all'; labelAr: string; labelEn: string }[] = [
    { key: 'all', labelAr: `كل الحاسبات (${calculatorSummaries.length})`, labelEn: `All Calculators (${calculatorSummaries.length})` },
    { key: 'comprehensive', labelAr: 'الميزانية الشاملة', labelEn: 'Master Budget' },
    { key: 'finishing_home', labelAr: 'التشطيب والمطبخ والكميات', labelEn: 'Finishing & Quantities' },
    { key: 'trousseau', labelAr: 'أجهزة العريس والعروسة والشبكة', labelEn: 'Trousseau, Furniture & Gold' },
    { key: 'celebration_life', labelAr: 'الفرح والنقل والسفر والكهرباء', labelEn: 'Wedding, Moving & Living' },
    { key: 'finance_planning', labelAr: 'الادخار والتقسيط والطوارئ', labelEn: 'Savings, Loans & Reserve' },
  ];

  const filteredCalculators = useMemo(() => {
    const q = query.trim().toLowerCase();
    return calculatorSummaries.filter((c) => {
      if (groupFilter !== 'all' && c.categoryGroup !== groupFilter) return false;
      if (!q) return true;
      return `${c.nameAr} ${c.nameEn} ${c.shortDescAr} ${c.shortDescEn} ${c.slug}`
        .toLowerCase()
        .includes(q);
    });
  }, [calculatorSummaries, groupFilter, query]);

  return (
    <div className="space-y-12 pb-24">
      {/* Red Crimson Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
                <Calculator className="w-4 h-4 text-white" />
                <span>
                  {language === 'ar'
                    ? 'محرك الحسابات الهندسية والمالية الموحد — 20 حاسبة ذكية'
                    : 'Unified Calculation Studio — 20 Smart Planning Calculators'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {language === 'ar'
                  ? 'حاسبات الزواج وتشطيب الشقة'
                  : 'Smart Marriage, Finishing & Savings Calculators'}
              </h1>
              <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
                {language === 'ar'
                  ? 'معادلات دقيقة موحدة عبر المنصة: احسب تكلفة التشطيب والسيراميك والدهان والمطبخ وجهاز العريس والعروسة والفرح والادخار، واحفظ أي نتيجة مباشرة في ميزانية زواجك.'
                  : 'Single-source transparent formulas across the ecosystem: estimate finishing BOQ, paint, tile cartons, trousseau, Shabka gold, wedding reception, or savings trajectories and link directly to your budget.'}
              </p>
            </div>

            {/* Dark Quick Summary Card */}
            <div className="bg-gradient-to-br from-[#1C1819] to-[#2B181A] border border-rose-900/40 rounded-3xl p-6 w-full lg:w-88 shrink-0 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-200">
                  {language === 'ar' ? 'مدير ميزانية الزواج' : 'Wedding Budget Manager'}
                </span>
                <Wallet className="w-5 h-5 text-[#FF4D6D]" />
              </div>

              {currentUser && budgetOverview ? (
                <div className="space-y-1.5 text-xs">
                  <div className="text-2xl font-black text-[#FF4D6D]">
                    {budgetOverview.summary.totalBudgetLimit.toLocaleString()}{' '}
                    <span className="text-xs text-gray-300">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                  </div>
                  <p className="text-gray-300">
                    {language === 'ar'
                      ? `المسدد: ${budgetOverview.summary.totalPaid.toLocaleString()} ج.م • الحاسبات المحفوظة: ${calculatorRuns.length}`
                      : `Paid: ${budgetOverview.summary.totalPaid.toLocaleString()} EGP • Saved runs: ${calculatorRuns.length}`}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-300 leading-relaxed">
                  {language === 'ar'
                    ? 'اربط نتائج الحاسبات بمدير ميزانية الزواج لتتبع العربون والمصروفات الفعلية ومنع تخطي السقف.'
                    : 'Link any calculator estimate directly into Wedding Budget Manager to track deposits and spending caps.'}
                </p>
              )}

              <Link
                to="/my/budget"
                data-testid="open-budget-manager-link"
                className="w-full py-3 px-4 rounded-xl bg-red-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition"
              >
                <Wallet className="w-4 h-4" />
                <span>{language === 'ar' ? 'فتح مدير ميزانية الزواج' : 'Open Wedding Budget Manager'}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>

              <Link
                to="/early-start"
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-rose-100 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Compass className="w-4 h-4 text-[#FF8FA3]" />
                <span>{language === 'ar' ? 'لوحة البداية المبكرة وماذا لو؟' : 'Early Start & What-If Simulator'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & 20-Card Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGroupFilter(g.key)}
                data-testid={`calc-filter-${g.key}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  groupFilter === g.key
                    ? 'bg-[#D91B3E] text-white border-[#D91B3E] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FDE8ED] hover:border-[#D91B3E]/30'
                }`}
              >
                {language === 'ar' ? g.labelAr : g.labelEn}
              </button>
            ))}
          </div>

          <div className="relative md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="calc-search-input"
              placeholder={language === 'ar' ? 'ابحث باسم الحاسبة أو البند...' : 'Search 20 calculators...'}
              className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none bg-white"
            />
          </div>
        </div>

        {/* Calculators Grid */}
        {filteredCalculators.length === 0 ? (
          <div className="bg-[#FAF7F2] rounded-3xl p-10 text-center border border-rose-100 space-y-3">
            <p className="text-sm font-bold text-[#2A1D20]">
              {language === 'ar' ? 'لا توجد حاسبات مطابقة لبحثك' : 'No matching calculators'}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setGroupFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-[#D91B3E] cursor-pointer"
            >
              {language === 'ar' ? 'عرض الـ 20 حاسبة' : 'Show All 20 Calculators'}
            </button>
          </div>
        ) : (
          <div
            data-testid="calculators-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredCalculators.map((calc) => {
              const preview = runCalculator(calc.slug, calc.defaultInputs);
              return (
                <Link
                  key={calc.slug}
                  to={`/calculators/${calc.slug}`}
                  data-testid={`calc-card-${calc.slug}`}
                  className="bg-white rounded-3xl p-6 border border-[#D91B3E]/15 hover:border-[#D91B3E]/45 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-11 h-11 rounded-2xl bg-[#FDE8ED] flex items-center justify-center shrink-0">
                        {renderCalcIcon(calc.iconName)}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[11px] font-bold text-[#B31331] border border-[#D91B3E]/15">
                        #{calc.order}
                      </span>
                    </div>

                    <h2 className="text-base font-black text-[#2A1D20] group-hover:text-[#D91B3E] transition">
                      {language === 'ar' ? calc.nameAr : calc.nameEn}
                    </h2>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {language === 'ar' ? calc.shortDescAr : calc.shortDescEn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-gray-500">
                      <span>{language === 'ar' ? 'تقدير مرجعي: ' : 'Baseline: '}</span>
                      <strong className="text-[#2A1D20]">
                        {preview.primaryMetric.value.toLocaleString()}{' '}
                        {language === 'ar'
                          ? preview.primaryMetric.unitLabelAr
                          : preview.primaryMetric.unitLabelEn}
                      </strong>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D91B3E]">
                      <span>{language === 'ar' ? 'احسب الآن' : 'Calculate'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Recent Saved Runs Strip for Logged-in Users */}
        {currentUser && calculatorRuns.length > 0 && (
          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#D91B3E]/15 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#D91B3E]" />
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? 'أحدث نتائجك المحفوظة' : 'Your Recent Saved Calculations'}
                </h2>
              </div>
              <Link to="/my/budget" className="text-xs font-bold text-[#D91B3E] hover:underline">
                {language === 'ar' ? 'إدارة الميزانية' : 'Open Wedding Budget'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {calculatorRuns.slice(0, 6).map((run) => (
                <Link
                  key={run.id}
                  to={`/calculators/${run.calculatorSlug}`}
                  className="bg-white p-4 rounded-2xl border border-rose-100 hover:border-[#D91B3E]/40 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2A1D20] truncate">
                      {run.savedTitle ||
                        (language === 'ar' ? run.output.nameAr : run.output.nameEn)}
                    </p>
                    <span className="text-[11px] text-gray-500">
                      {run.createdAt.slice(0, 10)}
                    </span>
                  </div>
                  <strong className="text-xs font-black text-[#D91B3E] shrink-0">
                    {run.primaryValue.toLocaleString()}{' '}
                    {language === 'ar'
                      ? run.output.primaryMetric.unitLabelAr
                      : run.output.primaryMetric.unitLabelEn}
                  </strong>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

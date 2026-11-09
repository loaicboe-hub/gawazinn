import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  FileCheck2,
  AlertCircle,
  Search,
  ArrowLeft,
  ArrowRight,
  PieChart,
} from 'lucide-react';
import type { BrideCategoryGuide } from '../../types';

type GroupFilter = 'all' | BrideCategoryGuide['groupKey'];

const GROUP_OPTIONS: { key: GroupFilter; ar: string; en: string }[] = [
  { key: 'all', ar: 'جميع الأقسام (19)', en: 'All 19 Categories' },
  { key: 'kitchen_cookware', ar: 'أواني وأدوات المطبخ', en: 'Kitchen & Cookware' },
  { key: 'dining_hosting', ar: 'الصيني والسفرة والضيافة', en: 'Fine Dining & Hosting' },
  { key: 'linens_bedding', ar: 'المفروشات والملايات والألحفة', en: 'Linens & Bedding' },
  { key: 'bath_home', ar: 'الحمام والتنظيف والمكواة', en: 'Bath, Laundry & Care' },
  { key: 'personal_care', ar: 'المستلزمات الشخصية وحقائب السفر', en: 'Personal & Luggage' },
];

export const BrideEncyclopediaView: React.FC = () => {
  const { language, dir, brideCategories } = useApp();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return brideCategories.filter((cat) => {
      if (groupFilter !== 'all' && cat.groupKey !== groupFilter) return false;
      if (!q) return true;
      return `${cat.nameAr} ${cat.nameEn} ${cat.summaryAr} ${cat.summaryEn}`.toLowerCase().includes(q);
    });
  }, [brideCategories, groupFilter, searchTerm]);

  return (
    <div className="space-y-12 pb-24">
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20">
              <Sparkles className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'موسوعة جهاز العروسة الذكية — 19 فئة متكاملة'
                  : "Bride's Anti-Waste Encyclopedia — All 19 Categories"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {language === 'ar'
                ? 'تجهيز العروسة بأسلوب عملي أنيق بلا إهدار أو تكديس'
                : 'Practical, Elegant Bridal Trousseau Planning With Zero Clutter'}
            </h1>

            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'أوزان الميزانية الواقعية، الأعداد الذهبية المقترحة، ونصائح ذهبية لتفادي المشتريات المكررة في المطبخ والمفروشات.'
                : 'Realistic item quantities, clear budget shares across 19 essentials, and anti-waste advice tailored to modern Egyptian apartments.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/bride#bridal-checklist"
                className="bg-white hover:bg-rose-50 text-[#9E122C] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition inline-flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? 'افتح قائمة جهاز العروسة التفاعلية'
                    : 'Open Interactive Bridal Checklist'}
                </span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 border border-[#D91B3E]/15 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'ابحثي في فئات جهاز العروسة (جرانيت، صيني، ملايات...)'
                    : 'Search bridal categories (Granite cookware, Bone china, Sheets...)'
                }
                className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm focus:border-[#D91B3E] outline-none"
              />
            </div>

            <span className="text-xs font-black text-[#B31331]" data-testid="bride-categories-count">
              {language === 'ar'
                ? `إجمالي الفئات: ${filteredCategories.length} من 19`
                : `${filteredCategories.length} of 19 categories`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {GROUP_OPTIONS.map((grp) => (
              <button
                key={grp.key}
                type="button"
                onClick={() => setGroupFilter(grp.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  groupFilter === grp.key
                    ? 'bg-[#D91B3E] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                }`}
              >
                {language === 'ar' ? grp.ar : grp.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="bride-encyclopedia-grid">
          {filteredCategories.map((cat) => (
            <article
              key={cat.id}
              data-testid={`bride-cat-${cat.slug}`}
              className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#FDE8ED] text-[#B31331] text-[11px] font-black inline-flex items-center gap-1">
                    <PieChart className="w-3 h-3" />
                    <span>{cat.budgetWeightPercent}% {language === 'ar' ? 'من الميزانية' : 'budget'}</span>
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    {language === 'ar' ? cat.recommendedCountLabelAr : cat.recommendedCountLabelEn}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </h2>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'ar' ? cat.summaryAr : cat.summaryEn}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100 space-y-1">
                <div className="text-[11px] font-black text-[#D91B3E] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نصيحة منع التكديس:' : 'Zero-Waste Guideline:'}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {language === 'ar' ? cat.antiWasteTipAr : cat.antiWasteTipEn}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};


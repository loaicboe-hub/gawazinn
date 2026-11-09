import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  Search,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import type { GroomSubcategoryGuide } from '../../types';

type GroupFilter = 'all' | GroomSubcategoryGuide['groupKey'];
type PriorityFilter = 'all' | GroomSubcategoryGuide['priority'];

export const GroomEncyclopediaView: React.FC = () => {
  const { language, dir, groomSubcategories } = useApp();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const countsByGroup = useMemo(() => {
    return {
      all: groomSubcategories.length,
      appliances: groomSubcategories.filter((s) => s.groupKey === 'appliances').length,
      furniture: groomSubcategories.filter((s) => s.groupKey === 'furniture').length,
      household: groomSubcategories.filter((s) => s.groupKey === 'household').length,
    };
  }, [groomSubcategories]);

  const filteredSubcategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return groomSubcategories.filter((item) => {
      if (groupFilter !== 'all' && item.groupKey !== groupFilter) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      if (!q) return true;
      return `${item.nameAr} ${item.nameEn} ${item.summaryAr} ${item.summaryEn}`.toLowerCase().includes(q);
    });
  }, [groomSubcategories, groupFilter, priorityFilter, searchTerm]);

  const priorityBadge = (priority: GroomSubcategoryGuide['priority']) => {
    if (priority === 'essential') {
      return {
        cls: 'bg-[#FDE8ED] text-[#B31331] border-[#D91B3E]/20',
        ar: 'أساسي لا غنى عنه',
        en: 'Essential Priority',
      };
    }
    if (priority === 'recommended') {
      return {
        cls: 'bg-amber-50 text-amber-800 border-amber-200',
        ar: 'موصى به عملياً',
        en: 'Recommended',
      };
    }
    return {
      cls: 'bg-gray-100 text-gray-700 border-gray-200',
      ar: 'اختياري حسب المساحة',
      en: 'Optional Upgrade',
    };
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20">
              <Briefcase className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'موسوعة تجهيز العريس — 26 دليلاً تخصصياً'
                  : "Groom's Preparation Encyclopedia — 26 Detailed Guides"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {language === 'ar'
                ? 'دليل العريس الشامل للأجهزة الكهربائية، الأثاث، وتجهيز الشقة'
                : 'Complete Buying Playbook for Appliances, Furniture & Household Setup'}
            </h1>

            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'مقارنة السعات، فحص الخشب والزان، نسب توزيع الميزانية، ونصائح الضمان والتوكيل لكل قطعة قبل الشراء.'
                : 'Net appliance capacities, timber joinery inspection checks, percentage budget shares, and agent warranty tips across Egypt.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/groom"
                className="bg-white hover:bg-rose-50 text-[#9E122C] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition inline-flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{language === 'ar' ? 'فتح مصمم باقات العريس (100–500 ألف)' : 'Open Package Configurator'}</span>
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
                    ? 'ابحث (ثلاجة، تكييف، غرفة نوم، مرتبة، ستائر...)'
                    : 'Search (Refrigerator, Inverter AC, Bedroom, Mattress...)'
                }
                className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm focus:border-[#D91B3E] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold focus:border-[#D91B3E] outline-none"
              >
                <option value="all">{language === 'ar' ? 'كل الأولويات' : 'All Priorities'}</option>
                <option value="essential">{language === 'ar' ? 'أساسي فقط' : 'Essential Only'}</option>
                <option value="recommended">{language === 'ar' ? 'موصى به' : 'Recommended'}</option>
                <option value="optional">{language === 'ar' ? 'اختياري' : 'Optional'}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'all', ar: `الكل (${countsByGroup.all})`, en: `All (${countsByGroup.all})` },
                {
                  key: 'appliances',
                  ar: `الأجهزة الكهربائية (${countsByGroup.appliances})`,
                  en: `Appliances (${countsByGroup.appliances})`,
                },
                {
                  key: 'furniture',
                  ar: `الأثاث والغرف (${countsByGroup.furniture})`,
                  en: `Furniture (${countsByGroup.furniture})`,
                },
                {
                  key: 'household',
                  ar: `الفرش والأساسيات (${countsByGroup.household})`,
                  en: `Household & Home Setup (${countsByGroup.household})`,
                },
              ] as const
            ).map((grp) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="groom-encyclopedia-grid">
          {filteredSubcategories.map((sub) => {
            const pBadge = priorityBadge(sub.priority);
            const checklist = language === 'ar' ? sub.buyingChecklistAr : sub.buyingChecklistEn;
            return (
              <article
                key={sub.id}
                data-testid={`groom-sub-${sub.slug}`}
                className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${pBadge.cls}`}>
                      {language === 'ar' ? pBadge.ar : pBadge.en}
                    </span>
                    <span className="text-[11px] font-black text-[#D91B3E]">
                      ~{sub.budgetSharePercent}% {language === 'ar' ? 'من الميزانية' : 'share'}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                    {language === 'ar' ? sub.nameAr : sub.nameEn}
                  </h2>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {language === 'ar' ? sub.summaryAr : sub.summaryEn}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-rose-100">
                    <span className="text-[11px] text-gray-500 block">
                      {language === 'ar' ? 'النطاق التقديري في السوق:' : 'Estimated Price Range:'}
                    </span>
                    <strong className="text-sm font-black text-[#D91B3E]">
                      {sub.estimatedMinEgp.toLocaleString()} – {sub.estimatedMaxEgp.toLocaleString()}{' '}
                      {language === 'ar' ? 'ج.م' : 'EGP'}
                    </strong>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-black text-[#2A1D20] block">
                      {language === 'ar' ? 'نقاط الفحص قبل الشراء:' : 'Pre-Purchase Inspection:'}
                    </span>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {checklist.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D91B3E] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 text-[11px] text-emerald-800 bg-emerald-50/60 p-3 rounded-xl flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{language === 'ar' ? sub.warrantyTipsAr : sub.warrantyTipsEn}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};


import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getCalculatorSummary } from '../../../shared/calculators';
import {
  BookOpen,
  Search,
  HelpCircle,
  ChevronDown,
  Calculator,
  ArrowLeft,
  ArrowRight,
  Tag,
} from 'lucide-react';
import type { ContentDomain } from '../../types';

type DomainFilter = 'all' | ContentDomain;

const DOMAIN_FILTERS: { key: DomainFilter; ar: string; en: string }[] = [
  { key: 'all', ar: 'كل التخصصات', en: 'All Topics' },
  { key: 'finishing', ar: 'التشطيب والهندسة', en: 'Finishing & MEP' },
  { key: 'groom', ar: 'جهاز العريس', en: "Groom's Essentials" },
  { key: 'bride', ar: 'جهاز العروسة', en: "Bride's Trousseau" },
  { key: 'wedding', ar: 'الفرح والزفاف', en: 'Wedding Planning' },
  { key: 'early_start', ar: 'الادخار والبداية المبكرة', en: 'Early Start & Saving' },
  { key: 'married_life', ar: 'إدارة وصيانة البيت', en: 'Married Life & Care' },
  { key: 'editorial', ar: 'معايير المنصة', en: 'Platform Standards' },
];

function resolveCalculatorRoute(slug?: string): { to: string; ar: string; en: string } | null {
  if (!slug) return null;
  const matched = getCalculatorSummary(slug);
  if (matched) {
    return {
      to: `/calculators/${matched.slug}`,
      ar: matched.nameAr,
      en: matched.nameEn,
    };
  }
  return { to: '/calculators', ar: 'محرك الـ 20 حاسبة', en: '20 Smart Calculators' };
}

export const GlossaryFaqView: React.FC = () => {
  const { pathname } = useLocation();
  const { language, dir, glossaryTerms, faqItems } = useApp();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const activeTab: 'glossary' | 'faqs' = pathname.startsWith('/faqs') ? 'faqs' : 'glossary';

  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string>(faqItems[0]?.id || 'faq-01');

  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return glossaryTerms.filter((term) => {
      if (domainFilter !== 'all' && term.domain !== domainFilter) return false;
      if (!q) return true;
      return `${term.termAr} ${term.termEn} ${term.definitionAr} ${term.definitionEn} ${term.exampleAr} ${term.exampleEn}`
        .toLowerCase()
        .includes(q);
    });
  }, [glossaryTerms, domainFilter, searchQuery]);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqItems.filter((item) => {
      if (domainFilter !== 'all' && item.domain !== domainFilter) return false;
      if (!q) return true;
      return `${item.questionAr} ${item.questionEn} ${item.answerAr} ${item.answerEn}`
        .toLowerCase()
        .includes(q);
    });
  }, [faqItems, domainFilter, searchQuery]);

  return (
    <div className="space-y-12 pb-24">
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20">
              {activeTab === 'glossary' ? (
                <BookOpen className="w-4 h-4 text-white" />
              ) : (
                <HelpCircle className="w-4 h-4 text-white" />
              )}
              <span>
                {language === 'ar'
                  ? 'مرجع المصطلحات والأسئلة الشائعة في مصر'
                  : 'GAWAZ INN Glossary & Knowledge FAQs'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {activeTab === 'glossary'
                ? language === 'ar'
                  ? 'قاموس مصطلحات التشطيب والزواج والبيت'
                  : 'Finishing, Trousseau & Home Planning Glossary'
                : language === 'ar'
                ? 'الأسئلة الشائعة والإجابات الموثقة'
                : 'Frequently Asked Questions'}
            </h1>

            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'افهم لغة الصنايعية والمهندسين، معايير الخامات، وقواعد تجهيز العريس والعروسة والفرح بشفافية كاملة.'
                : 'Clear bilingual definitions of Egyptian construction idioms, buying rules, warranty policies, and planning calculators.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/glossary"
              data-testid="tab-glossary"
              onClick={() => setSearchQuery('')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'glossary'
                  ? 'bg-white text-[#9E122C] shadow-lg'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{language === 'ar' ? `القاموس (${glossaryTerms.length})` : `Glossary (${glossaryTerms.length})`}</span>
            </Link>

            <Link
              to="/faqs"
              data-testid="tab-faqs"
              onClick={() => setSearchQuery('')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'faqs'
                  ? 'bg-white text-[#9E122C] shadow-lg'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{language === 'ar' ? `الأسئلة الشائعة (${faqItems.length})` : `FAQs (${faqItems.length})`}</span>
            </Link>

            <Link
              to="/encyclopedia"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1C1819]/60 hover:bg-[#1C1819] text-rose-100 border border-white/15 transition inline-flex items-center gap-1.5"
            >
              <span>{language === 'ar' ? 'الموسوعة والمقالات' : 'Encyclopedia Hub'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="glossary-faq-search"
                placeholder={
                  language === 'ar'
                    ? 'ابحث عن مصطلح أو سؤال (الشرب، البؤج، الجبس، الصيني...)'
                    : 'Search terms or questions (Boag, Sherb, Porcelain, Inverter...)'
                }
                className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm focus:border-[#D91B3E] outline-none"
              />
            </div>

            <span className="text-xs font-black text-[#B31331]">
              {activeTab === 'glossary'
                ? language === 'ar'
                  ? `عرض ${filteredTerms.length} مصطلحاً`
                  : `Showing ${filteredTerms.length} terms`
                : language === 'ar'
                ? `عرض ${filteredFaqs.length} سؤالاً`
                : `Showing ${filteredFaqs.length} questions`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {DOMAIN_FILTERS.map((df) => (
              <button
                key={df.key}
                type="button"
                onClick={() => setDomainFilter(df.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  domainFilter === df.key
                    ? 'bg-[#D91B3E] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                }`}
              >
                {language === 'ar' ? df.ar : df.en}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'glossary' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="glossary-grid">
            {filteredTerms.map((term) => {
              const calcLink = resolveCalculatorRoute(term.relatedCalculatorSlug);
              const domLabel = DOMAIN_FILTERS.find((d) => d.key === term.domain);
              return (
                <article
                  key={term.id}
                  data-testid={`glossary-card-${term.slug}`}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDE8ED] text-[#B31331] text-[11px] font-bold">
                      <Tag className="w-3 h-3" />
                      <span>{domLabel ? (language === 'ar' ? domLabel.ar : domLabel.en) : term.domain}</span>
                    </span>

                    <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                      {language === 'ar' ? term.termAr : term.termEn}
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {language === 'ar' ? term.definitionAr : term.definitionEn}
                    </p>

                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-rose-100 text-xs text-gray-600">
                      <strong className="text-[#D91B3E]">
                        {language === 'ar' ? 'مثال تطبيقي: ' : 'Practical Example: '}
                      </strong>
                      {language === 'ar' ? term.exampleAr : term.exampleEn}
                    </div>
                  </div>

                  {calcLink && (
                    <Link
                      to={calcLink.to}
                      className="inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-[#D91B3E] text-[#B31331] hover:text-white text-xs font-bold transition border border-rose-200"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? calcLink.ar : calcLink.en}</span>
                      </span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div
            data-testid="faqs-empty"
            className="max-w-3xl mx-auto bg-[#FAF7F2] rounded-3xl p-10 text-center border border-[#D91B3E]/15 space-y-3"
          >
            <p className="text-sm font-bold text-[#2A1D20]">
              {language === 'ar' ? 'لا توجد أسئلة مطابقة لبحثك' : 'No matching FAQ items found'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDomainFilter('all');
              }}
              className="text-xs font-bold text-[#D91B3E] underline cursor-pointer"
            >
              {language === 'ar' ? 'عرض جميع الأسئلة' : 'Reset Filter'}
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto" data-testid="faqs-accordion">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  data-testid={`faq-item-${faq.id}`}
                  className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-start font-black text-sm sm:text-base text-[#2A1D20] cursor-pointer"
                  >
                    <span>{language === 'ar' ? faq.questionAr : faq.questionEn}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#D91B3E] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-rose-100/70 text-xs sm:text-sm text-gray-700 leading-loose bg-[#FFFDFD]">
                      {language === 'ar' ? faq.answerAr : faq.answerEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


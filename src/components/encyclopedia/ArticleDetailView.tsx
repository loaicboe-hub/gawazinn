import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getCalculatorSummary } from '../../../shared/calculators';
import type { ContentDomain } from '../../types';
import {
  BookOpen,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Tag,
  Calculator,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { SmartImage } from '../common/SmartImage';

function domainRoute(domain: ContentDomain): string {
  switch (domain) {
    case 'finishing':
      return '/finishing';
    case 'groom':
      return '/groom';
    case 'bride':
      return '/bride';
    case 'wedding':
      return '/wedding';
    case 'early_start':
      return '/early-start';
    default:
      return '/encyclopedia';
  }
}

export const ArticleDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, dir, articles } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const decodedSlug = decodeURIComponent(slug || '');
  const article = articles.find((a) => a.slug === decodedSlug);

  const BreadcrumbSep = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar' ? 'الدليل غير موجود' : 'Guide Not Found'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'ar'
            ? 'ربما تم تعديل الرابط أو إزالة المقال، يمكنك استعراض بقية أدلة موسوعة جواز إن.'
            : 'This article slug could not be found. Browse all published GAWAZ INN guides below.'}
        </p>
        <Link
          to="/encyclopedia"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md"
        >
          <span>{language === 'ar' ? 'العودة إلى الموسوعة' : 'Back to Encyclopedia'}</span>
          <ArrowIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const bodyText = language === 'ar' ? article.bodyAr : article.bodyEn;
  const paragraphs = bodyText
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const relatedArticles = articles
    .filter((a) => a.slug !== article.slug && a.status === 'published')
    .sort((a, b) => (a.domain === article.domain ? -1 : b.domain === article.domain ? 1 : 0))
    .slice(0, 3);

  const domainCtaPath = domainRoute(article.domain);

  return (
    <div className="pb-24 space-y-12">
      {/* Top Hero */}
      <div className="bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-12 lg:py-16 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-rose-100/90 font-medium"
          >
            <Link to="/" className="hover:text-white transition">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
            <Link to="/encyclopedia" className="hover:text-white transition">
              {language === 'ar' ? 'الموسوعة' : 'Encyclopedia'}
            </Link>
            <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
            <Link to={`/encyclopedia/${article.domain}`} className="hover:text-white transition">
              {article.domain}
            </Link>
          </nav>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            {language === 'ar' ? article.titleAr : article.titleEn}
          </h1>

          <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
            {language === 'ar' ? article.excerptAr : article.excerptEn}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-rose-100">
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" />
              {article.authorName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readingMinutes} {language === 'ar' ? 'دقائق قراءة' : 'min read'}
            </span>
          </div>
        </div>
      </div>

      {/* Article Body Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-rose-100 h-64 sm:h-80 lg:h-96 bg-[#FDE8ED]">
          <SmartImage
            src={article.featuredImage}
            alt={language === 'ar' ? article.titleAr : article.titleEn}
            fallbackTitle={language === 'ar' ? article.titleAr : article.titleEn}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-100 shadow-lg space-y-5">
          {paragraphs.map((para, idx) => (
            <p
              key={idx}
              className="text-sm sm:text-base text-[#2A1D20] leading-loose whitespace-pre-line"
            >
              {para}
            </p>
          ))}

          {article.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] text-gray-700 text-xs font-semibold border border-[#D91B3E]/15"
                >
                  <Tag className="w-3 h-3 text-[#D91B3E]" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* FAQ Accordion */}
        {article.faqs.length > 0 && (
          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#D91B3E]/15 space-y-4">
            <h2 className="text-xl font-black text-[#2A1D20]">
              {language === 'ar' ? 'أسئلة شائعة حول هذا الدليل' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-3">
              {article.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-rose-100 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between gap-3 text-start font-bold text-xs sm:text-sm text-[#2A1D20] cursor-pointer"
                    >
                      <span>{language === 'ar' ? faq.questionAr : faq.questionEn}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#D91B3E] shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                        {language === 'ar' ? faq.answerAr : faq.answerEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contextual CTA Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FDE8ED] to-[#FAF7F2] border border-[#D91B3E]/20 p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D91B3E]">
                <Calculator className="w-4 h-4" />
                <span>{language === 'ar' ? 'خطوتك التالية على جواز إن' : 'Apply This Guide'}</span>
              </div>
              <h3 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar'
                  ? 'استكشف الباقات والمنتجات والأدوات المرتبطة بهذا الدليل'
                  : 'Explore Related Packages, Products & Cost Estimators'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                to={domainCtaPath}
                className="px-5 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-2"
              >
                <span>{language === 'ar' ? 'افتح القسم المختص' : 'Open Section'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/glossary"
                className="px-4 py-3 rounded-xl bg-white text-[#2A1D20] border border-gray-200 text-xs font-bold hover:border-[#D91B3E]/40 transition"
              >
                {language === 'ar' ? 'قاموس المصطلحات' : 'Glossary'}
              </Link>
              <Link
                to="/faqs"
                className="px-4 py-3 rounded-xl bg-white text-[#2A1D20] border border-gray-200 text-xs font-bold hover:border-[#D91B3E]/40 transition"
              >
                {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}
              </Link>
              <Link
                to="/calculators"
                className="px-4 py-3 rounded-xl bg-white text-[#2A1D20] border border-gray-200 text-xs font-bold hover:border-[#D91B3E]/40 transition"
              >
                {language === 'ar' ? 'كل الحاسبات (20)' : 'All 20 Calculators'}
              </Link>
            </div>
          </div>

          {article.relatedCalculators.length > 0 && (
            <div className="pt-3 border-t border-[#D91B3E]/15 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#B31331]">
                {language === 'ar' ? 'حاسبات مرتبطة بهذا الدليل:' : 'Linked Smart Calculators:'}
              </span>
              {article.relatedCalculators.map((calcSlug) => {
                const summary = getCalculatorSummary(calcSlug);
                const to = summary ? `/calculators/${summary.slug}` : '/calculators';
                const label = summary
                  ? language === 'ar'
                    ? summary.nameAr
                    : summary.nameEn
                  : calcSlug;
                return (
                  <Link
                    key={calcSlug}
                    to={to}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#D91B3E] border border-[#D91B3E]/25 hover:bg-[#D91B3E] hover:text-white text-[11px] font-bold transition"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#2A1D20]">
              {language === 'ar' ? 'أدلة ومقالات ذات صلة' : 'Related Guides'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/guides/${rel.slug}`}
                  className="bg-white rounded-2xl p-4 border border-rose-100 hover:border-[#D91B3E]/40 shadow-sm hover:shadow-md transition space-y-2 group"
                >
                  <div className="h-32 rounded-xl overflow-hidden bg-[#FDE8ED]">
                    <SmartImage
                      src={rel.featuredImage}
                      alt={language === 'ar' ? rel.titleAr : rel.titleEn}
                      fallbackTitle={language === 'ar' ? rel.titleAr : rel.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#2A1D20] group-hover:text-[#D91B3E] line-clamp-2">
                    {language === 'ar' ? rel.titleAr : rel.titleEn}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


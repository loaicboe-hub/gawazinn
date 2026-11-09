import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { ContentDomain } from '../../types';
import {
  BookOpen,
  Search,
  Clock,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Tag,
  Building2,
  Briefcase,
  Sparkles,
  Heart,
  Compass,
  Home,
} from 'lucide-react';
import { SmartImage } from '../common/SmartImage';

type DomainFilter = 'all' | ContentDomain;

const DOMAIN_OPTIONS: {
  key: DomainFilter;
  labelAr: string;
  labelEn: string;
}[] = [
  { key: 'all', labelAr: 'الكل', labelEn: 'All Guides' },
  { key: 'finishing', labelAr: 'تشطيب الشقة', labelEn: 'Apartment Finishing' },
  { key: 'groom', labelAr: 'جهاز العريس', labelEn: "Groom's Essentials" },
  { key: 'bride', labelAr: 'جهاز العروسة', labelEn: "Bride's Trousseau" },
  { key: 'wedding', labelAr: 'تنظيم الفرح', labelEn: 'Wedding Planning' },
  { key: 'early_start', labelAr: 'البداية المبكرة', labelEn: 'Early Start' },
  { key: 'married_life', labelAr: 'حياة ما بعد الزواج', labelEn: 'Married Life' },
  { key: 'editorial', labelAr: 'القاموس والمصطلحات', labelEn: 'Glossary & FAQs' },
];

function renderCategoryIcon(iconName: string) {
  switch (iconName) {
    case 'Building2':
      return <Building2 className="w-5 h-5 text-[#D91B3E]" />;
    case 'Briefcase':
      return <Briefcase className="w-5 h-5 text-[#D91B3E]" />;
    case 'Sparkles':
      return <Sparkles className="w-5 h-5 text-[#D91B3E]" />;
    case 'Heart':
      return <Heart className="w-5 h-5 text-[#D91B3E]" />;
    case 'Compass':
      return <Compass className="w-5 h-5 text-[#D91B3E]" />;
    case 'Home':
      return <Home className="w-5 h-5 text-[#D91B3E]" />;
    default:
      return <BookOpen className="w-5 h-5 text-[#D91B3E]" />;
  }
}

export const EncyclopediaHubView: React.FC = () => {
  const { domain } = useParams<{ domain?: string }>();
  const { language, dir, articles, categories, isStaff } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const activeDomain: DomainFilter = DOMAIN_OPTIONS.some((d) => d.key === domain)
    ? (domain as DomainFilter)
    : 'all';

  const visibleArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return articles.filter((art) => {
      if (!isStaff && art.status !== 'published') return false;
      if (activeDomain !== 'all' && art.domain !== activeDomain) return false;
      if (!q) return true;
      return (
        art.titleAr.toLowerCase().includes(q) ||
        art.titleEn.toLowerCase().includes(q) ||
        art.excerptAr.toLowerCase().includes(q) ||
        art.excerptEn.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [articles, activeDomain, searchQuery, isStaff]);

  const domainLabel = (d: ContentDomain) => {
    const found = DOMAIN_OPTIONS.find((item) => item.key === d);
    if (!found) return d;
    return language === 'ar' ? found.labelAr : found.labelEn;
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner — Consistent GAWAZ INN Wine Red Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <BookOpen className="w-4 h-4 text-white" />
              <span>
                {language === 'ar' ? 'الموسوعة الوطنية للزواج والبيت' : 'GAWAZ INN Encyclopedia'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {language === 'ar'
                ? 'دليلك الموثوق للتشطيب، التجهيز، وإدارة رحلة الزواج'
                : 'Your Trusted Guide to Finishing, Trousseau & Marriage Planning'}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'أدلة عملية مكتوبة بمعايير السوق المصري: خطوات هندسية واضحة، قوائم واقعية، ونصائح لحماية ميزانيتك.'
                : 'Field-tested Egyptian playbooks covering finishing sequencing, appliance efficiency, trousseau lists, and venue contracts.'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Filter Bar + Search */}
        <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 border border-[#D91B3E]/15 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="encyclopedia-search"
                placeholder={
                  language === 'ar'
                    ? 'ابحث في الأدلة والمقالات والوسوم...'
                    : 'Search guides, topics, tags...'
                }
                className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm focus:border-[#D91B3E] focus:outline-none"
              />
            </div>

            <div className="text-xs font-bold text-gray-600">
              {language === 'ar'
                ? `عرض ${visibleArticles.length} دليل ومقال`
                : `Showing ${visibleArticles.length} guide${visibleArticles.length === 1 ? '' : 's'}`}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map((opt) => {
              const targetTo = opt.key === 'all' ? '/encyclopedia' : `/encyclopedia/${opt.key}`;
              const isActive = activeDomain === opt.key;
              return (
                <Link
                  key={opt.key}
                  to={targetTo}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-[#D91B3E] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40 hover:text-[#D91B3E]'
                  }`}
                >
                  {language === 'ar' ? opt.labelAr : opt.labelEn}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Category Overview Strip (shown when viewing 'all' and empty search) */}
        {activeDomain === 'all' && !searchQuery.trim() && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20]">
              {language === 'ar' ? 'أقسام المعرفة الرئيسية' : 'Encyclopedia Knowledge Domains'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/encyclopedia/${cat.domain}`}
                  className="bg-white rounded-2xl p-5 border border-rose-100 hover:border-[#D91B3E]/40 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FDE8ED] flex items-center justify-center shrink-0">
                      {renderCategoryIcon(cat.iconName)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm font-black text-[#2A1D20] group-hover:text-[#D91B3E] transition">
                        {language === 'ar' ? cat.nameAr : cat.nameEn}
                      </h3>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {language === 'ar' ? cat.descriptionAr : cat.descriptionEn}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {visibleArticles.length === 0 ? (
          <div className="bg-[#FAF7F2] rounded-3xl p-12 text-center border border-[#D91B3E]/15 space-y-4">
            <BookOpen className="w-10 h-10 text-[#D91B3E] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar' ? 'لا توجد مقالات مطابقة لبحثك' : 'No matching guides found'}
              </h3>
              <p className="text-xs text-gray-600">
                {language === 'ar'
                  ? 'جرّب كلمات بحث أخرى أو استعرض جميع أقسام الموسوعة.'
                  : 'Try adjusting your search keywords or reset to view all categories.'}
              </p>
            </div>
            <Link
              to="/encyclopedia"
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D91B3E] text-white text-xs font-bold shadow-md hover:opacity-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إعادة ضبط البحث' : 'Reset Filters'}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleArticles.map((art) => (
              <article
                key={art.id}
                data-testid={`article-card-${art.slug}`}
                className="bg-white rounded-3xl border border-rose-100 shadow-md hover:shadow-xl transition overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-[#FDE8ED]">
                    <SmartImage
                      src={art.featuredImage}
                      alt={language === 'ar' ? art.titleAr : art.titleEn}
                      fallbackTitle={language === 'ar' ? art.titleAr : art.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-[#D91B3E] text-white text-[10px] font-bold shadow">
                      {domainLabel(art.domain)}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#D91B3E]" />
                        {art.readingMinutes} {language === 'ar' ? 'دقائق قراءة' : 'min read'}
                      </span>
                      <span className="truncate max-w-[60%] font-medium text-gray-600">
                        {art.authorName}
                      </span>
                    </div>

                    <h2 className="text-base font-black text-[#2A1D20] group-hover:text-[#D91B3E] transition leading-snug">
                      <Link to={`/guides/${art.slug}`}>
                        {language === 'ar' ? art.titleAr : art.titleEn}
                      </Link>
                    </h2>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {language === 'ar' ? art.excerptAr : art.excerptEn}
                    </p>

                    {art.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {art.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F2] text-gray-600 text-[10px] font-medium border border-gray-200/70"
                          >
                            <Tag className="w-2.5 h-2.5 text-[#D91B3E]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <Link
                    to={`/guides/${art.slug}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FDE8ED] hover:bg-[#D91B3E] text-[#B31331] hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <span>{language === 'ar' ? 'اقرأ الدليل الكامل' : 'Read Full Guide'}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


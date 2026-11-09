import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../services/api';
import { estimateFinishingRange } from '../../../shared/catalogMeta';
import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Sparkles,
  Star,
  Store,
  TrendingUp,
} from 'lucide-react';
import { SmartImage } from '../common/SmartImage';
import {
  CommercialPlanBadge,
  HonestRatingBadge,
  VerificationBadge,
} from '../vendors/VendorBadges';
import type { LocalCategoryGuidePayload } from '../../types';

export const LocalDiscoveryView: React.FC = () => {
  const { govSlug, catSlug } = useParams<{ govSlug?: string; catSlug?: string }>();
  const navigate = useNavigate();
  const {
    language,
    dir,
    apiConnected,
    locations,
    vendorCategories,
    vendors,
    weddingServices,
    setSelectedWeddingService,
    setWeddingBookingModalOpen,
  } = useApp();

  const BreadcrumbSep = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const decodedGovSlug = govSlug ? decodeURIComponent(govSlug) : 'egypt';
  const decodedCatSlug = catSlug ? decodeURIComponent(catSlug) : null;

  const [guideData, setGuideData] = useState<LocalCategoryGuidePayload | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);

  // Offline / immediate synchronous computation fallback
  const fallbackPayload = useMemo<LocalCategoryGuidePayload | null>(() => {
    const loc = locations.find((l) => l.slug === decodedGovSlug);
    if (!loc) return null;
    const cat = decodedCatSlug
      ? vendorCategories.find((c) => c.slug === decodedCatSlug) ?? null
      : null;
    if (decodedCatSlug && !cat) return null;

    const parentLoc = loc.parentId
      ? locations.find((l) => l.id === loc.parentId) || null
      : null;
    const childrenLocs = locations.filter((l) => l.parentId === loc.id);
    const regionSlugs = new Set<string>([loc.slug]);
    childrenLocs.forEach((c) => regionSlugs.add(c.slug));

    let matchedV = vendors.filter((v) => v.verificationStatus !== 'rejected');
    if (cat) {
      matchedV = matchedV.filter(
        (v) =>
          v.primaryCategorySlug === cat.slug || v.extraCategorySlugs.includes(cat.slug),
      );
    }
    if (loc.level !== 'country') {
      matchedV = matchedV.filter(
        (v) =>
          regionSlugs.has(v.governorateSlug) ||
          (v.citySlug ? regionSlugs.has(v.citySlug) : false) ||
          v.serviceAreas.some((sa) => regionSlugs.has(sa)) ||
          Boolean(parentLoc && parentLoc.level !== 'country' && v.governorateSlug === parentLoc.slug),
      );
    }

    const matchedW =
      loc.level === 'country'
        ? weddingServices.slice(0, 6)
        : weddingServices.filter(
            (srv) =>
              srv.governorateSlug === loc.slug ||
              (parentLoc && srv.governorateSlug === parentLoc.slug) ||
              srv.locationAr.includes(loc.nameAr) ||
              srv.locationEn.toLowerCase().includes(loc.nameEn.toLowerCase()),
          );

    const base120 = estimateFinishingRange(120, 'medium');
    return {
      location: loc,
      parentLocation: parentLoc,
      children: childrenLocs,
      category: cat,
      allCategories: vendorCategories,
      matchedVendors: matchedV,
      matchedWeddingServices: matchedW,
      regionalBaselineMin: Math.round(base120.min * loc.costFactor),
      regionalBaselineMax: Math.round(base120.max * loc.costFactor),
    };
  }, [decodedGovSlug, decodedCatSlug, locations, vendorCategories, vendors, weddingServices]);

  useEffect(() => {
    let active = true;
    if (!apiConnected) {
      return () => {
        active = false;
      };
    }

    const path = `/locations/${encodeURIComponent(decodedGovSlug)}${
      decodedCatSlug ? `/${encodeURIComponent(decodedCatSlug)}` : ''
    }`;

    (async () => {
      try {
        const res = await apiRequest<LocalCategoryGuidePayload>(path);
        if (!active) return;
        setGuideData(res);
        setNotFoundError(false);
      } catch {
        if (!active) return;
        if (fallbackPayload) {
          setGuideData(fallbackPayload);
          setNotFoundError(false);
        } else {
          setGuideData(null);
          setNotFoundError(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [apiConnected, decodedGovSlug, decodedCatSlug, fallbackPayload]);

  const matchedGuideData =
    guideData &&
    guideData.location.slug === decodedGovSlug &&
    (guideData.category?.slug ?? null) === (decodedCatSlug || null)
      ? guideData
      : null;
  const effectiveGuide = matchedGuideData || fallbackPayload;

  if (notFoundError || !effectiveGuide) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] flex items-center justify-center mx-auto">
          <MapPin className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar' ? 'دليل المنطقة أو التخصص غير متوفر' : 'Location Guide Not Found'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'ar'
            ? 'اختر من المحافظات والمدن المصرية والتخصصات المتاحة في دليل جواز إن.'
            : 'Choose from our covered Egyptian governorates, cities & 17 service categories.'}
        </p>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md"
        >
          <span>{language === 'ar' ? 'عرض دليل المحافظات' : 'Explore Egypt Locations'}</span>
        </Link>
      </div>
    );
  }

  const {
    location: activeLocation,
    parentLocation,
    children: childLocations,
    category: activeCategory,
    allCategories,
    matchedVendors,
    matchedWeddingServices: matchedServices,
    regionalBaselineMin: regionalMin,
    regionalBaselineMax: regionalMax,
  } = effectiveGuide;

  const quickGovernorates = locations.filter(
    (l) => l.level === 'governorate' || l.level === 'city',
  );

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-rose-100/90 font-medium"
          >
            <Link to="/" className="hover:text-white transition">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
            <Link to="/discover" className="hover:text-white transition">
              {language === 'ar' ? 'دليل المحافظات' : 'Discover Egypt'}
            </Link>
            {parentLocation && parentLocation.slug !== 'egypt' && (
              <>
                <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
                <Link to={`/locations/${parentLocation.slug}`} className="hover:text-white transition">
                  {language === 'ar' ? parentLocation.nameAr : parentLocation.nameEn}
                </Link>
              </>
            )}
            {activeLocation.slug !== 'egypt' && (
              <>
                <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
                {activeCategory ? (
                  <Link
                    to={`/locations/${activeLocation.slug}`}
                    className="hover:text-white transition"
                  >
                    {language === 'ar' ? activeLocation.nameAr : activeLocation.nameEn}
                  </Link>
                ) : (
                  <span className="text-white font-bold">
                    {language === 'ar' ? activeLocation.nameAr : activeLocation.nameEn}
                  </span>
                )}
              </>
            )}
            {activeCategory && (
              <>
                <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
                <span className="text-white font-bold">
                  {language === 'ar' ? activeCategory.nameAr : activeCategory.nameEn}
                </span>
              </>
            )}
          </nav>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <MapPin className="w-4 h-4 text-white" />
              <span>
                {activeCategory
                  ? language === 'ar'
                    ? 'دليل التخصص المحلي والشركاء الموثقين'
                    : 'Local Category & Vetted Vendors Guide'
                  : language === 'ar'
                    ? 'دليل التكاليف والخدمات المحلية'
                    : 'Regional Costs & Services Guide'}
              </span>
            </div>

            <h1
              data-testid="local-guide-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
            >
              {activeCategory
                ? language === 'ar'
                  ? `${activeCategory.nameAr} في ${activeLocation.nameAr}`
                  : `${activeCategory.nameEn} in ${activeLocation.nameEn}`
                : language === 'ar'
                  ? `تجهيز البيت والزفاف في ${activeLocation.nameAr}`
                  : `Home Finishing & Wedding Guide — ${activeLocation.nameEn}`}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">
              {activeCategory
                ? language === 'ar'
                  ? `${activeCategory.summaryAr} — ${activeLocation.summaryAr}`
                  : `${activeCategory.summaryEn} — ${activeLocation.summaryEn}`
                : language === 'ar'
                  ? activeLocation.summaryAr
                  : activeLocation.summaryEn}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Regional Switcher + 17-Category Local SEO Selector */}
        <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 border border-[#D91B3E]/15 space-y-5">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-[#B31331] block">
              {language === 'ar' ? 'اختر المحافظة أو المدينة:' : 'Select Governorate or City:'}
            </span>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/discover"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeLocation.slug === 'egypt'
                    ? 'bg-[#D91B3E] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                }`}
              >
                {language === 'ar' ? 'عموم مصر' : 'All Egypt'}
              </Link>
              {quickGovernorates.map((loc) => (
                <Link
                  key={loc.id}
                  to={`/locations/${loc.slug}${activeCategory ? `/${activeCategory.slug}` : ''}`}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeLocation.slug === loc.slug
                      ? 'bg-[#D91B3E] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                  }`}
                >
                  {language === 'ar' ? loc.nameAr : loc.nameEn}
                </Link>
              ))}
            </div>
          </div>

          <div
            data-testid="local-category-switcher"
            className="pt-4 border-t border-[#D91B3E]/10 space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#B31331]">
                {language === 'ar'
                  ? `تصفح حسب التخصص داخل ${activeLocation.nameAr} (17 تخصصاً):`
                  : `Browse 17 Service Categories in ${activeLocation.nameEn}:`}
              </span>
              <div className="w-full sm:w-72 min-w-0">
                <select
                  value={activeCategory?.slug || ''}
                  onChange={(e) => {
                    const nextCat = e.target.value;
                    navigate(
                      nextCat
                        ? `/locations/${activeLocation.slug}/${nextCat}`
                        : `/locations/${activeLocation.slug}`,
                    );
                  }}
                  data-testid="local-category-select"
                  className="w-full max-w-full min-w-0 truncate px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
                >
                  <option value="">
                    {language === 'ar' ? 'كل التخصصات (نظرة شاملة)' : 'All Categories (Overview)'}
                  </option>
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Link
                to={`/locations/${activeLocation.slug}`}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                  !activeCategory
                    ? 'bg-[#2A1D20] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </Link>
              {allCategories.map((c) => (
                <Link
                  key={c.id}
                  to={`/locations/${activeLocation.slug}/${c.slug}`}
                  data-testid={`local-cat-pill-${c.slug}`}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    activeCategory?.slug === c.slug
                      ? 'bg-[#D91B3E] text-white shadow'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                  }`}
                >
                  {language === 'ar' ? c.nameAr : c.nameEn}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Category Buyer Checklist Box (when category route is active) */}
        {activeCategory && (
          <div
            data-testid="local-category-checklist"
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D91B3E]/20 shadow-md space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-[#D91B3E]">
                  {language === 'ar'
                    ? 'نصائح التعاقد وفحص الشريك في المنطقة'
                    : 'Regional Hiring & Contract Checklist'}
                </span>
                <h2 className="text-xl font-black text-[#2A1D20] mt-0.5">
                  {language === 'ar' ? activeCategory.nameAr : activeCategory.nameEn}
                </h2>
              </div>
              <Link
                to={`/vendors?category=${activeCategory.slug}&governorate=${activeLocation.slug}`}
                className="px-4 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold shadow"
              >
                {language === 'ar'
                  ? 'عرض دليل الشركاء الكامل لهذا التخصص'
                  : 'Full Vendors Directory Filter'}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(language === 'ar'
                ? activeCategory.buyerChecklistAr
                : activeCategory.buyerChecklistEn
              ).map((tip, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex items-start gap-2.5 text-xs text-gray-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regional Cost Indicator + Child Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-lg space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D91B3E]">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? 'مؤشر التكلفة التقديرية للتشطيب بالمنطقة'
                    : 'Regional Finishing Cost Benchmark'}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FDE8ED] text-[#B31331] text-xs font-black">
                {activeLocation.costFactor.toFixed(2)}x
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20]">
              {language === 'ar'
                ? `متوسط تقديري لشقة 120 م² (باقة متوسطة) في ${activeLocation.nameAr}`
                : `Estimated 120 m² Medium Finishing Range in ${activeLocation.nameEn}`}
            </h2>

            <div className="text-2xl sm:text-3xl font-black text-[#D91B3E]">
              {regionalMin.toLocaleString()} – {regionalMax.toLocaleString()}{' '}
              <span className="text-sm font-bold text-gray-600">
                {language === 'ar' ? 'ج.م' : 'EGP'}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'ar'
                ? 'أرقام استرشادية مبنية على مؤشر الخامات والمصنعيات الإقليمي لـ 120 متر² باقة تشطيب متوازن قبل المعاينة الهندسية.'
                : 'Indicative planning benchmark calibrated for a 120 m² medium-tier turnkey scope prior to site inspection.'}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                to="/finishing"
                className="px-4 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow hover:opacity-95 transition flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'حاسبة باقات التشطيب' : 'Finishing Estimator'}</span>
              </Link>
              <Link
                to="/groom"
                className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] text-[#2A1D20] border border-gray-200 text-xs font-bold hover:border-[#D91B3E]/40 transition flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'جهاز العريس' : "Groom's Catalog"}</span>
              </Link>
              <Link
                to="/bride"
                className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] text-[#2A1D20] border border-gray-200 text-xs font-bold hover:border-[#D91B3E]/40 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'جهاز العروسة' : "Bride's List"}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#D91B3E]/15 space-y-4">
            <h3 className="text-lg font-black text-[#2A1D20]">
              {childLocations.length > 0
                ? language === 'ar'
                  ? `المناطق والمدن داخل ${activeLocation.nameAr}`
                  : `Districts & Cities in ${activeLocation.nameEn}`
                : language === 'ar'
                  ? 'أدلة معرفية مقترحة للمنطقة'
                  : 'Recommended Planning Playbooks'}
            </h3>

            {childLocations.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {childLocations.map((child) => (
                  <Link
                    key={child.id}
                    to={`/locations/${child.slug}${activeCategory ? `/${activeCategory.slug}` : ''}`}
                    className="bg-white rounded-2xl p-4 border border-rose-100 hover:border-[#D91B3E]/40 transition flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#2A1D20] group-hover:text-[#D91B3E]">
                        {language === 'ar' ? child.nameAr : child.nameEn}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        {language === 'ar' ? child.summaryAr : child.summaryEn}
                      </p>
                    </div>
                    <span className="text-xs font-black text-[#D91B3E] shrink-0">
                      {child.costFactor.toFixed(2)}x
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'ar'
                    ? 'اطّلع على الترتيب الهندسي للتشطيب، بنود عقود القاعات، وأدلة التوفير في موسوعة جواز إن.'
                    : 'Review finishing sequences, venue contract checklists, and early saving guides in our Encyclopedia.'}
                </p>
                <Link
                  to="/encyclopedia"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-[#B31331] text-xs font-bold hover:bg-[#FDE8ED] transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{language === 'ar' ? 'فتح الموسوعة' : 'Open Encyclopedia'}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Matched Vetted Vendors & Contractors in Region */}
        <div className="space-y-5" data-testid="local-matched-vendors">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20] flex items-center gap-2">
              <Store className="w-6 h-6 text-[#D91B3E]" />
              <span>
                {activeCategory
                  ? language === 'ar'
                    ? `شركاء «${activeCategory.nameAr}» في ${activeLocation.nameAr} (${matchedVendors.length})`
                    : `${activeCategory.nameEn} Partners in ${activeLocation.nameEn} (${matchedVendors.length})`
                  : language === 'ar'
                    ? `الشركاء ومقدمو الخدمات في ${activeLocation.nameAr} (${matchedVendors.length})`
                    : `Verified Vendors Serving ${activeLocation.nameEn} (${matchedVendors.length})`}
              </span>
            </h2>
            <Link
              to={`/vendors${activeCategory ? `?category=${activeCategory.slug}` : ''}`}
              className="text-xs font-bold text-[#D91B3E] hover:underline"
            >
              {language === 'ar' ? 'تصفح كل الشركاء (17 تخصصاً)' : 'Browse Full Marketplace'}
            </Link>
          </div>

          {matchedVendors.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-rose-100 text-center space-y-3">
              <Store className="w-8 h-8 text-[#D91B3E] mx-auto" />
              <p className="text-sm font-bold text-[#2A1D20]">
                {language === 'ar'
                  ? 'لا توجد شركات مسجلة لهذا التخصص الدقيق في هذه المنطقة حالياً — يمكنك استعراض المحافظات المجاورة أو دليل الشركاء العام.'
                  : 'No listed specialists match this exact area & category yet — expand to Greater Cairo/Egypt.'}
              </p>
              <Link
                to="/vendors"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold"
              >
                <span>{language === 'ar' ? 'تصفح جميع الشركاء' : 'View All Vendors'}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedVendors.map((v) => (
                <article
                  key={v.id}
                  data-testid={`local-vendor-card-${v.slug}`}
                  className="bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-40 relative bg-[#FDE8ED] overflow-hidden">
                      <SmartImage
                        src={v.coverImage}
                        alt={language === 'ar' ? v.businessNameAr : v.businessNameEn}
                        fallbackTitle={language === 'ar' ? v.businessNameAr : v.businessNameEn}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 start-3 end-3 flex flex-wrap items-center justify-between gap-1.5">
                        <VerificationBadge
                          status={v.verificationStatus}
                          language={language}
                          compact
                        />
                        <CommercialPlanBadge
                          planCode={v.subscriptionPlanCode}
                          isFeaturedCommercial={v.isFeaturedCommercial}
                          language={language}
                        />
                      </div>
                    </div>
                    <div className="p-5 space-y-2.5">
                      <h3 className="text-base font-black text-[#2A1D20]">
                        {language === 'ar' ? v.businessNameAr : v.businessNameEn}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {language === 'ar' ? v.bioAr : v.bioEn}
                      </p>
                      <HonestRatingBadge
                        ratingAvg={v.ratingAvg}
                        reviewsCount={v.reviewsCount}
                        language={language}
                      />
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#D91B3E]">
                      {v.startingPriceEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                    <Link
                      to={`/vendors/${v.slug}`}
                      className="px-4 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold shadow"
                    >
                      {language === 'ar' ? 'عرض الملف' : 'View Profile'}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Regional Wedding Services */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20]">
              {language === 'ar'
                ? `قاعات وخدمات الزفاف في ${activeLocation.nameAr}`
                : `Wedding Venues & Services — ${activeLocation.nameEn}`}
            </h2>
            <Link to="/wedding" className="text-xs font-bold text-[#D91B3E] hover:underline">
              {language === 'ar' ? 'عرض جميع خدمات الفرح' : 'View All Wedding Services'}
            </Link>
          </div>

          {matchedServices.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-rose-100 text-center space-y-3">
              <Heart className="w-8 h-8 text-[#D91B3E] mx-auto" />
              <p className="text-sm font-bold text-[#2A1D20]">
                {language === 'ar'
                  ? 'لا توجد قاعات مسجلة لهذه المنطقة حالياً — يمكنك استعراض القاعات القريبة أو إرسال طلب حجز مخصص.'
                  : 'No listed venues match this exact district yet — explore nearby governorates or submit a custom booking request.'}
              </p>
              <Link
                to="/wedding"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold"
              >
                <span>{language === 'ar' ? 'استعرض جميع القاعات' : 'Browse All Venues'}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedServices.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 bg-[#FDE8ED] overflow-hidden relative">
                      <SmartImage
                        src={srv.imageUrl}
                        alt={language === 'ar' ? srv.nameAr : srv.nameEn}
                        fallbackTitle={language === 'ar' ? srv.nameAr : srv.nameEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D91B3E]" />
                          {language === 'ar' ? srv.locationAr : srv.locationEn}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[#2A1D20]">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {srv.rating}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-[#2A1D20]">
                        {language === 'ar' ? srv.nameAr : srv.nameEn}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {language === 'ar' ? srv.descriptionAr : srv.descriptionEn}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#D91B3E]">
                      {srv.startingPrice.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWeddingService(srv);
                        setWeddingBookingModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold shadow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'طلب حجز' : 'Book Inquiry'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

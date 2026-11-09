import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SmartImage } from '../common/SmartImage';
import { ModalFrame } from '../common/ModalFrame';
import {
  CommercialPlanBadge,
  HonestRatingBadge,
  VerificationBadge,
} from './VendorBadges';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Filter,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Store,
} from 'lucide-react';
import type { VendorDomain, VendorPriceTier } from '../../types';

const DOMAIN_OPTIONS: { key: 'all' | VendorDomain; ar: string; en: string }[] = [
  { key: 'all', ar: 'كل القطاعات (17 تخصصاً)', en: 'All 17 Categories' },
  { key: 'finishing', ar: 'التشطيب والمطابخ', en: 'Finishing & Kitchens' },
  { key: 'groom', ar: 'جهاز العريس والأجهزة', en: 'Groom & Appliances' },
  { key: 'bride', ar: 'جهاز العروسة والمفروشات', en: 'Bride & Textiles' },
  { key: 'wedding', ar: 'القاعات والفرح والشبكة', en: 'Venues, Wedding & Gold' },
  { key: 'post_marriage', ar: 'النقل والصيانة بعد الزواج', en: 'Moving & Home Care' },
];

export const VendorDirectoryView: React.FC = () => {
  const {
    language,
    dir,
    vendors,
    vendorCategories,
    locations,
    currentUser,
    apiConnected,
    setAuthModalOpen,
    registerVendor,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [domainFilter, setDomainFilter] = useState<'all' | VendorDomain>(
    () => (searchParams.get('domain') as 'all' | VendorDomain) || 'all',
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(
    () => searchParams.get('category') || 'all',
  );
  const [govFilter, setGovFilter] = useState<string>(
    () => searchParams.get('governorate') || 'all',
  );
  const [verifFilter, setVerifFilter] = useState<string>(
    () => searchParams.get('verification') || 'all',
  );
  const [sortBy, setSortBy] = useState<string>('verification_desc');
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('q') || '');

  // Self-registration Modal State
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regNameAr, setRegNameAr] = useState('');
  const [regNameEn, setRegNameEn] = useState('');
  const [regCategory, setRegCategory] = useState(
    vendorCategories[0]?.slug || 'turnkey_finishing',
  );
  const [regGov, setRegGov] = useState('cairo');
  const [regAddressAr, setRegAddressAr] = useState('');
  const [regAddressEn, setRegAddressEn] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBioAr, setRegBioAr] = useState('');
  const [regBioEn, setRegBioEn] = useState('');
  const [regPriceTier, setRegPriceTier] = useState<VendorPriceTier>('mid');
  const [regStartingPrice, setRegStartingPrice] = useState(3500);
  const [regYearsExp, setRegYearsExp] = useState(5);
  const [regDocsText, setRegDocsText] = useState('');

  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const locationMap = useMemo(
    () => new Map(locations.map((loc) => [loc.slug, loc])),
    [locations],
  );

  const visibleCategories = useMemo(() => {
    if (domainFilter === 'all') return vendorCategories;
    return vendorCategories.filter((c) => c.domain === domainFilter);
  }, [vendorCategories, domainFilter]);

  const activeCategoryObj = useMemo(
    () =>
      categoryFilter !== 'all'
        ? vendorCategories.find((c) => c.slug === categoryFilter) || null
        : null,
    [vendorCategories, categoryFilter],
  );

  const filteredVendors = useMemo(() => {
    let list = vendors.filter((v) => v.verificationStatus !== 'rejected');

    if (domainFilter !== 'all') {
      const domainCatSlugs = new Set(
        vendorCategories.filter((c) => c.domain === domainFilter).map((c) => c.slug),
      );
      list = list.filter((v) => domainCatSlugs.has(v.primaryCategorySlug));
    }

    if (categoryFilter !== 'all') {
      list = list.filter(
        (v) =>
          v.primaryCategorySlug === categoryFilter ||
          v.extraCategorySlugs.includes(categoryFilter),
      );
    }

    if (govFilter !== 'all') {
      const targetNode = locationMap.get(govFilter);
      const childSlugs = new Set(
        locations.filter((l) => l.parentId === targetNode?.id).map((l) => l.slug),
      );
      list = list.filter(
        (v) =>
          v.governorateSlug === govFilter ||
          v.citySlug === govFilter ||
          v.serviceAreas.includes(govFilter) ||
          childSlugs.has(v.governorateSlug) ||
          (v.citySlug ? childSlugs.has(v.citySlug) : false) ||
          v.serviceAreas.some((sa) => childSlugs.has(sa)),
      );
    }

    if (verifFilter !== 'all') {
      list = list.filter((v) => v.verificationStatus === verifFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((v) =>
        `${v.businessNameAr} ${v.businessNameEn} ${v.bioAr} ${v.bioEn} ${v.addressAr} ${v.addressEn} ${v.categoryNameAr || ''} ${v.categoryNameEn || ''}`
          .toLowerCase()
          .includes(q),
      );
    }

    const verifRank: Record<string, number> = {
      trusted: 3,
      verified: 2,
      registered: 1,
      rejected: 0,
    };
    const planRank: Record<string, number> = {
      premium: 4,
      professional: 3,
      basic: 2,
      free: 1,
    };

    const sorted = [...list];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.startingPriceEgp - b.startingPriceEgp);
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.startingPriceEgp - a.startingPriceEgp);
    } else if (sortBy === 'rating_desc') {
      sorted.sort((a, b) => {
        if (b.reviewsCount === 0 && a.reviewsCount === 0) {
          return (verifRank[b.verificationStatus] || 0) - (verifRank[a.verificationStatus] || 0);
        }
        return b.ratingAvg - a.ratingAvg || b.reviewsCount - a.reviewsCount;
      });
    } else if (sortBy === 'featured_commercial') {
      sorted.sort(
        (a, b) =>
          (planRank[b.subscriptionPlanCode] || 0) - (planRank[a.subscriptionPlanCode] || 0) ||
          (verifRank[b.verificationStatus] || 0) - (verifRank[a.verificationStatus] || 0),
      );
    } else {
      sorted.sort(
        (a, b) =>
          (verifRank[b.verificationStatus] || 0) - (verifRank[a.verificationStatus] || 0) ||
          (planRank[b.subscriptionPlanCode] || 0) - (planRank[a.subscriptionPlanCode] || 0),
      );
    }
    return sorted;
  }, [
    vendors,
    vendorCategories,
    domainFilter,
    categoryFilter,
    govFilter,
    verifFilter,
    sortBy,
    searchQuery,
    locations,
    locationMap,
  ]);

  const openRegistrationFlow = () => {
    if (!currentUser) {
      showToast(
        language === 'ar'
          ? 'يرجى تسجيل الدخول أولاً لتسجيل نشاطك التجاري في دليل جواز إن.'
          : 'Please sign in first to register your business profile.',
      );
      setAuthModalOpen(true);
      return;
    }
    setRegError(null);
    setRegModalOpen(true);
  };

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiConnected) {
      setRegError(
        language === 'ar'
          ? 'يتطلب تسجيل النشاط اتصالاً بخادم API.'
          : 'Business registration requires a live backend connection.',
      );
      return;
    }
    setRegSubmitting(true);
    setRegError(null);
    try {
      const docs = regDocsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length >= 2);
      const created = await registerVendor({
        businessNameAr: regNameAr.trim(),
        businessNameEn: regNameEn.trim() || regNameAr.trim(),
        primaryCategorySlug: regCategory,
        governorateSlug: regGov,
        serviceAreas: [regGov],
        addressAr: regAddressAr.trim(),
        addressEn: regAddressEn.trim() || regAddressAr.trim(),
        phone: regPhone.trim(),
        bioAr: regBioAr.trim(),
        bioEn: regBioEn.trim() || regBioAr.trim(),
        priceTier: regPriceTier,
        startingPriceEgp: Number(regStartingPrice),
        yearsExperience: Number(regYearsExp),
        verificationDocs: docs,
      });
      setRegModalOpen(false);
      navigate(`/vendors/${created.slug}`);
    } catch (err) {
      setRegError(
        err instanceof Error
          ? err.message
          : language === 'ar'
            ? 'تعذر تسجيل النشاط. راجع الحقول المطلوبة.'
            : 'Unable to register vendor. Check required fields.',
      );
    } finally {
      setRegSubmitting(false);
    }
  };

  const regionalOptions = useMemo(
    () => locations.filter((l) => l.level !== 'country'),
    [locations],
  );

  return (
    <div className="space-y-10 pb-24">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-12 lg:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3 min-w-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20">
                <Store className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? 'سوق وشركاء جواز إن — 17 تخصصاً موثقاً في مصر'
                    : 'GAWAZ INN Marketplace — 17 Egyptian Wedding & Home Sectors'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {language === 'ar'
                  ? 'دليل الشركات والمعارض ومقدمي الخدمات'
                  : 'Verified Contractors, Vendors & Showrooms Directory'}
              </h1>
              <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
                {language === 'ar'
                  ? 'تصفح 17 فئة من مقاولي التشطيب والمطابخ والأثاث والأجهزة والقاعات والمجوهرات ونقل العفش. نلتزم بالشفافية: شارات التوثيق بناءً على فحص الأوراق الرسمية فقط ولا تُباع بالاشتراكات، والتقييمات حقيقية من العملاء.'
                  : 'Explore 17 vetted home-finishing, appliance, furniture, venue, bridal & post-marriage service categories. Verification badges depend strictly on admin document audits — never commercial spend — with zero fabricated star ratings.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={openRegistrationFlow}
                data-testid="open-vendor-register-btn"
                className="px-5 py-3 rounded-xl bg-white text-[#B31331] hover:bg-[#FDE8ED] text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {language === 'ar' ? 'سجّل شركتك مجاناً' : 'Register Your Business'}
                </span>
              </button>
              <Link
                to="/vendor"
                data-testid="goto-vendor-portal-link"
                className="px-5 py-3 rounded-xl bg-[#1C1819]/80 hover:bg-[#1C1819] text-white border border-white/20 text-xs font-bold transition flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-rose-200" />
                <span>
                  {language === 'ar' ? 'بوابة الشركاء والاشتراكات' : 'Vendor Portal & Plans'}
                </span>
              </Link>
            </div>
          </div>

          {/* Governance Transparency Banner */}
          <div className="rounded-2xl bg-white/10 border border-white/15 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-100">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'فصل حوكمة التوثيق عن الباقات: الاشتراك التجاري يزيد حصص الخدمات والعروض فقط ولا يمنح شارة «موثق» أو «ثقة».'
                  : 'Governance Guarantee: Paid commercial tiers expand service/promo quotas only and NEVER grant Verified or Trusted badges.'}
              </span>
            </div>
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-white font-bold underline underline-offset-4 shrink-0"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'دليل المحافظات' : 'Explore Governorates SEO'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Domain Quick Tabs + Multi-Filter Card */}
        <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 border border-[#D91B3E]/15 space-y-4">
          {/* Domain Tabs */}
          <div className="flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map((dom) => (
              <button
                key={dom.key}
                type="button"
                data-testid={`vendor-domain-tab-${dom.key}`}
                onClick={() => {
                  setDomainFilter(dom.key);
                  if (dom.key !== 'all' && categoryFilter !== 'all') {
                    const cat = vendorCategories.find((c) => c.slug === categoryFilter);
                    if (cat && cat.domain !== dom.key) {
                      setCategoryFilter('all');
                    }
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  domainFilter === dom.key
                    ? 'bg-[#D91B3E] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                }`}
              >
                {language === 'ar' ? dom.ar : dom.en}
              </button>
            ))}
          </div>

          {/* Filter Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative min-w-0">
              <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="vendor-search-input"
                placeholder={
                  language === 'ar' ? 'ابحث بالاسم أو التخصص...' : 'Search business or area...'
                }
                className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium outline-none focus:border-[#D91B3E]"
              />
            </div>

            <div className="min-w-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                data-testid="vendor-category-select"
                className="w-full max-w-full min-w-0 truncate px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
              >
                <option value="all">
                  {language === 'ar' ? 'كل الـ 17 تخصصاً' : 'All 17 Categories'}
                </option>
                {visibleCategories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <select
                value={govFilter}
                onChange={(e) => setGovFilter(e.target.value)}
                data-testid="vendor-gov-select"
                className="w-full max-w-full min-w-0 truncate px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
              >
                <option value="all">
                  {language === 'ar' ? 'جميع محافظات ومدن مصر' : 'All Egypt Regions'}
                </option>
                {regionalOptions.map((loc) => (
                  <option key={loc.id} value={loc.slug}>
                    {language === 'ar' ? loc.nameAr : loc.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <select
                value={verifFilter}
                onChange={(e) => setVerifFilter(e.target.value)}
                data-testid="vendor-verification-select"
                className="w-full max-w-full min-w-0 truncate px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
              >
                <option value="all">
                  {language === 'ar' ? 'كل مستويات التوثيق' : 'All Verification Levels'}
                </option>
                <option value="trusted">
                  {language === 'ar' ? 'شريك ثقة (+تدقيق ميداني)' : 'Trusted & Audited Only'}
                </option>
                <option value="verified">
                  {language === 'ar' ? 'موثق أوراق رسمية' : 'Document Verified'}
                </option>
                <option value="registered">
                  {language === 'ar' ? 'مسجل (قيد المراجعة)' : 'Registered (Pending Audit)'}
                </option>
              </select>
            </div>

            <div className="min-w-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                data-testid="vendor-sort-select"
                className="w-full max-w-full min-w-0 truncate px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
              >
                <option value="verification_desc">
                  {language === 'ar' ? 'الترتيب: الأعلى توثيقاً' : 'Sort: Highest Verification'}
                </option>
                <option value="featured_commercial">
                  {language === 'ar' ? 'الترتيب: العروض المميزة' : 'Sort: Sponsored Highlight'}
                </option>
                <option value="price_asc">
                  {language === 'ar' ? 'الترتيب: أقل سعر مبدئي' : 'Sort: Lowest Starting Price'}
                </option>
                <option value="price_desc">
                  {language === 'ar' ? 'الترتيب: أعلى باقات فاخرة' : 'Sort: Premium Budgets First'}
                </option>
                <option value="rating_desc">
                  {language === 'ar' ? 'الترتيب: تقييمات العملاء' : 'Sort: Real Customer Rating'}
                </option>
              </select>
            </div>
          </div>

          {/* Count + Active Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 pt-1">
            <span className="font-bold text-[#2A1D20] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>
                {language === 'ar'
                  ? `عرض ${filteredVendors.length} نشاط تجاري وشريك`
                  : `Showing ${filteredVendors.length} vendor listings`}
              </span>
            </span>
            {(domainFilter !== 'all' ||
              categoryFilter !== 'all' ||
              govFilter !== 'all' ||
              verifFilter !== 'all' ||
              searchQuery.trim() !== '') && (
              <button
                type="button"
                onClick={() => {
                  setDomainFilter('all');
                  setCategoryFilter('all');
                  setGovFilter('all');
                  setVerifFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#D91B3E] hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
              </button>
            )}
          </div>
        </div>

        {/* Category Buyer Checklist Box when a category is selected */}
        {activeCategoryObj && (
          <div
            data-testid="vendor-category-checklist-card"
            className="bg-white rounded-3xl p-5 sm:p-7 border border-[#D91B3E]/20 shadow-md space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-black text-[#D91B3E] uppercase tracking-wider">
                  {language === 'ar'
                    ? 'قائمة فحص قبل التعاقد لهذا التخصص'
                    : 'Pre-Contract Buyer Checklist'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#2A1D20] mt-0.5">
                  {language === 'ar' ? activeCategoryObj.nameAr : activeCategoryObj.nameEn}
                </h2>
              </div>
              <Link
                to={`/locations/${govFilter !== 'all' ? govFilter : 'cairo'}/${activeCategoryObj.slug}`}
                className="px-4 py-2 rounded-xl bg-[#FDE8ED] text-[#B31331] hover:bg-[#D91B3E] hover:text-white text-xs font-bold transition"
              >
                {language === 'ar' ? 'فتح الدليل المحلي للأسعار' : 'Open Local Category Guide'}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(language === 'ar'
                ? activeCategoryObj.buyerChecklistAr
                : activeCategoryObj.buyerChecklistEn
              ).map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex items-start gap-2.5 text-xs text-gray-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vendors Cards Grid */}
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-rose-100 text-center space-y-3">
            <Store className="w-10 h-10 text-[#D91B3E] mx-auto" />
            <h3 className="text-lg font-black text-[#2A1D20]">
              {language === 'ar'
                ? 'لا توجد نتائج مطابقة للفلاتر الحالية'
                : 'No Vendors Match Your Active Filters'}
            </h3>
            <p className="text-xs text-gray-600">
              {language === 'ar'
                ? 'جرّب توسيع المحافظة أو إعادة تعيين مستوى التوثيق أو التخصص.'
                : 'Try broadening the governorate filter or resetting verification criteria.'}
            </p>
          </div>
        ) : (
          <div
            data-testid="vendors-directory-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVendors.map((vendor) => {
              const cat = vendorCategories.find((c) => c.slug === vendor.primaryCategorySlug);
              const locNode =
                locationMap.get(vendor.citySlug || vendor.governorateSlug) ||
                locationMap.get(vendor.governorateSlug);

              return (
                <article
                  key={vendor.id}
                  data-testid={`vendor-card-${vendor.slug}`}
                  className="bg-white rounded-3xl border border-rose-100 shadow-md hover:shadow-xl transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 relative bg-[#FDE8ED] overflow-hidden">
                      <SmartImage
                        src={vendor.coverImage}
                        alt={language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
                        fallbackTitle={
                          language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn
                        }
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 start-3 end-3 flex flex-wrap items-center justify-between gap-1.5">
                        <VerificationBadge
                          status={vendor.verificationStatus}
                          language={language}
                          compact
                        />
                        <CommercialPlanBadge
                          planCode={vendor.subscriptionPlanCode}
                          isFeaturedCommercial={vendor.isFeaturedCommercial}
                          language={language}
                        />
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#FDE8ED] text-[#B31331]">
                          {language === 'ar'
                            ? cat?.nameAr || vendor.categoryNameAr || vendor.primaryCategorySlug
                            : cat?.nameEn || vendor.categoryNameEn || vendor.primaryCategorySlug}
                        </span>
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-[#D91B3E] shrink-0" />
                          <span>
                            {language === 'ar'
                              ? locNode?.nameAr || vendor.governorateSlug
                              : locNode?.nameEn || vendor.governorateSlug}
                          </span>
                        </span>
                      </div>

                      <Link to={`/vendors/${vendor.slug}`} className="block group">
                        <h3 className="text-base sm:text-lg font-black text-[#2A1D20] group-hover:text-[#D91B3E] transition line-clamp-2">
                          {language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {language === 'ar' ? vendor.bioAr : vendor.bioEn}
                      </p>

                      {/* Honest Ratings & Verification Proof Row */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <HonestRatingBadge
                          ratingAvg={vendor.ratingAvg}
                          reviewsCount={vendor.reviewsCount}
                          language={language}
                        />
                        <span className="text-[11px] font-semibold text-gray-500">
                          {vendor.yearsExperience}{' '}
                          {language === 'ar' ? 'سنة خبرة' : 'yrs exp.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 block">
                        {language === 'ar' ? 'يبدأ من:' : 'Starting from:'}
                      </span>
                      <strong className="text-sm font-black text-[#D91B3E]">
                        {vendor.startingPriceEgp.toLocaleString()}{' '}
                        {language === 'ar' ? 'ج.م' : 'EGP'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/locations/${vendor.governorateSlug}/${vendor.primaryCategorySlug}`}
                        className="px-2.5 py-2 rounded-xl bg-[#FAF7F2] text-gray-700 hover:text-[#D91B3E] border border-gray-200 text-[11px] font-bold transition"
                        title={language === 'ar' ? 'دليل المنطقة والتخصص' : 'Local Guide'}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/vendors/${vendor.slug}`}
                        data-testid={`vendor-open-${vendor.slug}`}
                        className="px-4 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold shadow hover:opacity-95 transition flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? 'عرض الملف' : 'View Profile'}</span>
                        <ArrowIcon className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Business Registration Modal */}
      <ModalFrame
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        titleId="vendor-register-modal-title"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleRegisterVendor} className="space-y-4">
          <div className="space-y-1">
            <h3 id="vendor-register-modal-title" className="text-lg font-black text-[#2A1D20]">
              {language === 'ar'
                ? 'تسجيل نشاط تجاري جديد في دليل جواز إن'
                : 'Register a New Business in GAWAZ INN'}
            </h3>
            <p className="text-xs text-gray-600">
              {language === 'ar'
                ? 'يبدأ كل نشاط جديد بحالة «مسجل (قيد المراجعة)» وعلى الباقة المجانية، ويمنح الإدارة الأوراق للتحقق من التوثيق.'
                : 'Every new listing starts as Registered (pending document audit) on the Free plan.'}
            </p>
          </div>

          {regError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-[#B31331]">
              {regError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'اسم الشركة / المعرض (عربي):' : 'Business Name (AR):'}
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={regNameAr}
                onChange={(e) => setRegNameAr(e.target.value)}
                data-testid="reg-vendor-name-ar"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'الاسم بالإنجليزية:' : 'Business Name (EN):'}
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={regNameEn}
                onChange={(e) => setRegNameEn(e.target.value)}
                data-testid="reg-vendor-name-en"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'التخصص الأساسي:' : 'Primary Category:'}
              </label>
              <select
                value={regCategory}
                onChange={(e) => setRegCategory(e.target.value)}
                data-testid="reg-vendor-category"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
              >
                {vendorCategories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {language === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'المحافظة الرئيسية:' : 'Governorate / City:'}
              </label>
              <select
                value={regGov}
                onChange={(e) => setRegGov(e.target.value)}
                data-testid="reg-vendor-gov"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
              >
                {regionalOptions.map((loc) => (
                  <option key={loc.id} value={loc.slug}>
                    {language === 'ar' ? loc.nameAr : loc.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'العنوان (عربي):' : 'Address (AR):'}
              </label>
              <input
                type="text"
                required
                minLength={4}
                value={regAddressAr}
                onChange={(e) => setRegAddressAr(e.target.value)}
                data-testid="reg-vendor-address-ar"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'العنوان (إنجليزي):' : 'Address (EN):'}
              </label>
              <input
                type="text"
                required
                minLength={4}
                value={regAddressEn}
                onChange={(e) => setRegAddressEn(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'الهاتف:' : 'Phone:'}
              </label>
              <input
                type="tel"
                required
                minLength={8}
                placeholder="010XXXXXXXX"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                data-testid="reg-vendor-phone"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'الفئة السعرية:' : 'Price Tier:'}
              </label>
              <select
                value={regPriceTier}
                onChange={(e) => setRegPriceTier(e.target.value as VendorPriceTier)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
              >
                <option value="economy">{language === 'ar' ? 'اقتصادي' : 'Economy'}</option>
                <option value="mid">{language === 'ar' ? 'متوسط' : 'Mid-Range'}</option>
                <option value="luxury">{language === 'ar' ? 'فاخر' : 'Luxury'}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'سعر يبدأ من:' : 'Starting EGP:'}
              </label>
              <input
                type="number"
                min={0}
                value={regStartingPrice}
                onChange={(e) => setRegStartingPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'سنوات الخبرة:' : 'Experience:'}
              </label>
              <input
                type="number"
                min={1}
                max={80}
                value={regYearsExp}
                onChange={(e) => setRegYearsExp(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'نبذة عن الخدمات (12 حرف فأكثر):' : 'Bio (AR, min 12 chars):'}
              </label>
              <textarea
                rows={2}
                required
                minLength={12}
                value={regBioAr}
                onChange={(e) => setRegBioAr(e.target.value)}
                data-testid="reg-vendor-bio-ar"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'نبذة بالإنجليزية (12 حرف فأكثر):' : 'Bio (EN, min 12 chars):'}
              </label>
              <textarea
                rows={2}
                required
                minLength={12}
                value={regBioEn}
                onChange={(e) => setRegBioEn(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              {language === 'ar'
                ? 'أوراق التوثيق المتوفرة (افصل بفاصلة ، اختياري):'
                : 'Verification Documents (comma-separated, optional):'}
            </label>
            <input
              type="text"
              placeholder={
                language === 'ar'
                  ? 'سجل تجاري ساري, بطاقة ضريبية'
                  : 'Commercial Registry, Tax Card'
              }
              value={regDocsText}
              onChange={(e) => setRegDocsText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={() => setRegModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={regSubmitting}
              data-testid="reg-vendor-submit-btn"
              className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md disabled:opacity-60 cursor-pointer"
            >
              {regSubmitting
                ? language === 'ar'
                  ? 'جاري التسجيل...'
                  : 'Registering...'
                : language === 'ar'
                  ? 'تسجيل النشاط (الباقة المجانية)'
                  : 'Submit Free Registration'}
            </button>
          </div>
        </form>
      </ModalFrame>
    </div>
  );
};


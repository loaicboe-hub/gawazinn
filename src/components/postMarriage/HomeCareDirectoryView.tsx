import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../services/api';
import type { HomeCareDirectoryPayload, VendorCategory, VendorListing } from '../../types';
import { SmartImage } from '../common/SmartImage';
import {
  CommercialPlanBadge,
  HonestRatingBadge,
  VerificationBadge,
} from '../vendors/VendorBadges';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderHeart,
  MapPin,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';

export const HomeCareDirectoryView: React.FC = () => {
  const { language, dir, vendorCategories, vendors, locations } = useApp();
  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [directoryCategories, setDirectoryCategories] = useState<VendorCategory[]>(() =>
    vendorCategories.filter((c) => c.domain === 'post_marriage'),
  );
  const [directoryVendors, setDirectoryVendors] = useState<VendorListing[]>(() =>
    vendors.filter(
      (v) =>
        v.verificationStatus !== 'rejected' &&
        (v.primaryCategorySlug === 'moving_logistics' ||
          v.primaryCategorySlug === 'home_maintenance' ||
          v.extraCategorySlugs.includes('moving_logistics') ||
          v.extraCategorySlugs.includes('home_maintenance')),
    ),
  );

  useEffect(() => {
    let active = true;
    apiRequest<HomeCareDirectoryPayload>('/home-care/directory')
      .then((payload) => {
        if (!active) return;
        if (payload.categories.length > 0) setDirectoryCategories(payload.categories);
        if (payload.vendors.length > 0) setDirectoryVendors(payload.vendors);
      })
      .catch(() => {
        // Offline context fallback already populated
      });
    return () => {
      active = false;
    };
  }, []);

  const locationMap = useMemo(
    () => new Map(locations.map((loc) => [loc.slug, loc])),
    [locations],
  );

  const visibleVendors = useMemo(() => {
    if (selectedCategory === 'all') return directoryVendors;
    return directoryVendors.filter(
      (v) =>
        v.primaryCategorySlug === selectedCategory ||
        v.extraCategorySlugs.includes(selectedCategory),
    );
  }, [directoryVendors, selectedCategory]);

  return (
    <div className="space-y-8 pb-24">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 lg:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Wrench className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'دليل خدمات ما بعد الزواج ورعاية المنزل في مصر'
                  : 'Post-Marriage Moving, Hoist & Home Maintenance Directory'}
              </span>
            </div>
            <h1 data-testid="home-care-heading" className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === 'ar'
                ? 'شركات نقل العفش والونش والصيانة المنزلية الموثقة'
                : 'Vetted Moving, Hoist Logistics & Preventive Home Care Partners'}
            </h1>
            <p className="text-sm sm:text-base text-rose-100/95 leading-relaxed">
              {language === 'ar'
                ? 'استعرض قوائم الفحص قبل التعاقد مع شركات النقل أو فنيي التكييف والسباكة، وقارن العروض عبر نظام RFQ قبل الدفع.'
                : 'Review Egypt-specific moving & maintenance checklists, inspect verified partner terms, and request sealed quotes cleanly via Multi-Vendor RFQ.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/rfq/new?category=home_maintenance"
              data-testid="homecare-rfq-btn"
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-black text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4" />
              <span>{language === 'ar' ? 'اطلب تسعير صيانة أو نقل' : 'Request Home Care Quote'}</span>
            </Link>
            <Link
              to="/my/home-file"
              data-testid="homecare-homefile-btn"
              className="px-5 py-3 rounded-2xl bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition"
            >
              <FolderHeart className="w-4 h-4" />
              <span>{language === 'ar' ? 'ملف البيت الرقمي' : 'Digital Home File'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Category Buyer Checklists */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {directoryCategories.map((cat) => {
            const checklist = language === 'ar' ? cat.buyerChecklistAr : cat.buyerChecklistEn;
            const isMoving = cat.slug === 'moving_logistics';
            return (
              <div
                key={cat.id}
                data-testid={`homecare-checklist-${cat.slug}`}
                className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#D91B3E]/15 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-red-gradient text-white flex items-center justify-center shrink-0">
                      {isMoving ? <Truck className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                        {language === 'ar' ? cat.nameAr : cat.nameEn}
                      </h2>
                      <p className="text-xs text-gray-600">
                        {language === 'ar' ? cat.summaryAr : cat.summaryEn}
                      </p>
                    </div>
                  </div>
                </div>

                {checklist.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-black text-[#B31331]">
                      {language === 'ar' ? 'قائمة الفحص قبل التعاقد:' : 'Pre-Contract Buyer Checklist:'}
                    </p>
                    <ul className="space-y-1.5">
                      {checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#2A1D20]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                      selectedCategory === cat.slug
                        ? 'bg-[#D91B3E] text-white'
                        : 'bg-white border border-gray-200 text-[#2A1D20] hover:border-[#D91B3E]'
                    }`}
                  >
                    {language === 'ar' ? 'عرض شركاء هذا القسم' : 'Filter These Partners'}
                  </button>
                  <Link
                    to={`/rfq/new?category=${encodeURIComponent(cat.slug)}`}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#D91B3E]/25 text-[#B31331] text-xs font-bold hover:bg-[#FDE8ED] transition"
                  >
                    {language === 'ar' ? 'اطلب عروض أسعار RFQ' : 'Request RFQ'}
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        {/* Filter Pills */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-black text-[#2A1D20]">
              {language === 'ar'
                ? `الشركاء الموثقون للنقل والصيانة (${visibleVendors.length})`
                : `Verified Moving & Home Care Partners (${visibleVendors.length})`}
            </h2>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                data-testid="homecare-filter-all"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                  selectedCategory === 'all'
                    ? 'bg-red-gradient text-white shadow-sm'
                    : 'bg-[#FAF7F2] text-[#2A1D20] border border-gray-200 hover:border-[#D91B3E]'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>
              {directoryCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  data-testid={`homecare-filter-${cat.slug}`}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                    selectedCategory === cat.slug
                      ? 'bg-red-gradient text-white shadow-sm'
                      : 'bg-[#FAF7F2] text-[#2A1D20] border border-gray-200 hover:border-[#D91B3E]'
                  }`}
                >
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </button>
              ))}
            </div>
          </div>

          {visibleVendors.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-500">
              {language === 'ar'
                ? 'لا يوجد شركاء مسجلون في هذا التصنيف حالياً.'
                : 'No active partners found for this filter.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="homecare-vendors-grid">
              {visibleVendors.map((vendor) => {
                const govNode = locationMap.get(vendor.governorateSlug);
                const rfqCategory =
                  vendor.primaryCategorySlug === 'moving_logistics' ||
                  vendor.primaryCategorySlug === 'home_maintenance'
                    ? vendor.primaryCategorySlug
                    : vendor.extraCategorySlugs.find(
                        (s) => s === 'moving_logistics' || s === 'home_maintenance',
                      ) || 'home_maintenance';

                return (
                  <article
                    key={vendor.id}
                    data-testid={`homecare-vendor-${vendor.slug}`}
                    className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 relative overflow-hidden">
                        <SmartImage
                          src={vendor.coverImage}
                          alt={language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
                          fallbackTitle={language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
                          <VerificationBadge status={vendor.verificationStatus} language={language} compact />
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <HonestRatingBadge
                            ratingAvg={vendor.ratingAvg}
                            reviewsCount={vendor.reviewsCount}
                            language={language}
                          />
                          <CommercialPlanBadge
                            planCode={vendor.subscriptionPlanCode}
                            isFeaturedCommercial={vendor.isFeaturedCommercial}
                            language={language}
                          />
                        </div>

                        <div>
                          <h3 className="text-base font-black text-[#2A1D20]">
                            {language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#D91B3E] shrink-0" />
                            <span>
                              {govNode
                                ? language === 'ar'
                                  ? govNode.nameAr
                                  : govNode.nameEn
                                : vendor.governorateSlug}
                            </span>
                            <span>•</span>
                            <strong className="text-[#B31331]">
                              {language === 'ar'
                                ? `يبدأ من ${vendor.startingPriceEgp.toLocaleString()} ج.م`
                                : `From ${vendor.startingPriceEgp.toLocaleString()} EGP`}
                            </strong>
                          </p>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {language === 'ar' ? vendor.bioAr : vendor.bioEn}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/vendors/${vendor.slug}`}
                        className="text-xs font-black text-[#2A1D20] hover:text-[#D91B3E] inline-flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? 'ملف الشريك' : 'Partner Profile'}</span>
                        <ArrowIcon className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/rfq/new?category=${encodeURIComponent(rfqCategory)}&vendorId=${encodeURIComponent(vendor.id)}`}
                        className="px-3.5 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'طلب عرض سعر' : 'Request Quote'}</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};


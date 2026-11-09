import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../services/api';
import { SmartImage } from '../common/SmartImage';
import {
  CommercialPlanBadge,
  HonestRatingBadge,
  VerificationBadge,
} from './VendorBadges';
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Globe,
  MapPin,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Star,
  Store,
  Tag,
} from 'lucide-react';
import type { VendorListing } from '../../types';

export const VendorProfileView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    language,
    dir,
    vendors,
    vendorCategories,
    locations,
    currentUser,
    apiConnected,
    setAuthModalOpen,
    submitVendorReview,
  } = useApp();

  const decodedSlug = slug ? decodeURIComponent(slug) : '';
  const fallbackVendor = useMemo(
    () => vendors.find((v) => v.slug === decodedSlug || v.id === decodedSlug) || null,
    [vendors, decodedSlug],
  );

  const [detailVendor, setDetailVendor] = useState<VendorListing | null>(fallbackVendor);
  const [loading, setLoading] = useState<boolean>(Boolean(apiConnected));
  const [notFound, setNotFound] = useState(false);

  // Review Form State
  const [revRating, setRevRating] = useState<number>(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revError, setRevError] = useState<string | null>(null);
  const [revSuccess, setRevSuccess] = useState(false);

  const BreadcrumbSep = dir === 'rtl' ? ChevronLeft : ChevronRight;

  useEffect(() => {
    let active = true;
    if (!decodedSlug || !apiConnected) {
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const res = await apiRequest<VendorListing>(`/vendors/${encodeURIComponent(decodedSlug)}`);
        if (!active) return;
        setDetailVendor(res);
        setNotFound(false);
        setRevSuccess(false);
        setRevError(null);
      } catch {
        if (!active) return;
        if (fallbackVendor) {
          setDetailVendor(fallbackVendor);
          setNotFound(false);
        } else {
          setDetailVendor(null);
          setNotFound(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [decodedSlug, apiConnected, fallbackVendor]);

  const vendor =
    (detailVendor && (detailVendor.slug === decodedSlug || detailVendor.id === decodedSlug)
      ? detailVendor
      : null) || fallbackVendor;

  const category = useMemo(
    () =>
      vendor
        ? vendorCategories.find((c) => c.slug === vendor.primaryCategorySlug) || null
        : null,
    [vendorCategories, vendor],
  );

  const locationMap = useMemo(
    () => new Map(locations.map((l) => [l.slug, l])),
    [locations],
  );

  if (loading && !vendor) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#FDE8ED] border-t-[#D91B3E] animate-spin" />
        <p className="text-xs font-bold text-[#B31331]">
          {language === 'ar' ? 'جاري تحميل ملف الشريك...' : 'Loading vendor profile...'}
        </p>
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar' ? 'ملف الشريك غير متوفر' : 'Vendor Listing Not Found'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {language === 'ar'
            ? 'قد يكون الرابط غير صحيح أو أن الملف قيد المراجعة.'
            : 'The requested business profile could not be located.'}
        </p>
        <Link
          to="/vendors"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md"
        >
          <span>{language === 'ar' ? 'العودة لدليل الشركاء' : 'Back to Vendors Directory'}</span>
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(currentUser && currentUser.id === vendor.ownerUserId);
  const alreadyReviewed = Boolean(
    currentUser && vendor.reviews?.some((r) => r.authorUserId === currentUser.id),
  );

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setRevError(null);
    setRevSubmitting(true);
    try {
      const res = await submitVendorReview(vendor.slug, {
        rating: revRating,
        title: revTitle.trim(),
        comment: revComment.trim(),
      });
      setDetailVendor(res.vendor);
      setRevTitle('');
      setRevComment('');
      setRevSuccess(true);
    } catch (err) {
      setRevError(
        err instanceof Error
          ? err.message
          : language === 'ar'
            ? 'تعذر نشر التقييم.'
            : 'Failed to submit review.',
      );
    } finally {
      setRevSubmitting(false);
    }
  };

  const services = vendor.services || [];
  const promotions = vendor.promotions || [];
  const reviews = vendor.reviews || [];

  return (
    <div className="space-y-10 pb-24">
      {/* Banner Header */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-12 lg:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-rose-100/90 font-medium"
          >
            <Link to="/" className="hover:text-white transition">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
            <Link to="/vendors" className="hover:text-white transition">
              {language === 'ar' ? 'دليل الشركاء' : 'Vendors Directory'}
            </Link>
            <BreadcrumbSep className="w-3.5 h-3.5 opacity-75" />
            <span className="text-white font-bold">
              {language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <VerificationBadge status={vendor.verificationStatus} language={language} />
                <CommercialPlanBadge
                  planCode={vendor.subscriptionPlanCode}
                  isFeaturedCommercial={vendor.isFeaturedCommercial}
                  language={language}
                />
                <HonestRatingBadge
                  ratingAvg={vendor.ratingAvg}
                  reviewsCount={vendor.reviewsCount}
                  language={language}
                />
              </div>

              <h1
                data-testid="vendor-profile-heading"
                className="text-2xl sm:text-4xl font-black text-white leading-tight"
              >
                {language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
              </h1>

              <p className="text-sm sm:text-base text-rose-100 leading-relaxed max-w-3xl">
                {language === 'ar' ? vendor.bioAr : vendor.bioEn}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-rose-100 pt-1">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <MapPin className="w-4 h-4 text-white shrink-0" />
                  <span>{language === 'ar' ? vendor.addressAr : vendor.addressEn}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Briefcase className="w-4 h-4 text-white shrink-0" />
                  <span>
                    {vendor.yearsExperience} {language === 'ar' ? 'سنة خبرة' : 'Years Exp.'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Eye className="w-4 h-4 text-white shrink-0" />
                  <span>
                    {vendor.profileViews} {language === 'ar' ? 'مشاهدة' : 'Views'}
                  </span>
                </span>
              </div>

              {/* Contact & Portal Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`tel:${vendor.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-white text-[#B31331] text-xs font-black shadow hover:bg-[#FDE8ED] transition flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span dir="ltr">{vendor.phone}</span>
                </a>
                {vendor.whatsapp && (
                  <a
                    href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تواصل واتساب مباشر' : 'WhatsApp Direct'}</span>
                  </a>
                )}
                {vendor.websiteUrl && (
                  <a
                    href={vendor.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'الموقع' : 'Website'}</span>
                  </a>
                )}
                {isOwner && (
                  <Link
                    to={`/vendor?vendorId=${vendor.id}`}
                    data-testid="vendor-manage-portal-btn"
                    className="px-4 py-2.5 rounded-xl bg-[#1C1819] text-white border border-white/20 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Store className="w-3.5 h-3.5 text-rose-300" />
                    <span>{language === 'ar' ? 'إدارة هذا الملف في بوابة الشركاء' : 'Manage in Vendor Portal'}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="h-56 sm:h-64 rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#1C1819]">
                <SmartImage
                  src={vendor.coverImage}
                  alt={language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
                  fallbackTitle={language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Governance & Verification Audit Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#FAF7F2] rounded-3xl p-6 border border-[#D91B3E]/15 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-black text-[#2A1D20] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>
                  {language === 'ar'
                    ? 'تفاصيل التوثيق الإداري وفحص الأوراق'
                    : 'Document Audit & Verification Details'}
                </span>
              </h2>
              <VerificationBadge status={vendor.verificationStatus} language={language} compact />
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {language === 'ar'
                ? 'في جواز إن: شارة التوثيق لا ترتبط بأي اشتراك تجاري مدفوع، وتخضع لمراجعة السجل التجاري والبطاقة الضريبية والتراخيص الهندسية/المهنية عبر فريق الإدارة.'
                : 'GAWAZ INN Governance: Verification status reflects independent administrative review of legal & engineering documents — completely separate from commercial plan spend.'}
            </p>

            {vendor.verificationDocs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {vendor.verificationDocs.map((doc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-bold"
                  >
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{doc}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-white border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'لم تُوثق أوراق رسمية لهذا الحساب بعد (يعمل بحالة مسجل مبدئياً).'
                    : 'No audited official papers recorded yet (listed with Registered baseline status).'}
                </span>
              </div>
            )}

            {vendor.verificationNotes && (
              <p className="text-[11px] font-semibold text-gray-600">
                {language === 'ar' ? 'ملاحظة التدقيق:' : 'Audit Note:'} {vendor.verificationNotes}
              </p>
            )}
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
            <h3 className="text-base font-black text-[#2A1D20] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'نطاق التغطية الجغرافية والتسعير' : 'Service Areas & Pricing Tier'}</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-rose-100">
                <span className="text-[11px] text-gray-500 block">
                  {language === 'ar' ? 'السعر يبدأ من' : 'Starting Price'}
                </span>
                <strong className="text-base font-black text-[#D91B3E]">
                  {vendor.startingPriceEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-rose-100">
                <span className="text-[11px] text-gray-500 block">
                  {language === 'ar' ? 'الباقة التجارية' : 'Commercial Tier'}
                </span>
                <strong className="text-xs font-black text-[#2A1D20]">
                  {language === 'ar'
                    ? vendor.subscriptionPlanNameAr || vendor.subscriptionPlanCode
                    : vendor.subscriptionPlanNameEn || vendor.subscriptionPlanCode}
                </strong>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {vendor.serviceAreas.map((areaSlug) => {
                const node = locationMap.get(areaSlug);
                return (
                  <Link
                    key={areaSlug}
                    to={`/locations/${areaSlug}/${vendor.primaryCategorySlug}`}
                    className="px-3 py-1.5 rounded-xl bg-[#FDE8ED] text-[#B31331] hover:bg-[#D91B3E] hover:text-white text-xs font-bold transition"
                  >
                    {language === 'ar' ? node?.nameAr || areaSlug : node?.nameEn || areaSlug}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Seasonal Promotions */}
        {promotions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#2A1D20] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'العروض والخصومات الموسمية الحالية' : 'Active Seasonal Promotions'}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  data-testid={`vendor-promo-${promo.id}`}
                  className="bg-gradient-to-br from-[#FDE8ED] to-[#FAF7F2] rounded-3xl p-5 border border-[#D91B3E]/25 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#D91B3E] text-white text-xs font-black">
                        -{promo.discountPercent}%
                      </span>
                      <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D91B3E]" />
                        {language === 'ar' ? 'ساري حتى:' : 'Valid until:'} {promo.validUntil}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-[#2A1D20]">
                      {language === 'ar' ? promo.titleAr : promo.titleEn}
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {language === 'ar' ? promo.descriptionAr : promo.descriptionEn}
                    </p>
                  </div>
                  {promo.promoCode && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-dashed border-[#D91B3E] text-xs font-black text-[#B31331] w-fit">
                      <span>{language === 'ar' ? 'كود العرض:' : 'Promo Code:'}</span>
                      <code dir="ltr">{promo.promoCode}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services & Packages Catalog */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#2A1D20]">
            {language === 'ar' ? 'الخدمات والباقات المتاحة' : 'Listed Services & Packages'}
          </h2>
          {services.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-rose-100 text-xs text-gray-600">
              {language === 'ar'
                ? 'تواصل مباشرة مع مقدم الخدمة للاستعلام عن الباقات التفصيلية.'
                : 'Contact this vendor directly for bespoke package quotes.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  data-testid={`vendor-service-${srv.id}`}
                  className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] text-gray-700 border border-gray-200">
                        {language === 'ar' ? srv.unitLabelAr : srv.unitLabelEn}
                      </span>
                      {srv.warrantyMonths > 0 && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {language === 'ar'
                            ? `ضمان ${srv.warrantyMonths} شهر`
                            : `${srv.warrantyMonths}m Warranty`}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-[#2A1D20]">
                      {language === 'ar' ? srv.titleAr : srv.titleEn}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {language === 'ar' ? srv.descriptionAr : srv.descriptionEn}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <strong className="text-base font-black text-[#D91B3E]">
                      {srv.startingPriceEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </strong>
                    {srv.turnaroundDays && (
                      <span className="text-[11px] text-gray-500 font-semibold">
                        ⏱ {srv.turnaroundDays}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Gallery */}
        {vendor.portfolioImages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#2A1D20]">
              {language === 'ar' ? 'معرض سابقة الأعمال' : 'Project Portfolio Gallery'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendor.portfolioImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="h-52 rounded-3xl overflow-hidden border border-rose-100 bg-[#FDE8ED]"
                >
                  <SmartImage
                    src={imgUrl}
                    alt={`${vendor.businessNameEn} portfolio ${idx + 1}`}
                    fallbackTitle={language === 'ar' ? vendor.businessNameAr : vendor.businessNameEn}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buyer Contract Checklist */}
        {category && (
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#D91B3E]/15 space-y-3">
            <h2 className="text-lg font-black text-[#2A1D20]">
              {language === 'ar'
                ? `نصائح وقائمة فحص التعاقد — ${category.nameAr}`
                : `Buyer Verification Checklist — ${category.nameEn}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(language === 'ar' ? category.buyerChecklistAr : category.buyerChecklistEn).map(
                (tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-rose-100 flex items-start gap-2.5 text-xs text-gray-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Authentic Customer Reviews Section */}
        <section
          data-testid="vendor-reviews-section"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-lg space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#2A1D20]">
                {language === 'ar'
                  ? 'تقييمات وتجارب العملاء الحقيقية'
                  : 'Authentic Customer Reviews'}
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                {language === 'ar'
                  ? 'التقييمات مرتبطة بحسابات حقيقية (تقييم واحد لكل حساب ويمنع التقييم الذاتي).'
                  : 'Authentic reviews are bound to verified member accounts (one review per account, self-review blocked).'}
              </p>
            </div>
            <HonestRatingBadge
              ratingAvg={vendor.ratingAvg}
              reviewsCount={vendor.reviewsCount}
              language={language}
            />
          </div>

          {/* Existing Reviews List */}
          {reviews.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-dashed border-gray-300 text-center text-xs text-gray-600">
              {language === 'ar'
                ? 'لا توجد تقييمات عملاء منشورة بعد لهذا النشاط — كن أول من يشارك تجربته الواقعية.'
                : 'No published customer reviews yet — be the first client to share real project feedback.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="vendor-reviews-list">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  data-testid={`vendor-review-${rev.id}`}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-xs text-[#2A1D20] truncate">
                        {rev.authorName}
                      </span>
                      {rev.isVerifiedProject && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {language === 'ar' ? 'مشروع موثق' : 'Verified Client'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#B31331]">{rev.title}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
                </article>
              ))}
            </div>
          )}

          {/* Review Submission Form */}
          <div className="pt-4 border-t border-gray-100">
            {!currentUser ? (
              <div className="p-4 rounded-2xl bg-[#FFF8F9] border border-[#D91B3E]/20 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#2A1D20]">
                  {language === 'ar'
                    ? 'سجّل الدخول لإضافة تقييمك وتجربتك مع هذا الشريك.'
                    : 'Sign in with your account to share an authentic review.'}
                </p>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold shadow cursor-pointer"
                >
                  {language === 'ar' ? 'تسجيل الدخول للتقييم' : 'Sign In to Review'}
                </button>
              </div>
            ) : isOwner ? (
              <div
                data-testid="self-review-blocked-notice"
                className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'تنبيه النزاهة: لا يسمح النظام لصاحب النشاط التجاري بإضافة تقييم لملفه الشخصي.'
                    : 'Integrity Rule: Business owners cannot post customer reviews on their own listing.'}
                </span>
              </div>
            ) : alreadyReviewed || revSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {language === 'ar'
                    ? 'تم نشر تقييمك لهذا الشريك بنجاح. شكراً لمساعدتك العرسان الآخرين!'
                    : 'Your verified review is live and included in the live average rating.'}
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleReviewSubmit}
                data-testid="vendor-review-form"
                className="space-y-3"
              >
                <h3 className="text-sm font-black text-[#2A1D20]">
                  {language === 'ar' ? 'أضف تقييمك وتجربتك الواقعية' : 'Write a Customer Review'}
                </h3>
                {revError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-[#B31331]">
                    {revError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'التقييم (من 5):' : 'Rating (1–5):'}
                    </label>
                    <select
                      value={revRating}
                      onChange={(e) => setRevRating(Number(e.target.value))}
                      data-testid="review-rating-select"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
                    >
                      <option value={5}>5 — {language === 'ar' ? 'ممتاز' : 'Excellent'}</option>
                      <option value={4}>4 — {language === 'ar' ? 'جيد جداً' : 'Very Good'}</option>
                      <option value={3}>3 — {language === 'ar' ? 'جيد' : 'Good'}</option>
                      <option value={2}>2 — {language === 'ar' ? 'مقبول' : 'Fair'}</option>
                      <option value={1}>1 — {language === 'ar' ? 'ضعيف' : 'Poor'}</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'عنوان مختصر للتجربة:' : 'Review Summary Title:'}
                    </label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={120}
                      value={revTitle}
                      onChange={(e) => setRevTitle(e.target.value)}
                      data-testid="review-title-input"
                      placeholder={
                        language === 'ar'
                          ? 'مثال: التزام ممتاز بمواعيد الاستلام الهندسي'
                          : 'e.g. Delivered milestone finishing on schedule'
                      }
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'ar' ? 'تفاصيل التجربة:' : 'Detailed Feedback (min 6 chars):'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    minLength={6}
                    maxLength={1000}
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    data-testid="review-comment-input"
                    placeholder={
                      language === 'ar'
                        ? 'اكتب رأيك في جودة العمل، الشفافية في الأسعار، والالتزام بالعقد...'
                        : 'Share details on craftsmanship quality, pricing transparency, and schedule adherence...'
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={revSubmitting}
                  data-testid="review-submit-btn"
                  className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow hover:opacity-95 disabled:opacity-60 cursor-pointer"
                >
                  {revSubmitting
                    ? language === 'ar'
                      ? 'جاري النشر...'
                      : 'Submitting...'
                    : language === 'ar'
                      ? 'نشر التقييم'
                      : 'Publish Review'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

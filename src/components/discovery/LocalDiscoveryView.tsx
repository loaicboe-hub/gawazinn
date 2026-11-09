import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { estimateFinishingRange } from '../../../shared/catalogMeta';
import {
  MapPin,
  Building2,
  Heart,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Star,
  Calendar,
  BookOpen,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { SmartImage } from '../common/SmartImage';

export const LocalDiscoveryView: React.FC = () => {
  const { govSlug } = useParams<{ govSlug?: string }>();
  const {
    language,
    dir,
    locations,
    weddingServices,
    setSelectedWeddingService,
    setWeddingBookingModalOpen,
  } = useApp();

  const BreadcrumbSep = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const decodedSlug = govSlug ? decodeURIComponent(govSlug) : 'egypt';
  const activeLocation = locations.find((l) => l.slug === decodedSlug);

  if (!activeLocation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] flex items-center justify-center mx-auto">
          <MapPin className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar' ? 'دليل المنطقة غير متوفر' : 'Location Guide Not Found'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'ar'
            ? 'اختر من المحافظات والمدن المصرية المتاحة في دليل جواز إن.'
            : 'Choose from our covered Egyptian governorates and urban districts.'}
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

  const parentLocation = activeLocation.parentId
    ? locations.find((l) => l.id === activeLocation.parentId) || null
    : null;

  const childLocations = locations.filter((l) => l.parentId === activeLocation.id);

  const quickGovernorates = locations.filter(
    (l) => l.level === 'governorate' || l.level === 'city',
  );

  // Match wedding services by explicit governorateSlug or parent governorate slug, or show featured when viewing Egypt root
  const matchedServices =
    activeLocation.level === 'country'
      ? weddingServices.slice(0, 6)
      : weddingServices.filter(
          (srv) =>
            srv.governorateSlug === activeLocation.slug ||
            (parentLocation && srv.governorateSlug === parentLocation.slug) ||
            srv.locationAr.includes(activeLocation.nameAr) ||
            srv.locationEn.toLowerCase().includes(activeLocation.nameEn.toLowerCase()),
        );

  // Transparent comparative finishing sample based on 120 sqm Medium tier scaled by location costFactor
  const baseline120 = estimateFinishingRange(120, 'medium');
  const regionalMin = Math.round(baseline120.min * activeLocation.costFactor);
  const regionalMax = Math.round(baseline120.max * activeLocation.costFactor);

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
                <span className="text-white font-bold">
                  {language === 'ar' ? activeLocation.nameAr : activeLocation.nameEn}
                </span>
              </>
            )}
          </nav>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <MapPin className="w-4 h-4 text-white" />
              <span>
                {language === 'ar' ? 'دليل التكاليف والخدمات المحلية' : 'Regional Costs & Services Guide'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {language === 'ar'
                ? `تجهيز البيت والزفاف في ${activeLocation.nameAr}`
                : `Home Finishing & Wedding Guide — ${activeLocation.nameEn}`}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">
              {language === 'ar' ? activeLocation.summaryAr : activeLocation.summaryEn}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Regional Switcher Bar */}
        <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 border border-[#D91B3E]/15 space-y-3">
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
                to={`/locations/${loc.slug}`}
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

        {/* Regional Cost Indicator + Quick Ecosystem Links */}
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

          {/* Child Districts / Sub-locations */}
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
                    to={`/locations/${child.slug}`}
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

        {/* Regional Wedding Services */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20]">
              {language === 'ar'
                ? `قاعات وخدمات الزفاف في ${activeLocation.nameAr}`
                : `Wedding Venues & Services — ${activeLocation.nameEn}`}
            </h2>
            <Link
              to="/wedding"
              className="text-xs font-bold text-[#D91B3E] hover:underline"
            >
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


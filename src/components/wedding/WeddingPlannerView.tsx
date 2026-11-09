import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  MapPin,
  Star,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Camera,
  Car,
  Sparkles,
  Music,
  Utensils,
  Building2,
  PackageCheck,
  Search,
} from 'lucide-react';
import type { WeddingCategory, WeddingServiceItem } from '../../types';
import { SmartImage } from '../common/SmartImage';

export const WeddingPlannerView: React.FC = () => {
  const {
    language,
    t,
    weddingServices,
    setSelectedWeddingService,
    setWeddingBookingModalOpen,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<WeddingCategory | 'all'>('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState(200000);

  const categories: { key: WeddingCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: t.wedding.categories.all, icon: <Sparkles className="w-4 h-4" /> },
    { key: 'package', label: t.wedding.categories.package, icon: <PackageCheck className="w-4 h-4" /> },
    { key: 'venue', label: t.wedding.categories.venue, icon: <Building2 className="w-4 h-4" /> },
    { key: 'dress', label: t.wedding.categories.dress, icon: <Sparkles className="w-4 h-4" /> },
    { key: 'car', label: t.wedding.categories.car, icon: <Car className="w-4 h-4" /> },
    { key: 'photography', label: t.wedding.categories.photography, icon: <Camera className="w-4 h-4" /> },
    { key: 'beauty', label: t.wedding.categories.beauty, icon: <Sparkles className="w-4 h-4" /> },
    { key: 'decor', label: t.wedding.categories.decor, icon: <Heart className="w-4 h-4" /> },
    { key: 'entertainment', label: t.wedding.categories.entertainment, icon: <Music className="w-4 h-4" /> },
    { key: 'catering', label: t.wedding.categories.catering, icon: <Utensils className="w-4 h-4" /> },
  ];

  const filteredServices = weddingServices.filter((s) => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory;
    const matchesGov =
      selectedGovernorate === 'all' ||
      s.locationAr.includes(selectedGovernorate) ||
      s.locationEn.includes(selectedGovernorate);
    const matchesSearch =
      !searchQuery ||
      (s.nameAr + s.nameEn + s.descriptionAr).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBudget = s.startingPrice <= maxBudget;
    return matchesCat && matchesGov && matchesSearch && matchesBudget;
  });

  const handleBookingClick = (service: WeddingServiceItem) => {
    setSelectedWeddingService(service);
    setWeddingBookingModalOpen(true);
  };

  return (
    <div className="space-y-16 pb-24">
      {/* 1. Header Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Heart className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'القسم الرابع — فرحي | Wedding Planner'
                  : 'Section 04 — Farahi Wedding Planner'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.wedding.title}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">{t.wedding.subtitle}</p>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex items-start gap-3 text-xs text-rose-100 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-rose-200 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{t.wedding.importantNotice}</p>
            </div>

            <div className="pt-1 flex flex-wrap gap-2">
              <Link
                to="/wedding-day"
                data-testid="wedding-to-ops-link"
                className="inline-flex items-center gap-2 text-xs font-bold bg-white text-[#D91B3E] hover:bg-rose-50 px-4 py-2 rounded-xl shadow-sm transition"
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'إدارة الضيوف والطاولات وقائمة الهدايا (يوم الفرح)'
                    : 'Wedding Day Ops: Guests, Seating & Gift Registry'}
                </span>
              </Link>
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl border border-white/20 transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'استعرض القاعات والخدمات حسب محافظات مصر'
                    : 'Explore Venues & Services by Egypt Governorate'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Filter & Search Controls */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute top-3.5 start-3.5" />
              <input
                type="text"
                placeholder={t.common.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
              />
            </div>

            <div>
              <select
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none font-semibold text-gray-700"
              >
                <option value="all">
                  {language === 'ar' ? 'كافة المحافظات والمناطق' : 'All Locations'}
                </option>
                <option value="القاهرة">
                  {language === 'ar' ? 'القاهرة الجديدة والتجمع' : 'New Cairo'}
                </option>
                <option value="الشيخ زايد">
                  {language === 'ar' ? 'الشيخ زايد وأكتوبر' : 'Sheikh Zayed & 6th Oct'}
                </option>
                <option value="الجيزة">
                  {language === 'ar' ? 'الجيزة والمهندسين' : 'Giza & Mohandessin'}
                </option>
                <option value="الإسكندرية">
                  {language === 'ar' ? 'الإسكندرية والساحل' : 'Alexandria'}
                </option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 shrink-0 font-bold">
                {language === 'ar' ? 'الميزانية حتى:' : 'Budget up to:'}
              </span>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-[#D91B3E] cursor-pointer"
              />
              <span className="text-xs font-black text-[#D91B3E] shrink-0">
                {maxBudget.toLocaleString()} {t.groom.egp}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-[#D91B3E] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-gray-700 hover:bg-rose-50'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Wedding Services Cards Grid or Empty State */}
        {filteredServices.length === 0 ? (
          <div className="bg-[#FAF7F2] rounded-3xl p-12 text-center border border-rose-100 space-y-3">
            <Heart className="w-10 h-10 text-[#D91B3E]/40 mx-auto" />
            <p className="text-sm font-bold text-gray-800">
              {language === 'ar'
                ? 'لا توجد خدمات فرح تطابق معايير البحث الحالية'
                : 'No wedding services match your current filters'}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSelectedGovernorate('all');
                setSearchQuery('');
                setMaxBudget(200000);
              }}
              className="text-xs font-bold text-[#D91B3E] underline cursor-pointer"
            >
              {language === 'ar' ? 'إعادة عرض جميع الخدمات' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-3xl overflow-hidden border-2 border-rose-100 hover:border-red-300 shadow-lg hover:shadow-2xl transition flex flex-col justify-between group"
              >
                <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                  <SmartImage
                    src={srv.imageUrl}
                    alt={language === 'ar' ? srv.nameAr : srv.nameEn}
                    fallbackTitle={language === 'ar' ? srv.nameAr : srv.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  <div className="absolute top-3 start-3 bg-[#1C1819]/85 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-rose-200">
                    {t.wedding.categories[srv.category] || srv.category}
                  </div>

                  {srv.badge && (
                    <div className="absolute top-3 end-3 bg-red-gradient text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-md">
                      {srv.badge}
                    </div>
                  )}

                  <div className="absolute bottom-3 start-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>{srv.rating}</span>
                    <span className="text-[10px] text-gray-400">({srv.reviewsCount})</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">
                      {language === 'ar' ? srv.nameAr : srv.nameEn}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-[#D91B3E] shrink-0" />
                      <span>{language === 'ar' ? srv.locationAr : srv.locationEn}</span>
                    </div>

                    {srv.capacity && (
                      <div className="flex items-center gap-1.5 text-xs text-[#D91B3E] font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                        <Users className="w-3.5 h-3.5 text-[#D91B3E] shrink-0" />
                        <span>
                          {t.wedding.capacity} {srv.capacity}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 line-clamp-2 pt-1">
                      {language === 'ar' ? srv.descriptionAr : srv.descriptionEn}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    {(language === 'ar' ? srv.featuresAr : srv.featuresEn)
                      .slice(0, 3)
                      .map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                          <CheckCircle2 className="w-3 h-3 text-[#D91B3E] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 block">
                        {srv.pricingType === 'per_person'
                          ? language === 'ar'
                            ? 'سعر الفرد يبدأ من:'
                            : 'Per Person from:'
                          : language === 'ar'
                          ? 'يبدأ من:'
                          : 'Starting at:'}
                      </span>
                      <div className="text-lg font-black text-[#D91B3E]">
                        {srv.startingPrice.toLocaleString()}{' '}
                        <span className="text-xs font-bold text-[#D91B3E]">{t.groom.egp}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookingClick(srv)}
                      className="bg-red-gradient hover:opacity-95 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-white" />
                      <span>{t.wedding.bookInquiryBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

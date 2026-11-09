import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Briefcase,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MapPin,
  CreditCard,
  Calculator,
  Wallet,
} from 'lucide-react';
import { SmartImage } from '../common/SmartImage';

export const SplashHome: React.FC = () => {
  const { language, dir } = useApp();
  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const cards = [
    {
      id: 'finishing',
      to: '/finishing',
      num: '01',
      titleAr: 'تشطيب الشقة',
      titleEn: 'Apartment Finishing',
      subtitleAr: 'كل تفاصيل شقتك من التشطيب لحد الفرش.',
      subtitleEn: 'From initial renovation to fine interior furnishing.',
      badgeAr: 'التشطيب والديكور',
      badgeEn: 'Finishing & Decor',
      image:
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
      icon: <Building2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />,
    },
    {
      id: 'groom',
      to: '/groom',
      num: '02',
      titleAr: 'جهاز العريس',
      titleEn: "Groom's Essentials",
      subtitleAr: 'كل احتياجات العريس وتجهيز بيته.',
      subtitleEn: 'All groom essentials, appliances & home gear.',
      badgeAr: 'الأجهزة والأثاث',
      badgeEn: 'Appliances & Gear',
      image:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
      icon: <Briefcase className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />,
    },
    {
      id: 'bride',
      to: '/bride',
      num: '03',
      titleAr: 'جهاز العروسة',
      titleEn: "Bride's Essentials",
      subtitleAr: 'كل تفاصيل جهاز العروسة في مكان واحد.',
      subtitleEn: 'Every bridal trousseau detail in one place.',
      badgeAr: 'المفروشات والمطبخ',
      badgeEn: 'Linens & Cookware',
      image:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
      icon: <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />,
    },
    {
      id: 'wedding',
      to: '/wedding',
      num: '04',
      titleAr: 'فرحي',
      titleEn: 'Wedding Planner',
      subtitleAr: 'كل خدمات وتفاصيل ليلة العمر.',
      subtitleEn: 'All services & moments for your dream wedding.',
      badgeAr: 'حفلات الزفاف والقاعات',
      badgeEn: 'Venues & Celebrations',
      image:
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=85',
      icon: <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center bg-white px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
      {/* Intro Heading - Minimal, Joyful & Romantic */}
      <div className="max-w-3xl mx-auto text-center space-y-2 sm:space-y-3 mb-4 sm:mb-8 md:mb-10">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#FDE8ED] border border-[#D91B3E]/20 text-[#D91B3E] text-[10px] sm:text-xs font-bold tracking-wide">
          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#D91B3E] text-[#D91B3E]" />
          <span>
            {language === 'ar' ? 'رحلة الزواج تبدأ من هنا' : 'Your Marriage Journey Begins Here'}
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#2A1D20] tracking-tight leading-tight">
          {language === 'ar' ? (
            <>
              من أول الشقة.. <span className="text-red-gradient">لحد ليلة العمر.</span>
            </>
          ) : (
            <>
              From Apartment Keys.. <span className="text-red-gradient">To Your Dream Wedding.</span>
            </>
          )}
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium max-w-xl mx-auto">
          {language === 'ar'
            ? 'اختر وجهتك من بين الأقسام الأربعة الرئيسية لتجهيز بيتك وفرحتك'
            : 'Select your destination from the four main wedding & home preparation pillars'}
        </p>
      </div>

      {/* The Four Main Visual Cards – Preserved 2x2 Grid on Mobile, Tablet & Desktop */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:gap-7">
          {cards.map((card) => (
            <Link
              key={card.id}
              to={card.to}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              data-testid={`home-card-${card.id}`}
              className="group relative h-48 sm:h-72 md:h-84 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1.5 border border-[#D91B3E]/15 flex flex-col justify-end"
            >
              <SmartImage
                src={card.image}
                alt={language === 'ar' ? card.titleAr : card.titleEn}
                fallbackTitle={language === 'ar' ? card.titleAr : card.titleEn}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Romantic Wine-Red Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A0E15]/95 via-[#3D141F]/60 to-black/20 group-hover:from-[#3D141F] group-hover:via-[#591C2D]/65 transition-all duration-500" />

              {/* Top Accent Badge */}
              <div className="absolute top-2.5 start-2.5 sm:top-5 sm:start-5 flex items-center gap-1.5 sm:gap-2 z-10">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md text-white font-black text-[10px] sm:text-xs flex items-center justify-center border border-white/30">
                  {card.num}
                </span>
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-[#D91B3E]/90 backdrop-blur-md text-white text-[9px] sm:text-xs font-bold shadow-sm">
                  {language === 'ar' ? card.badgeAr : card.badgeEn}
                </span>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 p-2.5 sm:p-5 md:p-8 space-y-1 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <div className="w-6 h-6 sm:w-8 sm:h-9 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-[#D91B3E] transition duration-300 shrink-0">
                    {card.icon}
                  </div>
                  <h2 className="text-sm sm:text-2xl md:text-3xl font-black text-white group-hover:text-[#FDE8ED] transition duration-300 truncate">
                    {language === 'ar' ? card.titleAr : card.titleEn}
                  </h2>
                </div>

                <p className="text-[10px] sm:text-sm text-gray-200/95 font-medium leading-relaxed max-w-md line-clamp-1 sm:line-clamp-2">
                  {language === 'ar' ? card.subtitleAr : card.subtitleEn}
                </p>

                <div className="pt-0.5 sm:pt-2 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-white group-hover:text-[#FDE8ED]">
                  <span className="underline underline-offset-4 decoration-[#D91B3E] group-hover:decoration-white transition">
                    {language === 'ar' ? 'دخول القسم' : 'Explore Section'}
                  </span>
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white/20 group-hover:bg-[#D91B3E] flex items-center justify-center transition-all duration-300">
                    <ArrowIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Clean Ecosystem Discovery Links (Encyclopedia, Governorates, Installments) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
          <Link
            to="/encyclopedia"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#2A1D20] hover:text-[#D91B3E] border border-[#D91B3E]/15 text-xs font-bold transition shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D91B3E]" />
            <span>
              {language === 'ar' ? 'موسوعة التشطيب والتجهيز' : 'Home & Marriage Encyclopedia'}
            </span>
          </Link>

          <Link
            to="/discover"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#2A1D20] hover:text-[#D91B3E] border border-[#D91B3E]/15 text-xs font-bold transition shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D91B3E]" />
            <span>
              {language === 'ar' ? 'دليل المحافظات والأسعار' : 'Discover Egypt Locations'}
            </span>
          </Link>

          <Link
            to="/calculators"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-testid="home-discovery-calculators"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FDE8ED] hover:bg-[#D91B3E] text-[#D91B3E] hover:text-white border border-[#D91B3E]/25 text-xs font-bold transition shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? '20 حاسبة ذكية' : '20 Smart Calculators'}</span>
          </Link>

          <Link
            to="/my/budget"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-testid="home-discovery-budget"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#2A1D20] hover:text-[#D91B3E] border border-[#D91B3E]/15 text-xs font-bold transition shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'مدير ميزانية الزواج' : 'Wedding Budget Manager'}</span>
          </Link>

          <Link
            to="/installments"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#2A1D20] hover:text-[#D91B3E] border border-[#D91B3E]/15 text-xs font-bold transition shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#D91B3E]" />
            <span>{language === 'ar' ? 'حاسبة التقسيط' : 'Installment Calculator'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

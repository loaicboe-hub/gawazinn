import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Briefcase, 
  Sparkles, 
  Heart, 
  ArrowLeft, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const SplashHome: React.FC = () => {
  const { language, dir, setActiveSection } = useApp();
  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const cards = [
    {
      id: 'finishing',
      num: '01',
      titleAr: 'تشطيب الشقة',
      titleEn: 'Apartment Finishing',
      subtitleAr: 'كل تفاصيل شقتك من التشطيب لحد الفرش.',
      subtitleEn: 'From initial renovation to fine interior furnishing.',
      badgeAr: 'التشطيب والديكور',
      badgeEn: 'Finishing & Decor',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
      icon: <Building2 className="w-5 h-5 text-white" />
    },
    {
      id: 'groom',
      num: '02',
      titleAr: 'جهاز العريس',
      titleEn: "Groom's Essentials",
      subtitleAr: 'كل احتياجات العريس وتجهيز بيته.',
      subtitleEn: 'All groom essentials, appliances & home gear.',
      badgeAr: 'الأجهزة والأثاث',
      badgeEn: 'Appliances & Gear',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
      icon: <Briefcase className="w-5 h-5 text-white" />
    },
    {
      id: 'bride',
      num: '03',
      titleAr: 'جهاز العروسة',
      titleEn: "Bride's Essentials",
      subtitleAr: 'كل تفاصيل جهاز العروسة في مكان واحد.',
      subtitleEn: 'Every bridal trousseau detail in one place.',
      badgeAr: 'المفروشات والمطبخ',
      badgeEn: 'Linens & Cookware',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
      icon: <Sparkles className="w-5 h-5 text-white" />
    },
    {
      id: 'wedding',
      num: '04',
      titleAr: 'فرحي',
      titleEn: 'Wedding Planner',
      subtitleAr: 'كل خدمات وتفاصيل ليلة العمر.',
      subtitleEn: 'All services & moments for your dream wedding.',
      badgeAr: 'حفلات الزفاف والقاعات',
      badgeEn: 'Venues & Celebrations',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=85',
      icon: <Heart className="w-5 h-5 text-white" />
    }
  ];

  const handleCardClick = (sectionId: string) => {
    setActiveSection(sectionId as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center bg-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Intro Heading - Minimal, Joyful & Romantic */}
      <div className="max-w-3xl mx-auto text-center space-y-3 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDE8ED] border border-[#D91B3E]/20 text-[#D91B3E] text-xs font-bold tracking-wide">
          <Heart className="w-3.5 h-3.5 fill-[#D91B3E] text-[#D91B3E]" />
          <span>
            {language === 'ar' ? 'رحلة الزواج تبدأ من هنا' : 'Your Marriage Journey Begins Here'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2A1D20] tracking-tight leading-tight">
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

        <p className="text-sm sm:text-base text-gray-600 font-medium max-w-xl mx-auto">
          {language === 'ar'
            ? 'اختر وجهتك من بين الأقسام الأربعة الرئيسية لتجهيز بيتك وفرحتك'
            : 'Select your destination from the four main wedding & home preparation pillars'
          }
        </p>
      </div>

      {/* The Four Main Visual Cards – 2x2 Grid on Desktop, Stacked on Mobile */}
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="group relative h-72 sm:h-84 md:h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1.5 border border-[#D91B3E]/15 flex flex-col justify-end"
            >
              {/* Background Image with Smooth Hover Zoom */}
              <img 
                src={card.image} 
                alt={language === 'ar' ? card.titleAr : card.titleEn}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Romantic Wedding Overlay: Rich dark wine-red gradient fading to clear */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A0E15]/95 via-[#3D141F]/60 to-black/20 group-hover:from-[#3D141F] group-hover:via-[#591C2D]/65 transition-all duration-500"></div>

              {/* Top Accent Badge */}
              <div className="absolute top-5 start-5 flex items-center gap-2 z-10">
                <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white font-black text-xs flex items-center justify-center border border-white/30">
                  {card.num}
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#D91B3E]/90 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                  {language === 'ar' ? card.badgeAr : card.badgeEn}
                </span>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 p-6 sm:p-8 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-[#D91B3E] transition duration-300">
                    {card.icon}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#FDE8ED] transition duration-300">
                    {language === 'ar' ? card.titleAr : card.titleEn}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-gray-200/95 font-medium leading-relaxed max-w-md">
                  {language === 'ar' ? card.subtitleAr : card.subtitleEn}
                </p>

                {/* Explore Pill Button */}
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#FDE8ED]">
                  <span className="underline underline-offset-4 decoration-[#D91B3E] group-hover:decoration-white transition">
                    {language === 'ar' ? 'دخول القسم' : 'Explore Section'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-[#D91B3E] flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                    <ArrowIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

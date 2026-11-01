import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Briefcase, 
  Sparkles, 
  Heart, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Percent,
  CalendarCheck
} from 'lucide-react';

export const FourSectionsGrid: React.FC = () => {
  const { language, t, dir, setActiveSection, setFinishingModalOpen } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const sectionsData = [
    {
      id: 'finishing',
      num: '01',
      title: t.sections.sec1Title,
      subtitle: t.sections.sec1Subtitle,
      actionText: t.sections.sec1Action,
      bgImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
      badge: language === 'ar' ? 'تشطيب هندسي متكامل' : 'Architectural Finishing',
      icon: <Building2 className="w-6 h-6 text-[#DFCA9B]" />,
      highlights: language === 'ar' ? [
        'تشطيب كامل على المفتاح وضمان كتابي',
        'تصميم داخلي وديكور 3D واقعي مجاناً',
        'تأسيس سباكة وكهرباء بأعلى المواصفات',
        'مطابخ خشبية مودرن ودريسنج روم',
        'باقات تناسب جميع الميزانيات مع التقسيط'
      ] : [
        'Turnkey turnkey finishing with written warranty',
        'Complimentary 3D architectural interior design',
        'Certified plumbing & electrical infrastructure',
        'Bespoke modern kitchens & dressing rooms',
        'Packages tailored to any budget with financing'
      ],
      quickStats: language === 'ar' ? 'تبدأ من 3,400 ج.م / م²' : 'From 3,400 EGP / m²',
      secondaryAction: {
        text: language === 'ar' ? 'احسب المقايسة' : 'Instant Quote',
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setFinishingModalOpen(true);
        }
      }
    },
    {
      id: 'groom',
      num: '02',
      title: t.sections.sec2Title,
      subtitle: t.sections.sec2Subtitle,
      actionText: t.sections.sec2Action,
      bgImage: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80',
      badge: language === 'ar' ? 'أجهزة كهربائية وأثاث' : 'Appliances & Furniture',
      icon: <Briefcase className="w-6 h-6 text-[#DFCA9B]" />,
      highlights: language === 'ar' ? [
        'أجهزة كهربائية كبرى (ثلاجات، غسالات، بوتاجازات)',
        'شاشات سمارت 4K وإلكترونيات ترفيهية',
        'غرف نوم ماستر بخشب زان طبيعي متين',
        'ركنات وصالونات ليفينج عصرية مريحة',
        'باقات العريس الجاهزة الموفرة مع خصومات تصل 18%'
      ] : [
        'Major appliances (Fridges, Washers, Cookers)',
        '4K Smart TVs & soundbars',
        'Master bedrooms in solid beech wood',
        'Modern ergonomic living room sectionals',
        'Ready-made groom bundles with up to 18% savings'
      ],
      quickStats: language === 'ar' ? 'ضمان الوكيل الرسمي حتى 10 سنوات' : 'Official Agent Warranty up to 10y',
      secondaryAction: {
        text: language === 'ar' ? 'باقات العريس' : 'Groom Bundles',
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setActiveSection('groom');
        }
      }
    },
    {
      id: 'bride',
      num: '03',
      title: t.sections.sec3Title,
      subtitle: t.sections.sec3Subtitle,
      actionText: t.sections.sec3Action,
      bgImage: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80',
      badge: language === 'ar' ? 'أفخر أطقم المطبخ والمفروشات' : 'Cookware, China & Linens',
      icon: <Sparkles className="w-6 h-6 text-[#DFCA9B]" />,
      highlights: language === 'ar' ? [
        'أطقم حلل جرانيت وتيتانيوم تركي أصلية',
        'أطقم صيني عظمي مذهب 124 قطعة لـ 12 فرد',
        'مفارش سرير وملايات تركي ستان مطرزة بالدانتيل',
        'أطقم برانس ومناشف قطن مصري 100%',
        'عجانات ومحضرات طعام كينوود ومولينكس'
      ] : [
        'Original Turkish titanium granite pot sets',
        '124-piece 24K gold-trimmed royal bone china',
        'Turkish caviar satin bedspreads with French lace',
        '100% Egyptian combed cotton towel & robe sets',
        'Kenwood & Moulinex high-performance stand mixers'
      ],
      quickStats: language === 'ar' ? 'توصيل مغلف وفاخر للمنزل' : 'Padded luxury home delivery',
      secondaryAction: {
        text: language === 'ar' ? 'قائمة جهاز العروسة' : 'Bridal Checklist',
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setActiveSection('bride');
        }
      }
    },
    {
      id: 'wedding',
      num: '04',
      title: t.sections.sec4Title,
      subtitle: t.sections.sec4Subtitle,
      actionText: t.sections.sec4Action,
      bgImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
      badge: language === 'ar' ? 'تنظيم وحجز ليلة العمر' : 'Dream Wedding Planner',
      icon: <Heart className="w-6 h-6 text-[#DFCA9B]" />,
      highlights: language === 'ar' ? [
        'قاعات أفراح فندقية وأماكن أوبن إير ساحرة',
        'فساتين زفاف ملكية بيع وإيجار أول لبسة',
        'سيارات زفاف مرسيدس وليموزين بالسائق وتزيين الورد',
        'تصوير فوتوسيشن وكاميرا سينما ودرونز 4K',
        'زفة شو وفرق استعراضية وكوشة وبوفيهات VIP'
      ] : [
        '5-star ballrooms & enchanting open-air villas',
        'Haute couture bridal gowns (Sale & 1st Rental)',
        'Mercedes-Maybach sedans with floral styling',
        'Cinematic 4K photo sessions, cinema & aerial drone',
        'Zaffa shows, designer Kosha & VIP buffets'
      ],
      quickStats: language === 'ar' ? 'تأكيد التوافر ومتابعة حية' : 'Live Date Coordination',
      secondaryAction: {
        text: language === 'ar' ? 'حجز موعد' : 'Date Inquiry',
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setActiveSection('wedding');
        }
      }
    }
  ];

  return (
    <section className="py-20 bg-[#FAF8F4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#17243A]/10 text-[#17243A] text-xs font-bold uppercase tracking-wider">
            <span>{language === 'ar' ? 'أركان المنصة الأساسية' : 'Platform Pillars'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#17243A] tracking-tight">
            {language === 'ar' ? 'أربعة أقسام كبرى متكاملة تحت علامة واحدة' : 'Four Core Pillars Under One Unified Brand'}
          </h2>

          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar' 
              ? 'صممت كل تجربة بعناية لتغطي متطلباتك كاملة، مع إمكانية التنقل السلس بين الأقسام بحساب عميل واحد وسلة موحدة.' 
              : 'Each section delivers a dedicated bespoke journey for your home and wedding needs, sharing a unified account, cart, and concierge.'
            }
          </p>
        </div>

        {/* 4 Cards Grid - 2x2 on desktop with luxury depth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sectionsData.map((sec) => (
            <div
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id as any);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative rounded-3xl overflow-hidden bg-[#17243A] text-white shadow-xl hover:shadow-2xl hover:shadow-[#C6A66B]/20 transition-all duration-300 transform hover:-translate-y-1.5 border border-[#C6A66B]/30 cursor-pointer flex flex-col justify-between"
            >
              {/* Background Image with Dark Vignette Overlay */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img 
                  src={sec.bgImage} 
                  alt={sec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17243A] via-[#17243A]/60 to-transparent"></div>
                
                {/* Section Number Badge */}
                <div className="absolute top-5 start-5 flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-gold-gradient text-[#17243A] font-black flex items-center justify-center text-sm shadow-lg">
                    {sec.num}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#17243A]/80 backdrop-blur-md text-[#DFCA9B] text-xs font-bold border border-[#C6A66B]/40">
                    {sec.badge}
                  </span>
                </div>

                {/* Quick Pricing / Guarantee Pill */}
                <div className="absolute top-5 end-5 px-3 py-1 rounded-lg bg-[#0D1522]/85 text-xs text-gray-200 border border-white/10 font-semibold backdrop-blur-md">
                  {sec.quickStats}
                </div>

                {/* Card Title on Image Bottom */}
                <div className="absolute bottom-4 start-6 end-6">
                  <div className="flex items-center gap-2 mb-1">
                    {sec.icon}
                    <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#DFCA9B] transition">
                      {sec.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium line-clamp-1">
                    {sec.subtitle}
                  </p>
                </div>
              </div>

              {/* Card Body & Highlights */}
              <div className="p-6 sm:p-7 space-y-5 bg-[#17243A] flex-1 flex flex-col justify-between">
                
                {/* Highlights List */}
                <ul className="space-y-2 text-xs sm:text-sm text-gray-200">
                  {sec.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C6A66B] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons Row */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSection(sec.id as any);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 bg-gold-gradient hover:opacity-95 text-[#17243A] font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>{sec.actionText}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>

                  {sec.secondaryAction && (
                    <button
                      onClick={sec.secondaryAction.onClick}
                      className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl border border-white/20 transition"
                    >
                      {sec.secondaryAction.text}
                    </button>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Gem
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { language, t, dir, setActiveSection, setFinishingModalOpen } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="relative bg-[#17243A] text-white overflow-hidden py-16 md:py-24 border-b border-[#C6A66B]/25">
      {/* Background Subtle Luxury Patterns & Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#C6A66B]/15 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#DFCA9B]/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            
            {/* National Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C6A66B]/15 border border-[#C6A66B]/40 text-[#DFCA9B] text-xs font-semibold backdrop-blur-md">
              <Gem className="w-3.5 h-3.5 text-[#C6A66B]" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Slogan Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              <span className="block text-white">
                {language === 'ar' ? 'من أول الشقة..' : 'From Apartment Keys..'}
              </span>
              <span className="block text-gold-gradient mt-1">
                {language === 'ar' ? 'لحد ليلة العمر.' : 'To Your Dream Wedding.'}
              </span>
            </h1>

            {/* Slogan Description */}
            <p className="text-lg sm:text-xl text-[#FAF8F4]/90 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t.brand.subtagline}
            </p>

            <p className="text-sm text-gray-300 max-w-xl mx-auto lg:mx-0 leading-normal">
              {t.brand.sloganDesc}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => setFinishingModalOpen(true)}
                className="bg-gold-gradient hover:opacity-95 text-[#17243A] font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-xl shadow-[#C6A66B]/25 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Building2 className="w-5 h-5 text-[#17243A]" />
                <span>{t.hero.ctaQuote}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveSection('wedding')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <Heart className="w-5 h-5 text-[#DFCA9B]" />
                <span>{t.hero.ctaWeddingPlanner}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 justify-center lg:justify-start text-xs text-gray-200">
                <ShieldCheck className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <span>{t.hero.feature1}</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start text-xs text-gray-200">
                <CreditCard className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <span>{t.hero.feature2}</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start text-xs text-gray-200">
                <Clock className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <span>{t.hero.feature3}</span>
              </div>
            </div>

          </div>

          {/* Hero Visual Card Matrix (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Golden Glow Border */}
              <div className="rounded-3xl p-1 bg-gradient-to-tr from-[#C6A66B]/40 via-white/20 to-[#C6A66B]/40 shadow-2xl">
                <div className="bg-[#0D1522] rounded-[22px] p-6 space-y-6">
                  
                  {/* Journey Visual Progress */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
                    <span className="font-bold text-[#DFCA9B]">
                      {language === 'ar' ? 'رحلة الزواج المتكاملة في منصة واحدة' : 'Unified Marriage Journey'}
                    </span>
                    <span className="bg-[#C6A66B]/20 text-[#DFCA9B] px-2 py-0.5 rounded text-[10px] font-bold">
                      {language === 'ar' ? '4 أقسام رئيسية' : '4 Pillars'}
                    </span>
                  </div>

                  {/* 4 Steps Showcase Pills */}
                  <div className="space-y-3">
                    <div 
                      onClick={() => setActiveSection('finishing')}
                      className="p-3.5 rounded-xl bg-[#17243A] hover:bg-[#1f304d] border border-white/5 hover:border-[#C6A66B]/50 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#C6A66B]/20 text-[#DFCA9B] flex items-center justify-center font-bold">
                          1
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#DFCA9B] transition">
                            {t.sections.sec1Title}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {language === 'ar' ? 'تصميم داخلي، مقايسة، وتشطيب هندسي' : 'Architectural design & turnkey finishing'}
                          </p>
                        </div>
                      </div>
                      <ArrowIcon className="w-4 h-4 text-gray-400 group-hover:text-[#C6A66B] group-hover:translate-x-1 transition" />
                    </div>

                    <div 
                      onClick={() => setActiveSection('groom')}
                      className="p-3.5 rounded-xl bg-[#17243A] hover:bg-[#1f304d] border border-white/5 hover:border-[#C6A66B]/50 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#C6A66B]/20 text-[#DFCA9B] flex items-center justify-center font-bold">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#DFCA9B] transition">
                            {t.sections.sec2Title}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {language === 'ar' ? 'أجهزة كهربائية، شاشات، وأثاث ماستر' : 'Major appliances, smart TVs & bedroom'}
                          </p>
                        </div>
                      </div>
                      <ArrowIcon className="w-4 h-4 text-gray-400 group-hover:text-[#C6A66B] transition" />
                    </div>

                    <div 
                      onClick={() => setActiveSection('bride')}
                      className="p-3.5 rounded-xl bg-[#17243A] hover:bg-[#1f304d] border border-white/5 hover:border-[#C6A66B]/50 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#C6A66B]/20 text-[#DFCA9B] flex items-center justify-center font-bold">
                          3
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#DFCA9B] transition">
                            {t.sections.sec3Title}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {language === 'ar' ? 'أطقم صيني، حلل جرانيت، ومفروشات تركية' : 'Fine china, granite pots & Turkish linens'}
                          </p>
                        </div>
                      </div>
                      <ArrowIcon className="w-4 h-4 text-gray-400 group-hover:text-[#C6A66B] transition" />
                    </div>

                    <div 
                      onClick={() => setActiveSection('wedding')}
                      className="p-3.5 rounded-xl bg-[#17243A] hover:bg-[#1f304d] border border-white/5 hover:border-[#C6A66B]/50 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gold-gradient text-[#17243A] flex items-center justify-center font-black">
                          4
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#DFCA9B] group-hover:text-white transition">
                            {t.sections.sec4Title}
                          </p>
                          <p className="text-[11px] text-gray-300">
                            {language === 'ar' ? 'قاعات، فساتين، سيارات، وتصوير ليلة العمر' : 'Halls, gowns, vintage cars & photography'}
                          </p>
                        </div>
                      </div>
                      <ArrowIcon className="w-4 h-4 text-[#DFCA9B] group-hover:translate-x-1 transition" />
                    </div>
                  </div>

                  {/* Real Stats counter strip */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                    <div>
                      <p className="text-sm font-black text-white">{t.hero.statsApartments.split(' ')[0]}</p>
                      <p className="text-[10px] text-gray-400">{language === 'ar' ? 'شقة منفذة' : 'Homes'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#DFCA9B]">{t.hero.statsCouples.split(' ')[0]}</p>
                      <p className="text-[10px] text-gray-400">{language === 'ar' ? 'عروسين' : 'Couples'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{t.hero.statsPartners.split(' ')[0]}</p>
                      <p className="text-[10px] text-gray-400">{language === 'ar' ? 'شريك معتمد' : 'Vendors'}</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

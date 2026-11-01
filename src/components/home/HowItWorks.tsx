import React from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, Sliders, Send, Award, ArrowLeft, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { language, t, dir, setActiveSection } = useApp();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const steps = [
    {
      num: '01',
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: <Compass className="w-6 h-6 text-[#17243A]" />
    },
    {
      num: '02',
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: <Sliders className="w-6 h-6 text-[#17243A]" />
    },
    {
      num: '03',
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: <Send className="w-6 h-6 text-[#17243A]" />
    },
    {
      num: '04',
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
      icon: <Award className="w-6 h-6 text-[#17243A]" />
    }
  ];

  return (
    <section className="py-20 bg-white border-y border-[#C6A66B]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6A66B]/15 text-[#8c6e38] text-xs font-bold uppercase">
            <span>{language === 'ar' ? 'رحلة العروسين' : 'Couples Journey'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#17243A] tracking-tight">
            {t.howItWorks.title}
          </h2>

          <p className="text-base text-gray-600">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((st, i) => (
            <div 
              key={i}
              className="bg-[#FAF8F4] p-7 rounded-2xl border border-[#C6A66B]/25 shadow-sm hover:shadow-md transition relative flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shadow-md">
                    {st.icon}
                  </div>
                  <span className="text-3xl font-black text-[#C6A66B]/40 group-hover:text-[#C6A66B] transition font-serif">
                    {st.num}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#17243A] pt-2">
                  {st.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-200/60 flex items-center gap-1 text-xs font-bold text-[#8c6e38]">
                <span>{language === 'ar' ? 'خطوة منظمة ومضمونة' : 'Certified Step'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#17243A] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-[#C6A66B]/40">
          <div className="space-y-1 text-center sm:text-start">
            <h4 className="text-lg sm:text-xl font-bold text-white">
              {language === 'ar' ? 'جاهز لبدء تجهيز شقتك أو فرحك الآن؟' : 'Ready to start your home or wedding preparations?'}
            </h4>
            <p className="text-xs sm:text-sm text-gray-300">
              {language === 'ar' ? 'فريق مستشاري جواز إن جاهز لمساعدتك في حساب التكاليف واختيار الأنسب لك.' : 'Our concierge team is standing by to help estimate budgets and pick optimal packages.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveSection('finishing')}
              className="bg-gold-gradient text-[#17243A] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-2"
            >
              <span>{language === 'ar' ? 'ابدأ بالتشطيب' : 'Start Finishing'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSection('wedding')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition"
            >
              <span>{language === 'ar' ? 'خدمات الفرح' : 'Wedding Services'}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

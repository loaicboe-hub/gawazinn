import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeartHandshake, ShieldCheck, Lock, Gift, Users, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export const SocialSupportBanner: React.FC = () => {
  const { language, t, dir, setActiveSection, setSupportModalOpen, setSponsorModalOpen } = useApp();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 bg-[#FAF8F4] relative border-b border-[#C6A66B]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dignified Banner Container */}
        <div className="rounded-3xl bg-gradient-to-br from-[#17243A] via-[#1f304d] to-[#0D1522] text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border-2 border-[#C6A66B]/40">
          
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C6A66B]/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C6A66B]/20 text-[#DFCA9B] text-xs font-bold border border-[#C6A66B]/40">
                <HeartHandshake className="w-4 h-4 text-[#C6A66B]" />
                <span>{t.socialSupport.badge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {t.socialSupport.title}
              </h2>

              <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-2xl">
                {t.socialSupport.subtitle}
              </p>

              {/* 4 Pillars of Support */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs font-bold text-[#DFCA9B]">{t.socialSupport.categories.apartment}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs font-bold text-[#DFCA9B]">{t.socialSupport.categories.appliances}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs font-bold text-[#DFCA9B]">{t.socialSupport.categories.trousseau}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs font-bold text-[#DFCA9B]">{t.socialSupport.categories.wedding}</p>
                </div>
              </div>

              {/* Strict Confidentiality Guarantee Box */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-[#C6A66B]/30 flex items-center gap-3 text-xs text-gray-300">
                <Lock className="w-5 h-5 text-[#C6A66B] shrink-0" />
                <span>{t.socialSupport.privacyNotice}</span>
              </div>

              {/* Dual Action Buttons (Applicant vs Sponsor) */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setSupportModalOpen(true)}
                  className="bg-gold-gradient hover:opacity-95 text-[#17243A] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-[#17243A]" />
                  <span>{t.socialSupport.applyBtn}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSponsorModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-white/20 transition flex items-center gap-2"
                >
                  <Gift className="w-4 h-4 text-[#DFCA9B]" />
                  <span>{t.socialSupport.sponsorBtn}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('socialSupport');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-gray-300 hover:text-white underline underline-offset-4"
                >
                  {language === 'ar' ? 'معرفة المزيد عن المبادرة وشروط الاستحقاق' : 'Learn more about eligibility & cases'}
                </button>
              </div>

            </div>

            {/* Right Side Visual Emblem / Quote Box (4 cols) */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl p-6 bg-[#17243A]/90 border border-[#C6A66B]/40 space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold-gradient mx-auto flex items-center justify-center text-[#17243A] shadow-xl">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[#DFCA9B] font-bold block uppercase tracking-wider">
                    {language === 'ar' ? 'تكافل مجتمعي بروح العطاء' : 'Community Solidarity'}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {language === 'ar' ? '«من يَسَّرَ على مُعْسِرٍ يَسَّرَ اللَّهُ عليه في الدنيا والآخرة»' : '"Whoever relieves a believer of distress, God relieves him in this world & the next"'}
                  </h3>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {language === 'ar' 
                    ? 'كل مساهمة تقدمها الشركات ورجال الأعمال توجه بالكامل وبأمانة لتجهيز شقق الأيتام وتوفير الأجهزة الأساسية بكرامة تامة.'
                    : 'All corporate and philanthropic pledges are strictly allocated to equip eligible orphan couples with complete dignity.'
                  }
                </p>

                <div className="pt-3 border-t border-white/10 text-[11px] text-[#DFCA9B] font-semibold">
                  {language === 'ar' ? 'فحص ميداني مستقل • حماية الخصوصية 100%' : 'Confidential Vetting • 100% Privacy Protected'}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

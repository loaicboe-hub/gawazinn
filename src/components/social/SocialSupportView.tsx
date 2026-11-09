import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  Lock,
  Users,
  Gift,
  FileCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Home,
  Heart,
} from 'lucide-react';

export const SocialSupportView: React.FC = () => {
  const { 
    language, 
    t, 
    dir, 
    setSupportModalOpen, 
    setSponsorModalOpen 
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const eligibilityCriteria = language === 'ar' ? [
    'أن يكون المتقدم/المتقدمة من الأيتام أو من الأسر الأكثر احتياجاً المثبتة ببحث اجتماعي.',
    'وجود عقد إيجار أو ملكية لوحدة سكنية مجهزة للتجهيز الأساسي.',
    'تقديم وثيقة عقد قران رسمي (كتب كتاب) أو موعد زفاف محدد رسمياً.',
    'الخضوع للبحث الميداني السري المستقل من باحثي المبادرة.',
    'عدم استفادة الحالة مسبقاً من دعم مماثل لنفس التجهيزات.'
  ] : [
    'Applicant must be an orphan or from a verified low-income family with social research documentation.',
    'Proof of apartment lease or ownership ready for essential preparations.',
    'Official marriage certificate or registered upcoming wedding date.',
    'Confidential and independent field social research assessment.',
    'No prior duplicate support received for the same essentials.'
  ];

  return (
    <div className="space-y-16 pb-24">
      
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <HeartHandshake className="w-4 h-4 text-white" />
              <span>{t.socialSupport.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.socialSupport.title}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">
              {t.socialSupport.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setSupportModalOpen(true)}
                className="bg-white hover:bg-rose-50 text-[#9E122C] font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-[#9E122C]" />
                <span>{t.socialSupport.applyBtn}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSponsorModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-6 py-3.5 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <Gift className="w-4 h-4 text-rose-200" />
                <span>{t.socialSupport.sponsorBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Strict Confidentiality Guarantee Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white border-2 border-red-500/20 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-red-gradient flex items-center justify-center text-white shrink-0 shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1 text-center sm:text-start">
            <h3 className="text-lg font-bold text-rose-200">
              {language === 'ar' ? 'عهد السرية والكرامة الإنسانية' : 'Dignity & Absolute Privacy Covenant'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {t.socialSupport.privacyNotice}
            </p>
          </div>
        </div>

        {/* 4 Support Pillars */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              {language === 'ar' ? 'مجالات الدعم المتاحة في المبادرة' : 'Initiative Support Categories'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'ar' ? 'نقدم العون المباشر العيني والهندسي لتجهيز منازل المستحقين' : 'Direct in-kind, appliances, and essential finishing assistance'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D91B3E] flex items-center justify-center font-bold">
                <Home className="w-6 h-6 text-[#D91B3E]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{t.socialSupport.categories.apartment}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'ar' ? 'تأسيس السباكة والكهرباء الأساسية والدهانات للوحدات غير المجهزة.' : 'Basic plumbing, electrical wiring and painting for unfinished apartments.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D91B3E] flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6 text-[#D91B3E]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{t.socialSupport.categories.appliances}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'ar' ? 'توفير ثلاجة، غسالة، بوتاجاز، وسرير ودولاب من تبرعات الشركات والمصنعين.' : 'Providing refrigerator, washer, stove, bed and wardrobe from corporate donations.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D91B3E] flex items-center justify-center font-bold">
                <FileCheck className="w-6 h-6 text-[#D91B3E]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{t.socialSupport.categories.trousseau}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'ar' ? 'أطقم حلل الطهي، أدوات المائدة الأساسية، والمفروشات والمناشف القطنية.' : 'Basic cookware, dinnerware, blankets, and bed linens.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D91B3E] flex items-center justify-center font-bold">
                <Heart className="w-6 h-6 text-[#D91B3E]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{t.socialSupport.categories.wedding}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'ar' ? 'المساهمة في حجز قاعة متواضعة أو فستان زفاف مجاني لليلة العمر.' : 'Assisting with modest venue booking or complimentary wedding gown rental.'}
              </p>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-rose-100 shadow-xl space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#D91B3E] uppercase tracking-wider block">
              {language === 'ar' ? 'المعايير المحددة' : 'Eligibility Rules'}
            </span>
            <h3 className="text-2xl font-black text-gray-900">
              {language === 'ar' ? 'شروط وضوابط استحقاق الدعم' : 'Assistance Eligibility Criteria'}
            </h3>
          </div>

          <ul className="space-y-3">
            {eligibilityCriteria.map((crit, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-[#D91B3E] shrink-0 mt-0.5" />
                <span>{crit}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-gray-500">
              {language === 'ar' ? 'المستندات المطلوبة: بطاقة الرقم القومي، شهادة الوفاة للوالدين (للأيتام)، عقد القران، وبحث اجتماعي.' : 'Required docs: National ID, parent death certificate (orphans), marriage deed, and social inquiry.'}
            </span>

            <button
              onClick={() => setSupportModalOpen(true)}
              className="bg-red-gradient text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md hover:opacity-95 transition"
            >
              {t.socialSupport.applyBtn}
            </button>
          </div>
        </div>

        {/* Philanthropic Business Sponsorship Section */}
        <div className="rounded-3xl bg-gradient-to-br from-[#800C22] to-[#590717] text-white p-8 sm:p-12 shadow-xl border border-white/20 space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-rose-200 uppercase tracking-wider block">
              {t.socialSupport.sponsorTitle}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'ar' ? 'كن شريكاً في ستر وتيسير زواج أبنائنا وبناتنا' : 'Partner with Us to Equip Young Couples with Dignity'}
            </h3>
            <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
              {t.socialSupport.sponsorDesc}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setSponsorModalOpen(true)}
              className="bg-white hover:bg-rose-50 text-[#9E122C] font-bold text-sm py-3.5 px-6 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Gift className="w-4 h-4 text-[#9E122C]" />
              <span>{t.socialSupport.sponsorBtn}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

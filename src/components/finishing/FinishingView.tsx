import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Calculator, 
  CheckCircle2, 
  Compass, 
  Zap, 
  Palette, 
  LayoutGrid, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  FileCheck,
  SplitSquareVertical,
  Sliders,
  Sparkles
} from 'lucide-react';
import { liveFinishingProjects } from '../../data/initialData';
import { FinishingTier } from '../../types';

export const FinishingView: React.FC = () => {
  const { 
    language, 
    t, 
    dir, 
    finishingPackages, 
    finishingServices, 
    setFinishingModalOpen,
    setActiveSection
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  // Interactive Calculator State
  const [calcArea, setCalcArea] = useState(120);
  const [calcRooms, setCalcRooms] = useState(3);
  const [calcBaths, setCalcBaths] = useState(2);
  const [selectedTier, setSelectedTier] = useState<FinishingTier>('luxury');
  
  // Before & After Project Toggle State
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [showAfterView, setShowAfterView] = useState(true);

  // Calculate Cost
  const activePackage = finishingPackages.find(p => p.tier === selectedTier) || finishingPackages[0];
  const ratePerMeter = activePackage.pricePerMeter;
  const estimatedTotal = calcArea * ratePerMeter;

  const handleOpenQuotation = () => {
    setFinishingModalOpen(true);
  };

  const currentProject = liveFinishingProjects[activeProjectIdx];

  return (
    <div className="space-y-20 pb-24">
      
      {/* 1. Finishing Hero Section */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-16 lg:py-24 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Building2 className="w-4 h-4 text-white" />
              <span>{language === 'ar' ? 'القسم الأول — تشطيب الشقة' : 'Section 01 — Apartment Finishing'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.finishing.title}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">
              {t.finishing.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleOpenQuotation}
                className="bg-white hover:bg-rose-50 text-[#9E122C] font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Calculator className="w-4 h-4 text-[#9E122C]" />
                <span>{t.finishing.requestQuoteBtn}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('finishing-calculator');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3.5 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <Sliders className="w-4 h-4 text-rose-200" />
                <span>{language === 'ar' ? 'حاسبة التكلفة التقديرية' : 'Estimate Calculator'}</span>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <span>{language === 'ar' ? 'عقد ملزم معتمد' : 'Binding Legal Contract'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <span>{language === 'ar' ? 'التزام صارم بالموعد' : 'Strict On-Time Delivery'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <span>{language === 'ar' ? 'ضمان كتابي 24 شهراً' : '24-Month Written Warranty'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C6A66B] shrink-0" />
                <span>{language === 'ar' ? 'تصميم 3D مجاني' : 'Free 3D Architectural Mockup'}</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* 2. Interactive Finishing Calculator */}
        <div id="finishing-calculator" className="scroll-mt-28">
          <div className="rounded-3xl p-1 bg-gradient-to-tr from-rose-200 via-white to-red-100 shadow-2xl">
            <div className="bg-white rounded-[22px] p-6 sm:p-10 text-gray-900">
              
              <div className="max-w-2xl mx-auto text-center space-y-2 mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 text-[#D91B3E] text-xs font-bold border border-red-100">
                  <Calculator className="w-3.5 h-3.5 text-[#D91B3E]" />
                  <span>{t.finishing.calculatorTitle}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {language === 'ar' ? 'احسب تكلفة تشطيب شقتك بالجنيه المصري فوراً' : 'Instant Apartment Finishing Cost Estimator'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t.finishing.calculatorDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Inputs (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Area Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-bold text-gray-900">{t.finishing.areaLabel}</label>
                      <span className="text-lg font-black text-[#D91B3E] bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                        {calcArea} م²
                      </span>
                    </div>
                    <input 
                      type="range"
                      min={60}
                      max={350}
                      step={5}
                      value={calcArea}
                      onChange={(e) => setCalcArea(Number(e.target.value))}
                      className="w-full accent-[#D91B3E] cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>60 م² (استوديو/شقة صغيرة)</span>
                      <span>350 م² (دوبلكس/فيلا)</span>
                    </div>
                  </div>

                  {/* Rooms & Baths */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">{t.finishing.roomsLabel}</label>
                      <select
                        value={calcRooms}
                        onChange={(e) => setCalcRooms(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#D91B3E] outline-none"
                      >
                        <option value={1}>1 غرفة</option>
                        <option value={2}>2 غرف نوم</option>
                        <option value={3}>3 غرف نوم</option>
                        <option value={4}>4 غرف نوم</option>
                        <option value={5}>5 غرف فأكثر</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">{t.finishing.bathsLabel}</label>
                      <select
                        value={calcBaths}
                        onChange={(e) => setCalcBaths(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#D91B3E] outline-none"
                      >
                        <option value={1}>حمام واحد</option>
                        <option value={2}>2 حمام</option>
                        <option value={3}>3 حمامات</option>
                        <option value={4}>4 حمامات فأكثر</option>
                      </select>
                    </div>
                  </div>

                  {/* Finishing Tier Radio Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">
                      {t.finishing.tierLabel}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {finishingPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedTier(pkg.tier)}
                          className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                            selectedTier === pkg.tier
                              ? 'border-[#D91B3E] bg-rose-50/50 shadow-md ring-1 ring-[#D91B3E]'
                              : 'border-gray-200 hover:border-rose-200 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-gray-900">{language === 'ar' ? pkg.nameAr : pkg.nameEn}</span>
                              {pkg.badge && (
                                <span className="text-[9px] bg-[#D91B3E] text-white px-1.5 py-0.5 rounded font-black">
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-black text-[#D91B3E] block mt-1">
                              {pkg.pricePerMeter.toLocaleString()} ج.م / م²
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 mt-2 line-clamp-2">
                            {language === 'ar' ? pkg.descriptionAr : pkg.descriptionEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Calculation Result Summary Box (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white p-7 rounded-2xl space-y-6 shadow-xl border border-rose-900/30">
                  <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                    <span className="text-xs text-rose-200 font-bold">ملخص المقايسة التقديرية</span>
                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded font-semibold text-gray-200">
                      {calcArea} م² • {calcRooms} غرف
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-gray-300 block">{t.finishing.estimatedTotal}</span>
                    <div className="text-3xl sm:text-4xl font-black text-[#FF4D6D]">
                      {estimatedTotal.toLocaleString()} <span className="text-sm text-gray-300">{t.groom.egp}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {language === 'ar' 
                        ? '* يشمل كافة الخامات المعتمدة، المصنعيات، والتصميم والإشراف المعماري حتى استلام المفتاح.' 
                        : '* Comprehensive price includes certified materials, labor, 3D design and engineering supervision.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                    <div className="flex justify-between text-gray-300">
                      <span>الباقة المختارة:</span>
                      <strong className="text-rose-300">{language === 'ar' ? activePackage.nameAr : activePackage.nameEn}</strong>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>سعر المتر:</span>
                      <span>{ratePerMeter.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>تقسيط متاح حتى:</span>
                      <strong className="text-emerald-400">36 شهراً</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenQuotation}
                    className="w-full bg-red-gradient hover:opacity-95 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>{t.finishing.submitQuote}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>

                  <p className="text-[10px] text-gray-400 text-center">
                    {language === 'ar' ? 'معاينة مجانية للشقة وتحديد المقايسة الدقيقة خلال 48 ساعة' : 'Free apartment inspection & precise measurement within 48h'}
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* 3. Detailed Finishing Packages Cards */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-3xl font-black text-gray-900">
              {language === 'ar' ? 'باقات التشطيب المتكاملة بمواصفات معتمدة' : 'Certified Turnkey Finishing Packages'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'ar' ? 'اختر الباقة المناسبة لميزانيتك واطلع على بنود ومواصفات كل باقة بكل شفافية' : 'Explore clear line-item specifications and warranties for each package'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {finishingPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="bg-white rounded-3xl p-7 border-2 border-rose-100 hover:border-red-300 shadow-lg hover:shadow-xl transition flex flex-col justify-between space-y-6 relative group"
              >
                {pkg.badge && (
                  <span className="absolute -top-3.5 start-6 bg-red-gradient text-white font-black text-xs px-3.5 py-1 rounded-full shadow-md">
                    {pkg.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-gray-900">
                      {language === 'ar' ? pkg.nameAr : pkg.nameEn}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ar' ? pkg.descriptionAr : pkg.descriptionEn}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100">
                    <span className="text-xs text-gray-500 block">{language === 'ar' ? 'السعر للمتر المربع' : 'Price per sqm'}</span>
                    <div className="text-2xl font-black text-[#D91B3E]">
                      {pkg.pricePerMeter.toLocaleString()} <span className="text-xs font-bold text-[#D91B3E]">ج.م / م²</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold text-gray-700 block">
                      {language === 'ar' ? 'أبرز مواصفات الباقة:' : 'Package Specifications:'}
                    </span>
                    <ul className="space-y-2 text-xs text-gray-600">
                      {(language === 'ar' ? pkg.featuresAr : pkg.featuresEn).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D91B3E] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-[11px] text-[#D91B3E] font-bold">
                    <span>{language === 'ar' ? 'مناسبة لـ: ' : 'Recommended for: '}</span>
                    <span className="text-gray-700">{language === 'ar' ? pkg.recommendedForAr : pkg.recommendedForEn}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTier(pkg.tier);
                      handleOpenQuotation();
                    }}
                    className="w-full bg-[#D91B3E] hover:bg-[#B31331] text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>{language === 'ar' ? 'طلب معاينة بهذه الباقة' : 'Choose This Package'}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* 4. Live Projects Before & After Showcase */}
        <div className="bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-rose-900/30 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs text-rose-200 font-bold uppercase tracking-wider block">
                {t.finishing.galleryTitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {currentProject ? (language === 'ar' ? currentProject.titleAr : currentProject.titleEn) : ''}
              </h3>
            </div>

            {/* Project Selection Tabs */}
            <div className="flex flex-wrap gap-2">
              {liveFinishingProjects.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProjectIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeProjectIdx === idx
                      ? 'bg-[#D91B3E] text-white shadow-md'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {language === 'ar' ? p.titleAr.split('—')[1] || p.titleAr : p.titleEn.split('—')[0]}
                </button>
              ))}
            </div>
          </div>

          {currentProject && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Interactive Image Showcase (8 cols) */}
              <div className="lg:col-span-8 space-y-3">
                <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                  <img 
                    src={showAfterView ? currentProject.afterImage : currentProject.beforeImage} 
                    alt="Project Showcase"
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 start-4 bg-[#1C1819]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-rose-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D91B3E]" />
                    <span>{showAfterView ? (language === 'ar' ? 'بعد التشطيب والتسليم الفعلي' : 'After Key Handover') : (language === 'ar' ? 'قبل التشطيب (طوب أحمر)' : 'Before Finishing (Raw Brick)')}</span>
                  </div>

                  {/* Toggle Button Overlay */}
                  <div className="absolute bottom-4 start-4 end-4 flex justify-center">
                    <div className="bg-[#1C1819]/95 p-1 rounded-xl border border-white/20 shadow-xl flex items-center gap-1">
                      <button
                        onClick={() => setShowAfterView(false)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                          !showAfterView ? 'bg-[#D91B3E] text-white shadow' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {language === 'ar' ? 'قبل التشطيب' : 'Before'}
                      </button>
                      <button
                        onClick={() => setShowAfterView(true)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                          showAfterView ? 'bg-[#D91B3E] text-white shadow' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {language === 'ar' ? 'بعد التسليم' : 'After'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Specs (4 cols) */}
              <div className="lg:col-span-4 space-y-5">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-xs border-b border-white/10 pb-3">
                    <span className="text-gray-400">{language === 'ar' ? 'المساحة الإجمالية:' : 'Total Area:'}</span>
                    <strong className="text-white text-sm">{currentProject.area}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-white/10 pb-3">
                    <span className="text-gray-400">{language === 'ar' ? 'المستوى المنفذ:' : 'Finishing Tier:'}</span>
                    <strong className="text-rose-300">{language === 'ar' ? currentProject.tierAr : currentProject.tierEn}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-white/10 pb-3">
                    <span className="text-gray-400">{language === 'ar' ? 'مدة التنفيذ القياسية:' : 'Duration:'}</span>
                    <strong className="text-emerald-400">{language === 'ar' ? currentProject.durationAr : currentProject.durationEn}</strong>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pt-1">
                    {language === 'ar' ? currentProject.descriptionAr : currentProject.descriptionEn}
                  </p>
                </div>

                <button
                  onClick={handleOpenQuotation}
                  className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>{language === 'ar' ? 'طلب تشطيب شقتي بنفس المستوى' : 'Request Similar Finishing'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* 5. Specialized Trades Catalog */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              {t.finishing.servicesCatalog}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'ar' ? 'نوفر أيضاً إمكانية تنفيذ مراحل منفصلة حسب حاجة العميل' : 'Specialized engineering trades available on-demand'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {finishingServices.map((serv) => (
              <div 
                key={serv.id}
                className="bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-md hover:shadow-xl transition group flex flex-col justify-between"
              >
                <div className="h-44 w-full overflow-hidden relative">
                  <img 
                    src={serv.imageUrl} 
                    alt={serv.titleAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 end-3 bg-[#1C1819]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-200">
                    {serv.durationDays}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-gray-900">
                      {language === 'ar' ? serv.titleAr : serv.titleEn}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {language === 'ar' ? serv.descriptionAr : serv.descriptionEn}
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-gray-600 border-t border-gray-100 pt-3">
                    {(language === 'ar' ? serv.includedItemsAr : serv.includedItemsEn).slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#D91B3E] shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleOpenQuotation}
                    className="w-full mt-3 bg-rose-50 hover:bg-[#D91B3E] text-[#D91B3E] hover:text-white font-bold text-xs py-2 rounded-xl border border-rose-200 transition"
                  >
                    {language === 'ar' ? 'طلب استشارة في هذا البند' : 'Request Consultation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Search,
  Layers,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Clock,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { SmartImage } from '../common/SmartImage';
import type { FinishingEncyclopediaCategory, FinishingMaterialItem } from '../../types';

type ActiveTab = 'steps' | 'materials' | 'contractors';
type PhaseFilter = 'all' | FinishingEncyclopediaCategory['phaseKey'];
type MaterialGroupFilter = 'all' | FinishingMaterialItem['materialGroup'];

const PHASE_LABELS: { key: PhaseFilter; ar: string; en: string }[] = [
  { key: 'all', ar: 'جميع المراحل (22)', en: 'All 22 Stages' },
  { key: 'planning', ar: '1. التخطيط والمباني', en: '1. Planning & Masonry' },
  { key: 'rough_in', ar: '2. التأسيس (سباكة/كهرباء/عزل)', en: '2. MEP & Waterproofing' },
  { key: 'surfaces', ar: '3. المحارة والشبابيك', en: '3. Plaster & Windows' },
  { key: 'fit_out', ar: '4. البلاط والدهانات والمطابخ', en: '4. Flooring, Paint & Joinery' },
  { key: 'handover', ar: '5. الفحص النهائي والاستلام', en: '5. Snagging & Handover' },
];

const MATERIAL_GROUPS: { key: MaterialGroupFilter; ar: string; en: string }[] = [
  { key: 'all', ar: 'كل الخامات', en: 'All Materials' },
  { key: 'flooring', ar: 'الأرضيات (سيراميك/بورسلين/HDF)', en: 'Flooring (Ceramic/Porcelain/HDF)' },
  { key: 'plumbing', ar: 'مواسير السباكة', en: 'Plumbing PP-R' },
  { key: 'electrical', ar: 'الأسلاك واللوحات', en: 'Electrical Wiring' },
  { key: 'paint', ar: 'الدهانات', en: 'Paints & Coatings' },
  { key: 'gypsum', ar: 'الجبسن بورد', en: 'Gypsum Boards' },
  { key: 'countertop', ar: 'رخام وجرانيت وكوارتز', en: 'Countertops' },
  { key: 'windows', ar: 'شبابيك UPVC وألوميتال', en: 'Windows & Glazing' },
  { key: 'waterproofing', ar: 'العزل المائي', en: 'Waterproofing' },
];

const GOV_LABELS: Record<string, { ar: string; en: string }> = {
  all: { ar: 'كل المحافظات', en: 'All Governorates' },
  cairo: { ar: 'القاهرة', en: 'Cairo' },
  giza: { ar: 'الجيزة', en: 'Giza' },
  alexandria: { ar: 'الإسكندرية', en: 'Alexandria' },
  dakahlia: { ar: 'الدقهلية', en: 'Dakahlia' },
  gharbia: { ar: 'الغربية', en: 'Gharbia' },
};

export const FinishingEncyclopediaView: React.FC = () => {
  const { pathname } = useLocation();
  const {
    language,
    dir,
    finishingCategories,
    finishingMaterials,
    contractors,
    setFinishingPrefill,
    setFinishingModalOpen,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const activeTab: ActiveTab = pathname.includes('/finishing/materials')
    ? 'materials'
    : pathname.includes('/finishing/contractors')
    ? 'contractors'
    : 'steps';

  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStepId, setExpandedStepId] = useState<string>('fin-cat-01');

  const [materialGroup, setMaterialGroup] = useState<MaterialGroupFilter>('all');
  const [contractorGov, setContractorGov] = useState<string>('all');
  const [contractorSpecialty, setContractorSpecialty] = useState<string>('all');

  const filteredSteps = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return finishingCategories.filter((cat) => {
      if (phaseFilter !== 'all' && cat.phaseKey !== phaseFilter) return false;
      if (!q) return true;
      return `${cat.nameAr} ${cat.nameEn} ${cat.summaryAr} ${cat.summaryEn}`.toLowerCase().includes(q);
    });
  }, [finishingCategories, phaseFilter, searchTerm]);

  const filteredMaterials = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return finishingMaterials.filter((mat) => {
      if (materialGroup !== 'all' && mat.materialGroup !== materialGroup) return false;
      if (!q) return true;
      return `${mat.nameAr} ${mat.nameEn} ${mat.summaryAr} ${mat.summaryEn}`.toLowerCase().includes(q);
    });
  }, [finishingMaterials, materialGroup, searchTerm]);

  const filteredContractors = useMemo(() => {
    return contractors.filter((c) => {
      if (contractorGov !== 'all' && !c.governoratesCovered.includes(contractorGov)) return false;
      if (contractorSpecialty !== 'all' && c.specialtyGroup !== contractorSpecialty) return false;
      return true;
    });
  }, [contractors, contractorGov, contractorSpecialty]);

  const openConsultationModal = (prefillNotes: string, govSlug?: string) => {
    const govLabel = govSlug && GOV_LABELS[govSlug] ? (language === 'ar' ? GOV_LABELS[govSlug].ar : GOV_LABELS[govSlug].en) : undefined;
    setFinishingPrefill({
      areaSqm: 120,
      roomsCount: 3,
      bathroomsCount: 2,
      finishingTier: 'luxury',
      governorate: govLabel,
      notes: prefillNotes,
    });
    setFinishingModalOpen(true);
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Consistent GAWAZ INN Wine-Red Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Building2 className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'موسوعة تشطيب الشقق والهندسة — مصر'
                  : 'Complete Apartment Finishing Knowledge Hub'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {activeTab === 'steps'
                ? language === 'ar'
                  ? 'دليل الـ 22 مرحلة لتشطيب شقتك بالمعايير الهندسية'
                  : '22-Step Engineering Finishing Playbook'
                : activeTab === 'materials'
                ? language === 'ar'
                  ? 'موسوعة خامات التشطيب وأسعارها التقديرية'
                  : 'Finishing Materials Specs & EGP Price Index'
                : language === 'ar'
                ? 'دليل المقاولين والمهندسين والورش المعتمدين'
                : 'Verified Finishing Contractors & Architects Directory'}
            </h1>

            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'مواصفات فنية دقيقة، أخطاء شائعة يجب تفاديها، قوائم استلام هندسية، ومتوسطات أسعار محدثة بمصر.'
                : 'Actionable Egyptian technical specs, common errors to avoid, inspection checklists, and transparent directory profiles.'}
            </p>
          </div>

          {/* Sub-navigation Tabs matching Brand Red/White */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              to="/finishing/encyclopedia"
              data-testid="fin-tab-steps"
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'steps'
                  ? 'bg-white text-[#9E122C] shadow-lg'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{language === 'ar' ? '22 مرحلة تشطيب' : '22 Finishing Stages'}</span>
            </Link>

            <Link
              to="/finishing/materials"
              data-testid="fin-tab-materials"
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'materials'
                  ? 'bg-white text-[#9E122C] shadow-lg'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{language === 'ar' ? 'دليل الخامات والأسعار' : 'Materials & Cost Guide'}</span>
            </Link>

            <Link
              to="/finishing/contractors"
              data-testid="fin-tab-contractors"
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'contractors'
                  ? 'bg-white text-[#9E122C] shadow-lg'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{language === 'ar' ? 'دليل المقاولين والمهندسين' : 'Contractors Directory'}</span>
            </Link>

            <Link
              to="/finishing"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1C1819]/60 hover:bg-[#1C1819] text-rose-100 border border-white/15 transition flex items-center gap-1.5"
            >
              <span>{language === 'ar' ? 'العودة لحاسبة الباقات' : 'Back to Finishing Estimator'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= TAB 1: 22 FINISHING STAGES ================= */}
        {activeTab === 'steps' && (
          <div className="space-y-6">
            <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 border border-[#D91B3E]/15 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="relative flex-1 max-w-xl">
                  <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="finishing-encyclopedia-search"
                    placeholder={
                      language === 'ar'
                        ? 'ابحث في مراحل التشطيب (محارة، سباكة، جبس، بورسلين...)'
                        : 'Search 22 stages (plumbing, gypsum, porcelain...)'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm focus:border-[#D91B3E] focus:outline-none"
                  />
                </div>
                <span className="text-xs font-black text-[#B31331]" data-testid="finishing-steps-count">
                  {language === 'ar'
                    ? `عرض ${filteredSteps.length} من أصل ${finishingCategories.length} بنداً هندسياً`
                    : `Showing ${filteredSteps.length} of ${finishingCategories.length} stages`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {PHASE_LABELS.map((ph) => (
                  <button
                    key={ph.key}
                    type="button"
                    onClick={() => setPhaseFilter(ph.key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      phaseFilter === ph.key
                        ? 'bg-[#D91B3E] text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                    }`}
                  >
                    {language === 'ar' ? ph.ar : ph.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredSteps.map((step) => {
                const isOpen = expandedStepId === step.id;
                const specs = language === 'ar' ? step.technicalSpecsAr : step.technicalSpecsEn;
                const mistakes = language === 'ar' ? step.commonMistakesAr : step.commonMistakesEn;
                const checklist = language === 'ar' ? step.inspectionChecklistAr : step.inspectionChecklistEn;
                const recMats = language === 'ar' ? step.recommendedMaterialsAr : step.recommendedMaterialsEn;

                return (
                  <article
                    key={step.id}
                    data-testid={`finishing-step-${step.slug}`}
                    className="bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedStepId(isOpen ? '' : step.id)}
                      className="w-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start cursor-pointer"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-red-gradient text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {step.stepOrder}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FDE8ED] text-[#B31331]">
                              {step.budgetSharePercent}% {language === 'ar' ? 'من الميزانية' : 'of Budget'}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-500 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#D91B3E]" />
                              {language === 'ar' ? step.typicalDurationAr : step.typicalDurationEn}
                            </span>
                          </div>
                          <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                            {language === 'ar' ? step.nameAr : step.nameEn}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {language === 'ar' ? step.summaryAr : step.summaryEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-bold text-[#D91B3E]">
                          {isOpen
                            ? language === 'ar'
                              ? 'إخفاء التفاصيل'
                              : 'Hide Details'
                            : language === 'ar'
                            ? 'المواصفات والاستلام'
                            : 'Specs & Checklist'}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#D91B3E] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 border-t border-rose-100/80 pt-5 bg-[#FFFDFD] space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-4 rounded-2xl overflow-hidden h-48 bg-[#FDE8ED] border border-rose-100">
                            <SmartImage
                              src={step.imageUrl}
                              alt={language === 'ar' ? step.nameAr : step.nameEn}
                              fallbackTitle={step.nameEn}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 space-y-2">
                              <h3 className="text-xs font-black text-[#2A1D20] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#D91B3E]" />
                                <span>{language === 'ar' ? 'المواصفات الفنية القياسية' : 'Technical Standards'}</span>
                              </h3>
                              <ul className="space-y-1.5 text-xs text-gray-700">
                                {specs.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D91B3E] shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-200/80 space-y-2">
                              <h3 className="text-xs font-black text-[#B31331] flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#D91B3E]" />
                                <span>{language === 'ar' ? 'أخطاء شائعة احذر منها' : 'Common Mistakes to Avoid'}</span>
                              </h3>
                              <ul className="space-y-1.5 text-xs text-gray-700">
                                {mistakes.map((item, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    • {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-rose-100 space-y-2">
                              <h3 className="text-xs font-black text-[#2A1D20] flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{language === 'ar' ? 'قائمة الاستلام الهندسي' : 'Inspection Checklist'}</span>
                              </h3>
                              <ul className="space-y-1.5 text-xs text-gray-700">
                                {checklist.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 space-y-2 flex flex-col justify-between">
                              <div className="space-y-2">
                                <h3 className="text-xs font-black text-[#2A1D20]">
                                  {language === 'ar' ? 'خامات موصى بها' : 'Recommended Materials'}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {recMats.map((m, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2.5 py-1 rounded-lg bg-[#FDE8ED] text-[#B31331] text-[11px] font-bold"
                                    >
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openConsultationModal(
                                    `${language === 'ar' ? 'استفسار عن بند:' : 'Inquiry regarding stage:'} ${
                                      language === 'ar' ? step.nameAr : step.nameEn
                                    }`,
                                  )
                                }
                                className="mt-3 w-full py-2.5 px-4 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-sm hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span>
                                  {language === 'ar' ? 'طلب مقايسة أو إشراف لهذا البند' : 'Request Stage Quotation'}
                                </span>
                                <ArrowIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: MATERIALS & COST INDEX ================= */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 border border-[#D91B3E]/15 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="relative flex-1 max-w-xl">
                  <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'ابحث عن خامة (بورسلين، سيكا، جوتن، باننجر...)'
                        : 'Search materials (Porcelain, Sika, Jotun, Banninger...)'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm focus:border-[#D91B3E] focus:outline-none"
                  />
                </div>
                <span className="text-xs font-bold text-gray-600">
                  {language === 'ar'
                    ? '* الأسعار استرشادية وفق متوسطات السوق المصري وتُحدث دورياً.'
                    : '* Market baseline bands verified against supplier price sheets (`priceUpdatedAt` displayed).'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {MATERIAL_GROUPS.map((grp) => (
                  <button
                    key={grp.key}
                    type="button"
                    onClick={() => setMaterialGroup(grp.key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      materialGroup === grp.key
                        ? 'bg-[#D91B3E] text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                    }`}
                  >
                    {language === 'ar' ? grp.ar : grp.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="materials-grid">
              {filteredMaterials.map((mat) => {
                const pros = language === 'ar' ? mat.prosAr : mat.prosEn;
                const cons = language === 'ar' ? mat.consAr : mat.consEn;
                const specs = language === 'ar' ? mat.specsAr : mat.specsEn;
                const alts = language === 'ar' ? mat.alternativesAr : mat.alternativesEn;

                return (
                  <article
                    key={mat.id}
                    data-testid={`material-card-${mat.slug}`}
                    className="bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 bg-[#FDE8ED] overflow-hidden">
                        <SmartImage
                          src={mat.imageUrl}
                          alt={language === 'ar' ? mat.nameAr : mat.nameEn}
                          fallbackTitle={mat.nameEn}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-[#1C1819]/85 text-rose-200 text-[11px] font-bold">
                          {language === 'ar' ? mat.originAr : mat.originEn}
                        </span>
                        <span className="absolute bottom-3 end-3 px-2.5 py-1 rounded-lg bg-white/95 text-[#2A1D20] text-[10px] font-bold shadow">
                          {language === 'ar' ? 'آخر تحديث:' : 'Updated:'} {mat.priceUpdatedAt.slice(0, 10)}
                        </span>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h2 className="text-lg font-black text-[#2A1D20]">
                            {language === 'ar' ? mat.nameAr : mat.nameEn}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                            {language === 'ar' ? mat.summaryAr : mat.summaryEn}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[11px] text-gray-500 block">
                              {language === 'ar' ? 'النطاق السعري الاسترشادي:' : 'Estimated Market Range:'}
                            </span>
                            <strong className="text-lg font-black text-[#D91B3E]">
                              {mat.priceMinEgp.toLocaleString()} – {mat.priceMaxEgp.toLocaleString()}{' '}
                              {language === 'ar' ? 'ج.م' : 'EGP'}
                            </strong>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-rose-100 text-[#2A1D20]">
                            {language === 'ar' ? mat.unitAr : mat.unitEn}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                            <span className="font-black text-emerald-800 block">
                              {language === 'ar' ? 'المميزات' : 'Pros'}
                            </span>
                            {pros.map((p, idx) => (
                              <p key={idx} className="text-emerald-900/90">
                                ✓ {p}
                              </p>
                            ))}
                          </div>
                          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
                            <span className="font-black text-[#B31331] block">
                              {language === 'ar' ? 'انتبه / عيوب محتملة' : 'Watchouts'}
                            </span>
                            {cons.map((c, idx) => (
                              <p key={idx} className="text-gray-700">
                                ! {c}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {Object.entries(specs).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold"
                            >
                              {k}: <strong>{v}</strong>
                            </span>
                          ))}
                        </div>

                        <div className="text-xs text-gray-600 pt-1">
                          <strong className="text-[#2A1D20]">
                            {language === 'ar' ? 'أفضل استخدام:' : 'Best For:'}{' '}
                          </strong>
                          {language === 'ar' ? mat.bestUseAr : mat.bestUseEn}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                      <span>
                        {language === 'ar' ? 'البدائل:' : 'Alternatives:'} {alts.join(' / ')}
                      </span>
                      <span className="font-medium">{mat.priceSource}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: CONTRACTORS & ARCHITECTS DIRECTORY ================= */}
        {activeTab === 'contractors' && (
          <div className="space-y-6">
            <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 border border-[#D91B3E]/15 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                    {language === 'ar'
                      ? 'دليل الشركاء والمقاولين المسجلين والموثقين'
                      : 'Registered & Verified Engineering Partners'}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {language === 'ar'
                      ? 'الشارات مبنية على التحقق الفعلي من الأوراق والهوية، ولا تعرض المنصة أي تقييمات أو نجوم وهمية.'
                      : 'Badges reflect document verification status only. Listings with zero published customer reviews display cleanly without fabricated stars.'}
                  </p>
                </div>

                <select
                  value={contractorSpecialty}
                  onChange={(e) => setContractorSpecialty(e.target.value)}
                  data-testid="contractor-specialty-select"
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold focus:border-[#D91B3E] outline-none"
                >
                  <option value="all">{language === 'ar' ? 'كل التخصصات' : 'All Specialties'}</option>
                  <option value="turnkey">{language === 'ar' ? 'مقاول متكامل تسليم مفتاح' : 'Turnkey General'}</option>
                  <option value="architect_3d">{language === 'ar' ? 'مهندس معماري وتصميم 3D' : 'Architect & 3D Design'}</option>
                  <option value="mep">{language === 'ar' ? 'تأسيس سباكة وكهرباء وعزل' : 'MEP Rough-In'}</option>
                  <option value="carpentry_kitchens">{language === 'ar' ? 'مطابخ ودريسنج مخصص' : 'Kitchens & Joinery'}</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(GOV_LABELS).map(([slug, label]) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setContractorGov(slug)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      contractorGov === slug
                        ? 'bg-[#D91B3E] text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                    }`}
                  >
                    {language === 'ar' ? label.ar : label.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="contractors-grid">
              {filteredContractors.map((cntr) => (
                <article
                  key={cntr.id}
                  data-testid={`contractor-card-${cntr.slug}`}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-flex items-center gap-1 ${
                          cntr.verificationBadge === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>
                          {cntr.verificationBadge === 'verified'
                            ? language === 'ar'
                              ? 'موثق الأوراق'
                              : 'Verified Partner'
                            : language === 'ar'
                            ? 'مسجل بالدليل'
                            : 'Registered Listing'}
                        </span>
                      </span>

                      <span className="text-[11px] font-bold text-gray-500">
                        {cntr.experienceYears} {language === 'ar' ? 'سنوات خبرة' : 'yrs exp.'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#2A1D20]">
                        {language === 'ar' ? cntr.nameAr : cntr.nameEn}
                      </h3>
                      <p className="text-xs font-bold text-[#D91B3E] mt-0.5">
                        {language === 'ar' ? cntr.roleTitleAr : cntr.roleTitleEn}
                      </p>
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                        {language === 'ar' ? cntr.specialtyAr : cntr.specialtyEn}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-rose-100 space-y-1.5 text-xs">
                      <div>
                        <span className="text-gray-500">{language === 'ar' ? 'أسلوب التسعير:' : 'Pricing:'} </span>
                        <strong className="text-[#2A1D20]">
                          {language === 'ar' ? cntr.pricingModelAr : cntr.pricingModelEn}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500">{language === 'ar' ? 'الضمان:' : 'Warranty:'} </span>
                        <strong className="text-emerald-700">
                          {language === 'ar' ? cntr.warrantyOfferedAr : cntr.warrantyOfferedEn}
                        </strong>
                      </div>
                    </div>

                    <ul className="space-y-1 text-xs text-gray-600">
                      {(language === 'ar' ? cntr.portfolioHighlightsAr : cntr.portfolioHighlightsEn).map(
                        (item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D91B3E] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                      {language === 'ar' ? cntr.ratingNoteAr : cntr.ratingNoteEn}
                    </div>

                    <button
                      type="button"
                      data-testid={`contractor-consult-${cntr.slug}`}
                      onClick={() =>
                        openConsultationModal(
                          `${language === 'ar' ? 'طلب استشارة/معاينة مع:' : 'Consultation with:'} ${
                            language === 'ar' ? cntr.nameAr : cntr.nameEn
                          }`,
                          cntr.governoratesCovered[0],
                        )
                      }
                      className="w-full py-3 px-4 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'طلب معاينة أو استشارة' : 'Request Consultation'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


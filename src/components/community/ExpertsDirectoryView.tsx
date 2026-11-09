import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SmartImage } from '../common/SmartImage';
import { EXPERT_SPECIALTY_META } from '../../../shared/communityData';
import type { ExpertSpecialtySlug } from '../../types';
import {
  BadgeCheck,
  MapPin,
  Briefcase,
  Award,
  MessageSquare,
  Sparkles,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export const ExpertsDirectoryView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    locations,
    verifiedExperts,
    applyExpertProfile,
  } = useApp();

  const governorates = useMemo(() => {
    const map = new Map<string, { slug: string; nameAr: string; nameEn: string }>();
    for (const loc of locations) {
      if (loc.level === 'governorate' && !map.has(loc.slug)) {
        map.set(loc.slug, { slug: loc.slug, nameAr: loc.nameAr, nameEn: loc.nameEn });
      }
    }
    if (!map.has('cairo')) map.set('cairo', { slug: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo' });
    if (!map.has('giza')) map.set('giza', { slug: 'giza', nameAr: 'الجيزة', nameEn: 'Giza' });
    return Array.from(map.values());
  }, [locations]);

  const [specialtyFilter, setSpecialtyFilter] = useState<'all' | ExpertSpecialtySlug>('all');
  const [govFilter, setGovFilter] = useState<string>('all');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Application State
  const [displayNameAr, setDisplayNameAr] = useState('');
  const [displayNameEn, setDisplayNameEn] = useState('');
  const [specialtySlug, setSpecialtySlug] = useState<ExpertSpecialtySlug>('finishing_engineering');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [govSlug, setGovSlug] = useState('cairo');
  const [yearsExp, setYearsExp] = useState(6);
  const [credentialsAr, setCredentialsAr] = useState('');
  const [credentialsEn, setCredentialsEn] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [docsRaw, setDocsRaw] = useState('كارنيه النقابة / شهادة الاعتماد المهني');

  const filteredExperts = useMemo(() => {
    return verifiedExperts.filter((e) => {
      if (specialtyFilter !== 'all' && e.specialtySlug !== specialtyFilter) return false;
      if (govFilter !== 'all' && e.governorateSlug !== govFilter) return false;
      return true;
    });
  }, [verifiedExperts, specialtyFilter, govFilter]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setApplying(true);
    setApplyError(null);
    setAppliedBanner(null);
    try {
      const docs = docsRaw
        .split(/[,،]+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 3);
      const created = await applyExpertProfile({
        displayNameAr: displayNameAr.trim(),
        displayNameEn: displayNameEn.trim(),
        specialtySlug,
        titleAr: titleAr.trim(),
        titleEn: titleEn.trim(),
        governorateSlug: govSlug,
        yearsExperience: Number(yearsExp),
        credentialsAr: credentialsAr.trim(),
        credentialsEn: credentialsEn.trim(),
        bioAr: bioAr.trim(),
        bioEn: bioEn.trim(),
        verificationDocs: docs.length > 0 ? docs : ['Professional Credential Document'],
      });
      setAppliedBanner(
        language === 'ar'
          ? `تم استلام طلب اعتمادك (${created.id}) بحالة "${created.verificationStatus}". سيظهر في الدليل العام فور فحص الأوراق عبر الإدارة.`
          : `Application (${created.id}) saved with status "${created.verificationStatus}". Appears publicly after Admin credential verification.`,
      );
      setShowApplyForm(false);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Unable to submit application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-12 lg:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <BadgeCheck className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'اعتماد إداري مستقل للخبراء — لا يُشترى بالمال'
                  : 'Admin-Audited Specialist Advisors — Never Pay-for-Badge'}
              </span>
            </div>
            <h1
              data-testid="experts-directory-heading"
              className="text-2xl sm:text-4xl font-black text-white leading-tight"
            >
              {language === 'ar'
                ? 'دليل الخبراء والمستشارين المعتمدين في جواز إن'
                : 'GAWAZ INN Verified Experts & Advisory Directory'}
            </h1>
            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'مهندسو تشطيب، مخططو ميزانيات، ومستشارو جهاز وأسرة موثقو المؤهلات يشاركون إجابات عملية في المنتدى.'
                : 'Verified Egyptian finishing engineers, financial coaches, and bridal advisors contributing audited guidance.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              data-testid="expert-open-apply-btn"
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setShowApplyForm((v) => !v);
                }
              }}
              className="bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'تقديم طلب اعتماد خبير' : 'Apply as Expert'}</span>
            </button>
            <Link
              to="/community"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{language === 'ar' ? 'العودة للمنتدى' : 'Community Forum'}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {appliedBanner && (
          <div
            data-testid="expert-apply-submitted-banner"
            className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs sm:text-sm font-bold flex items-start gap-3"
          >
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <span>{appliedBanner}</span>
          </div>
        )}

        {applyError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-bold">
            {applyError}
          </div>
        )}

        {/* Apply Form */}
        {showApplyForm && currentUser && (
          <form
            onSubmit={handleApplySubmit}
            data-testid="expert-apply-form"
            className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-7 border border-[#D91B3E]/20 shadow-sm space-y-4 text-xs"
          >
            <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
              {language === 'ar'
                ? 'طلب انضمام لدليل الخبراء المعتمدين'
                : 'Submit Expert Verification Application'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'الاسم المعروض (عربي) *' : 'Display Name (AR) *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={3}
                  data-testid="expert-apply-name-ar"
                  value={displayNameAr}
                  onChange={(e) => setDisplayNameAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'الاسم المعروض (إنجليزي) *' : 'Display Name (EN) *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={3}
                  data-testid="expert-apply-name-en"
                  value={displayNameEn}
                  onChange={(e) => setDisplayNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'التخصص *' : 'Specialty *'}
                </span>
                <select
                  data-testid="expert-apply-specialty"
                  value={specialtySlug}
                  onChange={(e) => setSpecialtySlug(e.target.value as ExpertSpecialtySlug)}
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                >
                  {(Object.keys(EXPERT_SPECIALTY_META) as ExpertSpecialtySlug[]).map((slug) => (
                    <option key={slug} value={slug}>
                      {language === 'ar'
                        ? EXPERT_SPECIALTY_META[slug].ar
                        : EXPERT_SPECIALTY_META[slug].en}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 block">
                  <span className="font-bold text-gray-800 block">
                    {language === 'ar' ? 'المحافظة *' : 'Governorate *'}
                  </span>
                  <select
                    value={govSlug}
                    onChange={(e) => setGovSlug(e.target.value)}
                    className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                  >
                    {governorates.map((g) => (
                      <option key={g.slug} value={g.slug}>
                        {language === 'ar' ? g.nameAr : g.nameEn}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-gray-800 block">
                    {language === 'ar' ? 'سنوات الخبرة *' : 'Experience (yrs) *'}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={yearsExp}
                    onChange={(e) => setYearsExp(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'المسمى الوظيفي (عربي) *' : 'Title (AR) *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={3}
                  data-testid="expert-apply-title-ar"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'المسمى الوظيفي (إنجليزي) *' : 'Title (EN) *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={3}
                  data-testid="expert-apply-title-en"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'الشهادات والاعتمادات (عربي) *' : 'Credentials (AR) *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={6}
                  data-testid="expert-apply-creds-ar"
                  value={credentialsAr}
                  onChange={(e) => setCredentialsAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'الشهادات والاعتمادات (إنجليزي) *' : 'Credentials (EN) *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={6}
                  data-testid="expert-apply-creds-en"
                  value={credentialsEn}
                  onChange={(e) => setCredentialsEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'نبذة تعريفية (عربي - 15 حرفاً على الأقل) *' : 'Bio (AR - min 15 chars) *'}
                </span>
                <textarea
                  rows={2}
                  required
                  minLength={15}
                  data-testid="expert-apply-bio-ar"
                  value={bioAr}
                  onChange={(e) => setBioAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'نبذة تعريفية (إنجليزي - 15 حرفاً على الأقل) *' : 'Bio (EN - min 15 chars) *'}
                </span>
                <textarea
                  rows={2}
                  required
                  minLength={15}
                  data-testid="expert-apply-bio-en"
                  value={bioEn}
                  onChange={(e) => setBioEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="font-bold text-gray-800 block">
                {language === 'ar' ? 'مستندات الاعتماد للفحص الإداري (مفصولة بفاصلة) *' : 'Audit Documents (comma separated) *'}
              </span>
              <input
                type="text"
                required
                data-testid="expert-apply-docs"
                value={docsRaw}
                onChange={(e) => setDocsRaw(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="px-4 py-2 rounded-xl border bg-white text-gray-600 font-bold cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={applying}
                data-testid="expert-apply-submit-btn"
                className="px-5 py-2.5 rounded-xl bg-red-gradient text-white font-bold shadow-md disabled:opacity-60 cursor-pointer"
              >
                {applying
                  ? language === 'ar'
                    ? 'جاري التقديم...'
                    : 'Submitting...'
                  : language === 'ar'
                    ? 'إرسال للاعتماد الإداري'
                    : 'Submit for Verification'}
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-5 border border-[#D91B3E]/15 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="text-xs font-black text-[#2A1D20]">
            {language === 'ar'
              ? `الخبراء المعتمدون الظاهرون (${filteredExperts.length})`
              : `Verified Experts Listed (${filteredExperts.length})`}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 min-w-0">
            <select
              data-testid="expert-specialty-filter"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value as 'all' | ExpertSpecialtySlug)}
              className="w-full sm:w-auto max-w-full min-w-0 truncate px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
            >
              <option value="all">{language === 'ar' ? 'كل التخصصات' : 'All Specialties'}</option>
              {(Object.keys(EXPERT_SPECIALTY_META) as ExpertSpecialtySlug[]).map((slug) => (
                <option key={slug} value={slug}>
                  {language === 'ar'
                    ? EXPERT_SPECIALTY_META[slug].ar
                    : EXPERT_SPECIALTY_META[slug].en}
                </option>
              ))}
            </select>

            <select
              data-testid="expert-gov-filter"
              value={govFilter}
              onChange={(e) => setGovFilter(e.target.value)}
              className="w-full sm:w-auto max-w-full min-w-0 truncate px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
            >
              <option value="all">{language === 'ar' ? 'كل المحافظات' : 'All Governorates'}</option>
              {governorates.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {language === 'ar' ? g.nameAr : g.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verified Experts Grid */}
        {filteredExperts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-rose-100 space-y-2">
            <Award className="w-8 h-8 text-[#D91B3E] mx-auto" />
            <p className="text-sm font-bold text-gray-800">
              {language === 'ar'
                ? 'لا يوجد خبراء معتمدون مطابقون لهذا التخصص حالياً.'
                : 'No verified experts match your filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((exp) => {
              const specMeta = EXPERT_SPECIALTY_META[exp.specialtySlug];
              return (
                <article
                  key={exp.id}
                  data-testid={`expert-card-${exp.id}`}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5">
                      <SmartImage
                        src={exp.avatarUrl}
                        alt={language === 'ar' ? exp.displayNameAr : exp.displayNameEn}
                        fallbackTitle={language === 'ar' ? exp.displayNameAr : exp.displayNameEn}
                        className="w-14 h-14 rounded-2xl object-cover border border-rose-100 shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className="text-base font-black text-[#2A1D20] truncate">
                            {language === 'ar' ? exp.displayNameAr : exp.displayNameEn}
                          </h2>
                          <span
                            data-testid={`expert-verified-badge-${exp.id}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D91B3E] text-white text-[10px] font-bold"
                          >
                            <BadgeCheck className="w-3 h-3" />
                            <span>{language === 'ar' ? 'موثق' : 'Verified'}</span>
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#B31331]">
                          {language === 'ar' ? exp.titleAr : exp.titleEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                      <span className="px-2.5 py-1 rounded-lg bg-[#FDE8ED] text-[#B31331]">
                        {language === 'ar' ? specMeta.ar : specMeta.en}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-gray-700 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#D91B3E]" />
                        {exp.yearsExperience} {language === 'ar' ? 'سنة خبرة' : 'yrs exp'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-gray-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D91B3E]" />
                        {exp.governorateSlug}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-gray-100 text-[11px] text-gray-700 space-y-1">
                      <strong className="text-[#2A1D20] block flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#D91B3E]" />
                        {language === 'ar' ? 'الاعتماد والمؤهل:' : 'Audited Credentials:'}
                      </strong>
                      <span>{language === 'ar' ? exp.credentialsAr : exp.credentialsEn}</span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {language === 'ar' ? exp.bioAr : exp.bioEn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-3 font-bold text-gray-700">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#D91B3E]" />
                        {exp.answersCount} {language === 'ar' ? 'إجابة' : 'answers'}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        {exp.helpfulCount} {language === 'ar' ? 'مفيدة' : 'helpful'}
                      </span>
                    </div>

                    <Link
                      to="/community"
                      className="px-3 py-1.5 rounded-xl bg-[#FDE8ED] hover:bg-[#D91B3E] text-[#B31331] hover:text-white font-bold transition"
                    >
                      {language === 'ar' ? 'اسأل في المنتدى' : 'Ask in Q&A'}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


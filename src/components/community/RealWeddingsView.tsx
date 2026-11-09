import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SmartImage } from '../common/SmartImage';
import { ModalFrame } from '../common/ModalFrame';
import { COMMUNITY_REPORT_REASON_META } from '../../../shared/communityData';
import type { CommunityReportReason, RealWeddingStory } from '../../types';
import {
  Heart,
  MapPin,
  Users,
  Clock,
  Sparkles,
  Plus,
  Flag,
  CheckCircle2,
  Hourglass,
  XCircle,
  Calculator,
  Wallet,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const RealWeddingsView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    locations,
    realWeddings,
    mySubmittedStories,
    submitWeddingStory,
    submitCommunityReport,
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
    if (!map.has('alexandria')) {
      map.set('alexandria', { slug: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria' });
    }
    return Array.from(map.values());
  }, [locations]);

  const [govFilter, setGovFilter] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under_750k' | '750k_1m' | 'over_1m'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  // Create Story Form State
  const [coupleTitleAr, setCoupleTitleAr] = useState('');
  const [coupleTitleEn, setCoupleTitleEn] = useState('');
  const [governorateSlug, setGovernorateSlug] = useState('cairo');
  const [cityAr, setCityAr] = useState('');
  const [weddingYear, setWeddingYear] = useState(2026);
  const [guestCount, setGuestCount] = useState(180);
  const [preparationMonths, setPreparationMonths] = useState(14);
  const [finishingCostEgp, setFinishingCostEgp] = useState(280000);
  const [groomTrousseauEgp, setGroomTrousseauEgp] = useState(220000);
  const [brideTrousseauEgp, setBrideTrousseauEgp] = useState(145000);
  const [weddingCostEgp, setWeddingCostEgp] = useState(160000);
  const [summaryAr, setSummaryAr] = useState('');
  const [lessonsLearnedAr, setLessonsLearnedAr] = useState('');

  // Report Modal State
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<CommunityReportReason>('misleading_price');
  const [reportDetails, setReportDetails] = useState('');

  const filteredStories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return realWeddings.filter((s) => {
      if (govFilter !== 'all' && s.governorateSlug !== govFilter) return false;
      if (budgetFilter === 'under_750k' && s.totalActualBudgetEgp >= 750000) return false;
      if (
        budgetFilter === '750k_1m' &&
        (s.totalActualBudgetEgp < 750000 || s.totalActualBudgetEgp > 1000000)
      ) {
        return false;
      }
      if (budgetFilter === 'over_1m' && s.totalActualBudgetEgp <= 1000000) return false;
      if (!q) return true;
      return (
        s.coupleTitleAr.toLowerCase().includes(q) ||
        s.coupleTitleEn.toLowerCase().includes(q) ||
        s.cityAr.toLowerCase().includes(q) ||
        s.summaryAr.toLowerCase().includes(q)
      );
    });
  }, [realWeddings, govFilter, budgetFilter, searchQuery]);

  const draftTotalBudget =
    Number(finishingCostEgp || 0) +
    Number(groomTrousseauEgp || 0) +
    Number(brideTrousseauEgp || 0) +
    Number(weddingCostEgp || 0);

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setSubmitting(true);
    setSubmittedNotice(null);
    try {
      const created = await submitWeddingStory({
        coupleTitleAr: coupleTitleAr.trim(),
        coupleTitleEn: coupleTitleEn.trim() || undefined,
        governorateSlug,
        cityAr: cityAr.trim(),
        weddingYear: Number(weddingYear),
        guestCount: Number(guestCount),
        preparationMonths: Number(preparationMonths),
        finishingCostEgp: Number(finishingCostEgp),
        groomTrousseauEgp: Number(groomTrousseauEgp),
        brideTrousseauEgp: Number(brideTrousseauEgp),
        weddingCostEgp: Number(weddingCostEgp),
        summaryAr: summaryAr.trim(),
        lessonsLearnedAr: lessonsLearnedAr.trim(),
      });
      setCoupleTitleAr('');
      setCoupleTitleEn('');
      setCityAr('');
      setSummaryAr('');
      setLessonsLearnedAr('');
      setShowCreateForm(false);
      setSubmittedNotice(
        language === 'ar'
          ? `تم حفظ قصتك (${created.id}) بحالة "${created.moderationStatus}". لن تظهر في الصفحة العامة قبل موافقة مشرف المجتمع.`
          : `Story (${created.id}) saved with status "${created.moderationStatus}". It stays private until moderator approval.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetId) return;
    await submitCommunityReport({
      targetType: 'story',
      targetId: reportTargetId,
      reason: reportReason,
      details: reportDetails.trim() || null,
    });
    setReportTargetId(null);
    setReportDetails('');
  };

  const renderStatusPill = (status: RealWeddingStory['moderationStatus']) => {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'منشورة ومعتمدة' : 'Approved & Live'}</span>
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'مرفوضة / تتطلب تعديل' : 'Rejected'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <Hourglass className="w-3.5 h-3.5" />
        <span>{language === 'ar' ? 'قيد مراجعة المشرف (غير منشورة للعامة)' : 'Pending Moderator Review'}</span>
      </span>
    );
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-12 lg:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Heart className="w-4 h-4 fill-white text-white" />
              <span>
                {language === 'ar'
                  ? 'أرشيف التجارب الحقيقية والميزانيات الموثقة'
                  : 'Verified Real Weddings & Cost Breakdowns'}
              </span>
            </div>
            <h1
              data-testid="real-weddings-heading"
              className="text-2xl sm:text-4xl font-black text-white leading-tight"
            >
              {language === 'ar'
                ? 'قصص زفاف حقيقية بأرقام التكلفة الفعلية في مصر'
                : 'Real Egyptian Weddings & Itemized Budget Stories'}
            </h1>
            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'تعرّف على تجارب حقيقية للأزواج من التشطيب والجهاز وحتى قاعة الفرح — مع تفصيل التكاليف والدروس المستفادة ومراجعة إشرافية قبل أي نشر.'
                : 'Explore actual couple budgets across apartment finishing, groom & bride trousseaus, and weddings—moderated prior to public publication.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              data-testid="story-open-form-btn"
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setShowCreateForm((v) => !v);
                }
              }}
              className="bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'شارك قصة زفافك' : 'Share My Wedding Story'}</span>
            </button>
            <Link
              to="/community"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'ar' ? 'منتدى الأسئلة والخبراء' : 'Community Q&A'}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {submittedNotice && (
          <div
            data-testid="story-pending-notice"
            className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs sm:text-sm font-bold flex items-start gap-3"
          >
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <span>{submittedNotice}</span>
          </div>
        )}

        {/* Submit Story Form */}
        {showCreateForm && currentUser && (
          <form
            onSubmit={handleSubmitStory}
            data-testid="submit-story-form"
            className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-7 border border-[#D91B3E]/20 shadow-sm space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar'
                    ? 'إضافة قصة زفافك وميزانيتك الواقعية'
                    : 'Submit Your Real Wedding Story'}
                </h2>
                <p className="text-xs text-gray-600">
                  {language === 'ar'
                    ? 'تصل القصة لقائمة المراجعة الإشرافية أولاً لضمان دقة البيانات وخصوصية الأسماء.'
                    : 'Stories enter Moderator Review first and stay unlisted publicly until approved.'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white border border-rose-200 text-xs font-black text-[#D91B3E] self-start">
                {language === 'ar' ? 'الإجمالي الفعلي:' : 'Calculated Total:'}{' '}
                {draftTotalBudget.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'عنوان القصة (عربي) *' : 'Story Title (AR) *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={4}
                  data-testid="story-couple-title-ar"
                  value={coupleTitleAr}
                  onChange={(e) => setCoupleTitleAr(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: تجربة زواج كريم ومي في التجمع 2026' : 'Arabic title'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'عنوان القصة (إنجليزي - اختياري)' : 'Story Title (EN - optional)'}
                </span>
                <input
                  type="text"
                  data-testid="story-couple-title-en"
                  value={coupleTitleEn}
                  onChange={(e) => setCoupleTitleEn(e.target.value)}
                  placeholder="English title"
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'المحافظة *' : 'Governorate *'}
                </span>
                <select
                  data-testid="story-gov-select"
                  value={governorateSlug}
                  onChange={(e) => setGovernorateSlug(e.target.value)}
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-semibold outline-none focus:border-[#D91B3E]"
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
                  {language === 'ar' ? 'المدينة / الحي *' : 'District / City *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  data-testid="story-city-ar"
                  value={cityAr}
                  onChange={(e) => setCityAr(e.target.value)}
                  placeholder={language === 'ar' ? 'مدينة نصر / المعادي / سموحة' : 'District'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'تكلفة التشطيب (ج.م)' : 'Finishing (EGP)'}
                </span>
                <input
                  type="number"
                  min={0}
                  data-testid="story-cost-finishing"
                  value={finishingCostEgp}
                  onChange={(e) => setFinishingCostEgp(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'جهاز العريس (ج.م)' : 'Groom Prep (EGP)'}
                </span>
                <input
                  type="number"
                  min={0}
                  data-testid="story-cost-groom"
                  value={groomTrousseauEgp}
                  onChange={(e) => setGroomTrousseauEgp(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'جهاز العروسة (ج.م)' : "Bride's Prep (EGP)"}
                </span>
                <input
                  type="number"
                  min={0}
                  data-testid="story-cost-bride"
                  value={brideTrousseauEgp}
                  onChange={(e) => setBrideTrousseauEgp(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'حفل الزفاف (ج.م)' : 'Wedding (EGP)'}
                </span>
                <input
                  type="number"
                  min={0}
                  data-testid="story-cost-wedding"
                  value={weddingCostEgp}
                  onChange={(e) => setWeddingCostEgp(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'سنة الزواج' : 'Year'}
                </span>
                <input
                  type="number"
                  min={2015}
                  max={2030}
                  data-testid="story-year"
                  value={weddingYear}
                  onChange={(e) => setWeddingYear(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'عدد المدعوين' : 'Guests'}
                </span>
                <input
                  type="number"
                  min={0}
                  max={3000}
                  data-testid="story-guests"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'شهور الاستعداد' : 'Prep Months'}
                </span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  data-testid="story-prep-months"
                  value={preparationMonths}
                  onChange={(e) => setPreparationMonths(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </label>
            </div>

            <label className="space-y-1 block text-xs">
              <span className="font-bold text-gray-800 block">
                {language === 'ar' ? 'ملخص الرحلة وكيف تم إدارة الميزانية (20 حرفاً على الأقل) *' : 'Story & Budget Summary (min 20 chars) *'}
              </span>
              <textarea
                rows={3}
                required
                minLength={20}
                data-testid="story-summary-ar"
                value={summaryAr}
                onChange={(e) => setSummaryAr(e.target.value)}
                placeholder={language === 'ar' ? 'اشرح تسلسل الخطوات والقرارات التي وفرت في التكلفة...' : 'How did you structure and save?'}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
              />
            </label>

            <label className="space-y-1 block text-xs">
              <span className="font-bold text-gray-800 block">
                {language === 'ar' ? 'أهم درس تنصح به المقبلين على الزواج (10 أحرف على الأقل) *' : 'Key Lesson Learned (min 10 chars) *'}
              </span>
              <textarea
                rows={2}
                required
                minLength={10}
                data-testid="story-lessons-ar"
                value={lessonsLearnedAr}
                onChange={(e) => setLessonsLearnedAr(e.target.value)}
                placeholder={language === 'ar' ? 'نصيحة ذهبية لتفادي الأخطاء أو فروق الأسعار...' : 'Practical advice for upcoming couples'}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
              />
            </label>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                data-testid="story-submit-btn"
                className="px-6 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md disabled:opacity-60 cursor-pointer"
              >
                {submitting
                  ? language === 'ar'
                    ? 'جاري الإرسال...'
                    : 'Submitting...'
                  : language === 'ar'
                    ? 'إرسال للمراجعة الإشرافية'
                    : 'Submit for Moderation'}
              </button>
            </div>
          </form>
        )}

        {/* My Submitted Stories Status Strip (Signed-in author only) */}
        {currentUser && mySubmittedStories.length > 0 && (
          <div
            data-testid="my-submitted-stories"
            className="bg-white rounded-3xl p-5 border border-[#D91B3E]/15 shadow-sm space-y-3"
          >
            <h2 className="text-sm sm:text-base font-black text-[#2A1D20]">
              {language === 'ar'
                ? `قصصي المرسلة (${mySubmittedStories.length})`
                : `My Submitted Wedding Stories (${mySubmittedStories.length})`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mySubmittedStories.map((st) => (
                <div
                  key={st.id}
                  data-testid={`my-story-status-${st.id}`}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <strong className="text-xs sm:text-sm font-black text-gray-900 block truncate">
                      {language === 'ar' ? st.coupleTitleAr : st.coupleTitleEn}
                    </strong>
                    <span className="text-[11px] text-gray-500">
                      {st.totalActualBudgetEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'} •{' '}
                      {language === 'ar' ? st.cityAr : st.cityEn}
                    </span>
                    {st.moderationNotes && (
                      <p className="text-[11px] text-[#B31331] mt-1">{st.moderationNotes}</p>
                    )}
                  </div>
                  {renderStatusPill(st.moderationStatus)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-5 border border-[#D91B3E]/15 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="text"
              data-testid="story-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'ابحث بالمنطقة، اسم التجربة، أو التجهيزات...'
                  : 'Search by district, couple title, or lessons...'
              }
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 min-w-0">
            <select
              data-testid="story-gov-filter"
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

            <select
              data-testid="story-budget-filter"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value as typeof budgetFilter)}
              className="w-full sm:w-auto max-w-full min-w-0 truncate px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
            >
              <option value="all">{language === 'ar' ? 'كل الميزانيات' : 'All Budgets'}</option>
              <option value="under_750k">
                {language === 'ar' ? 'أقل من 750,000 ج.م' : 'Under 750k EGP'}
              </option>
              <option value="750k_1m">
                {language === 'ar' ? '750,000 – 1,000,000 ج.م' : '750k – 1M EGP'}
              </option>
              <option value="over_1m">
                {language === 'ar' ? 'أكثر من 1,000,000 ج.م' : 'Over 1M EGP'}
              </option>
            </select>
          </div>
        </div>

        {/* Approved Real Wedding Cards */}
        {filteredStories.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-rose-100 space-y-2">
            <Heart className="w-8 h-8 text-[#D91B3E] mx-auto" />
            <p className="text-sm font-bold text-gray-800">
              {language === 'ar'
                ? 'لا توجد قصص زفاف منشورة تطابق الفلتر الحالي.'
                : 'No approved wedding stories match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStories.map((story) => {
              const breakdown =
                story.costBreakdown && story.costBreakdown.length > 0
                  ? story.costBreakdown
                  : [
                      {
                        categoryAr: 'تشطيب الشقة',
                        categoryEn: 'Apartment Finishing',
                        amountEgp: story.finishingCostEgp,
                      },
                      {
                        categoryAr: 'جهاز العريس',
                        categoryEn: "Groom's Prep",
                        amountEgp: story.groomTrousseauEgp,
                      },
                      {
                        categoryAr: 'جهاز العروسة',
                        categoryEn: "Bride's Trousseau",
                        amountEgp: story.brideTrousseauEgp,
                      },
                      {
                        categoryAr: 'حفل الزفاف',
                        categoryEn: 'Wedding Event',
                        amountEgp: story.weddingCostEgp,
                      },
                    ].filter((c) => c.amountEgp > 0);

              return (
                <article
                  key={story.id}
                  data-testid={`real-wedding-card-${story.id}`}
                  className="bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 bg-[#FDE8ED]">
                      <SmartImage
                        src={
                          story.photos[0] ||
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80'
                        }
                        alt={language === 'ar' ? story.coupleTitleAr : story.coupleTitleEn}
                        fallbackTitle={language === 'ar' ? story.coupleTitleAr : story.coupleTitleEn}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#D91B3E] text-white text-[11px] font-bold shadow">
                          {story.weddingYear}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/95 text-[#2A1D20] text-[11px] font-bold shadow flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D91B3E]" />
                          {language === 'ar' ? story.cityAr : story.cityEn}
                        </span>
                      </div>
                      <div className="absolute bottom-3 start-3 end-3 text-white">
                        <h2 className="text-base sm:text-lg font-black leading-snug">
                          {language === 'ar' ? story.coupleTitleAr : story.coupleTitleEn}
                        </h2>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Quick Metrics */}
                      <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-rose-100 text-center">
                        <div>
                          <span className="text-[10px] text-gray-500 block font-semibold">
                            {language === 'ar' ? 'الإجمالي الفعلي' : 'Actual Total'}
                          </span>
                          <strong className="text-xs sm:text-sm font-black text-[#D91B3E]">
                            {story.totalActualBudgetEgp.toLocaleString()}{' '}
                            {language === 'ar' ? 'ج.م' : 'EGP'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block font-semibold flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            {language === 'ar' ? 'المدعوين' : 'Guests'}
                          </span>
                          <strong className="text-xs sm:text-sm font-black text-gray-900">
                            {story.guestCount}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block font-semibold flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {language === 'ar' ? 'فترة التجهيز' : 'Prep Span'}
                          </span>
                          <strong className="text-xs sm:text-sm font-black text-gray-900">
                            {story.preparationMonths} {language === 'ar' ? 'شهر' : 'mo'}
                          </strong>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {language === 'ar' ? story.summaryAr : story.summaryEn}
                      </p>

                      {/* Itemized Cost Breakdown */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-[#2A1D20]">
                          {language === 'ar' ? 'تفصيل التكاليف الحقيقية:' : 'Itemized Cost Breakdown:'}
                        </h3>
                        <div className="space-y-2">
                          {breakdown.map((line, idx) => {
                            const pct =
                              story.totalActualBudgetEgp > 0
                                ? Math.round((line.amountEgp / story.totalActualBudgetEgp) * 100)
                                : 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="font-bold text-gray-700">
                                    {language === 'ar' ? line.categoryAr : line.categoryEn}
                                  </span>
                                  <span className="font-black text-gray-900">
                                    {line.amountEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'} ({pct}%)
                                  </span>
                                </div>
                                <div className="h-2 rounded-full bg-rose-50 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#D91B3E]"
                                    style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lessons Learned */}
                      <div className="p-3.5 rounded-2xl bg-[#FFF8F9] border border-[#D91B3E]/15 text-xs space-y-1">
                        <strong className="text-[#B31331] block">
                          {language === 'ar' ? '💡 أهم درس مستفاد:' : '💡 Key Lesson Learned:'}
                        </strong>
                        <p className="text-gray-700 leading-relaxed">
                          {language === 'ar' ? story.lessonsLearnedAr : story.lessonsLearnedEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 pb-5 pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/calculators"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#B31331] text-[11px] font-bold transition"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'احسب ميزانيتك' : 'Run Calculators'}</span>
                      </Link>
                      <Link
                        to="/my/budget"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8ED] text-gray-700 text-[11px] font-bold transition"
                      >
                        <Wallet className="w-3.5 h-3.5 text-[#D91B3E]" />
                        <span>{language === 'ar' ? 'خطط في الميزانية' : 'Open Budget'}</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      data-testid={`story-report-btn-${story.id}`}
                      onClick={() => {
                        if (!currentUser) {
                          setAuthModalOpen(true);
                          return;
                        }
                        setReportTargetId(story.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-500 hover:text-[#D91B3E] hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Flag className="w-3 h-3" />
                      <span>{language === 'ar' ? 'إبلاغ' : 'Report'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ModalFrame
        isOpen={Boolean(reportTargetId)}
        onClose={() => setReportTargetId(null)}
        titleId="story-report-modal-title"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <h3 id="story-report-modal-title" className="text-base font-black text-gray-900">
            {language === 'ar' ? 'إبلاغ فريق الإشراف عن محتوى القصة' : 'Report Story to Moderation'}
          </h3>
          <label className="space-y-1 block text-xs">
            <span className="font-bold text-gray-700 block">
              {language === 'ar' ? 'سبب البلاغ:' : 'Reason:'}
            </span>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as CommunityReportReason)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
            >
              {(Object.keys(COMMUNITY_REPORT_REASON_META) as CommunityReportReason[]).map((k) => (
                <option key={k} value={k}>
                  {language === 'ar'
                    ? COMMUNITY_REPORT_REASON_META[k].ar
                    : COMMUNITY_REPORT_REASON_META[k].en}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 block text-xs">
            <span className="font-bold text-gray-700 block">
              {language === 'ar' ? 'ملاحظات إضافية:' : 'Details:'}
            </span>
            <textarea
              rows={2}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReportTargetId(null)}
              className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600 cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold cursor-pointer"
            >
              {language === 'ar' ? 'إرسال البلاغ' : 'Submit Report'}
            </button>
          </div>
        </form>
      </ModalFrame>
    </div>
  );
};


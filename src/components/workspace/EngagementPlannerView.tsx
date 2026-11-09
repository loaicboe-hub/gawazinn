import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { STARTER_ENGAGEMENT_ITEMS } from '../../../shared/journeyWorkspaceData';
import type {
  EngagementItemStatus,
  EngagementItemType,
  EngagementVenueStatus,
} from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  Gem,
  HeartHandshake,
  Plus,
  Sparkles,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';

function fmtEgp(n: number, language: 'ar' | 'en'): string {
  return `${Math.round(n).toLocaleString()} ${language === 'ar' ? 'ج.م' : 'EGP'}`;
}

export const EngagementPlannerView: React.FC = () => {
  const {
    language,
    dir,
    currentUser,
    setAuthModalOpen,
    myHubPayload,
    updateEngagementPlan,
    createEngagementItem,
    patchEngagementItem,
    deleteEngagementItem,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const engagement = myHubPayload?.engagement;

  const [planDraft, setPlanDraft] = useState<{
    engagementDate?: string;
    targetBudget?: number;
    shabkaBudget?: number;
    venueBudget?: number;
    attireBudget?: number;
    hospitalityBudget?: number;
    venueName?: string;
    venueStatus?: EngagementVenueStatus;
    ringNotes?: string;
    familyNotes?: string;
  }>({});

  const engagementDate = planDraft.engagementDate ?? engagement?.plan.engagementDate ?? '';
  const targetBudget = planDraft.targetBudget ?? engagement?.plan.targetBudget ?? 140000;
  const shabkaBudget = planDraft.shabkaBudget ?? engagement?.plan.shabkaBudget ?? 75000;
  const venueBudget = planDraft.venueBudget ?? engagement?.plan.venueBudget ?? 35000;
  const attireBudget = planDraft.attireBudget ?? engagement?.plan.attireBudget ?? 18000;
  const hospitalityBudget =
    planDraft.hospitalityBudget ?? engagement?.plan.hospitalityBudget ?? 12000;
  const venueName = planDraft.venueName ?? engagement?.plan.venueName ?? '';
  const venueStatus =
    planDraft.venueStatus ?? engagement?.plan.venueStatus ?? 'researching';
  const ringNotes = planDraft.ringNotes ?? engagement?.plan.ringNotes ?? '';
  const familyNotes = planDraft.familyNotes ?? engagement?.plan.familyNotes ?? '';

  const [savingPlan, setSavingPlan] = useState(false);

  // Add engagement item form
  const [filterType, setFilterType] = useState<EngagementItemType | 'all'>('all');
  const [newItemType, setNewItemType] = useState<EngagementItemType>('checklist');
  const [newTitle, setNewTitle] = useState('');
  const [newSide, setNewSide] = useState<'groom' | 'bride' | 'shared'>('shared');
  const [newEstimatedCost, setNewEstimatedCost] = useState<number>(0);
  const [newGuestCount, setNewGuestCount] = useState<number>(0);
  const [submittingItem, setSubmittingItem] = useState(false);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setSavingPlan(true);
    try {
      await updateEngagementPlan({
        engagementDate: engagementDate.trim() ? engagementDate.trim() : null,
        targetBudget,
        shabkaBudget,
        venueBudget,
        attireBudget,
        hospitalityBudget,
        venueName: venueName.trim() ? venueName.trim() : null,
        venueStatus,
        ringNotes: ringNotes.trim() ? ringNotes.trim() : null,
        familyNotes: familyNotes.trim() ? familyNotes.trim() : null,
      });
      setPlanDraft({});
    } finally {
      setSavingPlan(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!newTitle.trim()) return;
    setSubmittingItem(true);
    try {
      await createEngagementItem({
        itemType: newItemType,
        titleAr: newTitle.trim(),
        titleEn: newTitle.trim(),
        ownerSide: newSide,
        priority: 'medium',
        estimatedCost: newEstimatedCost,
        actualCost: 0,
        guestCount: newGuestCount,
        status: 'planned',
      });
      setNewTitle('');
      setNewEstimatedCost(0);
      setNewGuestCount(0);
    } finally {
      setSubmittingItem(false);
    }
  };

  const items = engagement?.items ?? [];
  const filteredItems =
    filterType === 'all' ? items : items.filter((i) => i.itemType === filterType);

  const typeLabel = (t: EngagementItemType) => {
    switch (t) {
      case 'gift_ring':
        return language === 'ar' ? 'الشبكة والدبل والهدايا' : 'Shabka, Rings & Gifts';
      case 'guest_group':
        return language === 'ar' ? 'قوائم المدعوين والعائلات' : 'Guest Groups';
      case 'budget_line':
        return language === 'ar' ? 'بنود وتكاليف الحفل' : 'Ceremony Costs';
      default:
        return language === 'ar' ? 'مهام الخطوبة' : 'Checklist';
    }
  };

  const venueStatusLabel = (st: EngagementVenueStatus) => {
    switch (st) {
      case 'booked':
        return language === 'ar' ? 'تم الحجز والعربون' : 'Booked';
      case 'shortlisted':
        return language === 'ar' ? 'قيد المقارنة والاختيار' : 'Shortlisted';
      case 'home_ceremony':
        return language === 'ar' ? 'خطوبة عائلية بالمنزل' : 'Family Home Ceremony';
      default:
        return language === 'ar' ? 'جاري البحث والمعاينة' : 'Researching';
    }
  };

  const cycleStatus = (cur: EngagementItemStatus): EngagementItemStatus => {
    if (cur === 'planned') return 'in_progress';
    if (cur === 'in_progress') return 'done';
    return 'planned';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]/60 pb-20">
      {/* Header Banner */}
      <section className="bg-red-gradient text-white py-10 sm:py-12 border-b border-[#D91B3E]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold">
                <Gem className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'الوحدة B — مخطط الخطوبة وتنسيق العائلتين'
                    : 'Module B — Engagement Readiness & Family Coordination'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {language === 'ar'
                  ? 'مخطط الخطوبة والشبكة وقوائم المدعوين'
                  : 'Engagement Planner: Shabka, Guests & Venue'}
              </h1>
              <p className="text-xs sm:text-sm text-white/90">
                {language === 'ar'
                  ? 'نسّق الشبكة، ميزانية حفل الخطوبة، مدعوي العائلتين، ومهام قراءة الفاتحة حتى الانتقال السلس لمرحلة الفرح.'
                  : 'Coordinate Shabka rings, family guest lists, ceremony hospitality, and budgets cleanly before transitioning into full wedding planning.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                to="/journey"
                className="bg-white text-[#D91B3E] hover:bg-gray-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <span>
                  {language === 'ar' ? 'مخطط رحلة الزفاف' : 'Wedding Journey Planner'}
                </span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/my/workspace?tab=workspace"
                className="bg-black/20 hover:bg-black/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/25 transition flex items-center gap-1.5"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar' ? 'مساحة الزوجين المشتركة' : 'Couple Workspace'}
                </span>
              </Link>
            </div>
          </div>

          {!currentUser && (
            <div className="bg-white text-[#2A1D20] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#D91B3E] shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-black">
                    {language === 'ar'
                      ? 'سجل دخولك لحفظ خطة الخطوبة ومشاركة التقدم'
                      : 'Sign in to save your private Engagement Plan'}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {language === 'ar'
                      ? 'استعرض نموذج البنود الأساسية مجاناً أو سجّل الآن لتخصيص الشبكة والمدعوين والميزانية.'
                      : 'Preview the Egyptian engagement blueprint below or sign in to customize Shabka, guest groups & costs.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="engagement-signin-btn"
                onClick={() => setAuthModalOpen(true)}
                className="bg-red-gradient text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:opacity-95 transition shrink-0 cursor-pointer"
              >
                {language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In'}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {!currentUser || !engagement ? (
          /* Guest Interactive Blueprint Preview */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-[#2A1D20]">
              {language === 'ar'
                ? 'النموذج المرجعي لتجهيز الخطوبة في مصر'
                : 'Egyptian Engagement Readiness Blueprint Preview'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STARTER_ENGAGEMENT_ITEMS.map((seed, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#D91B3E] bg-[#FDE8ED] px-2 py-0.5 rounded-full">
                      {typeLabel(seed.itemType)}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#2A1D20]">
                      {language === 'ar' ? seed.titleAr : seed.titleEn}
                    </p>
                  </div>
                  <div className="text-end shrink-0 text-xs font-black text-[#B31331]">
                    {seed.estimatedCost > 0
                      ? fmtEgp(seed.estimatedCost, language)
                      : seed.guestCount > 0
                        ? `${seed.guestCount} ${language === 'ar' ? 'مدعو' : 'guests'}`
                        : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Live Summary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <Wallet className="w-4 h-4 text-[#D91B3E]" />
                  <span>{language === 'ar' ? 'سقف ميزانية الخطوبة' : 'Target Budget'}</span>
                </div>
                <p className="text-lg sm:text-2xl font-black text-[#2A1D20]">
                  {fmtEgp(engagement.summary.targetBudget, language)}
                </p>
                <span className="text-[11px] text-gray-500 block">
                  {language === 'ar' ? 'المنصرف المسجل:' : 'Actual spent:'}{' '}
                  {fmtEgp(engagement.summary.totalActualItemsCost, language)}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <Gem className="w-4 h-4 text-[#D91B3E]" />
                  <span>{language === 'ar' ? 'بنود القاعات والشبكة' : 'Allocated Sum'}</span>
                </div>
                <p className="text-lg sm:text-2xl font-black text-[#D91B3E]">
                  {fmtEgp(engagement.summary.allocatedComponentsSum, language)}
                </p>
                <span className="text-[11px] text-gray-500 block">
                  {venueStatusLabel(engagement.plan.venueStatus)}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <Users className="w-4 h-4 text-[#D91B3E]" />
                  <span>{language === 'ar' ? 'إجمالي المدعوين' : 'Invited Guests'}</span>
                </div>
                <p className="text-lg sm:text-2xl font-black text-[#2A1D20]">
                  {engagement.summary.totalInvitedGuests}
                </p>
                <span className="text-[11px] text-gray-500 block">
                  {language === 'ar' ? 'عائلة العريس + العروسة' : 'Combined family lists'}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'نسبة جاهزية الخطوبة' : 'Readiness Progress'}</span>
                </div>
                <p className="text-lg sm:text-2xl font-black text-emerald-700">
                  {engagement.summary.completionPercent}%
                </p>
                <span className="text-[11px] text-gray-500 block">
                  {engagement.summary.completedTasksCount} / {engagement.summary.totalChecklistCount}{' '}
                  {language === 'ar' ? 'مكتمل' : 'done'}
                </span>
              </div>
            </div>

            {/* Engagement Plan Settings Form */}
            <form
              onSubmit={(e) => void handleSavePlan(e)}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <CalendarHeart className="w-5 h-5 text-[#D91B3E]" />
                  <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                    {language === 'ar'
                      ? 'تفاصيل الحفل، الشبكة وتوزيع الميزانية'
                      : 'Ceremony Details, Shabka & Budget Allocation'}
                  </h2>
                </div>
                <button
                  type="submit"
                  disabled={savingPlan}
                  data-testid="save-engagement-plan-btn"
                  className="bg-red-gradient text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:opacity-95 transition cursor-pointer disabled:opacity-60"
                >
                  {savingPlan
                    ? language === 'ar'
                      ? 'جاري الحفظ...'
                      : 'Saving...'
                    : language === 'ar'
                      ? 'حفظ تعديلات الخطوبة'
                      : 'Save Engagement Plan'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'تاريخ الخطوبة المستهدف' : 'Engagement Date'}
                  </label>
                  <input
                    type="date"
                    value={engagementDate}
                    onChange={(e) =>
                      setPlanDraft((p) => ({ ...p, engagementDate: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'حالة مكان الخطوبة' : 'Venue Status'}
                  </label>
                  <select
                    value={venueStatus}
                    onChange={(e) =>
                      setPlanDraft((p) => ({
                        ...p,
                        venueStatus: e.target.value as EngagementVenueStatus,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  >
                    <option value="researching">
                      {language === 'ar' ? 'جاري البحث' : 'Researching'}
                    </option>
                    <option value="shortlisted">
                      {language === 'ar' ? 'ترشيح أماكن' : 'Shortlisted'}
                    </option>
                    <option value="booked">
                      {language === 'ar' ? 'تم الحجز' : 'Booked'}
                    </option>
                    <option value="home_ceremony">
                      {language === 'ar' ? 'حفل عائلي بالمنزل' : 'Home Ceremony'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'اسم القاعة أو المكان المقترح' : 'Proposed Venue / Location'}
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setPlanDraft((p) => ({ ...p, venueName: e.target.value }))}
                    placeholder={language === 'ar' ? 'مثال: فيلا / قاعة الميرغني' : 'Venue name...'}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'سقف الميزانية (ج.م)' : 'Total Target Budget (EGP)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={targetBudget}
                    onChange={(e) =>
                      setPlanDraft((p) => ({ ...p, targetBudget: Number(e.target.value) || 0 }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'مخصص الشبكة والذهب (ج.م)' : 'Shabka / Rings Budget (EGP)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={shabkaBudget}
                    onChange={(e) =>
                      setPlanDraft((p) => ({ ...p, shabkaBudget: Number(e.target.value) || 0 }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'مخصص القاعة والضيافة (ج.م)' : 'Venue & Hospitality (EGP)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={venueBudget}
                    onChange={(e) =>
                      setPlanDraft((p) => ({ ...p, venueBudget: Number(e.target.value) || 0 }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'ملاحظات الدبل والشبكة' : 'Rings & Shabka Notes'}
                  </label>
                  <input
                    type="text"
                    value={ringNotes}
                    onChange={(e) => setPlanDraft((p) => ({ ...p, ringNotes: e.target.value }))}
                    placeholder={
                      language === 'ar' ? 'مقاسات الدبل / العيار المفضل...' : 'Ring sizes & gold karat notes...'
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'ملاحظات تنسيق العائلتين' : 'Family Coordination Notes'}
                  </label>
                  <input
                    type="text"
                    value={familyNotes}
                    onChange={(e) => setPlanDraft((p) => ({ ...p, familyNotes: e.target.value }))}
                    placeholder={
                      language === 'ar'
                        ? 'اتفاقات الضيافة وتوزيع المصروفات...'
                        : 'Family agreements & hosting notes...'
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                </div>
              </div>
            </form>

            {/* Engagement Items CRUD + Add Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar'
                    ? 'قائمة مهام الخطوبة والهدايا والمدعوين'
                    : 'Engagement Checklist, Gifts & Guest Groups'}
                </h2>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ['all', language === 'ar' ? 'الكل' : 'All'],
                      ['checklist', language === 'ar' ? 'المهام' : 'Checklist'],
                      ['gift_ring', language === 'ar' ? 'الشبكة والدبل' : 'Rings & Gifts'],
                      ['guest_group', language === 'ar' ? 'المدعوون' : 'Guests'],
                      ['budget_line', language === 'ar' ? 'التكاليف' : 'Costs'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilterType(key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        filterType === key
                          ? 'bg-[#D91B3E] text-white shadow-xs'
                          : 'bg-[#FAF7F2] text-gray-700 hover:bg-[#FDE8ED]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Item Form */}
              <form
                onSubmit={(e) => void handleCreateItem(e)}
                data-testid="add-engagement-item-form"
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as EngagementItemType)}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="checklist">{language === 'ar' ? 'مهمة' : 'Checklist'}</option>
                    <option value="gift_ring">{language === 'ar' ? 'شبكة/هدية' : 'Gift/Ring'}</option>
                    <option value="guest_group">{language === 'ar' ? 'مدعوون' : 'Guest List'}</option>
                    <option value="budget_line">{language === 'ar' ? 'بند تكلفة' : 'Cost Item'}</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'العنوان / البند' : 'Item Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    data-testid="engagement-new-title-input"
                    placeholder={
                      language === 'ar' ? 'مثال: تورتة الخطوبة وبوفيه الضيافة' : 'e.g., Engagement dessert table'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'المسؤولية' : 'Side'}
                  </label>
                  <select
                    value={newSide}
                    onChange={(e) => setNewSide(e.target.value as 'groom' | 'bride' | 'shared')}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="shared">{language === 'ar' ? 'مشترك' : 'Shared'}</option>
                    <option value="groom">{language === 'ar' ? 'العريس' : 'Groom'}</option>
                    <option value="bride">{language === 'ar' ? 'العروسة' : 'Bride'}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {newItemType === 'guest_group'
                      ? language === 'ar'
                        ? 'عدد المدعوين'
                        : 'Guests'
                      : language === 'ar'
                        ? 'التكلفة المتوقعة'
                        : 'Est. Cost'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemType === 'guest_group' ? newGuestCount : newEstimatedCost}
                    onChange={(e) =>
                      newItemType === 'guest_group'
                        ? setNewGuestCount(Number(e.target.value) || 0)
                        : setNewEstimatedCost(Number(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submittingItem}
                    data-testid="add-engagement-item-btn"
                    className="w-full bg-red-gradient text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
              </form>

              {/* Items List */}
              <div className="space-y-2.5">
                {filteredItems.map((it) => (
                  <div
                    key={it.id}
                    data-testid={`engagement-item-${it.id}`}
                    className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-rose-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          void patchEngagementItem(it.id, { status: cycleStatus(it.status) })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 cursor-pointer border ${
                          it.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : it.status === 'in_progress'
                              ? 'bg-[#FDE8ED] text-[#D91B3E] border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {it.status === 'done'
                          ? language === 'ar'
                            ? 'مكتمل ✓'
                            : 'Done ✓'
                          : it.status === 'in_progress'
                            ? language === 'ar'
                              ? 'قيد التنفيذ'
                              : 'In Progress'
                            : language === 'ar'
                              ? 'مخطط'
                              : 'Planned'}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-bold text-[#2A1D20] ${
                            it.status === 'done' ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {language === 'ar' ? it.titleAr : it.titleEn}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span>{typeLabel(it.itemType)}</span>
                          <span>•</span>
                          <span>
                            {it.ownerSide === 'groom'
                              ? language === 'ar'
                                ? 'جانب العريس'
                                : 'Groom Side'
                              : it.ownerSide === 'bride'
                                ? language === 'ar'
                                  ? 'جانب العروسة'
                                  : 'Bride Side'
                                : language === 'ar'
                                  ? 'مشترك'
                                  : 'Shared'}
                          </span>
                          {it.guestCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-[#B31331]">
                                {it.guestCount} {language === 'ar' ? 'مدعو' : 'guests'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {it.estimatedCost > 0 && (
                        <span className="text-xs font-black text-[#D91B3E]">
                          {fmtEgp(it.estimatedCost, language)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => void deleteEngagementItem(it.id)}
                        aria-label="Delete engagement item"
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


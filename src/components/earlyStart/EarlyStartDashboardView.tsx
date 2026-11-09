import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  EARLY_START_TIMEFRAME_PRESETS,
  PRIVATE_BADGE_DEFINITIONS,
  SAVINGS_GOAL_TYPES,
  simulateWhatIfScenarios,
} from '../../../shared/earlyStartData';
import type {
  EarlyStartMilestoneTrack,
  EarlyStartReminderFrequency,
  EarlyStartTimeframePreset,
  SavingsGoal,
  SavingsGoalType,
} from '../../types';
import {
  Award,
  Bell,
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Compass,
  Flame,
  GraduationCap,
  Heart,
  Lock,
  PiggyBank,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Wallet,
} from 'lucide-react';

type EarlyStartTab = 'dashboard' | 'fund' | 'simulator' | 'milestones' | 'academy';

function formatEgp(val: number, language: 'ar' | 'en'): string {
  return `${Math.round(val).toLocaleString()} ${language === 'ar' ? 'ج.م' : 'EGP'}`;
}

export const EarlyStartDashboardView: React.FC<{ initialTab?: EarlyStartTab }> = ({
  initialTab,
}) => {
  const location = useLocation();
  const {
    language,
    currentUser,
    setAuthModalOpen,
    academyLessons,
    earlyStartOverview,
    updateEarlyStartProfile,
    createSavingsGoal,
    patchSavingsGoal,
    deleteSavingsGoal,
    recordSavingsContribution,
    addEarlyStartMilestone,
    toggleEarlyStartMilestone,
    deleteEarlyStartMilestone,
    toggleAcademyLessonComplete,
  } = useApp();

  const resolvedDefaultTab: EarlyStartTab = useMemo(() => {
    if (initialTab) return initialTab;
    if (location.pathname.startsWith('/my/future-fund')) return 'fund';
    if (location.pathname.startsWith('/early-start/academy')) return 'academy';
    return 'dashboard';
  }, [initialTab, location.pathname]);

  const [tabOverride, setTabOverride] = useState<{ path: string; tab: EarlyStartTab } | null>(
    null,
  );
  const activeTab =
    tabOverride && tabOverride.path === location.pathname ? tabOverride.tab : resolvedDefaultTab;
  const setActiveTab = (tab: EarlyStartTab) => {
    setTabOverride({ path: location.pathname, tab });
  };

  // Profile editor draft overrides (derived seamlessly from SQLite overview without useEffect)
  const [profileDraft, setProfileDraft] = useState<{
    preset?: EarlyStartTimeframePreset;
    months?: number;
    targetBudget?: number;
    monthlyTarget?: number;
    reminderFreq?: EarlyStartReminderFrequency;
    notes?: string;
  }>({});
  const preset = profileDraft.preset ?? earlyStartOverview?.profile.timeframePreset ?? '5y';
  const months = profileDraft.months ?? earlyStartOverview?.profile.timeframeMonths ?? 60;
  const targetBudget =
    profileDraft.targetBudget ?? earlyStartOverview?.profile.targetMarriageBudget ?? 650000;
  const initialCapital = earlyStartOverview?.profile.initialCapital ?? 50000;
  const monthlyTarget =
    profileDraft.monthlyTarget ?? earlyStartOverview?.profile.monthlySavingsTarget ?? 6500;
  const emergencyTarget = earlyStartOverview?.profile.emergencyReserveTarget ?? 65000;
  const reminderFreq =
    profileDraft.reminderFreq ?? earlyStartOverview?.profile.reminderFrequency ?? 'monthly';
  const notes = profileDraft.notes ?? earlyStartOverview?.profile.personalNotes ?? '';

  const setPreset = (v: EarlyStartTimeframePreset) =>
    setProfileDraft((prev) => ({ ...prev, preset: v }));
  const setMonths = (v: number) => setProfileDraft((prev) => ({ ...prev, months: v }));
  const setTargetBudget = (v: number) =>
    setProfileDraft((prev) => ({ ...prev, targetBudget: v }));
  const setMonthlyTarget = (v: number) =>
    setProfileDraft((prev) => ({ ...prev, monthlyTarget: v }));
  const setReminderFreq = (v: EarlyStartReminderFrequency) =>
    setProfileDraft((prev) => ({ ...prev, reminderFreq: v }));
  const setNotes = (v: string) => setProfileDraft((prev) => ({ ...prev, notes: v }));
  const [savingProfile, setSavingProfile] = useState(false);

  // What-If Simulator draft overrides
  const [simDraft, setSimDraft] = useState<{
    initial?: number;
    monthly?: number;
    stepUp?: number;
    horizon?: number;
    todayCost?: number;
    escalation?: number;
  }>({});
  const simInitial =
    simDraft.initial ??
    (earlyStartOverview ? earlyStartOverview.summary.totalCurrentSaved || initialCapital : 50000);
  const simMonthly =
    simDraft.monthly ?? (earlyStartOverview ? earlyStartOverview.profile.monthlySavingsTarget || 3000 : 3000);
  const simStepUp = simDraft.stepUp ?? 10;
  const simHorizon =
    simDraft.horizon ?? earlyStartOverview?.profile.timeframeMonths ?? 36;
  const simTodayCost =
    simDraft.todayCost ?? earlyStartOverview?.profile.targetMarriageBudget ?? 600000;
  const simEscalation = simDraft.escalation ?? 8;

  const setSimInitial = (v: number) => setSimDraft((prev) => ({ ...prev, initial: v }));
  const setSimMonthly = (v: number) => setSimDraft((prev) => ({ ...prev, monthly: v }));
  const setSimStepUp = (v: number) => setSimDraft((prev) => ({ ...prev, stepUp: v }));
  const setSimHorizon = (v: number) => setSimDraft((prev) => ({ ...prev, horizon: v }));
  const setSimTodayCost = (v: number) => setSimDraft((prev) => ({ ...prev, todayCost: v }));
  const setSimEscalation = (v: number) => setSimDraft((prev) => ({ ...prev, escalation: v }));

  // New Goal form state
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<SavingsGoalType>('furniture');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(120000);
  const [newGoalCurrent, setNewGoalCurrent] = useState(0);
  const [newGoalMonthly, setNewGoalMonthly] = useState(2500);
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Deposit/Contribution form state for a selected goal
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [depositType, setDepositType] = useState<'deposit' | 'adjustment'>('deposit');
  const [depositDate, setDepositDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [depositNote, setDepositNote] = useState<string>('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  // Edit Goal target modal/inline state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalTarget, setEditGoalTarget] = useState<number>(100000);
  const [editGoalMonthly, setEditGoalMonthly] = useState<number>(2000);

  // Milestones filter & add form
  const [milestoneFilter, setMilestoneFilter] = useState<EarlyStartMilestoneTrack | 'all'>('all');
  const [newMsTrack, setNewMsTrack] = useState<EarlyStartMilestoneTrack>('financial');
  const [newMsTitle, setNewMsTitle] = useState('');
  const [newMsMonthsOut, setNewMsMonthsOut] = useState(12);
  const [submittingMs, setSubmittingMs] = useState(false);

  // Academy state
  const [academyTrack, setAcademyTrack] = useState<EarlyStartMilestoneTrack | 'all'>('all');
  const [openLessonSlug, setOpenLessonSlug] = useState<string>(
    EARLY_START_ACADEMY_DEFAULT_SLUG(academyLessons),
  );

  const simResult = useMemo(
    () =>
      simulateWhatIfScenarios({
        initialCapitalEgp: simInitial,
        baseMonthlyEgp: simMonthly,
        horizonMonths: simHorizon,
        annualStepUpPercent: simStepUp,
        todayTargetCostEgp: simTodayCost,
        assumedAnnualCostEscalationPercent: simEscalation,
      }),
    [simInitial, simMonthly, simHorizon, simStepUp, simTodayCost, simEscalation],
  );

  const handleSelectPreset = (key: EarlyStartTimeframePreset) => {
    const meta = EARLY_START_TIMEFRAME_PRESETS.find((p) => p.key === key);
    setProfileDraft((prev) => ({
      ...prev,
      preset: key,
      months: meta && key !== 'custom' ? meta.months : prev.months,
    }));
    if (meta && key !== 'custom') {
      setSimHorizon(meta.months);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setSavingProfile(true);
    try {
      await updateEarlyStartProfile({
        timeframePreset: preset,
        timeframeMonths: months,
        targetMarriageBudget: targetBudget,
        initialCapital,
        monthlySavingsTarget: monthlyTarget,
        emergencyReserveTarget: emergencyTarget,
        reminderFrequency: reminderFreq,
        personalNotes: notes.trim() || null,
      });
      setProfileDraft({});
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const meta = SAVINGS_GOAL_TYPES.find((g) => g.type === newGoalType)!;
    const cleanTitle = newGoalTitle.trim() || (language === 'ar' ? meta.labelAr : meta.labelEn);
    setSubmittingGoal(true);
    try {
      await createSavingsGoal({
        goalType: newGoalType,
        titleAr: cleanTitle,
        titleEn: newGoalTitle.trim() || meta.labelEn,
        targetAmount: Math.max(1000, newGoalTarget),
        currentAmount: Math.max(0, newGoalCurrent),
        monthlyContribution: Math.max(0, newGoalMonthly),
      });
      setShowAddGoal(false);
      setNewGoalTitle('');
      setNewGoalCurrent(0);
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleOpenDeposit = (goal: SavingsGoal) => {
    setDepositGoalId(goal.id);
    setDepositAmount(goal.monthlyContribution > 0 ? goal.monthlyContribution : 5000);
    setDepositType('deposit');
    setDepositDate(new Date().toISOString().slice(0, 10));
    setDepositNote('');
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || depositAmount === 0) return;
    setSubmittingDeposit(true);
    try {
      await recordSavingsContribution(depositGoalId, {
        amount: depositAmount,
        contributionType: depositType,
        contributionDate: depositDate,
        note: depositNote.trim() || undefined,
      });
      setDepositGoalId(null);
      setDepositNote('');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const handleSaveGoalEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoalId) return;
    await patchSavingsGoal(editingGoalId, {
      targetAmount: Math.max(1000, editGoalTarget),
      monthlyContribution: Math.max(0, editGoalMonthly),
    });
    setEditingGoalId(null);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const title = newMsTitle.trim();
    if (title.length < 3) return;
    setSubmittingMs(true);
    try {
      await addEarlyStartMilestone({
        track: newMsTrack,
        titleAr: title,
        titleEn: title,
        targetMonthsOut: Math.min(120, Math.max(1, newMsMonthsOut)),
      });
      setNewMsTitle('');
    } finally {
      setSubmittingMs(false);
    }
  };

  const filteredAcademy = useMemo(
    () =>
      academyTrack === 'all'
        ? academyLessons
        : academyLessons.filter((l) => l.track === academyTrack),
    [academyLessons, academyTrack],
  );

  const completedLessons = earlyStartOverview?.completedLessonSlugs ?? [];
  const filteredMilestones = useMemo(() => {
    const list = earlyStartOverview?.milestones ?? [];
    return milestoneFilter === 'all' ? list : list.filter((m) => m.track === milestoneFilter);
  }, [earlyStartOverview, milestoneFilter]);

  const maxChartCum = useMemo(() => {
    const pts = earlyStartOverview?.monthlyHistory ?? [];
    return Math.max(1, ...pts.map((p) => p.cumulativeEgp));
  }, [earlyStartOverview]);

  return (
    <div className="space-y-10 pb-24">
      {/* Crimson Early Start Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-12 lg:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
                <Compass className="w-4 h-4 text-white" />
                <span>
                  {language === 'ar'
                    ? 'جواز إن البداية المبكرة — التخطيط قبل الخطوبة حتى 10 سنوات'
                    : 'GAWAZ INN EARLY START — 6 Months to 10 Years Preparation'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {language === 'ar'
                  ? 'لوحة البداية المبكرة وصندوق مستقبلك'
                  : 'Early Start Dashboard & My Future Fund'}
              </h1>

              <p className="text-xs sm:text-base text-rose-100 leading-relaxed">
                {language === 'ar'
                  ? 'خطّط لمستقبلك ومقدم شقتك وتشطيبك قبل الخطوبة بمرونة كاملة: احسب مدخراتك، أنشئ أهدافك السبعة، اختبر سيناريوهات "ماذا لو؟"، وتدرّب بأكاديمية البداية المبكرة بخصوصية تامة 100%.'
                  : 'Start saving and building financial discipline 6 months to 10 years before marriage: manage 7 ring-fenced goals, test What-If scenarios transparently, track streaks privately, and learn in Early Start Academy.'}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 border border-white/15 text-[11px] text-rose-100 font-medium">
                <Lock className="w-3.5 h-3.5 text-[#FF8FA3] shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'أداة تخطيط شخصي خاصة — ليست حساباً بنكياً ولا وعود عوائد استثمارية ولا مقارنات عامة.'
                    : 'Strictly Private Planning Tool — Not a Bank Account • Zero Return Hype • Zero Public Comparison.'}
                </span>
              </div>
            </div>

            {/* Dark Quick Summary Telemetry Card */}
            <div className="bg-gradient-to-br from-[#1C1819] to-[#2B181A] border border-rose-900/40 rounded-3xl p-6 w-full lg:w-88 shrink-0 space-y-4 shadow-2xl">
              {currentUser && earlyStartOverview ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-200">
                      {language === 'ar' ? 'إجمالي مدخراتك الحالية' : 'Total Tracked Cash'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                      <Flame className="w-3.5 h-3.5" />
                      {earlyStartOverview.summary.streakMonths}{' '}
                      {language === 'ar' ? 'شهر متواصل' : 'mo streak'}
                    </span>
                  </div>
                  <div
                    data-testid="early-start-total-saved"
                    className="text-2xl sm:text-3xl font-black text-[#FF4D6D]"
                  >
                    {formatEgp(earlyStartOverview.summary.totalCurrentSaved, language)}
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D91B3E] to-[#FF4D6D] transition-all"
                      style={{ width: `${earlyStartOverview.summary.overallCompletionPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-300">
                    <span>
                      {earlyStartOverview.summary.overallCompletionPercent}%{' '}
                      {language === 'ar' ? 'من المستهدف' : 'funded'}
                    </span>
                    <span>
                      {language === 'ar' ? 'الهدف:' : 'Goal:'}{' '}
                      {formatEgp(earlyStartOverview.summary.totalGoalsTarget, language)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-200">
                      {language === 'ar' ? 'صندوق مستقبلك الشخصي' : 'Personal Future Fund'}
                    </span>
                    <PiggyBank className="w-5 h-5 text-[#FF4D6D]" />
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {language === 'ar'
                      ? 'يمكنك استخدام محاكي "ماذا لو؟" وتصفح الأكاديمية مجاناً الآن، أو تسجيل الدخول لحفظ صندوق مستقبلك وسلسلة ادخارك الخاصة.'
                      : 'Simulate What-If scenarios and study all 10 Academy modules freely, or sign in to save your private Future Fund goals and streaks.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    data-testid="early-start-hero-signin"
                    className="w-full py-2.5 px-4 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
                  >
                    {language === 'ar' ? 'تسجيل الدخول لحفظ صندوقي' : 'Sign In to Save My Fund'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Sub-Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(
              [
                {
                  key: 'dashboard',
                  labelAr: 'لوحة البداية والأفق الزمني',
                  labelEn: 'Overview & Timeline',
                  icon: <Compass className="w-3.5 h-3.5" />,
                },
                {
                  key: 'fund',
                  labelAr: 'صندوق مستقبلي (7 أوعية)',
                  labelEn: 'My Future Fund (7 Buckets)',
                  icon: <PiggyBank className="w-3.5 h-3.5" />,
                },
                {
                  key: 'simulator',
                  labelAr: 'حاسبة الادخار ومحاكي ماذا لو',
                  labelEn: 'Savings & What-If Simulator',
                  icon: <TrendingUp className="w-3.5 h-3.5" />,
                },
                {
                  key: 'milestones',
                  labelAr: 'المراحل والشارات الخاصة',
                  labelEn: 'Milestones & Private Badges',
                  icon: <Award className="w-3.5 h-3.5" />,
                },
                {
                  key: 'academy',
                  labelAr: `أكاديمية البداية (${academyLessons.length} وحدات)`,
                  labelEn: `Academy (${academyLessons.length} Lessons)`,
                  icon: <GraduationCap className="w-3.5 h-3.5" />,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                data-testid={`early-start-tab-${tab.key}`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-white text-[#D91B3E] shadow-lg'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/15'
                }`}
              >
                {tab.icon}
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= TAB 1: DASHBOARD & TIMELINE ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {!currentUser ? (
              <SignInPromptBanner
                language={language}
                onSignIn={() => setAuthModalOpen(true)}
                onSwitchToSimulator={() => setActiveTab('simulator')}
              />
            ) : (
              earlyStartOverview && (
                <>
                  {/* 4 Key Telemetry Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      label={language === 'ar' ? 'الرصيد الفعلي اليوم' : 'Current Cash Saved'}
                      sublabel={language === 'ar' ? 'أموال فعلية متتبعة (الآن)' : "Today's tracked cash"}
                      value={formatEgp(earlyStartOverview.summary.totalCurrentSaved, language)}
                      accent="text-[#D91B3E]"
                      icon={<Wallet className="w-5 h-5 text-[#D91B3E]" />}
                    />
                    <MetricCard
                      label={language === 'ar' ? 'الهدف المستقبلي الكلي' : 'Projected Future Target'}
                      sublabel={
                        language === 'ar'
                          ? `أفق: ${earlyStartOverview.profile.timeframeMonths} شهراً`
                          : `Horizon: ${earlyStartOverview.profile.timeframeMonths} months`
                      }
                      value={formatEgp(earlyStartOverview.summary.totalGoalsTarget, language)}
                      accent="text-[#2A1D20]"
                      icon={<Calendar className="w-5 h-5 text-[#B31331]" />}
                    />
                    <MetricCard
                      label={language === 'ar' ? 'الادخار الشهري المقترح' : 'Required Monthly Pace'}
                      sublabel={`${language === 'ar' ? 'سنوياً:' : 'Annual:'} ${formatEgp(
                        earlyStartOverview.summary.annualSavingsTarget,
                        language,
                      )}`}
                      value={formatEgp(earlyStartOverview.summary.recommendedMonthlyNeeded, language)}
                      accent="text-emerald-700"
                      icon={<TrendingUp className="w-5 h-5 text-emerald-700" />}
                    />
                    <MetricCard
                      label={language === 'ar' ? 'احتياطي الطوارئ (معزول)' : 'Emergency Reserve'}
                      sublabel={`${formatEgp(
                        earlyStartOverview.summary.emergencySaved,
                        language,
                      )} / ${formatEgp(earlyStartOverview.summary.emergencyTarget, language)}`}
                      value={`${
                        earlyStartOverview.summary.emergencyTarget > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (earlyStartOverview.summary.emergencySaved /
                                  earlyStartOverview.summary.emergencyTarget) *
                                  100,
                              ),
                            )
                          : 0
                      }%`}
                      accent="text-amber-700"
                      icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
                    />
                  </div>

                  {/* Timeframe & Goal Profile Adjustment Card + Monthly SVG Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <form
                      onSubmit={handleSaveProfile}
                      className="lg:col-span-7 bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h2 className="text-lg font-black text-[#2A1D20]">
                            {language === 'ar'
                              ? 'تخصيص الأفق الزمني للزواج (حتى 10 سنوات)'
                              : 'Flexible Preparation Horizon (6m to 10y)'}
                          </h2>
                          <p className="text-xs text-gray-500">
                            {language === 'ar'
                              ? 'اختر المدة المناسبة لك وعدّل أهدافك في أي وقت بدون التزامات جامدة.'
                              : 'Adjust your timeline anytime between 6 months, 3 years, 10 years, or custom months.'}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDE8ED] text-[#B31331] text-[11px] font-bold">
                          <Lock className="w-3 h-3" />
                          {language === 'ar' ? 'لوحة خاصة بك فقط' : 'Private Only'}
                        </span>
                      </div>

                      {/* 8 Preset Pills */}
                      <div className="flex flex-wrap gap-2">
                        {EARLY_START_TIMEFRAME_PRESETS.map((p) => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => handleSelectPreset(p.key)}
                            data-testid={`timeframe-preset-${p.key}`}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              preset === p.key
                                ? 'bg-[#D91B3E] text-white border-[#D91B3E] shadow-xs'
                                : 'bg-[#FAF7F2] text-gray-700 border-gray-200 hover:bg-[#FDE8ED]'
                            }`}
                          >
                            {language === 'ar' ? p.labelAr : p.labelEn}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>
                            {language === 'ar' ? 'المدة بالأشهر (3 – 120)' : 'Custom Horizon (3 – 120 months)'}
                          </span>
                          <input
                            type="number"
                            min={3}
                            max={120}
                            value={months}
                            onChange={(e) => {
                              setPreset('custom');
                              setMonths(Math.min(120, Math.max(3, Number(e.target.value) || 3)));
                            }}
                            data-testid="early-profile-months-input"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>
                            {language === 'ar' ? 'الميزانية المستهدفة (ج.م)' : 'Target Marriage Budget (EGP)'}
                          </span>
                          <input
                            type="number"
                            min={20000}
                            step={10000}
                            value={targetBudget}
                            onChange={(e) => setTargetBudget(Math.max(20000, Number(e.target.value) || 0))}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>
                            {language === 'ar' ? 'هدف الادخار الشهري (ج.م)' : 'Monthly Savings Target (EGP)'}
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={500}
                            value={monthlyTarget}
                            onChange={(e) => setMonthlyTarget(Math.max(0, Number(e.target.value) || 0))}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span className="flex items-center gap-1">
                            <Bell className="w-3.5 h-3.5 text-[#D91B3E]" />
                            {language === 'ar' ? 'التذكير الشخصي بالادخار' : 'Private Savings Reminder'}
                          </span>
                          <select
                            value={reminderFreq}
                            onChange={(e) => setReminderFreq(e.target.value as EarlyStartReminderFrequency)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none bg-white"
                          >
                            <option value="weekly">{language === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
                            <option value="biweekly">{language === 'ar' ? 'كل أسبوعين' : 'Biweekly'}</option>
                            <option value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</option>
                            <option value="off">{language === 'ar' ? 'إيقاف التذكير' : 'Off'}</option>
                          </select>
                        </label>
                      </div>

                      <label className="block space-y-1 text-xs font-bold text-gray-700">
                        <span>{language === 'ar' ? 'ملاحظاتك وأولوياتك الشخصية' : 'Private Personal Notes'}</span>
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={
                            language === 'ar'
                              ? 'مثال: التركيز على مقدم الشقة خلال السنتين القادمتين ثم التشطيب...'
                              : 'Example: Prioritize apartment down payment in years 1-2, then finishing...'
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                        />
                      </label>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <span className="text-[11px] text-gray-500">
                          {language === 'ar' ? 'التاريخ المستهدف المرجعي:' : 'Projected date:'}{' '}
                          <strong className="text-[#2A1D20]">
                            {earlyStartOverview.profile.expectedMarriageDate || '—'}
                          </strong>
                        </span>
                        <button
                          type="submit"
                          disabled={savingProfile}
                          data-testid="early-profile-save-btn"
                          className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
                        >
                          {savingProfile
                            ? language === 'ar'
                              ? 'جاري الحفظ...'
                              : 'Saving...'
                            : language === 'ar'
                              ? 'حفظ تعديلات الخطة'
                              : 'Save Plan Adjustment'}
                        </button>
                      </div>
                    </form>

                    {/* Monthly Progress Chart & Quick Ecosystem Bridge */}
                    <div className="lg:col-span-5 space-y-5">
                      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black text-[#2A1D20]">
                            {language === 'ar' ? 'منحنى نمو الادخار الشهري' : 'Cumulative Savings Growth'}
                          </h3>
                          <span className="text-[11px] font-bold text-[#D91B3E]">
                            {earlyStartOverview.monthlyHistory.length}{' '}
                            {language === 'ar' ? 'أشهر مسجلة' : 'months'}
                          </span>
                        </div>

                        {earlyStartOverview.monthlyHistory.length === 0 ? (
                          <div className="p-6 rounded-2xl bg-[#FAF7F2] text-center text-xs text-gray-500">
                            {language === 'ar'
                              ? 'سجّل أول إيداع داخل صندوق مستقبلك لعرض التقرير والمنحنى الشهري.'
                              : 'Log your first contribution in My Future Fund to plot monthly growth.'}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <svg
                              viewBox="0 0 320 130"
                              role="img"
                              aria-label="Savings progress chart"
                              className="w-full h-32 bg-[#FAF7F2] rounded-2xl p-2 border border-rose-100"
                            >
                              {earlyStartOverview.monthlyHistory.slice(-6).map((pt, i, arr) => {
                                const barW = Math.max(20, Math.floor(240 / arr.length) - 10);
                                const stepX = Math.floor(270 / Math.max(1, arr.length));
                                const x = 25 + i * stepX;
                                const h = Math.max(8, Math.round((pt.cumulativeEgp / maxChartCum) * 84));
                                const y = 98 - h;
                                return (
                                  <g key={pt.month}>
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barW}
                                      height={h}
                                      rx="5"
                                      fill="#D91B3E"
                                    />
                                    <text
                                      x={x + barW / 2}
                                      y={116}
                                      textAnchor="middle"
                                      fontSize="9"
                                      fill="#2A1D20"
                                      fontWeight="bold"
                                    >
                                      {pt.month.slice(2)}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>

                            <div className="space-y-1.5">
                              {earlyStartOverview.monthlyHistory.slice(-4).map((pt) => (
                                <div
                                  key={pt.month}
                                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-[#FAF7F2]"
                                >
                                  <span className="font-bold text-[#2A1D20]">{pt.month}</span>
                                  <span className="text-emerald-700 font-bold">
                                    +{formatEgp(pt.depositedEgp, language)}
                                  </span>
                                  <span className="text-gray-600">
                                    {formatEgp(pt.cumulativeEgp, language)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ecosystem Bridge Card */}
                      <div className="bg-gradient-to-br from-[#FAF7F2] to-[#FDE8ED] rounded-3xl p-5 border border-[#D91B3E]/20 space-y-3">
                        <h3 className="text-sm font-black text-[#2A1D20]">
                          {language === 'ar'
                            ? 'اربط خطتك المبكرة بباقي منظومة جواز إن'
                            : 'Connect Early Start Across GAWAZ INN'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to="/my/budget"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#D91B3E] border border-[#D91B3E]/25 text-xs font-bold hover:bg-[#D91B3E] hover:text-white transition"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تتبع المصروفات (الميزانية)' : 'Expense Budget'}</span>
                          </Link>
                          <Link
                            to="/calculators/monthly-savings"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#2A1D20] border border-gray-200 text-xs font-bold hover:border-[#D91B3E]/40 transition"
                          >
                            <Calculator className="w-3.5 h-3.5 text-[#D91B3E]" />
                            <span>{language === 'ar' ? 'حاسبة الادخار #18' : 'Savings Calc #18'}</span>
                          </Link>
                          <Link
                            to="/calculators/long-term-projections"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#2A1D20] border border-gray-200 text-xs font-bold hover:border-[#D91B3E]/40 transition"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-[#D91B3E]" />
                            <span>{language === 'ar' ? 'التوقعات المستقبلية #19' : 'Projections #19'}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        )}

        {/* ================= TAB 2: MY FUTURE FUND (7 GOAL CATEGORIES) ================= */}
        {activeTab === 'fund' && (
          <div className="space-y-8">
            {!currentUser ? (
              <SignInPromptBanner
                language={language}
                onSignIn={() => setAuthModalOpen(true)}
                onSwitchToSimulator={() => setActiveTab('simulator')}
              />
            ) : (
              earlyStartOverview && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-[#2A1D20]">
                        {language === 'ar'
                          ? 'صندوق مستقبلي — إدارة أهداف الادخار السبعة'
                          : 'My Future Fund — 7 Dedicated Financial Goals'}
                      </h2>
                      <p className="text-xs text-gray-600">
                        {language === 'ar'
                          ? 'قسّم مدخراتك إلى أوعية واضحة (مقدم الشقة، التشطيب، الأثاث، الأجهزة، الفرح، الزواج الكلي، واحتياطي الطوارئ).'
                          : 'Track separate goals for Marriage, Apartment Purchase, Finishing, Furniture, Appliances, Wedding, and Ring-Fenced Emergency Reserve.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddGoal(!showAddGoal)}
                      data-testid="toggle-add-goal-btn"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'إضافة هدف ادخار جديد' : 'Add Savings Goal'}</span>
                    </button>
                  </div>

                  {/* Quick Add Missing Category Goal Panel */}
                  {showAddGoal && (
                    <form
                      onSubmit={handleCreateGoal}
                      data-testid="add-goal-form"
                      className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#D91B3E]/25 space-y-4 shadow-sm"
                    >
                      <h3 className="text-sm font-black text-[#2A1D20]">
                        {language === 'ar' ? 'إنشاء هدف ادخار جديد في صندوق مستقبلك' : 'Create New Savings Goal Bucket'}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'تصنيف الهدف' : 'Goal Category'}</span>
                          <select
                            value={newGoalType}
                            onChange={(e) => {
                              const gt = e.target.value as SavingsGoalType;
                              setNewGoalType(gt);
                              const def = SAVINGS_GOAL_TYPES.find((x) => x.type === gt);
                              if (def) setNewGoalTarget(def.defaultTargetEgp);
                            }}
                            data-testid="new-goal-type-select"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#D91B3E] outline-none"
                          >
                            {SAVINGS_GOAL_TYPES.map((g) => (
                              <option key={g.type} value={g.type}>
                                {language === 'ar' ? g.labelAr : g.labelEn}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'اسم الهدف' : 'Goal Title'}</span>
                          <input
                            type="text"
                            value={newGoalTitle}
                            onChange={(e) => setNewGoalTitle(e.target.value)}
                            data-testid="new-goal-title-input"
                            placeholder={language === 'ar' ? 'مثال: صندوق أجهزة المطبخ' : 'e.g. Appliances Fund'}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'المبلغ المستهدف (ج.م)' : 'Target (EGP)'}</span>
                          <input
                            type="number"
                            min={1000}
                            value={newGoalTarget}
                            onChange={(e) => setNewGoalTarget(Number(e.target.value) || 1000)}
                            data-testid="new-goal-target-input"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'الرصيد الافتتاحي (ج.م)' : 'Initial Saved (EGP)'}</span>
                          <input
                            type="number"
                            min={0}
                            value={newGoalCurrent}
                            onChange={(e) => setNewGoalCurrent(Number(e.target.value) || 0)}
                            data-testid="new-goal-initial-input"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'القسط الشهري (ج.م)' : 'Monthly Contribution'}</span>
                          <input
                            type="number"
                            min={0}
                            value={newGoalMonthly}
                            onChange={(e) => setNewGoalMonthly(Number(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddGoal(false)}
                          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 cursor-pointer"
                        >
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={submittingGoal}
                          data-testid="create-goal-submit-btn"
                          className="px-5 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md cursor-pointer"
                        >
                          {submittingGoal
                            ? language === 'ar'
                              ? 'جاري الإنشاء...'
                              : 'Creating...'
                            : language === 'ar'
                              ? 'حفظ الهدف'
                              : 'Save Goal'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Log Deposit Modal / Inline Banner */}
                  {depositGoalId && (
                    <form
                      onSubmit={handleSubmitDeposit}
                      data-testid="deposit-form"
                      className="bg-white rounded-3xl p-6 border-2 border-[#D91B3E]/40 shadow-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-[#D91B3E]">
                          {language === 'ar'
                            ? 'تسجيل إيداع أو تسوية رصيد في الهدف المحدد'
                            : 'Log Savings Deposit / Balance Adjustment'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setDepositGoalId(null)}
                          className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                        >
                          {language === 'ar' ? 'إغلاق' : 'Close'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'المبلغ (ج.م)' : 'Amount (EGP)'}</span>
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                            data-testid="deposit-amount-input"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'النوع' : 'Entry Type'}</span>
                          <select
                            value={depositType}
                            onChange={(e) =>
                              setDepositType(e.target.value as 'deposit' | 'adjustment')
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#D91B3E] outline-none"
                          >
                            <option value="deposit">{language === 'ar' ? 'إيداع شهري' : 'Deposit'}</option>
                            <option value="adjustment">{language === 'ar' ? 'تعديل رصيد' : 'Adjustment'}</option>
                          </select>
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'التاريخ' : 'Date'}</span>
                          <input
                            type="date"
                            value={depositDate}
                            onChange={(e) => setDepositDate(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          <span>{language === 'ar' ? 'ملاحظة اختيارية' : 'Note'}</span>
                          <input
                            type="text"
                            value={depositNote}
                            onChange={(e) => setDepositNote(e.target.value)}
                            data-testid="deposit-note-input"
                            placeholder={language === 'ar' ? 'تحويل الراتب الشهري' : 'Monthly transfer'}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                          />
                        </label>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingDeposit}
                          data-testid="deposit-submit-btn"
                          className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md cursor-pointer"
                        >
                          {submittingDeposit
                            ? language === 'ar'
                              ? 'جاري التسجيل...'
                              : 'Recording...'
                            : language === 'ar'
                              ? 'تأكيد تسجيل الإيداع'
                              : 'Confirm Contribution'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Active Goals Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {earlyStartOverview.goals.map((goal) => {
                      const catMeta = SAVINGS_GOAL_TYPES.find((t) => t.type === goal.goalType);
                      const isEditing = editingGoalId === goal.id;
                      return (
                        <div
                          key={goal.id}
                          data-testid={`savings-goal-card-${goal.goalType}`}
                          className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FDE8ED] text-[#B31331] text-[10px] font-bold">
                                  {catMeta
                                    ? language === 'ar'
                                      ? catMeta.labelAr
                                      : catMeta.labelEn
                                    : goal.goalType}
                                </span>
                                <h3 className="text-base font-black text-[#2A1D20] mt-1.5 break-words">
                                  {language === 'ar' ? goal.titleAr : goal.titleEn}
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteSavingsGoal(goal.id)}
                                title={language === 'ar' ? 'حذف الهدف' : 'Delete goal'}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-baseline justify-between text-xs">
                                <span className="font-black text-[#D91B3E] text-base">
                                  {formatEgp(goal.currentAmount, language)}
                                </span>
                                <span className="text-gray-500">
                                  / {formatEgp(goal.targetAmount, language)}
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    goal.completionPercent >= 100
                                      ? 'bg-emerald-600'
                                      : 'bg-gradient-to-r from-[#D91B3E] to-[#FF4D6D]'
                                  }`}
                                  style={{ width: `${goal.completionPercent}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-gray-600">
                                <span className="font-bold text-[#2A1D20]">
                                  {goal.completionPercent}% {language === 'ar' ? 'مكتمل' : 'funded'}
                                </span>
                                <span>
                                  {language === 'ar' ? 'متبقي:' : 'Left:'}{' '}
                                  {formatEgp(goal.remainingAmount, language)}
                                </span>
                              </div>
                            </div>

                            {isEditing && (
                              <form
                                onSubmit={handleSaveGoalEdit}
                                className="p-3 rounded-2xl bg-[#FAF7F2] border border-rose-100 space-y-2"
                              >
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <input
                                    type="number"
                                    min={1000}
                                    value={editGoalTarget}
                                    onChange={(e) => setEditGoalTarget(Number(e.target.value) || 1000)}
                                    aria-label="Edit goal target"
                                    className="px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                                  />
                                  <input
                                    type="number"
                                    min={0}
                                    value={editGoalMonthly}
                                    onChange={(e) => setEditGoalMonthly(Number(e.target.value) || 0)}
                                    aria-label="Edit monthly contribution"
                                    className="px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setEditingGoalId(null)}
                                    className="text-[11px] font-bold text-gray-500 cursor-pointer"
                                  >
                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-3 py-1 rounded-lg bg-[#D91B3E] text-white text-[11px] font-bold cursor-pointer"
                                  >
                                    {language === 'ar' ? 'حفظ' : 'Save'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                            <span className="text-[11px] text-gray-500">
                              {language === 'ar' ? 'شهري:' : 'Mo:'}{' '}
                              <strong>{formatEgp(goal.monthlyContribution, language)}</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingGoalId(goal.id);
                                  setEditGoalTarget(goal.targetAmount);
                                  setEditGoalMonthly(goal.monthlyContribution);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-gray-100 text-[11px] font-bold text-gray-700 cursor-pointer"
                              >
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeposit(goal)}
                                data-testid={`goal-deposit-btn-${goal.goalType}`}
                                className="px-3 py-1.5 rounded-xl bg-[#D91B3E] hover:bg-[#B31331] text-white text-[11px] font-bold shadow-xs cursor-pointer"
                              >
                                {language === 'ar' ? '+ إيداع' : '+ Deposit'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Contribution Ledger */}
                  <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
                    <h3 className="text-base font-black text-[#2A1D20]">
                      {language === 'ar' ? 'سجل الإيداعات والحركات الخاصة' : 'Private Savings History'}
                    </h3>
                    {earlyStartOverview.contributions.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        {language === 'ar' ? 'لا توجد إيداعات مسجلة حتى الآن.' : 'No contributions logged yet.'}
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-start">
                          <thead>
                            <tr className="border-b border-gray-200 text-gray-500">
                              <th className="py-2.5 pe-3 text-start">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                              <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الهدف' : 'Goal'}</th>
                              <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'النوع' : 'Type'}</th>
                              <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                              <th className="py-2.5 ps-3 text-start">{language === 'ar' ? 'ملاحظة' : 'Note'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {earlyStartOverview.contributions.slice(0, 15).map((c) => {
                              const g = earlyStartOverview.goals.find((x) => x.id === c.savingsGoalId);
                              return (
                                <tr key={c.id}>
                                  <td className="py-2.5 pe-3 font-medium whitespace-nowrap">
                                    {c.contributionDate}
                                  </td>
                                  <td className="py-2.5 px-3 font-bold text-[#2A1D20]">
                                    {g ? (language === 'ar' ? g.titleAr : g.titleEn) : c.savingsGoalId}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        c.contributionType === 'deposit'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-amber-50 text-amber-800'
                                      }`}
                                    >
                                      {c.contributionType === 'deposit'
                                        ? language === 'ar'
                                          ? 'إيداع'
                                          : 'Deposit'
                                        : language === 'ar'
                                          ? 'تسوية'
                                          : 'Adjust'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-black text-emerald-700 whitespace-nowrap">
                                    +{formatEgp(c.amount, language)}
                                  </td>
                                  <td className="py-2.5 ps-3 text-gray-600">{c.note || '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        )}

        {/* ================= TAB 3: SAVINGS CALCULATOR & WHAT-IF SIMULATOR ================= */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#2A1D20]">
                    {language === 'ar'
                      ? 'حاسبة الادخار التفاعلية ومحاكي "ماذا لو؟"'
                      : 'Interactive Savings Calculator & What-If Scenario Simulator'}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {language === 'ar'
                      ? 'قارن جنباً إلى جنب بين ادخار 1,000 ج.م أو 3,000 ج.م أو خطتك المتدرجة، واختبر تأجيل الموعد +12 شهراً أو زيادة التكاليف +15%.'
                      : 'Compare 1,000 vs 3,000 EGP/mo, annual income step-ups, +12m delay, and +15% cost stress scenarios side by side.'}
                  </p>
                </div>
                <Link
                  to="/calculators/monthly-savings"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FDE8ED] text-[#D91B3E] text-xs font-bold hover:bg-[#D91B3E] hover:text-white transition shrink-0"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'فتح حاسبة الادخار الكاملة #18' : 'Open Full Savings Calc #18'}</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="space-y-1 text-xs font-bold text-gray-700">
                  <span>{language === 'ar' ? 'المدخرات النقدية المتاحة حالياً (ج.م)' : 'Initial Available Savings (EGP)'}</span>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={simInitial}
                    onChange={(e) => setSimInitial(Math.max(0, Number(e.target.value) || 0))}
                    data-testid="sim-initial-input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-bold text-gray-700">
                  <span>{language === 'ar' ? 'ادخارك الشهري المخطط (ج.م)' : 'Your Monthly Contribution (EGP)'}</span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={simMonthly}
                    onChange={(e) => setSimMonthly(Math.max(0, Number(e.target.value) || 0))}
                    data-testid="sim-monthly-input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-bold text-gray-700">
                  <span>{language === 'ar' ? 'نسبة زيادة الادخار سنوياً (%)' : 'Annual Contribution Step-Up (%)'}</span>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={simStepUp}
                    onChange={(e) => setSimStepUp(Math.min(25, Math.max(0, Number(e.target.value) || 0)))}
                    data-testid="sim-stepup-input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-bold text-gray-700">
                  <span>{language === 'ar' ? 'مدة الاستعداد (3 – 120 شهراً)' : 'Preparation Window (Months)'}</span>
                  <input
                    type="number"
                    min={3}
                    max={120}
                    value={simHorizon}
                    onChange={(e) => setSimHorizon(Math.min(120, Math.max(3, Number(e.target.value) || 3)))}
                    data-testid="sim-horizon-input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-bold text-gray-700">
                  <span>{language === 'ar' ? 'التكلفة التقديرية اليوم (ج.م)' : "Today's Estimated Goal Cost (EGP)"}</span>
                  <input
                    type="number"
                    min={20000}
                    step={20000}
                    value={simTodayCost}
                    onChange={(e) => setSimTodayCost(Math.max(20000, Number(e.target.value) || 20000))}
                    data-testid="sim-cost-input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-bold text-gray-700">
                  <span>{language === 'ar' ? 'افتراض زيادة الأسعار السنوي (%)' : 'Cost Escalation Buffer (%/yr)'}</span>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={simEscalation}
                    onChange={(e) => setSimEscalation(Math.min(25, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                  />
                </label>
              </div>

              {/* Transparent Separation Banner */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100 text-xs text-gray-700 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#D91B3E] shrink-0 mt-0.5" />
                <span>
                  {language === 'ar' ? simResult.transparentDisclaimerAr : simResult.transparentDisclaimerEn}
                </span>
              </div>

              {/* Side-by-Side What-If Comparison Grid */}
              <div data-testid="whatif-comparison-table" className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-3 pe-3 text-start">{language === 'ar' ? 'السيناريو' : 'Scenario'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'البداية/شهر' : 'Start / Mo'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'المدخرات المتجمعة (نقداً)' : 'Projected Savings'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'التكلفة المتوقعة مستقبلاً' : 'Projected Future Cost'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'نسبة التغطية' : 'Coverage'}</th>
                      <th className="py-3 ps-3 text-start">{language === 'ar' ? 'الفارق (فائض/فجوة)' : 'Surplus / Gap'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {simResult.scenarios.map((sc) => (
                      <tr key={sc.key} data-testid={`whatif-row-${sc.key}`}>
                        <td className="py-3 pe-3 font-bold text-[#2A1D20]">
                          {language === 'ar' ? sc.labelAr : sc.labelEn}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {formatEgp(sc.monthlyStartEgp, language)}
                          {sc.annualStepUpPercent > 0 ? ` (+${sc.annualStepUpPercent}%/yr)` : ''}
                        </td>
                        <td className="py-3 px-3 font-black text-[#D91B3E] whitespace-nowrap">
                          {formatEgp(sc.projectedCashEgp, language)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-gray-700">
                          {formatEgp(sc.projectedGoalCostEgp, language)}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] ${
                              sc.coveragePercent >= 100
                                ? 'bg-emerald-50 text-emerald-700'
                                : sc.coveragePercent >= 70
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-rose-50 text-[#D91B3E]'
                            }`}
                          >
                            {sc.coveragePercent}%
                          </span>
                        </td>
                        <td
                          className={`py-3 ps-3 font-bold whitespace-nowrap ${
                            sc.gapOrSurplusEgp >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {sc.gapOrSurplusEgp >= 0 ? '+' : ''}
                          {formatEgp(sc.gapOrSurplusEgp, language)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: MILESTONES & PRIVATE MOTIVATION ================= */}
        {activeTab === 'milestones' && (
          <div className="space-y-8">
            {!currentUser ? (
              <SignInPromptBanner
                language={language}
                onSignIn={() => setAuthModalOpen(true)}
                onSwitchToSimulator={() => setActiveTab('simulator')}
              />
            ) : (
              earlyStartOverview && (
                <>
                  {/* Private Achievement Badges (ZERO public comparison) */}
                  <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-black text-[#2A1D20]">
                          {language === 'ar'
                            ? 'شارات الالتزام والتحفيز الشخصي (سرية 100%)'
                            : 'Private Consistency Badges & Streaks'}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {language === 'ar'
                            ? 'لا توجد أي مقارنات علنية أو ترتيب اجتماعي — تحفيزك مبني على إنجازاتك الشخصية فقط.'
                            : 'Personal milestones only — no public leaderboards or financial pressure.'}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        <Flame className="w-4 h-4 text-amber-600" />
                        {earlyStartOverview.summary.streakMonths}{' '}
                        {language === 'ar' ? 'شهر التزام متتالي' : 'consecutive months'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {PRIVATE_BADGE_DEFINITIONS.map((def) => {
                        const earned = earlyStartOverview.badges.find(
                          (b) => b.badgeKey === def.badgeKey,
                        );
                        return (
                          <div
                            key={def.badgeKey}
                            data-testid={`badge-card-${def.badgeKey}`}
                            className={`rounded-2xl p-4 border transition space-y-1.5 ${
                              earned
                                ? 'bg-gradient-to-br from-[#FFF8F9] to-[#FDE8ED] border-[#D91B3E]/30 shadow-xs'
                                : 'bg-gray-50/80 border-gray-200 opacity-75'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Award
                                className={`w-5 h-5 ${earned ? 'text-[#D91B3E]' : 'text-gray-400'}`}
                              />
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  earned
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {earned
                                  ? language === 'ar'
                                    ? 'مكتسبة ✓'
                                    : 'Earned ✓'
                                  : language === 'ar'
                                    ? 'قيد التحقيق'
                                    : 'Locked'}
                              </span>
                            </div>
                            <h3 className="text-xs font-black text-[#2A1D20]">
                              {language === 'ar' ? def.titleAr : def.titleEn}
                            </h3>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {language === 'ar' ? def.descAr : def.descEn}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personal, Financial & Housing Milestones Checklist */}
                  <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-[#2A1D20]">
                          {language === 'ar'
                            ? 'خريطة المراحل والتطوير الشخصي قبل الخطوبة'
                            : 'Preparation & Personal Development Milestones'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {earlyStartOverview.summary.milestonesCompletedCount} /{' '}
                          {earlyStartOverview.summary.milestonesTotalCount}{' '}
                          {language === 'ar' ? 'خطوات مكتملة' : 'completed'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            { key: 'all', ar: 'الكل', en: 'All' },
                            { key: 'financial', ar: 'مالي', en: 'Financial' },
                            { key: 'personal', ar: 'شخصي ومهني', en: 'Personal' },
                            { key: 'housing', ar: 'الشقة والعقار', en: 'Housing' },
                            { key: 'education', ar: 'الأكاديمية', en: 'Education' },
                          ] as const
                        ).map((f) => (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => setMilestoneFilter(f.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                              milestoneFilter === f.key
                                ? 'bg-[#D91B3E] text-white'
                                : 'bg-[#FAF7F2] text-gray-700 hover:bg-[#FDE8ED]'
                            }`}
                          >
                            {language === 'ar' ? f.ar : f.en}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {filteredMilestones.map((ms) => (
                        <div
                          key={ms.id}
                          className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition ${
                            ms.completed
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-[#FAF7F2] border-gray-200'
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={ms.completed}
                              onChange={(e) => toggleEarlyStartMilestone(ms.id, e.target.checked)}
                              className="w-4 h-4 accent-[#D91B3E] shrink-0"
                            />
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-bold break-words ${
                                  ms.completed ? 'line-through text-gray-500' : 'text-[#2A1D20]'
                                }`}
                              >
                                {language === 'ar' ? ms.titleAr : ms.titleEn}
                              </p>
                              <span className="text-[10px] text-gray-500">
                                {ms.track} • -{ms.targetMonthsOut} {language === 'ar' ? 'شهر' : 'mo out'}
                              </span>
                            </div>
                          </label>

                          <button
                            type="button"
                            onClick={() => deleteEarlyStartMilestone(ms.id)}
                            aria-label="Delete milestone"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={handleAddMilestone}
                      className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5"
                    >
                      <select
                        value={newMsTrack}
                        onChange={(e) => setNewMsTrack(e.target.value as EarlyStartMilestoneTrack)}
                        className="sm:col-span-3 px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold"
                      >
                        <option value="financial">{language === 'ar' ? 'هدف مالي' : 'Financial'}</option>
                        <option value="personal">{language === 'ar' ? 'تطوير شخصي/مهني' : 'Personal/Career'}</option>
                        <option value="housing">{language === 'ar' ? 'هدف سكن' : 'Housing'}</option>
                        <option value="education">{language === 'ar' ? 'تعليم وتوعية' : 'Education'}</option>
                      </select>
                      <input
                        type="text"
                        value={newMsTitle}
                        onChange={(e) => setNewMsTitle(e.target.value)}
                        placeholder={
                          language === 'ar'
                            ? 'أضف خطوة جديدة (مثلاً: اجتياز كورس لغة / معاينة منطقة سكنية)...'
                            : 'Add personal or financial milestone...'
                        }
                        className="sm:col-span-5 px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={newMsMonthsOut}
                        onChange={(e) => setNewMsMonthsOut(Number(e.target.value) || 12)}
                        title={language === 'ar' ? 'قبل الزواج بكم شهر' : 'Months before marriage'}
                        className="sm:col-span-2 px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={submittingMs || newMsTitle.trim().length < 3}
                        className="sm:col-span-2 px-4 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        {language === 'ar' ? '+ إضافة' : '+ Add'}
                      </button>
                    </form>
                  </div>
                </>
              )
            )}
          </div>
        )}

        {/* ================= TAB 5: EARLY START ACADEMY (10 LESSONS) ================= */}
        {activeTab === 'academy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#2A1D20]">
                  {language === 'ar'
                    ? 'أكاديمية البداية المبكرة — الثقافة المالية والاستعداد للبيت'
                    : 'Early Start Academy — 10 Essential Preparation Modules'}
                </h2>
                <p className="text-xs text-gray-600">
                  {language === 'ar'
                    ? 'مناهج عملية مصممة للسوق المصري: الادخار المنضبط، فهم العقارات، التخطيط الواقعي، وتفادي الديون الاستهلاكية.'
                    : 'Practical curriculum built for Egypt: savings habits, salary budgeting, apartment ownership realism, and debt avoidance.'}
                </p>
              </div>
              {currentUser && (
                <div className="px-4 py-2 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] text-xs font-black shrink-0">
                  {completedLessons.length} / {academyLessons.length}{' '}
                  {language === 'ar' ? 'وحدات منجزة' : 'completed'}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: 'all', ar: `الكل (${academyLessons.length})`, en: `All (${academyLessons.length})`, icon: <BookOpen className="w-3.5 h-3.5" /> },
                  { key: 'financial', ar: 'الثقافة المالية والادخار', en: 'Financial Literacy', icon: <Wallet className="w-3.5 h-3.5" /> },
                  { key: 'personal', ar: 'الدخل والعادات', en: 'Income & Habits', icon: <UserCheck className="w-3.5 h-3.5" /> },
                  { key: 'housing', ar: 'العقار والشقة', en: 'Real Estate & Finishing', icon: <Building2 className="w-3.5 h-3.5" /> },
                  { key: 'education', ar: 'التوافق والأمان الأُسري', en: 'Alignment & Safety', icon: <Heart className="w-3.5 h-3.5" /> },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setAcademyTrack(t.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    academyTrack === t.key
                      ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FDE8ED]'
                  }`}
                >
                  {t.icon}
                  <span>{language === 'ar' ? t.ar : t.en}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3" data-testid="academy-lessons-list">
              {filteredAcademy.map((lesson) => {
                const isOpen = openLessonSlug === lesson.slug;
                const isDone = completedLessons.includes(lesson.slug);
                return (
                  <div
                    key={lesson.slug}
                    data-testid={`academy-lesson-${lesson.slug}`}
                    className={`bg-white rounded-3xl border transition overflow-hidden ${
                      isDone ? 'border-emerald-300 shadow-xs' : 'border-rose-100 shadow-sm'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenLessonSlug(isOpen ? '' : lesson.slug)}
                      className="w-full p-5 flex items-center justify-between gap-3 text-start cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-[#FDE8ED] text-[#D91B3E]'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : lesson.order}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-black text-[#2A1D20] break-words">
                            {language === 'ar' ? lesson.titleAr : lesson.titleEn}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {lesson.readingMinutes} {language === 'ar' ? 'دقائق' : 'min'} •{' '}
                            {language === 'ar' ? lesson.summaryAr : lesson.summaryEn}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#D91B3E] shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-3 border-t border-gray-100 space-y-4">
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                          {language === 'ar' ? lesson.summaryAr : lesson.summaryEn}
                        </p>

                        <ul className="space-y-1.5 text-xs text-[#2A1D20]">
                          {(language === 'ar' ? lesson.keyPointsAr : lesson.keyPointsEn).map(
                            (kp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#D91B3E] shrink-0 mt-0.5" />
                                <span>{kp}</span>
                              </li>
                            ),
                          )}
                        </ul>

                        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-xs">
                            <span className="font-black text-[#D91B3E]">
                              {language === 'ar' ? 'تطبيق عملي مباشر:' : 'Action Takeaway:'}{' '}
                            </span>
                            <span className="text-gray-700 font-medium">
                              {language === 'ar'
                                ? lesson.practicalActionAr
                                : lesson.practicalActionEn}
                            </span>
                          </div>

                          {currentUser ? (
                            <button
                              type="button"
                              onClick={() => toggleAcademyLessonComplete(lesson.slug, !isDone)}
                              data-testid={`academy-complete-btn-${lesson.slug}`}
                              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${
                                isDone
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-[#D91B3E] text-white hover:bg-[#B31331]'
                              }`}
                            >
                              {isDone
                                ? language === 'ar'
                                  ? 'مكتمل ✓'
                                  : 'Completed ✓'
                                : language === 'ar'
                                  ? 'تسجيل كمنجز'
                                  : 'Mark Completed'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAuthModalOpen(true)}
                              className="px-4 py-2 rounded-xl bg-white border border-[#D91B3E]/30 text-[#D91B3E] text-xs font-bold shrink-0 cursor-pointer"
                            >
                              {language === 'ar' ? 'سجّل لحفظ التقدم' : 'Sign in to Track'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function EARLY_START_ACADEMY_DEFAULT_SLUG(list: { slug: string }[]): string {
  return list[0]?.slug || 'financial-literacy-before-engagement';
}

const MetricCard: React.FC<{
  label: string;
  sublabel: string;
  value: string;
  accent: string;
  icon: React.ReactNode;
}> = ({ label, sublabel, value, accent, icon }) => (
  <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-2">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <div className="w-8 h-8 rounded-xl bg-[#FDE8ED] flex items-center justify-center shrink-0">
        {icon}
      </div>
    </div>
    <div className={`text-xl sm:text-2xl font-black ${accent}`}>{value}</div>
    <p className="text-[11px] text-gray-500">{sublabel}</p>
  </div>
);

const SignInPromptBanner: React.FC<{
  language: 'ar' | 'en';
  onSignIn: () => void;
  onSwitchToSimulator: () => void;
}> = ({ language, onSignIn, onSwitchToSimulator }) => (
  <div className="bg-white rounded-3xl p-8 sm:p-10 border border-rose-100 shadow-sm text-center max-w-2xl mx-auto space-y-4">
    <div className="w-14 h-14 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] mx-auto flex items-center justify-center">
      <Lock className="w-7 h-7" />
    </div>
    <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20]">
      {language === 'ar'
        ? 'صندوق مستقبلك ولوحة البداية المبكرة خاصة بحسابك فقط'
        : 'Your Future Fund & Early Start Dashboard Are Private'}
    </h2>
    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
      {language === 'ar'
        ? 'سجّل دخولك لإنشاء أهدافك السبعة، تسجيل إيداعاتك الشهرية، متابعة سلسلة الالتزام، وحفظ تقدمك في الأكاديمية بأمان وسرية تامة بدون أي مقارنة عامة.'
        : 'Sign in to create your 7 dedicated savings goals, record deposits, track private monthly streaks, and keep full financial privacy.'}
    </p>
    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
      <button
        type="button"
        onClick={onSignIn}
        data-testid="early-start-signin-cta"
        className="px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
      >
        {language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In Now'}
      </button>
      <button
        type="button"
        onClick={onSwitchToSimulator}
        className="px-5 py-3 rounded-xl bg-[#FAF7F2] text-[#2A1D20] border border-gray-200 text-xs font-bold hover:border-[#D91B3E]/30 transition cursor-pointer"
      >
        {language === 'ar' ? 'جرّب محاكي ماذا لو؟ مجاناً' : 'Try What-If Simulator Free'}
      </button>
    </div>
  </div>
);


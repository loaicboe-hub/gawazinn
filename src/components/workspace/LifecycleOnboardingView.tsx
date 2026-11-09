import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LIFECYCLE_STAGES_CATALOG,
  getLifecycleStageInfo,
} from '../../../shared/journeyWorkspaceData';
import type { LifecycleStage } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  History,
  Layers,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const LifecycleOnboardingView: React.FC = () => {
  const {
    language,
    dir,
    currentUser,
    setAuthModalOpen,
    myHubPayload,
    transitionLifecycleStage,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const activeStage: LifecycleStage =
    myHubPayload?.currentStage || currentUser?.currentStage || 'thinking';
  const activeInfo = getLifecycleStageInfo(activeStage);
  const history = myHubPayload?.lifecycleHistory || [];

  const [previewStage, setPreviewStage] = useState<LifecycleStage | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [submittingStage, setSubmittingStage] = useState<LifecycleStage | null>(null);

  const focusedStage = previewStage ?? activeStage;
  const focusedInfo = getLifecycleStageInfo(focusedStage);

  const handleActivateStage = async (targetStage: LifecycleStage) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setSubmittingStage(targetStage);
    try {
      await transitionLifecycleStage(targetStage, noteInput.trim() || undefined);
      setNoteInput('');
      setPreviewStage(null);
    } finally {
      setSubmittingStage(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]/60 pb-20">
      {/* Hero Header */}
      <section className="bg-red-gradient text-white py-10 sm:py-14 border-b border-[#D91B3E]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold">
                <Compass className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'مسار جواز إن الـ 11 مرحلة — من التفكير حتى استقرار البيت'
                    : 'GAWAZ INN 11-Stage Adaptive Lifecycle Onboarding'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {language === 'ar'
                  ? 'أين تقف الآن في رحلتك نحو البيت والزواج؟'
                  : 'Where Are You Right Now in Your Marriage & Home Journey?'}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                {language === 'ar'
                  ? 'اختر مرحلتك الحالية لنرتب لك الأدوات والحاسبات المناسبة فوراً — ومع كل انتقال تظل جميع مدخراتك وميزانيتك ومستنداتك محفوظة بالكامل.'
                  : 'Pick your current life stage so GAWAZ INN prioritizes the right calculators and planners. Switching stages is 100% non-destructive — your savings, budgets, and plans remain safely preserved.'}
              </p>
            </div>

            {/* Active Stage Card */}
            <div className="bg-white/12 backdrop-blur-md border border-white/25 rounded-2xl p-4 sm:p-5 min-w-[260px] space-y-2">
              <span className="text-[11px] font-bold text-white/80 block">
                {language === 'ar' ? 'المرحلة المفعّلة حالياً:' : 'Currently Active Stage:'}
              </span>
              <div
                data-testid="current-lifecycle-stage-badge"
                className="text-sm sm:text-base font-black text-white flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-lg bg-white text-[#D91B3E] text-xs font-black flex items-center justify-center shrink-0">
                  {activeInfo.order}
                </span>
                <span>{language === 'ar' ? activeInfo.titleAr : activeInfo.titleEn}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to={activeInfo.recommendedPrimaryRoute}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white text-[#D91B3E] px-3 py-1.5 rounded-xl hover:bg-gray-50 transition"
                >
                  <span>
                    {language === 'ar'
                      ? activeInfo.recommendedPrimaryLabelAr
                      : activeInfo.recommendedPrimaryLabelEn}
                  </span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
                {currentUser && (
                  <Link
                    to="/my/workspace"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-xl border border-white/20 transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'مركزي (17 وحدة)' : 'My Hub (17 Modules)'}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {!currentUser && (
            <div className="bg-white text-[#2A1D20] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDE8ED] text-[#D91B3E] flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black">
                    {language === 'ar'
                      ? 'سجّل دخولك لحفظ مرحلتك الحياتية وسجل التنقلات'
                      : 'Sign in to save your active stage and lifecycle timeline'}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {language === 'ar'
                      ? 'يمكنك تصفح كافة المراحل الـ 11 بحرية الآن، وتفعيل مرحلة حسابك فور تسجيل الدخول.'
                      : 'Preview all 11 lifecycle blueprints freely now, and activate your stage cleanly after sign in.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="onboarding-signin-btn"
                onClick={() => setAuthModalOpen(true)}
                className="bg-red-gradient text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:opacity-95 transition shrink-0 cursor-pointer"
              >
                {language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In to Activate'}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Non-destructive Transition Guarantee */}
        <div className="bg-white rounded-3xl p-5 border border-[#D91B3E]/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#2A1D20]">
                {language === 'ar'
                  ? 'ضمان استمرارية البيانات: انتقال بدون فقدان لأي سجل'
                  : 'Non-Destructive Transitions Guarantee'}
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                {language === 'ar'
                  ? 'الانتقال من البداية المبكرة للخطوبة أو لتشطيب الشقة أو ما بعد الزفاف يحتفظ دائماً بصندوق مستقبلك، الميزانية، الحاسبات المحفوظة، والمهام.'
                  : 'Transitioning across stages preserves all existing Early Start funds, Wedding Budget ledgers, Engagement checklists, and saved calculations without resetting anything.'}
              </p>
            </div>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              data-testid="onboarding-transition-note-input"
              placeholder={
                language === 'ar'
                  ? 'ملاحظة اختيارية للانتقال (مثال: تمت قراءة الفاتحة)...'
                  : 'Optional milestone note (e.g., Engaged / Keys received)...'
              }
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2] focus:outline-none focus:border-[#D91B3E]"
            />
          </div>
        </div>

        {/* Focused Stage Spotlight Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D91B3E]/20 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D91B3E] text-white text-[11px] font-black">
                  {language === 'ar' ? `المرحلة ${focusedInfo.order} من 11` : `Stage ${focusedInfo.order} of 11`}
                </span>
                {focusedInfo.stage === activeStage && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    {language === 'ar' ? 'مرحلتك الحالية' : 'Active Stage'}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20]">
                {language === 'ar' ? focusedInfo.titleAr : focusedInfo.titleEn}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {language === 'ar' ? focusedInfo.subtitleAr : focusedInfo.subtitleEn}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {focusedInfo.stage !== activeStage && (
                <button
                  type="button"
                  disabled={submittingStage === focusedInfo.stage}
                  onClick={() => void handleActivateStage(focusedInfo.stage)}
                  data-testid={`activate-focused-${focusedInfo.stage}`}
                  className="bg-red-gradient text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md hover:opacity-95 transition cursor-pointer disabled:opacity-60"
                >
                  {submittingStage === focusedInfo.stage
                    ? language === 'ar'
                      ? 'جاري التفعيل...'
                      : 'Activating...'
                    : language === 'ar'
                      ? 'تفعيل هذه المرحلة الآن'
                      : 'Activate This Stage'}
                </button>
              )}
              <Link
                to={focusedInfo.recommendedPrimaryRoute}
                className="bg-[#FDE8ED] text-[#D91B3E] hover:bg-[#D91B3E] hover:text-white font-bold text-xs px-4 py-3 rounded-xl border border-[#D91B3E]/20 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? focusedInfo.recommendedPrimaryLabelAr
                    : focusedInfo.recommendedPrimaryLabelEn}
                </span>
              </Link>
              <Link
                to={focusedInfo.recommendedSecondaryRoute}
                className="bg-[#FAF7F2] hover:bg-gray-100 text-[#2A1D20] font-bold text-xs px-4 py-3 rounded-xl border border-gray-200 transition"
              >
                {language === 'ar'
                  ? focusedInfo.recommendedSecondaryLabelAr
                  : focusedInfo.recommendedSecondaryLabelEn}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(language === 'ar' ? focusedInfo.keyFocusAr : focusedInfo.keyFocusEn).map((pt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/10 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D91B3E] shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-[#2A1D20] leading-relaxed">{pt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* All 11 Lifecycle Stages Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg sm:text-xl font-black text-[#2A1D20]">
              {language === 'ar'
                ? 'جميع المراحل الـ 11 لرحلة جواز إن'
                : 'Complete 11-Stage Lifecycle Directory'}
            </h2>
            <span className="text-xs text-gray-500 font-semibold">
              {language === 'ar'
                ? 'اضغط على أي مرحلة للمعاينة أو التفعيل الفوري'
                : 'Select any stage to preview priorities or activate immediately'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LIFECYCLE_STAGES_CATALOG.map((item) => {
              const isCurrent = item.stage === activeStage;
              const isSelected = item.stage === focusedStage;
              return (
                <div
                  key={item.stage}
                  data-testid={`stage-card-${item.stage}`}
                  className={`rounded-3xl p-5 border transition-all flex flex-col justify-between gap-4 bg-white ${
                    isCurrent
                      ? 'border-[#D91B3E] ring-2 ring-[#D91B3E]/15 shadow-md'
                      : isSelected
                        ? 'border-[#D91B3E]/60 shadow-sm'
                        : 'border-gray-200 hover:border-[#D91B3E]/40'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#D91B3E] text-white'
                            : 'bg-[#FDE8ED] text-[#D91B3E]'
                        }`}
                      >
                        {String(item.order).padStart(2, '0')}
                      </span>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {language === 'ar' ? 'مفعّلة الآن' : 'Active'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-[#2A1D20]">
                      {language === 'ar' ? item.titleAr : item.titleEn}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {language === 'ar' ? item.subtitleAr : item.subtitleEn}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setPreviewStage(item.stage)}
                      className="text-xs font-bold text-gray-600 hover:text-[#D91B3E] transition cursor-pointer"
                    >
                      {language === 'ar' ? 'عرض الأولويات' : 'Preview Details'}
                    </button>

                    <button
                      type="button"
                      disabled={isCurrent || submittingStage === item.stage}
                      onClick={() => void handleActivateStage(item.stage)}
                      data-testid={`select-stage-${item.stage}`}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-[#FDE8ED] hover:bg-[#D91B3E] text-[#D91B3E] hover:text-white'
                      }`}
                    >
                      {isCurrent
                        ? language === 'ar'
                          ? 'مرحلتك الحالية'
                          : 'Selected'
                        : submittingStage === item.stage
                          ? '...'
                          : language === 'ar'
                            ? 'تفعيل المرحلة'
                            : 'Select Stage'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transition Audit History */}
        {currentUser && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#D91B3E]" />
              <h2 className="text-base font-black text-[#2A1D20]">
                {language === 'ar'
                  ? 'سجل تطور مراحلك الحياتية'
                  : 'Your Non-Destructive Lifecycle Transition Log'}
              </h2>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-gray-500">
                {language === 'ar'
                  ? 'لم يتم تسجيل انتقالات سابقة بعد. اختر مرحلتك التالية بالأعلى وسيتم توثيقها هنا.'
                  : 'No prior transitions logged yet. Selecting a new stage appends a history milestone here.'}
              </p>
            ) : (
              <div className="space-y-2.5" data-testid="lifecycle-history-list">
                {history.map((h) => {
                  const fromMeta = h.fromStage ? getLifecycleStageInfo(h.fromStage) : null;
                  const toMeta = getLifecycleStageInfo(h.toStage);
                  return (
                    <div
                      key={h.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#FAF7F2] border border-gray-100 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-wrap font-bold text-[#2A1D20]">
                        {fromMeta && (
                          <>
                            <span className="text-gray-500">
                              {language === 'ar' ? fromMeta.titleAr : fromMeta.titleEn}
                            </span>
                            <span className="text-[#D91B3E]">→</span>
                          </>
                        )}
                        <span className="text-[#B31331]">
                          {language === 'ar' ? toMeta.titleAr : toMeta.titleEn}
                        </span>
                        {h.note && (
                          <span className="text-gray-500 font-normal">({h.note})</span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {new Date(h.changedAt).toLocaleString(
                          language === 'ar' ? 'ar-EG' : 'en-EG',
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

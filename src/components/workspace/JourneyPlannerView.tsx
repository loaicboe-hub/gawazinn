import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  JOURNEY_PHASES_CATALOG,
  STARTER_JOURNEY_TASKS,
} from '../../../shared/journeyWorkspaceData';
import type {
  JourneyPhaseKey,
  JourneyTask,
  JourneyTaskPriority,
  JourneyTaskStatus,
} from '../../types';
import {
  AlertTriangle,
  Bell,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartHandshake,
  ListTodo,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';

function getMonthGridDays(yearMonth: string): { dateStr: string; dayNum: number; inMonth: boolean }[] {
  const [yStr, mStr] = yearMonth.split('-');
  const year = Number(yStr) || 2026;
  const monthIdx = (Number(mStr) || 1) - 1;
  const firstDay = new Date(Date.UTC(year, monthIdx, 1));
  const startDow = firstDay.getUTCDay(); // 0=Sun..6=Sat
  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();

  const cells: { dateStr: string; dayNum: number; inMonth: boolean }[] = [];
  for (let i = 0; i < startDow; i++) {
    cells.push({ dateStr: `pad-start-${i}`, dayNum: 0, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dd = String(d).padStart(2, '0');
    cells.push({ dateStr: `${yearMonth}-${dd}`, dayNum: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ dateStr: `pad-end-${cells.length}`, dayNum: 0, inMonth: false });
  }
  return cells;
}

function shiftYearMonth(ym: string, delta: number): string {
  const [yStr, mStr] = ym.split('-');
  const d = new Date(Date.UTC(Number(yStr) || 2026, (Number(mStr) || 1) - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export const JourneyPlannerView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    myHubPayload,
    createJourneyTask,
    patchJourneyTask,
    deleteJourneyTask,
    addJourneyTaskComment,
  } = useApp();

  const journey = myHubPayload?.journey;
  const workspace = myHubPayload?.workspace;

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [phaseFilter, setPhaseFilter] = useState<JourneyPhaseKey | 'all'>('all');
  const [sideFilter, setSideFilter] = useState<'all' | 'groom' | 'bride' | 'shared'>('all');
  const [calendarMonth, setCalendarMonth] = useState<string>(() => {
    const firstDated = journey?.tasks.find((t) => t.dueDate)?.dueDate;
    return firstDated ? firstDated.slice(0, 7) : '2026-11';
  });

  // Inline dependency warning banner returned on out-of-order completion
  const [lastWarning, setLastWarning] = useState<string | null>(null);

  // Add Task Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhase, setNewPhase] = useState<JourneyPhaseKey>('9m');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSide, setNewSide] = useState<'groom' | 'bride' | 'shared'>('shared');
  const [newPriority, setNewPriority] = useState<JourneyTaskPriority>('high');
  const [newDueDate, setNewDueDate] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newDependsOnId, setNewDependsOnId] = useState('');
  const [newEstimatedCost, setNewEstimatedCost] = useState(0);
  const [submittingTask, setSubmittingTask] = useState(false);

  // Expanded comments drawer per task
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  const tasks = useMemo(() => journey?.tasks ?? [], [journey]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (phaseFilter !== 'all' && t.phase !== phaseFilter) return false;
      if (sideFilter !== 'all' && t.ownerSide !== sideFilter) return false;
      return true;
    });
  }, [tasks, phaseFilter, sideFilter]);

  const calendarCells = useMemo(() => getMonthGridDays(calendarMonth), [calendarMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, JourneyTask[]>();
    for (const t of filteredTasks) {
      if (!t.dueDate) continue;
      const list = map.get(t.dueDate) || [];
      list.push(t);
      map.set(t.dueDate, list);
    }
    return map;
  }, [filteredTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!newTitle.trim()) return;
    setSubmittingTask(true);
    try {
      await createJourneyTask({
        phase: newPhase,
        titleAr: newTitle.trim(),
        titleEn: newTitle.trim(),
        description: newDesc.trim() || undefined,
        ownerSide: newSide,
        dueDate: newDueDate || null,
        reminderDate: newReminderDate || null,
        dependsOnTaskId: newDependsOnId || null,
        priority: newPriority,
        estimatedCost: newEstimatedCost,
      });
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      setNewReminderDate('');
      setNewDependsOnId('');
      setNewEstimatedCost(0);
      setShowAddForm(false);
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: JourneyTaskStatus) => {
    const warning = await patchJourneyTask(taskId, { status });
    setLastWarning(warning);
  };

  const handlePostComment = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    if (!commentDraft.trim()) return;
    await addJourneyTaskComment(taskId, commentDraft.trim());
    setCommentDraft('');
  };

  const sideLabel = (side: 'groom' | 'bride' | 'shared') =>
    side === 'groom'
      ? language === 'ar'
        ? 'العريس'
        : 'Groom'
      : side === 'bride'
        ? language === 'ar'
          ? 'العروسة'
          : 'Bride'
        : language === 'ar'
          ? 'مشترك'
          : 'Shared';

  const statusBadge = (st: JourneyTaskStatus) => {
    if (st === 'done') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
          {language === 'ar' ? 'مكتملة' : 'Done'}
        </span>
      );
    }
    if (st === 'in_progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#FDE8ED] text-[#D91B3E] text-[10px] font-black">
          {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-black">
        {language === 'ar' ? 'قادمة' : 'To Do'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]/60 pb-20">
      {/* Hero Banner */}
      <section className="bg-red-gradient text-white py-10 sm:py-12 border-b border-[#D91B3E]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold">
                <ListTodo className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'الوحدة I — مخطط رحلة الزواج (10 مراحل زمنية)'
                    : 'Module I — Interactive 10-Phase Wedding Journey Planner'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {language === 'ar'
                  ? 'مخطط رحلة الزواج والجدول الزمني التفاعلي'
                  : 'Wedding Journey Timeline, Dependencies & Calendar'}
              </h1>
              <p className="text-xs sm:text-sm text-white/90">
                {language === 'ar'
                  ? 'رتّب كل مهام الاستعداد من 12+ شهراً قبل الفرح حتى ما بعد الزفاف مع تنبيهات الاعتمادية والتعليقات المشتركة والتقويم الشهري.'
                  : 'Orchestrate every task from 12+ months out through post-wedding settling-in with dependency warnings, partner assignments, comments & calendar planning.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              {currentUser && (
                <button
                  type="button"
                  onClick={() => setShowAddForm((prev) => !prev)}
                  data-testid="toggle-add-journey-task-btn"
                  className="bg-white text-[#D91B3E] hover:bg-gray-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'مهمة جديدة' : 'Add Custom Task'}</span>
                </button>
              )}
              <Link
                to="/my/workspace?tab=workspace"
                className="bg-black/20 hover:bg-black/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/25 transition flex items-center gap-1.5"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>
                  {workspace
                    ? language === 'ar'
                      ? workspace.workspace.nameAr
                      : workspace.workspace.nameEn
                    : language === 'ar'
                      ? 'مساحة الزوجين'
                      : 'Couple Workspace'}
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
                      ? 'سجل دخولك لفتح مخطط رحلة الزواج التفاعلي ومشاركته مع الشريك'
                      : 'Sign in to customize your Wedding Journey Planner & Partner Tasks'}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {language === 'ar'
                      ? 'استعرض الـ 10 مراحل الزمنية والـ 12 مهمة أساسية بالأسفل وسجل لتعديل المواعيد والتعليقات.'
                      : 'Explore the 10-phase Egyptian timeline below and sign in to manage due dates, dependencies & shared comments.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="journey-signin-btn"
                onClick={() => setAuthModalOpen(true)}
                className="bg-red-gradient text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:opacity-95 transition shrink-0 cursor-pointer"
              >
                {language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In'}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {!currentUser || !journey ? (
          /* Guest Roadmap Preview */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-[#2A1D20]">
              {language === 'ar'
                ? 'خارطة الطريق القياسية لرحلة الزواج في مصر (10 مراحل)'
                : 'Standard 10-Phase Egyptian Wedding Journey Blueprint'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STARTER_JOURNEY_TASKS.map((seed) => {
                const phaseInfo = JOURNEY_PHASES_CATALOG.find((p) => p.key === seed.phase);
                return (
                  <div
                    key={seed.key}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] font-black">
                      <span className="text-[#D91B3E] bg-[#FDE8ED] px-2 py-0.5 rounded-full">
                        {phaseInfo ? (language === 'ar' ? phaseInfo.titleAr : phaseInfo.titleEn) : seed.phase}
                      </span>
                      <span className="text-gray-500">{sideLabel(seed.ownerSide)}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-[#2A1D20]">
                      {language === 'ar' ? seed.titleAr : seed.titleEn}
                    </p>
                    <p className="text-[11px] text-gray-600">{seed.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Live Journey KPIs + View Toggle */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-rose-100 shadow-xs space-y-1">
                <span className="text-xs text-gray-500 font-bold">
                  {language === 'ar' ? 'نسبة إنجاز الرحلة' : 'Journey Completion'}
                </span>
                <p className="text-xl sm:text-2xl font-black text-emerald-700">
                  {journey.summary.completionPercent}%
                </p>
                <span className="text-[11px] text-gray-500 block">
                  {journey.summary.doneTasks} / {journey.summary.totalTasks}{' '}
                  {language === 'ar' ? 'مهام منجزة' : 'tasks done'}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-rose-100 shadow-xs space-y-1">
                <span className="text-xs text-gray-500 font-bold">
                  {language === 'ar' ? 'مهام مرتبطة باعتمادية' : 'Dependency-Gated'}
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#D91B3E]">
                  {journey.summary.blockedTasks}
                </p>
                <span className="text-[11px] text-gray-500 block">
                  {language === 'ar' ? 'بانتظار مهمة تسبقها' : 'Waiting on prerequisite'}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-rose-100 shadow-xs space-y-1">
                <span className="text-xs text-gray-500 font-bold">
                  {language === 'ar' ? 'توزيع الأدوار' : 'Role Split'}
                </span>
                <p className="text-xs sm:text-sm font-black text-[#2A1D20] pt-1">
                  {language === 'ar' ? 'عريس' : 'Groom'}: {journey.summary.byOwnerSide.groom} •{' '}
                  {language === 'ar' ? 'عروسة' : 'Bride'}: {journey.summary.byOwnerSide.bride}
                </p>
                <span className="text-[11px] text-gray-500 block">
                  {language === 'ar' ? 'مشترك:' : 'Shared:'} {journey.summary.byOwnerSide.shared}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-rose-100 shadow-xs space-y-2 flex flex-col justify-center">
                <span className="text-xs text-gray-500 font-bold">
                  {language === 'ar' ? 'طريقة العرض' : 'View Mode'}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    data-testid="journey-view-list-btn"
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                      viewMode === 'list'
                        ? 'bg-[#D91B3E] text-white'
                        : 'bg-[#FAF7F2] text-gray-700 hover:bg-[#FDE8ED]'
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'القائمة' : 'Timeline'}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="journey-view-calendar-btn"
                    onClick={() => setViewMode('calendar')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                      viewMode === 'calendar'
                        ? 'bg-[#D91B3E] text-white'
                        : 'bg-[#FAF7F2] text-gray-700 hover:bg-[#FDE8ED]'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'التقويم' : 'Calendar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {lastWarning && (
              <div
                data-testid="journey-dependency-warning-banner"
                className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{lastWarning}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLastWarning(null)}
                  className="text-amber-800 hover:underline cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق' : 'Dismiss'}
                </button>
              </div>
            )}

            {/* Add Task Form Drawer */}
            {showAddForm && (
              <form
                onSubmit={(e) => void handleAddTask(e)}
                data-testid="add-journey-task-form"
                className="bg-white rounded-3xl p-6 border border-[#D91B3E]/25 shadow-md space-y-4"
              >
                <h2 className="text-base font-black text-[#2A1D20]">
                  {language === 'ar' ? 'إضافة مهمة جديدة لمخطط الرحلة' : 'Create Custom Journey Task'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      {language === 'ar' ? 'المرحلة الزمنية' : 'Journey Phase'}
                    </label>
                    <select
                      value={newPhase}
                      onChange={(e) => setNewPhase(e.target.value as JourneyPhaseKey)}
                      data-testid="journey-new-phase-select"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    >
                      {JOURNEY_PHASES_CATALOG.map((p) => (
                        <option key={p.key} value={p.key}>
                          {language === 'ar' ? p.titleAr : p.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      {language === 'ar' ? 'عنوان المهمة' : 'Task Title'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      data-testid="journey-new-title-input"
                      placeholder={
                        language === 'ar'
                          ? 'مثال: استلام رخصة أو تصريح تعديل الشقة'
                          : 'e.g., Confirm kitchen contractor site measurement'
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      {language === 'ar' ? 'المكلف بالمهمة' : 'Owner Side'}
                    </label>
                    <select
                      value={newSide}
                      onChange={(e) => setNewSide(e.target.value as 'groom' | 'bride' | 'shared')}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    >
                      <option value="shared">{language === 'ar' ? 'مشترك' : 'Shared'}</option>
                      <option value="groom">{language === 'ar' ? 'العريس' : 'Groom'}</option>
                      <option value="bride">{language === 'ar' ? 'العروسة' : 'Bride'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                    </label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      data-testid="journey-new-due-input"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      {language === 'ar' ? 'تذكير مبكر' : 'Reminder Date'}
                    </label>
                    <input
                      type="date"
                      value={newReminderDate}
                      onChange={(e) => setNewReminderDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      {language === 'ar' ? 'معتمدة على مهمة سابقة؟' : 'Depends On Task'}
                    </label>
                    <select
                      value={newDependsOnId}
                      onChange={(e) => setNewDependsOnId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    >
                      <option value="">
                        {language === 'ar' ? 'بدون اعتمادية' : 'No dependency'}
                      </option>
                      {tasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {language === 'ar' ? t.titleAr : t.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      {language === 'ar' ? 'الأولوية' : 'Priority'}
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as JourneyTaskPriority)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    >
                      <option value="high">{language === 'ar' ? 'عالية' : 'High'}</option>
                      <option value="medium">{language === 'ar' ? 'متوسطة' : 'Medium'}</option>
                      <option value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={
                      language === 'ar' ? 'ملاحظات أو تفاصيل إضافية...' : 'Optional notes / checklist details...'
                    }
                    className="flex-1 w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                  <button
                    type="submit"
                    disabled={submittingTask}
                    data-testid="add-journey-task-submit-btn"
                    className="bg-red-gradient text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md hover:opacity-95 transition shrink-0 cursor-pointer"
                  >
                    {language === 'ar' ? 'حفظ المهمة' : 'Save Task'}
                  </button>
                </div>
              </form>
            )}

            {/* Phase Filter Pills & Assignee Filter */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black text-[#2A1D20]">
                  {language === 'ar' ? 'تصفية حسب المراحل الزمنية الـ 10:' : 'Filter by 10 Journey Phases:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'groom', 'bride', 'shared'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSideFilter(s)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        sideFilter === s
                          ? 'bg-[#2A1D20] text-white'
                          : 'bg-[#FAF7F2] text-gray-700 hover:bg-[#FDE8ED]'
                      }`}
                    >
                      {s === 'all' ? (language === 'ar' ? 'الكل' : 'All Sides') : sideLabel(s)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPhaseFilter('all')}
                  data-testid="journey-phase-all"
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    phaseFilter === 'all'
                      ? 'bg-[#D91B3E] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-gray-700 hover:bg-[#FDE8ED]'
                  }`}
                >
                  {language === 'ar' ? 'جميع المراحل' : 'All Phases'} ({tasks.length})
                </button>
                {JOURNEY_PHASES_CATALOG.map((p) => {
                  const count = tasks.filter((t) => t.phase === p.key).length;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPhaseFilter(p.key)}
                      data-testid={`journey-phase-${p.key}`}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        phaseFilter === p.key
                          ? 'bg-[#D91B3E] text-white shadow-xs'
                          : 'bg-[#FAF7F2] text-gray-700 hover:bg-[#FDE8ED]'
                      }`}
                    >
                      {language === 'ar' ? p.windowLabelAr : p.windowLabelEn} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {viewMode === 'calendar' ? (
              /* Interactive Month Calendar Grid */
              <div
                data-testid="journey-calendar-grid"
                className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((m) => shiftYearMonth(m, -1))}
                    className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#2A1D20] cursor-pointer"
                    aria-label="Previous month"
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                  </button>
                  <h2 className="text-base font-black text-[#2A1D20]">{calendarMonth}</h2>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((m) => shiftYearMonth(m, 1))}
                    className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#2A1D20] cursor-pointer"
                    aria-label="Next month"
                  >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black text-gray-500">
                  {(language === 'ar'
                    ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
                    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  ).map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarCells.map((cell) => {
                    const dayTasks = cell.inMonth ? tasksByDate.get(cell.dateStr) || [] : [];
                    return (
                      <div
                        key={cell.dateStr}
                        className={`min-h-[76px] sm:min-h-[96px] rounded-2xl p-1.5 sm:p-2 border text-start ${
                          cell.inMonth
                            ? 'bg-[#FAF7F2]/60 border-gray-200'
                            : 'bg-gray-50/40 border-transparent'
                        }`}
                      >
                        {cell.inMonth && (
                          <>
                            <span className="text-[11px] font-black text-gray-700 block mb-1">
                              {cell.dayNum}
                            </span>
                            <div className="space-y-1">
                              {dayTasks.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() =>
                                    void handleStatusChange(
                                      t.id,
                                      t.status === 'done' ? 'todo' : 'done',
                                    )
                                  }
                                  className={`w-full text-start px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer ${
                                    t.status === 'done'
                                      ? 'bg-emerald-100 text-emerald-800 line-through'
                                      : 'bg-[#FDE8ED] text-[#B31331]'
                                  }`}
                                  title={language === 'ar' ? t.titleAr : t.titleEn}
                                >
                                  {language === 'ar' ? t.titleAr : t.titleEn}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Timeline List View */
              <div className="space-y-3" data-testid="journey-task-list">
                {filteredTasks.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-200">
                    <p className="text-sm font-bold">
                      {language === 'ar'
                        ? 'لا توجد مهام تطابق الفلتر المحدد.'
                        : 'No tasks match your active filter.'}
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const phaseMeta = JOURNEY_PHASES_CATALOG.find((p) => p.key === task.phase);
                    const commentsOpen = openCommentsTaskId === task.id;
                    return (
                      <div
                        key={task.id}
                        data-testid={`journey-task-${task.id}`}
                        className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#D91B3E]/15 text-[#B31331] text-[10px] font-black">
                                {phaseMeta
                                  ? language === 'ar'
                                    ? phaseMeta.titleAr
                                    : phaseMeta.titleEn
                                  : task.phase}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                                {sideLabel(task.ownerSide)}
                              </span>
                              {statusBadge(task.status)}
                              {task.isDependencyBlocked && (
                                <span
                                  data-testid={`dependency-blocked-${task.id}`}
                                  className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black inline-flex items-center gap-1"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>
                                    {language === 'ar'
                                      ? `يعتمد على: ${task.dependsOnTitleAr || task.dependsOnTitleEn}`
                                      : `Blocked by: ${task.dependsOnTitleEn || task.dependsOnTitleAr}`}
                                  </span>
                                </span>
                              )}
                            </div>

                            <h3
                              className={`text-sm sm:text-base font-black text-[#2A1D20] ${
                                task.status === 'done' ? 'line-through text-gray-400' : ''
                              }`}
                            >
                              {language === 'ar' ? task.titleAr : task.titleEn}
                            </h3>

                            {task.description && (
                              <p className="text-xs text-gray-600">{task.description}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-1">
                              {task.dueDate && (
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#D91B3E]" />
                                  <span>
                                    {language === 'ar' ? 'الموعد:' : 'Due:'} {task.dueDate}
                                  </span>
                                </span>
                              )}
                              {task.reminderDate && (
                                <span className="inline-flex items-center gap-1">
                                  <Bell className="w-3 h-3 text-[#B31331]" />
                                  <span>
                                    {language === 'ar' ? 'تذكير:' : 'Reminder:'}{' '}
                                    {task.reminderDate}
                                  </span>
                                </span>
                              )}
                              {task.estimatedCost > 0 && (
                                <span className="font-black text-[#D91B3E]">
                                  {task.estimatedCost.toLocaleString()}{' '}
                                  {language === 'ar' ? 'ج.م' : 'EGP'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Task Actions */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                void handleStatusChange(
                                  task.id,
                                  e.target.value as JourneyTaskStatus,
                                )
                              }
                              data-testid={`task-status-select-${task.id}`}
                              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-[#FAF7F2] text-xs font-bold text-[#2A1D20] cursor-pointer"
                            >
                              <option value="todo">
                                {language === 'ar' ? 'قادمة' : 'To Do'}
                              </option>
                              <option value="in_progress">
                                {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
                              </option>
                              <option value="done">
                                {language === 'ar' ? 'مكتملة' : 'Done'}
                              </option>
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                setOpenCommentsTaskId(commentsOpen ? null : task.id)
                              }
                              data-testid={`task-comments-btn-${task.id}`}
                              className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8ED] text-xs font-bold text-[#2A1D20] border border-gray-200 flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#D91B3E]" />
                              <span>{task.comments.length}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => void deleteJourneyTask(task.id)}
                              aria-label="Delete task"
                              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Comments Drawer */}
                        {commentsOpen && (
                          <div className="pt-3 border-t border-gray-100 space-y-3">
                            {task.comments.length === 0 ? (
                              <p className="text-xs text-gray-400">
                                {language === 'ar'
                                  ? 'لا توجد تعليقات بعد. أضف ملاحظة لشريكك هنا.'
                                  : 'No comments yet. Leave a note for your partner here.'}
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {task.comments.map((c) => (
                                  <div
                                    key={c.id}
                                    className="p-3 rounded-2xl bg-[#FAF7F2] border border-gray-100 text-xs flex items-start justify-between gap-2"
                                  >
                                    <div>
                                      <strong className="text-[#B31331] block">
                                        {c.authorName}
                                      </strong>
                                      <p className="text-gray-700 mt-0.5">{c.body}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 shrink-0">
                                      {new Date(c.createdAt).toLocaleDateString(
                                        language === 'ar' ? 'ar-EG' : 'en-EG',
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <form
                              onSubmit={(e) => void handlePostComment(e, task.id)}
                              className="flex gap-2"
                            >
                              <input
                                type="text"
                                value={commentDraft}
                                onChange={(e) => setCommentDraft(e.target.value)}
                                data-testid={`task-comment-input-${task.id}`}
                                placeholder={
                                  language === 'ar' ? 'اكتب تعليقاً أو استفساراً...' : 'Write a comment...'
                                }
                                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                              />
                              <button
                                type="submit"
                                data-testid={`task-comment-submit-${task.id}`}
                                className="bg-red-gradient text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{language === 'ar' ? 'إرسال' : 'Post'}</span>
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

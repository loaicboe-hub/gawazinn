import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  DEFAULT_WORKSPACE_PERMISSIONS,
  MY_GAWAZ_INN_MODULES,
  getLifecycleStageInfo,
} from '../../../shared/journeyWorkspaceData';
import type {
  MyGawazInnSubmoduleKey,
  UserAppointmentStatus,
  UserAppointmentType,
  UserDocumentType,
  WorkspacePermissions,
} from '../../types';
import {
  Bell,
  Briefcase,
  Calculator,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  Compass,
  Copy,
  CreditCard,
  FileText,
  FolderLock,
  Heart,
  HeartHandshake,
  Layers,
  ListChecks,
  Lock,
  Plus,
  Scale,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User as UserIcon,
  UserPlus,
  UserX,
  Wallet,
  X,
} from 'lucide-react';

function fmtEgp(val: number, language: 'ar' | 'en'): string {
  return `${Math.round(val).toLocaleString()} ${language === 'ar' ? 'ج.م' : 'EGP'}`;
}

export const MyGawazInnHubView: React.FC<{ onOpenCart?: () => void }> = ({ onOpenCart }) => {
  const {
    language,
    setLanguage,
    currentUser,
    setAuthModalOpen,
    myHubPayload,
    budgetOverview,
    earlyStartOverview,
    orders,
    finishingInquiries,
    weddingBookings,
    financingApplications,
    calculatorRuns,
    wishlist,
    toggleWishlist,
    cart,
    cartTotal,
    addToCart,
    groomBudgetTarget,
    brideChecklist,
    products,
    shoppingLists,
    priceAlerts,
    compareProductIds,
    toggleCompareProduct,
    updateWorkspaceMeta,
    inviteWorkspacePartner,
    respondWorkspaceInvitation,
    updateWorkspaceMemberPermissions,
    revokeWorkspaceMember,
    createWorkspaceApproval,
    decideWorkspaceApproval,
    createUserDocument,
    deleteUserDocument,
    createUserWarranty,
    deleteUserWarranty,
    createUserAppointment,
    patchUserAppointment,
    markNotificationRead,
    markAllNotificationsRead,
    showToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as MyGawazInnSubmoduleKey | null;
  const activeTab: MyGawazInnSubmoduleKey = useMemo(() => {
    if (queryTab && MY_GAWAZ_INN_MODULES.some((m) => m.key === queryTab)) {
      return queryTab;
    }
    return 'workspace';
  }, [queryTab]);

  const selectTab = (tabKey: MyGawazInnSubmoduleKey) => {
    setSearchParams({ tab: tabKey });
  };

  // Document form state
  const [docType, setDocType] = useState<UserDocumentType>('contract');
  const [docTitle, setDocTitle] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docRefCode, setDocRefCode] = useState('');
  const [docShared, setDocShared] = useState(false);

  // Warranty form state
  const [warItem, setWarItem] = useState('');
  const [warCategory, setWarCategory] = useState('أجهزة كهربائية');
  const [warProvider, setWarProvider] = useState('');
  const [warSerial, setWarSerial] = useState('');
  const [warStart, setWarStart] = useState('2026-10-01');
  const [warExpiry, setWarExpiry] = useState('2031-10-01');

  // Appointment form state
  const [aptTitle, setAptTitle] = useState('');
  const [aptType, setAptType] = useState<UserAppointmentType>('showroom');
  const [aptProvider, setAptProvider] = useState('');
  const [aptLocation, setAptLocation] = useState('');
  const [aptScheduledAt, setAptScheduledAt] = useState('2026-12-05T16:00');

  // Shared Workspace form states
  const [wsNameDraft, setWsNameDraft] = useState<string | null>(null);
  const [inviteIdent, setInviteIdent] = useState('');
  const [inviteRole, setInviteRole] = useState<'partner' | 'planner_guest'>('partner');
  const [inviteSide, setInviteSide] = useState<'groom' | 'bride' | 'partner'>('bride');
  const [invitePerms, setInvitePerms] = useState<WorkspacePermissions>(DEFAULT_WORKSPACE_PERMISSIONS);
  const [latestIssuedToken, setLatestIssuedToken] = useState<string | null>(null);
  const [manualTokenInput, setManualTokenInput] = useState('');

  // Approval creation form
  const [approvalTitle, setApprovalTitle] = useState('');
  const [approvalCategory, setApprovalCategory] = useState('appliances');
  const [approvalAmount, setApprovalAmount] = useState<number>(25000);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FDE8ED] text-[#D91B3E] mx-auto flex items-center justify-center shadow-lg border border-rose-200">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar'
            ? 'سجل دخولك لفتح مركز جواز إن الشخصي ومساحة الزوجين'
            : 'Sign In to Open Your 17-Module My Gawaz Inn Command Center'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'ar'
            ? 'إدارة رحلة الزواج، الميزانية، صندوق مستقبلك، المواعيد، خزنة المستندات، الضمانات، ومساحة الشريك المشتركة من مكان واحد محمي بخصوصية كاملة.'
            : 'Access your private lifecycle command center across 17 specialized modules, document locker, warranty ledger, and consent-based Shared Couple Workspace.'}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            data-testid="hub-signin-btn"
            onClick={() => setAuthModalOpen(true)}
            className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md cursor-pointer"
          >
            {language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In Now'}
          </button>
          <Link
            to="/onboarding"
            className="bg-white border border-gray-200 text-gray-700 font-bold text-xs py-3 px-6 rounded-xl"
          >
            {language === 'ar' ? 'اختيار المرحلة الحياتية' : '11-Stage Onboarding'}
          </Link>
        </div>
      </div>
    );
  }

  const stageInfo = getLifecycleStageInfo(
    myHubPayload?.currentStage || currentUser.currentStage || 'thinking',
  );
  const workspacePayload = myHubPayload?.workspace;
  const documents = myHubPayload?.documents || [];
  const warranties = myHubPayload?.warranties || [];
  const appointments = myHubPayload?.appointments || [];
  const notifications = myHubPayload?.notifications || [];
  const unreadCount = myHubPayload?.unreadNotificationsCount || 0;
  const engagement = myHubPayload?.engagement;
  const journey = myHubPayload?.journey;
  const savedFavoriteProducts = wishlist;

  const getTabBadge = (key: MyGawazInnSubmoduleKey): number | null => {
    switch (key) {
      case 'notifications':
        return unreadCount > 0 ? unreadCount : null;
      case 'workspace':
        return workspacePayload
          ? workspacePayload.incomingInvitations.length +
              workspacePayload.approvals.filter((a) => a.status === 'pending').length
          : null;
      case 'documents':
        return documents.length || null;
      case 'warranties':
        return warranties.length || null;
      case 'appointments':
        return appointments.length || null;
      case 'journey':
        return journey?.summary.totalTasks || null;
      case 'favorites':
        return savedFavoriteProducts.length || null;
      default:
        return null;
    }
  };

  const tabIcon = (key: MyGawazInnSubmoduleKey) => {
    const cls = 'w-4 h-4 shrink-0';
    switch (key) {
      case 'profile':
        return <UserIcon className={cls} />;
      case 'journey':
        return <Compass className={cls} />;
      case 'budget':
        return <Wallet className={cls} />;
      case 'savings':
        return <Lock className={cls} />;
      case 'checklists':
        return <ListChecks className={cls} />;
      case 'shopping':
        return <ShoppingBag className={cls} />;
      case 'favorites':
        return <Heart className={cls} />;
      case 'comparisons':
        return <Scale className={cls} />;
      case 'quotations':
        return <Calculator className={cls} />;
      case 'bookings':
        return <HeartHandshake className={cls} />;
      case 'appointments':
        return <Calendar className={cls} />;
      case 'documents':
        return <FolderLock className={cls} />;
      case 'invoices':
        return <CreditCard className={cls} />;
      case 'warranties':
        return <ShieldCheck className={cls} />;
      case 'notifications':
        return <Bell className={cls} />;
      case 'workspace':
        return <HeartHandshake className={cls} />;
      case 'settings':
        return <SettingsIcon className={cls} />;
    }
  };

  const permissionLabels: [keyof WorkspacePermissions, string, string][] = [
    ['budgetRead', 'قراءة الميزانية المشتركة', 'Read Shared Budget'],
    ['budgetWrite', 'تعديل الميزانية المشتركة', 'Edit Shared Budget'],
    ['tasksRead', 'عرض مهام الرحلة', 'Read Journey Tasks'],
    ['tasksWrite', 'تعديل وإضافة المهام', 'Edit/Add Tasks'],
    ['shoppingRead', 'عرض قوائم المشتريات', 'View Shopping Lists'],
    ['shoppingWrite', 'تعديل المشتريات', 'Edit Shopping Lists'],
    ['documentsRead', 'عرض المستندات المشتركة', 'View Shared Docs'],
    ['documentsWrite', 'رفع/حذف المستندات', 'Upload/Edit Docs'],
    ['approvePurchases', 'اعتماد المشتريات الكبيرة', 'Approve Purchases'],
  ];

  const handleSaveWorkspaceMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsNameDraft || !wsNameDraft.trim()) return;
    await updateWorkspaceMeta({
      nameAr: wsNameDraft.trim(),
      nameEn: wsNameDraft.trim(),
    });
    setWsNameDraft(null);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteIdent.trim()) return;
    const token = await inviteWorkspacePartner({
      inviteeIdentifier: inviteIdent.trim(),
      proposedRole: inviteRole,
      proposedSide: inviteSide,
      permissions: invitePerms,
    });
    setLatestIssuedToken(token);
    setInviteIdent('');
  };

  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalTitle.trim()) return;
    await createWorkspaceApproval({
      title: approvalTitle.trim(),
      category: approvalCategory,
      estimatedAmount: approvalAmount,
    });
    setApprovalTitle('');
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFileName.trim()) return;
    await createUserDocument({
      docType,
      title: docTitle.trim(),
      fileName: docFileName.trim(),
      mimeType: 'application/pdf',
      sizeBytes: 245760,
      referenceCode: docRefCode.trim() || undefined,
      isSharedWithPartner: docShared,
    });
    setDocTitle('');
    setDocFileName('');
    setDocRefCode('');
    setDocShared(false);
  };

  const handleCreateWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warItem.trim() || !warProvider.trim()) return;
    await createUserWarranty({
      itemName: warItem.trim(),
      category: warCategory,
      providerName: warProvider.trim(),
      modelSerial: warSerial.trim() || undefined,
      startDate: warStart,
      expiryDate: warExpiry,
    });
    setWarItem('');
    setWarProvider('');
    setWarSerial('');
  };

  const handleCreateApt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptTitle.trim() || !aptProvider.trim()) return;
    await createUserAppointment({
      title: aptTitle.trim(),
      appointmentType: aptType,
      providerName: aptProvider.trim(),
      locationText: aptLocation.trim() || (language === 'ar' ? 'القاهرة' : 'Cairo'),
      scheduledAt: aptScheduledAt,
    });
    setAptTitle('');
    setAptProvider('');
    setAptLocation('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]/60 pb-20">
      {/* Top Hero */}
      <section className="bg-red-gradient text-white py-8 sm:py-10 border-b border-[#D91B3E]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>
                {language === 'ar'
                  ? 'مركز قيادة جواز إن — 17 وحدة متكاملة'
                  : 'My Gawaz Inn — 17-Module Personal Command Center'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'ar' ? `أهلاً بك يا ${currentUser.name}` : `Welcome, ${currentUser.nameEn || currentUser.name}`}
            </h1>
            <p className="text-xs text-white/90 flex items-center gap-2 flex-wrap">
              <span>
                {language === 'ar' ? `المرحلة الحالية (${stageInfo.order}/11):` : `Stage (${stageInfo.order}/11):`}{' '}
                <strong>{language === 'ar' ? stageInfo.titleAr : stageInfo.titleEn}</strong>
              </span>
              {workspacePayload && (
                <>
                  <span>•</span>
                  <span>
                    {language === 'ar' ? workspacePayload.workspace.nameAr : workspacePayload.workspace.nameEn}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              to="/onboarding"
              className="bg-white text-[#D91B3E] hover:bg-gray-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              {language === 'ar' ? 'تغيير المرحلة (11 مرحلة)' : 'Switch Stage (11)'}
            </Link>
            <Link
              to="/portal"
              className="bg-black/20 hover:bg-black/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/25 transition"
            >
              {language === 'ar' ? 'بوابة الطلبات الكلاسيكية' : 'Unified Requests'}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 17-Module Sidebar Navigation */}
        <aside className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-4 border border-rose-100 shadow-xs">
          <div className="px-2 pb-3 border-b border-gray-100 mb-3 flex items-center justify-between">
            <h2 className="text-xs font-black text-[#B31331]">
              {language === 'ar' ? 'وحدات مركزي (17 وحدة)' : 'Command Modules (17)'}
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#D91B3E] text-white text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </div>

          <nav aria-label="My Gawaz Inn 17 Modules" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
            {MY_GAWAZ_INN_MODULES.map((mod) => {
              const isActive = activeTab === mod.key;
              const badge = getTabBadge(mod.key);
              return (
                <button
                  key={mod.key}
                  type="button"
                  onClick={() => selectTab(mod.key)}
                  data-testid={`hub-tab-${mod.key}`}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 text-start cursor-pointer ${
                    isActive
                      ? 'bg-[#D91B3E] text-white shadow-sm'
                      : 'text-[#2A1D20] hover:bg-[#FDE8ED] hover:text-[#D91B3E]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {tabIcon(mod.key)}
                    <span className="truncate">
                      {language === 'ar' ? mod.titleAr : mod.titleEn}
                    </span>
                  </div>
                  {badge !== null && badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-white text-[#D91B3E]' : 'bg-[#FDE8ED] text-[#B31331]'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Panel for Active Module */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-6 min-w-0">
          {/* 1. PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar' ? 'الملف الشخصي والمرحلة الحياتية' : 'Profile & Active Stage'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                  <span className="text-gray-500 block">{language === 'ar' ? 'الاسم' : 'Name'}</span>
                  <strong className="text-sm text-[#2A1D20]">{currentUser.name}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                  <span className="text-gray-500 block">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                  <strong className="text-sm text-[#2A1D20]">{currentUser.email}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                  <span className="text-gray-500 block">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
                  <strong className="text-sm text-[#2A1D20]">{currentUser.phone}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                  <span className="text-gray-500 block">{language === 'ar' ? 'المرحلة الحالية' : 'Active Stage'}</span>
                  <strong className="text-sm text-[#D91B3E]">
                    {language === 'ar' ? stageInfo.titleAr : stageInfo.titleEn}
                  </strong>
                </div>
              </div>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 bg-red-gradient text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                <Compass className="w-4 h-4" />
                <span>{language === 'ar' ? 'تعديل المرحلة الحياتية' : 'Update Lifecycle Stage'}</span>
              </Link>
            </div>
          )}

          {/* 2. JOURNEY SUMMARY */}
          {activeTab === 'journey' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-[#2A1D20]">
                    {language === 'ar' ? 'مخطط رحلة الزواج (نظرة سريعة)' : 'Wedding Journey Planner Overview'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {journey
                      ? `${journey.summary.doneTasks} / ${journey.summary.totalTasks} ${
                          language === 'ar' ? 'مهام منجزة' : 'tasks completed'
                        }`
                      : ''}
                  </p>
                </div>
                <Link
                  to="/my/journey"
                  className="bg-red-gradient text-white font-bold text-xs px-4 py-2.5 rounded-xl"
                >
                  {language === 'ar' ? 'فتح مخطط الرحلة الكامل' : 'Open Full Journey Planner'}
                </Link>
              </div>

              <div className="space-y-2">
                {(journey?.tasks || []).slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-gray-100 flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="font-bold text-[#2A1D20]">
                      {language === 'ar' ? t.titleAr : t.titleEn}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-gray-200 font-bold text-[10px]">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. BUDGET OVERVIEW */}
          {activeTab === 'budget' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? 'ملخص مدير ميزانية الزواج' : 'Wedding Budget Summary'}
                </h2>
                <Link
                  to="/my/budget"
                  className="bg-red-gradient text-white font-bold text-xs px-4 py-2.5 rounded-xl"
                >
                  {language === 'ar' ? 'إدارة الميزانية والمصروفات' : 'Open Budget Manager'}
                </Link>
              </div>
              {budgetOverview ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                    <span className="text-gray-500 block">{language === 'ar' ? 'الحد الأقصى' : 'Budget Cap'}</span>
                    <strong className="text-base text-[#2A1D20]">
                      {fmtEgp(budgetOverview.summary.totalBudgetLimit, language)}
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                    <span className="text-gray-500 block">{language === 'ar' ? 'المدفوع والالتزامات' : 'Committed'}</span>
                    <strong className="text-base text-[#D91B3E]">
                      {fmtEgp(budgetOverview.summary.totalCommitted, language)}
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                    <span className="text-gray-500 block">{language === 'ar' ? 'المتبقي' : 'Remaining'}</span>
                    <strong className="text-base text-emerald-700">
                      {fmtEgp(budgetOverview.summary.remainingFromLimit, language)}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'افتح مدير الميزانية لبدء التوزيع.' : 'Open Budget Manager to configure allocations.'}
                </p>
              )}
            </div>
          )}

          {/* 4. PRIVATE EARLY START SAVINGS */}
          {activeTab === 'savings' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                    <Lock className="w-3 h-3" />
                    <span>
                      {language === 'ar'
                        ? 'بيانات خاصة محمية لك وحدك — غير ظاهرة في المساحة المشتركة'
                        : 'Strictly Private Owner-Only — Never Exposed in Shared Workspace'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-[#2A1D20]">
                    {language === 'ar' ? 'صندوق مستقبلي والبداية المبكرة' : 'My Future Fund & Early Start'}
                  </h2>
                </div>
                <Link
                  to="/my/future-fund"
                  className="bg-red-gradient text-white font-bold text-xs px-4 py-2.5 rounded-xl"
                >
                  {language === 'ar' ? 'إدارة صناديق الادخار' : 'Open My Future Fund'}
                </Link>
              </div>

              {earlyStartOverview && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                    <span className="text-gray-500 block">{language === 'ar' ? 'إجمالي المدخر' : 'Current Saved'}</span>
                    <strong className="text-base text-emerald-700">
                      {fmtEgp(earlyStartOverview.summary.totalCurrentSaved, language)}
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                    <span className="text-gray-500 block">{language === 'ar' ? 'نسبة الإنجاز' : 'Completion'}</span>
                    <strong className="text-base text-[#D91B3E]">
                      {earlyStartOverview.summary.overallCompletionPercent}%
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF7F2]">
                    <span className="text-gray-500 block">{language === 'ar' ? 'سلسلة الالتزام' : 'Habit Streak'}</span>
                    <strong className="text-base text-[#2A1D20]">
                      {earlyStartOverview.summary.streakMonths} {language === 'ar' ? 'أشهر' : 'mo'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. CHECKLISTS UNIFIED */}
          {activeTab === 'checklists' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar' ? 'ملخص القوائم والخطوبة وجهاز الزوجين' : 'Checklists, Engagement & Trousseau Status'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/engagement"
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 hover:border-[#D91B3E] transition space-y-1.5"
                >
                  <span className="text-xs font-black text-[#D91B3E]">
                    {language === 'ar' ? 'مخطط الخطوبة' : 'Engagement Planner'}
                  </span>
                  <p className="text-base font-black text-[#2A1D20]">
                    {engagement ? `${engagement.summary.completionPercent}%` : '0%'}{' '}
                    {language === 'ar' ? 'جاهزية' : 'ready'}
                  </p>
                </Link>
                <Link
                  to="/bride"
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 hover:border-[#D91B3E] transition space-y-1.5"
                >
                  <span className="text-xs font-black text-[#D91B3E]">
                    {language === 'ar' ? 'جهاز العروسة' : "Bride's Trousseau"}
                  </span>
                  <p className="text-base font-black text-[#2A1D20]">
                    {brideChecklist.length} {language === 'ar' ? 'عناصر محددة' : 'items checked'}
                  </p>
                </Link>
                <Link
                  to="/groom"
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 hover:border-[#D91B3E] transition space-y-1.5"
                >
                  <span className="text-xs font-black text-[#D91B3E]">
                    {language === 'ar' ? 'جهاز العريس' : "Groom's Essentials"}
                  </span>
                  <p className="text-base font-black text-[#2A1D20]">
                    {fmtEgp(groomBudgetTarget, language)}
                  </p>
                </Link>
                <Link
                  to="/finishing/encyclopedia"
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 hover:border-[#D91B3E] transition space-y-1.5"
                >
                  <span className="text-xs font-black text-[#D91B3E]">
                    {language === 'ar' ? 'الـ 22 مرحلة تشطيب' : '22 Finishing Stages'}
                  </span>
                  <p className="text-xs font-bold text-gray-600">
                    {language === 'ar' ? 'مراجعة الخطوات والخامات' : 'Inspect engineering steps'}
                  </p>
                </Link>
              </div>
            </div>
          )}

          {/* 6. SHOPPING LISTS & BASKET */}
          {activeTab === 'shopping' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-[#2A1D20]">
                    {language === 'ar' ? 'سلال المشتريات وتنبيهات الأسعار' : 'Multi-List Shopping Baskets & Price Alerts'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {language === 'ar'
                      ? `${shoppingLists.length} قوائم تسوق محفوظة • ${priceAlerts.filter((a) => a.status === 'active').length} تنبيهات سعر نشطة`
                      : `${shoppingLists.length} saved shopping baskets • ${priceAlerts.filter((a) => a.status === 'active').length} active price alerts`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/my/shopping-lists"
                    data-testid="hub-open-shopping-lists-link"
                    className="bg-red-gradient text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إدارة سلال التجهيز والتنبيهات' : 'Manage Baskets & Alerts'}</span>
                  </Link>
                  {onOpenCart && (
                    <button
                      type="button"
                      onClick={onOpenCart}
                      className="bg-[#FAF7F2] border border-gray-200 text-[#2A1D20] font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer hover:border-[#D91B3E]/40"
                    >
                      {language === 'ar' ? 'سلة الشراء' : 'Cart'} ({cart.length})
                    </button>
                  )}
                </div>
              </div>

              {shoppingLists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {shoppingLists.slice(0, 4).map((list) => (
                    <Link
                      key={list.id}
                      to="/my/shopping-lists"
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100 hover:border-[#D91B3E]/40 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-sm text-[#2A1D20]">
                          {language === 'ar' ? list.titleAr : list.titleEn}
                        </strong>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            list.isSharedWithPartner
                              ? 'bg-[#FDE8ED] text-[#B31331]'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {list.isSharedWithPartner
                            ? language === 'ar'
                              ? 'مشترك'
                              : 'Shared'
                            : language === 'ar'
                              ? 'خاص'
                              : 'Private'}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {list.items.length} {language === 'ar' ? 'عناصر' : 'items'} •{' '}
                        <strong className="text-[#D91B3E]">{fmtEgp(list.totalEstimatedCost, language)}</strong>
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 space-y-3">
                <h3 className="text-xs font-black text-[#B31331]">
                  {language === 'ar' ? 'سلة الشراء الفورية (Cart)' : 'Immediate Checkout Cart'}
                </h3>
                {cart.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    {language === 'ar'
                      ? 'سلة الشراء الفورية فارغة. أضف أي منتج من موسوعة المنتجات أو سلال التجهيز.'
                      : 'Immediate cart is empty. Browse Product Encyclopedia or transfer items from your baskets.'}
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {cart.map((c) => (
                      <div
                        key={c.product.id}
                        className="p-3.5 rounded-2xl bg-[#FAF7F2] flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-bold text-[#2A1D20]">
                          {language === 'ar' ? c.product.nameAr : c.product.nameEn} × {c.quantity}
                        </span>
                        <strong className="text-[#D91B3E]">
                          {fmtEgp(c.product.price * c.quantity, language)}
                        </strong>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-black text-sm">
                      <span>{language === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                      <span className="text-[#D91B3E]">{fmtEgp(cartTotal, language)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? 'المنتجات المفضلة المحفوظة' : 'Saved Favorites'}
                </h2>
                <Link
                  to="/products"
                  className="bg-[#FAF7F2] border border-gray-200 hover:border-[#D91B3E]/40 text-[#2A1D20] font-bold text-xs px-4 py-2 rounded-xl"
                >
                  {language === 'ar' ? 'تصفح موسوعة المنتجات' : 'Browse Product Encyclopedia'}
                </Link>
              </div>
              {savedFavoriteProducts.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {language === 'ar'
                    ? 'لم تضف منتجات للمفضلة بعد. اضغط على علامة القلب بجانب أي منتج.'
                    : 'No saved favorites yet. Heart any product in Groom, Bride or Product Encyclopedia.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedFavoriteProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-100 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/products/${p.slug || p.id}`}
                          className="font-bold text-[#2A1D20] hover:text-[#D91B3E] block truncate"
                        >
                          {language === 'ar' ? p.nameAr : p.nameEn}
                        </Link>
                        <strong className="text-[#D91B3E]">{fmtEgp(p.price, language)}</strong>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => addToCart(p, 1)}
                          className="px-3 py-1.5 rounded-lg bg-[#D91B3E] text-white font-bold cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. COMPARISONS */}
          {activeTab === 'comparisons' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? 'مصفوفة المقارنة وباقات الأجهزة' : 'Product Comparison Matrix & Groom Budget'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={compareProductIds.length > 0 ? `/products/compare?ids=${compareProductIds.join(',')}` : '/products/compare'}
                    data-testid="hub-open-compare-link"
                    className="bg-red-gradient text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {language === 'ar'
                      ? `فتح مصفوفة المقارنة (${compareProductIds.length})`
                      : `Open Comparison Matrix (${compareProductIds.length})`}
                  </Link>
                  <Link
                    to="/products"
                    className="bg-[#FAF7F2] border border-gray-200 hover:border-[#D91B3E]/40 text-[#2A1D20] font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {language === 'ar' ? 'تصفح المنتجات' : 'Product Catalog'}
                  </Link>
                </div>
              </div>

              {compareProductIds.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {compareProductIds.map((pid) => {
                    const p = products.find((item) => item.id === pid);
                    if (!p) return null;
                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex items-center justify-between gap-2"
                      >
                        <Link
                          to={`/products/${p.slug || p.id}`}
                          className="font-bold text-[#2A1D20] hover:text-[#D91B3E] truncate"
                        >
                          {language === 'ar' ? p.nameAr : p.nameEn}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleCompareProduct(p.id)}
                          className="text-xs font-bold text-gray-500 hover:text-[#D91B3E] cursor-pointer px-2"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#FAF7F2] text-xs space-y-1">
                <p className="font-bold text-[#2A1D20]">
                  {language === 'ar' ? 'سقف ميزانية باقة العريس:' : 'Groom Package Target Budget:'}{' '}
                  <strong className="text-[#D91B3E]">{fmtEgp(groomBudgetTarget, language)}</strong>
                </p>
                <p className="text-gray-600">
                  {language === 'ar'
                    ? 'قارن حتى 4 أجهزة جنباً إلى جنب حسب المواصفات والضمان الرسمي وتاريخ السعر في السوق المصري.'
                    : 'Compare up to 4 products side by side across specs, official warranty terms, pros, cons, and Egyptian pricing.'}
                </p>
              </div>
            </div>
          )}

          {/* 9. QUOTATIONS & SAVED CALCULATORS */}
          {activeTab === 'quotations' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar'
                    ? `المقايسات (${finishingInquiries.length}) والحاسبات المحفوظة (${calculatorRuns.length})`
                    : `Finishing Quotes (${finishingInquiries.length}) & Saved Calculators (${calculatorRuns.length})`}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/rfq"
                    className="px-4 py-2 rounded-xl bg-white border border-[#D91B3E]/30 text-[#B31331] font-bold text-xs"
                  >
                    {language === 'ar' ? 'مركز عروض أسعار الشركاء (RFQ)' : 'Multi-Vendor RFQ Center'}
                  </Link>
                  <Link
                    to="/calculators"
                    className="bg-red-gradient text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {language === 'ar' ? 'فتح الـ 20 حاسبة' : 'Open Calculators'}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <h3 className="font-black text-[#B31331]">
                    {language === 'ar' ? 'طلبات مقايسات التشطيب' : 'Finishing Quotes'}
                  </h3>
                  {finishingInquiries.length === 0 ? (
                    <p className="text-gray-500">
                      {language === 'ar' ? 'لا توجد مقايسات بعد.' : 'No finishing quotes yet.'}
                    </p>
                  ) : (
                    finishingInquiries.map((inq) => (
                      <div key={inq.id} className="p-3 rounded-xl bg-[#FAF7F2]">
                        <strong>{inq.finishingTier}</strong> ({inq.areaSqm}m²) —{' '}
                        {fmtEgp(inq.budgetEGP || inq.estimatedCostMax || 0, language)}
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-[#B31331]">
                    {language === 'ar' ? 'نتائج الحاسبات المحفوظة' : 'Saved Calculator Runs'}
                  </h3>
                  {calculatorRuns.length === 0 ? (
                    <p className="text-gray-500">
                      {language === 'ar' ? 'لا توجد حسابات محفوظة بعد.' : 'No saved calculations yet.'}
                    </p>
                  ) : (
                    calculatorRuns.slice(0, 5).map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-[#FAF7F2]">
                        <strong>{r.savedTitle || r.calculatorSlug}</strong> —{' '}
                        {fmtEgp(r.primaryValue, language)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 10. WEDDING BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar'
                    ? `حجوزات الفرح والقاعات (${weddingBookings.length})`
                    : `Wedding Service Bookings (${weddingBookings.length})`}
                </h2>
                <Link to="/wedding" className="bg-red-gradient text-white font-bold text-xs px-4 py-2 rounded-xl">
                  {language === 'ar' ? 'تصفح القاعات والخدمات' : 'Browse Wedding Services'}
                </Link>
              </div>
              {weddingBookings.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'لا توجد حجوزات فرح حالياً.' : 'No wedding bookings submitted yet.'}
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  {weddingBookings.map((wb) => (
                    <div key={wb.id} className="p-4 rounded-2xl bg-[#FAF7F2] flex justify-between items-center">
                      <div>
                        <strong className="text-[#2A1D20] block">{wb.serviceName}</strong>
                        <span className="text-gray-500">{wb.weddingDate} • {wb.governorate}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white font-bold">{wb.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 11. APPOINTMENTS SCHEDULER */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar' ? 'المواعيد والزيارات الميدانية' : 'Appointments & Visits Scheduler'}
              </h2>

              <form
                onSubmit={(e) => void handleCreateApt(e)}
                data-testid="create-appointment-form"
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
              >
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'عنوان الموعد' : 'Appointment Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={aptTitle}
                    onChange={(e) => setAptTitle(e.target.value)}
                    data-testid="apt-title-input"
                    placeholder={language === 'ar' ? 'زيارة معرض سيراميك / قاعة' : 'e.g., Hall viewing'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'المزود / المكان' : 'Provider'}
                  </label>
                  <input
                    type="text"
                    required
                    value={aptProvider}
                    onChange={(e) => setAptProvider(e.target.value)}
                    data-testid="apt-provider-input"
                    placeholder={language === 'ar' ? 'اسم الشركة أو القاعة' : 'Provider name'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </label>
                  <select
                    value={aptType}
                    onChange={(e) => setAptType(e.target.value as UserAppointmentType)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="showroom">{language === 'ar' ? 'معرض' : 'Showroom'}</option>
                    <option value="finishing_visit">{language === 'ar' ? 'معاينة شقة' : 'Site Survey'}</option>
                    <option value="hall_tour">{language === 'ar' ? 'معاينة قاعة' : 'Hall Tour'}</option>
                    <option value="gold_shopping">{language === 'ar' ? 'صاغة/شبكة' : 'Shabka/Gold'}</option>
                    <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'العنوان / المنطقه' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={aptLocation}
                    onChange={(e) => setAptLocation(e.target.value)}
                    placeholder={language === 'ar' ? 'التجمع / مدينة نصر' : 'Cairo district'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'التوقيت' : 'Scheduled Date/Time'}
                  </label>
                  <input
                    type="datetime-local"
                    value={aptScheduledAt}
                    onChange={(e) => setAptScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="create-appointment-btn"
                  className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة موعد' : 'Schedule'}</span>
                </button>
              </form>

              <div className="space-y-2.5" data-testid="appointments-list">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-sm text-[#2A1D20] block">{apt.title}</strong>
                      <span className="text-gray-500">
                        {apt.providerName} • {apt.locationText} • {apt.scheduledAt}
                      </span>
                    </div>
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        void patchUserAppointment(apt.id, {
                          status: e.target.value as UserAppointmentStatus,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-[#FAF7F2] font-bold"
                    >
                      <option value="scheduled">{language === 'ar' ? 'مجدول' : 'Scheduled'}</option>
                      <option value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                      <option value="completed">{language === 'ar' ? 'تمت الزيارة' : 'Completed'}</option>
                      <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. DOCUMENT LOCKER */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? 'خزنة المستندات وملف البيت الآمن' : 'Document Locker & Shared Home File'}
                </h2>
                <p className="text-xs text-gray-500">
                  {language === 'ar'
                    ? 'حدد بوضوح هل المستند خاص بك وحدك أم مشترك مع شريكك داخل المساحة المشتركة.'
                    : 'Choose whether each contract, floor plan or receipt stays Private or is Shared with your Partner.'}
                </p>
              </div>

              <form
                onSubmit={(e) => void handleCreateDoc(e)}
                data-testid="create-document-form"
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end"
              >
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'عنوان المستند' : 'Document Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    data-testid="doc-title-input"
                    placeholder={language === 'ar' ? 'مثال: عقد تشطيب أو فاتورة أجهزة' : 'e.g.,Finishing Contract'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'اسم الملف' : 'File Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={docFileName}
                    onChange={(e) => setDocFileName(e.target.value)}
                    data-testid="doc-filename-input"
                    placeholder="contract-2026.pdf"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'تصنيف المستند' : 'Doc Type'}
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as UserDocumentType)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="contract">{language === 'ar' ? 'عقد' : 'Contract'}</option>
                    <option value="floor_plan">{language === 'ar' ? 'رسم هندسي' : 'Floor Plan'}</option>
                    <option value="warranty">{language === 'ar' ? 'شهادة ضمان' : 'Warranty'}</option>
                    <option value="receipt">{language === 'ar' ? 'إيصال / فاتورة' : 'Receipt'}</option>
                    <option value="quote">{language === 'ar' ? 'عرض سعر' : 'Quotation'}</option>
                    <option value="id_copy">{language === 'ar' ? 'وثيقة هوية (خاصة)' : 'ID Copy'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'الرقم المرجعي' : 'Reference Code'}
                  </label>
                  <input
                    type="text"
                    value={docRefCode}
                    onChange={(e) => setDocRefCode(e.target.value)}
                    placeholder="REF-2026"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-[#2A1D20] py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={docShared}
                    onChange={(e) => setDocShared(e.target.checked)}
                    data-testid="doc-shared-checkbox"
                    className="accent-[#D91B3E] w-4 h-4"
                  />
                  <span>
                    {language === 'ar' ? 'مشاركة داخل مساحة الزوجين' : 'Share with Workspace Partner'}
                  </span>
                </label>
                <button
                  type="submit"
                  data-testid="create-document-btn"
                  className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ المستند' : 'Store Document'}</span>
                </button>
              </form>

              <div className="space-y-2.5" data-testid="documents-list">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    data-testid={`doc-item-${doc.id}`}
                    className="p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="w-4 h-4 text-[#D91B3E] shrink-0" />
                        <strong className="text-sm text-[#2A1D20]">{doc.title}</strong>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            doc.isSharedWithPartner
                              ? 'bg-[#FDE8ED] text-[#B31331]'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {doc.isSharedWithPartner
                            ? language === 'ar'
                              ? 'مشترك مع الشريك'
                              : 'Shared'
                            : language === 'ar'
                              ? 'خاص'
                              : 'Private'}
                        </span>
                      </div>
                      <p className="text-gray-500 truncate">
                        {doc.fileName} {doc.referenceCode ? `• ${doc.referenceCode}` : ''}
                      </p>
                    </div>
                    {doc.userId === currentUser.id && (
                      <button
                        type="button"
                        onClick={() => void deleteUserDocument(doc.id)}
                        aria-label="Delete document"
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. INVOICES & ORDERS */}
          {activeTab === 'invoices' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar' ? 'الطلبات والفواتير وطلبات التقسيط' : 'Orders, Invoices & Installments'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <h3 className="font-black text-[#B31331]">
                    {language === 'ar' ? `الطلبات (${orders.length})` : `Orders (${orders.length})`}
                  </h3>
                  {orders.map((o) => (
                    <div key={o.id} className="p-3.5 rounded-2xl bg-[#FAF7F2] flex justify-between">
                      <span>#{o.id}</span>
                      <strong className="text-[#D91B3E]">{fmtEgp(o.total, language)}</strong>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-[#B31331]">
                    {language === 'ar'
                      ? `طلبات التقسيط (${financingApplications.length})`
                      : `Financing (${financingApplications.length})`}
                  </h3>
                  {financingApplications.map((f) => (
                    <div key={f.id} className="p-3.5 rounded-2xl bg-[#FAF7F2] flex justify-between">
                      <span>#{f.id} ({f.tenureMonths}m)</span>
                      <strong className="text-[#D91B3E]">{fmtEgp(f.requestedAmount, language)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 14. WARRANTY TRACKER */}
          {activeTab === 'warranties' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar' ? 'متابع ضمانات الأجهزة والتشطيب' : 'Appliance & Contractor Warranty Tracker'}
              </h2>

              <form
                onSubmit={(e) => void handleCreateWarranty(e)}
                data-testid="create-warranty-form"
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
              >
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'اسم الجهاز / البند' : 'Item Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={warItem}
                    onChange={(e) => setWarItem(e.target.value)}
                    data-testid="warranty-item-input"
                    placeholder={language === 'ar' ? 'مثال: غسالة أو تكييف' : 'e.g., Inverter AC 2.25 HP'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'الشركة الضامنة' : 'Provider'}
                  </label>
                  <input
                    type="text"
                    required
                    value={warProvider}
                    onChange={(e) => setWarProvider(e.target.value)}
                    data-testid="warranty-provider-input"
                    placeholder={language === 'ar' ? 'العربي / LG / توكيل رسمي' : 'Authorized Dealer'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={warCategory}
                    onChange={(e) => setWarCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'بداية الضمان' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={warStart}
                    onChange={(e) => setWarStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                  </label>
                  <input
                    type="date"
                    value={warExpiry}
                    onChange={(e) => setWarExpiry(e.target.value)}
                    data-testid="warranty-expiry-input"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="create-warranty-btn"
                  className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة ضمان' : 'Register Warranty'}</span>
                </button>
              </form>

              <div className="space-y-2.5" data-testid="warranties-list">
                {warranties.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-sm text-[#2A1D20] block">{w.itemName}</strong>
                      <span className="text-gray-500">
                        {w.providerName} • {language === 'ar' ? 'ينتهي في:' : 'Expires:'}{' '}
                        <strong className="text-[#D91B3E]">{w.expiryDate}</strong>
                        {w.modelSerial ? ` • S/N: ${w.modelSerial}` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteUserWarranty(w.id)}
                      aria-label="Delete warranty"
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 15. NOTIFICATIONS CENTER */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? 'التنبيهات والتذكيرات الشخصية' : 'Notifications & Alerts Center'}
                </h2>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllNotificationsRead()}
                    data-testid="mark-all-notifs-read-btn"
                    className="px-4 py-2 rounded-xl bg-[#FDE8ED] text-[#B31331] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All Read'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5" data-testid="notifications-list">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    {language === 'ar' ? 'لا توجد تنبيهات حالياً.' : 'You are completely caught up.'}
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      data-testid={`notif-item-${n.id}`}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        n.isRead
                          ? 'bg-[#FAF7F2]/60 border-gray-100 text-gray-600'
                          : 'bg-[#FFF8F9] border-[#D91B3E]/30 text-[#2A1D20]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#D91B3E] shrink-0" />
                          )}
                          <strong className="text-sm">
                            {language === 'ar' ? n.titleAr : n.titleEn}
                          </strong>
                        </div>
                        <p>{language === 'ar' ? n.bodyAr : n.bodyEn}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {n.linkPath && (
                          <Link
                            to={n.linkPath}
                            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-bold text-[#D91B3E]"
                          >
                            {language === 'ar' ? 'فتح' : 'Open'}
                          </Link>
                        )}
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => void markNotificationRead(n.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#D91B3E] text-white font-bold cursor-pointer"
                          >
                            {language === 'ar' ? 'تمت القراءة' : 'Mark Read'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 16. SHARED COUPLE WORKSPACE */}
          {activeTab === 'workspace' && workspacePayload && (
            <div className="space-y-6">
              {/* Incoming Invitations (Consent Required!) */}
              <div className="bg-white rounded-3xl p-6 border border-[#D91B3E]/25 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#D91B3E]" />
                  <h2 className="text-base font-black text-[#2A1D20]">
                    {language === 'ar'
                      ? 'دعوات الانضمام الواردة لمساحة الزوجين'
                      : 'Incoming Shared Workspace Invitations'}
                  </h2>
                </div>

                {workspacePayload.incomingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    data-testid={`incoming-invite-${inv.inviteToken}`}
                    className="p-4 rounded-2xl bg-[#FFF8F9] border border-[#D91B3E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <strong className="text-sm text-[#B31331] block">
                        {language === 'ar' ? inv.workspaceNameAr : inv.workspaceNameEn}
                      </strong>
                      <p className="text-gray-700">
                        {language === 'ar' ? 'دعوة من:' : 'From:'} <strong>{inv.inviterName}</strong> •{' '}
                        {inv.proposedRole} ({inv.proposedSide})
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        data-testid="accept-invite-btn"
                        onClick={() => void respondWorkspaceInvitation(inv.inviteToken, 'accept')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'موافقة وانضمام' : 'Accept Invite'}</span>
                      </button>
                      <button
                        type="button"
                        data-testid="decline-invite-btn"
                        onClick={() => void respondWorkspaceInvitation(inv.inviteToken, 'decline')}
                        className="bg-white border border-gray-200 hover:bg-rose-50 text-gray-700 font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'رفض' : 'Decline'}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Optional Manual Invite Token Paste */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    value={manualTokenInput}
                    onChange={(e) => setManualTokenInput(e.target.value)}
                    data-testid="manual-invite-token-input"
                    placeholder={
                      language === 'ar'
                        ? 'هل لديك رمز دعوة من شريكك؟ الصقه هنا (gwi-...)'
                        : 'Have an explicit invite token (gwi-...)? Paste here to accept'
                    }
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                  />
                  <button
                    type="button"
                    disabled={!manualTokenInput.trim()}
                    onClick={() => {
                      const tok = manualTokenInput.trim();
                      setManualTokenInput('');
                      void respondWorkspaceInvitation(tok, 'accept');
                    }}
                    data-testid="accept-manual-token-btn"
                    className="bg-[#2A1D20] text-white font-bold text-xs px-4 py-2 rounded-xl disabled:opacity-40 cursor-pointer"
                  >
                    {language === 'ar' ? 'تأكيد بالرمز' : 'Accept by Token'}
                  </button>
                </div>
              </div>

              {/* Workspace Metadata & Rename */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-[#2A1D20]" data-testid="workspace-title">
                      {language === 'ar'
                        ? workspacePayload.workspace.nameAr
                        : workspacePayload.workspace.nameEn}
                    </h2>
                    <span className="text-xs font-bold text-[#D91B3E]">
                      {language === 'ar' ? 'دورك الحالي:' : 'Your Role:'} {workspacePayload.myRole}
                    </span>
                  </div>

                  {workspacePayload.myRole === 'owner' && (
                    <form
                      onSubmit={(e) => void handleSaveWorkspaceMeta(e)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={
                          wsNameDraft ??
                          (language === 'ar'
                            ? workspacePayload.workspace.nameAr
                            : workspacePayload.workspace.nameEn)
                        }
                        onChange={(e) => setWsNameDraft(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                      />
                      <button
                        type="submit"
                        className="bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#D91B3E] font-bold text-xs px-3 py-2 rounded-xl border border-[#D91B3E]/20 cursor-pointer"
                      >
                        {language === 'ar' ? 'تحديث الاسم' : 'Rename'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Members Directory with Granular Permission Checkboxes & Revocation */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#2A1D20]">
                    {language === 'ar'
                      ? 'أعضاء المساحة المشتركة والصلاحيات الدقيقة'
                      : 'Active Workspace Members & Granular Permissions'}
                  </h3>

                  {workspacePayload.members.map((m) => (
                    <div
                      key={m.id}
                      data-testid={`workspace-member-${m.userId}`}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <strong className="text-sm text-[#2A1D20]">{m.userName}</strong>{' '}
                          <span className="text-gray-500">({m.userEmail})</span>
                          <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-[#FDE8ED] text-[#B31331] text-[10px] font-black">
                              {m.memberRole}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white text-gray-700 text-[10px] font-bold border border-gray-200">
                              {m.sideLabel}
                            </span>
                          </div>
                        </div>

                        {m.memberRole !== 'owner' &&
                          (workspacePayload.myRole === 'owner' || m.userId === currentUser.id) && (
                            <button
                              type="button"
                              onClick={() => void revokeWorkspaceMember(m.id)}
                              data-testid={`revoke-member-${m.userId}`}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>
                                {workspacePayload.myRole === 'owner'
                                  ? language === 'ar'
                                    ? 'إلغاء الوصول فوراً'
                                    : 'Revoke Access'
                                  : language === 'ar'
                                    ? 'مغادرة المساحة'
                                    : 'Leave Workspace'}
                              </span>
                            </button>
                          )}
                      </div>

                      {m.memberRole !== 'owner' && workspacePayload.myRole === 'owner' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200/70">
                          {permissionLabels.map(([permKey, lblAr, lblEn]) => (
                            <label
                              key={permKey}
                              className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={m.permissions[permKey]}
                                onChange={(e) =>
                                  void updateWorkspaceMemberPermissions(m.id, {
                                    ...m.permissions,
                                    [permKey]: e.target.checked,
                                  })
                                }
                                className="accent-[#D91B3E]"
                              />
                              <span>{language === 'ar' ? lblAr : lblEn}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Invite Partner Form (Owner Only) */}
                {workspacePayload.myRole === 'owner' && (
                  <form
                    onSubmit={(e) => void handleSendInvite(e)}
                    data-testid="invite-partner-form"
                    className="p-5 rounded-2xl bg-[#FFF8F9] border border-[#D91B3E]/20 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#D91B3E]" />
                      <h3 className="text-sm font-black text-[#B31331]">
                        {language === 'ar'
                          ? 'دعوة شريك الحياة أو مستشار عائلي برمز موافقة رسمي'
                          : 'Invite Partner or Planner Guest with Explicit Consent Token'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">
                          {language === 'ar' ? 'بريد أو هاتف الشريك' : 'Partner Email or Phone'}
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteIdent}
                          onChange={(e) => setInviteIdent(e.target.value)}
                          data-testid="invite-identifier-input"
                          placeholder="sara@gawazinn.demo"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">
                          {language === 'ar' ? 'الدور المقترح' : 'Proposed Role'}
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) =>
                            setInviteRole(e.target.value as 'partner' | 'planner_guest')
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                        >
                          <option value="partner">{language === 'ar' ? 'شريك (Partner)' : 'Partner'}</option>
                          <option value="planner_guest">
                            {language === 'ar' ? 'منظم عائلي (Guest)' : 'Planner Guest'}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">
                          {language === 'ar' ? 'الصفة' : 'Side'}
                        </label>
                        <select
                          value={inviteSide}
                          onChange={(e) =>
                            setInviteSide(e.target.value as 'groom' | 'bride' | 'partner')
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                        >
                          <option value="bride">{language === 'ar' ? 'العروسة' : 'Bride'}</option>
                          <option value="groom">{language === 'ar' ? 'العريس' : 'Groom'}</option>
                          <option value="partner">{language === 'ar' ? 'الشريك' : 'Partner'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {permissionLabels.map(([permKey, lblAr, lblEn]) => (
                        <label
                          key={permKey}
                          className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={invitePerms[permKey]}
                            onChange={(e) =>
                              setInvitePerms((prev) => ({
                                ...prev,
                                [permKey]: e.target.checked,
                              }))
                            }
                            className="accent-[#D91B3E]"
                          />
                          <span>{language === 'ar' ? lblAr : lblEn}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="submit"
                      data-testid="send-workspace-invite-btn"
                      className="bg-red-gradient text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer"
                    >
                      {language === 'ar' ? 'إصدار وإرسال دعوة المساحة' : 'Send Workspace Invite'}
                    </button>

                    {latestIssuedToken && (
                      <div
                        data-testid="generated-invite-token"
                        className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <span>
                          {language === 'ar' ? 'تم إصدار رمز الدعوة:' : 'Issued Invite Token:'}{' '}
                          <code className="font-black text-[#D91B3E]">{latestIssuedToken}</code>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard?.writeText(latestIssuedToken);
                            showToast(language === 'ar' ? 'تم نسخ الرمز.' : 'Invite token copied.');
                          }}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FDE8ED] cursor-pointer"
                          aria-label="Copy token"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#D91B3E]" />
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* Shared Purchase Approvals Workflow */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#D91B3E]" />
                    <h3 className="text-sm sm:text-base font-black text-[#2A1D20]">
                      {language === 'ar'
                        ? 'طلبات الموافقة المشتركة على المشتريات الكبيرة'
                        : 'Shared Purchase Approvals Workflow'}
                    </h3>
                  </div>

                  <form
                    onSubmit={(e) => void handleCreateApproval(e)}
                    data-testid="create-approval-form"
                    className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
                  >
                    <input
                      type="text"
                      required
                      value={approvalTitle}
                      onChange={(e) => setApprovalTitle(e.target.value)}
                      data-testid="approval-title-input"
                      placeholder={
                        language === 'ar' ? 'مثال: غسالة صحون 14 فرد' : 'e.g., 14-place dishwasher'
                      }
                      className="sm:col-span-2 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    />
                    <input
                      type="text"
                      value={approvalCategory}
                      onChange={(e) => setApprovalCategory(e.target.value)}
                      placeholder="appliances"
                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={approvalAmount}
                        onChange={(e) => setApprovalAmount(Number(e.target.value) || 0)}
                        className="w-28 px-2.5 py-2 rounded-xl border border-gray-200 text-xs bg-[#FAF7F2]"
                      />
                      <button
                        type="submit"
                        data-testid="create-approval-btn"
                        className="flex-1 bg-[#2A1D20] text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                      >
                        {language === 'ar' ? 'طلب موافقة' : 'Request'}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5" data-testid="workspace-approvals-list">
                    {workspacePayload.approvals.map((app) => (
                      <div
                        key={app.id}
                        data-testid={`approval-item-${app.id}`}
                        className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm text-[#2A1D20]">{app.title}</strong>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                app.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'rejected'
                                    ? 'bg-gray-200 text-gray-800'
                                    : app.status === 'changes_requested'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-[#FDE8ED] text-[#D91B3E]'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-0.5">
                            {app.requestedByName} • <Briefcase className="w-3 h-3 inline" />{' '}
                            {app.category} •{' '}
                            <strong className="text-[#D91B3E]">
                              {fmtEgp(app.estimatedAmount, language)}
                            </strong>
                          </p>
                        </div>

                        {(workspacePayload.myRole === 'owner' ||
                          workspacePayload.myPermissions.approvePurchases) &&
                          app.status === 'pending' && (
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => void decideWorkspaceApproval(app.id, 'approved')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                              >
                                {language === 'ar' ? 'موافقة' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void decideWorkspaceApproval(
                                    app.id,
                                    'changes_requested',
                                    language === 'ar' ? 'مراجعة عرض بديل' : 'Compare another option',
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold cursor-pointer"
                              >
                                {language === 'ar' ? 'تعديل' : 'Review'}
                              </button>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 17. PRIVACY & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-[#2A1D20]">
                {language === 'ar' ? 'إعدادات الخصوصية واللغة' : 'Privacy Covenant & Preferences'}
              </h2>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 flex items-start gap-3 text-xs">
                <ShieldAlert className="w-5 h-5 text-[#D91B3E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-[#2A1D20] block">
                    {language === 'ar'
                      ? 'الخصوصية الافتراضية على جواز إن'
                      : 'Zero-Surveillance & Explicit Consent Privacy Policy'}
                  </strong>
                  <p className="text-gray-600 leading-relaxed">
                    {language === 'ar'
                      ? 'تظل خطط البداية المبكرة وصندوق مستقبلك والميزانية الخاصة والمستندات المصنفة كـ "خاصة" معزولة تماماً لمالكها حتى في حال تفعيل مساحة الزوجين المشتركة.'
                      : 'Early Start profiles, My Future Fund savings goals, private budgets, and Private documents always remain strictly isolated to their owner — even when Shared Couple Workspace is active.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  className="bg-red-gradient text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  {language === 'ar' ? 'التبديل إلى الإنجليزية (LTR)' : 'Switch to Arabic (RTL)'}
                </button>
                <Link
                  to="/onboarding"
                  className="bg-[#FAF7F2] text-[#2A1D20] font-bold text-xs px-5 py-2.5 rounded-xl border border-gray-200"
                >
                  {language === 'ar' ? 'المرحلة الحياتية (11 مرحلة)' : 'Lifecycle Onboarding'}
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

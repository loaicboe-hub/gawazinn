import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { HonestRatingBadge, VerificationBadge } from '../vendors/VendorBadges';
import type {
  MarketplaceAppointmentStatus,
  RfqRequest,
  RfqStatus,
} from '../../types';
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Store,
  Wallet,
  XCircle,
} from 'lucide-react';

type RfqTabKey = 'rfqs' | 'new' | 'appointments';

const RFQ_STATUS_LABELS: Record<RfqStatus, { ar: string; en: string; cls: string }> = {
  open: { ar: 'مفتوح للمطابقة', en: 'Open', cls: 'bg-sky-50 text-sky-800 border-sky-200' },
  quoted: {
    ar: 'وصلت عروض أسعار',
    en: 'Quotes Received',
    cls: 'bg-[#FDE8ED] text-[#B31331] border-[#D91B3E]/30',
  },
  accepted: {
    ar: 'تم القبول والربط بالميزانية',
    en: 'Accepted & Linked',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  closed: { ar: 'مغلق', en: 'Closed', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
};

const APT_STATUS_LABELS: Record<MarketplaceAppointmentStatus, { ar: string; en: string; cls: string }> = {
  requested: {
    ar: 'قيد انتظار تأكيد الشريك',
    en: 'Requested (Awaiting Vendor)',
    cls: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  confirmed: {
    ar: 'موعد مؤكد من الشريك',
    en: 'Confirmed by Vendor',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  rescheduled: {
    ar: 'مقترح تعديل الموعد',
    en: 'Rescheduled',
    cls: 'bg-sky-50 text-sky-900 border-sky-200',
  },
  cancelled: {
    ar: 'ملغي',
    en: 'Cancelled',
    cls: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  completed: {
    ar: 'تمت الزيارة / المعاينة',
    en: 'Completed',
    cls: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
};

const APT_TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  site_visit: { ar: 'معاينة موقع / شقة', en: 'Site Visit' },
  showroom: { ar: 'زيارة المعرض', en: 'Showroom Visit' },
  hall_tour: { ar: 'جولة قاعة فرح', en: 'Venue Tour' },
  video_consultation: { ar: 'استشارة فيديو أونلاين', en: 'Video Consultation' },
  contract_signing: { ar: 'توقيع عقد', en: 'Contract Signing' },
  measuring: { ar: 'رفع مقاسات هندسية', en: 'Measuring Session' },
};

export const RfqCenterView: React.FC<{ initialTab?: RfqTabKey }> = ({ initialTab = 'rfqs' }) => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    vendors,
    vendorCategories,
    locations,
    myRfqs,
    marketplaceAppointments,
    createRfqRequest,
    decideRfqQuote,
    postRfqMessage,
    patchMarketplaceAppointment,
    showToast,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryTab = searchParams.get('tab') as RfqTabKey | null;
  const activeTab: RfqTabKey = useMemo(() => {
    if (queryTab === 'rfqs' || queryTab === 'new' || queryTab === 'appointments') {
      return queryTab;
    }
    if (location.pathname === '/rfq/new') return 'new';
    return initialTab;
  }, [queryTab, location.pathname, initialTab]);

  const prefilledVendorId = searchParams.get('vendorId') || '';
  const prefilledCategory = searchParams.get('category') || '';

  const [title, setTitle] = useState('');
  const [categorySlug, setCategorySlug] = useState(
    () => prefilledCategory || vendorCategories[0]?.slug || 'turnkey_finishing',
  );
  const [governorateSlug, setGovernorateSlug] = useState('cairo');
  const [targetVendorId, setTargetVendorId] = useState(() => prefilledVendorId);
  const [budgetMin, setBudgetMin] = useState(120000);
  const [budgetMax, setBudgetMax] = useState(250000);
  const [desiredDate, setDesiredDate] = useState('2026-12-20');
  const [preferredContact, setPreferredContact] = useState<'platform' | 'phone' | 'whatsapp'>('platform');
  const [areaSqm, setAreaSqm] = useState('130');
  const [scopeDetails, setScopeDetails] = useState('');
  const [creatingRfq, setCreatingRfq] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [msgVendorByRfq, setMsgVendorByRfq] = useState<Record<string, string>>({});
  const [msgDraftByRfq, setMsgDraftByRfq] = useState<Record<string, string>>({});
  const [busyActionId, setBusyActionId] = useState<string | null>(null);

  const regionalLocations = useMemo(
    () => locations.filter((l) => l.level !== 'country'),
    [locations],
  );

  const switchTab = (nextTab: RfqTabKey) => {
    if (location.pathname === '/rfq/new' && nextTab !== 'new') {
      navigate(`/rfq?tab=${nextTab}`);
      return;
    }
    setSearchParams({ tab: nextTab });
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] mx-auto flex items-center justify-center shadow-lg border border-rose-200">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar'
            ? 'سجل دخولك لطلب ومقارنة عروض الأسعار (RFQ) وحجز المواعيد'
            : 'Sign In for Multi-Vendor Quote Requests & Slot Appointments'}
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {language === 'ar'
            ? 'أرسل طلب تسعير واحد ليصل إلى مقدمي الخدمة الموثقين والمطابقين لتخصصك ومحافظتك، وقارن العروض جنباً إلى جنب مع سرية تامة لكل مورد وربط مباشر بميزانية الزواج.'
            : 'Submit one structured RFQ to matched Egyptian vendors, compare sealed quotes side-by-side without leaking competitor prices, book confirmed visits, and sync your accepted contract straight into Wedding Budget Manager.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            data-testid="rfq-signin-btn"
            onClick={() => setAuthModalOpen(true)}
            className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md cursor-pointer"
          >
            {language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In Now'}
          </button>
          <Link
            to="/vendors"
            className="bg-white border border-gray-200 text-gray-700 font-bold text-xs py-3 px-6 rounded-xl"
          >
            {language === 'ar' ? 'تصفح دليل الشركاء' : 'Browse Vendors'}
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRfq(true);
    setFormError(null);
    try {
      const effectiveCategory = categorySlug || prefilledCategory || vendorCategories[0]?.slug || 'turnkey_finishing';
      const effectiveTarget = targetVendorId || prefilledVendorId || null;
      await createRfqRequest({
        title: title.trim(),
        categorySlug: effectiveCategory,
        governorateSlug,
        budgetMin: Number(budgetMin),
        budgetMax: Math.max(Number(budgetMin), Number(budgetMax)),
        desiredDate: desiredDate || null,
        scopeDetails: scopeDetails.trim(),
        requirements: areaSqm ? { areaSqm: Number(areaSqm) || areaSqm } : undefined,
        preferredContact,
        targetVendorId: effectiveTarget,
      });
      setTitle('');
      setScopeDetails('');
      navigate('/rfq?tab=rfqs');
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : language === 'ar'
            ? 'تعذر إرسال طلب التسعير. يرجى مراجعة البيانات.'
            : 'Could not submit RFQ request. Please check your inputs.',
      );
    } finally {
      setCreatingRfq(false);
    }
  };

  const handleDecideQuote = async (
    rfq: RfqRequest,
    quoteId: string,
    decision: 'accept' | 'reject',
  ) => {
    setBusyActionId(quoteId);
    try {
      await decideRfqQuote(rfq.id, quoteId, {
        decision,
        linkToBudget: decision === 'accept',
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleSendMessage = async (rfq: RfqRequest, e: React.FormEvent) => {
    e.preventDefault();
    const body = (msgDraftByRfq[rfq.id] || '').trim();
    if (body.length < 2) return;
    const selectedVendor =
      msgVendorByRfq[rfq.id] ||
      rfq.targetVendorId ||
      rfq.invitations?.[0]?.vendorId ||
      undefined;
    setBusyActionId(`msg-${rfq.id}`);
    try {
      await postRfqMessage(rfq.id, body, selectedVendor);
      setMsgDraftByRfq((prev) => ({ ...prev, [rfq.id]: '' }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleCancelApt = async (aptId: string) => {
    setBusyActionId(`apt-${aptId}`);
    try {
      await patchMarketplaceAppointment(aptId, { status: 'cancelled' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update appointment');
    } finally {
      setBusyActionId(null);
    }
  };

  const totalQuotesReceived = myRfqs.reduce((acc, r) => acc + (r.quotes?.length || 0), 0);
  const acceptedRfqsCount = myRfqs.filter((r) => r.status === 'accepted').length;
  const confirmedAptsCount = marketplaceAppointments.filter((a) => a.status === 'confirmed').length;

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 lg:py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {language === 'ar'
                    ? 'عروض أسعار سرية لكل مزود • ربط تلقائي بميزانية الزواج'
                    : 'Sealed Competitor Confidentiality • Direct Budget Manager Sync'}
                </span>
              </div>
              <h1
                data-testid="rfq-page-heading"
                className="text-2xl sm:text-4xl font-black text-white leading-tight"
              >
                {language === 'ar'
                  ? 'مركز طلبات التسعير والمواعيد'
                  : 'Multi-Vendor RFQ & Slot Appointments'}
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
                {language === 'ar'
                  ? 'اطلب عروض أسعار من عدة شركاء في تخصصك، قارن التكلفة والضمان والمدة بدقة، وتابع حجوزات المعاينة والزيارات.'
                  : 'Match your project against verified service providers, compare structured quotations side-by-side, and manage showroom & site-visit bookings.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="rfq-cta-new-btn"
                onClick={() => switchTab('new')}
                className="px-4 py-2.5 rounded-xl bg-white text-[#B31331] text-xs font-black shadow hover:bg-[#FDE8ED] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'طلب عرض سعر جديد (RFQ)' : 'New RFQ Request'}</span>
              </button>
              <Link
                to="/my/budget"
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5"
              >
                <Wallet className="w-4 h-4" />
                <span>{language === 'ar' ? 'ميزانية الزواج' : 'Wedding Budget'}</span>
              </Link>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-[11px] text-rose-100 block">
                {language === 'ar' ? 'طلبات التسعير المفتوحة/الحالية' : 'Your RFQ Requests'}
              </span>
              <strong data-testid="rfq-stat-total" className="text-xl font-black text-white">
                {myRfqs.length}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-[11px] text-rose-100 block">
                {language === 'ar' ? 'العروض المستلمة للمقارنة' : 'Vendor Quotes Received'}
              </span>
              <strong className="text-xl font-black text-white">{totalQuotesReceived}</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-[11px] text-rose-100 block">
                {language === 'ar' ? 'عقود معتمدة بالميزانية' : 'Accepted & Budget-Linked'}
              </span>
              <strong className="text-xl font-black text-emerald-200">{acceptedRfqsCount}</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-[11px] text-rose-100 block">
                {language === 'ar' ? 'مواعيد الشركاء المؤكدة' : 'Confirmed Appointments'}
              </span>
              <strong className="text-xl font-black text-white">
                {confirmedAptsCount} / {marketplaceAppointments.length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Tabs Bar */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="rfq-tab-rfqs"
            onClick={() => switchTab('rfqs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'rfqs'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {language === 'ar'
                ? `طلباتي ومقارنة العروض (${myRfqs.length})`
                : `My RFQs & Compare (${myRfqs.length})`}
            </span>
          </button>

          <button
            type="button"
            data-testid="rfq-tab-new"
            onClick={() => switchTab('new')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إرسال طلب تسعير جديد' : 'Submit New RFQ'}</span>
          </button>

          <button
            type="button"
            data-testid="rfq-tab-appointments"
            onClick={() => switchTab('appointments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>
              {language === 'ar'
                ? `مواعيد المعاينة والمعارض (${marketplaceAppointments.length})`
                : `Vendor Appointments (${marketplaceAppointments.length})`}
            </span>
          </button>
        </div>

        {/* TAB 1: My RFQs & Side-by-Side Comparison */}
        {activeTab === 'rfqs' && (
          <div className="space-y-6">
            {myRfqs.length === 0 ? (
              <div className="bg-[#FAF7F2] rounded-3xl p-10 border border-rose-100 text-center space-y-4">
                <FileText className="w-10 h-10 text-[#D91B3E] mx-auto" />
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? 'لا توجد طلبات تسعير بعد' : 'No RFQ Requests Yet'}
                </h2>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  {language === 'ar'
                    ? 'أنشئ طلب عرض سعر واحد لمشروع تشطيب أو أجهزة أو قاعة، وسيقوم جواز إن بدعوة الشركاء المطابقين لتقديم عروضهم لك.'
                    : 'Create a structured RFQ once and let verified Egyptian vendors submit private competitive quotes.'}
                </p>
                <button
                  type="button"
                  onClick={() => switchTab('new')}
                  className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow cursor-pointer"
                >
                  {language === 'ar' ? 'ابدأ أول طلب تسعير' : 'Create First RFQ'}
                </button>
              </div>
            ) : (
              myRfqs.map((rfq) => {
                const statusMeta = RFQ_STATUS_LABELS[rfq.status] || RFQ_STATUS_LABELS.open;
                const quotes = rfq.quotes || [];
                const invitations = rfq.invitations || [];
                const messages = rfq.messages || [];
                const selectedChatVendor =
                  msgVendorByRfq[rfq.id] ||
                  rfq.targetVendorId ||
                  invitations[0]?.vendorId ||
                  '';

                return (
                  <section
                    key={rfq.id}
                    data-testid={`rfq-card-${rfq.id}`}
                    className="bg-white rounded-3xl p-5 sm:p-7 border border-rose-100 shadow-sm space-y-6"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full border text-[11px] font-black ${statusMeta.cls}`}
                          >
                            {language === 'ar' ? statusMeta.ar : statusMeta.en}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] text-gray-700 border border-gray-200 text-[11px] font-bold">
                            {language === 'ar'
                              ? rfq.categoryNameAr || rfq.categorySlug
                              : rfq.categoryNameEn || rfq.categorySlug}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-500">
                            {rfq.governorateSlug}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-[#2A1D20]">
                          {rfq.title}
                        </h2>
                        <p className="text-xs text-gray-700 leading-relaxed">{rfq.scopeDetails}</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100 text-xs space-y-1 shrink-0">
                        <span className="text-[11px] text-gray-500 block">
                          {language === 'ar' ? 'نطاق الميزانية المتوقع:' : 'Target Budget Band:'}
                        </span>
                        <strong className="text-sm font-black text-[#D91B3E]">
                          {rfq.budgetMin.toLocaleString()} – {rfq.budgetMax.toLocaleString()}{' '}
                          {language === 'ar' ? 'ج.م' : 'EGP'}
                        </strong>
                        {rfq.desiredDate && (
                          <div className="text-[11px] text-gray-600 flex items-center gap-1 pt-0.5">
                            <Clock className="w-3 h-3 text-[#D91B3E]" />
                            <span>
                              {language === 'ar' ? 'التسليم:' : 'Target:'} {rfq.desiredDate}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Invited Matched Vendors */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-[#2A1D20] flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-[#D91B3E]" />
                        <span>
                          {language === 'ar'
                            ? `الشركاء المدعوون تلقائياً (${invitations.length}):`
                            : `Matched Invited Vendors (${invitations.length}):`}
                        </span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {invitations.map((inv) => (
                          <div
                            key={inv.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-rose-100 text-xs"
                          >
                            <Link
                              to={`/vendors/${inv.vendorSlug || inv.vendorId}`}
                              className="font-bold text-[#2A1D20] hover:text-[#D91B3E]"
                            >
                              {language === 'ar'
                                ? inv.vendorNameAr || inv.vendorId
                                : inv.vendorNameEn || inv.vendorId}
                            </Link>
                            {inv.verificationStatus && (
                              <VerificationBadge
                                status={inv.verificationStatus}
                                language={language}
                                compact
                              />
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] font-bold text-gray-600">
                              {inv.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Side-by-Side Vendor Quote Comparison */}
                    <div className="space-y-3" data-testid={`rfq-quotes-${rfq.id}`}>
                      <h3 className="text-sm font-black text-[#2A1D20] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>
                          {language === 'ar'
                            ? `مقارنة عروض الأسعار المستلمة (${quotes.length})`
                            : `Side-by-Side Vendor Quotation Comparison (${quotes.length})`}
                        </span>
                      </h3>

                      {quotes.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-dashed border-gray-300 text-xs text-gray-600">
                          {language === 'ar'
                            ? 'في انتظار رد الشركاء المدعوين بإرسال عروض أسعارهم السرية لهذا الطلب.'
                            : 'Awaiting confidential quotes from matched invited vendors.'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {quotes.map((quote) => {
                            const isAccepted = quote.status === 'accepted';
                            const isRejected = quote.status === 'rejected';
                            return (
                              <div
                                key={quote.id}
                                data-testid={`rfq-quote-card-${quote.id}`}
                                className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 ${
                                  isAccepted
                                    ? 'bg-emerald-50/70 border-emerald-400 shadow-md'
                                    : isRejected
                                      ? 'bg-gray-50 border-gray-200 opacity-75'
                                      : 'bg-[#FFF8F9] border-[#D91B3E]/25'
                                }`}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <Link
                                        to={`/vendors/${quote.vendorSlug || quote.vendorId}`}
                                        className="font-black text-sm text-[#2A1D20] hover:text-[#D91B3E] flex items-center gap-1"
                                      >
                                        <span className="truncate">
                                          {language === 'ar'
                                            ? quote.vendorNameAr || quote.vendorId
                                            : quote.vendorNameEn || quote.vendorId}
                                        </span>
                                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                                      </Link>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        {quote.vendorVerificationStatus && (
                                          <VerificationBadge
                                            status={quote.vendorVerificationStatus}
                                            language={language}
                                            compact
                                          />
                                        )}
                                        <HonestRatingBadge
                                          ratingAvg={quote.vendorRatingAvg ?? 0}
                                          reviewsCount={quote.vendorReviewsCount ?? 0}
                                          language={language}
                                        />
                                      </div>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                        isAccepted
                                          ? 'bg-emerald-600 text-white'
                                          : isRejected
                                            ? 'bg-gray-200 text-gray-700'
                                            : 'bg-[#D91B3E] text-white'
                                      }`}
                                    >
                                      {quote.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-xs bg-white rounded-xl p-3 border border-rose-100">
                                    <div>
                                      <span className="text-[10px] text-gray-500 block">
                                        {language === 'ar' ? 'إجمالي العرض' : 'Quoted Total'}
                                      </span>
                                      <strong className="text-sm font-black text-[#D91B3E]">
                                        {quote.quotedAmountEgp.toLocaleString()}{' '}
                                        {language === 'ar' ? 'ج.م' : 'EGP'}
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-gray-500 block">
                                        {language === 'ar' ? 'دفعة التعاقد' : 'Deposit'}
                                      </span>
                                      <strong className="text-xs font-black text-[#2A1D20]">
                                        {quote.depositAmountEgp.toLocaleString()}{' '}
                                        {language === 'ar' ? 'ج.م' : 'EGP'}
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-gray-500 block">
                                        {language === 'ar' ? 'مدة التنفيذ' : 'Duration'}
                                      </span>
                                      <strong className="text-xs font-bold text-gray-800">
                                        {quote.estimatedDuration}
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-gray-500 block">
                                        {language === 'ar' ? 'الضمان' : 'Warranty'}
                                      </span>
                                      <strong className="text-xs font-bold text-emerald-700">
                                        {quote.warrantyMonths}{' '}
                                        {language === 'ar' ? 'شهر' : 'mo'}
                                      </strong>
                                    </div>
                                  </div>

                                  <p className="text-xs text-gray-700 leading-relaxed">
                                    {quote.scopeSummary}
                                  </p>
                                  {quote.termsNotes && (
                                    <p className="text-[11px] text-gray-500">{quote.termsNotes}</p>
                                  )}
                                  <div className="text-[11px] text-gray-500 font-semibold">
                                    {language === 'ar' ? 'ساري حتى:' : 'Valid until:'}{' '}
                                    {quote.validUntil}
                                  </div>
                                </div>

                                {/* Quote Decisions */}
                                {isAccepted ? (
                                  <div className="space-y-2 pt-2 border-t border-emerald-200">
                                    <div className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                                      <span>
                                        {language === 'ar'
                                          ? 'العرض الفائز ومرتبط بالميزانية'
                                          : 'Winning Offer (Budget Linked)'}
                                      </span>
                                    </div>
                                    {quote.linkedBudgetExpenseId && (
                                      <Link
                                        to="/my/budget"
                                        data-testid={`rfq-budget-linked-link-${rfq.id}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-black text-[#B31331] hover:underline"
                                      >
                                        <Wallet className="w-3.5 h-3.5" />
                                        <span>
                                          {language === 'ar'
                                            ? 'عرض البند في ميزانية الزواج'
                                            : 'Open Linked Item in Wedding Budget'}
                                        </span>
                                      </Link>
                                    )}
                                  </div>
                                ) : (
                                  quote.status === 'submitted' &&
                                  rfq.status !== 'accepted' && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-rose-100">
                                      <button
                                        type="button"
                                        disabled={busyActionId === quote.id}
                                        data-testid={`rfq-accept-quote-${quote.id}`}
                                        onClick={() => handleDecideQuote(rfq, quote.id, 'accept')}
                                        className="flex-1 py-2 px-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow hover:opacity-95 cursor-pointer flex items-center justify-center gap-1"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>
                                          {language === 'ar'
                                            ? 'قبول وربط بالميزانية'
                                            : 'Accept & Link Budget'}
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={busyActionId === quote.id}
                                        data-testid={`rfq-reject-quote-${quote.id}`}
                                        onClick={() => handleDecideQuote(rfq, quote.id, 'reject')}
                                        className="py-2 px-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-rose-50 hover:text-rose-700 text-xs font-bold cursor-pointer"
                                      >
                                        <XCircle className="w-3.5 h-3.5 inline me-1" />
                                        {language === 'ar' ? 'رفض' : 'Decline'}
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Confidential Vendor-Scoped Q&A Messages */}
                    <div
                      data-testid={`rfq-qa-${rfq.id}`}
                      className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-rose-100 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-xs font-black text-[#2A1D20] flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[#D91B3E]" />
                          <span>
                            {language === 'ar'
                              ? 'الاستفسارات المباشرة (رسائل خاصة بكل شريك)'
                              : 'Direct Vendor Q&A (Confidential Per-Vendor Threads)'}
                          </span>
                        </h3>
                        {invitations.length > 0 && (
                          <select
                            value={selectedChatVendor}
                            onChange={(e) =>
                              setMsgVendorByRfq((prev) => ({
                                ...prev,
                                [rfq.id]: e.target.value,
                              }))
                            }
                            aria-label="Target vendor thread"
                            className="w-full sm:w-auto max-w-full min-w-0 truncate p-2 rounded-xl bg-white border border-gray-200 text-xs font-bold"
                          >
                            {invitations.map((inv) => (
                              <option key={inv.id} value={inv.vendorId}>
                                {language === 'ar'
                                  ? `إلى: ${inv.vendorNameAr || inv.vendorId}`
                                  : `To: ${inv.vendorNameEn || inv.vendorId}`}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {messages.length > 0 && (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {messages.map((m) => (
                            <div
                              key={m.id}
                              className={`p-3 rounded-xl text-xs border ${
                                m.senderRole === 'customer'
                                  ? 'bg-white border-rose-100'
                                  : 'bg-[#FDE8ED] border-[#D91B3E]/20'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-gray-500 mb-1">
                                <span className="text-[#2A1D20] font-black">{m.senderName}</span>
                                <span>{m.senderRole}</span>
                              </div>
                              <p className="text-gray-800">{m.body}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => handleSendMessage(rfq, e)}
                        className="flex flex-col sm:flex-row gap-2"
                      >
                        <input
                          type="text"
                          minLength={2}
                          value={msgDraftByRfq[rfq.id] || ''}
                          onChange={(e) =>
                            setMsgDraftByRfq((prev) => ({ ...prev, [rfq.id]: e.target.value }))
                          }
                          data-testid={`rfq-msg-input-${rfq.id}`}
                          placeholder={
                            language === 'ar'
                              ? 'اكتب استفساراً تقنياً أو حول شروط الدفع والضمان...'
                              : 'Ask about specs, site measurement, warranty, or milestones...'
                          }
                          className="flex-1 p-2.5 rounded-xl bg-white border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
                        />
                        <button
                          type="submit"
                          disabled={busyActionId === `msg-${rfq.id}`}
                          data-testid={`rfq-msg-send-${rfq.id}`}
                          className="px-4 py-2.5 rounded-xl bg-[#D91B3E] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
                        </button>
                      </form>
                    </div>
                  </section>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Submit New Multi-Vendor RFQ */}
        {activeTab === 'new' && (
          <form
            onSubmit={handleCreateRfq}
            data-testid="rfq-create-form"
            className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-lg space-y-5 max-w-4xl"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#2A1D20]">
                {language === 'ar'
                  ? 'أرسل طلب تسعير متعدد الشركاء (RFQ)'
                  : 'Create Multi-Vendor RFQ Request'}
              </h2>
              <p className="text-xs text-gray-600">
                {language === 'ar'
                  ? 'سيتم توجيه الطلب تلقائياً لأفضل الشركاء الموثقين في التصنيف والمحافظة المختارة، وإدراجهم في جدول المقارنة.'
                  : 'Automatically invites up to 6 matched verified providers in your category & governorate with zero competitor cross-visibility.'}
              </p>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-[#B31331] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'عنوان المشروع / الطلب:' : 'Project / RFQ Title:'}
              </label>
              <input
                type="text"
                required
                minLength={4}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="rfq-title-input"
                placeholder={
                  language === 'ar'
                    ? 'مثال: باقة تشطيب شقة 140 متر + تأسيس كهرباء وسباكة'
                    : 'e.g. Turnkey finishing for 140sqm apartment in New Cairo'
                }
                className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1 min-w-0">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'التصنيف المطلوب:' : 'Vendor Category:'}
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  data-testid="rfq-category-select"
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  {vendorCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 min-w-0">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'المحافظة / المدينة:' : 'Governorate / City:'}
                </label>
                <select
                  value={governorateSlug}
                  onChange={(e) => setGovernorateSlug(e.target.value)}
                  data-testid="rfq-gov-select"
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  {regionalLocations.map((loc) => (
                    <option key={loc.id} value={loc.slug}>
                      {language === 'ar' ? loc.nameAr : loc.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 min-w-0">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'شريك مفضل (اختياري):' : 'Preferred Target Vendor (Optional):'}
                </label>
                <select
                  value={targetVendorId}
                  onChange={(e) => setTargetVendorId(e.target.value)}
                  data-testid="rfq-target-vendor-select"
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  <option value="">
                    {language === 'ar' ? 'مطابقة تلقائية للجميع' : 'Auto-match top vendors'}
                  </option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {language === 'ar' ? v.businessNameAr : v.businessNameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'أدنى ميزانية (ج.م):' : 'Budget Min (EGP):'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  data-testid="rfq-budget-min"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'أقصى ميزانية (ج.م):' : 'Budget Max (EGP):'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  data-testid="rfq-budget-max"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'تاريخ التنفيذ المستهدف:' : 'Desired Date:'}
                </label>
                <input
                  type="date"
                  value={desiredDate}
                  onChange={(e) => setDesiredDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'المساحة / الكمية التقريبية:' : 'Area / Size Spec:'}
                </label>
                <input
                  type="text"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  placeholder="130 m²"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'طريقة التواصل المفضلة:' : 'Preferred Contact:'}
                </label>
                <select
                  value={preferredContact}
                  onChange={(e) =>
                    setPreferredContact(e.target.value as 'platform' | 'phone' | 'whatsapp')
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  <option value="platform">
                    {language === 'ar' ? 'عبر المنصة (الأكثر أماناً)' : 'Platform Messaging'}
                  </option>
                  <option value="phone">{language === 'ar' ? 'اتصال هاتفي' : 'Phone Call'}</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar'
                  ? 'تفاصيل النطاق والمواصفات المطلوبة (10 أحرف فأكثر):'
                  : 'Scope & Technical Specifications (min 10 chars):'}
              </label>
              <textarea
                rows={4}
                required
                minLength={10}
                value={scopeDetails}
                onChange={(e) => setScopeDetails(e.target.value)}
                data-testid="rfq-scope-input"
                placeholder={
                  language === 'ar'
                    ? 'وضح المواصفات، عدد الغرف/الوحدات، الماركات المفضلة، أو شروط جدول الدفعات...'
                    : 'Describe apartment dimensions, preferred materials/brands, rooms count, and timeline expectations...'
                }
                className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>

            <button
              type="submit"
              disabled={creatingRfq}
              data-testid="rfq-submit-btn"
              className="px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {creatingRfq
                  ? language === 'ar'
                    ? 'جاري المطابقة وإرسال الطلب...'
                    : 'Matching Vendors & Sending...'
                  : language === 'ar'
                    ? 'إرسال طلب التسعير للمقارنة'
                    : 'Dispatch Multi-Vendor RFQ'}
              </span>
            </button>
          </form>
        )}

        {/* TAB 3: Customer Marketplace Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 text-xs text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D91B3E] shrink-0" />
              <span>
                {language === 'ar'
                  ? 'تنبيه الحوكمة: حجز المواعيد يبدأ بحالة «قيد انتظار تأكيد الشريك»، ولا يؤكد الموعد نهائياً إلا من لوحة الشريك التجاري.'
                  : 'Slot Booking Governance: All customer bookings begin as Requested and can only be Confirmed or Completed by the Vendor Partner.'}
              </span>
            </div>

            {marketplaceAppointments.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-rose-100 text-center space-y-3">
                <Calendar className="w-10 h-10 text-[#D91B3E] mx-auto" />
                <p className="text-xs font-bold text-gray-600">
                  {language === 'ar'
                    ? 'لم تحجز أي موعد معاينة أو معرض مع الشركاء بعد. زر صفحة أي شريك لحجز موعد متاح.'
                    : 'No vendor slot appointments booked yet. Visit any vendor profile to reserve a slot.'}
                </p>
                <Link
                  to="/vendors"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold"
                >
                  <Store className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تصفح الشركاء' : 'Browse Vendors'}</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketplaceAppointments.map((apt) => {
                  const st = APT_STATUS_LABELS[apt.status] || APT_STATUS_LABELS.requested;
                  const typeLbl = APT_TYPE_LABELS[apt.appointmentType] || {
                    ar: apt.appointmentType,
                    en: apt.appointmentType,
                  };
                  return (
                    <div
                      key={apt.id}
                      data-testid={`cust-apt-${apt.id}`}
                      className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`px-3 py-1 rounded-full border text-[11px] font-black ${st.cls}`}>
                          {language === 'ar' ? st.ar : st.en}
                        </span>
                        <span className="text-[11px] font-bold text-gray-500">
                          {language === 'ar' ? typeLbl.ar : typeLbl.en}
                        </span>
                      </div>

                      <div>
                        <Link
                          to={`/vendors/${apt.vendorSlug || apt.vendorId}`}
                          className="text-sm font-black text-[#2A1D20] hover:text-[#D91B3E]"
                        >
                          {language === 'ar'
                            ? apt.vendorNameAr || apt.vendorId
                            : apt.vendorNameEn || apt.vendorId}
                        </Link>
                        {apt.serviceTitleAr && (
                          <p className="text-[11px] text-[#B31331] font-bold">
                            {language === 'ar' ? apt.serviceTitleAr : apt.serviceTitleEn}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#D91B3E]" />
                          <span dir="ltr">{apt.slotDate}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#D91B3E]" />
                          <span dir="ltr">{apt.slotTime}</span> ({apt.durationMinutes}{' '}
                          {language === 'ar' ? 'د' : 'min'})
                        </span>
                      </div>

                      {apt.customerNotes && (
                        <p className="text-xs text-gray-600 bg-[#FAF7F2] p-2.5 rounded-xl">
                          {apt.customerNotes}
                        </p>
                      )}

                      {apt.vendorResponseNote && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                          {language === 'ar' ? 'رد الشريك:' : 'Vendor Note:'}{' '}
                          {apt.vendorResponseNote}
                        </div>
                      )}

                      {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                        <div className="pt-2 border-t border-gray-100 flex justify-end">
                          <button
                            type="button"
                            disabled={busyActionId === `apt-${apt.id}`}
                            data-testid={`cust-apt-cancel-${apt.id}`}
                            onClick={() => handleCancelApt(apt.id)}
                            className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                          >
                            {language === 'ar' ? 'إلغاء الموعد' : 'Cancel Slot'}
                          </button>
                        </div>
                      )}
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

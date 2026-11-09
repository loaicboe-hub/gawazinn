import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TABLE_ZONE_META } from '../../../shared/stage10Data';
import type {
  GiftPriority,
  GuestGroup,
  GuestSide,
  RsvpStatus,
  TableZone,
  TimelineEventStatus,
} from '../../types';
import {
  Users,
  Grid2x2,
  Clock,
  Gift,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const WeddingDayOpsView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    products,
    weddingDayOverview,
    createSeatingTable,
    deleteSeatingTable,
    createWeddingGuest,
    updateWeddingGuest,
    deleteWeddingGuest,
    createTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    createGiftRegistryItem,
    deleteGiftRegistryItem,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'guests' | 'seating' | 'timeline' | 'registry'>('guests');
  const [guestFilter, setGuestFilter] = useState<'all' | RsvpStatus>('all');
  const [opError, setOpError] = useState<string | null>(null);

  // Add Guest State
  const [guestName, setGuestName] = useState('');
  const [guestSide, setGuestSide] = useState<GuestSide>('shared');
  const [guestGroup, setGuestGroup] = useState<GuestGroup>('friends');
  const [invitedCount, setInvitedCount] = useState(2);
  const [plusOneAllowed, setPlusOneAllowed] = useState(true);

  // Add Table State
  const [tableName, setTableName] = useState('');
  const [tableZone, setTableZone] = useState<TableZone>('family_center');
  const [tableCap, setTableCap] = useState(8);

  // Add Timeline Event
  const [evStart, setEvStart] = useState('19:00');
  const [evEnd, setEvEnd] = useState('19:45');
  const [evTitleAr, setEvTitleAr] = useState('');
  const [evAssignee, setEvAssignee] = useState('');
  const [evLocation, setEvLocation] = useState('');

  // Add Gift Registry
  const [giftProductId, setGiftProductId] = useState<string>('');
  const [giftTitleAr, setGiftTitleAr] = useState('');
  const [giftCategory] = useState('أجهزة مطبخ');
  const [giftPrice, setGiftPrice] = useState(4500);
  const [giftPriority, setGiftPriority] = useState<GiftPriority>('essential');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-[#FFF8F9] rounded-3xl p-8 border border-[#D91B3E]/20 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-[#D91B3E] mx-auto" />
          <h1 data-testid="wedding-day-heading" className="text-2xl font-black text-[#2A1D20]">
            {language === 'ar'
              ? 'إدارة يوم الزفاف، المدعوين، الطاولات وقائمة الهدايا'
              : 'Wedding Day Operations, RSVP Guests & Gift Registry'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
            {language === 'ar'
              ? 'سجل الدخول لإنشاء روابط تأكيد حضور شخصية لكل مدعو وتوزيع الطاولات وإدارة جدول يوم الفرح.'
              : 'Sign in to issue personalized RSVP links, assign capacity-checked tables, run minute-by-minute schedules, and manage gifts.'}
          </p>
          <button
            type="button"
            data-testid="wedding-day-signin-btn"
            onClick={() => setAuthModalOpen(true)}
            className="bg-red-gradient text-white font-black text-sm px-6 py-3 rounded-xl shadow-md cursor-pointer"
          >
            {language === 'ar' ? 'تسجيل الدخول لمركز إدارة الفرح' : 'Sign In to Wedding Day Ops'}
          </button>
        </div>
      </div>
    );
  }

  const guests = (weddingDayOverview?.guests || []).filter(
    (g) => guestFilter === 'all' || g.rsvpStatus === guestFilter,
  );
  const tables = weddingDayOverview?.tables || [];
  const timeline = weddingDayOverview?.timelineEvents || [];
  const registry = weddingDayOverview?.giftRegistry || [];
  const stats = weddingDayOverview?.stats;

  const handleAssignTable = async (guestId: string, tableId: string) => {
    setOpError(null);
    try {
      await updateWeddingGuest(guestId, { tableId: tableId || null });
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Unable to assign table');
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 lg:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Users className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'غرفة عمليات ليلة العمر — دعوات RSVP رقمية وتسـكين الطاولات'
                  : 'Wedding Day Command Center — Live RSVP Links & Table Capacity'}
              </span>
            </div>
            <h1
              data-testid="wedding-day-heading"
              className="text-2xl sm:text-4xl font-black text-white leading-tight"
            >
              {language === 'ar'
                ? 'إدارة المدعوين وتأكيد الحضور والبرنامج الزمني وقائمة الهدايا'
                : 'Manage Guests, Seating Tables, Timeline & Gift Registry'}
            </h1>
          </div>
          <Link
            to="/wedding"
            className="bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition shrink-0 self-start lg:self-auto"
          >
            {language === 'ar' ? 'العودة لخدمات فرحي' : 'Wedding Services Hub'}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* KPI Strip */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#D91B3E]/15">
              <p className="text-xs font-bold text-gray-500">
                {language === 'ar' ? 'الحضور المؤكد' : 'Confirmed Guests'}
              </p>
              <p data-testid="kpi-confirmed-headcount" className="text-2xl font-black text-emerald-700 mt-1">
                {stats.confirmedHeadcount}
              </p>
              <p className="text-[11px] text-gray-500">
                {stats.confirmedParties} / {stats.totalInvitedParties}{' '}
                {language === 'ar' ? 'دعوة' : 'invites'}
              </p>
            </div>
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#D91B3E]/15">
              <p className="text-xs font-bold text-gray-500">
                {language === 'ar' ? 'إشغال الطاولات' : 'Seating Occupancy'}
              </p>
              <p data-testid="kpi-seated-count" className="text-2xl font-black text-[#2A1D20] mt-1">
                {stats.seatedHeadcount} / {stats.totalTableSeats}
              </p>
              <p className="text-[11px] text-gray-500">
                {tables.length} {language === 'ar' ? 'طاولات مجهزة' : 'tables setup'}
              </p>
            </div>
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#D91B3E]/15">
              <p className="text-xs font-bold text-gray-500">
                {language === 'ar' ? 'الجدول الزمني الجاهز' : 'Timeline Readiness'}
              </p>
              <p className="text-2xl font-black text-[#D91B3E] mt-1">
                {stats.timelineReadyOrDone} / {stats.timelineTotal}
              </p>
              <p className="text-[11px] text-gray-500">
                {language === 'ar' ? 'فقرات يوم الحفل' : 'scheduled slots'}
              </p>
            </div>
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#D91B3E]/15">
              <p className="text-xs font-bold text-gray-500">
                {language === 'ar' ? 'هدايا القائمة المحجوزة' : 'Reserved Registry Gifts'}
              </p>
              <p data-testid="kpi-reserved-gifts" className="text-2xl font-black text-[#B31331] mt-1">
                {stats.registryReservedOrReceived} / {stats.registryTotal}
              </p>
              <p className="text-[11px] text-gray-500">
                {language === 'ar' ? 'متصلة بدعوة RSVP' : 'live with public RSVP'}
              </p>
            </div>
          </div>
        )}

        {opError && (
          <div
            data-testid="wedding-ops-error"
            className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-bold flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{opError}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'guests', icon: <Users className="w-4 h-4" />, ar: 'المدعوون والـ RSVP', en: 'Guests & RSVP' },
              { key: 'seating', icon: <Grid2x2 className="w-4 h-4" />, ar: 'توزيع الطاولات', en: 'Seating Tables' },
              { key: 'timeline', icon: <Clock className="w-4 h-4" />, ar: 'الجدول الزمني', en: 'Day Timeline' },
              { key: 'registry', icon: <Gift className="w-4 h-4" />, ar: 'قائمة الهدايا', en: 'Gift Registry' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-testid={`wedding-tab-${tab.key}`}
              onClick={() => {
                setActiveTab(tab.key);
                setOpError(null);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black border flex items-center gap-2 transition cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#D91B3E] text-white border-[#D91B3E] shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#D91B3E]/40'
              }`}
            >
              {tab.icon}
              <span>{language === 'ar' ? tab.ar : tab.en}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: GUESTS & RSVP */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setOpError(null);
                await createWeddingGuest({
                  fullName: guestName.trim(),
                  side: guestSide,
                  guestGroup,
                  invitedCount: Number(invitedCount),
                  plusOneAllowed,
                });
                setGuestName('');
              }}
              data-testid="add-guest-form"
              className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#D91B3E]/15 grid grid-cols-1 md:grid-cols-5 gap-3 items-end text-xs"
            >
              <label className="space-y-1 md:col-span-2 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'اسم الضيف / العائلة *' : 'Guest / Party Name *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  data-testid="guest-name-input"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: م. خالد نبيل وحرمه' : 'Eng. Khaled Nabil & Family'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'الجهة' : 'Side'}
                </span>
                <select
                  value={guestSide}
                  onChange={(e) => setGuestSide(e.target.value as GuestSide)}
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                >
                  <option value="shared">{language === 'ar' ? 'مشترك' : 'Shared'}</option>
                  <option value="groom">{language === 'ar' ? 'العريس' : 'Groom'}</option>
                  <option value="bride">{language === 'ar' ? 'العروسة' : 'Bride'}</option>
                </select>
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'المجموعة / العدد' : 'Group / Seats'}
                </span>
                <div className="flex gap-2">
                  <select
                    value={guestGroup}
                    onChange={(e) => setGuestGroup(e.target.value as GuestGroup)}
                    className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                  >
                    <option value="family">{language === 'ar' ? 'عائلة' : 'Family'}</option>
                    <option value="friends">{language === 'ar' ? 'أصدقاء' : 'Friends'}</option>
                    <option value="colleagues">{language === 'ar' ? 'زملاء' : 'Colleagues'}</option>
                    <option value="vip">VIP</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={invitedCount}
                    onChange={(e) => setInvitedCount(Number(e.target.value))}
                    className="w-16 p-2.5 rounded-xl border border-gray-300 bg-white font-bold text-center shrink-0"
                  />
                </div>
              </label>
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plusOneAllowed}
                    onChange={(e) => setPlusOneAllowed(e.target.checked)}
                    className="accent-[#D91B3E]"
                  />
                  <span>+1</span>
                </label>
                <button
                  type="submit"
                  data-testid="add-guest-submit"
                  className="bg-red-gradient text-white font-black px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة مدعو' : 'Add Guest'}</span>
                </button>
              </div>
            </form>

            {/* Filter */}
            <div className="flex flex-wrap gap-2 text-xs">
              {(['all', 'confirmed', 'pending', 'declined'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setGuestFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full font-bold border transition cursor-pointer ${
                    guestFilter === st
                      ? 'bg-[#2A1D20] text-white border-[#2A1D20]'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {st === 'all'
                    ? language === 'ar'
                      ? 'الكل'
                      : 'All'
                    : st === 'confirmed'
                      ? language === 'ar'
                        ? 'مؤكد'
                        : 'Confirmed'
                      : st === 'pending'
                        ? language === 'ar'
                          ? 'في الانتظار'
                          : 'Pending'
                        : language === 'ar'
                          ? 'معتذر'
                          : 'Declined'}
                </button>
              ))}
            </div>

            {/* Guests List */}
            <div className="space-y-3">
              {guests.map((g) => (
                <div
                  key={g.id}
                  data-testid={`wedding-guest-row-${g.id}`}
                  className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-[#2A1D20]">{g.fullName}</span>
                      <span
                        data-testid={`guest-status-${g.rsvpCode}`}
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          g.rsvpStatus === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : g.rsvpStatus === 'declined'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {g.rsvpStatus === 'confirmed'
                          ? `${language === 'ar' ? 'مؤكد' : 'Confirmed'} (${g.attendingCount})`
                          : g.rsvpStatus === 'declined'
                            ? language === 'ar'
                              ? 'معتذر'
                              : 'Declined'
                            : `${language === 'ar' ? 'معلق' : 'Pending'} (${g.invitedCount})`}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 font-mono text-[11px] text-gray-700">
                        {g.rsvpCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {g.side} • {g.guestGroup} • {language === 'ar' ? 'الوجبة' : 'Meal'}: {g.mealPreference}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      aria-label="Assign seating table"
                      data-testid={`assign-table-${g.id}`}
                      value={g.tableId || ''}
                      onChange={(e) => void handleAssignTable(g.id, e.target.value)}
                      className="w-full sm:w-44 max-w-full min-w-0 truncate p-2 rounded-xl border border-gray-300 bg-gray-50 font-bold"
                    >
                      <option value="">{language === 'ar' ? 'بدون طاولة بعد' : 'Unseated'}</option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.tableName} ({t.assignedHeadcount}/{t.capacity})
                        </option>
                      ))}
                    </select>

                    <Link
                      to={`/rsvp/${encodeURIComponent(g.rsvpCode)}`}
                      data-testid={`open-rsvp-link-${g.rsvpCode}`}
                      className="px-3 py-2 rounded-xl bg-[#FDE8ED] text-[#B31331] font-bold hover:bg-[#D91B3E] hover:text-white transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>RSVP</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/rsvp/${g.rsvpCode}`;
                        navigator.clipboard?.writeText(url).catch(() => {});
                        showToast(language === 'ar' ? `تم نسخ رابط الدعوة ${g.rsvpCode}` : `Copied RSVP link`);
                      }}
                      className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                      title={language === 'ar' ? 'نسخ رابط الدعوة' : 'Copy invite URL'}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteWeddingGuest(g.id)}
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-700 cursor-pointer"
                      title={language === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SEATING TABLES */}
        {activeTab === 'seating' && (
          <div className="space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setOpError(null);
                await createSeatingTable({
                  tableName: tableName.trim(),
                  zone: tableZone,
                  capacity: Number(tableCap),
                });
                setTableName('');
              }}
              data-testid="add-table-form"
              className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#D91B3E]/15 grid grid-cols-1 md:grid-cols-4 gap-3 items-end text-xs"
            >
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'اسم الطاولة *' : 'Table Name *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  data-testid="table-name-input"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder={language === 'ar' ? 'طاولة العائلة 4' : 'Family Table 4'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'المنطقة بالقاعة' : 'Zone'}
                </span>
                <select
                  value={tableZone}
                  onChange={(e) => setTableZone(e.target.value as TableZone)}
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                >
                  {(Object.keys(TABLE_ZONE_META) as TableZone[]).map((z) => (
                    <option key={z} value={z}>
                      {language === 'ar' ? TABLE_ZONE_META[z].nameAr : TABLE_ZONE_META[z].nameEn}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'سعة المقاعد' : 'Seat Capacity'}
                </span>
                <input
                  type="number"
                  min={2}
                  max={24}
                  value={tableCap}
                  onChange={(e) => setTableCap(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
              <button
                type="submit"
                data-testid="add-table-submit"
                className="bg-red-gradient text-white font-black px-5 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة طاولة' : 'Add Table'}</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tables.map((t) => {
                const seated = (weddingDayOverview?.guests || []).filter((g) => g.tableId === t.id);
                const pct = Math.min(100, Math.round((t.assignedHeadcount / Math.max(1, t.capacity)) * 100));
                return (
                  <div
                    key={t.id}
                    data-testid={`seating-table-card-${t.id}`}
                    className="bg-white rounded-3xl p-5 border border-gray-200 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-[#2A1D20]">{t.tableName}</h3>
                        <p className="text-[11px] text-gray-500">
                          {language === 'ar'
                            ? TABLE_ZONE_META[t.zone].nameAr
                            : TABLE_ZONE_META[t.zone].nameEn}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteSeatingTable(t.id)}
                        className="text-gray-400 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>
                          {t.assignedHeadcount} / {t.capacity} {language === 'ar' ? 'مقاعد' : 'seats'}
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${t.isFull ? 'bg-amber-600' : 'bg-[#D91B3E]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      {seated.length === 0 ? (
                        <p className="text-gray-400 italic">
                          {language === 'ar' ? 'لا يوجد ضيوف مسكنين بعد.' : 'No guests seated yet.'}
                        </p>
                      ) : (
                        seated.map((sg) => (
                          <div key={sg.id} className="flex items-center justify-between gap-2 bg-[#FAF7F2] px-2.5 py-1.5 rounded-xl">
                            <span className="font-bold text-[#2A1D20] truncate">{sg.fullName}</span>
                            <span className="text-[11px] text-gray-500 shrink-0">
                              {sg.rsvpStatus === 'confirmed' ? sg.attendingCount : sg.invitedCount}x
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createTimelineEvent({
                  startTime: evStart,
                  endTime: evEnd,
                  titleAr: evTitleAr.trim(),
                  assignee: evAssignee.trim(),
                  locationNote: evLocation.trim() || null,
                });
                setEvTitleAr('');
                setEvAssignee('');
                setEvLocation('');
              }}
              data-testid="add-timeline-form"
              className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#D91B3E]/15 grid grid-cols-1 md:grid-cols-5 gap-3 items-end text-xs"
            >
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'من - إلى' : 'Start - End'}
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="time"
                    value={evStart}
                    onChange={(e) => setEvStart(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 bg-white font-bold"
                  />
                  <input
                    type="time"
                    value={evEnd}
                    onChange={(e) => setEvEnd(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 bg-white font-bold"
                  />
                </div>
              </label>
              <label className="space-y-1 md:col-span-2 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'عنوان الفقرة *' : 'Event Title *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  data-testid="timeline-title-input"
                  value={evTitleAr}
                  onChange={(e) => setEvTitleAr(e.target.value)}
                  placeholder={language === 'ar' ? 'الرقصة الأولى وتبديل الإضاءة' : 'First Dance & Spotlights'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'المسؤول *' : 'Assignee *'}
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  data-testid="timeline-assignee-input"
                  value={evAssignee}
                  onChange={(e) => setEvAssignee(e.target.value)}
                  placeholder={language === 'ar' ? 'الـ DJ والمنظم' : 'DJ & Coordinator'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
              </label>
              <button
                type="submit"
                data-testid="add-timeline-submit"
                className="bg-red-gradient text-white font-black px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
              >
                {language === 'ar' ? 'إضافة فقرة' : 'Add Slot'}
              </button>
            </form>

            <div className="space-y-3">
              {timeline.map((ev) => {
                const nextStatus: TimelineEventStatus =
                  ev.status === 'planned'
                    ? 'ready'
                    : ev.status === 'ready'
                      ? 'completed'
                      : 'planned';
                return (
                  <div
                    key={ev.id}
                    data-testid={`timeline-row-${ev.id}`}
                    className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-3 py-1.5 rounded-xl bg-[#FDE8ED] text-[#B31331] font-mono font-black shrink-0">
                        {ev.startTime}–{ev.endTime}
                      </span>
                      <div>
                        <p className="text-sm font-black text-[#2A1D20]">
                          {language === 'ar' ? ev.titleAr : ev.titleEn}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {ev.assignee}
                          {ev.locationNote ? ` • ${ev.locationNote}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => void updateTimelineEvent(ev.id, { status: nextStatus })}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 border cursor-pointer ${
                          ev.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ev.status === 'ready'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ev.status}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteTimelineEvent(ev.id)}
                        className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: GIFT REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const picked = giftProductId
                  ? products.find((p) => p.id === giftProductId)
                  : undefined;
                await createGiftRegistryItem({
                  productId: giftProductId || null,
                  titleAr: picked ? picked.nameAr : giftTitleAr.trim(),
                  titleEn: picked ? picked.nameEn : giftTitleAr.trim(),
                  categoryLabel: giftCategory.trim(),
                  targetPriceEgp: picked ? picked.price : Number(giftPrice),
                  priority: giftPriority,
                });
                setGiftTitleAr('');
              }}
              data-testid="add-registry-form"
              className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#D91B3E]/15 grid grid-cols-1 md:grid-cols-5 gap-3 items-end text-xs"
            >
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'ربط بمنتج (اختياري)' : 'Link Catalog Product'}
                </span>
                <select
                  value={giftProductId}
                  onChange={(e) => setGiftProductId(e.target.value)}
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                >
                  <option value="">{language === 'ar' ? 'هدية مخصصة' : 'Custom Gift'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {language === 'ar' ? p.nameAr : p.nameEn}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 md:col-span-2 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'اسم الهدية *' : 'Gift Title *'}
                </span>
                <input
                  type="text"
                  required={!giftProductId}
                  value={giftProductId ? products.find((p) => p.id === giftProductId)?.nameAr || '' : giftTitleAr}
                  disabled={Boolean(giftProductId)}
                  onChange={(e) => setGiftTitleAr(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: خلاط متعدد السرعات' : 'Multi-Speed Blender'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold disabled:bg-gray-100"
                />
              </label>
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'السعر والأولوية' : 'Price & Priority'}
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={0}
                    disabled={Boolean(giftProductId)}
                    value={giftProductId ? products.find((p) => p.id === giftProductId)?.price || 0 : giftPrice}
                    onChange={(e) => setGiftPrice(Number(e.target.value))}
                    className="w-24 p-2 rounded-xl border border-gray-300 bg-white font-bold"
                  />
                  <select
                    value={giftPriority}
                    onChange={(e) => setGiftPriority(e.target.value as GiftPriority)}
                    className="w-full max-w-full min-w-0 truncate p-2 rounded-xl border border-gray-300 bg-white font-bold"
                  >
                    <option value="essential">{language === 'ar' ? 'أساسي' : 'Essential'}</option>
                    <option value="nice_to_have">{language === 'ar' ? 'مفضل' : 'Nice to Have'}</option>
                    <option value="dream">{language === 'ar' ? 'هدية خاصة' : 'Dream'}</option>
                  </select>
                </div>
              </label>
              <button
                type="submit"
                data-testid="add-registry-submit"
                className="bg-red-gradient text-white font-black px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
              >
                {language === 'ar' ? 'إضافة للقائمة' : 'Add Gift'}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registry.map((g) => (
                <div
                  key={g.id}
                  data-testid={`registry-card-${g.id}`}
                  className="bg-white rounded-3xl p-5 border border-gray-200 space-y-2 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          g.reservationStatus === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {g.reservationStatus === 'available'
                          ? language === 'ar'
                            ? 'متاحة للحجز'
                            : 'Available'
                          : `${language === 'ar' ? 'محجوزة بواسطة' : 'Reserved by'}: ${g.reservedByName || 'Guest'}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => void deleteGiftRegistryItem(g.id)}
                        className="text-gray-400 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="text-sm font-black text-[#2A1D20]">
                      {language === 'ar' ? g.titleAr : g.titleEn}
                    </h3>
                    <p className="text-gray-500">{g.categoryLabel}</p>
                  </div>
                  <p className="font-black text-[#D91B3E] pt-2 border-t border-gray-100">
                    {g.targetPriceEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

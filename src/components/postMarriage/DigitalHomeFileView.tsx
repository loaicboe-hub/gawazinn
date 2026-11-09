import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  HOME_ASSET_CATEGORY_META,
  HOME_ITEM_CONDITION_META,
  MAINTENANCE_SYSTEM_META,
  isWarrantyExpiringWithinDays,
} from '../../../shared/stage11Data';
import type {
  HomeAssetCategory,
  HomeItemCondition,
  MaintenanceSystemCategory,
} from '../../types';
import {
  AlertTriangle,
  Archive,
  CalendarClock,
  CheckCircle2,
  FileText,
  FolderHeart,
  PackageCheck,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Wrench,
} from 'lucide-react';

type HomeFileTab = 'assets' | 'maintenance' | 'inventory' | 'warranties';

export const DigitalHomeFileView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    homeFileOverview,
    createHomeAsset,
    deleteHomeAsset,
    createMaintenanceReminder,
    completeMaintenanceReminder,
    deleteMaintenanceReminder,
    createHomeInventoryItem,
    updateHomeInventoryItem,
    deleteHomeInventoryItem,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<HomeFileTab>(() => {
    if (
      initialTabParam === 'assets' ||
      initialTabParam === 'maintenance' ||
      initialTabParam === 'inventory' ||
      initialTabParam === 'warranties'
    ) {
      return initialTabParam;
    }
    return 'assets';
  });

  useEffect(() => {
    const param = searchParams.get('tab');
    if (
      param === 'assets' ||
      param === 'maintenance' ||
      param === 'inventory' ||
      param === 'warranties'
    ) {
      setActiveTab(param);
    }
  }, [searchParams]);

  const switchTab = (tab: HomeFileTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Asset Form State
  const [assetCategory, setAssetCategory] = useState<HomeAssetCategory>('paint_code');
  const [assetRoom, setAssetRoom] = useState('');
  const [assetTitleAr, setAssetTitleAr] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [assetVendor, setAssetVendor] = useState('');

  // Maintenance Reminder Form State
  const [remSystem, setRemSystem] = useState<MaintenanceSystemCategory>('ac_service');
  const [remTitleAr, setRemTitleAr] = useState('');
  const [remInterval, setRemInterval] = useState(6);
  const [remDueDate, setRemDueDate] = useState('');
  const [remCost, setRemCost] = useState(650);

  // Inventory Form State
  const [invRoom, setInvRoom] = useState('');
  const [invName, setInvName] = useState('');
  const [invBrand, setInvBrand] = useState('');
  const [invPrice, setInvPrice] = useState(15000);
  const [invCondition, setInvCondition] = useState<HomeItemCondition>('new');
  const [invWarrantyExpiry, setInvWarrantyExpiry] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-[#FFF8F9] rounded-3xl p-8 border border-[#D91B3E]/20 text-center space-y-4">
          <FolderHeart className="w-10 h-10 text-[#D91B3E] mx-auto" />
          <h1 data-testid="home-file-heading" className="text-2xl font-black text-[#2A1D20]">
            {language === 'ar'
              ? 'ملف البيت الرقمي — الأصول، الصيانة الدورية، الجرد والضمانات'
              : 'Digital Home File — Paint Codes, Preventive Care, Inventory & Vault'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
            {language === 'ar'
              ? 'سجل الدخول لحفظ أكواد دهانات الغرف، خريطة لوحة الكهرباء، جدول صيانة التكييفات والفلاتر، وقائمة أجهزة بيتك الخاصة.'
              : 'Sign in to store room paint codes, circuit breaker legends, preventive maintenance schedules, and itemized household equipment value privately.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              data-testid="home-file-signin-btn"
              onClick={() => setAuthModalOpen(true)}
              className="bg-red-gradient text-white font-black text-sm px-6 py-3 rounded-xl shadow-md cursor-pointer"
            >
              {language === 'ar' ? 'تسجيل الدخول لملف البيت' : 'Sign In to Digital Home File'}
            </button>
            <Link
              to="/newlyweds-guide"
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-bold text-[#2A1D20]"
            >
              {language === 'ar' ? 'تصفح دليل المتزوجين الجدد' : 'Browse Newlyweds Guide'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const assets = homeFileOverview?.assets || [];
  const reminders = homeFileOverview?.reminders || [];
  const inventory = homeFileOverview?.inventory || [];
  const warranties = homeFileOverview?.warranties || [];
  const documents = homeFileOverview?.documents || [];
  const summary = homeFileOverview?.summary;
  const todayIso = new Date().toISOString().slice(0, 10);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await createHomeAsset({
        assetCategory,
        roomLabel: assetRoom,
        titleAr: assetTitleAr,
        titleEn: assetTitleAr,
        codeOrSerial: assetCode || null,
        vendorOrBrand: assetVendor || null,
      });
      setAssetRoom('');
      setAssetTitleAr('');
      setAssetCode('');
      setAssetVendor('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save asset');
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await createMaintenanceReminder({
        systemCategory: remSystem,
        titleAr: remTitleAr,
        titleEn: remTitleAr,
        intervalMonths: remInterval,
        nextDueDate: remDueDate || undefined,
        estimatedCostEgp: remCost,
        vendorCategorySlug: MAINTENANCE_SYSTEM_META[remSystem].vendorCategorySlug,
      });
      setRemTitleAr('');
      setRemDueDate('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save reminder');
    }
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await createHomeInventoryItem({
        roomLabel: invRoom,
        itemName: invName,
        brandModel: invBrand,
        purchasePriceEgp: invPrice,
        condition: invCondition,
        warrantyExpiryDate: invWarrantyExpiry || null,
      });
      setInvRoom('');
      setInvName('');
      setInvBrand('');
      setInvWarrantyExpiry('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to add inventory item');
    }
  };

  const tabs: { key: HomeFileTab; ar: string; en: string; count?: number }[] = [
    { key: 'assets', ar: 'الأصول والأكواد المرجعية', en: 'Home Assets & Codes', count: assets.length },
    {
      key: 'maintenance',
      ar: 'جدول الصيانة الوقائية',
      en: 'Maintenance Schedule',
      count: reminders.length,
    },
    { key: 'inventory', ar: 'جرد الأجهزة والمقتنيات', en: 'Home Inventory', count: inventory.length },
    {
      key: 'warranties',
      ar: 'خزنة الضمانات والعقود',
      en: 'Warranties & Contracts',
      count: warranties.length + documents.length,
    },
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 lg:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <FolderHeart className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'ملف الشقة والبيت الرقمي الدائم — ملك لك وحدك'
                  : 'Private Persistent Household Stewardship File'}
              </span>
            </div>
            <h1 data-testid="home-file-heading" className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === 'ar' ? 'ملف البيت الرقمي وإدارة الصيانة' : 'Digital Home File & Care Center'}
            </h1>
            <p className="text-sm sm:text-base text-rose-100/95 leading-relaxed">
              {language === 'ar'
                ? 'احتفظ بأكواد الدهانات، قواطع الكهرباء، جداول الصيانة المتكررة، قيمة جرد الأصول المنزلية، وضمانات الأجهزة في مكان واحد.'
                : 'Centralize room paint tint codes, breaker legends, recurring HVAC/filter reminders, home equipment valuation, and warranty expiry alerts.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/newlyweds-guide"
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-black text-xs flex items-center gap-2 transition"
            >
              <span>{language === 'ar' ? 'دليل المتزوجين الجدد' : 'Newlyweds Guide'}</span>
            </Link>
            <Link
              to="/home-care"
              className="px-4 py-2.5 rounded-2xl bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs shadow-lg flex items-center gap-2 transition"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'شركاء الصيانة والنقل' : 'Home Care Partners'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 4 KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 block">
              {language === 'ar' ? 'صيانات متأخرة' : 'Overdue Care'}
            </span>
            <strong
              data-testid="kpi-overdue-reminders"
              className={`text-xl sm:text-2xl font-black block ${
                (summary?.overdueReminders ?? 0) > 0 ? 'text-[#D91B3E]' : 'text-emerald-700'
              }`}
            >
              {summary?.overdueReminders ?? 0}
            </strong>
            <span className="text-[11px] text-gray-500 block">
              {language === 'ar'
                ? `${summary?.dueSoonReminders ?? 0} مستحقة خلال 14 يوماً`
                : `${summary?.dueSoonReminders ?? 0} due within 14d`}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 block">
              {language === 'ar' ? 'الأصول والأكواد الموثقة' : 'Archived Assets'}
            </span>
            <strong data-testid="kpi-total-assets" className="text-xl sm:text-2xl font-black text-[#2A1D20] block">
              {summary?.totalAssets ?? 0}
            </strong>
            <span className="text-[11px] text-gray-500 block">
              {language === 'ar' ? 'دهان، لوحات، مقاسات' : 'Paint, panels & specs'}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 block">
              {language === 'ar' ? 'قيمة جرد الأجهزة والأثاث' : 'Inventoried Assets Value'}
            </span>
            <strong data-testid="kpi-inventory-value" className="text-xl sm:text-2xl font-black text-[#D91B3E] block">
              {(summary?.totalInventoryValueEgp ?? 0).toLocaleString()}{' '}
              <span className="text-xs font-bold">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
            </strong>
            <span className="text-[11px] text-gray-500 block">
              {summary?.totalInventoryItems ?? 0}{' '}
              {language === 'ar' ? 'قطعة مسجلة' : 'logged items'}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 block">
              {language === 'ar' ? 'تقدير الصيانة السنوي' : 'Annual Maintenance Est.'}
            </span>
            <strong data-testid="kpi-annual-maintenance" className="text-xl sm:text-2xl font-black text-[#2A1D20] block">
              {(summary?.projectedAnnualMaintenanceEgp ?? 0).toLocaleString()}{' '}
              <span className="text-xs font-bold">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
            </strong>
            <span className="text-[11px] text-gray-500 block">
              {summary?.activeWarrantiesCount ?? 0}{' '}
              {language === 'ar' ? 'ضمان ساري' : 'active warranties'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-testid={`home-file-tab-${tab.key}`}
              onClick={() => switchTab(tab.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                activeTab === tab.key
                  ? 'bg-red-gradient text-white shadow-md'
                  : 'bg-[#FAF7F2] text-[#2A1D20] border border-gray-200 hover:border-[#D91B3E]/40'
              }`}
            >
              <span>{language === 'ar' ? tab.ar : tab.en}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-white text-[#B31331]'
                }`}
              >
                {tab.count ?? 0}
              </span>
            </button>
          ))}
        </div>

        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* TAB 1: HOME FILE ASSETS */}
        {activeTab === 'assets' && (
          <section className="space-y-6">
            <form
              onSubmit={(e) => void handleCreateAsset(e)}
              data-testid="create-home-asset-form"
              className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-6 border border-[#D91B3E]/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end"
            >
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'نوع الأصل المرجعي' : 'Asset Category'}
                </label>
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value as HomeAssetCategory)}
                  data-testid="asset-category-select"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                >
                  {(Object.keys(HOME_ASSET_CATEGORY_META) as HomeAssetCategory[]).map((catKey) => (
                    <option key={catKey} value={catKey}>
                      {language === 'ar'
                        ? HOME_ASSET_CATEGORY_META[catKey].labelAr
                        : HOME_ASSET_CATEGORY_META[catKey].labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'الغرفة / المنطقة' : 'Room / Zone'}
                </label>
                <input
                  type="text"
                  required
                  value={assetRoom}
                  onChange={(e) => setAssetRoom(e.target.value)}
                  data-testid="asset-room-input"
                  placeholder={language === 'ar' ? 'غرفة النوم / المطبخ' : 'Bedroom / Kitchen'}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'اسم البيان أو البند' : 'Asset Title'}
                </label>
                <input
                  type="text"
                  required
                  value={assetTitleAr}
                  onChange={(e) => setAssetTitleAr(e.target.value)}
                  data-testid="asset-title-input"
                  placeholder={language === 'ar' ? 'كود دهان جوتن الصالة' : 'e.g., Jotun Living Wall Shade'}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'الكود / المقاس / الرقم' : 'Code / Serial / Size'}
                </label>
                <input
                  type="text"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  data-testid="asset-code-input"
                  placeholder={
                    language === 'ar'
                      ? HOME_ASSET_CATEGORY_META[assetCategory].placeholderCodeAr
                      : HOME_ASSET_CATEGORY_META[assetCategory].placeholderCodeEn
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'الشركة / المورد / العلامة' : 'Brand / Supplier'}
                </label>
                <input
                  type="text"
                  value={assetVendor}
                  onChange={(e) => setAssetVendor(e.target.value)}
                  data-testid="asset-vendor-input"
                  placeholder={language === 'ar' ? 'Jotun / ABB / Sharp' : 'Jotun / ABB / Sharp'}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <button
                type="submit"
                data-testid="create-home-asset-btn"
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'حفظ في ملف البيت' : 'Save Home Asset'}</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="home-assets-list">
              {assets.map((asset) => {
                const catMeta = HOME_ASSET_CATEGORY_META[asset.assetCategory];
                return (
                  <div
                    key={asset.id}
                    data-testid={`home-asset-card-${asset.id}`}
                    className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FDE8ED] text-[#B31331] text-[10px] font-black">
                          {language === 'ar' ? catMeta.labelAr : catMeta.labelEn}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-gray-700 text-[10px] font-bold">
                          {asset.roomLabel}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-[#2A1D20]">
                        {language === 'ar' ? asset.titleAr : asset.titleEn}
                      </h3>
                      {asset.codeOrSerial && (
                        <p className="text-xs font-extrabold text-[#D91B3E] break-all">
                          {asset.codeOrSerial}
                        </p>
                      )}
                      {(asset.vendorOrBrand || asset.notes) && (
                        <p className="text-[11px] text-gray-500">
                          {[asset.vendorOrBrand, asset.notes].filter(Boolean).join(' — ')}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      data-testid={`delete-asset-btn-${asset.id}`}
                      onClick={() => void deleteHomeAsset(asset.id)}
                      aria-label="Delete asset"
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: PREVENTIVE MAINTENANCE SCHEDULE */}
        {activeTab === 'maintenance' && (
          <section className="space-y-6">
            <form
              onSubmit={(e) => void handleCreateReminder(e)}
              data-testid="create-reminder-form"
              className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-6 border border-[#D91B3E]/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end"
            >
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'نظام الصيانة' : 'System'}
                </label>
                <select
                  value={remSystem}
                  onChange={(e) => {
                    const next = e.target.value as MaintenanceSystemCategory;
                    setRemSystem(next);
                    setRemInterval(MAINTENANCE_SYSTEM_META[next].defaultIntervalMonths);
                    setRemCost(MAINTENANCE_SYSTEM_META[next].defaultCostEgp);
                  }}
                  data-testid="reminder-system-select"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                >
                  {(Object.keys(MAINTENANCE_SYSTEM_META) as MaintenanceSystemCategory[]).map((sysKey) => (
                    <option key={sysKey} value={sysKey}>
                      {language === 'ar'
                        ? MAINTENANCE_SYSTEM_META[sysKey].labelAr
                        : MAINTENANCE_SYSTEM_META[sysKey].labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'وصف التذكير' : 'Reminder Title'}
                </label>
                <input
                  type="text"
                  required
                  value={remTitleAr}
                  onChange={(e) => setRemTitleAr(e.target.value)}
                  data-testid="reminder-title-input"
                  placeholder={language === 'ar' ? 'تنظيف التكييف قبل الصيف' : 'Spring AC Coil Service'}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'الدورية (بالأشهر)' : 'Cycle (Months)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={remInterval}
                  onChange={(e) => setRemInterval(Number(e.target.value))}
                  data-testid="reminder-interval-input"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'الموعد القادم' : 'Next Due Date'}
                </label>
                <input
                  type="date"
                  value={remDueDate}
                  onChange={(e) => setRemDueDate(e.target.value)}
                  data-testid="reminder-due-input"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'التكلفة التقديرية (ج.م)' : 'Est. Cost (EGP)'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={remCost}
                  onChange={(e) => setRemCost(Number(e.target.value))}
                  data-testid="reminder-cost-input"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <button
                type="submit"
                data-testid="create-reminder-btn"
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CalendarClock className="w-4 h-4" />
                <span>{language === 'ar' ? 'جدولة الصيانة' : 'Schedule Care'}</span>
              </button>
            </form>

            <div className="space-y-3" data-testid="maintenance-reminders-list">
              {reminders.map((rem) => {
                const statusBadge =
                  rem.status === 'overdue'
                    ? {
                        cls: 'bg-rose-100 text-[#B31331] border-rose-200',
                        ar: 'متأخر عن الموعد',
                        en: 'Overdue',
                      }
                    : rem.status === 'due_soon'
                      ? {
                          cls: 'bg-amber-50 text-amber-800 border-amber-200',
                          ar: 'مستحق قريباً',
                          en: 'Due Soon',
                        }
                      : {
                          cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                          ar: 'مجدول',
                          en: 'Upcoming',
                        };

                return (
                  <div
                    key={rem.id}
                    data-testid={`reminder-card-${rem.id}`}
                    className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          data-testid={`reminder-status-${rem.status}`}
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black ${statusBadge.cls}`}
                        >
                          {language === 'ar' ? statusBadge.ar : statusBadge.en}
                        </span>
                        <span className="text-[11px] font-bold text-gray-500">
                          {language === 'ar' ? `كل ${rem.intervalMonths} أشهر` : `Every ${rem.intervalMonths}m`}
                        </span>
                        <span className="text-[11px] font-extrabold text-[#B31331]">
                          {rem.estimatedCostEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-[#2A1D20]">
                        {language === 'ar' ? rem.titleAr : rem.titleEn}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {language === 'ar' ? 'الموعد القادم:' : 'Next Due:'}{' '}
                        <strong className="text-[#2A1D20]">{rem.nextDueDate}</strong>
                        {rem.lastCompletedAt && (
                          <span className="ms-2 text-gray-500">
                            • {language === 'ar' ? 'آخر تنفيذ:' : 'Last done:'} {rem.lastCompletedAt}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        data-testid={`complete-reminder-btn-${rem.id}`}
                        onClick={() => void completeMaintenanceReminder(rem.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {language === 'ar' ? 'تسجيل الإتمام وتجديد الدورة' : 'Complete & Advance'}
                        </span>
                      </button>
                      <Link
                        to={`/rfq/new?category=${encodeURIComponent(rem.vendorCategorySlug)}`}
                        className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-gray-200 hover:border-[#D91B3E] text-xs font-bold text-[#2A1D20]"
                      >
                        {language === 'ar' ? 'طلب فني (RFQ)' : 'Book Technician'}
                      </Link>
                      <button
                        type="button"
                        data-testid={`delete-reminder-btn-${rem.id}`}
                        onClick={() => void deleteMaintenanceReminder(rem.id)}
                        aria-label="Delete reminder"
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 3: HOME INVENTORY */}
        {activeTab === 'inventory' && (
          <section className="space-y-6">
            <form
              onSubmit={(e) => void handleCreateInventory(e)}
              data-testid="create-inventory-form"
              className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-6 border border-[#D91B3E]/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end"
            >
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'الغرفة' : 'Room'}
                </label>
                <input
                  type="text"
                  required
                  value={invRoom}
                  onChange={(e) => setInvRoom(e.target.value)}
                  data-testid="inv-room-input"
                  placeholder={language === 'ar' ? 'المطبخ' : 'Kitchen'}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'اسم الجهاز أو القطعة' : 'Equipment / Furniture Name'}
                </label>
                <input
                  type="text"
                  required
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  data-testid="inv-name-input"
                  placeholder={language === 'ar' ? 'ميكروويف شارب 34 لتر' : 'Sharp 34L Microwave'}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'الموديل والعلامة التجارية' : 'Brand & Model'}
                </label>
                <input
                  type="text"
                  required
                  value={invBrand}
                  onChange={(e) => setInvBrand(e.target.value)}
                  data-testid="inv-brand-input"
                  placeholder="Sharp R-750MR"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'سعر الشراء (ج.م)' : 'Purchase Price (EGP)'}
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={invPrice}
                  onChange={(e) => setInvPrice(Number(e.target.value))}
                  data-testid="inv-price-input"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {language === 'ar' ? 'الحالة' : 'Condition'}
                </label>
                <select
                  value={invCondition}
                  onChange={(e) => setInvCondition(e.target.value as HomeItemCondition)}
                  data-testid="inv-condition-select"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                >
                  {(Object.keys(HOME_ITEM_CONDITION_META) as HomeItemCondition[]).map((c) => (
                    <option key={c} value={c}>
                      {language === 'ar'
                        ? HOME_ITEM_CONDITION_META[c].labelAr
                        : HOME_ITEM_CONDITION_META[c].labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {language === 'ar' ? 'انتهاء الضمان' : 'Warranty Until'}
                  </label>
                  <input
                    type="date"
                    value={invWarrantyExpiry}
                    onChange={(e) => setInvWarrantyExpiry(e.target.value)}
                    data-testid="inv-warranty-expiry-input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="create-inventory-btn"
                  className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
                </button>
              </div>
            </form>

            <div className="space-y-3" data-testid="home-inventory-list">
              {inventory.map((item) => {
                const condMeta = HOME_ITEM_CONDITION_META[item.condition];
                return (
                  <div
                    key={item.id}
                    data-testid={`inventory-card-${item.id}`}
                    className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-gray-700 text-[10px] font-bold">
                          {item.roomLabel}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black ${condMeta.badgeClass}`}>
                          {language === 'ar' ? condMeta.labelAr : condMeta.labelEn}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-[#2A1D20]">{item.itemName}</h3>
                      <p className="text-xs text-gray-600">
                        {item.brandModel} •{' '}
                        <strong className="text-[#D91B3E]">
                          {item.purchasePriceEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </strong>
                        {item.warrantyExpiryDate && ` • ${language === 'ar' ? 'الضمان:' : 'Warranty:'} ${item.warrantyExpiryDate}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.condition}
                        onChange={(e) =>
                          void updateHomeInventoryItem(item.id, {
                            condition: e.target.value as HomeItemCondition,
                          })
                        }
                        aria-label="Update condition"
                        className="px-3 py-1.5 rounded-xl border border-gray-200 bg-[#FAF7F2] text-xs font-bold"
                      >
                        {(Object.keys(HOME_ITEM_CONDITION_META) as HomeItemCondition[]).map((c) => (
                          <option key={c} value={c}>
                            {language === 'ar'
                              ? HOME_ITEM_CONDITION_META[c].labelAr
                              : HOME_ITEM_CONDITION_META[c].labelEn}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => void deleteHomeInventoryItem(item.id)}
                        aria-label="Delete inventory item"
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 4: INTEGRATED WARRANTY & DOCUMENT VAULT */}
        {activeTab === 'warranties' && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="home-file-vault-section">
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-black text-[#2A1D20] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D91B3E]" />
                  <span>
                    {language === 'ar'
                      ? `سجل ضمانات الأجهزة والمقاولين (${warranties.length})`
                      : `Active Warranties Vault (${warranties.length})`}
                  </span>
                </h2>
                <Link
                  to="/my/workspace?tab=warranties"
                  className="text-xs font-bold text-[#D91B3E] hover:underline"
                >
                  {language === 'ar' ? 'إضافة / إدارة بالمركز' : 'Manage in Hub'}
                </Link>
              </div>

              {warranties.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {language === 'ar'
                    ? 'لم يتم تسجيل شهادات ضمان بعد. أضفها من مركزي لتظهر هنا.'
                    : 'No warranties logged yet. Add warranties from My Hub to track expirations.'}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {warranties.map((w) => {
                    const expiringSoon = isWarrantyExpiringWithinDays(w.expiryDate, 90, todayIso);
                    const expired = w.expiryDate.slice(0, 10) < todayIso;
                    return (
                      <div
                        key={w.id}
                        className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-100 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <strong className="text-sm text-[#2A1D20] block">{w.itemName}</strong>
                          <span className="text-gray-500">
                            {w.providerName} • {language === 'ar' ? 'ينتهي:' : 'Expires:'}{' '}
                            <strong>{w.expiryDate}</strong>
                          </span>
                        </div>
                        {expired ? (
                          <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-[10px] font-black">
                            {language === 'ar' ? 'منتهي' : 'Expired'}
                          </span>
                        ) : expiringSoon ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>{language === 'ar' ? 'ينتهي قريباً' : 'Expiring <90d'}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black">
                            {language === 'ar' ? 'ساري' : 'Active'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-black text-[#2A1D20] flex items-center gap-2">
                  <Archive className="w-4 h-4 text-[#D91B3E]" />
                  <span>
                    {language === 'ar'
                      ? `العقود والمستندات المؤمّنة (${documents.length})`
                      : `Contracts & Home Documents (${documents.length})`}
                  </span>
                </h2>
                <Link
                  to="/my/workspace?tab=documents"
                  className="text-xs font-bold text-[#D91B3E] hover:underline"
                >
                  {language === 'ar' ? 'خزنة المستندات' : 'Document Locker'}
                </Link>
              </div>

              {documents.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'لا توجد مستندات محفوظة بعد.' : 'No stored documents yet.'}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-100 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#D91B3E] shrink-0" />
                          <strong className="text-sm text-[#2A1D20] truncate">{doc.title}</strong>
                        </div>
                        <span className="text-gray-500 block truncate">
                          {doc.fileName} {doc.referenceCode ? `• ${doc.referenceCode}` : ''}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                          doc.isSharedWithPartner
                            ? 'bg-[#FDE8ED] text-[#B31331]'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {doc.isSharedWithPartner
                          ? language === 'ar'
                            ? 'مشترك'
                            : 'Shared'
                          : language === 'ar'
                            ? 'خاص'
                            : 'Private'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};


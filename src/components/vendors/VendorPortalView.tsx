import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../services/api';
import {
  CommercialPlanBadge,
  HonestRatingBadge,
  VerificationBadge,
} from './VendorBadges';
import {
  AlertCircle,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Layers,
  Lock,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Trash2,
} from 'lucide-react';
import type {
  SubscriptionPlanCode,
  VendorBillingRecord,
  VendorPortalOverviewPayload,
  VendorPriceTier,
} from '../../types';

export const VendorPortalView: React.FC = () => {
  const {
    language,
    currentUser,
    apiConnected,
    vendors,
    vendorCategories,
    locations,
    setAuthModalOpen,
    registerVendor,
    refreshVendors,
    showToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedVendorId = searchParams.get('vendorId') || '';

  const [portalTab, setPortalTab] = useState<'profile' | 'services' | 'promotions' | 'billing'>(
    'profile',
  );
  const [overview, setOverview] = useState<VendorPortalOverviewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Registration Form State (when user has no vendor yet)
  const [regNameAr, setRegNameAr] = useState('');
  const [regNameEn, setRegNameEn] = useState('');
  const [regCat, setRegCat] = useState(vendorCategories[0]?.slug || 'turnkey_finishing');
  const [regGov, setRegGov] = useState('cairo');
  const [regAddrAr, setRegAddrAr] = useState('');
  const [regAddrEn, setRegAddrEn] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBioAr, setRegBioAr] = useState('');
  const [regBioEn, setRegBioEn] = useState('');
  const [regTier, setRegTier] = useState<VendorPriceTier>('mid');
  const [regStartPrice, setRegStartPrice] = useState(3500);
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Profile Edit Form State
  const [profNameAr, setProfNameAr] = useState('');
  const [profNameEn, setProfNameEn] = useState('');
  const [profGov, setProfGov] = useState('cairo');
  const [profAddrAr, setProfAddrAr] = useState('');
  const [profAddrEn, setProfAddrEn] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profWhatsapp, setProfWhatsapp] = useState('');
  const [profBioAr, setProfBioAr] = useState('');
  const [profBioEn, setProfBioEn] = useState('');
  const [profStartingPrice, setProfStartingPrice] = useState(0);
  const [profSaving, setProfSaving] = useState(false);

  // New Service Form State
  const [srvTitleAr, setSrvTitleAr] = useState('');
  const [srvTitleEn, setSrvTitleEn] = useState('');
  const [srvDescAr, setSrvDescAr] = useState('');
  const [srvDescEn, setSrvDescEn] = useState('');
  const [srvUnitAr, setSrvUnitAr] = useState('مشروع / باقة');
  const [srvUnitEn, setSrvUnitEn] = useState('Package / Project');
  const [srvPrice, setSrvPrice] = useState(2500);
  const [srvTurnaround, setSrvTurnaround] = useState('14 يوم');
  const [srvWarranty, setSrvWarranty] = useState(12);
  const [srvSubmitting, setSrvSubmitting] = useState(false);

  // New Promotion Form State
  const [prmTitleAr, setPrmTitleAr] = useState('');
  const [prmTitleEn, setPrmTitleEn] = useState('');
  const [prmDescAr, setPrmDescAr] = useState('');
  const [prmDescEn, setPrmDescEn] = useState('');
  const [prmDiscount, setPrmDiscount] = useState(10);
  const [prmCode, setPrmCode] = useState('');
  const [prmValidUntil, setPrmValidUntil] = useState('2026-12-31');
  const [prmSubmitting, setPrmSubmitting] = useState(false);

  // Subscription Billing Cycle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [planSwitching, setPlanSwitching] = useState<string | null>(null);

  const ownedVendors = useMemo(
    () =>
      currentUser
        ? vendors.filter((v) => v.ownerUserId === currentUser.id)
        : [],
    [vendors, currentUser],
  );

  const regionalOptions = useMemo(
    () => locations.filter((l) => l.level !== 'country'),
    [locations],
  );

  const hydrateFormFromOverview = useCallback((ov: VendorPortalOverviewPayload) => {
    if (!ov.vendor) return;
    setProfNameAr(ov.vendor.businessNameAr);
    setProfNameEn(ov.vendor.businessNameEn);
    setProfGov(ov.vendor.governorateSlug);
    setProfAddrAr(ov.vendor.addressAr);
    setProfAddrEn(ov.vendor.addressEn);
    setProfPhone(ov.vendor.phone);
    setProfWhatsapp(ov.vendor.whatsapp || '');
    setProfBioAr(ov.vendor.bioAr);
    setProfBioEn(ov.vendor.bioEn);
    setProfStartingPrice(ov.vendor.startingPriceEgp);
  }, []);

  useEffect(() => {
    let active = true;
    if (!currentUser || !apiConnected) {
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const qs = requestedVendorId ? `?vendorId=${encodeURIComponent(requestedVendorId)}` : '';
        const data = await apiRequest<VendorPortalOverviewPayload>(`/vendor-portal/overview${qs}`);
        if (!active) return;
        setOverview(data);
        hydrateFormFromOverview(data);
        setErrorMsg(null);
      } catch (err) {
        if (!active) return;
        setErrorMsg(
          err instanceof Error
            ? err.message
            : language === 'ar'
              ? 'تعذر تحميل بيانات بوابة الشركاء.'
              : 'Failed to load Vendor Portal overview.',
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser, apiConnected, requestedVendorId, hydrateFormFromOverview, language]);

  const activeVendorIdQuery = overview?.vendor?.id
    ? `?vendorId=${encodeURIComponent(overview.vendor.id)}`
    : '';

  const handleSelfRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await registerVendor({
        businessNameAr: regNameAr.trim(),
        businessNameEn: regNameEn.trim() || regNameAr.trim(),
        primaryCategorySlug: regCat,
        governorateSlug: regGov,
        serviceAreas: [regGov],
        addressAr: regAddrAr.trim(),
        addressEn: regAddrEn.trim() || regAddrAr.trim(),
        phone: regPhone.trim(),
        bioAr: regBioAr.trim(),
        bioEn: regBioEn.trim() || regBioAr.trim(),
        priceTier: regTier,
        startingPriceEgp: Number(regStartPrice),
      });
      setSearchParams({ vendorId: created.id });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration error');
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overview?.vendor) return;
    setProfSaving(true);
    setErrorMsg(null);
    try {
      const updated = await apiRequest<VendorPortalOverviewPayload>(
        `/vendor-portal/profile${activeVendorIdQuery}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            businessNameAr: profNameAr.trim(),
            businessNameEn: profNameEn.trim(),
            governorateSlug: profGov,
            addressAr: profAddrAr.trim(),
            addressEn: profAddrEn.trim(),
            phone: profPhone.trim(),
            whatsapp: profWhatsapp.trim(),
            bioAr: profBioAr.trim(),
            bioEn: profBioEn.trim(),
            startingPriceEgp: Number(profStartingPrice),
          }),
        },
      );
      setOverview(updated);
      hydrateFormFromOverview(updated);
      await refreshVendors();
      showToast(language === 'ar' ? 'تم حفظ ملف الشريك بنجاح.' : 'Vendor profile saved.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Profile update failed');
    } finally {
      setProfSaving(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overview?.vendor) return;
    setSrvSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ overview: VendorPortalOverviewPayload }>(
        `/vendor-portal/services${activeVendorIdQuery}`,
        {
          method: 'POST',
          body: JSON.stringify({
            titleAr: srvTitleAr.trim(),
            titleEn: srvTitleEn.trim() || srvTitleAr.trim(),
            descriptionAr: srvDescAr.trim(),
            descriptionEn: srvDescEn.trim() || srvDescAr.trim(),
            unitLabelAr: srvUnitAr.trim(),
            unitLabelEn: srvUnitEn.trim(),
            startingPriceEgp: Number(srvPrice),
            turnaroundDays: srvTurnaround.trim() || null,
            warrantyMonths: Number(srvWarranty),
            isActive: true,
          }),
        },
      );
      setOverview(res.overview);
      setSrvTitleAr('');
      setSrvTitleEn('');
      setSrvDescAr('');
      setSrvDescEn('');
      showToast(language === 'ar' ? 'تمت إضافة الخدمة الجديدة.' : 'Service added.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to add service');
    } finally {
      setSrvSubmitting(false);
    }
  };

  const handleDeleteService = async (srvId: string) => {
    if (!overview?.vendor) return;
    setErrorMsg(null);
    try {
      const updated = await apiRequest<VendorPortalOverviewPayload>(
        `/vendor-portal/services/${encodeURIComponent(srvId)}${activeVendorIdQuery}`,
        { method: 'DELETE' },
      );
      setOverview(updated);
      showToast(language === 'ar' ? 'تم حذف الخدمة.' : 'Service removed.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to delete service');
    }
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overview?.vendor) return;
    setPrmSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ overview: VendorPortalOverviewPayload }>(
        `/vendor-portal/promotions${activeVendorIdQuery}`,
        {
          method: 'POST',
          body: JSON.stringify({
            titleAr: prmTitleAr.trim(),
            titleEn: prmTitleEn.trim() || prmTitleAr.trim(),
            descriptionAr: prmDescAr.trim(),
            descriptionEn: prmDescEn.trim() || prmDescAr.trim(),
            discountPercent: Number(prmDiscount),
            promoCode: prmCode.trim() || undefined,
            validUntil: prmValidUntil.trim(),
          }),
        },
      );
      setOverview(res.overview);
      setPrmTitleAr('');
      setPrmTitleEn('');
      setPrmDescAr('');
      setPrmDescEn('');
      setPrmCode('');
      showToast(language === 'ar' ? 'تم نشر العرض الترويجي.' : 'Promotion published.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to create promotion');
    } finally {
      setPrmSubmitting(false);
    }
  };

  const handleDeletePromotion = async (promoId: string) => {
    if (!overview?.vendor) return;
    setErrorMsg(null);
    try {
      const updated = await apiRequest<VendorPortalOverviewPayload>(
        `/vendor-portal/promotions/${encodeURIComponent(promoId)}${activeVendorIdQuery}`,
        { method: 'DELETE' },
      );
      setOverview(updated);
      showToast(language === 'ar' ? 'تم حذف العرض.' : 'Promotion removed.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to delete promotion');
    }
  };

  const handleSwitchSubscription = async (planCode: SubscriptionPlanCode) => {
    if (!overview?.vendor) return;
    setPlanSwitching(planCode);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{
        billingRecord: VendorBillingRecord;
        overview: VendorPortalOverviewPayload;
      }>(`/vendor-portal/subscription${activeVendorIdQuery}`, {
        method: 'POST',
        body: JSON.stringify({ planCode, billingCycle }),
      });
      setOverview(res.overview);
      await refreshVendors();
      showToast(
        language === 'ar'
          ? `تم تحديث الباقة التجارية إلى ${planCode}. حالة التوثيق تظل وفق فحص الإدارة.`
          : `Switched commercial plan to ${planCode}. Verification status remains strictly audit-controlled.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Subscription switch failed');
    } finally {
      setPlanSwitching(null);
    }
  };

  if (!currentUser) {
    return (
      <div
        data-testid="vendor-portal-unauth"
        className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] mx-auto flex items-center justify-center border border-[#D91B3E]/20 shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
          {language === 'ar'
            ? 'بوابة شركاء ومقدمي خدمات جواز إن'
            : 'GAWAZ INN Vendor & Partners Portal'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {language === 'ar'
            ? 'سجّل الدخول بحساب الشريك لإدارة خدماتك، الباقات، العروض الموسمية، وسجل الفواتير — أو أنشئ ملف شركتك الجديد في ثوانٍ.'
            : 'Sign in with your partner account to manage services, seasonal promotions, commercial subscriptions, and billing history.'}
        </p>
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 text-xs text-gray-700 space-y-1 max-w-md mx-auto">
          <p className="font-bold text-[#B31331]">
            {language === 'ar' ? 'حساب شريك تجريبي معتمد:' : 'Demo Vendor Credential:'}
          </p>
          <p dir="ltr" className="font-mono text-[11px]">
            vendor@gawazinn.demo / DemoPass@2026
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            data-testid="vendor-portal-signin-btn"
            className="px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md cursor-pointer"
          >
            {language === 'ar' ? 'تسجيل الدخول لبوابة الشركاء' : 'Sign In to Vendor Portal'}
          </button>
          <Link
            to="/vendors"
            className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold"
          >
            {language === 'ar' ? 'تصفح دليل الشركاء' : 'Browse Vendors'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20">
              <Store className="w-3.5 h-3.5" />
              <span>
                {language === 'ar' ? 'إدارة ملف الشريك التجاري' : 'Partner Business Workspace'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {overview?.vendor
                ? language === 'ar'
                  ? overview.vendor.businessNameAr
                  : overview.vendor.businessNameEn
                : language === 'ar'
                  ? 'تسجيل نشاطك التجاري في جواز إن'
                  : 'Register Your Business Listing'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {ownedVendors.length > 1 && (
              <select
                value={overview?.vendor?.id || ''}
                onChange={(e) => setSearchParams({ vendorId: e.target.value })}
                data-testid="vendor-portal-switcher"
                className="max-w-full min-w-0 truncate px-3.5 py-2.5 rounded-xl bg-white text-[#2A1D20] text-xs font-bold outline-none"
              >
                {ownedVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {language === 'ar' ? v.businessNameAr : v.businessNameEn} (
                    {v.verificationStatus})
                  </option>
                ))}
              </select>
            )}
            {overview?.vendor && (
              <Link
                to={`/vendors/${overview.vendor.slug}`}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'عرض الصفحة العامة' : 'View Public Profile'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {errorMsg && (
          <div
            data-testid="vendor-portal-error"
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[#B31331] text-xs font-bold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading && !overview ? (
          <div className="py-16 text-center text-xs font-bold text-[#B31331]">
            {language === 'ar' ? 'جاري تحميل بيانات الشريك...' : 'Loading partner data...'}
          </div>
        ) : !overview?.vendor ? (
          /* Onboarding Self-Registration Form if user owns no business yet */
          <form
            onSubmit={handleSelfRegister}
            data-testid="vendor-portal-register-form"
            className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-lg space-y-5 max-w-4xl mx-auto"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#2A1D20]">
                {language === 'ar'
                  ? 'أنشئ ملف شركتك على الباقة المجانية'
                  : 'Create Your Free Vendor Profile'}
              </h2>
              <p className="text-xs text-gray-600">
                {language === 'ar'
                  ? 'يبدأ الملف فوراً بحالة «مسجل (قيد المراجعة)» وبحد مجاني للخدمات. التوثيق يتم عبر الإدارة عند مراجعة الأوراق.'
                  : 'Starts immediately with Registered status on the Free tier. Formal verification is audited separately by Admin.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'اسم الشركة (عربي):' : 'Business Name (AR):'}
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={regNameAr}
                  onChange={(e) => setRegNameAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'اسم الشركة (إنجليزي):' : 'Business Name (EN):'}
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={regNameEn}
                  onChange={(e) => setRegNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'التخصص:' : 'Category:'}
                </label>
                <select
                  value={regCat}
                  onChange={(e) => setRegCat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  {vendorCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'المحافظة:' : 'Governorate:'}
                </label>
                <select
                  value={regGov}
                  onChange={(e) => setRegGov(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  {regionalOptions.map((loc) => (
                    <option key={loc.id} value={loc.slug}>
                      {language === 'ar' ? loc.nameAr : loc.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'الهاتف:' : 'Phone:'}
                </label>
                <input
                  type="tel"
                  required
                  minLength={8}
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'العنوان (عربي):' : 'Address (AR):'}
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={regAddrAr}
                  onChange={(e) => setRegAddrAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'العنوان (إنجليزي):' : 'Address (EN):'}
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={regAddrEn}
                  onChange={(e) => setRegAddrEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'فئة السعر وبداية السعر:' : 'Tier & Starting Price:'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={regTier}
                    onChange={(e) => setRegTier(e.target.value as VendorPriceTier)}
                    className="w-1/2 p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                  >
                    <option value="economy">Economy</option>
                    <option value="mid">Mid</option>
                    <option value="luxury">Luxury</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={regStartPrice}
                    onChange={(e) => setRegStartPrice(Number(e.target.value))}
                    className="w-1/2 p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'نبذة عن النشاط (عربي):' : 'Bio (AR, min 12 chars):'}
                </label>
                <textarea
                  rows={2}
                  required
                  minLength={12}
                  value={regBioAr}
                  onChange={(e) => setRegBioAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'نبذة (إنجليزي):' : 'Bio (EN, min 12 chars):'}
                </label>
                <textarea
                  rows={2}
                  required
                  minLength={12}
                  value={regBioEn}
                  onChange={(e) => setRegBioEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={regSubmitting}
              className="px-6 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow cursor-pointer"
            >
              {regSubmitting
                ? language === 'ar'
                  ? 'جاري التسجيل...'
                  : 'Submitting...'
                : language === 'ar'
                  ? 'إنشاء ملف الشريك'
                  : 'Create Business Listing'}
            </button>
          </form>
        ) : (
          /* Authenticated Active Vendor Workspace */
          <div className="space-y-6">
            {/* Status & Quota Summary Cards */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <VerificationBadge status={overview.vendor.verificationStatus} language={language} />
                  <CommercialPlanBadge
                    planCode={overview.vendor.subscriptionPlanCode}
                    isFeaturedCommercial={overview.vendor.isFeaturedCommercial}
                    language={language}
                  />
                  <HonestRatingBadge
                    ratingAvg={overview.vendor.ratingAvg}
                    reviewsCount={overview.vendor.reviewsCount}
                    language={language}
                  />
                </div>
                <span className="text-xs font-bold text-[#B31331]">
                  {language === 'ar' ? 'الباقة التجارية الحالية:' : 'Current Plan:'}{' '}
                  {language === 'ar'
                    ? overview.plan?.nameAr || overview.vendor.subscriptionPlanCode
                    : overview.plan?.nameEn || overview.vendor.subscriptionPlanCode}
                </span>
              </div>

              {/* Strict Decoupling Governance Notice */}
              <div
                data-testid="portal-governance-notice"
                className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 text-xs text-gray-700 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'حوكمة جواز إن: ترقية الباقة التجارية تزيد حصص الخدمات والعروض والظهور المميز فقط — ولا تمنح شارة «موثق» أو «ثقة» أبداً دون فحص الأوراق من الإدارة.'
                    : 'Governance Rule: Upgrading your commercial tier increases service, promo, and featured quotas only — it NEVER alters your admin verification status.'}
                </span>
              </div>

              {/* Quota Gauges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100">
                  <span className="text-[11px] text-gray-500 block">
                    {language === 'ar' ? 'الخدمات المدرجة' : 'Services Quota'}
                  </span>
                  <strong
                    data-testid="portal-quota-services"
                    className="text-base font-black text-[#2A1D20]"
                  >
                    {overview.quotas.servicesUsed} / {overview.quotas.maxServices}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100">
                  <span className="text-[11px] text-gray-500 block">
                    {language === 'ar' ? 'العروض النشطة' : 'Promotions Quota'}
                  </span>
                  <strong
                    data-testid="portal-quota-promos"
                    className="text-base font-black text-[#D91B3E]"
                  >
                    {overview.quotas.promotionsUsed} / {overview.quotas.maxPromotions}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100">
                  <span className="text-[11px] text-gray-500 block">
                    {language === 'ar' ? 'صور سابقة الأعمال' : 'Portfolio Quota'}
                  </span>
                  <strong className="text-base font-black text-[#2A1D20]">
                    {overview.quotas.portfolioUsed} / {overview.quotas.maxPortfolioItems}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100">
                  <span className="text-[11px] text-gray-500 block">
                    {language === 'ar' ? 'مشاهدات الملف' : 'Profile Views'}
                  </span>
                  <strong className="text-base font-black text-[#2A1D20]">
                    {overview.vendor.profileViews}
                  </strong>
                </div>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: 'profile' as const,
                  ar: 'بيانات الملف والتغطية',
                  en: 'Profile & Service Areas',
                  icon: <Building2 className="w-4 h-4" />,
                },
                {
                  key: 'services' as const,
                  ar: `الخدمات (${overview.services.length})`,
                  en: `Services (${overview.services.length})`,
                  icon: <Layers className="w-4 h-4" />,
                },
                {
                  key: 'promotions' as const,
                  ar: `العروض الموسمية (${overview.promotions.length})`,
                  en: `Promotions (${overview.promotions.length})`,
                  icon: <Tag className="w-4 h-4" />,
                },
                {
                  key: 'billing' as const,
                  ar: 'الباقات التجارية والفواتير',
                  en: 'Commercial Plans & Billing',
                  icon: <CreditCard className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  data-testid={`portal-tab-${tab.key}`}
                  onClick={() => setPortalTab(tab.key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    portalTab === tab.key
                      ? 'bg-[#D91B3E] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                  }`}
                >
                  {tab.icon}
                  <span>{language === 'ar' ? tab.ar : tab.en}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: Profile */}
            {portalTab === 'profile' && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4"
              >
                <h2 className="text-lg font-black text-[#2A1D20]">
                  {language === 'ar' ? 'تحديث بيانات النشاط التجاري' : 'Update Business Details'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'الاسم التجاري (عربي):' : 'Business Name (AR):'}
                    </label>
                    <input
                      type="text"
                      required
                      value={profNameAr}
                      onChange={(e) => setProfNameAr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'الاسم التجاري (إنجليزي):' : 'Business Name (EN):'}
                    </label>
                    <input
                      type="text"
                      required
                      value={profNameEn}
                      onChange={(e) => setProfNameEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'المحافظة:' : 'Governorate:'}
                    </label>
                    <select
                      value={profGov}
                      onChange={(e) => setProfGov(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                    >
                      {regionalOptions.map((loc) => (
                        <option key={loc.id} value={loc.slug}>
                          {language === 'ar' ? loc.nameAr : loc.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'الهاتف:' : 'Phone:'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'واتساب:' : 'WhatsApp:'}
                    </label>
                    <input
                      type="text"
                      value={profWhatsapp}
                      onChange={(e) => setProfWhatsapp(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'بداية السعر (ج.م):' : 'Starting Price (EGP):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={profStartingPrice}
                      onChange={(e) => setProfStartingPrice(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'العنوان (عربي):' : 'Address (AR):'}
                    </label>
                    <input
                      type="text"
                      required
                      value={profAddrAr}
                      onChange={(e) => setProfAddrAr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'العنوان (إنجليزي):' : 'Address (EN):'}
                    </label>
                    <input
                      type="text"
                      required
                      value={profAddrEn}
                      onChange={(e) => setProfAddrEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'نبذة (عربي):' : 'Bio (AR):'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={profBioAr}
                      onChange={(e) => setProfBioAr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'نبذة (إنجليزي):' : 'Bio (EN):'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={profBioEn}
                      onChange={(e) => setProfBioEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profSaving}
                  data-testid="portal-save-profile-btn"
                  className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {profSaving
                      ? language === 'ar'
                        ? 'جاري الحفظ...'
                        : 'Saving...'
                      : language === 'ar'
                        ? 'حفظ تعديلات الملف'
                        : 'Save Profile Changes'}
                  </span>
                </button>
              </form>
            )}

            {/* TAB 2: Services Catalog */}
            {portalTab === 'services' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddService}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-black text-[#2A1D20]">
                      {language === 'ar' ? 'إضافة خدمة أو باقة جديدة' : 'Add New Service Offering'}
                    </h2>
                    <span className="text-xs font-bold text-[#B31331]">
                      {overview.quotas.servicesUsed} / {overview.quotas.maxServices}
                    </span>
                  </div>

                  {overview.quotas.servicesUsed >= overview.quotas.maxServices && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex flex-wrap items-center justify-between gap-2">
                      <span>
                        {language === 'ar'
                          ? `وصلت للحد الأقصى للباقة الحالية (${overview.quotas.maxServices} خدمات). قم بترقية الباقة لزيادة الحدود.`
                          : `You reached your current plan quota (${overview.quotas.maxServices} services). Upgrade commercially for additional slots.`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPortalTab('billing')}
                        className="px-3 py-1.5 rounded-xl bg-[#D91B3E] text-white text-[11px] font-bold cursor-pointer"
                      >
                        {language === 'ar' ? 'عرض الباقات' : 'View Plans'}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      minLength={2}
                      placeholder={
                        language === 'ar' ? 'اسم الخدمة بالعربية' : 'Service Title (Arabic)'
                      }
                      value={srvTitleAr}
                      onChange={(e) => setSrvTitleAr(e.target.value)}
                      data-testid="portal-service-title-ar"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="text"
                      required
                      minLength={2}
                      placeholder={
                        language === 'ar' ? 'اسم الخدمة بالإنجليزية' : 'Service Title (English)'
                      }
                      value={srvTitleEn}
                      onChange={(e) => setSrvTitleEn(e.target.value)}
                      data-testid="portal-service-title-en"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      minLength={6}
                      placeholder={
                        language === 'ar'
                          ? 'وصف مختصر (عربي - 6 أحرف فأكثر)'
                          : 'Description (AR)'
                      }
                      value={srvDescAr}
                      onChange={(e) => setSrvDescAr(e.target.value)}
                      data-testid="portal-service-desc-ar"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="text"
                      required
                      minLength={6}
                      placeholder={
                        language === 'ar'
                          ? 'وصف مختصر (إنجليزي - 6 أحرف فأكثر)'
                          : 'Description (EN)'
                      }
                      value={srvDescEn}
                      onChange={(e) => setSrvDescEn(e.target.value)}
                      data-testid="portal-service-desc-en"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <input
                      type="text"
                      value={srvUnitAr}
                      onChange={(e) => setSrvUnitAr(e.target.value)}
                      placeholder="وحدة التسعير"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="text"
                      value={srvUnitEn}
                      onChange={(e) => setSrvUnitEn(e.target.value)}
                      placeholder="Unit EN"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="number"
                      min={0}
                      value={srvPrice}
                      onChange={(e) => setSrvPrice(Number(e.target.value))}
                      data-testid="portal-service-price"
                      placeholder="السعر"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="text"
                      value={srvTurnaround}
                      onChange={(e) => setSrvTurnaround(e.target.value)}
                      placeholder="مدة التنفيذ"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="number"
                      min={0}
                      max={240}
                      value={srvWarranty}
                      onChange={(e) => setSrvWarranty(Number(e.target.value))}
                      placeholder="الضمان (شهور)"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={srvSubmitting}
                    data-testid="portal-add-service-btn"
                    className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'ar' ? 'إضافة الخدمة للكتالوج' : 'Add Service'}</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overview.services.map((srv) => (
                    <div
                      key={srv.id}
                      data-testid={`portal-service-card-${srv.id}`}
                      className="bg-white rounded-2xl p-5 border border-rose-100 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-sm font-black text-[#2A1D20]">
                          {language === 'ar' ? srv.titleAr : srv.titleEn}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {language === 'ar' ? srv.descriptionAr : srv.descriptionEn}
                        </p>
                        <strong className="text-xs font-black text-[#D91B3E] block pt-1">
                          {srv.startingPriceEgp.toLocaleString()}{' '}
                          {language === 'ar' ? 'ج.م' : 'EGP'} •{' '}
                          {language === 'ar' ? srv.unitLabelAr : srv.unitLabelEn}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Promotions */}
            {portalTab === 'promotions' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddPromotion}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-black text-[#2A1D20]">
                      {language === 'ar' ? 'إضافة عرض أو خصم موسمي' : 'Launch Seasonal Promotion'}
                    </h2>
                    <span className="text-xs font-bold text-[#B31331]">
                      {overview.quotas.promotionsUsed} / {overview.quotas.maxPromotions}
                    </span>
                  </div>

                  {overview.quotas.maxPromotions === 0 && (
                    <div
                      data-testid="promo-quota-lock-notice"
                      className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex flex-wrap items-center justify-between gap-2"
                    >
                      <span>
                        {language === 'ar'
                          ? 'الباقة المجانية لا تشمل إتاحة عروض موسمية. يمكنك اختيار الباقة الأساسية أو الاحترافية لإضافة عروض (دون أي تأثير على حالة التوثيق).'
                          : 'The Free plan includes 0 promotion slots. Upgrade commercially on Plans & Billing to publish promos (verification stays audit-only).'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPortalTab('billing')}
                        className="px-3 py-1.5 rounded-xl bg-[#D91B3E] text-white text-[11px] font-bold cursor-pointer"
                      >
                        {language === 'ar' ? 'الترقية التجارية' : 'Commercial Plans'}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      minLength={3}
                      placeholder={language === 'ar' ? 'عنوان العرض (عربي)' : 'Promo Title (AR)'}
                      value={prmTitleAr}
                      onChange={(e) => setPrmTitleAr(e.target.value)}
                      data-testid="portal-promo-title-ar"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="text"
                      required
                      minLength={3}
                      placeholder={language === 'ar' ? 'عنوان العرض (إنجليزي)' : 'Promo Title (EN)'}
                      value={prmTitleEn}
                      onChange={(e) => setPrmTitleEn(e.target.value)}
                      data-testid="portal-promo-title-en"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      minLength={6}
                      placeholder={
                        language === 'ar' ? 'شروط ووصف العرض (عربي)' : 'Description (AR)'
                      }
                      value={prmDescAr}
                      onChange={(e) => setPrmDescAr(e.target.value)}
                      data-testid="portal-promo-desc-ar"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="text"
                      required
                      minLength={6}
                      placeholder={
                        language === 'ar' ? 'شروط ووصف العرض (إنجليزي)' : 'Description (EN)'
                      }
                      value={prmDescEn}
                      onChange={(e) => setPrmDescEn(e.target.value)}
                      data-testid="portal-promo-desc-en"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={prmDiscount}
                      onChange={(e) => setPrmDiscount(Number(e.target.value))}
                      placeholder="%"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="text"
                      value={prmCode}
                      onChange={(e) => setPrmCode(e.target.value)}
                      placeholder="PROMO2026"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="date"
                      value={prmValidUntil}
                      onChange={(e) => setPrmValidUntil(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={prmSubmitting}
                    data-testid="portal-add-promo-btn"
                    className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow cursor-pointer"
                  >
                    {language === 'ar' ? 'نشر العرض' : 'Publish Promotion'}
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overview.promotions.map((prm) => (
                    <div
                      key={prm.id}
                      className="bg-white rounded-2xl p-5 border border-rose-100 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-full bg-[#FDE8ED] text-[#D91B3E] text-[10px] font-black">
                          -{prm.discountPercent}%
                        </span>
                        <h3 className="text-sm font-black text-[#2A1D20]">
                          {language === 'ar' ? prm.titleAr : prm.titleEn}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {language === 'ar' ? prm.descriptionAr : prm.descriptionEn}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePromotion(prm.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Commercial Subscription Plans & Billing Ledger */}
            {portalTab === 'billing' && (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-[#2A1D20]">
                      {language === 'ar'
                        ? 'الباقات التجارية وحدود النشر'
                        : 'Commercial Subscription Tiers'}
                    </h2>
                    <p className="text-xs text-gray-600">
                      {language === 'ar'
                        ? 'تزيد الباقات حدود الخدمات والعروض والظهور الإعلاني فقط. شارة التوثيق لا تُباع وتبقى تحت مراجعة الإدارة.'
                        : 'Commercial plans strictly manage service, promo & sponsored visibility limits — never verification status.'}
                    </p>
                  </div>

                  <div className="inline-flex rounded-xl bg-white border border-gray-200 p-1">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        billingCycle === 'monthly'
                          ? 'bg-[#D91B3E] text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {language === 'ar' ? 'شهري' : 'Monthly'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        billingCycle === 'annual'
                          ? 'bg-[#D91B3E] text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {language === 'ar' ? 'سنوي (خصم شهرين)' : 'Annual (Save 2mo)'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {overview.allPlans.map((pl) => {
                    const isCurrent = overview.vendor?.subscriptionPlanId === pl.id;
                    const price =
                      billingCycle === 'annual' ? pl.annualPriceEgp : pl.monthlyPriceEgp;
                    return (
                      <div
                        key={pl.id}
                        data-testid={`portal-plan-card-${pl.code}`}
                        className={`rounded-3xl p-5 border flex flex-col justify-between space-y-4 ${
                          isCurrent
                            ? 'bg-[#FFF8F9] border-[#D91B3E] shadow-lg'
                            : 'bg-white border-rose-100 shadow-sm'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-[#B31331]">
                              {language === 'ar' ? pl.nameAr : pl.nameEn}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-[#D91B3E] text-white text-[10px] font-bold">
                                {language === 'ar' ? 'الحالية' : 'Active'}
                              </span>
                            )}
                          </div>
                          <div className="text-2xl font-black text-[#2A1D20]">
                            {price.toLocaleString()}{' '}
                            <span className="text-xs font-bold text-gray-500">
                              {language === 'ar' ? 'ج.م' : 'EGP'} /{' '}
                              {billingCycle === 'annual'
                                ? language === 'ar'
                                  ? 'سنة'
                                  : 'yr'
                                : language === 'ar'
                                  ? 'شهر'
                                  : 'mo'}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-gray-700 space-y-1 pt-1">
                            <div>
                              • {pl.maxServices} {language === 'ar' ? 'خدمة' : 'services'}
                            </div>
                            <div>
                              • {pl.maxPromotions} {language === 'ar' ? 'عرض موسمي' : 'promos'}
                            </div>
                            <div>
                              • {pl.maxPortfolioItems}{' '}
                              {language === 'ar' ? 'صورة معرض' : 'portfolio items'}
                            </div>
                          </div>
                          <ul className="space-y-1.5 text-[11px] text-gray-600 pt-2 border-t border-gray-100">
                            {(language === 'ar' ? pl.featuresAr : pl.featuresEn).map((feat, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          disabled={isCurrent || planSwitching !== null}
                          onClick={() => handleSwitchSubscription(pl.code)}
                          data-testid={`portal-select-plan-${pl.code}`}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                              : 'bg-red-gradient text-white shadow hover:opacity-95'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {planSwitching === pl.code
                              ? language === 'ar'
                                ? 'جاري التفعيل...'
                                : 'Updating...'
                              : isCurrent
                                ? language === 'ar'
                                  ? 'الباقة المفعّلة'
                                  : 'Active Plan'
                                : language === 'ar'
                                  ? 'اختيار وتفعيل الباقة'
                                  : 'Switch to Plan'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Billing Ledger */}
                <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-[#2A1D20] flex items-center gap-2">
                    <BadgeDollarSign className="w-5 h-5 text-[#D91B3E]" />
                    <span>
                      {language === 'ar'
                        ? 'سجل فواتير الاشتراك التجاري'
                        : 'Commercial Subscription Billing Ledger'}
                    </span>
                  </h3>
                  {overview.billingRecords.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      {language === 'ar'
                        ? 'لا توجد معاملات فواتير مسجلة حتى الآن (الباقة المجانية الأساسية).'
                        : 'No commercial billing records logged yet.'}
                    </p>
                  ) : (
                    <div className="space-y-2" data-testid="portal-billing-ledger">
                      {overview.billingRecords.map((bill) => (
                        <div
                          key={bill.id}
                          className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <strong className="text-[#2A1D20]">
                              {language === 'ar'
                                ? bill.planNameAr || bill.planId
                                : bill.planNameEn || bill.planId}
                            </strong>{' '}
                            <span className="text-gray-500">({bill.billingCycle})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-[#D91B3E]">
                              {bill.amountEgp.toLocaleString()}{' '}
                              {language === 'ar' ? 'ج.م' : 'EGP'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              {bill.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

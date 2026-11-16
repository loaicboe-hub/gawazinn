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
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Layers,
  Lock,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { SmartImage } from '../common/SmartImage';
import { ImageUploader } from '../common/ImageUploader';
import type {
  MarketplaceAppointmentStatus,
  Product,
  RfqRequest,
  SubscriptionPlanCode,
  VendorBillingRecord,
  VendorCrmOverviewPayload,
  VendorLeadActivityType,
  VendorLeadStage,
  VendorPortalOverviewPayload,
  VendorPriceTier,
} from '../../types';

const CRM_STAGE_META: {
  key: VendorLeadStage;
  ar: string;
  en: string;
  cls: string;
}[] = [
  { key: 'new_lead', ar: 'عميل جديد', en: 'New Lead', cls: 'bg-sky-50 text-sky-900 border-sky-200' },
  { key: 'contacted', ar: 'تم التواصل', en: 'Contacted', cls: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
  {
    key: 'quotation_sent',
    ar: 'تم إرسال عرض',
    en: 'Quotation Sent',
    cls: 'bg-[#FDE8ED] text-[#B31331] border-[#D91B3E]/30',
  },
  { key: 'negotiation', ar: 'تفاوض', en: 'Negotiation', cls: 'bg-amber-50 text-amber-900 border-amber-200' },
  { key: 'accepted', ar: 'مقبول / تعاقد', en: 'Accepted', cls: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  { key: 'in_progress', ar: 'قيد التنفيذ', en: 'In Progress', cls: 'bg-teal-50 text-teal-900 border-teal-200' },
  { key: 'completed', ar: 'مكتمل', en: 'Completed', cls: 'bg-emerald-100 text-emerald-950 border-emerald-300' },
  { key: 'lost', ar: 'مفقود / مرفوض', en: 'Lost', cls: 'bg-gray-100 text-gray-700 border-gray-300' },
];

const PRODUCT_CATEGORY_OPTIONS = [
  { slug: 'refrigerators', ar: 'ثلاجات وديب فريزر', en: 'Refrigerators & Freezers' },
  { slug: 'washing_machines', ar: 'غسالات ومجففات ملابس', en: 'Washing Machines' },
  { slug: 'cookers', ar: 'بوتاجازات وأفران وشفاطات', en: 'Cookers & Ovens' },
  { slug: 'tvs', ar: 'شاشات وتلفزيونات وساوند بار', en: 'TVs & Soundbars' },
  { slug: 'air_conditioners', ar: 'تكييفات ومبردات هواء', en: 'Air Conditioners' },
  { slug: 'kitchen_appliances', ar: 'أجهزة مطبخ صغيرة وخلاطات', en: 'Small Kitchen Appliances' },
  { slug: 'living_room', ar: 'صالونات وأنتريهات وركنات', en: 'Living Rooms & Sofas' },
  { slug: 'bedroom', ar: 'غرف نوم ودواليب وسراير', en: 'Bedrooms' },
  { slug: 'dining_room', ar: 'سفرة وترابيزات وكراسي', en: 'Dining Rooms' },
  { slug: 'kitchen_furniture', ar: 'مطابخ خشب وألوميتال وتجهيزات', en: 'Kitchen Furniture' },
  { slug: 'bedding', ar: 'مفروشات وملايات ومراتب ولحاف', en: 'Bedding & Mattresses' },
  { slug: 'carpets', ar: 'سجاد وموكيت ومشاية', en: 'Carpets & Rugs' },
  { slug: 'curtains', ar: 'ستائر وبلاك آوت وتجهيزات أقمشة', en: 'Curtains & Drapery' },
  { slug: 'lighting', ar: 'نجف وإضاءة وأبليكات ديكور', en: 'Lighting & Chandeliers' },
  { slug: 'flooring', ar: 'سيراميك وبورسلين وباركيه', en: 'Ceramics & Flooring' },
  { slug: 'sanitary', ar: 'أطقم حمامات وخلاطات وبانيوهات', en: 'Sanitary Ware' },
  { slug: 'paint', ar: 'دهانات وديكورات حوائط وبديل خشب', en: 'Paints & Wall Finishes' },
];

const SAMPLE_PRODUCT_PHOTOS = [
  { label: 'ثلاجة حديثة', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80' },
  { label: 'غسالة ملابس', url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80' },
  { label: 'شاشة تلفزيون 65', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80' },
  { label: 'بوتاجاز وفرن', url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80' },
  { label: 'تكييف سبليت', url: 'https://images.unsplash.com/photo-1709432767122-d3cb5326911a?auto=format&fit=crop&w=800&q=80' },
  { label: 'طقم حلل جرانيت', url: 'https://images.unsplash.com/photo-1585469385562-12b359da399d?auto=format&fit=crop&w=800&q=80' },
  { label: 'طقم صيني وسفرة', url: 'https://images.unsplash.com/photo-1571987530791-58e3e7744d99?auto=format&fit=crop&w=800&q=80' },
  { label: 'عجان ومحضر طعام', url: 'https://images.unsplash.com/photo-1576602355403-bd9c3c93583e?auto=format&fit=crop&w=800&q=80' },
  { label: 'قلاية هوائية', url: 'https://images.unsplash.com/photo-1695089028114-ce28248f0ab9?auto=format&fit=crop&w=800&q=80' },
  { label: 'غرفة نوم كاملة', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
  { label: 'صالون وركنة', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { label: 'مفرش سرير عروسة', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80' },
  { label: 'طقم برنس وفوط', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80' },
  { label: 'خلاط دش وأدوات صحية', url: 'https://images.unsplash.com/photo-1714399913207-b9198ba711f9?auto=format&fit=crop&w=800&q=80' },
];

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
    refreshProducts,
    showToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedVendorId = searchParams.get('vendorId') || '';

  const [portalTab, setPortalTab] = useState<
    'profile' | 'services' | 'promotions' | 'products' | 'billing' | 'rfqs' | 'appointments' | 'crm'
  >('profile');
  const [overview, setOverview] = useState<VendorPortalOverviewPayload | null>(null);
  const [crmOverview, setCrmOverview] = useState<VendorCrmOverviewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stage 12 Vendor Physical Products State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodSubmitting, setProdSubmitting] = useState(false);
  const [prodDeletingId, setProdDeletingId] = useState<string | null>(null);
  const [prodSearchFilter, setProdSearchFilter] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('all');

  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodCategory, setProdCategory] = useState('refrigerators');
  const [prodCategoryAr, setProdCategoryAr] = useState('ثلاجات وديب فريزر');
  const [prodCategoryEn, setProdCategoryEn] = useState('Refrigerators & Freezers');
  const [prodTrousseauType, setProdTrousseauType] = useState<Product['trousseauType']>('shared');
  const [prodBrand, setProdBrand] = useState('');
  const [prodModel, setProdModel] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(15000);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | ''>('');
  const [prodStock, setProdStock] = useState<number>(5);
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodDescriptionAr, setProdDescriptionAr] = useState('');
  const [prodDescriptionEn, setProdDescriptionEn] = useState('');
  const [prodWarrantyMonths, setProdWarrantyMonths] = useState<number>(24);
  const [prodWarrantyTermsAr, setProdWarrantyTermsAr] = useState('');
  const [prodDimensions, setProdDimensions] = useState('');
  const [prodCapacity, setProdCapacity] = useState('');
  const [prodEnergyRating, setProdEnergyRating] = useState('A');

  // Stage 8 Vendor RFQ Quote Drafts & Messages
  const [quoteDrafts, setQuoteDrafts] = useState<
    Record<
      string,
      {
        quotedAmountEgp: number;
        depositAmountEgp: number;
        estimatedDuration: string;
        warrantyMonths: number;
        scopeSummary: string;
        validUntil: string;
      }
    >
  >({});
  const [rfqReplyDrafts, setRfqReplyDrafts] = useState<Record<string, string>>({});
  const [aptNoteDrafts, setAptNoteDrafts] = useState<Record<string, string>>({});
  const [aptDateDrafts, setAptDateDrafts] = useState<Record<string, string>>({});
  const [aptTimeDrafts, setAptTimeDrafts] = useState<Record<string, string>>({});

  // Stage 8 Vendor CRM States
  const [crmStageFilter, setCrmStageFilter] = useState<'all' | VendorLeadStage>('all');
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadTitle, setNewLeadTitle] = useState('');
  const [newLeadStage, setNewLeadStage] = useState<VendorLeadStage>('new_lead');
  const [newLeadValue, setNewLeadValue] = useState(80000);
  const [leadActNotes, setLeadActNotes] = useState<Record<string, string>>({});
  const [leadActTypes, setLeadActTypes] = useState<Record<string, VendorLeadActivityType>>({});
  const [stage8BusyId, setStage8BusyId] = useState<string | null>(null);

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
        if (data.vendor) {
          const crmRes = await apiRequest<VendorCrmOverviewPayload>(
            `/vendor-portal/crm?vendorId=${encodeURIComponent(data.vendor.id)}`,
          ).catch(() => null);
          if (active) setCrmOverview(crmRes);
        } else {
          setCrmOverview(null);
        }
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

  const activeVendorId = overview?.vendor?.id || '';
  const activeVendorIdQuery = activeVendorId
    ? `?vendorId=${encodeURIComponent(activeVendorId)}`
    : '';

  const refreshCrmData = useCallback(async () => {
    if (!activeVendorId) return;
    const crmRes = await apiRequest<VendorCrmOverviewPayload>(
      `/vendor-portal/crm?vendorId=${encodeURIComponent(activeVendorId)}`,
    ).catch(() => null);
    if (crmRes) setCrmOverview(crmRes);
  }, [activeVendorId]);

  const handleSubmitRfqQuote = async (rfq: RfqRequest, e: React.FormEvent) => {
    e.preventDefault();
    if (!overview?.vendor) return;
    const existingQuote = rfq.quotes?.[0];
    const draft = quoteDrafts[rfq.id] || {
      quotedAmountEgp: existingQuote?.quotedAmountEgp || Math.max(rfq.budgetMin, 50000),
      depositAmountEgp: existingQuote?.depositAmountEgp || 15000,
      estimatedDuration: existingQuote?.estimatedDuration || '30 يوم عمل',
      warrantyMonths: existingQuote?.warrantyMonths ?? 24,
      scopeSummary:
        existingQuote?.scopeSummary ||
        `عرض تسعير متكامل لطلب "${rfq.title}" شامل المعاينة وجدول التسليم.`,
      validUntil: existingQuote?.validUntil || '2026-12-31',
    };
    setStage8BusyId(`quote-${rfq.id}`);
    setErrorMsg(null);
    try {
      await apiRequest(`/rfq/${encodeURIComponent(rfq.id)}/quotes`, {
        method: 'POST',
        body: JSON.stringify({
          vendorId: overview.vendor.id,
          quotedAmountEgp: Number(draft.quotedAmountEgp),
          depositAmountEgp: Number(draft.depositAmountEgp),
          estimatedDuration: draft.estimatedDuration.trim(),
          warrantyMonths: Number(draft.warrantyMonths),
          scopeSummary: draft.scopeSummary.trim(),
          validUntil: draft.validUntil,
        }),
      });
      await refreshCrmData();
      showToast(
        language === 'ar'
          ? 'تم إرسال عرض السعر السري للعميل وترقية الحالة في CRM.'
          : 'Confidential RFQ quote sent and CRM lead moved to Quotation Sent.',
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit RFQ quote');
    } finally {
      setStage8BusyId(null);
    }
  };

  const handleSendRfqVendorReply = async (rfqId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!overview?.vendor) return;
    const body = (rfqReplyDrafts[rfqId] || '').trim();
    if (body.length < 2) return;
    setStage8BusyId(`reply-${rfqId}`);
    try {
      await apiRequest(`/rfq/${encodeURIComponent(rfqId)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ vendorId: overview.vendor.id, body }),
      });
      setRfqReplyDrafts((prev) => ({ ...prev, [rfqId]: '' }));
      await refreshCrmData();
      showToast(language === 'ar' ? 'تم إرسال ردك للعميل.' : 'Reply sent to customer.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Message send error');
    } finally {
      setStage8BusyId(null);
    }
  };

  const handleUpdateVendorApt = async (
    aptId: string,
    nextStatus: MarketplaceAppointmentStatus,
  ) => {
    setStage8BusyId(`apt-${aptId}`);
    setErrorMsg(null);
    try {
      await apiRequest(`/appointments/${encodeURIComponent(aptId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          slotDate: aptDateDrafts[aptId] || undefined,
          slotTime: aptTimeDrafts[aptId] || undefined,
          vendorResponseNote: aptNoteDrafts[aptId] || undefined,
        }),
      });
      await refreshCrmData();
      showToast(
        language === 'ar'
          ? `تم تحديث حالة الموعد إلى "${nextStatus}" وإشعار العميل.`
          : `Appointment marked "${nextStatus}" and customer notified.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update appointment');
    } finally {
      setStage8BusyId(null);
    }
  };

  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overview?.vendor) return;
    setStage8BusyId('new-lead');
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ crm: VendorCrmOverviewPayload }>(
        `/vendor-portal/crm/leads${activeVendorIdQuery}`,
        {
          method: 'POST',
          body: JSON.stringify({
            customerName: newLeadName.trim(),
            customerPhone: newLeadPhone.trim() || null,
            title: newLeadTitle.trim(),
            stage: newLeadStage,
            estimatedValueEgp: Number(newLeadValue),
          }),
        },
      );
      setCrmOverview(res.crm);
      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadTitle('');
      showToast(
        language === 'ar' ? 'تمت إضافة عميل جديد لخط CRM.' : 'New lead added to CRM pipeline.',
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create CRM lead');
    } finally {
      setStage8BusyId(null);
    }
  };

  const handleChangeLeadStage = async (leadId: string, stage: VendorLeadStage) => {
    if (!overview?.vendor) return;
    setStage8BusyId(`stage-${leadId}`);
    try {
      const res = await apiRequest<{ crm: VendorCrmOverviewPayload }>(
        `/vendor-portal/crm/leads/${encodeURIComponent(leadId)}${activeVendorIdQuery}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ stage }),
        },
      );
      setCrmOverview(res.crm);
      showToast(language === 'ar' ? 'تم تحديث مرحلة العميل في CRM.' : 'CRM stage updated.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lead stage update failed');
    } finally {
      setStage8BusyId(null);
    }
  };

  const handleAddLeadActivity = async (leadId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!overview?.vendor) return;
    const note = (leadActNotes[leadId] || '').trim();
    if (note.length < 2) return;
    const rawType = leadActTypes[leadId];
    const activityType =
      rawType === 'call' || rawType === 'quote_sent' || rawType === 'appointment'
        ? rawType
        : 'note';
    setStage8BusyId(`act-${leadId}`);
    try {
      const res = await apiRequest<{ crm: VendorCrmOverviewPayload }>(
        `/vendor-portal/crm/leads/${encodeURIComponent(leadId)}/activities${activeVendorIdQuery}`,
        {
          method: 'POST',
          body: JSON.stringify({ activityType, note }),
        },
      );
      setCrmOverview(res.crm);
      setLeadActNotes((prev) => ({ ...prev, [leadId]: '' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to log activity');
    } finally {
      setStage8BusyId(null);
    }
  };

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

  const openAddProductModal = () => {
    setEditingProductId(null);
    setProdNameAr('');
    setProdNameEn('');
    setProdCategory('refrigerators');
    setProdCategoryAr('ثلاجات وديب فريزر');
    setProdCategoryEn('Refrigerators & Freezers');
    setProdTrousseauType('shared');
    setProdBrand('');
    setProdModel('');
    setProdPrice(15000);
    setProdOriginalPrice('');
    setProdStock(5);
    setProdImageUrl('');
    setProdDescriptionAr('');
    setProdDescriptionEn('');
    setProdWarrantyMonths(24);
    setProdWarrantyTermsAr('ضمان الوكيل الرسمي المعتمد ضد عيوب الصناعة مع بطاقة الضمان الأصلية');
    setProdDimensions('');
    setProdCapacity('');
    setProdEnergyRating('A');
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdNameAr(prod.nameAr);
    setProdNameEn(prod.nameEn || '');
    setProdCategory(prod.category);
    setProdCategoryAr(prod.categoryAr || '');
    setProdCategoryEn(prod.categoryEn || '');
    setProdTrousseauType(prod.trousseauType || 'shared');
    setProdBrand(prod.brand);
    setProdModel(prod.model || '');
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice ? prod.originalPrice : '');
    setProdStock(prod.stock ?? 5);
    setProdImageUrl(prod.imageUrl);
    setProdDescriptionAr(prod.descriptionAr);
    setProdDescriptionEn(prod.descriptionEn || '');
    setProdWarrantyMonths(prod.warrantyMonths ?? 12);
    setProdWarrantyTermsAr(prod.warrantyTermsAr || '');
    setProdDimensions(prod.dimensions || '');
    setProdCapacity(prod.capacity || '');
    setProdEnergyRating(prod.energyRating || 'A');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overview?.vendor) return;
    if (!prodImageUrl.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى رفع أو تحديد صورة للمنتج أولاً.' : 'Please upload or select a product image first.');
      return;
    }
    setProdSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        nameAr: prodNameAr.trim(),
        nameEn: prodNameEn.trim() || undefined,
        category: prodCategory.trim(),
        categoryAr: prodCategoryAr.trim() || undefined,
        categoryEn: prodCategoryEn.trim() || undefined,
        trousseauType: prodTrousseauType,
        brand: prodBrand.trim(),
        model: prodModel.trim() || undefined,
        price: Number(prodPrice),
        originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
        stock: Number(prodStock),
        imageUrl: prodImageUrl.trim(),
        descriptionAr: prodDescriptionAr.trim(),
        descriptionEn: prodDescriptionEn.trim() || undefined,
        warrantyMonths: Number(prodWarrantyMonths),
        warrantyTermsAr: prodWarrantyTermsAr.trim() || undefined,
        dimensions: prodDimensions.trim() || undefined,
        capacity: prodCapacity.trim() || undefined,
        energyRating: prodEnergyRating.trim() || undefined,
      };

      if (editingProductId) {
        const res = await apiRequest<{ product: Product; overview: VendorPortalOverviewPayload }>(
          `/vendor-portal/products/${encodeURIComponent(editingProductId)}${activeVendorIdQuery}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          },
        );
        setOverview(res.overview);
        showToast(language === 'ar' ? 'تم تحديث بيانات المنتج بنجاح.' : 'Product updated successfully.');
      } else {
        const res = await apiRequest<{ product: Product; overview: VendorPortalOverviewPayload }>(
          `/vendor-portal/products${activeVendorIdQuery}`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
        );
        setOverview(res.overview);
        showToast(language === 'ar' ? 'تمت إضافة المنتج الجديد إلى المعرض.' : 'Product added to showroom.');
      }

      if (refreshProducts) {
        await refreshProducts();
      }
      setShowProductModal(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save product');
    } finally {
      setProdSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!overview?.vendor) return;
    setProdDeletingId(productId);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ success: boolean; overview: VendorPortalOverviewPayload }>(
        `/vendor-portal/products/${encodeURIComponent(productId)}${activeVendorIdQuery}`,
        { method: 'DELETE' },
      );
      setOverview(res.overview);
      if (refreshProducts) {
        await refreshProducts();
      }
      showToast(language === 'ar' ? 'تم حذف المنتج من المعرض.' : 'Product removed from showroom.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to delete product');
    } finally {
      setProdDeletingId(null);
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
                  key: 'products' as const,
                  ar: `منتجات المعرض (${overview.products?.length ?? 0})`,
                  en: `Showroom Products (${overview.products?.length ?? 0})`,
                  icon: <Package className="w-4 h-4" />,
                },
                {
                  key: 'billing' as const,
                  ar: 'الباقات التجارية والفواتير',
                  en: 'Commercial Plans & Billing',
                  icon: <CreditCard className="w-4 h-4" />,
                },
                {
                  key: 'rfqs' as const,
                  ar: `طلبات التسعير (${crmOverview?.rfqs.length ?? 0})`,
                  en: `Invited RFQs (${crmOverview?.rfqs.length ?? 0})`,
                  icon: <FileText className="w-4 h-4" />,
                },
                {
                  key: 'appointments' as const,
                  ar: `المواعيد المحجوزة (${crmOverview?.appointments.length ?? 0})`,
                  en: `Slot Bookings (${crmOverview?.appointments.length ?? 0})`,
                  icon: <Calendar className="w-4 h-4" />,
                },
                {
                  key: 'crm' as const,
                  ar: `نظام CRM (${crmOverview?.leads.length ?? 0})`,
                  en: `8-Stage CRM (${crmOverview?.leads.length ?? 0})`,
                  icon: <Briefcase className="w-4 h-4" />,
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

            {/* TAB: Showroom Physical Products */}
            {portalTab === 'products' && (
              <div className="space-y-6">
                {/* Header & Overview Banner */}
                <div className="bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 rounded-3xl p-6 border border-rose-100 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-[#2A1D20] flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#D91B3E]" />
                        <span>{language === 'ar' ? 'كتالوج منتجات وتجهيزات المعرض' : 'Showroom Physical Products Catalog'}</span>
                      </h2>
                      <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                        {language === 'ar'
                          ? 'يمكنك هنا إضافة وإدارة الأجهزة والفرش والمنتجات المادية المعروضة في متجرك بأسعارها وصورها وضمانها الرسمي المعتمد لتظهر في متجر المنصة وملف معرضك التعريفي.'
                          : 'Manage physical appliances, furniture, and products displayed in your showroom with authentic distributor pricing, photos, and warranties.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      data-testid="portal-add-product-btn"
                      onClick={openAddProductModal}
                      className="px-5 py-3 rounded-2xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'إضافة منتج جديد للمعرض' : 'Add New Product'}</span>
                    </button>
                  </div>

                  {/* KPI Gauges for Products */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 text-xs">
                    <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                      <span className="text-[11px] text-gray-500 block">
                        {language === 'ar' ? 'إجمالي المنتجات المعروضة' : 'Total Listed Products'}
                      </span>
                      <strong data-testid="portal-kpi-total-products" className="text-lg font-black text-[#2A1D20]">
                        {overview.products?.length ?? 0} {language === 'ar' ? 'منتج' : 'items'}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                      <span className="text-[11px] text-gray-500 block">
                        {language === 'ar' ? 'متوفر بالمخزن' : 'In Stock'}
                      </span>
                      <strong className="text-lg font-black text-emerald-700">
                        {(overview.products || []).filter((p) => (p.stock ?? 0) > 0).length} {language === 'ar' ? 'منتج' : 'items'}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                      <span className="text-[11px] text-gray-500 block">
                        {language === 'ar' ? 'قارب على النفاد / نفذ' : 'Low / Out of Stock'}
                      </span>
                      <strong className="text-lg font-black text-amber-700">
                        {(overview.products || []).filter((p) => (p.stock ?? 0) <= 2).length} {language === 'ar' ? 'منتج' : 'items'}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                      <span className="text-[11px] text-gray-500 block">
                        {language === 'ar' ? 'القيمة التقديرية للمخزون' : 'Est. Inventory Value'}
                      </span>
                      <strong className="text-lg font-black text-[#D91B3E]">
                        {(overview.products || [])
                          .reduce((sum, p) => sum + p.price * (p.stock ?? 1), 0)
                          .toLocaleString()}{' '}
                        {language === 'ar' ? 'ج.م' : 'EGP'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                    <div className="relative flex-1 min-w-[180px]">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3" />
                      <input
                        type="text"
                        value={prodSearchFilter}
                        onChange={(e) => setProdSearchFilter(e.target.value)}
                        placeholder={language === 'ar' ? 'بحث باسم المنتج أو الماركة أو الموديل...' : 'Search by name, brand or model...'}
                        className="w-full ps-8 pe-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                      />
                    </div>

                    <select
                      value={prodCategoryFilter}
                      onChange={(e) => setProdCategoryFilter(e.target.value)}
                      className="py-2 px-3 rounded-xl border border-gray-200 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#D91B3E]"
                    >
                      <option value="all">{language === 'ar' ? 'جميع الأقسام' : 'All Categories'}</option>
                      {PRODUCT_CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {language === 'ar' ? cat.ar : cat.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-xs text-gray-500 font-medium">
                    {language === 'ar' ? 'النتائج:' : 'Showing:'}{' '}
                    <strong className="text-[#2A1D20]">
                      {(overview.products || []).filter((p) => {
                        const q = prodSearchFilter.trim().toLowerCase();
                        const matchQ =
                          !q ||
                          p.nameAr.toLowerCase().includes(q) ||
                          (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
                          p.brand.toLowerCase().includes(q) ||
                          (p.model && p.model.toLowerCase().includes(q));
                        const matchC = prodCategoryFilter === 'all' || p.category === prodCategoryFilter;
                        return matchQ && matchC;
                      }).length}
                    </strong>
                  </span>
                </div>

                {/* Products Grid */}
                {(() => {
                  const filtered = (overview.products || []).filter((p) => {
                    const q = prodSearchFilter.trim().toLowerCase();
                    const matchQ =
                      !q ||
                      p.nameAr.toLowerCase().includes(q) ||
                      (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
                      p.brand.toLowerCase().includes(q) ||
                      (p.model && p.model.toLowerCase().includes(q));
                    const matchC = prodCategoryFilter === 'all' || p.category === prodCategoryFilter;
                    return matchQ && matchC;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white rounded-3xl p-10 border border-dashed border-gray-200 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#D91B3E] flex items-center justify-center mx-auto">
                          <Package className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-[#2A1D20]">
                            {language === 'ar' ? 'لا توجد منتجات مسجلة حتى الآن' : 'No products found'}
                          </h3>
                          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                            {language === 'ar'
                              ? 'ابدأ بإضافة أول منتج لمعرضك ليظهر لآلاف المقبلين على الزواج في كتالوج وموسوعة الأجهزة والفرش.'
                              : 'Add your first showroom product to present it to thousands of engaged couples browsing GAWAZ INN.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openAddProductModal}
                          className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{language === 'ar' ? 'إضافة أول منتج للمعرض' : 'Add First Product'}</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filtered.map((prod) => {
                        const stock = prod.stock ?? 5;
                        const isLowStock = stock > 0 && stock <= 2;
                        const isOutOfStock = stock === 0;

                        return (
                          <div
                            key={prod.id}
                            data-testid={`vendor-product-card-${prod.id}`}
                            className="bg-white rounded-3xl p-4 sm:p-5 border border-rose-100 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
                          >
                            <div className="space-y-3">
                              {/* Product Thumbnail & Overlay Badges */}
                              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                <SmartImage
                                  src={prod.imageUrl}
                                  alt={prod.nameAr}
                                  fallbackTitle={prod.nameAr}
                                  className="w-full h-full object-cover"
                                />

                                {/* Stock Status Badge */}
                                <div className="absolute top-2.5 start-2.5">
                                  {isOutOfStock ? (
                                    <span className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                                      {language === 'ar' ? 'نفذ من المخزن' : 'Out of stock'}
                                    </span>
                                  ) : isLowStock ? (
                                    <span className="px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                                      {language === 'ar' ? `متبقي ${stock} فقط` : `Only ${stock} left`}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                                      {language === 'ar' ? `متوفر (${stock} قطع)` : `In Stock (${stock})`}
                                    </span>
                                  )}
                                </div>

                                {/* Trousseau Side Badge */}
                                <div className="absolute top-2.5 end-2.5">
                                  <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-[#2A1D20] text-[10px] font-bold border border-gray-200 shadow-xs">
                                    {prod.trousseauType === 'bride'
                                      ? language === 'ar' ? 'جهاز العروسة' : 'Bride Trousseau'
                                      : prod.trousseauType === 'groom'
                                      ? language === 'ar' ? 'جهاز العريس' : 'Groom Trousseau'
                                      : prod.trousseauType === 'finishing'
                                      ? language === 'ar' ? 'تشطيب' : 'Finishing'
                                      : language === 'ar' ? 'مشترك' : 'Shared'}
                                  </span>
                                </div>
                              </div>

                              {/* Category & Brand info */}
                              <div className="flex items-center justify-between text-[11px] text-gray-500">
                                <span className="font-bold text-[#D91B3E]">
                                  {prod.brand}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                                  {language === 'ar' ? prod.categoryAr || prod.category : prod.categoryEn || prod.category}
                                </span>
                              </div>

                              {/* Title & Model */}
                              <div>
                                <h3 className="text-sm font-black text-[#2A1D20] line-clamp-2 leading-snug">
                                  {language === 'ar' ? prod.nameAr : prod.nameEn || prod.nameAr}
                                </h3>
                                {prod.model && (
                                  <span className="text-[11px] text-gray-400 font-mono mt-0.5 block truncate">
                                    {language === 'ar' ? `موديل: ${prod.model}` : `Model: ${prod.model}`}
                                  </span>
                                )}
                              </div>

                              {/* Pricing & Discount */}
                              <div className="pt-1">
                                {prod.originalPrice && prod.originalPrice > prod.price && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 line-through">
                                      {prod.originalPrice.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                                    </span>
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-[#D91B3E]">
                                      -{Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%
                                    </span>
                                  </div>
                                )}
                                <div className="text-lg font-black text-[#D91B3E]">
                                  {prod.price.toLocaleString()}{' '}
                                  <span className="text-xs font-bold">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                </div>
                              </div>

                              {/* Warranty & Specs Pill */}
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-600 pt-1">
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>
                                    {(prod.warrantyMonths ?? 0) >= 12
                                      ? language === 'ar'
                                        ? `ضمان ${Math.floor((prod.warrantyMonths ?? 0) / 12)} سنة`
                                        : `${Math.floor((prod.warrantyMonths ?? 0) / 12)} Yr Warranty`
                                      : `${prod.warrantyMonths ?? 12} mo`}
                                  </span>
                                </span>
                                {prod.capacity && (
                                  <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700">
                                    {prod.capacity}
                                  </span>
                                )}
                                {prod.energyRating && (
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black">
                                    {prod.energyRating}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                              <Link
                                to={`/products/${prod.slug || prod.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-xl text-gray-600 hover:text-[#D91B3E] hover:bg-rose-50 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{language === 'ar' ? 'معاينة' : 'View'}</span>
                              </Link>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditProductModal(prod)}
                                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:border-[#D91B3E] hover:text-[#D91B3E] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={prodDeletingId === prod.id}
                                  onClick={() => {
                                    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا المنتج من المعرض؟' : 'Are you sure you want to delete this product?')) {
                                      handleDeleteProduct(prod.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Add / Edit Product Modal */}
                {showProductModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-rose-100 p-6 sm:p-8 space-y-6">
                      {/* Modal Header */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#D91B3E] flex items-center justify-center font-bold">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-[#2A1D20]">
                              {editingProductId
                                ? language === 'ar' ? 'تعديل بيانات المنتج' : 'Edit Product'
                                : language === 'ar' ? 'إضافة منتج جديد للمعرض' : 'Add New Product to Showroom'}
                            </h3>
                            <span className="text-xs text-gray-400 block">
                              {language === 'ar' ? 'سيتم ربط المنتج تلقائياً بحساب معرضك المعتمد' : 'Directly linked to your vendor business listing'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowProductModal(false)}
                          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Form */}
                      <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                        {/* Row 1: Names */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'اسم المنتج بالعربية *' : 'Product Name (Arabic) *'}
                            </label>
                            <input
                              type="text"
                              required
                              minLength={2}
                              value={prodNameAr}
                              onChange={(e) => setProdNameAr(e.target.value)}
                              placeholder={language === 'ar' ? 'مثال: ثلاجة شارب 450 لتر نوفروست إنفرتر' : 'e.g. Sharp 450L Inverter Refrigerator'}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'اسم المنتج بالإنجليزية (اختياري)' : 'Product Name (English)'}
                            </label>
                            <input
                              type="text"
                              value={prodNameEn}
                              onChange={(e) => setProdNameEn(e.target.value)}
                              placeholder="e.g. Sharp 450L No-Frost Inverter Refrigerator"
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>
                        </div>

                        {/* Row 2: Category & Trousseau Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'قسم المنتج *' : 'Product Category *'}
                            </label>
                            <select
                              value={prodCategory}
                              onChange={(e) => {
                                const selectedCat = PRODUCT_CATEGORY_OPTIONS.find((c) => c.slug === e.target.value);
                                setProdCategory(e.target.value);
                                if (selectedCat) {
                                  setProdCategoryAr(selectedCat.ar);
                                  setProdCategoryEn(selectedCat.en);
                                }
                              }}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#D91B3E]"
                            >
                              {PRODUCT_CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat.slug} value={cat.slug}>
                                  {language === 'ar' ? cat.ar : cat.en}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'تصنيف الجهاز في التجهيز *' : 'Trousseau Allocation *'}
                            </label>
                            <select
                              value={prodTrousseauType}
                              onChange={(e) => setProdTrousseauType(e.target.value as Product['trousseauType'])}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#D91B3E]"
                            >
                              <option value="shared">{language === 'ar' ? 'مشترك / تجهيز عام' : 'Shared Equipment'}</option>
                              <option value="bride">{language === 'ar' ? 'جهاز العروسة' : 'Bride Trousseau'}</option>
                              <option value="groom">{language === 'ar' ? 'جهاز العريس' : 'Groom Trousseau'}</option>
                              <option value="finishing">{language === 'ar' ? 'تشطيب شقة الزوجية' : 'Apartment Finishing'}</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 3: Brand & Model */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'الماركة / العلامة التجارية *' : 'Brand Name *'}
                            </label>
                            <input
                              type="text"
                              required
                              value={prodBrand}
                              onChange={(e) => setProdBrand(e.target.value)}
                              placeholder={language === 'ar' ? 'مثال: Sharp, LG, Beko, هابيتات' : 'e.g. Sharp, LG, Beko, Habitat'}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'رقم أو كود الموديل' : 'Model / SKU Code'}
                            </label>
                            <input
                              type="text"
                              value={prodModel}
                              onChange={(e) => setProdModel(e.target.value)}
                              placeholder="e.g. SJ-GV58G-BK"
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>
                        </div>

                        {/* Row 4: Pricing & Stock */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'السعر الحالي (ج.م) *' : 'Selling Price (EGP) *'}
                            </label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={prodPrice}
                              onChange={(e) => setProdPrice(Number(e.target.value))}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#D91B3E] focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'السعر قبل الخصم (اختياري)' : 'Original Price (EGP)'}
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={prodOriginalPrice}
                              onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                              placeholder={language === 'ar' ? 'لإظهار شارة الخصم' : 'To show discount %'}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'الكمية بالمخزن *' : 'Stock Quantity *'}
                            </label>
                            <input
                              type="number"
                              required
                              min={0}
                              value={prodStock}
                              onChange={(e) => setProdStock(Number(e.target.value))}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>
                        </div>

                        {/* Row 5: Product Image Direct Upload or URL */}
                        <div>
                          <ImageUploader
                            id="vendor-product-image-uploader"
                            value={prodImageUrl}
                            onChange={setProdImageUrl}
                            label={language === 'ar' ? 'صورة المنتج' : 'Product Image'}
                            required
                            language={language}
                            presets={SAMPLE_PRODUCT_PHOTOS}
                            aspectRatioHint={
                              language === 'ar'
                                ? 'يدعم الرفع المباشر من الهاتف أو الكمبيوتر (يتم الضغط الذكي تلقائياً)'
                                : 'Supports direct upload from mobile or PC (auto-compressed)'
                            }
                          />
                        </div>

                        {/* Row 6: Warranty & Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'مدة الضمان (بالأشهر) *' : 'Warranty (Months) *'}
                            </label>
                            <input
                              type="number"
                              required
                              min={0}
                              value={prodWarrantyMonths}
                              onChange={(e) => setProdWarrantyMonths(Number(e.target.value))}
                              placeholder="24"
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'السعة أو الحجم' : 'Capacity / Size'}
                            </label>
                            <input
                              type="text"
                              value={prodCapacity}
                              onChange={(e) => setProdCapacity(e.target.value)}
                              placeholder={language === 'ar' ? 'مثال: 450 لتر / 65 بوصة' : 'e.g. 450L / 65 Inch'}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">
                              {language === 'ar' ? 'كفاءة الطاقة' : 'Energy Rating'}
                            </label>
                            <input
                              type="text"
                              value={prodEnergyRating}
                              onChange={(e) => setProdEnergyRating(e.target.value)}
                              placeholder="A, A+, A++"
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                            />
                          </div>
                        </div>

                        {/* Warranty Terms */}
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">
                            {language === 'ar' ? 'شروط وتفاصيل الضمان' : 'Warranty Terms & Agent Details'}
                          </label>
                          <input
                            type="text"
                            value={prodWarrantyTermsAr}
                            onChange={(e) => setProdWarrantyTermsAr(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: ضمان الوكيل المعتمد في مصر لمدة عامين شامل قطع الغيار والصيانة المنزلية' : 'e.g. 2 years official warranty including spare parts'}
                            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">
                            {language === 'ar' ? 'وصف المنتج ومميزاته بالعربية *' : 'Product Description (Arabic) *'}
                          </label>
                          <textarea
                            required
                            rows={3}
                            minLength={2}
                            value={prodDescriptionAr}
                            onChange={(e) => setProdDescriptionAr(e.target.value)}
                            placeholder={language === 'ar' ? 'اكتب وصفاً دقيقاً للمنتج ومميزاته ومواده ولماذا يناسب المقبلين على الزواج...' : 'Detailed description and features...'}
                            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
                          />
                        </div>

                        {/* Modal Actions */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setShowProductModal(false)}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer"
                          >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>

                          <button
                            type="submit"
                            disabled={prodSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-red-gradient text-white font-bold shadow-md hover:opacity-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            <span>
                              {prodSubmitting
                                ? language === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                                : editingProductId
                                ? language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'
                                : language === 'ar' ? 'نشر المنتج بالمعرض' : 'Publish Product'}
                            </span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
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

            {/* TAB 5: Invited Multi-Vendor RFQs (Confidential Vendor Scope) */}
            {portalTab === 'rfqs' && (
              <div className="space-y-6" data-testid="portal-rfqs-panel">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 text-xs text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#D91B3E] shrink-0" />
                  <span>
                    {language === 'ar'
                      ? 'سرية المنافسة: تشاهد هنا فقط طلبات التسعير المدعو لها نشاطك التجاري وعرض سعرك ومحادتك الخاصة مع العميل، ولا يمكنك الاطلاع على عروض أي منافس.'
                      : 'Competitive Confidentiality: You only see RFQs invited to this business listing, your own quotation, and your private customer Q&A thread.'}
                  </span>
                </div>

                {(crmOverview?.rfqs || []).length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-rose-100 text-center text-xs font-bold text-gray-600">
                    {language === 'ar'
                      ? 'لا توجد طلبات تسعير مدعو لها هذا الملف حالياً.'
                      : 'No RFQ invitations received for this vendor listing yet.'}
                  </div>
                ) : (
                  (crmOverview?.rfqs || []).map((rfq) => {
                    const myQuote = rfq.quotes?.[0];
                    const draft = quoteDrafts[rfq.id] || {
                      quotedAmountEgp: myQuote?.quotedAmountEgp || Math.max(rfq.budgetMin, 50000),
                      depositAmountEgp: myQuote?.depositAmountEgp || 15000,
                      estimatedDuration: myQuote?.estimatedDuration || '30 يوم عمل',
                      warrantyMonths: myQuote?.warrantyMonths ?? 24,
                      scopeSummary:
                        myQuote?.scopeSummary ||
                        `عرض سعر شامل التنفيذ والضمان لطلب "${rfq.title}"`,
                      validUntil: myQuote?.validUntil || '2026-12-31',
                    };
                    const setDraftField = <K extends keyof typeof draft>(
                      key: K,
                      val: (typeof draft)[K],
                    ) => {
                      setQuoteDrafts((prev) => ({
                        ...prev,
                        [rfq.id]: { ...draft, [key]: val },
                      }));
                    };

                    return (
                      <div
                        key={rfq.id}
                        data-testid={`portal-rfq-card-${rfq.id}`}
                        className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#FDE8ED] text-[#B31331]">
                                {rfq.status}
                              </span>
                              <span className="text-gray-500">
                                {language === 'ar' ? 'العميل:' : 'Client:'} {rfq.customerName || rfq.userId}
                              </span>
                              <span className="text-gray-500">• {rfq.governorateSlug}</span>
                            </div>
                            <h3 className="text-base font-black text-[#2A1D20]">{rfq.title}</h3>
                            <p className="text-xs text-gray-700 leading-relaxed">{rfq.scopeDetails}</p>
                          </div>
                          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-rose-100 text-xs shrink-0">
                            <span className="text-[10px] text-gray-500 block">
                              {language === 'ar' ? 'الميزانية المقدرة من العميل' : 'Customer Budget'}
                            </span>
                            <strong className="font-black text-[#D91B3E]">
                              {rfq.budgetMin.toLocaleString()} – {rfq.budgetMax.toLocaleString()}{' '}
                              {language === 'ar' ? 'ج.م' : 'EGP'}
                            </strong>
                          </div>
                        </div>

                        {myQuote && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2">
                            <span className="font-black text-emerald-900">
                              {language === 'ar' ? 'عرضك المسجل حالياً:' : 'Your Submitted Offer:'}{' '}
                              {myQuote.quotedAmountEgp.toLocaleString()}{' '}
                              {language === 'ar' ? 'ج.م' : 'EGP'} ({myQuote.status})
                            </span>
                            <span className="text-emerald-800 font-semibold">
                              {myQuote.estimatedDuration} • {myQuote.warrantyMonths}{' '}
                              {language === 'ar' ? 'شهر ضمان' : 'm warranty'}
                            </span>
                          </div>
                        )}

                        {rfq.status !== 'accepted' && rfq.status !== 'closed' && (
                          <form
                            onSubmit={(e) => handleSubmitRfqQuote(rfq, e)}
                            className="bg-[#FAF7F2] rounded-2xl p-4 border border-rose-100 space-y-3"
                          >
                            <h4 className="text-xs font-black text-[#2A1D20]">
                              {myQuote
                                ? language === 'ar'
                                  ? 'تحديث عرض السعر المقدم'
                                  : 'Update Your Confidential Quotation'
                                : language === 'ar'
                                  ? 'تقديم عرض سعر جديد للعميل'
                                  : 'Submit Confidential Quotation'}
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-700">
                                  {language === 'ar' ? 'إجمالي السعر (ج.م):' : 'Total Quote (EGP):'}
                                </label>
                                <input
                                  type="number"
                                  required
                                  min={100}
                                  value={draft.quotedAmountEgp}
                                  onChange={(e) =>
                                    setDraftField('quotedAmountEgp', Number(e.target.value))
                                  }
                                  data-testid={`portal-rfq-amount-${rfq.id}`}
                                  className="w-full p-2 rounded-xl bg-white border border-gray-200 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-700">
                                  {language === 'ar' ? 'دفعة التعاقد:' : 'Deposit (EGP):'}
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={draft.depositAmountEgp}
                                  onChange={(e) =>
                                    setDraftField('depositAmountEgp', Number(e.target.value))
                                  }
                                  data-testid={`portal-rfq-deposit-${rfq.id}`}
                                  className="w-full p-2 rounded-xl bg-white border border-gray-200 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-700">
                                  {language === 'ar' ? 'مدة التنفيذ:' : 'Duration:'}
                                </label>
                                <input
                                  type="text"
                                  required
                                  minLength={2}
                                  value={draft.estimatedDuration}
                                  onChange={(e) =>
                                    setDraftField('estimatedDuration', e.target.value)
                                  }
                                  data-testid={`portal-rfq-duration-${rfq.id}`}
                                  className="w-full p-2 rounded-xl bg-white border border-gray-200 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-700">
                                  {language === 'ar' ? 'الضمان (شهور):' : 'Warranty (mo):'}
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={240}
                                  value={draft.warrantyMonths}
                                  onChange={(e) =>
                                    setDraftField('warrantyMonths', Number(e.target.value))
                                  }
                                  className="w-full p-2 rounded-xl bg-white border border-gray-200 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-700">
                                  {language === 'ar' ? 'صالح حتى:' : 'Valid Until:'}
                                </label>
                                <input
                                  type="date"
                                  required
                                  value={draft.validUntil}
                                  onChange={(e) => setDraftField('validUntil', e.target.value)}
                                  className="w-full p-2 rounded-xl bg-white border border-gray-200 text-xs"
                                />
                              </div>
                            </div>

                            <textarea
                              rows={2}
                              required
                              minLength={10}
                              value={draft.scopeSummary}
                              onChange={(e) => setDraftField('scopeSummary', e.target.value)}
                              data-testid={`portal-rfq-summary-${rfq.id}`}
                              placeholder={
                                language === 'ar'
                                  ? 'ملخص المواصفات والخامات وشروط الضمان...'
                                  : 'Scope of work, brand guarantees, and milestone terms...'
                              }
                              className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-xs"
                            />

                            <button
                              type="submit"
                              disabled={stage8BusyId === `quote-${rfq.id}`}
                              data-testid={`portal-rfq-submit-btn-${rfq.id}`}
                              className="px-5 py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>
                                {myQuote
                                  ? language === 'ar'
                                    ? 'تحديث عرض السعر'
                                    : 'Update Quotation'
                                  : language === 'ar'
                                    ? 'إرسال عرض السعر للعميل'
                                    : 'Submit Quotation'}
                              </span>
                            </button>
                          </form>
                        )}

                        {/* Scoped Q&A Reply Thread */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <span className="text-xs font-black text-[#2A1D20] flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-[#D91B3E]" />
                            <span>
                              {language === 'ar'
                                ? `الاستفسارات المباشرة مع العميل (${rfq.messages?.length ?? 0})`
                                : `Private Customer Q&A (${rfq.messages?.length ?? 0})`}
                            </span>
                          </span>
                          {(rfq.messages || []).map((m) => (
                            <div
                              key={m.id}
                              className="p-2.5 rounded-xl bg-[#FAF7F2] border border-rose-100 text-xs"
                            >
                              <strong className="text-[#2A1D20]">{m.senderName}:</strong>{' '}
                              <span className="text-gray-700">{m.body}</span>
                            </div>
                          ))}
                          <form
                            onSubmit={(e) => handleSendRfqVendorReply(rfq.id, e)}
                            className="flex flex-col sm:flex-row gap-2"
                          >
                            <input
                              type="text"
                              minLength={2}
                              value={rfqReplyDrafts[rfq.id] || ''}
                              onChange={(e) =>
                                setRfqReplyDrafts((prev) => ({ ...prev, [rfq.id]: e.target.value }))
                              }
                              data-testid={`portal-rfq-msg-input-${rfq.id}`}
                              placeholder={
                                language === 'ar'
                                  ? 'أجب عن استفسار العميل حول المواصفات أو المعاينة...'
                                  : 'Reply privately to customer inquiry...'
                              }
                              className="flex-1 min-w-0 p-2 rounded-xl border border-gray-200 text-xs"
                            />
                            <button
                              type="submit"
                              disabled={stage8BusyId === `reply-${rfq.id}`}
                              data-testid={`portal-rfq-msg-send-${rfq.id}`}
                              className="px-4 py-2 rounded-xl bg-[#D91B3E] text-white text-xs font-bold cursor-pointer"
                            >
                              {language === 'ar' ? 'رد' : 'Reply'}
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 6: Vendor Slot Appointments Confirmation Desk */}
            {portalTab === 'appointments' && (
              <div className="space-y-4" data-testid="portal-appointments-panel">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 text-xs text-gray-700">
                  {language === 'ar'
                    ? 'إدارة حجوزات المعاينة وزيارة المعرض: تأكيد الموعد أو اقتراح ميعاد بديل يرسل إشعاراً فورياً للعميل ويسجل النشاط في CRM.'
                    : 'Manage customer slot bookings: Confirming or rescheduling notifies the customer immediately and logs a timeline entry in Vendor CRM.'}
                </div>

                {(crmOverview?.appointments || []).length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-rose-100 text-center text-xs font-bold text-gray-600">
                    {language === 'ar'
                      ? 'لا توجد مواعيد محجوزة لهذا الشريك بعد.'
                      : 'No customer appointment requests yet.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(crmOverview?.appointments || []).map((apt) => (
                      <div
                        key={apt.id}
                        data-testid={`portal-apt-${apt.id}`}
                        className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black ${
                              apt.status === 'confirmed' || apt.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : apt.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : 'bg-amber-50 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {apt.status}
                          </span>
                          <span className="text-[11px] font-bold text-gray-500">
                            {apt.appointmentType}
                          </span>
                        </div>

                        <div className="text-xs space-y-1">
                          <strong className="text-sm font-black text-[#2A1D20] block">
                            {apt.customerName || apt.userId} —{' '}
                            <span dir="ltr">{apt.customerPhone}</span>
                          </strong>
                          <p className="font-bold text-[#D91B3E]">
                            📅 <span dir="ltr">{apt.slotDate}</span> • ⏰{' '}
                            <span dir="ltr">{apt.slotTime}</span> ({apt.durationMinutes} min)
                          </p>
                          {apt.customerNotes && (
                            <p className="text-gray-600 bg-[#FAF7F2] p-2.5 rounded-xl">
                              {apt.customerNotes}
                            </p>
                          )}
                        </div>

                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <input
                              type="text"
                              value={aptNoteDrafts[apt.id] ?? apt.vendorResponseNote ?? ''}
                              onChange={(e) =>
                                setAptNoteDrafts((prev) => ({ ...prev, [apt.id]: e.target.value }))
                              }
                              data-testid={`portal-apt-note-${apt.id}`}
                              placeholder={
                                language === 'ar'
                                  ? 'ملاحظة التأكيد للعميل (مثال: اسم المهندس أو العنوان)...'
                                  : 'Confirmation or reschedule note for customer...'
                              }
                              className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                value={aptDateDrafts[apt.id] ?? apt.slotDate}
                                onChange={(e) =>
                                  setAptDateDrafts((prev) => ({
                                    ...prev,
                                    [apt.id]: e.target.value,
                                  }))
                                }
                                className="p-2 rounded-xl border border-gray-200 text-xs"
                              />
                              <input
                                type="time"
                                value={aptTimeDrafts[apt.id] ?? apt.slotTime}
                                onChange={(e) =>
                                  setAptTimeDrafts((prev) => ({
                                    ...prev,
                                    [apt.id]: e.target.value,
                                  }))
                                }
                                className="p-2 rounded-xl border border-gray-200 text-xs"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {apt.status !== 'confirmed' && (
                                <button
                                  type="button"
                                  disabled={stage8BusyId === `apt-${apt.id}`}
                                  data-testid={`portal-apt-confirm-${apt.id}`}
                                  onClick={() => handleUpdateVendorApt(apt.id, 'confirmed')}
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                                >
                                  {language === 'ar' ? 'تأكيد الموعد' : 'Confirm Slot'}
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={stage8BusyId === `apt-${apt.id}`}
                                data-testid={`portal-apt-reschedule-${apt.id}`}
                                onClick={() => handleUpdateVendorApt(apt.id, 'rescheduled')}
                                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                              >
                                {language === 'ar' ? 'تعديل الميعاد' : 'Reschedule'}
                              </button>
                              <button
                                type="button"
                                disabled={stage8BusyId === `apt-${apt.id}`}
                                data-testid={`portal-apt-complete-${apt.id}`}
                                onClick={() => handleUpdateVendorApt(apt.id, 'completed')}
                                className="px-3.5 py-2 rounded-xl bg-[#D91B3E] text-white text-xs font-bold cursor-pointer"
                              >
                                {language === 'ar' ? 'إتمام الزيارة' : 'Mark Completed'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: 8-Stage Vendor CRM Pipeline */}
            {portalTab === 'crm' && crmOverview && (
              <div className="space-y-6" data-testid="portal-crm-panel">
                {/* Pipeline Metrics Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
                    <span className="text-[11px] text-gray-500 block">
                      {language === 'ar' ? 'إجمالي العملاء المحتملين' : 'Total CRM Leads'}
                    </span>
                    <strong data-testid="crm-total-leads" className="text-xl font-black text-[#2A1D20]">
                      {crmOverview.leads.length}
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
                    <span className="text-[11px] text-gray-500 block">
                      {language === 'ar' ? 'قيمة خط المبيعات النشط' : 'Active Pipeline Value'}
                    </span>
                    <strong className="text-xl font-black text-[#D91B3E]">
                      {crmOverview.pipelineValueEgp.toLocaleString()}{' '}
                      {language === 'ar' ? 'ج.م' : 'EGP'}
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm">
                    <span className="text-[11px] text-gray-500 block">
                      {language === 'ar' ? 'قيمة العقود المقبولة/المنفذة' : 'Won / Accepted Value'}
                    </span>
                    <strong className="text-xl font-black text-emerald-700">
                      {crmOverview.wonValueEgp.toLocaleString()}{' '}
                      {language === 'ar' ? 'ج.م' : 'EGP'}
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
                    <span className="text-[11px] text-gray-500 block">
                      {language === 'ar' ? 'ملفات مقبولة / قيد التنفيذ' : 'Accepted & In Progress'}
                    </span>
                    <strong className="text-xl font-black text-[#2A1D20]">
                      {(crmOverview.stageCounts.accepted ?? 0) +
                        (crmOverview.stageCounts.in_progress ?? 0) +
                        (crmOverview.stageCounts.completed ?? 0)}
                    </strong>
                  </div>
                </div>

                {/* Add Manual Lead Form */}
                <form
                  onSubmit={handleCreateManualLead}
                  data-testid="crm-add-lead-form"
                  className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-3"
                >
                  <h3 className="text-sm font-black text-[#2A1D20]">
                    {language === 'ar'
                      ? 'إضافة عميل محتمل جديد يدوياً لخط المتابعة'
                      : 'Add Manual CRM Lead'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      data-testid="crm-new-name"
                      placeholder={language === 'ar' ? 'اسم العميل' : 'Customer Name'}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="tel"
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      data-testid="crm-new-phone"
                      placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={newLeadTitle}
                      onChange={(e) => setNewLeadTitle(e.target.value)}
                      data-testid="crm-new-title"
                      placeholder={language === 'ar' ? 'عنوان المشروع / الطلب' : 'Project Title'}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                    <select
                      value={newLeadStage}
                      onChange={(e) => setNewLeadStage(e.target.value as VendorLeadStage)}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                    >
                      {CRM_STAGE_META.map((st) => (
                        <option key={st.key} value={st.key}>
                          {language === 'ar' ? st.ar : st.en}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={newLeadValue}
                      onChange={(e) => setNewLeadValue(Number(e.target.value))}
                      data-testid="crm-new-value"
                      placeholder="EGP"
                      className="p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={stage8BusyId === 'new-lead'}
                    data-testid="crm-new-submit"
                    className="px-5 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إضافة للـ CRM' : 'Add Lead'}</span>
                  </button>
                </form>

                {/* 8-Stage Filter Strip */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCrmStageFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      crmStageFilter === 'all'
                        ? 'bg-[#2A1D20] text-white'
                        : 'bg-white border border-gray-200 text-gray-700'
                    }`}
                  >
                    {language === 'ar' ? 'الكل' : 'All'} ({crmOverview.leads.length})
                  </button>
                  {CRM_STAGE_META.map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      data-testid={`crm-filter-${st.key}`}
                      onClick={() => setCrmStageFilter(st.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        crmStageFilter === st.key
                          ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      {language === 'ar' ? st.ar : st.en} ({crmOverview.stageCounts[st.key] ?? 0})
                    </button>
                  ))}
                </div>

                {/* CRM Leads Cards */}
                <div className="space-y-4">
                  {crmOverview.leads
                    .filter((l) => crmStageFilter === 'all' || l.stage === crmStageFilter)
                    .map((lead) => {
                      const stMeta =
                        CRM_STAGE_META.find((s) => s.key === lead.stage) || CRM_STAGE_META[0];
                      return (
                        <div
                          key={lead.id}
                          data-testid={`crm-lead-card-${lead.id}`}
                          className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                                <span className={`px-2.5 py-0.5 rounded-full border ${stMeta.cls}`}>
                                  {language === 'ar' ? stMeta.ar : stMeta.en}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-[#FAF7F2] text-gray-600 border border-gray-200">
                                  {lead.leadSource}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-[#2A1D20]">{lead.title}</h4>
                              <p className="text-xs text-gray-600">
                                {lead.customerName}{' '}
                                {lead.customerPhone ? `• ${lead.customerPhone}` : ''}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 min-w-0">
                              <div className="text-end">
                                <span className="text-[10px] text-gray-500 block">
                                  {language === 'ar' ? 'القيمة المتوقعة' : 'Est. Value'}
                                </span>
                                <strong className="text-sm font-black text-[#D91B3E]">
                                  {lead.estimatedValueEgp.toLocaleString()}{' '}
                                  {language === 'ar' ? 'ج.م' : 'EGP'}
                                </strong>
                              </div>
                              <select
                                value={lead.stage}
                                disabled={stage8BusyId === `stage-${lead.id}`}
                                data-testid={`crm-lead-stage-${lead.id}`}
                                onChange={(e) =>
                                  handleChangeLeadStage(lead.id, e.target.value as VendorLeadStage)
                                }
                                className="w-full sm:w-auto max-w-full min-w-0 truncate p-2 rounded-xl bg-[#FAF7F2] border border-gray-200 text-xs font-bold"
                              >
                                {CRM_STAGE_META.map((st) => (
                                  <option key={st.key} value={st.key}>
                                    {language === 'ar' ? st.ar : st.en}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Activities & Add Activity */}
                          <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-rose-100 space-y-2.5">
                            {(lead.activities || []).slice(0, 4).map((act) => (
                              <div key={act.id} className="text-xs text-gray-700 flex items-start gap-2">
                                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold shrink-0">
                                  {act.activityType}
                                </span>
                                <span>{act.note}</span>
                              </div>
                            ))}

                            <form
                              onSubmit={(e) => handleAddLeadActivity(lead.id, e)}
                              className="flex flex-wrap gap-2 pt-1"
                            >
                              <select
                                value={leadActTypes[lead.id] || 'note'}
                                onChange={(e) =>
                                  setLeadActTypes((prev) => ({
                                    ...prev,
                                    [lead.id]: e.target.value as VendorLeadActivityType,
                                  }))
                                }
                                className="p-2 rounded-xl bg-white border border-gray-200 text-xs font-bold"
                              >
                                <option value="note">{language === 'ar' ? 'ملاحظة' : 'Note'}</option>
                                <option value="call">{language === 'ar' ? 'مكالمة' : 'Call'}</option>
                                <option value="appointment">
                                  {language === 'ar' ? 'معاينة' : 'Visit'}
                                </option>
                                <option value="quote_sent">
                                  {language === 'ar' ? 'عرض سعر' : 'Quote Sent'}
                                </option>
                              </select>
                              <input
                                type="text"
                                minLength={2}
                                value={leadActNotes[lead.id] || ''}
                                onChange={(e) =>
                                  setLeadActNotes((prev) => ({
                                    ...prev,
                                    [lead.id]: e.target.value,
                                  }))
                                }
                                data-testid={`crm-lead-activity-input-${lead.id}`}
                                placeholder={
                                  language === 'ar'
                                    ? 'أضف ملاحظة متابعة أو ملخص مكالمة...'
                                    : 'Log follow-up note or call outcome...'
                                }
                                className="flex-1 p-2 rounded-xl bg-white border border-gray-200 text-xs"
                              />
                              <button
                                type="submit"
                                disabled={stage8BusyId === `act-${lead.id}`}
                                data-testid={`crm-lead-activity-btn-${lead.id}`}
                                className="px-3.5 py-2 rounded-xl bg-[#D91B3E] text-white text-xs font-bold cursor-pointer"
                              >
                                {language === 'ar' ? 'تسجيل' : 'Log'}
                              </button>
                            </form>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

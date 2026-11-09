import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Sparkles,
  Heart,
  Users,
  CreditCard,
  HeartHandshake,
  Settings,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Lock,
  Save,
  BookOpen,
  History,
  AlertCircle,
  Store,
  RefreshCw,
  BarChart3,
  BadgeCheck,
  Flag,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import type {
  Product,
  WeddingServiceItem,
  Article,
  VendorListing,
  VendorVerificationStatus,
  SubscriptionPlan,
} from '../../types';
import {
  CMS_EDITOR_ROLES,
  MODERATION_ROLES,
  getRoleLabel,
  hasAnyRole,
} from '../../../shared/rbac';
import { SmartImage } from '../common/SmartImage';
import { ModalFrame } from '../common/ModalFrame';
import {
  CommercialPlanBadge,
  HonestRatingBadge,
  VerificationBadge,
} from '../vendors/VendorBadges';

export const AdminDashboardView: React.FC = () => {
  const {
    language,
    t,
    currentUser,
    isStaff,
    isAdmin,
    setAuthModalOpen,
    finishingInquiries,
    updateFinishingStatus,
    weddingBookings,
    updateWeddingBookingStatus,
    orders,
    updateOrderStatus,
    financingApplications,
    updateFinancingStatus,
    supportCases,
    updateSupportCaseStatus,
    sponsorshipInquiries,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    weddingServices,
    addWeddingService,
    updateWeddingService,
    deleteWeddingService,
    articles,
    categories,
    addArticle,
    adminStats,
    adminUsers,
    auditLogs,
    settings,
    updateSettings,
    vendors,
    adminVendors,
    subscriptionPlans,
    refreshAdminVendors,
    adminVerifyVendor,
    adminUpdateSubscriptionPlan,
    adminAnalytics,
    adminModeration,
    refreshAdminStage9,
    moderateStoryDecision,
    resolveCommunityReportDecision,
    verifyExpertProfileDecision,
    adminUpdateArticleStatus,
    adminUpdateUserStatus,
  } = useApp();

  const canModerate = hasAnyRole(currentUser?.role, MODERATION_ROLES);
  const canEditCms = hasAnyRole(currentUser?.role, CMS_EDITOR_ROLES);

  const [activeModule, setActiveModule] = useState<
    | 'overview'
    | 'finishing'
    | 'groom'
    | 'bride'
    | 'wedding'
    | 'vendors'
    | 'moderation'
    | 'cms'
    | 'customers'
    | 'financing'
    | 'support'
    | 'audit'
    | 'settings'
  >('overview');

  const [verifyDrafts, setVerifyDrafts] = useState<
    Record<
      string,
      {
        verificationStatus: VendorVerificationStatus;
        verificationDocs: string;
        verificationNotes: string;
      }
    >
  >({});
  const [planDrafts, setPlanDrafts] = useState<
    Record<
      string,
      {
        monthlyPriceEgp: number;
        annualPriceEgp: number;
        maxServices: number;
        maxPromotions: number;
        maxPortfolioItems: number;
      }
    >
  >({});
  const [savingVerifyId, setSavingVerifyId] = useState<string | null>(null);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  // Product Add/Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTrousseau, setProdTrousseau] = useState<'groom' | 'bride'>('groom');
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodPrice, setProdPrice] = useState(15000);
  const [prodStock, setProdStock] = useState(10);
  const [prodCategory, setProdCategory] = useState('appliances');
  const [prodImage, setProdImage] = useState(
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
  );

  // Wedding Service Add/Edit Modal State
  const [showWeddingServiceModal, setShowWeddingServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvNameAr, setSrvNameAr] = useState('');
  const [srvNameEn, setSrvNameEn] = useState('');
  const [srvCategory, setSrvCategory] = useState<WeddingServiceItem['category']>('venue');
  const [srvLocationAr, setSrvLocationAr] = useState('القاهرة الجديدة — التجمع الخامس');
  const [srvLocationEn, setSrvLocationEn] = useState('New Cairo, Fifth Settlement');
  const [srvPrice, setSrvPrice] = useState(65000);
  const [srvImage, setSrvImage] = useState(
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
  );

  // Article Add Modal State
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [artSlug, setArtSlug] = useState('');
  const [artCategoryId, setArtCategoryId] = useState(categories[0]?.id || 'cat-finishing');
  const [artDomain, setArtDomain] = useState<Article['domain']>('finishing');
  const [artTitleAr, setArtTitleAr] = useState('');
  const [artTitleEn, setArtTitleEn] = useState('');
  const [artExcerptAr, setArtExcerptAr] = useState('');
  const [artExcerptEn, setArtExcerptEn] = useState('');
  const [artBodyAr, setArtBodyAr] = useState('');
  const [artBodyEn, setArtBodyEn] = useState('');

  const [settingsForm, setSettingsForm] = useState(settings);
  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    if (isAdmin && activeModule === 'vendors' && adminVendors.length === 0) {
      void refreshAdminVendors();
    }
  }, [isAdmin, activeModule, adminVendors.length, refreshAdminVendors]);

  useEffect(() => {
    if (
      isStaff &&
      (activeModule === 'overview' || activeModule === 'moderation') &&
      (!adminAnalytics || (canModerate && !adminModeration))
    ) {
      void refreshAdminStage9();
    }
  }, [isStaff, activeModule, adminAnalytics, adminModeration, canModerate, refreshAdminStage9]);

  // Strict RBAC Enforcement
  if (!currentUser || !isStaff) {
    return (
      <div data-testid="admin-denied" className="max-w-xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#D91B3E] mx-auto flex items-center justify-center border border-rose-200 shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">
          {language === 'ar'
            ? 'دخول مقتصر على إدارة ومحرري جواز إن'
            : 'Staff & Admin Authorization Required'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {currentUser
            ? language === 'ar'
              ? `الحساب الحالي (${currentUser.email}) بصلاحية عميل ولا يملك صلاحية الوصول إلى لوحة الإدارة المركزية.`
              : `Your signed-in account (${currentUser.email}) does not carry admin/editor/moderator privileges.`
            : language === 'ar'
            ? 'يرجى تسجيل الدخول بحساب إداري أو تحريري للوصول إلى GAWAZ INN Admin OS.'
            : 'Please sign in with an authorized staff credential to enter GAWAZ INN Admin OS.'}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md cursor-pointer"
          >
            {language === 'ar' ? 'تسجيل دخول الإدارة' : 'Staff Sign In'}
          </button>
          <Link
            to="/"
            className="bg-white border border-gray-200 text-gray-700 font-bold text-xs py-3 px-6 rounded-xl"
          >
            {language === 'ar' ? 'العودة للرئيسية' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  const totalCustomers =
    adminStats?.activeCustomers ??
    adminUsers.filter((u) => u.role === 'customer').length;
  const totalInquiries = finishingInquiries.length;
  const totalOrders = orders.length;
  const totalBookings = weddingBookings.length;
  const totalFinancing = financingApplications.length;
  const totalSupport = supportCases.length;

  const pendingRequestsCount =
    finishingInquiries.filter((i) => i.status === 'pending' || i.status === 'under_review')
      .length +
    weddingBookings.filter((b) => b.status === 'pending_review').length +
    financingApplications.filter((f) => f.status === 'submitted' || f.status === 'under_review')
      .length;

  const openAddProductModal = (type: 'groom' | 'bride') => {
    setEditingProductId(null);
    setProdTrousseau(type);
    setProdNameAr('');
    setProdNameEn('');
    setProdBrand('');
    setProdPrice(15000);
    setProdStock(10);
    setProdCategory(type === 'groom' ? 'appliances' : 'cookware');
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdTrousseau(prod.trousseauType === 'bride' ? 'bride' : 'groom');
    setProdNameAr(prod.nameAr);
    setProdNameEn(prod.nameEn);
    setProdBrand(prod.brand);
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdCategory(prod.category);
    setProdImage(prod.imageUrl);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameAr.trim()) return;

    if (editingProductId) {
      const existing = products.find((p) => p.id === editingProductId);
      if (!existing) return;
      await updateProduct({
        ...existing,
        nameAr: prodNameAr.trim(),
        nameEn: prodNameEn.trim() || prodNameAr.trim(),
        brand: prodBrand.trim() || 'Gawaz Inn Luxury',
        price: Number(prodPrice),
        stock: Number(prodStock),
        category: prodCategory,
        imageUrl: prodImage.trim(),
      });
    } else {
      const newProd: Product = {
        id: `${prodTrousseau}-p-${Date.now().toString().slice(-5)}`,
        trousseauType: prodTrousseau,
        category: prodCategory,
        categoryAr: prodCategory === 'appliances' ? 'أجهزة كهربائية' : 'مستلزمات منزلية',
        categoryEn: prodCategory,
        nameAr: prodNameAr.trim(),
        nameEn: prodNameEn.trim() || prodNameAr.trim(),
        brand: prodBrand.trim() || 'Gawaz Inn Luxury',
        price: Number(prodPrice),
        sku: `GIN-${Date.now().toString().slice(-6)}`,
        stock: Number(prodStock),
        imageUrl: prodImage.trim(),
        descriptionAr: 'منتج معتمد بضمان الوكيل الرسمي عبر منصة جواز إن.',
        descriptionEn: 'Official certified product via GAWAZ INN platform.',
        specsAr: { الضمان: 'سنتان' },
        specsEn: { Warranty: '2 Years' },
      };
      await addProduct(newProd);
    }
    setShowProductModal(false);
  };

  const openAddWeddingModal = () => {
    setEditingServiceId(null);
    setSrvNameAr('');
    setSrvNameEn('');
    setSrvCategory('venue');
    setSrvLocationAr('القاهرة الجديدة — التجمع الخامس');
    setSrvLocationEn('New Cairo, Fifth Settlement');
    setSrvPrice(65000);
    setShowWeddingServiceModal(true);
  };

  const openEditWeddingModal = (srv: WeddingServiceItem) => {
    setEditingServiceId(srv.id);
    setSrvNameAr(srv.nameAr);
    setSrvNameEn(srv.nameEn);
    setSrvCategory(srv.category);
    setSrvLocationAr(srv.locationAr);
    setSrvLocationEn(srv.locationEn);
    setSrvPrice(srv.startingPrice);
    setSrvImage(srv.imageUrl);
    setShowWeddingServiceModal(true);
  };

  const handleSaveWeddingService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvNameAr.trim()) return;
    if (editingServiceId) {
      const existing = weddingServices.find((s) => s.id === editingServiceId);
      if (!existing) return;
      await updateWeddingService({
        ...existing,
        category: srvCategory,
        nameAr: srvNameAr.trim(),
        nameEn: srvNameEn.trim() || srvNameAr.trim(),
        locationAr: srvLocationAr.trim(),
        locationEn: srvLocationEn.trim(),
        startingPrice: Number(srvPrice),
        imageUrl: srvImage.trim(),
      });
    } else {
      await addWeddingService({
        id: `wed-${Date.now().toString().slice(-5)}`,
        category: srvCategory,
        nameAr: srvNameAr.trim(),
        nameEn: srvNameEn.trim() || srvNameAr.trim(),
        locationAr: srvLocationAr.trim(),
        locationEn: srvLocationEn.trim(),
        startingPrice: Number(srvPrice),
        pricingType: 'package',
        imageUrl: srvImage.trim(),
        galleryUrls: [srvImage.trim()],
        rating: 4.9,
        reviewsCount: 1,
        capacity: '250 - 400 Guests',
        descriptionAr: 'خدمة زفاف متكاملة مضافة عبر لوحة تحكم الإدارة.',
        descriptionEn: 'Curated wedding service added via GAWAZ INN Admin OS.',
        featuresAr: ['تنظيم كامل', 'فريق متابعة مخصص'],
        featuresEn: ['Full coordination', 'Dedicated concierge'],
      });
    }
    setShowWeddingServiceModal(false);
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artSlug.trim() || !artTitleAr.trim() || !artBodyAr.trim()) return;
    await addArticle({
      slug: artSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      categoryId: artCategoryId,
      domain: artDomain,
      contentType: 'guide',
      titleAr: artTitleAr.trim(),
      titleEn: artTitleEn.trim() || artTitleAr.trim(),
      excerptAr: artExcerptAr.trim() || artBodyAr.trim().slice(0, 120),
      excerptEn: artExcerptEn.trim() || artBodyEn.trim().slice(0, 120) || 'Published guide',
      bodyAr: artBodyAr.trim(),
      bodyEn: artBodyEn.trim() || artBodyAr.trim(),
      featuredImage:
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
      tags: ['دليل', artDomain],
      faqs: [],
      relatedCalculators: [],
      status: 'published',
      readingMinutes: 5,
      isFeatured: true,
    });
    setShowArticleModal(false);
    setArtSlug('');
    setArtTitleAr('');
    setArtTitleEn('');
    setArtExcerptAr('');
    setArtExcerptEn('');
    setArtBodyAr('');
    setArtBodyEn('');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
  };

  const sidebarItems: {
    key: typeof activeModule;
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      key: 'overview',
      labelAr: 'نظرة عامة والتقارير',
      labelEn: 'Overview & KPIs',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      key: 'finishing',
      labelAr: 'تشطيب الشقة والطلبات',
      labelEn: 'Finishing Inquiries',
      icon: <Building2 className="w-4 h-4" />,
      badge: finishingInquiries.length,
    },
    {
      key: 'groom',
      labelAr: 'منتجات جهاز العريس',
      labelEn: "Groom's Catalog",
      icon: <Briefcase className="w-4 h-4" />,
      badge: products.filter((p) => p.trousseauType === 'groom').length,
    },
    {
      key: 'bride',
      labelAr: 'منتجات جهاز العروسة',
      labelEn: "Bride's Catalog",
      icon: <Sparkles className="w-4 h-4" />,
      badge: products.filter((p) => p.trousseauType === 'bride').length,
    },
    {
      key: 'wedding',
      labelAr: 'فرحي والخدمات والحجوزات',
      labelEn: 'Wedding Services & Bookings',
      icon: <Heart className="w-4 h-4" />,
      badge: weddingBookings.length,
    },
    ...(isAdmin
      ? [
          {
            key: 'vendors' as const,
            labelAr: 'الشركاء والتوثيق والباقات',
            labelEn: 'Vendors & Verification',
            icon: <Store className="w-4 h-4" />,
            badge: adminVendors.length || vendors.length,
          },
        ]
      : []),
    ...(canModerate
      ? [
          {
            key: 'moderation' as const,
            labelAr: 'الإشراف والقصص والخبراء',
            labelEn: 'Moderation & Experts',
            icon: <Flag className="w-4 h-4" />,
            badge:
              (adminModeration?.stories.filter((s) => s.moderationStatus === 'pending').length ??
                0) +
                (adminModeration?.reports.filter((r) => r.status === 'open').length ?? 0) +
                (isAdmin
                  ? adminModeration?.experts.filter((e) => e.verificationStatus === 'pending')
                      .length ?? 0
                  : 0) || undefined,
          },
        ]
      : []),
    {
      key: 'cms',
      labelAr: 'الموسوعة والمحتوى (CMS)',
      labelEn: 'Encyclopedia CMS',
      icon: <BookOpen className="w-4 h-4" />,
      badge: articles.length,
    },
    {
      key: 'customers',
      labelAr: 'العملاء والطلبات',
      labelEn: 'Users & Orders',
      icon: <Users className="w-4 h-4" />,
      badge: adminUsers.length || undefined,
    },
    {
      key: 'financing',
      labelAr: 'التقسيط والتمويل',
      labelEn: 'Financing Requests',
      icon: <CreditCard className="w-4 h-4" />,
      badge: financingApplications.length,
    },
    {
      key: 'support',
      labelAr: 'مبادرة الدعم السرية',
      labelEn: 'Confidential Support',
      icon: <HeartHandshake className="w-4 h-4" />,
      badge: supportCases.length,
    },
    {
      key: 'audit',
      labelAr: 'سجل الأمان والتدقيق',
      labelEn: 'Audit Logs',
      icon: <History className="w-4 h-4" />,
    },
    {
      key: 'settings',
      labelAr: 'إعدادات المنصة',
      labelEn: 'Platform Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const activeItemLabel = sidebarItems.find((i) => i.key === activeModule);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col lg:flex-row pb-24">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-gradient-to-b from-[#1C1819] to-[#261618] text-white p-6 shrink-0 border-e border-white/10 space-y-6">
        <div className="flex items-center gap-3 pb-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-red-gradient text-white font-black flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              {language === 'ar' ? 'إدارة جواز إن' : 'GAWAZ INN Admin'}
            </h2>
            <span className="text-[11px] text-rose-200 font-semibold block">
              {getRoleLabel(currentUser.role, language)}
            </span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveModule(item.key)}
              data-testid={`admin-tab-${item.key}`}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-start cursor-pointer ${
                activeModule === item.key
                  ? 'bg-red-gradient text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.icon}
                <span className="truncate">
                  {language === 'ar' ? item.labelAr : item.labelEn}
                </span>
              </div>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="bg-white/15 text-white px-2 py-0.5 rounded-full text-[10px]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-5 border-t border-white/10">
          <Link
            to="/"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition flex items-center justify-center gap-2"
          >
            <span>{language === 'ar' ? 'الرجوع للموقع الرئيسي' : 'Return to Storefront'}</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 space-y-8 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#D91B3E]/15 shadow-sm">
          <div>
            <span className="text-xs font-bold text-[#D91B3E] uppercase tracking-wider block">
              {language === 'ar' ? 'لوحة الإدارة التنفيذية' : 'GAWAZ INN Admin OS'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {activeItemLabel
                ? language === 'ar'
                  ? activeItemLabel.labelAr
                  : activeItemLabel.labelEn
                : activeModule}
            </h1>
          </div>

          <span className="text-xs bg-[#FAF7F2] px-3.5 py-2 rounded-xl border border-rose-100 font-bold text-[#D91B3E]">
            {language === 'ar'
              ? `${pendingRequestsCount} طلبات نشطة قيد المتابعة`
              : `${pendingRequestsCount} Pending Action Items`}
          </span>
        </div>

        {/* 1. OVERVIEW */}
        {activeModule === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiTotalCustomers}</span>
                <span data-testid="admin-kpi-customers" className="text-2xl font-black text-gray-900">
                  {totalCustomers}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  {language === 'ar' ? 'مسجلون فعلياً بالقاعدة' : 'DB Active Accounts'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiFinishingInquiries}</span>
                <span className="text-2xl font-black text-[#D91B3E]">{totalInquiries}</span>
                <span className="text-[10px] text-amber-600 font-bold block">
                  {language === 'ar' ? 'طلبات مقايسة' : 'Quotations'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiProductOrders}</span>
                <span className="text-2xl font-black text-gray-900">{totalOrders}</span>
                <span className="text-[10px] text-[#D91B3E] font-bold block">
                  {language === 'ar' ? 'طلبات الشراء' : 'Orders'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiWeddingBookings}</span>
                <span className="text-2xl font-black text-[#D91B3E]">{totalBookings}</span>
                <span className="text-[10px] text-purple-600 font-bold block">
                  {language === 'ar' ? 'استفسارات الفرح' : 'Bookings'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiInstallments}</span>
                <span className="text-2xl font-black text-gray-900">{totalFinancing}</span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  {language === 'ar' ? 'فحص ائتماني' : 'Credit Review'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiSocialSupport}</span>
                <span className="text-2xl font-black text-rose-700">{totalSupport}</span>
                <span className="text-[10px] text-rose-600 font-bold block">
                  {language === 'ar' ? 'حالات سرية' : 'Confidential'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D91B3E]" />
                    <span>
                      {language === 'ar' ? 'أحدث مقايسات التشطيب' : 'Recent Finishing Quotes'}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModule('finishing')}
                    className="text-xs text-[#D91B3E] font-bold hover:underline cursor-pointer"
                  >
                    {language === 'ar'
                      ? `عرض الكل (${finishingInquiries.length})`
                      : `View All (${finishingInquiries.length})`}
                  </button>
                </div>

                <div className="space-y-3">
                  {finishingInquiries.slice(0, 3).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3.5 rounded-xl bg-[#FAF7F2] border border-gray-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <strong className="text-gray-900 block">{inq.customerName}</strong>
                        <span className="text-gray-500">
                          {inq.areaSqm}m² • {inq.governorate} • {inq.phone}
                        </span>
                      </div>
                      <span className="bg-[#1C1819] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        {inq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#D91B3E]" />
                    <span>
                      {language === 'ar' ? 'أحدث طلبات حجز الفرح' : 'Recent Wedding Inquiries'}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModule('wedding')}
                    className="text-xs text-[#D91B3E] font-bold hover:underline cursor-pointer"
                  >
                    {language === 'ar'
                      ? `عرض الكل (${weddingBookings.length})`
                      : `View All (${weddingBookings.length})`}
                  </button>
                </div>

                <div className="space-y-3">
                  {weddingBookings.slice(0, 3).map((wed) => (
                    <div
                      key={wed.id}
                      className="p-3.5 rounded-xl bg-[#FAF7F2] border border-gray-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <strong className="text-gray-900 block">{wed.serviceName}</strong>
                        <span className="text-gray-500">
                          {wed.customerName} • {wed.weddingDate}
                        </span>
                      </div>
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        {wed.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage 9 Admin OS Analytics Center */}
            {adminAnalytics && (
              <div
                data-testid="admin-analytics-panel"
                className="bg-white p-6 rounded-3xl border border-[#D91B3E]/15 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#D91B3E]" />
                      <span>
                        {language === 'ar'
                          ? 'مركز تحليلات المنصة وقمع الشركاء والمجتمع'
                          : 'Admin OS Platform Analytics & Funnel Intelligence'}
                      </span>
                    </h2>
                    <p
                      data-testid="admin-analytics-privacy-notice"
                      className="text-[11px] font-bold text-emerald-700"
                    >
                      🔒 {adminAnalytics.privacyNotice}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void refreshAdminStage9()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8ED] text-[#B31331] text-xs font-bold border border-rose-100 self-start cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تحديث التحليلات' : 'Refresh Analytics'}</span>
                  </button>
                </div>

                {/* Funnel & Community Aggregate Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-1">
                    <span className="text-gray-500 block">
                      {language === 'ar' ? 'طلبات التسعير (RFQ)' : 'Multi-Vendor RFQs'}
                    </span>
                    <strong className="text-xl font-black text-[#2A1D20] block">
                      {adminAnalytics.marketplaceFunnel.totalRfqs}
                    </strong>
                    <span className="text-[11px] font-bold text-[#D91B3E]">
                      {adminAnalytics.marketplaceFunnel.quotedRfqs}{' '}
                      {language === 'ar' ? 'مسعّر' : 'quoted'} •{' '}
                      {adminAnalytics.marketplaceFunnel.acceptedRfqs}{' '}
                      {language === 'ar' ? 'مقبول' : 'accepted'} (
                      {adminAnalytics.marketplaceFunnel.rfqAcceptanceRatePct}%)
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-1">
                    <span className="text-gray-500 block">
                      {language === 'ar' ? 'معدل استجابة الشركاء' : 'Vendor Response Rate'}
                    </span>
                    <strong className="text-xl font-black text-emerald-700 block">
                      {adminAnalytics.marketplaceFunnel.vendorResponseRatePct}%
                    </strong>
                    <span className="text-[11px] text-gray-600">
                      {adminAnalytics.marketplaceFunnel.respondedInvitations}/
                      {adminAnalytics.marketplaceFunnel.totalInvitations}{' '}
                      {language === 'ar' ? 'دعوة تسعير' : 'invitations'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-1">
                    <span className="text-gray-500 block">
                      {language === 'ar' ? 'المجتمع والقصص' : 'Community & Stories'}
                    </span>
                    <strong className="text-xl font-black text-[#D91B3E] block">
                      {adminAnalytics.communitySummary.approvedStoriesCount}{' '}
                      <span className="text-xs font-bold text-gray-600">
                        {language === 'ar' ? 'قصة' : 'stories'}
                      </span>
                    </strong>
                    <span className="text-[11px] text-gray-600">
                      {adminAnalytics.communitySummary.questionsCount}{' '}
                      {language === 'ar' ? 'سؤال' : 'Qs'} •{' '}
                      {adminAnalytics.communitySummary.openReportsCount}{' '}
                      {language === 'ar' ? 'بلاغ مفتوح' : 'open reports'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-1">
                    <span className="text-gray-500 block">
                      {language === 'ar' ? 'الخبراء والشركاء الموثقون' : 'Verified Partners & Experts'}
                    </span>
                    <strong className="text-xl font-black text-[#2A1D20] block">
                      {adminAnalytics.marketplaceFunnel.verifiedVendors} /{' '}
                      {adminAnalytics.usersSummary.verifiedExpertsCount}
                    </strong>
                    <span className="text-[11px] text-gray-600">
                      {language === 'ar' ? 'شريك موثق / خبير معتمد' : 'verified vendors / experts'}
                    </span>
                  </div>
                </div>

                {/* Lifecycle Stages + Top Read Articles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-3">
                    <h3 className="font-black text-gray-900">
                      {language === 'ar'
                        ? 'توزيع المستخدمين على مراحل الرحلة (11 مرحلة)'
                        : 'User Distribution Across 11 Lifecycle Stages'}
                    </h3>
                    <div className="space-y-2">
                      {adminAnalytics.usersSummary.stageDistribution.map((row) => {
                        const pct =
                          adminAnalytics.usersSummary.totalUsers > 0
                            ? Math.round((row.count / adminAnalytics.usersSummary.totalUsers) * 100)
                            : 0;
                        return (
                          <div key={row.stage} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="font-mono text-gray-700">{row.stage}</span>
                              <span className="text-[#D91B3E]">
                                {row.count} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-white overflow-hidden border border-gray-200">
                              <div
                                className="h-full bg-[#D91B3E] rounded-full"
                                style={{ width: `${Math.max(8, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-3">
                    <h3 className="font-black text-gray-900">
                      {language === 'ar'
                        ? 'أكثر أدلة الموسوعة قراءة'
                        : 'Top Read Encyclopedia Guides'}
                    </h3>
                    <div className="space-y-2">
                      {adminAnalytics.contentTopReads.map((art) => (
                        <div
                          key={art.id}
                          className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <strong className="text-gray-900 block truncate">
                              {language === 'ar' ? art.titleAr : art.titleEn}
                            </strong>
                            <span className="text-[10px] text-gray-500">{art.domain}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-[#FDE8ED] text-[#B31331] font-black shrink-0">
                            {art.viewCount} {language === 'ar' ? 'قراءة' : 'views'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. FINISHING */}
        {activeModule === 'finishing' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              {language === 'ar'
                ? `إدارة طلبات المقايسات (${finishingInquiries.length})`
                : `Finishing Quotations Queue (${finishingInquiries.length})`}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3 text-start">ID</th>
                    <th className="p-3 text-start">{t.common.name}</th>
                    <th className="p-3 text-start">{t.common.phone}</th>
                    <th className="p-3 text-start">{language === 'ar' ? 'المساحة' : 'Area'}</th>
                    <th className="p-3 text-start">{t.common.governorate}</th>
                    <th className="p-3 text-start">{language === 'ar' ? 'المستوى' : 'Tier'}</th>
                    <th className="p-3 text-start">{t.admin.statusUpdate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {finishingInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold">#{inq.id}</td>
                      <td className="p-3 font-bold">{inq.customerName}</td>
                      <td className="p-3 text-gray-600">{inq.phone}</td>
                      <td className="p-3">
                        {inq.areaSqm} m² ({inq.roomsCount}R)
                      </td>
                      <td className="p-3">{inq.governorate}</td>
                      <td className="p-3 font-semibold text-[#D91B3E]">{inq.finishingTier}</td>
                      <td className="p-3">
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            void updateFinishingStatus(
                              inq.id,
                              e.target.value as typeof inq.status,
                            )
                          }
                          className="p-1.5 rounded-lg border border-gray-300 text-xs font-semibold focus:border-[#D91B3E] outline-none"
                        >
                          <option value="pending">pending</option>
                          <option value="under_review">under_review</option>
                          <option value="site_visit_scheduled">site_visit_scheduled</option>
                          <option value="quotation_ready">quotation_ready</option>
                          <option value="in_progress">in_progress</option>
                          <option value="completed">completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3 & 4. GROOM & BRIDE CATALOG */}
        {(activeModule === 'groom' || activeModule === 'bride') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">
                {activeModule === 'groom' ? t.nav.groom : t.nav.bride} (
                {products.filter((p) => p.trousseauType === activeModule).length})
              </h3>
              <button
                type="button"
                onClick={() => openAddProductModal(activeModule)}
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>{t.admin.addNew}</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-start">{language === 'ar' ? 'الصورة' : 'Image'}</th>
                      <th className="p-3 text-start">{t.common.name}</th>
                      <th className="p-3 text-start">{language === 'ar' ? 'الماركة' : 'Brand'}</th>
                      <th className="p-3 text-start">{language === 'ar' ? 'السعر' : 'Price'}</th>
                      <th className="p-3 text-start">{language === 'ar' ? 'المخزون' : 'Stock'}</th>
                      <th className="p-3 text-start">{t.admin.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products
                      .filter((p) => p.trousseauType === activeModule)
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <SmartImage
                              src={prod.imageUrl}
                              alt={prod.nameAr}
                              className="w-12 h-12 rounded-lg object-cover border"
                            />
                          </td>
                          <td className="p-3 font-bold text-gray-900 max-w-xs">
                            {language === 'ar' ? prod.nameAr : prod.nameEn}
                          </td>
                          <td className="p-3 text-gray-600">{prod.brand}</td>
                          <td className="p-3 font-black text-[#D91B3E]">
                            {prod.price.toLocaleString()} {t.groom.egp}
                          </td>
                          <td className="p-3 font-bold text-emerald-700">{prod.stock}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(prod)}
                                className="p-1.5 text-gray-600 hover:text-[#D91B3E] hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title={t.admin.edit}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteProduct(prod.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title={t.admin.delete}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. WEDDING PLANNER MANAGEMENT & SERVICES CRUD */}
        {activeModule === 'wedding' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-900">
                  {language === 'ar'
                    ? `دليل خدمات الفرح والقاعات (${weddingServices.length})`
                    : `Wedding Services Directory (${weddingServices.length})`}
                </h3>
                <button
                  type="button"
                  onClick={openAddWeddingModal}
                  className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.admin.addNew}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weddingServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <strong className="text-xs text-gray-900 block truncate">
                        {language === 'ar' ? srv.nameAr : srv.nameEn}
                      </strong>
                      <span className="text-[11px] text-[#D91B3E] font-bold">
                        {srv.startingPrice.toLocaleString()} {t.groom.egp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditWeddingModal(srv)}
                        className="p-1.5 text-gray-600 hover:text-[#D91B3E] rounded-lg cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteWeddingService(srv.id)}
                        className="p-1.5 text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                {language === 'ar'
                  ? `طلبات حجز خدمات الفرح (${weddingBookings.length})`
                  : `Wedding Booking Inquiries (${weddingBookings.length})`}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-start">ID</th>
                      <th className="p-3 text-start">{language === 'ar' ? 'الخدمة' : 'Service'}</th>
                      <th className="p-3 text-start">{t.common.name}</th>
                      <th className="p-3 text-start">{t.common.phone}</th>
                      <th className="p-3 text-start">{t.common.date}</th>
                      <th className="p-3 text-start">{t.admin.statusUpdate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {weddingBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold">#{b.id}</td>
                        <td className="p-3 font-bold text-gray-900">{b.serviceName}</td>
                        <td className="p-3">{b.customerName}</td>
                        <td className="p-3 text-gray-600">{b.phone}</td>
                        <td className="p-3 font-bold text-[#D91B3E]">{b.weddingDate}</td>
                        <td className="p-3">
                          <select
                            value={b.status}
                            onChange={(e) =>
                              void updateWeddingBookingStatus(
                                b.id,
                                e.target.value as typeof b.status,
                              )
                            }
                            className="p-1.5 rounded-lg border border-gray-300 text-xs font-semibold focus:border-[#D91B3E] outline-none"
                          >
                            <option value="pending_review">pending_review</option>
                            <option value="contacted">contacted</option>
                            <option value="date_confirmed">date_confirmed</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5B. VENDORS VERIFICATION GOVERNANCE & SUBSCRIPTION PLANS */}
        {activeModule === 'vendors' && isAdmin && (
          <div className="space-y-8" data-testid="admin-vendors-panel">
            <div className="bg-gradient-to-br from-[#1C1819] to-[#261618] text-white p-6 rounded-3xl border border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                  {language === 'ar'
                    ? 'حوكمة الفصل التام بين التوثيق والاشتراك'
                    : 'STRICT GOVERNANCE: AUDIT VS. COMMERCIAL'}
                </span>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {language === 'ar'
                    ? 'مراجعة وتوثيق الشركاء (مجاني بالإدارة فقط — لا يُشترى بالمال)'
                    : 'Admin-Only Vendor Verification & Commercial Tier Configurator'}
                </h2>
                <p className="text-xs text-gray-300 max-w-2xl">
                  {language === 'ar'
                    ? 'ترقية الباقة التجارية في بوابة الشريك لا تعدّل حالة التوثيق نهائياً. هذه الشاشة هي المسار الوحيد لترقية الشريك إلى موثق أو ثقة موثقة مع تسجيل كامل في سجل التدقيق.'
                    : 'Upgrading paid plans in the Vendor Portal never grants verification. Only this audited workflow alters verification status and records audit_logs.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refreshAdminVendors()}
                data-testid="admin-refresh-vendors-btn"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحديث القائمة' : 'Refresh'}</span>
              </button>
            </div>

            {/* Vendor Verification Cards */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-gray-900">
                {language === 'ar'
                  ? `ملفات الشركاء والموردين (${adminVendors.length})`
                  : `Registered Business Listings (${adminVendors.length})`}
              </h3>

              <div className="space-y-4">
                {adminVendors.map((v: VendorListing) => {
                  const draft = verifyDrafts[v.id] || {
                    verificationStatus: v.verificationStatus,
                    verificationDocs: (v.verificationDocs || []).join(', '),
                    verificationNotes: v.verificationNotes || '',
                  };
                  return (
                    <div
                      key={v.id}
                      data-testid={`admin-vendor-row-${v.slug}`}
                      className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-sm font-black text-gray-900">
                              {language === 'ar' ? v.businessNameAr : v.businessNameEn}
                            </strong>
                            <VerificationBadge
                              status={v.verificationStatus}
                              language={language}
                              compact
                            />
                            <CommercialPlanBadge
                              planCode={v.subscriptionPlanCode || 'free'}
                              isFeaturedCommercial={v.isFeaturedCommercial}
                              language={language}
                            />
                            <HonestRatingBadge
                              ratingAvg={v.ratingAvg}
                              reviewsCount={v.reviewsCount}
                              language={language}
                            />
                          </div>
                          <p className="text-[11px] text-gray-600">
                            {v.primaryCategorySlug} • {v.governorateSlug} •{' '}
                            <span className="font-mono">{v.phone}</span> •{' '}
                            <span className="font-bold text-[#B31331]">
                              Plan: {v.subscriptionPlanCode || 'free'} ({v.commercialStatus})
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700">
                            {language === 'ar' ? 'حالة التوثيق الإدارية' : 'Verification Status'}
                          </label>
                          <select
                            data-testid={`admin-verify-status-${v.slug}`}
                            value={draft.verificationStatus}
                            onChange={(e) =>
                              setVerifyDrafts((prev) => ({
                                ...prev,
                                [v.id]: {
                                  ...draft,
                                  verificationStatus: e.target.value as VendorVerificationStatus,
                                },
                              }))
                            }
                            className="w-full max-w-full min-w-0 p-2 rounded-xl border border-gray-300 bg-white text-xs font-bold focus:border-[#D91B3E] outline-none"
                          >
                            <option value="registered">registered</option>
                            <option value="verified">verified</option>
                            <option value="trusted">trusted</option>
                            <option value="rejected">rejected</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700">
                            {language === 'ar' ? 'مستندات التحقق (مفصولة بفاصلة)' : 'Audit Documents'}
                          </label>
                          <input
                            type="text"
                            value={draft.verificationDocs}
                            onChange={(e) =>
                              setVerifyDrafts((prev) => ({
                                ...prev,
                                [v.id]: { ...draft, verificationDocs: e.target.value },
                              }))
                            }
                            placeholder="Commercial Reg, Tax Card..."
                            className="w-full p-2 rounded-xl border border-gray-300 bg-white text-xs outline-none focus:border-[#D91B3E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700">
                            {language === 'ar' ? 'ملاحظات المراجع' : 'Audit Notes'}
                          </label>
                          <input
                            type="text"
                            data-testid={`admin-verify-notes-${v.slug}`}
                            value={draft.verificationNotes}
                            onChange={(e) =>
                              setVerifyDrafts((prev) => ({
                                ...prev,
                                [v.id]: { ...draft, verificationNotes: e.target.value },
                              }))
                            }
                            placeholder={
                              language === 'ar'
                                ? 'مثال: تم فحص السجل التجاري والبطاقة الضريبية'
                                : 'Checked commercial registry & national ID'
                            }
                            className="w-full p-2 rounded-xl border border-gray-300 bg-white text-xs outline-none focus:border-[#D91B3E]"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={savingVerifyId === v.id}
                          data-testid={`admin-verify-save-${v.slug}`}
                          onClick={() => {
                            setSavingVerifyId(v.id);
                            void adminVerifyVendor(v.id, {
                              verificationStatus: draft.verificationStatus,
                              verificationDocs: draft.verificationDocs
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                              verificationNotes: draft.verificationNotes.trim() || null,
                            })
                              .then((updated) => {
                                setVerifyDrafts((prev) => ({
                                  ...prev,
                                  [v.id]: {
                                    verificationStatus: updated.verificationStatus,
                                    verificationDocs: (updated.verificationDocs || []).join(', '),
                                    verificationNotes: updated.verificationNotes || '',
                                  },
                                }));
                              })
                              .finally(() => setSavingVerifyId(null));
                          }}
                          className="py-2.5 px-4 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>
                            {savingVerifyId === v.id
                              ? language === 'ar'
                                ? 'جاري الحفظ...'
                                : 'Saving...'
                              : language === 'ar'
                                ? 'اعتماد التوثيق'
                                : 'Save Verification'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Commercial Subscription Plans Configurator */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {language === 'ar'
                    ? 'إعدادات وأسعار الباقات التجارية (الاشتراك الشهري والسنوي والحصص)'
                    : 'Commercial Subscription Plans & Quotas'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar'
                    ? 'تتحكم الباقات في حصص الخدمات والعروض الترويجية فقط ولا تمنح أي شارة توثيق.'
                    : 'Controls listing quotas and sponsored visibility only — never grants audit badges.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptionPlans.map((plan: SubscriptionPlan) => {
                  const pDraft = planDrafts[plan.id] || {
                    monthlyPriceEgp: plan.monthlyPriceEgp,
                    annualPriceEgp: plan.annualPriceEgp,
                    maxServices: plan.maxServices,
                    maxPromotions: plan.maxPromotions,
                    maxPortfolioItems: plan.maxPortfolioItems,
                  };
                  return (
                    <div
                      key={plan.id}
                      data-testid={`admin-plan-card-${plan.code}`}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-sm font-black text-gray-900">
                          {language === 'ar' ? plan.nameAr : plan.nameEn}
                        </strong>
                        <span className="px-2 py-0.5 rounded-lg bg-white border text-[11px] font-mono font-bold text-[#D91B3E]">
                          {plan.code}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-600 block">
                            {language === 'ar' ? 'شهري (ج.م)' : 'Monthly EGP'}
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={pDraft.monthlyPriceEgp}
                            onChange={(e) =>
                              setPlanDrafts((prev) => ({
                                ...prev,
                                [plan.id]: {
                                  ...pDraft,
                                  monthlyPriceEgp: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full p-2 rounded-lg border bg-white text-xs font-bold"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-600 block">
                            {language === 'ar' ? 'سنوي (ج.م)' : 'Annual EGP'}
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={pDraft.annualPriceEgp}
                            onChange={(e) =>
                              setPlanDrafts((prev) => ({
                                ...prev,
                                [plan.id]: {
                                  ...pDraft,
                                  annualPriceEgp: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full p-2 rounded-lg border bg-white text-xs font-bold"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-600 block">
                            {language === 'ar' ? 'حد الخدمات' : 'Max Services'}
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={pDraft.maxServices}
                            onChange={(e) =>
                              setPlanDrafts((prev) => ({
                                ...prev,
                                [plan.id]: {
                                  ...pDraft,
                                  maxServices: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full p-2 rounded-lg border bg-white text-xs font-bold"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-600 block">
                            {language === 'ar' ? 'حد العروض' : 'Max Promos'}
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={pDraft.maxPromotions}
                            onChange={(e) =>
                              setPlanDrafts((prev) => ({
                                ...prev,
                                [plan.id]: {
                                  ...pDraft,
                                  maxPromotions: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full p-2 rounded-lg border bg-white text-xs font-bold"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-600 block">
                            {language === 'ar' ? 'حد المعرض' : 'Max Portfolio'}
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={pDraft.maxPortfolioItems}
                            onChange={(e) =>
                              setPlanDrafts((prev) => ({
                                ...prev,
                                [plan.id]: {
                                  ...pDraft,
                                  maxPortfolioItems: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full p-2 rounded-lg border bg-white text-xs font-bold"
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        disabled={savingPlanId === plan.id}
                        data-testid={`admin-plan-save-${plan.code}`}
                        onClick={() => {
                          setSavingPlanId(plan.id);
                          void adminUpdateSubscriptionPlan(plan.id, pDraft).finally(() =>
                            setSavingPlanId(null),
                          );
                        }}
                        className="px-4 py-2 rounded-xl bg-[#1C1819] hover:bg-[#D91B3E] text-white text-xs font-bold transition disabled:opacity-60 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{t.admin.saveChanges}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5C. STAGE 9 MODERATION QUEUE (STORIES, REPORTS & FULL-ADMIN EXPERT VERIFICATION) */}
        {activeModule === 'moderation' && canModerate && (
          <div className="space-y-8" data-testid="admin-moderation-panel">
            <div className="bg-gradient-to-br from-[#1C1819] to-[#261618] text-white p-6 rounded-3xl border border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                  {language === 'ar'
                    ? 'حوكمة المجتمع والمحتوى المُرسل من المستخدمين'
                    : 'MODERATION & CREDENTIAL AUDIT WORKFLOW'}
                </span>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {language === 'ar'
                    ? 'مراجعة قصص الزفاف وبلاغات المجتمع واعتماد الخبراء'
                    : 'Wedding Story Review, Abuse Triage & Expert Verification'}
                </h2>
                <p className="text-xs text-gray-300">
                  {language === 'ar'
                    ? 'القصص تظل مخفية عن العامة حتى اعتماد المشرف. اعتماد شارات الخبراء مقتصر على المدير العام (Full Admin) بعد فحص المستندات.'
                    : 'Stories stay hidden until moderator approval. Expert credential verification requires Full Admin privileges.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refreshAdminStage9()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحديث الطابور' : 'Refresh Queue'}</span>
              </button>
            </div>

            {/* 1. Real Wedding Stories Moderation Queue */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#D91B3E]" />
                <span>
                  {language === 'ar'
                    ? `قصص الزفاف الواردة للمراجعة (${adminModeration?.stories.length ?? 0})`
                    : `Submitted Wedding Stories Queue (${adminModeration?.stories.length ?? 0})`}
                </span>
              </h3>

              <div className="space-y-3">
                {(adminModeration?.stories || []).map((st) => (
                  <div
                    key={st.id}
                    data-testid={`mod-story-card-${st.id}`}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-black text-gray-900">
                          {language === 'ar' ? st.coupleTitleAr : st.coupleTitleEn}
                        </strong>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.moderationStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st.moderationStatus === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {st.moderationStatus}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {st.authorName || 'GAWAZ INN'} • {language === 'ar' ? st.cityAr : st.cityEn} •{' '}
                        {st.totalActualBudgetEgp.toLocaleString()} {t.groom.egp}
                      </p>
                      <p className="text-gray-700 line-clamp-2">{st.summaryAr}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        data-testid={`mod-story-approve-${st.id}`}
                        onClick={() =>
                          void moderateStoryDecision(st.id, {
                            moderationStatus: 'approved',
                            moderationNotes: 'Approved by Moderator after checking budget consistency.',
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'موافقة ونشر' : 'Approve'}</span>
                      </button>
                      <button
                        type="button"
                        data-testid={`mod-story-reject-${st.id}`}
                        onClick={() =>
                          void moderateStoryDecision(st.id, {
                            moderationStatus: 'rejected',
                            moderationNotes: 'Rejected by Moderator during quality check.',
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'رفض' : 'Reject'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Community Abuse Reports Triage */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#D91B3E]" />
                <span>
                  {language === 'ar'
                    ? `بلاغات إساءة الاستخدام في المجتمع (${adminModeration?.reports.length ?? 0})`
                    : `Community Abuse Reports (${adminModeration?.reports.length ?? 0})`}
                </span>
              </h3>

              <div className="space-y-3">
                {(adminModeration?.reports || []).map((rep) => (
                  <div
                    key={rep.id}
                    data-testid={`mod-report-card-${rep.id}`}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-[#FDE8ED] text-[#B31331] font-bold">
                          {rep.targetType} • {rep.reason}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rep.status === 'open'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>
                      <strong className="text-gray-900 block">
                        {rep.targetPreview || rep.targetId}
                      </strong>
                      <span className="text-gray-500 block">
                        {rep.reporterName || rep.reporterUserId}
                        {rep.details ? ` — ${rep.details}` : ''}
                      </span>
                    </div>

                    {rep.status === 'open' && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          data-testid={`mod-report-hide-${rep.id}`}
                          onClick={() =>
                            void resolveCommunityReportDecision(rep.id, {
                              action: 'resolve_hide',
                              resolutionNote: 'Content hidden after moderator investigation.',
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                        >
                          {language === 'ar' ? 'إخفاء المحتوى وإغلاق' : 'Resolve & Hide'}
                        </button>
                        <button
                          type="button"
                          data-testid={`mod-report-dismiss-${rep.id}`}
                          onClick={() =>
                            void resolveCommunityReportDecision(rep.id, {
                              action: 'dismiss',
                              resolutionNote: 'Dismissed after moderator check.',
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                        >
                          {language === 'ar' ? 'رفض البلاغ (إبقاء)' : 'Dismiss Report'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Full-Admin Only: Expert Credential Verification */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-[#D91B3E]" />
                  <span>
                    {language === 'ar'
                      ? `طلبات توثيق الخبراء (${adminModeration?.experts.length ?? 0})`
                      : `Expert Credential Verification (${adminModeration?.experts.length ?? 0})`}
                  </span>
                </h3>
                {!isAdmin && (
                  <span className="text-[11px] font-bold text-[#B31331] bg-[#FDE8ED] px-3 py-1 rounded-full">
                    {language === 'ar'
                      ? 'اعتماد الخبراء مقتصر على المدير العام (Admin) فقط'
                      : 'Full Admin Only'}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {(adminModeration?.experts || []).map((exp) => (
                  <div
                    key={exp.id}
                    data-testid={`admin-expert-row-${exp.id}`}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-black text-gray-900">
                          {language === 'ar' ? exp.displayNameAr : exp.displayNameEn}
                        </strong>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            exp.verificationStatus === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : exp.verificationStatus === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {exp.verificationStatus}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {exp.specialtySlug} • {language === 'ar' ? exp.titleAr : exp.titleEn}
                      </p>
                      <p className="text-gray-500">
                        {language === 'ar' ? 'المستندات:' : 'Docs:'}{' '}
                        {exp.verificationDocs.join(' • ')}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          data-testid={`admin-expert-verify-${exp.id}`}
                          onClick={() =>
                            void verifyExpertProfileDecision(exp.id, {
                              verificationStatus: 'verified',
                              verificationNotes: 'Credentials verified by Admin.',
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'توثيق واعتماد' : 'Verify Expert'}</span>
                        </button>
                        <button
                          type="button"
                          data-testid={`admin-expert-reject-${exp.id}`}
                          onClick={() =>
                            void verifyExpertProfileDecision(exp.id, {
                              verificationStatus: 'rejected',
                              verificationNotes: 'Credentials insufficient.',
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'رفض' : 'Reject'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. CMS ARTICLES */}
        {activeModule === 'cms' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">
                {language === 'ar'
                  ? `مقالات وأدلة الموسوعة (${articles.length})`
                  : `Encyclopedia Guides (${articles.length})`}
              </h3>
              <button
                type="button"
                onClick={() => setShowArticleModal(true)}
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'نشر مقال جديد' : 'Publish Guide'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-[#D91B3E] block">
                      {art.domain} • {art.contentType}
                    </span>
                    <strong className="text-sm text-gray-900 block">
                      {language === 'ar' ? art.titleAr : art.titleEn}
                    </strong>
                    <span className="text-gray-500">
                      /{art.slug} • {art.authorName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {canEditCms && (
                      <select
                        data-testid={`cms-article-status-${art.id}`}
                        value={art.status}
                        onChange={(e) =>
                          void adminUpdateArticleStatus(art.id, {
                            status: e.target.value as Article['status'],
                          })
                        }
                        className="max-w-full min-w-0 p-1.5 rounded-lg border border-gray-300 bg-white text-xs font-bold outline-none focus:border-[#D91B3E]"
                      >
                        <option value="draft">draft</option>
                        <option value="in_review">in_review</option>
                        <option value="published">published</option>
                        <option value="archived">archived</option>
                      </select>
                    )}
                    <Link
                      to={`/guides/${art.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-[#D91B3E] font-bold"
                    >
                      {language === 'ar' ? 'معاينة' : 'Preview'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CUSTOMERS & ORDERS */}
        {activeModule === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                {language === 'ar'
                  ? `المستخدمون المسجلون (${adminUsers.length})`
                  : `Registered Users (${adminUsers.length})`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adminUsers.map((u) => (
                  <div
                    key={u.id}
                    data-testid={`admin-user-card-${u.id}`}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <strong className="text-sm font-bold text-gray-900 block truncate">
                        {u.name}
                      </strong>
                      <span className="text-xs text-gray-500 block truncate">
                        {u.phone} • {u.email}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-[#D91B3E] bg-white px-2.5 py-1 rounded-lg border border-rose-100">
                        {getRoleLabel(u.role, language)}
                      </span>
                      {isAdmin && u.id !== currentUser.id && (
                        <select
                          data-testid={`admin-user-status-${u.id}`}
                          value={u.status}
                          onChange={(e) =>
                            void adminUpdateUserStatus(u.id, e.target.value as typeof u.status)
                          }
                          className="max-w-full min-w-0 p-1 rounded-lg border border-gray-300 bg-white text-[11px] font-bold"
                        >
                          <option value="active">active</option>
                          <option value="suspended">suspended</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                {language === 'ar'
                  ? `طلبات الشراء المسجلة (${orders.length})`
                  : `Submitted Product Orders (${orders.length})`}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-start">ID</th>
                      <th className="p-3 text-start">{t.common.name}</th>
                      <th className="p-3 text-start">{t.common.city}</th>
                      <th className="p-3 text-start">{t.common.total}</th>
                      <th className="p-3 text-start">{t.admin.statusUpdate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="p-3 font-mono font-bold">#{ord.id}</td>
                        <td className="p-3 font-bold">{ord.customerName}</td>
                        <td className="p-3">{ord.city}</td>
                        <td className="p-3 font-black text-[#D91B3E]">
                          {ord.total.toLocaleString()} {t.groom.egp}
                        </td>
                        <td className="p-3">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              void updateOrderStatus(ord.id, e.target.value as typeof ord.status)
                            }
                            className="p-1.5 rounded-lg border border-gray-300 text-xs font-semibold"
                          >
                            <option value="received">received</option>
                            <option value="processing">processing</option>
                            <option value="shipped">shipped</option>
                            <option value="delivered">delivered</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. FINANCING */}
        {activeModule === 'financing' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              {language === 'ar'
                ? `طلبات التمويل والتقسيط (${financingApplications.length})`
                : `Financing Applications (${financingApplications.length})`}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3 text-start">ID</th>
                    <th className="p-3 text-start">{t.common.name}</th>
                    <th className="p-3 text-start">{t.common.nationalId}</th>
                    <th className="p-3 text-start">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                    <th className="p-3 text-start">{language === 'ar' ? 'الشريك' : 'Provider'}</th>
                    <th className="p-3 text-start">{t.admin.statusUpdate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financingApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold">#{app.id}</td>
                      <td className="p-3 font-bold">{app.customerName}</td>
                      <td className="p-3 font-mono">{app.nationalId}</td>
                      <td className="p-3 font-bold text-[#D91B3E]">
                        {app.requestedAmount.toLocaleString()} {t.groom.egp}
                      </td>
                      <td className="p-3 font-semibold">{app.preferredProvider}</td>
                      <td className="p-3">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            void updateFinancingStatus(
                              app.id,
                              e.target.value as typeof app.status,
                            )
                          }
                          className="p-1.5 rounded-lg border border-gray-300 text-xs font-semibold focus:border-[#D91B3E] outline-none"
                        >
                          <option value="submitted">submitted</option>
                          <option value="under_review">under_review</option>
                          <option value="approved">approved</option>
                          <option value="rejected">rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. SOCIAL SUPPORT CASES & SPONSORSHIPS */}
        {activeModule === 'support' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1C1819] to-[#261618] text-white p-6 rounded-3xl border border-rose-900/40 flex items-center gap-4">
              <Lock className="w-8 h-8 text-[#D91B3E] shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-200">
                  {language === 'ar'
                    ? 'ملفات المبادرة الإنسانية — حماية السرية التامة'
                    : 'Humanitarian Initiative Files — Strictly Confidential'}
                </h4>
                <p className="text-xs text-gray-300">
                  {language === 'ar'
                    ? 'يُسمح بالاطلاع للمشرفين والمديرين المخولين فقط، مع إخفاء الرقم القومي آلياً.'
                    : 'Access restricted to authorized moderators and administrators with automatic National ID masking.'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                {language === 'ar'
                  ? `سجل حالات الدعم الميداني (${supportCases.length})`
                  : `Confidential Support Cases (${supportCases.length})`}
              </h3>

              <div className="space-y-4">
                {supportCases.map((cs) => (
                  <div
                    key={cs.id}
                    className="p-5 rounded-2xl bg-[#FAF7F2] border border-rose-100 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-3">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">#{cs.id}</span>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {cs.applicantName} • {cs.governorate} •{' '}
                          <span className="font-mono">{cs.nationalId}</span>
                        </span>
                      </div>
                      <select
                        value={cs.status}
                        onChange={(e) =>
                          void updateSupportCaseStatus(cs.id, e.target.value as typeof cs.status)
                        }
                        className="p-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700"
                      >
                        <option value="confidential_review">confidential_review</option>
                        <option value="field_research">field_research</option>
                        <option value="approved_for_support">approved_for_support</option>
                        <option value="funded_and_delivered">funded_and_delivered</option>
                        <option value="ineligible">ineligible</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100">
                      {cs.caseDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {sponsorshipInquiries.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-gray-900">
                  {language === 'ar'
                    ? `رغبات الرعاية والمساهمة (${sponsorshipInquiries.length})`
                    : `Sponsorship Pledges (${sponsorshipInquiries.length})`}
                </h3>
                {sponsorshipInquiries.map((sp) => (
                  <div key={sp.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-gray-100 text-xs flex justify-between">
                    <div>
                      <strong>{sp.sponsorName}</strong> {sp.companyName && `(${sp.companyName})`}
                      <span className="block text-gray-500">{sp.email} • {sp.phone}</span>
                    </div>
                    <strong className="text-[#D91B3E]">
                      {sp.pledgeAmount ? `${sp.pledgeAmount.toLocaleString()} EGP` : sp.contributionType}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 10. AUDIT LOGS */}
        {activeModule === 'audit' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              {language === 'ar'
                ? `سجل التدقيق الأمني (${auditLogs.length})`
                : `Security & Action Audit Trail (${auditLogs.length})`}
            </h3>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D91B3E]" />
                <span>
                  {language === 'ar'
                    ? 'سجل التدقيق متاح للمسؤولين عند الاتصال بالخادم.'
                    : 'Audit trail visible to full admins when connected to server.'}
                </span>
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-start">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                      <th className="p-3 text-start">{language === 'ar' ? 'الصلاحية' : 'Role'}</th>
                      <th className="p-3 text-start">{language === 'ar' ? 'الهدف' : 'Target'}</th>
                      <th className="p-3 text-start">{language === 'ar' ? 'التوقيت' : 'Timestamp'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="p-3 font-mono font-bold text-[#D91B3E]">{log.action}</td>
                        <td className="p-3">{log.actorRole}</td>
                        <td className="p-3 font-mono">
                          {log.targetType} {log.targetId ? `#${log.targetId}` : ''}
                        </td>
                        <td className="p-3 text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 11. SETTINGS */}
        {activeModule === 'settings' && (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              {language === 'ar' ? 'إعدادات منصة جواز إن العامة' : 'Platform Configuration'}
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'ar' ? 'شعار المنصة (عربي):' : 'Platform Slogan (AR):'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.sloganAr}
                    onChange={(e) => setSettingsForm({ ...settingsForm, sloganAr: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Platform Slogan (EN):</label>
                  <input
                    type="text"
                    value={settingsForm.sloganEn}
                    onChange={(e) => setSettingsForm({ ...settingsForm, sloganEn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'ar' ? 'الخط الساخن الموحد:' : 'Hotline:'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.hotline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'ar' ? 'رقم الواتساب:' : 'WhatsApp:'}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'ar'
                      ? 'الفائدة السنوية التقديرية للتقسيط (%):'
                      : 'Installment Estimate APR (%):'}
                  </label>
                  <input
                    type="number"
                    value={settingsForm.interestRateAnnual}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        interestRateAnnual: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">{t.common.email}:</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{t.admin.saveChanges}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      <ModalFrame
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        titleId="admin-product-modal-title"
      >
        <div className="space-y-5">
          <h3 id="admin-product-modal-title" className="text-lg font-bold text-gray-900">
            {editingProductId
              ? language === 'ar'
                ? 'تعديل بيانات المنتج'
                : 'Edit Product'
              : language === 'ar'
              ? `إضافة منتج جديد (${prodTrousseau === 'groom' ? 'العريس' : 'العروسة'})`
              : `Add Product (${prodTrousseau})`}
          </h3>

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'اسم المنتج (عربي):' : 'Name (AR):'}
                </label>
                <input
                  type="text"
                  required
                  value={prodNameAr}
                  onChange={(e) => setProdNameAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs outline-none focus:border-[#D91B3E]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Name (EN):</label>
                <input
                  type="text"
                  value={prodNameEn}
                  onChange={(e) => setProdNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs outline-none focus:border-[#D91B3E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'الماركة:' : 'Brand:'}
                </label>
                <input
                  type="text"
                  required
                  value={prodBrand}
                  onChange={(e) => setProdBrand(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'السعر:' : 'Price:'}
                </label>
                <input
                  type="number"
                  min={10}
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'المخزون:' : 'Stock:'}
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'رابط الصورة:' : 'Image URL:'}
              </label>
              <input
                type="text"
                required
                value={prodImage}
                onChange={(e) => setProdImage(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md cursor-pointer"
              >
                {t.admin.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </ModalFrame>

      {/* Add/Edit Wedding Service Modal */}
      <ModalFrame
        isOpen={showWeddingServiceModal}
        onClose={() => setShowWeddingServiceModal(false)}
        titleId="admin-wedding-modal-title"
      >
        <div className="space-y-5">
          <h3 id="admin-wedding-modal-title" className="text-lg font-bold text-gray-900">
            {editingServiceId
              ? language === 'ar'
                ? 'تعديل خدمة الفرح'
                : 'Edit Wedding Service'
              : language === 'ar'
              ? 'إضافة خدمة فرح جديدة'
              : 'Add Wedding Service'}
          </h3>
          <form onSubmit={handleSaveWeddingService} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Name (AR):</label>
                <input
                  type="text"
                  required
                  value={srvNameAr}
                  onChange={(e) => setSrvNameAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Name (EN):</label>
                <input
                  type="text"
                  value={srvNameEn}
                  onChange={(e) => setSrvNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Category:</label>
                <select
                  value={srvCategory}
                  onChange={(e) => setSrvCategory(e.target.value as WeddingServiceItem['category'])}
                  className="w-full p-2.5 rounded-xl border text-xs"
                >
                  <option value="venue">venue</option>
                  <option value="dress">dress</option>
                  <option value="photography">photography</option>
                  <option value="car">car</option>
                  <option value="package">package</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Starting Price (EGP):</label>
                <input
                  type="number"
                  min={500}
                  required
                  value={srvPrice}
                  onChange={(e) => setSrvPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Location (AR):</label>
                <input
                  type="text"
                  required
                  value={srvLocationAr}
                  onChange={(e) => setSrvLocationAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Location (EN):</label>
                <input
                  type="text"
                  required
                  value={srvLocationEn}
                  onChange={(e) => setSrvLocationEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowWeddingServiceModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-xl cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer"
              >
                {t.admin.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </ModalFrame>

      {/* Publish CMS Article Modal */}
      <ModalFrame
        isOpen={showArticleModal}
        onClose={() => setShowArticleModal(false)}
        titleId="admin-article-modal-title"
      >
        <div className="space-y-5">
          <h3 id="admin-article-modal-title" className="text-lg font-bold text-gray-900">
            {language === 'ar' ? 'نشر دليل جديد في الموسوعة' : 'Publish Encyclopedia Guide'}
          </h3>
          <form onSubmit={handleCreateArticle} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">URL Slug:</label>
                <input
                  type="text"
                  required
                  placeholder="egypt-paint-guide"
                  value={artSlug}
                  onChange={(e) => setArtSlug(e.target.value)}
                  className="w-full p-2 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Domain:</label>
                <select
                  value={artDomain}
                  onChange={(e) => setArtDomain(e.target.value as Article['domain'])}
                  className="w-full p-2 rounded-xl border text-xs"
                >
                  <option value="finishing">finishing</option>
                  <option value="groom">groom</option>
                  <option value="bride">bride</option>
                  <option value="wedding">wedding</option>
                  <option value="early_start">early_start</option>
                  <option value="married_life">married_life</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Category:</label>
              <select
                value={artCategoryId}
                onChange={(e) => setArtCategoryId(e.target.value)}
                className="w-full p-2 rounded-xl border text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {language === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Title (AR):</label>
                <input
                  type="text"
                  required
                  value={artTitleAr}
                  onChange={(e) => setArtTitleAr(e.target.value)}
                  className="w-full p-2 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Title (EN):</label>
                <input
                  type="text"
                  required
                  value={artTitleEn}
                  onChange={(e) => setArtTitleEn(e.target.value)}
                  className="w-full p-2 rounded-xl border text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Body (AR, min 20 chars):</label>
                <textarea
                  rows={3}
                  required
                  minLength={20}
                  value={artBodyAr}
                  onChange={(e) => setArtBodyAr(e.target.value)}
                  className="w-full p-2 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Body (EN, min 20 chars):</label>
                <textarea
                  rows={3}
                  required
                  minLength={20}
                  value={artBodyEn}
                  onChange={(e) => setArtBodyEn(e.target.value)}
                  className="w-full p-2 rounded-xl border text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowArticleModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-xl cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer"
              >
                {language === 'ar' ? 'نشر المقال' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      </ModalFrame>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Eye,
  Check,
  CreditCard,
  FileCheck2,
  BookOpen,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { initialBridePackages } from '../../data/initialData';
import { analyzeBrideTrousseauPlan } from '../../../shared/trousseauEncyclopediaData';
import type { BrideChecklistTemplateItem, Product } from '../../types';
import { SmartImage } from '../common/SmartImage';

export const BrideView: React.FC = () => {
  const {
    language,
    t,
    dir,
    products,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setSelectedProduct,
    setProductDetailModalOpen,
    setInstallmentModalOpen,
    setInstallmentPrefillAmount,
    toggleBrideChecklistItem,
    brideCategories,
    brideChecklistTemplates,
    userBridePlan,
    saveUserBridePlan,
    currentUser,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const brideProducts = products.filter((p) => p.trousseauType === 'bride');

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stage 2 Smart Bridal Planner Filter & Custom Item Controls
  const [checklistCategoryFilter, setChecklistCategoryFilter] = useState<string>('all');
  const [customItemLabel, setCustomItemLabel] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<string>(
    brideCategories[0]?.id || 'b-cat-01',
  );
  const [customItemPrice, setCustomItemPrice] = useState<number>(1500);
  const [customItemQty, setCustomItemQty] = useState<number>(1);
  const [showMissingBannerDetails, setShowMissingBannerDetails] = useState(false);

  const analysis = useMemo(
    () =>
      analyzeBrideTrousseauPlan({
        presetMode: userBridePlan.presetMode,
        checkedItemIds: userBridePlan.checkedItemIds,
        qtyOverrides: userBridePlan.qtyOverrides,
        customItems: userBridePlan.customItems,
        categories: brideCategories,
        templateItems: brideChecklistTemplates,
      }),
    [userBridePlan, brideCategories, brideChecklistTemplates],
  );

  const visibleChecklistTemplates = useMemo(() => {
    if (checklistCategoryFilter === 'all') return analysis.activeTemplateItems;
    return analysis.activeTemplateItems.filter((item) => item.categoryId === checklistCategoryFilter);
  }, [analysis.activeTemplateItems, checklistCategoryFilter]);

  const checklistProgress = analysis.completionPercent;

  const handleSetPreset = (presetMode: 'compact' | 'balanced' | 'extended') => {
    saveUserBridePlan((prev) => ({
      ...prev,
      presetMode,
    }));
  };

  const handleAdjustQty = (item: BrideChecklistTemplateItem, delta: number) => {
    saveUserBridePlan((prev) => {
      const current = prev.qtyOverrides[item.id] ?? item.recommendedQty;
      const next = Math.max(1, Math.min(50, current + delta));
      return {
        ...prev,
        qtyOverrides: {
          ...prev.qtyOverrides,
          [item.id]: next,
        },
      };
    });
  };

  const handleAddCustomBridalItem = (e: React.FormEvent) => {
    e.preventDefault();
    const label = customItemLabel.trim();
    if (!label) return;
    const newItem = {
      id: `custom-${Date.now().toString(36)}`,
      categoryId: customItemCategory,
      labelAr: label,
      labelEn: label,
      qty: Math.max(1, Math.min(50, customItemQty || 1)),
      estimatedUnitPriceEgp: Math.max(0, customItemPrice || 0),
      checked: false,
    };
    saveUserBridePlan((prev) => ({
      ...prev,
      customItems: [...prev.customItems, newItem],
    }));
    setCustomItemLabel('');
  };

  const handleToggleCustomBridalItem = (id: string) => {
    saveUserBridePlan((prev) => ({
      ...prev,
      customItems: prev.customItems.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)),
    }));
  };

  const handleRemoveCustomBridalItem = (id: string) => {
    saveUserBridePlan((prev) => ({
      ...prev,
      customItems: prev.customItems.filter((c) => c.id !== id),
    }));
  };

  const categories = [
    { key: 'all', label: t.groom.allCategories },
    { key: 'cookware', label: t.bride.cookware },
    { key: 'dinnerware', label: t.bride.dinnerware },
    { key: 'linens', label: t.bride.linens },
    { key: 'towels', label: t.bride.towels },
    { key: 'appliances', label: t.bride.appliances },
  ];

  const filteredProducts = brideProducts.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      (p.nameAr + p.nameEn + p.brand).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-16 pb-24">
      {/* 1. Header Banner */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'القسم الثالث — جهاز العروسة'
                  : "Section 03 — Bride's Trousseau"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.bride.title}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">{t.bride.subtitle}</p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('bride-packages');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-rose-50 text-[#9E122C] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>{t.bride.readyPackagesTitle}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('bridal-checklist');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-rose-200" />
                <span>{t.bride.customChecklistTitle}</span>
              </button>

              <Link
                to="/bride/encyclopedia"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-rose-200" />
                <span>
                  {language === 'ar' ? 'موسوعة العروسة (19 فئة)' : 'Bride Encyclopedia (19)'}
                </span>
              </Link>

              <Link
                to="/products?trousseauType=bride"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-rose-200" />
                <span>
                  {language === 'ar' ? 'موسوعة منتجات العروسة والأسعار' : 'Bridal Products & Prices'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* 2. Ready-Made Bride Packages */}
        <div id="bride-packages" className="space-y-6 scroll-mt-24">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-[#D91B3E] uppercase block">
                {language === 'ar'
                  ? 'باقة متكاملة توفر عليكِ عناء البحث'
                  : 'Comprehensive Turnkey Package'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                {t.bride.readyPackagesTitle}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {initialBridePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-rose-100 hover:border-red-300 shadow-xl hover:shadow-2xl transition grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden group"
              >
                <div className="absolute top-0 end-0 bg-red-gradient text-white font-black text-xs px-5 py-2 rounded-bl-3xl shadow-sm">
                  {language === 'ar'
                    ? `وفر ${pkg.savings.toLocaleString()} ج.م خصم العروسة`
                    : `Save ${pkg.savings.toLocaleString()} EGP Bridal Bundle`}
                </div>

                <div className="lg:col-span-7 space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#D91B3E] uppercase tracking-wider block">
                      {language === 'ar'
                        ? 'جهاز المطبخ والمفروشات الفاخرة'
                        : 'Kitchenware, Fine China & Turkish Bedding'}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                      {language === 'ar' ? pkg.nameAr : pkg.nameEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {language === 'ar' ? pkg.taglineAr : pkg.taglineEn}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700 block">
                      {language === 'ar'
                        ? 'محتويات الباقة الملكية للعروسة:'
                        : 'Included Royal Bundle Items:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(language === 'ar' ? pkg.itemsAr : pkg.itemsEn).map((it, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-[#D91B3E] shrink-0 mt-0.5" />
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-rose-100 flex items-center gap-2 text-xs text-[#D91B3E]">
                    <Sparkles className="w-4 h-4 text-[#D91B3E] shrink-0" />
                    <span>{t.bride.customPackageAlert}</span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white p-7 rounded-2xl space-y-6 shadow-xl border border-rose-900/30">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-xs text-gray-400 block line-through">
                      {pkg.originalPrice.toLocaleString()} {t.groom.egp}
                    </span>
                    <div className="text-3xl font-black text-[#FF4D6D] mt-1">
                      {pkg.totalPrice.toLocaleString()}{' '}
                      <span className="text-sm text-gray-300">{t.groom.egp}</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold block mt-1">
                      {language === 'ar'
                        ? 'شامل التوصيل المبطن والهدايا'
                        : 'Inclusive of padded transport & gifts'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        const sampleProduct: Product = {
                          id: pkg.id,
                          trousseauType: 'bride',
                          category: 'packages',
                          categoryAr: 'باقة عروسة كاملة',
                          categoryEn: 'Bride Complete Package',
                          nameAr: pkg.nameAr,
                          nameEn: pkg.nameEn,
                          brand: 'Gawaz Inn Bridal',
                          price: pkg.totalPrice,
                          sku: pkg.id,
                          stock: 7,
                          imageUrl: pkg.imageUrl,
                          descriptionAr: pkg.taglineAr,
                          descriptionEn: pkg.taglineEn,
                          specsAr: { المحتويات: `${pkg.itemsCount} أطقم رئيسية` },
                          specsEn: { Contents: `${pkg.itemsCount} main sets` },
                        };
                        addToCart(sampleProduct, 1);
                      }}
                      className="w-full bg-red-gradient text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                      <span>{t.groom.addToCart}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInstallmentPrefillAmount(pkg.totalPrice);
                        setInstallmentModalOpen(true);
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-3 px-4 rounded-xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-rose-200" />
                      <span>
                        {language === 'ar'
                          ? 'طلب تقسيط جهاز العروسة'
                          : 'Finance Bridal Trousseau'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Persisted Interactive Smart Bridal Checklist & Trousseau Analyzer */}
        <div id="bridal-checklist" className="scroll-mt-24">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-rose-100 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 text-[#D91B3E] text-xs font-bold border border-red-100">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#D91B3E]" />
                  <span>
                    {language === 'ar'
                      ? 'منظم جهاز العروسة الذكي (19 فئة كاملة)'
                      : 'Interactive Smart Bridal Planner'}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {t.bride.customChecklistTitle}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {language === 'ar'
                    ? 'اختاري نمط الجهاز (مختصر / متوازن / موسع)، عدّلي الكميات، أو أضيفي بنودك الخاصة — تُحفظ الخطة تلقائياً.'
                    : 'Choose compact, balanced, or extended templates, adjust quantities, detect missing essentials, and add custom items.'}
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-rose-100 flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <span data-testid="bride-checklist-progress" className="text-2xl font-black text-[#D91B3E]">
                    {checklistProgress}%
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {language === 'ar' ? 'اكتمال الجهاز' : 'Complete'}
                  </span>
                </div>
                <div className="w-28 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-red-gradient h-full transition-all duration-500"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Preset Modes + Estimated Spend Bar + Category Filter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-rose-100">
              <div className="lg:col-span-5 flex flex-wrap gap-2">
                {(
                  [
                    { key: 'compact', ar: 'مضغوط (أساسي)', en: 'Compact' },
                    { key: 'balanced', ar: 'متوازن (الموصى به)', en: 'Balanced' },
                    { key: 'extended', ar: 'موسّع شامل', en: 'Extended' },
                  ] as const
                ).map((mode) => {
                  const active = userBridePlan.presetMode === mode.key;
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      data-testid={`bride-preset-${mode.key}`}
                      onClick={() => handleSetPreset(mode.key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-[#D91B3E] text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                      }`}
                    >
                      {language === 'ar' ? mode.ar : mode.en}
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-4 flex flex-wrap items-center gap-3 text-xs">
                <div className="bg-white px-3 py-2 rounded-xl border border-rose-100">
                  <span className="text-gray-500">{language === 'ar' ? 'تم إنفاقه: ' : 'Spent: '}</span>
                  <strong className="text-emerald-700">
                    {analysis.completedEstimatedSpendEgp.toLocaleString()} {t.groom.egp}
                  </strong>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl border border-rose-100">
                  <span className="text-gray-500">{language === 'ar' ? 'إجمالي التقدير: ' : 'Total: '}</span>
                  <strong className="text-[#D91B3E]">
                    {analysis.estimatedTemplateTotalEgp.toLocaleString()} {t.groom.egp}
                  </strong>
                </div>
              </div>

              <div className="lg:col-span-3">
                <select
                  value={checklistCategoryFilter}
                  onChange={(e) => setChecklistCategoryFilter(e.target.value)}
                  data-testid="bride-checklist-cat-filter"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold focus:border-[#D91B3E] outline-none"
                >
                  <option value="all">
                    {language === 'ar' ? 'كل الـ 19 فئة في القائمة' : 'All 19 Bridal Categories'}
                  </option>
                  {brideCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Missing Essentials Alert */}
            {analysis.missingEssentialItems.length > 0 && (
              <div
                data-testid="bride-missing-essentials"
                className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {language === 'ar'
                        ? `تنبيه النواقص: يتبقى ${analysis.missingEssentialItems.length} بنود أساسية ضرورية قبل الزفاف`
                        : `Missing Essentials Warning: ${analysis.missingEssentialItems.length} essential items remaining`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMissingBannerDetails((prev) => !prev)}
                    className="text-[11px] font-bold text-[#B31331] underline cursor-pointer"
                  >
                    {showMissingBannerDetails
                      ? language === 'ar'
                        ? 'إخفاء القائمة'
                        : 'Hide List'
                      : language === 'ar'
                      ? 'عرض النواقص'
                      : 'View Missing Items'}
                  </button>
                </div>

                {showMissingBannerDetails && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysis.missingEssentialItems.map((m) => (
                      <span
                        key={m.id}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-semibold text-amber-900"
                      >
                        {language === 'ar' ? m.labelAr : m.labelEn}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Template Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleChecklistTemplates.map((item) => {
                const isDone = userBridePlan.checkedItemIds.includes(item.id);
                const qty = userBridePlan.qtyOverrides[item.id] ?? item.recommendedQty;
                const estLineCost = qty * item.estimatedUnitPriceEgp;
                const priorityLabel =
                  item.priority === 'essential'
                    ? language === 'ar'
                      ? 'أساسي'
                      : 'Essential'
                    : item.priority === 'recommended'
                    ? language === 'ar'
                      ? 'موصى به'
                      : 'Recommended'
                    : language === 'ar'
                    ? 'اختياري'
                    : 'Optional';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between gap-3 ${
                      isDone
                        ? 'bg-rose-50/60 border-[#D91B3E] shadow-sm'
                        : 'bg-white border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleBrideChecklistItem(item.id)}
                      aria-pressed={isDone}
                      data-testid={`bride-check-${item.id}`}
                      className="w-full flex items-start gap-3 text-start cursor-pointer"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isDone ? 'bg-[#D91B3E] border-[#D91B3E] text-white' : 'border-gray-400'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.priority === 'essential'
                                ? 'bg-[#FDE8ED] text-[#B31331]'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {priorityLabel}
                          </span>
                          <span className="text-[11px] font-bold text-[#D91B3E]">
                            {estLineCost.toLocaleString()} {t.groom.egp}
                          </span>
                        </div>
                        <p
                          className={`text-xs font-bold leading-snug ${
                            isDone ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}
                        >
                          {language === 'ar' ? item.labelAr : item.labelEn}
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">
                          {language === 'ar' ? item.noteAr : item.noteEn}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                      <span className="text-gray-500 font-semibold">
                        {isDone
                          ? language === 'ar'
                            ? 'تم شراؤه ✓'
                            : 'Purchased ✓'
                          : language === 'ar'
                            ? 'متبقي للشراء'
                            : 'Pending'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustQty(item, -1)}
                          aria-label="Decrease quantity"
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-[#FDE8ED] text-gray-700 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-[#2A1D20] min-w-[3.2rem] text-center">
                          {qty} {language === 'ar' ? item.unitLabelAr : item.unitLabelEn}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustQty(item, 1)}
                          aria-label="Increase quantity"
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-[#FDE8ED] text-gray-700 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Bridal Items + Inline Add Form */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-rose-100 space-y-4">
              <h4 className="text-sm font-black text-[#2A1D20]">
                {language === 'ar'
                  ? 'أضيفي بنداً خاصاً بكِ لقائمة جهاز العروسة'
                  : 'Add Your Own Custom Bridal Item'}
              </h4>
              <form onSubmit={handleAddCustomBridalItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <input
                  type="text"
                  value={customItemLabel}
                  onChange={(e) => setCustomItemLabel(e.target.value)}
                  data-testid="bride-custom-label-input"
                  placeholder={
                    language === 'ar'
                      ? 'اسم البند (مثال: ماكينة قهوة، غلاية إضافية...)'
                      : 'Custom item name (e.g. Espresso machine...)'
                  }
                  className="sm:col-span-5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:border-[#D91B3E] outline-none"
                />
                <select
                  value={customItemCategory}
                  onChange={(e) => setCustomItemCategory(e.target.value)}
                  className="sm:col-span-3 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:border-[#D91B3E] outline-none"
                >
                  {brideCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={customItemQty}
                  onChange={(e) => setCustomItemQty(Number(e.target.value) || 1)}
                  className="sm:col-span-1 px-2.5 py-2 rounded-xl bg-white border border-gray-200 text-xs text-center focus:border-[#D91B3E] outline-none"
                  title={language === 'ar' ? 'الكمية' : 'Qty'}
                />
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(Number(e.target.value) || 0)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:border-[#D91B3E] outline-none"
                  title={language === 'ar' ? 'السعر التقديري' : 'Est. EGP'}
                />
                <button
                  type="submit"
                  data-testid="bride-add-custom-btn"
                  className="sm:col-span-1 py-2 px-3 rounded-xl bg-[#D91B3E] text-white text-xs font-bold hover:opacity-95 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="sm:hidden">{language === 'ar' ? 'إضافة' : 'Add'}</span>
                </button>
              </form>

              {userBridePlan.customItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  {userBridePlan.customItems.map((ci) => (
                    <div
                      key={ci.id}
                      data-testid={`bride-custom-item-${ci.id}`}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white border border-rose-200"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleCustomBridalItem(ci.id)}
                        className="flex items-center gap-2 text-start min-w-0 flex-1 cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            ci.checked ? 'bg-[#D91B3E] border-[#D91B3E] text-white' : 'border-gray-400'
                          }`}
                        >
                          {ci.checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              ci.checked ? 'text-gray-400 line-through' : 'text-[#2A1D20]'
                            }`}
                          >
                            {language === 'ar' ? ci.labelAr : ci.labelEn}
                          </p>
                          <span className="text-[10px] text-gray-500">
                            {ci.qty} × {ci.estimatedUnitPriceEgp.toLocaleString()} {t.groom.egp}
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomBridalItem(ci.id)}
                        aria-label="Remove custom item"
                        className="text-gray-400 hover:text-[#D91B3E] cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                {currentUser
                  ? language === 'ar'
                    ? '✓ يتم حفظ تقدمك وكمياتك تلقائياً في حسابك السحابي.'
                    : '✓ Progress & custom items automatically sync to your signed-in account.'
                  : language === 'ar'
                  ? 'يتم حفظ اختياراتك تلقائياً على جهازك (سجلي الدخول للمزامنة).'
                  : 'Your checklist progress is saved locally (sign in for cloud sync).'}
              </span>
              <span className="text-[#D91B3E] font-bold">
                {analysis.completedTemplateCount +
                  userBridePlan.customItems.filter((c) => c.checked).length}{' '}
                {language === 'ar' ? 'من' : 'of'}{' '}
                {analysis.activeTemplateItems.length + userBridePlan.customItems.length}{' '}
                {language === 'ar' ? 'بنود منجزة' : 'items completed'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Complete Bride Product Catalog */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
            <div>
              <span className="text-xs font-bold text-[#D91B3E] uppercase block">
                {language === 'ar' ? 'كتالوج مستلزمات العروسة' : 'Bridal Essentials'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                {language === 'ar'
                  ? 'تصفح أطقم الحلل والمفروشات والصيني'
                  : 'Cookware, Bedding & Fine Dining'}
              </h2>
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder={t.common.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeCategory === cat.key
                  ? 'bg-[#D91B3E] text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-red-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-[#FAF7F2] rounded-3xl p-12 text-center border border-rose-100 space-y-3">
              <p className="text-sm font-bold text-gray-800">
                {language === 'ar'
                  ? 'لا توجد منتجات مطابقة في جهاز العروسة حالياً'
                  : 'No bridal products match your filters'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#D91B3E] underline cursor-pointer"
              >
                {language === 'ar' ? 'إعادة ضبط البحث' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((p) => {
                const inWishlist = isWishlisted(p.id);
                return (
                  <div
                    key={p.id}
                    data-testid={`product-card-${p.id}`}
                    className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-md hover:shadow-xl transition group flex flex-col justify-between"
                  >
                    <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                      <SmartImage
                        src={p.imageUrl}
                        alt={language === 'ar' ? p.nameAr : p.nameEn}
                        fallbackTitle={language === 'ar' ? p.nameAr : p.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      <div className="absolute top-3 start-3 bg-[#1C1819]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-200">
                        {p.brand}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleWishlist(p)}
                        className={`absolute top-3 end-3 p-2 rounded-full shadow-md backdrop-blur-md transition cursor-pointer ${inWishlist
                          ? 'bg-[#D91B3E] text-white'
                          : 'bg-white/80 text-gray-600 hover:text-[#D91B3E]'
                          }`}
                        title={t.nav.wishlist}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-gray-400 font-semibold block mb-1">
                          {language === 'ar' ? p.categoryAr : p.categoryEn}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 line-clamp-2">
                          {language === 'ar' ? p.nameAr : p.nameEn}
                        </h4>
                      </div>

                      <div className="bg-[#FAF7F2] p-3 rounded-xl border border-gray-100 space-y-1 text-[11px] text-gray-600">
                        {Object.entries(language === 'ar' ? p.specsAr : p.specsEn)
                          .slice(0, 2)
                          .map(([k, v], i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-gray-400">{k}:</span>
                              <span className="font-semibold text-gray-700">{v}</span>
                            </div>
                          ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          {p.originalPrice && (
                            <span className="text-xs text-gray-400 line-through block">
                              {p.originalPrice.toLocaleString()} {t.groom.egp}
                            </span>
                          )}
                          <div className="text-xl font-black text-[#D91B3E]">
                            {p.price.toLocaleString()}{' '}
                            <span className="text-xs font-bold text-[#D91B3E]">{t.groom.egp}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {Math.round(p.price / 12).toLocaleString()} {t.groom.perMonth}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => addToCart(p, 1)}
                          className="flex-1 bg-[#D91B3E] hover:bg-[#B31331] text-white font-bold text-xs py-3 px-3 rounded-xl shadow-sm hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t.groom.addToCart}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p);
                            setProductDetailModalOpen(true);
                          }}
                          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                          title={t.groom.detailsBtn}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/products/${p.slug || p.id}`}
                          className="p-3 rounded-xl bg-[#FFF8F9] hover:bg-[#FDE8ED] text-[#B31331] border border-rose-200 transition"
                          title={language === 'ar' ? 'المواصفات وتاريخ السعر' : 'Specs & Price History'}
                        >
                          <BookOpen className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

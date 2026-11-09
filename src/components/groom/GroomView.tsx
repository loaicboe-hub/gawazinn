import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  ShoppingBag,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Layers,
  X,
  CreditCard,
  Check,
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { initialGroomPackages } from '../../data/initialData';
import { calculateConfigurableGroomPackage } from '../../../shared/trousseauEncyclopediaData';
import type { Product } from '../../types';
import { SmartImage } from '../common/SmartImage';

export const GroomView: React.FC<{ onOpenCompare: (prods: Product[]) => void }> = ({
  onOpenCompare,
}) => {
  const {
    language,
    t,
    dir,
    products,
    addToCart,
    setSelectedProduct,
    setProductDetailModalOpen,
    setInstallmentModalOpen,
    setInstallmentPrefillAmount,
    groomBudgetTarget,
    setGroomBudgetTarget,
    groomBudgetItems,
    toggleGroomBudgetItem,
    groomConfigurablePackages,
    userGroomPlan,
    saveUserGroomPlan,
    currentUser,
    showToast,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const groomProducts = products.filter((p) => p.trousseauType === 'groom');

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [customItemInput, setCustomItemInput] = useState('');

  const sortedPackages = useMemo(
    () =>
      [...groomConfigurablePackages].sort((a, b) => a.targetBudgetEgp - b.targetBudgetEgp),
    [groomConfigurablePackages],
  );

  const activeConfigurablePkg = useMemo(() => {
    return (
      sortedPackages.find((pkg) => pkg.tierKey === userGroomPlan.selectedTierKey) ||
      sortedPackages[1] ||
      sortedPackages[0]
    );
  }, [sortedPackages, userGroomPlan.selectedTierKey]);

  const packageCalc = useMemo(() => {
    if (!activeConfigurablePkg) return null;
    return calculateConfigurableGroomPackage(
      activeConfigurablePkg,
      userGroomPlan.slotSelections,
      userGroomPlan.excludedSlots,
    );
  }, [activeConfigurablePkg, userGroomPlan.slotSelections, userGroomPlan.excludedSlots]);

  const handleSelectTier = (tierKey: (typeof sortedPackages)[number]['tierKey'], targetBudgetEgp: number) => {
    saveUserGroomPlan((prev) => ({
      ...prev,
      selectedTierKey: tierKey,
      targetBudgetEgp,
      slotSelections: {},
      excludedSlots: [],
    }));
  };

  const handleSelectSlotOption = (slotKey: string, optionId: string) => {
    saveUserGroomPlan((prev) => ({
      ...prev,
      slotSelections: {
        ...prev.slotSelections,
        [slotKey]: optionId,
      },
      excludedSlots: prev.excludedSlots.filter((k) => k !== slotKey),
    }));
  };

  const handleToggleExcludeSlot = (slotKey: string) => {
    saveUserGroomPlan((prev) => {
      const exists = prev.excludedSlots.includes(slotKey);
      return {
        ...prev,
        excludedSlots: exists
          ? prev.excludedSlots.filter((k) => k !== slotKey)
          : [...prev.excludedSlots, slotKey],
      };
    });
  };

  const handleAddCustomGroomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customItemInput.trim();
    if (!cleaned) return;
    saveUserGroomPlan((prev) => ({
      ...prev,
      customItems: prev.customItems.includes(cleaned)
        ? prev.customItems
        : [...prev.customItems, cleaned],
    }));
    setCustomItemInput('');
  };

  const handleRemoveCustomGroomItem = (label: string) => {
    saveUserGroomPlan((prev) => ({
      ...prev,
      customItems: prev.customItems.filter((item) => item !== label),
    }));
  };

  const handleAddConfiguredPackageToCart = () => {
    if (!activeConfigurablePkg || !packageCalc) return;
    const bundleProduct: Product = {
      id: `${activeConfigurablePkg.id}-custom`,
      trousseauType: 'groom',
      category: 'packages',
      categoryAr: 'باقة عريس مخصصة',
      categoryEn: 'Configured Groom Package',
      nameAr: `${activeConfigurablePkg.nameAr} (مخصصة)`,
      nameEn: `${activeConfigurablePkg.nameEn} (Custom)`,
      brand: 'Gawaz Inn Configurator',
      price: packageCalc.totalEgp,
      sku: activeConfigurablePkg.id,
      stock: 5,
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
      descriptionAr: activeConfigurablePkg.taglineAr,
      descriptionEn: activeConfigurablePkg.taglineEn,
      specsAr: { 'الأبواب المختارة': `${packageCalc.selectedCount} بنود` },
      specsEn: { 'Selected Slots': `${packageCalc.selectedCount} items` },
    };
    addToCart(bundleProduct, 1);
    showToast(
      language === 'ar'
        ? 'تمت إضافة باقتك المخصصة إلى سلة المشتريات ✓'
        : 'Added your configured groom package to cart ✓',
    );
  };

  const categories = [
    { key: 'all', label: t.groom.allCategories },
    { key: 'appliances', label: t.groom.appliances },
    { key: 'electronics', label: t.groom.electronics },
    { key: 'bedroom', label: t.groom.bedroom },
    { key: 'living', label: t.groom.living },
  ];

  const filteredProducts = groomProducts.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      (p.nameAr + p.nameEn + p.brand).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleCompare = (product: Product) => {
    if (compareList.some((p) => p.id === product.id)) {
      setCompareList((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      if (compareList.length >= 3) return;
      setCompareList((prev) => [...prev, product]);
    }
  };

  const totalBudgetSpent = groomProducts
    .filter((p) => groomBudgetItems.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const budgetRemaining = groomBudgetTarget - totalBudgetSpent;

  const handleAddAllBudgetToCart = () => {
    const itemsToAdd = groomProducts.filter((p) => groomBudgetItems.includes(p.id));
    itemsToAdd.forEach((p) => addToCart(p, 1));
  };

  return (
    <div className="space-y-16 pb-24">
      {/* 1. Header Banner */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Briefcase className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'القسم الثاني — جهاز العريس'
                  : "Section 02 — Groom's Trousseau"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.groom.title}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">{t.groom.subtitle}</p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('groom-packages');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-rose-50 text-[#9E122C] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>{t.groom.readyPackagesTitle}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('groom-configurable');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-rose-200" />
                <span>
                  {language === 'ar'
                    ? 'مصمم الباقات (100–500 ألف)'
                    : 'Package Configurator (100k–500k)'}
                </span>
              </button>

              <Link
                to="/groom/encyclopedia"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-rose-200" />
                <span>
                  {language === 'ar' ? 'موسوعة العريس (26 دليل)' : 'Groom Encyclopedia (26)'}
                </span>
              </Link>

              <Link
                to="/products?trousseauType=groom"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-rose-200" />
                <span>
                  {language === 'ar' ? 'موسوعة الأجهزة وتاريخ الأسعار' : 'Product Specs & Price History'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* 2. Ready-Made Money Saving Packages */}
        <div id="groom-packages" className="space-y-6 scroll-mt-24">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-[#D91B3E] uppercase block">
                {language === 'ar' ? 'باقات شاملة بخصم مجمع' : 'Curated Value Bundles'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                {t.groom.readyPackagesTitle}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {initialGroomPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-7 border-2 border-rose-100 hover:border-red-300 shadow-xl hover:shadow-2xl transition flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 end-0 bg-red-gradient text-white font-black text-xs px-4 py-1.5 rounded-bl-2xl shadow-sm">
                  {language === 'ar'
                    ? `وفر ${pkg.savings.toLocaleString()} ج.م`
                    : `Save ${pkg.savings.toLocaleString()} EGP`}
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    {language === 'ar' ? pkg.nameAr : pkg.nameEn}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {language === 'ar' ? pkg.taglineAr : pkg.taglineEn}
                  </p>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-rose-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 line-through block">
                        {pkg.originalPrice.toLocaleString()} {t.groom.egp}
                      </span>
                      <div className="text-2xl font-black text-[#D91B3E]">
                        {pkg.totalPrice.toLocaleString()}{' '}
                        <span className="text-xs font-bold text-[#D91B3E]">{t.groom.egp}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-red-50 text-[#D91B3E] border border-red-200 px-3 py-1.5 rounded-xl font-bold">
                      {pkg.itemsCount} {language === 'ar' ? 'أجهزة وقطع أساسية' : 'Key Items'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700 block">
                      {language === 'ar' ? 'محتويات الباقة:' : 'Package Contents:'}
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {(language === 'ar' ? pkg.itemsAr : pkg.itemsEn).map((it, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#D91B3E] shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleProduct: Product = {
                        id: pkg.id,
                        trousseauType: 'groom',
                        category: 'packages',
                        categoryAr: 'باقة عريس كاملة',
                        categoryEn: 'Groom Complete Package',
                        nameAr: pkg.nameAr,
                        nameEn: pkg.nameEn,
                        brand: 'Gawaz Inn Curated',
                        price: pkg.totalPrice,
                        sku: pkg.id,
                        stock: 5,
                        imageUrl: pkg.imageUrl,
                        descriptionAr: pkg.taglineAr,
                        descriptionEn: pkg.taglineEn,
                        specsAr: { 'عدد العناصر': `${pkg.itemsCount} قطع` },
                        specsEn: { Items: `${pkg.itemsCount} items` },
                      };
                      addToCart(sampleProduct, 1);
                    }}
                    className="flex-1 bg-red-gradient text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
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
                    className="bg-[#1C1819] hover:bg-[#D91B3E] text-white text-xs font-bold py-3.5 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    title={language === 'ar' ? 'طلب تقسيط الباقة' : 'Finance Package'}
                  >
                    <CreditCard className="w-4 h-4 text-rose-200" />
                    <span>{language === 'ar' ? 'تقسيط الباقة' : 'Finance'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2.5 Interactive Tiered Groom Package Configurator (100k / 200k / 300k / 500k + Swapping) */}
        {activeConfigurablePkg && packageCalc && (
          <section id="groom-configurable" className="scroll-mt-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-rose-100 shadow-xl space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FDE8ED] text-[#B31331] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#D91B3E]" />
                    <span>
                      {language === 'ar'
                        ? 'مصمم باقة العريس التفاعلي — بدّل واختر بحرية'
                        : 'Interactive Tier Configurator — Swap Any Item Freely'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#2A1D20]">
                    {language === 'ar'
                      ? 'صمم باقتك: 100 ألف إلى 500 ألف ج.م'
                      : 'Configure Your 100k – 500k EGP Trousseau Package'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {language === 'ar'
                      ? 'قارن البدائل الاقتصادية والمتوازنة والفاخرة لكل بند، احذف البنود غير المطلوبة الآن، واحفظ خطتك لحسابك.'
                      : 'Switch budget tiers, swap economic/balanced/premium items per slot, or exclude optional rooms. Plans sync automatically.'}
                  </p>
                </div>

                <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-gray-600 border border-rose-100 shrink-0 self-start">
                  {currentUser
                    ? language === 'ar'
                      ? '✓ محفوظ تلقائياً في حسابك السحابي'
                      : '✓ Synced to your signed-in account'
                    : language === 'ar'
                    ? 'محفوظ محلياً • سجل الدخول للمزامنة'
                    : 'Saved locally • Sign in to cloud-sync'}
                </span>
              </div>

              {/* Tier Selection Tabs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {sortedPackages.map((pkg) => {
                  const isActive = pkg.tierKey === activeConfigurablePkg.tierKey;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      data-testid={`groom-tier-${pkg.tierKey}`}
                      onClick={() => handleSelectTier(pkg.tierKey, pkg.targetBudgetEgp)}
                      className={`p-4 rounded-2xl border-2 text-start transition cursor-pointer ${
                        isActive
                          ? 'bg-red-gradient text-white border-[#B31331] shadow-lg'
                          : 'bg-[#FAF7F2] text-[#2A1D20] border-rose-100 hover:border-[#D91B3E]/40'
                      }`}
                    >
                      <div className="text-base sm:text-lg font-black">
                        {pkg.targetBudgetEgp.toLocaleString()} {t.groom.egp}
                      </div>
                      <div
                        className={`text-[11px] font-semibold mt-1 line-clamp-1 ${
                          isActive ? 'text-rose-100' : 'text-gray-600'
                        }`}
                      >
                        {language === 'ar' ? pkg.nameAr : pkg.nameEn}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Package Description & Slots + Live Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Slot Cards */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[#2A1D20]">
                        {language === 'ar' ? activeConfigurablePkg.nameAr : activeConfigurablePkg.nameEn}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {language === 'ar' ? activeConfigurablePkg.taglineAr : activeConfigurablePkg.taglineEn}
                      </p>
                    </div>
                  </div>

                  {activeConfigurablePkg.slots.map((slot) => {
                    const resolved = packageCalc.resolvedSlots.find((r) => r.slotKey === slot.slotKey);
                    const isExcluded = resolved?.excluded ?? false;
                    const chosenOptId = resolved?.selectedOption.optionId || slot.defaultOptionId;

                    return (
                      <div
                        key={slot.slotKey}
                        data-testid={`groom-slot-${slot.slotKey}`}
                        className={`rounded-2xl p-4 sm:p-5 border transition space-y-3 ${
                          isExcluded
                            ? 'bg-gray-50 border-gray-200 opacity-75'
                            : 'bg-white border-rose-100 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#2A1D20]">
                              {language === 'ar' ? slot.slotLabelAr : slot.slotLabelEn}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                slot.required
                                  ? 'bg-[#FDE8ED] text-[#B31331]'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {slot.required
                                ? language === 'ar'
                                  ? 'بند رئيسي'
                                  : 'Core Slot'
                                : language === 'ar'
                                ? 'اختياري'
                                : 'Optional'}
                            </span>
                          </div>

                          {!slot.required && (
                            <button
                              type="button"
                              data-testid={`slot-toggle-exclude-${slot.slotKey}`}
                              onClick={() => handleToggleExcludeSlot(slot.slotKey)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                isExcluded
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                              }`}
                            >
                              {isExcluded
                                ? language === 'ar'
                                  ? '+ تضمين البند'
                                  : '+ Re-Include'
                                : language === 'ar'
                                ? 'استبعاد من الباقة'
                                : 'Exclude Slot'}
                            </button>
                          )}
                        </div>

                        {!isExcluded && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            {slot.options.map((opt) => {
                              const isChosen = opt.optionId === chosenOptId;
                              const tierTag =
                                opt.tierLevel === 'economic'
                                  ? language === 'ar'
                                    ? 'اقتصادي'
                                    : 'Economic'
                                  : opt.tierLevel === 'balanced'
                                  ? language === 'ar'
                                    ? 'متوازن'
                                    : 'Balanced'
                                  : language === 'ar'
                                  ? 'فاخر'
                                  : 'Premium';

                              return (
                                <button
                                  key={opt.optionId}
                                  type="button"
                                  data-testid={`slot-opt-${slot.slotKey}-${opt.optionId}`}
                                  onClick={() => handleSelectSlotOption(slot.slotKey, opt.optionId)}
                                  className={`p-3 rounded-xl border text-start transition cursor-pointer flex flex-col justify-between space-y-2 ${
                                    isChosen
                                      ? 'bg-[#FDE8ED]/70 border-[#D91B3E] shadow-sm'
                                      : 'bg-[#FAF7F2]/60 border-gray-200 hover:border-rose-200'
                                  }`}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[10px] font-black text-[#B31331]">
                                        {tierTag} • {opt.brand}
                                      </span>
                                      {isChosen && <CheckCircle2 className="w-3.5 h-3.5 text-[#D91B3E] shrink-0" />}
                                    </div>
                                    <p className="text-xs font-bold text-[#2A1D20] leading-snug">
                                      {language === 'ar' ? opt.nameAr : opt.nameEn}
                                    </p>
                                    <p className="text-[10px] text-gray-500 line-clamp-1">
                                      {language === 'ar' ? opt.specsAr : opt.specsEn}
                                    </p>
                                  </div>

                                  <div className="text-xs font-black text-[#D91B3E]">
                                    {opt.priceEgp.toLocaleString()} {t.groom.egp}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Custom User Items */}
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-rose-100 space-y-3">
                    <h4 className="text-xs sm:text-sm font-black text-[#2A1D20]">
                      {language === 'ar'
                        ? 'إضافات خاصة بخطة العريس (مذكراتك الإضافية)'
                        : 'Additional Custom Groom Requirements'}
                    </h4>
                    <form onSubmit={handleAddCustomGroomItem} className="flex gap-2">
                      <input
                        type="text"
                        value={customItemInput}
                        onChange={(e) => setCustomItemInput(e.target.value)}
                        placeholder={
                          language === 'ar'
                            ? 'أضف بنداً خاصاً (مثل: غسالة أطباق، ديب فريزر رأسي...)'
                            : 'Add custom note/item (e.g. Dishwasher, Vertical Freezer...)'
                        }
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:border-[#D91B3E] outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#D91B3E] text-white text-xs font-bold hover:opacity-95 transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
                      </button>
                    </form>

                    {userGroomPlan.customItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {userGroomPlan.customItems.map((ci) => (
                          <span
                            key={ci}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-rose-200 text-xs font-semibold text-[#2A1D20]"
                          >
                            <span>{ci}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomGroomItem(ci)}
                              aria-label="Remove item"
                              className="text-gray-400 hover:text-[#D91B3E] cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sticky Summary Panel */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl border border-rose-900/30">
                  <div className="space-y-1 border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-rose-200">
                      {language === 'ar' ? 'إجمالي باقتك المخصصة الآن' : 'Configured Package Total'}
                    </span>
                    <div
                      data-testid="groom-configured-total"
                      className="text-3xl sm:text-4xl font-black text-white"
                    >
                      {packageCalc.totalEgp.toLocaleString()}{' '}
                      <span className="text-sm font-bold text-rose-200">{t.groom.egp}</span>
                    </div>
                    <p
                      className={`text-xs font-semibold pt-1 ${
                        packageCalc.varianceEgp >= 0 ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {packageCalc.varianceEgp >= 0
                        ? language === 'ar'
                          ? `وفر ${packageCalc.varianceEgp.toLocaleString()} ج.م تحت سقف الباقة (${activeConfigurablePkg.targetBudgetEgp.toLocaleString()})`
                          : `${packageCalc.varianceEgp.toLocaleString()} EGP under ${activeConfigurablePkg.targetBudgetEgp.toLocaleString()} target`
                        : language === 'ar'
                        ? `زيادة ${Math.abs(packageCalc.varianceEgp).toLocaleString()} ج.م عن سقف الباقة`
                        : `${Math.abs(packageCalc.varianceEgp).toLocaleString()} EGP above tier target`}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'البنود النشطة:' : 'Included Slots:'}</span>
                      <strong className="text-white">
                        {packageCalc.selectedCount} / {activeConfigurablePkg.slots.length}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'آخر تحديث للتسعير:' : 'Pricing Baseline:'}</span>
                      <strong className="text-white">
                        {activeConfigurablePkg.priceUpdatedAt.slice(0, 10)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'قسط تقديري (24 شهر):' : 'Est. Monthly (24 mo):'}</span>
                      <strong className="text-[#FF4D6D]">
                        {Math.round(packageCalc.totalEgp / 24).toLocaleString()} {t.groom.egp}
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-300 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
                    {language === 'ar'
                      ? activeConfigurablePkg.warrantyNoteAr
                      : activeConfigurablePkg.warrantyNoteEn}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleAddConfiguredPackageToCart}
                      className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                      <span>
                        {language === 'ar' ? 'أضف الباقة المخصصة للسلة' : 'Add Package to Cart'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInstallmentPrefillAmount(packageCalc.totalEgp);
                        setInstallmentModalOpen(true);
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-3 px-4 rounded-xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-rose-200" />
                      <span>
                        {language === 'ar' ? 'طلب تقسيط هذه الباقة' : 'Apply for Installment'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Persisted Custom Budget Builder */}
        <div id="budget-builder" className="scroll-mt-24">
          <div className="bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-rose-900/30 space-y-8">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-bold border border-white/10">
                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-300" />
                <span>{language === 'ar' ? 'أداة مبتكرة لتنظيم النفقات' : 'Smart Budget Planner'}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {t.groom.customBudgetTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                {language === 'ar'
                  ? 'حدد ميزانيتك المتاحة للأجهزة والأثاث، وتُحفظ اختياراتك تلقائياً لمتابعتها في أي وقت.'
                  : 'Set your target budget and select essential appliances & furniture. Selections persist automatically.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 items-center">
              <div>
                <label htmlFor="groom-budget-slider" className="text-xs text-gray-300 font-bold block mb-1">
                  {language === 'ar' ? 'ميزانيتك المحددة (ج.م):' : 'Target Budget (EGP):'}
                </label>
                <div className="text-2xl font-black text-white">
                  {groomBudgetTarget.toLocaleString()} {t.groom.egp}
                </div>
                <input
                  id="groom-budget-slider"
                  type="range"
                  min={50000}
                  max={400000}
                  step={10000}
                  value={groomBudgetTarget}
                  onChange={(e) => setGroomBudgetTarget(Number(e.target.value))}
                  className="w-full accent-[#D91B3E] mt-2 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-xs text-gray-300 font-bold block mb-1">
                  {language === 'ar' ? 'إجمالي القطع المختارة:' : 'Total Selected Cost:'}
                </span>
                <div className="text-2xl font-black text-[#FF4D6D]">
                  {totalBudgetSpent.toLocaleString()} {t.groom.egp}
                </div>
                <span className="text-xs text-gray-400">
                  {groomBudgetItems.length}{' '}
                  {language === 'ar' ? 'منتجات محددة' : 'items selected'}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-300 font-bold block mb-1">
                  {language === 'ar' ? 'الرصيد المتبقي في ميزانيتك:' : 'Remaining Budget:'}
                </span>
                <div
                  className={`text-2xl font-black ${
                    budgetRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {budgetRemaining.toLocaleString()} {t.groom.egp}
                </div>
                <span className="text-xs text-gray-400">
                  {budgetRemaining >= 0
                    ? language === 'ar'
                      ? 'في حدود الميزانية المحددة'
                      : 'Within budget limits'
                    : language === 'ar'
                    ? 'تجاوزت الميزانية (يمكنك تقسيط الفرق)'
                    : 'Over budget (Financing available)'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                {language === 'ar'
                  ? 'حدد الأجهزة والقطع التي ترغب بإضافتها لحسابك:'
                  : 'Toggle products to include in budget:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groomProducts.map((p) => {
                  const isChecked = groomBudgetItems.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleGroomBudgetItem(p.id)}
                      aria-pressed={isChecked}
                      data-testid={`budget-item-${p.id}`}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-start ${
                        isChecked
                          ? 'bg-[#D91B3E]/20 border-[#D91B3E] text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                            isChecked ? 'bg-[#D91B3E] border-[#D91B3E] text-white' : 'border-gray-500'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">
                            {language === 'ar' ? p.nameAr : p.nameEn}
                          </p>
                          <span className="text-[11px] text-rose-300 font-semibold">
                            {p.price.toLocaleString()} {t.groom.egp}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-300">
                {language === 'ar'
                  ? 'يمكنك تحويل الباقة المخصصة مباشرة إلى سلة الشراء أو تقديم طلب تقسيط.'
                  : 'Add your custom selection directly to cart or apply for financing.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddAllBudgetToCart}
                  disabled={groomBudgetItems.length === 0}
                  className="bg-red-gradient text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>
                    {language === 'ar' ? 'إضافة كافة المحددة للسلة' : 'Add Selected to Cart'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInstallmentPrefillAmount(totalBudgetSpent);
                    setInstallmentModalOpen(true);
                  }}
                  disabled={groomBudgetItems.length === 0}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-3 px-5 rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-rose-200" />
                  <span>
                    {language === 'ar' ? 'طلب تقسيط هذه الباقة' : 'Apply for Installment'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Complete Product Catalog with Filters */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
            <div>
              <span className="text-xs font-bold text-[#D91B3E] uppercase block">
                {language === 'ar' ? 'كتالوج المنتجات الفردية' : 'Full Catalog'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                {language === 'ar' ? 'تصفح أجهزة وأثاث العريس' : 'Explore Appliances & Furniture'}
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeCategory === cat.key
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
                  ? 'لا توجد منتجات مطابقة لبحثك حالياً'
                  : 'No products match your current filters'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#D91B3E] underline cursor-pointer"
              >
                {language === 'ar' ? 'عرض كل منتجات العريس' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((p) => {
                const isComparing = compareList.some((item) => item.id === p.id);
                return (
                  <div
                    key={p.id}
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

                      <div className="absolute top-3 end-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {t.groom.inStock} ({p.stock})
                      </div>
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
                          {Math.round(p.price / 24).toLocaleString()} {t.groom.perMonth}
                        </span>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addToCart(p, 1)}
                            className="flex-1 bg-[#D91B3E] hover:bg-[#B31331] text-white font-bold text-xs py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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

                        <button
                          type="button"
                          onClick={() => toggleCompare(p)}
                          data-testid={`compare-toggle-${p.id}`}
                          className={`w-full py-1.5 rounded-lg text-[11px] font-semibold transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                            isComparing
                              ? 'bg-red-50 text-[#D91B3E] border-red-200'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>
                            {isComparing
                              ? language === 'ar'
                                ? 'تمت الإضافة للمقارنة ✓'
                                : 'In Compare List ✓'
                              : t.groom.compareBtn}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Sticky Floating Comparison Bar — centered cleanly across BOTH RTL and LTR */}
      {compareList.length > 0 && (
        <div
          data-testid="groom-compare-bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1C1819] text-white px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl shadow-2xl border-2 border-[#D91B3E] flex items-center gap-3 sm:gap-6 max-w-xl w-[calc(100%-1.5rem)]"
        >
          <div className="flex items-center gap-2 shrink-0">
            <Layers className="w-5 h-5 text-rose-300" />
            <div>
              <span className="text-xs font-bold block">{t.groom.compareTitle}</span>
              <span className="text-[10px] text-gray-400">
                {compareList.length}{' '}
                {language === 'ar' ? 'منتجات محددة (حد أقصى 3)' : 'products (max 3)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto flex-1 justify-center">
            {compareList.map((cp) => (
              <div key={cp.id} className="relative shrink-0">
                <SmartImage
                  src={cp.imageUrl}
                  alt={language === 'ar' ? cp.nameAr : cp.nameEn}
                  fallbackTitle={cp.brand}
                  className="w-10 h-10 rounded-lg object-cover border border-red-400"
                />
                <button
                  type="button"
                  onClick={() => toggleCompare(cp)}
                  aria-label="Remove from compare"
                  className="absolute -top-1.5 -end-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onOpenCompare(compareList)}
            className="bg-red-gradient text-white font-bold text-xs px-3.5 sm:px-4 py-2 rounded-xl shrink-0 shadow-md cursor-pointer"
          >
            {language === 'ar' ? 'عرض المقارنة' : 'Compare Now'}
          </button>
        </div>
      )}
    </div>
  );
};

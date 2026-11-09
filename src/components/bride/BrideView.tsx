import React, { useState } from 'react';
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
} from 'lucide-react';
import { initialBridePackages } from '../../data/initialData';
import type { Product } from '../../types';
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
    brideChecklist,
    toggleBrideChecklistItem,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const brideProducts = products.filter((p) => p.trousseauType === 'bride');

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const checklistItems = [
    {
      id: 'chk-1',
      labelAr: 'طقم حلل جرانيت تركي (أصلي 11 قطعة)',
      labelEn: 'Turkish Granite Pot Set (11-pc)',
      category: 'kitchen',
    },
    {
      id: 'chk-2',
      labelAr: 'طقم صيني عظمي مذهب كامل لـ 12 فرد',
      labelEn: 'Gold-Trimmed Royal Bone China (124-pc)',
      category: 'dining',
    },
    {
      id: 'chk-3',
      labelAr: 'شنطة معالق وشوك ستانلس ألماني 86 قطعة',
      labelEn: 'Cutlery Set 86-pc in Leather Case',
      category: 'dining',
    },
    {
      id: 'chk-4',
      labelAr: 'مفرش سرير عروسة تركي كافيار ستان مطرز',
      labelEn: 'Turkish Bridal Caviar Satin Bedspread',
      category: 'bedding',
    },
    {
      id: 'chk-5',
      labelAr: 'طقم برنس وبشاكير قطن مصري 100% للعروسين',
      labelEn: 'Couple’s 14-Piece Bathrobe & Towel Set',
      category: 'bath',
    },
    {
      id: 'chk-6',
      labelAr: 'عجان ومحضر طعام كينوود تيتانيوم 7 لتر',
      labelEn: 'Kenwood Chef Titanium Stand Mixer',
      category: 'appliances',
    },
    {
      id: 'chk-7',
      labelAr: 'طقم كاسات كريستال بوهيمي للنيش',
      labelEn: 'Bohemian Crystal Stemware for Showcase',
      category: 'dining',
    },
    {
      id: 'chk-8',
      labelAr: '10 أطقم ملايات قطن تركي ومصري للاستخدام اليومي',
      labelEn: '10 Sets Egyptian & Turkish Everyday Linens',
      category: 'bedding',
    },
  ];

  const checklistProgress = Math.round((brideChecklist.length / checklistItems.length) * 100);

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
                to="/encyclopedia/bride"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-rose-200" />
                <span>
                  {language === 'ar' ? 'قوائم التجهيز الذكية' : 'Smart Trousseau Guides'}
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

        {/* 3. Persisted Interactive Smart Bridal Checklist */}
        <div id="bridal-checklist" className="scroll-mt-24">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-rose-100 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 text-[#D91B3E] text-xs font-bold border border-red-100">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#D91B3E]" />
                  <span>
                    {language === 'ar' ? 'منظم جهاز العروسة الذكي' : 'Interactive Checklist'}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {t.bride.customChecklistTitle}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {language === 'ar'
                    ? 'تابعي ما قمتِ بشرائه وما ينقصك في جهازك، وتُحفظ القائمة تلقائياً في متصفحك.'
                    : 'Track what you have bought and what remains for your bridal trousseau.'}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {checklistItems.map((item) => {
                const isDone = brideChecklist.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleBrideChecklistItem(item.id)}
                    aria-pressed={isDone}
                    data-testid={`bride-check-${item.id}`}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 text-start ${
                      isDone
                        ? 'bg-rose-50/60 border-[#D91B3E] shadow-sm'
                        : 'bg-white border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isDone ? 'bg-[#D91B3E] border-[#D91B3E] text-white' : 'border-gray-400'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="space-y-1">
                      <p
                        className={`text-xs font-bold leading-snug ${
                          isDone ? 'text-gray-400 line-through' : 'text-gray-900'
                        }`}
                      >
                        {language === 'ar' ? item.labelAr : item.labelEn}
                      </p>
                      <span className="text-[10px] text-[#D91B3E] font-semibold block">
                        {isDone
                          ? language === 'ar'
                            ? 'تم شراؤه ✓'
                            : 'Purchased ✓'
                          : language === 'ar'
                          ? 'متبقي للشراء'
                          : 'Pending'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                {language === 'ar'
                  ? 'يتم حفظ اختياراتك تلقائياً على جهازك.'
                  : 'Your checklist progress is saved locally.'}
              </span>
              <span className="text-[#D91B3E] font-bold">
                {brideChecklist.length} {language === 'ar' ? 'من' : 'of'} {checklistItems.length}{' '}
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
                        className={`absolute top-3 end-3 p-2 rounded-full shadow-md backdrop-blur-md transition cursor-pointer ${
                          inWishlist
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

import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookmarkPlus,
  Check,
  GitCompare,
  Layers,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Product, TrousseauType } from '../../types';
import { SmartImage } from '../common/SmartImage';

export const ProductsEncyclopediaView: React.FC = () => {
  const {
    language,
    products,
    addToCart,
    compareProductIds,
    toggleCompareProduct,
    clearCompareProducts,
    isLoggedIn,
    shoppingLists,
    addShoppingListItem,
    setAuthModalOpen,
    showToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const isAr = language === 'ar';
  const paramType = searchParams.get('trousseauType');
  const [typeFilterOverride, setTypeFilterOverride] = useState<'all' | TrousseauType | null>(null);
  const typeFilter: 'all' | TrousseauType =
    typeFilterOverride ??
    (paramType === 'groom' || paramType === 'bride' || paramType === 'finishing'
      ? paramType
      : 'all');
  const setTypeFilter = (next: 'all' | TrousseauType) => {
    setTypeFilterOverride(next);
    if (searchParams.has('trousseauType')) {
      const copy = new URLSearchParams(searchParams);
      if (next === 'all') copy.delete('trousseauType');
      else copy.set('trousseauType', next);
      setSearchParams(copy, { replace: true });
    }
  };
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [energyFilter, setEnergyFilter] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'warranty_desc'>(
    'featured',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('');

  const activeBasketId = useMemo(() => {
    if (selectedListId && shoppingLists.some((l) => l.id === selectedListId)) {
      return selectedListId;
    }
    return shoppingLists[0]?.id ?? '';
  }, [selectedListId, shoppingLists]);

  const categories = useMemo(() => {
    const map = new Map<string, { ar: string; en: string }>();
    for (const p of products) {
      if (!map.has(p.category)) {
        map.set(p.category, { ar: p.categoryAr, en: p.categoryEn });
      }
    }
    return Array.from(map.entries()).map(([key, val]) => ({ key, ...val }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (typeFilter !== 'all' && p.trousseauType !== typeFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (energyFilter !== 'all' && p.energyRating !== energyFilter) return false;
      if (maxPrice > 0 && p.price > maxPrice) return false;
      if (!q) return true;
      return `${p.nameAr} ${p.nameEn} ${p.brand} ${p.model || ''} ${p.categoryAr} ${p.categoryEn} ${p.descriptionAr} ${p.descriptionEn}`
        .toLowerCase()
        .includes(q);
    });

    if (sortBy === 'price_asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'warranty_desc') {
      return [...list].sort((a, b) => (b.warrantyMonths ?? 0) - (a.warrantyMonths ?? 0));
    }
    return [...list].sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
  }, [categoryFilter, energyFilter, maxPrice, products, searchQuery, sortBy, typeFilter]);

  const compareProductsList = useMemo(
    () =>
      compareProductIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [compareProductIds, products],
  );

  const handleSaveToBasket = async (product: Product) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      showToast(
        isAr
          ? 'سجّل الدخول لحفظ المنتج داخل سلال التسوق الخاصة بك.'
          : 'Sign in to save items into your Shopping Baskets.',
      );
      return;
    }
    if (!activeBasketId) {
      showToast(
        isAr
          ? 'افتح صفحة سلال التسوق لإنشاء أول قائمة تسوق.'
          : 'Visit Shopping Baskets first to create your first list.',
      );
      return;
    }
    await addShoppingListItem(activeBasketId, {
      productId: product.id,
      customTitle: isAr ? product.nameAr : product.nameEn,
      categoryLabel: product.category,
      quantity: 1,
      targetUnitPrice: product.price,
      status: 'shortlisted',
      priority: 'medium',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Red & White Editorial Header */}
      <section className="bg-red-gradient text-white py-10 md:py-12 px-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isAr
                    ? 'موسوعة المنتجات والذكاء السعري'
                    : 'Product Encyclopedia & Price Intelligence'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                {isAr
                  ? 'افحص المواصفات، الضمان الحقيقي، وتاريخ السعر قبل الشراء'
                  : 'Inspect Verified Specs, Official Warranty & Price History'}
              </h1>
              <p className="text-sm text-white/90 leading-relaxed">
                {isAr
                  ? 'قارن حتى 4 منتجات جنباً إلى جنب، اكتشف بدائل الميزانية والمساحات الضيقة، واحفظ اختياراتك في سلال تسوق ذكية.'
                  : 'Compare up to 4 products side by side, uncover budget & space-saving alternatives, and organize purchases inside smart baskets.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to={
                  compareProductsList.length > 0
                    ? `/products/compare?ids=${compareProductsList.map((p) => p.id).join(',')}`
                    : '/products/compare'
                }
                data-testid="open-compare-matrix-link"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#D91B3E] font-bold text-xs shadow-sm hover:bg-[#FDE8ED] transition"
              >
                <GitCompare className="w-4 h-4" />
                <span>
                  {isAr
                    ? `مقارنة المنتجات (${compareProductsList.length}/4)`
                    : `Compare Matrix (${compareProductsList.length}/4)`}
                </span>
              </Link>
              <Link
                to="/my/shopping-lists"
                data-testid="open-shopping-lists-link"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2A1D20] text-white font-bold text-xs shadow-sm hover:bg-black/80 transition"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>
                  {isAr ? 'سلال التسوق وتنبيهات الأسعار' : 'Shopping Baskets & Price Alerts'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        {/* Filter & Sort Panel */}
        <div className="bg-white rounded-3xl border border-gray-200 p-4 md:p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
              <input
                type="search"
                data-testid="product-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث بالاسم، الماركة (Sharp, LG, Grohe...) أو الموديل...'
                    : 'Search by product name, brand (Sharp, LG, Grohe...) or model...'
                }
                className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E]"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label={isAr ? 'تصفية بالفئة' : 'Category filter'}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#D91B3E]"
              >
                <option value="all">{isAr ? 'كل التصنيفات' : 'All Categories'}</option>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {isAr ? c.ar : c.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={energyFilter}
                onChange={(e) => setEnergyFilter(e.target.value)}
                aria-label={isAr ? 'كفاءة الطاقة' : 'Energy rating filter'}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#D91B3E]"
              >
                <option value="all">{isAr ? 'كل كفاءات الطاقة' : 'All Energy Classes'}</option>
                <option value="A+++">A+++</option>
                <option value="A++">A++</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                data-testid="product-sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'featured' | 'price_asc' | 'price_desc' | 'warranty_desc',
                  )
                }
                aria-label={isAr ? 'ترتيب المنتجات' : 'Sort products'}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#D91B3E]"
              >
                <option value="featured">{isAr ? 'الأكثر أهمية' : 'Featured First'}</option>
                <option value="price_asc">{isAr ? 'السعر: الأقل للأعلى' : 'Price: Low to High'}</option>
                <option value="price_desc">{isAr ? 'السعر: الأعلى للأقل' : 'Price: High to Low'}</option>
                <option value="warranty_desc">{isAr ? 'أطول فترة ضمان رسمي' : 'Longest Official Warranty'}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'all', ar: 'الكل', en: 'All' },
                  { id: 'groom', ar: 'تجهيز العريس والأجهزة', en: 'Groom Appliances & Furniture' },
                  { id: 'bride', ar: 'جهاز العروسة والمطبخ', en: 'Bride Trousseau & Kitchen' },
                  { id: 'finishing', ar: 'تجهيزات التشطيب', en: 'Finishing Hardware' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`product-type-filter-${tab.id}`}
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    typeFilter === tab.id
                      ? 'bg-[#D91B3E] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-[#FDE8ED] hover:text-[#D91B3E]'
                  }`}
                >
                  {isAr ? tab.ar : tab.en}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                <span>{isAr ? 'حد السعر:' : 'Max EGP:'}</span>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                >
                  <option value={0}>{isAr ? 'بدون حد' : 'No Limit'}</option>
                  <option value={15000}>{isAr ? 'حتى 15,000 ج.م' : 'Up to 15,000'}</option>
                  <option value={25000}>{isAr ? 'حتى 25,000 ج.م' : 'Up to 25,000'}</option>
                  <option value={40000}>{isAr ? 'حتى 40,000 ج.م' : 'Up to 40,000'}</option>
                </select>
              </label>

              {isLoggedIn && shoppingLists.length > 0 && (
                <label className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                  <span>{isAr ? 'السلة النشطة:' : 'Target Basket:'}</span>
                  <select
                    value={activeBasketId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white max-w-[180px]"
                  >
                    {shoppingLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {isAr ? list.titleAr : list.titleEn}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-gray-600 px-1">
          <span>
            {isAr
              ? `عرض ${filteredProducts.length} منتج موثّق بالضمان وسجل الأسعار`
              : `Showing ${filteredProducts.length} products with verified specs & price tracking`}
          </span>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">
              {isAr ? 'لا توجد منتجات مطابقة لهذه الفلاتر' : 'No products match your current filters'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setCategoryFilter('all');
                setEnergyFilter('all');
                setMaxPrice(0);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#D91B3E] text-white text-xs font-bold cursor-pointer"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div
            data-testid="product-encyclopedia-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product) => {
              const inCompare = compareProductIds.includes(product.id);
              const warrantyYears = Math.round(((product.warrantyMonths ?? 12) / 12) * 10) / 10;
              const slugOrId = encodeURIComponent(product.slug || product.id);
              const firstWarning = isAr
                ? product.buyerWarningsAr?.[0]
                : product.buyerWarningsEn?.[0];

              return (
                <article
                  key={product.id}
                  data-testid={`encyclopedia-product-${product.id}`}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 bg-gray-100">
                      <SmartImage
                        src={product.imageUrl}
                        alt={isAr ? product.nameAr : product.nameEn}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
                        <span className="bg-[#D91B3E] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow">
                          {product.brand}
                        </span>
                        {product.energyRating && product.energyRating !== 'N/A' && (
                          <span className="bg-[#2A1D20] text-white px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow">
                            <Zap className="w-3 h-3 text-amber-300" />
                            {product.energyRating}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        data-testid={`compare-toggle-${product.id}`}
                        onClick={() => toggleCompareProduct(product.id)}
                        className={`absolute top-3 end-3 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow transition cursor-pointer inline-flex items-center gap-1 ${
                          inCompare
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/95 text-gray-800 hover:bg-[#FDE8ED] hover:text-[#D91B3E]'
                        }`}
                      >
                        {inCompare ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
                        <span>
                          {inCompare
                            ? isAr
                              ? 'في المقارنة'
                              : 'Comparing'
                            : isAr
                              ? 'قارن'
                              : 'Compare'}
                        </span>
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 font-semibold">
                        <span>{isAr ? product.categoryAr : product.categoryEn}</span>
                        {product.model && <span className="font-mono text-gray-400">{product.model}</span>}
                      </div>

                      <h2 className="text-base font-bold text-[#2A1D20] leading-snug line-clamp-2">
                        <Link
                          to={`/products/${slugOrId}`}
                          className="hover:text-[#D91B3E] transition"
                        >
                          {isAr ? product.nameAr : product.nameEn}
                        </Link>
                      </h2>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-[#FAF7F2] rounded-xl p-2 border border-gray-100">
                          <span className="text-gray-500 block">
                            {isAr ? 'الضمان الرسمي' : 'Warranty'}
                          </span>
                          <strong className="text-[#2A1D20] inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {warrantyYears >= 1
                              ? isAr
                                ? `${warrantyYears} سنوات`
                                : `${warrantyYears} Years`
                              : isAr
                                ? `${product.warrantyMonths ?? 12} شهر`
                                : `${product.warrantyMonths ?? 12} mo`}
                          </strong>
                        </div>
                        <div className="bg-[#FAF7F2] rounded-xl p-2 border border-gray-100">
                          <span className="text-gray-500 block">
                            {isAr ? 'السعة / الأبعاد' : 'Capacity / Size'}
                          </span>
                          <strong className="text-[#2A1D20] truncate block">
                            {product.capacity || product.dimensions || 'Standard'}
                          </strong>
                        </div>
                      </div>

                      {firstWarning && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{firstWarning}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through block">
                            {product.originalPrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                        )}
                        <div className="text-xl font-black text-[#D91B3E]">
                          {product.price.toLocaleString()}{' '}
                          <span className="text-xs font-bold">{isAr ? 'ج.م' : 'EGP'}</span>
                        </div>
                      </div>
                      {product.priceUpdatedAt && (
                        <span className="text-[10px] text-gray-400 inline-flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {product.priceUpdatedAt.slice(0, 10)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        to={`/products/${slugOrId}`}
                        data-testid={`open-product-detail-${product.id}`}
                        className="col-span-2 bg-[#FDE8ED] hover:bg-[#D91B3E] text-[#D91B3E] hover:text-white font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <span>{isAr ? 'المواصفات والأسعار' : 'Specs & Prices'}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </Link>
                      <button
                        type="button"
                        data-testid={`quick-basket-${product.id}`}
                        onClick={() => void handleSaveToBasket(product)}
                        title={isAr ? 'حفظ في سلة التسوق' : 'Save to Shopping Basket'}
                        className="bg-gray-100 hover:bg-[#2A1D20] text-gray-700 hover:text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center cursor-pointer"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(product, 1)}
                      className="w-full bg-red-gradient text-white font-bold text-xs py-2.5 rounded-xl hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isAr ? 'أضف لعربة الشراء' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Centered Floating Compare Dock (zero RTL horizontal overflow) */}
      {compareProductsList.length > 0 && (
        <div
          data-testid="floating-compare-dock"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-3xl bg-[#2A1D20] text-white rounded-2xl shadow-2xl border border-white/10 p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#FDE8ED] inline-flex items-center gap-1">
                <GitCompare className="w-4 h-4" />
                {isAr
                  ? `للمقارنة (${compareProductsList.length}/4):`
                  : `Selected (${compareProductsList.length}/4):`}
              </span>
              {compareProductsList.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                >
                  <span className="truncate max-w-[110px]">
                    {isAr ? p.nameAr : p.nameEn}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompareProduct(p.id)}
                    aria-label="Remove from compare"
                    className="hover:text-rose-300 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearCompareProducts}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
              >
                {isAr ? 'مسح' : 'Clear'}
              </button>
              <Link
                to={`/products/compare?ids=${compareProductsList.map((p) => p.id).join(',')}`}
                data-testid="floating-compare-now-btn"
                className="px-4 py-1.5 rounded-xl bg-[#D91B3E] hover:bg-[#B31331] text-white text-xs font-bold transition"
              >
                {isAr ? 'قارن الآن' : 'Compare Now'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

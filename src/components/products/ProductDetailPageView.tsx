import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BookmarkPlus,
  Check,
  CheckCircle2,
  CreditCard,
  GitCompare,
  Heart,
  Info,
  Package,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  TrendingDown,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react';
import { buildSeedPriceHistoryAndOffers } from '../../../shared/productEncyclopediaData';
import { apiRequest } from '../../services/api';
import { useApp } from '../../context/AppContext';
import type { ProductEncyclopediaDetail } from '../../types';
import { SmartImage } from '../common/SmartImage';

export const ProductDetailPageView: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const {
    language,
    products,
    addToCart,
    toggleWishlist,
    isWishlisted,
    compareProductIds,
    toggleCompareProduct,
    isLoggedIn,
    shoppingLists,
    addShoppingListItem,
    priceAlerts,
    upsertPriceAlert,
    setAuthModalOpen,
    setInstallmentPrefillAmount,
    setInstallmentModalOpen,
    showToast,
  } = useApp();

  const isAr = language === 'ar';
  const [fetchedDetail, setFetchedDetail] = useState<ProductEncyclopediaDetail | null>(null);
  const [qty, setQty] = useState(1);
  const [targetBasketId, setTargetBasketId] = useState<string>('');
  const [alertTargetDraft, setAlertTargetDraft] = useState<string>('');

  const fallbackProduct = useMemo(
    () => products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null,
    [idOrSlug, products],
  );

  useEffect(() => {
    let active = true;
    if (!idOrSlug) return () => { active = false; };
    apiRequest<ProductEncyclopediaDetail>(`/products/${encodeURIComponent(idOrSlug)}`)
      .then((res) => {
        if (active) setFetchedDetail(res);
      })
      .catch(() => {
        if (active) setFetchedDetail(null);
      });
    return () => {
      active = false;
    };
  }, [idOrSlug]);

  const detail = useMemo<ProductEncyclopediaDetail | null>(() => {
    if (fetchedDetail && (fetchedDetail.product.id === idOrSlug || fetchedDetail.product.slug === idOrSlug)) {
      return fetchedDetail;
    }
    if (!fallbackProduct) return null;
    const seeded = buildSeedPriceHistoryAndOffers([fallbackProduct]);
    return {
      product: fallbackProduct,
      priceHistory: seeded.priceHistory.filter((h) => h.productId === fallbackProduct.id),
      merchantOffers: seeded.merchantOffers.filter((o) => o.productId === fallbackProduct.id),
      alternatives: [],
    };
  }, [fallbackProduct, fetchedDetail, idOrSlug]);

  const product = detail?.product ?? null;
  const activeBasket = useMemo(() => {
    if (targetBasketId && shoppingLists.some((l) => l.id === targetBasketId)) return targetBasketId;
    return shoppingLists[0]?.id ?? '';
  }, [shoppingLists, targetBasketId]);

  const existingAlert = useMemo(
    () => (product ? priceAlerts.find((a) => a.productId === product.id) : undefined),
    [priceAlerts, product],
  );

  const defaultAlertTarget = product ? String(Math.round(product.price * 0.94)) : '';
  const alertPriceInputValue = alertTargetDraft || (existingAlert ? String(existingAlert.targetPrice) : defaultAlertTarget);

  if (!product || !detail) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-16 px-4 text-center space-y-4">
        <Package className="w-12 h-12 text-gray-300 mx-auto" />
        <h1 className="text-xl font-bold text-[#2A1D20]">
          {isAr ? 'المنتج غير موجود في الموسوعة' : 'Product Not Found'}
        </h1>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D91B3E] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{isAr ? 'العودة لموسوعة المنتجات' : 'Back to Product Encyclopedia'}</span>
        </Link>
      </div>
    );
  }

  const inWishlist = isWishlisted(product.id);
  const inCompare = compareProductIds.includes(product.id);
  const warrantyYears = Math.round(((product.warrantyMonths ?? 12) / 12) * 10) / 10;
  const monthlyEstimate = Math.round(product.price / 24);
  const specs = isAr ? product.specsAr : product.specsEn;
  const pros = (isAr ? product.prosAr : product.prosEn) || [];
  const cons = (isAr ? product.consAr : product.consEn) || [];
  const warnings = (isAr ? product.buyerWarningsAr : product.buyerWarningsEn) || [];

  // SVG Price Chart calculations
  const chartPoints = detail.priceHistory.length > 0
    ? detail.priceHistory
    : [
        {
          id: 'cur',
          productId: product.id,
          merchantName: 'Catalog',
          price: product.price,
          source: product.priceSource || 'Official',
          recordedAt: product.priceUpdatedAt || '2026-11-08',
        },
      ];
  const minHist = Math.min(...chartPoints.map((c) => c.price));
  const maxHist = Math.max(...chartPoints.map((c) => c.price));
  const rangeHist = Math.max(500, maxHist - minHist);
  const svgW = 540;
  const svgH = 150;
  const padX = 28;
  const padY = 20;
  const polylinePoints = chartPoints
    .map((pt, idx) => {
      const x =
        chartPoints.length === 1
          ? svgW / 2
          : padX + (idx * (svgW - padX * 2)) / (chartPoints.length - 1);
      const y = svgH - padY - ((pt.price - minHist) / rangeHist) * (svgH - padY * 2);
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(' ');

  const handleSaveToBasket = async () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      showToast(isAr ? 'سجّل الدخول لإضافة المنتج لسلة التسوق.' : 'Sign in to add items to Shopping Baskets.');
      return;
    }
    if (!activeBasket) {
      showToast(isAr ? 'أنشئ أول سلة تسوق من صفحة السلال.' : 'Create a Shopping Basket first.');
      return;
    }
    await addShoppingListItem(activeBasket, {
      productId: product.id,
      customTitle: isAr ? product.nameAr : product.nameEn,
      categoryLabel: product.category,
      quantity: qty,
      targetUnitPrice: product.price,
      status: 'shortlisted',
      priority: 'high',
    });
  };

  const handleSetPriceAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    const target = Number(alertPriceInputValue);
    if (!Number.isFinite(target) || target < 10) return;
    await upsertPriceAlert(product.id, target);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#D91B3E]">{isAr ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#D91B3E]">{isAr ? 'موسوعة المنتجات' : 'Product Encyclopedia'}</Link>
          <span>/</span>
          <span className="text-[#2A1D20] font-bold truncate max-w-xs">{isAr ? product.nameAr : product.nameEn}</span>
        </nav>

        {/* Top Overview Split Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-100 border">
              <SmartImage
                src={product.imageUrl}
                alt={isAr ? product.nameAr : product.nameEn}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 start-3 flex flex-wrap gap-2">
                <span className="bg-[#D91B3E] text-white px-3 py-1 rounded-xl text-xs font-bold shadow">
                  {product.brand}
                </span>
                {product.energyRating && product.energyRating !== 'N/A' && (
                  <span className="bg-[#2A1D20] text-white px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    {product.energyRating}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label="Toggle wishlist"
                className={`absolute top-3 end-3 p-2.5 rounded-full shadow-md transition cursor-pointer ${
                  inWishlist ? 'bg-rose-500 text-white' : 'bg-white/90 text-gray-700 hover:text-rose-500'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Highlight Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-[#FAF7F2] rounded-2xl p-3 border border-gray-100">
                <span className="text-[11px] text-gray-500 block">{isAr ? 'الضمان الرسمي' : 'Warranty'}</span>
                <strong className="text-[#2A1D20]">
                  {warrantyYears >= 1 ? (isAr ? `${warrantyYears} سنوات` : `${warrantyYears} Yrs`) : `${product.warrantyMonths} mo`}
                </strong>
              </div>
              <div className="bg-[#FAF7F2] rounded-2xl p-3 border border-gray-100">
                <span className="text-[11px] text-gray-500 block">{isAr ? 'السعة / القياس' : 'Capacity'}</span>
                <strong className="text-[#2A1D20] truncate block">{product.capacity || '—'}</strong>
              </div>
              <div className="bg-[#FAF7F2] rounded-2xl p-3 border border-gray-100">
                <span className="text-[11px] text-gray-500 block">{isAr ? 'الموديل' : 'Model'}</span>
                <strong className="text-[#2A1D20] font-mono text-[11px] truncate block">{product.model || product.sku}</strong>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#FDE8ED] text-[#D91B3E] font-bold">
                  {isAr ? product.categoryAr : product.categoryEn}
                </span>
                {product.originCountryAr && (
                  <span>• {isAr ? product.originCountryAr : product.originCountryEn}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2A1D20] leading-snug">
                {isAr ? product.nameAr : product.nameEn}
              </h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {isAr ? product.descriptionAr : product.descriptionEn}
              </p>
            </div>

            {/* Pricing & Installment Transparency Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F8] border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 line-through block">
                    {product.originalPrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                )}
                <div className="text-3xl font-black text-[#D91B3E]">
                  {product.price.toLocaleString()}{' '}
                  <span className="text-sm font-bold">{isAr ? 'ج.م' : 'EGP'}</span>
                </div>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  {product.priceSource || (isAr ? 'سعر التوكيل المعتمد الموثّق' : 'Verified Distributor Reference')}{' '}
                  {product.priceUpdatedAt ? `(${product.priceUpdatedAt.slice(0, 10)})` : ''}
                </span>
              </div>

              <div className="sm:text-end space-y-1">
                <span className="text-[11px] text-gray-500 block">
                  {isAr ? 'تقدير تقسيط إرشادي (24 شهر):' : 'Indicative 24-month estimate:'}
                </span>
                <strong className="text-sm font-black text-[#2A1D20] block">
                  ~{monthlyEstimate.toLocaleString()} {isAr ? 'ج.م / شهر' : 'EGP / mo'}
                </strong>
                <button
                  type="button"
                  onClick={() => {
                    setInstallmentPrefillAmount(product.price * qty);
                    setInstallmentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#D91B3E] hover:underline cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طلب تمويل تقسيط' : 'Request Installment Quote'}</span>
                </button>
              </div>
            </div>

            {/* Official Warranty Terms Box */}
            {(product.warrantyTermsAr || product.warrantyTermsEn) && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">
                    {isAr ? 'شروط تفعيل الضمان الرسمي في مصر' : 'Official Agent Warranty Activation Rules'}
                  </strong>
                  <p className="text-emerald-900 leading-relaxed">
                    {isAr ? product.warrantyTermsAr : product.warrantyTermsEn}
                  </p>
                </div>
              </div>
            )}

            {/* Primary Actions */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3.5 py-2.5 text-gray-700 hover:bg-gray-100 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2.5 text-xs font-black text-[#2A1D20]">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    className="px-3.5 py-2.5 text-gray-700 hover:bg-gray-100 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="detail-add-to-cart-btn"
                  onClick={() => addToCart(product, qty)}
                  className="flex-1 min-w-[180px] bg-red-gradient text-white font-bold text-xs py-3.5 px-5 rounded-xl shadow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAr ? 'أضف لعربة الشراء الآن' : 'Add to Cart Now'}</span>
                </button>

                <button
                  type="button"
                  data-testid="detail-compare-toggle-btn"
                  onClick={() => toggleCompareProduct(product.id)}
                  className={`px-4 py-3.5 rounded-xl font-bold text-xs border transition flex items-center gap-1.5 cursor-pointer ${
                    inCompare
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-[#2A1D20] border-gray-300 hover:border-[#D91B3E] hover:text-[#D91B3E]'
                  }`}
                >
                  {inCompare ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                  <span>{inCompare ? (isAr ? 'مضاف للمقارنة' : 'In Compare') : isAr ? 'أضف للمقارنة' : 'Compare'}</span>
                </button>
              </div>

              {/* Save to Multi-List Shopping Basket */}
              <div className="flex flex-wrap items-center gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200">
                {isLoggedIn && shoppingLists.length > 0 && (
                  <select
                    value={activeBasket}
                    onChange={(e) => setTargetBasketId(e.target.value)}
                    aria-label={isAr ? 'اختر سلة التسوق' : 'Choose Shopping Basket'}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white flex-1 min-w-[180px]"
                  >
                    {shoppingLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {isAr ? list.titleAr : list.titleEn} ({list.items.length})
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  data-testid="detail-add-to-basket-btn"
                  onClick={() => void handleSaveToBasket()}
                  className="px-4 py-2 rounded-xl bg-[#2A1D20] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{isAr ? 'حفظ في سلة التسوق المخصصة' : 'Save to Shopping Basket'}</span>
                </button>
                <Link
                  to="/my/shopping-lists"
                  className="text-xs font-bold text-[#D91B3E] hover:underline px-2"
                >
                  {isAr ? 'إدارة السلال' : 'Manage Lists'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions & Technical Specs + Pros / Cons / Warnings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-[#2A1D20] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#D91B3E]" />
              <span>{isAr ? 'المواصفات والأبعاد الهندسية' : 'Technical & Fit Specifications'}</span>
            </h2>
            <div className="divide-y divide-gray-100 text-xs">
              {product.dimensions && (
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-gray-500">{isAr ? 'الأبعاد الفعلية' : 'Dimensions'}</span>
                  <strong className="text-[#2A1D20] text-end">{product.dimensions}</strong>
                </div>
              )}
              {product.capacity && (
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-gray-500">{isAr ? 'السعة / القدرة' : 'Capacity'}</span>
                  <strong className="text-[#2A1D20] text-end">{product.capacity}</strong>
                </div>
              )}
              {Object.entries(specs || {}).map(([k, v], i) => (
                <div key={i} className="py-2.5 flex justify-between gap-4">
                  <span className="text-gray-500">{k}</span>
                  <strong className="text-[#2A1D20] text-end">{v}</strong>
                </div>
              ))}
              {(product.recommendedForAr || product.recommendedForEn) && (
                <div className="pt-3 text-xs text-gray-700 bg-[#FAF7F2] rounded-xl p-3 mt-2">
                  <span className="font-bold text-[#D91B3E] block mb-1">
                    {isAr ? 'لمن يناسب هذا المنتج؟' : 'Best Recommended For:'}
                  </span>
                  {isAr ? product.recommendedForAr : product.recommendedForEn}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border border-emerald-200 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'نقاط القوة الحقيقية' : 'Objective Strengths'}</span>
                </h3>
                <ul className="space-y-2 text-xs text-gray-700">
                  {pros.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl border border-rose-200 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-rose-800 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{isAr ? 'العيوب والقيود بشفافية' : 'Transparent Tradeoffs & Cons'}</span>
                </h3>
                <ul className="space-y-2 text-xs text-gray-700">
                  {cons.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="bg-amber-50 rounded-3xl border border-amber-300 p-5 space-y-2.5">
                <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'تنبيهات مهندسي جواز إن قبل الدفع' : 'Essential Buyer Warnings Before Checkout'}</span>
                </h3>
                <ul className="space-y-2 text-xs text-amber-950">
                  {warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-black text-amber-700">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Price History SVG Chart + Price Drop Alert Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-[#2A1D20] flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-[#D91B3E]" />
                  <span>{isAr ? 'مؤشر وسجل السعر التاريخي' : 'Tracked Price History Chart'}</span>
                </h2>
                <p className="text-xs text-gray-500">
                  {isAr
                    ? 'بيانات مرجعية موثقة بالمصادر والتواريخ دون تهويل دعائي.'
                    : 'Timestamped market checkpoints with transparent source labels.'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] font-semibold">
                  {isAr ? 'أقل رصد:' : 'Low:'} <strong>{minHist.toLocaleString()}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] font-semibold">
                  {isAr ? 'أعلى رصد:' : 'High:'} <strong>{maxHist.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                data-testid="price-history-chart"
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full max-w-full h-40 bg-[#FAF7F2] rounded-2xl border border-gray-100"
                role="img"
                aria-label="Product price history line chart"
              >
                <polyline
                  fill="none"
                  stroke="#D91B3E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
                {chartPoints.map((pt, idx) => {
                  const x =
                    chartPoints.length === 1
                      ? svgW / 2
                      : padX + (idx * (svgW - padX * 2)) / (chartPoints.length - 1);
                  const y = svgH - padY - ((pt.price - minHist) / rangeHist) * (svgH - padY * 2);
                  return (
                    <g key={pt.id}>
                      <circle cx={x} cy={y} r="5" fill="#FFFFFF" stroke="#D91B3E" strokeWidth="2.5" />
                      <text
                        x={x}
                        y={y - 9}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#2A1D20"
                      >
                        {pt.price.toLocaleString()}
                      </text>
                      <text
                        x={x}
                        y={svgH - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#6B7280"
                      >
                        {pt.recordedAt.slice(0, 7)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-[#2A1D20] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#D91B3E]" />
              <span>{isAr ? 'تنبيه انخفاض السعر الذكي' : 'Set Price Drop Alert'}</span>
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr
                ? 'حدد السعر المستهدف وسنرسل لك إشعاراً فورياً داخل المنصة فور وصول السعر الرسمي له أو انخفاضه.'
                : 'Enter your target price in EGP and get notified in-app the moment verified catalog pricing matches it.'}
            </p>
            <form onSubmit={handleSetPriceAlert} data-testid="price-alert-form" className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                {isAr ? 'السعر المستهدف (ج.م)' : 'Target Price (EGP)'}
                <input
                  type="number"
                  min={100}
                  step={50}
                  data-testid="price-alert-target-input"
                  value={alertPriceInputValue}
                  onChange={(e) => setAlertTargetDraft(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#D91B3E]"
                />
              </label>
              <button
                type="submit"
                data-testid="save-price-alert-btn"
                className="w-full py-2.5 rounded-xl bg-red-gradient text-white text-xs font-bold shadow hover:opacity-95 transition cursor-pointer"
              >
                {existingAlert
                  ? isAr
                    ? 'تحديث تنبيه السعر'
                    : 'Update Price Alert'
                  : isAr
                    ? 'تفعيل تنبيه السعر'
                    : 'Activate Price Alert'}
              </button>
              {existingAlert && (
                <div
                  data-testid="product-alert-status-badge"
                  className={`p-2.5 rounded-xl text-[11px] font-bold text-center ${
                    existingAlert.status === 'triggered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#FDE8ED] text-[#D91B3E]'
                  }`}
                >
                  {existingAlert.status === 'triggered'
                    ? isAr
                      ? `متحقق الآن (${existingAlert.targetPrice.toLocaleString()} ج.م)`
                      : `Target Reached (${existingAlert.targetPrice.toLocaleString()} EGP)`
                    : isAr
                      ? `نشط عند هدف ${existingAlert.targetPrice.toLocaleString()} ج.م`
                      : `Tracking <= ${existingAlert.targetPrice.toLocaleString()} EGP`}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Merchant Offers & Gray Market Warranty Warning Table */}
        {detail.merchantOffers.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-black text-[#2A1D20] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D91B3E]" />
                <span>{isAr ? 'مقارنة التجار ونوع الضمان الحقيقي' : 'Merchant Offers & Warranty Comparison'}</span>
              </h2>
              <p className="text-xs text-gray-500">
                {isAr
                  ? 'نوضّح الفرق بين التوكيل الرسمي وضمان المحل فقط لحمايتك من السعر الوهمي.'
                  : 'Clear distinction between Official Local Agent Warranty vs dealer/importer terms.'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table data-testid="merchant-offers-table" className="w-full text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#FAF7F2] text-gray-600 border-b border-gray-200">
                    <th className="p-3 text-start">{isAr ? 'التاجر / القناة' : 'Merchant'}</th>
                    <th className="p-3 text-start">{isAr ? 'حالة الضمان' : 'Warranty Type'}</th>
                    <th className="p-3 text-start">{isAr ? 'السعر' : 'Cash Price'}</th>
                    <th className="p-3 text-start">{isAr ? 'الشحن وملاحظات' : 'Delivery & Consumer Note'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detail.merchantOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td className="p-3 font-bold text-[#2A1D20]">
                        {offer.merchantName}
                        <span className={`block text-[10px] mt-0.5 ${offer.inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {offer.inStock ? (isAr ? 'متوفر' : 'In Stock') : isAr ? 'طلب مسبق' : 'Backorder'}
                        </span>
                      </td>
                      <td className="p-3">
                        {offer.warrantyType === 'official_agent' && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold inline-flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {isAr ? 'ضمان الوكيل الرسمي' : 'Official Agent'}
                          </span>
                        )}
                        {offer.warrantyType === 'authorized_dealer' && (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold">
                            {isAr ? 'موزع معتمد' : 'Authorized Dealer'}
                          </span>
                        )}
                        {offer.warrantyType === 'gray_market_importer' && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold inline-flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {isAr ? 'ضمان مستورد / محل' : 'Importer / Store Only'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-black text-[#D91B3E]">
                        {offer.price.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </td>
                      <td className="p-3 text-gray-600">
                        <div>{isAr ? offer.deliverySlaAr : offer.deliverySlaEn}</div>
                        {(offer.notesAr || offer.notesEn) && (
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            {isAr ? offer.notesAr : offer.notesEn}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Smart Alternatives */}
        {detail.alternatives.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#2A1D20]">
              {isAr ? 'بدائل ذكية بناءً على الميزانية أو مساحة الشقة' : 'Smart Alternatives by Budget & Apartment Size'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detail.alternatives.map((alt) => {
                const targetProd = alt.alternativeProduct;
                if (!targetProd) return null;
                return (
                  <div
                    key={alt.id}
                    className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm flex items-center gap-4"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <SmartImage
                        src={targetProd.imageUrl}
                        alt={isAr ? targetProd.nameAr : targetProd.nameEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#FDE8ED] text-[#D91B3E] text-[10px] font-bold uppercase">
                        {alt.relationType === 'budget'
                          ? isAr
                            ? 'بديل موفّر'
                            : 'Budget Choice'
                          : alt.relationType === 'compact'
                            ? isAr
                              ? 'مقاس مدمج'
                              : 'Compact Fit'
                            : alt.relationType === 'energy_saver'
                              ? isAr
                                ? 'موفر كهرباء'
                                : 'Energy Saver'
                              : isAr
                                ? 'ترقية أعلى'
                                : 'Smart Upgrade'}
                      </span>
                      <Link
                        to={`/products/${encodeURIComponent(targetProd.slug || targetProd.id)}`}
                        className="font-bold text-sm text-[#2A1D20] hover:text-[#D91B3E] block truncate"
                      >
                        {isAr ? targetProd.nameAr : targetProd.nameEn}
                      </Link>
                      <p className="text-[11px] text-gray-600 line-clamp-2">
                        {isAr ? alt.reasonAr : alt.reasonEn}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <strong className="text-sm text-[#D91B3E]">
                          {targetProd.price.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                        </strong>
                        <Link
                          to={`/products/compare?ids=${product.id},${targetProd.id}`}
                          className="text-xs font-bold text-[#2A1D20] hover:text-[#D91B3E] inline-flex items-center gap-1"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>{isAr ? 'قارن الاثنين' : 'Compare Pair'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  CheckCircle2,
  GitCompare,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { compareProductsAnalysis } from '../../../shared/productEncyclopediaData';
import { useApp } from '../../context/AppContext';
import type { Product, ProductMerchantOffer } from '../../types';
import { SmartImage } from '../common/SmartImage';

export const ProductCompareView: React.FC = () => {
  const {
    language,
    products,
    compareProductIds,
    toggleCompareProduct,
    clearCompareProducts,
    addToCart,
    isLoggedIn,
    shoppingLists,
    addShoppingListItem,
    setAuthModalOpen,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const isAr = language === 'ar';

  const activeProductIds = useMemo(() => {
    const paramIds = (searchParams.get('ids') || '')
      .split(',')
      .map((s) => decodeURIComponent(s.trim()))
      .filter(Boolean);
    if (paramIds.length > 0) return paramIds.slice(0, 4);
    if (compareProductIds.length > 0) return compareProductIds.slice(0, 4);
    // Smart helpful default pair if user visits /products/compare directly
    return products.slice(0, 2).map((p) => p.id);
  }, [compareProductIds, products, searchParams]);

  const comparedProducts = useMemo(() => {
    return activeProductIds
      .map((token) => products.find((p) => p.id === token || p.slug === token))
      .filter((p): p is Product => Boolean(p));
  }, [activeProductIds, products]);

  const comparison = useMemo(() => {
    const offersMap: Record<string, ProductMerchantOffer[]> = {};
    return compareProductsAnalysis(comparedProducts, offersMap);
  }, [comparedProducts]);

  const handleToggleProductId = (productId: string) => {
    const hasParamIds = Boolean(searchParams.get('ids'));
    if (hasParamIds) {
      const current = new Set(comparedProducts.map((p) => p.id));
      if (current.has(productId)) {
        current.delete(productId);
      } else if (current.size < 4) {
        current.add(productId);
      }
      const nextIds = Array.from(current);
      setSearchParams(nextIds.length > 0 ? { ids: nextIds.join(',') } : {});
    }
    toggleCompareProduct(productId);
  };

  const addCandidateProducts = products.filter(
    (p) => !comparedProducts.some((c) => c.id === p.id),
  );

  const specKeys = isAr ? comparison.unifiedSpecKeysAr : comparison.unifiedSpecKeysEn;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      <section className="bg-red-gradient text-white py-9 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isAr ? 'العودة لموسوعة المنتجات' : 'Back to Product Encyclopedia'}</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <GitCompare className="w-6 h-6" />
              <span>
                {isAr
                  ? 'مصفوفة المقارنة الموضوعية للمنتجات'
                  : 'Objective Product Comparison Matrix'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-white/90">
              {isAr
                ? 'تحليل آلي للسعر، تكلفة سنة الضمان، استهلاك الكهرباء، والأبعاد المتوافقة مع أبواب شقتك.'
                : 'Automated breakdown of cash price, cost-per-warranty-year, energy rating, and apartment doorway dimensions.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {addCandidateProducts.length > 0 && comparedProducts.length < 4 && (
              <select
                data-testid="compare-add-product-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleToggleProductId(e.target.value);
                    e.target.value = '';
                  }
                }}
                aria-label={isAr ? 'أضف منتجاً للمقارنة' : 'Add product to compare'}
                className="px-3 py-2 rounded-xl bg-white text-[#2A1D20] text-xs font-bold shadow cursor-pointer"
              >
                <option value="">
                  {isAr ? '+ أضف منتجاً للمقارنة...' : '+ Add Product to Compare...'}
                </option>
                {addCandidateProducts.map((cand) => (
                  <option key={cand.id} value={cand.id}>
                    {(isAr ? cand.nameAr : cand.nameEn).slice(0, 48)} — {cand.price.toLocaleString()}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => {
                clearCompareProducts();
                setSearchParams({});
              }}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 rotate-45" />
              <span>{isAr ? 'مسح القائمة' : 'Reset'}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        {comparedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center space-y-4">
            <GitCompare className="w-10 h-10 text-[#D91B3E] mx-auto" />
            <h2 className="text-lg font-bold text-[#2A1D20]">
              {isAr ? 'اختر منتجين على الأقل للمقارنة' : 'Select products to compare side by side'}
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D91B3E] text-white text-xs font-bold"
            >
              <span>{isAr ? 'تصفح موسوعة المنتجات' : 'Browse Products'}</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Automated Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: isAr ? 'أقل سعر نقدي' : 'Lowest Cash Price',
                  prodId: comparison.highlights.lowestPriceProductId,
                  icon: Sparkles,
                  tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                },
                {
                  label: isAr ? 'أطول ضمان رسمي' : 'Longest Official Warranty',
                  prodId: comparison.highlights.longestWarrantyProductId,
                  icon: ShieldCheck,
                  tone: 'text-[#D91B3E] bg-[#FDE8ED] border-rose-200',
                },
                {
                  label: isAr ? 'أعلى كفاءة كهربائية' : 'Top Energy Class',
                  prodId: comparison.highlights.bestEnergyProductId,
                  icon: Zap,
                  tone: 'text-amber-700 bg-amber-50 border-amber-200',
                },
                {
                  label: isAr ? 'أفضل قيمة مقابل الضمان' : 'Best Value / Warranty Year',
                  prodId: comparison.highlights.bestWarrantyValueProductId,
                  icon: Award,
                  tone: 'text-indigo-700 bg-indigo-50 border-indigo-200',
                },
              ].map((card, i) => {
                const winner = comparedProducts.find((p) => p.id === card.prodId);
                const Icon = card.icon;
                return (
                  <div
                    key={i}
                    className={`rounded-2xl border p-3.5 ${card.tone} flex items-start gap-2.5`}
                  >
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold block">{card.label}</span>
                      <strong className="text-xs text-[#2A1D20] truncate block">
                        {winner
                          ? isAr
                            ? winner.nameAr
                            : winner.nameEn
                          : isAr
                            ? 'لا ينطبق'
                            : 'N/A'}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Responsive Horizontal Matrix */}
            <div
              data-testid="product-compare-matrix"
              className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-x-auto"
            >
              <table className="w-full min-w-[720px] text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-gray-200">
                    <th className="p-4 text-start font-bold text-gray-600 w-48">
                      {isAr ? 'معيار المقارنة' : 'Comparison Criterion'}
                    </th>
                    {comparedProducts.map((p) => (
                      <th key={p.id} className="p-4 text-start align-top border-s border-gray-100">
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#FDE8ED] text-[#D91B3E] text-[10px] font-bold">
                              {p.brand}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleProductId(p.id)}
                              aria-label="Remove product from comparison"
                              className="p-1 text-gray-400 hover:text-[#D91B3E] cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="h-28 rounded-xl overflow-hidden bg-gray-100">
                            <SmartImage
                              src={p.imageUrl}
                              alt={isAr ? p.nameAr : p.nameEn}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Link
                            to={`/products/${encodeURIComponent(p.slug || p.id)}`}
                            className="font-bold text-sm text-[#2A1D20] hover:text-[#D91B3E] block leading-snug"
                          >
                            {isAr ? p.nameAr : p.nameEn}
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-4 font-bold text-gray-700 bg-[#FAF7F2]/50">
                      {isAr ? 'السعر النقدي الموثق' : 'Verified Cash Price'}
                    </td>
                    {comparedProducts.map((p) => {
                      const isBest = comparison.highlights.lowestPriceProductId === p.id;
                      return (
                        <td key={p.id} className="p-4 border-s border-gray-100">
                          <span className="text-base font-black text-[#D91B3E]">
                            {p.price.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                          {isBest && (
                            <span className="ms-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {isAr ? 'الأوفر' : 'Lowest'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold text-gray-700 bg-[#FAF7F2]/50">
                      {isAr ? 'مدة وشروط الضمان' : 'Official Warranty'}
                    </td>
                    {comparedProducts.map((p) => {
                      const months = p.warrantyMonths ?? 12;
                      const perYear = Math.round(p.price / Math.max(0.5, months / 12));
                      return (
                        <td key={p.id} className="p-4 border-s border-gray-100 space-y-1">
                          <div className="font-bold text-[#2A1D20]">
                            {months >= 12
                              ? isAr
                                ? `${Math.round((months / 12) * 10) / 10} سنوات (${months} شهر)`
                                : `${Math.round((months / 12) * 10) / 10} Years (${months} mo)`
                              : `${months} mo`}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {isAr ? 'تكلفة السنة:' : 'Cost / year:'}{' '}
                            <strong>{perYear.toLocaleString()}</strong> {isAr ? 'ج.م' : 'EGP'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold text-gray-700 bg-[#FAF7F2]/50">
                      {isAr ? 'تصنيف الطاقة' : 'Energy Class'}
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-s border-gray-100 font-bold">
                        {p.energyRating || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold text-gray-700 bg-[#FAF7F2]/50">
                      {isAr ? 'الأبعاد والسعة' : 'Dimensions & Capacity'}
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-s border-gray-100 space-y-1">
                        <div className="font-bold text-[#2A1D20]">{p.capacity || '—'}</div>
                        <div className="text-[11px] text-gray-500">{p.dimensions || '—'}</div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold text-gray-700 bg-[#FAF7F2]/50">
                      {isAr ? 'بلد المنشأ' : 'Origin'}
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-s border-gray-100 text-gray-700">
                        {(isAr ? p.originCountryAr : p.originCountryEn) || '—'}
                      </td>
                    ))}
                  </tr>

                  {specKeys.map((key) => (
                    <tr key={key}>
                      <td className="p-4 font-bold text-gray-700 bg-[#FAF7F2]/50">{key}</td>
                      {comparedProducts.map((p) => {
                        const specs = isAr ? p.specsAr : p.specsEn;
                        return (
                          <td key={p.id} className="p-4 border-s border-gray-100 text-gray-800">
                            {specs?.[key] || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  <tr>
                    <td className="p-4 font-bold text-emerald-700 bg-[#FAF7F2]/50">
                      {isAr ? 'أبرز المزايا' : 'Key Pros'}
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-s border-gray-100 align-top">
                        <ul className="space-y-1.5">
                          {(isAr ? p.prosAr : p.prosEn)?.slice(0, 3).map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-gray-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold text-rose-700 bg-[#FAF7F2]/50">
                      {isAr ? 'العيوب والقيود' : 'Tradeoffs & Cons'}
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-s border-gray-100 align-top">
                        <ul className="space-y-1.5">
                          {(isAr ? p.consAr : p.consEn)?.slice(0, 3).map((con, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-gray-700">
                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold text-amber-800 bg-[#FAF7F2]/50">
                      {isAr ? 'تحذير قبل الشراء' : 'Buyer Warning'}
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-s border-gray-100 align-top">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{(isAr ? p.buyerWarningsAr : p.buyerWarningsEn)?.[0] || '—'}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold text-gray-700 bg-[#FAF7F2]/50">
                      {isAr ? 'إجراء سريع' : 'Quick Actions'}
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-s border-gray-100">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => addToCart(p, 1)}
                            className="w-full py-2 px-3 rounded-xl bg-red-gradient text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isAr ? 'أضف للعربة' : 'Add to Cart'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isLoggedIn || !shoppingLists[0]) {
                                setAuthModalOpen(true);
                                return;
                              }
                              void addShoppingListItem(shoppingLists[0].id, {
                                productId: p.id,
                                customTitle: isAr ? p.nameAr : p.nameEn,
                                categoryLabel: p.category,
                                quantity: 1,
                                targetUnitPrice: p.price,
                                status: 'shortlisted',
                              });
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-[#FDE8ED] text-gray-800 hover:text-[#D91B3E] font-bold text-xs cursor-pointer transition"
                          >
                            {isAr ? '+ احفظ في سلة التسوق' : '+ Save to Basket'}
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

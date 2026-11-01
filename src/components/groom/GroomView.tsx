import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Briefcase, 
  ShoppingBag, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  Layers, 
  X,
  CreditCard,
  Percent,
  Check
} from 'lucide-react';
import { initialGroomPackages } from '../../data/initialData';
import { Product } from '../../types';

export const GroomView: React.FC<{ onOpenCompare: (prods: Product[]) => void }> = ({ onOpenCompare }) => {
  const { 
    language, 
    t, 
    dir, 
    products, 
    addToCart, 
    setSelectedProduct, 
    setProductDetailModalOpen,
    setInstallmentModalOpen,
    setInstallmentPrefillAmount
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const groomProducts = products.filter(p => p.trousseauType === 'groom');

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Custom Budget Builder State
  const [budgetTarget, setBudgetTarget] = useState(150000);
  const [selectedBudgetItems, setSelectedBudgetItems] = useState<string[]>([groomProducts[0]?.id, groomProducts[1]?.id].filter(Boolean));

  const categories = [
    { key: 'all', label: t.groom.allCategories },
    { key: 'appliances', label: t.groom.appliances },
    { key: 'electronics', label: t.groom.electronics },
    { key: 'bedroom', label: t.groom.bedroom },
    { key: 'living', label: t.groom.living },
  ];

  const filteredProducts = groomProducts.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery || 
      (p.nameAr + p.nameEn + p.brand).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleCompare = (product: Product) => {
    if (compareList.some(p => p.id === product.id)) {
      setCompareList(prev => prev.filter(p => p.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        return; // Max 3 items for side-by-side
      }
      setCompareList(prev => [...prev, product]);
    }
  };

  const toggleBudgetItem = (id: string) => {
    setSelectedBudgetItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalBudgetSpent = groomProducts
    .filter(p => selectedBudgetItems.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const budgetRemaining = budgetTarget - totalBudgetSpent;

  const handleAddAllBudgetToCart = () => {
    const itemsToAdd = groomProducts.filter(p => selectedBudgetItems.includes(p.id));
    itemsToAdd.forEach(p => addToCart(p, 1));
  };

  return (
    <div className="space-y-16 pb-24">
      
      {/* 1. Header Banner */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Briefcase className="w-4 h-4 text-white" />
              <span>{language === 'ar' ? 'القسم الثاني — جهاز العريس' : "Section 02 — Groom's Trousseau"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.groom.title}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">
              {t.groom.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('groom-packages');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-rose-50 text-[#9E122C] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <span>{t.groom.readyPackagesTitle}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('budget-builder');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-rose-200" />
                <span>{t.groom.customBudgetTitle}</span>
              </button>
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
                  {language === 'ar' ? `وفر ${pkg.savings.toLocaleString()} ج.م` : `Save ${pkg.savings.toLocaleString()} EGP`}
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
                        {pkg.totalPrice.toLocaleString()} <span className="text-xs font-bold text-[#D91B3E]">{t.groom.egp}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-red-50 text-[#D91B3E] border border-red-200 px-3 py-1.5 rounded-xl font-bold">
                      {pkg.itemsCount} {language === 'ar' ? 'أجهزة وقطع أساسية' : 'Key Items'}
                    </span>
                  </div>

                  {/* Included Items */}
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
                        specsEn: { 'Items': `${pkg.itemsCount} items` },
                      };
                      addToCart(sampleProduct, 1);
                    }}
                    className="flex-1 bg-red-gradient text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>{t.groom.addToCart}</span>
                  </button>

                  <button
                    onClick={() => {
                      setInstallmentPrefillAmount(pkg.totalPrice);
                      setInstallmentModalOpen(true);
                    }}
                    className="bg-[#1C1819] hover:bg-[#D91B3E] text-white text-xs font-bold py-3.5 px-4 rounded-xl transition flex items-center gap-1.5"
                    title="طلب تقسيط الباقة"
                  >
                    <CreditCard className="w-4 h-4 text-rose-200" />
                    <span>{language === 'ar' ? 'تقسيط الباقة' : 'Finance'}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* 3. Interactive Custom Budget Builder */}
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
                  ? 'حدد ميزانيتك المتاحة للأجهزة والأثاث، واختر القطع التي تناسبك وراقب الرصيد المتبقي بدقة متناهية.' 
                  : 'Set your target budget and select essential appliances & furniture to track real-time remaining funds.'
                }
              </p>
            </div>

            {/* Budget Target Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 items-center">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">
                  {language === 'ar' ? 'ميزانيتك المحددة (ج.م):' : 'Target Budget (EGP):'}
                </label>
                <div className="text-2xl font-black text-white">
                  {budgetTarget.toLocaleString()} {t.groom.egp}
                </div>
                <input 
                  type="range"
                  min={50000}
                  max={300000}
                  step={10000}
                  value={budgetTarget}
                  onChange={(e) => setBudgetTarget(Number(e.target.value))}
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
                  {selectedBudgetItems.length} {language === 'ar' ? 'منتجات محددة' : 'items selected'}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-300 font-bold block mb-1">
                  {language === 'ar' ? 'الرصيد المتبقي في ميزانيتك:' : 'Remaining Budget:'}
                </span>
                <div className={`text-2xl font-black ${budgetRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {budgetRemaining.toLocaleString()} {t.groom.egp}
                </div>
                <span className="text-xs text-gray-400">
                  {budgetRemaining >= 0 
                    ? (language === 'ar' ? 'في حدود الميزانية المحددة' : 'Within budget limits')
                    : (language === 'ar' ? 'تجاوزت الميزانية (يمكنك تقسيط الفرق)' : 'Over budget (Financing available)')
                  }
                </span>
              </div>
            </div>

            {/* Checklist of Available Items */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                {language === 'ar' ? 'حدد الأجهزة والقطع التي ترغب بإضافتها لحسابك:' : 'Toggle products to include in budget:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groomProducts.map((p) => {
                  const isChecked = selectedBudgetItems.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleBudgetItem(p.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'bg-[#D91B3E]/20 border-[#D91B3E] text-white shadow-md' 
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isChecked ? 'bg-[#D91B3E] border-[#D91B3E] text-white' : 'border-gray-500'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold truncate max-w-[160px] sm:max-w-[190px]">
                            {language === 'ar' ? p.nameAr : p.nameEn}
                          </p>
                          <span className="text-[11px] text-rose-300 font-semibold">
                            {p.price.toLocaleString()} {t.groom.egp}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-300">
                {language === 'ar' ? 'يمكنك تحويل الباقة المخصصة مباشرة إلى سلة الشراء أو تقديم طلب تقسيط فوري.' : 'Add your custom selection directly to cart or apply for financing.'}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddAllBudgetToCart}
                  disabled={selectedBudgetItems.length === 0}
                  className="bg-red-gradient text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>{language === 'ar' ? 'إضافة كافة المحددة للسلة' : 'Add Selected to Cart'}</span>
                </button>

                <button
                  onClick={() => {
                    setInstallmentPrefillAmount(totalBudgetSpent);
                    setInstallmentModalOpen(true);
                  }}
                  disabled={selectedBudgetItems.length === 0}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-3 px-5 rounded-xl border border-white/20 transition flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-rose-200" />
                  <span>{language === 'ar' ? 'طلب تقسيط هذه الباقة' : 'Apply for Installment'}</span>
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

            {/* Search Input */}
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

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeCategory === cat.key
                    ? 'bg-[#D91B3E] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-red-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => {
              const isComparing = compareList.some(item => item.id === p.id);
              return (
                <div 
                  key={p.id}
                  className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-md hover:shadow-xl transition group flex flex-col justify-between"
                >
                  <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                    <img 
                      src={p.imageUrl} 
                      alt={p.nameAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    
                    {/* Brand Badge */}
                    <div className="absolute top-3 start-3 bg-[#1C1819]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-200">
                      {p.brand}
                    </div>

                    {/* Stock Pill */}
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

                    {/* Specs Preview */}
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-gray-100 space-y-1 text-[11px] text-gray-600">
                      {Object.entries(language === 'ar' ? p.specsAr : p.specsEn).slice(0, 2).map(([k, v], i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-gray-400">{k}:</span>
                          <span className="font-semibold text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        {p.originalPrice && (
                          <span className="text-xs text-gray-400 line-through block">
                            {p.originalPrice.toLocaleString()} {t.groom.egp}
                          </span>
                        )}
                        <div className="text-xl font-black text-[#D91B3E]">
                          {p.price.toLocaleString()} <span className="text-xs font-bold text-[#D91B3E]">{t.groom.egp}</span>
                        </div>
                      </div>

                      {/* Installment Badge estimate */}
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {Math.round(p.price / 24).toLocaleString()} ج.م / شهر
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="flex-1 bg-[#D91B3E] hover:bg-[#B31331] text-white font-bold text-xs py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t.groom.addToCart}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setProductDetailModalOpen(true);
                          }}
                          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                          title={t.groom.detailsBtn}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Compare toggle button */}
                      <button
                        onClick={() => toggleCompare(p)}
                        className={`w-full py-1.5 rounded-lg text-[11px] font-semibold transition border flex items-center justify-center gap-1.5 ${
                          isComparing
                            ? 'bg-red-50 text-[#D91B3E] border-red-200'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{isComparing ? (language === 'ar' ? 'تمت الإضافة للمقارنة ✓' : 'In Compare List ✓') : t.groom.compareBtn}</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 5. Sticky Floating Comparison Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-40 bg-[#1C1819] text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-red-500 flex items-center gap-6 max-w-xl w-[90%]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-300" />
            <div>
              <span className="text-xs font-bold block">{t.groom.compareTitle}</span>
              <span className="text-[10px] text-gray-400">
                {compareList.length} {language === 'ar' ? 'منتجات محددة (حد أقصى 3)' : 'products selected'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto flex-1 justify-center">
            {compareList.map((cp) => (
              <div key={cp.id} className="relative shrink-0">
                <img 
                  src={cp.imageUrl} 
                  alt={cp.nameAr}
                  className="w-10 h-10 rounded-lg object-cover border border-red-400"
                />
                <button
                  onClick={() => toggleCompare(cp)}
                  className="absolute -top-1.5 -end-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => onOpenCompare(compareList)}
            className="bg-red-gradient text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 shadow-md"
          >
            {language === 'ar' ? 'عرض المقارنة' : 'Compare Now'}
          </button>
        </div>
      )}

    </div>
  );
};

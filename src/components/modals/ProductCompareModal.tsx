import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, Layers, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productsToCompare: Product[];
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  productsToCompare
}) => {
  const { language, t, addToCart } = useApp();

  if (!isOpen || productsToCompare.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-9 max-w-4xl w-full shadow-2xl border-2 border-[#C6A66B]/40 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
              <Layers className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'مقارنة دقيقة جنباً إلى جنب' : 'Side-by-Side Comparison'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.groom.compareTitle} ({productsToCompare.length} {language === 'ar' ? 'منتجات' : 'items'})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-200">
            {productsToCompare.map((p) => (
              <div key={p.id} className="pt-4 md:pt-0 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-44 rounded-2xl overflow-hidden bg-gray-100 border">
                    <img src={p.imageUrl} alt={p.nameAr} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{p.brand}</span>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{language === 'ar' ? p.nameAr : p.nameEn}</h4>
                  </div>

                  <div className="text-lg font-black text-[#D91B3E]">
                    {p.price.toLocaleString()} {t.groom.egp}
                  </div>

                  {/* Specs List */}
                  <div className="p-3 rounded-xl bg-[#FFF8F8] border border-rose-100 space-y-2 text-xs">
                    <span className="font-bold text-gray-700 block text-[11px]">المواصفات:</span>
                    {Object.entries(language === 'ar' ? p.specsAr : p.specsEn).map(([k, v], i) => (
                      <div key={i} className="flex justify-between border-b border-gray-100 pb-1 text-[11px]">
                        <span className="text-gray-400">{k}:</span>
                        <strong className="text-gray-700">{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(p, 1);
                    onClose();
                  }}
                  className="w-full bg-red-gradient text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t.groom.addToCart}</span>
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

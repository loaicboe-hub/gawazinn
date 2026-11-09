import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Heart, CreditCard } from 'lucide-react';
import { ModalFrame } from '../common/ModalFrame';
import { SmartImage } from '../common/SmartImage';

export const ProductDetailModal: React.FC = () => {
  const {
    language,
    t,
    productDetailModalOpen,
    setProductDetailModalOpen,
    selectedProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setInstallmentModalOpen,
    setInstallmentPrefillAmount,
  } = useApp();

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedProduct?.id, productDetailModalOpen]);

  if (!productDetailModalOpen || !selectedProduct) return null;

  const inWishlist = isWishlisted(selectedProduct.id);
  const monthlyEstimate = Math.round(selectedProduct.price / 24);

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    setProductDetailModalOpen(false);
  };

  const handleFinanceProduct = () => {
    setInstallmentPrefillAmount(selectedProduct.price * quantity);
    setProductDetailModalOpen(false);
    setInstallmentModalOpen(true);
  };

  return (
    <ModalFrame
      isOpen={productDetailModalOpen}
      onClose={() => setProductDetailModalOpen(false)}
      titleId="product-detail-title"
      maxWidthClass="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border">
          <SmartImage
            src={selectedProduct.imageUrl}
            alt={language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 start-3 bg-[#D91B3E] text-white px-3 py-1 rounded-lg text-xs font-bold shadow">
            {selectedProduct.brand}
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(selectedProduct)}
            aria-label={language === 'ar' ? 'حفظ في المفضلة' : 'Toggle wishlist'}
            className={`absolute top-3 end-3 p-2.5 rounded-full shadow-md backdrop-blur-md transition cursor-pointer ${inWishlist ? 'bg-rose-500 text-white' : 'bg-white/85 text-gray-600 hover:text-rose-500'
              }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs text-gray-500 font-semibold block mb-1">
              {language === 'ar' ? selectedProduct.categoryAr : selectedProduct.categoryEn}
            </span>
            <h3 id="product-detail-title" className="text-xl font-bold text-gray-900">
              {language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 flex items-center justify-between">
            <div>
              {selectedProduct.originalPrice && (
                <span className="text-xs text-gray-400 line-through block">
                  {selectedProduct.originalPrice.toLocaleString()} {t.groom.egp}
                </span>
              )}
              <div className="text-2xl font-black text-[#D91B3E]">
                {selectedProduct.price.toLocaleString()}{' '}
                <span className="text-xs font-bold text-[#D91B3E]">{t.groom.egp}</span>
              </div>
            </div>

            <div className="text-end">
              <span className="text-[10px] text-gray-500 block">
                {language === 'ar' ? 'أو بالتقسيط حتى 24 شهر:' : 'Or finance up to 24mo:'}
              </span>
              <strong className="text-xs font-black text-[#D91B3E]">
                {monthlyEstimate.toLocaleString()} {t.groom.perMonth}
              </strong>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {language === 'ar' ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
            <span className="font-bold text-gray-700 block">
              {language === 'ar' ? 'المواصفات الفنية:' : 'Technical Specifications:'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {Object.entries(language === 'ar' ? selectedProduct.specsAr : selectedProduct.specsEn).map(
                ([k, v], i) => (
                  <div key={i} className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 block">{k}</span>
                    <strong className="text-gray-800">{v}</strong>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-sm font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-sm font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-red-gradient text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>{t.groom.addToCart}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleFinanceProduct}
              className="w-full bg-gray-100 hover:bg-[#FDE8ED] text-gray-800 hover:text-[#D91B3E] border border-gray-200 font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>
                {language === 'ar'
                  ? 'طلب تقسيط هذا المنتج'
                  : 'Apply for Installment on this Item'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </ModalFrame>
  );
};

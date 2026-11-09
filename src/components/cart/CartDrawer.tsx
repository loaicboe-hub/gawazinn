import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Truck,
  AlertCircle,
} from 'lucide-react';
import type { Order } from '../../types';
import { SmartImage } from '../common/SmartImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    language,
    t,
    dir,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    cartCount,
    createOrder,
    currentUser,
    setActiveSection,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(currentUser?.city || 'القاهرة');
  const [paymentMethod, setPaymentMethod] =
    useState<Order['paymentMethod']>('installments_request');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomerName(currentUser?.name || '');
      setPhone(currentUser?.phone || '');
      if (currentUser?.city) setCity(currentUser.city);
      setErrorMsg(null);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const id = await createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        paymentMethod,
      });
      setCreatedOrderId(id);
      setCheckoutStep('success');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : language === 'ar'
          ? 'تعذر إتمام الطلب. تحقق من الحقول أو المخزون.'
          : 'Unable to submit order. Check fields or item stock.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onClose();
    setCheckoutStep('cart');
    setActiveSection('customerPortal');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.cart}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transition-transform duration-300 ${
          dir === 'rtl' ? 'border-s-2 border-rose-200' : 'border-e-2 border-rose-200'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#D91B3E]/20 flex items-center justify-between bg-red-gradient text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h3 className="font-bold text-sm">
              {t.nav.cart} ({cartCount} {language === 'ar' ? 'قطع' : 'items'})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-20 space-y-3 text-gray-400">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 stroke-[1.5]" />
                  <p className="text-sm font-bold text-gray-600">
                    {language === 'ar' ? 'سلة المشتريات فارغة' : 'Your Shopping Cart is Empty'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === 'ar'
                      ? 'تصفح جهاز العريس وجهاز العروسة وأضف ما ترغب به.'
                      : "Explore Groom's & Bride's essentials and add items to begin."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-2xl bg-[#FFF8F8] border border-rose-100 flex items-center gap-3"
                    >
                      <SmartImage
                        src={item.product.imageUrl}
                        alt={language === 'ar' ? item.product.nameAr : item.product.nameEn}
                        fallbackTitle={item.product.brand}
                        className="w-16 h-16 rounded-xl object-cover border shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-[#D91B3E] font-bold block truncate">
                          {item.product.brand}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        <div className="text-xs font-black text-[#D91B3E] mt-1">
                          {item.product.price.toLocaleString()} {t.groom.egp}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            aria-label="Remove item"
                            className="text-gray-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {checkoutStep === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 border-b pb-2">
                {language === 'ar'
                  ? 'بيانات التوصيل وتأكيد الطلب'
                  : 'Delivery & Order Confirmation'}
              </h4>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#B31331] text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.name}:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم بالكامل' : 'Full name'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.phone}:</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.address}:</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'الحي، الشارع، رقم العمارة والشقة'
                      : 'District, street, building & apt'
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.city}:</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t">
                <label className="text-xs font-bold text-gray-700 block">
                  {language === 'ar' ? 'طريقة السداد:' : 'Payment Method:'}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 text-xs">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="installments_request"
                      checked={paymentMethod === 'installments_request'}
                      onChange={() => setPaymentMethod('installments_request')}
                      className="accent-[#D91B3E]"
                    />
                    <CreditCard className="w-4 h-4 text-[#D91B3E] shrink-0" />
                    <div>
                      <strong className="block text-gray-900">
                        {language === 'ar'
                          ? 'طلب تقسيط قيمة الطلب (حتى 36 شهر)'
                          : 'Installment Plan Request (up to 36 months)'}
                      </strong>
                      <span className="text-[10px] text-gray-500">
                        {language === 'ar'
                          ? 'يتواصل ممثل التمويل معك لاستكمال المراجعة الائتمانية'
                          : 'Financing specialist coordinates credit approval'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 text-xs">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="accent-[#D91B3E]"
                    />
                    <Truck className="w-4 h-4 text-[#D91B3E] shrink-0" />
                    <span className="font-bold text-gray-900">
                      {language === 'ar'
                        ? 'الدفع عند الاستلام والمعاينة'
                        : 'Cash on Delivery & Inspection'}
                    </span>
                  </label>
                </div>
              </div>
            </form>
          )}

          {checkoutStep === 'success' && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                {language === 'ar' ? 'تم تأكيد طلبك بنجاح!' : 'Order Confirmed Successfully!'}
              </h3>
              <p className="text-xs text-gray-600 max-w-xs mx-auto">
                {language === 'ar'
                  ? `تم تسجيل طلبك برقم مرجعي (#${createdOrderId}) وسيتم تجهيز الشحنة والتواصل معك هاتفياً.`
                  : `Order (#${createdOrderId}) has been placed. Our logistics team will coordinate delivery.`}
              </p>
              <button
                type="button"
                onClick={handleFinish}
                className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md hover:opacity-95 cursor-pointer"
              >
                {language === 'ar' ? 'متابعة الطلب في حسابي' : 'Track in My Portal'}
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {checkoutStep !== 'success' && cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-[#FFF8F8] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>
                  {language === 'ar' ? 'الشحن والتوصيل المبطن:' : 'Protected Shipping:'}
                </span>
                <span className="font-bold text-emerald-600">
                  {language === 'ar' ? 'مجاناً' : 'Free'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-rose-100">
                <span>{t.common.total}</span>
                <span className="text-lg font-black text-[#D91B3E]">
                  {cartTotal.toLocaleString()} {t.groom.egp}
                </span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={() => setCheckoutStep('checkout')}
                className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'ar' ? 'متابعة إتمام الطلب' : 'Proceed to Checkout'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 rounded-xl border text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  <span>
                    {submitting
                      ? language === 'ar'
                        ? 'جاري الحفظ...'
                        : 'Saving...'
                      : language === 'ar'
                      ? 'تأكيد الطلب نهائياً'
                      : 'Confirm Order'}
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

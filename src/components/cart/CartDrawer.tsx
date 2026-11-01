import React, { useState } from 'react';
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
  ShieldCheck 
} from 'lucide-react';

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
    clearCart, 
    cartTotal, 
    cartCount,
    createOrder,
    currentUser,
    setActiveSection
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('عمارة 14، شارع النزهة، مصر الجديدة');
  const [city, setCity] = useState('القاهرة');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card' | 'installments_request'>('installments_request');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = createOrder({
      customerName: customerName || 'عميل جواز إن',
      phone: phone || '010XXXXXXXX',
      address,
      city,
      paymentMethod
    });
    setCreatedOrderId(id);
    setCheckoutStep('success');
  };

  const handleFinish = () => {
    onClose();
    setCheckoutStep('cart');
    setActiveSection('customerPortal');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
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
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white transition"
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
                  <p className="text-sm font-bold text-gray-600">سلة المشتريات فارغة</p>
                  <p className="text-xs text-gray-400">تصفح جهاز العريس وجهاز العروسة وأضف ما ترغب به.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div 
                      key={item.product.id}
                      className="p-3.5 rounded-2xl bg-[#FFF8F8] border border-rose-100 flex items-center gap-3"
                    >
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.nameAr}
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

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-rose-600 transition p-1"
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
                بيانات التوصيل وتأكيد الطلب
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.name}:</label>
                <input 
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
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
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.address}:</label>
                <input 
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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

              {/* Payment Method Radio */}
              <div className="space-y-2 pt-2 border-t">
                <label className="text-xs font-bold text-gray-700 block">طريقة السداد:</label>
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
                    <CreditCard className="w-4 h-4 text-[#D91B3E]" />
                    <div>
                      <strong className="block text-gray-900">طلب تقسيط قيمة الطلب (حتى 36 شهر)</strong>
                      <span className="text-[10px] text-gray-500">يقوم ممثل التمويل بالتواصل معك لاستكمال الأوراق</span>
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
                    <Truck className="w-4 h-4 text-[#D91B3E]" />
                    <span className="font-bold text-gray-900">الدفع عند الاستلام والمعاينة</span>
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
              <h3 className="text-xl font-black text-gray-900">تم تأكيد طلبك بنجاح!</h3>
              <p className="text-xs text-gray-600 max-w-xs mx-auto">
                تم تسجيل طلبك برقم مرجعي (#{createdOrderId}) وسيتم تجهيز الشحنة والتواصل معك هاتفياً.
              </p>
              <button
                onClick={handleFinish}
                className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md hover:opacity-95"
              >
                متابعة الطلب في حسابي
              </button>
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        {checkoutStep !== 'success' && cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-[#FFF8F8] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>الشحن والتوصيل المبطن:</span>
                <span className="font-bold text-emerald-600">مجاناً</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-rose-100">
                <span>الإجمالي:</span>
                <span className="text-lg font-black text-[#D91B3E]">
                  {cartTotal.toLocaleString()} {t.groom.egp}
                </span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                onClick={() => setCheckoutStep('checkout')}
                className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 rounded-xl border text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-1 bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  <span>تأكيد الطلب نهائياً</span>
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

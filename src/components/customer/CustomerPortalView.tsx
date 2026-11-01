import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User as UserIcon, 
  ShoppingBag, 
  Building2, 
  Heart, 
  CreditCard, 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Package, 
  Eye, 
  LogOut,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const CustomerPortalView: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const { 
    language, 
    t, 
    dir, 
    currentUser, 
    orders, 
    finishingInquiries, 
    weddingBookings, 
    financingApplications, 
    supportCases,
    logout,
    setActiveSection
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const [activeTab, setActiveTab] = useState<'orders' | 'finishing' | 'wedding' | 'financing' | 'profile'>('orders');

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#D91B3E] mx-auto flex items-center justify-center shadow-lg border border-rose-100">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
          {language === 'ar' ? 'سجل دخولك لمتابعة طلباتك الموحدة' : 'Sign in to access your unified requests hub'}
        </h2>
        <p className="text-sm text-gray-600">
          {language === 'ar' 
            ? 'تتيح لك منصة جواز إن متابعة مقايسات شقتك، مشتريات جهازك، وحجوزات فرحك في مكان واحد.'
            : 'Track your apartment finishing quotes, trousseau orders, and wedding bookings in one unified dashboard.'}
        </p>
        <button
          onClick={() => setActiveSection('home')}
          className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md hover:opacity-95 transition"
        >
          {language === 'ar' ? 'العودة للرئيسية' : 'Return Home'}
        </button>
      </div>
    );
  }

  // Filter inquiries belonging to current user or all in demo
  const userOrders = orders;
  const userFinishing = finishingInquiries;
  const userWeddings = weddingBookings;
  const userFinancing = financingApplications;

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
      case 'approved':
      case 'date_confirmed':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300">
          {(t.customerPortal.status as any)[status] || status}
        </span>;
      case 'processing':
      case 'under_review':
      case 'site_visit_scheduled':
      case 'in_progress':
      case 'contacted':
        return <span className="bg-rose-50 text-[#D91B3E] text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-200">
          {(t.customerPortal.status as any)[status] || status}
        </span>;
      case 'rejected':
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-gray-300">
          {(t.customerPortal.status as any)[status] || status}
        </span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300">
          {(t.customerPortal.status as any)[status] || status}
        </span>;
    }
  };

  return (
    <div className="space-y-12 pb-24">
      
      {/* Customer Header Banner */}
      <div className="bg-red-gradient text-white py-12 border-b border-[#D91B3E]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-4 text-center sm:text-start">
              <div className="w-16 h-16 rounded-2xl bg-white text-[#D91B3E] font-black text-2xl flex items-center justify-center shadow-lg">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold border border-white/30">
                    {language === 'ar' ? 'حساب عميل موحد' : 'Unified Customer'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>{currentUser.phone}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span>{currentUser.city || (language === 'ar' ? 'القاهرة' : 'Cairo')}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCart}
                className="bg-white text-[#D91B3E] font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-2 hover:bg-gray-50"
              >
                <ShoppingBag className="w-4 h-4 text-[#D91B3E]" />
                <span>{t.nav.cart}</span>
              </button>

              <button
                onClick={logout}
                className="bg-black/20 hover:bg-black/30 text-white font-semibold text-xs py-2.5 px-4 rounded-xl border border-white/20 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.nav.logout}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-inherit" />
            <span>{t.customerPortal.tabs.orders} ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finishing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'finishing'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-inherit" />
            <span>{t.customerPortal.tabs.finishing} ({userFinishing.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wedding')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'wedding'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <Heart className="w-4 h-4 text-inherit" />
            <span>{t.customerPortal.tabs.bookings} ({userWeddings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'financing'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-inherit" />
            <span>{t.customerPortal.tabs.installments} ({userFinancing.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders (Groom & Bride Purchases) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {userOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-gray-500 border border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>{t.customerPortal.emptyState}</p>
              </div>
            ) : (
              userOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">طلب رقم: #{ord.id}</span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        تاريخ الطلب: {new Date(ord.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-xs text-gray-500 block">إجمالي الطلب:</span>
                      <strong className="text-lg font-black text-[#D91B3E]">
                        {ord.total.toLocaleString()} {t.groom.egp}
                      </strong>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700 block">العناصر المطلوبة:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF7F2] border border-gray-100 text-xs">
                          <img src={it.product.imageUrl} alt={it.product.nameAr} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1 truncate">
                            <p className="font-bold text-gray-900 truncate">{language === 'ar' ? it.product.nameAr : it.product.nameEn}</p>
                            <span className="text-gray-500 text-[11px]">{it.quantity} × {it.product.price.toLocaleString()} ج.م</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs text-gray-600 gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>{ord.address} — {ord.city}</span>
                    </div>
                    <span className="bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-700">
                      طريقة الدفع: {ord.paymentMethod === 'installments_request' ? 'طلب تقسيط' : ord.paymentMethod}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Finishing Inquiries */}
        {activeTab === 'finishing' && (
          <div className="space-y-4">
            {userFinishing.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-gray-500 border border-gray-200">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>{t.customerPortal.emptyState}</p>
              </div>
            ) : (
              userFinishing.map((inq) => (
                <div key={inq.id} className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">استفسار مقايسة: #{inq.id}</span>
                        {getStatusBadge(inq.status)}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        تاريخ الطلب: {new Date(inq.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-xs text-gray-500 block">الميزانية التقريبية:</span>
                      <strong className="text-lg font-black text-[#D91B3E]">
                        {(inq.budgetEGP || inq.areaSqm * 4500).toLocaleString()} {t.groom.egp}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">المساحة:</span>
                      <strong className="text-gray-900">{inq.areaSqm} م²</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">الغرف والحمامات:</span>
                      <strong className="text-gray-900">{inq.roomsCount} غرف / {inq.bathroomsCount} حمام</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">مستوى التشطيب:</span>
                      <strong className="text-gray-900">{inq.finishingTier}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">المحافظة:</span>
                      <strong className="text-gray-900">{inq.governorate}</strong>
                    </div>
                  </div>

                  {inq.notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <span className="font-bold">ملاحظاتك:</span> {inq.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Wedding Bookings */}
        {activeTab === 'wedding' && (
          <div className="space-y-4">
            {userWeddings.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-gray-500 border border-gray-200">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>{t.customerPortal.emptyState}</p>
              </div>
            ) : (
              userWeddings.map((wed) => (
                <div key={wed.id} className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">طلب حجز: #{wed.id}</span>
                        {getStatusBadge(wed.status)}
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mt-1">{wed.serviceName}</h4>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-xs text-gray-500 block">الموعد المطلوب:</span>
                      <strong className="text-sm font-bold text-[#D91B3E] flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{wed.weddingDate}</span>
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#D91B3E] shrink-0" />
                    <span>تأكيد الموعد يتم رسمياً عبر اتصال هاتفي مع منسق فرحي للتأكد من توافر القاعة أو الخدمة.</span>
                  </div>

                  {wed.notes && (
                    <p className="text-xs text-gray-600">
                      <span className="font-bold">ملاحظات الحجز:</span> {wed.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Financing Applications */}
        {activeTab === 'financing' && (
          <div className="space-y-4">
            {userFinancing.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-gray-500 border border-gray-200">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>{t.customerPortal.emptyState}</p>
              </div>
            ) : (
              userFinancing.map((fin) => (
                <div key={fin.id} className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">طلب تمويل رقم: #{fin.id}</span>
                        {getStatusBadge(fin.status)}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        الجهة المفضلة: {fin.preferredProvider}
                      </span>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-xs text-gray-500 block">المبلغ المطلوب:</span>
                      <strong className="text-lg font-black text-[#D91B3E]">
                        {fin.requestedAmount.toLocaleString()} {t.groom.egp}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">فترة السداد:</span>
                      <strong className="text-gray-900">{fin.tenureMonths} شهراً</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">جهة العمل:</span>
                      <strong className="text-gray-900">{fin.employer}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">الدخل الشهري:</span>
                      <strong className="text-gray-900">{fin.monthlyIncome.toLocaleString()} ج.م</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  );
};

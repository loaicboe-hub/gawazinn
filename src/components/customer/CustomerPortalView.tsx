import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  User as UserIcon,
  ShoppingBag,
  Building2,
  Heart,
  CreditCard,
  MapPin,
  Phone,
  Calendar,
  LogOut,
  AlertCircle,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { getRoleLabel } from '../../../shared/rbac';
import { SmartImage } from '../common/SmartImage';

export const CustomerPortalView: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const {
    language,
    t,
    currentUser,
    orders,
    finishingInquiries,
    weddingBookings,
    financingApplications,
    logout,
    setAuthModalOpen,
    isStaff,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'finishing' | 'wedding' | 'financing' | 'profile'
  >('orders');

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#D91B3E] mx-auto flex items-center justify-center shadow-lg border border-rose-100">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          {language === 'ar'
            ? 'سجل دخولك لمتابعة طلباتك الموحدة'
            : 'Sign in to access your unified requests hub'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'ar'
            ? 'تتيح لك منصة جواز إن متابعة مقايسات شقتك، مشتريات جهازك، وحجوزات فرحك وطلبات التقسيط في مكان واحد آمن.'
            : 'Track your apartment finishing quotes, trousseau orders, wedding bookings, and installment applications securely in one unified dashboard.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            data-testid="portal-signin-btn"
            className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md hover:opacity-95 transition cursor-pointer"
          >
            {language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In Now'}
          </button>
          <Link
            to="/"
            className="bg-white border border-gray-200 hover:border-[#D91B3E]/40 text-gray-700 font-bold text-xs py-3 px-6 rounded-xl transition"
          >
            {language === 'ar' ? 'العودة للرئيسية' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const label = (t.customerPortal.status as Record<string, string>)[status] || status;
    switch (status) {
      case 'completed':
      case 'delivered':
      case 'approved':
      case 'date_confirmed':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300">
            {label}
          </span>
        );
      case 'processing':
      case 'under_review':
      case 'site_visit_scheduled':
      case 'in_progress':
      case 'contacted':
        return (
          <span className="bg-rose-50 text-[#D91B3E] text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-200">
            {label}
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-gray-300">
            {label}
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300">
            {label}
          </span>
        );
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
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl font-black text-white">
                    {language === 'ar' ? currentUser.name : currentUser.nameEn || currentUser.name}
                  </h1>
                  <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold border border-white/30">
                    {getRoleLabel(currentUser.role, language)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 mt-1 justify-center sm:justify-start">
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

            <div className="flex flex-wrap items-center gap-3">
              {isStaff && (
                <Link
                  to="/admin"
                  className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/30 transition flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'ar' ? 'لوحة الإدارة' : 'Admin OS'}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={onOpenCart}
                className="bg-white text-[#D91B3E] font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#D91B3E]" />
                <span>{t.nav.cart}</span>
              </button>

              <button
                type="button"
                onClick={() => void logout()}
                className="bg-black/20 hover:bg-black/30 text-white font-semibold text-xs py-2.5 px-4 rounded-xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
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
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {t.customerPortal.tabs.orders} ({orders.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finishing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'finishing'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>
              {t.customerPortal.tabs.finishing} ({finishingInquiries.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wedding')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'wedding'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>
              {t.customerPortal.tabs.bookings} ({weddingBookings.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'financing'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {t.customerPortal.tabs.installments} ({financingApplications.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#D91B3E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-[#FDE8ED] border border-gray-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{t.customerPortal.tabs.profile}</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-gray-500 border border-gray-200 space-y-3">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">{t.customerPortal.emptyState}</p>
                <div className="flex justify-center gap-3">
                  <Link to="/groom" className="text-xs font-bold text-[#D91B3E] hover:underline">
                    {t.nav.groom}
                  </Link>
                  <span>•</span>
                  <Link to="/bride" className="text-xs font-bold text-[#D91B3E] hover:underline">
                    {t.nav.bride}
                  </Link>
                </div>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  data-testid={`portal-order-${ord.id}`}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {language === 'ar' ? `طلب رقم: #${ord.id}` : `Order #${ord.id}`}
                        </span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {language === 'ar' ? 'تاريخ الطلب:' : 'Order Date:'}{' '}
                        {new Date(ord.createdAt).toLocaleDateString(
                          language === 'ar' ? 'ar-EG' : 'en-EG',
                        )}
                      </span>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-xs text-gray-500 block">
                        {language === 'ar' ? 'إجمالي الطلب:' : 'Order Total:'}
                      </span>
                      <strong className="text-lg font-black text-[#D91B3E]">
                        {ord.total.toLocaleString()} {t.groom.egp}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700 block">
                      {language === 'ar' ? 'العناصر المطلوبة:' : 'Order Items:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ord.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF7F2] border border-gray-100 text-xs"
                        >
                          <SmartImage
                            src={it.product.imageUrl}
                            alt={language === 'ar' ? it.product.nameAr : it.product.nameEn}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 truncate">
                            <p className="font-bold text-gray-900 truncate">
                              {language === 'ar' ? it.product.nameAr : it.product.nameEn}
                            </p>
                            <span className="text-gray-500 text-[11px]">
                              {it.quantity} × {it.product.price.toLocaleString()} {t.groom.egp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs text-gray-600 gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D91B3E]" />
                      <span>
                        {ord.address} — {ord.city}
                      </span>
                    </div>
                    <span className="bg-gray-100 px-2.5 py-1 rounded font-semibold text-gray-700">
                      {language === 'ar' ? 'طريقة السداد:' : 'Payment:'}{' '}
                      {ord.paymentMethod === 'installments_request'
                        ? language === 'ar'
                          ? 'طلب تقسيط'
                          : 'Installments'
                        : ord.paymentMethod === 'cash_on_delivery'
                        ? language === 'ar'
                          ? 'الدفع عند الاستلام'
                          : 'Cash on Delivery'
                        : ord.paymentMethod}
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
            {finishingInquiries.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-gray-500 border border-gray-200 space-y-3">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">{t.customerPortal.emptyState}</p>
                <Link to="/finishing" className="text-xs font-bold text-[#D91B3E] hover:underline">
                  {t.finishing.requestQuoteBtn}
                </Link>
              </div>
            ) : (
              finishingInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {language === 'ar' ? `مقايسة تشطيب: #${inq.id}` : `Finishing Quote #${inq.id}`}
                        </span>
                        {getStatusBadge(inq.status)}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(inq.createdAt).toLocaleDateString(
                          language === 'ar' ? 'ar-EG' : 'en-EG',
                        )}
                      </span>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-xs text-gray-500 block">
                        {language === 'ar' ? 'الميزانية التقديرية:' : 'Estimated Budget:'}
                      </span>
                      <strong className="text-lg font-black text-[#D91B3E]">
                        {(inq.budgetEGP || inq.areaSqm * 4500).toLocaleString()} {t.groom.egp}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">
                        {language === 'ar' ? 'المساحة:' : 'Area:'}
                      </span>
                      <strong className="text-gray-900">
                        {inq.areaSqm} {language === 'ar' ? 'م²' : 'sqm'}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">
                        {language === 'ar' ? 'الغرف والحمامات:' : 'Layout:'}
                      </span>
                      <strong className="text-gray-900">
                        {inq.roomsCount}R / {inq.bathroomsCount}B
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">
                        {language === 'ar' ? 'المستوى:' : 'Tier:'}
                      </span>
                      <strong className="text-gray-900">{inq.finishingTier}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">{t.common.governorate}:</span>
                      <strong className="text-gray-900">{inq.governorate}</strong>
                    </div>
                  </div>

                  {inq.notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <span className="font-bold">
                        {language === 'ar' ? 'ملاحظات:' : 'Notes:'}{' '}
                      </span>
                      {inq.notes}
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
            {weddingBookings.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-gray-500 border border-gray-200 space-y-3">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">{t.customerPortal.emptyState}</p>
                <Link to="/wedding" className="text-xs font-bold text-[#D91B3E] hover:underline">
                  {t.sections.sec4Action}
                </Link>
              </div>
            ) : (
              weddingBookings.map((wed) => (
                <div
                  key={wed.id}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {language === 'ar' ? `طلب حجز: #${wed.id}` : `Booking #${wed.id}`}
                        </span>
                        {getStatusBadge(wed.status)}
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mt-1">{wed.serviceName}</h4>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-xs text-gray-500 block">
                        {language === 'ar' ? 'الموعد المطلوب:' : 'Preferred Date:'}
                      </span>
                      <strong className="text-sm font-bold text-[#D91B3E] flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{wed.weddingDate}</span>
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#D91B3E] shrink-0" />
                    <span>{t.wedding.importantNotice}</span>
                  </div>

                  {wed.notes && (
                    <p className="text-xs text-gray-600">
                      <span className="font-bold">{t.common.notes}: </span>
                      {wed.notes}
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
            {financingApplications.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-gray-500 border border-gray-200 space-y-3">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">{t.customerPortal.emptyState}</p>
                <Link
                  to="/installments"
                  className="text-xs font-bold text-[#D91B3E] hover:underline"
                >
                  {t.installments.applyForInstallment}
                </Link>
              </div>
            ) : (
              financingApplications.map((fin) => (
                <div
                  key={fin.id}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {language === 'ar' ? `طلب تمويل #${fin.id}` : `Financing #${fin.id}`}
                        </span>
                        {getStatusBadge(fin.status)}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {language === 'ar' ? 'الجهة:' : 'Provider:'} {fin.preferredProvider} • NID:{' '}
                        <span className="font-mono">{fin.nationalId}</span>
                      </span>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-xs text-gray-500 block">
                        {language === 'ar' ? 'المبلغ المطلوب:' : 'Requested Amount:'}
                      </span>
                      <strong className="text-lg font-black text-[#D91B3E]">
                        {fin.requestedAmount.toLocaleString()} {t.groom.egp}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">
                        {language === 'ar' ? 'فترة السداد:' : 'Tenure:'}
                      </span>
                      <strong className="text-gray-900">
                        {fin.tenureMonths} {language === 'ar' ? 'شهراً' : 'months'}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">
                        {language === 'ar' ? 'جهة العمل:' : 'Employer:'}
                      </span>
                      <strong className="text-gray-900">{fin.employer}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2]">
                      <span className="text-gray-400 block">
                        {language === 'ar' ? 'الدخل الشهري:' : 'Monthly Income:'}
                      </span>
                      <strong className="text-gray-900">
                        {fin.monthlyIncome.toLocaleString()} {t.groom.egp}
                      </strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Personal Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-md space-y-6">
            <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              {t.customerPortal.tabs.profile}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] space-y-1">
                <span className="text-gray-500 block">{t.common.name}</span>
                <strong className="text-sm text-gray-900">{currentUser.name}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] space-y-1">
                <span className="text-gray-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#D91B3E]" /> {t.common.email}
                </span>
                <strong className="text-sm text-gray-900">{currentUser.email}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] space-y-1">
                <span className="text-gray-500 block">{t.common.phone}</span>
                <strong className="text-sm text-gray-900">{currentUser.phone}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] space-y-1">
                <span className="text-gray-500 block">
                  {language === 'ar' ? 'مستوى الحساب والمرحلة:' : 'Role & Lifecycle Stage:'}
                </span>
                <strong className="text-sm text-[#D91B3E]">
                  {getRoleLabel(currentUser.role, language)} • {currentUser.currentStage}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

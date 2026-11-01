import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Sparkles, 
  Heart, 
  Users, 
  CreditCard, 
  HeartHandshake, 
  Settings, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  ArrowRight,
  TrendingUp,
  FileText,
  Lock,
  Save,
  RefreshCw
} from 'lucide-react';
import { Product, WeddingServiceItem, FinishingTier } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const { 
    language, 
    t, 
    dir, 
    finishingInquiries, 
    updateFinishingStatus, 
    weddingBookings, 
    updateWeddingBookingStatus,
    orders, 
    updateOrderStatus,
    financingApplications, 
    updateFinancingStatus,
    supportCases, 
    updateSupportCaseStatus,
    sponsorshipInquiries,
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    weddingServices, 
    addWeddingService, 
    deleteWeddingService,
    finishingPackages,
    settings, 
    updateSettings,
    setActiveSection
  } = useApp();

  const [activeModule, setActiveModule] = useState<
    'overview' | 'finishing' | 'groom' | 'bride' | 'wedding' | 'customers' | 'financing' | 'support' | 'settings'
  >('overview');

  // New Product Modal Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(15000);
  const [newProdCategory, setNewProdCategory] = useState('appliances');
  const [newProdTrousseau, setNewProdTrousseau] = useState<'groom' | 'bride'>('groom');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80');

  // Settings local state
  const [settingsForm, setSettingsForm] = useState(settings);

  // KPIs
  const totalInquiries = finishingInquiries.length;
  const totalOrders = orders.length;
  const totalBookings = weddingBookings.length;
  const totalFinancing = financingApplications.length;
  const totalSupport = supportCases.length;
  const pendingRequestsCount = 
    finishingInquiries.filter(i => i.status === 'pending' || i.status === 'under_review').length +
    weddingBookings.filter(b => b.status === 'pending_review').length +
    financingApplications.filter(f => f.status === 'submitted' || f.status === 'under_review').length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const newProd: Product = {
      id: `${newProdTrousseau}-p-${Date.now().toString().slice(-4)}`,
      trousseauType: newProdTrousseau,
      category: newProdCategory,
      categoryAr: newProdCategory === 'appliances' ? 'أجهزة كهربائية' : 'أثاث ومستلزمات',
      categoryEn: newProdCategory,
      nameAr: newProdName,
      nameEn: newProdName,
      brand: newProdBrand || 'Gawaz Inn Luxury',
      price: Number(newProdPrice),
      sku: `GIN-${Date.now().toString().slice(-6)}`,
      stock: 10,
      imageUrl: newProdImage,
      descriptionAr: 'منتج معتمد بضمان الوكيل الرسمي عبر منصة جواز إن.',
      descriptionEn: 'Official certified product via GAWAZ INN platform.',
      specsAr: { 'الضمان': 'سنتين' },
      specsEn: { 'Warranty': '2 Years' }
    };

    addProduct(newProd);
    setShowAddProductModal(false);
    setNewProdName('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col lg:flex-row pb-24">
      
      {/* Sidebar Navigation (3 cols) */}
      <aside className="w-full lg:w-72 bg-gradient-to-b from-[#1C1819] to-[#261618] text-white p-6 shrink-0 border-e border-white/10 space-y-8">
        
        {/* Admin Brand Badge */}
        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-red-gradient text-white font-black flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              {language === 'ar' ? 'إدارة جواز إن' : 'GAWAZ INN Admin'}
            </h2>
            <span className="text-[11px] text-rose-200 font-semibold flex items-center gap-1">
              <span>{language === 'ar' ? 'لوحة القيادة المركزية' : 'Central Control Panel'}</span>
            </span>
          </div>
        </div>

        {/* Modules List */}
        <nav className="space-y-1.5">
          <button
            onClick={() => setActiveModule('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'overview'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.admin.tabs.overview}</span>
          </button>

          <button
            onClick={() => setActiveModule('finishing')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'finishing'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4" />
              <span>{t.admin.tabs.finishing}</span>
            </div>
            {finishingInquiries.length > 0 && (
              <span className="bg-rose-500/40 text-white px-2 py-0.5 rounded-full text-[10px]">
                {finishingInquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveModule('groom')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'groom'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4" />
              <span>{t.admin.tabs.groom}</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
              {products.filter(p => p.trousseauType === 'groom').length}
            </span>
          </button>

          <button
            onClick={() => setActiveModule('bride')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'bride'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4" />
              <span>{t.admin.tabs.bride}</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
              {products.filter(p => p.trousseauType === 'bride').length}
            </span>
          </button>

          <button
            onClick={() => setActiveModule('wedding')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'wedding'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4" />
              <span>{t.admin.tabs.wedding}</span>
            </div>
            {weddingBookings.length > 0 && (
              <span className="bg-rose-500/40 text-white px-2 py-0.5 rounded-full text-[10px]">
                {weddingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveModule('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'customers'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.admin.tabs.customers}</span>
          </button>

          <button
            onClick={() => setActiveModule('financing')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'financing'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              <span>{t.admin.tabs.financing}</span>
            </div>
            {financingApplications.length > 0 && (
              <span className="bg-rose-500/40 text-white px-2 py-0.5 rounded-full text-[10px]">
                {financingApplications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveModule('support')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'support'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <HeartHandshake className="w-4 h-4" />
              <span>{t.admin.tabs.support}</span>
            </div>
            {supportCases.length > 0 && (
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                {supportCases.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveModule('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
              activeModule === 'settings'
                ? 'bg-red-gradient text-white shadow-md'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.admin.tabs.settings}</span>
          </button>
        </nav>

        {/* Back to Client Site Shortcut */}
        <div className="pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveSection('home')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition flex items-center justify-center gap-2"
          >
            <span>{language === 'ar' ? 'الرجوع للموقع الرئيسي' : 'Return to Storefront'}</span>
          </button>
        </div>

      </aside>

      {/* Main Admin Workspace (9 cols) */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#C6A66B]/30 shadow-sm">
          <div>
            <span className="text-xs font-bold text-[#D91B3E] uppercase tracking-wider block">
              {language === 'ar' ? 'لوحة الإدارة التنفيذية' : 'Executive Management'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {(t.admin.tabs as any)[activeModule] || activeModule}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-rose-100 font-bold text-[#D91B3E]">
              {language === 'ar' ? `${pendingRequestsCount} طلبات معلقة تتطلب إجراء` : `${pendingRequestsCount} Pending Action Items`}
            </span>
          </div>
        </div>

        {/* 1. OVERVIEW MODULE */}
        {activeModule === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiTotalCustomers}</span>
                <span className="text-2xl font-black text-gray-900">1,480</span>
                <span className="text-[10px] text-emerald-600 font-bold block">+34 هذا الأسبوع</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiFinishingInquiries}</span>
                <span className="text-2xl font-black text-[#D91B3E]">{totalInquiries}</span>
                <span className="text-[10px] text-amber-600 font-bold block">مطلوب معاينات</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiProductOrders}</span>
                <span className="text-2xl font-black text-gray-900">{totalOrders}</span>
                <span className="text-[10px] text-[#D91B3E] font-bold block">جاري التجهيز</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiWeddingBookings}</span>
                <span className="text-2xl font-black text-[#D91B3E]">{totalBookings}</span>
                <span className="text-[10px] text-purple-600 font-bold block">تأكيد المواعيد</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiInstallments}</span>
                <span className="text-2xl font-black text-gray-900">{totalFinancing}</span>
                <span className="text-[10px] text-emerald-600 font-bold block">فحص ائتماني</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs text-gray-500 block">{t.admin.kpiSocialSupport}</span>
                <span className="text-2xl font-black text-rose-700">{totalSupport}</span>
                <span className="text-[10px] text-rose-600 font-bold block">حالات سرية</span>
              </div>
            </div>

            {/* Recent Submissions Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Finishing Inquiries Feed */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D91B3E]" />
                    <span>أحدث طلبات مقايسات التشطيب</span>
                  </h3>
                  <button 
                    onClick={() => setActiveModule('finishing')}
                    className="text-xs text-[#D91B3E] font-bold hover:underline"
                  >
                    عرض الكل ({finishingInquiries.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {finishingInquiries.slice(0, 3).map((inq) => (
                    <div key={inq.id} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-gray-200 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-gray-900 block">{inq.customerName}</strong>
                        <span className="text-gray-500">{inq.areaSqm} م² • {inq.governorate} • {inq.phone}</span>
                      </div>
                      <span className="bg-[#1C1819] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        {inq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wedding Bookings Feed */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#D91B3E]" />
                    <span>أحدث طلبات حجز خدمات الفرح</span>
                  </h3>
                  <button 
                    onClick={() => setActiveModule('wedding')}
                    className="text-xs text-[#D91B3E] font-bold hover:underline"
                  >
                    عرض الكل ({weddingBookings.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {weddingBookings.slice(0, 3).map((wed) => (
                    <div key={wed.id} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-gray-200 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-gray-900 block">{wed.serviceName}</strong>
                        <span className="text-gray-500">{wed.customerName} • تاريخ: {wed.weddingDate}</span>
                      </div>
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        {wed.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. FINISHING MANAGEMENT */}
        {activeModule === 'finishing' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                إدارة طلبات المقايسات والمعاينات الميدانية ({finishingInquiries.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3">الكود</th>
                      <th className="p-3">العميل</th>
                      <th className="p-3">الهاتف</th>
                      <th className="p-3">المساحة</th>
                      <th className="p-3">المحافظة</th>
                      <th className="p-3">المستوى</th>
                      <th className="p-3">الحالة الحالية</th>
                      <th className="p-3">تحديث الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {finishingInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-gray-900">#{inq.id}</td>
                        <td className="p-3 font-bold">{inq.customerName}</td>
                        <td className="p-3 text-gray-600">{inq.phone}</td>
                        <td className="p-3">{inq.areaSqm} م² ({inq.roomsCount} غرف)</td>
                        <td className="p-3">{inq.governorate}</td>
                        <td className="p-3 font-semibold text-[#D91B3E]">{inq.finishingTier}</td>
                        <td className="p-3">
                          <span className="bg-rose-50 text-[#D91B3E] px-2 py-0.5 rounded font-bold border border-rose-200">
                            {inq.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={inq.status}
                            onChange={(e) => updateFinishingStatus(inq.id, e.target.value as any)}
                            className="p-1.5 rounded-lg border border-gray-300 text-xs font-semibold focus:border-[#D91B3E] outline-none"
                          >
                            <option value="pending">قيد الانتظار (pending)</option>
                            <option value="under_review">جاري المراجعة (under_review)</option>
                            <option value="site_visit_scheduled">معاينة مجدولة (site_visit)</option>
                            <option value="quotation_ready">المقايسة جاهزة (quotation_ready)</option>
                            <option value="in_progress">جاري التنفيذ (in_progress)</option>
                            <option value="completed">تم التسليم (completed)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3 & 4. GROOM & BRIDE PRODUCTS MANAGEMENT */}
        {(activeModule === 'groom' || activeModule === 'bride') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">
                قائمة منتجات {activeModule === 'groom' ? 'جهاز العريس' : 'جهاز العروسة'} ({products.filter(p => p.trousseauType === activeModule).length})
              </h3>
              <button
                onClick={() => {
                  setNewProdTrousseau(activeModule);
                  setShowAddProductModal(true);
                }}
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>{t.admin.addNew}</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#FAF8F4] text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3">الصورة</th>
                      <th className="p-3">اسم المنتج</th>
                      <th className="p-3">الماركة</th>
                      <th className="p-3">السعر (ج.م)</th>
                      <th className="p-3">المخزون</th>
                      <th className="p-3">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.filter(p => p.trousseauType === activeModule).map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <img src={prod.imageUrl} alt={prod.nameAr} className="w-12 h-12 rounded-lg object-cover border" />
                        </td>
                        <td className="p-3 font-bold text-gray-900 max-w-xs">{language === 'ar' ? prod.nameAr : prod.nameEn}</td>
                        <td className="p-3 text-gray-600">{prod.brand}</td>
                        <td className="p-3 font-black text-[#D91B3E]">{prod.price.toLocaleString()} ج.م</td>
                        <td className="p-3 font-bold text-emerald-700">{prod.stock} قطعة</td>
                        <td className="p-3">
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title={t.admin.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. WEDDING PLANNER MANAGEMENT */}
        {activeModule === 'wedding' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                طلبات حجز واستفسارات خدمات الفرح ({weddingBookings.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3">الكود</th>
                      <th className="p-3">الخدمة المطلوبة</th>
                      <th className="p-3">العميل</th>
                      <th className="p-3">الهاتف</th>
                      <th className="p-3">موعد الفرح المطلوب</th>
                      <th className="p-3">المعازيم</th>
                      <th className="p-3">الحالة الحالية</th>
                      <th className="p-3">تحديث وتأكيد الموعد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {weddingBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold">#{b.id}</td>
                        <td className="p-3 font-bold text-gray-900">{b.serviceName}</td>
                        <td className="p-3">{b.customerName}</td>
                        <td className="p-3 text-gray-600">{b.phone}</td>
                        <td className="p-3 font-bold text-[#D91B3E]">{b.weddingDate}</td>
                        <td className="p-3">{b.guestCount || '—'} فرد</td>
                        <td className="p-3">
                          <span className="bg-rose-50 text-[#D91B3E] border border-rose-200 px-2 py-0.5 rounded font-bold">
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={b.status}
                            onChange={(e) => updateWeddingBookingStatus(b.id, e.target.value as any)}
                            className="p-1.5 rounded-lg border border-gray-300 text-xs font-semibold focus:border-[#D91B3E] outline-none"
                          >
                            <option value="pending_review">مراجعة أولية (pending)</option>
                            <option value="contacted">تم التواصل هاتفياً (contacted)</option>
                            <option value="date_confirmed">تأكيد الموعد رسمياً (confirmed)</option>
                            <option value="completed">مكتمل بنجاح (completed)</option>
                            <option value="cancelled">إلغاء الحجز (cancelled)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. CUSTOMERS DIRECTORY */}
        {activeModule === 'customers' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              سجل العملاء المسجلين بالمنصة
            </h3>
            <p className="text-xs text-gray-500">
              جميع العملاء يشتركون في هوية موحدة تمكنهم من إجراء طلبات التشطيب، مشتريات الجهاز، وحجوزات الفرح.
            </p>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-[#D91B3E] border border-rose-200 flex items-center justify-center font-bold">
                  ك
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">كريم عبد العزيز شريف</h4>
                  <span className="text-xs text-gray-500">01012345678 • karim.sherif@example.com • القاهرة — مصر الجديدة</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#D91B3E] bg-white px-3 py-1 rounded-lg border border-rose-100">
                عميل نشط
              </span>
            </div>
          </div>
        )}

        {/* 7. FINANCING MANAGEMENT */}
        {activeModule === 'financing' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              طلبات التمويل والتقسيط ({financingApplications.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#FAF7F2] text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">الكود</th>
                    <th className="p-3">العميل</th>
                    <th className="p-3">الرقم القومي</th>
                    <th className="p-3">المبلغ المطلوب</th>
                    <th className="p-3">المدة</th>
                    <th className="p-3">جهة التمويل المفضلة</th>
                    <th className="p-3">جهة العمل والدخل</th>
                    <th className="p-3">الحالة والقرار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financingApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold">#{app.id}</td>
                      <td className="p-3 font-bold">{app.customerName}</td>
                      <td className="p-3 font-mono">{app.nationalId}</td>
                      <td className="p-3 font-bold text-[#D91B3E]">{app.requestedAmount.toLocaleString()} ج.م</td>
                      <td className="p-3">{app.tenureMonths} شهراً</td>
                      <td className="p-3 font-semibold text-[#D91B3E]">{app.preferredProvider}</td>
                      <td className="p-3 text-gray-600">{app.employer} ({app.monthlyIncome.toLocaleString()} ج.م)</td>
                      <td className="p-3">
                        <select
                          value={app.status}
                          onChange={(e) => updateFinancingStatus(app.id, e.target.value as any)}
                          className="p-1.5 rounded-lg border border-gray-300 text-xs font-semibold focus:border-[#D91B3E] outline-none"
                        >
                          <option value="submitted">مقدم (submitted)</option>
                          <option value="under_review">جاري المراجعة الائتمانية</option>
                          <option value="approved">تمت الموافقة (approved)</option>
                          <option value="rejected">مرفوض (rejected)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. SOCIAL SUPPORT CASES MANAGEMENT */}
        {activeModule === 'support' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1C1819] to-[#261618] text-white p-6 rounded-3xl border border-rose-900/40 flex items-center gap-4">
              <Lock className="w-8 h-8 text-[#D91B3E] shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-200">ملفات المبادرة الإنسانية — حماية السرية التامة</h4>
                <p className="text-xs text-gray-300">
                  تخضع جميع هذه السجلات لقواعد الخصوصية الصارمة، ولا يتم الإفصاح عن هوية المستفيدين علناً.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                سجل حالات الدعم الميداني ({supportCases.length})
              </h3>

              <div className="space-y-4">
                {supportCases.map((cs) => (
                  <div key={cs.id} className="p-5 rounded-2xl bg-[#FAF7F2] border border-rose-100 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-3">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">حالة كودية: #{cs.id}</span>
                        <span className="text-xs text-gray-500 block mt-0.5">{cs.applicantName} • {cs.governorate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                          درجة الاحتياج: {cs.urgencyLevel}
                        </span>
                        <select
                          value={cs.status}
                          onChange={(e) => updateSupportCaseStatus(cs.id, e.target.value as any)}
                          className="p-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700"
                        >
                          <option value="confidential_review">مراجعة سرية أولية</option>
                          <option value="field_research">جاري البحث الميداني</option>
                          <option value="approved_for_support">مستحقة ومعتمدة للدعم</option>
                          <option value="funded_and_delivered">تم التسليم بنجاح</option>
                          <option value="ineligible">غير مستوفية الشروط</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-900">شرح الحالة: </span>
                      {cs.caseDescription}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#D91B3E]" />
                        <span>المستندات المقدمة: {cs.documentsSubmitted.join(' • ')}</span>
                      </div>
                      {cs.supportValueEstimated && (
                        <span className="font-bold text-[#D91B3E]">
                          الدعم المقدر: {cs.supportValueEstimated.toLocaleString()} ج.م
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. GENERAL SETTINGS */}
        {activeModule === 'settings' && (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              إعدادات منصة جواز إن العامة
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">شعار المنصة الرئيسي (عربي):</label>
                  <input 
                    type="text"
                    value={settingsForm.sloganAr}
                    onChange={(e) => setSettingsForm({ ...settingsForm, sloganAr: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Platform Slogan (EN):</label>
                  <input 
                    type="text"
                    value={settingsForm.sloganEn}
                    onChange={(e) => setSettingsForm({ ...settingsForm, sloganEn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">الخط الساخن الموحد:</label>
                  <input 
                    type="text"
                    value={settingsForm.hotline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">رقم الواتساب:</label>
                  <input 
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">الفائدة السنوية للتقسيط التقديرية (%):</label>
                  <input 
                    type="number"
                    value={settingsForm.interestRateAnnual}
                    onChange={(e) => setSettingsForm({ ...settingsForm, interestRateAnnual: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">البريد الإلكتروني للإدارة:</label>
                  <input 
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-red-gradient text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{t.admin.saveChanges}</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">
              إضافة منتج جديد لـ ({newProdTrousseau === 'groom' ? 'جهاز العريس' : 'جهاز العروسة'})
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">اسم المنتج:</label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: ثلاجة إل جي ديجيتال نوفروست"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs outline-none focus:border-[#D91B3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">الماركة:</label>
                  <input 
                    type="text"
                    placeholder="سامسونج / شارب / تركي"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">السعر (ج.م):</label>
                  <input 
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">رابط صورة المنتج (URL):</label>
                <input 
                  type="text"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-red-gradient text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

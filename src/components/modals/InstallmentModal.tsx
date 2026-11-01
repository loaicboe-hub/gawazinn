import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CreditCard, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';

export const InstallmentModal: React.FC = () => {
  const { 
    language, 
    t, 
    dir, 
    installmentModalOpen, 
    setInstallmentModalOpen, 
    installmentPrefillAmount, 
    addFinancingApplication, 
    currentUser, 
    settings,
    setActiveSection
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [nationalId, setNationalId] = useState('29501010101234');
  const [monthlyIncome, setMonthlyIncome] = useState(25000);
  const [employer, setEmployer] = useState('شركة خاصة / قطاع أعمال');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [requestedAmount, setRequestedAmount] = useState(installmentPrefillAmount || 100000);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [preferredProvider, setPreferredProvider] = useState(settings.activeInstallmentProviders[0] || 'valU');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!installmentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addFinancingApplication({
      userId: currentUser?.id,
      customerName: customerName || 'عميل تقسيط',
      phone: phone || '010XXXXXXXX',
      nationalId,
      monthlyIncome: Number(monthlyIncome),
      employer,
      governorate,
      requestedAmount: Number(requestedAmount),
      tenureMonths: Number(tenureMonths),
      preferredProvider,
      associatedSection: 'general'
    });
    setSubmittedId(id);
  };

  const handleClose = () => {
    setSubmittedId(null);
    setInstallmentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-9 max-w-lg w-full shadow-2xl border-2 border-[#C6A66B]/40 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 end-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedId ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-gray-900">
              {language === 'ar' ? 'تم تقديم طلب التقسيط بنجاح!' : 'Installment Application Submitted!'}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
              {language === 'ar' 
                ? 'جاري المراجعة الائتمانية مع الجهة المختارة وسيتم التواصل معك بالنتيجة خلال 24 ساعة عمل.' 
                : 'Creditworthiness assessment is underway with your chosen financing partner.'}
            </p>

            <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
              <span className="text-xs text-gray-400 block">{language === 'ar' ? 'كود الطلب:' : 'Application ID:'}</span>
              <strong className="text-lg font-mono font-black text-[#D91B3E]">#{submittedId}</strong>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  handleClose();
                  setActiveSection('customerPortal');
                }}
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition hover:opacity-95"
              >
                {language === 'ar' ? 'متابعة الطلب في حسابي' : 'Track in My Requests'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
                <CreditCard className="w-3.5 h-3.5 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'تمويل استهلاكي ميسر' : 'Consumer Financing'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                {t.installments.applyForInstallment}
              </h3>
              <p className="text-xs text-gray-500">
                {language === 'ar' ? 'قدم بياناتك الأساسية لبدء الفحص الائتماني دون تعقيدات' : 'Provide basic applicant info for fast credit pre-approval'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.common.name}:</label>
                  <input 
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.common.phone}:</label>
                  <input 
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.common.nationalId}:</label>
                  <input 
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'جهة التمويل المفضلة:' : 'Preferred Partner:'}</label>
                  <select
                    value={preferredProvider}
                    onChange={(e) => setPreferredProvider(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none font-bold text-gray-700"
                  >
                    {settings.activeInstallmentProviders.map((p, i) => (
                      <option key={i} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'المبلغ المطلوب تقسيطه:' : 'Financed Amount:'}</label>
                  <input 
                    type="number"
                    required
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none font-bold text-[#8c6e38]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.installments.tenureLabel}</label>
                  <select
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  >
                    <option value={6}>6 أشهر</option>
                    <option value={12}>12 شهراً</option>
                    <option value={18}>18 شهراً</option>
                    <option value={24}>24 شهراً</option>
                    <option value={36}>36 شهراً</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'صافي الدخل الشهري (ج.م):' : 'Monthly Income:'}</label>
                  <input 
                    type="number"
                    required
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'جهة العمل:' : 'Employer:'}</label>
                  <input 
                    type="text"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'إرسال طلب التمويل للمراجعة' : 'Submit Application'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

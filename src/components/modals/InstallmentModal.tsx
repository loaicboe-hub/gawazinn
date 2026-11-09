import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditCard, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { EGYPT_GOVERNORATES_LIST } from '../../../shared/catalogMeta';
import { ModalFrame } from '../common/ModalFrame';

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
    setActiveSection,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [nationalId, setNationalId] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(25000);
  const [employer, setEmployer] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [requestedAmount, setRequestedAmount] = useState(installmentPrefillAmount || 100000);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [preferredProvider, setPreferredProvider] = useState(
    settings.activeInstallmentProviders[0] || 'valU',
  );
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (installmentModalOpen) {
      setCustomerName(currentUser?.name || '');
      setPhone(currentUser?.phone || '');
      setRequestedAmount(installmentPrefillAmount || 100000);
      setPreferredProvider(settings.activeInstallmentProviders[0] || 'valU');
      setErrorMsg(null);
    }
  }, [installmentModalOpen, installmentPrefillAmount, currentUser, settings]);

  const handleClose = () => {
    setSubmittedId(null);
    setErrorMsg(null);
    setInstallmentModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!/^[0-9]{14}$/.test(nationalId.trim())) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى إدخال الرقم القومي المكون من 14 رقماً بشكل صحيح.'
          : 'Egyptian National ID must be exactly 14 numeric digits.',
      );
      return;
    }
    setSubmitting(true);
    try {
      const id = await addFinancingApplication({
        userId: currentUser?.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        monthlyIncome: Number(monthlyIncome),
        employer: employer.trim() || (language === 'ar' ? 'قطاع خاص' : 'Private Sector'),
        governorate,
        requestedAmount: Number(requestedAmount),
        tenureMonths: Number(tenureMonths),
        preferredProvider,
        associatedSection: 'general',
      });
      setSubmittedId(id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit financing request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame isOpen={installmentModalOpen} onClose={handleClose} titleId="installment-modal-title">
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
              ? 'الطلب قيد المراجعة مع إخفاء الرقم القومي آلياً لحماية خصوصيتك.'
              : 'Your request is under credit assessment with masked National ID protection.'}
          </p>
          <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
            <span className="text-xs text-gray-500 block">
              {language === 'ar' ? 'كود الطلب:' : 'Application ID:'}
            </span>
            <strong className="text-lg font-mono font-black text-[#D91B3E]">#{submittedId}</strong>
          </div>
          <div className="flex justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                handleClose();
                setActiveSection('customerPortal');
              }}
              className="bg-red-gradient text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition hover:opacity-95 cursor-pointer"
            >
              {language === 'ar' ? 'متابعة الطلب في حسابي' : 'Track in My Requests'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
              <CreditCard className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'تمويل استهلاكي ميسر' : 'Consumer Financing'}</span>
            </div>
            <h3 id="installment-modal-title" className="text-xl sm:text-2xl font-black text-gray-900">
              {t.installments.applyForInstallment}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'ar'
                ? 'تُشفر بيانات الرقم القومي ولا تظهر كاملة لأي مستخدم غير مخول.'
                : 'National ID is hashed and masked automatically upon submission.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#B31331] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.nationalId}:</label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  placeholder="298XXXXXXXXXXX (14 digits)"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'جهة التمويل المفضلة:' : 'Preferred Partner:'}
                </label>
                <select
                  value={preferredProvider}
                  onChange={(e) => setPreferredProvider(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none font-bold text-gray-700"
                >
                  {settings.activeInstallmentProviders.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'المبلغ المطلوب تقسيطه:' : 'Financed Amount:'}
                </label>
                <input
                  type="number"
                  min={5000}
                  required
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none font-bold text-[#D91B3E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.installments.tenureLabel}</label>
                <select
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                >
                  {[6, 12, 18, 24, 36].map((m) => (
                    <option key={m} value={m}>
                      {m} {language === 'ar' ? 'شهر' : 'Months'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'صافي الدخل:' : 'Monthly Income:'}
                </label>
                <input
                  type="number"
                  min={1000}
                  required
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'جهة العمل:' : 'Employer:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'شركة / عمل حر' : 'Company / Role'}
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.governorate}:</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                >
                  {EGYPT_GOVERNORATES_LIST.map((g) => (
                    <option key={g.slug} value={language === 'ar' ? g.nameAr : g.nameEn}>
                      {language === 'ar' ? g.nameAr : g.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>
                {submitting
                  ? language === 'ar'
                    ? 'جاري التقديم...'
                    : 'Submitting...'
                  : language === 'ar'
                    ? 'إرسال طلب التمويل للمراجعة'
                    : 'Submit Application'}
              </span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </ModalFrame>
  );
};

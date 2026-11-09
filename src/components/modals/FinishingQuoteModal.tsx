import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import type { FinishingTier } from '../../types';
import { estimateFinishingRange, EGYPT_GOVERNORATES_LIST } from '../../../shared/catalogMeta';
import { ModalFrame } from '../common/ModalFrame';

export const FinishingQuoteModal: React.FC = () => {
  const {
    language,
    t,
    dir,
    finishingModalOpen,
    setFinishingModalOpen,
    finishingPrefill,
    finishingPackages,
    addFinishingInquiry,
    currentUser,
    setActiveSection,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [areaSqm, setAreaSqm] = useState(finishingPrefill.areaSqm);
  const [roomsCount, setRoomsCount] = useState(finishingPrefill.roomsCount);
  const [bathroomsCount, setBathroomsCount] = useState(finishingPrefill.bathroomsCount);
  const [finishingTier, setFinishingTier] = useState<FinishingTier>(finishingPrefill.finishingTier);
  const [notes, setNotes] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (finishingModalOpen) {
      setCustomerName(currentUser?.name || '');
      setPhone(currentUser?.phone || '');
      setAreaSqm(finishingPrefill.areaSqm);
      setRoomsCount(finishingPrefill.roomsCount);
      setBathroomsCount(finishingPrefill.bathroomsCount);
      setFinishingTier(finishingPrefill.finishingTier);
      setErrorMsg(null);
    }
  }, [finishingModalOpen, currentUser, finishingPrefill]);

  const activePkg = finishingPackages.find((p) => p.tier === finishingTier);
  const estimate = estimateFinishingRange(areaSqm, finishingTier);
  const estimatedMid = activePkg
    ? Math.round(areaSqm * activePkg.pricePerMeter)
    : Math.round((estimate.min + estimate.max) / 2);

  const handleClose = () => {
    setSubmittedId(null);
    setErrorMsg(null);
    setFinishingModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const id = await addFinishingInquiry({
        userId: currentUser?.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        governorate,
        areaSqm: Number(areaSqm),
        roomsCount: Number(roomsCount),
        bathroomsCount: Number(bathroomsCount),
        finishingTier,
        budgetEGP: estimatedMid,
        notes,
        estimatedCostMin: estimate.min,
        estimatedCostMax: estimate.max,
      });
      setSubmittedId(id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame isOpen={finishingModalOpen} onClose={handleClose} titleId="finishing-quote-title">
      {submittedId ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-gray-900">
            {language === 'ar' ? 'تم استلام طلب المقايسة بنجاح!' : 'Quotation Request Received!'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
            {language === 'ar'
              ? 'سيتواصل معك مهندس المكتب الفني لتحديد موعد المعاينة المجانية ورفع المقاسات بدقة.'
              : 'Our technical engineering office will contact you within 24 hours for a complimentary site visit.'}
          </p>
          <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
            <span className="text-xs text-gray-500 block">
              {language === 'ar' ? 'الرقم المرجعي للطلب:' : 'Reference Code:'}
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
              {language === 'ar' ? 'متابعة الطلب في حسابي' : 'Track in My Portal'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'معاينة ومقايسة هندسية' : 'Engineering Inspection'}</span>
            </div>
            <h3 id="finishing-quote-title" className="text-xl sm:text-2xl font-black text-gray-900">
              {language === 'ar' ? 'طلب مقايسة ومعاينة شقة مجانية' : 'Request Free Finishing Quotation'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'ar'
                ? 'التقدير الاسترشادي الحالي: '
                : 'Current guideline estimate: '}
              <strong className="text-[#D91B3E]">
                {estimatedMid.toLocaleString()} {t.groom.egp}
              </strong>
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
                  placeholder={language === 'ar' ? 'الاسم الثلاثي' : 'Full name'}
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
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'المساحة (م²):' : 'Area (sqm):'}
                </label>
                <input
                  type="number"
                  min={30}
                  max={1000}
                  required
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'الغرف:' : 'Rooms:'}
                </label>
                <select
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'الحمامات:' : 'Baths:'}
                </label>
                <select
                  value={bathroomsCount}
                  onChange={(e) => setBathroomsCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'مستوى التشطيب:' : 'Finishing Tier:'}
                </label>
                <select
                  value={finishingTier}
                  onChange={(e) => setFinishingTier(e.target.value as FinishingTier)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                >
                  <option value="economic">
                    {language === 'ar' ? 'باقة التوفير (3,400/م²)' : 'Economy Super-Lux (3,400/m²)'}
                  </option>
                  <option value="medium">
                    {language === 'ar' ? 'الباقة المتوسطة (4,300/م²)' : 'Balanced Medium (4,300/m²)'}
                  </option>
                  <option value="luxury">
                    {language === 'ar' ? 'الباقة المتميزة (5,200/م²)' : 'Premium Ultra-Lux (5,200/m²)'}
                  </option>
                  <option value="ultra_luxury">
                    {language === 'ar' ? 'الرفاهية الملكية (7,800/م²)' : 'Royal VIP Smart (7,800/m²)'}
                  </option>
                  <option value="custom">
                    {language === 'ar' ? 'مخصص حسب الميزانية' : 'Custom Scope'}
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.governorate}:</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                >
                  {EGYPT_GOVERNORATES_LIST.map((gov) => (
                    <option key={gov.slug} value={language === 'ar' ? gov.nameAr : gov.nameEn}>
                      {language === 'ar' ? gov.nameAr : gov.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">{t.common.notes}:</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'موقع الوحدة، تعديلات معمارية مطلوبة...'
                    : 'Apartment address details, layout adjustments...'
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>
                {submitting
                  ? language === 'ar'
                    ? 'جاري الإرسال...'
                    : 'Submitting...'
                  : language === 'ar'
                  ? 'إرسال طلب المقايسة للمهندسين'
                  : 'Submit Quotation Request'}
              </span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </ModalFrame>
  );
};

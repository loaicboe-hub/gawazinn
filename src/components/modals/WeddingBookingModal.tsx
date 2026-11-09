import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, CheckCircle2, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { EGYPT_GOVERNORATES_LIST } from '../../../shared/catalogMeta';
import { ModalFrame } from '../common/ModalFrame';

export const WeddingBookingModal: React.FC = () => {
  const {
    language,
    t,
    dir,
    weddingBookingModalOpen,
    setWeddingBookingModalOpen,
    selectedWeddingService,
    addWeddingBooking,
    currentUser,
    setActiveSection,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [weddingDate, setWeddingDate] = useState('2027-02-14');
  const [guestCount, setGuestCount] = useState(300);
  const [governorate, setGovernorate] = useState('القاهرة');
  const [notes, setNotes] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (weddingBookingModalOpen) {
      setCustomerName(currentUser?.name || '');
      setPhone(currentUser?.phone || '');
      setErrorMsg(null);
    }
  }, [weddingBookingModalOpen, currentUser]);

  const handleClose = () => {
    setSubmittedId(null);
    setErrorMsg(null);
    setWeddingBookingModalOpen(false);
  };

  if (!selectedWeddingService && !weddingBookingModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingService) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const id = await addWeddingBooking({
        userId: currentUser?.id,
        serviceId: selectedWeddingService.id,
        serviceName:
          language === 'ar' ? selectedWeddingService.nameAr : selectedWeddingService.nameEn,
        category: selectedWeddingService.category,
        customerName: customerName.trim(),
        phone: phone.trim(),
        weddingDate,
        guestCount: Number(guestCount),
        governorate,
        notes,
      });
      setSubmittedId(id);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : language === 'ar'
          ? 'تعذر إرسال طلب الحجز، تأكد من الحقول المدخلة.'
          : 'Unable to submit booking request. Check input fields.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame
      isOpen={weddingBookingModalOpen && !!selectedWeddingService}
      onClose={handleClose}
      titleId="wedding-booking-title"
    >
      {submittedId ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black text-gray-900">
            {language === 'ar'
              ? 'تم استلام طلب الاستفسار المبدئي بنجاح!'
              : 'Booking Inquiry Received!'}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
            {language === 'ar'
              ? 'سيتواصل معك منسق فرحي للتأكد من توافر الموعد في المحافظة المحددة وإتمام التنسيق الرسمي.'
              : 'Our wedding concierge will contact you to verify date availability and coordinate your reservation.'}
          </p>

          <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
            <span className="text-xs text-gray-500 block">
              {language === 'ar' ? 'كود الاستفسار:' : 'Inquiry Code:'}
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
        selectedWeddingService && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
                <Heart className="w-3.5 h-3.5 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'استفسار حجز موعد' : 'Booking Request'}</span>
              </div>
              <h3 id="wedding-booking-title" className="text-xl font-black text-gray-900 line-clamp-2">
                {language === 'ar' ? selectedWeddingService.nameAr : selectedWeddingService.nameEn}
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{t.wedding.importantNotice}</p>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'ar' ? 'تاريخ الفرح المفضل:' : 'Preferred Date:'}
                  </label>
                  <input
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none font-semibold text-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    {language === 'ar' ? 'عدد الضيوف:' : 'Guest Count:'}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.notes}:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'أوقات بديلة مفضلة، تفاصيل البوفيه أو الديكور...'
                      : 'Alternative dates, catering or decor preferences...'
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
                    ? 'إرسال طلب فحص التوافر وحجز الموعد'
                    : 'Submit Date Inquiry'}
                </span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )
      )}
    </ModalFrame>
  );
};

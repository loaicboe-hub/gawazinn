import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, AlertCircle, CheckCircle2, Heart, ArrowLeft, ArrowRight } from 'lucide-react';

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
    setActiveSection
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [weddingDate, setWeddingDate] = useState('2027-02-14');
  const [guestCount, setGuestCount] = useState(300);
  const [governorate, setGovernorate] = useState('القاهرة');
  const [notes, setNotes] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!weddingBookingModalOpen || !selectedWeddingService) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addWeddingBooking({
      userId: currentUser?.id,
      serviceId: selectedWeddingService.id,
      serviceName: language === 'ar' ? selectedWeddingService.nameAr : selectedWeddingService.nameEn,
      category: selectedWeddingService.category,
      customerName: customerName || 'عميل فرحي',
      phone: phone || '010XXXXXXXX',
      weddingDate,
      guestCount: Number(guestCount),
      governorate,
      notes
    });
    setSubmittedId(id);
  };

  const handleClose = () => {
    setSubmittedId(null);
    setWeddingBookingModalOpen(false);
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
              {language === 'ar' ? 'تم استلام طلب الاستفسار المبدئي بنجاح!' : 'Booking Inquiry Received!'}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
              {language === 'ar' 
                ? 'سيتواصل معك منسق فرحي هاتفياً للتأكد من توافر الموعد وإتمام تأكيد الحجز رسمياً.' 
                : 'Our wedding concierge will contact you to verify date availability and confirm reservation.'}
            </p>

            <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
              <span className="text-xs text-gray-400 block">{language === 'ar' ? 'كود الاستفسار:' : 'Inquiry Code:'}</span>
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
                <Heart className="w-3.5 h-3.5 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'استفسار حجز موعد' : 'Booking Request'}</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 line-clamp-1">
                {language === 'ar' ? selectedWeddingService.nameAr : selectedWeddingService.nameEn}
              </h3>
            </div>

            {/* Mandatory Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {t.wedding.importantNotice}
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
                    placeholder="الاسم بالكامل"
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
                    placeholder="010XXXXXXXX"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'تاريخ الفرح المفضل:' : 'Preferred Date:'}</label>
                  <input 
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none font-semibold text-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'عدد الضيوف المتوقع:' : 'Guest Count:'}</label>
                  <input 
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.notes}:</label>
                <textarea 
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'أوقات بديلة مفضلة، تفاصيل البوفيه أو الديكور...' : 'Alternative dates, buffet preferences...'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'إرسال طلب فحص التوافر وحجز الموعد' : 'Submit Date Inquiry'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

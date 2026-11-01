import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, Calculator, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { FinishingTier } from '../../types';

export const FinishingQuoteModal: React.FC = () => {
  const { 
    language, 
    t, 
    dir, 
    finishingModalOpen, 
    setFinishingModalOpen, 
    addFinishingInquiry, 
    currentUser,
    setActiveSection
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [areaSqm, setAreaSqm] = useState(130);
  const [roomsCount, setRoomsCount] = useState(3);
  const [bathroomsCount, setBathroomsCount] = useState(2);
  const [finishingTier, setFinishingTier] = useState<FinishingTier>('luxury');
  const [budgetEGP, setBudgetEGP] = useState(650000);
  const [notes, setNotes] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!finishingModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addFinishingInquiry({
      userId: currentUser?.id,
      customerName: customerName || 'عميل جواز إن',
      phone: phone || '010XXXXXXXX',
      governorate,
      areaSqm: Number(areaSqm),
      roomsCount: Number(roomsCount),
      bathroomsCount: Number(bathroomsCount),
      finishingTier,
      budgetEGP: Number(budgetEGP),
      notes,
      estimatedCostMin: areaSqm * 4500,
      estimatedCostMax: areaSqm * 5500
    });
    setSubmittedId(id);
  };

  const handleClose = () => {
    setSubmittedId(null);
    setFinishingModalOpen(false);
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
              {language === 'ar' ? 'تم استلام طلب المقايسة بنجاح!' : 'Quotation Request Received!'}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
              {language === 'ar' 
                ? 'سيتواصل معك مهندس المكتب الفني لتحديد موعد المعاينة المجانية ورفع المقاسات بدقة.' 
                : 'Our technical engineering office will contact you within 24 hours for a complimentary site visit.'}
            </p>

            <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
              <span className="text-xs text-gray-400 block">{language === 'ar' ? 'الرقم المرجعي للطلب:' : 'Reference Code:'}</span>
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
                {language === 'ar' ? 'متابعة الطلب في حسابي' : 'Track in My Portal'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'معاينة ومقايسة هندسية' : 'Engineering Inspection'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                {language === 'ar' ? 'طلب مقايسة ومعاينة شقة مجانية' : 'Request Free Finishing Quotation'}
              </h3>
              <p className="text-xs text-gray-500">
                {language === 'ar' ? 'املأ تفاصيل وحدتك لنبدأ الفحص الهندسي فوراً' : 'Fill in your apartment details for immediate engineering review'}
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
                    placeholder="الاسم الثلاثي"
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

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'المساحة (م²):' : 'Area (sqm):'}</label>
                  <input 
                    type="number"
                    required
                    value={areaSqm}
                    onChange={(e) => setAreaSqm(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'الغرف:' : 'Rooms:'}</label>
                  <select
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5+</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'الحمامات:' : 'Baths:'}</label>
                  <select
                    value={bathroomsCount}
                    onChange={(e) => setBathroomsCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'مستوى التشطيب:' : 'Finishing Tier:'}</label>
                  <select
                    value={finishingTier}
                    onChange={(e) => setFinishingTier(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  >
                    <option value="economic">باقة التوفير (سوبر لوكس)</option>
                    <option value="luxury">الباقة المتميزة (ألترا لوكس)</option>
                    <option value="ultra_luxury">باقة الرفاهية الملكية (VIP)</option>
                    <option value="custom">مخصص حسب ميزانيتي</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.common.governorate}:</label>
                  <input 
                    type="text"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    placeholder="القاهرة الجديدة / الشيخ زايد..."
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
                  placeholder={language === 'ar' ? 'موقع الوحدة، تعديلات معمارية مطلوبة...' : 'Location, architectural requirements...'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'إرسال طلب المقايسة للمهندسين' : 'Submit Quotation Request'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

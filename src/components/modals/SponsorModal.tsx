import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Gift, CheckCircle2, Sparkles, Building, ArrowLeft, ArrowRight } from 'lucide-react';

export const SponsorModal: React.FC = () => {
  const { 
    language, 
    t, 
    dir, 
    sponsorModalOpen, 
    setSponsorModalOpen, 
    addSponsorshipInquiry 
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [sponsorName, setSponsorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contributionType, setContributionType] = useState<'financial' | 'in_kind_goods' | 'finishing_materials' | 'full_wedding_sponsorship'>('in_kind_goods');
  const [pledgeAmount, setPledgeAmount] = useState(50000);
  const [message, setMessage] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!sponsorModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addSponsorshipInquiry({
      sponsorName: sponsorName || 'فاعل خير / شركة راعية',
      companyName,
      phone: phone || '010XXXXXXXX',
      email: email || 'sponsor@example.com',
      contributionType,
      pledgeAmount: Number(pledgeAmount),
      message
    });
    setSubmittedId(id);
  };

  const handleClose = () => {
    setSubmittedId(null);
    setSponsorModalOpen(false);
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
              {language === 'ar' ? 'جزاكم الله خيراً على مساهمتكم الكريمة' : 'Thank You for Your Generous Pledge'}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
              {language === 'ar' 
                ? 'تم استلام رغبتكم في الرعاية، وسيتواصل معكم مدير قطاع المسؤولية المجتمعية لتنسيق تخصيص الدعم للحالات المستحقة.' 
                : 'Our CSR director will coordinate with you to allocate your support to eligible cases.'}
            </p>

            <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
              <span className="text-xs text-gray-400 block">{language === 'ar' ? 'رقم طلب الرعاية:' : 'Pledge Reference:'}</span>
              <strong className="text-lg font-mono font-black text-[#D91B3E]">#{submittedId}</strong>
            </div>

            <div className="pt-3">
              <button
                onClick={handleClose}
                className="bg-red-gradient text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition hover:opacity-95"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
                <Gift className="w-3.5 h-3.5 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'المسؤولية المجتمعية' : 'CSR & Philanthropy'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                {t.socialSupport.sponsorTitle}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'اسم الراعي / المتبرع:' : 'Sponsor Name:'}</label>
                  <input 
                    type="text"
                    required
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="الاسم الكريم"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'اسم الشركة / المؤسسة (إن وجد):' : 'Company Name (Optional):'}</label>
                  <input 
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="اسم الشركة"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.common.email}:</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'طبيعة المساهمة المرغوبة:' : 'Contribution Type:'}</label>
                <select
                  value={contributionType}
                  onChange={(e) => setContributionType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none font-semibold text-gray-700"
                >
                  <option value="in_kind_goods">أجهزة كهربائية أو أثاث عيني مباشر</option>
                  <option value="finishing_materials">مواد وخامات تشطيب (سيراميك، دهانات، أسلاك)</option>
                  <option value="full_wedding_sponsorship">كفالة تجهيز شقة عروسين كاملة</option>
                  <option value="financial">مساهمة مالية نقدية في صندوق المبادرة</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'رسالة أو تفاصيل إضافية:' : 'Message:'}</label>
                <textarea 
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'ar' ? 'حدد عدد الأجهزة أو طريقة التنسيق المفضلة...' : 'Specify items, quantity or preferred coordination...'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'إرسال بيانات المساهمة الكريمة' : 'Submit Sponsorship Pledge'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

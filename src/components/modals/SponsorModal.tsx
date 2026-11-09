import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Gift, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import type { SponsorshipInquiry } from '../../types';
import { ModalFrame } from '../common/ModalFrame';

export const SponsorModal: React.FC = () => {
  const { language, t, dir, sponsorModalOpen, setSponsorModalOpen, addSponsorshipInquiry } =
    useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [sponsorName, setSponsorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contributionType, setContributionType] =
    useState<SponsorshipInquiry['contributionType']>('in_kind_goods');
  const [pledgeAmount, setPledgeAmount] = useState(50000);
  const [message, setMessage] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setSubmittedId(null);
    setErrorMsg(null);
    setSponsorModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const id = await addSponsorshipInquiry({
        sponsorName: sponsorName.trim(),
        companyName: companyName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        contributionType,
        pledgeAmount: Number(pledgeAmount),
        message: message.trim(),
      });
      setSubmittedId(id);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : language === 'ar'
          ? 'يرجى التحقق من البريد الإلكتروني ورقم الهاتف المدخل.'
          : 'Please enter a valid phone number and email address.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame isOpen={sponsorModalOpen} onClose={handleClose} titleId="sponsor-modal-title">
      {submittedId ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black text-gray-900">
            {language === 'ar'
              ? 'جزاكم الله خيراً على مساهمتكم الكريمة'
              : 'Thank You for Your Generous Pledge'}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
            {language === 'ar'
              ? 'تم استلام رغبتكم في الرعاية، وسيتواصل معكم مدير قطاع المسؤولية المجتمعية لتنسيق تخصيص الدعم للحالات المستحقة.'
              : 'Our CSR director will coordinate with you to allocate your support to verified eligible cases.'}
          </p>

          <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
            <span className="text-xs text-gray-500 block">
              {language === 'ar' ? 'رقم طلب الرعاية:' : 'Pledge Reference:'}
            </span>
            <strong className="text-lg font-mono font-black text-[#D91B3E]">#{submittedId}</strong>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="bg-red-gradient text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition hover:opacity-95 cursor-pointer"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
              <Gift className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'المسؤولية المجتمعية' : 'CSR & Philanthropy'}</span>
            </div>
            <h3 id="sponsor-modal-title" className="text-xl sm:text-2xl font-black text-gray-900">
              {t.socialSupport.sponsorTitle}
            </h3>
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
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'اسم الراعي / المتبرع:' : 'Sponsor Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم الكريم' : 'Full name'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'اسم الشركة / المؤسسة (اختياري):' : 'Company (Optional):'}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={language === 'ar' ? 'اسم الشركة' : 'Organization'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
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
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.email}:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'طبيعة المساهمة:' : 'Contribution Type:'}
                </label>
                <select
                  value={contributionType}
                  onChange={(e) =>
                    setContributionType(e.target.value as SponsorshipInquiry['contributionType'])
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none font-semibold text-gray-700"
                >
                  <option value="in_kind_goods">
                    {language === 'ar' ? 'أجهزة كهربائية أو أثاث عيني' : 'In-Kind Appliances & Goods'}
                  </option>
                  <option value="finishing_materials">
                    {language === 'ar' ? 'خامات تشطيب (سيراميك/دهانات)' : 'Finishing Materials'}
                  </option>
                  <option value="full_wedding_sponsorship">
                    {language === 'ar' ? 'كفالة تجهيز عروسين كاملة' : 'Full Couple Sponsorship'}
                  </option>
                  <option value="financial">
                    {language === 'ar' ? 'مساهمة مالية في الصندوق' : 'Financial Contribution'}
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'القيمة التقديرية (ج.م):' : 'Estimated Value (EGP):'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'رسالة أو تفاصيل إضافية:' : 'Message:'}
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'حدد عدد الأجهزة أو طريقة التنسيق المفضلة...'
                    : 'Specify items, quantity or preferred coordination...'
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
                    ? 'جاري التسجيل...'
                    : 'Submitting...'
                  : language === 'ar'
                  ? 'إرسال بيانات المساهمة الكريمة'
                  : 'Submit Sponsorship Pledge'}
              </span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </ModalFrame>
  );
};

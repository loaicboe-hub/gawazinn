import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  Lock,
  CheckCircle2,
  FileText,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type { SupportCase } from '../../types';
import { EGYPT_GOVERNORATES_LIST } from '../../../shared/catalogMeta';
import { ModalFrame } from '../common/ModalFrame';

export const SupportModal: React.FC = () => {
  const {
    language,
    t,
    dir,
    supportModalOpen,
    setSupportModalOpen,
    addSupportCase,
    currentUser,
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState('الفيوم');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<SupportCase['category']>('appliances_furniture');
  const [caseDescription, setCaseDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<SupportCase['urgencyLevel']>('urgent');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (supportModalOpen) {
      setApplicantName(currentUser?.name || '');
      setPhone(currentUser?.phone || '');
      setErrorMsg(null);
    }
  }, [supportModalOpen, currentUser]);

  const handleClose = () => {
    setSubmittedId(null);
    setErrorMsg(null);
    setSupportModalOpen(false);
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
      const id = await addSupportCase({
        applicantName: applicantName.trim(),
        nationalId: nationalId.trim(),
        phone: phone.trim(),
        governorate,
        address: address.trim(),
        category,
        caseDescription: caseDescription.trim(),
        urgencyLevel,
        documentsSubmitted: [
          'بطاقة الرقم القومي سارية',
          'إثبات السكن / عقد إيجار أو تمليك',
          'بحث اجتماعي ميداني مستقل',
        ],
      });
      setSubmittedId(id);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : language === 'ar'
          ? 'يرجى التأكد من استيفاء جميع البيانات وشرح الحالة (15 حرفاً على الأقل).'
          : 'Please check required inputs and social case description length.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame isOpen={supportModalOpen} onClose={handleClose} titleId="support-modal-title">
      {submittedId ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black text-gray-900">
            {language === 'ar'
              ? 'تم تسجيل طلب الدعم بسرية تامة'
              : 'Application Registered Confidentially'}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
            {language === 'ar'
              ? 'ملفك محفوظ برقم كودي مشفر ولا يظهر لأي طرف عام. سيتواصل معك فريق البحث الاجتماعي المعتمد بكل احترام وكرامة.'
              : 'Your record is confidentially stored without public disclosure. Our accredited social research officer will contact you privately.'}
          </p>

          <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
            <span className="text-xs text-gray-500 block">
              {language === 'ar' ? 'الكود السري للحالة:' : 'Confidential Case ID:'}
            </span>
            <strong className="text-lg font-mono font-black text-[#D91B3E]">#{submittedId}</strong>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="bg-red-gradient text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition hover:opacity-95 cursor-pointer"
            >
              {language === 'ar' ? 'حفظت الكود المرجعي — إغلاق' : 'Reference Saved — Close'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>
                {language === 'ar' ? 'مبادرة الستر وتيسير الزواج' : 'Marriage Support Initiative'}
              </span>
            </div>
            <h3 id="support-modal-title" className="text-xl sm:text-2xl font-black text-gray-900">
              {t.socialSupport.applyTitle}
            </h3>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#D91B3E] shrink-0" />
            <span>{t.socialSupport.privacyNotice}</span>
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
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <option value="الفيوم">{language === 'ar' ? 'الفيوم' : 'Fayoum'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.address}:</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  placeholder={language === 'ar' ? 'المركز / الشارع' : 'District & Street'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {language === 'ar' ? 'درجة الاستعجال:' : 'Urgency:'}
                </label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value as SupportCase['urgencyLevel'])}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
                >
                  <option value="normal">{language === 'ar' ? 'عادي' : 'Normal'}</option>
                  <option value="urgent">{language === 'ar' ? 'عاجل (زفاف قريب)' : 'Urgent'}</option>
                  <option value="critical">
                    {language === 'ar' ? 'حالة حرجة وأولوية قصوى' : 'Critical Priority'}
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'نوع الدعم المطلوب:' : 'Assistance Category:'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportCase['category'])}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none font-semibold text-gray-700"
              >
                <option value="appliances_furniture">
                  {language === 'ar'
                    ? 'أجهزة كهربائية وأثاث أساسي (ثلاجة، غسالة، بوتاجاز، سرير)'
                    : 'Essential Appliances & Core Furniture'}
                </option>
                <option value="apartment_finishing">
                  {language === 'ar'
                    ? 'تشطيب أساسي للشقة (سباكة وكهرباء ودهانات)'
                    : 'Basic Apartment Finishing (MEP & Paint)'}
                </option>
                <option value="groom_bride_essentials">
                  {language === 'ar'
                    ? 'مستلزمات العروسين وأطقم الطهي والمفروشات'
                    : 'Bride & Groom Basic Trousseau'}
                </option>
                <option value="wedding_hall">
                  {language === 'ar'
                    ? 'مساهمة في نفقات ليلة الفرح وفستان الزفاف'
                    : 'Modest Wedding Expense Contribution'}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar'
                  ? 'شرح الحالة والظروف الاجتماعية:'
                  : 'Social Case Description:'}
              </label>
              <textarea
                rows={3}
                required
                minLength={15}
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'يرجى توضيح وضع الأسرة، الدخل، وحالة الوالدين وظروف السكن (15 حرفاً على الأقل)...'
                    : 'Describe family situation, housing, and essential items needed...'
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D91B3E] outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#D91B3E]/15 text-[11px] text-[#B31331] flex items-center gap-2">
              <FileText className="w-4 h-4 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'يتم التحقق من المستندات سرياً عبر الباحث الاجتماعي عند الزيارة الميدانية.'
                  : 'Documents are verified confidentially during independent field research.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>
                {submitting
                  ? language === 'ar'
                    ? 'جاري التسجيل السري...'
                    : 'Submitting Confidentially...'
                  : language === 'ar'
                  ? 'إرسال طلب الدعم للمراجعة السرية'
                  : 'Submit Confidential Application'}
              </span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </ModalFrame>
  );
};

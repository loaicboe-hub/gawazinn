import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, HeartHandshake, Lock, CheckCircle2, FileText, ArrowLeft, ArrowRight } from 'lucide-react';

export const SupportModal: React.FC = () => {
  const { 
    language, 
    t, 
    dir, 
    supportModalOpen, 
    setSupportModalOpen, 
    addSupportCase, 
    currentUser,
    setActiveSection
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [nationalId, setNationalId] = useState('29801010105678');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState('الفيوم');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<'apartment_finishing' | 'appliances_furniture' | 'groom_bride_essentials' | 'wedding_hall'>('appliances_furniture');
  const [caseDescription, setCaseDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'urgent' | 'critical'>('urgent');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!supportModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addSupportCase({
      applicantName: applicantName || 'صاحب الطلب',
      nationalId,
      phone: phone || '01XXXXXXXXX',
      governorate,
      address,
      category,
      caseDescription,
      urgencyLevel,
      documentsSubmitted: [
        'بطاقة الرقم القومي سارية',
        'شهادة وفاة الوالد/الوالدة (للأيتام)',
        'عقد إيجار / سكن',
        'بحث اجتماعي من وحدة التضامن'
      ]
    });
    setSubmittedId(id);
  };

  const handleClose = () => {
    setSubmittedId(null);
    setSupportModalOpen(false);
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
              {language === 'ar' ? 'تم تسجيل طلب الدعم بسرية تامة' : 'Application Registered Confidentially'}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
              {language === 'ar' 
                ? 'ملفك قيد المراجعة السرية المستقلة وسيتواصل معك باحث المبادرة الميداني بكل احترام وكرامة.' 
                : 'Your file is under confidential social review. A dedicated field researcher will contact you.'}
            </p>

            <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-rose-100 max-w-xs mx-auto">
              <span className="text-xs text-gray-400 block">{language === 'ar' ? 'الكود السري للحالة:' : 'Confidential Case ID:'}</span>
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
                {language === 'ar' ? 'متابعة الحالة في حسابي' : 'View in My Portal'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D91B3E]/10 text-[#D91B3E] text-xs font-bold">
                <HeartHandshake className="w-3.5 h-3.5 text-[#D91B3E]" />
                <span>{language === 'ar' ? 'مبادرة الستر وتيسير الزواج' : 'Marriage Support Initiative'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                {t.socialSupport.applyTitle}
              </h3>
            </div>

            {/* Privacy Box */}
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#C6A66B] shrink-0" />
              <span>{t.socialSupport.privacyNotice}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.common.name}:</label>
                  <input 
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.common.governorate}:</label>
                  <input 
                    type="text"
                    required
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'نوع الدعم المطلوب:' : 'Assistance Category:'}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none font-semibold text-gray-700"
                >
                  <option value="appliances_furniture">أجهزة كهربائية وأثاث أساسي (ثلاجة، غسالة، بوتاجاز، سرير)</option>
                  <option value="apartment_finishing">تشطيب أساسي للشقة (سباكة وكهرباء ودهانات)</option>
                  <option value="groom_bride_essentials">مستلزمات العروسين وأطقم الطهي والمفروشات</option>
                  <option value="wedding_hall">مساهمة في نفقات ليلة الفرح وفستان الزفاف</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{language === 'ar' ? 'شرح الحالة والظروف الاجتماعية:' : 'Social Case Description:'}</label>
                <textarea 
                  rows={3}
                  required
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  placeholder={language === 'ar' ? 'يرجى توضيح وضع الأسرة، الدخل، وحالة الوالدين وظروف السكن...' : 'Briefly describe family circumstances, employment, and home situation...'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#C6A66B] outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#C6A66B]/30 text-[11px] text-[#8c6e38] flex items-center gap-2">
                <FileText className="w-4 h-4 shrink-0" />
                <span>{language === 'ar' ? 'المستندات الورقية سيتم تسليمها للباحث الاجتماعي عند الزيارة الميدانية.' : 'Official documents will be reviewed during field researcher visit.'}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'إرسال طلب الدعم للمراجعة السرية' : 'Submit Confidential Application'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

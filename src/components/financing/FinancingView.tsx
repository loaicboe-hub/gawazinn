import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  Calculator, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  FileText,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';

export const FinancingView: React.FC = () => {
  const { 
    language, 
    t, 
    dir, 
    settings, 
    setInstallmentModalOpen, 
    setInstallmentPrefillAmount 
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [amount, setAmount] = useState(150000);
  const [tenure, setTenure] = useState(24);
  const [downPayment, setDownPayment] = useState(20000);

  const financedAmount = Math.max(0, amount - downPayment);
  const annualRate = settings.interestRateAnnual / 100;
  const totalInterest = financedAmount * (annualRate * (tenure / 12));
  const totalPayable = financedAmount + totalInterest;
  const monthlyInstallment = Math.round(totalPayable / tenure);

  const handleApply = () => {
    setInstallmentPrefillAmount(amount);
    setInstallmentModalOpen(true);
  };

  return (
    <div className="space-y-16 pb-24">
      
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-14 lg:py-20 border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <CreditCard className="w-4 h-4 text-white" />
              <span>{t.installments.title}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {language === 'ar' ? 'حلول وتسهيلات التقسيط مع شركائنا المعتمدين' : 'Financing Solutions & Flexible Installments'}
            </h1>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed">
              {t.installments.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Calculator Widget */}
        <div className="rounded-3xl p-1 bg-gradient-to-tr from-rose-200 via-white to-red-100 shadow-2xl">
          <div className="bg-white rounded-[22px] p-8 sm:p-12 text-gray-900">
            
            <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                {t.installments.calculatorHeading}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {language === 'ar' 
                  ? 'اختر المبلغ المطلوب وفترة السداد للحصول على تقدير فوري للقسط الشهري' 
                  : 'Select your desired financing amount and tenure for an instant monthly estimation'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Amount Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <label className="text-gray-900">{t.installments.amountLabel}</label>
                    <span className="text-xl font-black text-[#D91B3E] bg-rose-50 px-4 py-1 rounded-xl border border-rose-200">
                      {amount.toLocaleString()} {t.groom.egp}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min={10000}
                    max={500000}
                    step={5000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-[#D91B3E] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10,000 ج.م</span>
                    <span>500,000 ج.م</span>
                  </div>
                </div>

                {/* Down Payment */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <label className="text-gray-900">{t.installments.downPaymentLabel}</label>
                    <span className="text-base font-bold text-gray-700">
                      {downPayment.toLocaleString()} {t.groom.egp}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min={0}
                    max={amount * 0.5}
                    step={5000}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full accent-[#D91B3E] cursor-pointer"
                  />
                </div>

                {/* Tenure Buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t.installments.tenureLabel}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[6, 12, 18, 24, 36].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTenure(m)}
                        className={`py-3 text-xs font-bold rounded-xl border-2 transition ${
                          tenure === m
                            ? 'bg-[#D91B3E] text-white border-[#D91B3E] shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-red-200'
                        }`}
                      >
                        {m} {language === 'ar' ? 'شهر' : 'Mo'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Summary Box (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#1C1819] to-[#2B181A] text-white p-8 rounded-3xl space-y-6 shadow-xl border border-rose-900/30">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-xs text-rose-200 font-bold block mb-1">
                    {t.installments.monthlyEstimate}
                  </span>
                  <div className="text-4xl font-black text-[#FF4D6D]">
                    {monthlyInstallment.toLocaleString()} <span className="text-sm text-gray-300">{t.groom.perMonth}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>المبلغ الممول:</span>
                    <strong className="text-white">{financedAmount.toLocaleString()} ج.م</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>المدة:</span>
                    <strong className="text-white">{tenure} شهراً</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>الفائدة التقديرية السنوية:</span>
                    <strong className="text-emerald-400">{settings.interestRateAnnual}%</strong>
                  </div>
                </div>

                <button
                  onClick={handleApply}
                  className="w-full bg-red-gradient text-white font-bold text-sm py-4 rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>{t.installments.applyForInstallment}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-gray-400 text-center">
                  {language === 'ar' ? 'إجراءات سريعة ومراجعة إلكترونية بالرقم القومي خلال 24 ساعة' : 'Expedited review with National ID within 24h'}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* Partners Showcase */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-gray-900">
              {t.installments.partnerTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'ar' ? 'نتعامل مع كبرى شركات التمويل الاستهلاكي والبنوك المصرية' : 'Partnering with certified consumer finance companies & Egyptian banks'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {settings.activeInstallmentProviders.map((prov, i) => (
              <div 
                key={i}
                className="bg-white p-5 rounded-2xl border border-gray-200 text-center space-y-2 hover:border-red-300 transition shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D91B3E] mx-auto flex items-center justify-center font-bold">
                  <BadgeCheck className="w-6 h-6 text-[#D91B3E]" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{prov}</h4>
                <span className="text-[10px] text-gray-500 block">
                  {language === 'ar' ? 'تقسيط معتمد فوري' : 'Instant Pre-approval'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold">{language === 'ar' ? 'إخلاء مسؤولية والتزام تنظيمي:' : 'Regulatory Disclaimer:'}</h5>
            <p className="text-amber-800 leading-relaxed">{t.installments.disclaimer}</p>
          </div>
        </div>

      </div>

    </div>
  );
};

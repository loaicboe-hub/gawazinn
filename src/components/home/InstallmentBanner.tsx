import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditCard, Calculator, ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const InstallmentBanner: React.FC = () => {
  const { language, t, dir, setActiveSection, setInstallmentModalOpen, setInstallmentPrefillAmount, settings } = useApp();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [calcAmount, setCalcAmount] = useState(120000);
  const [tenure, setTenure] = useState(24);
  const [downPayment, setDownPayment] = useState(0);

  // Interest calculation based on platform settings
  const financedAmount = Math.max(0, calcAmount - downPayment);
  const annualRate = settings.interestRateAnnual / 100;
  const totalInterest = financedAmount * (annualRate * (tenure / 12));
  const totalPayable = financedAmount + totalInterest;
  const monthlyInstallment = Math.round(totalPayable / tenure);

  const handleApply = () => {
    setInstallmentPrefillAmount(calcAmount);
    setInstallmentModalOpen(true);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#17243A] to-[#0D1522] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & Partners List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C6A66B]/20 text-[#DFCA9B] text-xs font-bold border border-[#C6A66B]/30">
              <CreditCard className="w-3.5 h-3.5 text-[#C6A66B]" />
              <span>{t.installments.title}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {language === 'ar' 
                ? 'جهّز بيتك وافرح براحتك.. مع أسهل أنظمة تقسيط حتى 36 شهراً' 
                : 'Prepare Your Home & Wedding with Effortless Financing up to 36 Months'}
            </h2>

            <p className="text-base text-gray-300 leading-relaxed">
              {t.installments.subtitle}
            </p>

            {/* Configurable Partner Providers Pill Matrix */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-[#DFCA9B] uppercase tracking-wider">
                {t.installments.partnerTitle}:
              </p>
              <div className="flex flex-wrap gap-2">
                {settings.activeInstallmentProviders.map((provider, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-200 font-semibold hover:border-[#C6A66B]/50 transition"
                  >
                    {provider}
                  </span>
                ))}
              </div>
            </div>

            {/* Disclaimer & Policy Notice */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5 text-[#DFCA9B] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#C6A66B]" />
                <span>{language === 'ar' ? 'توضيح الشفافية والمسؤولية' : 'Transparency Notice'}</span>
              </div>
              <p>{t.installments.disclaimer}</p>
            </div>

            <div>
              <button
                onClick={() => {
                  setActiveSection('installments');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-bold text-[#DFCA9B] hover:text-white transition flex items-center gap-1 underline underline-offset-4"
              >
                <span>{language === 'ar' ? 'عرض كافة تفاصيل وشروط برامج التقسيط' : 'View full installment options & guidelines'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Live Calculator Widget (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl p-1 bg-gradient-to-tr from-[#C6A66B]/50 via-white/20 to-[#C6A66B]/30 shadow-2xl">
              <div className="bg-[#17243A] rounded-[22px] p-6 sm:p-8 space-y-6">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C6A66B]/20 text-[#DFCA9B] flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-[#C6A66B]" />
                    </div>
                    <span className="font-bold text-sm text-white">{t.installments.calculatorHeading}</span>
                  </div>
                  <span className="text-[11px] text-[#DFCA9B] font-semibold bg-[#C6A66B]/15 px-2 py-0.5 rounded">
                    {language === 'ar' ? 'حساب فوري' : 'Instant Estimate'}
                  </span>
                </div>

                {/* Amount Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-gray-300 font-medium">{t.installments.amountLabel}</label>
                    <span className="text-base font-black text-[#DFCA9B]">
                      {calcAmount.toLocaleString()} {t.groom.egp}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min={20000}
                    max={500000}
                    step={5000}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full accent-[#C6A66B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>20,000 {t.groom.egp}</span>
                    <span>500,000 {t.groom.egp}</span>
                  </div>
                </div>

                {/* Tenure Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-medium block">
                    {t.installments.tenureLabel}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[6, 12, 24, 36].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTenure(m)}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          tenure === m
                            ? 'bg-[#C6A66B] text-[#17243A] border-[#C6A66B]'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {m} {language === 'ar' ? 'شهر' : 'Mo'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Installment Result Box */}
                <div className="p-4 rounded-xl bg-[#0D1522] border border-[#C6A66B]/40 text-center space-y-1">
                  <span className="text-xs text-gray-400 block">{t.installments.monthlyEstimate}</span>
                  <div className="text-3xl font-black text-gold-gradient">
                    {monthlyInstallment.toLocaleString()} <span className="text-sm text-gray-300">{t.groom.perMonth}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block">
                    {language === 'ar' ? `على مدار ${tenure} شهراً بالتساوي` : `Spread equally over ${tenure} months`}
                  </span>
                </div>

                {/* Direct Action Button */}
                <button
                  onClick={handleApply}
                  className="w-full bg-gold-gradient hover:opacity-95 text-[#17243A] font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-[#17243A]" />
                  <span>{t.installments.applyForInstallment}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

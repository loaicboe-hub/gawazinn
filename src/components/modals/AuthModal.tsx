import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User as UserIcon, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { language, t, authModalOpen, setAuthModalOpen, login } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('customer', name || 'أحمد خالد الصاوي', phone || '01012345678');
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-[#2A1D20] rounded-3xl p-7 sm:p-9 max-w-md w-full border-2 border-[#D91B3E]/30 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 end-5 p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-gradient text-white font-serif font-black mx-auto flex items-center justify-center text-base shadow-md">
            GI
          </div>
          <h3 className="text-xl font-black text-[#2A1D20] pt-2">
            {mode === 'login' ? (language === 'ar' ? 'تسجيل الدخول لحسابك' : 'Sign In to Your Account') : (language === 'ar' ? 'إنشاء حساب جديد' : 'Create an Account')}
          </h3>
          <p className="text-xs text-[#B31331] font-semibold">
            {language === 'ar' ? 'من أول الشقة.. لحد ليلة العمر' : 'One unified account for all 4 sections'}
          </p>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">{t.common.name}:</label>
              <input 
                type="text"
                required
                placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">{t.common.phone}:</label>
            <input 
              type="tel"
              required
              placeholder="010XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition"
          >
            {mode === 'login' ? t.nav.login : t.nav.register}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-gray-500">
          {mode === 'login' ? (
            <span>
              {language === 'ar' ? 'ليس لديك حساب بعد؟ ' : "Don't have an account? "}
              <button 
                type="button" 
                onClick={() => setMode('register')} 
                className="text-[#D91B3E] font-bold hover:underline"
              >
                {language === 'ar' ? 'سجل حساب جديد مجاناً' : 'Register Now'}
              </button>
            </span>
          ) : (
            <span>
              {language === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                className="text-[#D91B3E] font-bold hover:underline"
              >
                {t.nav.login}
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

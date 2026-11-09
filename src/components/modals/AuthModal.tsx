import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User as UserIcon, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { ModalFrame } from '../common/ModalFrame';

export const AuthModal: React.FC = () => {
  const {
    language,
    t,
    authModalOpen,
    setAuthModalOpen,
    loginWithCredentials,
    registerAccount,
    apiConnected,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('القاهرة');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setErrorMsg(null);
    setAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithCredentials(identifier, password);
      } else {
        await registerAccount({ name, email, phone, password, city });
      }
      setAuthModalOpen(false);
      setPassword('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : language === 'ar'
          ? 'حدث خطأ أثناء التحقق من البيانات.'
          : 'Authentication failed. Check your credentials.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginWithCredentials(demoEmail, demoPassword);
      setAuthModalOpen(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Demo login unavailable');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame isOpen={authModalOpen} onClose={handleClose} titleId="auth-modal-title" maxWidthClass="max-w-md">
      <div className="space-y-5">
        <div className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-gradient text-white mx-auto flex items-center justify-center shadow-md">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <h3 id="auth-modal-title" className="text-xl font-black text-[#2A1D20] pt-2">
            {mode === 'login'
              ? language === 'ar'
                ? 'تسجيل الدخول لحسابك'
                : 'Sign In to Your Account'
              : language === 'ar'
              ? 'إنشاء حساب جديد في جواز إن'
              : 'Create a GAWAZ INN Account'}
          </h3>
          <p className="text-xs text-[#B31331] font-semibold">
            {language === 'ar'
              ? 'حساب آمن ومشفر لمتابعة تجهيزاتك وطلباتك'
              : 'Encrypted account across your entire marriage & home journey'}
          </p>
        </div>

        {!apiConnected && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>
              {language === 'ar'
                ? 'أنت تتصفح في الوضع الثابت بدون خادم API متصل حالياً.'
                : 'Static preview mode detected — live backend server is not attached.'}
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#B31331] text-xs font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.name}:</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t.common.email}:</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
                  />
                </div>
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{t.common.city}:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
                />
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {language === 'ar' ? 'البريد الإلكتروني أو رقم الموبايل:' : 'Email or Mobile Phone:'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'ar' ? 'karim@gawazinn.demo أو 01012345678' : 'email@domain.com or 010XXXXXXXX'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              {language === 'ar' ? 'كلمة المرور:' : 'Password:'}
            </label>
            <input
              type="password"
              required
              minLength={mode === 'register' ? 8 : 4}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
          >
            {submitting
              ? language === 'ar'
                ? 'جاري التحقق...'
                : 'Verifying...'
              : mode === 'login'
              ? t.nav.login
              : t.nav.register}
          </button>
        </form>

        {/* Demo Quick Login Section (Executes real API password check on seeded demo records) */}
        {apiConnected && (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B31331]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {language === 'ar'
                  ? 'حسابات تجريبية موثقة لتجربة المنصة:'
                  : 'Seeded Demo Accounts (Authenticated via Server):'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemoLogin('karim@gawazinn.demo', 'DemoPass@2026')}
                className="px-2.5 py-2 rounded-xl bg-white hover:bg-[#FDE8ED] border border-rose-200 text-[#2A1D20] text-[11px] font-bold transition cursor-pointer"
              >
                {language === 'ar' ? 'دخول عميل (كريم)' : 'Demo Customer'}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemoLogin('admin@gawazinn.demo', 'AdminPass@2026')}
                className="px-2.5 py-2 rounded-xl bg-white hover:bg-[#FDE8ED] border border-rose-200 text-[#D91B3E] text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'دخول الإدارة' : 'Demo Admin'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          {mode === 'login' ? (
            <span>
              {language === 'ar' ? 'ليس لديك حساب بعد؟ ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('register');
                }}
                className="text-[#D91B3E] font-bold hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'سجل حساب جديد مجاناً' : 'Register Now'}
              </button>
            </span>
          ) : (
            <span>
              {language === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('login');
                }}
                className="text-[#D91B3E] font-bold hover:underline cursor-pointer"
              >
                {t.nav.login}
              </button>
            </span>
          )}
        </div>
      </div>
    </ModalFrame>
  );
};

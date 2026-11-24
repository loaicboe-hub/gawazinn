import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Store,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { ModalFrame } from '../common/ModalFrame';

// Multi-color Google "G" official logo
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// Apple logo
const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.13-1.96 1-3.12-.97.04-2.19.65-2.88 1.46-.6.7-.1.14-1.88 1.02-3.03 1.09-.03 2.23.69 2.88 1.69z" />
  </svg>
);

export const AuthModal: React.FC = () => {
  const {
    language,
    dir,
    t,
    authModalOpen,
    setAuthModalOpen,
    loginWithCredentials,
    loginWithGoogle,
    loginWithApple,
    requestPhoneOtp,
    verifyPhoneOtp,
    registerAccount,
    apiConnected,
  } = useApp();

  // Primary mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  // Sub-method: 'password' | 'otp'
  const [method, setMethod] = useState<'password' | 'otp'>('password');
  // Google interactive picker view
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleMode, setCustomGoogleMode] = useState(false);

  // Email/Password state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [city, setCity] = useState('القاهرة');

  // OTP state
  const [otpPhone, setOtpPhone] = useState('010');
  const [otpCode, setOtpCode] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleClose = () => {
    setErrorMsg(null);
    setSuccessNotice(null);
    setShowGooglePicker(false);
    setForgotModal(false);
    setAuthModalOpen(false);
  };

  // Google Login Handler
  const handleGoogleLogin = async (selected: { email: string; name: string; avatarUrl?: string }) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginWithGoogle(selected);
      handleClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : language === 'ar'
          ? 'تعذر تسجيل الدخول عبر Google.'
          : 'Google sign-in failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Apple Login Handler
  const handleAppleLogin = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginWithApple({
        email: 'user.apple@icloud.com',
        name: language === 'ar' ? 'مستخدم حساب Apple' : 'Apple User',
      });
      handleClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Apple sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Phone OTP Request Handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    setSubmitting(true);
    try {
      const res = await requestPhoneOtp(otpPhone);
      setOtpSent(true);
      setOtpCountdown(60);
      setOtpHint(res.debugOtp || '123456');
      setSuccessNotice(
        language === 'ar'
          ? 'تم إرسال رمز التحقق السريع SMS إلى رقم هاتفك.'
          : 'Verification code sent to your phone.',
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : language === 'ar'
          ? 'تعذر إرسال كود التحقق. تأكد من صحة رقم الموبايل المصري.'
          : 'Failed to send OTP. Check your mobile number.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Phone OTP Verify Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await verifyPhoneOtp(otpPhone, otpCode, otpName);
      handleClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : language === 'ar'
          ? 'رمز التحقق غير صحيح أو منتهي الصلاحية.'
          : 'Invalid or expired OTP code.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Traditional Email/Password Submit Handler
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithCredentials(identifier, password);
      } else {
        await registerAccount({ name, email, phone, password, city });
      }
      handleClose();
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

  // Demo Login Handler
  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginWithCredentials(demoEmail, demoPassword);
      handleClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Demo login unavailable');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame isOpen={authModalOpen} onClose={handleClose} titleId="auth-modal-title" maxWidthClass="max-w-lg">
      <div className="space-y-5">
        {/* ================= GOOGLE ACCOUNT PICKER VIEW ================= */}
        {showGooglePicker ? (
          <div className="space-y-4">
            <div className="text-center space-y-2 border-b border-gray-100 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm mx-auto flex items-center justify-center">
                <GoogleIcon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-gray-900">
                {language === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Sign In with Google'}
              </h3>
              <p className="text-xs text-gray-500">
                {language === 'ar'
                  ? 'اختر حساباً للمتابعة إلى منصة جواز إن (Gawaz Inn)'
                  : 'Choose an account to continue to Gawaz Inn'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#B31331] text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* List of Simulated Google Accounts */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  handleGoogleLogin({
                    name: 'م. كريم الشريف',
                    email: 'karim.alsharif@gmail.com',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                  })
                }
                className="w-full p-3 rounded-2xl border border-gray-200 hover:border-[#4285F4] hover:bg-blue-50/40 transition flex items-center justify-between gap-3 text-start cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#4285F4] text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    ك
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#4285F4]">
                      م. كريم الشريف (Google)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-mono">karim.alsharif@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {language === 'ar' ? 'حساب نشط' : 'Active'}
                </span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  handleGoogleLogin({
                    name: 'سارة المنياوي',
                    email: 'sara.meniawy@gmail.com',
                    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
                  })
                }
                className="w-full p-3 rounded-2xl border border-gray-200 hover:border-[#34A853] hover:bg-emerald-50/40 transition flex items-center justify-between gap-3 text-start cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#34A853] text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    س
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#34A853]">
                      سارة المنياوي (Google)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-mono">sara.meniawy@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {language === 'ar' ? 'جاهز' : 'Ready'}
                </span>
              </button>

              {/* Custom Google Account Section */}
              {customGoogleMode ? (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="text-xs font-bold text-gray-700">
                    {language === 'ar' ? 'إدخال بيانات حساب Google الخاص بك:' : 'Enter your Google Account details:'}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#4285F4]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#4285F4]"
                  />
                  <button
                    type="button"
                    disabled={submitting || !customGoogleEmail.includes('@') || !customGoogleName.trim()}
                    onClick={() =>
                      handleGoogleLogin({
                        name: customGoogleName.trim(),
                        email: customGoogleEmail.trim(),
                      })
                    }
                    className="w-full py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {submitting
                      ? language === 'ar'
                        ? 'جاري الربط مع Google...'
                        : 'Authenticating...'
                      : language === 'ar'
                      ? 'متابعة الدخول بهذا الحساب'
                      : 'Continue with this Google Account'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCustomGoogleMode(true)}
                  className="w-full p-2.5 rounded-2xl border border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>{language === 'ar' ? 'استخدام حساب Google آخر...' : 'Use another Google account...'}</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              {language === 'ar'
                ? 'للمتابعة، ستشارك Google اسمك وعنوان بريدك وصورة ملفك الشخصي مع منصة جواز إن، وفقاً لسياسة الخصوصية.'
                : 'Google will share your name, email address, and profile picture with Gawaz Inn in accordance with privacy policy.'}
            </p>

            <button
              type="button"
              onClick={() => {
                setShowGooglePicker(false);
                setCustomGoogleMode(false);
              }}
              className="w-full py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {dir === 'rtl' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{language === 'ar' ? 'الرجوع لخيارات الدخول الأخرى' : 'Back to other options'}</span>
            </button>
          </div>
        ) : (
          /* ================= MAIN AUTH MODAL VIEW ================= */
          <div className="space-y-4">
            {/* Header */}
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

            {/* Status alerts */}
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

            {successNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* 1. PRIMARY ONE-CLICK SOCIAL LOGIN: GOOGLE & APPLE */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setErrorMsg(null);
                  setShowGooglePicker(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-300 hover:border-gray-400 shadow-xs transition flex items-center justify-center gap-3 cursor-pointer group"
              >
                <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
                <span>{language === 'ar' ? 'المتابعة باستخدام Google' : 'Continue with Google'}</span>
                <span className="bg-blue-50 text-[#4285F4] text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200">
                  {language === 'ar' ? 'سريع' : 'Fast'}
                </span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleAppleLogin}
                className="w-full py-3 px-4 rounded-2xl bg-[#0F172A] hover:bg-black text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <AppleIcon className="w-4 h-4 shrink-0" />
                <span>{language === 'ar' ? 'المتابعة باستخدام حساب Apple' : 'Continue with Apple'}</span>
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-gray-400 shrink-0">
                {language === 'ar' ? 'أو من خلال الخيارات التالية' : 'or continue with'}
              </span>
              <div className="border-t border-gray-200 w-full" />
            </div>

            {/* Segmented Control / Tabs for Password vs Phone OTP */}
            {mode === 'login' && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-gray-100 border border-gray-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessNotice(null);
                    setMethod('password');
                  }}
                  className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'password'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'البريد وكلمة المرور' : 'Email / Password'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessNotice(null);
                    setMethod('otp');
                  }}
                  className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'otp'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'رقم الموبايل (OTP)' : 'Phone OTP'}</span>
                </button>
              </div>
            )}

            {/* 2. OPTION A: PHONE OTP LOGIN */}
            {mode === 'login' && method === 'otp' && (
              <div className="space-y-3.5">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                        <span>{language === 'ar' ? 'رقم الهاتف المحمول (مصر):' : 'Egyptian Mobile Phone:'}</span>
                        <span className="text-[10px] text-gray-400 font-normal">010 / 011 / 012 / 015</span>
                      </label>
                      <div className="relative">
                        <span className="absolute start-3 top-2.5 text-xs font-bold text-gray-400">🇪🇬 +20</span>
                        <input
                          type="tel"
                          required
                          pattern="01[0125][0-9]{8}"
                          maxLength={11}
                          placeholder="010XXXXXXXX"
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value)}
                          className="w-full ps-16 pe-3 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold outline-none focus:border-[#D91B3E]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || otpPhone.length < 11}
                      className="w-full bg-red-gradient text-white font-bold text-xs py-3 rounded-xl shadow-md hover:opacity-95 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>
                        {submitting
                          ? language === 'ar'
                            ? 'جاري إرسال الرمز...'
                            : 'Sending code...'
                          : language === 'ar'
                          ? 'إرسال رمز التحقق SMS'
                          : 'Send Verification SMS'}
                      </span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-500 block text-[11px]">
                          {language === 'ar' ? 'تم الإرسال للرقم:' : 'Sent to number:'}
                        </span>
                        <strong className="text-gray-900 font-mono font-bold">{otpPhone}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('');
                          setOtpHint(null);
                        }}
                        className="text-[11px] text-[#D91B3E] font-bold hover:underline cursor-pointer"
                      >
                        {language === 'ar' ? 'تغيير الرقم' : 'Change'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                        <span>{language === 'ar' ? 'رمز التحقق (6 أرقام):' : 'Enter 6-Digit Code:'}</span>
                        {otpHint && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                            {language === 'ar' ? `كود التجربة: ${otpHint}` : `Demo: ${otpHint}`}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full text-center tracking-widest text-lg font-black p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 outline-none focus:border-[#D91B3E]"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        disabled={otpCountdown > 0 || submitting}
                        onClick={() => void handleSendOtp()}
                        className="text-[11px] font-bold text-[#D91B3E] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                      >
                        {otpCountdown > 0
                          ? language === 'ar'
                            ? `إعادة الإرسال بعد (${otpCountdown} ث)`
                            : `Resend in (${otpCountdown}s)`
                          : language === 'ar'
                          ? 'إعادة إرسال الرمز'
                          : 'Resend Code'}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || otpCode.length < 4}
                      className="w-full bg-red-gradient text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
                    >
                      {submitting
                        ? language === 'ar'
                          ? 'جاري التحقق...'
                          : 'Verifying...'
                        : language === 'ar'
                        ? 'تأكيد الدخول الآن'
                        : 'Verify & Sign In'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 3. OPTION B: TRADITIONAL EMAIL / PASSWORD (OR REGISTER) */}
            {(mode === 'register' || method === 'password') && (
              <form onSubmit={handleSubmitPassword} className="space-y-3.5">
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
                      data-testid="auth-identifier-input"
                      placeholder={
                        language === 'ar' ? 'karim@gawazinn.demo أو 01012345678' : 'email@domain.com or 010XXXXXXXX'
                      }
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'كلمة المرور:' : 'Password:'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setForgotModal(true)}
                        className="text-[11px] text-[#D91B3E] font-semibold hover:underline cursor-pointer"
                      >
                        {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={mode === 'register' ? 8 : 4}
                      data-testid="auth-password-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full ps-3 pe-10 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-xs outline-none focus:border-[#D91B3E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="flex items-center gap-2">
                    <input
                      id="remember-me-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#D91B3E] focus:ring-[#D91B3E] border-gray-300 cursor-pointer"
                    />
                    <label htmlFor="remember-me-checkbox" className="text-[11px] text-gray-600 font-medium cursor-pointer">
                      {language === 'ar' ? 'تذكرني على هذا الجهاز' : 'Remember me on this device'}
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="auth-submit-btn"
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
            )}

            {/* Forgot password dialog simulation */}
            {forgotModal && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-[#2A1D20] space-y-2">
                <div className="flex items-center justify-between font-bold text-[#D91B3E]">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'استعادة كلمة المرور' : 'Password Recovery'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {language === 'ar'
                    ? 'يمكنك الدخول مباشرة عبر حساب Google أو عبر رقم الموبايل وكود OTP بضغطة واحدة، أو استخدام الحسابات التجريبية بالأسفل.'
                    : 'You can instantly sign in using Google or Phone OTP without remembering your password.'}
                </p>
              </div>
            )}

            {/* Demo Quick Login Section */}
            {apiConnected && (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D91B3E]/15 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B31331]">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ar'
                      ? 'حسابات تجريبية سريعة للمعاينة والفحص:'
                      : 'Seeded Demo Accounts (Instant Test Access):'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDemoLogin('karim@gawazinn.demo', 'DemoPass@2026')}
                    className="px-2 py-2 rounded-xl bg-white hover:bg-[#FDE8ED] border border-rose-200 text-[#2A1D20] text-[11px] font-bold transition cursor-pointer text-center"
                  >
                    {language === 'ar' ? 'دخول عميل' : 'Customer'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDemoLogin('vendor@gawazinn.demo', 'DemoPass@2026')}
                    className="px-2 py-2 rounded-xl bg-white hover:bg-[#FDE8ED] border border-rose-200 text-[#B31331] text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer text-center"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'دخول مورد' : 'Vendor'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDemoLogin('admin@gawazinn.demo', 'AdminPass@2026')}
                    className="px-2 py-2 rounded-xl bg-white hover:bg-[#FDE8ED] border border-rose-200 text-[#D91B3E] text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer text-center"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'دخول الإدارة' : 'Admin'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Register/Login toggle */}
            <div className="text-center text-xs text-gray-500 pt-1">
              {mode === 'login' ? (
                <span>
                  {language === 'ar' ? 'ليس لديك حساب بعد؟ ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessNotice(null);
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
                      setSuccessNotice(null);
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
        )}
      </div>
    </ModalFrame>
  );
};

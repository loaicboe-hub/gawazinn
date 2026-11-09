import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Briefcase,
  Sparkles,
  Heart,
  PhoneCall,
  MessageSquare,
  HeartHandshake,
  BookOpen,
  MapPin,
  CreditCard,
  Wrench,
  HelpCircle,
  Calculator,
  Wallet,
  Compass,
  Layers,
  Gem,
  ListTodo,
  ShoppingBag,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, settings } = useApp();

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-[#FAF7F2] text-[#2A1D20] border-t border-[#D91B3E]/15 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-200/80">
          {/* Logo & Slogan */}
          <div className="text-center md:text-start">
            <Link to="/" onClick={scrollTop} className="inline-flex items-center gap-2">
              <span className="text-xl font-black text-[#2A1D20]">
                {language === 'ar' ? 'جواز إن' : 'GAWAZ INN'}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#D91B3E]" />
            </Link>
            <p className="text-xs text-[#B31331] font-semibold mt-1">
              {language === 'ar' ? settings.sloganAr : settings.sloganEn}
            </p>
          </div>

          {/* Core Section Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-gray-700">
            <Link
              to="/finishing"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'تشطيب الشقة' : 'Apartment Finishing'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/groom"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'جهاز العريس' : "Groom's Essentials"}</span>
            </Link>

            <span>•</span>

            <Link
              to="/bride"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'جهاز العروسة' : "Bride's Essentials"}</span>
            </Link>

            <span>•</span>

            <Link
              to="/wedding"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'فرحي' : 'Wedding Planner'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/installments"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'التقسيط' : 'Installments'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/encyclopedia"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'الموسوعة' : 'Encyclopedia'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/finishing/materials"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'دليل الخامات' : 'Materials Guide'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/glossary"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'القاموس' : 'Glossary'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/faqs"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/calculators"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? '20 حاسبة ذكية' : '20 Calculators'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/my/budget"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'ميزانية الزواج' : 'Wedding Budget'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/early-start"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'البداية المبكرة' : 'Early Start'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/onboarding"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'مسار 11 مرحلة' : '11-Stage Onboarding'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/engagement"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Gem className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'مخطط الخطوبة' : 'Engagement'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/journey"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <ListTodo className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'مخطط الرحلة' : 'Journey'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/discover"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'دليل المحافظات' : 'Egypt Locations'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/products"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'موسوعة المنتجات' : 'Product Encyclopedia'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/products/compare"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'مقارنة المنتجات' : 'Compare Matrix'}</span>
            </Link>

            <span>•</span>

            <Link
              to="/my/shopping-lists"
              onClick={scrollTop}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <ListTodo className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'سلال المشتريات' : 'Shopping Baskets'}</span>
            </Link>
          </div>

          {/* Contact Hotlines */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#2A1D20]">
              <PhoneCall className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{settings.hotline}</span>
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-bold text-emerald-700 hover:underline"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'واتساب 24/7' : 'WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Discreet Community Support Initiative Link */}
        <div className="text-center">
          <Link
            to="/social-support"
            onClick={scrollTop}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B31331] hover:text-[#D91B3E] hover:underline bg-[#FDE8ED] px-4 py-2 rounded-full border border-[#D91B3E]/20 transition"
          >
            <HeartHandshake className="w-4 h-4 text-[#D91B3E]" />
            <span>
              {language === 'ar'
                ? 'مبادرة جواز إن للدعم المجتمعي'
                : 'GAWAZ INN Community Support Initiative'}
            </span>
          </Link>
        </div>

        {/* Copyright & Intro Replay */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3 pt-2">
          <p>
            © {new Date().getFullYear()}{' '}
            {language === 'ar'
              ? 'منصة جواز إن (GAWAZ INN). جميع الحقوق محفوظة.'
              : 'GAWAZ INN Platform. All rights reserved.'}
          </p>

          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem('gawazinn_intro_splash_seen');
              } catch {
                // ignore
              }
              window.dispatchEvent(new CustomEvent('gawazinn_replay_intro'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-[#D91B3E] hover:underline font-medium transition cursor-pointer"
          >
            {language === 'ar' ? '✨ إعادة مشاهدة مقدمة المنصة' : '✨ Replay Intro'}
          </button>

          <p className="font-semibold text-[#D91B3E]">
            {language === 'ar' ? 'صنع بكل فخر وحب في مصر 🇪🇬' : 'Crafted with Love in Egypt 🇪🇬'}
          </p>
        </div>
      </div>
    </footer>
  );
};

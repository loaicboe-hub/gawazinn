import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Briefcase, 
  Sparkles, 
  Heart, 
  PhoneCall, 
  MessageSquare, 
  HeartHandshake
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, setActiveSection, settings } = useApp();

  const handleNav = (sec: any) => {
    setActiveSection(sec);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAF7F2] text-[#2A1D20] border-t border-[#D91B3E]/15 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-200/80">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 text-center md:text-start">
            <div className="w-10 h-10 rounded-xl bg-red-gradient p-0.5 shadow-sm">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-serif font-black text-[#D91B3E] text-sm">
                GI
              </div>
            </div>
            <div>
              <span className="text-xl font-black text-[#2A1D20]">
                {language === 'ar' ? 'جواز إن' : 'GAWAZ INN'}
              </span>
              <p className="text-xs text-[#B31331] font-semibold">
                {language === 'ar' ? 'من أول الشقة.. لحد ليلة العمر.' : 'From Apartment Keys.. To Your Dream Wedding.'}
              </p>
            </div>
          </div>

          {/* Core Section Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-gray-700">
            <button 
              onClick={() => handleNav('finishing')}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'تشطيب الشقة' : 'Apartment Finishing'}</span>
            </button>

            <span>•</span>

            <button 
              onClick={() => handleNav('groom')}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'جهاز العريس' : "Groom's Essentials"}</span>
            </button>

            <span>•</span>

            <button 
              onClick={() => handleNav('bride')}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'جهاز العروسة' : "Bride's Essentials"}</span>
            </button>

            <span>•</span>

            <button 
              onClick={() => handleNav('wedding')}
              className="hover:text-[#D91B3E] transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'فرحي' : 'Wedding Planner'}</span>
            </button>
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

        {/* Discreet Community Support Initiative Link as specified in prompt section 5 */}
        <div className="text-center">
          <button
            onClick={() => handleNav('socialSupport')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B31331] hover:text-[#D91B3E] hover:underline bg-[#FDE8ED] px-4 py-2 rounded-full border border-[#D91B3E]/20 transition"
          >
            <HeartHandshake className="w-4 h-4 text-[#D91B3E]" />
            <span>
              {language === 'ar' ? 'مبادرة جواز إن للدعم المجتمعي' : 'GAWAZ INN Community Support Initiative'}
            </span>
          </button>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3 pt-2">
          <p>
            © {new Date().getFullYear()} {language === 'ar' ? 'منصة جواز إن (GAWAZ INN). جميع الحقوق محفوظة.' : 'GAWAZ INN Platform. All rights reserved.'}
          </p>
          <p className="font-semibold text-[#D91B3E]">
            {language === 'ar' ? 'صنع بكل فخر وحب في مصر 🇪🇬' : 'Crafted with Love in Egypt 🇪🇬'}
          </p>
        </div>

      </div>
    </footer>
  );
};

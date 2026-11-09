import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Heart, Home, Building2, Briefcase, Sparkles, BookOpen } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FDE8ED] text-[#D91B3E] shadow-sm mx-auto">
        <Heart className="w-8 h-8 fill-[#D91B3E]/20" />
      </div>

      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-[#FDE8ED] text-[#B31331] text-xs font-black">
          404
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#2A1D20]">
          {language === 'ar' ? 'الصفحة المطلوبة غير موجودة' : 'Page Not Found'}
        </h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          {language === 'ar'
            ? 'الرابط الذي طلبته غير متاح حالياً. يمكنك الانتقال مباشرة إلى الصفحة الرئيسية أو أحد الأقسام الأربعة.'
            : 'The requested page could not be found. Jump back to the homepage or choose one of our main sections below.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        <Link
          to="/"
          className="px-5 py-3 rounded-xl bg-red-gradient text-white text-xs font-bold shadow-md flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{language === 'ar' ? 'الصفحة الرئيسية' : 'Homepage'}</span>
        </Link>
        <Link
          to="/finishing"
          className="px-4 py-3 rounded-xl bg-[#FAF7F2] text-[#2A1D20] border border-[#D91B3E]/15 text-xs font-bold hover:border-[#D91B3E]/40 flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-[#D91B3E]" />
          <span>{language === 'ar' ? 'تشطيب الشقة' : 'Finishing'}</span>
        </Link>
        <Link
          to="/groom"
          className="px-4 py-3 rounded-xl bg-[#FAF7F2] text-[#2A1D20] border border-[#D91B3E]/15 text-xs font-bold hover:border-[#D91B3E]/40 flex items-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5 text-[#D91B3E]" />
          <span>{language === 'ar' ? 'جهاز العريس' : 'Groom'}</span>
        </Link>
        <Link
          to="/bride"
          className="px-4 py-3 rounded-xl bg-[#FAF7F2] text-[#2A1D20] border border-[#D91B3E]/15 text-xs font-bold hover:border-[#D91B3E]/40 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D91B3E]" />
          <span>{language === 'ar' ? 'جهاز العروسة' : 'Bride'}</span>
        </Link>
        <Link
          to="/encyclopedia"
          className="px-4 py-3 rounded-xl bg-[#FAF7F2] text-[#2A1D20] border border-[#D91B3E]/15 text-xs font-bold hover:border-[#D91B3E]/40 flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#D91B3E]" />
          <span>{language === 'ar' ? 'الموسوعة' : 'Encyclopedia'}</span>
        </Link>
      </div>
    </div>
  );
};


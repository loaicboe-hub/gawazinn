import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { NEWLYWED_TRACKS_META } from '../../../shared/stage11Data';
import { apiRequest } from '../../services/api';
import type { Article, HomeCareDirectoryPayload, NewlywedGuideTrack } from '../../types';
import { SmartImage } from '../common/SmartImage';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FolderHeart,
  HeartHandshake,
  Home,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';

const NEWLYWED_STEPS_STORAGE_KEY = 'gawaz_inn_newlywed_steps_v1';

export const NewlywedsGuideView: React.FC = () => {
  const { language, dir, articles } = useApp();
  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const [tracks, setTracks] = useState<NewlywedGuideTrack[]>(NEWLYWED_TRACKS_META);
  const [remoteMarriedArticles, setRemoteMarriedArticles] = useState<Article[] | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(NEWLYWED_STEPS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let active = true;
    apiRequest<HomeCareDirectoryPayload>('/home-care/directory')
      .then((payload) => {
        if (!active) return;
        if (payload.tracks && payload.tracks.length > 0) setTracks(payload.tracks);
        if (payload.articles && payload.articles.length > 0) setRemoteMarriedArticles(payload.articles);
      })
      .catch(() => {
        // Fallback smoothly to offline context seed data
      });
    return () => {
      active = false;
    };
  }, []);

  const marriedArticles =
    remoteMarriedArticles && remoteMarriedArticles.length > 0
      ? remoteMarriedArticles
      : articles.filter((a) => a.domain === 'married_life');

  const toggleStep = (stepKey: string) => {
    setCheckedKeys((prev) => {
      const next = prev.includes(stepKey) ? prev.filter((k) => k !== stepKey) : [...prev, stepKey];
      try {
        localStorage.setItem(NEWLYWED_STEPS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  };

  const totalSteps = tracks.reduce((sum, tr) => sum + tr.stepsAr.length, 0);
  const completedCount = tracks.reduce((sum, tr) => {
    return sum + tr.stepsAr.filter((s) => checkedKeys.includes(s.key)).length;
  }, 0);
  const completionPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 lg:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <HeartHandshake className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'ما بعد الزفاف — استقرار البيت وإدارة السنة الأولى'
                  : 'Beyond the Wedding — First-Year Married Life & Home Stability'}
              </span>
            </div>
            <h1 data-testid="newlyweds-guide-heading" className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === 'ar'
                ? 'دليل المتزوجين الجدد وإدارة البيت في السنة الأولى'
                : 'Newlyweds Year-One Guide & Household Care Roadmap'}
            </h1>
            <p className="text-sm sm:text-base text-rose-100/95 leading-relaxed">
              {language === 'ar'
                ? 'رحلتك مع جواز إن لا تنتهي ليلة الزفاف: تابع خطوات الانتقال الآمن، توثيق أكواد التشطيب والضمانات، وإدارة الصيانة الوقائية والمصروف الشهري بوضوح.'
                : 'GAWAZ INN supports your home long after the wedding night: follow 6 practical tracks covering moving logistics, paint/panel archiving, emergency runway, and preventive home maintenance.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/home-care"
              data-testid="guide-to-homecare-link"
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-black text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <Truck className="w-4 h-4" />
              <span>{language === 'ar' ? 'دليل النقل والصيانة' : 'Moving & Home Care'}</span>
            </Link>
            <Link
              to="/my/home-file"
              data-testid="guide-to-homefile-link"
              className="px-5 py-3 rounded-2xl bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition"
            >
              <FolderHeart className="w-4 h-4" />
              <span>{language === 'ar' ? 'ملف البيت الرقمي' : 'Digital Home File'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Progress Summary Banner */}
        <section className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-7 border border-[#D91B3E]/15 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-black text-[#2A1D20]">
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#D91B3E]" />
                {language === 'ar' ? 'تقدمك الشخصي في السنة الأولى' : 'Personal Year-One Readiness Progress'}
              </span>
              <span data-testid="newlyweds-progress-text" className="text-[#D91B3E]">
                {completedCount} / {totalSteps} ({completionPct}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-white border border-gray-200 overflow-hidden">
              <div
                className="h-full bg-red-gradient transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              {language === 'ar'
                ? 'تُحفظ علامات التنفيذ محلياً على جهازك، ويمكنك ربط مواعيد الصيانة والضمانات في ملف البيت الرقمي.'
                : 'Checklist selections save automatically in your browser; sync real appliance warranties & reminders in Digital Home File.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              to="/calculators/emergency-reserve"
              className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#D91B3E] text-xs font-bold text-[#2A1D20] flex items-center gap-1.5 transition"
            >
              <Compass className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'حاسبة وسادة الأمان' : 'Emergency Runway Calc'}</span>
            </Link>
            <Link
              to="/my/budget"
              className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#D91B3E] text-xs font-bold text-[#2A1D20] flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'مدير الميزانية' : 'Budget Manager'}</span>
            </Link>
          </div>
        </section>

        {/* 6 Interactive Tracks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20]">
              {language === 'ar' ? 'خارطة استقرار عش الزوجية (6 محاور عملية)' : '6 Practical First-Year Stability Tracks'}
            </h2>
            <span className="text-xs font-bold text-[#B31331] bg-[#FDE8ED] px-3 py-1 rounded-full">
              {language === 'ar' ? 'تحديث تفاعلي فوري' : 'Interactive Checklist'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tracks.map((track) => {
              const steps = language === 'ar' ? track.stepsAr : track.stepsEn;
              const trackDoneCount = steps.filter((s) => checkedKeys.includes(s.key)).length;
              return (
                <article
                  key={track.id}
                  data-testid={`newlywed-track-${track.slug}`}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#FDE8ED] text-[#B31331] text-[11px] font-black">
                        {language === 'ar' ? track.timeframeAr : track.timeframeEn}
                      </span>
                      <span className="text-[11px] font-bold text-gray-500">
                        {trackDoneCount}/{steps.length}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[#2A1D20]">
                      {language === 'ar' ? track.titleAr : track.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {language === 'ar' ? track.summaryAr : track.summaryEn}
                    </p>

                    <div className="space-y-2 pt-2">
                      {steps.map((step) => {
                        const checked = checkedKeys.includes(step.key);
                        return (
                          <label
                            key={step.key}
                            data-testid={`track-step-${step.key}`}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              checked
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                : 'bg-[#FAF7F2] border-gray-100 text-[#2A1D20] hover:border-[#D91B3E]/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleStep(step.key)}
                              className="mt-0.5 accent-[#D91B3E] w-4 h-4 shrink-0"
                            />
                            <span className={checked ? 'line-through opacity-80 font-medium' : 'font-semibold'}>
                              {step.text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      to={track.ctaPath}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#D91B3E] hover:text-[#99132B] transition"
                    >
                      <span>{language === 'ar' ? track.ctaLabelAr : track.ctaLabelEn}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                    {trackDoneCount === steps.length && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'مكتمل' : 'Done'}</span>
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Married Life Encyclopedia Articles */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#2A1D20] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'مقالات وأدلة الحياة الزوجية وصيانة المنزل' : 'Married Life & Home Stewardship Guides'}</span>
            </h2>
            <Link
              to="/encyclopedia"
              className="text-xs font-bold text-[#D91B3E] hover:underline flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'تصفح كل الموسوعة' : 'Browse Full Encyclopedia'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {marriedArticles.length === 0 ? (
            <div className="bg-[#FAF7F2] rounded-3xl p-8 text-center text-xs text-gray-500 border border-gray-100">
              {language === 'ar' ? 'لا توجد مقالات منشورة في هذا القسم حالياً.' : 'No married life articles published yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marriedArticles.map((art) => (
                <Link
                  key={art.id}
                  to={`/guides/${art.slug}`}
                  className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-lg transition flex flex-col"
                >
                  <div className="h-44 relative overflow-hidden">
                    <SmartImage
                      src={art.featuredImage}
                      alt={language === 'ar' ? art.titleAr : art.titleEn}
                      fallbackTitle={language === 'ar' ? art.titleAr : art.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FDE8ED] text-[#B31331] text-[10px] font-black">
                        <Wrench className="w-3 h-3" />
                        <span>{language === 'ar' ? `${art.readingMinutes} دقائق قراءة` : `${art.readingMinutes} min read`}</span>
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-[#2A1D20]">
                        {language === 'ar' ? art.titleAr : art.titleEn}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {language === 'ar' ? art.excerptAr : art.excerptEn}
                      </p>
                    </div>
                    <span className="pt-2 text-xs font-black text-[#D91B3E] flex items-center gap-1">
                      <span>{language === 'ar' ? 'اقرأ الدليل الكامل' : 'Read Full Guide'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};


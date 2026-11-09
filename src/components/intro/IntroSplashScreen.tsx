import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface IntroSplashScreenProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const IntroSplashScreen: React.FC<IntroSplashScreenProps> = ({
  onComplete,
  forceShow = false,
}) => {
  const { language, dir } = useApp();
  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const [isVisible, setIsVisible] = useState(() => {
    if (forceShow) return true;
    try {
      return sessionStorage.getItem('gawazinn_intro_splash_seen') !== 'true';
    } catch {
      return true;
    }
  });

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bgFailed, setBgFailed] = useState(false);

  const dismiss = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem('gawazinn_intro_splash_seen', 'true');
      } catch {
        // Ignore session storage errors
      }
      if (onComplete) onComplete();
    }, 450);
  }, [onComplete]);

  useEffect(() => {
    const handleReplay = () => {
      setIsFadingOut(false);
      setProgress(0);
      setIsVisible(true);
    };

    window.addEventListener('gawazinn_replay_intro', handleReplay);
    return () => window.removeEventListener('gawazinn_replay_intro', handleReplay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const startTime = Date.now();
    const duration = 8000;
    const fadeOutDuration = 700;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(currentProgress);

      if (elapsed >= duration - fadeOutDuration) {
        setIsFadingOut(true);
      }

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        dismiss();
      }
    }, 30);

    return () => {
      clearInterval(progressInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, dismiss]);

  if (!isVisible) return null;

  const secondsLeft = Math.max(1, Math.ceil(8 - progress / 12.5));

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-[#1C060B] transition-opacity duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      dir={dir}
      data-testid="intro-splash"
    >
      {/* Background Image with Cinematic Ken Burns Slow Zoom */}
      <div className="absolute inset-0 overflow-hidden">
        {!bgFailed && (
          <img
            src="/intro-proposal.jpg"
            alt={language === 'ar' ? 'جواز إن — خطوبة وزواج' : 'GAWAZ INN Wedding Proposal'}
            onError={() => setBgFailed(true)}
            className="w-full h-full object-cover object-center animate-kenburns scale-100"
            style={{ animationDuration: '9s', animationFillMode: 'forwards' }}
          />
        )}

        <div className="absolute inset-0 bg-radial-vignette opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C060B]/95 via-[#2A0A12]/60 to-[#1C060B]/70" />
        <div className="absolute inset-0 bg-[#D91B3E]/10 mix-blend-color-dodge pointer-events-none" />
      </div>

      {/* Top Header Bar: Brand Name & Skip Button */}
      <div className="relative z-20 flex items-center justify-between p-5 sm:p-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <Heart className="w-4 h-4 fill-[#D91B3E] text-[#D91B3E] animate-pulse" />
          <span className="text-xs sm:text-sm font-black tracking-wide font-serif">
            {language === 'ar' ? 'جواز إن' : 'GAWAZ INN'}
          </span>
        </div>

        <button
          type="button"
          onClick={dismiss}
          data-testid="intro-skip-btn"
          className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label={language === 'ar' ? 'تخطي المقدمة' : 'Skip Intro'}
        >
          <span>{language === 'ar' ? 'تخطي' : 'Skip'}</span>
          <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-[#D91B3E] flex items-center justify-center transition-colors">
            <ArrowIcon className="w-3 h-3 text-white" />
          </div>
        </button>
      </div>

      {/* Center Cinematic Emotional Message */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D91B3E]/80 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-bold shadow-xl mb-4 sm:mb-6 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
          <span>
            {language === 'ar' ? 'رحلة ليلة العمر تبدأ بقرار' : 'Your Journey Begins with a Choice'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] animate-fade-in-up">
          {language === 'ar' ? 'ابدأ حوّش لجوازك' : 'Start Saving for Your Marriage'}
        </h1>

        <div className="mt-3 sm:mt-5 animate-fade-in-up-delay">
          <span className="inline-block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-white drop-shadow-[0_4px_14px_rgba(217,27,62,0.6)]">
            {language === 'ar' ? 'ولو بـ 100 جنيه في اليوم' : 'Even with 100 EGP per Day'}
          </span>
        </div>

        <p className="mt-5 sm:mt-7 text-xs sm:text-base font-semibold text-rose-100/90 tracking-wide max-w-lg drop-shadow-md animate-fade-in-up-delay">
          {language === 'ar'
            ? 'من أول الشقة.. لحد ليلة العمر.'
            : 'From Apartment Keys.. To Your Dream Wedding.'}
        </p>
      </div>

      {/* Bottom Footer: 8-Second Animated Progress Bar */}
      <div className="relative z-20 p-5 sm:p-8 w-full max-w-xl mx-auto flex flex-col items-center gap-2">
        <div className="w-full bg-white/20 h-1.5 sm:h-2 rounded-full overflow-hidden backdrop-blur-md border border-white/20 p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#ED264D] via-[#D91B3E] to-amber-300 rounded-full transition-all duration-75 ease-linear shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-white/80 font-medium px-1">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 fill-[#D91B3E] text-[#D91B3E]" />
            <span>{language === 'ar' ? 'جواز إن' : 'GAWAZ INN'}</span>
          </span>
          <span>
            {language === 'ar' ? `${secondsLeft} ثوانٍ` : `${secondsLeft}s`}
          </span>
        </div>
      </div>
    </div>
  );
};

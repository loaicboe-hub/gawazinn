import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300">
      <div className="bg-[#B31331] text-white px-6 py-3.5 rounded-2xl shadow-2xl border-2 border-white/40 flex items-center gap-3 backdrop-blur-lg">
        <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
          <Heart className="w-4 h-4 fill-white" />
        </div>
        <p className="text-xs sm:text-sm font-bold tracking-wide text-white">
          {toastMessage}
        </p>
      </div>
    </div>
  );
};

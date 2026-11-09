import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const ModalFrame: React.FC<ModalFrameProps> = ({
  isOpen,
  onClose,
  titleId,
  maxWidthClass = 'max-w-lg',
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white text-[#2A1D20] rounded-3xl p-6 sm:p-9 ${maxWidthClass} w-full shadow-2xl border-2 border-[#D91B3E]/25 relative my-8`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 end-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-[#D91B3E] hover:bg-[#FDE8ED] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};


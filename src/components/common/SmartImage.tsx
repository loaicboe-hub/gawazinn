import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
  }

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FDE8ED] to-[#FAF7F2] text-[#D91B3E] p-4 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackTitle || 'GAWAZ INN'}
      >
        <Heart className="w-7 h-7 fill-[#D91B3E]/20 text-[#D91B3E] mb-1.5" />
        <span className="text-[11px] font-bold text-[#B31331] line-clamp-2">
          {fallbackTitle || alt || 'GAWAZ INN'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
      {...rest}
    />
  );
};


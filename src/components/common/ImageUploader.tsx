import React, { useRef, useState } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { SmartImage } from './SmartImage';

export interface ImagePreset {
  label: string;
  url: string;
}

export interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  maxDimension?: number;
  quality?: number;
  presets?: ImagePreset[];
  language?: 'ar' | 'en';
  id?: string;
  className?: string;
  aspectRatioHint?: string;
}

/**
 * Resizes and compresses an image file using an HTML5 Canvas into a compact JPEG Base64 string.
 */
function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, base64 data URL directly without canvas rasterization
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback if canvas context is unavailable
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with specified quality
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };

      img.onerror = () => {
        // Fallback to raw data url if image decode fails
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatApproxSize(dataUrl: string): string {
  if (!dataUrl) return '';
  if (!dataUrl.startsWith('data:')) return 'رابط خارجي / URL';
  const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
  const bytes = (base64Length * 3) / 4;
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  required = false,
  maxDimension = 1200,
  quality = 0.82,
  presets = [],
  language = 'ar',
  id,
  className = '',
  aspectRatioHint,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRtl = language === 'ar';

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);

    if (!file.type.startsWith('image/')) {
      setErrorMessage(
        isRtl
          ? 'الملف المحدد ليس صورة صالحة. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.'
          : 'Selected file is not a valid image. Please select JPG, PNG, or WebP.'
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(
        isRtl
          ? 'حجم الصورة كبير جداً (أكثر من 15 ميجابايت). يرجى اختيار صورة أصغر.'
          : 'Image file is too large (> 15MB). Please pick a smaller image.'
      );
      return;
    }

    try {
      setIsProcessing(true);
      const compressed = await compressImageFile(file, maxDimension, quality);
      onChange(compressed);
    } catch {
      setErrorMessage(
        isRtl
          ? 'تعذر معالجة وضغط الصورة، يرجى تجربة صورة أخرى.'
          : 'Could not process or compress the image. Please try another one.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input so picking same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setErrorMessage(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with Label and Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-[#D91B3E]">*</span>}
          </label>
        )}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'upload'
                ? 'bg-white text-[#D91B3E] shadow-xs font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>{isRtl ? 'رفع من الجهاز' : 'Upload'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'url'
                ? 'bg-white text-[#D91B3E] shadow-xs font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>{isRtl ? 'رابط مباشر (URL)' : 'URL'}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Box / Dropzone */}
      {activeTab === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 select-none ${
            isDragging
              ? 'border-[#D91B3E] bg-rose-50/70 scale-[0.99]'
              : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/20 bg-gray-50/50'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-[#D91B3E] flex items-center justify-center shadow-xs">
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">
                {isProcessing
                  ? isRtl
                    ? 'جاري ضغط ومعالجة الصورة...'
                    : 'Compressing and optimizing image...'
                  : isRtl
                  ? 'اضغط لاختيار صورة من جهازك، أو اسحب الملف وأفلته هنا'
                  : 'Click to browse device or drag & drop image here'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {aspectRatioHint ||
                  (isRtl
                    ? 'يدعم JPG, PNG, WebP (يتم الضغط الذكي تلقائياً للأداء الأسرع)'
                    : 'Supports JPG, PNG, WebP (auto-compressed for fast loading)')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Direct URL Input Mode */
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/... أو رابط الصورة"
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#D91B3E] pe-8"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 end-2 flex items-center text-gray-400 hover:text-gray-600"
                title={isRtl ? 'مسح' : 'Clear'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preset Chips if provided */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-gray-400">
            {isRtl ? 'نماذج وصور جاهزة:' : 'Sample presets:'}
          </span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.url)}
              className="px-2 py-0.5 rounded-md bg-rose-50 text-[#D91B3E] hover:bg-rose-100 text-[10px] font-bold transition cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Preview Card */}
      {value && (
        <div className="p-2.5 rounded-2xl bg-white border border-rose-100 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-200 relative">
              <SmartImage
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                fallbackTitle="صورة"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <ImageIcon className="w-3 h-3" />
                  {isRtl ? 'تم تحميل الصورة' : 'Image loaded'}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {formatApproxSize(value)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate mt-1 max-w-[200px] sm:max-w-[280px]">
                {value.startsWith('data:') ? 'Base64 Data (Compressed)' : value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#D91B3E] hover:bg-rose-50 transition cursor-pointer"
              title={isRtl ? 'تغيير الصورة' : 'Replace Image'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title={isRtl ? 'حذف الصورة' : 'Remove Image'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


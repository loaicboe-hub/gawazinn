import React from 'react';
import { BadgeCheck, FileCheck2, ShieldAlert, ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { Language, SubscriptionPlanCode, VendorVerificationStatus } from '../../types';

export const VerificationBadge: React.FC<{
  status: VendorVerificationStatus;
  language: Language;
  compact?: boolean;
}> = ({ status, language, compact = false }) => {
  if (status === 'trusted') {
    return (
      <span
        data-testid={`verif-badge-${status}`}
        title={
          language === 'ar'
            ? 'موثق أوراق رسمية + معاينة وتدقيق ميداني مجاني (لا يُشترى بالمال)'
            : 'Audit-only: official papers + field verification (cannot be bought)'
        }
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold shrink-0"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          {language === 'ar'
            ? compact
              ? 'ثقة موثقة'
              : 'موثق + تدقيق ميداني'
            : compact
              ? 'Trusted'
              : 'Trusted & Audited'}
        </span>
      </span>
    );
  }

  if (status === 'verified') {
    return (
      <span
        data-testid={`verif-badge-${status}`}
        title={
          language === 'ar'
            ? 'تمت مراجعة السجل التجاري والأوراق الرسمية فقط عبر الإدارة'
            : 'Official registration & commercial papers audited by admin'
        }
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-extrabold shrink-0"
      >
        <BadgeCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span>
          {language === 'ar'
            ? compact
              ? 'موثق أوراق'
              : 'موثق أوراق رسمية'
            : compact
              ? 'Verified'
              : 'Document Verified'}
        </span>
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span
        data-testid="verif-badge-rejected"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-extrabold shrink-0"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0" />
        <span>{language === 'ar' ? 'موقوف التوثيق' : 'Rejected'}</span>
      </span>
    );
  }

  return (
    <span
      data-testid="verif-badge-registered"
      title={
        language === 'ar'
          ? 'نشاط مسجل — لم تُستكمل أوراق التوثيق الإداري بعد'
          : 'Registered business — formal document audit pending'
      }
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-bold shrink-0"
    >
      <FileCheck2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
      <span>{language === 'ar' ? 'مسجل (قيد المراجعة)' : 'Registered (Unverified)'}</span>
    </span>
  );
};

export const CommercialPlanBadge: React.FC<{
  planCode: SubscriptionPlanCode;
  isFeaturedCommercial: boolean;
  language: Language;
}> = ({ planCode, isFeaturedCommercial, language }) => {
  if (!isFeaturedCommercial && planCode !== 'professional' && planCode !== 'premium') {
    return null;
  }

  return (
    <span
      data-testid={`commercial-badge-${planCode}`}
      title={
        language === 'ar'
          ? 'باقة ظهور تجاري مدفوعة — لا تعني توثيقاً إدارياً'
          : 'Paid commercial visibility tier — independent of verification audit'
      }
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold shrink-0"
    >
      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
      <span>
        {language === 'ar'
          ? planCode === 'premium'
            ? 'عرض مميز (باقة كبرى)'
            : 'عرض مميز (ترويجي)'
          : planCode === 'premium'
            ? 'Featured Partner (Sponsored)'
            : 'Promoted Listing'}
      </span>
    </span>
  );
};

export const HonestRatingBadge: React.FC<{
  ratingAvg: number;
  reviewsCount: number;
  language: Language;
}> = ({ ratingAvg, reviewsCount, language }) => {
  if (reviewsCount <= 0) {
    return (
      <span
        data-testid="honest-rating-empty"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] text-gray-600 border border-gray-200 text-[11px] font-bold"
      >
        <span>{language === 'ar' ? 'جديد — بدون تقييمات بعد' : 'New — No reviews yet'}</span>
      </span>
    );
  }

  return (
    <span
      data-testid="honest-rating-value"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-[#2A1D20] border border-amber-200 text-[11px] font-black"
    >
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <span>{ratingAvg.toFixed(1)}</span>
      <span className="text-gray-500 font-semibold">({reviewsCount})</span>
    </span>
  );
};


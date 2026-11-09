import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../services/api';
import { MEAL_PREFERENCE_META } from '../../../shared/stage10Data';
import type { PublicRsvpPayload } from '../../types';
import { Heart, CheckCircle2, XCircle, Gift, Calendar, Users } from 'lucide-react';

export const PublicRsvpView: React.FC = () => {
  const { code = '' } = useParams<{ code: string }>();
  const { language } = useApp();

  const [payload, setPayload] = useState<PublicRsvpPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rsvpChoice, setRsvpChoice] = useState<'confirmed' | 'declined'>('confirmed');
  const [attendingCount, setAttendingCount] = useState(1);
  const [mealPref, setMealPref] = useState('standard');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);
  const [reservingGiftId, setReservingGiftId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await apiRequest<PublicRsvpPayload>(`/rsvp/${encodeURIComponent(code)}`);
        if (!active) return;
        setPayload(res);
        setRsvpChoice(res.guest.rsvpStatus === 'declined' ? 'declined' : 'confirmed');
        setAttendingCount(Math.max(1, res.guest.attendingCount || res.guest.invitedCount));
        setMealPref(res.guest.mealPreference || 'standard');
        setDietaryNotes(res.guest.dietaryNotes || '');
      } catch (err) {
        if (!active) return;
        setErrorMsg(err instanceof Error ? err.message : 'Invitation not found');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [code]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload) return;
    setSubmitting(true);
    setErrorMsg(null);
    setSubmitBanner(null);
    try {
      const updated = await apiRequest<PublicRsvpPayload>(
        `/rsvp/${encodeURIComponent(payload.guest.rsvpCode)}`,
        {
          method: 'POST',
          body: JSON.stringify({
            rsvpStatus: rsvpChoice,
            attendingCount: rsvpChoice === 'declined' ? 0 : attendingCount,
            mealPreference: mealPref,
            dietaryNotes: dietaryNotes.trim() || null,
          }),
        },
      );
      setPayload(updated);
      setSubmitBanner(
        language === 'ar'
          ? 'شكراً لك! تم تسجيل تأكيد حضورك وإبلاغ العروسين مباشرة.'
          : 'Thank you! Your RSVP response has been confirmed and sent to the couple.',
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReserveGift = async (giftId: string) => {
    if (!payload) return;
    setReservingGiftId(giftId);
    setErrorMsg(null);
    try {
      const updated = await apiRequest<PublicRsvpPayload>(
        `/rsvp/${encodeURIComponent(payload.guest.rsvpCode)}/reserve-gift`,
        {
          method: 'POST',
          body: JSON.stringify({ giftId, guestName: payload.guest.fullName }),
        },
      );
      setPayload(updated);
      setSubmitBanner(
        language === 'ar'
          ? 'تم حجز الهدية بنجاح وإشعار العروسين!'
          : 'Gift reserved cleanly for the couple!',
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not reserve gift');
    } finally {
      setReservingGiftId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm font-bold text-gray-500">
        {language === 'ar' ? 'جاري تحميل دعوة الزفاف الخاصة بك...' : 'Loading wedding invitation...'}
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-black text-[#2A1D20]">
          {language === 'ar' ? 'عذراً، كود الدعوة غير صالح' : 'Invitation Code Not Found'}
        </h1>
        <p className="text-sm text-gray-600">{errorMsg}</p>
        <Link to="/" className="inline-block bg-red-gradient text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          {language === 'ar' ? 'العودة للرئيسية' : 'Back Home'}
        </Link>
      </div>
    );
  }

  const headcountOptions = Array.from(
    { length: payload.guest.maxAllowedHeadcount },
    (_, i) => i + 1,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-24">
      {/* Invitation Card Hero */}
      <div className="bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/15 text-xs font-bold border border-white/20">
          <Heart className="w-4 h-4 fill-white" />
          <span>GAWAZ INN Digital Wedding Invitation</span>
        </div>
        <h1 data-testid="rsvp-guest-heading" className="text-2xl sm:text-4xl font-black">
          {language === 'ar'
            ? `أهلاً ${payload.guest.fullName}`
            : `Dear ${payload.guest.fullName}`}
        </h1>
        <p className="text-sm sm:text-base text-rose-100">
          {language === 'ar'
            ? `يتشرف ${payload.hostCoupleName} بدعوتكم لحضور حفل الزفاف المبارك`
            : `You are warmly invited by ${payload.hostCoupleName}`}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-2 text-rose-100">
          {payload.expectedWeddingDate && (
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              <span>{payload.expectedWeddingDate}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>
              {language === 'ar'
                ? `الحد الأقصى للمقاعد: ${payload.guest.maxAllowedHeadcount}`
                : `Seats Reserved: up to ${payload.guest.maxAllowedHeadcount}`}
            </span>
          </span>
        </div>
      </div>

      {submitBanner && (
        <div
          data-testid="rsvp-success-banner"
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs sm:text-sm font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{submitBanner}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* RSVP Response Form */}
      <form
        onSubmit={handleRsvpSubmit}
        data-testid="public-rsvp-form"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5 text-xs sm:text-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
            {language === 'ar' ? 'تأكيد الحضور واختيار الضيافة' : 'Confirm Attendance & Meal Choice'}
          </h2>
          <span
            data-testid="rsvp-current-status-badge"
            className={`px-3 py-1 rounded-full text-xs font-black ${
              payload.guest.rsvpStatus === 'confirmed'
                ? 'bg-emerald-50 text-emerald-700'
                : payload.guest.rsvpStatus === 'declined'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-800'
            }`}
          >
            {payload.guest.rsvpStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            data-testid="rsvp-choice-confirmed"
            onClick={() => setRsvpChoice('confirmed')}
            className={`p-4 rounded-2xl border-2 font-black flex items-center justify-center gap-2 transition cursor-pointer ${
              rsvpChoice === 'confirmed'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{language === 'ar' ? 'سأحضر بإذن الله' : 'Joyfully Attending'}</span>
          </button>
          <button
            type="button"
            data-testid="rsvp-choice-declined"
            onClick={() => setRsvpChoice('declined')}
            className={`p-4 rounded-2xl border-2 font-black flex items-center justify-center gap-2 transition cursor-pointer ${
              rsvpChoice === 'declined'
                ? 'border-rose-600 bg-rose-50 text-rose-800'
                : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}
          >
            <XCircle className="w-5 h-5" />
            <span>{language === 'ar' ? 'أعتذر عن الحضور' : 'Regretfully Unable'}</span>
          </button>
        </div>

        {rsvpChoice === 'confirmed' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1 block">
              <span className="font-bold text-gray-800 block">
                {language === 'ar' ? 'عدد الأفراد الحاضرين' : 'Attending Guests'}
              </span>
              <select
                data-testid="rsvp-attending-select"
                value={attendingCount}
                onChange={(e) => setAttendingCount(Number(e.target.value))}
                className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
              >
                {headcountOptions.map((n) => (
                  <option key={n} value={n}>
                    {n} {language === 'ar' ? 'أفراد' : 'guests'}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 block">
              <span className="font-bold text-gray-800 block">
                {language === 'ar' ? 'تفضيل الوجبة' : 'Meal Preference'}
              </span>
              <select
                data-testid="rsvp-meal-select"
                value={mealPref}
                onChange={(e) => setMealPref(e.target.value)}
                className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
              >
                {Object.keys(MEAL_PREFERENCE_META).map((m) => (
                  <option key={m} value={m}>
                    {language === 'ar'
                      ? MEAL_PREFERENCE_META[m].nameAr
                      : MEAL_PREFERENCE_META[m].nameEn}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <label className="space-y-1 block">
          <span className="font-bold text-gray-800 block">
            {language === 'ar' ? 'ملاحظات أو حساسية طعام (اختياري)' : 'Dietary or Greeting Notes'}
          </span>
          <input
            type="text"
            data-testid="rsvp-notes-input"
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            placeholder={language === 'ar' ? 'ألف مبروك! بدون ملاحظات غذائية...' : 'Warmest wishes!'}
            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
          />
        </label>

        <button
          type="submit"
          data-testid="rsvp-submit-btn"
          disabled={submitting}
          className="w-full bg-red-gradient text-white font-black py-3.5 rounded-xl shadow-md hover:opacity-95 cursor-pointer disabled:opacity-50"
        >
          {submitting
            ? '...'
            : language === 'ar'
              ? 'حفظ وإرسال التأكيد'
              : 'Send RSVP Response'}
        </button>
      </form>

      {/* Couple's Gift Registry */}
      {payload.giftRegistry.length > 0 && (
        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#D91B3E]/15 space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#D91B3E]" />
            <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
              {language === 'ar' ? 'قائمة هدايا العروسين (اختياري)' : 'Couple Gift Registry (Optional)'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {payload.giftRegistry.map((gift) => (
              <div
                key={gift.id}
                data-testid={`public-gift-card-${gift.id}`}
                className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-black text-sm text-[#2A1D20]">
                    {language === 'ar' ? gift.titleAr : gift.titleEn}
                  </p>
                  <p className="text-gray-500">{gift.categoryLabel}</p>
                  <p className="font-black text-[#D91B3E]">
                    {gift.targetPriceEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </p>
                </div>
                {gift.reservationStatus === 'available' ? (
                  <button
                    type="button"
                    data-testid={`reserve-gift-btn-${gift.id}`}
                    disabled={reservingGiftId === gift.id}
                    onClick={() => void handleReserveGift(gift.id)}
                    className="w-full bg-[#2A1D20] hover:bg-[#D91B3E] text-white font-black py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {reservingGiftId === gift.id
                      ? '...'
                      : language === 'ar'
                        ? 'حجز هذه الهدية باسمي'
                        : 'Reserve Gift'}
                  </button>
                ) : (
                  <span
                    data-testid={`reserved-gift-badge-${gift.id}`}
                    className="w-full text-center bg-amber-50 text-amber-800 border border-amber-200 font-bold py-2 rounded-xl"
                  >
                    {language === 'ar' ? 'تم الحجز من أحد الضيوف' : 'Already Reserved'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

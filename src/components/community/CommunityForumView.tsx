import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ModalFrame } from '../common/ModalFrame';
import {
  COMMUNITY_CATEGORY_META,
  COMMUNITY_REPORT_REASON_META,
} from '../../../shared/communityData';
import { MODERATION_ROLES, hasAnyRole } from '../../../shared/rbac';
import type { CommunityCategorySlug, CommunityReportReason } from '../../types';
import {
  MessageSquare,
  ThumbsUp,
  BadgeCheck,
  CheckCircle2,
  Flag,
  Plus,
  Search,
  Sparkles,
  Users,
  Send,
  ShieldCheck,
} from 'lucide-react';

export const CommunityForumView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    communityQuestions,
    createCommunityQuestion,
    postCommunityAnswer,
    toggleCommunityVote,
    markAnswerHelpful,
    submitCommunityReport,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'all' | CommunityCategorySlug>('all');
  const [sortMode, setSortMode] = useState<'latest' | 'top_votes'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAskForm, setShowAskForm] = useState(false);

  // Ask Form State
  const [askCategory, setAskCategory] = useState<CommunityCategorySlug>('finishing');
  const [askTitleAr, setAskTitleAr] = useState('');
  const [askBodyAr, setAskBodyAr] = useState('');
  const [askTagsRaw, setAskTagsRaw] = useState('');
  const [asking, setAsking] = useState(false);

  // Per-question answer drafts
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [postingAnswerFor, setPostingAnswerFor] = useState<string | null>(null);

  // Report Modal
  const [reportTarget, setReportTarget] = useState<{
    targetType: 'question' | 'answer';
    targetId: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState<CommunityReportReason>('misleading_price');
  const [reportDetails, setReportDetails] = useState('');

  const isModerator = hasAnyRole(currentUser?.role, MODERATION_ROLES);

  const visibleQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = communityQuestions.filter((item) => {
      if (categoryFilter !== 'all' && item.categorySlug !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.titleAr.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.bodyAr.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    if (sortMode === 'top_votes') {
      return [...list].sort((a, b) => b.upvotesCount - a.upvotesCount);
    }
    return list;
  }, [communityQuestions, categoryFilter, searchQuery, sortMode]);

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setAsking(true);
    try {
      const tags = askTagsRaw
        .split(/[,،]+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2)
        .slice(0, 6);
      await createCommunityQuestion({
        categorySlug: askCategory,
        titleAr: askTitleAr.trim(),
        bodyAr: askBodyAr.trim(),
        tags,
      });
      setAskTitleAr('');
      setAskBodyAr('');
      setAskTagsRaw('');
      setShowAskForm(false);
    } finally {
      setAsking(false);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const text = (answerDrafts[questionId] || '').trim();
    if (text.length < 8) return;
    setPostingAnswerFor(questionId);
    try {
      await postCommunityAnswer(questionId, text);
      setAnswerDrafts((prev) => ({ ...prev, [questionId]: '' }));
    } finally {
      setPostingAnswerFor(null);
    }
  };

  const handleVote = async (targetType: 'question' | 'answer', targetId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    await toggleCommunityVote(targetType, targetId);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;
    await submitCommunityReport({
      targetType: reportTarget.targetType,
      targetId: reportTarget.targetId,
      reason: reportReason,
      details: reportDetails.trim() || null,
    });
    setReportTarget(null);
    setReportDetails('');
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-12 lg:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Users className="w-4 h-4 text-white" />
              <span>
                {language === 'ar'
                  ? 'منتدى مجتمع جواز إن واستشارات الخبراء المعتمدين'
                  : 'GAWAZ INN Q&A Community & Verified Advisors'}
              </span>
            </div>
            <h1
              data-testid="community-heading"
              className="text-2xl sm:text-4xl font-black text-white leading-tight"
            >
              {language === 'ar'
                ? 'اسأل، شارك تجربتك، واستشر خبراء التشطيب والزواج'
                : 'Ask Questions, Share Real Experience & Get Expert Guidance'}
            </h1>
            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'تُمنح شارة "إجابة خبير معتمد" تلقائياً من الخادم للخبراء المفحوصة مستنداتهم إدارياً فقط، مع منظومة إبلاغ ومراجعة لحماية دقة المعلومات.'
                : 'Verified Expert badges are granted server-side exclusively to credential-audited advisors, backed by active moderation.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              data-testid="community-open-ask-btn"
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setShowAskForm((v) => !v);
                }
              }}
              className="bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'اطرح سؤالاً جديداً' : 'Ask a Question'}</span>
            </button>
            <Link
              to="/experts"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <BadgeCheck className="w-4 h-4" />
              <span>{language === 'ar' ? 'دليل الخبراء المعتمدين' : 'Verified Experts'}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Guest CTA prompt */}
        {!currentUser && (
          <div className="bg-[#FFF8F9] border border-[#D91B3E]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#2A1D20]">
              <ShieldCheck className="w-4 h-4 text-[#D91B3E] shrink-0" />
              <span>
                {language === 'ar'
                  ? 'يمكنك تصفح الأسئلة وإجابات الخبراء مجاناً. سجل الدخول لطرح سؤال أو إضافة إجابة أو تصويت.'
                  : 'Browse community threads freely. Sign in to ask a question, reply, upvote, or report.'}
              </span>
            </div>
            <button
              type="button"
              data-testid="community-signin-btn"
              onClick={() => setAuthModalOpen(true)}
              className="bg-red-gradient text-white font-bold px-4 py-2 rounded-xl shadow-sm shrink-0 cursor-pointer"
            >
              {language === 'ar' ? 'تسجيل الدخول للمشاركة' : 'Sign In to Participate'}
            </button>
          </div>
        )}

        {/* Ask Question Form */}
        {showAskForm && currentUser && (
          <form
            onSubmit={handleAskSubmit}
            data-testid="community-ask-form"
            className="bg-[#FAF7F2] rounded-3xl p-5 sm:p-6 border border-[#D91B3E]/20 shadow-sm space-y-4 text-xs"
          >
            <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
              {language === 'ar' ? 'طرح سؤال جديد في مجتمع جواز إن' : 'Post a New Question'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'القسم *' : 'Category *'}
                </span>
                <select
                  data-testid="community-ask-category"
                  value={askCategory}
                  onChange={(e) => setAskCategory(e.target.value as CommunityCategorySlug)}
                  className="w-full max-w-full min-w-0 truncate p-2.5 rounded-xl border border-gray-300 bg-white font-bold outline-none focus:border-[#D91B3E]"
                >
                  {(Object.keys(COMMUNITY_CATEGORY_META) as CommunityCategorySlug[]).map((slug) => (
                    <option key={slug} value={slug}>
                      {language === 'ar'
                        ? COMMUNITY_CATEGORY_META[slug].ar
                        : COMMUNITY_CATEGORY_META[slug].en}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-gray-800 block">
                  {language === 'ar' ? 'الوسوم (مفصولة بفاصلة - اختياري)' : 'Tags (comma separated)'}
                </span>
                <input
                  type="text"
                  data-testid="community-ask-tags"
                  value={askTagsRaw}
                  onChange={(e) => setAskTagsRaw(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: بورسلين، سيراميك، أسعار' : 'porcelain, budget'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
                />
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="font-bold text-gray-800 block">
                {language === 'ar' ? 'عنوان السؤال (6 أحرف على الأقل) *' : 'Question Title (min 6 chars) *'}
              </span>
              <input
                type="text"
                required
                minLength={6}
                data-testid="community-ask-title"
                value={askTitleAr}
                onChange={(e) => setAskTitleAr(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب عنواناً واضحاً لسؤالك...' : 'Clear question summary'}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
              />
            </label>

            <label className="space-y-1 block">
              <span className="font-bold text-gray-800 block">
                {language === 'ar' ? 'تفاصيل السؤال (12 حرفاً على الأقل) *' : 'Question Details (min 12 chars) *'}
              </span>
              <textarea
                rows={3}
                required
                minLength={12}
                data-testid="community-ask-body"
                value={askBodyAr}
                onChange={(e) => setAskBodyAr(e.target.value)}
                placeholder={language === 'ar' ? 'اذكر المساحة أو الميزانية أو المشكلة بالتفصيل...' : 'Share context & budget numbers'}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#D91B3E]"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAskForm(false)}
                className="px-4 py-2 rounded-xl border bg-white text-gray-600 font-bold cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={asking}
                data-testid="community-ask-submit"
                className="px-5 py-2.5 rounded-xl bg-red-gradient text-white font-bold shadow-md disabled:opacity-60 cursor-pointer"
              >
                {asking
                  ? language === 'ar'
                    ? 'جاري النشر...'
                    : 'Posting...'
                  : language === 'ar'
                    ? 'نشر السؤال'
                    : 'Publish Question'}
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-5 border border-[#D91B3E]/15 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
              <input
                type="text"
                data-testid="community-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'ابحث في الأسئلة والاستشارات والوسوم...'
                    : 'Search questions, tags, topics...'
                }
                className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
              />
            </div>

            <select
              data-testid="community-sort-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as 'latest' | 'top_votes')}
              className="w-full sm:w-auto max-w-full min-w-0 truncate px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#D91B3E]"
            >
              <option value="latest">{language === 'ar' ? 'الأحدث أولاً' : 'Latest Threads'}</option>
              <option value="top_votes">{language === 'ar' ? 'الأعلى تصويتاً' : 'Most Helpful / Upvoted'}</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-[#D91B3E] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            {(Object.keys(COMMUNITY_CATEGORY_META) as CommunityCategorySlug[]).map((slug) => (
              <button
                key={slug}
                type="button"
                data-testid={`community-cat-pill-${slug}`}
                onClick={() => setCategoryFilter(slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  categoryFilter === slug
                    ? 'bg-[#D91B3E] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D91B3E]/40'
                }`}
              >
                {language === 'ar'
                  ? COMMUNITY_CATEGORY_META[slug].ar
                  : COMMUNITY_CATEGORY_META[slug].en}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        {visibleQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-rose-100 space-y-2">
            <MessageSquare className="w-8 h-8 text-[#D91B3E] mx-auto" />
            <p className="text-sm font-bold text-gray-800">
              {language === 'ar'
                ? 'لا توجد أسئلة تطابق البحث الحالي.'
                : 'No questions match the current filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleQuestions.map((q) => {
              const catMeta = COMMUNITY_CATEGORY_META[q.categorySlug];
              const canMarkHelpful = Boolean(
                currentUser && (currentUser.id === q.userId || isModerator),
              );

              return (
                <article
                  key={q.id}
                  data-testid={`community-question-${q.id}`}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm space-y-5"
                >
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FDE8ED] text-[#B31331] font-bold">
                          {language === 'ar' ? catMeta.ar : catMeta.en}
                        </span>
                        {q.isResolved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'مُجاب ومُعتمد' : 'Resolved'}</span>
                          </span>
                        )}
                        <span className="text-gray-500 font-medium">
                          {q.authorName}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-black text-[#2A1D20]">
                        {language === 'ar' ? q.titleAr : q.titleEn}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {language === 'ar' ? q.bodyAr : q.bodyEn}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        data-testid={`vote-btn-question-${q.id}`}
                        onClick={() => void handleVote('question', q.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                          q.viewerUpvoted
                            ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                            : 'bg-[#FAF7F2] text-gray-800 border-gray-200 hover:border-[#D91B3E]/40'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{q.upvotesCount}</span>
                      </button>

                      <button
                        type="button"
                        data-testid={`report-btn-question-${q.id}`}
                        onClick={() => {
                          if (!currentUser) {
                            setAuthModalOpen(true);
                            return;
                          }
                          setReportTarget({ targetType: 'question', targetId: q.id });
                        }}
                        className="p-2 rounded-xl text-gray-500 hover:text-[#D91B3E] hover:bg-rose-50 border border-gray-200 transition cursor-pointer"
                        title={language === 'ar' ? 'إبلاغ عن مخالفة' : 'Report question'}
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Answers Section */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="text-xs font-black text-[#B31331] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {language === 'ar'
                          ? `الإجابات والمناقشات (${(q.answers || []).length})`
                          : `Answers & Discussion (${(q.answers || []).length})`}
                      </span>
                    </div>

                    {(q.answers || []).map((ans) => (
                      <div
                        key={ans.id}
                        data-testid={`community-answer-${ans.id}`}
                        className={`p-4 rounded-2xl border space-y-2 ${
                          ans.isExpertAnswer
                            ? 'bg-[#FFF8F9] border-[#D91B3E]/30'
                            : 'bg-[#FAF7F2] border-gray-200/80'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <strong className="font-black text-gray-900">{ans.authorName}</strong>
                            {ans.isExpertAnswer && (
                              <span
                                data-testid={`expert-answer-badge-${ans.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D91B3E] text-white text-[10px] font-bold shadow-xs"
                              >
                                <BadgeCheck className="w-3 h-3" />
                                <span>
                                  {language === 'ar'
                                    ? 'إجابة خبير معتمد'
                                    : 'Verified Expert Answer'}
                                </span>
                              </span>
                            )}
                            {ans.isExpertAnswer && (ans.authorExpertTitleAr || ans.authorExpertTitleEn) && (
                              <span className="text-[11px] text-[#B31331] font-semibold">
                                {language === 'ar'
                                  ? ans.authorExpertTitleAr
                                  : ans.authorExpertTitleEn}
                              </span>
                            )}
                            {ans.isHelpfulMarked && (
                              <span
                                data-testid={`helpful-badge-${ans.id}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{language === 'ar' ? 'أفضل إجابة مفيدة' : 'Helpful'}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {canMarkHelpful && !ans.isHelpfulMarked && (
                              <button
                                type="button"
                                data-testid={`mark-helpful-btn-${ans.id}`}
                                onClick={() => void markAnswerHelpful(q.id, ans.id)}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold transition cursor-pointer"
                              >
                                {language === 'ar' ? 'تمييز كمفيدة' : 'Mark Helpful'}
                              </button>
                            )}
                            <button
                              type="button"
                              data-testid={`vote-btn-answer-${ans.id}`}
                              onClick={() => void handleVote('answer', ans.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                ans.viewerUpvoted
                                  ? 'bg-[#D91B3E] text-white border-[#D91B3E]'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#D91B3E]/40'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{ans.upvotesCount}</span>
                            </button>
                            <button
                              type="button"
                              data-testid={`report-btn-answer-${ans.id}`}
                              onClick={() => {
                                if (!currentUser) {
                                  setAuthModalOpen(true);
                                  return;
                                }
                                setReportTarget({ targetType: 'answer', targetId: ans.id });
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#D91B3E] hover:bg-white transition cursor-pointer"
                              title={language === 'ar' ? 'إبلاغ عن الإجابة' : 'Report answer'}
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                          {language === 'ar' ? ans.bodyAr : ans.bodyEn}
                        </p>
                      </div>
                    ))}

                    {/* Add Answer Form */}
                    {currentUser && (
                      <form
                        onSubmit={(e) => void handlePostAnswer(e, q.id)}
                        data-testid={`answer-form-${q.id}`}
                        className="flex flex-col sm:flex-row gap-2 pt-2"
                      >
                        <input
                          type="text"
                          required
                          minLength={8}
                          data-testid={`answer-input-${q.id}`}
                          value={answerDrafts[q.id] || ''}
                          onChange={(e) =>
                            setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder={
                            language === 'ar'
                              ? 'أضف إجابة عملية بناءً على خبرتك (8 أحرف على الأقل)...'
                              : 'Share a helpful answer (min 8 chars)...'
                          }
                          className="flex-1 min-w-0 p-2.5 rounded-xl bg-[#FAF7F2] border border-gray-200 text-xs outline-none focus:border-[#D91B3E]"
                        />
                        <button
                          type="submit"
                          disabled={postingAnswerFor === q.id}
                          data-testid={`answer-submit-${q.id}`}
                          className="px-4 py-2.5 rounded-xl bg-[#1C1819] hover:bg-[#D91B3E] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إرسال الإجابة' : 'Post Answer'}</span>
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ModalFrame
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        titleId="community-report-modal-title"
      >
        <form onSubmit={handleSubmitReport} data-testid="community-report-modal" className="space-y-4">
          <h3 id="community-report-modal-title" className="text-base font-black text-gray-900">
            {language === 'ar' ? 'إبلاغ فريق الإشراف' : 'Report Community Content'}
          </h3>
          <label className="space-y-1 block text-xs">
            <span className="font-bold text-gray-700 block">
              {language === 'ar' ? 'تصنيف البلاغ:' : 'Report Reason:'}
            </span>
            <select
              data-testid="report-reason-select"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as CommunityReportReason)}
              className="w-full max-w-full min-w-0 p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
            >
              {(Object.keys(COMMUNITY_REPORT_REASON_META) as CommunityReportReason[]).map((k) => (
                <option key={k} value={k}>
                  {language === 'ar'
                    ? COMMUNITY_REPORT_REASON_META[k].ar
                    : COMMUNITY_REPORT_REASON_META[k].en}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 block text-xs">
            <span className="font-bold text-gray-700 block">
              {language === 'ar' ? 'تفاصيل البلاغ للمراجع:' : 'Notes for moderator:'}
            </span>
            <textarea
              rows={2}
              data-testid="report-details-input"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder={
                language === 'ar' ? 'اذكر سبب الاعتراض أو المخالفة...' : 'Describe the issue...'
              }
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReportTarget(null)}
              className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600 cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              data-testid="report-submit-btn"
              className="px-5 py-2 rounded-xl bg-red-gradient text-white text-xs font-bold cursor-pointer"
            >
              {language === 'ar' ? 'إرسال للإشراف' : 'Submit to Moderation'}
            </button>
          </div>
        </form>
      </ModalFrame>
    </div>
  );
};


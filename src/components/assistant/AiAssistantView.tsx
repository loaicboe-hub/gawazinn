import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AI_STARTER_PROMPTS } from '../../../shared/stage10Data';
import type { AiAssistantReplyPayload, AiChatMessage } from '../../types';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Calculator,
  ExternalLink,
  User as UserIcon,
  MessageSquare,
  Info,
} from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const {
    language,
    currentUser,
    setAuthModalOpen,
    aiConversations,
    askAiAssistant,
  } = useApp();

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [lastMeta, setLastMeta] = useState<{
    providerMode: AiAssistantReplyPayload['providerMode'];
    groundedFactsCount: number;
    usedPersonalContext: boolean;
    disclaimerAr: string;
    disclaimerEn: string;
  } | null>(null);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAsk = async (textToSend?: string) => {
    const query = (textToSend ?? inputQuery).trim();
    if (query.length < 2 || sending) return;
    setSending(true);
    setErrorMsg(null);
    if (!textToSend) setInputQuery('');

    try {
      const payload = await askAiAssistant(query, activeConversationId);
      setActiveConversationId(payload.conversationId);
      setMessages((prev) => [...prev, payload.userMessage, payload.assistantMessage]);
      setLastMeta({
        providerMode: payload.providerMode,
        groundedFactsCount: payload.groundedFactsCount,
        usedPersonalContext: payload.usedPersonalContext,
        disclaimerAr: payload.disclaimerAr,
        disclaimerEn: payload.disclaimerEn,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to reach AI advisor');
    } finally {
      setSending(false);
    }
  };

  const loadConversation = (convId: string) => {
    const found = aiConversations.find((c) => c.id === convId);
    if (!found) return;
    setActiveConversationId(found.id);
    setMessages(found.messages);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#800C22] via-[#9E122C] to-[#590717] text-white py-10 lg:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold border border-white/20 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span data-testid="ai-grounding-badge">
                {language === 'ar'
                  ? 'مساعد جواز إن الموثق — يقرأ مباشرة من قاعدة البيانات والحاسبات الحية (بدون هلوسة)'
                  : 'GAWAZ INN Grounded AI Advisor — Live Database & Calculators Only'}
              </span>
            </div>
            <h1
              data-testid="ai-assistant-heading"
              className="text-2xl sm:text-4xl font-black text-white leading-tight"
            >
              {language === 'ar'
                ? 'مستشارك الذكي لتجهيز الشقة والزفاف والميزانية'
                : 'Grounded Marriage, Home Finishing & Budget AI Assistant'}
            </h1>
            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              {language === 'ar'
                ? 'اسأل عن تكلفة التشطيب بالمساحة، ترشيح أجهزة كهربائية بميزانية محددة، شركاء محافظتك، أو تحليل ميزانيتك المسجلة مع استشهادات مباشرة.'
                : 'Ask for exact finishing estimates by m², catalog products under an EGP cap, verified local vendors, or your private budget summary with clickable sources.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/room-designer"
              className="bg-white text-[#B31331] hover:bg-[#FDE8ED] font-black text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'ar' ? 'استوديو تصميم الغرف' : 'Room Moodboard Studio'}</span>
            </Link>
            <Link
              to="/calculators"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>{language === 'ar' ? '20 حاسبة ذكية' : '20 Calculators'}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Starters + History */}
        <aside className="lg:col-span-4 space-y-5 min-w-0">
          <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#D91B3E]/15 space-y-3">
            <h2 className="text-sm font-black text-[#2A1D20] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D91B3E]" />
              <span>{language === 'ar' ? 'أمثلة أسئلة جاهزة' : 'Grounded Starter Prompts'}</span>
            </h2>
            <div className="space-y-2">
              {AI_STARTER_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-testid={`ai-starter-${p.id}`}
                  onClick={() => void handleAsk(language === 'ar' ? p.queryAr : p.queryEn)}
                  className="w-full text-start p-3 rounded-2xl bg-white hover:bg-[#FDE8ED] border border-gray-200 hover:border-[#D91B3E]/40 text-xs font-bold text-[#2A1D20] transition cursor-pointer"
                >
                  {language === 'ar' ? p.labelAr : p.labelEn}
                </button>
              ))}
            </div>
          </div>

          {!currentUser ? (
            <div className="bg-white rounded-3xl p-5 border border-gray-200 space-y-3 text-xs">
              <p className="font-bold text-gray-700 leading-relaxed">
                {language === 'ar'
                  ? 'يمكنك تجربة المساعد كزائر فوراً. سجل الدخول لحفظ سجل المحادثات وتحليل ميزانيتك ومدخراتك الخاصة بأمان.'
                  : 'Ask questions right away as a guest. Sign in to persist conversations and inspect your private budget ledger.'}
              </p>
              <button
                type="button"
                data-testid="ai-signin-btn"
                onClick={() => setAuthModalOpen(true)}
                className="w-full bg-red-gradient text-white font-black py-2.5 rounded-xl shadow-sm cursor-pointer"
              >
                {language === 'ar' ? 'تسجيل الدخول للتحليل الشخصي' : 'Sign In for Personal Context'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-black text-[#2A1D20] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#D91B3E]" />
                  <span>{language === 'ar' ? 'محادثاتي السابقة' : 'Saved Conversations'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveConversationId(undefined);
                    setMessages([]);
                  }}
                  className="text-[11px] font-bold text-[#D91B3E] hover:underline cursor-pointer"
                >
                  {language === 'ar' ? 'محادثة جديدة' : 'New Chat'}
                </button>
              </div>
              {aiConversations.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'لا توجد محادثات محفوظة بعد.' : 'No saved chats yet.'}
                </p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {aiConversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => loadConversation(c.id)}
                      className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer truncate ${
                        activeConversationId === c.id
                          ? 'bg-[#FDE8ED] border-[#D91B3E] text-[#B31331]'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {c.sessionTitle}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Main Chat Area */}
        <section className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col min-h-[520px] min-w-0">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-[#FAF7F2]/60 rounded-t-3xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-red-gradient text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[#2A1D20]">
                  {language === 'ar' ? 'مستشار جواز إن الذكي' : 'GAWAZ INN Grounded Advisor'}
                </p>
                <p className="text-[11px] text-gray-600 font-medium">
                  {lastMeta
                    ? language === 'ar'
                      ? `مستند إلى ${lastMeta.groundedFactsCount} مرجع حي من قاعدة البيانات`
                      : `Grounded in ${lastMeta.groundedFactsCount} live database records`
                    : language === 'ar'
                      ? 'متصل بالكتالوج + دليل الشركاء + 20 حاسبة ذكية'
                      : 'Connected to Live Catalog, Vendors & 20 Calculators'}
                </p>
              </div>
            </div>
            {lastMeta?.usedPersonalContext && (
              <span
                data-testid="ai-personal-context-badge"
                className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
              >
                {language === 'ar' ? 'متصل بحسابك الخاص' : 'Private Account Context'}
              </span>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[540px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                <Bot className="w-10 h-10 text-[#D91B3E]/60" />
                <h3 className="text-base font-black text-[#2A1D20]">
                  {language === 'ar'
                    ? 'اطلب أي حساب تكلفة، مقارنة منتج، أو نصيحة تشطيب وفرح'
                    : 'Ask About Finishing Costs, Catalog Appliances, Vendors or Your Budget'}
                </h3>
                <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                  {language === 'ar'
                    ? 'كل رقم يظهر لك هنا محسوب فعلياً أو مسحوب من أسعار المنتجات المسجلة دون أي تخمين.'
                    : 'Every price and figure is pulled directly from verified GAWAZ INN catalog tables and deterministic formulas.'}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  data-testid={`ai-message-${msg.role}`}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#D91B3E] text-white shadow-sm'
                        : 'bg-[#FAF7F2] text-[#2A1D20] border border-[#D91B3E]/15'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold opacity-80">
                      {msg.role === 'user' ? (
                        <UserIcon className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-[#D91B3E]" />
                      )}
                      <span>
                        {msg.role === 'user'
                          ? currentUser?.name || (language === 'ar' ? 'أنت' : 'You')
                          : language === 'ar'
                            ? 'مساعد جواز إن الموثق'
                            : 'GAWAZ INN Advisor'}
                      </span>
                    </div>

                    <div className="whitespace-pre-line leading-relaxed font-medium">
                      {language === 'ar' ? msg.contentAr : msg.contentEn}
                    </div>

                    {/* Embedded Live Calculator Cards */}
                    {msg.calculations.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {msg.calculations.map((calc) => (
                          <Link
                            key={calc.calculatorSlug}
                            to={`/calculators/${calc.calculatorSlug}`}
                            data-testid={`ai-calc-card-${calc.calculatorSlug}`}
                            className="bg-white rounded-2xl p-3 border border-[#D91B3E]/20 hover:border-[#D91B3E] transition block"
                          >
                            <p className="text-[11px] font-bold text-[#B31331]">
                              {language === 'ar' ? calc.nameAr : calc.nameEn}
                            </p>
                            <p className="text-base font-black text-[#2A1D20] mt-1">
                              {calc.primaryValue.toLocaleString()}{' '}
                              <span className="text-xs font-bold text-gray-600">{calc.unit}</span>
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Clickable Grounded Citations */}
                    {msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-gray-200/70 space-y-1.5">
                        <p className="text-[11px] font-black text-gray-600">
                          {language === 'ar' ? 'مصادر وروابط مباشرة من المنصة:' : 'Live Platform Sources:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cit) => (
                            <Link
                              key={`${cit.kind}-${cit.id}`}
                              to={cit.route}
                              data-testid={`ai-citation-${cit.kind}-${cit.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FDE8ED] border border-gray-200 hover:border-[#D91B3E]/40 text-[11px] font-bold text-[#2A1D20] transition"
                            >
                              <span>{language === 'ar' ? cit.labelAr : cit.labelEn}</span>
                              {cit.priceEgp ? (
                                <span className="text-[#D91B3E]">
                                  ({cit.priceEgp.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'})
                                </span>
                              ) : null}
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {errorMsg && (
            <div className="mx-4 mb-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-2 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {lastMeta && (
            <div className="mx-4 mb-2 flex items-start gap-2 text-[11px] text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <Info className="w-3.5 h-3.5 text-[#D91B3E] shrink-0 mt-0.5" />
              <span>{language === 'ar' ? lastMeta.disclaimerAr : lastMeta.disclaimerEn}</span>
            </div>
          )}

          {/* Input Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleAsk();
            }}
            className="p-4 border-t border-gray-100 flex items-center gap-2.5"
          >
            <input
              type="text"
              data-testid="ai-query-input"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب سؤالك هنا (مثال: احسب تشطيب 140 متر أو ثلاجة تحت 38000 ج.م)...'
                  : 'Ask e.g. finishing cost 140m² or catalog fridge under 38000 EGP...'
              }
              className="flex-1 min-w-0 px-4 py-3 rounded-2xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#D91B3E] outline-none text-xs sm:text-sm font-bold"
            />
            <button
              type="submit"
              data-testid="ai-send-btn"
              disabled={sending || inputQuery.trim().length < 2}
              className="bg-red-gradient text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md hover:opacity-95 disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? (language === 'ar' ? 'جاري البحث...' : 'Thinking...') : language === 'ar' ? 'إرسال' : 'Send'}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};


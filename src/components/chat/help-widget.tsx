'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Msg = { role: 'user' | 'bot'; text: string; typing?: boolean };

const GREETING_RU = 'Привет! 👋 Я Генри, оператор поддержки Vibeneura. Чем могу помочь?';
const GREETING_EN = 'Hi! 👋 I\'m Henry from Vibeneura support. How can I help you?';

const QUICK_QUESTIONS_RU = [
  'Какие модели доступны?',
  'Сколько стоит?',
  'Как решить задачу по фото?',
  'Нужен ли VPN?',
  'Как начать пользоваться?',
];

const QUICK_QUESTIONS_EN = [
  'What models are available?',
  'How much does it cost?',
  'How to solve tasks from photos?',
  'Do I need a VPN?',
  'How to get started?',
];

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const greetedRef = useRef(false);

  const isRu = typeof navigator !== 'undefined' && /ru/i.test(navigator.language);
  const quickQuestions = isRu ? QUICK_QUESTIONS_RU : QUICK_QUESTIONS_EN;

  useEffect(() => {
    if (open && !greetedRef.current) {
      greetedRef.current = true;
      setTimeout(() => {
        setMessages([{ role: 'bot', text: isRu ? GREETING_RU : GREETING_EN }]);
      }, 500);
    }
  }, [open, isRu]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
  };

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Msg = { role: 'user', text: msg };
    const botPlaceholder: Msg = { role: 'bot', text: '', typing: true };

    setMessages((prev) => [...prev, userMsg, botPlaceholder]);
    setLoading(true);
    scrollToBottom();

    const history = [...messages, userMsg].filter((m) => !m.typing).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      text: m.text,
    }));

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch('/api/help-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'bot', text: data.text || 'Извините, попробуйте ещё раз 🙏' };
          return updated;
        });
        setLoading(false);
        scrollToBottom();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';

        for (const p of parts) {
          const line = p.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.delta) {
              fullText += ev.delta;
              const captured = fullText;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'bot', text: captured, typing: true };
                return updated;
              });
              scrollToBottom();
            }
          } catch {}
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'bot', text: fullText || 'Напишите нам: vibeneura@internet.ru 😊' };
        return updated;
      });
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'bot', text: 'Ой, что-то пошло не так. Попробуйте ещё раз!' };
          return updated;
        });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
      scrollToBottom();
    }
  }, [input, loading, messages]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-4 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d1515]/95 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#00fbfb]/10 to-[#568dff]/10 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00fbfb] to-[#568dff] text-xs font-bold text-[#000510]">
                    Г
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d1515] bg-green-400" />
                </div>
                <div>
                  <span className="font-display text-sm font-semibold text-white">Генри</span>
                  <p className="text-[10px] text-green-400/90">онлайн</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#839493] hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.length <= 1 && !loading && (
                <div className="flex flex-col gap-2 px-1 pt-1">
                  <p className="text-[10px] text-[#839493] text-center mb-1">
                    {isRu ? 'Часто спрашивают:' : 'Quick questions:'}
                  </p>
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="w-full text-left rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-[#b9cac9] transition-all hover:border-[#00fbfb]/20 hover:bg-[#00fbfb]/5 hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-[#00fbfb]/15 text-[#dbe4e3]'
                      : 'bg-white/[0.04] text-[#b9cac9] border border-white/[0.06]'
                  }`}>
                    {m.typing && !m.text ? (
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00fbfb]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00fbfb]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00fbfb]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    ) : m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 border-t border-white/[0.06] px-3 py-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRu ? 'Напишите сообщение...' : 'Type a message...'}
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-[#dbe4e3] placeholder-[#839493]/60 outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="text-[#00fbfb] hover:text-[#00fbfb]/80 transition-colors disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00fbfb] to-[#568dff] text-[#000510] shadow-[0_0_24px_-4px_rgba(0,251,251,0.5)] transition-all hover:shadow-[0_0_32px_-4px_rgba(0,251,251,0.7)] hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}

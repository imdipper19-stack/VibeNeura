'use client';

import { useState, useRef, useCallback } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Msg = { role: 'user' | 'bot'; text: string };

const FAQ: Record<string, string> = {
  'модели': 'Мы поддерживаем GPT-4o, Claude, Gemini, DeepSeek и другие модели. Выбирайте нужную в селекторе над чатом.',
  'models': 'We support GPT-4o, Claude, Gemini, DeepSeek and more. Pick one in the selector above the chat.',
  'токены': 'Токены — внутренняя валюта. Бесплатно даётся 10 000 токенов. Пополнить можно на странице Billing.',
  'tokens': 'Tokens are our internal currency. You get 10,000 free. Top up on the Billing page.',
  'pro': 'PRO Pass даёт безлимитные запросы к топовым моделям, приоритет и эксклюзивные функции.',
  'vpn': 'VPN не нужен! Все модели доступны без ограничений из любой страны.',
  'фото': 'Отправьте фото задачи через кнопку 📎 в чате — ИИ распознает текст и решит задачу.',
  'photo': 'Send a photo of your task via the 📎 button — AI will recognize text and solve it.',
  'почта': 'Свяжитесь с нами: vibeneura@internet.ru',
  'email': 'Contact us: vibeneura@internet.ru',
  'contact': 'Contact us: vibeneura@internet.ru',
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(FAQ)) {
    if (lower.includes(key)) return val;
  }
  const isRu = /[а-яё]/i.test(input);
  return isRu
    ? 'Не нашёл ответ на ваш вопрос. Напишите нам на vibeneura@internet.ru или попробуйте спросить иначе.'
    : "I couldn't find an answer. Email us at vibeneura@internet.ru or try rephrasing.";
}

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { role: 'user', text };
    const botMsg: Msg = { role: 'bot', text: findAnswer(text) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }, [input]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-4 z-50 flex h-[420px] w-[340px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d1515]/95 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-[#00fbfb]/10 to-[#568dff]/10 px-4 py-3 border-b border-white/[0.06]">
              <span className="font-display text-sm font-semibold text-white">vibeneura help</span>
              <button onClick={() => setOpen(false)} className="text-[#839493] hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center text-xs text-[#839493] px-4">
                  Задайте вопрос о сайте, моделях, токенах или PRO подписке
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#00fbfb]/15 text-[#dbe4e3]'
                      : 'bg-white/[0.04] text-[#b9cac9] border border-white/[0.06]'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 border-t border-white/[0.06] px-3 py-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ваш вопрос..."
                className="flex-1 bg-transparent text-xs text-[#dbe4e3] placeholder-[#839493]/60 outline-none"
              />
              <button type="submit" className="text-[#00fbfb] hover:text-[#00fbfb]/80 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00fbfb] to-[#568dff] text-[#000510] shadow-[0_0_24px_-4px_rgba(0,251,251,0.5)] transition-all hover:shadow-[0_0_32px_-4px_rgba(0,251,251,0.7)] hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}

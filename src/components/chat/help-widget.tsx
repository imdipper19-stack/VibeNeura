'use client';

import { useState, useRef, useCallback } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Msg = { role: 'user' | 'bot'; text: string };

type FaqEntry = { keywords: string[]; ru: string; en: string };

const FAQ: FaqEntry[] = [
  // Models
  {
    keywords: ['модел', 'model', 'gpt', 'claude', 'gemini', 'deepseek', 'llama', 'какие модели', 'what models'],
    ru: 'Мы поддерживаем GPT-4o, Claude 3.5/4, Gemini 2.0, DeepSeek v3, Llama 3 и другие. Выбирайте нужную модель в селекторе над чатом.',
    en: 'We support GPT-4o, Claude 3.5/4, Gemini 2.0, DeepSeek v3, Llama 3 and more. Pick one in the selector above the chat.',
  },
  // Tokens & pricing
  {
    keywords: ['токен', 'token', 'баланс', 'balance', 'сколько стоит', 'цена', 'price', 'pricing', 'cost'],
    ru: 'Токены — внутренняя валюта. При регистрации вы получаете 10 000 бесплатных токенов. Количество расходуемых токенов зависит от модели и длины ответа. Пополнить баланс можно на странице Billing.',
    en: 'Tokens are our internal currency. You get 10,000 free tokens on signup. Usage depends on model and response length. Top up on the Billing page.',
  },
  // Free tokens
  {
    keywords: ['бесплатн', 'free', 'халяв', 'без оплаты', 'пробн'],
    ru: 'При регистрации вы получаете 10 000 бесплатных токенов. Этого хватает на ~30-50 сообщений в зависимости от модели. Для продолжения можно пополнить баланс или оформить PRO Pass.',
    en: 'You get 10,000 free tokens on signup (~30-50 messages depending on model). Top up or get PRO Pass to continue.',
  },
  // PRO Pass
  {
    keywords: ['pro', 'про', 'подписк', 'subscription', 'premium', 'безлимит', 'unlimited', 'pass'],
    ru: 'PRO Pass даёт безлимитные запросы к топовым моделям (GPT-4o, Claude, Gemini), приоритетную очередь и эксклюзивные функции. Подробности на странице Billing.',
    en: 'PRO Pass gives unlimited access to top models (GPT-4o, Claude, Gemini), priority queue and exclusive features. Details on the Billing page.',
  },
  // VPN
  {
    keywords: ['vpn', 'впн', 'блокир', 'block', 'запрещ', 'доступ', 'access', 'страна', 'country', 'россия', 'russia', 'ограничен'],
    ru: 'VPN не нужен! Все модели (включая ChatGPT, Claude, Gemini) доступны без ограничений из любой страны. Мы используем прокси-серверы, чтобы обеспечить доступ отовсюду.',
    en: 'No VPN needed! All models (including ChatGPT, Claude, Gemini) are available from any country without restrictions.',
  },
  // Photo / image / vision
  {
    keywords: ['фото', 'photo', 'изображ', 'image', 'картинк', 'picture', 'скрин', 'screenshot', 'камер', 'camera', 'скан', 'scan', 'распозна', 'ocr'],
    ru: 'Отправьте фото задачи через кнопку 📎 в чате — ИИ распознает текст, формулы и изображения, определит тип задачи и решит её пошагово. Работает с моделями, поддерживающими Vision (GPT-4o, Claude, Gemini).',
    en: 'Send a photo via the 📎 button — AI will recognize text, formulas and images, then solve it step by step. Works with Vision models (GPT-4o, Claude, Gemini).',
  },
  // Homework / tasks / study
  {
    keywords: ['домашн', 'homework', 'задач', 'task', 'решить', 'solve', 'учёб', 'study', 'учеб', 'экзамен', 'exam', 'егэ', 'ege', 'контрольн', 'test'],
    ru: 'Отправьте текст или фото задачи — ИИ решит её пошагово с объяснениями. Поддерживаются математика, физика, химия, программирование и другие предметы. Для фото задач используйте кнопку 📎.',
    en: 'Send text or a photo of your task — AI will solve it step by step with explanations. Math, physics, chemistry, programming and more. Use the 📎 button for photos.',
  },
  // Code / programming
  {
    keywords: ['код', 'code', 'програм', 'program', 'python', 'javascript', 'java', 'c++', 'разработ', 'develop', 'баг', 'bug', 'ошибк', 'error', 'debug'],
    ru: 'ИИ может писать, исправлять и объяснять код на любом языке. Просто напишите задачу или вставьте код для анализа. Claude и GPT-4o особенно хорошо справляются с программированием.',
    en: 'AI can write, fix and explain code in any language. Just describe the task or paste code for analysis. Claude and GPT-4o are especially good at programming.',
  },
  // Translation
  {
    keywords: ['перевод', 'translat', 'перевести', 'язык', 'language', 'английск', 'english', 'русск', 'russian'],
    ru: 'ИИ переводит тексты на любой язык с высоким качеством. Просто напишите «переведи на [язык]» и вставьте текст.',
    en: 'AI translates text to any language with high quality. Just write "translate to [language]" and paste the text.',
  },
  // Writing / essays
  {
    keywords: ['эссе', 'essay', 'сочинен', 'текст', 'text', 'стать', 'article', 'писать', 'write', 'реферат', 'курсов', 'диплом'],
    ru: 'ИИ поможет написать эссе, статью, реферат или любой другой текст. Укажите тему, стиль и объём — получите готовый результат, который можно доработать.',
    en: 'AI can write essays, articles, reports and any other text. Specify topic, style and length — get a ready result you can refine.',
  },
  // Web search
  {
    keywords: ['поиск', 'search', 'интернет', 'internet', 'web', 'актуальн', 'current', 'свежи', 'news', 'новост'],
    ru: 'Включите веб-поиск кнопкой 🔍 в чате — ИИ найдёт актуальную информацию в интернете и даст ответ со ссылками на источники.',
    en: 'Enable web search with the 🔍 button — AI will find current info online and provide answers with source links.',
  },
  // Registration / login / account
  {
    keywords: ['регистрац', 'register', 'signup', 'sign up', 'вход', 'login', 'log in', 'аккаунт', 'account', 'войти', 'google', 'авториз'],
    ru: 'Войдите через Google — это быстро и безопасно. Никаких паролей и подтверждений по email. Ваши чаты и баланс сохраняются в аккаунте.',
    en: 'Sign in with Google — fast and secure. No passwords or email confirmations. Your chats and balance are saved in your account.',
  },
  // Payment / billing / пополнить
  {
    keywords: ['оплат', 'pay', 'пополн', 'top up', 'billing', 'карт', 'card', 'visa', 'mastercard', 'купить', 'buy'],
    ru: 'Пополнить баланс можно на странице Billing. Мы принимаем банковские карты Visa/Mastercard. Минимальное пополнение — 50 000 токенов.',
    en: 'Top up on the Billing page. We accept Visa/Mastercard. Minimum top-up is 50,000 tokens.',
  },
  // Chat history / сохранение
  {
    keywords: ['истори', 'history', 'сохран', 'save', 'чат', 'chat', 'диалог', 'conversation', 'удалить чат', 'delete chat'],
    ru: 'Все ваши чаты автоматически сохраняются в боковой панели. Вы можете вернуться к любому диалогу в любое время. Для нового чата нажмите «+» в сайдбаре.',
    en: 'All chats are auto-saved in the sidebar. You can return to any conversation anytime. Click "+" in the sidebar for a new chat.',
  },
  // System prompt / настройки
  {
    keywords: ['систем', 'system', 'prompt', 'настрой', 'settings', 'инструкц', 'instruction', 'персонал', 'custom'],
    ru: 'Вы можете настроить системный промпт (инструкции для ИИ) через иконку ⚙️ в правом верхнем углу чата. Это позволяет задать роль, стиль ответов и другие параметры.',
    en: 'You can set a custom system prompt via the ⚙️ icon in the top-right of the chat. This lets you define the AI\'s role, response style and more.',
  },
  // Safety / data
  {
    keywords: ['безопасн', 'safe', 'данные', 'data', 'конфиден', 'privacy', 'персональн', 'personal'],
    ru: 'Мы не храним ваши запросы на внешних серверах дольше, чем необходимо для генерации ответа. Ваши данные защищены и не передаются третьим лицам. Подробности в Политике конфиденциальности.',
    en: 'We don\'t store your queries on external servers longer than needed to generate a response. Your data is protected and not shared with third parties. See Privacy Policy.',
  },
  // Difference from ChatGPT
  {
    keywords: ['отличи', 'differ', 'chatgpt', 'чем лучше', 'зачем', 'почему', 'why', 'преимущ', 'advantage'],
    ru: 'Vibeneura — это доступ ко всем топовым ИИ (GPT-4o, Claude, Gemini, DeepSeek) в одном месте. Без VPN, без ограничений по стране, с единым балансом токенов. Выбирайте лучшую модель для каждой задачи.',
    en: 'Vibeneura gives you access to all top AI models (GPT-4o, Claude, Gemini, DeepSeek) in one place. No VPN, no country restrictions, unified token balance. Pick the best model for each task.',
  },
  // How it works
  {
    keywords: ['как работ', 'how it works', 'как пользова', 'how to use', 'начать', 'start', 'get started'],
    ru: '1. Войдите через Google\n2. Выберите модель ИИ в селекторе\n3. Напишите вопрос или прикрепите фото\n4. Получите ответ!\n\nБесплатно даётся 10 000 токенов при регистрации.',
    en: '1. Sign in with Google\n2. Pick an AI model\n3. Type your question or attach a photo\n4. Get your answer!\n\nYou get 10,000 free tokens on signup.',
  },
  // Contact / support / email
  {
    keywords: ['контакт', 'contact', 'связ', 'reach', 'почта', 'mail', 'email', 'поддержк', 'support', 'помощь', 'help', 'обратная связь', 'feedback'],
    ru: 'Свяжитесь с нами: vibeneura@internet.ru — мы отвечаем в течение 24 часов. Также доступна этот чат-помощник 24/7.',
    en: 'Contact us: vibeneura@internet.ru — we respond within 24 hours. This help chat is also available 24/7.',
  },
  // Bugs / problems
  {
    keywords: ['не работа', 'not working', 'сломал', 'broke', 'проблем', 'problem', 'issue', 'глюч', 'glitch', 'завис', 'hang', 'stuck', 'тормоз', 'slow', 'медленн'],
    ru: 'Если что-то не работает:\n1. Попробуйте обновить страницу\n2. Очистите кэш браузера\n3. Попробуйте другой браузер\n\nЕсли проблема сохраняется, напишите нам: vibeneura@internet.ru с описанием проблемы.',
    en: 'If something isn\'t working:\n1. Try refreshing the page\n2. Clear browser cache\n3. Try another browser\n\nIf the problem persists, email us: vibeneura@internet.ru with a description.',
  },
  // Speed / performance
  {
    keywords: ['скорость', 'speed', 'быстр', 'fast', 'долго', 'long', 'ждать', 'wait', 'генерац'],
    ru: 'Скорость ответа зависит от модели и длины запроса. DeepSeek и Llama — самые быстрые. Claude и GPT-4o могут занять чуть больше времени, но дают более качественные ответы.',
    en: 'Response speed depends on the model and query length. DeepSeek and Llama are fastest. Claude and GPT-4o may take slightly longer but give higher quality answers.',
  },
  // Mobile
  {
    keywords: ['мобильн', 'mobile', 'телефон', 'phone', 'приложен', 'app', 'android', 'ios', 'iphone'],
    ru: 'Vibeneura отлично работает в мобильном браузере — просто откройте vibeneura.online. Специального приложения пока нет, но сайт полностью адаптивный.',
    en: 'Vibeneura works great in mobile browsers — just open vibeneura.online. No dedicated app yet, but the site is fully responsive.',
  },
  // Limits / limitations
  {
    keywords: ['лимит', 'limit', 'ограничен', 'restrict', 'максимал', 'maximum', 'символ', 'character', 'длина', 'length'],
    ru: 'Максимальная длина сообщения зависит от модели (обычно 4000-8000 символов). Если текст слишком длинный — разбейте на части. Контекстное окно моделей сохраняет историю текущего чата.',
    en: 'Max message length depends on the model (usually 4000-8000 characters). If text is too long, split it into parts. The model\'s context window keeps your current chat history.',
  },
];

const QUICK_QUESTIONS_RU = [
  'Какие модели доступны?',
  'Сколько стоит?',
  'Как решить задачу по фото?',
  'Нужен ли VPN?',
  'Как начать?',
];

const QUICK_QUESTIONS_EN = [
  'What models are available?',
  'How much does it cost?',
  'How to solve tasks from photos?',
  'Do I need a VPN?',
  'How to get started?',
];

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  const isRu = /[а-яё]/i.test(input);

  for (const entry of FAQ) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        return isRu ? entry.ru : entry.en;
      }
    }
  }

  return isRu
    ? 'Не нашёл ответ на ваш вопрос. Попробуйте спросить иначе или напишите нам: vibeneura@internet.ru'
    : "I couldn't find an answer. Try rephrasing or email us: vibeneura@internet.ru";
}

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const userMsg: Msg = { role: 'user', text: msg };
    const botMsg: Msg = { role: 'bot', text: findAnswer(msg) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }, [input]);

  const isRu = typeof navigator !== 'undefined' && /ru/i.test(navigator.language);
  const quickQuestions = isRu ? QUICK_QUESTIONS_RU : QUICK_QUESTIONS_EN;

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
            <div className="flex items-center justify-between bg-gradient-to-r from-[#00fbfb]/10 to-[#568dff]/10 px-4 py-3 border-b border-white/[0.06]">
              <div>
                <span className="font-display text-sm font-semibold text-white">vibeneura help</span>
                <span className="ml-2 text-[10px] text-[#00fbfb]/70">24/7</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#839493] hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.length === 0 && (
                <div className="flex flex-col gap-3 px-1 py-2">
                  <p className="text-xs text-[#839493] text-center mb-1">
                    {isRu ? 'Частые вопросы:' : 'Quick questions:'}
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
                placeholder={isRu ? 'Ваш вопрос...' : 'Your question...'}
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

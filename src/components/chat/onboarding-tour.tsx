'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Cpu, MessageSquare, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ONBOARDING_KEY = 'vibeneura-onboarding-done';

const STEPS = [
  {
    icon: <Sparkles className="h-8 w-8" />,
    titleRu: 'Добро пожаловать в Vibeneura! 🎉',
    titleEn: 'Welcome to Vibeneura! 🎉',
    descRu: 'У вас уже есть 10 000 стартовых токенов. Этого хватит на ~50 запросов к бесплатной модели.',
    descEn: 'You already have 10,000 starter tokens. That\'s enough for ~50 requests to the free model.',
    accent: 'from-[#00fbfb] to-[#568dff]',
  },
  {
    icon: <Cpu className="h-8 w-8" />,
    titleRu: 'Выберите ИИ-модель',
    titleEn: 'Choose an AI model',
    descRu: 'Нажмите на название модели вверху чата. Claude Haiku — бесплатный. Для сложных задач — Opus или GPT.',
    descEn: 'Click the model name at the top of the chat. Claude Haiku is free. For complex tasks — Opus or GPT.',
    accent: 'from-[#568dff] to-[#3a6fd8]',
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    titleRu: 'Задайте первый вопрос!',
    titleEn: 'Ask your first question!',
    descRu: 'Текст, фото задачи, документ — отправьте что угодно. ИИ поможет с учёбой, кодом, переводами и не только.',
    descEn: 'Text, photo of a problem, document — send anything. AI will help with study, code, translations and more.',
    accent: 'from-[#dfb7ff] to-[#b88ad9]',
  },
];

export function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      // Small delay so the chat loads first
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setShow(false);
    localStorage.setItem(ONBOARDING_KEY, '1');
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      close();
    }
  };

  if (!mounted || !show) return null;

  const s = STEPS[step];
  const isRu = typeof navigator !== 'undefined' && /ru/i.test(navigator.language);

  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[111] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1515] p-8 shadow-2xl">
              {/* Close */}
              <button onClick={close} className="absolute top-4 right-4 text-[#839493] hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? 'w-8 bg-[#00fbfb]' : i < step ? 'w-4 bg-[#00fbfb]/40' : 'w-4 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <div className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.accent} text-[#000510]`}>
                {s.icon}
              </div>

              {/* Content */}
              <h2 className="font-display text-xl font-bold text-white mb-3">
                {isRu ? s.titleRu : s.titleEn}
              </h2>
              <p className="text-sm text-[#b9cac9] leading-relaxed mb-8">
                {isRu ? s.descRu : s.descEn}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button onClick={close} className="text-sm text-[#839493] hover:text-white transition-colors">
                  {isRu ? 'Пропустить' : 'Skip'}
                </button>
                <button
                  onClick={next}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00fbfb] to-[#568dff] px-6 py-2.5 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_20px_-4px_rgba(0,251,251,0.5)]"
                >
                  {step === STEPS.length - 1
                    ? (isRu ? 'Начать!' : 'Start!')
                    : (isRu ? 'Далее' : 'Next')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

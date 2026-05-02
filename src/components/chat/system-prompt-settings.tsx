'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { motion, AnimatePresence } from 'framer-motion';

export function SystemPromptSettings() {
  const [open, setOpen] = useState(false);
  const { customSystemPrompt, setCustomSystemPrompt } = useSettingsStore();
  const [draft, setDraft] = useState(customSystemPrompt);

  const handleOpen = () => {
    setDraft(customSystemPrompt);
    setOpen(true);
  };

  const handleSave = () => {
    setCustomSystemPrompt(draft.trim());
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-all hover:bg-white/5 hover:text-on-surface"
        title="Настройки персоны"
        aria-label="System prompt settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Персона AI</h2>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-on-surface-variant hover:bg-white/5">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-3 text-sm text-on-surface-variant">
                Задайте системный промпт, который будет добавляться ко всем вашим чатам. Например: &quot;Ты — senior Python разработчик. Отвечай кратко и с примерами кода.&quot;
              </p>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ты — ..."
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-on-surface-variant/40 focus:border-primary/40 resize-none"
              />

              <div className="mt-4 flex justify-end gap-2">
                {customSystemPrompt && (
                  <button
                    onClick={() => { setCustomSystemPrompt(''); setOpen(false); }}
                    className="rounded-lg px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                  >
                    Сбросить
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-all hover:shadow-[0_0_18px_-4px_rgba(123,255,238,0.8)]"
                >
                  Сохранить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

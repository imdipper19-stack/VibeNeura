'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';

export function DailyLimitModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations('billing');
  const router = useRouter();
  const { locale } = useParams();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className="glass-strong fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/[0.06] p-0 shadow-2xl overflow-hidden"
              >
                <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[2rem] bg-gradient-to-br from-[#ffb347]/20 via-[#ff6b81]/15 to-[#dfb7ff]/15 blur-3xl" />

                {/* Header strip */}
                <div className="bg-gradient-to-r from-[#ffb347]/90 to-[#ff9500]/70 px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <Clock className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <Dialog.Close className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white">
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                  <Dialog.Title asChild>
                    <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white">
                      {t('dailyLimitTitle')}
                    </h2>
                  </Dialog.Title>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                      <span>20 / 20</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-[#ffb347] to-[#ff6b81] transition-all" />
                    </div>
                  </div>

                  <Dialog.Description asChild>
                    <p className="text-sm leading-relaxed text-[#b9cac9]">
                      {t('dailyLimitBody')}
                    </p>
                  </Dialog.Description>

                  <div className="mt-5 flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        onOpenChange(false);
                        router.push(`/${locale}/billing`);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#568dff] px-5 py-3.5 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_32px_-4px_rgba(0,251,251,0.5)]"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t('topup')}
                    </button>
                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
                    >
                      {t('tryTomorrow')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

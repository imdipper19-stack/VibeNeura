'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Camera, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';

export function PaywallModal({
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
                <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[2rem] bg-gradient-to-br from-[#00fbfb]/20 via-[#568dff]/15 to-[#dfb7ff]/15 blur-3xl" />

                {/* Header strip */}
                <div className="bg-gradient-to-r from-[#ff6b81]/90 to-[#ff6b81]/70 px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <Dialog.Close className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white">
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                  <Dialog.Title asChild>
                    <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white">
                      {t('paywallTitle')}
                    </h2>
                  </Dialog.Title>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  <Dialog.Description asChild>
                    <p className="text-sm leading-relaxed text-[#b9cac9]">
                      {t('paywallBody')}
                    </p>
                  </Dialog.Description>

                  <button
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/${locale}/billing?focus=pack_50k`);
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b81] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#ff8595] hover:shadow-[0_0_32px_-4px_rgba(255,107,129,0.5)]"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('paywallCta')}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

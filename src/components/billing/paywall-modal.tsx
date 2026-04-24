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
                className="glass-strong fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 p-6 shadow-2xl"
              >
                <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/30 via-secondary/20 to-tertiary/20 blur-3xl" />

                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
                    <Camera className="h-6 w-6 text-surface" strokeWidth={2.5} />
                  </div>
                  <Dialog.Close className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface">
                    <X className="h-5 w-5" />
                  </Dialog.Close>
                </div>

                <Dialog.Title asChild>
                  <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-gradient">
                    {t('paywallTitle')}
                  </h2>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    {t('paywallBody')}
                  </p>
                </Dialog.Description>

                <button
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/${locale}/billing?focus=pack_50k`);
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3.5 text-sm font-semibold text-surface transition-all hover:shadow-[0_0_32px_-4px_rgba(123,255,238,0.6)]"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('paywallCta')}
                </button>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

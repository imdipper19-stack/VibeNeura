'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Eye, FileText, Zap, Crown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';

export type ModelOption = {
  slug: string;
  displayName: string;
  provider: string;
  tier: 'FREE' | 'PREMIUM';
  supportsVision: boolean;
  supportsFiles?: boolean;
  description?: string | null;
};

export function ModelSelector({
  models,
  value,
  onChange,
}: {
  models: ModelOption[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('models');
  const selected = models.find((m) => m.slug === value) ?? models[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!selected) return null;

  const freeModels = models.filter((m) => m.tier === 'FREE');
  const premiumModels = models.filter((m) => m.tier === 'PREMIUM');

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass flex items-center gap-2 rounded-lg border-white/10 px-3 py-2 text-sm transition-colors hover:border-white/20"
      >
        {selected.tier === 'PREMIUM' ? (
          <Crown className="h-3.5 w-3.5 text-tertiary" />
        ) : (
          <Zap className="h-3.5 w-3.5 text-primary" />
        )}
        <span className="font-medium">{selected.displayName}</span>
        <div className="hidden sm:flex items-center gap-1">
          {selected.supportsVision && (
            <span className="rounded-full bg-secondary-container/30 px-1.5 py-0.5 text-[10px] text-secondary inline-flex items-center gap-0.5">
              <Eye className="h-2.5 w-2.5" /> {t('vision')}
            </span>
          )}
          {selected.supportsFiles && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary inline-flex items-center gap-0.5">
              <FileText className="h-2.5 w-2.5" /> {t('files')}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-on-surface-variant transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute left-0 top-[calc(100%+8px)] z-30 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-xl p-2 shadow-2xl"
          >
            {freeModels.length > 0 && (
              <ModelGroup
                label={t('free')}
                models={freeModels}
                value={value}
                onChange={(slug) => { onChange(slug); setOpen(false); }}
                accent="primary"
              />
            )}
            {premiumModels.length > 0 && (
              <>
                {freeModels.length > 0 && <div className="my-1 border-t border-white/5" />}
                <ModelGroup
                  label={t('premium')}
                  models={premiumModels}
                  value={value}
                  onChange={(slug) => { onChange(slug); setOpen(false); }}
                  accent="tertiary"
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModelGroup({
  label,
  models,
  value,
  onChange,
  accent,
}: {
  label: string;
  models: ModelOption[];
  value: string;
  onChange: (slug: string) => void;
  accent: 'primary' | 'tertiary';
}) {
  const t = useTranslations('models');
  return (
    <div>
      <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-on-surface-variant/70">
        {label}
      </div>
      <ul>
        {models.map((m) => {
          const active = m.slug === value;
          return (
            <li key={m.slug}>
              <button
                type="button"
                onClick={() => onChange(m.slug)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors',
                  active ? `bg-${accent}/10` : 'hover:bg-white/5',
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    accent === 'tertiary'
                      ? 'bg-tertiary/15 text-tertiary'
                      : 'bg-primary/15 text-primary',
                  )}
                >
                  {accent === 'tertiary' ? <Crown className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{m.displayName}</span>
                    {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </div>
                  {m.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-on-surface-variant">
                      {m.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex gap-1.5">
                    {m.supportsVision && (
                      <span className="rounded-full bg-secondary-container/30 px-1.5 py-0.5 text-[10px] text-secondary inline-flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5" /> {t('vision')}
                      </span>
                    )}
                    {m.supportsFiles && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary inline-flex items-center gap-0.5">
                        <FileText className="h-2.5 w-2.5" /> {t('files')}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

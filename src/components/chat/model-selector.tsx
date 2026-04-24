'use client';

import { useState } from 'react';
import { ChevronDown, Eye, Zap, Crown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export type ModelOption = {
  slug: string;
  displayName: string;
  provider: string;
  tier: 'FREE' | 'PREMIUM';
  supportsVision: boolean;
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
  const selected = models.find((m) => m.slug === value) ?? models[0];

  if (!selected) return null;

  return (
    <div className="relative">
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
        {selected.supportsVision && (
          <span className="hidden rounded-full bg-secondary-container/30 px-1.5 py-0.5 text-[10px] text-secondary sm:inline-flex items-center gap-1">
            <Eye className="h-2.5 w-2.5" /> vision
          </span>
        )}
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
            className="glass-strong absolute left-0 top-[calc(100%+8px)] z-30 w-80 rounded-xl p-2 shadow-2xl"
          >
            <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-on-surface-variant/70">
              Select model
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {models.map((m) => {
                const active = m.slug === value;
                return (
                  <li key={m.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(m.slug);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors',
                        active ? 'bg-primary/10' : 'hover:bg-white/5',
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                          m.tier === 'PREMIUM'
                            ? 'bg-tertiary/15 text-tertiary'
                            : 'bg-primary/15 text-primary',
                        )}
                      >
                        {m.tier === 'PREMIUM' ? <Crown className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
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
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[10px] uppercase',
                              m.tier === 'PREMIUM'
                                ? 'bg-tertiary/15 text-tertiary'
                                : 'bg-primary/15 text-primary',
                            )}
                          >
                            {m.tier}
                          </span>
                          {m.supportsVision && (
                            <span className="rounded-full bg-secondary-container/30 px-1.5 py-0.5 text-[10px] text-secondary">
                              vision
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

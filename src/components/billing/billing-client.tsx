'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap } from 'lucide-react';
import { type BillingItem } from '@/lib/billing/catalog';
import { cn } from '@/lib/utils/cn';

export function BillingClient({
  packs,
  passes,
  initialFocus,
}: {
  packs: Extract<BillingItem, { kind: 'TOKEN_PACK' }>[];
  passes: Extract<BillingItem, { kind: 'PRO_PASS' }>[];
  initialFocus?: string;
}) {
  const t = useTranslations('billing');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buy = async (itemId: string) => {
    setError(null);
    setPendingId(itemId);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'checkout failed');
      if (data.paymentUrl) window.location.href = data.paymentUrl;
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка');
    } finally {
      setPendingId(null);
    }
  };

  const badgeLabel = (b?: string) =>
    b === 'popular' ? t('popular') : b === 'bestValue' ? t('bestValue') : b === 'urgent' ? t('urgent') : null;

  return (
    <div>
      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t('tokenPacksTitle')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{t('tokenPacksSubtitle')}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {packs.map((p) => {
            const label = badgeLabel(p.badge);
            const highlight = initialFocus === p.id;
            return (
              <Card
                key={p.id}
                className={cn(
                  'relative transition-all',
                  p.badge === 'popular' && 'ring-1 ring-primary/40',
                  highlight && 'ring-2 ring-primary shadow-[0_0_36px_-8px_rgba(123,255,238,0.6)]',
                )}
              >
                {label && (
                  <span
                    className={cn(
                      'absolute -top-3 left-6 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase',
                      p.badge === 'urgent'
                        ? 'bg-error text-on-error'
                        : p.badge === 'bestValue'
                          ? 'bg-tertiary text-on-tertiary'
                          : 'bg-primary text-on-primary',
                    )}
                  >
                    {label}
                  </span>
                )}
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-surface-variant">
                  <Zap className="h-3 w-3 text-primary" /> {p.titleKey}
                </div>
                <div className="mt-2 font-display text-3xl font-semibold">
                  {(p.tokens / 1000).toLocaleString()}K
                </div>
                <div className="text-xs uppercase tracking-wider text-on-surface-variant">
                  {t('tokens')}
                </div>
                <div className="mt-4 font-display text-2xl font-bold text-gradient">{p.priceRub} ₽</div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => buy(p.id)}
                  disabled={pendingId === p.id}
                >
                  {pendingId === p.id ? '...' : t('buy')}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-tertiary" />
          <h2 className="font-display text-2xl font-semibold tracking-tight">{t('passesTitle')}</h2>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">{t('passesSubtitle')}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {passes.map((p) => {
            const label = badgeLabel(p.badge);
            return (
              <Card
                key={p.id}
                className={cn(
                  'relative',
                  p.badge === 'popular' && 'ring-1 ring-primary/40',
                  p.badge === 'bestValue' && 'ring-1 ring-tertiary/40',
                )}
              >
                {label && (
                  <span
                    className={cn(
                      'absolute -top-3 left-6 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase',
                      p.badge === 'bestValue' ? 'bg-tertiary text-on-tertiary' : 'bg-primary text-on-primary',
                    )}
                  >
                    {label}
                  </span>
                )}
                <div className="text-xs uppercase tracking-wider text-on-surface-variant">
                  {p.titleKey}
                </div>
                <div className="mt-2 font-display text-3xl font-semibold">
                  {p.days}
                  <span className="ml-1 text-base font-normal text-on-surface-variant">
                    {t('days')}
                  </span>
                </div>
                <ul className="mt-4 space-y-1 text-xs text-on-surface-variant">
                  {['Claude Opus 4.6', 'GPT 5.4 Omni', 'Без автопродления'].map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-tertiary" /> {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 font-display text-2xl font-bold text-gradient">{p.priceRub} ₽</div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => buy(p.id)}
                  disabled={pendingId === p.id}
                >
                  {pendingId === p.id ? '...' : t('buy')}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {error && (
        <p className="mt-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

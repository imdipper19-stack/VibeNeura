'use client';

import { useEffect, useState } from 'react';
import { Gift, Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';

type ReferralData = { code: string; invitedCount: number; earnedTokens: number };

export function ReferralBanner() {
  const t = useTranslations('referral');
  const { status } = useSession();
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/referral/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
  }, [status]);

  if (status !== 'authenticated' || !data) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibeneura.pro';
  const link = `${appUrl}/?ref=${data.code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="glass relative overflow-hidden rounded-lg p-3">
      <div className="pointer-events-none absolute -inset-6 -z-10 bg-gradient-to-br from-tertiary/20 via-primary/10 to-secondary/15 blur-2xl" />
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-tertiary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">
          {t('title')}
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-on-surface-variant">{t('subtitle')}</p>
      <button
        onClick={copy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-tertiary/15 px-3 py-2 text-xs font-medium text-tertiary transition-all hover:bg-tertiary/25"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? t('copied') : t('copyLink')}
      </button>
      <div className="mt-2 flex items-center justify-between text-[10px] text-on-surface-variant/80">
        <span>{t('invitedCount', { count: data.invitedCount })}</span>
        <span>{t('earned', { count: data.earnedTokens.toLocaleString() })}</span>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { GoogleButton } from '@/components/auth/google-button';
import { TelegramButton } from '@/components/auth/telegram-button';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary/15 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md">
        <Link href={`/${locale}`} className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-4 w-4 text-surface" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">vibeneura</span>
        </Link>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-gradient">
          {t('loginTitle')}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">{t('loginSubtitle')}</p>

        <div className="mt-8 space-y-3">
          <GoogleButton label={t('googleCta')} />
          <TelegramButton botUsername={botUsername} label={t('telegramCta')} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-on-surface-variant/80">
          <ShieldCheck className="h-3.5 w-3.5 text-tertiary" />
          <span>{t('noEmailNeeded')}</span>
        </div>
      </Card>
    </div>
  );
}

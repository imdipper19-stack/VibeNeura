import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { GoogleButton } from '@/components/auth/google-button';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-gradient-to-b from-[#000510] to-[#000000]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-[#00fbfb]/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[#568dff]/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-white/[0.06] bg-white/[0.04] backdrop-blur-2xl">
        <Link href={`/${locale}`} className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00fbfb] to-[#568dff]">
            <Sparkles className="h-4 w-4 text-[#000510]" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold text-white">vibeneura</span>
        </Link>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
          {t('loginTitle')}
        </h1>
        <p className="mt-2 text-sm text-[#b9cac9]">{t('loginSubtitle')}</p>

        <div className="mt-8 space-y-3">
          <GoogleButton label={t('googleCta')} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#839493]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#00fbfb]" />
          <span>{t('noEmailNeeded')}</span>
        </div>
      </Card>
    </div>
  );
}

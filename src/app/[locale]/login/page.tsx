import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { GoogleButton } from '@/components/auth/google-button';
import { AuthForms } from '@/components/auth/auth-forms';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
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

        {sp.verified === '1' && (
          <div className="mb-4 rounded-lg border border-tertiary/30 bg-tertiary/10 px-3 py-2 text-sm text-tertiary">
            Email подтверждён! Теперь войдите в аккаунт.
          </div>
        )}
        {sp.error === 'expired_token' && (
          <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            Ссылка устарела. Зарегистрируйтесь снова.
          </div>
        )}

        <AuthForms locale={locale} googleLabel={t('googleCta')} />
      </Card>
    </div>
  );
}

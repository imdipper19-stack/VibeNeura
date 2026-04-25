import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Globe2, CreditCard, ArrowRight } from 'lucide-react';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');
  const tNav = await getTranslations('nav');

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background bloom */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-secondary/15 blur-[160px]" />
      </div>

      {/* Navigation */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-5 w-5 text-surface" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">vibeneura</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/${locale === 'ru' ? 'en' : 'ru'}`}>
            <Button variant="ghost" size="sm" className="uppercase">
              {locale === 'ru' ? 'EN' : 'RU'}
            </Button>
          </Link>
          <Link href={`/${locale}/login`}>
            <Button size="sm">
              {tNav('login')}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-32 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-on-surface-variant backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" />
          No VPN · No limits · All models
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-gradient">
          {t('heroTitle')}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant">
          {t('heroSubtitle')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href={`/${locale}/chat`}>
            <Button size="lg" className="bloom group">
              {t('ctaPrimary')}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="ghost">
              {t('ctaSecondary')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto grid max-w-6xl gap-6 px-6 pb-32 md:grid-cols-3">
        <FeatureCard
          icon={<Globe2 className="h-6 w-6" />}
          title={t('feature1Title')}
          description={t('feature1Desc')}
          accent="primary"
        />
        <FeatureCard
          icon={<Zap className="h-6 w-6" />}
          title={t('feature2Title')}
          description={t('feature2Desc')}
          accent="secondary"
        />
        <FeatureCard
          icon={<CreditCard className="h-6 w-6" />}
          title={t('feature3Title')}
          description={t('feature3Desc')}
          accent="tertiary"
        />
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-on-surface-variant">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} vibeneura.online · ОсОО «Глобал Бридж»</span>
          <div className="flex gap-5">
            <Link href={`/${locale}/terms`} className="hover:text-on-surface">
              Оферта
            </Link>
            <Link href={`/${locale}/privacy`} className="hover:text-on-surface">
              Конфиденциальность
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}) {
  const accentMap = {
    primary: 'bg-primary/15 text-primary',
    secondary: 'bg-secondary-container/30 text-secondary',
    tertiary: 'bg-tertiary/15 text-tertiary',
  };
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-8 transition-all hover:-translate-y-1 hover:border-white/15">
      <div
        className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg ${accentMap[accent]}`}
      >
        {icon}
      </div>
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-on-surface-variant leading-relaxed">{description}</p>
    </div>
  );
}

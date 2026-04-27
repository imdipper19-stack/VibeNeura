import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Globe2, CreditCard, ArrowRight, Code2, Camera, BookOpen } from 'lucide-react';

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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#000510] to-[#000000]">
      {/* Background bloom */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#00fbfb]/10 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#568dff]/10 blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dfb7ff]/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#00fbfb] to-[#568dff]">
            <Sparkles className="h-5 w-5 text-[#000510]" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-white">vibeneura</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/${locale === 'ru' ? 'en' : 'ru'}`}>
            <Button variant="ghost" size="sm" className="uppercase text-[#b9cac9] hover:text-white">
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
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00fbfb]/20 bg-[#00fbfb]/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#b9cac9] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00fbfb] animate-pulse" />
          No VPN · No limits · All models
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_0_40px_rgba(0,251,251,0.25)]">
          {t('heroTitle')}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#b9cac9]">
          {t('heroSubtitle')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href={`/${locale}/login`}>
            <Button size="lg" className="bloom group bg-gradient-to-r from-[#00fbfb] to-[#568dff] text-[#000510] font-semibold hover:shadow-[0_0_30px_-4px_rgba(0,251,251,0.6)]">
              {t('ctaPrimary')}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="ghost" className="border border-[#00fbfb]/20 text-[#b9cac9] hover:border-[#00fbfb]/40 hover:text-white">
              {t('ctaSecondary')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto grid max-w-6xl gap-6 px-6 pb-32 md:grid-cols-3">
        <FeatureCard
          icon={<BookOpen className="h-6 w-6" />}
          title={t('feature1Title')}
          description={t('feature1Desc')}
          number="01"
          accent="cyan"
        />
        <FeatureCard
          icon={<Code2 className="h-6 w-6" />}
          title={t('feature2Title')}
          description={t('feature2Desc')}
          number="02"
          accent="blue"
        />
        <FeatureCard
          icon={<Camera className="h-6 w-6" />}
          title={t('feature3Title')}
          description={t('feature3Desc')}
          number="03"
          accent="purple"
        />
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-[#839493]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} vibeneura.online · ОсОО «Глобал Бридж»</span>
          <div className="flex gap-5">
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
              Оферта
            </Link>
            <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
              Конфиденциальность
            </Link>
            <a href="mailto:vibeneura@internet.ru" className="hover:text-white transition-colors">
              Тех. поддержка: vibeneura@internet.ru
            </a>
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
  number,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  number: string;
  accent: 'cyan' | 'blue' | 'purple';
}) {
  const accentMap = {
    cyan: { bg: 'bg-[#00fbfb]/10 text-[#00fbfb]', border: 'hover:border-[#00fbfb]/30', num: 'text-[#00fbfb]/20' },
    blue: { bg: 'bg-[#568dff]/10 text-[#568dff]', border: 'hover:border-[#568dff]/30', num: 'text-[#568dff]/20' },
    purple: { bg: 'bg-[#dfb7ff]/10 text-[#dfb7ff]', border: 'hover:border-[#dfb7ff]/30', num: 'text-[#dfb7ff]/20' },
  };
  const a = accentMap[accent];
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl transition-all hover:-translate-y-1 ${a.border}`}>
      <span className={`absolute top-4 right-4 font-display text-3xl font-bold ${a.num}`}>{number}</span>
      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg ${a.bg}`}>
        {icon}
      </div>
      <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-[#b9cac9] leading-relaxed">{description}</p>
    </div>
  );
}

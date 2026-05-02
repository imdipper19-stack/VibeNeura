import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Globe2, CreditCard, ArrowRight, Code2, Camera, BookOpen, UserPlus, MousePointerClick, MessageSquare, Check, X, ChevronDown } from 'lucide-react';

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
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-32 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00fbfb]/20 bg-[#00fbfb]/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#b9cac9] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00fbfb] animate-pulse" />
          {t('badge')}
        </div>

        <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_0_40px_rgba(0,251,251,0.25)]">
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

        {/* Social proof counter */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-white">500+</p>
            <p className="text-xs text-[#839493] mt-1">{locale === 'ru' ? 'пользователей' : 'users'}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-white">50 000+</p>
            <p className="text-xs text-[#839493] mt-1">{locale === 'ru' ? 'запросов' : 'requests'}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-white">4</p>
            <p className="text-xs text-[#839493] mt-1">{locale === 'ru' ? 'ИИ модели' : 'AI models'}</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 sm:pb-32">
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-center text-white mb-4">
          {locale === 'ru' ? 'Как это работает?' : 'How it works'}
        </h2>
        <p className="text-center text-[#839493] mb-12 max-w-xl mx-auto">
          {locale === 'ru' ? 'Три простых шага — и вы общаетесь с лучшими ИИ' : 'Three simple steps to chat with the best AI'}
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              icon: <UserPlus className="h-6 w-6" />,
              title: locale === 'ru' ? 'Зарегистрируйтесь' : 'Sign up',
              desc: locale === 'ru' ? 'Войдите через Google, Telegram или email. Никаких форм — за 5 секунд.' : 'Sign in with Google, Telegram or email. No forms — 5 seconds.',
              accent: 'from-[#00fbfb] to-[#00c4c4]',
            },
            {
              step: '02',
              icon: <MousePointerClick className="h-6 w-6" />,
              title: locale === 'ru' ? 'Выберите модель' : 'Choose a model',
              desc: locale === 'ru' ? 'GPT 5.5, Claude Opus 4.7, Sonnet 4.6 или бесплатный Haiku — всё в одном месте.' : 'GPT 5.5, Claude Opus 4.7, Sonnet 4.6 or free Haiku — all in one place.',
              accent: 'from-[#568dff] to-[#3a6fd8]',
            },
            {
              step: '03',
              icon: <MessageSquare className="h-6 w-6" />,
              title: locale === 'ru' ? 'Задайте вопрос' : 'Ask a question',
              desc: locale === 'ru' ? 'Текст, фото, файлы — отправляйте что угодно. ИИ ответит за секунды.' : 'Text, photos, files — send anything. AI responds in seconds.',
              accent: 'from-[#dfb7ff] to-[#b88ad9]',
            },
          ].map((item) => (
            <div key={item.step} className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-all hover:-translate-y-1 hover:border-white/[0.12]">
              <span className="absolute top-4 right-5 font-display text-4xl font-bold text-white/5">{item.step}</span>
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-[#000510]`}>
                {item.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#b9cac9] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto grid max-w-6xl gap-4 sm:gap-6 px-4 sm:px-6 pb-20 sm:pb-32 md:grid-cols-3">
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

      {/* Pricing comparison */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 sm:pb-32">
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-center text-white mb-4">
          {locale === 'ru' ? 'Тарифы' : 'Pricing'}
        </h2>
        <p className="text-center text-[#839493] mb-12 max-w-xl mx-auto">
          {locale === 'ru' ? 'Начните бесплатно, переходите на Premium когда нужно' : 'Start free, upgrade to Premium when needed'}
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Free tier */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <div className="mb-6">
              <span className="inline-block rounded-full bg-[#00fbfb]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00fbfb]">
                Free
              </span>
              <p className="mt-4 font-display text-4xl font-bold text-white">0 ₽</p>
              <p className="mt-1 text-sm text-[#839493]">{locale === 'ru' ? 'навсегда' : 'forever'}</p>
            </div>
            <ul className="space-y-3 text-sm">
              <PricingRow included label={locale === 'ru' ? 'Claude Haiku 4.5' : 'Claude Haiku 4.5'} />
              <PricingRow included label={locale === 'ru' ? '10 000 стартовых токенов' : '10,000 starter tokens'} />
              <PricingRow included label={locale === 'ru' ? '20 запросов в день' : '20 requests per day'} />
              <PricingRow included label={locale === 'ru' ? 'Зрение (фото)' : 'Vision (photos)'} />
              <PricingRow included={false} label={locale === 'ru' ? 'Премиум модели' : 'Premium models'} />
              <PricingRow included={false} label={locale === 'ru' ? 'Загрузка файлов' : 'File uploads'} />
            </ul>
            <Link href={`/${locale}/login`} className="block mt-8">
              <Button variant="ghost" size="lg" className="w-full border border-white/10 text-[#b9cac9] hover:text-white">
                {locale === 'ru' ? 'Начать бесплатно' : 'Start free'}
              </Button>
            </Link>
          </div>
          {/* Premium tier */}
          <div className="relative rounded-2xl border border-[#00fbfb]/30 bg-[#00fbfb]/[0.03] p-8 shadow-[0_0_40px_-12px_rgba(0,251,251,0.15)]">
            <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-[#00fbfb] to-[#568dff] px-4 py-1 text-xs font-bold uppercase text-[#000510]">
              {locale === 'ru' ? 'Популярный' : 'Popular'}
            </div>
            <div className="mb-6">
              <span className="inline-block rounded-full bg-[#dfb7ff]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#dfb7ff]">
                Premium
              </span>
              <p className="mt-4 font-display text-4xl font-bold text-white">{locale === 'ru' ? 'от 99 ₽' : 'from 99 ₽'}</p>
              <p className="mt-1 text-sm text-[#839493]">{locale === 'ru' ? 'пакеты токенов или PRO Pass' : 'token packs or PRO Pass'}</p>
            </div>
            <ul className="space-y-3 text-sm">
              <PricingRow included label={locale === 'ru' ? 'Все модели: GPT, Claude Opus, Sonnet' : 'All models: GPT, Claude Opus, Sonnet'} />
              <PricingRow included label={locale === 'ru' ? 'Безлимитные запросы' : 'Unlimited requests'} />
              <PricingRow included label={locale === 'ru' ? 'Зрение и файлы' : 'Vision & files'} />
              <PricingRow included label={locale === 'ru' ? 'Приоритетная скорость' : 'Priority speed'} />
              <PricingRow included label={locale === 'ru' ? '+20% токенов за первую покупку' : '+20% tokens on first purchase'} />
              <PricingRow included label={locale === 'ru' ? 'Без VPN' : 'No VPN needed'} />
            </ul>
            <Link href={`/${locale}/login`} className="block mt-8">
              <Button size="lg" className="w-full bloom bg-gradient-to-r from-[#00fbfb] to-[#568dff] text-[#000510] font-semibold">
                {locale === 'ru' ? 'Попробовать Premium' : 'Try Premium'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20 sm:pb-32">
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-center text-white mb-12">
          {locale === 'ru' ? 'Частые вопросы' : 'FAQ'}
        </h2>
        <div className="space-y-3">
          {(locale === 'ru' ? [
            { q: 'Нужен ли VPN для доступа?', a: 'Нет! Все запросы проксируются через наш сервер. Vibeneura работает из любой точки мира без VPN.' },
            { q: 'Какие модели доступны?', a: 'Бесплатно: Claude Haiku 4.5. Premium: Claude Opus 4.7, Claude Sonnet 4.6, GPT 5.5. Мы постоянно добавляем новые модели.' },
            { q: 'Как устроена оплата?', a: 'Два варианта: пакеты токенов (от 99 ₽, не сгорают) или PRO Pass (безлимит на все модели на 7/14/30 дней). Оплата через карту.' },
            { q: 'Можно ли отправлять фото?', a: 'Да! Модели с поддержкой зрения (vision) анализируют фото: решают задачи, распознают текст, описывают изображения.' },
            { q: 'Мои данные в безопасности?', a: 'Мы не храним ваши запросы на серверах провайдеров. Все чаты шифруются и доступны только вам.' },
            { q: 'Есть ли мобильная версия?', a: 'Vibeneura — PWA-приложение. Откройте сайт в браузере и добавьте на главный экран. Работает как нативное приложение.' },
          ] : [
            { q: 'Do I need a VPN?', a: 'No! All requests are proxied through our servers. Vibeneura works from anywhere without a VPN.' },
            { q: 'What models are available?', a: 'Free: Claude Haiku 4.5. Premium: Claude Opus 4.7, Claude Sonnet 4.6, GPT 5.5. We constantly add new models.' },
            { q: 'How does billing work?', a: 'Two options: token packs (from 99 ₽, never expire) or PRO Pass (unlimited access for 7/14/30 days). Pay by card.' },
            { q: 'Can I send photos?', a: 'Yes! Models with vision support analyse photos: solve problems, recognise text, describe images.' },
            { q: 'Is my data safe?', a: 'We do not store your requests on provider servers. All chats are encrypted and visible only to you.' },
            { q: 'Is there a mobile app?', a: 'Vibeneura is a PWA app. Open the site in your browser and add it to your home screen. Works like a native app.' },
          ]).map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 sm:pb-32">
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-center text-white mb-12">
          {locale === 'ru' ? 'Отзывы пользователей' : 'What users say'}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {(locale === 'ru' ? [
            { name: 'Алексей', role: 'Студент', text: 'Решаю домашки по фото за минуту. Claude Opus объясняет каждый шаг — лучше любого репетитора!' },
            { name: 'Мария', role: 'Копирайтер', text: 'Переключаюсь между GPT и Claude в один клик. Раньше приходилось держать 3 подписки, теперь — одна.' },
            { name: 'Дмитрий', role: 'Разработчик', text: 'Без VPN и без лагов. Отправляю код, получаю ревью. Самый удобный ИИ-агрегатор на рынке.' },
          ] : [
            { name: 'Alex', role: 'Student', text: 'I solve homework from photos in a minute. Claude Opus explains every step — better than any tutor!' },
            { name: 'Maria', role: 'Copywriter', text: 'I switch between GPT and Claude in one click. Used to have 3 subscriptions, now just one.' },
            { name: 'Dmitry', role: 'Developer', text: 'No VPN, no lag. I send code, get reviews. The most convenient AI aggregator on the market.' },
          ]).map((t, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-[#00fbfb] text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-[#b9cac9] leading-relaxed mb-4">«{t.text}»</p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#00fbfb]/20 to-[#568dff]/20 text-sm font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-[#839493]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-[#839493]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} vibeneura.online · ОсОО «Глобал Бридж»</span>
          <div className="flex gap-5">
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
              {t('footerTerms')}
            </Link>
            <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
              {t('footerPrivacy')}
            </Link>
            <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
              {locale === 'ru' ? 'О нас' : 'About'}
            </Link>
            <a href="mailto:vibeneura@internet.ru" className="hover:text-white transition-colors">
              {t('footerSupport')}: vibeneura@internet.ru
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

function PricingRow({ included, label }: { included: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      {included ? (
        <Check className="h-4 w-4 shrink-0 text-[#00fbfb]" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-[#839493]/40" />
      )}
      <span className={included ? 'text-[#dbe4e3]' : 'text-[#839493]/50'}>{label}</span>
    </li>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all open:bg-white/[0.04]">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-white list-none select-none">
        {question}
        <ChevronDown className="h-4 w-4 shrink-0 text-[#839493] transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-4 text-sm text-[#b9cac9] leading-relaxed">
        {answer}
      </div>
    </details>
  );
}

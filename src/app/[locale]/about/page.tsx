import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Mail, Globe, Shield, Users, Zap } from 'lucide-react';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRu = locale === 'ru';

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#000510] to-[#000000]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-[#00fbfb]/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#568dff]/8 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-[#839493] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {isRu ? 'На главную' : 'Back home'}
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-20">
        {/* Logo + Title */}
        <div className="text-center mb-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00fbfb] to-[#568dff] mb-6">
            <Sparkles className="h-8 w-8 text-[#000510]" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">
            {isRu ? 'О Vibeneura' : 'About Vibeneura'}
          </h1>
          <p className="text-lg text-[#b9cac9] max-w-xl mx-auto leading-relaxed">
            {isRu
              ? 'Мы делаем лучшие ИИ-модели доступными для каждого — без VPN, без сложностей, без ограничений.'
              : 'We make the best AI models accessible to everyone — no VPN, no hassle, no limits.'}
          </p>
        </div>

        {/* Mission */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {[
            {
              icon: <Globe className="h-6 w-6" />,
              titleRu: 'Доступность',
              titleEn: 'Accessibility',
              descRu: 'Все ведущие ИИ-модели в одном месте. Работает из любой точки мира без VPN.',
              descEn: 'All leading AI models in one place. Works from anywhere without a VPN.',
              accent: 'bg-[#00fbfb]/10 text-[#00fbfb]',
            },
            {
              icon: <Shield className="h-6 w-6" />,
              titleRu: 'Безопасность',
              titleEn: 'Security',
              descRu: 'Ваши данные шифруются и никогда не передаются третьим лицам. Мы ценим вашу приватность.',
              descEn: 'Your data is encrypted and never shared with third parties. We value your privacy.',
              accent: 'bg-[#568dff]/10 text-[#568dff]',
            },
            {
              icon: <Zap className="h-6 w-6" />,
              titleRu: 'Простота',
              titleEn: 'Simplicity',
              descRu: 'Регистрация за 5 секунд. Интуитивный интерфейс. Всё сделано, чтобы вы думали о задачах, а не об инструментах.',
              descEn: 'Sign up in 5 seconds. Intuitive interface. Built so you focus on tasks, not tools.',
              accent: 'bg-[#dfb7ff]/10 text-[#dfb7ff]',
            },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.accent}`}>
                {item.icon}
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">
                {isRu ? item.titleRu : item.titleEn}
              </h3>
              <p className="text-sm text-[#b9cac9] leading-relaxed">
                {isRu ? item.descRu : item.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Company info */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00fbfb]/10 text-[#00fbfb]">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-semibold text-white">
              {isRu ? 'Компания' : 'Company'}
            </h2>
          </div>
          <div className="space-y-4 text-sm text-[#b9cac9]">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-[#839493]">{isRu ? 'Юридическое лицо' : 'Legal entity'}</span>
              <span className="text-white font-medium">ОсОО «Глобал Бридж»</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-[#839493]">{isRu ? 'Сайт' : 'Website'}</span>
              <a href="https://vibeneura.online" className="text-[#00fbfb] hover:underline">vibeneura.online</a>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-[#839493]">{isRu ? 'Поддержка' : 'Support'}</span>
              <a href="mailto:vibeneura@internet.ru" className="text-[#00fbfb] hover:underline">vibeneura@internet.ru</a>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#839493]">{isRu ? 'Год основания' : 'Founded'}</span>
              <span className="text-white font-medium">2025</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            {isRu ? 'Готовы начать?' : 'Ready to start?'}
          </h2>
          <p className="text-[#839493] mb-6">
            {isRu ? 'Зарегистрируйтесь и получите 10 000 бесплатных токенов.' : 'Sign up and get 10,000 free tokens.'}
          </p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00fbfb] to-[#568dff] px-8 py-3 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_30px_-4px_rgba(0,251,251,0.6)]"
          >
            {isRu ? 'Начать бесплатно' : 'Start free'}
          </Link>
        </div>
      </div>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-[#839493]">
        © {new Date().getFullYear()} vibeneura.online · ОсОО «Глобал Бридж»
      </footer>
    </main>
  );
}

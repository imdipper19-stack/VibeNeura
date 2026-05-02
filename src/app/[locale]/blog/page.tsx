import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Tag } from 'lucide-react';
import { ARTICLES } from '@/lib/blog/articles';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRu = locale === 'ru';

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#000510] to-[#000000]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-[#00fbfb]/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#568dff]/8 blur-[120px]" />
      </div>

      <header className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-[#839493] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {isRu ? 'На главную' : 'Back home'}
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 pb-20">
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4 text-center">
          {isRu ? 'Блог' : 'Blog'}
        </h1>
        <p className="text-center text-[#839493] mb-12 max-w-xl mx-auto">
          {isRu ? 'Статьи о работе с ИИ, сравнения моделей и полезные гайды' : 'Articles about working with AI, model comparisons and useful guides'}
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map(article => (
            <Link
              key={article.slug}
              href={`/${locale}/blog/${article.slug}`}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:-translate-y-1 hover:border-[#00fbfb]/20 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3 text-xs text-[#839493] mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTimeMin} {isRu ? 'мин' : 'min'}
                </span>
                <span>{new Date(article.date).toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <h2 className="font-display text-lg font-semibold text-white mb-2 group-hover:text-[#00fbfb] transition-colors">
                {isRu ? article.titleRu : article.titleEn}
              </h2>
              <p className="text-sm text-[#b9cac9] leading-relaxed mb-4">
                {isRu ? article.descriptionRu : article.descriptionEn}
              </p>
              <div className="flex items-center gap-2 mb-4">
                {article.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-[#839493]">
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-[#00fbfb] group-hover:gap-2 transition-all">
                {isRu ? 'Читать' : 'Read'} <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-[#839493]">
        © {new Date().getFullYear()} vibeneura.online
      </footer>
    </main>
  );
}

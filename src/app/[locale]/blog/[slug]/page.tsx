import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { getArticle, ARTICLES } from '@/lib/blog/articles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }));
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isRu = locale === 'ru';

  const article = getArticle(slug);
  if (!article) notFound();

  const title = isRu ? article.titleRu : article.titleEn;
  const content = isRu ? article.contentRu : article.contentEn;

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#000510] to-[#000000]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-[#00fbfb]/8 blur-[120px]" />
      </div>

      <header className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-6">
        <Link href={`/${locale}/blog`} className="flex items-center gap-2 text-[#839493] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {isRu ? 'Все статьи' : 'All articles'}
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-20">
        <div className="flex items-center gap-3 text-xs text-[#839493] mb-6">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTimeMin} {isRu ? 'мин чтения' : 'min read'}
          </span>
          <span>{new Date(article.date).toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {article.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px]">
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mb-8 leading-tight">
          {title}
        </h1>

        <div className="prose prose-invert prose-sm sm:prose-base max-w-none
          prose-headings:font-display prose-headings:text-white
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-[#b9cac9] prose-p:leading-relaxed
          prose-li:text-[#b9cac9]
          prose-strong:text-white
          prose-a:text-[#00fbfb] prose-a:no-underline hover:prose-a:underline
          prose-code:text-[#00fbfb] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-table:border-white/10
          prose-th:text-white prose-th:border-white/10 prose-th:px-3 prose-th:py-2
          prose-td:text-[#b9cac9] prose-td:border-white/10 prose-td:px-3 prose-td:py-2
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-[#00fbfb]/20 bg-[#00fbfb]/[0.03] p-8 text-center">
          <h3 className="font-display text-xl font-bold text-white mb-2">
            {isRu ? 'Попробуйте Vibeneura бесплатно' : 'Try Vibeneura for free'}
          </h3>
          <p className="text-sm text-[#839493] mb-4">
            {isRu ? '10 000 стартовых токенов. Без VPN. Без ограничений.' : '10,000 starter tokens. No VPN. No limits.'}
          </p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00fbfb] to-[#568dff] px-6 py-2.5 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_20px_-4px_rgba(0,251,251,0.5)]"
          >
            {isRu ? 'Начать' : 'Get started'}
          </Link>
        </div>
      </article>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-[#839493]">
        © {new Date().getFullYear()} vibeneura.online
      </footer>
    </main>
  );
}

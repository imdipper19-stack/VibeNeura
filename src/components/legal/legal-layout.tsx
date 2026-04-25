import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export function LegalLayout({
  locale,
  title,
  children,
}: {
  locale: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[160px]" />
      </div>

      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-4 w-4 text-surface" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">vibeneura</span>
        </Link>
        <Link
          href={`/${locale}`}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-gradient md:text-5xl">
          {title}
        </h1>
        <div className="prose-legal mt-8 space-y-4 text-[15px] leading-relaxed text-on-surface-variant">
          {children}
        </div>
      </article>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-on-surface-variant">
        © {new Date().getFullYear()} vibeneura.online · ОсОО «Глобал Бридж»
      </footer>
    </main>
  );
}

/** Helper for rendering a list of paragraphs / headings from a single plain-text string. */
export function LegalText({ content }: { content: string }) {
  const blocks = content.split('\n').map((l) => l.trim());
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const line = blocks[i];
    if (!line) {
      i++;
      continue;
    }
    // Next line empty → this is likely a heading
    const next = blocks[i + 1];
    const afterNext = blocks[i + 2];
    const isHeading =
      (!next || next === '') &&
      line.length < 80 &&
      afterNext !== undefined &&
      !/^\d+[.)]/.test(line);
    if (isHeading) {
      out.push(
        <h2 key={i} className="mt-10 font-display text-xl font-semibold text-on-surface">
          {line}
        </h2>,
      );
      i++;
    } else {
      out.push(
        <p key={i} className="">
          {line}
        </p>,
      );
      i++;
    }
  }
  return <>{out}</>;
}

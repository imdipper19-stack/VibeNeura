import { setRequestLocale } from 'next-intl/server';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex h-screen overflow-hidden">
      <MobileNav />
      <Sidebar />
      <main className="relative flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}

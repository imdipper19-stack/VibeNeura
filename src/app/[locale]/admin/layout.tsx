import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, ArrowLeft } from 'lucide-react';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex min-h-screen bg-[#000510]">
      <aside className="w-56 border-r border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-1">
        <Link
          href={`/${locale}/chat`}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#839493] hover:bg-white/5 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад в чат
        </Link>
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[#839493]/60">Admin</p>
        <NavLink href={`/${locale}/admin`} icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
        <NavLink href={`/${locale}/admin/users`} icon={<Users className="h-4 w-4" />} label="Users" />
        <NavLink href={`/${locale}/admin/payments`} icon={<CreditCard className="h-4 w-4" />} label="Payments" />
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#b9cac9] hover:bg-white/5 hover:text-white transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}

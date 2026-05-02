import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const { prisma } = await import('@/lib/prisma/client');

    // Group users by locale as a proxy for geography
    const users = await prisma.user.groupBy({
      by: ['locale'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const geo = users.map(u => ({
      locale: u.locale || 'unknown',
      count: u._count.id,
      label: u.locale === 'ru' ? 'Россия/СНГ' : u.locale === 'en' ? 'English' : u.locale || 'Другие',
    }));

    return NextResponse.json({ geo });
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

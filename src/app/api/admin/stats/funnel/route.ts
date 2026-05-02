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

    // Total registered users
    const totalRegistered = await prisma.user.count();

    // Users who created at least 1 chat
    const usersWithChat = await prisma.chat.findMany({
      select: { userId: true },
      distinct: ['userId'],
    });

    // Users who made at least 1 completed purchase
    const usersWithPurchase = await prisma.transaction.findMany({
      where: { status: 'COMPLETED', type: { in: ['TOKEN_PACK', 'PRO_PASS'] } },
      select: { userId: true },
      distinct: ['userId'],
    });

    return NextResponse.json({
      funnel: [
        { stage: 'Регистрация', count: totalRegistered },
        { stage: 'Первый чат', count: usersWithChat.length },
        { stage: 'Первая покупка', count: usersWithPurchase.length },
      ],
    });
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

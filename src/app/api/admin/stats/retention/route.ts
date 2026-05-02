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
    const now = new Date();

    // Users who logged in (created chat or message) on Day 1, Day 7, Day 30 after registration
    const users = await prisma.user.findMany({
      select: { id: true, createdAt: true },
    });

    const total = users.length;
    let d1 = 0, d7 = 0, d30 = 0;

    for (const user of users) {
      const regDate = new Date(user.createdAt);
      const daysSinceReg = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceReg < 1) continue; // Too recent

      // Check if user has activity after Day 1
      const d1Date = new Date(regDate.getTime() + 1 * 24 * 60 * 60 * 1000);
      const hasD1 = await prisma.message.findFirst({
        where: {
          chat: { userId: user.id },
          createdAt: { gte: d1Date },
        },
      });
      if (hasD1) d1++;

      if (daysSinceReg >= 7) {
        const d7Date = new Date(regDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const hasD7 = await prisma.message.findFirst({
          where: {
            chat: { userId: user.id },
            createdAt: { gte: d7Date },
          },
        });
        if (hasD7) d7++;
      }

      if (daysSinceReg >= 30) {
        const d30Date = new Date(regDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const hasD30 = await prisma.message.findFirst({
          where: {
            chat: { userId: user.id },
            createdAt: { gte: d30Date },
          },
        });
        if (hasD30) d30++;
      }
    }

    // Count eligible users for each period
    const eligibleD1 = users.filter(u => {
      const days = Math.floor((now.getTime() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 1;
    }).length;
    const eligibleD7 = users.filter(u => {
      const days = Math.floor((now.getTime() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 7;
    }).length;
    const eligibleD30 = users.filter(u => {
      const days = Math.floor((now.getTime() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 30;
    }).length;

    return NextResponse.json({
      retention: [
        { period: 'D1', retained: d1, total: eligibleD1, pct: eligibleD1 ? Math.round((d1 / eligibleD1) * 100) : 0 },
        { period: 'D7', retained: d7, total: eligibleD7, pct: eligibleD7 ? Math.round((d7 / eligibleD7) * 100) : 0 },
        { period: 'D30', retained: d30, total: eligibleD30, pct: eligibleD30 ? Math.round((d30 / eligibleD30) * 100) : 0 },
      ],
    });
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

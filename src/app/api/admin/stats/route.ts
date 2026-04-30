import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [totalUsers, newToday, newWeek, payingUsers, revenueAgg] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.transaction.groupBy({
      by: ['userId'],
      where: { status: 'COMPLETED', type: { in: ['TOKEN_PACK', 'PRO_PASS'] } },
    }).then(r => r.length),
    prisma.transaction.aggregate({
      where: { status: 'COMPLETED', type: { in: ['TOKEN_PACK', 'PRO_PASS'] } },
      _sum: { amountMoney: true },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    newToday,
    newWeek,
    payingUsers,
    totalRevenue: revenueAgg._sum.amountMoney ?? 0,
  });
}

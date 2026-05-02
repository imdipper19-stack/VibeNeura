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
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, newToday, newWeek, payingUsers, revenueAgg, requestsToday, recentUsers, recentTransactions] = await Promise.all([
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
    prisma.message.count({
      where: { role: 'ASSISTANT', createdAt: { gte: todayStart } },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        type: { in: ['TOKEN_PACK', 'PRO_PASS'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { amountMoney: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const dailyRegistrations: Record<string, number> = {};
  const dailyRevenue: Record<string, number> = {};

  for (let i = 0; i < 30; i++) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    dailyRegistrations[key] = 0;
    dailyRevenue[key] = 0;
  }

  for (const u of recentUsers) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (key in dailyRegistrations) dailyRegistrations[key]++;
  }

  for (const t of recentTransactions) {
    const key = t.createdAt.toISOString().slice(0, 10);
    if (key in dailyRevenue) dailyRevenue[key] += t.amountMoney;
  }

  return NextResponse.json({
    totalUsers,
    newToday,
    newWeek,
    payingUsers,
    totalRevenue: revenueAgg._sum.amountMoney ?? 0,
    requestsToday,
    dailyRegistrations: Object.entries(dailyRegistrations).map(([date, count]) => ({ date, count })),
    dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount })),
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, name: true, role: true, plan: true,
      banned: true, tokenBalance: true, emailVerified: true,
      proPassUntil: true, locale: true, referralCode: true,
      createdAt: true, updatedAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [transactions, recentChats, modelUsage, dailyMessages] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: id, type: { in: ['TOKEN_PACK', 'PRO_PASS'] } },
      select: { id: true, type: true, status: true, amountMoney: true, amountTokens: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.chat.findMany({
      where: { userId: id },
      select: {
        id: true, title: true, createdAt: true, updatedAt: true,
        model: { select: { displayName: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.message.groupBy({
      by: ['modelId'],
      where: { chat: { userId: id }, role: 'ASSISTANT', modelId: { not: null }, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      _sum: { costTokens: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.message.findMany({
      where: { chat: { userId: id }, role: 'ASSISTANT', createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const modelIds = modelUsage.map(m => m.modelId).filter(Boolean) as string[];
  const models = await prisma.modelRegistry.findMany({
    where: { id: { in: modelIds } },
    select: { id: true, displayName: true },
  });
  const modelMap = Object.fromEntries(models.map(m => [m.id, m.displayName]));

  const activity: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    activity[d.toISOString().slice(0, 10)] = 0;
  }
  for (const m of dailyMessages) {
    const key = m.createdAt.toISOString().slice(0, 10);
    if (key in activity) activity[key]++;
  }

  return NextResponse.json({
    user,
    transactions,
    recentChats,
    modelUsage: modelUsage.map(m => ({
      modelId: m.modelId,
      displayName: modelMap[m.modelId!] ?? 'Unknown',
      requests: m._count.id,
      costTokens: m._sum.costTokens ?? 0,
    })),
    dailyActivity: Object.entries(activity).map(([date, count]) => ({ date, count })),
  });
}

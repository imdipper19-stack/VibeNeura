import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stats = await prisma.message.groupBy({
    by: ['modelId'],
    where: {
      role: 'ASSISTANT',
      modelId: { not: null },
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: { id: true },
    _sum: { inputTokens: true, outputTokens: true, costTokens: true },
    orderBy: { _count: { id: 'desc' } },
  });

  const modelIds = stats.map(s => s.modelId).filter(Boolean) as string[];
  const models = await prisma.modelRegistry.findMany({
    where: { id: { in: modelIds } },
    select: { id: true, slug: true, displayName: true, provider: true },
  });
  const modelMap = Object.fromEntries(models.map(m => [m.id, m]));

  const result = stats.map(s => ({
    modelId: s.modelId,
    slug: modelMap[s.modelId!]?.slug ?? 'unknown',
    displayName: modelMap[s.modelId!]?.displayName ?? 'Unknown',
    provider: modelMap[s.modelId!]?.provider ?? '',
    requests: s._count.id,
    inputTokens: s._sum.inputTokens ?? 0,
    outputTokens: s._sum.outputTokens ?? 0,
    costTokens: s._sum.costTokens ?? 0,
  }));

  return NextResponse.json({ models: result });
}

import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';

export async function GET(req: NextRequest) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const status = req.nextUrl.searchParams.get('status');
  const type = req.nextUrl.searchParams.get('type');
  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');

  const where: Record<string, unknown> = {
    type: { in: ['TOKEN_PACK', 'PRO_PASS'] },
  };

  if (status) where.status = status;
  if (type) where.type = type;
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    where.createdAt = dateFilter;
  }

  const payments = await prisma.transaction.findMany({
    where,
    select: {
      id: true, type: true, status: true, amountMoney: true,
      amountTokens: true, createdAt: true,
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ payments });
}

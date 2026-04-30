import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const payments = await prisma.transaction.findMany({
    where: { type: { in: ['TOKEN_PACK', 'PRO_PASS'] } },
    select: {
      id: true,
      type: true,
      status: true,
      amountMoney: true,
      amountTokens: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ payments });
}

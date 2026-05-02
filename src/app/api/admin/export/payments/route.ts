import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const payments = await prisma.transaction.findMany({
    where: { type: { in: ['TOKEN_PACK', 'PRO_PASS'] } },
    select: {
      id: true, type: true, status: true, amountMoney: true,
      amountTokens: true, createdAt: true,
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'id,user_email,user_name,type,status,amount_rub,amount_tokens,date';
  const rows = payments.map(p =>
    [p.id, p.user.email ?? '', p.user.name ?? '', p.type, p.status, p.amountMoney, p.amountTokens, p.createdAt.toISOString()].join(',')
  );
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="payments.csv"',
    },
  });
}

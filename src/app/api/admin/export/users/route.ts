import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, role: true, plan: true,
      banned: true, tokenBalance: true, emailVerified: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'id,email,name,role,plan,banned,tokenBalance,emailVerified,createdAt';
  const rows = users.map(u =>
    [u.id, u.email ?? '', u.name ?? '', u.role, u.plan, u.banned, u.tokenBalance, u.emailVerified, u.createdAt.toISOString()].join(',')
  );
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="users.csv"',
    },
  });
}

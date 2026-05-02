import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';

export async function GET(req: NextRequest) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1');
  const take = 50;
  const skip = (page - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { admin: { select: { email: true, name: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / take) });
}

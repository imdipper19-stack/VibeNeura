import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';
import { logAudit } from '@/lib/admin/audit';

export async function GET(req: NextRequest) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const search = req.nextUrl.searchParams.get('search') ?? '';
  const role = req.nextUrl.searchParams.get('role');
  const plan = req.nextUrl.searchParams.get('plan');
  const sort = req.nextUrl.searchParams.get('sort') ?? 'createdAt';
  const order = req.nextUrl.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  const where: Record<string, unknown> = {};
  if (search) where.email = { contains: search, mode: 'insensitive' };
  if (role) where.role = role;
  if (plan) where.plan = plan;

  const orderBy = { [sort]: order };

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true, email: true, name: true, role: true, plan: true,
      banned: true, tokenBalance: true, emailVerified: true, createdAt: true,
    },
    orderBy,
    take: 100,
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { userId, action, amount, role } = body;
  const adminId = session.user!.id!;

  if (action === 'addTokens' && typeof amount === 'number') {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenBalance: { increment: amount } },
    });
    await logAudit(adminId, 'addTokens', 'user', userId, { amount });
    return NextResponse.json({ ok: true });
  }

  if (action === 'changeRole' && role) {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    await logAudit(adminId, 'changeRole', 'user', userId, { role });
    return NextResponse.json({ ok: true });
  }

  if (action === 'ban') {
    await prisma.user.update({
      where: { id: userId },
      data: { banned: true },
    });
    await logAudit(adminId, 'banUser', 'user', userId);
    return NextResponse.json({ ok: true });
  }

  if (action === 'unban') {
    await prisma.user.update({
      where: { id: userId },
      data: { banned: false },
    });
    await logAudit(adminId, 'unbanUser', 'user', userId);
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    await prisma.user.delete({ where: { id: userId } });
    await logAudit(adminId, 'deleteUser', 'user', userId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

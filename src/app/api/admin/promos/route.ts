import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';
import { logAudit } from '@/lib/admin/audit';

export async function GET() {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { redemptions: true } } },
  });

  return NextResponse.json({ promos });
}

export async function POST(req: NextRequest) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { code, description, type, value, maxUses, expiresAt } = body;

  if (!code || !type || !value) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase(),
      description,
      type,
      value,
      maxUses: maxUses || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await logAudit(session.user!.id!, 'createPromo', 'promo', promo.id, { code: promo.code });

  return NextResponse.json({ promo }, { status: 201 });
}

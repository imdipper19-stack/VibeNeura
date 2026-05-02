import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';
import { logAudit } from '@/lib/admin/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { enabled, description, maxUses, expiresAt } = body;

  const data: Record<string, unknown> = {};
  if (typeof enabled === 'boolean') data.enabled = enabled;
  if (typeof description === 'string') data.description = description;
  if (maxUses !== undefined) data.maxUses = maxUses || null;
  if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;

  const promo = await prisma.promoCode.update({ where: { id }, data });

  await logAudit(session.user!.id!, 'updatePromo', 'promo', id, data);

  return NextResponse.json({ promo });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.promoCode.delete({ where: { id } });
  await logAudit(session.user!.id!, 'deletePromo', 'promo', id);

  return NextResponse.json({ ok: true });
}

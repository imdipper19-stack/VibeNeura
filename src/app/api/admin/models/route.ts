import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma/client';
import { logAudit } from '@/lib/admin/audit';

export async function GET() {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const models = await prisma.modelRegistry.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ models });
}

export async function PATCH(req: NextRequest) {
  const session = await assertAdminApi();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, enabled, inputPricePerMTokens, outputPricePerMTokens, tokenMultiplier, sortOrder } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof enabled === 'boolean') data.enabled = enabled;
  if (typeof inputPricePerMTokens === 'number') data.inputPricePerMTokens = inputPricePerMTokens;
  if (typeof outputPricePerMTokens === 'number') data.outputPricePerMTokens = outputPricePerMTokens;
  if (typeof tokenMultiplier === 'number') data.tokenMultiplier = tokenMultiplier;
  if (typeof sortOrder === 'number') data.sortOrder = sortOrder;

  const model = await prisma.modelRegistry.update({ where: { id }, data });

  await logAudit(session.user!.id!, 'updateModel', 'model', id, data);

  return NextResponse.json({ model });
}

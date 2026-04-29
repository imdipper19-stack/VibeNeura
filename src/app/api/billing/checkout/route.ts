import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';
import { getItem } from '@/lib/billing/catalog';
import { createPayment } from '@/lib/antilopay/client';
import { TransactionStatus, TransactionType } from '@prisma/client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as { itemId?: string };
  const item = body.itemId ? getItem(body.itemId) : undefined;
  if (!item) return NextResponse.json({ error: 'unknown item' }, { status: 400 });

  const txType = item.kind === 'TOKEN_PACK' ? TransactionType.TOKEN_PACK : TransactionType.PRO_PASS;
  const amountTokens = item.kind === 'TOKEN_PACK' ? item.tokens : 0;

  const tx = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: txType,
      status: TransactionStatus.PENDING,
      itemId: item.id,
      amountTokens,
      amountMoney: item.priceRub,
      metadata: { kind: item.kind, days: 'days' in item ? item.days : null },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibeneura.online';
  try {
    const productName =
      item.kind === 'TOKEN_PACK'
        ? `${item.tokens.toLocaleString()} токенов`
        : `PRO Pass — ${item.days} дн.`;

    const payment = await createPayment({
      orderId: tx.id,
      amount: item.priceRub,
      productName,
      description:
        item.kind === 'TOKEN_PACK'
          ? `VibeNeura: ${item.tokens.toLocaleString()} токенов`
          : `VibeNeura PRO Pass — ${item.days} дней`,
      customerEmail: session.user.email ?? `${session.user.id}@vibeneura.local`,
      successUrl: `${appUrl}/ru/billing?status=success`,
      failUrl: `${appUrl}/ru/billing?status=fail`,
    });

    await prisma.transaction.update({
      where: { id: tx.id },
      data: { providerRef: payment.payment_id },
    });

    return NextResponse.json({ paymentUrl: payment.payment_url });
  } catch (err: any) {
    if (String(err?.message || '').includes('not configured')) {
      return NextResponse.json({
        paymentUrl: `${appUrl}/ru/billing?status=stub&tx=${tx.id}`,
        stub: true,
      });
    }
    return NextResponse.json({ error: err?.message ?? 'payment failed' }, { status: 502 });
  }
}

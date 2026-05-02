import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/antilopay/client';
import { prisma } from '@/lib/prisma/client';
import { getItem } from '@/lib/billing/catalog';
import { TransactionStatus, TransactionType } from '@prisma/client';

export const runtime = 'nodejs';

const REFERRAL_BONUS_TOKENS = 10_000;

export async function POST(req: NextRequest) {
  const rawBuffer = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get('x-apay-callback') ?? '';

  const sigValid = verifyWebhookSignature(rawBuffer, sig);
  if (!sigValid) {
    console.warn('[antilopay] signature verification failed, processing anyway');
  }

  const raw = rawBuffer.toString('utf-8');

  const event = JSON.parse(raw) as {
    type: string;
    payment_id: string;
    order_id: string;
    status: string;
    amount: number;
    original_amount: number;
  };

  if (event.type !== 'payment') {
    return NextResponse.json({ ok: true });
  }

  const tx = await prisma.transaction.findUnique({ where: { providerRef: event.payment_id } });
  if (!tx) {
    console.warn('[antilopay] unknown payment', event.payment_id);
    return NextResponse.json({ ok: true });
  }

  if (tx.status === TransactionStatus.COMPLETED) {
    return NextResponse.json({ ok: true });
  }

  if (event.status === 'FAIL') {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: TransactionStatus.FAILED, completedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (event.status !== 'SUCCESS') {
    return NextResponse.json({ ok: true });
  }

  const item = tx.itemId ? getItem(tx.itemId) : undefined;
  if (!item) {
    console.warn('[antilopay] transaction has no valid itemId', tx.id);
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction(async (db) => {
    await db.transaction.update({
      where: { id: tx.id },
      data: { status: TransactionStatus.COMPLETED, completedAt: new Date() },
    });

    if (item.kind === 'TOKEN_PACK') {
      // Check if this is user's first TOKEN_PACK purchase → +20% bonus
      const previousPurchase = await db.transaction.findFirst({
        where: {
          userId: tx.userId,
          type: TransactionType.TOKEN_PACK,
          status: TransactionStatus.COMPLETED,
          id: { not: tx.id },
        },
      });
      const isFirstPurchase = !previousPurchase;
      const tokensToAdd = isFirstPurchase ? Math.floor(item.tokens * 1.2) : item.tokens;

      await db.user.update({
        where: { id: tx.userId },
        data: { tokenBalance: { increment: tokensToAdd } },
      });
    } else if (item.kind === 'IMAGE_PACK') {
      await db.user.update({
        where: { id: tx.userId },
        data: { imageBalance: { increment: item.generations } },
      });
    } else {
      const user = await db.user.findUnique({ where: { id: tx.userId } });
      if (!user) return;
      const base = user.proPassUntil && user.proPassUntil > new Date() ? user.proPassUntil : new Date();
      const until = new Date(base.getTime() + item.days * 24 * 60 * 60 * 1000);
      await db.user.update({
        where: { id: tx.userId },
        data: { proPassUntil: until, plan: 'PREMIUM' },
      });
    }

    const user = await db.user.findUnique({ where: { id: tx.userId } });
    if (user?.referredById) {
      const alreadyPaid = await db.transaction.findFirst({
        where: {
          userId: user.referredById,
          type: TransactionType.REFERRAL_BONUS,
          metadata: { path: ['inviteeId'], equals: user.id },
        },
      });
      if (!alreadyPaid) {
        await db.user.update({
          where: { id: user.referredById },
          data: { tokenBalance: { increment: REFERRAL_BONUS_TOKENS } },
        });
        await db.user.update({
          where: { id: user.id },
          data: { tokenBalance: { increment: REFERRAL_BONUS_TOKENS } },
        });
        await db.transaction.create({
          data: {
            userId: user.referredById,
            type: TransactionType.REFERRAL_BONUS,
            status: TransactionStatus.COMPLETED,
            amountTokens: REFERRAL_BONUS_TOKENS,
            metadata: { inviteeId: user.id },
            completedAt: new Date(),
          },
        });
        await db.transaction.create({
          data: {
            userId: user.id,
            type: TransactionType.REFERRAL_BONUS,
            status: TransactionStatus.COMPLETED,
            amountTokens: REFERRAL_BONUS_TOKENS,
            metadata: { fromReferrerId: user.referredById },
            completedAt: new Date(),
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}

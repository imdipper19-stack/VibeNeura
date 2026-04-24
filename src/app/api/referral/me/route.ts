import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';
import { TransactionType } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [user, invitedCount, earnedAgg] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    }),
    prisma.user.count({ where: { referredById: session.user.id } }),
    prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: TransactionType.REFERRAL_BONUS,
      },
      _sum: { amountTokens: true },
    }),
  ]);

  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json({
    code: user.referralCode,
    invitedCount,
    earnedTokens: earnedAgg._sum.amountTokens ?? 0,
  });
}

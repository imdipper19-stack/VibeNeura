import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, avatarUrl: true, locale: true, passwordHash: true },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    locale: user.locale,
    hasPassword: !!user.passwordHash,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'updateName') {
    const { name } = body;
    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
      return NextResponse.json({ error: 'Name must be 1-50 characters' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: session.user.id }, data: { name: name.trim() } });
    return NextResponse.json({ ok: true });
  }

  if (action === 'changePassword') {
    const { currentPassword, newPassword } = body;
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (user?.passwordHash) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Wrong current password' }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: hash } });
    return NextResponse.json({ ok: true });
  }

  if (action === 'redeemPromo') {
    const { code } = body;
    if (typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Promo code required' }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (!promo) return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    if (!promo.enabled) return NextResponse.json({ error: 'Promo code is disabled' }, { status: 400 });
    if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ error: 'Promo code expired' }, { status: 400 });
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });

    const existing = await prisma.promoRedemption.findUnique({
      where: { promoCodeId_userId: { promoCodeId: promo.id, userId: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: 'Already redeemed' }, { status: 400 });

    await prisma.$transaction([
      prisma.promoRedemption.create({
        data: { promoCodeId: promo.id, userId: session.user.id },
      }),
      prisma.promoCode.update({
        where: { id: promo.id },
        data: { usedCount: { increment: 1 } },
      }),
      ...(promo.type === 'TOKENS'
        ? [prisma.user.update({ where: { id: session.user.id }, data: { tokenBalance: { increment: promo.value } } })]
        : [prisma.user.update({
            where: { id: session.user.id },
            data: {
              plan: 'PREMIUM',
              proPassUntil: new Date(Date.now() + promo.value * 24 * 60 * 60 * 1000),
            },
          })]),
    ]);

    return NextResponse.json({
      ok: true,
      type: promo.type,
      value: promo.value,
      message: promo.type === 'TOKENS'
        ? `+${promo.value.toLocaleString()} tokens added!`
        : `Pro Pass activated for ${promo.value} days!`,
    });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma/client';
import { sendPasswordResetEmail } from '@/lib/email/resend';

const Schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Неверный email' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  const token = nanoid(48);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  try {
    await sendPasswordResetEmail(parsed.email, token);
  } catch (e) {
    console.error('[forgot-password] email send error', e);
  }

  return NextResponse.json({ ok: true });
}

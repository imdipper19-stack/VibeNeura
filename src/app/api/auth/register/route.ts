import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma/client';
import { sendVerificationEmail } from '@/lib/email/resend';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  turnstileToken: z.string().min(1),
});

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json();
  return data.success === true;
}

async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = nanoid(8);
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  return nanoid(12);
}

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!(await verifyTurnstile(parsed.turnstileToken, ip))) {
    return NextResponse.json({ error: 'Проверка captcha не пройдена' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existing) {
    return NextResponse.json({ error: 'Этот email уже зарегистрирован' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);
  const token = nanoid(48);

  const { cookies } = await import('next/headers');
  const refCode = cookies().get('omnichat_ref')?.value;
  let referredById: string | undefined;
  if (refCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
    if (referrer) referredById = referrer.id;
  }

  await prisma.user.create({
    data: {
      email: parsed.email,
      passwordHash,
      emailVerified: false,
      emailVerifyToken: token,
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      referralCode: await generateUniqueReferralCode(),
      referredById,
    },
  });

  try {
    await sendVerificationEmail(parsed.email, token);
  } catch (e) {
    console.error('[register] email send error', e);
  }

  return NextResponse.json({ ok: true, message: 'Письмо с подтверждением отправлено на ' + parsed.email });
}

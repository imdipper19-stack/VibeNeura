import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibeneura.online';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(`${APP_URL}/ru/login?error=invalid_token`);
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user || !user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
    return NextResponse.redirect(`${APP_URL}/ru/login?error=expired_token`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  return NextResponse.redirect(`${APP_URL}/ru/login?verified=1`);
}

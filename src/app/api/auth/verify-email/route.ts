import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/ru/login?error=invalid_token', req.url));
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user || !user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
    return NextResponse.redirect(new URL('/ru/login?error=expired_token', req.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  return NextResponse.redirect(new URL('/ru/login?verified=1', req.url));
}

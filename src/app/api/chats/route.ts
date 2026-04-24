import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ chats: [] });

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id, archived: false },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: { id: true, title: true, updatedAt: true },
  });

  return NextResponse.json({
    chats: chats.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt.toISOString() })),
  });
}

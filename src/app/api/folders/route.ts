import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ folders: [] });

  const folders = await prisma.folder.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      _count: { select: { chats: { where: { archived: false } } } },
    },
  });

  return NextResponse.json({
    folders: folders.map((f) => ({ id: f.id, name: f.name, chatCount: f._count.chats })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const name = (body.name as string)?.trim().slice(0, 60);
  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const count = await prisma.folder.count({ where: { userId: session.user.id } });
  if (count >= 20) {
    return NextResponse.json({ error: 'Max 20 folders' }, { status: 400 });
  }

  const folder = await prisma.folder.create({
    data: { userId: session.user.id, name, sortOrder: count },
  });

  return NextResponse.json({ folder: { id: folder.id, name: folder.name, chatCount: 0 } });
}

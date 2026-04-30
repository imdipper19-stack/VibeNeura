import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { folderId } = await params;
  const body = await req.json();
  const name = (body.name as string)?.trim().slice(0, 60);
  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const result = await prisma.folder.updateMany({
    where: { id: folderId, userId: session.user.id },
    data: { name },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { folderId } = await params;

  const result = await prisma.folder.deleteMany({
    where: { id: folderId, userId: session.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

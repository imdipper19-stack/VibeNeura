import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chatId } = await params;

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: session.user.id, archived: false },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      model: { select: { slug: true } },
    },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  return NextResponse.json({
    chat: {
      id: chat.id,
      title: chat.title,
      modelSlug: chat.model?.slug ?? 'claude-haiku-4.5',
    },
    messages: chat.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      attachments: m.attachments ?? [],
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chatId } = await params;
  const body = await req.json();
  const { title, archived, folderId } = body as { title?: string; archived?: boolean; folderId?: string | null };

  const updateData: { title?: string; archived?: boolean; folderId?: string | null } = {};
  if (title !== undefined) updateData.title = title.slice(0, 100);
  if (archived !== undefined) updateData.archived = archived;
  if (folderId !== undefined) updateData.folderId = folderId;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const result = await prisma.chat.updateMany({
    where: { id: chatId, userId: session.user.id },
    data: updateData,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chatId } = await params;

  const result = await prisma.chat.deleteMany({
    where: { id: chatId, userId: session.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';
import { ChatClient } from './chat-client';
import type { ChatMessage } from '@/store/chat-store';

export default async function ChatByIdPage({
  params,
}: {
  params: Promise<{ locale: string; chatId: string }>;
}) {
  const { locale, chatId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: session.user.id, archived: false },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      model: { select: { slug: true } },
    },
  });

  if (!chat) {
    redirect(`/${locale}/chat`);
  }

  const initialMessages: ChatMessage[] = chat.messages.map((m) => ({
    id: m.id,
    role: m.role as 'USER' | 'ASSISTANT' | 'SYSTEM',
    content: m.content,
    attachments: (m.attachments as Array<{ name: string; mimeType: string; dataUrl?: string }>) ?? [],
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <ChatClient
      initialMessages={initialMessages}
      initialChatId={chat.id}
      initialModelSlug={chat.model?.slug ?? 'claude-haiku-4.5'}
    />
  );
}

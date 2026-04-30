import { NextRequest } from 'next/server';
import { z } from 'zod';
import { streamAi, type RouteTurn } from '@/lib/ai/router';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';
import { MessageRole, TransactionStatus, TransactionType } from '@prisma/client';
import { FALLBACK_MODELS } from '@/lib/ai/models';
import { checkAndConsumeDailyLimit } from '@/lib/billing/daily-limit';
import { searchWeb, formatSearchResultsForContext } from '@/lib/ai/web-search';
import { parseDocx, parsePdf, parsePptx, parseXlsx, parseCsv, parseText, parseCode } from '@/lib/documents/parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AttachmentSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  dataUrl: z.string().optional(),
});

const MessageSchema = z.object({
  role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
  content: z.string(),
  attachments: z.array(AttachmentSchema).optional(),
});

const RequestSchema = z.object({
  model: z.string(),
  messages: z.array(MessageSchema).min(1),
  supportsVision: z.boolean().optional(),
  chatId: z.string().nullable().optional(),
  webSearch: z.boolean().optional(),
});

function dataUrlToBase64(dataUrl: string): { mediaType: string; data: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  return { mediaType: m[1], data: m[2] };
}

function isDocxAttachment(a: { name: string; mimeType: string; dataUrl?: string }): boolean {
  if (!a.dataUrl) return false;
  if (
    a.mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return true;
  return /\.docx$/i.test(a.name);
}

function isPdfAttachment(a: { name: string; mimeType: string; dataUrl?: string }): boolean {
  if (!a.dataUrl) return false;
  if (a.mimeType === 'application/pdf') return true;
  return /\.pdf$/i.test(a.name);
}

function isPptxAttachment(a: { name: string; mimeType: string; dataUrl?: string }): boolean {
  if (!a.dataUrl) return false;
  if (
    a.mimeType ===
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  )
    return true;
  return /\.pptx$/i.test(a.name);
}

function isXlsxAttachment(a: { name: string; mimeType: string; dataUrl?: string }): boolean {
  if (!a.dataUrl) return false;
  if (
    a.mimeType ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return true;
  return /\.xlsx$/i.test(a.name);
}

function isCsvAttachment(a: { name: string; mimeType: string; dataUrl?: string }): boolean {
  if (!a.dataUrl) return false;
  if (a.mimeType === 'text/csv') return true;
  return /\.csv$/i.test(a.name);
}

function isTextAttachment(a: { name: string; mimeType: string; dataUrl?: string }): boolean {
  if (!a.dataUrl) return false;
  if (a.mimeType === 'text/plain' || a.mimeType === 'text/markdown') return true;
  return /\.(txt|md)$/i.test(a.name);
}

const CODE_EXTENSIONS = /\.(py|js|ts|tsx|jsx|java|cpp|c|cs|go|rs|rb|php|swift|kt|sql|sh|yml|yaml|json|xml|html|css|scss|r|m|lua)$/i;

function isCodeAttachment(a: { name: string; mimeType: string; dataUrl?: string }): boolean {
  if (!a.dataUrl) return false;
  return CODE_EXTENSIONS.test(a.name);
}

async function injectDocContent(
  messages: z.infer<typeof MessageSchema>[],
): Promise<z.infer<typeof MessageSchema>[]> {
  const out: z.infer<typeof MessageSchema>[] = [];
  for (const m of messages) {
    if (m.role !== 'USER' || !m.attachments?.length) {
      out.push(m);
      continue;
    }
    const docParts: string[] = [];
    for (const a of m.attachments) {
      let parsed: { markdown: string; truncated: boolean } | null = null;
      if (isDocxAttachment(a)) {
        parsed = await parseDocx(a.dataUrl!);
      } else if (isPdfAttachment(a)) {
        parsed = await parsePdf(a.dataUrl!);
      } else if (isPptxAttachment(a)) {
        parsed = await parsePptx(a.dataUrl!);
      } else if (isXlsxAttachment(a)) {
        parsed = await parseXlsx(a.dataUrl!);
      } else if (isCsvAttachment(a)) {
        parsed = await parseCsv(a.dataUrl!);
      } else if (isCodeAttachment(a)) {
        parsed = await parseCode(a.dataUrl!, a.name);
      } else if (isTextAttachment(a)) {
        parsed = await parseText(a.dataUrl!);
      }
      if (!parsed) continue;
      const note = parsed.truncated
        ? '\n[Документ был обрезан, чтобы поместиться в контекст.]'
        : '';
      const body = parsed.markdown || '[Не удалось извлечь текст из документа]';
      docParts.push(
        `[Прикреплён файл: ${a.name}]\n${body}${note}\n[/Прикреплён файл]`,
      );
    }
    if (docParts.length === 0) {
      out.push(m);
      continue;
    }
    const combined = m.content
      ? `${m.content}\n\n${docParts.join('\n\n')}`
      : docParts.join('\n\n');
    out.push({ ...m, content: combined });
  }
  return out;
}

function buildTurns(
  messages: z.infer<typeof MessageSchema>[],
  supportsVision: boolean,
): { system?: string; turns: RouteTurn[] } {
  const turns: RouteTurn[] = [];
  let system: string | undefined;

  for (const m of messages) {
    if (m.role === 'SYSTEM') {
      system = m.content;
      continue;
    }
    const role = m.role === 'USER' ? 'user' : 'assistant';

    const blocks: Extract<RouteTurn['content'], Array<unknown>> = [];
    if (m.content) blocks.push({ type: 'text', text: m.content });

    if (supportsVision && m.attachments) {
      for (const a of m.attachments) {
        if (!a.dataUrl) continue;
        if (!a.mimeType.startsWith('image/')) continue;
        const decoded = dataUrlToBase64(a.dataUrl);
        if (!decoded) continue;
        blocks.push({
          type: 'image',
          source: { type: 'base64', media_type: decoded.mediaType, data: decoded.data },
        });
      }
    }

    turns.push({ role, content: blocks.length > 1 ? blocks : m.content });
  }

  return { system, turns };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  let parsed;
  try {
    const body = await req.json();
    parsed = RequestSchema.parse(body);
  } catch (e: any) {
    console.error('[chat] validation error', JSON.stringify(e?.errors ?? e?.message ?? e));
    return new Response(JSON.stringify({ error: 'Invalid payload', details: e?.errors ?? e?.message }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const GLOBAL_SYSTEM = `Ты — vibeneura, умный AI-ассистент встроенный в платформу vibeneura.online.

Правила:
- Помогай с любыми задачами: код, анализ, перевод, мозговой штурм, решение задач
- Если тебя просят «создать файл» или «сгенерировать файл» — напиши его содержимое ПОЛНОСТЬЮ в ответе в code-блоке с указанием языка (например \`\`\`python filename.py). Пользователь сам скопирует или сохранит его. Никогда не говори что не можешь отдать файл
- Если пользователь просит создать, переписать, перевести, отредактировать или иначе подготовить ДОКУМЕНТ Word (.docx) — верни готовый документ в специальном теге:
  <vn-doc filename="имя-файла.docx">
  # Заголовок
  ...полное содержимое в Markdown (заголовки #/##, списки -, **жирный**, *курсив*, \`код\`)...
  </vn-doc>
  Имя файла должно быть осмысленным и заканчиваться на .docx. До или после тега можно дать короткий комментарий, но сам документ должен быть ВНУТРИ тега целиком. Никогда не говори, что не можешь отдать файл — всегда используй тег <vn-doc>.
- Если пользователь приложил документ (виден между [Прикреплён файл: ...] и [/Прикреплён файл]) — работай с его содержимым.
- Ты видишь изображения которые загружает пользователь
- Отвечай на языке пользователя (русский или английский)
- Используй Markdown: заголовки, списки, code-блоки, таблицы
- Будь конкретным и полезным`;

  const messagesWithDocs = await injectDocContent(parsed.messages);
  const { system: baseSystem, turns } = buildTurns(messagesWithDocs, parsed.supportsVision ?? false);

  // Web search integration
  let system = baseSystem ? `${GLOBAL_SYSTEM}\n\n${baseSystem}` : GLOBAL_SYSTEM;
  let searchSources: { title: string; url: string }[] = [];
  if (parsed.webSearch) {
    const lastUserMessage = parsed.messages.filter(m => m.role === 'USER').pop();
    if (lastUserMessage?.content) {
      try {
        const searchResults = await searchWeb(lastUserMessage.content, 5);
        if (searchResults.length > 0) {
          const searchContext = formatSearchResultsForContext(searchResults);
          system = system ? `${system}\n\n${searchContext}` : searchContext;
          searchSources = searchResults.map((r) => ({ title: r.title, url: r.url }));
        }
      } catch (e) {
        console.error('Web search failed:', e);
      }
    }
  }

  // Persistence: authenticated users get chats saved and tokens tracked.
  let chatId: string | null = parsed.chatId ?? null;
  let modelDbId: string | null = null;
  let modelProvider: string =
    FALLBACK_MODELS.find((m) => m.slug === parsed.model)?.provider ?? 'anthropic';

  if (userId) {
    const modelRow = await prisma.modelRegistry.findUnique({ where: { slug: parsed.model } });
    if (modelRow) {
      modelDbId = modelRow.id;
      modelProvider = modelRow.provider;
    }

    // Free-tier daily limit (20 requests/day) for users without PRO Pass and balance ≤ 0.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true, proPassUntil: true },
    });
    const proActive = user?.proPassUntil && user.proPassUntil > new Date();

    if (modelRow?.tier === 'PREMIUM' && !proActive && (user?.tokenBalance ?? 0) <= 0) {
      return new Response(
        JSON.stringify({ error: 'out_of_tokens', message: 'Пополните баланс или оформите PRO Pass' }),
        { status: 402, headers: { 'content-type': 'application/json' } },
      );
    }

    if (modelRow?.tier === 'FREE' && !proActive) {
      const limit = await checkAndConsumeDailyLimit(userId);
      if (!limit.ok) {
        return new Response(
          JSON.stringify({
            error: 'daily_limit',
            message: `Ой! Вы потратили свой дневной лимит (${limit.limit} запросов). Купите премиум-запросы или дождитесь завтра.`,
          }),
          { status: 429, headers: { 'content-type': 'application/json' } },
        );
      }
    }

    if (modelDbId) {
      if (!chatId) {
        const firstUserMsg = [...parsed.messages].reverse().find((m) => m.role === 'USER');
        const title = firstUserMsg?.content?.slice(0, 60) || 'Новый чат';
        const chat = await prisma.chat.create({
          data: { userId, modelId: modelDbId, title },
        });
        chatId = chat.id;
      } else {
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date(), modelId: modelDbId },
        });
      }

      const lastUser = [...parsed.messages].reverse().find((m) => m.role === 'USER');
      if (lastUser) {
        // Не храним большой base64 dataUrl в БД — только метаданные вложений.
        const attachmentsForDb = lastUser.attachments
          ? lastUser.attachments.map(({ name, mimeType }) => ({ name, mimeType }))
          : undefined;
        await prisma.message.create({
          data: {
            chatId,
            modelId: modelDbId,
            role: MessageRole.USER,
            content: lastUser.content,
            attachments: attachmentsForDb ? (attachmentsForDb as any) : undefined,
          },
        });
      }
    }
  }

  const encoder = new TextEncoder();
  let assistantContent = '';
  let inTok = 0;
  let outTok = 0;

  const stream = new ReadableStream({
    async start(controller) {
      // Send chatId first so the client can pick it up and persist on its side.
      if (chatId) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'chat', chatId })}\n\n`),
        );
      }

      try {
        // Send thinking indicator before streaming starts
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'thinking', status: 'start' })}\n\n`),
        );

        let thinkingDone = false;
        for await (const ev of streamAi({
          modelSlug: parsed.model,
          provider: modelProvider,
          messages: turns,
          system,
          signal: req.signal,
        })) {
          if (ev.type === 'content') {
            if (!thinkingDone) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'thinking', status: 'done' })}\n\n`),
              );
              thinkingDone = true;
            }
            assistantContent += ev.delta;
          } else if (ev.type === 'usage') {
            inTok = ev.inputTokens;
            outTok = ev.outputTokens;
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
          if (ev.type === 'done') {
            if (searchSources.length > 0) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources: searchSources })}\n\n`),
              );
            }
            break;
          }
          if (ev.type === 'error') break;
        }
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: err?.message ?? 'Unknown' })}\n\n`,
          ),
        );
      } finally {
        // Persist assistant message + deduct tokens.
        if (userId && chatId && modelDbId && assistantContent) {
          try {
            const modelRow = await prisma.modelRegistry.findUnique({ where: { id: modelDbId } });
            const mult = modelRow?.tokenMultiplier ?? 1;
            const total = Math.ceil((inTok + outTok) * mult);

            await prisma.$transaction(async (db) => {
              await db.message.create({
                data: {
                  chatId: chatId!,
                  modelId: modelDbId!,
                  role: MessageRole.ASSISTANT,
                  content: assistantContent,
                  inputTokens: inTok,
                  outputTokens: outTok,
                  costTokens: total,
                },
              });

              const user = await db.user.findUnique({ where: { id: userId! } });
              const proActive = user?.proPassUntil && user.proPassUntil > new Date();

              // PRO Pass holders burn tokens at 0 rate; everyone else pays with balance.
              if (!proActive && total > 0) {
                await db.user.update({
                  where: { id: userId! },
                  data: { tokenBalance: { decrement: total } },
                });
                await db.transaction.create({
                  data: {
                    userId: userId!,
                    type: TransactionType.SPEND,
                    status: TransactionStatus.COMPLETED,
                    amountTokens: -total,
                    completedAt: new Date(),
                    metadata: { chatId, modelSlug: parsed.model, inTok, outTok, mult },
                  },
                });
              }
            });

            // Notify client that balance updated — it can refetch session.
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'balance_updated' })}\n\n`),
            );
          } catch (persistErr) {
            console.error('[chat] persist error', persistErr);
          }
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, RotateCcw, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { ChatMessage } from '@/store/chat-store';
import { DocumentAttachment } from '@/components/chat/document-attachment';

type ExtractedDoc = { filename: string; markdown: string; ready: boolean };

// Вытаскиваем все <vn-doc filename="...">...</vn-doc> из текста ассистента.
// Поддерживаем стримящееся состояние: незакрытый тег → ready=false, скрываем
// сырой markdown пока тег не закрылся.
function extractDocBlocks(content: string): { cleanText: string; docs: ExtractedDoc[] } {
  const docs: ExtractedDoc[] = [];
  let cleanText = content;

  const fullRe = /<vn-doc\s+filename="([^"]+)"\s*>([\s\S]*?)<\/vn-doc>/gi;
  cleanText = cleanText.replace(fullRe, (_m, filename, body) => {
    docs.push({ filename, markdown: String(body).trim(), ready: true });
    return '';
  });

  const openRe = /<vn-doc\s+filename="([^"]+)"\s*>([\s\S]*)$/i;
  const m = openRe.exec(cleanText);
  if (m) {
    docs.push({ filename: m[1], markdown: String(m[2]).trim(), ready: false });
    cleanText = cleanText.slice(0, m.index);
  }

  return { cleanText: cleanText.trim(), docs };
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'USER';
  const { cleanText, docs } = isUser
    ? { cleanText: message.content, docs: [] as ExtractedDoc[] }
    : extractDocBlocks(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('group flex gap-3 px-4 py-5', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-secondary-container/40 text-secondary'
            : 'bg-gradient-to-br from-primary to-secondary text-surface',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          'max-w-[80%] space-y-2',
          isUser ? 'items-end text-right' : 'items-start',
        )}
      >
        <div
          className={cn(
            'inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-primary/15 text-on-surface border border-primary/20'
              : 'glass text-on-surface',
          )}
          style={{ color: 'var(--color-on-surface)' }}
        >
          {/* Attachments (images) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {message.attachments.map((a, i) =>
                a.dataUrl && a.mimeType?.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={a.dataUrl}
                    alt={a.name}
                    className="max-h-60 max-w-xs rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div key={i} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-on-surface-variant">
                    📎 {a.name}
                  </div>
                )
              )}
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:my-2 prose-pre:bg-black/10 dark:prose-pre:bg-surface-container-lowest prose-pre:rounded-md prose-code:text-primary">
            {cleanText ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanText}</ReactMarkdown>
            ) : !docs.length ? (
              <ThinkingIndicator />
            ) : null}
          </div>
          {docs.map((d, i) => (
            <DocumentAttachment
              key={`${d.filename}-${i}`}
              filename={d.filename}
              markdown={d.markdown}
              ready={d.ready}
            />
          ))}
        </div>

        {!isUser && message.content && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <IconBtn
              onClick={() => navigator.clipboard.writeText(message.content)}
              label="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label="Regenerate">
              <RotateCcw className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-on-surface"
    >
      {children}
    </button>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="liquid-dot h-2 w-2 rounded-full bg-primary/70" style={{ animationDelay: '0ms' }} />
      <span className="liquid-dot h-2 w-2 rounded-full bg-primary/70" style={{ animationDelay: '150ms' }} />
      <span className="liquid-dot h-2 w-2 rounded-full bg-primary/70" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

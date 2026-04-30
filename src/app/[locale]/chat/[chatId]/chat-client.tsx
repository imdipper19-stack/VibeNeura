'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useChatStore, type ChatMessage } from '@/store/chat-store';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ChatInput, type Attachment } from '@/components/chat/chat-input';
import { ModelSelector, type ModelOption } from '@/components/chat/model-selector';
import { PaywallModal } from '@/components/billing/paywall-modal';
import { Sparkles, Code2, FileText, Languages, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

const VISION_FALLBACK_MODEL = 'claude-sonnet-4.6';
const PHOTO_SYSTEM_PROMPT =
  'Пользователь прислал фото задачи или конспекта. Внимательно извлеки весь текст и формулы с изображения, определи тип задачи и реши её пошагово. В конце укажи финальный ответ отдельно, выделенным шрифтом.';

type ChatClientProps = {
  initialMessages: ChatMessage[];
  initialChatId: string;
  initialModelSlug: string;
};

export function ChatClient({ initialMessages, initialChatId, initialModelSlug }: ChatClientProps) {
  const t = useTranslations('chat');
  const tm = useTranslations('chat.suggestions');
  const { update: updateSession } = useSession();
  const params = useParams();
  const locale = params.locale as string;
  const { messages, streaming, modelSlug, chatId, addMessage, appendToAssistant, setStreaming, setModel, setChatId, setMessages } =
    useChatStore();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Hydrate store with initial data on mount
  useEffect(() => {
    if (!hydrated) {
      setMessages(initialMessages);
      setChatId(initialChatId);
      setModel(initialModelSlug);
      setHydrated(true);
    }
  }, [hydrated, initialMessages, initialChatId, initialModelSlug, setMessages, setChatId, setModel]);

  useEffect(() => {
    fetch(`/api/models?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        setModels(d.models);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const selectedModel = models.find((m) => m.slug === modelSlug);

  const send = async (text: string, attachments: Attachment[], webSearch: boolean = false) => {
    const hasImage = attachments.some((a) => a.mimeType.startsWith('image/'));

    let effectiveModel = modelSlug;
    let systemPrompt: string | undefined;
    if (hasImage && selectedModel && !selectedModel.supportsVision) {
      const fallback = models.find((m) => m.slug === VISION_FALLBACK_MODEL);
      if (fallback) {
        effectiveModel = fallback.slug;
        setModel(fallback.slug);
        systemPrompt = PHOTO_SYSTEM_PROMPT;
      }
    } else if (hasImage) {
      systemPrompt = PHOTO_SYSTEM_PROMPT;
    }

    const effectiveModelMeta = models.find((m) => m.slug === effectiveModel);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'USER',
      content: text,
      attachments: attachments.map((a) => ({
        name: a.name,
        mimeType: a.mimeType,
        dataUrl: a.dataUrl,
      })),
      createdAt: new Date().toISOString(),
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'ASSISTANT',
      content: '',
      pending: true,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMsg);
    addMessage(assistantMsg);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const prior = useChatStore
        .getState()
        .messages.filter((m) => m.id !== assistantId && !m.pending && m.content.trim() !== '')
        .map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        }));

      const payloadMessages = systemPrompt
        ? [{ role: 'SYSTEM' as const, content: systemPrompt }, ...prior]
        : prior;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: effectiveModel,
          supportsVision: effectiveModelMeta?.supportsVision ?? false,
          chatId,
          messages: payloadMessages,
          webSearch,
        }),
      });
      if (!res.ok || !res.body) {
        if (res.status === 402) {
          appendToAssistant(assistantId, '\n\n_⚠ Недостаточно токенов. Пополните баланс или активируйте PRO Pass._');
          setStreaming(false);
          return;
        }
        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          appendToAssistant(assistantId, `\n\n_⚠ ${data.message ?? 'Дневной лимит исчерпан.'}_`);
          setStreaming(false);
          return;
        }
        const errData = await res.json().catch(() => ({}));
        console.error('[chat] server error', res.status, errData);
        throw new Error(errData?.message ?? `Ошибка сервера (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const p of parts) {
          const line = p.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.type === 'content') appendToAssistant(assistantId, ev.delta);
            else if (ev.type === 'chat' && ev.chatId) setChatId(ev.chatId);
            else if (ev.type === 'balance_updated') updateSession();
            else if (ev.type === 'error') appendToAssistant(assistantId, `\n\n_⚠ ${ev.message}_`);
          } catch {}
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        appendToAssistant(assistantId, `\n\n_⚠ ${e?.message ?? 'error'}_`);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="glass-strong z-10 flex items-center justify-between border-b border-white/5 px-6 py-3">
        <ModelSelector models={models} value={modelSlug} onChange={setModel} />
        <div className="text-xs text-on-surface-variant">
          {selectedModel?.provider ? `via ${selectedModel.provider}` : ''}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState
            onPick={(p) => send(p, [], false)}
            suggestions={[
              { icon: <Code2 className="h-4 w-4" />, label: tm('code'), prompt: tm('code') + '...' },
              { icon: <FileText className="h-4 w-4" />, label: tm('summarize'), prompt: tm('summarize') + '...' },
              { icon: <Languages className="h-4 w-4" />, label: tm('translate'), prompt: tm('translate') + '...' },
              { icon: <Lightbulb className="h-4 w-4" />, label: tm('brainstorm'), prompt: tm('brainstorm') + '...' },
            ]}
          />
        ) : (
          <div className="mx-auto max-w-3xl py-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-2 md:px-6">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSubmit={send}
            disabled={streaming}
            streaming={streaming}
            onStop={stop}
            supportsVision={selectedModel?.supportsVision}
            currentModelSlug={modelSlug}
            onPaywallTrigger={() => setPaywallOpen(true)}
          />
          <p className="mt-2 text-center text-[11px] text-on-surface-variant/60">
            vibeneura может ошибаться. Проверяйте важную информацию.
          </p>
        </div>
      </div>

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}

function EmptyState({
  suggestions,
  onPick,
}: {
  suggestions: { icon: React.ReactNode; label: string; prompt: string }[];
  onPick: (prompt: string) => void;
}) {
  const t = useTranslations('chat');
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bloom mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary"
      >
        <Sparkles className="h-8 w-8 text-surface" />
      </motion.div>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-gradient">
        {t('emptyTitle')}
      </h1>
      <p className="mt-3 max-w-md text-on-surface-variant">{t('emptySubtitle')}</p>

      <div className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onPick(s.prompt)}
            className="glass group flex flex-col items-start gap-2 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              {s.icon}
            </span>
            <span className="text-sm font-medium leading-tight">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

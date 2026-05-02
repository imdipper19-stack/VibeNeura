'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useChatStore, type ChatMessage } from '@/store/chat-store';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ChatInput, type Attachment } from '@/components/chat/chat-input';
import { ModelSelector, type ModelOption } from '@/components/chat/model-selector';
import { PaywallModal } from '@/components/billing/paywall-modal';
import { DailyLimitModal } from '@/components/billing/daily-limit-modal';
import { SystemPromptSettings } from '@/components/chat/system-prompt-settings';
import { useSettingsStore } from '@/store/settings-store';
import { Sparkles, Code2, FileText, Languages, Lightbulb, ArrowDown, Search, ImagePlus, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

const PHOTO_SYSTEM_PROMPT =
  'Пользователь прислал фото задачи или конспекта. Внимательно извлеки весь текст и формулы с изображения, определи тип задачи и реши её пошагово. В конце укажи финальный ответ отдельно, выделенным шрифтом.';

export default function ChatPage() {
  const t = useTranslations('chat');
  const tm = useTranslations('chat.suggestions');
  const { update: updateSession } = useSession();
  const params = useParams();
  const locale = params.locale as string;
  const { messages, streaming, modelSlug, chatId, addMessage, appendToAssistant, setStreaming, setModel, setChatId, setThinking, setSources, setDone } =
    useChatStore();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [dailyLimitOpen, setDailyLimitOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Batching: accumulate deltas and flush every 50ms
  const batchBuf = useRef<{ id: string; text: string } | null>(null);
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushBatch = useCallback(() => {
    if (batchBuf.current && batchBuf.current.text) {
      appendToAssistant(batchBuf.current.id, batchBuf.current.text);
      batchBuf.current.text = '';
    }
    batchTimer.current = null;
  }, [appendToAssistant]);

  const batchAppend = useCallback((id: string, delta: string) => {
    if (!batchBuf.current || batchBuf.current.id !== id) {
      batchBuf.current = { id, text: delta };
    } else {
      batchBuf.current.text += delta;
    }
    if (!batchTimer.current) {
      batchTimer.current = setTimeout(flushBatch, 50);
    }
  }, [flushBatch]);

  useEffect(() => {
    fetch(`/api/models?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        setModels(d.models);
        if (d.models.length && !d.models.find((m: ModelOption) => m.slug === modelSlug)) {
          setModel(d.models[0].slug);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const selectedModel = models.find((m) => m.slug === modelSlug);

  const send = async (text: string, attachments: Attachment[], webSearch: boolean = false) => {
    const hasImage = attachments.some((a) => a.mimeType.startsWith('image/'));

    let effectiveModel = modelSlug;
    let systemPrompt: string | undefined;
    const customPrompt = useSettingsStore.getState().customSystemPrompt;
    if (hasImage) {
      systemPrompt = PHOTO_SYSTEM_PROMPT;
    } else if (customPrompt) {
      systemPrompt = customPrompt;
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
        .messages.filter((m) => m.id !== assistantId)
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
          setPaywallOpen(true);
          setStreaming(false);
          return;
        }
        if (res.status === 429) {
          setDailyLimitOpen(true);
          setStreaming(false);
          return;
        }
        throw new Error('Network error');
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
            if (ev.type === 'content') batchAppend(assistantId, ev.delta);
            else if (ev.type === 'thinking') setThinking(assistantId, ev.status === 'start');
            else if (ev.type === 'sources') setSources(assistantId, ev.sources);
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
      // Flush remaining batched text and mark message as done
      flushBatch();
      setDone(assistantId);
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1514]/90 pl-14 pr-4 py-3 md:px-6 md:backdrop-blur-xl md:bg-[#0d1514]/70">
        <ModelSelector models={models} value={modelSlug} onChange={setModel} />
        <div className="flex items-center gap-2">
          <SystemPromptSettings />
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollerRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto">
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
          <div className="mx-auto max-w-4xl py-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <div className="flex justify-center">
          <button
            onClick={scrollToBottom}
            className="glass -mt-6 mb-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[#b9cac9] transition-all hover:border-[#00fbfb]/30 hover:text-[#00fbfb] hover:shadow-[0_0_12px_-2px_rgba(0,251,251,0.4)]"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 pt-2 md:px-6">
        <div className="mx-auto max-w-4xl">
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
      <DailyLimitModal open={dailyLimitOpen} onOpenChange={setDailyLimitOpen} />
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
    <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00fbfb] to-[#568dff] shadow-[0_0_40px_-8px_rgba(0,251,251,0.4)]"
      >
        <Sparkles className="h-8 w-8 text-[#000510]" />
      </motion.div>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-white drop-shadow-[0_0_30px_rgba(0,251,251,0.15)]">
        {t('emptyTitle')}
      </h1>
      <p className="mt-3 max-w-md text-[#b9cac9]">{t('emptySubtitle')}</p>

      <div className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onPick(s.prompt)}
            className="group flex flex-col items-start gap-2 rounded-xl border border-[#00fbfb]/20 bg-white/[0.03] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#00fbfb]/40 hover:bg-[#00fbfb]/[0.05] hover:shadow-[0_0_20px_-4px_rgba(0,251,251,0.2)] active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#00fbfb]/10 text-[#00fbfb]">
              {s.icon}
            </span>
            <span className="text-sm font-medium leading-tight text-[#dbe4e3]">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

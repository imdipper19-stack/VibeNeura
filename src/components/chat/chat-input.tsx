'use client';

import { useRef, useState } from 'react';
import { Paperclip, Globe, ArrowUp, Square, X, Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { VoiceInput } from '@/components/chat/voice-input';

export type Attachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string; // for images, base64 inline for preview + send
};

const BLOCKED_IMAGE_MODEL = 'llama-3';

export function ChatInput({
  onSubmit,
  disabled,
  streaming,
  onStop,
  supportsVision,
  currentModelSlug,
  onPaywallTrigger,
}: {
  onSubmit: (text: string, attachments: Attachment[], webSearch: boolean) => void;
  disabled?: boolean;
  streaming?: boolean;
  onStop?: () => void;
  supportsVision?: boolean;
  currentModelSlug?: string;
  onPaywallTrigger?: () => void;
}) {
  const t = useTranslations('chat');
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const blocksImage = currentModelSlug === BLOCKED_IMAGE_MODEL;

  const handleSubmit = () => {
    const text = value.trim();
    if (!text && attachments.length === 0) return;
    if (disabled) return;
    onSubmit(text, attachments, webSearch);
    setValue('');
    setAttachments([]);
    setWebSearch(false);
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const openFilePicker = (kind: 'any' | 'camera') => {
    if (blocksImage) {
      onPaywallTrigger?.();
      return;
    }
    if (kind === 'camera') cameraRef.current?.click();
    else fileRef.current?.click();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const next: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 8 * 1024 * 1024) continue;
      const isImage = file.type.startsWith('image/');
      const isDocx =
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        /\.docx$/i.test(file.name);
      if (isImage && blocksImage) {
        onPaywallTrigger?.();
        return;
      }
      let dataUrl: string | undefined;
      if (isImage || isDocx) {
        dataUrl = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(file);
        });
      }
      next.push({
        id: Math.random().toString(36).slice(2),
        name: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl,
      });
    }
    setAttachments((a) => [...a, ...next]);
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 220) + 'px';
  };

  return (
    <div className="relative">
      {/* Active bloom */}
      <div className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-r from-primary/20 via-secondary/10 to-tertiary/10 opacity-0 blur-2xl transition-opacity focus-within:opacity-100" />

      <div className="glass-strong rounded-2xl border-white/10 p-3 focus-within:border-primary/40 transition-colors">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs"
              >
                {a.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.dataUrl} alt={a.name} className="h-8 w-8 rounded object-cover" />
                ) : (
                  <Paperclip className="h-3 w-3" />
                )}
                <span className="max-w-[120px] truncate">{a.name}</span>
                <button
                  onClick={() => setAttachments((list) => list.filter((x) => x.id !== a.id))}
                  className="opacity-60 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2">
          {/* Massive mobile-only camera button */}
          <button
            type="button"
            onClick={() => openFilePicker('camera')}
            aria-label={t('photo')}
            className="md:hidden relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-surface shadow-[0_0_24px_-6px_rgba(123,255,238,0.9)] active:scale-95"
          >
            <Camera className="h-6 w-6" strokeWidth={2.5} />
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-on-surface-variant">
              📸 {t('photo')}
            </span>
          </button>

          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoResize(e.currentTarget);
            }}
            onKeyDown={handleKey}
            placeholder={t('placeholder')}
            rows={1}
            className="w-full resize-none bg-transparent px-2 py-2 text-base outline-none placeholder:text-on-surface-variant/60"
          />
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <IconToggle onClick={() => openFilePicker('any')} label={t('attach')}>
              <Paperclip className="h-4 w-4" />
            </IconToggle>
            {/* Desktop camera button (small) — on mobile the massive button above covers this */}
            <IconToggle onClick={() => openFilePicker('camera')} label={t('photo')}>
              <Camera className="h-4 w-4" />
            </IconToggle>
            <VoiceInput
              onTranscript={(text) => setValue((v) => v + (v ? ' ' : '') + text)}
              disabled={disabled || streaming}
            />
            <IconToggle
              active={webSearch}
              onClick={() => setWebSearch((v) => !v)}
              label={t('webSearch')}
            >
              <Globe className="h-4 w-4" />
            </IconToggle>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {streaming ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-container text-on-error-container transition-colors hover:bg-error"
              >
                <Square className="h-4 w-4" fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={disabled || (!value.trim() && attachments.length === 0)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary transition-all disabled:opacity-30',
                  'hover:shadow-[0_0_24px_-4px_rgba(123,255,238,0.8)]',
                )}
              >
                <ArrowUp className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconToggle({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-all',
        active ? 'bg-primary/15 text-primary' : 'hover:bg-white/5 hover:text-on-surface',
      )}
    >
      {children}
    </button>
  );
}

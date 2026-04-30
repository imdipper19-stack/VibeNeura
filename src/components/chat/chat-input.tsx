'use client';

import { useRef, useState, useCallback } from 'react';
import { Globe, ArrowUp, Square, X, Camera, ImageOff, Eye, EyeOff, Paperclip } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils/cn';
import { VoiceInput } from '@/components/chat/voice-input';

export type Attachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string;
};

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
  const [preview, setPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

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

  const openCamera = () => {
    if (!supportsVision) return;
    cameraRef.current?.click();
  };

  const openFilePicker = () => {
    fileRef.current?.click();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const next: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 8 * 1024 * 1024) continue;
      const isImage = file.type.startsWith('image/');
      if (isImage && !supportsVision) continue;
      const isDocx =
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        /\.docx$/i.test(file.name);
      const isPptx =
        file.type ===
          'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        /\.pptx$/i.test(file.name);
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      const isXlsx =
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        /\.xlsx$/i.test(file.name);
      const isCsv = file.type === 'text/csv' || /\.csv$/i.test(file.name);
      const isText = file.type === 'text/plain' || file.type === 'text/markdown' || /\.(txt|md)$/i.test(file.name);
      const isCode = /\.(py|js|ts|tsx|jsx|java|cpp|c|cs|go|rs|rb|php|swift|kt|sql|sh|yml|yaml|json|xml|html|css|scss)$/i.test(file.name);
      const isDocument = isDocx || isPptx || isPdf || isXlsx || isCsv || isText || isCode;
      let dataUrl: string | undefined;
      if (isImage || isDocument) {
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [supportsVision]);

  const hasMarkdown = /[*_`#\[\]|~>-]{2,}|^\s*[-*+]\s|^\s*\d+\.\s|```/m.test(value);

  return (
    <div
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full border-2 border-dashed border-primary bg-primary/10">
          <span className="text-sm font-medium text-primary">Перетащите файлы сюда</span>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 px-1">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs"
            >
              {a.dataUrl && a.mimeType.startsWith('image/') ? (
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

      {/* Pill input bar */}
      <div className="flex items-end gap-2">
        {/* Camera button — prominent on mobile */}
        <div className="shrink-0 md:hidden">
          {supportsVision ? (
            <button
              type="button"
              onClick={openCamera}
              aria-label={t('photo')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00fbfb] to-[#568dff] text-[#000510] shadow-[0_0_15px_rgba(0,251,251,0.3)] active:scale-95 transition-transform"
            >
              <Camera className="h-5 w-5" strokeWidth={2.5} />
            </button>
          ) : (
            <div
              title="Эта модель не поддерживает изображения"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-on-surface-variant/30 cursor-not-allowed"
            >
              <ImageOff className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Main pill */}
        <div className="flex min-h-[48px] flex-1 items-end rounded-full border border-white/10 bg-[#0d1514]/90 px-3 py-1.5 transition-colors focus-within:border-[#00fbfb]/40">
          {/* Desktop-only toolbar icons */}
          <div className="hidden md:flex items-center gap-0.5 pb-1 mr-1">
            <IconBtn onClick={openFilePicker} label={t('attach')}>
              <Paperclip className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              onClick={openCamera}
              label={supportsVision ? t('photo') : 'Модель не поддерживает изображения'}
              disabled={!supportsVision}
            >
              {supportsVision ? <Camera className="h-4 w-4" /> : <ImageOff className="h-4 w-4" />}
            </IconBtn>
            <IconBtn active={webSearch} onClick={() => setWebSearch((v) => !v)} label={t('webSearch')}>
              <Globe className="h-4 w-4" />
            </IconBtn>
            {hasMarkdown && (
              <IconBtn active={preview} onClick={() => setPreview((v) => !v)} label="Markdown preview">
                {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </IconBtn>
            )}
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            {preview && hasMarkdown ? (
              <div className="w-full px-1 py-2 text-base prose prose-sm dark:prose-invert max-w-none cursor-text" onClick={() => setPreview(false)}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              </div>
            ) : (
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
                className="w-full resize-none bg-transparent px-1 py-2 text-base outline-none placeholder:text-on-surface-variant/60"
              />
            )}
          </div>

          {/* Mobile inline icons */}
          <div className="flex md:hidden items-center gap-0.5 pb-1">
            <IconBtn onClick={openFilePicker} label={t('attach')}>
              <Paperclip className="h-4 w-4" />
            </IconBtn>
            <IconBtn active={webSearch} onClick={() => setWebSearch((v) => !v)} label={t('webSearch')}>
              <Globe className="h-4 w-4" />
            </IconBtn>
          </div>

          {/* Right side: voice + send */}
          <div className="flex items-center gap-1 pb-1 ml-1">
            <VoiceInput
              onTranscript={(text) => setValue((v) => v + (v ? ' ' : '') + text)}
              disabled={disabled || streaming}
            />
            {streaming ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/80 text-white transition-colors hover:bg-red-500"
              >
                <Square className="h-3.5 w-3.5" fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={disabled || (!value.trim() && attachments.length === 0)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00fbfb] text-[#000510] transition-all disabled:opacity-30 hover:shadow-[0_0_16px_-4px_rgba(0,251,251,0.8)]"
              >
                <ArrowUp className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,.pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,.py,.js,.ts,.tsx,.jsx,.java,.cpp,.c,.cs,.go,.rs,.rb,.php,.swift,.kt,.sql,.sh,.yml,.yaml,.json,.xml,.html,.css,.scss"
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
  );
}

function IconBtn({
  children,
  active,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-all',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : active
            ? 'bg-[#00fbfb]/15 text-[#00fbfb]'
            : 'hover:bg-white/5 hover:text-on-surface',
      )}
    >
      {children}
    </button>
  );
}

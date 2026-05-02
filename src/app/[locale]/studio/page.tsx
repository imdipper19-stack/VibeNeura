'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Download, Loader2, ImagePlus, X, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
}

export default function ImageStudioPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isRu = locale === 'ru';

  const [prompt, setPrompt] = useState('');
  const [refImages, setRefImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, imageInputs: refImages.length > 0 ? refImages : undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setError(isRu ? 'Недостаточно генераций. Пополните баланс.' : 'Insufficient generations. Top up your balance.');
        } else {
          setError(data.error || (isRu ? 'Ошибка генерации' : 'Generation failed'));
        }
        return;
      }

      setGallery(prev => [{
        id: Math.random().toString(36).slice(2),
        prompt,
        imageUrl: data.imageUrl,
        createdAt: new Date(),
      }, ...prev]);

      setRemaining(data.remaining);
    } catch {
      setError(isRu ? 'Ошибка сети' : 'Network error');
    } finally {
      setGenerating(false);
    }
  };

  const addReferenceImage = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) continue;
      const dataUrl = await new Promise<string>(resolve => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });
      setRefImages(prev => [...prev, dataUrl].slice(0, 3)); // max 3 reference images
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/5 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4 sm:px-6">
          <button
            onClick={() => router.push(`/${locale}/chat`)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-on-surface-variant transition-all hover:bg-white/[0.06] hover:text-primary hover:border-primary/30"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Wand2 className="h-5 w-5 text-[#dfb7ff]" />
            <h1 className="font-display text-xl font-semibold text-on-surface">
              {isRu ? 'Студия изображений' : 'Image Studio'}
            </h1>
          </div>
          {remaining !== null && (
            <div className="flex items-center gap-1.5 rounded-full border border-[#dfb7ff]/20 bg-[#dfb7ff]/5 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#dfb7ff]" />
              <span className="text-xs font-medium text-[#dfb7ff]">
                {remaining === '∞' ? '∞' : remaining} {isRu ? 'генераций' : 'generations'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Model info */}
        <div className="mb-6 rounded-xl border border-[#dfb7ff]/10 bg-[#dfb7ff]/[0.03] px-4 py-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dfb7ff]/10 shrink-0">
            <Sparkles className="h-5 w-5 text-[#dfb7ff]" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">Google Nano Banana</p>
            <p className="text-xs text-on-surface-variant">
              {isRu ? 'Генерация изображений от Google через Replicate' : 'Image generation by Google via Replicate'}
            </p>
          </div>
        </div>

        {/* Prompt input */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-2 block">
            {isRu ? 'Описание изображения' : 'Image description'}
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            placeholder={isRu ? 'Опишите что хотите увидеть...' : 'Describe what you want to see...'}
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-[#dfb7ff]/50 focus:ring-1 focus:ring-[#dfb7ff]/20 placeholder:text-on-surface-variant/40"
          />

          {/* Reference images */}
          {refImages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {refImages.map((img, i) => (
                <div key={i} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-white/10" />
                  <button
                    onClick={() => setRefImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-on-surface-variant transition-all hover:bg-white/[0.06] hover:text-on-surface"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {isRu ? 'Референс' : 'Reference'}
              </button>
              <span className="text-[10px] text-on-surface-variant/40">
                {isRu ? 'макс. 3 изображения' : 'max 3 images'}
              </span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#dfb7ff] to-[#568dff] px-5 py-2.5 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_20px_-4px_rgba(223,183,255,0.5)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRu ? 'Генерация...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {isRu ? 'Сгенерировать' : 'Generate'}
                </>
              )}
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { addReferenceImage(e.target.files); e.target.value = ''; }}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-on-surface-variant mb-4">
              {isRu ? 'Результаты' : 'Results'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.map(img => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.prompt}
                    className="w-full aspect-square object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-xs text-white/80 line-clamp-2 mb-3">{img.prompt}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadImage(img.imageUrl, `vibeneura-${img.id}.jpg`)}
                        className="flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
                      >
                        <Download className="h-3 w-3" />
                        {isRu ? 'Скачать' : 'Download'}
                      </button>
                      <button
                        onClick={() => { setPrompt(img.prompt); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
                      >
                        <Wand2 className="h-3 w-3" />
                        {isRu ? 'Повторить' : 'Redo'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {gallery.length === 0 && !generating && (
          <div className="mt-16 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#dfb7ff]/5 mb-4">
              <Wand2 className="h-10 w-10 text-[#dfb7ff]/30" />
            </div>
            <h3 className="font-display text-lg font-semibold text-on-surface/50 mb-2">
              {isRu ? 'Создайте первое изображение' : 'Create your first image'}
            </h3>
            <p className="text-sm text-on-surface-variant/40 max-w-md mx-auto">
              {isRu
                ? 'Опишите что хотите увидеть и нажмите «Сгенерировать». Вы можете добавить референсные изображения для точного результата.'
                : 'Describe what you want to see and press "Generate". You can add reference images for more precise results.'}
            </p>
          </div>
        )}

        {/* Loading overlay */}
        {generating && gallery.length === 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#dfb7ff]/10 mb-4 animate-pulse">
              <Wand2 className="h-10 w-10 text-[#dfb7ff]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-on-surface mb-2">
              {isRu ? 'Генерируем...' : 'Generating...'}
            </h3>
            <p className="text-sm text-on-surface-variant/60">
              {isRu ? 'Это может занять 10–30 секунд' : 'This may take 10–30 seconds'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

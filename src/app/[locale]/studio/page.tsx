'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Download, Loader2, ImagePlus, X, Wand2, ShoppingCart, Zap, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
}

const PROMPT_SUGGESTIONS_RU = [
  'Киберпанк город на закате с неоновыми вывесками',
  'Милый котёнок в космическом скафандре',
  'Абстрактная картина в стиле синтвейв',
  'Уютная кофейня зимним вечером',
  'Футуристический автомобиль в пустыне',
  'Волшебный лес с светящимися грибами',
];

const PROMPT_SUGGESTIONS_EN = [
  'Cyberpunk city at sunset with neon signs',
  'Cute kitten in a space suit',
  'Abstract painting in synthwave style',
  'Cozy coffee shop on a winter evening',
  'Futuristic car in the desert',
  'Magical forest with glowing mushrooms',
];

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
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const suggestions = isRu ? PROMPT_SUGGESTIONS_RU : PROMPT_SUGGESTIONS_EN;

  useEffect(() => {
    fetch('/api/user/settings')
      .then(r => r.json())
      .then(d => setBalance(d.imageBalance ?? 0))
      .catch(() => setBalance(0))
      .finally(() => setLoadingBalance(false));
  }, []);

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

      setBalance(typeof data.remaining === 'number' ? data.remaining : balance);
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
      setRefImages(prev => [...prev, dataUrl].slice(0, 3));
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

  const copyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/5 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <button
            onClick={() => router.push(`/${locale}/chat`)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-on-surface-variant transition-all hover:bg-white/[0.06] hover:text-primary hover:border-primary/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#dfb7ff]/20 to-[#568dff]/20">
              <Wand2 className="h-4 w-4 text-[#dfb7ff]" />
            </div>
            <h1 className="font-display text-lg font-semibold text-on-surface">
              {isRu ? 'Студия изображений' : 'Image Studio'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-[#dfb7ff]/20 bg-[#dfb7ff]/5 px-3.5 py-1.5">
              <Zap className="h-3.5 w-3.5 text-[#dfb7ff]" />
              <span className="text-xs font-semibold text-[#dfb7ff]">
                {loadingBalance ? '...' : balance}
              </span>
              <span className="text-[10px] text-[#dfb7ff]/60">
                {isRu ? 'генераций' : 'gen'}
              </span>
            </div>
            <Link
              href={`/${locale}/billing`}
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#dfb7ff] to-[#568dff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#000510] transition-all hover:shadow-[0_0_16px_-4px_rgba(223,183,255,0.5)]"
            >
              <ShoppingCart className="h-3 w-3" />
              {isRu ? 'Купить' : 'Buy'}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* No balance warning */}
        <AnimatePresence>
          {!loadingBalance && balance === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 rounded-2xl border border-[#dfb7ff]/20 bg-gradient-to-r from-[#dfb7ff]/[0.06] to-[#568dff]/[0.04] px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dfb7ff]/10 shrink-0">
                  <Zap className="h-5 w-5 text-[#dfb7ff]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">
                    {isRu ? 'Генерации закончились' : 'No generations left'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {isRu ? 'Пополните баланс, чтобы создавать изображения' : 'Top up to start creating images'}
                  </p>
                </div>
              </div>
              <Link
                href={`/${locale}/billing`}
                className="shrink-0 rounded-xl bg-gradient-to-r from-[#dfb7ff] to-[#568dff] px-5 py-2.5 text-xs font-bold text-[#000510] transition-all hover:shadow-[0_0_20px_-4px_rgba(223,183,255,0.5)]"
              >
                {isRu ? 'Пополнить' : 'Top up'}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* Main column */}
          <div>
            {/* Prompt input */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                placeholder={isRu ? 'Опишите изображение, которое хотите создать...' : 'Describe the image you want to create...'}
                rows={4}
                className="w-full resize-none rounded-xl border-0 bg-transparent px-1 py-1 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/30"
              />

              {/* Reference images */}
              <AnimatePresence>
                {refImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.04] pt-3"
                  >
                    {refImages.map((img, i) => (
                      <div key={i} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="h-16 w-16 rounded-xl object-cover border border-white/10" />
                        <button
                          onClick={() => setRefImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions bar */}
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-on-surface-variant transition-all hover:bg-white/[0.06] hover:text-on-surface hover:border-white/20"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    {isRu ? 'Референс' : 'Reference'}
                    {refImages.length > 0 && (
                      <span className="ml-1 rounded-full bg-[#dfb7ff]/20 px-1.5 text-[10px] text-[#dfb7ff]">{refImages.length}/3</span>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || generating || (!loadingBalance && balance === 0)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dfb7ff] to-[#568dff] px-5 py-2.5 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_24px_-4px_rgba(223,183,255,0.5)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isRu ? 'Создаю...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      {isRu ? 'Создать' : 'Create'}
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
                  className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generating animation */}
            {generating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 rounded-2xl border border-[#dfb7ff]/10 bg-gradient-to-br from-[#dfb7ff]/[0.04] to-[#568dff]/[0.02] p-8 text-center"
              >
                <div className="relative inline-flex h-20 w-20 items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-2xl bg-[#dfb7ff]/10 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#dfb7ff]/10">
                    <Wand2 className="h-8 w-8 text-[#dfb7ff] animate-pulse" />
                  </div>
                </div>
                <h3 className="font-display text-base font-semibold text-on-surface mb-1">
                  {isRu ? 'Создаём изображение...' : 'Creating image...'}
                </h3>
                <p className="text-xs text-on-surface-variant/60">
                  {isRu ? 'Обычно это занимает 10–30 секунд' : 'This usually takes 10–30 seconds'}
                </p>
              </motion.div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-on-surface-variant">
                    {isRu ? 'Созданные изображения' : 'Created images'}
                  </h2>
                  <span className="text-xs text-on-surface-variant/40">{gallery.length}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map(img => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.imageUrl}
                        alt={img.prompt}
                        className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                        <p className="text-xs text-white/80 line-clamp-2 mb-3">{img.prompt}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); downloadImage(img.imageUrl, `vibeneura-${img.id}.jpg`); }}
                            className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/25"
                          >
                            <Download className="h-3 w-3" />
                            {isRu ? 'Скачать' : 'Download'}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); copyPrompt(img.prompt, img.id); }}
                            className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/25"
                          >
                            {copiedId === img.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {isRu ? 'Промпт' : 'Prompt'}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setPrompt(img.prompt); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/25"
                          >
                            <Wand2 className="h-3 w-3" />
                            {isRu ? 'Ещё раз' : 'Redo'}
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
              <div className="mt-12 text-center">
                <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#dfb7ff]/10 to-[#568dff]/5 mb-5">
                  <Wand2 className="h-10 w-10 text-[#dfb7ff]/30" />
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-[#568dff]/10">
                    <Sparkles className="h-4 w-4 text-[#568dff]/40" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-on-surface/60 mb-2">
                  {isRu ? 'Создайте первое изображение' : 'Create your first image'}
                </h3>
                <p className="text-sm text-on-surface-variant/40 max-w-sm mx-auto">
                  {isRu
                    ? 'Напишите описание или выберите идею справа, а мы превратим текст в изображение'
                    : 'Write a description or pick an idea from the sidebar, and we\'ll turn text into an image'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar — prompt suggestions */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/50 mb-3">
                  {isRu ? 'Идеи для промптов' : 'Prompt ideas'}
                </p>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(s)}
                      className="w-full text-left rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-xs text-on-surface-variant transition-all hover:bg-[#dfb7ff]/[0.06] hover:border-[#dfb7ff]/20 hover:text-on-surface"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/50 mb-3">
                  {isRu ? 'Советы' : 'Tips'}
                </p>
                <div className="space-y-3 text-xs text-on-surface-variant/60">
                  <p>{isRu ? 'Добавьте стиль: «в стиле аниме», «реалистичное фото», «3D рендер»' : 'Add style: "anime style", "realistic photo", "3D render"'}</p>
                  <p>{isRu ? 'Укажите освещение и настроение: «тёплый закат», «неоновая ночь»' : 'Specify lighting and mood: "warm sunset", "neon night"'}</p>
                  <p>{isRu ? 'Референсные изображения помогут получить точный результат' : 'Reference images help get precise results'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl max-h-[90vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => downloadImage(selectedImage.imageUrl, `vibeneura-${selectedImage.id}.jpg`)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/50 backdrop-blur text-white transition-colors hover:bg-black/70"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/50 backdrop-blur text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 rounded-xl bg-white/5 backdrop-blur px-4 py-3">
                <p className="text-sm text-white/80">{selectedImage.prompt}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

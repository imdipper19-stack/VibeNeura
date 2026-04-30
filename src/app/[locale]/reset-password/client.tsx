'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, Check, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function ResetPasswordClient({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Ошибка');
      } else {
        setDone(true);
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-gradient-to-b from-[#000510] to-[#000000]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-[#00fbfb]/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[#568dff]/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-white/[0.06] bg-white/[0.04] backdrop-blur-2xl">
        <Link href={`/${locale}`} className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00fbfb] to-[#568dff]">
            <Sparkles className="h-4 w-4 text-[#000510]" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold text-white">vibeneura</span>
        </Link>

        <h1 className="font-display text-2xl font-semibold text-white">Новый пароль</h1>

        {done ? (
          <div className="mt-6 rounded-xl border border-tertiary/30 bg-tertiary/10 p-6 text-center">
            <Check className="mx-auto mb-3 h-8 w-8 text-tertiary" />
            <p className="text-sm text-tertiary">Пароль успешно изменён!</p>
            <Link
              href={`/${locale}/login`}
              className="mt-3 inline-flex items-center gap-1 text-sm text-[#00fbfb] hover:underline"
            >
              Войти в аккаунт
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-[#b9cac9]">Новый пароль</label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-[#00fbfb]/40 transition-colors">
                <Lock className="h-4 w-4 text-[#839493]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#839493]/60"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#839493] hover:text-white">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-[#b9cac9]">Подтвердите пароль</label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-[#00fbfb]/40 transition-colors">
                <Lock className="h-4 w-4 text-[#839493]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#839493]/60"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#568dff] px-4 py-3 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_24px_-6px_rgba(0,251,251,0.5)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Сохранить пароль
            </motion.button>
          </form>
        )}

        <Link href={`/${locale}/login`} className="mt-4 inline-flex items-center gap-1 text-sm text-[#00fbfb] hover:underline">
          <ArrowLeft className="h-3 w-3" /> Назад ко входу
        </Link>
      </Card>
    </div>
  );
}

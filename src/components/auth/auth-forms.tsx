'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { GoogleButton } from '@/components/auth/google-button';
import { Turnstile } from '@/components/auth/turnstile';

type Tab = 'login' | 'register';

export function AuthForms({ locale, googleLabel }: { locale: string; googleLabel: string }) {
  const [tab, setTab] = useState<Tab>('login');

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex rounded-lg border border-white/10 bg-white/5 p-1">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              tab === t
                ? 'bg-gradient-to-r from-[#00fbfb]/20 to-[#568dff]/20 text-white'
                : 'text-[#839493] hover:text-white'
            }`}
          >
            {t === 'login' ? 'Вход' : 'Регистрация'}
          </button>
        ))}
      </div>

      {tab === 'login' ? <LoginForm locale={locale} /> : <RegisterForm />}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-[#839493]">или</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton label={googleLabel} />
    </div>
  );
}

function LoginForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('email', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('Неверный email или пароль');
      } else {
        window.location.href = `/${locale}/chat`;
      }
    } catch {
      setError('Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs text-[#b9cac9]">Email</label>
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-[#00fbfb]/40 transition-colors">
          <Mail className="h-4 w-4 text-[#839493]" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#839493]/60"
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs text-[#b9cac9]">Пароль</label>
          <a href={`/${locale}/forgot-password`} className="text-xs text-[#00fbfb] hover:underline">
            Забыли пароль?
          </a>
        </div>
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-[#00fbfb]/40 transition-colors">
          <Lock className="h-4 w-4 text-[#839493]" />
          <input
            type={showPw ? 'text' : 'password'}
            required
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

      {error && <p className="text-sm text-red-400">{error}</p>}

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#568dff] px-4 py-3 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_24px_-6px_rgba(0,251,251,0.5)] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        Войти
      </motion.button>
    </form>
  );
}

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }
    if (!turnstileToken) {
      setError('Пройдите проверку');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Ошибка регистрации');
      } else {
        setSuccess(data.message ?? 'Проверьте почту для подтверждения');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-tertiary/30 bg-tertiary/10 p-6 text-center">
        <Mail className="mx-auto mb-3 h-8 w-8 text-tertiary" />
        <p className="text-sm text-tertiary">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs text-[#b9cac9]">Email</label>
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-[#00fbfb]/40 transition-colors">
          <Mail className="h-4 w-4 text-[#839493]" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#839493]/60"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-[#b9cac9]">Пароль (мин. 8 символов)</label>
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

      <Turnstile onToken={setTurnstileToken} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#568dff] px-4 py-3 text-sm font-semibold text-[#000510] transition-all hover:shadow-[0_0_24px_-6px_rgba(0,251,251,0.5)] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
        Создать аккаунт
      </motion.button>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Lock, Ticket, Check, AlertCircle, ArrowLeft, Settings as SettingsIcon, Sun, Moon, Monitor, Globe, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/providers/theme-provider';
import { useSettingsStore } from '@/store/settings-store';

interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  locale: string;
  hasPassword: boolean;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useSettingsStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [nameMsg, setNameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [nameSaving, setNameSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [passSaving, setPassSaving] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [promoSaving, setPromoSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user/settings').then(r => r.json()).then(d => {
      setProfile(d);
      setName(d.name ?? '');
      setLoading(false);
    });
  }, []);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSaving(true);
    setNameMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'updateName', name }),
    });
    const data = await res.json();
    setNameMsg(res.ok ? { type: 'ok', text: 'Имя сохранено' } : { type: 'err', text: data.error });
    setNameSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPassword.length < 6) { setPassMsg({ type: 'err', text: 'Минимум 6 символов' }); return; }
    if (newPassword !== confirmPassword) { setPassMsg({ type: 'err', text: 'Пароли не совпадают' }); return; }
    setPassSaving(true);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'changePassword', currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setPassMsg({ type: 'ok', text: 'Пароль изменён' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassMsg({ type: 'err', text: data.error });
    }
    setPassSaving(false);
  };

  const redeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMsg(null);
    setPromoSaving(true);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'redeemPromo', code: promoCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setPromoMsg({ type: 'ok', text: data.message });
      setPromoCode('');
    } else {
      setPromoMsg({ type: 'err', text: data.error });
    }
    setPromoSaving(false);
  };

  const switchLocale = (newLocale: string) => {
    const path = window.location.pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(path);
  };

  const fontSizes = [14, 16, 18, 20];
  const fontLabels: Record<number, string> = { 14: 'Мелкий', 16: 'Обычный', 18: 'Крупный', 20: 'Очень крупный' };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/5 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4 sm:px-6">
          <button
            onClick={() => router.push(`/${locale}/chat`)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-on-surface-variant transition-all hover:bg-white/[0.06] hover:text-primary hover:border-primary/30"
            aria-label="Назад в чат"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-semibold text-on-surface">Настройки</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
        {/* Profile section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Section icon={<User className="h-5 w-5" />} title="Профиль">
            <form onSubmit={saveName} className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">Email</label>
                <p className="text-sm text-on-surface/60 bg-white/[0.02] rounded-lg border border-white/5 px-3 py-2.5">
                  {profile?.email ?? '—'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">Имя</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={50}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <Msg msg={nameMsg} />
              <button
                type="submit"
                disabled={nameSaving}
                className="rounded-lg bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/25 hover:shadow-[0_0_16px_-4px_rgba(0,251,251,0.4)] disabled:opacity-50"
              >
                {nameSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </Section>
        </motion.div>

        {/* Theme section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
          <Section icon={<Sun className="h-5 w-5" />} title="Тема оформления">
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'light' as const, icon: <Sun className="h-5 w-5" />, label: 'Светлая' },
                { value: 'dark' as const, icon: <Moon className="h-5 w-5" />, label: 'Тёмная' },
                { value: 'system' as const, icon: <Monitor className="h-5 w-5" />, label: 'Системная' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-all ${
                    theme === opt.value
                      ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_12px_-4px_rgba(0,251,251,0.3)]'
                      : 'border-white/10 bg-white/[0.03] text-on-surface-variant hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Language section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Section icon={<Globe className="h-5 w-5" />} title="Язык">
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'ru', label: '🇷🇺 Русский' },
                { value: 'en', label: '🇬🇧 English' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => switchLocale(opt.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all ${
                    locale === opt.value
                      ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_12px_-4px_rgba(0,251,251,0.3)]'
                      : 'border-white/10 bg-white/[0.03] text-on-surface-variant hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Font size section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
          <Section icon={<Type className="h-5 w-5" />} title="Размер текста">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant shrink-0">A</span>
                <input
                  type="range"
                  min={0}
                  max={fontSizes.length - 1}
                  step={1}
                  value={fontSizes.indexOf(fontSize) === -1 ? 1 : fontSizes.indexOf(fontSize)}
                  onChange={e => setFontSize(fontSizes[Number(e.target.value)])}
                  className="flex-1 accent-[hsl(180,100%,49%)] h-2 rounded-full cursor-pointer"
                />
                <span className="text-lg text-on-surface-variant shrink-0">A</span>
              </div>
              <div className="flex justify-between px-1">
                {fontSizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      fontSize === s ? 'text-primary font-semibold' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
                    }`}
                  >
                    {fontLabels[s]}
                  </button>
                ))}
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                <p style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }} className="text-on-surface">
                  Пример текста: Привет! Это предварительный просмотр выбранного размера шрифта.
                </p>
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Password section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Section icon={<Lock className="h-5 w-5" />} title={profile?.hasPassword ? 'Изменить пароль' : 'Установить пароль'}>
            <form onSubmit={changePassword} className="space-y-4">
              {profile?.hasPassword && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">Текущий пароль</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">Новый пароль</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">Подтвердить пароль</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20" />
              </div>
              <Msg msg={passMsg} />
              <button type="submit" disabled={passSaving} className="rounded-lg bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/25 hover:shadow-[0_0_16px_-4px_rgba(0,251,251,0.4)] disabled:opacity-50">
                {passSaving ? 'Сохранение...' : profile?.hasPassword ? 'Изменить пароль' : 'Установить пароль'}
              </button>
            </form>
          </Section>
        </motion.div>

        {/* Promo code section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section icon={<Ticket className="h-5 w-5" />} title="Промокод">
            <form onSubmit={redeemPromo} className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">Введите промокод</label>
                <input
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME50"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/30 font-mono tracking-wider"
                />
              </div>
              <Msg msg={promoMsg} />
              <button type="submit" disabled={promoSaving || !promoCode.trim()} className="rounded-lg bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/25 hover:shadow-[0_0_16px_-4px_rgba(0,251,251,0.4)] disabled:opacity-50">
                {promoSaving ? 'Активация...' : 'Активировать'}
              </button>
            </form>
          </Section>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 className="font-display text-lg font-semibold text-on-surface">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Msg({ msg }: { msg: { type: 'ok' | 'err'; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${msg.type === 'ok' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
      {msg.type === 'ok' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {msg.text}
    </div>
  );
}

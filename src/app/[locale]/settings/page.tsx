'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Lock, Ticket, Check, AlertCircle, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Section icon={<User className="h-5 w-5" />} title="Профиль">
            <form onSubmit={saveName} className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">
                  Email
                </label>
                <p className="text-sm text-on-surface/60 bg-white/[0.02] rounded-lg border border-white/5 px-3 py-2.5">
                  {profile?.email ?? '—'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">
                  Имя
                </label>
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

        {/* Password section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Section icon={<Lock className="h-5 w-5" />} title={profile?.hasPassword ? 'Изменить пароль' : 'Установить пароль'}>
            <form onSubmit={changePassword} className="space-y-4">
              {profile?.hasPassword && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">
                    Текущий пароль
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">
                  Подтвердить пароль
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <Msg msg={passMsg} />
              <button
                type="submit"
                disabled={passSaving}
                className="rounded-lg bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/25 hover:shadow-[0_0_16px_-4px_rgba(0,251,251,0.4)] disabled:opacity-50"
              >
                {passSaving ? 'Сохранение...' : profile?.hasPassword ? 'Изменить пароль' : 'Установить пароль'}
              </button>
            </form>
          </Section>
        </motion.div>

        {/* Promo code section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Section icon={<Ticket className="h-5 w-5" />} title="Промокод">
            <form onSubmit={redeemPromo} className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/70 mb-1.5 block">
                  Введите промокод
                </label>
                <input
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME50"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/30 font-mono tracking-wider"
                />
              </div>
              <Msg msg={promoMsg} />
              <button
                type="submit"
                disabled={promoSaving || !promoCode.trim()}
                className="rounded-lg bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/25 hover:shadow-[0_0_16px_-4px_rgba(0,251,251,0.4)] disabled:opacity-50"
              >
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

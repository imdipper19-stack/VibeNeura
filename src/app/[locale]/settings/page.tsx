'use client';

import { useEffect, useState } from 'react';
import { User, Lock, Ticket, Check, AlertCircle } from 'lucide-react';

interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  locale: string;
  hasPassword: boolean;
}

export default function SettingsPage() {
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

  if (loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-[#839493]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#000510] flex justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <h1 className="text-2xl font-semibold text-white">Настройки</h1>

        <Section icon={<User className="h-5 w-5" />} title="Профиль">
          <form onSubmit={saveName} className="space-y-3">
            <div>
              <label className="text-xs text-[#839493] mb-1 block">Email</label>
              <p className="text-sm text-white/60">{profile?.email ?? '—'}</p>
            </div>
            <div>
              <label className="text-xs text-[#839493] mb-1 block">Имя</label>
              <input value={name} onChange={e => setName(e.target.value)} maxLength={50} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00fbfb]/50" />
            </div>
            <Msg msg={nameMsg} />
            <button type="submit" disabled={nameSaving} className="rounded-lg bg-[#00fbfb]/20 px-4 py-2 text-sm text-[#00fbfb] hover:bg-[#00fbfb]/30 disabled:opacity-50">
              {nameSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </Section>

        <Section icon={<Lock className="h-5 w-5" />} title={profile?.hasPassword ? 'Изменить пароль' : 'Установить пароль'}>
          <form onSubmit={changePassword} className="space-y-3">
            {profile?.hasPassword && (
              <div>
                <label className="text-xs text-[#839493] mb-1 block">Текущий пароль</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00fbfb]/50" />
              </div>
            )}
            <div>
              <label className="text-xs text-[#839493] mb-1 block">Новый пароль</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00fbfb]/50" />
            </div>
            <div>
              <label className="text-xs text-[#839493] mb-1 block">Подтвердить пароль</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00fbfb]/50" />
            </div>
            <Msg msg={passMsg} />
            <button type="submit" disabled={passSaving} className="rounded-lg bg-[#00fbfb]/20 px-4 py-2 text-sm text-[#00fbfb] hover:bg-[#00fbfb]/30 disabled:opacity-50">
              {passSaving ? 'Сохранение...' : profile?.hasPassword ? 'Изменить пароль' : 'Установить пароль'}
            </button>
          </form>
        </Section>

        <Section icon={<Ticket className="h-5 w-5" />} title="Промокод">
          <form onSubmit={redeemPromo} className="space-y-3">
            <div>
              <label className="text-xs text-[#839493] mb-1 block">Введите промокод</label>
              <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="WELCOME50" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00fbfb]/50 placeholder:text-[#839493]/40 font-mono tracking-wider" />
            </div>
            <Msg msg={promoMsg} />
            <button type="submit" disabled={promoSaving || !promoCode.trim()} className="rounded-lg bg-[#00fbfb]/20 px-4 py-2 text-sm text-[#00fbfb] hover:bg-[#00fbfb]/30 disabled:opacity-50">
              {promoSaving ? 'Активация...' : 'Активировать'}
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
      <div className="flex items-center gap-2 text-white mb-4">{icon}<h2 className="text-lg font-medium">{title}</h2></div>
      {children}
    </div>
  );
}

function Msg({ msg }: { msg: { type: 'ok' | 'err'; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 text-sm ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
      {msg.type === 'ok' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {msg.text}
    </div>
  );
}

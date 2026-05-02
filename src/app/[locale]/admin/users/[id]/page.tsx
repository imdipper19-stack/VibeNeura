'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

interface UserProfile {
  user: {
    id: string; email: string | null; name: string | null; role: string;
    plan: string; banned: boolean; tokenBalance: number; emailVerified: boolean;
    proPassUntil: string | null; locale: string; referralCode: string;
    createdAt: string; updatedAt: string;
  };
  transactions: { id: string; type: string; status: string; amountMoney: number; amountTokens: number; createdAt: string }[];
  recentChats: { id: string; title: string; createdAt: string; updatedAt: string; model: { displayName: string }; _count: { messages: number } }[];
  modelUsage: { modelId: string; displayName: string; requests: number; costTokens: number }[];
  dailyActivity: { date: string; count: number }[];
}

export default function AdminUserProfilePage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [id]);

  if (loading) return <p className="text-[#839493]">Загрузка...</p>;
  if (!data?.user) return <p className="text-red-400">Пользователь не найден</p>;

  const { user, transactions, recentChats, modelUsage, dailyActivity } = data;

  const statusLabel = (s: string) => {
    switch (s) {
      case 'COMPLETED': return 'Завершён';
      case 'FAILED': return 'Ошибка';
      case 'PENDING': return 'В обработке';
      default: return s;
    }
  };

  return (
    <div>
      <Link href={`/${locale}/admin/users`} className="flex items-center gap-2 text-sm text-[#839493] hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> Назад к пользователям
      </Link>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">{user.name ?? user.email ?? user.id}</h1>
            <p className="text-sm text-[#839493] mt-1">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded px-2 py-0.5 text-xs ${user.role === 'ADMIN' ? 'bg-[#00fbfb]/20 text-[#00fbfb]' : 'bg-white/10 text-[#839493]'}`}>{user.role === 'ADMIN' ? 'Админ' : 'Пользователь'}</span>
            <span className={`rounded px-2 py-0.5 text-xs ${user.plan === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-[#839493]'}`}>{user.plan === 'PREMIUM' ? 'Премиум' : 'Бесплатный'}</span>
            {user.banned && <span className="rounded px-2 py-0.5 text-xs bg-red-500/20 text-red-400">Заблокирован</span>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          <InfoCard label="Баланс" value={`${user.tokenBalance.toLocaleString()} токенов`} />
          <InfoCard label="PRO до" value={user.proPassUntil ? new Date(user.proPassUntil).toLocaleDateString('ru-RU') : '—'} />
          <InfoCard label="Реферальный код" value={user.referralCode} />
          <InfoCard label="Дата регистрации" value={new Date(user.createdAt).toLocaleDateString('ru-RU')} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">Активность (30 дней)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#839493', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#839493', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#839493' }} itemStyle={{ color: '#00fbfb' }} />
              <Line type="monotone" dataKey="count" stroke="#00fbfb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">Использование моделей (30 дней)</p>
          {modelUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modelUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: '#839493', fontSize: 10 }} />
                <YAxis dataKey="displayName" type="category" tick={{ fill: '#839493', fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#839493' }} itemStyle={{ color: '#00fbfb' }} />
                <Bar dataKey="requests" fill="#00fbfb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#839493] text-sm">Нет данных</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">Последние чаты</p>
          {recentChats.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {recentChats.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/[0.04] px-3 py-2">
                  <div>
                    <p className="text-sm text-white">{c.title}</p>
                    <p className="text-xs text-[#839493]">{c.model.displayName} &middot; {c._count.messages} сообщ.</p>
                  </div>
                  <p className="text-xs text-[#839493]">{new Date(c.updatedAt).toLocaleDateString('ru-RU')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#839493] text-sm">Нет чатов</p>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">История платежей</p>
          {transactions.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-white/[0.04] px-3 py-2">
                  <div>
                    <span className={`rounded px-2 py-0.5 text-xs ${t.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : t.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{statusLabel(t.status)}</span>
                    <span className="text-sm text-white ml-2">{t.type === 'TOKEN_PACK' ? 'Пакет токенов' : t.type === 'PRO_PASS' ? 'PRO подписка' : t.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{t.amountMoney} ₽</p>
                    <p className="text-xs text-[#839493]">{new Date(t.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#839493] text-sm">Нет платежей</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
      <p className="text-xs text-[#839493]">{label}</p>
      <p className="text-sm text-white font-medium mt-1">{value}</p>
    </div>
  );
}

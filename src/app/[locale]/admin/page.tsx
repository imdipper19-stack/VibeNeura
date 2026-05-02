'use client';

import { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, UserPlus, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Stats {
  totalUsers: number;
  newToday: number;
  newWeek: number;
  payingUsers: number;
  totalRevenue: number;
  requestsToday: number;
  dailyRegistrations: { date: string; count: number }[];
  dailyRevenue: { date: string; amount: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="text-[#839493]">Загрузка...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Обзор</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<Users className="h-5 w-5" />} label="Всего пользователей" value={stats.totalUsers} />
        <StatCard icon={<UserPlus className="h-5 w-5" />} label="Новых сегодня" value={stats.newToday} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="За неделю" value={stats.newWeek} />
        <StatCard icon={<CreditCard className="h-5 w-5" />} label="Платящих" value={stats.payingUsers} />
        <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Запросов сегодня" value={stats.requestsToday} />
      </div>

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-sm text-[#839493]">Общий доход</p>
        <p className="text-3xl font-bold text-white">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">Регистрации (30 дней)</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.dailyRegistrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#839493', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#839493', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#839493' }} itemStyle={{ color: '#00fbfb' }} />
              <Line type="monotone" dataKey="count" stroke="#00fbfb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">Доход (30 дней)</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#839493', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#839493', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#839493' }} itemStyle={{ color: '#4ade80' }} formatter={(v) => [`${Number(v).toLocaleString('ru-RU')} ₽`]} />
              <Line type="monotone" dataKey="amount" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-[#839493] mb-2">{icon}<span className="text-sm">{label}</span></div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

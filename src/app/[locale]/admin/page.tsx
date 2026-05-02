'use client';

import { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, UserPlus, MessageSquare, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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

interface FunnelItem { stage: string; count: number }
interface RetentionItem { period: string; retained: number; total: number; pct: number }
interface GeoItem { locale: string; count: number; label: string }

const GEO_COLORS = ['#00fbfb', '#568dff', '#dfb7ff', '#4ade80', '#f97316', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [funnel, setFunnel] = useState<FunnelItem[]>([]);
  const [retention, setRetention] = useState<RetentionItem[]>([]);
  const [geo, setGeo] = useState<GeoItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
    fetch('/api/admin/stats/funnel').then(r => r.json()).then(d => setFunnel(d.funnel ?? [])).catch(() => {});
    fetch('/api/admin/stats/retention').then(r => r.json()).then(d => setRetention(d.retention ?? [])).catch(() => {});
    fetch('/api/admin/stats/geo').then(r => r.json()).then(d => setGeo(d.geo ?? [])).catch(() => {});
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

      {/* New analytics sections */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Conversion funnel */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">Воронка конверсии</p>
          {funnel.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: '#839493', fontSize: 11 }} />
                <YAxis type="category" dataKey="stage" tick={{ fill: '#b9cac9', fontSize: 11 }} width={110} />
                <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#839493' }} itemStyle={{ color: '#00fbfb' }} />
                <Bar dataKey="count" fill="#00fbfb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-[#839493]/50">Нет данных</p>
          )}
        </div>

        {/* Retention */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">Retention</p>
          {retention.length > 0 ? (
            <div className="space-y-4">
              {retention.map(r => (
                <div key={r.period}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-[#b9cac9] font-medium">{r.period}</span>
                    <span className="text-white font-bold">{r.pct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00fbfb] to-[#568dff] transition-all"
                      style={{ width: `${Math.max(r.pct, 2)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#839493] mt-1">{r.retained} из {r.total}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#839493]/50">Нет данных</p>
          )}
        </div>

        {/* Geography */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
          <p className="text-sm text-[#839493] mb-4">География</p>
          {geo.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={geo}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={30}
                  >
                    {geo.map((_, i) => (
                      <Cell key={i} fill={GEO_COLORS[i % GEO_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} itemStyle={{ color: '#b9cac9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {geo.map((g, i) => (
                  <div key={g.locale} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: GEO_COLORS[i % GEO_COLORS.length] }} />
                      <span className="text-[#b9cac9]">{g.label}</span>
                    </div>
                    <span className="text-white font-medium">{g.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-[#839493]/50">Нет данных</p>
          )}
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

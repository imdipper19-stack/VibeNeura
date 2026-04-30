'use client';

import { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, UserPlus } from 'lucide-react';

interface Stats {
  totalUsers: number;
  newToday: number;
  newWeek: number;
  payingUsers: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="text-[#839493]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={<UserPlus className="h-5 w-5" />} label="New Today" value={stats.newToday} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="New This Week" value={stats.newWeek} />
        <StatCard icon={<CreditCard className="h-5 w-5" />} label="Paying Users" value={stats.payingUsers} />
      </div>
      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
        <p className="text-sm text-[#839493]">Total Revenue</p>
        <p className="text-3xl font-bold text-white">{stats.totalRevenue.toLocaleString('ru-RU')} RUB</p>
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

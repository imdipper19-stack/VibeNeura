'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';

interface Payment {
  id: string;
  type: string;
  status: string;
  amountMoney: number;
  amountTokens: number;
  createdAt: string;
  user: { email: string | null; name: string | null };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchPayments = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    fetch(`/api/admin/payments?${params}`)
      .then(r => r.json())
      .then(d => { setPayments(d.payments ?? []); setLoading(false); });
  }, [statusFilter, typeFilter, fromDate, toDate]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const statusLabel = (s: string) => {
    switch (s) {
      case 'COMPLETED': return 'Завершён';
      case 'FAILED': return 'Ошибка';
      case 'PENDING': return 'В обработке';
      default: return s;
    }
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case 'TOKEN_PACK': return 'Пакет токенов';
      case 'PRO_PASS': return 'PRO подписка';
      default: return t;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Платежи</h1>
        <button onClick={() => window.open('/api/admin/export/payments')} className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
          <Download className="h-4 w-4" /> Экспорт CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
          <option value="">Все статусы</option>
          <option value="COMPLETED">Завершён</option>
          <option value="FAILED">Ошибка</option>
          <option value="PENDING">В обработке</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
          <option value="">Все типы</option>
          <option value="TOKEN_PACK">Пакет токенов</option>
          <option value="PRO_PASS">PRO подписка</option>
        </select>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
      </div>

      {loading ? (
        <p className="text-[#839493]">Загрузка...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-white/[0.06] text-[#839493]">
              <tr>
                <th className="px-4 py-3">Пользователь</th>
                <th className="px-4 py-3">Тип</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Токены</th>
                <th className="px-4 py-3">Дата</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {payments.map(p => (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs">{p.user.email ?? p.user.name ?? '—'}</td>
                  <td className="px-4 py-3">{typeLabel(p.type)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${p.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : p.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.amountMoney} ₽</td>
                  <td className="px-4 py-3">{p.amountTokens.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[#839493]">{new Date(p.createdAt).toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    fetch('/api/admin/payments').then(r => r.json()).then(d => { setPayments(d.payments ?? []); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Payments</h1>
      {loading ? (
        <p className="text-[#839493]">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-white/[0.06] text-[#839493]">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {payments.map(p => (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs">{p.user.email ?? p.user.name ?? '—'}</td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${p.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : p.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.amountMoney} RUB</td>
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

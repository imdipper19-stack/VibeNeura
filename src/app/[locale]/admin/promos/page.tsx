'use client';

import { useEffect, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  maxUses: number | null;
  usedCount: number;
  enabled: boolean;
  expiresAt: string | null;
  createdAt: string;
  _count: { redemptions: number };
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', type: 'TOKENS', value: '', maxUses: '', expiresAt: '' });

  const fetchPromos = () => {
    setLoading(true);
    fetch('/api/admin/promos').then(r => r.json()).then(d => { setPromos(d.promos ?? []); setLoading(false); });
  };

  useEffect(() => { fetchPromos(); }, []);

  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        description: form.description || null,
        type: form.type,
        value: Number(form.value),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }),
    });
    setShowForm(false);
    setForm({ code: '', description: '', type: 'TOKENS', value: '', maxUses: '', expiresAt: '' });
    fetchPromos();
  };

  const togglePromo = async (id: string, enabled: boolean) => {
    await fetch(`/api/admin/promos/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    });
    fetchPromos();
  };

  const deletePromo = async (id: string) => {
    if (!window.confirm('Delete this promo code?')) return;
    await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
    fetchPromos();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Promo Codes</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-[#00fbfb]/20 px-4 py-2 text-sm text-[#00fbfb] hover:bg-[#00fbfb]/30">
          <Plus className="h-4 w-4" /> New Promo
        </button>
      </div>

      {showForm && (
        <form onSubmit={createPromo} className="rounded-xl border border-white/10 bg-white/[0.03] p-6 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Code (e.g. WELCOME50)" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-[#839493]/60" />
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-[#839493]/60" />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
            <option value="TOKENS">Tokens</option>
            <option value="PRO_PASS">Pro Pass (days)</option>
          </select>
          <input required type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'TOKENS' ? 'Token amount' : 'Days'} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-[#839493]/60" />
          <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} placeholder="Max uses (empty = unlimited)" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-[#839493]/60" />
          <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
          <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
            <button type="submit" className="rounded-lg bg-[#00fbfb]/20 px-4 py-2 text-sm text-[#00fbfb] hover:bg-[#00fbfb]/30">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[#839493]">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-white/[0.06] text-[#839493]">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Max Uses</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {promos.map(p => (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono font-bold">{p.code}</td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3">{p.value.toLocaleString()}{p.type === 'TOKENS' ? ' tok' : ' days'}</td>
                  <td className="px-4 py-3">{p._count.redemptions}</td>
                  <td className="px-4 py-3">{p.maxUses ?? '∞'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${p.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#839493]">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('ru-RU') : '—'}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => togglePromo(p.id, p.enabled)} className="rounded p-1 hover:bg-white/10" title={p.enabled ? 'Disable' : 'Enable'}>
                      {p.enabled ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4 text-[#839493]" />}
                    </button>
                    <button onClick={() => deletePromo(p.id)} className="rounded p-1 hover:bg-white/10" title="Delete">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

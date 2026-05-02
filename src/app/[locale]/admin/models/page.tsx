'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ToggleLeft, ToggleRight, Save } from 'lucide-react';

interface ModelStat {
  modelId: string;
  slug: string;
  displayName: string;
  provider: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  costTokens: number;
}

interface ModelEntry {
  id: string;
  slug: string;
  displayName: string;
  provider: string;
  tier: string;
  enabled: boolean;
  inputPricePerMTokens: number;
  outputPricePerMTokens: number;
  tokenMultiplier: number;
  sortOrder: number;
  maxContext: number;
}

export default function AdminModelsPage() {
  const [stats, setStats] = useState<ModelStat[]>([]);
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, Partial<ModelEntry>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats/models').then(r => r.json()),
      fetch('/api/admin/models').then(r => r.json()),
    ]).then(([s, m]) => {
      setStats(s.models ?? []);
      setModels(m.models ?? []);
      setLoading(false);
    });
  }, []);

  const toggleEnabled = async (model: ModelEntry) => {
    await fetch('/api/admin/models', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: model.id, enabled: !model.enabled }),
    });
    setModels(prev => prev.map(m => m.id === model.id ? { ...m, enabled: !m.enabled } : m));
  };

  const startEdit = (model: ModelEntry) => {
    setEditing(prev => ({
      ...prev,
      [model.id]: {
        inputPricePerMTokens: model.inputPricePerMTokens,
        outputPricePerMTokens: model.outputPricePerMTokens,
        tokenMultiplier: model.tokenMultiplier,
        sortOrder: model.sortOrder,
      },
    }));
  };

  const updateField = (id: string, field: string, value: string) => {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: Number(value) } }));
  };

  const saveEdit = async (id: string) => {
    setSaving(id);
    const data = editing[id];
    await fetch('/api/admin/models', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...data } as ModelEntry : m));
    setEditing(prev => { const next = { ...prev }; delete next[id]; return next; });
    setSaving(null);
  };

  const top10 = stats.slice(0, 10);

  if (loading) return <p className="text-[#839493]">Загрузка...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Модели</h1>

      {top10.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 mb-6">
          <p className="text-sm text-[#839493] mb-4">Топ моделей по запросам (30 дней)</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={top10} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#839493', fontSize: 11 }} />
              <YAxis dataKey="displayName" type="category" tick={{ fill: '#839493', fontSize: 11 }} width={150} />
              <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#839493' }} itemStyle={{ color: '#00fbfb' }} />
              <Bar dataKey="requests" fill="#00fbfb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-white/[0.06] text-[#839493]">
            <tr>
              <th className="px-4 py-3">Модель</th>
              <th className="px-4 py-3">Провайдер</th>
              <th className="px-4 py-3">Тариф</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Вход $/M</th>
              <th className="px-4 py-3">Выход $/M</th>
              <th className="px-4 py-3">Множитель</th>
              <th className="px-4 py-3">Порядок</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {models.map(m => {
              const ed = editing[m.id];
              return (
                <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.displayName}</p>
                    <p className="text-xs text-[#839493] font-mono">{m.slug}</p>
                  </td>
                  <td className="px-4 py-3">{m.provider}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${m.tier === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-[#839493]'}`}>{m.tier === 'PREMIUM' ? 'Премиум' : 'Бесплатный'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleEnabled(m)} title={m.enabled ? 'Отключить' : 'Включить'}>
                      {m.enabled ? <ToggleRight className="h-5 w-5 text-green-400" /> : <ToggleLeft className="h-5 w-5 text-[#839493]" />}
                    </button>
                  </td>
                  {ed ? (
                    <>
                      <td className="px-4 py-3"><input type="number" step="0.01" value={ed.inputPricePerMTokens ?? ''} onChange={e => updateField(m.id, 'inputPricePerMTokens', e.target.value)} className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none" /></td>
                      <td className="px-4 py-3"><input type="number" step="0.01" value={ed.outputPricePerMTokens ?? ''} onChange={e => updateField(m.id, 'outputPricePerMTokens', e.target.value)} className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none" /></td>
                      <td className="px-4 py-3"><input type="number" step="0.1" value={ed.tokenMultiplier ?? ''} onChange={e => updateField(m.id, 'tokenMultiplier', e.target.value)} className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none" /></td>
                      <td className="px-4 py-3"><input type="number" value={ed.sortOrder ?? ''} onChange={e => updateField(m.id, 'sortOrder', e.target.value)} className="w-14 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none" /></td>
                      <td className="px-4 py-3 flex gap-1">
                        <button onClick={() => saveEdit(m.id)} disabled={saving === m.id} className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400 hover:bg-green-500/30"><Save className="h-3 w-3" /></button>
                        <button onClick={() => setEditing(prev => { const n = { ...prev }; delete n[m.id]; return n; })} className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20">Отмена</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-xs">{m.inputPricePerMTokens}</td>
                      <td className="px-4 py-3 text-xs">{m.outputPricePerMTokens}</td>
                      <td className="px-4 py-3 text-xs">{m.tokenMultiplier}</td>
                      <td className="px-4 py-3 text-xs">{m.sortOrder}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => startEdit(m)} className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20">Изменить</button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

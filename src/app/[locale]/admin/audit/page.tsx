'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  admin: { email: string | null; name: string | null };
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = (p: number) => {
    setLoading(true);
    fetch(`/api/admin/audit?page=${p}`)
      .then(r => r.json())
      .then(d => {
        setLogs(d.logs ?? []);
        setTotalPages(d.totalPages ?? 1);
        setLoading(false);
      });
  };

  useEffect(() => { fetchLogs(page); }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Audit Log</h1>

      {loading ? (
        <p className="text-[#839493]">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-[#839493]">No audit entries yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-white/[0.06] text-[#839493]">
                <tr>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {logs.map(l => (
                  <tr key={l.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs">{l.admin.email ?? l.admin.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono">{l.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#839493]">
                      {l.targetType ? `${l.targetType}:${l.targetId?.slice(0, 8)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#839493] max-w-[200px] truncate">
                      {l.details ? JSON.stringify(l.details) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#839493]">{new Date(l.createdAt).toLocaleString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg p-2 text-white hover:bg-white/10 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-[#839493]">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg p-2 text-white hover:bg-white/10 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

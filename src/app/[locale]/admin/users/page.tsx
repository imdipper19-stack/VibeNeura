'use client';

import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';

interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  tokenBalance: number;
  emailVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = (q?: string) => {
    setLoading(true);
    const params = q ? `?search=${encodeURIComponent(q)}` : '';
    fetch(`/api/admin/users${params}`)
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const addTokens = async (userId: string) => {
    const amount = prompt('Сколько токенов начислить?');
    if (!amount || isNaN(Number(amount))) return;
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, action: 'addTokens', amount: Number(amount) }),
    });
    fetchUsers(search);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Users</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex items-center rounded-lg border border-white/10 bg-white/5 px-3 flex-1">
          <Search className="h-4 w-4 text-[#839493]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-[#839493]/60"
          />
        </div>
        <button type="submit" className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Search</button>
      </form>

      {loading ? (
        <p className="text-[#839493]">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-white/[0.06] text-[#839493]">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs">{u.email ?? '—'}</td>
                  <td className="px-4 py-3">{u.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${u.role === 'ADMIN' ? 'bg-[#00fbfb]/20 text-[#00fbfb]' : 'bg-white/10 text-[#839493]'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{u.tokenBalance.toLocaleString()}</td>
                  <td className="px-4 py-3">{u.emailVerified ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-xs text-[#839493]">{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => addTokens(u.id)} className="flex items-center gap-1 rounded px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white">
                      <Plus className="h-3 w-3" /> Tokens
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

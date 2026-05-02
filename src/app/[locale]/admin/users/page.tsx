'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, MoreHorizontal, Shield, Ban, Trash2, UserCheck, Download, Eye } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  plan: string;
  banned: boolean;
  tokenBalance: number;
  emailVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { locale } = useParams<{ locale: string }>();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ userId: string; action: string; label: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<{ action: string; label: string } | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    if (planFilter) params.set('plan', planFilter);
    params.set('sort', sort);
    params.set('order', order);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false); setSelected(new Set()); });
  }, [search, roleFilter, planFilter, sort, order]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(); };

  const patchUser = async (userId: string, action: string, extra?: Record<string, unknown>) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, action, ...extra }),
    });
    setMenuOpen(null);
    setConfirm(null);
    fetchUsers();
  };

  const bulkAction = async (action: string, extra?: Record<string, unknown>) => {
    const ids = Array.from(selected);
    await Promise.all(ids.map(userId =>
      fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId, action, ...extra }),
      })
    ));
    setBulkConfirm(null);
    fetchUsers();
  };

  const addTokens = async (userId: string) => {
    const amount = prompt('Сколько токенов начислить?');
    if (!amount || isNaN(Number(amount))) return;
    await patchUser(userId, 'addTokens', { amount: Number(amount) });
  };

  const bulkAddTokens = async () => {
    const amount = prompt(`Начислить токены ${selected.size} пользователям:`);
    if (!amount || isNaN(Number(amount))) return;
    await bulkAction('addTokens', { amount: Number(amount) });
  };

  const toggleSort = (col: string) => {
    if (sort === col) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setOrder('desc'); }
  };

  const sortArrow = (col: string) => sort === col ? (order === 'asc' ? ' ↑' : ' ↓') : '';

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map(u => u.id)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <button onClick={() => window.open('/api/admin/export/users')} className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center rounded-lg border border-white/10 bg-white/5 px-3 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-[#839493]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..." className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-[#839493]/60" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
          <option value="">All Roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
          <option value="">All Plans</option>
          <option value="FREE">FREE</option>
          <option value="PREMIUM">PREMIUM</option>
        </select>
        <button type="submit" className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Search</button>
      </form>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-4 rounded-lg border border-[#00fbfb]/30 bg-[#00fbfb]/5 px-4 py-3">
          <span className="text-sm text-[#00fbfb]">{selected.size} selected</span>
          <div className="flex-1" />
          <button onClick={bulkAddTokens} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20">Add Tokens</button>
          <button onClick={() => setBulkConfirm({ action: 'ban', label: `Ban ${selected.size} users?` })} className="rounded-lg bg-yellow-500/20 px-3 py-1.5 text-xs text-yellow-400 hover:bg-yellow-500/30">Ban</button>
          <button onClick={() => setBulkConfirm({ action: 'unban', label: `Unban ${selected.size} users?` })} className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs text-green-400 hover:bg-green-500/30">Unban</button>
          <button onClick={() => setBulkConfirm({ action: 'delete', label: `Delete ${selected.size} users? This cannot be undone.` })} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/30">Delete</button>
        </div>
      )}

      {loading ? (
        <p className="text-[#839493]">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-white/[0.06] text-[#839493]">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === users.length && users.length > 0} onChange={toggleAll} className="rounded border-white/20 accent-[#00fbfb]" />
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort('email')}>Email{sortArrow('email')}</th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort('name')}>Name{sortArrow('name')}</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort('tokenBalance')}>Balance{sortArrow('tokenBalance')}</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>Created{sortArrow('createdAt')}</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {users.map(u => (
                <tr key={u.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] ${selected.has(u.id) ? 'bg-[#00fbfb]/[0.03]' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} className="rounded border-white/20 accent-[#00fbfb]" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/${locale}/admin/users/${u.id}`} className="hover:text-[#00fbfb] underline decoration-white/20 hover:decoration-[#00fbfb]">{u.email ?? '—'}</Link>
                  </td>
                  <td className="px-4 py-3">{u.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${u.role === 'ADMIN' ? 'bg-[#00fbfb]/20 text-[#00fbfb]' : 'bg-white/10 text-[#839493]'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${u.plan === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-[#839493]'}`}>{u.plan}</span>
                  </td>
                  <td className="px-4 py-3">{u.tokenBalance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {u.banned ? (
                      <span className="rounded px-2 py-0.5 text-xs bg-red-500/20 text-red-400">Banned</span>
                    ) : u.emailVerified ? (
                      <span className="rounded px-2 py-0.5 text-xs bg-green-500/20 text-green-400">Active</span>
                    ) : (
                      <span className="rounded px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400">Unverified</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#839493]">{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td className="px-4 py-3">
                    <div className="relative flex items-center gap-1">
                      <Link href={`/${locale}/admin/users/${u.id}`} className="rounded p-1 hover:bg-white/10" title="View profile">
                        <Eye className="h-4 w-4 text-[#839493]" />
                      </Link>
                      <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)} className="rounded p-1 hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpen === u.id && (
                        <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-white/10 bg-[#0a0f1a] py-1 shadow-xl">
                          <button onClick={() => addTokens(u.id)} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5">
                            <Plus className="h-4 w-4" /> Add Tokens
                          </button>
                          <button onClick={() => patchUser(u.id, 'changeRole', { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5">
                            <Shield className="h-4 w-4" /> {u.role === 'ADMIN' ? 'Demote to User' : 'Make Admin'}
                          </button>
                          {u.banned ? (
                            <button onClick={() => patchUser(u.id, 'unban')} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-white/5">
                              <UserCheck className="h-4 w-4" /> Unban
                            </button>
                          ) : (
                            <button onClick={() => setConfirm({ userId: u.id, action: 'ban', label: `Ban ${u.email ?? u.id}?` })} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-white/5">
                              <Ban className="h-4 w-4" /> Ban
                            </button>
                          )}
                          <button onClick={() => setConfirm({ userId: u.id, action: 'delete', label: `Delete ${u.email ?? u.id}? This cannot be undone.` })} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(confirm || bulkConfirm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setConfirm(null); setBulkConfirm(null); }}>
          <div className="rounded-xl border border-white/10 bg-[#0a0f1a] p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <p className="text-white mb-4">{confirm?.label ?? bulkConfirm?.label}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setConfirm(null); setBulkConfirm(null); }} className="rounded-lg px-4 py-2 text-sm bg-white/10 text-white hover:bg-white/20">Cancel</button>
              <button onClick={() => confirm ? patchUser(confirm.userId, confirm.action) : bulkAction(bulkConfirm!.action)} className="rounded-lg px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

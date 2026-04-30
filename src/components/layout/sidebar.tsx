'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import {
  MessageSquarePlus,
  History,
  Sparkles,
  LogOut,
  ChevronDown,
  ChevronRight,
  Mail,
  FolderPlus,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils/cn';
import { ReferralBanner } from '@/components/layout/referral-banner';
import { useChatStore } from '@/store/chat-store';
import { ChatItemMenu } from '@/components/chat/chat-item-menu';
import { RenameChatModal } from '@/components/chat/rename-chat-modal';
import { FolderModal } from '@/components/chat/folder-modal';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type ChatSummary = { id: string; title: string; updatedAt: string; folderId?: string | null };
type FolderInfo = { id: string; name: string; chatCount: number };

function groupChatsByDate(chats: ChatSummary[]): Record<string, ChatSummary[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, ChatSummary[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  for (const chat of chats) {
    const date = new Date(chat.updatedAt);
    if (date >= today) groups.today.push(chat);
    else if (date >= yesterday) groups.yesterday.push(chat);
    else if (date >= weekAgo) groups.thisWeek.push(chat);
    else groups.older.push(chat);
  }

  return groups;
}

export function Sidebar({ chats: initialChats = [], onNavigate }: { chats?: ChatSummary[]; onNavigate?: () => void }) {
  const t = useTranslations('nav');
  const tb = useTranslations('billing');
  const tf = useTranslations('folders');
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';
  const [chats, setChats] = useState<ChatSummary[]>(initialChats);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const reset = useChatStore((s) => s.reset);

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamingChat, setRenamingChat] = useState<ChatSummary | null>(null);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'rename'>('create');
  const [editingFolder, setEditingFolder] = useState<FolderInfo | null>(null);

  const refreshChats = () => {
    if (!isAuthed) return;
    fetch('/api/chats')
      .then((r) => (r.ok ? r.json() : { chats: [] }))
      .then((d) => setChats(d.chats ?? []))
      .catch(() => {});
  };

  const refreshFolders = () => {
    if (!isAuthed) return;
    fetch('/api/folders')
      .then((r) => (r.ok ? r.json() : { folders: [] }))
      .then((d) => setFolders(d.folders ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    refreshChats();
    refreshFolders();
  }, [isAuthed, pathname]);

  const handleRename = (chat: ChatSummary) => {
    setRenamingChat(chat);
    setRenameModalOpen(true);
  };

  const handleSaveRename = async (newTitle: string) => {
    if (!renamingChat) return;
    await fetch(`/api/chats/${renamingChat.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    refreshChats();
  };

  const handleArchive = async (chatId: string) => {
    await fetch(`/api/chats/${chatId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    });
    refreshChats();
    if (pathname.includes(chatId)) {
      router.push(`/${locale}/chat`);
    }
  };

  const handleDelete = async (chatId: string) => {
    await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
    refreshChats();
    if (pathname.includes(chatId)) {
      reset();
      router.push(`/${locale}/chat`);
    }
  };

  const handleMoveToFolder = async (chatId: string, folderId: string | null) => {
    await fetch(`/api/chats/${chatId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ folderId }),
    });
    refreshChats();
    refreshFolders();
  };

  const handleCreateFolder = () => {
    setEditingFolder(null);
    setFolderModalMode('create');
    setFolderModalOpen(true);
  };

  const handleRenameFolder = (folder: FolderInfo) => {
    setEditingFolder(folder);
    setFolderModalMode('rename');
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async (name: string) => {
    if (folderModalMode === 'create') {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      });
    } else if (editingFolder) {
      await fetch(`/api/folders/${editingFolder.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      });
    }
    refreshFolders();
  };

  const handleDeleteFolder = async (folderId: string) => {
    await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
    refreshFolders();
    refreshChats();
  };

  const toggleFolder = (folderId: string) => {
    setCollapsed((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const displayName = session?.user?.name || (isAuthed ? 'vibeneura' : 'Гость');
  const displayHandle = session?.user?.email || (isAuthed ? 'signed in' : 'guest@vibeneura');
  const avatarLetter = (session?.user?.name?.[0] || 'A').toUpperCase();
  const tokenBalance = session?.user?.tokenBalance ?? 10000;
  const balanceLabel = tokenBalance >= 1000
    ? (tokenBalance / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    : String(tokenBalance);
  const isPro = session?.user?.proPassUntil && new Date(session.user.proPassUntil) > new Date();

  const folderSimple = folders.map((f) => ({ id: f.id, name: f.name }));
  const unfiledChats = chats.filter((c) => !c.folderId);
  const groupedUnfiled = groupChatsByDate(unfiledChats);
  const groupOrder: Array<keyof typeof groupedUnfiled> = ['today', 'yesterday', 'thisWeek', 'older'];

  const renderChatItem = (c: ChatSummary) => {
    const href = `/${locale}/chat/${c.id}`;
    const active = pathname === href;
    return (
      <div key={c.id} className="group relative flex items-center">
        <Link
          href={href}
          onClick={onNavigate}
          className={cn(
            'flex-1 truncate rounded-md px-3 py-2 text-sm transition-colors pr-8',
            active
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface',
          )}
        >
          {c.title}
        </Link>
        <ChatItemMenu
          chatId={c.id}
          currentFolderId={c.folderId}
          folders={folderSimple}
          onRename={() => handleRename(c)}
          onArchive={() => handleArchive(c.id)}
          onDelete={() => handleDelete(c.id)}
          onMoveToFolder={(fid) => handleMoveToFolder(c.id, fid)}
        />
      </div>
    );
  };

  return (
    <aside className={cn(
      "glass-strong h-screen w-[280px] flex-col gap-4 border-r border-white/5 p-4",
      onNavigate ? "flex" : "hidden md:flex"
    )}>
      {/* Brand */}
      <Link href={`/${locale}`} className="flex items-center gap-2 px-2 py-1" onClick={onNavigate}>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
          <Sparkles className="h-5 w-5 text-surface" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">vibeneura</span>
      </Link>

      {/* New chat */}
      <button
        onClick={() => {
          reset();
          router.push(`/${locale}/chat`);
          onNavigate?.();
        }}
        className="block w-full"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary transition-all hover:border-primary hover:shadow-[0_0_16px_-4px_rgba(0,251,251,0.6)]"
        >
          <span className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            {t('newChat')}
          </span>
          <span className="text-xs opacity-60">⌘K</span>
        </motion.div>
      </button>

      {/* Chat list */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Folders header + new folder */}
        {isAuthed && (
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-on-surface-variant/70">
              <History className="h-3 w-3" /> {t('history')}
            </span>
            <button
              onClick={handleCreateFolder}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title={tf('newFolder')}
            >
              <FolderPlus className="h-3.5 w-3.5 text-on-surface-variant/70 hover:text-primary" />
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-3 overflow-y-auto pr-1">
          {chats.length === 0 && folders.length === 0 && (
            <div className="px-2 py-4 text-center text-xs text-on-surface-variant/60">—</div>
          )}

          {/* Folders */}
          {folders.map((folder) => {
            const folderChats = chats.filter((c) => c.folderId === folder.id);
            const isCollapsed = collapsed[folder.id] ?? false;
            return (
              <div key={folder.id}>
                <div className="group/folder flex items-center gap-1 px-1 pb-1">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="flex flex-1 items-center gap-1.5 min-w-0"
                  >
                    <ChevronRight className={cn('h-3 w-3 text-on-surface-variant/50 transition-transform shrink-0', !isCollapsed && 'rotate-90')} />
                    <Folder className="h-3 w-3 text-on-surface-variant/50 shrink-0" />
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 truncate">
                      {folder.name}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/30 shrink-0">
                      {folderChats.length}
                    </span>
                  </button>
                  <FolderMenu
                    onRename={() => handleRenameFolder(folder)}
                    onDelete={() => handleDeleteFolder(folder.id)}
                  />
                </div>
                {!isCollapsed && (
                  <div className="space-y-0.5 pl-2">
                    {folderChats.map(renderChatItem)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unfiled chats by date */}
          {groupOrder.map((groupKey) => {
            const groupChats = groupedUnfiled[groupKey];
            if (groupChats.length === 0) return null;
            return (
              <div key={groupKey}>
                <div className="px-2 pb-1 text-[10px] uppercase tracking-widest text-on-surface-variant/50">
                  {t(groupKey)}
                </div>
                <div className="space-y-0.5">
                  {groupChats.map(renderChatItem)}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Referral banner */}
      <ReferralBanner />

      {/* Billing card */}
      <div className="glass rounded-lg p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant">
            {tb('balance')}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
              isPro ? 'bg-primary/20 text-primary' : 'bg-tertiary/15 text-tertiary',
            )}
          >
            {isPro ? 'PRO' : tb('free')}
          </span>
        </div>
        <div className="mb-3 flex items-baseline gap-1">
          <span className="font-display text-2xl font-semibold text-on-surface">{balanceLabel}</span>
          <span className="text-xs text-on-surface-variant">{tb('tokens')}</span>
        </div>
        <Link href={`/${locale}/billing`} onClick={onNavigate}>
          <button className="w-full rounded-md bg-primary/90 px-3 py-2 text-xs font-medium text-on-primary transition-all hover:bg-primary hover:shadow-[0_0_18px_-4px_rgba(0,251,251,0.8)]">
            {tb('topup')}
          </button>
        </Link>
      </div>

      {/* Email contact */}
      <a
        href="mailto:vibeneura@internet.ru"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary"
      >
        <Mail className="h-3.5 w-3.5" />
        vibeneura@internet.ru
      </a>

      {/* User menu */}
      <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-sm font-semibold text-surface">
            {avatarLetter}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-[10px] text-on-surface-variant truncate max-w-[140px]">
              {displayHandle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {isAuthed ? (
            <button
              onClick={() => signOut({ callbackUrl: `/${locale}` })}
              className="rounded p-1 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-error"
              aria-label={t('logout')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={`/${locale}/login`}
              onClick={onNavigate}
              className="rounded p-1 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary"
              aria-label={t('login')}
            >
              <LogOut className="h-4 w-4 rotate-180" />
            </Link>
          )}
        </div>
      </div>

      <RenameChatModal
        open={renameModalOpen}
        onOpenChange={setRenameModalOpen}
        currentTitle={renamingChat?.title ?? ''}
        onSave={handleSaveRename}
      />

      <FolderModal
        open={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        mode={folderModalMode}
        currentName={editingFolder?.name ?? ''}
        onSave={handleSaveFolder}
      />
    </aside>
  );
}

function FolderMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  const tf = useTranslations('folders');
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="p-0.5 rounded opacity-0 group-hover/folder:opacity-100 hover:bg-white/10 transition-opacity">
          <MoreHorizontal className="h-3.5 w-3.5 text-on-surface-variant" />
        </button>
      </DropdownMenu.Trigger>
      {open && (
        <DropdownMenu.Portal forceMount>
          <DropdownMenu.Content side="right" align="start" sideOffset={4} className="glass-strong rounded-lg p-1 min-w-[130px] z-50 border border-white/10">
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface-variant rounded-md cursor-pointer outline-none hover:bg-white/5 hover:text-on-surface transition-colors"
              onClick={onRename}
            >
              <Pencil className="h-3 w-3" />
              {tf('rename')}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-error rounded-md cursor-pointer outline-none hover:bg-error/10 transition-colors"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
              {tf('delete')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      )}
    </DropdownMenu.Root>
  );
}

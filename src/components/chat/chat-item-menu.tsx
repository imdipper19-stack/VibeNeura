'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Archive, Trash2, FolderInput, FolderMinus } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

type FolderInfo = { id: string; name: string };

type ChatItemMenuProps = {
  chatId: string;
  currentFolderId?: string | null;
  folders?: FolderInfo[];
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMoveToFolder?: (folderId: string | null) => void;
};

export function ChatItemMenu({ chatId, currentFolderId, folders = [], onRename, onArchive, onDelete, onMoveToFolder }: ChatItemMenuProps) {
  const t = useTranslations('chat');
  const tf = useTranslations('folders');
  const [open, setOpen] = useState(false);

  const itemClass = 'flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant rounded-md cursor-pointer outline-none hover:bg-white/5 hover:text-on-surface transition-colors';

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4 text-on-surface-variant" />
        </button>
      </DropdownMenu.Trigger>

      <AnimatePresence>
        {open && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content
              asChild
              side="right"
              align="start"
              sideOffset={8}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -4 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -4 }}
                transition={{ duration: 0.15 }}
                className="glass-strong rounded-lg p-1 min-w-[140px] z-50 border border-white/10"
              >
                <DropdownMenu.Item className={itemClass} onClick={onRename}>
                  <Pencil className="h-3.5 w-3.5" />
                  {t('rename')}
                </DropdownMenu.Item>

                {folders.length > 0 && onMoveToFolder && (
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className={itemClass}>
                      <FolderInput className="h-3.5 w-3.5" />
                      {tf('moveToFolder')}
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        className="glass-strong rounded-lg p-1 min-w-[140px] z-50 border border-white/10"
                        sideOffset={8}
                      >
                        {folders.map((f) => (
                          <DropdownMenu.Item
                            key={f.id}
                            className={itemClass}
                            onClick={() => onMoveToFolder(f.id)}
                          >
                            {f.name}
                          </DropdownMenu.Item>
                        ))}
                        {currentFolderId && (
                          <>
                            <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
                            <DropdownMenu.Item
                              className={itemClass}
                              onClick={() => onMoveToFolder(null)}
                            >
                              <FolderMinus className="h-3.5 w-3.5" />
                              {tf('removeFromFolder')}
                            </DropdownMenu.Item>
                          </>
                        )}
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>
                )}

                <DropdownMenu.Item className={itemClass} onClick={onArchive}>
                  <Archive className="h-3.5 w-3.5" />
                  {t('archive')}
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-white/10" />

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-error rounded-md cursor-pointer outline-none hover:bg-error/10 transition-colors"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('delete')}
                </DropdownMenu.Item>
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
}

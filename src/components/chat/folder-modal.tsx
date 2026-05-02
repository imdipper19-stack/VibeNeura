'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type FolderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'rename';
  currentName?: string;
  onSave: (name: string) => void;
};

export function FolderModal({ open, onOpenChange, mode, currentName = '', onSave }: FolderModalProps) {
  const t = useTranslations('folders');
  const tc = useTranslations('common');
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div
                  className="w-full max-w-md glass-strong rounded-2xl p-6 border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-on-surface">
                      {mode === 'create' ? t('newFolder') : t('rename')}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                        <X className="h-5 w-5 text-on-surface-variant" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder={t('folderName')}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-colors"
                    autoFocus
                    maxLength={60}
                  />

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                      {tc('cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim()}>
                      {tc('save')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

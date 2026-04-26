'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  customSystemPrompt: string;
  setCustomSystemPrompt: (v: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      customSystemPrompt: '',
      setCustomSystemPrompt: (v) => set({ customSystemPrompt: v }),
    }),
    {
      name: 'vibeneura-settings',
    },
  ),
);

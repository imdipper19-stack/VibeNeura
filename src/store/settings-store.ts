'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  customSystemPrompt: string;
  setCustomSystemPrompt: (v: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      customSystemPrompt: '',
      setCustomSystemPrompt: (v) => set({ customSystemPrompt: v }),
      fontSize: 16,
      setFontSize: (v) => set({ fontSize: v }),
    }),
    {
      name: 'vibeneura-settings',
    },
  ),
);

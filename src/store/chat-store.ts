import { create } from 'zustand';

export type ChatMessage = {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  attachments?: Array<{ name: string; mimeType: string; dataUrl?: string }>;
  createdAt: string;
  pending?: boolean;
};

type ChatState = {
  messages: ChatMessage[];
  streaming: boolean;
  modelSlug: string;
  chatId: string | null;
  addMessage: (m: ChatMessage) => void;
  appendToAssistant: (id: string, delta: string) => void;
  setStreaming: (v: boolean) => void;
  setModel: (slug: string) => void;
  setChatId: (id: string | null) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  streaming: false,
  modelSlug: 'claude-haiku-4.5',
  chatId: null,
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  appendToAssistant: (id, delta) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + delta, pending: false } : m,
      ),
    })),
  setStreaming: (v) => set({ streaming: v }),
  setModel: (slug) => set({ modelSlug: slug }),
  setChatId: (id) => set({ chatId: id }),
  setMessages: (msgs) => set({ messages: msgs }),
  reset: () => set({ messages: [], streaming: false, chatId: null }),
}));

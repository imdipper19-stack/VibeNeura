import { create } from 'zustand';

export type ChatMessage = {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  attachments?: Array<{ name: string; mimeType: string; dataUrl?: string }>;
  createdAt: string;
  pending?: boolean;
  thinking?: boolean;
  sources?: Array<{ title: string; url: string }>;
  done?: boolean;
};

type ChatState = {
  messages: ChatMessage[];
  streaming: boolean;
  modelSlug: string;
  chatId: string | null;
  addMessage: (m: ChatMessage) => void;
  appendToAssistant: (id: string, delta: string) => void;
  setThinking: (id: string, thinking: boolean) => void;
  setSources: (id: string, sources: Array<{ title: string; url: string }>) => void;
  setDone: (id: string) => void;
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
  setThinking: (id, thinking) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, thinking } : m,
      ),
    })),
  setSources: (id, sources) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, sources } : m,
      ),
    })),
  setDone: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, done: true } : m,
      ),
    })),
  setStreaming: (v) => set({ streaming: v }),
  setModel: (slug) => set({ modelSlug: slug }),
  setChatId: (id) => set({ chatId: id }),
  setMessages: (msgs) => set({ messages: msgs }),
  reset: () => set({ messages: [], streaming: false, chatId: null }),
}));

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GeneratedUI {
  html: string;
  css: string;
  js: string;
  prompt: string;
  timestamp: number; // epoch ms
}

interface UIStore {
  generatedUI: GeneratedUI | null;
  history: GeneratedUI[];
  isGenerating: boolean;
  hasHydrated: boolean;
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  setGeneratedUI: (ui: GeneratedUI) => void;
  addToHistory: (ui: GeneratedUI) => void;
  removeFromHistory: (timestamp: number) => void;
  clearHistory: () => void;
  setIsGenerating: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChat: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      generatedUI: null,
      history: [],
      isGenerating: false,
      hasHydrated: false,
      chatMessages: [],
      setGeneratedUI: (ui) => set({ generatedUI: ui }),
      addToHistory: (ui) =>
        set((state) => ({
          history: [ui, ...state.history].slice(0, 50), // Keep last 50 items
        })),
      removeFromHistory: (timestamp) =>
        set((state) => ({
          history: state.history.filter((item) => item.timestamp !== timestamp),
        })),
      clearHistory: () => set({ history: [] }),
      setIsGenerating: (loading) => set({ isGenerating: loading }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      clearChat: () => set({ chatMessages: [] }),
    }),
    {
      name: "ui-forge-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        generatedUI: state.generatedUI,
        history: state.history,
        chatMessages: state.chatMessages,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

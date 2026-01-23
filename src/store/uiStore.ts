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
  isGenerating: boolean;
  hasHydrated: boolean;
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  setGeneratedUI: (ui: GeneratedUI) => void;
  setIsGenerating: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChat: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      generatedUI: null,
      isGenerating: false,
      hasHydrated: false,
      chatMessages: [],
      setGeneratedUI: (ui) => set({ generatedUI: ui }),
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
        chatMessages: state.chatMessages,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

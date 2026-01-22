import { create } from 'zustand';

interface GeneratedUI {
  html: string;
  css: string;
  js: string;
  prompt: string;
  timestamp: Date;
}

interface UIStore {
  generatedUI: GeneratedUI | null;
  isGenerating: boolean;
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  setGeneratedUI: (ui: GeneratedUI) => void;
  setIsGenerating: (loading: boolean) => void;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChat: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  generatedUI: null,
  isGenerating: false,
  chatMessages: [],
  setGeneratedUI: (ui) => set({ generatedUI: ui }),
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  addChatMessage: (message) => set((state) => ({ 
    chatMessages: [...state.chatMessages, message] 
  })),
  clearChat: () => set({ chatMessages: [] }),
}));

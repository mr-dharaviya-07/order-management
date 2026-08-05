import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useThemeStore = create<{ dark: boolean; toggle: () => void }>()(persist((set) => ({ dark: false, toggle: () => set((s) => ({ dark: !s.dark })) }), { name: 'oms-theme' }));

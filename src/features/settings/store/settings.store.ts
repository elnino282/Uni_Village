/**
 * Settings Store
 * Zustand store for app settings state
 */

import { create } from 'zustand';

export type LanguageCode = 'vi' | 'en';

interface SettingsState {
    darkMode: boolean;
    privatePosts: boolean;
    language: LanguageCode;
}

interface SettingsActions {
    setDarkMode: (value: boolean) => void;
    setPrivatePosts: (value: boolean) => void;
    setLanguage: (value: LanguageCode) => void;
    toggleDarkMode: () => void;
    togglePrivatePosts: () => void;
}

interface SettingsStore extends SettingsState, SettingsActions { }

export const useSettingsStore = create<SettingsStore>((set) => ({
    // Initial state
    darkMode: false,
    privatePosts: false,
    language: 'vi',

    // Actions
    setDarkMode: (value) => set({ darkMode: value }),
    setPrivatePosts: (value) => set({ privatePosts: value }),
    setLanguage: (value) => set({ language: value }),
    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    togglePrivatePosts: () => set((state) => ({ privatePosts: !state.privatePosts })),
}));

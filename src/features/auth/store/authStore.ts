/**
 * Auth Store
 * Global auth state using Zustand
 */

import { create } from 'zustand';
import { authService } from '../services/authService';
import type { AuthState, AuthTokens, User } from '../types';

interface AuthStore extends AuthState {
    // Actions
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
    setTokens: (tokens: AuthTokens) => Promise<void>;
    clear: () => Promise<void>;
    hydrate: () => Promise<void>;
    isAuthenticated: () => boolean;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    authenticated: false,
    isLoading: false,
    isHydrated: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
    ...initialState,

    setUser: (user) =>
        set({
            user,
        }),

    setLoading: (isLoading) => set({ isLoading }),

    setTokens: async (tokens) => {
        await authService.persistTokens(tokens);
        set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            authenticated: true,
            isLoading: false,
            isHydrated: true,
        });
    },

    clear: async () => {
        await authService.clearTokens();
        set({
            ...initialState,
            isHydrated: true,
            isLoading: false,
        });
    },

    hydrate: async () => {
        set({ isLoading: true });
        const tokens = await authService.getStoredTokens();

        if (tokens) {
            set({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                authenticated: true,
                isLoading: false,
                isHydrated: true,
            });
            return;
        }

        set({
            accessToken: null,
            refreshToken: null,
            authenticated: false,
            isLoading: false,
            isHydrated: true,
        });
    },

    isAuthenticated: () => get().authenticated,
}));

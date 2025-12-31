/**
 * Auth Store
 * Global auth state using Zustand
 */

import { create } from 'zustand';
import type { AuthState, User } from '../types';

interface AuthStore extends AuthState {
    // Actions
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
    login: (user: User) => void;
    logout: () => void;
    reset: () => void;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start as loading to check for existing session
};

export const useAuthStore = create<AuthStore>((set) => ({
    ...initialState,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: user !== null,
        }),

    setLoading: (isLoading) => set({ isLoading }),

    login: (user) =>
        set({
            user,
            isAuthenticated: true,
            isLoading: false,
        }),

    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        }),

    reset: () => set(initialState),
}));

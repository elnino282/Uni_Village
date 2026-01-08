/**
 * useAuth Hook
 * Hook for checking and managing auth state
 */

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
    const { user, authenticated, isLoading, isHydrated, hydrate, clear } = useAuthStore();

    // Check for existing session on mount
    useEffect(() => {
        if (!isHydrated) {
            hydrate();
        }
    }, [hydrate, isHydrated]);

    return {
        user,
        isAuthenticated: authenticated,
        isLoading,
        isHydrated,
        logout: async () => {
            await clear();
        },
    };
}

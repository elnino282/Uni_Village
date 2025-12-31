/**
 * useAuth Hook
 * Hook for checking and managing auth state
 */

import { useEffect } from 'react';
import { authApi } from '../api/authApi';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
    const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

    // Check for existing session on mount
    useEffect(() => {
        async function checkAuth() {
            try {
                const hasToken = await authService.isAuthenticated();

                if (hasToken) {
                    // Try to fetch user profile
                    const profile = await authApi.getProfile();
                    setUser(profile);
                } else {
                    setUser(null);
                }
            } catch (error) {
                // Token invalid or expired
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, [setUser, setLoading]);

    return {
        user,
        isAuthenticated,
        isLoading,
        logout: async () => {
            await authService.logout();
            logout();
        },
    };
}

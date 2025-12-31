/**
 * useLogin Hook
 * Hook for login functionality with React Query
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest } from '../types';

export function useLogin() {
    const { login } = useAuthStore();

    const mutation = useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: async (response) => {
            // Handle login success - save tokens, update state
            await authService.handleLoginSuccess(response);
            login(response.user);
        },
    });

    return {
        login: mutation.mutate,
        loginAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    };
}

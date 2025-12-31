/**
 * useRegister Hook
 * Hook for registration functionality with React Query
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { RegisterRequest } from '../types';

export function useRegister() {
    const { login } = useAuthStore();

    const mutation = useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: async (response) => {
            // Handle registration success - save tokens, update state
            await authService.handleLoginSuccess(response);
            login(response.user);
        },
    });

    return {
        register: mutation.mutate,
        registerAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    };
}

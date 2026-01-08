/**
 * useRegister Hook
 * Hook for registration functionality with React Query
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { RegisterRequest } from '../types';

export function useRegister() {
    const mutation = useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
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

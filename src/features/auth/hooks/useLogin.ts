/**
 * useLogin Hook
 * Hook for login functionality with React Query
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest } from '../types';
import { isTokenPair, mapTokenPair } from '../types';

export function useLogin() {
    const { setTokens } = useAuthStore();

    const mutation = useMutation({
        mutationFn: async (data: LoginRequest) => {
            const response = await authApi.authenticate(data);
            if (!response.result || !isTokenPair(response.result)) {
                throw new Error('Invalid authentication response');
            }
            return mapTokenPair(response.result);
        },
        onSuccess: async (tokens) => {
            await setTokens(tokens);
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

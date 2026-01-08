/**
 * useVerifyOtpRegister Hook
 * Verify OTP for registration and store tokens
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { VerifyOtpRequest } from '../types';
import { isTokenPair, mapTokenPair } from '../types';

export function useVerifyOtpRegister() {
    const { setTokens } = useAuthStore();

    const mutation = useMutation({
        mutationFn: async (data: VerifyOtpRequest) => {
            const response = await authApi.verifyOtpRegister(data);
            if (!response.result || !isTokenPair(response.result)) {
                throw new Error('Invalid OTP verification response');
            }
            return mapTokenPair(response.result);
        },
        onSuccess: async (tokens) => {
            await setTokens(tokens);
        },
    });

    return {
        verifyOtpRegister: mutation.mutate,
        verifyOtpRegisterAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    };
}

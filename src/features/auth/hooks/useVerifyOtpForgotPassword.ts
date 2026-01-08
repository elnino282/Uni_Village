/**
 * useVerifyOtpForgotPassword Hook
 * Verify OTP for password reset and store tokens
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { VerifyOtpRequest } from '../types';
import { isTokenPair, mapTokenPair } from '../types';

export function useVerifyOtpForgotPassword() {
    const { setTokens } = useAuthStore();

    const mutation = useMutation({
        mutationFn: async (data: VerifyOtpRequest) => {
            const response = await authApi.verifyOtpForgotPassword(data);
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
        verifyOtpForgotPassword: mutation.mutate,
        verifyOtpForgotPasswordAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    };
}

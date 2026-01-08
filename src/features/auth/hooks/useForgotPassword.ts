/**
 * useForgotPassword Hook
 * Request reset password OTP
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { ForgotPasswordRequest } from '../types';

export function useForgotPassword() {
    const mutation = useMutation({
        mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    });

    return {
        requestReset: mutation.mutate,
        requestResetAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    };
}

/**
 * Auth API
 * API calls for authentication
 */

import { apiClient } from '../../../lib/api/client';
import { API_ENDPOINTS } from '../../../lib/api/endpoints';
import type {
    ApiResponse,
    AuthTokenPairRaw,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    VerifyOtpRequest,
} from '../types';

export const authApi = {
    register: (data: RegisterRequest): Promise<ApiResponse<null>> =>
        apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.REGISTER, data),

    verifyOtpRegister: (data: VerifyOtpRequest): Promise<ApiResponse<AuthTokenPairRaw>> =>
        apiClient.post<ApiResponse<AuthTokenPairRaw>>(API_ENDPOINTS.AUTH.VERIFY_REGISTER_OTP, data),

    authenticate: (data: LoginRequest): Promise<ApiResponse<AuthTokenPairRaw>> =>
        apiClient.post<ApiResponse<AuthTokenPairRaw>>(API_ENDPOINTS.AUTH.AUTHENTICATE, data),

    forgotPassword: (data: ForgotPasswordRequest): Promise<ApiResponse<null>> =>
        apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),

    verifyOtpForgotPassword: (data: VerifyOtpRequest): Promise<ApiResponse<AuthTokenPairRaw>> =>
        apiClient.post<ApiResponse<AuthTokenPairRaw>>(API_ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD_OTP, data),

    refreshToken: (refreshToken: string): Promise<AuthTokenPairRaw> =>
        apiClient.post<AuthTokenPairRaw>(API_ENDPOINTS.AUTH.REFRESH, null, {
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        }),

    logout: (): Promise<void> =>
        apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT),
};

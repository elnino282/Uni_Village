import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
    RegisterRequest,
    VerifyRequest,
    LoginRequest,
    ForgetPasswordRequest,
    ChangePasswordRequest,
    BackendAuthResponse,
} from '../types';

export const authApi = {
    register: (data: RegisterRequest): Promise<ApiResponse<void>> =>
        apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.REGISTER, data),

    verifyRegisterOtp: (data: VerifyRequest): Promise<ApiResponse<BackendAuthResponse>> =>
        apiClient.post<ApiResponse<BackendAuthResponse>>(
            API_ENDPOINTS.AUTH.VERIFY_REGISTER_OTP,
            data
        ),

    login: (data: LoginRequest): Promise<ApiResponse<BackendAuthResponse>> =>
        apiClient.post<ApiResponse<BackendAuthResponse>>(
            API_ENDPOINTS.AUTH.AUTHENTICATE,
            data
        ),

    forgotPassword: (data: ForgetPasswordRequest): Promise<ApiResponse<void>> =>
        apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),

    verifyForgotPasswordOtp: (data: VerifyRequest): Promise<ApiResponse<BackendAuthResponse>> =>
        apiClient.post<ApiResponse<BackendAuthResponse>>(
            API_ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD_OTP,
            data
        ),

    changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<string>> =>
        apiClient.post<ApiResponse<string>>(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data),
};

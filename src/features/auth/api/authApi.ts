/**
 * Auth API
 * API calls for authentication
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AuthTokens, LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export const authApi = {
    login: (data: LoginRequest): Promise<LoginResponse> =>
        apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data),

    register: (data: RegisterRequest): Promise<LoginResponse> =>
        apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, data),

    logout: (): Promise<void> =>
        apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT),

    refreshToken: (refreshToken: string): Promise<AuthTokens> =>
        apiClient.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),

    getProfile: (): Promise<User> =>
        apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE),
};

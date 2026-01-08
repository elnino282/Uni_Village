/**
 * API Client Configuration
 * Centralized HTTP client with interceptors for authentication and error handling
 */

import { useAuthStore } from '@/features/auth/store/authStore';
import type { AuthTokens } from '@/features/auth/types';
import { isTokenPair, mapTokenPair } from '@/features/auth/types';
import { env } from '@/src/config/env';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '../errors';
import { API_ENDPOINTS } from './endpoints';

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
    baseURL: env.API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshPromise: Promise<AuthTokens | null> | null = null;

const isRefreshRequest = (config: AxiosRequestConfig): boolean => {
    if (!config.url) return false;
    return config.url.includes(API_ENDPOINTS.AUTH.REFRESH);
};

const refreshAccessToken = async (): Promise<AuthTokens | null> => {
    const { refreshToken, setTokens, clear } = useAuthStore.getState();

    if (!refreshToken) {
        await clear();
        return null;
    }

    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, null, {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                    },
                });

                if (!isTokenPair(response.data)) {
                    await clear();
                    return null;
                }

                const tokens = mapTokenPair(response.data);
                await setTokens(tokens);
                return tokens;
            } catch {
                await clear();
                return null;
            } finally {
                refreshPromise = null;
            }
        })();
    }

    return refreshPromise;
};

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
    async (config) => {
        if (isRefreshRequest(config)) {
            return config;
        }

        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
            const headers = config.headers ?? {};
            if (!('Authorization' in headers)) {
                headers.Authorization = `Bearer ${accessToken}`;
            }
            config.headers = headers;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableConfig | undefined;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isRefreshRequest(originalRequest)
        ) {
            originalRequest._retry = true;

            const tokens = await refreshAccessToken();
            if (tokens?.accessToken) {
                originalRequest.headers = {
                    ...(originalRequest.headers ?? {}),
                    Authorization: `Bearer ${tokens.accessToken}`,
                };
                return axiosInstance(originalRequest);
            }
        }

        // Transform to ApiError
        throw ApiError.fromAxiosError(error);
    }
);

/**
 * Type-safe API client
 */
export const apiClient = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.get<T>(url, config).then((res) => res.data),

    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.post<T>(url, data, config).then((res) => res.data),

    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.put<T>(url, data, config).then((res) => res.data),

    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.patch<T>(url, data, config).then((res) => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export { axiosInstance };

/**
 * API Client Configuration
 * Centralized HTTP client with interceptors for authentication and error handling
 */

import { useAuthStore } from '@/features/auth/store/authStore';
import type { AuthTokens } from '@/features/auth/types';
import { isAuthResponse, mapAuthResponse } from '@/features/auth/types';
import { env } from '@/config/env';
import { ApiError } from '@/lib/errors/ApiError';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from './endpoints';

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

const axiosInstance: AxiosInstance = axios.create({
    baseURL: env.API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const logRequest = (config: AxiosRequestConfig) => {
    if (__DEV__) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
            console.log('[API Request Data]', config.data);
        }
    }
};

const logResponse = (response: AxiosResponse) => {
    if (__DEV__) {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        console.log('[API Response Data]', response.data);
    }
};

const logError = (error: AxiosError) => {
    if (__DEV__) {
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        console.error('[API Error Details]', error.response?.data || error.message);
    }
};

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

                if (!isAuthResponse(response.data)) {
                    await clear();
                    return null;
                }

                const tokens = mapAuthResponse(response.data);
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

axiosInstance.interceptors.request.use(
    async (config) => {
        logRequest(config);

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
    (error) => {
        logError(error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        logResponse(response);
        return response;
    },
    async (error: AxiosError) => {
        logError(error);
        
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

    postMultipart: <T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance
            .post<T>(url, formData, {
                ...config,
                headers: {
                    ...config?.headers,
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((res) => res.data),

    putMultipart: <T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance
            .put<T>(url, formData, {
                ...config,
                headers: {
                    ...config?.headers,
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((res) => res.data),

    patchMultipart: <T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance
            .patch<T>(url, formData, {
                ...config,
                headers: {
                    ...config?.headers,
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((res) => res.data),
};

export { axiosInstance };

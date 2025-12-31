/**
 * API Client Configuration
 * Centralized HTTP client with interceptors for authentication and error handling
 */

import { ApiError } from '@/lib/errors/ApiError';
import { env } from '@/src/config/env';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
    baseURL: env.API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
    async (config) => {
        // Token will be added here from secure storage
        // const token = await tokenService.getAccessToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token refresh logic
        // if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        //   originalRequest._retry = true;
        //   try {
        //     await tokenService.refreshToken();
        //     return axiosInstance(originalRequest);
        //   } catch (refreshError) {
        //     // Redirect to login
        //   }
        // }

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

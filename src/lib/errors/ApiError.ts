/**
 * Custom API Error Class
 * Standardized error handling for API responses
 */

import { AxiosError } from 'axios';

export interface ApiErrorData {
    message: string;
    code?: string;
    status: number;
    details?: Record<string, unknown>;
}

export class ApiError extends Error {
    public readonly status: number;
    public readonly code?: string;
    public readonly details?: Record<string, unknown>;

    constructor({ message, status, code, details }: ApiErrorData) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Create ApiError from Axios error
     */
    static fromAxiosError(error: AxiosError): ApiError {
        const status = error.response?.status || 500;
        const data = error.response?.data as Record<string, unknown> | undefined;

        return new ApiError({
            message: (data?.message as string) || error.message || 'An unexpected error occurred',
            status,
            code: (data?.code as string) || error.code,
            details: data,
        });
    }

    /**
     * Check if error is a specific status code
     */
    isStatus(status: number): boolean {
        return this.status === status;
    }

    /**
     * Check if error is unauthorized (401)
     */
    isUnauthorized(): boolean {
        return this.status === 401;
    }

    /**
     * Check if error is forbidden (403)
     */
    isForbidden(): boolean {
        return this.status === 403;
    }

    /**
     * Check if error is not found (404)
     */
    isNotFound(): boolean {
        return this.status === 404;
    }

    /**
     * Check if error is validation error (422)
     */
    isValidationError(): boolean {
        return this.status === 422;
    }

    /**
     * Check if error is server error (5xx)
     */
    isServerError(): boolean {
        return this.status >= 500;
    }

    /**
     * Convert to JSON for logging
     */
    toJSON(): ApiErrorData {
        return {
            message: this.message,
            status: this.status,
            code: this.code,
            details: this.details,
        };
    }
}

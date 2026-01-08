/**
 * Auth Error Parsing
 * Maps backend error formats into user-friendly messages
 */

import { ApiError } from '../../../lib/errors';

export interface ParsedAuthError {
    message: string;
    fieldErrors?: Record<string, string>;
}

export function parseAuthError(error: unknown): ParsedAuthError {
    if (error instanceof ApiError) {
        const details = error.details as Record<string, unknown> | undefined;
        const detailError = details?.error;

        if (
            detailError === 'Validation Failed' &&
            details?.errors &&
            Array.isArray(details.errors)
        ) {
            const fieldErrors = (details.errors as Array<{ field?: string; message?: string }>).reduce(
                (acc, item) => {
                    if (item.field && item.message) {
                        acc[item.field] = item.message;
                    }
                    return acc;
                },
                {} as Record<string, string>
            );

            return {
                message:
                    (details.message as string) ||
                    (details.error as string) ||
                    error.message,
                fieldErrors,
            };
        }

        if (details?.message) {
            const errorCode = details.errorCode as string | undefined;
            return {
                message: errorCode ? `${details.message as string} (${errorCode})` : (details.message as string),
            };
        }

        return {
            message: (details?.error as string) || error.message || 'Request failed',
        };
    }

    if (error instanceof Error) {
        return { message: error.message };
    }

    return { message: 'An unexpected error occurred' };
}

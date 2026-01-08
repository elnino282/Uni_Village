/**
 * Auth Service
 * Business logic for authentication
 */

import { logger } from '../../../lib/monitoring';
import { SECURE_KEYS, secureStorage } from '../../../lib/storage';
import type { AuthTokens } from '../types';

export const authService = {
    /**
     * Persist tokens in secure storage
     */
    async persistTokens(tokens: AuthTokens): Promise<void> {
        await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        await secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        logger.info('Auth tokens persisted');
    },

    /**
     * Clear stored tokens
     */
    async clearTokens(): Promise<void> {
        await secureStorage.clearTokens();
        logger.info('Auth tokens cleared');
    },

    /**
     * Get stored tokens (if present)
     */
    async getStoredTokens(): Promise<AuthTokens | null> {
        const accessToken = await secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);
        const refreshToken = await secureStorage.get(SECURE_KEYS.REFRESH_TOKEN);

        if (!accessToken || !refreshToken) {
            return null;
        }

        return { accessToken, refreshToken };
    },

    /**
     * Validate password meets requirements
     */
    validatePassword(password: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    /**
     * Validate email format
     */
    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
};

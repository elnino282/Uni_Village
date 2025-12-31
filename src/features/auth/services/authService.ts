/**
 * Auth Service
 * Business logic for authentication
 */

import { logger } from '@/lib/monitoring';
import { SECURE_KEYS, secureStorage } from '@/lib/storage';
import type { LoginResponse } from '../types';

export const authService = {
    /**
     * Handle successful login - save tokens and user data
     */
    async handleLoginSuccess(response: LoginResponse): Promise<void> {
        const { tokens, user } = response;

        // Save tokens to secure storage
        await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        await secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        await secureStorage.set(SECURE_KEYS.USER_ID, user.id);

        logger.info('User logged in successfully', { userId: user.id });
    },

    /**
     * Handle logout - clear all stored data
     */
    async logout(): Promise<void> {
        await secureStorage.clearTokens();
        await secureStorage.remove(SECURE_KEYS.USER_ID);

        logger.info('User logged out');
    },

    /**
     * Get current access token
     */
    async getAccessToken(): Promise<string | null> {
        return secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);
    },

    /**
     * Get current refresh token
     */
    async getRefreshToken(): Promise<string | null> {
        return secureStorage.get(SECURE_KEYS.REFRESH_TOKEN);
    },

    /**
     * Check if user is authenticated (has valid token)
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getAccessToken();
        return token !== null;
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

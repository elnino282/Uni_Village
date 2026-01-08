/**
 * Auth Types
 */

import type { BaseEntity } from '@/shared/types';

export interface User extends BaseEntity {
    id: string;
    username: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface TokenPair {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    displayName: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

/**
 * Type guard to check if response is a valid TokenPair
 */
export function isTokenPair(data: unknown): data is TokenPair {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return (
        typeof obj.access_token === 'string' &&
        typeof obj.refresh_token === 'string' &&
        typeof obj.expires_in === 'number'
    );
}

/**
 * Map API TokenPair to internal AuthTokens
 */
export function mapTokenPair(tokenPair: TokenPair): AuthTokens {
    return {
        accessToken: tokenPair.access_token,
        refreshToken: tokenPair.refresh_token,
        expiresAt: Date.now() + tokenPair.expires_in * 1000,
    };
}

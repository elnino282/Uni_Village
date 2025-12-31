/**
 * Auth Types
 */

export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    createdAt: string;
    updatedAt: string;
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

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

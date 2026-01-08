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

export interface ApiResponse<T> {
    code: number;
    message: string;
    result?: T;
}

export interface AuthTokenPairRaw {
    access_token: string;
    refresh_token: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export const mapTokenPair = (raw: AuthTokenPairRaw): AuthTokens => ({
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
});

export function isTokenPair(raw: unknown): raw is AuthTokenPairRaw {
    if (!raw || typeof raw !== 'object') return false;
    const data = raw as Record<string, unknown>;
    return typeof data.access_token === 'string' && typeof data.refresh_token === 'string';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface ForgotPasswordRequest {
    email: string;
    newPassword: string;
    confirmPassword: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    authenticated: boolean;
    isLoading: boolean;
    isHydrated: boolean;
}

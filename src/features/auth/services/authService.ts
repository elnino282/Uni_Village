import { auth } from '@/lib/firebase';
import { signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import type { ForgetPasswordRequest, LoginRequest, RegisterRequest, VerifyRequest } from '../types';
import { isAuthResponse, mapAuthResponse } from '../types';
import { mapProfileToUser } from '../utils';

interface AuthResponse {
    success: boolean;
    message?: string;
}

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const data: LoginRequest = { email, password };
            const response = await authApi.login(data);

            const { tokens, profile } = response;
            useAuthStore.getState().setTokens(tokens);
            const user = mapProfileToUser(profile);
            useAuthStore.getState().setUser(user);
            console.log('[Auth Service] User initialized:', { id: user.id, displayName: user.displayName });

            // Sign in to Firebase with a custom token tied to backend user ID
            try {
                const firebaseToken = await authApi.getFirebaseToken();
                const firebaseUser = await signInWithCustomToken(auth, firebaseToken);
                console.log('[Auth Service] Firebase custom auth success:', firebaseUser.user.uid);
            } catch (firebaseError) {
                console.error('[Auth Service] Firebase custom auth failed:', firebaseError);

                // Fallback to anonymous auth to avoid blocking login
                try {
                    const firebaseUser = await signInAnonymously(auth);
                    console.log('[Auth Service] Firebase anonymous auth success:', firebaseUser.user.uid);
                } catch (fallbackError) {
                    console.error('[Auth Service] Firebase anonymous auth failed:', fallbackError);
                    // Non-blocking: Chat may not work, but login should still succeed
                }
            }

            return { success: true, message: 'Login successful' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Login failed' };
        }
    },

    register: async (
        email: string,
        username: string,
        password: string
    ): Promise<AuthResponse> => {
        try {
            const data: RegisterRequest = {
                email,
                username,
                password,
            };
            const response = await authApi.register(data);
            return { success: true, message: response.message || 'OTP sent to your email' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Registration failed' };
        }
    },

    verifyOtp: async (email: string, otp: string, isRegister = true): Promise<AuthResponse> => {
        try {
            const data: VerifyRequest = { email, otp };
            const response = isRegister
                ? await authApi.verifyRegisterOtp(data)
                : await authApi.verifyForgotPasswordOtp(data);

            if (response.result) {
                if (isAuthResponse(response.result)) {
                    const tokens = mapAuthResponse(response.result);
                    useAuthStore.getState().setTokens(tokens);
                }
                return { success: true, message: 'Verification successful' };
            }
            return { success: false, message: 'Verification failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'OTP verification failed' };
        }
    },

    forgotPassword: async (
        email: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<AuthResponse> => {
        try {
            const data: ForgetPasswordRequest = {
                email,
                newPassword,
                confirmPassword,
            };
            const response = await authApi.forgotPassword(data);
            return { success: true, message: response.message || 'OTP sent to your email' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Password reset request failed' };
        }
    },

    loginWithGoogle: async (): Promise<AuthResponse> => {
        console.log('Google login pressed');
        return { success: false, message: 'Not implemented' };
    },

    loginWithFacebook: async (): Promise<AuthResponse> => {
        console.log('Facebook login pressed');
        return { success: false, message: 'Not implemented' };
    },
};

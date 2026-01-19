import { authApi } from '../api';
import type { ForgetPasswordRequest, LoginRequest, RegisterRequest, VerifyRequest } from '../types';

interface AuthResponse {
    success: boolean;
    message?: string;
}

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const data: LoginRequest = { email, password };
            const response = await authApi.login(data);

            if (response.result) {
                return { success: true, message: response.message };
            }
            return { success: false, message: 'Login failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Login failed' };
        }
    },

    register: async (
        fullname: string,
        email: string,
        username: string,
        password: string
    ): Promise<AuthResponse> => {
        try {
            const data: RegisterRequest = {
                fullname,
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

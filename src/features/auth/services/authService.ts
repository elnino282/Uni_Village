/**
 * Auth Service
 * Stub implementation for login and register
 */

interface LoginParams {
    identifier: string;
    password: string;
}

interface RegisterParams {
    name: string;
    identifier: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    message?: string;
}

export const authService = {
    /**
     * Login with email/phone and password
     * Currently returns mocked success
     */
    login: async (params: LoginParams): Promise<AuthResponse> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: Replace with actual API call
        console.log('Login attempt:', params.identifier);

        return { success: true };
    },

    /**
     * Register new account
     * Currently returns mocked success
     */
    register: async (params: RegisterParams): Promise<AuthResponse> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: Replace with actual API call
        console.log('Register attempt:', params.name, params.identifier);

        return { success: true };
    },

    /**
     * Login with Google OAuth
     */
    loginWithGoogle: async (): Promise<AuthResponse> => {
        // TODO: Implement Google OAuth
        console.log('Google login pressed');
        return { success: false, message: 'Not implemented' };
    },

    /**
     * Login with Facebook OAuth
     */
    loginWithFacebook: async (): Promise<AuthResponse> => {
        // TODO: Implement Facebook OAuth
        console.log('Facebook login pressed');
        return { success: false, message: 'Not implemented' };
    },
};

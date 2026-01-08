/**
 * Auth Feature - Public API
 * Only export what needs to be used outside this feature
 */

// Components
export { LoginForm } from './components/LoginForm';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useLogin } from './hooks/useLogin';
export { useRegister } from './hooks/useRegister';
export { useForgotPassword } from './hooks/useForgotPassword';
export { useVerifyOtpRegister } from './hooks/useVerifyOtpRegister';
export { useVerifyOtpForgotPassword } from './hooks/useVerifyOtpForgotPassword';

// Services
export { authService } from './services/authService';

// Store
export { useAuthStore } from './store/authStore';

// Types
export type {
    AuthState,
    AuthTokens,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    User,
    VerifyOtpRequest,
} from './types/auth.types';


/**
 * Environment Configuration
 * Centralized access to environment variables
 */

export const env = {
    // API
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',

    // Supabase
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

    // App
    APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'Uni Village',
    APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',

    // Features flags
    ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',

    // Development
    IS_DEV: __DEV__,
} as const;

// Validate required environment variables
export function validateEnv(): void {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = required.filter((key) => !env[key as keyof typeof env]);

    if (missing.length > 0 && !__DEV__) {
        console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

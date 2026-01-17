/**
 * Environment Configuration
 * Centralized access to environment variables
 */

export const env = {
    // API
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',

    // Firebase
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',

    // Google Maps
    // TODO: Add your Google Maps API key here
    // Get it from: https://console.cloud.google.com/google/maps-apis
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',

    // Gemini AI
    // TODO: Add your Gemini API key here
    // Get it from: https://ai.google.dev/
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',

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
    const required = ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_APP_ID'];
    const missing = required.filter((key) => !env[key as keyof typeof env]);

    if (missing.length > 0 && !__DEV__) {
        console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Warn about Google Maps API key for map features
    if (!env.GOOGLE_MAPS_API_KEY) {
        console.warn(
            'GOOGLE_MAPS_API_KEY not configured. Map features may not work. ' +
            'Get your key from: https://console.cloud.google.com/google/maps-apis'
        );
    }
}

/**
 * Check if Google Maps is properly configured
 */
export function isGoogleMapsConfigured(): boolean {
    return Boolean(env.GOOGLE_MAPS_API_KEY);
}

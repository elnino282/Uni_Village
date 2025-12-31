/**
 * Supabase Client Configuration
 * Initialize and export Supabase client
 */

import { env } from '@/src/config/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
        },
    }
);

/**
 * Helper to get current session
 */
export const getCurrentSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error getting session:', error);
        return null;
    }
    return session;
};

/**
 * Helper to get current user
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
};

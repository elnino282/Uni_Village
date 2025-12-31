/**
 * useProfile Hook
 */

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { Profile } from '../types';

export function useProfile(userId?: string) {
    const query = useQuery<Profile>({
        queryKey: ['profile', userId],
        queryFn: () => profileApi.getProfile(userId!),
        enabled: !!userId,
    });

    return {
        profile: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

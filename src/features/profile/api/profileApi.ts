/**
 * Profile API
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Profile, UpdateProfileRequest } from '../types';

export const profileApi = {
    getProfile: (userId: string): Promise<Profile> =>
        apiClient.get<Profile>(API_ENDPOINTS.USERS.PROFILE(userId)),

    updateProfile: (userId: string, data: UpdateProfileRequest): Promise<Profile> =>
        apiClient.put<Profile>(API_ENDPOINTS.USERS.PROFILE(userId), data),
};

/**
 * useProfilePosts Hook - Fetches user's posts or saved posts
 */

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { ProfilePost, PublicProfileTab } from '../types';

export const profilePostsKeys = {
  all: ['profilePosts'] as const,
  list: (userId: number, tab: PublicProfileTab) =>
    [...profilePostsKeys.all, userId, tab] as const,
  saved: () => [...profilePostsKeys.all, 'saved'] as const,
};

export function useProfilePosts(userId?: number, tab: PublicProfileTab = 'posts') {
  return useQuery<ProfilePost[], Error>({
    queryKey: userId ? profilePostsKeys.list(userId, tab) : profilePostsKeys.all,
    queryFn: async () => {
      if (tab === 'saved') {
        const response = await profileApi.getSavedPosts();
        return response.data;
      }
      const response = await profileApi.getUserPosts(userId!);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

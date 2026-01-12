/**
 * useProfilePosts Hook
 */

import { useQuery } from '@tanstack/react-query';

import { fetchProfilePosts, fetchSavedPosts } from '../services';
import type { ProfilePost, PublicProfileTab } from '../types';

export const profilePostsKeys = {
  all: ['profilePosts'] as const,
  list: (userId: string, tab: PublicProfileTab) =>
    [...profilePostsKeys.all, userId, tab] as const,
};

export function useProfilePosts(userId?: string, tab: PublicProfileTab = 'posts') {
  return useQuery<ProfilePost[], Error>({
    queryKey: userId ? profilePostsKeys.list(userId, tab) : profilePostsKeys.all,
    queryFn: () =>
      tab === 'saved' ? fetchSavedPosts(userId ?? '') : fetchProfilePosts(userId ?? ''),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

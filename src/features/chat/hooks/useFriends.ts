/**
 * useFriends hook
 * Fetches friend list for member selection in channel creation
 */
import { useQuery } from '@tanstack/react-query';

import { fetchFriends } from '../services/mockFriends';
import type { FriendPreview } from '../types/channel.types';

/**
 * Query key factory for friends queries
 */
export const friendsKeys = {
  all: ['friends'] as const,
  search: (query?: string) => [...friendsKeys.all, 'search', query] as const,
};

/**
 * Fetch and cache friends list with optional search
 * @param searchQuery - Optional search string to filter friends
 */
export function useFriends(searchQuery?: string) {
  return useQuery<FriendPreview[], Error>({
    queryKey: friendsKeys.search(searchQuery),
    queryFn: () => fetchFriends(searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

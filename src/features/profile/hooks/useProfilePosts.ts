/**
 * useProfilePosts Hook - Fetches user's posts or saved posts
 */

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import type { ProfilePost, PublicProfileTab } from "../types";

export const profilePostsKeys = {
  all: ["profilePosts"] as const,
  list: (userId: number, tab: PublicProfileTab) =>
    [...profilePostsKeys.all, userId, tab] as const,
  saved: () => [...profilePostsKeys.all, "saved"] as const,
};

export function useProfilePosts(
  userId?: number,
  tab: PublicProfileTab = "posts",
) {
  return useQuery<ProfilePost[], Error>({
    queryKey: userId
      ? profilePostsKeys.list(userId, tab)
      : profilePostsKeys.all,
    queryFn: async (): Promise<ProfilePost[]> => {
      try {
        if (tab === "saved") {
          const response = await profileApi.getSavedPosts();
          // Handle various response formats
          return extractPostsFromResponse(response);
        }
        const response = await profileApi.getUserPosts(userId!);
        // Handle various response formats
        return extractPostsFromResponse(response);
      } catch (error) {
        console.error("Error fetching profile posts:", error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Helper function to extract posts from various response formats
function extractPostsFromResponse(response: unknown): ProfilePost[] {
  // If response is already an array
  if (Array.isArray(response)) {
    return response;
  }

  // If response is an object with content, data, or pagination
  if (response && typeof response === "object") {
    const res = response as Record<string, unknown>;

    // Spring Boot paginated format
    if (Array.isArray(res.content)) {
      return res.content as ProfilePost[];
    }

    // Frontend PaginatedResponse format
    if (Array.isArray(res.data)) {
      return res.data as ProfilePost[];
    }

    // Check for pagination.data
    if (res.pagination && typeof res.pagination === "object") {
      const paginationRes = res.pagination as Record<string, unknown>;
      if (Array.isArray(paginationRes.data)) {
        return paginationRes.data as ProfilePost[];
      }
    }
  }

  // Fallback to empty array
  return [];
}

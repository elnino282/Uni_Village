/**
 * useMyPosts Hook - Fetches current user's posts and saved posts for profile
 */

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import type { ProfileTabKey } from "../components/ProfileTabs";
import type { ProfilePost } from "../types";

export const myPostsKeys = {
  all: ["myPosts"] as const,
  list: (tab: ProfileTabKey) => [...myPostsKeys.all, tab] as const,
};

export function useMyPosts(tab: ProfileTabKey = "my-posts") {
  return useQuery<ProfilePost[], Error>({
    queryKey: myPostsKeys.list(tab),
    queryFn: async (): Promise<ProfilePost[]> => {
      try {
        if (tab === "favorites") {
          const response = await profileApi.getSavedPosts();
          return extractPostsFromResponse(response);
        }
        // For "my-posts", we need to call getMyPosts API
        const response = await profileApi.getMyPosts();
        return extractPostsFromResponse(response);
      } catch (error) {
        console.error("Error fetching my posts:", error);
        return [];
      }
    },
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

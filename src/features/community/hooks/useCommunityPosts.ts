import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService, type CreatePostData } from '../services';
import type { CommunityPostsResponse } from '../types';

const COMMUNITY_POSTS_KEY = ['community', 'posts'];

/**
 * Hook to fetch community posts
 */
export function useCommunityPosts(page = 1, limit = 20) {
  return useQuery<CommunityPostsResponse>({
    queryKey: [...COMMUNITY_POSTS_KEY, { page, limit }],
    queryFn: () => communityService.getPosts({ page, limit }),
  });
}

/**
 * Hook to create a new community post
 */
export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => communityService.createPost(data),
    onSuccess: () => {
      // Invalidate all community posts queries to refetch with new post
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
    },
  });
}

/**
 * Hook to like/unlike a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => communityService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
    },
  });
}

/**
 * Hook to save a post
 */
export function useSavePost() {
  return useMutation({
    mutationFn: (postId: string) => communityService.savePost(postId),
    onSuccess: () => {
      // Could show a toast notification here
      console.log('Post saved successfully');
    },
  });
}

/**
 * Hook to report a post
 */
export function useReportPost() {
  return useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason: string }) =>
      communityService.reportPost(postId, reason),
    onSuccess: () => {
      console.log('Post reported successfully');
    },
  });
}

/**
 * Hook to block a post
 */
export function useBlockPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => communityService.blockPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
      console.log('Post blocked successfully');
    },
  });
}


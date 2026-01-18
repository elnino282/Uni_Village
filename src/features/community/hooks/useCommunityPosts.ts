import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFeed as useRealFeed, useLikePost as useRealLikePost, useSavePost as useRealSavePost } from '@/features/post/hooks';
import type { CommunityPostsResponse } from '../types';
import { mapSliceToCommunityPostsResponse } from '../adapters/postAdapter';

const COMMUNITY_POSTS_KEY = ['community', 'posts'];

export function useCommunityPosts(page = 1, limit = 20) {
  const feedQuery = useRealFeed({ page: page - 1, size: limit });

  return useQuery<CommunityPostsResponse>({
    queryKey: [...COMMUNITY_POSTS_KEY, { page, limit }],
    queryFn: async () => {
      const firstPage = feedQuery.data?.pages[0];
      if (firstPage) {
        return mapSliceToCommunityPostsResponse(firstPage, page, limit);
      }
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    },
    enabled: !!feedQuery.data,
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log('Create post:', data);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  const realLikePost = useRealLikePost();

  return useMutation({
    mutationFn: (postId: string) => realLikePost.mutateAsync(Number(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
    },
  });
}

export function useSavePost() {
  const realSavePost = useRealSavePost();

  return useMutation({
    mutationFn: (postId: string) => realSavePost.mutateAsync(Number(postId)),
    onSuccess: () => {
      console.log('Post saved successfully');
    },
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      console.log('Report post:', postId, reason);
      return { success: true };
    },
    onSuccess: () => {
      console.log('Post reported successfully');
    },
  });
}

export function useBlockPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      console.log('Block post:', postId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
      console.log('Post blocked successfully');
    },
  });
}


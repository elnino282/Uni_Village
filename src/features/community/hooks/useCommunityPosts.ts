import { removePostFromCollections, useFeed as useRealFeed, useLikePost as useRealLikePost, useSavePost as useRealSavePost } from '@/features/post/hooks';
import { reportPost as reportPostAPI } from '@/lib/api';
import { ApiError } from '@/lib/errors/ApiError';
import { showErrorToast } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { mapSliceToCommunityPostsResponse } from '../adapters/postAdapter';
import type { CommunityPostsResponse } from '../types';

const COMMUNITY_POSTS_KEY = ['community', 'posts'];

export function useCommunityPosts(page = 1, limit = 20) {
  const feedQuery = useRealFeed({ page: page - 1, size: limit });

  const data = useMemo<CommunityPostsResponse>(() => {
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
  }, [feedQuery.data, page, limit]);

  return {
    data,
    isLoading: feedQuery.isLoading,
    isRefetching: feedQuery.isRefetching,
    isError: feedQuery.isError,
    error: feedQuery.error,
    refetch: feedQuery.refetch,
  };
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // TODO: Integrate with backend API
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
    },
  });
}

export function useReportPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      try {
        const response = await reportPostAPI(Number(postId), reason);
        return { response, postId };
      } catch (error) {
        if (error instanceof ApiError) {
          // Handle specific backend errors without showing toast
          if (error.code === 'DUPLICATE_REPORT') {
            showErrorToast('Bạn đã báo cáo nội dung này rồi');
          } else if (error.code === 'SELF_REPORT') {
            showErrorToast('Bạn không thể báo cáo nội dung của chính mình');
          } else if (error.code === 'INVALID_REPORT_TARGET') {
            showErrorToast('Không tìm thấy nội dung cần báo cáo');
          } else {
            showErrorToast('Không thể gửi báo cáo');
          }
        } else {
          showErrorToast('Đã xảy ra lỗi khi gửi báo cáo');
        }
        throw error;
      }
    },
    onSuccess: ({ postId }) => {
      // Remove the reported post from all post collections immediately
      // This ensures the post disappears for the user who reported it
      removePostFromCollections(queryClient, Number(postId));
      // Also invalidate queries to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      return postId;
    },
  });
}

export function useBlockPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // TODO: Integrate with backend API
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
    },
  });
}


import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFeed as useRealFeed, useLikePost as useRealLikePost, useSavePost as useRealSavePost } from '@/features/post/hooks';
import type { CommunityPostsResponse } from '../types';
import { mapSliceToCommunityPostsResponse } from '../adapters/postAdapter';
import { reportPost as reportPostAPI } from '@/lib/api';
import { Alert } from 'react-native';
import { ApiError } from '@/lib/errors/ApiError';

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
  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      try {
        const response = await reportPostAPI(Number(postId), reason);
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          // Handle specific backend errors
          if (error.code === 'DUPLICATE_REPORT') {
            Alert.alert('Thông báo', 'Bạn đã báo cáo nội dung này rồi');
          } else if (error.code === 'SELF_REPORT') {
            Alert.alert('Thông báo', 'Bạn không thể báo cáo nội dung của chính mình');
          } else if (error.code === 'INVALID_REPORT_TARGET') {
            Alert.alert('Lỗi', 'Không tìm thấy nội dung cần báo cáo');
          } else {
            Alert.alert('Lỗi', error.message || 'Không thể gửi báo cáo');
          }
        } else {
          Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi báo cáo');
        }
        throw error;
      }
    },
    onSuccess: () => {
      Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi thành công');
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


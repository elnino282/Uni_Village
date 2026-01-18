import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import { getNextPageParam } from '@/shared/types/pagination.types';
import { postsApi } from '../api';
import type { CreatePostFormData, UpdatePostFormData, SharePostRequest, PostSearchParams } from '../types';

const STALE_TIME = {
    POSTS: 2 * 60 * 1000,
};

export function useFeed(params: PostSearchParams = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.posts.feed(params),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await postsApi.getFeed({ ...params, page: pageParam });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        staleTime: STALE_TIME.POSTS,
    });
}

export function useMyPosts(params: PostSearchParams = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.posts.my(params),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await postsApi.getMyPosts({ ...params, page: pageParam });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        staleTime: STALE_TIME.POSTS,
    });
}

export function useSavedPosts(params: PostSearchParams = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.posts.saved(params),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await postsApi.getSavedPosts({ ...params, page: pageParam });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        staleTime: STALE_TIME.POSTS,
    });
}

export function usePostDetail(postId: number | undefined) {
    return useQuery({
        queryKey: queryKeys.posts.detail(postId!),
        queryFn: async () => {
            const response = await postsApi.getPost(postId!);
            return response.result;
        },
        enabled: !!postId,
        staleTime: STALE_TIME.POSTS,
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePostFormData) => postsApi.createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
    });
}

export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: number; data: UpdatePostFormData }) =>
            postsApi.updatePost(postId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: number) => postsApi.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
    });
}

export function useSavePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: number) => postsApi.savePost(postId),
        onSuccess: (_, postId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.saved({}) });
        },
    });
}

export function useSharePost() {
    return useMutation({
        mutationFn: ({ postId, data }: { postId: number; data: SharePostRequest }) =>
            postsApi.sharePost(postId, data),
    });
}

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import { getNextPageParam } from '@/shared/types/pagination.types';
import { commentsApi } from '../api';
import type { CommentRequest, PostSearchParams } from '../types';

const STALE_TIME = {
    COMMENTS: 1 * 60 * 1000,
};

export function usePostComments(postId: number | undefined, params: PostSearchParams = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.posts.comments(postId!, params),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await commentsApi.getPostComments(postId!, { ...params, page: pageParam });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        enabled: !!postId,
        staleTime: STALE_TIME.COMMENTS,
    });
}

export function useCommentReplies(commentId: number | undefined, params: PostSearchParams = {}) {
    return useInfiniteQuery({
        queryKey: ['comments', commentId, 'replies', params],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await commentsApi.getCommentReplies(commentId!, {
                ...params,
                page: pageParam,
            });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        enabled: !!commentId,
        staleTime: STALE_TIME.COMMENTS,
    });
}

export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CommentRequest) => commentsApi.createComment(data),
        onSuccess: (_, variables) => {
            if (variables.postId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.posts.comments(variables.postId, {}),
                });
            }
            if (variables.parentCommentId) {
                queryClient.invalidateQueries({
                    queryKey: ['comments', variables.parentCommentId, 'replies'],
                });
            }
        },
    });
}

export function useUpdateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, data }: { commentId: number; data: CommentRequest }) =>
            commentsApi.updateComment(commentId, data),
        onSuccess: (_, variables) => {
            if (variables.data.postId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.posts.comments(variables.data.postId, {}),
                });
            }
        },
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, postId }: { commentId: number; postId: number }) =>
            commentsApi.deleteComment(commentId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.posts.comments(variables.postId, {}),
            });
        },
    });
}

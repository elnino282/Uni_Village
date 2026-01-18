import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import { reactionsApi } from '../api';

export function useLikePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: number) => reactionsApi.likePost(postId),
        onSuccess: (_, postId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
    });
}

export function useLikeComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, postId }: { commentId: number; postId: number }) =>
            reactionsApi.likeComment(commentId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.posts.comments(variables.postId, {}),
            });
        },
    });
}

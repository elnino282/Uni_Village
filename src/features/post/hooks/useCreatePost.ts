/**
 * useCreatePost Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../api/postApi';
import type { CreatePostRequest } from '../types';

export function useCreatePost() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreatePostRequest) => postApi.createPost(data),
        onSuccess: () => {
            // Invalidate feed to refetch with new post
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });

    return {
        createPost: mutation.mutate,
        createPostAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    };
}

/**
 * useDeleteConversation Hook
 * Handles conversation deletion with proper cache invalidation
 * and navigation. Uses atomic cache cleanup with error handling.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { queryKeys } from '@/config/queryKeys';
import { handleApiError, showSuccessToast } from '@/shared/utils';

import { conversationsApi } from '../api';
import { useChatStore } from '../store';

interface UseDeleteConversationOptions {
    /** Whether to navigate to community tab after deletion. Default: true */
    navigateAfterDelete?: boolean;
}

/**
 * Hook for deleting a conversation
 * Implements atomic cache invalidation with error handling and Zustand store cleanup.
 *
 * @param options - Configuration options
 */
export function useDeleteConversation(options?: UseDeleteConversationOptions) {
    const { navigateAfterDelete = true } = options ?? {};
    const queryClient = useQueryClient();
    const router = useRouter();

    const deleteConversation = useMutation({
        mutationFn: async (conversationId: string) => {
            const response = await conversationsApi.deleteConversation(conversationId);
            return response.result;
        },
        onMutate: async (conversationId) => {
            // Cancel in-flight requests to prevent race conditions
            await queryClient.cancelQueries({
                queryKey: queryKeys.messages.list(conversationId, {}),
            });
            await queryClient.cancelQueries({
                queryKey: queryKeys.conversations.all,
            });
        },
        onSuccess: (_, conversationId) => {
            // Atomic cache cleanup with error boundary
            try {
                // 1. Remove messages cache for this conversation
                queryClient.removeQueries({
                    queryKey: queryKeys.messages.list(conversationId, {}),
                });

                // 2. Remove thread metadata cache
                queryClient.removeQueries({
                    queryKey: ['thread', conversationId],
                });

                // 3. Clear direct conversation caches (for user-X virtual threads)
                queryClient.removeQueries({
                    predicate: (query) => {
                        const key = query.queryKey;
                        return (
                            key[0] === 'directConversation' ||
                            (Array.isArray(key) && key.includes(conversationId))
                        );
                    },
                });

                // 4. Invalidate all conversation lists to refetch
                queryClient.invalidateQueries({
                    queryKey: queryKeys.conversations.all,
                });

                // 5. Clear Zustand store state for this conversation
                useChatStore.getState().clearConversationState(conversationId);
            } catch (cacheError) {
                console.error('[useDeleteConversation] Cache cleanup failed:', cacheError);
                // Force full cache invalidation as fallback
                queryClient.clear();
            }

            showSuccessToast('Đã xóa cuộc hội thoại');

            if (navigateAfterDelete) {
                router.replace('/(tabs)/community');
            }
        },
        onError: (error) => {
            console.error('[useDeleteConversation] Delete failed:', error);
            handleApiError(error, 'Xóa cuộc hội thoại');
        },
    });

    return {
        deleteConversation,
        isDeleting: deleteConversation.isPending,
    };
}

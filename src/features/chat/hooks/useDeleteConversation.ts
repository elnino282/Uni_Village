/**
 * useDeleteConversation Hook
 * Handles conversation deletion with proper cache invalidation
 * and navigation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { queryKeys } from '@/config/queryKeys';
import { handleApiError, showSuccessToast } from '@/shared/utils';

import { conversationsApi } from '../api';

/**
 * Hook for deleting a conversation
 */
export function useDeleteConversation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    const deleteConversation = useMutation({
        mutationFn: async (conversationId: string) => {
            const response = await conversationsApi.deleteConversation(conversationId);
            return response.result;
        },
        onSuccess: (_, conversationId) => {
            queryClient.removeQueries({
                queryKey: queryKeys.messages.list(conversationId, {}),
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });

            showSuccessToast('Đã xóa cuộc hội thoại');

            router.replace('/(tabs)/community');
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
